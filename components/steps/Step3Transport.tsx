"use client";

import React from "react";
import {
  Bus,
  Check,
  Clock,
  ExternalLink,
  Luggage,
  Plane,
  Scale,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompactVND, formatVND } from "@/lib/format";
import {
  BusOption,
  FlightOption,
  IntercityMode,
  PriceRange,
  TripDraft,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface Step3TransportProps {
  draft: TripDraft;
  flights: FlightOption[];
  buses: BusOption[];
  loading: boolean;
  holidayTransportMultiplier: PriceRange;
  effectiveStepRange: PriceRange;
  onSetMode: (mode: IntercityMode) => void;
  onSelectFlight: (id: string | null) => void;
  onSelectBus: (id: string | null) => void;
  onKeepRange: () => void;
}

const AIRLINE_COLORS: Record<string, string> = {
  VN: "bg-sky-700 text-white",
  VJ: "bg-rose-600 text-white",
  QH: "bg-emerald-700 text-white",
  VU: "bg-amber-500 text-slate-950",
};

export function Step3Transport({
  draft,
  flights,
  buses,
  loading,
  holidayTransportMultiplier,
  effectiveStepRange,
  onSetMode,
  onSelectFlight,
  onSelectBus,
  onKeepRange,
}: Step3TransportProps) {
  const travelers = Math.max(1, draft.adults + draft.children);
  const avgMult =
    (holidayTransportMultiplier.min + holidayTransportMultiplier.max) / 2;
  const hasHolidayBoost = holidayTransportMultiplier.max > 1.01;

  const flightTotalMin =
    flights.length > 0
      ? Math.round(
          Math.min(...flights.map((f) => f.baseRoundtripPerPerson)) *
            travelers *
            holidayTransportMultiplier.min
        )
      : 0;
  const flightTotalMax =
    flights.length > 0
      ? Math.round(
          Math.max(...flights.map((f) => f.baseRoundtripPerPerson)) *
            travelers *
            holidayTransportMultiplier.max
        )
      : 0;

  const busTotalMin =
    buses.length > 0
      ? Math.round(
          Math.min(...buses.map((b) => b.baseRoundtripPerPerson)) *
            travelers *
            holidayTransportMultiplier.min
        )
      : 0;
  const busTotalMax =
    buses.length > 0
      ? Math.round(
          Math.max(...buses.map((b) => b.baseRoundtripPerPerson)) *
            travelers *
            holidayTransportMultiplier.max
        )
      : 0;

  const avgFlightMins =
    flights.length > 0 ? flights[0].durationMinutes : 0;
  const avgBusHours = buses.length > 0 ? buses[0].durationHours : 0;

  return (
    <div className="space-y-6">
      {/* Mode Comparison Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl">
                Bước 3: Phương tiện di chuyển liên tỉnh (Khứ hồi)
              </CardTitle>
              <CardDescription>
                Giá đã tính khứ hồi cho <strong>{travelers} hành khách</strong>
                {hasHolidayBoost
                  ? ` (kèm hệ số cao điểm x${holidayTransportMultiplier.min.toFixed(
                      2
                    )}–x${holidayTransportMultiplier.max.toFixed(2)})`
                  : " (ngày thường không phụ phí)"}
                .
              </CardDescription>
            </div>

            <div className="text-right">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Chi phí mục này
              </div>
              <div className="text-base font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                {formatVND(effectiveStepRange.min)}
                {effectiveStepRange.max !== effectiveStepRange.min &&
                  ` – ${formatVND(effectiveStepRange.max)}`}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Cost vs Travel Time Side-by-Side Comparison */}
          <div className="rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-4 dark:border-[#1e2d45] dark:bg-[#172338]/70">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
              <Scale
                className="h-4 w-4 text-[#0f766e] dark:text-teal-400"
                aria-hidden="true"
              />
              <span>So sánh Chi phí vs. Thời gian di chuyển</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={draft.intercityMode === "flight"}
                onClick={() => onSetMode("flight")}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors cursor-pointer",
                  draft.intercityMode === "flight"
                    ? "border-[#0f766e] bg-white ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-[#101929]"
                    : "border-[#e7dfd3] bg-white/80 hover:border-[#0f766e]/50 hover:bg-white dark:border-[#1e2d45] dark:bg-[#101929]/60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-heading font-bold text-sm text-slate-900 dark:text-white">
                    <Plane
                      className="h-4 w-4 text-[#0f766e] dark:text-teal-400"
                      aria-hidden="true"
                    />{" "}
                    Máy bay khứ hồi
                  </span>
                  {flights.length > 0 ? (
                    <Badge variant="default">
                      ~{avgFlightMins} phút / chiều
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Không có đường bay thẳng</Badge>
                  )}
                </div>
                <div className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white price-num">
                  {flights.length > 0
                    ? `${formatCompactVND(flightTotalMin)} – ${formatCompactVND(
                        flightTotalMax
                      )}`
                    : "Chuyển dùng đường bộ"}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Nhanh nhất, giữ sức khỏe cho lịch trình ngắn ngày.
                </p>
              </button>

              <button
                type="button"
                aria-pressed={draft.intercityMode === "bus"}
                onClick={() => onSetMode("bus")}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors cursor-pointer",
                  draft.intercityMode === "bus"
                    ? "border-[#0f766e] bg-white ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-[#101929]"
                    : "border-[#e7dfd3] bg-white/80 hover:border-[#0f766e]/50 hover:bg-white dark:border-[#1e2d45] dark:bg-[#101929]/60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-heading font-bold text-sm text-slate-900 dark:text-white">
                    <Bus
                      className="h-4 w-4 text-[#c2410c] dark:text-orange-400"
                      aria-hidden="true"
                    />{" "}
                    Xe giường nằm / Cabin
                  </span>
                  {buses.length > 0 && (
                    <Badge variant="amber">~{avgBusHours} giờ / chiều</Badge>
                  )}
                </div>
                <div className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white price-num">
                  {buses.length > 0
                    ? `${formatCompactVND(busTotalMin)} – ${formatCompactVND(
                        busTotalMax
                      )}`
                    : "Đang cập nhật"}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Tiết kiệm chi phí lớn, đi đêm ngủ một giấc tới nơi.
                </p>
              </button>
            </div>
          </div>

          {/* Selection Mode Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-[#d6cbb9] bg-[#faf7f2]/60 px-3.5 py-2.5 text-xs dark:border-[#1e2d45] dark:bg-[#172338]/40">
            <span className="text-slate-700 dark:text-slate-300">
              Chế độ tính giá hiện tại:{" "}
              <strong>
                {draft.intercitySelectionMode === "selected"
                  ? "Đã chốt 1 chuyến cụ thể"
                  : "Lấy toàn bộ khoảng giá (Rẻ nhất – Cao nhất)"}
              </strong>
            </span>
            {draft.intercitySelectionMode === "selected" && (
              <Button size="sm" variant="outline" onClick={onKeepRange}>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Giữ khoảng giá (Range)
              </Button>
            )}
          </div>

          {/* Tabs for Flight vs Bus */}
          <Tabs
            value={draft.intercityMode}
            onValueChange={(val) => onSetMode(val as IntercityMode)}
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-2">
              <TabsTrigger value="flight">
                <Plane className="h-4 w-4" aria-hidden="true" />
                Vé máy bay ({flights.length})
              </TabsTrigger>
              <TabsTrigger value="bus">
                <Bus className="h-4 w-4" aria-hidden="true" />
                Xe giường nằm ({buses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flight">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                  ))}
                </div>
              ) : flights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d6cbb9] bg-[#faf7f2]/50 p-8 text-center dark:border-[#1e2d45] dark:bg-[#172338]/40">
                  <Plane
                    className="mx-auto h-8 w-8 text-slate-400 mb-2"
                    aria-hidden="true"
                  />
                  <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Chặng này không có đường bay thương mại thẳng
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Điểm đến nằm gần điểm xuất phát hoặc chưa có sân bay dân dụng trực tiếp. Hệ thống tự động gợi ý xe Limousine / Giường nằm VIP.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => onSetMode("bus")}
                  >
                    <Bus className="h-4 w-4" aria-hidden="true" />
                    Xem các hãng xe Limousine & Giường nằm
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {flights.map((fl, idx) => {
                    const isCheapest = idx === 0;
                    const isPriciest = idx === flights.length - 1;
                    const isSelected =
                      draft.intercitySelectionMode === "selected" &&
                      draft.selectedFlightId === fl.id;

                    const perPaxEffective = Math.round(
                      fl.baseRoundtripPerPerson * avgMult
                    );
                    const groupTotalMin = Math.round(
                      fl.baseRoundtripPerPerson *
                        travelers *
                        holidayTransportMultiplier.min
                    );
                    const groupTotalMax = Math.round(
                      fl.baseRoundtripPerPerson *
                        travelers *
                        holidayTransportMultiplier.max
                    );

                    return (
                      <div
                        key={fl.id}
                        className={cn(
                          "rounded-2xl border p-4 transition-colors",
                          isSelected
                            ? "border-[#0f766e] bg-teal-50/50 ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-teal-950/30"
                            : "border-[#e7dfd3] bg-white hover:border-[#0f766e]/50 dark:border-[#1e2d45] dark:bg-[#101929]"
                        )}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "rounded-md px-2 py-0.5 text-xs font-bold",
                                  AIRLINE_COLORS[fl.airlineCode] ??
                                    "bg-slate-700 text-white"
                                )}
                              >
                                {fl.airlineCode}
                              </span>
                              <span className="font-heading font-bold text-base text-slate-900 dark:text-white">
                                {fl.airline}
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                ({fl.cabinClass})
                              </span>
                              {isCheapest && (
                                <Badge variant="emerald">Giá thấp nhất</Badge>
                              )}
                              {isPriciest && (
                                <Badge variant="secondary">Linh hoạt cao nhất</Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-medium price-num">
                                Đi: <strong>{fl.outboundDepart}</strong> →{" "}
                                {fl.outboundArrive} ({fl.outboundFlightNo})
                              </span>
                              <span className="font-medium price-num">
                                Về: <strong>{fl.inboundDepart}</strong> →{" "}
                                {fl.inboundArrive} ({fl.inboundFlightNo})
                              </span>
                              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Clock
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                {fl.durationMinutes} phút/chiều
                              </span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <Luggage
                                className="h-3.5 w-3.5 text-[#0f766e] dark:text-teal-400"
                                aria-hidden="true"
                              />
                              <span>{fl.baggageIncluded}</span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#e7dfd3] dark:border-[#1e2d45]">
                            <div className="sm:text-right">
                              <div className="text-xs text-slate-600 dark:text-slate-400 price-num">
                                ~{formatVND(perPaxEffective)} / khách khứ hồi
                              </div>
                              <div className="text-base sm:text-lg font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                                {groupTotalMin === groupTotalMax
                                  ? formatVND(groupTotalMin)
                                  : `${formatCompactVND(
                                      groupTotalMin
                                    )} – ${formatCompactVND(groupTotalMax)}`}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                Tổng {travelers} khách khứ hồi
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="hidden md:inline-flex"
                              >
                                <a
                                  href={fl.bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Hãng bay{" "}
                                  <ExternalLink
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                aria-pressed={isSelected}
                                variant={isSelected ? "default" : "outline"}
                                onClick={() =>
                                  onSelectFlight(isSelected ? null : fl.id)
                                }
                              >
                                {isSelected ? (
                                  <>
                                    <Check
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    />{" "}
                                    Đã chọn
                                  </>
                                ) : (
                                  "Chọn chuyến này"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bus">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {buses.map((bus, idx) => {
                    const isCheapest = idx === 0;
                    const isSelected =
                      draft.intercitySelectionMode === "selected" &&
                      draft.selectedBusId === bus.id;
                    const perPaxEffective = Math.round(
                      bus.baseRoundtripPerPerson * avgMult
                    );
                    const groupTotalMin = Math.round(
                      bus.baseRoundtripPerPerson *
                        travelers *
                        holidayTransportMultiplier.min
                    );
                    const groupTotalMax = Math.round(
                      bus.baseRoundtripPerPerson *
                        travelers *
                        holidayTransportMultiplier.max
                    );

                    return (
                      <div
                        key={bus.id}
                        className={cn(
                          "rounded-2xl border p-4 transition-colors",
                          isSelected
                            ? "border-[#0f766e] bg-teal-50/50 ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-teal-950/30"
                            : "border-[#e7dfd3] bg-white hover:border-[#0f766e]/50 dark:border-[#1e2d45] dark:bg-[#101929]"
                        )}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-heading font-bold text-base text-slate-900 dark:text-white">
                                {bus.operator}
                              </span>
                              {isCheapest && (
                                <Badge variant="emerald">Tiết kiệm nhất</Badge>
                              )}
                            </div>

                            <div className="text-xs font-bold text-[#0f766e] dark:text-teal-300">
                              {bus.seatType}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
                              <span className="price-num">
                                Khởi hành chiều đi:{" "}
                                <strong>{bus.outboundDepart}</strong> • Chiều về:{" "}
                                <strong>{bus.inboundDepart}</strong>
                              </span>
                              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Clock
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                ~{bus.durationHours} giờ/chiều
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              Đón: {bus.pickupPoint} → Trả: {bus.dropoffPoint}
                            </div>

                            {bus.note && (
                              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a3412] dark:text-amber-300">
                                <Sparkles
                                  className="h-3.5 w-3.5 shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{bus.note}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#e7dfd3] dark:border-[#1e2d45]">
                            <div className="sm:text-right">
                              <div className="text-xs text-slate-600 dark:text-slate-400 price-num">
                                ~{formatVND(perPaxEffective)} / khách khứ hồi
                              </div>
                              <div className="text-base sm:text-lg font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                                {groupTotalMin === groupTotalMax
                                  ? formatVND(groupTotalMin)
                                  : `${formatCompactVND(
                                      groupTotalMin
                                    )} – ${formatCompactVND(groupTotalMax)}`}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                Tổng {travelers} khách khứ hồi
                              </div>
                            </div>

                            <Button
                              size="sm"
                              aria-pressed={isSelected}
                              variant={isSelected ? "default" : "outline"}
                              onClick={() =>
                                onSelectBus(isSelected ? null : bus.id)
                              }
                            >
                              {isSelected ? (
                                <>
                                  <Check
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />{" "}
                                  Đã chọn
                                </>
                              ) : (
                                "Chọn nhà xe"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
