"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateTripPricing,
  suggestNearbyDateAlternatives,
} from "@/lib/pricing";
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
  SourceAttribution,
  TripDraft,
} from "@/lib/types";

export interface RestaurantFilterParams {
  session: MealSession | "all";
  cuisine: string;
  priceLevel: MealBudgetLevel | "all";
  minRating: number;
}

export function useTripData(
  draft: TripDraft,
  restaurantFilters: RestaurantFilterParams
) {
  const [flightsRes, setFlightsRes] =
    useState<ProviderResponse<FlightOption> | null>(null);
  const [busesRes, setBusesRes] =
    useState<ProviderResponse<BusOption> | null>(null);
  const [lodgingRes, setLodgingRes] =
    useState<ProviderResponse<LodgingOption> | null>(null);
  const [placesRes, setPlacesRes] =
    useState<ProviderResponse<RestaurantPlace> | null>(null);
  const [rentalsRes, setRentalsRes] =
    useState<ProviderResponse<RentalShop> | null>(null);
  const [ridesRes, setRidesRes] =
    useState<ProviderResponse<RideEstimateItem> | null>(null);

  const [reloadTick, setReloadTick] = useState(0);
  const [resolvedCoreKey, setResolvedCoreKey] = useState<string>("");
  const [resolvedPlacesKey, setResolvedPlacesKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const coreKey = `${draft.originId}|${draft.destinationId}|${draft.startDate}|${draft.endDate}|${reloadTick}`;

  useEffect(() => {
    let cancelled = false;

    async function loadCore() {
      try {
        const qRoute = new URLSearchParams({
          originId: draft.originId,
          destinationId: draft.destinationId,
          startDate: draft.startDate,
          endDate: draft.endDate,
        }).toString();

        const qDest = new URLSearchParams({
          destinationId: draft.destinationId,
          startDate: draft.startDate,
          endDate: draft.endDate,
        }).toString();

        const [fResp, bResp, lResp, rResp, rideResp] = await Promise.all([
          fetch(`/api/flights?${qRoute}`),
          fetch(`/api/buses?${qRoute}`),
          fetch(`/api/lodging?${qDest}`),
          fetch(`/api/rentals?${qDest}`),
          fetch(
            `/api/rides?destinationId=${encodeURIComponent(draft.destinationId)}`
          ),
        ]);

        if (!fResp.ok || !bResp.ok || !lResp.ok || !rResp.ok || !rideResp.ok) {
          throw new Error(
            "Một số nguồn dữ liệu tạm thời phản hồi chậm. Vui lòng thử tải lại."
          );
        }

        const [fJson, bJson, lJson, rJson, rideJson] = await Promise.all([
          fResp.json(),
          bResp.json(),
          lResp.json(),
          rResp.json(),
          rideResp.json(),
        ]);

        if (!cancelled) {
          setFlightsRes(fJson);
          setBusesRes(bJson);
          setLodgingRes(lJson);
          setRentalsRes(rJson);
          setRidesRes(rideJson);
          setError(null);
          setResolvedCoreKey(coreKey);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể kết nối máy chủ dữ liệu."
          );
          setResolvedCoreKey(coreKey);
        }
      }
    }

    loadCore();
    return () => {
      cancelled = true;
    };
  }, [coreKey, draft.originId, draft.destinationId, draft.startDate, draft.endDate]);

  // Determine anchor coordinates from first selected hotel (if any) so restaurant distances update live
  const anchorCoords = useMemo(() => {
    if (
      draft.lodgingSelectionMode === "selected" &&
      draft.selectedStays.length > 0 &&
      lodgingRes?.items
    ) {
      const firstStay = lodgingRes.items.find(
        (l) => l.id === draft.selectedStays[0].lodgingId
      );
      if (firstStay) {
        return { lat: firstStay.lat, lng: firstStay.lng, label: firstStay.name };
      }
    }
    return null;
  }, [draft.lodgingSelectionMode, draft.selectedStays, lodgingRes]);

  const placesKey = `${draft.destinationId}|${anchorCoords?.lat ?? "c"}|${
    anchorCoords?.lng ?? "c"
  }|${restaurantFilters.session}|${restaurantFilters.cuisine}|${
    restaurantFilters.priceLevel
  }|${restaurantFilters.minRating}`;

  useEffect(() => {
    let cancelled = false;

    async function loadPlaces() {
      try {
        const params = new URLSearchParams({
          destinationId: draft.destinationId,
          session: restaurantFilters.session,
          cuisine: restaurantFilters.cuisine,
          priceLevel: restaurantFilters.priceLevel,
          minRating: String(restaurantFilters.minRating),
        });
        if (anchorCoords) {
          params.set("nearLat", String(anchorCoords.lat));
          params.set("nearLng", String(anchorCoords.lng));
        }
        const res = await fetch(`/api/places?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setPlacesRes(data);
          }
        }
      } finally {
        if (!cancelled) {
          setResolvedPlacesKey(placesKey);
        }
      }
    }

    loadPlaces();
    return () => {
      cancelled = true;
    };
  }, [
    placesKey,
    draft.destinationId,
    restaurantFilters.session,
    restaurantFilters.cuisine,
    restaurantFilters.priceLevel,
    restaurantFilters.minRating,
    anchorCoords,
  ]);

  const retry = useCallback(() => {
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  const loadingCore = resolvedCoreKey !== coreKey;
  const loadingPlaces = resolvedPlacesKey !== placesKey;

  const pricingInputs = useMemo(
    () => ({
      flights: flightsRes?.items ?? [],
      buses: busesRes?.items ?? [],
      lodgings: lodgingRes?.items ?? [],
      rentals: rentalsRes?.items ?? [],
      rides: ridesRes?.items ?? [],
    }),
    [flightsRes, busesRes, lodgingRes, rentalsRes, ridesRes]
  );

  const pricing = useMemo(
    () => calculateTripPricing(draft, pricingInputs),
    [draft, pricingInputs]
  );

  const dateAlternatives = useMemo(
    () => suggestNearbyDateAlternatives(draft, pricingInputs),
    [draft, pricingInputs]
  );

  const attributions = useMemo<SourceAttribution[]>(() => {
    const list: SourceAttribution[] = [];
    if (flightsRes) {
      list.push({
        category: "Vé máy bay khứ hồi",
        source: flightsRes.source,
        fetchedAt: flightsRes.fetchedAt,
        cached: flightsRes.cached,
      });
    }
    if (busesRes) {
      list.push({
        category: "Xe giường nằm / Limousine",
        source: busesRes.source,
        fetchedAt: busesRes.fetchedAt,
        cached: busesRes.cached,
      });
    }
    if (lodgingRes) {
      list.push({
        category: "Lưu trú (OTA tổng hợp)",
        source: lodgingRes.source,
        fetchedAt: lodgingRes.fetchedAt,
        cached: lodgingRes.cached,
      });
    }
    if (placesRes) {
      list.push({
        category: "Ẩm thực & Nhà hàng đề xuất",
        source: placesRes.source,
        fetchedAt: placesRes.fetchedAt,
        cached: placesRes.cached,
      });
    }
    if (rentalsRes) {
      list.push({
        category: "Cửa hàng thuê xe máy",
        source: rentalsRes.source,
        fetchedAt: rentalsRes.fetchedAt,
        cached: rentalsRes.cached,
      });
    }
    if (ridesRes) {
      list.push({
        category: "Cước xe công nghệ nội đô",
        source: ridesRes.source,
        fetchedAt: ridesRes.fetchedAt,
        cached: ridesRes.cached,
      });
    }
    return list;
  }, [flightsRes, busesRes, lodgingRes, placesRes, rentalsRes, ridesRes]);

  return {
    flights: flightsRes?.items ?? [],
    buses: busesRes?.items ?? [],
    lodgings: lodgingRes?.items ?? [],
    places: placesRes?.items ?? [],
    rentals: rentalsRes?.items ?? [],
    rides: ridesRes?.items ?? [],
    anchorCoords,
    pricing,
    dateAlternatives,
    attributions,
    loadingCore,
    loadingPlaces,
    error,
    retry,
  };
}
