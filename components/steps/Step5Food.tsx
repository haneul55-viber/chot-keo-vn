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
  binh_dan: "Bình dân • Tiết kiệm",
  trung_binh: "Trung bình • Phổ biến",
  cao_cap: "Cao cấp • Trải nghiệm",
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
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tổng ăn uống dự kiến
              </div>
              <div className="text-base font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                {formatVND(effectiveStepRange.min)} –{" "}
                {formatVND(effectiveStepRange.max)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Meals per day adjuster */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-4 dark:border-[#1e2d45] dark:bg-[#172338]/70">
            <div>
              <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                Số bữa ăn tính phí mỗi ngày
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
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
                <Minus className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span
                aria-live="polite"
                className="w-24 text-center font-bold text-sm text-slate-900 dark:text-white price-num"
              >
                {draft.mealsPerDay} bữa / ngày
              </span>
              <Button
                size="icon"
                variant="outline"
                disabled={draft.mealsPerDay >= 6}
                onClick={() => onSetMealsPerDay(draft.mealsPerDay + 1)}
                aria-label="Tăng số bữa mỗi ngày"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
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
                  aria-pressed={isSelected}
                  onClick={() => onSetBudgetLevel(level)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors cursor-pointer flex flex-col justify-between",
                    isSelected
                      ? "border-[#0f766e] bg-teal-50/55 ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-teal-950/30"
                      : "border-[#e7dfd3] bg-white hover:border-[#0f766e]/50 dark:border-[#1e2d45] dark:bg-[#101929]"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                        {info.label}
                      </span>
                      {isSelected && <Badge variant="default">Đang chọn</Badge>}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {info.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e7dfd3] dark:border-[#1e2d45]">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Đơn giá tại {destination?.name}:
                    </div>
                    <div className="text-sm font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
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
                <Award
                  className="h-5 w-5 text-[#c2410c] dark:text-orange-400"
                  aria-hidden="true"
                />
                Quán ngon đề xuất gần{" "}
                {anchorLabel ? `"${anchorLabel}"` : `trung tâm ${destination?.name}`}
              </CardTitle>
              <CardDescription>
                Xếp hạng theo điểm trung bình trọng số Bayesian (kết hợp điểm sao Google Maps và độ tin cậy số lượt đánh giá).
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Restaurant Filters */}
          <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-3.5 dark:border-[#1e2d45] dark:bg-[#172338]/70">
            <div className="flex flex-wrap gap-1.5">
              {SESSION_OPTIONS.map((opt) => {
                const active = restaurantFilters.session === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      onChangeRestaurantFilters({ session: opt.value })
                    }
                    className={cn(
                      "rounded-xl border min-h-[36px] px-3 py-1 text-xs font-bold transition-colors cursor-pointer",
                      active
                        ? "border-[#0f766e] bg-[#0f766e] text-white dark:bg-teal-400 dark:text-slate-950"
                        : "border-[#d6cbb9] bg-white text-slate-700 hover:border-[#0f766e]/50 dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-300"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <select
              aria-label="Lọc loại món ăn"
              value={restaurantFilters.cuisine}
              onChange={(e) =>
                onChangeRestaurantFilters({ cuisine: e.target.value })
              }
              className="min-h-[36px] rounded-xl border border-[#d6cbb9] bg-white px-3 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-[#0f766e] dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-200 cursor-pointer"
            >
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Tất cả món ăn" : c}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc phân khúc giá"
              value={restaurantFilters.priceLevel}
              onChange={(e) =>
                onChangeRestaurantFilters({
                  priceLevel: e.target.value as MealBudgetLevel | "all",
                })
              }
              className="min-h-[36px] rounded-xl border border-[#d6cbb9] bg-white px-3 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-[#0f766e] dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-200 cursor-pointer"
            >
              <option value="all">Mọi phân khúc giá</option>
              <option value="binh_dan">Bình dân (Tiết kiệm)</option>
              <option value="trung_binh">Trung bình (Phổ biến)</option>
              <option value="cao_cap">Cao cấp (Trải nghiệm)</option>
            </select>

            <button
              type="button"
              aria-pressed={restaurantFilters.minRating >= 4.6}
              onClick={() =>
                onChangeRestaurantFilters({
                  minRating: restaurantFilters.minRating >= 4.6 ? 4.0 : 4.6,
                })
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-xl border min-h-[36px] px-3 py-1 text-xs font-bold transition-colors cursor-pointer sm:ml-auto price-num",
                restaurantFilters.minRating >= 4.6
                  ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200"
                  : "border-[#d6cbb9] bg-white text-slate-700 dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-300"
              )}
            >
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-500"
                aria-hidden="true"
              />
              <span>Từ {restaurantFilters.minRating.toFixed(1)}+</span>
            </button>
          </div>

          {/* Restaurant Cards */}
          {loadingPlaces ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-36 w-full rounded-2xl" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d6cbb9] bg-[#faf7f2]/50 p-8 text-center dark:border-[#1e2d45] dark:bg-[#172338]/40">
              <UtensilsCrossed
                className="mx-auto h-8 w-8 text-slate-400 mb-2"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  className="rounded-2xl border border-[#e7dfd3] bg-white p-4 flex flex-col justify-between gap-3 hover:border-[#0f766e]/50 transition-colors dark:border-[#1e2d45] dark:bg-[#101929]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-extrabold text-[#0f766e] dark:text-teal-400 mr-1.5 price-num">
                          #{index + 1}
                        </span>
                        <span className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
                          {place.name}
                        </span>
                      </div>
                      <Badge variant="amber" className="shrink-0 price-num">
                        <Star
                          className="h-3 w-3 fill-amber-500 text-amber-500"
                          aria-hidden="true"
                        />
                        {place.rating.toFixed(1)} (
                        {place.reviewCount.toLocaleString("vi-VN")})
                      </Badge>
                    </div>

                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {place.specialty}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Badge variant="secondary" className="text-[11px]">
                        {LEVEL_BADGE_LABELS[place.priceLevel]}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] price-num">
                        Điểm xếp hạng: {place.bayesianScore.toFixed(2)}
                      </Badge>
                      <span className="inline-flex items-center gap-1 price-num">
                        <MapPin
                          className="h-3 w-3 text-[#0f766e] dark:text-teal-400"
                          aria-hidden="true"
                        />
                        Cách {place.distanceKm} km
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#e7dfd3] dark:border-[#1e2d45]">
                    <div className="text-xs price-num">
                      <span className="text-slate-500 dark:text-slate-400">
                        Ước tính:{" "}
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100">
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
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
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
