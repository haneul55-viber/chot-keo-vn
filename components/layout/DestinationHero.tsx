"use client";

import React from "react";
import {
  ArrowRight,
  BedDouble,
  Calendar,
  Flame,
  MapPin,
  Users,
} from "lucide-react";
import { getDestinationById } from "@/data/destinations";
import { formatDateVN } from "@/lib/format";
import { TripDraft, TripPricingSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const DESTINATION_THEMES: Record<
  string,
  { gradient: string; badge: string }
> = {
  "da-lat": {
    gradient:
      "from-[#0f514c] via-[#136f63] to-[#2c4a3e] dark:from-[#0a2e2b] dark:via-[#0f3d38] dark:to-[#132924]",
    badge: "Cao nguyên sương mù • Lâm Đồng",
  },
  "da-nang": {
    gradient:
      "from-[#0b4f6c] via-[#0f766e] to-[#b45309] dark:from-[#082f49] dark:via-[#114b47] dark:to-[#5c2d0c]",
    badge: "Thành phố biển & Cầu Rồng • Miền Trung",
  },
  "nha-trang": {
    gradient:
      "from-[#0369a1] via-[#0d9488] to-[#0f766e] dark:from-[#082f49] dark:via-[#0f4c5c] dark:to-[#0d3b38]",
    badge: "Vịnh biển ngọc bích • Khánh Hòa",
  },
  "phu-quoc": {
    gradient:
      "from-[#9a3412] via-[#b45309] to-[#0f766e] dark:from-[#431407] dark:via-[#5c2b0e] dark:to-[#0f3f3c]",
    badge: "Đảo Ngọc hoàng hôn • Kiên Giang",
  },
  "ha-noi": {
    gradient:
      "from-[#7c2d12] via-[#9a3412] to-[#115e59] dark:from-[#3b1508] dark:via-[#4a1d0d] dark:to-[#0d3b38]",
    badge: "Thủ đô ngàn năm văn hiến • Miền Bắc",
  },
};

interface DestinationHeroProps {
  draft: TripDraft;
  pricing: TripPricingSummary;
  onJumpToBasics: () => void;
  onJumpToHolidays: () => void;
}

export function DestinationHero({
  draft,
  pricing,
  onJumpToBasics,
  onJumpToHolidays,
}: DestinationHeroProps) {
  const origin = getDestinationById(draft.originId);
  const destination = getDestinationById(draft.destinationId);

  const theme = DESTINATION_THEMES[draft.destinationId] ?? {
    gradient:
      "from-[#0f766e] via-[#115e59] to-[#1e3a5f] dark:from-[#0b2e2b] dark:via-[#0f3b38] dark:to-[#0f1f36]",
    badge: `${destination?.province ?? "Việt Nam"} • ${
      destination?.region ?? "Nội địa"
    }`,
  };

  return (
    <section
      aria-label="Tóm tắt hành trình đang lập"
      className="no-print mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-gradient-to-r px-5 py-5 sm:px-8 sm:py-6 text-white shadow-bento",
          theme.gradient
        )}
      >
        {/* Subtle Editorial Topographic / Horizon Vector Art */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-full w-2/3 opacity-20"
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 L120,120 L210,155 L340,70 L460,135 L600,45 L600,200 Z"
            fill="currentColor"
          />
          <circle cx="485" cy="52" r="24" fill="currentColor" opacity="0.55" />
        </svg>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-xs">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{theme.badge}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {origin?.name ?? "Điểm đi"}{" "}
                <ArrowRight
                  className="inline-block h-5 w-5 mx-0.5 text-amber-300"
                  aria-hidden="true"
                />{" "}
                {destination?.name ?? "Điểm đến"}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-white/85 max-w-2xl">
              {destination?.tagline ??
                "Dự toán chi tiết vé liên tỉnh, lưu trú, ẩm thực bản địa và di chuyển nội đô."}
            </p>
          </div>

          {/* Interactive Live Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onJumpToBasics}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-colors cursor-pointer price-num"
              title="Nhấn để đổi ngày khởi hành"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-200" aria-hidden="true" />
              <span>
                {formatDateVN(draft.startDate)} – {formatDateVN(draft.endDate)}
              </span>
              <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-bold">
                {pricing.days}N{pricing.nights}Đ
              </span>
            </button>

            <button
              type="button"
              onClick={onJumpToBasics}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-colors cursor-pointer price-num"
              title="Nhấn để chỉnh số khách và số phòng"
            >
              <Users className="h-3.5 w-3.5 text-teal-200" aria-hidden="true" />
              <span>{pricing.totalTravelers} khách</span>
              <span aria-hidden="true">•</span>
              <BedDouble className="h-3.5 w-3.5 text-teal-200" aria-hidden="true" />
              <span>{draft.rooms} phòng</span>
            </button>

            {pricing.holidayAnalysis.hasOverlap && (
              <button
                type="button"
                onClick={onJumpToHolidays}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] border border-orange-300/40 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer price-num"
                title="Xem chi tiết phụ phí lễ Tết & gợi ý ngày rẻ hơn"
              >
                <Flame className="h-3.5 w-3.5 text-amber-200" aria-hidden="true" />
                <span>
                  Cao điểm +{pricing.holidayAnalysis.averageSurgePercent.min}%–
                  {pricing.holidayAnalysis.averageSurgePercent.max}%
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
