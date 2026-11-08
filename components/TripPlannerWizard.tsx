"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { DestinationHero } from "@/components/layout/DestinationHero";
import { WizardStepper } from "@/components/layout/WizardStepper";
import { LiveBudgetSidebar } from "@/components/layout/LiveBudgetSidebar";
import { StickySummaryBar } from "@/components/layout/StickySummaryBar";
import { Step1Basics } from "@/components/steps/Step1Basics";
import { Step2SpecialDates } from "@/components/steps/Step2SpecialDates";
import { Step3Transport } from "@/components/steps/Step3Transport";
import { Step4Accommodation } from "@/components/steps/Step4Accommodation";
import { Step5Food } from "@/components/steps/Step5Food";
import { Step6LocalTransport } from "@/components/steps/Step6LocalTransport";
import { Step7Summary } from "@/components/steps/Step7Summary";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/lib/store/useTripStore";
import { RestaurantFilterParams, useTripData } from "@/lib/hooks/useTripData";
import { computeTripDuration, decodeTripShareParam } from "@/lib/format";

export function TripPlannerWizard() {
  const store = useTripStore();
  const { draft, currentStep } = store;

  const [restaurantFilters, setRestaurantFilters] =
    useState<RestaurantFilterParams>({
      session: "all",
      cuisine: "all",
      priceLevel: "all",
      minRating: 4.0,
    });

  // Hydrate shared link `?trip=...` if opened from a shared URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("trip");
    if (shared) {
      const decoded = decodeTripShareParam(shared);
      if (decoded) {
        store.hydrateFromShareDraft(decoded);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    flights,
    buses,
    lodgings,
    places,
    rentals,
    rides,
    anchorCoords,
    pricing,
    dateAlternatives,
    attributions,
    loadingCore,
    loadingPlaces,
    error,
    retry,
  } = useTripData(draft, restaurantFilters);

  const duration = computeTripDuration(draft.startDate, draft.endDate);
  const totalTravelers = draft.adults + draft.children;

  let validationMessage: string | null = null;
  if (!duration.isValid) {
    validationMessage = "Ngày kết thúc phải sau ngày khởi hành ít nhất 1 đêm.";
  } else if (totalTravelers < 1) {
    validationMessage = "Cần ít nhất 1 hành khách cho chuyến đi.";
  } else if (draft.originId === draft.destinationId) {
    validationMessage = "Điểm khởi hành và điểm đến không được trùng nhau.";
  }
  const canProceed = validationMessage === null;

  const goToStep = (step: number) => {
    store.setCurrentStep(step);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-36 sm:pb-32">
      <Header />

      <DestinationHero
        draft={draft}
        pricing={pricing}
        onJumpToBasics={() => goToStep(1)}
        onJumpToHolidays={() => goToStep(2)}
      />

      <WizardStepper
        currentStep={currentStep}
        onSelectStep={goToStep}
        hasHolidayOverlap={pricing.holidayAnalysis.hasOverlap}
        canProceedFromStep1={canProceed}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6">
        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={retry}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Thử lại
            </Button>
          </div>
        )}

        {currentStep < 7 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            <div key={currentStep} className="lg:col-span-8 animate-step-in">
              {currentStep === 1 && (
                <Step1Basics draft={draft} onUpdate={store.updateBasics} />
              )}

              {currentStep === 2 && (
                <Step2SpecialDates
                  draft={draft}
                  analysis={pricing.holidayAnalysis}
                  alternatives={dateAlternatives}
                  onApplyDates={store.applyDates}
                />
              )}

              {currentStep === 3 && (
                <Step3Transport
                  draft={draft}
                  flights={flights}
                  buses={buses}
                  loading={loadingCore}
                  holidayTransportMultiplier={
                    pricing.holidayAnalysis.effectiveMultipliers.transport
                  }
                  effectiveStepRange={pricing.effectiveByStep.intercity}
                  onSetMode={store.setIntercityMode}
                  onSelectFlight={store.selectFlight}
                  onSelectBus={store.selectBus}
                  onKeepRange={store.setIntercityRangeMode}
                />
              )}

              {currentStep === 4 && (
                <Step4Accommodation
                  draft={draft}
                  lodgings={lodgings}
                  loading={loadingCore}
                  nights={pricing.nights}
                  holidayLodgingMultiplier={
                    pricing.holidayAnalysis.effectiveMultipliers.lodging
                  }
                  effectiveStepRange={pricing.effectiveByStep.lodging}
                  onUpdateFilters={store.updateLodgingFilters}
                  onResetFilters={store.resetLodgingFilters}
                  onToggleStay={store.toggleStaySelection}
                  onUpdateStayNights={store.updateStayNights}
                  onKeepRange={store.setLodgingRangeMode}
                />
              )}

              {currentStep === 5 && (
                <Step5Food
                  draft={draft}
                  days={pricing.days}
                  places={places}
                  loadingPlaces={loadingPlaces}
                  anchorLabel={anchorCoords?.label}
                  effectiveStepRange={pricing.effectiveByStep.food}
                  restaurantFilters={restaurantFilters}
                  onChangeRestaurantFilters={(next) =>
                    setRestaurantFilters((prev) => ({ ...prev, ...next }))
                  }
                  onSetMealsPerDay={store.setMealsPerDay}
                  onSetBudgetLevel={store.setMealBudgetLevel}
                />
              )}

              {currentStep === 6 && (
                <Step6LocalTransport
                  draft={draft}
                  days={pricing.days}
                  rentals={rentals}
                  rides={rides}
                  loading={loadingCore}
                  localMultiplier={
                    pricing.holidayAnalysis.effectiveMultipliers.localServices
                  }
                  effectiveStepRange={pricing.effectiveByStep.localTransport}
                  onSetMode={store.setLocalTransportMode}
                  onSetRidesPerDay={store.setRidesPerDay}
                  onSetBikeType={store.setBikeType}
                  onSetBikeCount={store.setBikeCount}
                  onSelectRental={store.selectRental}
                />
              )}
            </div>

            <LiveBudgetSidebar
              currentStep={currentStep}
              draft={draft}
              pricing={pricing}
              canProceed={canProceed}
              onJumpToStep={goToStep}
              onToggleContingency={store.setIncludeContingency}
            />
          </div>
        ) : (
          <div key="step-7" className="animate-step-in">
            <Step7Summary
              draft={draft}
              pricing={pricing}
              attributions={attributions}
              onToggleContingency={store.setIncludeContingency}
              onJumpToStep={goToStep}
              onSaveTrip={store.saveCurrentTrip}
            />
          </div>
        )}

        <footer className="no-print mt-10 text-center text-xs text-slate-500 dark:text-slate-400">
          ChotKeo.vn • Giá hiển thị là ước tính tham khảo bằng VNĐ và có thể
          chênh lệch với giá thực tế trên các nền tảng đặt dịch vụ.
        </footer>
      </main>

      <StickySummaryBar
        currentStep={currentStep}
        pricing={pricing}
        canProceed={canProceed}
        validationMessage={validationMessage}
        onPrev={() => goToStep(currentStep - 1)}
        onNext={() => goToStep(currentStep + 1)}
        onJumpToStep={goToStep}
      />
    </div>
  );
}
