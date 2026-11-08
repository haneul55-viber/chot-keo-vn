"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Flame,
  Lightbulb,
  Sparkles,
  TrendingDown,
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
import { getAllHolidays } from "@/lib/holidays";
import { formatCompactVND, formatDateVN, formatVND } from "@/lib/format";
import {
  DateAlternative,
  HolidayAnalysis,
  HolidayType,
  TripDraft,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  public_holiday: "Nghỉ lễ Quốc gia",
  school_break: "Mùa nghỉ hè",
  peak_season: "Mùa cao điểm",
};

interface Step2SpecialDatesProps {
  draft: TripDraft;
  analysis: HolidayAnalysis;
  alternatives: DateAlternative[];
  onApplyDates: (startDate: string, endDate: string) => void;
}

export function Step2SpecialDates({
  draft,
  analysis,
  alternatives,
  onApplyDates,
}: Step2SpecialDatesProps) {
  const [showAlternatives, setShowAlternatives] = useState<boolean>(
    analysis.hasOverlap
  );
  const allHolidays = getAllHolidays();

  const multToPct = (m: number) => `+${Math.round((m - 1) * 100)}%`;

  return (
    <div className="space-y-6">
      {analysis.hasOverlap ? (
        <Card className="border-orange-300/90 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/60 dark:border-orange-800/80 dark:from-orange-950/35 dark:via-[#101929] dark:to-[#101929]">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="amber" className="px-3 py-1 text-xs">
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                Ngày đặc biệt / Cao điểm du lịch
              </Badge>
              <span className="text-xs font-bold text-[#9a3412] dark:text-amber-300 price-num">
                Biên độ tăng dự kiến: +{analysis.averageSurgePercent.min}% đến +
                {analysis.averageSurgePercent.max}%
              </span>
            </div>

            <CardTitle className="text-xl mt-2 text-slate-900 dark:text-white">
              Lịch trình ({formatDateVN(draft.startDate)} –{" "}
              {formatDateVN(draft.endDate)}) trùng dịp cao điểm
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Hệ số tăng giá tự động được áp dụng vào vé liên tỉnh, phòng lưu trú và dịch vụ tại chỗ ở các bước sau.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Overlapped Holidays Detail */}
            <div className="space-y-3">
              {analysis.overlappingHolidays.map(
                ({ holiday, overlapDates, overlapDays }) => (
                  <div
                    key={holiday.id}
                    className="rounded-2xl border border-orange-200/90 bg-white/95 p-4 dark:border-orange-900/70 dark:bg-[#172338]/85"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className="h-4 w-4 text-[#c2410c] dark:text-orange-400 shrink-0"
                          aria-hidden="true"
                        />
                        <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {holiday.name}
                        </h4>
                      </div>
                      <Badge variant="amber">
                        {HOLIDAY_TYPE_LABELS[holiday.type]} • Trùng {overlapDays}{" "}
                        ngày
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {holiday.description}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-1.5 items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Các ngày trùng:
                      </span>
                      {overlapDates.map((d) => (
                        <span
                          key={d}
                          className="rounded-md bg-orange-100/90 px-2 py-0.5 font-mono text-[11px] font-bold text-[#9a3412] dark:bg-orange-950 dark:text-orange-200"
                        >
                          {formatDateVN(d)}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Active Multipliers Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#e7dfd3] bg-white p-3.5 dark:border-[#1e2d45] dark:bg-[#172338]">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Vé máy bay / Xe khách
                </div>
                <div className="text-base font-extrabold text-[#c2410c] dark:text-orange-300 mt-0.5 price-num">
                  {multToPct(analysis.effectiveMultipliers.transport.min)} –{" "}
                  {multToPct(analysis.effectiveMultipliers.transport.max)}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 price-num">
                  Hệ số x{analysis.effectiveMultipliers.transport.min.toFixed(2)}–x
                  {analysis.effectiveMultipliers.transport.max.toFixed(2)}
                </div>
              </div>

              <div className="rounded-2xl border border-[#e7dfd3] bg-white p-3.5 dark:border-[#1e2d45] dark:bg-[#172338]">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Khách sạn / Lưu trú
                </div>
                <div className="text-base font-extrabold text-[#c2410c] dark:text-orange-300 mt-0.5 price-num">
                  {multToPct(analysis.effectiveMultipliers.lodging.min)} –{" "}
                  {multToPct(analysis.effectiveMultipliers.lodging.max)}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 price-num">
                  Hệ số x{analysis.effectiveMultipliers.lodging.min.toFixed(2)}–x
                  {analysis.effectiveMultipliers.lodging.max.toFixed(2)}
                </div>
              </div>

              <div className="rounded-2xl border border-[#e7dfd3] bg-white p-3.5 dark:border-[#1e2d45] dark:bg-[#172338]">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Ăn uống & Dịch vụ tại chỗ
                </div>
                <div className="text-base font-extrabold text-[#c2410c] dark:text-orange-300 mt-0.5 price-num">
                  {multToPct(analysis.effectiveMultipliers.localServices.min)} –{" "}
                  {multToPct(analysis.effectiveMultipliers.localServices.max)}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 price-num">
                  Hệ số x
                  {analysis.effectiveMultipliers.localServices.min.toFixed(2)}–x
                  {analysis.effectiveMultipliers.localServices.max.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Smart Tip + One-Click Cheaper Dates Toggle */}
            {analysis.tip && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-100/85 border border-amber-300/90 p-4 dark:bg-amber-950/60 dark:border-amber-800">
                <div className="flex items-start gap-2.5">
                  <Lightbulb
                    className="h-5 w-5 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
                    <strong>Mẹo tối ưu ngân sách:</strong> {analysis.tip}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="terracotta"
                  size="sm"
                  aria-expanded={showAlternatives}
                  onClick={() => setShowAlternatives((prev) => !prev)}
                  className="shrink-0"
                >
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {showAlternatives
                      ? "Ẩn bảng so sánh ±3 ngày"
                      : "Gợi ý ngày rẻ hơn (±3 ngày)"}
                  </span>
                </Button>
              </div>
            )}

            {/* ±3 Days Alternatives Grid */}
            {showAlternatives && (
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  So sánh phương án dời lịch ±3 ngày lân cận:
                </h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {alternatives.map((alt) => {
                    const isCheaper = alt.savingsAmount > 50000;
                    return (
                      <div
                        key={alt.offsetDays}
                        className={cn(
                          "rounded-2xl border p-4 flex flex-col justify-between transition-colors",
                          isCheaper
                            ? "border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/35"
                            : "border-[#e7dfd3] bg-white dark:border-[#1e2d45] dark:bg-[#172338]"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {alt.offsetDays > 0
                                ? `Lùi +${alt.offsetDays} ngày`
                                : `Sớm ${alt.offsetDays} ngày`}
                            </span>
                            {isCheaper ? (
                              <Badge variant="emerald">
                                Tiết kiệm ~{alt.savingsPercent}%
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Tương đương</Badge>
                            )}
                          </div>

                          <div className="font-bold text-sm mt-1.5 text-slate-900 dark:text-white price-num">
                            {formatDateVN(alt.startDate)}{" "}
                            <ArrowRight
                              className="inline h-3 w-3 mx-0.5"
                              aria-hidden="true"
                            />{" "}
                            {formatDateVN(alt.endDate)}
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 price-num">
                            Tổng dự kiến:{" "}
                            <strong>
                              {formatCompactVND(alt.estimatedTotal.min)} –{" "}
                              {formatCompactVND(alt.estimatedTotal.max)}
                            </strong>
                          </div>

                          {isCheaper && (
                            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 price-num">
                              Giảm ~{formatVND(alt.savingsAmount)}
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant={isCheaper ? "default" : "outline"}
                          onClick={() =>
                            onApplyDates(alt.startDate, alt.endDate)
                          }
                          className="mt-3 w-full"
                        >
                          Áp dụng lịch này
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-200/90 bg-gradient-to-br from-emerald-50/75 via-white to-[#faf7f2] dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-[#101929] dark:to-[#101929]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="emerald" className="px-3 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Lịch trình ngày thường — Không phụ phí lễ Tết
              </Badge>
            </div>
            <CardTitle className="text-xl mt-2">
              Tuyệt vời! Chuyến đi ({formatDateVN(draft.startDate)} –{" "}
              {formatDateVN(draft.endDate)}) nằm ngoài các đợt cao điểm
            </CardTitle>
            <CardDescription>
              Bạn được hưởng mức giá cơ bản ổn định (hệ số x1.00) cho cả vé di chuyển, khách sạn và dịch vụ ăn uống tại địa phương.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-white/95 p-4 dark:border-emerald-900/50 dark:bg-[#172338]">
              <div className="flex items-center gap-3">
                <Sparkles
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Muốn kiểm tra các ngày lân cận ±3 ngày để xem thêm phương án?
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-expanded={showAlternatives}
                onClick={() => setShowAlternatives((p) => !p)}
              >
                {showAlternatives ? "Ẩn phương án ±3 ngày" : "Xem lịch ±3 ngày"}
              </Button>
            </div>

            {showAlternatives && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {alternatives.map((alt) => (
                  <div
                    key={alt.offsetDays}
                    className="rounded-2xl border border-[#e7dfd3] bg-white p-3.5 dark:border-[#1e2d45] dark:bg-[#172338]"
                  >
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {alt.offsetDays > 0
                        ? `Lùi +${alt.offsetDays} ngày`
                        : `Sớm ${alt.offsetDays} ngày`}
                    </div>
                    <div className="font-bold text-sm mt-1 text-slate-900 dark:text-white price-num">
                      {formatDateVN(alt.startDate)}{" "}
                      <ArrowRight
                        className="inline h-3 w-3 mx-0.5"
                        aria-hidden="true"
                      />{" "}
                      {formatDateVN(alt.endDate)}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 price-num">
                      {formatCompactVND(alt.estimatedTotal.min)} –{" "}
                      {formatCompactVND(alt.estimatedTotal.max)}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyDates(alt.startDate, alt.endDate)}
                      className="mt-2.5 w-full"
                    >
                      Chọn ngày này
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reference Calendar of Vietnamese Holidays 2026-2027 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CalendarCheck2
              className="h-5 w-5 text-[#0f766e] dark:text-teal-400"
              aria-hidden="true"
            />
            <CardTitle className="text-base">
              Lịch tra cứu lễ Tết & cao điểm du lịch 2026 – 2027
            </CardTitle>
          </div>
          <CardDescription>
            Dữ liệu cấu hình từ tệp <code>/data/holidays.json</code> (dễ dàng tùy chỉnh thêm sự kiện địa phương).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {allHolidays.slice(0, 10).map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#e7dfd3] bg-[#faf7f2]/70 px-3.5 py-2.5 text-xs dark:border-[#1e2d45] dark:bg-[#172338]/60"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {h.name}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 price-num mt-0.5">
                    {formatDateVN(h.startDate)} – {formatDateVN(h.endDate)}
                  </div>
                </div>
                <Badge
                  variant={h.type === "public_holiday" ? "amber" : "secondary"}
                  className="shrink-0 price-num"
                >
                  x{h.priceMultiplier.transport.min}–
                  {h.priceMultiplier.transport.max}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
