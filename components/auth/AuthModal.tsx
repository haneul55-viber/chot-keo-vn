"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  CreditCard,
  LogOut,
  Mail,
  QrCode,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VIETNAMESE_BANKS } from "@/data/banks";
import { updateUserBankProfile } from "@/lib/supabase/trips";
import { useAuth } from "@/lib/hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const {
    user,
    profile,
    isConfigured,
    signInWithGoogle,
    signInWithOtp,
    signOut,
    refreshProfile,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<"auth" | "bank">("auth");

  // Bank profile state
  const [bankBin, setBankBin] = useState(profile?.bank_bin ?? "970422");
  const [accountNo, setAccountNo] = useState(profile?.bank_account_no ?? "");
  const [accountName, setAccountName] = useState(
    profile?.bank_account_name ?? ""
  );
  const [savingBank, setSavingBank] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoadingEmail(true);
    const { error } = await signInWithOtp(email.trim());
    setLoadingEmail(false);
    if (!error) {
      setEmailSent(true);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingBank(true);
    const selectedBank = VIETNAMESE_BANKS.find((b) => b.bin === bankBin);
    const success = await updateUserBankProfile(user.id, {
      bankBin,
      bankName: selectedBank?.shortName ?? "Ngân hàng",
      accountNo: accountNo.trim(),
      accountName: accountName.trim(),
    });
    setSavingBank(false);
    if (success) {
      setSaveSuccess(true);
      await refreshProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3 w-3" />
              ChotKeo Cloud
            </Badge>
          </div>
          <DialogTitle className="text-xl font-heading font-bold text-slate-900 dark:text-white mt-1">
            {user ? "Tài khoản Trưởng nhóm" : "Đăng nhập ChotKeo.vn"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Quản lý chuyến đi trên đám mây và cấu hình tài khoản nhận tiền cọc VietQR."
              : "Đăng nhập để lưu trữ chuyến đi vĩnh viễn, mở phòng bình chọn và mời bạn bè cùng chốt kèo."}
          </DialogDescription>
        </DialogHeader>

        {!isConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Chưa liên kết Supabase Backend</span>
            </div>
            <p className="leading-relaxed">
              Để kích hoạt đăng nhập và đồng bộ Realtime, bạn chỉ cần điền 2 biến môi trường vào tệp <code>.env.local</code> (theo mẫu trong <code>supabase/schema.sql</code>):
            </p>
            <pre className="rounded-lg bg-amber-100/80 p-2 font-mono text-[11px] dark:bg-amber-950">
              NEXT_PUBLIC_SUPABASE_URL=https://your-id.supabase.co{"\n"}
              NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
            </pre>
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="flex items-center justify-between rounded-2xl border border-[#e7dfd3] bg-[#faf7f2] p-3.5 dark:border-[#1e2d45] dark:bg-[#172338]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f766e] text-white font-bold">
                  {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={signOut} className="text-rose-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Tab selection */}
            <div className="flex gap-2 border-b border-[#e7dfd3] pb-2 dark:border-[#1e2d45]">
              <button
                type="button"
                onClick={() => setActiveTab("auth")}
                className={`pb-1 text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "auth"
                    ? "border-b-2 border-[#0f766e] text-[#0f766e] dark:text-teal-400"
                    : "text-slate-500"
                }`}
              >
                Thông tin tài khoản
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bank")}
                className={`pb-1 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === "bank"
                    ? "border-b-2 border-[#0f766e] text-[#0f766e] dark:text-teal-400"
                    : "text-slate-500"
                }`}
              >
                <QrCode className="h-3.5 w-3.5" /> Cài đặt VietQR nhận tiền
              </button>
            </div>

            {activeTab === "auth" ? (
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Tài khoản của bạn đã kích hoạt tính năng <strong>Trưởng nhóm (Host)</strong>. Khi lưu chuyến đi ở Bước 7, kế hoạch sẽ tự động tạo một mã mời 8 ký tự để gửi vào Zalo cho bạn bè bình chọn.
                </p>
                <div className="pt-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setActiveTab("bank")}
                  >
                    <CreditCard className="h-4 w-4" /> Cài đặt Số tài khoản ngân hàng VietQR
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveBank} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngân hàng nhận tiền:
                  </label>
                  <select
                    value={bankBin}
                    onChange={(e) => setBankBin(e.target.value)}
                    className="w-full rounded-xl border border-[#d6cbb9] bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-200"
                  >
                    {VIETNAMESE_BANKS.map((b) => (
                      <option key={b.bin} value={b.bin}>
                        {b.shortName} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Số tài khoản:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 0987654321"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full rounded-xl border border-[#d6cbb9] bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tên chủ tài khoản (in hoa không dấu):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: NGUYEN VAN A"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-[#d6cbb9] bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saveSuccess ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <Check className="h-4 w-4" /> Đã lưu tài khoản VietQR!
                    </span>
                  ) : <span />}

                  <Button type="submit" size="sm" disabled={savingBank}>
                    {savingBank ? "Đang lưu..." : "Lưu thông tin"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={signInWithGoogle}
              className="w-full h-11 justify-center gap-2 border-[#d6cbb9] hover:bg-slate-50 dark:border-[#1e2d45] dark:hover:bg-[#172338]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.22 0 10.06 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>Tiếp tục với tài khoản Google</span>
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#e7dfd3] dark:border-[#1e2d45]" />
              <span className="bg-white px-2 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-900">
                hoặc email
              </span>
            </div>

            {/* Email OTP Login */}
            {emailSent ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-center text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="mx-auto h-6 w-6 text-emerald-600 mb-1" />
                <div className="font-bold">Đã gửi liên kết đăng nhập!</div>
                <p className="mt-1">
                  Kiểm tra hòm thư <strong>{email}</strong> và nhấn vào liên kết để đăng nhập vào ChotKeo.vn.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Địa chỉ Email của bạn:
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="ban@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#d6cbb9] bg-white pl-9 pr-3 py-2 text-xs outline-none focus:border-[#0f766e] dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-200"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loadingEmail}
                  className="w-full h-10"
                >
                  {loadingEmail ? "Đang gửi mã..." : "Gửi liên kết đăng nhập qua Email"}
                </Button>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
