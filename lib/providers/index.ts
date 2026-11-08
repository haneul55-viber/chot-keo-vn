import {
  AmadeusFlightProviderStub,
  MockFlightProvider,
} from "./flight.provider";
import { MockBusProvider, VexereBusProviderStub } from "./bus.provider";
import {
  AffiliateLodgingProviderStub,
  MockLodgingProvider,
} from "./lodging.provider";
import {
  GooglePlacesProviderStub,
  MockPlacesProvider,
} from "./places.provider";
import {
  GooglePlacesRentalProviderStub,
  MockRentalProvider,
} from "./rental.provider";
import {
  MockRideEstimateProvider,
  PartnerRideEstimateProviderStub,
} from "./ride.provider";
import {
  BusProvider,
  FlightProvider,
  LodgingProvider,
  PlacesProvider,
  RentalProvider,
  RideEstimateProvider,
} from "./types";

export * from "./types";

export function getFlightProvider(): FlightProvider {
  if (process.env.FLIGHT_PROVIDER === "amadeus") {
    return new AmadeusFlightProviderStub();
  }
  return new MockFlightProvider();
}

export function getBusProvider(): BusProvider {
  if (process.env.BUS_PROVIDER === "vexere") {
    return new VexereBusProviderStub();
  }
  return new MockBusProvider();
}

export function getLodgingProvider(): LodgingProvider {
  if (process.env.LODGING_PROVIDER === "affiliate") {
    return new AffiliateLodgingProviderStub();
  }
  return new MockLodgingProvider();
}

export function getPlacesProvider(): PlacesProvider {
  if (process.env.PLACES_PROVIDER === "google") {
    return new GooglePlacesProviderStub();
  }
  return new MockPlacesProvider();
}

export function getRentalProvider(): RentalProvider {
  if (process.env.RENTAL_PROVIDER === "google") {
    return new GooglePlacesRentalProviderStub();
  }
  return new MockRentalProvider();
}

export function getRideEstimateProvider(): RideEstimateProvider {
  if (process.env.RIDE_PROVIDER === "partner") {
    return new PartnerRideEstimateProviderStub();
  }
  return new MockRideEstimateProvider();
}
