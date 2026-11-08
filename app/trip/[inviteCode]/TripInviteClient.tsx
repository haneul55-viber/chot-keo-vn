"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VietQRCard } from "@/components/shared/VietQRCard";
import { fetchTripByInviteCode } from "@/lib/supabase/trips";
import { TripMemberRecord, TripRecord } from "@/lib/supabase/types";
import { formatDateVN, formatVND } from "@/lib/format";
import { getDestinationById } from "@/data/destinations";
import { createClient } from "@/lib/supabase/client";

interface TripInviteClientProps {
  inviteCode: string;
}

export function TripInviteClient({ inviteCode }: TripInviteClientProps) {
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [members, setMembers] = useState<TripMemberRecord[]>([]);
  const [myNickname, setMyNickname] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchTripByInviteCode(inviteCode);
      if (res) {
        setTrip(res.trip);
        setMembers(res.members);
      }
      setLoading(false);
    }
    loadData();
  }, [inviteCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myNickname.trim() || !trip) return;
    setJoining(true);

    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("trip_members")
        .insert({
          trip_id: trip.id,
          nickname: myNickname.trim(),
          role: "member",
        })
        .select()
        .single();

      if (data) {
        setMembers((prev) => [...prev, data as TripMemberRecord]);
      }
    } else {
      // Local fallback
      setMembers((prev) => [
        ...prev,
        {
          id: `mem-${Date.now()}`,
          trip_id: trip.id,
          user_id: null,
          nickname: myNickname.trim(),
          avatar_url: null,
          role: "member",
          has_paid: false,
          joined_at: new Date().toISOString(),
        },
      ]);
    }

    setHasJoined(true);
    setJoining(false);
  };

  const destination = trip ? getDestinationById(trip.destination_id) : null;
  const travelers = trip ? trip.adults + trip.children : 2;
  const amountPerPax =
    trip && trip.budget_max > 0
      ? Math.round(
          ((trip.budget_min + trip.budget_max) / 2) / Math.max(1, travelers)
        )
      : 3500000;

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#080e1a] text-slate-900 dark:text-white flex flex-col">
      {/* Mini Header */}
      <header className="border-b border-[#e7dfd3] bg-white/90 backdrop-blur-md dark:border-[#1e2d45] dark:bg-[#101929]/90 px-4 py-3.5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f766e] to-[#c2410c] text-white">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-heading font-extrabold text-base">
              ChotKeo<span className="text-[#c2410c]">.vn</span>
            </span>
          </Link>

          <Button size="sm" variant="outline" asChild>
            <Link href="/">Tạo chuyến đi mới</Link>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {loading ? (
          <div className="rounded-3xl border border-[#e7dfd3] bg-white p-12 text-center dark:border-[#1e2d45] dark:bg-[#101929]">
            <Compass className="mx-auto h-8 w-8 animate-spin text-[#0f766e] mb-2" />
            <p className="text-sm text-slate-500">Đang tải thông tin chuyến đi...</p>
          </div>
        ) : !trip ? (
          <div className="rounded-3xl border border-dashed border-[#d6cbb9] bg-white p-10 text-center dark:border-[#1e2d45] dark:bg-[#101929] space-y-3">
            <h2 className="font-heading font-bold text-xl">
              Không tìm thấy chuyến đi mã #{inviteCode}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Chuyến đi có thể chưa được lưu lên đám mây hoặc mã mời không chính xác. Bạn có thể tự lên kế hoạch chuyến đi mới ngay bây giờ.
            </p>
            <Button asChild className="mt-2">
              <Link href="/">Lên lịch ChotKeo.vn ngay</Link>
            </Button>
          </div>
        ) : !hasJoined ? (
          <Card className="max-w-lg mx-auto border-[#e7dfd3] dark:border-[#1e2d45]">
            <CardHeader className="text-center pb-2">
              <Badge variant="default" className="mx-auto w-fit gap-1 mb-2">
                <Sparkles className="h-3 w-3" />
                Lời mời Chốt Kèo Du Lịch
              </Badge>
              <CardTitle className="text-2xl font-heading font-extrabold">
                {trip.name}
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Điểm đến: <strong>{destination?.name ?? trip.destination_id}</strong> •{" "}
                {formatDateVN(trip.start_date)} → {formatDateVN(trip.end_date)}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <div className="rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-4 dark:border-[#1e2d45] dark:bg-[#172338] text-center">
                <div className="text-xs text-slate-500">Ngân sách dự kiến toàn chuyến</div>
                <div className="text-xl font-extrabold text-[#0f766e] dark:text-teal-300 price-num mt-0.5">
                  {formatVND(trip.budget_min)} – {formatVND(trip.budget_max)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Ước tính ~<strong>{formatVND(amountPerPax)}</strong> / người
                </div>
              </div>

              <form onSubmit={handleJoin} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nhập biệt danh của bạn để tham gia nhóm:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Huy, Linh, Tuấn..."
                    value={myNickname}
                    onChange={(e) => setMyNickname(e.target.value)}
                    className="w-full rounded-xl border border-[#d6cbb9] bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#0f766e] dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-200"
                  />
                </div>

                <Button type="submit" disabled={joining} className="w-full h-11 text-sm font-bold">
                  {joining ? "Đang tham gia..." : "Gia nhập chuyến đi & Xem chi tiết"}
                </Button>
              </form>

              {members.length > 0 && (
                <div className="pt-2 text-center text-xs text-slate-500">
                  <Users className="inline h-3.5 w-3.5 mr-1" />
                  Đã có {members.length} người tham gia nhóm này.
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-step-in">
            {/* Joined Welcome Banner */}
            <div className="rounded-3xl bg-gradient-to-br from-[#0f766e] to-[#c2410c] p-6 text-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-2">
                  Đã gia nhập nhóm với tên: {myNickname}
                </Badge>
                <h1 className="text-2xl font-heading font-extrabold">{trip.name}</h1>
                <p className="text-xs text-white/90 mt-1">
                  {destination?.name} • {formatDateVN(trip.start_date)} →{" "}
                  {formatDateVN(trip.end_date)} • {travelers} người
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-teal-100">Chi phí dự kiến mỗi người</div>
                <div className="text-2xl font-extrabold price-num">
                  ~{formatVND(amountPerPax)}
                </div>
              </div>
            </div>

            {/* VietQR Bill Splitting & Payment Collection */}
            <VietQRCard
              bankBin="970422"
              bankName="MBBank"
              accountNo="0987654321"
              accountName="TRƯỞNG NHÓM CHOTKEO"
              amountPerPax={amountPerPax}
              inviteCode={trip.invite_code}
              tripName={trip.name}
              members={members}
              isOwner={false}
            />

            {/* Back to Full Calculator */}
            <div className="rounded-2xl border border-[#e7dfd3] bg-white p-5 text-center dark:border-[#1e2d45] dark:bg-[#101929] space-y-2">
              <div className="font-bold text-sm">Bạn muốn tự tùy chỉnh lại lịch trình theo ý mình?</div>
              <p className="text-xs text-slate-500">
                Bạn có thể sao chép cấu hình chuyến đi này sang bộ tính toán chi tiết 7 bước để thử nghiệm thêm các lựa chọn khác.
              </p>
              <Button asChild variant="outline" className="mt-1">
                <Link href="/">Mở bộ tính toán ChotKeo.vn</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#e7dfd3] py-4 text-center text-xs text-slate-500 dark:border-[#1e2d45]">
        ChotKeo.vn • Nền tảng dự toán & chốt kèo du lịch nội địa Việt Nam
      </footer>
    </div>
  );
}
