export interface PriceRange {
  min: number;
  max: number;
}

export type HolidayType = "public_holiday" | "school_break" | "peak_season";

export interface HolidayMultipliers {
  transport: PriceRange;
  lodging: PriceRange;
  localServices: PriceRange;
}

export interface HolidayPeriod {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD (solar)
  endDate: string; // YYYY-MM-DD (solar)
  type: HolidayType;
  description: string;
  priceMultiplier: HolidayMultipliers;
}

export interface HolidayOverlapDetail {
  holiday: HolidayPeriod;
  overlapDates: string[];
  overlapDays: number;
}

export interface HolidayAnalysis {
  hasOverlap: boolean;
  overlappingHolidays: HolidayOverlapDetail[];
  effectiveMultipliers: HolidayMultipliers;
  averageSurgePercent: PriceRange;
  tip: string | null;
}

export interface DateAlternative {
  offsetDays: number;
  startDate: string;
  endDate: string;
  overlappingHolidayNames: string[];
  estimatedTotal: PriceRange;
  savingsAmount: number;
  savingsPercent: number;
}

export interface Destination {
  id: string;
  name: string;
  province: string;
  region: "Miền Bắc" | "Miền Trung" | "Tây Nguyên" | "Miền Nam";
  tagline: string;
  airportCode: string | null;
  nearestAirportNote?: string;
  lat: number;
  lng: number;
  popularAreas: string[];
  canBeOrigin: boolean;
  canBeDestination: boolean;
  mealCostFactor: number;
  rideBase4Seat: PriceRange;
  rideBase7Seat: PriceRange;
  rideBaseBike: PriceRange;
}

export interface ProviderResponse<T> {
  min: number;
  max: number;
  items: T[];
  source: string;
  fetchedAt: string;
  cached?: boolean;
}

// Step 3: Intercity Transport
export type IntercityMode = "flight" | "bus";
export type SelectionMode = "range" | "selected";

export interface FlightOption {
  id: string;
  airline: string;
  airlineCode: "VN" | "VJ" | "QH" | "VU";
  outboundFlightNo: string;
  inboundFlightNo: string;
  outboundDepart: string;
  outboundArrive: string;
  inboundDepart: string;
  inboundArrive: string;
  durationMinutes: number;
  cabinClass: string;
  baggageIncluded: string;
  baseRoundtripPerPerson: number;
  bookingUrl: string;
}

export interface BusOption {
  id: string;
  operator: string;
  outboundDepart: string;
  inboundDepart: string;
  durationHours: number;
  seatType: string;
  baseRoundtripPerPerson: number;
  pickupPoint: string;
  dropoffPoint: string;
  bookingUrl: string;
  note?: string;
}

// Step 4: Accommodation
export type LodgingType = "hotel" | "homestay" | "resort" | "hostel";
export type LodgingPlatform = "Agoda" | "Booking.com" | "Traveloka" | "Trivago";

export interface LodgingOption {
  id: string;
  name: string;
  type: LodgingType;
  area: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number; // Base price per room per night (before holiday multiplier)
  platform: LodgingPlatform;
  deepLink: string;
  imageGradient: string;
  imageLabel: string;
  amenities: string[];
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  lat: number;
  lng: number;
}

export interface LodgingFilterState {
  types: LodgingType[];
  maxPricePerNight: number;
  minRating: number;
  area: string;
  amenities: string[];
  freeCancellationOnly: boolean;
}

export interface SelectedStay {
  lodgingId: string;
  nights: number;
}

// Step 5: Food & Places
export type MealBudgetLevel = "binh_dan" | "trung_binh" | "cao_cap";
export type MealSession = "breakfast" | "lunch" | "dinner";

export interface MealCostConfig {
  levels: Record<
    MealBudgetLevel,
    {
      label: string;
      description: string;
      perMealRange: PriceRange;
    }
  >;
  cityAdjustments: Record<string, number>;
  childMealFactor: number; // e.g., 0.65 for children
}

export interface RestaurantPlace {
  id: string;
  name: string;
  specialty: string;
  cuisine: string;
  mealSessions: MealSession[];
  priceLevel: MealBudgetLevel;
  estimatedPerPerson: PriceRange;
  rating: number;
  reviewCount: number;
  bayesianScore: number;
  distanceKm: number;
  address: string;
  area: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
}

// Step 6: Local Transportation
export type LocalTransportMode = "ride_hailing" | "motorbike";
export type BikeType = "scooter" | "semi_auto" | "manual";

export interface RentalShop {
  id: string;
  name: string;
  address: string;
  area: string;
  rating: number;
  reviewCount: number;
  phone: string;
  pricesPerDay: Record<BikeType, number>;
  depositRequirement: string;
  hotelDelivery: boolean;
  helmetsIncluded: boolean;
  lat: number;
  lng: number;
  googleMapsUrl: string;
}

export interface RideEstimateItem {
  id: string;
  brand: "Xanh SM" | "Grab" | "Be";
  vehicleType: "Taxi 4 chỗ" | "Taxi 7 chỗ" | "Xe máy công nghệ";
  avgDistanceKm: number;
  costPerTrip: PriceRange;
  waitTimeMinutes: number;
}

// Trip Draft State
export interface TripDraft {
  originId: string;
  destinationId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  rooms: number;

  // Step 3
  intercityMode: IntercityMode;
  intercitySelectionMode: SelectionMode;
  selectedFlightId: string | null;
  selectedBusId: string | null;

  // Step 4
  lodgingFilters: LodgingFilterState;
  lodgingSelectionMode: SelectionMode;
  selectedStays: SelectedStay[];

  // Step 5
  mealsPerDay: number;
  mealBudgetLevel: MealBudgetLevel;

  // Step 6
  localTransportMode: LocalTransportMode;
  ridesPerDay: number;
  bikeType: BikeType;
  bikeCount: number | null; // null = auto ceil(travelers / 2)
  selectedRentalId: string | null;

  // Step 7
  includeContingency: boolean;
}

export interface SavedTripRecord {
  id: string;
  name: string;
  savedAt: string;
  draft: TripDraft;
  totalRange: PriceRange;
}

// Pricing Engine Output
export interface CategoryCostBreakdown {
  intercity: PriceRange;
  lodging: PriceRange;
  food: PriceRange;
  localTransport: PriceRange;
  holidaySurcharge: PriceRange;
  contingency: PriceRange;
}

export interface EffectiveStepCosts {
  intercity: PriceRange;
  lodging: PriceRange;
  food: PriceRange;
  localTransport: PriceRange;
}

export interface TripPricingSummary {
  days: number;
  nights: number;
  totalTravelers: number;
  effectiveTravelerUnitsForTransport: number;
  effectiveTravelerUnitsForFood: number;
  categories: CategoryCostBreakdown;
  effectiveByStep: EffectiveStepCosts;
  subtotalBeforeContingency: PriceRange;
  total: PriceRange;
  perPerson: PriceRange;
  perDay: PriceRange;
  holidayAnalysis: HolidayAnalysis;
}

export interface SourceAttribution {
  category: string;
  source: string;
  fetchedAt: string;
  cached?: boolean;
}
