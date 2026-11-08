"use client";

import React from "react";
import {
  ArrowRight,
  Edit3,
  Flame,
  ReceiptText,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCompactVND, formatVND } from "@/lib/format";
import { TripDraft, TripPricingSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { key: "intercity", label: "Đi lại liên tỉnh", step: 3, color: "#0f766e" },
  { key: "lodging", label: "Lưu trú", step: 4, color: "#0284c7" },
  { key: "food", label: "Ăn uống", step: 5, color: "#10b981" },
  { key: "localTransport", label: "Di chuyển tại chỗ", step: 6, color: "#6366f1" },
  { key: "holidaySurcharge", label: "Phụ phí ngày lễ", step: 2, color: "#ea580c" },
  { key: "contingency", label: "Dự phòng (10%)", step: 7, color: "#64748b" },
] as const;

interface LiveBudgetSidebarProps {
  currentStep: number;
  draft: TripDraft;
  pricing: TripPricingSummary;
  canProceed: boolean;
  onJumpToStep: (step: number) => void;
  onToggleContingency: (include: boolean) => void;
}

export function LiveBudgetSidebar({
  currentStep,
  draft,
  pricing,
  canProceed,
  onJumpToStep,
  onToggleContingency,
}: LiveBudgetSidebarProps) {
  const totalMid = Math.max(1, (pricing.total.min + pricing.total.max) / 2);

  return (
    <aside
      aria-label="Bảng tạm tính chi phí trực tiếp"
      className="no-print hidden lg:block lg:col-span-4"
    >
      <div className="sticky top-24 space-y-4">
        <Card className="overflow-hidden border-[#dfd5c5] dark:border-[#243552]">
          {/* Receipt Header */}
          <div className="bg-gradient-to-br from-[#0f766e] to-[#115e59] p-5 text-white">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-teal-100">
              <span className="inline-flex items-center gap-1.5">
                <ReceiptText className="h-4 w-4" aria-hidden="true" />
                Bảng tạm tính trực tiếp
              </span>
              <span className="price-num">
                {pricing.days}N{pricing.nights}Đ
              </span>
            </div>

            <div className="mt-3">
              <div className="text-[11px] text-teal-100/90">
                Khoảng tổng ngân sách toàn chuyến:
              </div>
              <div className="mt-0.5 text-xl xl:text-2xl font-extrabold tracking-tight price-num">
                {formatCompactVND(pricing.total.min)} –{" "}
                {formatCompactVND(pricing.total.max)}
              </div>
              <div className="text-xs text-teal-100/90 price-num mt-0.5">
                ({formatVND(pricing.total.min)} – {formatVND(pricing.total.max)})
              </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 pt-3 border-t border-white/15 text-xs">
              <div className="rounded-xl bg-white/10 px-2.5 py-2">
                <div className="text-teal-100/80 flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden="true" /> Mỗi người
                </div>
                <div className="font-bold mt-0.5 price-num">
                  {formatCompactVND(pricing.perPerson.min)} –{" "}
                  {formatCompactVND(pricing.perPerson.max)}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 px-2.5 py-2">
                <div className="text-teal-100/80 flex items-center gap-1">
                  <Wallet className="h-3 w-3" aria-hidden="true" /> Mỗi ngày
                </div>
                <div className="font-bold mt-0.5 price-num">
                  {formatCompactVND(pricing.perDay.min)} –{" "}
                  {formatCompactVND(pricing.perDay.max)}
                </div>
              </div>
            </div>
          </div>

          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cơ cấu 6 hạng mục chi phí
            </CardTitle>

            {/* Live 100% Proportional Stacked Bar */}
            <div
              className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-[#f3ede3] dark:bg-slate-800"
              role="img"
              aria-label="Thanh tỷ trọng ngân sách theo 6 hạng mục"
            >
              {SIDEBAR_ITEMS.map((item) => {
                const range = pricing.categories[item.key];
                const mid = (range.min + range.max) / 2;
                const pct = (mid / totalMid) * 100;
                if (pct <= 0.5) return null;
                return (
                  <div
                    key={item.key}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                    }}
                    title={`${item.label}: ~${Math.round(pct)}%`}
                    className="h-full transition-all duration-300"
                  />
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-5 space-y-2.5">
            <div className="divide-y divide-[#efe8dd] dark:divide-slate-800/80">
              {SIDEBAR_ITEMS.map((item) => {
                const range = pricing.categories[item.key];
                const isActiveStep = currentStep === item.step;
                const isZero = range.min === 0 && range.max === 0;

                return (
                  <div
                    key={item.key}
                    className={cn(
                      "py-2.5 flex items-center justify-between gap-2 text-xs transition-colors",
                      isActiveStep && "font-semibold"
                    )}
                  >
                    <button
                      type="button"
                      disabled={!canProceed && item.step > 1}
                      onClick={() => onJumpToStep(item.step)}
                      className="flex items-center gap-2 text-left hover:text-[#0f766e] dark:hover:text-teal-300 cursor-pointer disabled:opacity-50 min-w-0 group"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate text-slate-700 dark:text-slate-200 group-hover:underline">
                        {item.label}
                      </span>
                      <Edit3
                        className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400 shrink-0 transition-opacity"
                        aria-hidden="true"
                      />
                    </button>

                    <span
                      className={cn(
                        "price-num font-bold shrink-0",
                        isZero
                          ? "text-slate-400 font-medium"
                          : item.key === "holidaySurcharge"
                          ? "text-[#c2410c] dark:text-orange-300"
                          : "text-slate-900 dark:text-slate-100"
                      )}
                    >
                      {isZero
                        ? "0 ₫"
                        : range.min === range.max
                        ? formatCompactVND(range.min)
                        : `${formatCompactVND(range.min)} – ${formatCompactVND(
                            range.max
                          )}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Contingency Buffer Switch */}
            <label className="flex items-center justify-between gap-2 rounded-2xl bg-[#faf7f2] border border-[#e7dfd3] px-3.5 py-2.5 text-xs font-semibold cursor-pointer dark:bg-[#172338] dark:border-[#243552]">
              <span className="text-slate-700 dark:text-slate-200">
                Cộng quỹ dự phòng 10%
              </span>
              <Switch
                checked={draft.includeContingency}
                onCheckedChange={onToggleContingency}
              />
            </label>

            {pricing.holidayAnalysis.hasOverlap && (
              <div className="rounded-2xl bg-orange-50/90 border border-orange-200 px-3.5 py-2.5 text-xs text-[#9a3412] dark:bg-orange-950/40 dark:border-orange-900/60 dark:text-orange-200 flex items-start gap-2">
                <Flame className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong>Đang áp dụng hệ số lễ/cao điểm.</strong>{" "}
                  <button
                    type="button"
                    onClick={() => onJumpToStep(2)}
                    className="underline font-bold cursor-pointer"
                  >
                    Xem gợi ý ngày rẻ hơn
                  </button>
                </div>
              </div>
            )}

            <Button
              variant="terracotta"
              className="w-full"
              disabled={!canProceed}
              onClick={() => onJumpToStep(7)}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Mở trang Chốt Ngân Sách</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
