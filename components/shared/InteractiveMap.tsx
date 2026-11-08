"use client";

import React, { useMemo, useState } from "react";
import { Compass, ExternalLink, MapPin, Navigation, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MapMarkerItem {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  rating?: number;
  lat: number;
  lng: number;
  selected?: boolean;
  externalUrl?: string;
  externalLabel?: string;
}

interface InteractiveMapProps {
  centerLat: number;
  centerLng: number;
  cityName: string;
  markers: MapMarkerItem[];
  onSelectMarker?: (id: string) => void;
  selectActionLabel?: string;
}

export function InteractiveMap({
  centerLat,
  centerLng,
  cityName,
  markers,
  onSelectMarker,
  selectActionLabel = "Chọn địa điểm này",
}: InteractiveMapProps) {
  const [activeId, setActiveId] = useState<string | null>(
    markers.find((m) => m.selected)?.id ?? markers[0]?.id ?? null
  );

  const normalized = useMemo(() => {
    if (markers.length === 0) return [];
    const lats = [...markers.map((m) => m.lat), centerLat];
    const lngs = [...markers.map((m) => m.lng), centerLng];
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = Math.max(0.015, maxLat - minLat);
    const lngSpan = Math.max(0.015, maxLng - minLng);

    return markers.map((m) => {
      // Pad 14%..86% so edge pins never clip
      const xPct = 14 + ((m.lng - minLng) / lngSpan) * 72;
      const yPct = 84 - ((m.lat - minLat) / latSpan) * 68;
      return {
        ...m,
        xPct,
        yPct,
      };
    });
  }, [markers, centerLat, centerLng]);

  const activeMarker =
    normalized.find((m) => m.id === activeId) ?? normalized[0] ?? null;

  return (
    <div className="rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] overflow-hidden dark:border-[#1e2d45] dark:bg-[#101929]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#e7dfd3] bg-white/90 dark:border-[#1e2d45] dark:bg-[#101929]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Navigation
            className="h-3.5 w-3.5 text-[#0f766e] dark:text-teal-400"
            aria-hidden="true"
          />
          <span>
            Bản đồ tọa độ {cityName} ({markers.length} điểm đánh dấu)
          </span>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0f766e] hover:underline dark:text-teal-400"
        >
          Mở bản đồ rộng{" "}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Stylized Interactive Coordinate Map */}
        <div className="relative h-80 sm:h-96 lg:col-span-2 overflow-hidden bg-gradient-to-br from-emerald-50/90 via-[#faf7f2] to-teal-100/70 dark:from-[#080e1a] dark:via-[#101929] dark:to-teal-950/40 select-none">
          {/* Topographic SVG Grid & Roads */}
          <svg
            className="absolute inset-0 h-full w-full opacity-50 dark:opacity-25 pointer-events-none"
            viewBox="0 0 600 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="map-grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  className="text-[#d6cbb9] dark:text-slate-700"
                />
              </pattern>
            </defs>
            <rect width="600" height="400" fill="url(#map-grid)" />
            <path
              d="M -20 310 Q 150 250 280 280 T 620 190"
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              className="text-sky-200/80 dark:text-sky-900/50"
            />
            <path
              d="M 60 -10 Q 210 140 310 200 T 550 410"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-amber-200/90 dark:text-slate-700"
            />
            <path
              d="M -10 130 Q 220 160 390 120 T 610 90"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white/90 dark:text-slate-700"
            />
          </svg>

          {/* City Center Pulse */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
            aria-hidden="true"
          >
            <span className="h-3 w-3 rounded-full bg-slate-500/50 ring-8 ring-slate-400/15" />
            <span className="mt-1 rounded-md bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-[#101929]/90 dark:text-slate-300">
              Trung tâm {cityName}
            </span>
          </div>

          {/* Compass */}
          <div
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#e7dfd3] bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs backdrop-blur-xs dark:border-[#1e2d45] dark:bg-[#101929]/90 dark:text-slate-300"
            aria-hidden="true"
          >
            <Compass className="h-3.5 w-3.5 text-[#0f766e] dark:text-teal-400" />{" "}
            Bắc
          </div>

          {/* Interactive Price Pins */}
          {normalized.map((pin) => {
            const isActive = activeMarker?.id === pin.id;
            return (
              <button
                key={pin.id}
                type="button"
                aria-pressed={isActive}
                aria-label={`${pin.title} - ${pin.priceLabel}`}
                onClick={() => setActiveId(pin.id)}
                style={{ left: `${pin.xPct}%`, top: `${pin.yPct}%` }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-full",
                  isActive ? "z-30" : "z-10 hover:z-20"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full min-h-[34px] px-3 py-1 text-xs font-bold shadow-md border whitespace-nowrap price-num",
                    pin.selected
                      ? "bg-[#c2410c] text-white border-[#9a3412] ring-2 ring-orange-500/30 dark:bg-orange-500 dark:text-slate-950"
                      : isActive
                      ? "bg-[#0f766e] text-white border-[#115e59] ring-2 ring-teal-500/35 dark:bg-teal-400 dark:text-slate-950"
                      : "bg-white text-slate-800 border-[#d6cbb9] hover:border-[#0f766e] dark:bg-[#101929] dark:text-slate-100 dark:border-[#1e2d45]"
                  )}
                >
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{pin.priceLabel}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pin Inspector */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#101929] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#e7dfd3] dark:border-[#1e2d45]">
          {activeMarker ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant={activeMarker.selected ? "amber" : "default"}>
                  {activeMarker.selected ? "Đang chọn" : "Điểm trên bản đồ"}
                </Badge>
                {activeMarker.rating && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300 price-num">
                    <Star
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-500"
                      aria-hidden="true"
                    />
                    {activeMarker.rating.toFixed(1)}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
                  {activeMarker.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeMarker.subtitle}
                </p>
              </div>

              <div className="rounded-xl border border-[#e7dfd3] bg-[#faf7f2] dark:border-[#1e2d45] dark:bg-[#172338] p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Mức giá tham khảo
                </div>
                <div className="text-lg font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                  {activeMarker.priceLabel}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  GPS: {activeMarker.lat.toFixed(4)}, {activeMarker.lng.toFixed(4)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Chưa có địa điểm nào phù hợp bộ lọc.
            </p>
          )}

          {activeMarker && (
            <div className="mt-4 flex flex-col gap-2">
              {onSelectMarker && (
                <Button
                  size="sm"
                  variant={activeMarker.selected ? "secondary" : "default"}
                  onClick={() => onSelectMarker(activeMarker.id)}
                >
                  {activeMarker.selected ? "Bỏ chọn điểm này" : selectActionLabel}
                </Button>
              )}
              {activeMarker.externalUrl && (
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={activeMarker.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {activeMarker.externalLabel ?? "Mở Google Maps"}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
