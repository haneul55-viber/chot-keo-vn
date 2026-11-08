"use client";

import React from "react";
import {
  Bike,
  Car,
  Check,
  Fuel,
  Minus,
  Phone,
  Plus,
  Scale,
  Shield,
  Star,
  Truck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveMap } from "@/components/shared/InteractiveMap";
import { getDestinationById } from "@/data/destinations";
import {
  calculateMotorbikeRentalBase,
  calculateRideHailingBase,
  FUEL_PER_BIKE_PER_DAY,
} from "@/lib/pricing";
import { formatCompactVND, formatVND } from "@/lib/format";
import {
  BikeType,
  LocalTransportMode,
  PriceRange,
  RentalShop,
  RideEstimateItem,
  TripDraft,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const BIKE_TYPE_LABELS: Record<BikeType, { label: string; desc: string }> = {
  semi_auto: {
    label: "Xe số (Wave / Sirius)",
    desc: "Tiết kiệm xăng, khỏe khi leo dốc đồi Đà Lạt / Sơn Trà",
  },
  scooter: {
    label: "Xe tay ga (Vision / AirBlade)",
    desc: "Cốp rộng để đồ thoải mái, êm ái đi phố & đường biển",
  },
  manual: {
    label: "Xe côn / Phượt (Winner / XR150)",
    desc: "Động cơ mạnh mẽ cho cung đèo xa & trải nghiệm phượt",
  },
};

interface Step6LocalTransportProps {
  draft: TripDraft;
  days: number;
  rentals: RentalShop[];
  rides: RideEstimateItem[];
  loading: boolean;
  localMultiplier: PriceRange;
  effectiveStepRange: PriceRange;
  onSetMode: (mode: LocalTransportMode) => void;
  onSetRidesPerDay: (rides: number) => void;
  onSetBikeType: (type: BikeType) => void;
  onSetBikeCount: (count: number | null) => void;
  onSelectRental: (id: string | null) => void;
}

export function Step6LocalTransport({
  draft,
  days,
  rentals,
  rides,
  loading,
  localMultiplier,
  effectiveStepRange,
  onSetMode,
  onSetRidesPerDay,
  onSetBikeType,
  onSetBikeCount,
  onSelectRental,
}: Step6LocalTransportProps) {
  const travelers = Math.max(1, draft.adults + draft.children);
  const destination = getDestinationById(draft.destinationId);
  const defaultBikes = Math.max(1, Math.ceil(travelers / 2));
  const activeBikes = draft.bikeCount ?? defaultBikes;

  const rideComparisonBase = calculateRideHailingBase({
    days,
    travelers,
    ridesPerDay: draft.ridesPerDay,
    rides,
    destinationId: draft.destinationId,
  });
  const rideComparison = {
    min: Math.round(rideComparisonBase.min * localMultiplier.min),
    max: Math.round(rideComparisonBase.max * localMultiplier.max),
  };

  const bikeComparisonBase = calculateMotorbikeRentalBase({
    days,
    travelers,
    bikeType: draft.bikeType,
    bikeCount: draft.bikeCount,
    rentals,
    selectedRentalId: draft.selectedRentalId,
  });
  const bikeComparison = {
    min: Math.round(bikeComparisonBase.min * localMultiplier.min),
    max: Math.round(bikeComparisonBase.max * localMultiplier.max),
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">
                Bước 6: Di chuyển nội đô tại {destination?.name}
              </CardTitle>
              <CardDescription>
                So sánh chi phí giữa gọi xe công nghệ (Xanh SM / Grab / Be) và tự thuê xe máy khám phá trong {days} ngày.
              </CardDescription>
            </div>

            <div className="text-right">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Chi phí di chuyển tại chỗ
              </div>
              <div className="text-base font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                {formatVND(effectiveStepRange.min)} –{" "}
                {formatVND(effectiveStepRange.max)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Cost Comparison Banner */}
          <div className="rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-4 dark:border-[#1e2d45] dark:bg-[#172338]/70">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
              <Scale
                className="h-4 w-4 text-[#0f766e] dark:text-teal-400"
                aria-hidden="true"
              />
              <span>
                So sánh nhanh 2 phương thức ({days} ngày • {travelers} khách)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={draft.localTransportMode === "ride_hailing"}
                onClick={() => onSetMode("ride_hailing")}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors cursor-pointer",
                  draft.localTransportMode === "ride_hailing"
                    ? "border-[#0f766e] bg-white ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-[#101929]"
                    : "border-[#e7dfd3] bg-white/80 hover:border-[#0f766e]/50 hover:bg-white dark:border-[#1e2d45] dark:bg-[#101929]/60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-heading font-bold text-sm text-slate-900 dark:text-white">
                    <Car
                      className="h-4 w-4 text-[#0f766e] dark:text-teal-400"
                      aria-hidden="true"
                    />{" "}
                    Taxi / Xe công nghệ
                  </span>
                  <Badge variant="secondary">
                    {draft.ridesPerDay} cuốc/ngày
                  </Badge>
                </div>
                <div className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white price-num">
                  {formatCompactVND(rideComparison.min)} –{" "}
                  {formatCompactVND(rideComparison.max)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Êm ái, che nắng mưa, phù hợp gia đình có trẻ nhỏ hoặc nhóm bạn.
                </p>
              </button>

              <button
                type="button"
                aria-pressed={draft.localTransportMode === "motorbike"}
                onClick={() => onSetMode("motorbike")}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors cursor-pointer",
                  draft.localTransportMode === "motorbike"
                    ? "border-[#0f766e] bg-white ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-[#101929]"
                    : "border-[#e7dfd3] bg-white/80 hover:border-[#0f766e]/50 hover:bg-white dark:border-[#1e2d45] dark:bg-[#101929]/60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-heading font-bold text-sm text-slate-900 dark:text-white">
                    <Bike
                      className="h-4 w-4 text-[#c2410c] dark:text-orange-400"
                      aria-hidden="true"
                    />{" "}
                    Thuê xe máy + xăng
                  </span>
                  <Badge variant="amber">
                    {activeBikes} xe × {days} ngày
                  </Badge>
                </div>
                <div className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white price-num">
                  {formatCompactVND(bikeComparison.min)} –{" "}
                  {formatCompactVND(bikeComparison.max)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Chủ động lịch trình 24/24, tiết kiệm chi phí khi đi nhiều điểm.
                </p>
              </button>
            </div>
          </div>

          <Tabs
            value={draft.localTransportMode}
            onValueChange={(v) => onSetMode(v as LocalTransportMode)}
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-2">
              <TabsTrigger value="ride_hailing">
                <Car className="h-4 w-4" aria-hidden="true" />
                Grab / Be / Xanh SM
              </TabsTrigger>
              <TabsTrigger value="motorbike">
                <Bike className="h-4 w-4" aria-hidden="true" />
                Thuê xe máy ({rentals.length} tiệm)
              </TabsTrigger>
            </TabsList>

            {/* Mode A: Ride Hailing */}
            <TabsContent value="ride_hailing" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-4 dark:border-[#1e2d45] dark:bg-[#172338]/70">
                <div>
                  <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    Số chuyến gọi xe dự kiến mỗi ngày
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Tổng {draft.ridesPerDay * days} chuyến trong {days} ngày
                    {travelers > 4 &&
                      ` (Nhóm ${travelers} người tự động tính theo xe 7 chỗ / nhiều xe)`}
                    .
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Giảm số chuyến gọi xe mỗi ngày"
                    disabled={draft.ridesPerDay <= 1}
                    onClick={() => onSetRidesPerDay(draft.ridesPerDay - 1)}
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <span
                    aria-live="polite"
                    className="w-28 text-center font-bold text-sm text-slate-900 dark:text-white price-num"
                  >
                    {draft.ridesPerDay} chuyến / ngày
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Tăng số chuyến gọi xe mỗi ngày"
                    disabled={draft.ridesPerDay >= 12}
                    onClick={() => onSetRidesPerDay(draft.ridesPerDay + 1)}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {rides.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-[#e7dfd3] bg-white p-4 dark:border-[#1e2d45] dark:bg-[#101929]"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            r.brand === "Xanh SM"
                              ? "default"
                              : r.brand === "Grab"
                              ? "emerald"
                              : "amber"
                          }
                        >
                          {r.brand}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Đón sau ~{r.waitTimeMinutes} phút
                        </span>
                      </div>

                      <div className="font-heading font-bold text-sm text-slate-900 dark:text-white mt-2.5">
                        {r.vehicleType}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Quãng đường TB nội đô: ~{r.avgDistanceKm} km/cuốc
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#e7dfd3] dark:border-[#1e2d45] text-sm font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                        {formatVND(r.costPerTrip.min)} –{" "}
                        {formatVND(r.costPerTrip.max)} / chuyến
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Mode B: Motorbike Rental */}
            <TabsContent value="motorbike" className="space-y-5">
              {/* Bike Type + Bike Count Controls */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {(Object.keys(BIKE_TYPE_LABELS) as BikeType[]).map((type) => {
                  const active = draft.bikeType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSetBikeType(type)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors cursor-pointer",
                        active
                          ? "border-[#0f766e] bg-teal-50/55 ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-teal-950/30"
                          : "border-[#e7dfd3] bg-white hover:border-[#0f766e]/50 dark:border-[#1e2d45] dark:bg-[#101929]"
                      )}
                    >
                      <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                        {BIKE_TYPE_LABELS[type].label}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {BIKE_TYPE_LABELS[type].desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-4 dark:border-[#1e2d45] dark:bg-[#172338]/70">
                <div className="space-y-0.5">
                  <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    Số lượng xe thuê & ước tính nhiên liệu
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Fuel
                      className="h-3.5 w-3.5 text-[#c2410c] dark:text-orange-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      Đã cộng xăng dự kiến {formatVND(FUEL_PER_BIKE_PER_DAY.min)}–
                      {formatVND(FUEL_PER_BIKE_PER_DAY.max)}/xe/ngày (mặc định{" "}
                      <code>ceil({travelers}/2) = {defaultBikes} xe</code>).
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Giảm số lượng xe thuê"
                    disabled={activeBikes <= 1}
                    onClick={() => onSetBikeCount(activeBikes - 1)}
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <span
                    aria-live="polite"
                    className="w-20 text-center font-bold text-sm text-slate-900 dark:text-white price-num"
                  >
                    {activeBikes} chiếc
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Tăng số lượng xe thuê"
                    disabled={activeBikes >= 20}
                    onClick={() => onSetBikeCount(activeBikes + 1)}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  {draft.bikeCount !== null && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSetBikeCount(null)}
                    >
                      Tự động
                    </Button>
                  )}
                </div>
              </div>

              {/* Rental Shop Cards */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                    {rentals.map((shop) => {
                      const isSelected = draft.selectedRentalId === shop.id;
                      const chosenRate = shop.pricesPerDay[draft.bikeType];
                      return (
                        <div
                          key={shop.id}
                          className={cn(
                            "rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-colors",
                            isSelected
                              ? "border-[#0f766e] bg-teal-50/50 ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-teal-950/30"
                              : "border-[#e7dfd3] bg-white hover:border-[#0f766e]/50 dark:border-[#1e2d45] dark:bg-[#101929]"
                          )}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                                  {shop.name}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {shop.address}
                                </p>
                              </div>
                              <Badge variant="amber" className="shrink-0 price-num">
                                <Star
                                  className="h-3 w-3 fill-amber-500 text-amber-500"
                                  aria-hidden="true"
                                />
                                {shop.rating.toFixed(1)} ({shop.reviewCount})
                              </Badge>
                            </div>

                            {/* Price matrix */}
                            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#e7dfd3] bg-[#faf7f2] p-2.5 text-xs dark:border-[#1e2d45] dark:bg-[#172338]">
                              <div>
                                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                                  Xe số
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white price-num">
                                  {formatCompactVND(shop.pricesPerDay.semi_auto)}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                                  Tay ga
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white price-num">
                                  {formatCompactVND(shop.pricesPerDay.scooter)}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                                  Xe côn
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white price-num">
                                  {formatCompactVND(shop.pricesPerDay.manual)}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
                              <span className="inline-flex items-center gap-1">
                                <Shield
                                  className="h-3.5 w-3.5 text-[#0f766e] dark:text-teal-400"
                                  aria-hidden="true"
                                />
                                {shop.depositRequirement}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {shop.hotelDelivery ? (
                                <Badge variant="emerald">
                                  <Truck
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />{" "}
                                  Giao xe tận khách sạn
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Nhận xe tại cửa hàng
                                </Badge>
                              )}
                              <a
                                href={`tel:${shop.phone.replace(/\s+/g, "")}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#0f766e] hover:underline dark:text-teal-400 price-num"
                              >
                                <Phone
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />{" "}
                                {shop.phone}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[#e7dfd3] dark:border-[#1e2d45]">
                            <div className="text-xs price-num">
                              <span className="text-slate-500 dark:text-slate-400">
                                Loại đang chọn:{" "}
                              </span>
                              <strong className="text-[#0f766e] dark:text-teal-300">
                                {formatVND(chosenRate)}/ngày
                              </strong>
                            </div>
                            <Button
                              size="sm"
                              aria-pressed={isSelected}
                              variant={isSelected ? "default" : "outline"}
                              onClick={() =>
                                onSelectRental(isSelected ? null : shop.id)
                              }
                            >
                              {isSelected ? (
                                <>
                                  <Check
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />{" "}
                                  Đã chọn tiệm
                                </>
                              ) : (
                                "Chọn cửa hàng"
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Map of Rental Shops */}
                  {destination && rentals.length > 0 && (
                    <InteractiveMap
                      centerLat={destination.lat}
                      centerLng={destination.lng}
                      cityName={destination.name}
                      markers={rentals.map((shop) => ({
                        id: shop.id,
                        title: shop.name,
                        subtitle: `${shop.address} • ĐT: ${shop.phone}`,
                        priceLabel: `${formatCompactVND(
                          shop.pricesPerDay[draft.bikeType]
                        )}/ngày`,
                        rating: shop.rating,
                        lat: shop.lat,
                        lng: shop.lng,
                        selected: draft.selectedRentalId === shop.id,
                        externalUrl: shop.googleMapsUrl,
                        externalLabel: "Xem trên Google Maps",
                      }))}
                      onSelectMarker={(id) =>
                        onSelectRental(
                          draft.selectedRentalId === id ? null : id
                        )
                      }
                      selectActionLabel="Chọn cửa hàng này"
                    />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
