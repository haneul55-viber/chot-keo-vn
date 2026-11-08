"use client";

import React from "react";
import {
  Award,
  ExternalLink,
  MapPin,
  Minus,
  Plus,
  Star,
  UtensilsCrossed,
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
import { Skeleton } from "@/components/ui/skeleton";
import mealCostJson from "@/data/meal-costs.json";
import { getDestinationById } from "@/data/destinations";
import { getMealUnitRange } from "@/lib/pricing";
import { RestaurantFilterParams } from "@/lib/hooks/useTripData";
import { formatCompactVND, formatVND } from "@/lib/format";
import {
  MealBudgetLevel,
  MealCostConfig,
  MealSession,
  PriceRange,
  RestaurantPlace,
  TripDraft,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const mealConfig = mealCostJson as MealCostConfig;

const BUDGET_LEVELS: MealBudgetLevel[] = ["binh_dan", "trung_binh", "cao_cap"];

const LEVEL_BADGE_LABELS: Record<MealBudgetLevel, string> = {
  binh_dan: "Bình dân ($)",
  trung_binh: "Trung bình ($$)",
  cao_cap: "Cao cấp ($$$)",
};

const SESSION_OPTIONS: Array<{ value: MealSession | "all"; label: string }> = [
  { value: "all", label: "Tất cả bữa" },
  { value: "breakfast", label: "Bữa sáng" },
  { value: "lunch", label: "Bữa trưa" },
  { value: "dinner", label: "Bữa tối" },
];

const CUISINE_OPTIONS = [
  "all",
  "Đặc sản địa phương",
  "Hải sản tươi sống",
  "Bún & Phở",
  "Lẩu & Nướng",
  "Nhà hàng Việt",
  "Nhà hàng Âu - Việt",
];

interface Step5FoodProps {
  draft: TripDraft;
  days: number;
  places: RestaurantPlace[];
  loadingPlaces: boolean;
  anchorLabel?: string;
  effectiveStepRange: PriceRange;
  restaurantFilters: RestaurantFilterParams;
  onChangeRestaurantFilters: (next: Partial<RestaurantFilterParams>) => void;
  onSetMealsPerDay: (meals: number) => void;
  onSetBudgetLevel: (level: MealBudgetLevel) => void;
}

export function Step5Food({
  draft,
  days,
  places,
  loadingPlaces,
  anchorLabel,
  effectiveStepRange,
  restaurantFilters,
  onChangeRestaurantFilters,
  onSetMealsPerDay,
  onSetBudgetLevel,
}: Step5FoodProps) {
  const travelers = Math.max(1, draft.adults + draft.children);
  const destination = getDestinationById(draft.destinationId);
  const totalMeals = draft.mealsPerDay * days * travelers;

  return (
    <div className="space-y-6">
      {/* Meal Budget Calculator Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">
                Bước 5: Ngân sách Ăn uống & Khám phá Ẩm thực {destination?.name}
              </CardTitle>
              <CardDescription>
                Mặc định {draft.mealsPerDay} bữa/ngày × {days} ngày × {travelers}{" "}
                khách = <strong>{totalMeals} suất ăn</strong> toàn chuyến.
              </CardDescription>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Tổng ăn uống dự kiến</div>
              <div className="text-base font-extrabold text-teal-700 dark:text-teal-400 price-num">
                {formatVND(effectiveStepRange.min)} –{" "}
                {formatVND(effectiveStepRange.max)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Meals per day adjuster */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="font-bold text-sm">
                Số bữa ăn tính phí mỗi ngày
              </div>
              <div className="text-xs text-slate-500">
                Nếu khách sạn đã có buffet sáng, bạn có thể giảm xuống 2 bữa/ngày.
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                size="icon"
                variant="outline"
                disabled={draft.mealsPerDay <= 1}
                onClick={() => onSetMealsPerDay(draft.mealsPerDay - 1)}
                aria-label="Giảm số bữa mỗi ngày"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-24 text-center font-bold text-sm price-num">
                {draft.mealsPerDay} bữa / ngày
              </span>
              <Button
                size="icon"
                variant="outline"
                disabled={draft.mealsPerDay >= 6}
                onClick={() => onSetMealsPerDay(draft.mealsPerDay + 1)}
                aria-label="Tăng số bữa mỗi ngày"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 3 Budget Tiers */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {BUDGET_LEVELS.map((level) => {
              const info = mealConfig.levels[level];
              const cityUnit = getMealUnitRange(level, draft.destinationId);
              const isSelected = draft.mealBudgetLevel === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSetBudgetLevel(level)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between",
                    isSelected
                      ? "border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-teal-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{info.label}</span>
                      {isSelected && <Badge variant="default">Đang chọn</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      {info.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-400">
                      Đơn giá tại {destination?.name}:
                    </div>
                    <div className="text-sm font-extrabold text-teal-700 dark:text-teal-400 price-num">
                      {formatVND(cityUnit.min)} – {formatVND(cityUnit.max)} / bữa
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Google Maps Ranked Restaurants */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Quán ngon đề xuất gần {anchorLabel ? `"${anchorLabel}"` : `trung tâm ${destination?.name}`}
              </CardTitle>
              <CardDescription>
                Xếp hạng theo điểm trung bình trọng số Bayesian (kết hợp điểm sao Google Maps và độ tin cậy số lượt đánh giá).
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Restaurant Filters */}
          <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex flex-wrap gap-1.5">
              {SESSION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onChangeRestaurantFilters({ session: opt.value })
                  }
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer",
                    restaurantFilters.session === opt.value
                      ? "border-teal-600 bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950"
                      : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <select
              value={restaurantFilters.cuisine}
              onChange={(e) =>
                onChangeRestaurantFilters({ cuisine: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold outline-none dark:border-slate-700 dark:bg-slate-900"
            >
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Tất cả món ăn" : c}
                </option>
              ))}
            </select>

            <select
              value={restaurantFilters.priceLevel}
              onChange={(e) =>
                onChangeRestaurantFilters({
                  priceLevel: e.target.value as MealBudgetLevel | "all",
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold outline-none dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="all">Mọi phân khúc giá</option>
              <option value="binh_dan">Bình dân ($)</option>
              <option value="trung_binh">Trung bình ($$)</option>
              <option value="cao_cap">Cao cấp ($$$)</option>
            </select>

            <button
              type="button"
              onClick={() =>
                onChangeRestaurantFilters({
                  minRating: restaurantFilters.minRating >= 4.6 ? 4.0 : 4.6,
                })
              }
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer ml-auto",
                restaurantFilters.minRating >= 4.6
                  ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                  : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              )}
            >
              ★ Từ {restaurantFilters.minRating.toFixed(1)}+
            </button>
          </div>

          {/* Restaurant Cards */}
          {loadingPlaces ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-36 w-full" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <UtensilsCrossed className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Chưa có quán nào khớp bộ lọc hiện tại.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() =>
                  onChangeRestaurantFilters({
                    session: "all",
                    cuisine: "all",
                    priceLevel: "all",
                    minRating: 4.0,
                  })
                }
              >
                Hiển thị tất cả quán ngon
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {places.map((place, index) => (
                <div
                  key={place.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3 hover:border-teal-300 transition-colors dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 mr-1.5">
                          #{index + 1}
                        </span>
                        <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {place.name}
                        </span>
                      </div>
                      <Badge variant="amber" className="shrink-0 price-num">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {place.rating.toFixed(1)} ({place.reviewCount.toLocaleString("vi-VN")})
                      </Badge>
                    </div>

                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {place.specialty}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Badge variant="secondary" className="text-[11px]">
                        {LEVEL_BADGE_LABELS[place.priceLevel]}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] price-num">
                        Điểm xếp hạng: {place.bayesianScore.toFixed(2)}
                      </Badge>
                      <span className="inline-flex items-center gap-1 price-num">
                        <MapPin className="h-3 w-3 text-teal-600" />
                        Cách {place.distanceKm} km
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs price-num">
                      <span className="text-slate-400">Ước tính: </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {formatCompactVND(place.estimatedPerPerson.min)} –{" "}
                        {formatCompactVND(place.estimatedPerPerson.max)}/người
                      </strong>
                    </div>

                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Mở Google Maps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
