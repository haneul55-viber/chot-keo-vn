"use client";

import React from "react";
import {
  BedDouble,
  Bike,
  CalendarHeart,
  Check,
  MapPin,
  PieChart,
  Plane,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { id: 1, title: "Cơ bản", fullTitle: "Thông tin chuyến đi", icon: MapPin },
  { id: 2, title: "Ngày lễ", fullTitle: "Kiểm tra ngày đặc biệt", icon: CalendarHeart },
  { id: 3, title: "Liên tỉnh", fullTitle: "Di chuyển liên tỉnh", icon: Plane },
  { id: 4, title: "Lưu trú", fullTitle: "Khách sạn & Homestay", icon: BedDouble },
  { id: 5, title: "Ăn uống", fullTitle: "Ẩm thực & Quán ngon", icon: UtensilsCrossed },
  { id: 6, title: "Tại chỗ", fullTitle: "Di chuyển tại điểm đến", icon: Bike },
  { id: 7, title: "Tổng kết", fullTitle: "Chốt ngân sách", icon: PieChart },
] as const;

interface WizardStepperProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  hasHolidayOverlap: boolean;
  canProceedFromStep1: boolean;
}

export function WizardStepper({
  currentStep,
  onSelectStep,
  hasHolidayOverlap,
  canProceedFromStep1,
}: WizardStepperProps) {
  const progressPercent = Math.round(((currentStep - 1) / 6) * 100);

  return (
    <nav
      aria-label="Tiến độ 7 bước lập ngân sách"
      className="no-print mx-auto w-full max-w-7xl px-4 pt-4 pb-1 sm:px-6"
    >
      {/* Top Progress Bar */}
      <div className="mb-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Bước {currentStep}/7 —{" "}
          {WIZARD_STEPS.find((s) => s.id === currentStep)?.fullTitle}
        </span>
        <span className="price-num font-bold text-[#0f766e] dark:text-teal-400">
          Tiến độ {progressPercent}%
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#e7dfd3] dark:bg-[#172338] mb-3.5"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Phần trăm hoàn thành các bước"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0f766e] via-teal-500 to-[#c2410c] transition-all duration-300"
          style={{ width: `${Math.max(10, progressPercent)}%` }}
        />
      </div>

      {/* Clickable Stepper Pills (min-h 44px touch targets) */}
      <ol className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {WIZARD_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const disabled = !canProceedFromStep1 && step.id > 1;

          return (
            <li key={step.id} className="shrink-0 flex-1 min-w-[108px]">
              <button
                type="button"
                disabled={disabled}
                aria-current={isActive ? "step" : undefined}
                onClick={() => onSelectStep(step.id)}
                className={cn(
                  "w-full min-h-[44px] flex items-center justify-center sm:justify-start gap-2 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-40 disabled:cursor-not-allowed",
                  isActive
                    ? "border-[#0f766e] bg-[#0f766e] text-white shadow-xs dark:border-teal-400 dark:bg-teal-400 dark:text-slate-950"
                    : isCompleted
                    ? "border-teal-300/80 bg-white text-[#0f766e] hover:bg-teal-50/60 dark:border-teal-900 dark:bg-[#101929] dark:text-teal-300"
                    : "border-[#e7dfd3] bg-white text-slate-700 hover:bg-[#f3ede3]/60 dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-300 dark:hover:bg-[#172338]"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    isActive
                      ? "bg-white/20 text-current"
                      : isCompleted
                      ? "bg-[#0f766e] text-white dark:bg-teal-400 dark:text-slate-950"
                      : "bg-[#f3ede3] text-slate-700 dark:bg-[#172338] dark:text-slate-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="truncate">
                  {step.id}. {step.title}
                </span>
                {step.id === 2 && hasHolidayOverlap && !isActive && (
                  <span
                    title="Trùng dịp cao điểm / lễ Tết"
                    aria-label="Có trùng ngày đặc biệt"
                    className="ml-auto h-2.5 w-2.5 rounded-full bg-[#c2410c] shrink-0"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
