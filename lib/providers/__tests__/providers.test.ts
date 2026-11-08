import { describe, expect, it } from "vitest";
import { clearProviderCache, withProviderCache } from "@/lib/cache";
import {
  getBusProvider,
  getFlightProvider,
  getLodgingProvider,
  getPlacesProvider,
  getRentalProvider,
  getRideEstimateProvider,
} from "../index";
import { computeBayesianScore } from "../places.provider";

const CORE_DESTINATIONS = [
  "da-lat",
  "da-nang",
  "nha-trang",
  "phu-quoc",
  "ha-noi",
];

describe("Provider Adapters & 6h Cache", () => {
  it("returns deterministic { min, max, items, source, fetchedAt } across all 5 core destinations", async () => {
    const flightProvider = getFlightProvider();
    const busProvider = getBusProvider();
    const lodgingProvider = getLodgingProvider();
    const placesProvider = getPlacesProvider();
    const rentalProvider = getRentalProvider();
    const rideProvider = getRideEstimateProvider();

    for (const destId of CORE_DESTINATIONS) {
      const originId = destId === "ha-noi" ? "tp-hcm" : "ha-noi";

      const [flights1, flights2, buses, lodging, places, rentals, rides] =
        await Promise.all([
          flightProvider.searchFlights({
            originId,
            destinationId: destId,
            startDate: "2026-11-15",
            endDate: "2026-11-18",
          }),
          flightProvider.searchFlights({
            originId,
            destinationId: destId,
            startDate: "2026-11-15",
            endDate: "2026-11-18",
          }),
          busProvider.searchBuses({
            originId,
            destinationId: destId,
            startDate: "2026-11-15",
            endDate: "2026-11-18",
          }),
          lodgingProvider.searchLodging({
            destinationId: destId,
            startDate: "2026-11-15",
            endDate: "2026-11-18",
          }),
          placesProvider.searchRestaurants({
            destinationId: destId,
            minRating: 4.0,
          }),
          rentalProvider.searchRentals({
            destinationId: destId,
            startDate: "2026-11-15",
          }),
          rideProvider.estimateRides({
            destinationId: destId,
          }),
        ]);

      // Deterministic check
      expect(flights1.min).toBe(flights2.min);
      expect(flights1.max).toBe(flights2.max);
      expect(flights1.items.length).toBeGreaterThan(0);

      for (const res of [buses, lodging, places, rentals, rides]) {
        expect(res.items.length).toBeGreaterThan(0);
        expect(res.min).toBeGreaterThan(0);
        expect(res.max).toBeGreaterThanOrEqual(res.min);
        expect(res.source.length).toBeGreaterThan(3);
        expect(res.fetchedAt).toBeTruthy();
      }
    }
  });

  it("weights review count properly in Bayesian restaurant score", () => {
    // 4.7★ with 5,000 reviews beats 4.8★ with only 20 reviews
    const popularScore = computeBayesianScore(4.7, 5000);
    const tinySampleScore = computeBayesianScore(4.8, 20);
    expect(popularScore).toBeGreaterThan(tinySampleScore);
  });

  it("caches provider responses for 6h and flags cached=true on subsequent hits", async () => {
    clearProviderCache();
    let calls = 0;

    const first = await withProviderCache("test-key", async () => {
      calls++;
      return { min: 100, max: 200, items: [1], source: "mock", fetchedAt: "t1" };
    });
    const second = await withProviderCache("test-key", async () => {
      calls++;
      return { min: 999, max: 999, items: [2], source: "mock", fetchedAt: "t2" };
    });

    expect(calls).toBe(1);
    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(second.fetchedAt).toBe("t1");
    expect(second.min).toBe(100);
  });
});
