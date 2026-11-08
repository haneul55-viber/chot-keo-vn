import { describe, expect, it } from "vitest";
import {
  calculateTripPricing,
  FUEL_PER_BIKE_PER_DAY,
  PricingDataInputs,
  suggestNearbyDateAlternatives,
} from "../engine";
import { TripDraft } from "@/lib/types";

const sampleData: PricingDataInputs = {
  flights: [
    {
      id: "fl-1",
      airline: "Vietjet Air",
      airlineCode: "VJ",
      outboundFlightNo: "VJ362",
      inboundFlightNo: "VJ365",
      outboundDepart: "06:30",
      outboundArrive: "07:35",
      inboundDepart: "19:15",
      inboundArrive: "20:20",
      durationMinutes: 65,
      cabinClass: "Eco",
      baggageIncluded: "7kg xách tay",
      baseRoundtripPerPerson: 1800000,
      bookingUrl: "https://www.vietjetair.com",
    },
    {
      id: "fl-2",
      airline: "Vietnam Airlines",
      airlineCode: "VN",
      outboundFlightNo: "VN1382",
      inboundFlightNo: "VN1385",
      outboundDepart: "09:00",
      outboundArrive: "10:00",
      inboundDepart: "17:00",
      inboundArrive: "18:00",
      durationMinutes: 60,
      cabinClass: "Phổ thông tiêu chuẩn",
      baggageIncluded: "10kg xách tay + 23kg ký gửi",
      baseRoundtripPerPerson: 3100000,
      bookingUrl: "https://www.vietnamairlines.com",
    },
  ],
  buses: [
    {
      id: "bus-1",
      operator: "Phương Trang (FUTA)",
      outboundDepart: "22:30",
      inboundDepart: "22:00",
      durationHours: 6.5,
      seatType: "Giường nằm tiêu chuẩn (34 chỗ)",
      baseRoundtripPerPerson: 580000,
      pickupPoint: "Bến xe Miền Đông",
      dropoffPoint: "Bến xe Liên tỉnh Đà Lạt",
      bookingUrl: "https://futabus.vn",
    },
    {
      id: "bus-2",
      operator: "Thành Bưởi Limousine",
      outboundDepart: "23:00",
      inboundDepart: "22:30",
      durationHours: 6,
      seatType: "Limousine phòng đơn VIP (22 phòng)",
      baseRoundtripPerPerson: 900000,
      pickupPoint: "Quận 5, TP.HCM",
      dropoffPoint: "Trung tâm Đà Lạt",
      bookingUrl: "https://vexere.com",
    },
  ],
  lodgings: [
    {
      id: "lod-1",
      name: "The Kupid Dalat Homestay",
      type: "homestay",
      area: "Phường 1 (Chợ Đà Lạt)",
      rating: 4.5,
      reviewCount: 412,
      pricePerNight: 550000,
      platform: "Booking.com",
      deepLink: "https://www.booking.com",
      imageGradient: "from-emerald-600 to-teal-900",
      imageLabel: "Homestay đồi thông",
      amenities: ["Wifi miễn phí", "View đồi thông"],
      freeCancellation: true,
      breakfastIncluded: false,
      lat: 11.945,
      lng: 108.455,
    },
    {
      id: "lod-2",
      name: "Ana Mandara Villas Dalat Resort & Spa",
      type: "resort",
      area: "Trần Phú - Nhà thờ Con Gà",
      rating: 4.8,
      reviewCount: 1290,
      pricePerNight: 2400000,
      platform: "Agoda",
      deepLink: "https://www.agoda.com",
      imageGradient: "from-amber-600 to-stone-900",
      imageLabel: "Biệt thự Pháp cổ",
      amenities: ["Hồ bơi nước ấm", "Bữa sáng miễn phí", "Spa", "Wifi miễn phí"],
      freeCancellation: true,
      breakfastIncluded: true,
      lat: 11.938,
      lng: 108.431,
    },
  ],
  rentals: [
    {
      id: "rent-1",
      name: "Thuê Xe Máy Mr. Định Đà Lạt",
      address: "11 Lý Tự Trọng, P.2, Đà Lạt",
      area: "Phường 1 (Chợ Đà Lạt)",
      rating: 4.9,
      reviewCount: 380,
      phone: "0909 123 456",
      pricesPerDay: {
        semi_auto: 110000,
        scooter: 140000,
        manual: 180000,
      },
      depositRequirement: "CCCD gốc, không cần cọc tiền mặt",
      hotelDelivery: true,
      helmetsIncluded: true,
      lat: 11.944,
      lng: 108.439,
      googleMapsUrl: "https://maps.google.com",
    },
    {
      id: "rent-2",
      name: "Happy Day Motorbike Rental",
      address: "127 Phan Bội Châu, P.1, Đà Lạt",
      area: "Phường 1 (Chợ Đà Lạt)",
      rating: 4.7,
      reviewCount: 245,
      phone: "0918 654 321",
      pricesPerDay: {
        semi_auto: 130000,
        scooter: 170000,
        manual: 220000,
      },
      depositRequirement: "CCCD + 500.000 ₫",
      hotelDelivery: true,
      helmetsIncluded: true,
      lat: 11.941,
      lng: 108.436,
      googleMapsUrl: "https://maps.google.com",
    },
  ],
  rides: [
    {
      id: "ride-1",
      brand: "Xanh SM",
      vehicleType: "Taxi 4 chỗ",
      avgDistanceKm: 4.5,
      costPerTrip: { min: 45000, max: 90000 },
      waitTimeMinutes: 4,
    },
    {
      id: "ride-2",
      brand: "Grab",
      vehicleType: "Taxi 7 chỗ",
      avgDistanceKm: 4.5,
      costPerTrip: { min: 65000, max: 135000 },
      waitTimeMinutes: 5,
    },
    {
      id: "ride-3",
      brand: "Be",
      vehicleType: "Xe máy công nghệ",
      avgDistanceKm: 4.5,
      costPerTrip: { min: 22000, max: 45000 },
      waitTimeMinutes: 3,
    },
  ],
};

function createBaseDraft(overrides: Partial<TripDraft> = {}): TripDraft {
  return {
    originId: "tp-hcm",
    destinationId: "da-lat",
    startDate: "2026-11-10", // Normal non-holiday weekday in Nov 2026
    endDate: "2026-11-13", // 3 nights, 4 days
    adults: 2,
    children: 0,
    rooms: 1,
    intercityMode: "flight",
    intercitySelectionMode: "range",
    selectedFlightId: null,
    selectedBusId: null,
    lodgingFilters: {
      types: [],
      maxPricePerNight: 0,
      minRating: 0,
      area: "all",
      amenities: [],
      freeCancellationOnly: false,
    },
    lodgingSelectionMode: "range",
    selectedStays: [],
    mealsPerDay: 3,
    mealBudgetLevel: "trung_binh",
    localTransportMode: "ride_hailing",
    ridesPerDay: 4,
    bikeType: "scooter",
    bikeCount: null,
    selectedRentalId: null,
    includeContingency: false,
    ...overrides,
  };
}

function sumCategoryRange(summary: ReturnType<typeof calculateTripPricing>) {
  const c = summary.categories;
  return {
    min:
      c.intercity.min +
      c.lodging.min +
      c.food.min +
      c.localTransport.min +
      c.holidaySurcharge.min +
      c.contingency.min,
    max:
      c.intercity.max +
      c.lodging.max +
      c.food.max +
      c.localTransport.max +
      c.holidaySurcharge.max +
      c.contingency.max,
  };
}

describe("ChotKeo.vn Pricing Engine", () => {
  it("1. calculates a trip with NO holidays accurately and sums categories cleanly", () => {
    const draft = createBaseDraft({
      startDate: "2026-11-10",
      endDate: "2026-11-13", // 3 nights, 4 days
      adults: 2,
      rooms: 1,
      includeContingency: false,
    });

    const result = calculateTripPricing(draft, sampleData);

    expect(result.nights).toBe(3);
    expect(result.days).toBe(4);
    expect(result.totalTravelers).toBe(2);
    expect(result.holidayAnalysis.hasOverlap).toBe(false);
    expect(result.categories.holidaySurcharge).toEqual({ min: 0, max: 0 });
    expect(result.categories.contingency).toEqual({ min: 0, max: 0 });

    // Intercity: 2 travelers * [1.8M, 3.1M] = [3.6M, 6.2M]
    expect(result.categories.intercity).toEqual({ min: 3600000, max: 6200000 });
    // Lodging: 3 nights * 1 room * [550k, 2.4M] = [1.65M, 7.2M]
    expect(result.categories.lodging).toEqual({ min: 1650000, max: 7200000 });
    // Food (trung_binh in da-lat = [110k, 220k]): 3 meals * 4 days * 2 pax = 24 meals => [2.64M, 5.28M]
    expect(result.categories.food).toEqual({ min: 2640000, max: 5280000 });
    // Local ride-hailing (2 pax => 4-seat car [45k, 90k]): 4 rides * 4 days = 16 rides => [720k, 1.44M]
    expect(result.categories.localTransport).toEqual({
      min: 720000,
      max: 1440000,
    });

    const summed = sumCategoryRange(result);
    expect(result.total).toEqual(summed);
    expect(result.total).toEqual({ min: 8610000, max: 20120000 });
    expect(result.perPerson).toEqual({ min: 4305000, max: 10060000 });
    expect(result.perDay).toEqual({ min: 2152500, max: 5030000 });
  });

  it("2. applies Tết Nguyên Đán holiday multipliers and suggests cheaper nearby dates", () => {
    // Tết Đinh Mùi 2027 in holidays.json: 2027-02-03 to 2027-02-11
    const normalDraft = createBaseDraft({
      startDate: "2027-03-10",
      endDate: "2027-03-13",
    });
    const tetDraft = createBaseDraft({
      startDate: "2027-02-09", // Overlaps tail of Tết (09, 10, 11 Feb)
      endDate: "2027-02-12",
      includeContingency: true, // Also test 10% contingency buffer!
    });

    const normalSummary = calculateTripPricing(normalDraft, sampleData);
    const tetSummary = calculateTripPricing(tetDraft, sampleData);

    expect(tetSummary.holidayAnalysis.hasOverlap).toBe(true);
    expect(
      tetSummary.holidayAnalysis.overlappingHolidays.some((h) =>
        h.holiday.id.includes("tet-nguyen-dan-2027")
      )
    ).toBe(true);
    expect(tetSummary.categories.holidaySurcharge.min).toBeGreaterThan(0);
    expect(tetSummary.categories.holidaySurcharge.max).toBeGreaterThan(
      tetSummary.categories.holidaySurcharge.min
    );

    // Total must strictly equal sum of all category mins & maxes (including holidaySurcharge + contingency)
    expect(tetSummary.total).toEqual(sumCategoryRange(tetSummary));
    expect(tetSummary.total.min).toBeGreaterThan(normalSummary.total.min);
    expect(tetSummary.total.max).toBeGreaterThan(normalSummary.total.max);

    // Shifting +3 days (2027-02-12 -> 2027-02-15) exits Tết window and yields positive savings!
    const alternatives = suggestNearbyDateAlternatives(tetDraft, sampleData);
    expect(alternatives).toHaveLength(6);
    const plus3 = alternatives.find((a) => a.offsetDays === 3);
    expect(plus3).toBeDefined();
    expect(plus3!.savingsAmount).toBeGreaterThan(0);
    expect(plus3!.savingsPercent).toBeGreaterThan(10);
  });

  it("3. handles a 1-night trip (1 night, 2 days) with motorbike rental", () => {
    const oneNightDraft = createBaseDraft({
      startDate: "2026-11-11",
      endDate: "2026-11-12", // 1 night, 2 days
      adults: 2,
      rooms: 1,
      intercityMode: "bus",
      localTransportMode: "motorbike",
      bikeType: "scooter",
      bikeCount: null, // ceil(2 / 2) = 1 bike
    });

    const result = calculateTripPricing(oneNightDraft, sampleData);

    expect(result.nights).toBe(1);
    expect(result.days).toBe(2);
    expect(result.totalTravelers).toBe(2);

    // Bus: 2 pax * [580k, 900k] = [1.16M, 1.8M]
    expect(result.categories.intercity).toEqual({ min: 1160000, max: 1800000 });
    // Lodging: 1 night * 1 room * [550k, 2.4M]
    expect(result.categories.lodging).toEqual({ min: 550000, max: 2400000 });
    // Motorbike: 1 scooter * 2 days * ([140k, 170k] + fuel [35k, 65k]) = 2 * [175k, 235k] = [350k, 470k]
    expect(result.categories.localTransport).toEqual({
      min: (140000 + FUEL_PER_BIKE_PER_DAY.min) * 1 * 2,
      max: (170000 + FUEL_PER_BIKE_PER_DAY.max) * 1 * 2,
    });

    expect(result.total).toEqual(sumCategoryRange(result));
  });

  it("4. scales accurately for a group of 5 travelers (ceil(5/2)=3 bikes, 7-seat ride-hailing, multi-room)", () => {
    const groupRideDraft = createBaseDraft({
      startDate: "2026-11-10",
      endDate: "2026-11-13", // 3 nights, 4 days
      adults: 4,
      children: 1, // Total = 5 travelers
      rooms: 2,
      localTransportMode: "ride_hailing",
      ridesPerDay: 4,
    });

    const rideResult = calculateTripPricing(groupRideDraft, sampleData);
    expect(rideResult.totalTravelers).toBe(5);
    // Group of 5 uses 7-seat taxi fares [65k, 135k] * 4 rides/day * 4 days = [1.04M, 2.16M]
    expect(rideResult.categories.localTransport).toEqual({
      min: 65000 * 16,
      max: 135000 * 16,
    });
    // 2 rooms * 3 nights * [550k, 2.4M] = [3.3M, 14.4M]
    expect(rideResult.categories.lodging).toEqual({
      min: 3300000,
      max: 14400000,
    });
    // Intercity: 5 travelers * [1.8M, 3.1M] = [9.0M, 15.5M]
    expect(rideResult.categories.intercity).toEqual({
      min: 9000000,
      max: 15500000,
    });
    expect(rideResult.total).toEqual(sumCategoryRange(rideResult));

    // Switch same group of 5 to motorbike mode -> auto ceil(5 / 2) = 3 bikes!
    const groupBikeDraft: TripDraft = {
      ...groupRideDraft,
      localTransportMode: "motorbike",
      bikeType: "semi_auto",
      bikeCount: null,
    };
    const bikeResult = calculateTripPricing(groupBikeDraft, sampleData);
    // 3 semi_auto bikes * 4 days * ([110k, 130k] + [35k, 65k]) = 12 * [145k, 195k]
    expect(bikeResult.categories.localTransport).toEqual({
      min: (110000 + 35000) * 3 * 4,
      max: (130000 + 65000) * 3 * 4,
    });
    expect(bikeResult.total).toEqual(sumCategoryRange(bikeResult));
  });

  it("5. supports splitting nights across multiple accommodations", () => {
    const splitStayDraft = createBaseDraft({
      startDate: "2026-11-10",
      endDate: "2026-11-13", // 3 nights
      rooms: 2,
      lodgingSelectionMode: "selected",
      selectedStays: [
        { lodgingId: "lod-1", nights: 2 }, // 2 nights * 550k = 1.1M/room
        { lodgingId: "lod-2", nights: 1 }, // 1 night * 2.4M = 2.4M/room -> 3.5M/room * 2 rooms = 7.0M
      ],
    });

    const result = calculateTripPricing(splitStayDraft, sampleData);
    expect(result.categories.lodging).toEqual({ min: 7000000, max: 7000000 });
    expect(result.total).toEqual(sumCategoryRange(result));
  });
});
