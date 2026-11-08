"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  CreditCard,
  Download,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/format";
import { TripMemberRecord } from "@/lib/supabase/types";
import { toggleMemberPaidStatus } from "@/lib/supabase/votes";

interface VietQRCardProps {
  bankBin: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amountPerPax: number;
  inviteCode: string;
  tripName: string;
  members: TripMemberRecord[];
  isOwner?: boolean;
}

export function VietQRCard({
  bankBin,
  bankName,
  accountNo,
  accountName,
  amountPerPax,
  inviteCode,
  tripName,
  members,
  isOwner = false,
}: VietQRCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [localMembers, setLocalMembers] = useState<TripMemberRecord[]>(members);

  const memo = `CHOTKEO ${inviteCode.toUpperCase()}`;
  const cleanAccountNo = accountNo.replace(/\s+/g, "");
  const qrUrl = `https://img.vietqr.io/image/${bankBin}-${cleanAccountNo}-compact.png?amount=${amountPerPax}&addInfo=${encodeURIComponent(
    memo
  )}&accountName=${encodeURIComponent(accountName)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleTogglePaid = async (memberId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setLocalMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, has_paid: nextStatus } : m))
    );
    await toggleMemberPaidStatus(memberId, nextStatus);
  };

  const paidCount = localMembers.filter((m) => m.has_paid).length;
  const totalCount = Math.max(1, localMembers.length);

  return (
    <Card className="border-teal-300/80 bg-gradient-to-br from-teal-50/70 via-white to-orange-50/40 dark:border-teal-800 dark:from-teal-950/30 dark:via-[#101929] dark:to-[#101929] overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#e7dfd3] dark:border-[#1e2d45]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="emerald" className="gap-1.5 px-3 py-1">
            <QrCode className="h-3.5 w-3.5" />
            VietQR Napas247 • Chia tiền tự động
          </Badge>
          <div className="text-xs font-bold text-[#0f766e] dark:text-teal-300">
            {paidCount}/{totalCount} thành viên đã nộp quỹ
          </div>
        </div>

        <CardTitle className="text-lg font-heading mt-2">
          Hóa Đơn Chốt Kèo & Quét Mã Nộp Quỹ Chuyến Đi
        </CardTitle>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Chuyến đi: <strong>{tripName}</strong> • Mã định danh:{" "}
          <span className="font-mono font-bold text-[#c2410c]">{inviteCode}</span>
        </p>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* VietQR Code Display */}
          <div className="md:col-span-5 flex flex-col items-center text-center space-y-3">
            <div className="relative rounded-2xl border-2 border-[#0f766e]/30 bg-white p-3 shadow-md dark:border-teal-500/40">
              <Image
                src={qrUrl}
                alt={`Mã VietQR chuyển tiền ${formatVND(amountPerPax)}`}
                width={240}
                height={240}
                unoptimized
                className="rounded-xl object-contain mx-auto"
              />
              <div className="mt-2 text-[11px] font-semibold text-slate-500">
                Mở app Ngân hàng bất kỳ để quét mã
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              asChild
              className="gap-1.5 text-xs font-bold"
            >
              <a href={qrUrl} download={`VietQR-${inviteCode}.png`} target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" /> Tải ảnh mã QR
              </a>
            </Button>
          </div>

          {/* Account & Amount Details */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-4 dark:border-[#1e2d45] dark:bg-[#172338]">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Số tiền mỗi người cần đóng:
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <div className="text-2xl font-extrabold text-[#0f766e] dark:text-teal-300 price-num">
                  {formatVND(amountPerPax)}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(String(amountPerPax), "amount")}
                  className="h-8 gap-1 text-xs"
                >
                  {copiedField === "amount" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Sao chép số tiền
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-[#e7dfd3] bg-white p-3 dark:border-[#1e2d45] dark:bg-[#101929]">
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-[#0f766e]" /> Ngân hàng
                </div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">
                  {bankName}
                </div>
              </div>

              <div className="rounded-xl border border-[#e7dfd3] bg-white p-3 dark:border-[#1e2d45] dark:bg-[#101929]">
                <div className="text-slate-500 dark:text-slate-400">Số tài khoản</div>
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white mt-1">
                  <span>{cleanAccountNo}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cleanAccountNo, "acc")}
                    className="text-[#0f766e] hover:underline cursor-pointer"
                  >
                    {copiedField === "acc" ? "Đã chép" : "Chép"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#e7dfd3] bg-white p-3 dark:border-[#1e2d45] dark:bg-[#101929]">
                <div className="text-slate-500 dark:text-slate-400">Chủ tài khoản</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">
                  {accountName}
                </div>
              </div>

              <div className="rounded-xl border border-[#e7dfd3] bg-white p-3 dark:border-[#1e2d45] dark:bg-[#101929]">
                <div className="text-slate-500 dark:text-slate-400">Nội dung chuyển khoản</div>
                <div className="flex items-center justify-between font-mono font-bold text-[#c2410c] mt-1">
                  <span>{memo}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(memo, "memo")}
                    className="text-[#0f766e] hover:underline cursor-pointer"
                  >
                    {copiedField === "memo" ? "Đã chép" : "Chép"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Collection Status List */}
        {localMembers.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-[#e7dfd3] dark:border-[#1e2d45]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Users className="h-4 w-4 text-[#0f766e]" />
                Theo dõi tình trạng nộp quỹ ({paidCount}/{localMembers.length})
              </span>
              {isOwner && (
                <span className="text-[11px] text-slate-500">
                  (Nhấp vào nút để cập nhật trạng thái đã nộp)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {localMembers.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 text-xs transition-colors ${
                    member.has_paid
                      ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-[#e7dfd3] bg-white dark:border-[#1e2d45] dark:bg-[#101929]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {member.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {member.nickname} {member.role === "owner" && "👑"}
                    </span>
                  </div>

                  {isOwner ? (
                    <Button
                      size="sm"
                      variant={member.has_paid ? "default" : "outline"}
                      className={`h-7 px-2 text-[11px] ${
                        member.has_paid ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                      }`}
                      onClick={() => handleTogglePaid(member.id, member.has_paid)}
                    >
                      {member.has_paid ? (
                        <>
                          <Check className="h-3 w-3 mr-0.5" /> Đã nộp
                        </>
                      ) : (
                        "Chưa nộp"
                      )}
                    </Button>
                  ) : (
                    <Badge variant={member.has_paid ? "emerald" : "secondary"}>
                      {member.has_paid ? "Đã nộp" : "Chờ nộp"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Giao dịch chuyển khoản trực tiếp vào tài khoản của Trưởng nhóm theo chuẩn VietQR Napas247, không mất phí trung gian.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
