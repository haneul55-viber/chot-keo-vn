import {
  BusOption,
  FlightOption,
  LodgingOption,
  MealBudgetLevel,
  MealSession,
  ProviderResponse,
  RentalShop,
  RestaurantPlace,
  RideEstimateItem,
} from "@/lib/types";

export interface FlightQuery {
  originId: string;
  destinationId: string;
  startDate: string;
  endDate: string;
}

export interface BusQuery {
  originId: string;
  destinationId: string;
  startDate: string;
  endDate: string;
}

export interface LodgingQuery {
  destinationId: string;
  startDate: string;
  endDate: string;
}

export interface PlacesQuery {
  destinationId: string;
  nearLat?: number;
  nearLng?: number;
  session?: MealSession | "all";
  cuisine?: string;
  priceLevel?: MealBudgetLevel | "all";
  minRating?: number;
}

export interface RentalQuery {
  destinationId: string;
  startDate: string;
}

export interface RideEstimateQuery {
  destinationId: string;
}

export interface FlightProvider {
  readonly name: string;
  searchFlights(query: FlightQuery): Promise<ProviderResponse<FlightOption>>;
}

export interface BusProvider {
  readonly name: string;
  searchBuses(query: BusQuery): Promise<ProviderResponse<BusOption>>;
}

export interface LodgingProvider {
  readonly name: string;
  searchLodging(query: LodgingQuery): Promise<ProviderResponse<LodgingOption>>;
}

export interface PlacesProvider {
  readonly name: string;
  searchRestaurants(
    query: PlacesQuery
  ): Promise<ProviderResponse<RestaurantPlace>>;
}

export interface RentalProvider {
  readonly name: string;
  searchRentals(query: RentalQuery): Promise<ProviderResponse<RentalShop>>;
}

export interface RideEstimateProvider {
  readonly name: string;
  estimateRides(
    query: RideEstimateQuery
  ): Promise<ProviderResponse<RideEstimateItem>>;
}
