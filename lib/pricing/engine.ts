import mealCostConfigJson from "@/data/meal-costs.json";
import { getDestinationById } from "@/data/destinations";
import { addDaysISO, computeTripDuration } from "@/lib/format";
import { analyzeTripHolidays, getAllHolidays } from "@/lib/holidays";
import {
  BikeType,
  BusOption,
  CategoryCostBreakdown,
  DateAlternative,
  FlightOption,
  HolidayPeriod,
  LodgingFilterState,
  LodgingOption,
  MealBudgetLevel,
  MealCostConfig,
  PriceRange,
  RentalShop,
  RideEstimateItem,
  SelectedStay,
  TripDraft,
  TripPricingSummary,
} from "@/lib/types";

const mealConfig = mealCostConfigJson as MealCostConfig;

export const FUEL_PER_BIKE_PER_DAY: PriceRange = {
  min: 35000,
  max: 65000,
};

export interface PricingDataInputs {
  flights: FlightOption[];
  buses: BusOption[];
  lodgings: LodgingOption[];
  rentals: RentalShop[];
  rides: RideEstimateItem[];
  holidays?: HolidayPeriod[];
}

export function filterLodgingOptions(
  lodgings: LodgingOption[],
  filters: LodgingFilterState
): LodgingOption[] {
  return lodgings.filter((item) => {
    if (filters.types.length > 0 && !filters.types.includes(item.type)) {
      return false;
    }
    if (filters.maxPricePerNight > 0 && item.pricePerNight > filters.maxPricePerNight) {
      return false;
    }
    if (filters.minRating > 0 && item.rating < filters.minRating) {
      return false;
    }
    if (filters.area && filters.area !== "all" && item.area !== filters.area) {
      return false;
    }
    if (filters.freeCancellationOnly && !item.freeCancellation) {
      return false;
    }
    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((a) => item.amenities.includes(a))
    ) {
      return false;
    }
    return true;
  });
}

export function calculateIntercityBase(params: {
  mode: "flight" | "bus";
  selectionMode: "range" | "selected";
  flights: FlightOption[];
  buses: BusOption[];
  selectedFlightId: string | null;
  selectedBusId: string | null;
  travelers: number;
}): PriceRange {
  const {
    mode,
    selectionMode,
    flights,
    buses,
    selectedFlightId,
    selectedBusId,
    travelers,
  } = params;

  const pax = Math.max(1, travelers);

  if (mode === "flight") {
    if (flights.length === 0) {
      // Fallback to buses if route has no flights
      if (buses.length === 0) return { min: 0, max: 0 };
      const prices = buses.map((b) => b.baseRoundtripPerPerson);
      return {
        min: Math.min(...prices) * pax,
        max: Math.max(...prices) * pax,
      };
    }

    if (selectionMode === "selected" && selectedFlightId) {
      const chosen = flights.find((f) => f.id === selectedFlightId);
      if (chosen) {
        const total = chosen.baseRoundtripPerPerson * pax;
        return { min: total, max: total };
      }
    }

    const prices = flights.map((f) => f.baseRoundtripPerPerson);
    return {
      min: Math.min(...prices) * pax,
      max: Math.max(...prices) * pax,
    };
  }

  // Sleeper bus mode
  if (buses.length === 0) return { min: 0, max: 0 };

  if (selectionMode === "selected" && selectedBusId) {
    const chosen = buses.find((b) => b.id === selectedBusId);
    if (chosen) {
      const total = chosen.baseRoundtripPerPerson * pax;
      return { min: total, max: total };
    }
  }

  const prices = buses.map((b) => b.baseRoundtripPerPerson);
  return {
    min: Math.min(...prices) * pax,
    max: Math.max(...prices) * pax,
  };
}

export function calculateLodgingBase(params: {
  lodgings: LodgingOption[];
  filters: LodgingFilterState;
  selectionMode: "range" | "selected";
  selectedStays: SelectedStay[];
  nights: number;
  rooms: number;
}): PriceRange {
  const { lodgings, filters, selectionMode, selectedStays, nights, rooms } = params;
  const validNights = Math.max(1, nights);
  const validRooms = Math.max(1, rooms);

  if (lodgings.length === 0) {
    return { min: 0, max: 0 };
  }

  if (selectionMode === "selected" && selectedStays.length > 0) {
    const resolvedStays = selectedStays
      .map((s) => ({
        option: lodgings.find((l) => l.id === s.lodgingId),
        nights: Math.max(1, s.nights),
      }))
      .filter(
        (entry): entry is { option: LodgingOption; nights: number } =>
          Boolean(entry.option)
      );

    if (resolvedStays.length > 0) {
      let remainingNights = validNights;
      let perRoomTotal = 0;

      for (let i = 0; i < resolvedStays.length; i++) {
        const entry = resolvedStays[i];
        const isLast = i === resolvedStays.length - 1;
        const allocated = isLast
          ? remainingNights
          : Math.min(entry.nights, remainingNights);
        if (allocated > 0) {
          perRoomTotal += entry.option.pricePerNight * allocated;
          remainingNights -= allocated;
        }
      }

      const exactTotal = perRoomTotal * validRooms;
      return { min: exactTotal, max: exactTotal };
    }
  }

  const filtered = filterLodgingOptions(lodgings, filters);
  const pool = filtered.length > 0 ? filtered : lodgings;
  const nightlyPrices = pool.map((l) => l.pricePerNight);

  return {
    min: Math.min(...nightlyPrices) * validNights * validRooms,
    max: Math.max(...nightlyPrices) * validNights * validRooms,
  };
}

export function getMealUnitRange(
  level: MealBudgetLevel,
  destinationId: string
): PriceRange {
  const baseRange = mealConfig.levels[level].perMealRange;
  const cityFactor =
    mealConfig.cityAdjustments[destinationId] ??
    getDestinationById(destinationId)?.mealCostFactor ??
    1.0;

  return {
    min: Math.round((baseRange.min * cityFactor) / 1000) * 1000,
    max: Math.round((baseRange.max * cityFactor) / 1000) * 1000,
  };
}

export function calculateFoodBase(params: {
  days: number;
  travelers: number;
  mealsPerDay: number;
  budgetLevel: MealBudgetLevel;
  destinationId: string;
}): PriceRange {
  const { days, travelers, mealsPerDay, budgetLevel, destinationId } = params;
  const validDays = Math.max(1, days);
  const validTravelers = Math.max(1, travelers);
  const validMeals = Math.max(0, mealsPerDay);
  const unitRange = getMealUnitRange(budgetLevel, destinationId);

  const totalMealServings = validMeals * validDays * validTravelers;
  return {
    min: unitRange.min * totalMealServings,
    max: unitRange.max * totalMealServings,
  };
}

export function calculateRideHailingBase(params: {
  days: number;
  travelers: number;
  ridesPerDay: number;
  rides: RideEstimateItem[];
  destinationId: string;
}): PriceRange {
  const { days, travelers, ridesPerDay, rides, destinationId } = params;
  const validDays = Math.max(1, days);
  const validRides = Math.max(0, ridesPerDay);
  const pax = Math.max(1, travelers);

  const dest = getDestinationById(destinationId);
  const car4Items = rides.filter((r) => r.vehicleType === "Taxi 4 chỗ");
  const car7Items = rides.filter((r) => r.vehicleType === "Taxi 7 chỗ");
  const bikeItems = rides.filter((r) => r.vehicleType === "Xe máy công nghệ");

  let perTripMin = dest?.rideBase4Seat.min ?? 45000;
  let perTripMax = dest?.rideBase4Seat.max ?? 95000;

  if (pax === 1 && bikeItems.length > 0) {
    perTripMin = Math.min(...bikeItems.map((b) => b.costPerTrip.min));
    perTripMax =
      car4Items.length > 0
        ? Math.max(...car4Items.map((c) => c.costPerTrip.max))
        : dest?.rideBase4Seat.max ?? 90000;
  } else if (pax <= 4) {
    if (car4Items.length > 0) {
      perTripMin = Math.min(...car4Items.map((c) => c.costPerTrip.min));
      perTripMax = Math.max(...car4Items.map((c) => c.costPerTrip.max));
    }
  } else if (pax <= 6) {
    // Group of 5-6 needs a 7-seat car (or 2 smaller cars)
    if (car7Items.length > 0) {
      perTripMin = Math.min(...car7Items.map((c) => c.costPerTrip.min));
      perTripMax = Math.max(...car7Items.map((c) => c.costPerTrip.max));
    } else {
      perTripMin = Math.round((dest?.rideBase7Seat.min ?? 65000));
      perTripMax = Math.round((dest?.rideBase7Seat.max ?? 145000));
    }
  } else {
    // Larger groups require multiple vehicles
    const vehiclesNeeded = Math.ceil(pax / 4);
    if (car4Items.length > 0) {
      perTripMin =
        Math.min(...car4Items.map((c) => c.costPerTrip.min)) * vehiclesNeeded;
      perTripMax =
        Math.max(...car4Items.map((c) => c.costPerTrip.max)) * vehiclesNeeded;
    } else {
      perTripMin *= vehiclesNeeded;
      perTripMax *= vehiclesNeeded;
    }
  }

  const totalTrips = validRides * validDays;
  return {
    min: perTripMin * totalTrips,
    max: perTripMax * totalTrips,
  };
}

export function calculateMotorbikeRentalBase(params: {
  days: number;
  travelers: number;
  bikeType: BikeType;
  bikeCount: number | null;
  rentals: RentalShop[];
  selectedRentalId: string | null;
}): PriceRange {
  const { days, travelers, bikeType, bikeCount, rentals, selectedRentalId } =
    params;
  const validDays = Math.max(1, days);
  const bikes = Math.max(
    1,
    bikeCount ?? Math.ceil(Math.max(1, travelers) / 2)
  );

  let dailyBikeMin = 130000;
  let dailyBikeMax = 180000;

  if (rentals.length > 0) {
    if (selectedRentalId) {
      const chosen = rentals.find((r) => r.id === selectedRentalId);
      if (chosen) {
        dailyBikeMin = chosen.pricesPerDay[bikeType];
        dailyBikeMax = chosen.pricesPerDay[bikeType];
      } else {
        const rates = rentals.map((r) => r.pricesPerDay[bikeType]);
        dailyBikeMin = Math.min(...rates);
        dailyBikeMax = Math.max(...rates);
      }
    } else {
      const rates = rentals.map((r) => r.pricesPerDay[bikeType]);
      dailyBikeMin = Math.min(...rates);
      dailyBikeMax = Math.max(...rates);
    }
  }

  return {
    min: (dailyBikeMin + FUEL_PER_BIKE_PER_DAY.min) * bikes * validDays,
    max: (dailyBikeMax + FUEL_PER_BIKE_PER_DAY.max) * bikes * validDays,
  };
}

function applyMultiplier(
  base: PriceRange,
  multiplier: PriceRange
): { effective: PriceRange; delta: PriceRange } {
  const effMin = Math.round(base.min * multiplier.min);
  const effMax = Math.round(base.max * multiplier.max);
  return {
    effective: { min: effMin, max: effMax },
    delta: {
      min: Math.max(0, effMin - base.min),
      max: Math.max(0, effMax - base.max),
    },
  };
}

/**
 * Pure master calculation function for the entire 7-step trip budget.
 * Guarantees:
 *   total.min === sum of all 6 category mins
 *   total.max === sum of all 6 category maxes
 */
export function calculateTripPricing(
  draft: TripDraft,
  data: PricingDataInputs
): TripPricingSummary {
  const { nights, days } = computeTripDuration(draft.startDate, draft.endDate);
  const totalTravelers = Math.max(1, draft.adults + draft.children);

  const holidayAnalysis = analyzeTripHolidays(
    draft.startDate,
    draft.endDate,
    data.holidays ?? getAllHolidays()
  );

  const intercityBase = calculateIntercityBase({
    mode: draft.intercityMode,
    selectionMode: draft.intercitySelectionMode,
    flights: data.flights,
    buses: data.buses,
    selectedFlightId: draft.selectedFlightId,
    selectedBusId: draft.selectedBusId,
    travelers: totalTravelers,
  });

  const lodgingBase = calculateLodgingBase({
    lodgings: data.lodgings,
    filters: draft.lodgingFilters,
    selectionMode: draft.lodgingSelectionMode,
    selectedStays: draft.selectedStays,
    nights,
    rooms: draft.rooms,
  });

  const foodBase = calculateFoodBase({
    days,
    travelers: totalTravelers,
    mealsPerDay: draft.mealsPerDay,
    budgetLevel: draft.mealBudgetLevel,
    destinationId: draft.destinationId,
  });

  const localTransportBase =
    draft.localTransportMode === "ride_hailing"
      ? calculateRideHailingBase({
          days,
          travelers: totalTravelers,
          ridesPerDay: draft.ridesPerDay,
          rides: data.rides,
          destinationId: draft.destinationId,
        })
      : calculateMotorbikeRentalBase({
          days,
          travelers: totalTravelers,
          bikeType: draft.bikeType,
          bikeCount: draft.bikeCount,
          rentals: data.rentals,
          selectedRentalId: draft.selectedRentalId,
        });

  const intercityWithHoliday = applyMultiplier(
    intercityBase,
    holidayAnalysis.effectiveMultipliers.transport
  );
  const lodgingWithHoliday = applyMultiplier(
    lodgingBase,
    holidayAnalysis.effectiveMultipliers.lodging
  );
  const foodWithHoliday = applyMultiplier(
    foodBase,
    holidayAnalysis.effectiveMultipliers.localServices
  );
  const localWithHoliday = applyMultiplier(
    localTransportBase,
    holidayAnalysis.effectiveMultipliers.localServices
  );

  const holidaySurcharge: PriceRange = {
    min:
      intercityWithHoliday.delta.min +
      lodgingWithHoliday.delta.min +
      foodWithHoliday.delta.min +
      localWithHoliday.delta.min,
    max:
      intercityWithHoliday.delta.max +
      lodgingWithHoliday.delta.max +
      foodWithHoliday.delta.max +
      localWithHoliday.delta.max,
  };

  const subtotalBeforeContingency: PriceRange = {
    min:
      intercityBase.min +
      lodgingBase.min +
      foodBase.min +
      localTransportBase.min +
      holidaySurcharge.min,
    max:
      intercityBase.max +
      lodgingBase.max +
      foodBase.max +
      localTransportBase.max +
      holidaySurcharge.max,
  };

  const contingency: PriceRange = draft.includeContingency
    ? {
        min: Math.round(subtotalBeforeContingency.min * 0.1),
        max: Math.round(subtotalBeforeContingency.max * 0.1),
      }
    : { min: 0, max: 0 };

  const categories: CategoryCostBreakdown = {
    intercity: intercityBase,
    lodging: lodgingBase,
    food: foodBase,
    localTransport: localTransportBase,
    holidaySurcharge,
    contingency,
  };

  const total: PriceRange = {
    min:
      categories.intercity.min +
      categories.lodging.min +
      categories.food.min +
      categories.localTransport.min +
      categories.holidaySurcharge.min +
      categories.contingency.min,
    max:
      categories.intercity.max +
      categories.lodging.max +
      categories.food.max +
      categories.localTransport.max +
      categories.holidaySurcharge.max +
      categories.contingency.max,
  };

  return {
    days,
    nights,
    totalTravelers,
    effectiveTravelerUnitsForTransport: totalTravelers,
    effectiveTravelerUnitsForFood: totalTravelers,
    categories,
    effectiveByStep: {
      intercity: intercityWithHoliday.effective,
      lodging: lodgingWithHoliday.effective,
      food: foodWithHoliday.effective,
      localTransport: localWithHoliday.effective,
    },
    subtotalBeforeContingency,
    total,
    perPerson: {
      min: Math.round(total.min / totalTravelers),
      max: Math.round(total.max / totalTravelers),
    },
    perDay: {
      min: Math.round(total.min / days),
      max: Math.round(total.max / days),
    },
    holidayAnalysis,
  };
}

/**
 * Generates ±3 days alternative trip schedules and calculates exact estimated savings.
 */
export function suggestNearbyDateAlternatives(
  draft: TripDraft,
  data: PricingDataInputs
): DateAlternative[] {
  const currentSummary = calculateTripPricing(draft, data);
  const currentMid = (currentSummary.total.min + currentSummary.total.max) / 2;

  const offsets = [-3, -2, -1, 1, 2, 3];
  return offsets.map((offsetDays) => {
    const altStart = addDaysISO(draft.startDate, offsetDays);
    const altEnd = addDaysISO(draft.endDate, offsetDays);
    const altSummary = calculateTripPricing(
      {
        ...draft,
        startDate: altStart,
        endDate: altEnd,
      },
      data
    );
    const altMid = (altSummary.total.min + altSummary.total.max) / 2;
    const rawSavings = Math.round(currentMid - altMid);
    const savingsPercent =
      currentMid > 0 ? Math.round(((currentMid - altMid) / currentMid) * 100) : 0;

    return {
      offsetDays,
      startDate: altStart,
      endDate: altEnd,
      overlappingHolidayNames: altSummary.holidayAnalysis.overlappingHolidays.map(
        (h) => h.holiday.name
      ),
      estimatedTotal: altSummary.total,
      savingsAmount: rawSavings,
      savingsPercent,
    };
  });
}
