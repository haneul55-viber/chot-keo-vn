"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  BikeType,
  IntercityMode,
  LocalTransportMode,
  LodgingFilterState,
  MealBudgetLevel,
  PriceRange,
  SavedTripRecord,
  TripDraft,
} from "@/lib/types";

export const DEFAULT_LODGING_FILTERS: LodgingFilterState = {
  types: [],
  maxPricePerNight: 0,
  minRating: 0,
  area: "all",
  amenities: [],
  freeCancellationOnly: false,
};

export const DEFAULT_TRIP_DRAFT: TripDraft = {
  originId: "tp-hcm",
  destinationId: "da-lat",
  startDate: "2026-11-20",
  endDate: "2026-11-23",
  adults: 2,
  children: 0,
  rooms: 1,

  intercityMode: "flight",
  intercitySelectionMode: "range",
  selectedFlightId: null,
  selectedBusId: null,

  lodgingFilters: DEFAULT_LODGING_FILTERS,
  lodgingSelectionMode: "range",
  selectedStays: [],

  mealsPerDay: 3,
  mealBudgetLevel: "trung_binh",

  localTransportMode: "ride_hailing",
  ridesPerDay: 4,
  bikeType: "scooter",
  bikeCount: null,
  selectedRentalId: null,

  includeContingency: true,
};

interface TripStoreState {
  currentStep: number;
  draft: TripDraft;
  savedTrips: SavedTripRecord[];
  hasHydrated: boolean;

  setHasHydrated: (hydrated: boolean) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  updateBasics: (
    updates: Partial<
      Pick<
        TripDraft,
        | "originId"
        | "destinationId"
        | "startDate"
        | "endDate"
        | "adults"
        | "children"
        | "rooms"
      >
    >
  ) => void;
  applyDates: (startDate: string, endDate: string) => void;

  // Step 3
  setIntercityMode: (mode: IntercityMode) => void;
  selectFlight: (flightId: string | null) => void;
  selectBus: (busId: string | null) => void;
  setIntercityRangeMode: () => void;

  // Step 4
  updateLodgingFilters: (updates: Partial<LodgingFilterState>) => void;
  resetLodgingFilters: () => void;
  toggleStaySelection: (lodgingId: string, defaultNights: number) => void;
  updateStayNights: (lodgingId: string, nights: number) => void;
  setLodgingRangeMode: () => void;

  // Step 5
  setMealsPerDay: (meals: number) => void;
  setMealBudgetLevel: (level: MealBudgetLevel) => void;

  // Step 6
  setLocalTransportMode: (mode: LocalTransportMode) => void;
  setRidesPerDay: (rides: number) => void;
  setBikeType: (bikeType: BikeType) => void;
  setBikeCount: (count: number | null) => void;
  selectRental: (rentalId: string | null) => void;

  // Step 7 & Global
  setIncludeContingency: (include: boolean) => void;
  saveCurrentTrip: (name: string, totalRange: PriceRange) => SavedTripRecord;
  loadSavedTrip: (id: string) => void;
  deleteSavedTrip: (id: string) => void;
  hydrateFromShareDraft: (shared: Partial<TripDraft>) => void;
  resetDraft: () => void;
}

export const useTripStore = create<TripStoreState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      draft: DEFAULT_TRIP_DRAFT,
      savedTrips: [],
      hasHydrated: false,

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      setCurrentStep: (step) =>
        set({ currentStep: Math.min(7, Math.max(1, step)) }),
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(7, state.currentStep + 1),
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(1, state.currentStep - 1),
        })),

      updateBasics: (updates) =>
        set((state) => {
          const destChanged =
            updates.destinationId &&
            updates.destinationId !== state.draft.destinationId;
          const originChanged =
            updates.originId && updates.originId !== state.draft.originId;

          const nextDraft: TripDraft = {
            ...state.draft,
            ...updates,
          };

          if (originChanged || destChanged) {
            nextDraft.selectedFlightId = null;
            nextDraft.selectedBusId = null;
            nextDraft.intercitySelectionMode = "range";
          }

          if (destChanged) {
            nextDraft.lodgingFilters = DEFAULT_LODGING_FILTERS;
            nextDraft.selectedStays = [];
            nextDraft.lodgingSelectionMode = "range";
            nextDraft.selectedRentalId = null;
          }

          return { draft: nextDraft };
        }),

      applyDates: (startDate, endDate) =>
        set((state) => ({
          draft: {
            ...state.draft,
            startDate,
            endDate,
          },
        })),

      setIntercityMode: (mode) =>
        set((state) => ({
          draft: {
            ...state.draft,
            intercityMode: mode,
          },
        })),

      selectFlight: (flightId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            intercityMode: "flight",
            selectedFlightId: flightId,
            intercitySelectionMode: flightId ? "selected" : "range",
          },
        })),

      selectBus: (busId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            intercityMode: "bus",
            selectedBusId: busId,
            intercitySelectionMode: busId ? "selected" : "range",
          },
        })),

      setIntercityRangeMode: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            intercitySelectionMode: "range",
            selectedFlightId: null,
            selectedBusId: null,
          },
        })),

      updateLodgingFilters: (updates) =>
        set((state) => ({
          draft: {
            ...state.draft,
            lodgingFilters: {
              ...state.draft.lodgingFilters,
              ...updates,
            },
          },
        })),

      resetLodgingFilters: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            lodgingFilters: DEFAULT_LODGING_FILTERS,
          },
        })),

      toggleStaySelection: (lodgingId, defaultNights) =>
        set((state) => {
          const exists = state.draft.selectedStays.some(
            (s) => s.lodgingId === lodgingId
          );
          const nextStays = exists
            ? state.draft.selectedStays.filter((s) => s.lodgingId !== lodgingId)
            : [
                ...state.draft.selectedStays,
                {
                  lodgingId,
                  nights: Math.max(1, defaultNights),
                },
              ];

          return {
            draft: {
              ...state.draft,
              selectedStays: nextStays,
              lodgingSelectionMode: nextStays.length > 0 ? "selected" : "range",
            },
          };
        }),

      updateStayNights: (lodgingId, nights) =>
        set((state) => ({
          draft: {
            ...state.draft,
            selectedStays: state.draft.selectedStays.map((s) =>
              s.lodgingId === lodgingId
                ? { ...s, nights: Math.max(1, nights) }
                : s
            ),
          },
        })),

      setLodgingRangeMode: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            lodgingSelectionMode: "range",
            selectedStays: [],
          },
        })),

      setMealsPerDay: (meals) =>
        set((state) => ({
          draft: {
            ...state.draft,
            mealsPerDay: Math.min(6, Math.max(1, meals)),
          },
        })),

      setMealBudgetLevel: (level) =>
        set((state) => ({
          draft: {
            ...state.draft,
            mealBudgetLevel: level,
          },
        })),

      setLocalTransportMode: (mode) =>
        set((state) => ({
          draft: {
            ...state.draft,
            localTransportMode: mode,
          },
        })),

      setRidesPerDay: (rides) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ridesPerDay: Math.min(12, Math.max(1, rides)),
          },
        })),

      setBikeType: (bikeType) =>
        set((state) => ({
          draft: {
            ...state.draft,
            bikeType,
          },
        })),

      setBikeCount: (count) =>
        set((state) => ({
          draft: {
            ...state.draft,
            bikeCount: count !== null ? Math.max(1, count) : null,
          },
        })),

      selectRental: (rentalId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            localTransportMode: "motorbike",
            selectedRentalId: rentalId,
          },
        })),

      setIncludeContingency: (include) =>
        set((state) => ({
          draft: {
            ...state.draft,
            includeContingency: include,
          },
        })),

      saveCurrentTrip: (name, totalRange) => {
        const record: SavedTripRecord = {
          id: `trip-${Date.now()}`,
          name,
          savedAt: new Date().toISOString(),
          draft: structuredClone(get().draft),
          totalRange,
        };
        set((state) => ({
          savedTrips: [record, ...state.savedTrips].slice(0, 20),
        }));
        return record;
      },

      loadSavedTrip: (id) =>
        set((state) => {
          const found = state.savedTrips.find((t) => t.id === id);
          if (!found) return state;
          return {
            draft: structuredClone(found.draft),
            currentStep: 7,
          };
        }),

      deleteSavedTrip: (id) =>
        set((state) => ({
          savedTrips: state.savedTrips.filter((t) => t.id !== id),
        })),

      hydrateFromShareDraft: (shared) =>
        set((state) => ({
          draft: {
            ...DEFAULT_TRIP_DRAFT,
            ...state.draft,
            ...shared,
            lodgingFilters: {
              ...DEFAULT_LODGING_FILTERS,
              ...(shared.lodgingFilters ?? {}),
            },
          },
          currentStep: 7,
        })),

      resetDraft: () =>
        set({
          currentStep: 1,
          draft: DEFAULT_TRIP_DRAFT,
        }),
    }),
    {
      name: "chotkeo-vn-storage-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        currentStep: state.currentStep,
        draft: state.draft,
        savedTrips: state.savedTrips,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
