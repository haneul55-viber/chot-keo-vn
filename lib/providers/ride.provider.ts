import { getDestinationById } from "@/data/destinations";
import { roundToVndStep } from "@/lib/hash";
import { ProviderResponse, RideEstimateItem } from "@/lib/types";
import { RideEstimateProvider, RideEstimateQuery } from "./types";

/**
 * Phase 1: Deterministic Ride-Hailing Fare Estimator (Grab / Be / Xanh SM)
 * Calibrated by local trip distances in each Vietnamese destination.
 */
export class MockRideEstimateProvider implements RideEstimateProvider {
  readonly name = "ChotKeo Ride-Hailing Estimator (Mock v1: Xanh SM / Grab / Be)";

  async estimateRides(
    query: RideEstimateQuery
  ): Promise<ProviderResponse<RideEstimateItem>> {
    const dest = getDestinationById(query.destinationId);
    const fetchedAt = new Date().toISOString();

    if (!dest) {
      return { min: 0, max: 0, items: [], source: this.name, fetchedAt };
    }

    const avgKm = dest.id === "phu-quoc" ? 7.5 : 4.8;

    const items: RideEstimateItem[] = [
      {
        id: `ride-xanh-4-${dest.id}`,
        brand: "Xanh SM",
        vehicleType: "Taxi 4 chỗ",
        avgDistanceKm: avgKm,
        costPerTrip: {
          min: dest.rideBase4Seat.min,
          max: roundToVndStep(dest.rideBase4Seat.max * 0.96, 2000),
        },
        waitTimeMinutes: 4,
      },
      {
        id: `ride-grab-4-${dest.id}`,
        brand: "Grab",
        vehicleType: "Taxi 4 chỗ",
        avgDistanceKm: avgKm,
        costPerTrip: {
          min: roundToVndStep(dest.rideBase4Seat.min * 1.04, 2000),
          max: dest.rideBase4Seat.max,
        },
        waitTimeMinutes: 3,
      },
      {
        id: `ride-be-4-${dest.id}`,
        brand: "Be",
        vehicleType: "Taxi 4 chỗ",
        avgDistanceKm: avgKm,
        costPerTrip: {
          min: roundToVndStep(dest.rideBase4Seat.min * 0.95, 2000),
          max: roundToVndStep(dest.rideBase4Seat.max * 0.94, 2000),
        },
        waitTimeMinutes: 5,
      },
      {
        id: `ride-xanh-7-${dest.id}`,
        brand: "Xanh SM",
        vehicleType: "Taxi 7 chỗ",
        avgDistanceKm: avgKm,
        costPerTrip: dest.rideBase7Seat,
        waitTimeMinutes: 5,
      },
      {
        id: `ride-grab-bike-${dest.id}`,
        brand: "Grab",
        vehicleType: "Xe máy công nghệ",
        avgDistanceKm: avgKm,
        costPerTrip: dest.rideBaseBike,
        waitTimeMinutes: 2,
      },
    ];

    return {
      min: Math.min(...items.map((i) => i.costPerTrip.min)),
      max: Math.max(...items.map((i) => i.costPerTrip.max)),
      items,
      source: this.name,
      fetchedAt,
    };
  }
}

/**
 * Phase 2 Stub: Partner Ride-Hailing Mobility Fare API
 * Required env var:
 * - RIDE_ESTIMATE_API_KEY
 */
export class PartnerRideEstimateProviderStub implements RideEstimateProvider {
  readonly name = "Ride Mobility Partner API (Phase 2 Stub)";

  async estimateRides(
    query: RideEstimateQuery
  ): Promise<ProviderResponse<RideEstimateItem>> {
    void query;
    if (!process.env.RIDE_ESTIMATE_API_KEY) {
      throw new Error("Missing RIDE_ESTIMATE_API_KEY.");
    }
    throw new Error("PartnerRideEstimateProviderStub is a Phase 2 placeholder.");
  }
}
