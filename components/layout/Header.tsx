"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import {
  Bookmark,
  Compass,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTripStore } from "@/lib/store/useTripStore";
import { formatDateVN, formatDateTimeVN, formatVND } from "@/lib/format";
import { getDestinationById } from "@/data/destinations";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const savedTrips = useTripStore((s) => s.savedTrips);
  const loadSavedTrip = useTripStore((s) => s.loadSavedTrip);
  const deleteSavedTrip = useTripStore((s) => s.deleteSavedTrip);
  const resetDraft = useTripStore((s) => s.resetDraft);
  const setCurrentStep = useTripStore((s) => s.setCurrentStep);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[#e7dfd3] bg-[#faf7f2]/92 backdrop-blur-md dark:border-[#1e2d45] dark:bg-[#080e1a]/92">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-3 text-left cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#c2410c] text-white shadow-xs">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                ChotKeo
                <span className="text-[#c2410c] dark:text-orange-400">.vn</span>
              </span>
              <Badge
                variant="default"
                className="hidden sm:inline-flex text-[10px] py-0"
              >
                Du lịch Nội địa
              </Badge>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:block">
              Lên lịch chuẩn — Chốt chi phí du lịch Việt Nam
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-1.5">
                <Bookmark
                  className="h-4 w-4 text-[#0f766e] dark:text-teal-400"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">Kèo đã lưu</span>
                <span
                  aria-label={`${savedTrips.length} chuyến đi đã lưu`}
                  className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-[#0f766e] dark:bg-teal-950 dark:text-teal-300 price-num"
                >
                  {savedTrips.length}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[82vh] overflow-y-auto">
              <DialogTitle>Các chuyến đi đã lưu</DialogTitle>
              <DialogDescription>
                Dữ liệu được lưu cục bộ trên trình duyệt của bạn để dễ dàng so sánh nhiều phương án.
              </DialogDescription>

              <div className="mt-4 space-y-3">
                {savedTrips.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d8cdbe] p-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    Bạn chưa lưu kèo nào. Ở Bước 7 (Tổng kết), nhấn{" "}
                    <strong>Lưu chuyến đi</strong> để lưu lại bản dự toán.
                  </div>
                ) : (
                  savedTrips.map((item) => {
                    const dest = getDestinationById(item.draft.destinationId);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#e7dfd3] p-4 dark:border-[#1e2d45]"
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 price-num">
                            {dest?.name ?? item.draft.destinationId} •{" "}
                            {formatDateVN(item.draft.startDate)} →{" "}
                            {formatDateVN(item.draft.endDate)} •{" "}
                            {item.draft.adults + item.draft.children} khách
                          </div>
                          <div className="text-xs font-bold text-[#0f766e] dark:text-teal-400 mt-1 price-num">
                            {formatVND(item.totalRange.min)} –{" "}
                            {formatVND(item.totalRange.max)}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 price-num">
                            Lưu lúc {formatDateTimeVN(item.savedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => {
                              loadSavedTrip(item.id);
                              setDrawerOpen(false);
                            }}
                          >
                            Mở lại
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteSavedTrip(item.id)}
                            aria-label={`Xóa ${item.name}`}
                          >
                            <Trash2
                              className="h-4 w-4 text-rose-600"
                              aria-hidden="true"
                            />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetDraft}
            title="Làm mới lịch trình về mặc định"
            className="hidden md:inline-flex h-10 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Chuyển chế độ giao diện Sáng hoặc Tối"
          >
            <Sun
              className="hidden dark:block h-4 w-4 text-amber-400"
              aria-hidden="true"
            />
            <Moon
              className="block dark:hidden h-4 w-4 text-slate-700"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </header>
  );
}
