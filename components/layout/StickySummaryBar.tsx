"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCompactVND, formatVND } from "@/lib/format";
import { TripPricingSummary } from "@/lib/types";

interface StickySummaryBarProps {
  currentStep: number;
  pricing: TripPricingSummary;
  canProceed: boolean;
  validationMessage?: string | null;
  onPrev: () => void;
  onNext: () => void;
  onJumpToStep: (step: number) => void;
}

export function StickySummaryBar({
  currentStep,
  pricing,
  canProceed,
  validationMessage,
  onPrev,
  onNext,
  onJumpToStep,
}: StickySummaryBarProps) {
  const [mobileBreakdownOpen, setMobileBreakdownOpen] = useState(false);

  const miniRows = [
    { label: "Đi lại liên tỉnh", range: pricing.categories.intercity, step: 3 },
    { label: "Lưu trú", range: pricing.categories.lodging, step: 4 },
    { label: "Ăn uống", range: pricing.categories.food, step: 5 },
    {
      label: "Di chuyển tại chỗ",
      range: pricing.categories.localTransport,
      step: 6,
    },
    {
      label: "Phụ phí ngày lễ",
      range: pricing.categories.holidaySurcharge,
      step: 2,
    },
    {
      label: "Dự phòng (10%)",
      range: pricing.categories.contingency,
      step: 7,
    },
  ];

  return (
    <div className="no-print fixed bottom-0 inset-x-0 z-40 border-t border-[#dfd5c5] bg-white/95 backdrop-blur-md shadow-[0_-10px_30px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)] dark:border-[#1e2d45] dark:bg-[#080e1a]/95">
      {/* Expandable Mobile Live Breakdown Drawer */}
      {mobileBreakdownOpen && (
        <div className="lg:hidden border-b border-[#e7dfd3] bg-[#faf7f2] px-4 py-3.5 dark:border-[#1e2d45] dark:bg-[#101929]">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <span>Chi tiết 6 hạng mục tạm tính</span>
            <button
              type="button"
              onClick={() => setMobileBreakdownOpen(false)}
              className="text-[#0f766e] dark:text-teal-400 cursor-pointer"
            >
              Đóng
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            {miniRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onJumpToStep(r.step);
                    setMobileBreakdownOpen(false);
                  }}
                  className="text-slate-700 underline decoration-dotted dark:text-slate-300 cursor-pointer"
                >
                  {r.label}
                </button>
                <span className="font-bold price-num text-slate-900 dark:text-white">
                  {r.range.min === 0 && r.range.max === 0
                    ? "0 ₫"
                    : `${formatCompactVND(r.range.min)} – ${formatCompactVND(
                        r.range.max
                      )}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Live Min - Max Summary */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Tổng chi phí tạm tính
              </span>
              {pricing.holidayAnalysis.hasOverlap && (
                <Badge variant="amber" className="text-[10px] py-0 px-2">
                  <Flame className="h-3 w-3" aria-hidden="true" />+
                  {pricing.holidayAnalysis.averageSurgePercent.min}%–
                  {pricing.holidayAnalysis.averageSurgePercent.max}% lễ
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 mt-0.5">
              <span className="font-heading text-base sm:text-xl font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                <span className="sm:hidden">
                  {formatCompactVND(pricing.total.min)} –{" "}
                  {formatCompactVND(pricing.total.max)}
                </span>
                <span className="hidden sm:inline">
                  {formatVND(pricing.total.min)} – {formatVND(pricing.total.max)}
                </span>
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 price-num">
                (~{formatCompactVND(pricing.perPerson.min)}–
                {formatCompactVND(pricing.perPerson.max)}/người)
              </span>
            </div>

            {validationMessage && (
              <p
                role="alert"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5"
              >
                {validationMessage}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-expanded={mobileBreakdownOpen}
            onClick={() => setMobileBreakdownOpen((o) => !o)}
            className="lg:hidden inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#e7dfd3] bg-[#faf7f2] px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-[#1e2d45] dark:bg-[#172338] dark:text-slate-200 cursor-pointer shrink-0"
          >
            <span>Chi tiết</span>
            {mobileBreakdownOpen ? (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={onPrev}
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Quay lại</span>
            </Button>
          )}

          {currentStep < 7 ? (
            <Button
              variant={currentStep === 6 ? "terracotta" : "default"}
              onClick={onNext}
              disabled={!canProceed}
              className="flex-1 sm:flex-none min-w-[164px]"
            >
              <span>
                {currentStep === 6
                  ? "Xem tổng kết & chốt kèo"
                  : "Bước tiếp theo"}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="terracotta"
              onClick={() => window.print()}
              className="flex-1 sm:flex-none"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Xuất PDF báo giá</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
