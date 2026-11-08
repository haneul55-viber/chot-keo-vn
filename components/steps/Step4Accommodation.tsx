"use client";

import React, { useMemo, useState } from "react";
import {
  BedDouble,
  Check,
  ExternalLink,
  Filter,
  List,
  Map as MapIcon,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveMap } from "@/components/shared/InteractiveMap";
import { getDestinationById } from "@/data/destinations";
import { filterLodgingOptions } from "@/lib/pricing";
import { formatCompactVND, formatVND } from "@/lib/format";
import {
  LodgingFilterState,
  LodgingOption,
  LodgingPlatform,
  LodgingType,
  PriceRange,
  TripDraft,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<LodgingType, string> = {
  hotel: "Khách sạn",
  homestay: "Homestay",
  resort: "Resort",
  hostel: "Hostel",
};

const PLATFORM_STYLES: Record<LodgingPlatform, string> = {
  Agoda: "bg-rose-600 text-white",
  "Booking.com": "bg-blue-700 text-white",
  Traveloka: "bg-sky-600 text-white",
  Trivago: "bg-amber-500 text-slate-950",
};

const COMMON_AMENITIES = [
  "Wifi miễn phí",
  "Bữa sáng miễn phí",
  "Hồ bơi",
  "Spa",
  "Bãi đỗ xe",
];

interface Step4AccommodationProps {
  draft: TripDraft;
  lodgings: LodgingOption[];
  loading: boolean;
  nights: number;
  holidayLodgingMultiplier: PriceRange;
  effectiveStepRange: PriceRange;
  onUpdateFilters: (updates: Partial<LodgingFilterState>) => void;
  onResetFilters: () => void;
  onToggleStay: (lodgingId: string, defaultNights: number) => void;
  onUpdateStayNights: (lodgingId: string, nights: number) => void;
  onKeepRange: () => void;
}

export function Step4Accommodation({
  draft,
  lodgings,
  loading,
  nights,
  holidayLodgingMultiplier,
  effectiveStepRange,
  onUpdateFilters,
  onResetFilters,
  onToggleStay,
  onUpdateStayNights,
  onKeepRange,
}: Step4AccommodationProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const destination = getDestinationById(draft.destinationId);

  const filtered = useMemo(
    () => filterLodgingOptions(lodgings, draft.lodgingFilters),
    [lodgings, draft.lodgingFilters]
  );

  const areas = useMemo(
    () => Array.from(new Set(lodgings.map((l) => l.area))),
    [lodgings]
  );

  const maxCatalogPrice = useMemo(
    () =>
      lodgings.length > 0
        ? Math.max(...lodgings.map((l) => l.pricePerNight), 4500000)
        : 4500000,
    [lodgings]
  );

  const avgMult =
    (holidayLodgingMultiplier.min + holidayLodgingMultiplier.max) / 2;

  const toggleType = (t: LodgingType) => {
    const exists = draft.lodgingFilters.types.includes(t);
    const next = exists
      ? draft.lodgingFilters.types.filter((x) => x !== t)
      : [...draft.lodgingFilters.types, t];
    onUpdateFilters({ types: next });
  };

  const toggleAmenity = (amenity: string) => {
    const exists = draft.lodgingFilters.amenities.includes(amenity);
    const next = exists
      ? draft.lodgingFilters.amenities.filter((x) => x !== amenity)
      : [...draft.lodgingFilters.amenities, amenity];
    onUpdateFilters({ amenities: next });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">
                Bước 4: Chỗ ở & Lưu trú tại {destination?.name}
              </CardTitle>
              <CardDescription>
                Tính theo <strong>{nights} đêm</strong> ×{" "}
                <strong>{draft.rooms} phòng</strong>. Bạn có thể chọn nhiều nơi để chia đêm hoặc giữ khoảng giá theo bộ lọc.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-500">Chi phí lưu trú</div>
                <div className="text-base font-extrabold text-teal-700 dark:text-teal-400 price-num">
                  {formatVND(effectiveStepRange.min)}
                  {effectiveStepRange.max !== effectiveStepRange.min &&
                    ` – ${formatVND(effectiveStepRange.max)}`}
                </div>
              </div>

              <div className="inline-flex rounded-xl border border-slate-200 p-1 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer",
                    viewMode === "list"
                      ? "bg-teal-600 text-white"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <List className="h-3.5 w-3.5" /> Danh sách
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer",
                    viewMode === "map"
                      ? "bg-teal-600 text-white"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <MapIcon className="h-3.5 w-3.5" /> Bản đồ
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Filter Panel */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <Filter className="h-3.5 w-3.5 text-teal-600" /> Bộ lọc lưu trú
              </span>
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Đặt lại bộ lọc
              </button>
            </div>

            {/* Lodging Types */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as LodgingType[]).map((type) => {
                const active = draft.lodgingFilters.types.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      active
                        ? "border-teal-600 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-500 dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    )}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Trần giá gốc / đêm:
                  </span>
                  <span className="font-bold text-teal-700 dark:text-teal-400 price-num">
                    {draft.lodgingFilters.maxPricePerNight > 0
                      ? `≤ ${formatVND(draft.lodgingFilters.maxPricePerNight)}`
                      : "Không giới hạn"}
                  </span>
                </div>
                <Slider
                  min={300000}
                  max={maxCatalogPrice}
                  step={100000}
                  value={[
                    draft.lodgingFilters.maxPricePerNight > 0
                      ? draft.lodgingFilters.maxPricePerNight
                      : maxCatalogPrice,
                  ]}
                  onValueChange={([val]) =>
                    onUpdateFilters({
                      maxPricePerNight: val >= maxCatalogPrice ? 0 : val,
                    })
                  }
                />
              </div>

              {/* Area Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Khu vực:
                </label>
                <select
                  value={draft.lodgingFilters.area}
                  onChange={(e) => onUpdateFilters({ area: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="all">Tất cả khu vực ({areas.length})</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating & Free Cancellation */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Điểm đánh giá:
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 4.5, 4.7].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onUpdateFilters({ minRating: r })}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer",
                          draft.lodgingFilters.minRating === r
                            ? "border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                            : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                        )}
                      >
                        {r === 0 ? "Tất cả" : `≥ ${r}★`}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Switch
                    checked={draft.lodgingFilters.freeCancellationOnly}
                    onCheckedChange={(checked) =>
                      onUpdateFilters({ freeCancellationOnly: checked })
                    }
                  />
                  <span>Miễn phí hủy</span>
                </label>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">Tiện nghi:</span>
              {COMMON_AMENITIES.map((amenity) => {
                const active = draft.lodgingFilters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      active
                        ? "border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                    )}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Stay Split Allocation Bar */}
          {draft.lodgingSelectionMode === "selected" &&
            draft.selectedStays.length > 0 && (
              <div className="rounded-2xl border border-teal-300 bg-teal-50/70 p-4 space-y-3 dark:border-teal-800 dark:bg-teal-950/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
                    Đang chọn {draft.selectedStays.length} nơi lưu trú (hỗ trợ chia đêm trên tổng {nights} đêm)
                  </div>
                  <Button size="sm" variant="outline" onClick={onKeepRange}>
                    <Sparkles className="h-3.5 w-3.5" />
                    Quay về chế độ Khoảng giá (Range)
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {draft.selectedStays.map((stay) => {
                    const info = lodgings.find((l) => l.id === stay.lodgingId);
                    if (!info) return null;
                    return (
                      <div
                        key={stay.lodgingId}
                        className="flex items-center justify-between gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 dark:border-teal-900 dark:bg-slate-900"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">
                            {info.name}
                          </div>
                          <div className="text-[11px] text-slate-500 price-num">
                            ~{formatVND(Math.round(info.pricePerNight * avgMult))}
                            /đêm/phòng
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            disabled={stay.nights <= 1}
                            onClick={() =>
                              onUpdateStayNights(stay.lodgingId, stay.nights - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-bold w-12 text-center price-num">
                            {stay.nights} đêm
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            disabled={stay.nights >= nights}
                            onClick={() =>
                              onUpdateStayNights(stay.lodgingId, stay.nights + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Results View: Map or Cards */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <BedDouble className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <h4 className="font-bold text-base">
                Không có chỗ ở nào khớp tất cả tiêu chí lọc
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Hãy thử nới rộng mức trần giá hoặc bỏ bớt tiện nghi bắt buộc.
              </p>
              <Button variant="outline" className="mt-4" onClick={onResetFilters}>
                Xóa bộ lọc để xem toàn bộ ({lodgings.length} chỗ ở)
              </Button>
            </div>
          ) : viewMode === "map" && destination ? (
            <InteractiveMap
              centerLat={destination.lat}
              centerLng={destination.lng}
              cityName={destination.name}
              markers={filtered.map((item) => ({
                id: item.id,
                title: item.name,
                subtitle: `${TYPE_LABELS[item.type]} • ${item.area} • ${item.platform}`,
                priceLabel: `${formatCompactVND(
                  Math.round(item.pricePerNight * avgMult)
                )}/đêm`,
                rating: item.rating,
                lat: item.lat,
                lng: item.lng,
                selected: draft.selectedStays.some(
                  (s) => s.lodgingId === item.id
                ),
                externalUrl: item.deepLink,
                externalLabel: `Xem trên ${item.platform}`,
              }))}
              onSelectMarker={(id) =>
                onToggleStay(
                  id,
                  draft.selectedStays.length === 0 ? nights : 1
                )
              }
              selectActionLabel="Chọn lưu trú tại đây"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((item) => {
                const isSelected = draft.selectedStays.some(
                  (s) => s.lodgingId === item.id
                );
                const effNightlyMin = Math.round(
                  item.pricePerNight * holidayLodgingMultiplier.min
                );
                const effNightlyMax = Math.round(
                  item.pricePerNight * holidayLodgingMultiplier.max
                );
                const totalStayMin = effNightlyMin * nights * draft.rooms;
                const totalStayMax = effNightlyMax * nights * draft.rooms;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all",
                      isSelected
                        ? "border-teal-600 ring-2 ring-teal-500/25 bg-white dark:border-teal-400 dark:bg-slate-900"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                    )}
                  >
                    <div>
                      {/* Visual Header */}
                      <div
                        className={cn(
                          "relative h-36 p-4 flex flex-col justify-between bg-gradient-to-br text-white",
                          item.imageGradient
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs",
                              PLATFORM_STYLES[item.platform]
                            )}
                          >
                            {item.platform}
                          </span>
                          <span className="rounded-full bg-black/35 backdrop-blur-xs px-2.5 py-0.5 text-xs font-semibold">
                            {TYPE_LABELS[item.type]}
                          </span>
                        </div>

                        <div className="flex items-end justify-between gap-2">
                          <span className="text-xs font-medium text-white/90 drop-shadow-xs">
                            {item.imageLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-white/95 text-slate-900 px-2 py-0.5 text-xs font-bold shadow-xs price-num">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                            {item.rating.toFixed(1)}{" "}
                            <span className="font-normal text-slate-500">
                              ({item.reviewCount})
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-2.5">
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Khu vực: {item.area}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {item.freeCancellation && (
                            <Badge variant="emerald" className="text-[11px]">
                              <ShieldCheck className="h-3 w-3" /> Miễn phí hủy
                            </Badge>
                          )}
                          {item.amenities.slice(0, 3).map((am) => (
                            <Badge
                              key={am}
                              variant="secondary"
                              className="text-[11px] font-medium"
                            >
                              {am}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Pricing & Actions */}
                    <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-500 price-num">
                          {effNightlyMin === effNightlyMax
                            ? `${formatVND(effNightlyMin)} / đêm / phòng`
                            : `${formatCompactVND(
                                effNightlyMin
                              )}–${formatCompactVND(effNightlyMax)} / đêm`}
                        </div>
                        <div className="text-base font-extrabold text-teal-700 dark:text-teal-400 price-num">
                          {totalStayMin === totalStayMax
                            ? formatVND(totalStayMin)
                            : `${formatCompactVND(
                                totalStayMin
                              )} – ${formatCompactVND(totalStayMax)}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Tổng {nights} đêm × {draft.rooms} phòng
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={item.deepLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Xem trên nền tảng
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() =>
                            onToggleStay(
                              item.id,
                              draft.selectedStays.length === 0 ? nights : 1
                            )
                          }
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Đã chọn
                            </>
                          ) : (
                            "Chọn"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
