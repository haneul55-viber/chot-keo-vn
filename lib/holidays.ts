import holidaysData from "@/data/holidays.json";
import { addDaysISO, formatDateVN, listDatesInclusive } from "./format";
import {
  HolidayAnalysis,
  HolidayMultipliers,
  HolidayOverlapDetail,
  HolidayPeriod,
  PriceRange,
} from "./types";

const DEFAULT_MULTIPLIERS: HolidayMultipliers = {
  transport: { min: 1, max: 1 },
  lodging: { min: 1, max: 1 },
  localServices: { min: 1, max: 1 },
};

export function getAllHolidays(): HolidayPeriod[] {
  return holidaysData.holidays as HolidayPeriod[];
}

/**
 * Analyzes how a trip [startDate, endDate] overlaps with configured holidays/peak seasons.
 * - Lodging multiplier is weighted across each night of the stay.
 * - Local services multiplier is weighted across each day of the trip.
 * - Intercity transport multiplier takes the maximum active holiday multiplier across
 *   outbound/inbound travel days (or any overlapped holiday in the trip window).
 */
export function analyzeTripHolidays(
  startDate: string,
  endDate: string,
  holidays: HolidayPeriod[] = getAllHolidays()
): HolidayAnalysis {
  const tripDates = listDatesInclusive(startDate, endDate);
  const nightDates = tripDates.length > 1 ? tripDates.slice(0, -1) : tripDates;

  const overlappingHolidays: HolidayOverlapDetail[] = [];

  for (const h of holidays) {
    const overlapDates = tripDates.filter(
      (d) => d >= h.startDate && d <= h.endDate
    );
    if (overlapDates.length > 0) {
      overlappingHolidays.push({
        holiday: h,
        overlapDates,
        overlapDays: overlapDates.length,
      });
    }
  }

  if (overlappingHolidays.length === 0) {
    return {
      hasOverlap: false,
      overlappingHolidays: [],
      effectiveMultipliers: DEFAULT_MULTIPLIERS,
      averageSurgePercent: { min: 0, max: 0 },
      tip: null,
    };
  }

  // Lodging: average multiplier per night (if multiple holidays overlap same night, take max)
  let lodgingMinSum = 0;
  let lodgingMaxSum = 0;
  for (const night of nightDates) {
    let nMin = 1;
    let nMax = 1;
    for (const { holiday } of overlappingHolidays) {
      if (night >= holiday.startDate && night <= holiday.endDate) {
        nMin = Math.max(nMin, holiday.priceMultiplier.lodging.min);
        nMax = Math.max(nMax, holiday.priceMultiplier.lodging.max);
      }
    }
    lodgingMinSum += nMin;
    lodgingMaxSum += nMax;
  }
  const lodgingMultiplier: PriceRange = {
    min: Number((lodgingMinSum / nightDates.length).toFixed(4)),
    max: Number((lodgingMaxSum / nightDates.length).toFixed(4)),
  };

  // Local services: average multiplier per day
  let localMinSum = 0;
  let localMaxSum = 0;
  for (const day of tripDates) {
    let dMin = 1;
    let dMax = 1;
    for (const { holiday } of overlappingHolidays) {
      if (day >= holiday.startDate && day <= holiday.endDate) {
        dMin = Math.max(dMin, holiday.priceMultiplier.localServices.min);
        dMax = Math.max(dMax, holiday.priceMultiplier.localServices.max);
      }
    }
    localMinSum += dMin;
    localMaxSum += dMax;
  }
  const localServicesMultiplier: PriceRange = {
    min: Number((localMinSum / tripDates.length).toFixed(4)),
    max: Number((localMaxSum / tripDates.length).toFixed(4)),
  };

  // Transport (roundtrip): average of outbound leg & inbound leg, boosted if core holiday overlaps
  const outboundDate = tripDates[0];
  const inboundDate = tripDates[tripDates.length - 1];
  const legMultiplier = (legDate: string): PriceRange => {
    let lMin = 1;
    let lMax = 1;
    for (const { holiday } of overlappingHolidays) {
      // Peak travel surge applies on holiday dates and 1 shoulder day around public holidays
      const windowStart =
        holiday.type === "public_holiday"
          ? addDaysISO(holiday.startDate, -1)
          : holiday.startDate;
      const windowEnd =
        holiday.type === "public_holiday"
          ? addDaysISO(holiday.endDate, 1)
          : holiday.endDate;
      if (legDate >= windowStart && legDate <= windowEnd) {
        lMin = Math.max(lMin, holiday.priceMultiplier.transport.min);
        lMax = Math.max(lMax, holiday.priceMultiplier.transport.max);
      }
    }
    return { min: lMin, max: lMax };
  };

  const outMult = legMultiplier(outboundDate);
  const inMult = legMultiplier(inboundDate);
  let transportMin = (outMult.min + inMult.min) / 2;
  let transportMax = (outMult.max + inMult.max) / 2;

  // Even if endpoints fall outside a short mid-trip holiday, keep at least partial surge
  if (transportMin === 1 && overlappingHolidays.length > 0) {
    const peakH = overlappingHolidays.reduce((best, curr) =>
      curr.holiday.priceMultiplier.transport.max >
      best.holiday.priceMultiplier.transport.max
        ? curr
        : best
    );
    const ratio = peakH.overlapDays / tripDates.length;
    transportMin = 1 + (peakH.holiday.priceMultiplier.transport.min - 1) * ratio;
    transportMax = 1 + (peakH.holiday.priceMultiplier.transport.max - 1) * ratio;
  }

  const transportMultiplier: PriceRange = {
    min: Number(transportMin.toFixed(4)),
    max: Number(transportMax.toFixed(4)),
  };

  // Weighted overall surge % estimate (40% transport, 40% lodging, 20% local)
  const weightedMin =
    transportMultiplier.min * 0.4 +
    lodgingMultiplier.min * 0.4 +
    localServicesMultiplier.min * 0.2;
  const weightedMax =
    transportMultiplier.max * 0.4 +
    lodgingMultiplier.max * 0.4 +
    localServicesMultiplier.max * 0.2;

  const averageSurgePercent: PriceRange = {
    min: Math.max(1, Math.round((weightedMin - 1) * 100)),
    max: Math.max(2, Math.round((weightedMax - 1) * 100)),
  };

  // Quick lookahead +/- 3 days to craft an actionable Vietnamese tip
  let bestOffset = 0;
  let bestReduction = 0;
  const currentAvgMult = (weightedMin + weightedMax) / 2;

  for (const offset of [-3, -2, -1, 1, 2, 3]) {
    const altStart = addDaysISO(startDate, offset);
    const altEnd = addDaysISO(endDate, offset);
    const alt = analyzeShiftRawMultiplier(altStart, altEnd, holidays);
    const reduction = (currentAvgMult - alt) / currentAvgMult;
    if (reduction > bestReduction + 0.02) {
      bestReduction = reduction;
      bestOffset = offset;
    }
  }

  let tip: string;
  if (bestOffset !== 0 && bestReduction >= 0.03) {
    const direction = bestOffset > 0 ? "lùi" : "sớm";
    const pct = Math.round(bestReduction * 100);
    const targetStart = formatDateVN(addDaysISO(startDate, bestOffset));
    tip = `Dời ngày đi ${direction} ${Math.abs(bestOffset)} ngày (khởi hành ${targetStart}) có thể tiết kiệm ~${pct}% chi phí.`;
  } else {
    tip = `Lịch trình nằm trọn trong mùa cao điểm kéo dài — đặt vé máy bay & phòng trước 3–4 tuần để giữ mức giá thấp nhất.`;
  }

  return {
    hasOverlap: true,
    overlappingHolidays,
    effectiveMultipliers: {
      transport: transportMultiplier,
      lodging: lodgingMultiplier,
      localServices: localServicesMultiplier,
    },
    averageSurgePercent,
    tip,
  };
}

function analyzeShiftRawMultiplier(
  startDate: string,
  endDate: string,
  holidays: HolidayPeriod[]
): number {
  const tripDates = listDatesInclusive(startDate, endDate);
  let sum = 0;
  for (const d of tripDates) {
    let dayMult = 1;
    for (const h of holidays) {
      if (d >= h.startDate && d <= h.endDate) {
        const avgH =
          ((h.priceMultiplier.transport.min + h.priceMultiplier.transport.max) / 2) *
            0.4 +
          ((h.priceMultiplier.lodging.min + h.priceMultiplier.lodging.max) / 2) *
            0.4 +
          ((h.priceMultiplier.localServices.min +
            h.priceMultiplier.localServices.max) /
            2) *
            0.2;
        dayMult = Math.max(dayMult, avgH);
      }
    }
    sum += dayMult;
  }
  return sum / tripDates.length;
}
