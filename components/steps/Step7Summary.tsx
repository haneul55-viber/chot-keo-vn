"use client";

import React, { useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  BookmarkCheck,
  Check,
  Clock,
  Database,
  Edit3,
  FileDown,
  Share2,
  ShieldAlert,
  TrendingUp,
  Users,
  Wallet,
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
import { Switch } from "@/components/ui/switch";
import { VietQRCard } from "@/components/shared/VietQRCard";
import { useAuth } from "@/lib/hooks/useAuth";
import { getDestinationById } from "@/data/destinations";
import {
  encodeTripShareParam,
  formatCompactVND,
  formatDateTimeVN,
  formatDateVN,
  formatVND,
} from "@/lib/format";
import {
  PriceRange,
  SourceAttribution,
  TripDraft,
  TripPricingSummary,
} from "@/lib/types";

interface Step7SummaryProps {
  draft: TripDraft;
  pricing: TripPricingSummary;
  attributions: SourceAttribution[];
  onToggleContingency: (include: boolean) => void;
  onJumpToStep: (step: number) => void;
  onSaveTrip: (name: string, totalRange: PriceRange) => void;
}

const CHART_COLORS = [
  "#0f766e", // Đi lại liên tỉnh (Coastal Map Teal)
  "#0284c7", // Lưu trú (Ocean Sky)
  "#10b981", // Ăn uống (Emerald)
  "#6366f1", // Di chuyển tại chỗ (Indigo)
  "#ea580c", // Phụ phí ngày lễ (Sunset Terracotta)
  "#64748b", // Dự phòng 10% (Slate)
];

export function Step7Summary({
  draft,
  pricing,
  attributions,
  onToggleContingency,
  onJumpToStep,
  onSaveTrip,
}: Step7SummaryProps) {
  const origin = getDestinationById(draft.originId);
  const destination = getDestinationById(draft.destinationId);
  const { profile } = useAuth();

  const [tripName, setTripName] = useState(
    `Kèo đi ${destination?.name ?? "Du lịch"} (${formatDateVN(draft.startDate)})`
  );
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const breakdownRows = useMemo(
    () => [
      {
        key: "intercity",
        label: "Đi lại liên tỉnh",
        detail:
          draft.intercityMode === "flight"
            ? "Vé máy bay khứ hồi"
            : "Xe giường nằm / Limousine khứ hồi",
        range: pricing.categories.intercity,
        step: 3,
        color: CHART_COLORS[0],
      },
      {
        key: "lodging",
        label: "Lưu trú",
        detail: `${pricing.nights} đêm × ${draft.rooms} phòng`,
        range: pricing.categories.lodging,
        step: 4,
        color: CHART_COLORS[1],
      },
      {
        key: "food",
        label: "Ăn uống",
        detail: `${draft.mealsPerDay} bữa/ngày × ${pricing.days} ngày × ${pricing.totalTravelers} khách`,
        range: pricing.categories.food,
        step: 5,
        color: CHART_COLORS[2],
      },
      {
        key: "localTransport",
        label: "Di chuyển tại chỗ",
        detail:
          draft.localTransportMode === "ride_hailing"
            ? `Gọi xe công nghệ (${draft.ridesPerDay} chuyến/ngày)`
            : `Thuê xe máy tự lái + nhiên liệu`,
        range: pricing.categories.localTransport,
        step: 6,
        color: CHART_COLORS[3],
      },
      {
        key: "holidaySurcharge",
        label: "Phụ phí ngày lễ",
        detail: pricing.holidayAnalysis.hasOverlap
          ? pricing.holidayAnalysis.overlappingHolidays
              .map((h) => h.holiday.name)
              .join(", ")
          : "Không trùng dịp cao điểm (0 ₫)",
        range: pricing.categories.holidaySurcharge,
        step: 2,
        color: CHART_COLORS[4],
      },
      {
        key: "contingency",
        label: "Dự phòng phát sinh (10%)",
        detail: draft.includeContingency
          ? "Quỹ dự phòng mua quà, vé tham quan & chi phí phát sinh"
          : "Đang tắt (Bật công tắc để cộng 10% dự phòng)",
        range: pricing.categories.contingency,
        step: 7,
        color: CHART_COLORS[5],
      },
    ],
    [draft, pricing]
  );

  const totalMid = Math.max(1, (pricing.total.min + pricing.total.max) / 2);

  // Sorted largest-first from 12 o'clock per ui-ux-pro-max chart guidelines
  const chartData = useMemo(() => {
    return breakdownRows
      .map((row) => ({
        name: row.label,
        value: Math.round((row.range.min + row.range.max) / 2),
        min: row.range.min,
        max: row.range.max,
        color: row.color,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [breakdownRows]);

  const handleSave = () => {
    const cleanName =
      tripName.trim() ||
      `Chuyến đi ${destination?.name} (${formatDateVN(draft.startDate)})`;
    onSaveTrip(cleanName, pricing.total);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleShare = async () => {
    const encoded = encodeTripShareParam(draft);
    const url = `${window.location.origin}${window.location.pathname}?trip=${encodeURIComponent(
      encoded
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    } catch {
      window.prompt("Sao chép liên kết chia sẻ chuyến đi:", url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Bento Budget Hero */}
      <Card className="print-card overflow-hidden border-[#d8cdbe] dark:border-[#243552]">
        <div className="bg-gradient-to-br from-[#0f514c] via-[#0f766e] to-[#9a3412] p-6 sm:p-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-xs">
              Bản Chốt Ngân Sách ChotKeo.vn
            </Badge>
            <span className="text-xs font-semibold text-white/90 price-num">
              {origin?.name} → {destination?.name} •{" "}
              {formatDateVN(draft.startDate)} – {formatDateVN(draft.endDate)} (
              {pricing.days}N{pricing.nights}Đ)
            </span>
          </div>

          <h2 className="font-heading mt-4 text-xl sm:text-2xl md:text-3xl font-extrabold">
            Tổng chi phí dự kiến toàn chuyến ({pricing.totalTravelers} hành khách)
          </h2>

          {/* Bento 4-KPI Grid */}
          <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/14 backdrop-blur-xs border border-white/25 p-4 sm:col-span-1 lg:col-span-2">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-100">
                Mức Thấp Nhất (Phương án tiết kiệm)
              </div>
              <div className="font-heading mt-1 text-2xl sm:text-3xl font-extrabold price-num">
                {formatVND(pricing.total.min)}
              </div>
              <div className="mt-1 text-xs text-white/85 price-num">
                Tương đương {formatVND(pricing.perPerson.min)} / người
              </div>
            </div>

            <div className="rounded-2xl bg-black/20 backdrop-blur-xs border border-amber-300/35 p-4 sm:col-span-1 lg:col-span-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                Mức Cao Nhất (Phương án thoải mái)
              </div>
              <div className="font-heading mt-1 text-2xl sm:text-3xl font-extrabold price-num">
                {formatVND(pricing.total.max)}
              </div>
              <div className="mt-1 text-xs text-white/85 price-num">
                Tương đương {formatVND(pricing.perPerson.max)} / người
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 sm:col-span-1 lg:col-span-2 flex items-center gap-3">
              <Users className="h-5 w-5 text-teal-200 shrink-0" aria-hidden="true" />
              <div className="text-sm">
                <span className="text-white/80 block text-xs">
                  Trung bình mỗi thành viên
                </span>
                <strong className="price-num">
                  {formatVND(pricing.perPerson.min)} –{" "}
                  {formatVND(pricing.perPerson.max)}
                </strong>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 sm:col-span-1 lg:col-span-2 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-amber-200 shrink-0" aria-hidden="true" />
              <div className="text-sm">
                <span className="text-white/80 block text-xs">
                  Trung bình mỗi ngày ({pricing.days} ngày)
                </span>
                <strong className="price-num">
                  {formatVND(pricing.perDay.min)} – {formatVND(pricing.perDay.max)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <CardContent className="no-print pt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2.5">
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              aria-label="Tên bản dự toán"
              placeholder="Đặt tên cho chuyến đi..."
              className="h-11 w-full sm:max-w-xs rounded-xl border border-[#e7dfd3] bg-[#faf7f2] px-3.5 text-sm font-medium outline-none focus:border-[#0f766e] dark:border-[#1e2d45] dark:bg-[#172338]"
            />
            <Button onClick={handleSave} variant="default">
              {savedNotice ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" /> Đã lưu vào máy!
                </>
              ) : (
                <>
                  <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> Lưu chuyến đi
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleShare}>
              {copiedNotice ? (
                <>
                  <Check
                    className="h-4 w-4 text-emerald-600"
                    aria-hidden="true"
                  />{" "}
                  Đã sao chép link!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" aria-hidden="true" /> Chia sẻ link
                </>
              )}
            </Button>

            <Button variant="terracotta" onClick={() => window.print()}>
              <FileDown className="h-4 w-4" aria-hidden="true" /> Xuất PDF
            </Button>

            <Button variant="secondary" onClick={() => onJumpToStep(1)}>
              <Edit3 className="h-4 w-4" aria-hidden="true" /> Cho phép chỉnh sửa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Table + Accessible Stacked Bar + Donut Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="print-card lg:col-span-7">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Bảng phân bổ chi tiết 6 hạng mục</CardTitle>
                <CardDescription>
                  Tổng cộng bằng chính xác tổng các mức Thấp nhất – Cao nhất không trùng lặp.
                </CardDescription>
              </div>

              <label className="no-print inline-flex min-h-[40px] items-center gap-2.5 text-xs font-bold cursor-pointer rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] px-3.5 py-2 dark:border-[#1e2d45] dark:bg-[#172338]">
                <Switch
                  checked={draft.includeContingency}
                  onCheckedChange={onToggleContingency}
                />
                <span>Quỹ dự phòng 10%</span>
              </label>
            </div>

            {/* Accessible 100% Proportional Stacked Bar Fallback */}
            <div className="pt-3 space-y-2">
              <div
                className="flex h-3.5 w-full overflow-hidden rounded-full bg-[#f3ede3] dark:bg-slate-800"
                role="img"
                aria-label="Thanh tỷ trọng 100% chi phí theo 6 nhóm"
              >
                {chartData.map((slice) => {
                  const pct = (slice.value / totalMid) * 100;
                  return (
                    <div
                      key={slice.name}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: slice.color,
                      }}
                      title={`${slice.name}: ${Math.round(pct)}%`}
                      className="h-full border-r border-white/40 last:border-r-0 transition-all duration-300"
                    />
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#e7dfd3] text-left text-xs font-bold uppercase text-slate-500 dark:border-[#1e2d45]">
                    <th className="py-3 pr-3">Hạng mục & Tỷ trọng</th>
                    <th className="py-3 px-2 text-right">Thấp nhất</th>
                    <th className="py-3 px-2 text-right">Cao nhất</th>
                    <th className="py-3 pl-2 text-right no-print">Sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efe8dd] dark:divide-slate-800/80">
                  {breakdownRows.map((row) => {
                    const rowMid = (row.range.min + row.range.max) / 2;
                    const sharePct = Math.round((rowMid / totalMid) * 100);
                    return (
                      <tr key={row.key}>
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: row.color }}
                              aria-hidden="true"
                            />
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {row.label}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[11px] py-0 px-2 price-num"
                            >
                              {sharePct}%
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 pl-5 mt-0.5">
                            {row.detail}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right font-semibold price-num whitespace-nowrap">
                          {formatVND(row.range.min)}
                        </td>
                        <td className="py-3.5 px-2 text-right font-bold text-slate-900 dark:text-white price-num whitespace-nowrap">
                          {formatVND(row.range.max)}
                        </td>
                        <td className="py-3.5 pl-2 text-right no-print">
                          {row.step < 7 && (
                            <button
                              type="button"
                              onClick={() => onJumpToStep(row.step)}
                              aria-label={`Chỉnh sửa ${row.label}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-[#f3ede3] hover:text-[#0f766e] dark:hover:bg-[#172338] dark:hover:text-teal-300 cursor-pointer"
                            >
                              <Edit3 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-heading font-extrabold text-base">
                    <td className="pt-4 pr-3 text-slate-900 dark:text-white">
                      TỔNG CỘNG TOÀN CHUYẾN
                    </td>
                    <td className="pt-4 px-2 text-right text-[#0f766e] dark:text-teal-300 price-num whitespace-nowrap">
                      {formatVND(pricing.total.min)}
                    </td>
                    <td className="pt-4 px-2 text-right text-[#c2410c] dark:text-orange-300 price-num whitespace-nowrap">
                      {formatVND(pricing.total.max)}
                    </td>
                    <td className="no-print" />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Quick Step Jump Strip */}
            <div className="no-print mt-5 pt-4 border-t border-[#efe8dd] dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Cho phép chỉnh sửa nhanh từng bước:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { step: 1, label: "1. Hành trình & Khách" },
                  { step: 2, label: "2. Ngày lễ Tết" },
                  { step: 3, label: "3. Vé liên tỉnh" },
                  { step: 4, label: "4. Khách sạn" },
                  { step: 5, label: "5. Ẩm thực" },
                  { step: 6, label: "6. Xe tại chỗ" },
                ].map((item) => (
                  <Button
                    key={item.step}
                    size="sm"
                    variant="outline"
                    onClick={() => onJumpToStep(item.step)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart with Center Midpoint Callout */}
        <Card className="print-card lg:col-span-5 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle>Biểu đồ tỷ trọng ngân sách</CardTitle>
            <CardDescription>
              Sắp xếp từ hướng 12 giờ theo giá trị trung vị từng nhóm chi phí.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col items-center justify-center">
            <div className="relative h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={3}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => formatVND(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Midpoint Label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Trung vị ước tính
                </span>
                <span className="font-heading text-base font-extrabold text-slate-900 dark:text-white price-num">
                  {formatCompactVND(totalMid)}
                </span>
              </div>
            </div>

            <div className="w-full space-y-2.5 mt-3 pt-3 border-t border-[#efe8dd] dark:border-slate-800">
              {chartData.map((item) => {
                const pct = Math.round((item.value / totalMid) * 100);
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold price-num text-slate-900 dark:text-slate-100">
                      {pct}% ({formatCompactVND(item.value)})
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VietQR Group Cost Splitting Card */}
      <VietQRCard
        bankBin={profile?.bank_bin || "970422"}
        bankName={profile?.bank_name || "MBBank"}
        accountNo={profile?.bank_account_no || "0987654321"}
        accountName={profile?.bank_account_name || "TRƯỞNG NHÓM CHOTKEO"}
        amountPerPax={Math.round(totalMid / Math.max(1, pricing.totalTravelers))}
        inviteCode={draft.destinationId.slice(0, 4) + "-" + draft.startDate.slice(5).replace("-", "")}
        tripName={tripName || `Chuyến đi ${destination?.name}`}
        members={[
          {
            id: "m-owner",
            trip_id: "local",
            user_id: null,
            nickname: profile?.full_name || "Trưởng nhóm",
            avatar_url: profile?.avatar_url || null,
            role: "owner",
            has_paid: true,
            joined_at: new Date().toISOString(),
          },
          ...Array.from({ length: Math.max(0, pricing.totalTravelers - 1) }, (_, i) => ({
            id: `m-${i + 2}`,
            trip_id: "local",
            user_id: null,
            nickname: `Bạn ${i + 1}`,
            avatar_url: null,
            role: "member" as const,
            has_paid: false,
            joined_at: new Date().toISOString(),
          })),
        ]}
        isOwner={true}
      />

      {/* Data Sources, Timestamps & Disclaimer Card */}
      <Card className="print-card bg-[#faf7f2]/80 dark:bg-[#101929]/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database
              className="h-4 w-4 text-[#0f766e] dark:text-teal-400"
              aria-hidden="true"
            />
            Nguồn dữ liệu ước tính & Thời điểm trích xuất
          </CardTitle>
          <CardDescription>
            Mọi nguồn dữ liệu đi qua lớp Adapter tại <code>/lib/providers</code>{" "}
            kèm bộ nhớ đệm TTL 6 giờ.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {attributions.map((attr) => (
              <div
                key={attr.category}
                className="rounded-2xl border border-[#e7dfd3] bg-white p-3.5 text-xs dark:border-[#1e2d45] dark:bg-[#172338]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {attr.category}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0">
                    {attr.cached ? "Cache 6h" : "Mới tải"}
                  </Badge>
                </div>
                <div
                  className="text-slate-600 dark:text-slate-400 mt-1 truncate"
                  title={attr.source}
                >
                  {attr.source}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 price-num">
                  <Clock className="h-3 w-3" aria-hidden="true" /> Cập nhật:{" "}
                  {formatDateTimeVN(attr.fetchedAt)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-xs text-[#7c2d12] dark:border-orange-900/60 dark:bg-orange-950/35 dark:text-orange-200">
            <ShieldAlert
              className="h-4 w-4 text-[#c2410c] dark:text-orange-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p>
              <strong>Lưu ý miễn trừ trách nhiệm:</strong> Toàn bộ mức giá hiển
              thị trên <strong>ChotKeo.vn</strong> là ước tính tham khảo dựa
              trên dữ liệu mô phỏng định hướng (Phase 1) và cấu hình hệ số mùa
              vụ <code>holidays.json</code>. Giá vé máy bay, phòng lưu trú và
              dịch vụ thực tế có thể thay đổi tùy thời điểm đặt chỗ và chính
              sách của từng nền tảng (Agoda, Booking.com, Traveloka, hãng hàng
              không, nhà xe).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
