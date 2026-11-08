"use client";

import React, { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { vi } from "react-day-picker/locale";
import {
  AlertCircle,
  ArrowLeftRight,
  BedDouble,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Compass,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Search,
  Sparkles,
  Users,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DESTINATIONS,
  getDestinationById,
  getDestinationCities,
  getOriginCities,
} from "@/data/destinations";
import {
  addDaysISO,
  computeTripDuration,
  formatDateVN,
  parseISODate,
  toISODate,
} from "@/lib/format";
import { Destination, TripDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

interface SearchableCityPickerProps {
  id: string;
  label: string;
  value: string;
  options: Destination[];
  excludeId?: string;
  onChange: (id: string) => void;
  icon: React.ReactNode;
}

function SearchableCityPicker({
  id,
  label,
  value,
  options,
  excludeId,
  onChange,
  icon,
}: SearchableCityPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getDestinationById(value);

  const filtered = useMemo(() => {
    const q = removeVietnameseTones(query.trim());
    return options
      .filter((d) => d.id !== excludeId)
      .filter((d) => {
        if (!q) return true;
        const hay = removeVietnameseTones(
          `${d.name} ${d.province} ${d.region} ${d.airportCode ?? ""}`
        );
        return hay.includes(q);
      });
  }, [options, excludeId, query]);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
      >
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-expanded={open}
            className="flex w-full min-h-[56px] items-center justify-between gap-2 rounded-2xl border border-[#e7dfd3] bg-[#faf7f2]/60 px-4 py-3 text-left transition-colors hover:border-[#0f766e] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-[#1e2d45] dark:bg-[#172338]/70 dark:hover:bg-[#172338] cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0f766e] border border-teal-200/70 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800/70"
              >
                {icon}
              </div>
              <div className="min-w-0">
                <div className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                  {selected?.name ?? "Chọn tỉnh/thành"}
                  {selected?.airportCode ? ` (${selected.airportCode})` : ""}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {selected ? `${selected.province} • ${selected.region}` : ""}
                </div>
              </div>
            </div>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-slate-500"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-[320px] sm:w-[360px] p-3" align="start">
          <div className="relative mb-2.5">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Tìm kiếm ${label}`}
              placeholder="Gõ không dấu: da lat, phu quoc, DAD..."
              className="w-full rounded-xl border border-[#e7dfd3] bg-[#faf7f2] pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#0f766e] dark:border-[#1e2d45] dark:bg-[#172338]"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                Không tìm thấy địa điểm phù hợp.
              </p>
            ) : (
              filtered.map((city) => {
                const isSelected = city.id === value;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      onChange(city.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer",
                      isSelected
                        ? "bg-teal-50 text-[#0f766e] font-semibold dark:bg-teal-950/70 dark:text-teal-200"
                        : "hover:bg-[#f3ede3] dark:hover:bg-[#172338]"
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold truncate">
                        {city.name}{" "}
                        {city.airportCode && (
                          <span className="text-xs font-mono text-slate-500">
                            ({city.airportCode})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {city.province} • {city.tagline}
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        className="h-4 w-4 shrink-0 text-[#0f766e]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface SingleDatePickerProps {
  id: string;
  label: string;
  isoDate: string;
  minIsoDate?: string;
  onSelectIso: (iso: string) => void;
}

function SingleDatePicker({
  id,
  label,
  isoDate,
  minIsoDate,
  onSelectIso,
}: SingleDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseISODate(isoDate);
  const minDate = minIsoDate ? parseISODate(minIsoDate) : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
      >
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-expanded={open}
            className="flex w-full min-h-[56px] items-center justify-between gap-2 rounded-2xl border border-[#e7dfd3] bg-[#faf7f2]/60 px-4 py-3 text-left transition-colors hover:border-[#0f766e] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-[#1e2d45] dark:bg-[#172338]/70 dark:hover:bg-[#172338] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#c2410c] border border-orange-200/70 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-900/60"
              >
                <CalendarIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 price-num">
                  {formatDateVN(isoDate)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Lịch dương (dd/MM/yyyy)
                </div>
              </div>
            </div>
            <ChevronDown
              className="h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <DayPicker
            mode="single"
            locale={vi}
            selected={selectedDate}
            defaultMonth={selectedDate}
            disabled={minDate ? { before: minDate } : undefined}
            onSelect={(day) => {
              if (day) {
                onSelectIso(toISODate(day));
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface NumberCounterProps {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  icon: React.ReactNode;
  onChange: (next: number) => void;
}

function NumberCounter({
  label,
  sublabel,
  value,
  min,
  max,
  icon,
  onChange,
}: NumberCounterProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#e7dfd3] bg-[#faf7f2]/60 p-4 dark:border-[#1e2d45] dark:bg-[#172338]/70">
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 border border-[#e7dfd3] dark:bg-[#101929] dark:text-slate-300 dark:border-[#243552]"
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {label}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
            {sublabel}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Giảm ${label}`}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </Button>
        <span
          aria-live="polite"
          className="w-8 text-center font-heading font-extrabold text-base price-num"
        >
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Tăng ${label}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

interface Step1BasicsProps {
  draft: TripDraft;
  onUpdate: (
    updates: Partial<
      Pick<
        TripDraft,
        | "originId"
        | "destinationId"
        | "startDate"
        | "endDate"
        | "adults"
        | "children"
        | "rooms"
      >
    >
  ) => void;
}

const FEATURED_DESTINATIONS = [
  {
    id: "da-lat",
    vibe: "Săn mây & Rừng thông",
    gradient: "from-emerald-800 to-teal-900",
  },
  {
    id: "da-nang",
    vibe: "Biển Mỹ Khê & Cầu Rồng",
    gradient: "from-sky-800 to-teal-800",
  },
  {
    id: "nha-trang",
    vibe: "Vịnh san hô & Hải sản",
    gradient: "from-cyan-800 to-blue-900",
  },
  {
    id: "phu-quoc",
    vibe: "Hoàng hôn Đảo Ngọc",
    gradient: "from-orange-800 to-amber-900",
  },
  {
    id: "ha-noi",
    vibe: "Phố Cổ & Ẩm thực thu",
    gradient: "from-red-900 to-amber-900",
  },
];

const QUICK_DATE_PRESETS = [
  {
    label: "Ngày thường T11/2026 (Giá tối ưu)",
    start: "2026-11-11",
    end: "2026-11-14",
  },
  {
    label: "Cuối tuần Săn mây (20–23/11)",
    start: "2026-11-20",
    end: "2026-11-23",
  },
  {
    label: "Tết Nguyên Đán 2027 (Mùng 2–5)",
    start: "2027-02-07",
    end: "2027-02-10",
  },
  {
    label: "Lễ 30/4 – 1/5/2027",
    start: "2027-04-30",
    end: "2027-05-03",
  },
];

export function Step1Basics({ draft, onUpdate }: Step1BasicsProps) {
  const originCities = useMemo(() => getOriginCities(), []);
  const destinationCities = useMemo(() => getDestinationCities(), []);
  const duration = computeTripDuration(draft.startDate, draft.endDate);
  const selectedDestination = getDestinationById(draft.destinationId);
  const totalTravelers = draft.adults + draft.children;
  const suggestedRooms = Math.max(1, Math.ceil(draft.adults / 2));

  const canSwapRoute = Boolean(
    selectedDestination?.canBeOrigin &&
      getDestinationById(draft.originId)?.canBeDestination
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Bước 1: Thiết lập hành trình & thành viên</CardTitle>
              <CardDescription>
                Chọn điểm đến, thời gian và quy mô đoàn để hệ thống tính toán khoảng giá chính xác theo mùa vụ.
              </CardDescription>
            </div>
            {duration.isValid && (
              <Badge
                variant="default"
                className="text-sm px-4 py-1.5 font-bold price-num"
              >
                {duration.days} ngày {duration.nights} đêm
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bento Featured Destination Cards */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles
                className="h-3.5 w-3.5 text-[#c2410c] dark:text-orange-400"
                aria-hidden="true"
              />
              <span>Gợi ý 5 tọa độ nổi bật nhất:</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
              {FEATURED_DESTINATIONS.map((feat) => {
                const city = DESTINATIONS.find((d) => d.id === feat.id);
                if (!city) return null;
                const isSameAsOrigin = city.id === draft.originId;
                const active = draft.destinationId === feat.id;

                return (
                  <button
                    key={feat.id}
                    type="button"
                    disabled={isSameAsOrigin}
                    aria-pressed={active}
                    onClick={() => onUpdate({ destinationId: feat.id })}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl p-3.5 text-left text-white transition-all duration-200 cursor-pointer bg-gradient-to-br disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
                      feat.gradient,
                      active
                        ? "ring-3 ring-[#c2410c] dark:ring-orange-400 shadow-md"
                        : "opacity-90 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
                      <span>{city.region}</span>
                      {city.airportCode && (
                        <span className="font-mono">{city.airportCode}</span>
                      )}
                    </div>
                    <div className="mt-2 font-heading font-extrabold text-sm sm:text-base leading-tight">
                      {city.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-white/85 line-clamp-1">
                      {feat.vibe}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Origin & Destination Pickers with 1-Click Swap */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <SearchableCityPicker
              id="origin-city-picker"
              label="Điểm khởi hành"
              value={draft.originId}
              options={originCities}
              onChange={(originId) => {
                if (originId === draft.destinationId) {
                  const fallback =
                    destinationCities.find((c) => c.id !== originId)?.id ??
                    "da-lat";
                  onUpdate({ originId, destinationId: fallback });
                } else {
                  onUpdate({ originId });
                }
              }}
              icon={<Navigation className="h-4 w-4" />}
            />

            <div className="flex justify-center md:pb-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!canSwapRoute}
                onClick={() =>
                  onUpdate({
                    originId: draft.destinationId,
                    destinationId: draft.originId,
                  })
                }
                title="Đổi chiều điểm đi và điểm đến"
                aria-label="Đổi chiều điểm đi và điểm đến"
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <SearchableCityPicker
              id="destination-city-picker"
              label="Điểm đến du lịch (15 tỉnh/thành)"
              value={draft.destinationId}
              options={destinationCities}
              excludeId={draft.originId}
              onChange={(destinationId) => onUpdate({ destinationId })}
              icon={<MapPin className="h-4 w-4" />}
            />
          </div>

          {selectedDestination && (
            <div className="rounded-2xl bg-teal-50/80 border border-teal-200/80 px-4 py-3 text-xs text-slate-800 dark:bg-teal-950/30 dark:border-teal-900/60 dark:text-teal-100 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Compass
                  className="h-4 w-4 text-[#0f766e] dark:text-teal-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong>{selectedDestination.name}</strong> (
                  {selectedDestination.province}): {selectedDestination.tagline}
                </span>
              </span>
              {selectedDestination.nearestAirportNote && (
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900">
                  {selectedDestination.nearestAirportNote}
                </Badge>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SingleDatePicker
                id="start-date-picker"
                label="Ngày khởi hành"
                isoDate={draft.startDate}
                onSelectIso={(startDate) => {
                  const nextEnd =
                    draft.endDate <= startDate
                      ? addDaysISO(startDate, Math.max(1, duration.nights))
                      : draft.endDate;
                  onUpdate({ startDate, endDate: nextEnd });
                }}
              />

              <SingleDatePicker
                id="end-date-picker"
                label="Ngày kết thúc"
                isoDate={draft.endDate}
                minIsoDate={addDaysISO(draft.startDate, 1)}
                onSelectIso={(endDate) => onUpdate({ endDate })}
              />
            </div>

            {!duration.isValid && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Ngày kết thúc phải sau ngày khởi hành ít nhất 1 đêm. Vui lòng chọn lại ngày về.
                </span>
              </div>
            )}

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Thử nhanh mốc thời gian:
              </span>
              {QUICK_DATE_PRESETS.map((preset) => {
                const isCurrent =
                  draft.startDate === preset.start &&
                  draft.endDate === preset.end;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    aria-pressed={isCurrent}
                    onClick={() =>
                      onUpdate({ startDate: preset.start, endDate: preset.end })
                    }
                    className={cn(
                      "min-h-[36px] rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                      isCurrent
                        ? "border-[#c2410c] bg-orange-50 text-[#9a3412] dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-700"
                        : "border-[#e7dfd3] bg-white text-slate-700 hover:bg-[#f3ede3] dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-300 dark:hover:bg-[#172338]"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travelers & Rooms */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <NumberCounter
              label="Người lớn"
              sublabel="Từ 12 tuổi trở lên"
              value={draft.adults}
              min={1}
              max={30}
              icon={<Users className="h-4 w-4" />}
              onChange={(adults) => onUpdate({ adults })}
            />

            <NumberCounter
              label="Trẻ em"
              sublabel="Từ 2 – 11 tuổi"
              value={draft.children}
              min={0}
              max={20}
              icon={<Users className="h-4 w-4" />}
              onChange={(children) => onUpdate({ children })}
            />

            <NumberCounter
              label="Số phòng"
              sublabel={`Gợi ý: ${suggestedRooms} phòng (${totalTravelers} khách)`}
              value={draft.rooms}
              min={1}
              max={20}
              icon={<BedDouble className="h-4 w-4" />}
              onChange={(rooms) => onUpdate({ rooms })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
