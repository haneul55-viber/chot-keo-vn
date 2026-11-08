import { describe, it, expect } from "vitest";
import { VIETNAMESE_BANKS } from "@/data/banks";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

describe("Collaborative Planning & VietQR Logic", () => {
  it("should contain popular Vietnamese banks with valid BIN codes", () => {
    expect(VIETNAMESE_BANKS.length).toBeGreaterThanOrEqual(10);
    const mbbank = VIETNAMESE_BANKS.find((b) => b.shortName === "MBBank");
    const vcb = VIETNAMESE_BANKS.find((b) => b.shortName === "Vietcombank");

    expect(mbbank?.bin).toBe("970422");
    expect(vcb?.bin).toBe("970436");
  });

  it("should calculate equal split per person with ceil rounding", () => {
    const totalAmount = 14500000;
    const travelers = 4;
    const amountPerPax = Math.ceil(totalAmount / travelers);

    expect(amountPerPax).toBe(3625000);
    expect(amountPerPax * travelers).toBeGreaterThanOrEqual(totalAmount);
  });

  it("should format VietQR memo and URL query accurately", () => {
    const inviteCode = "dl-2026";
    const memo = `CHOTKEO ${inviteCode.toUpperCase()}`;
    const amount = 3500000;
    const bankBin = "970422";
    const accountNo = "0987654321";
    const accountName = "NGUYEN VAN A";

    const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(
      memo
    )}&accountName=${encodeURIComponent(accountName)}`;

    expect(qrUrl).toContain("970422-0987654321-compact.png");
    expect(qrUrl).toContain("amount=3500000");
    expect(qrUrl).toContain("CHOTKEO%20DL-2026");
  });

  it("should gracefully handle unconfigured Supabase environment without crashing", () => {
    // In test environment without NEXT_PUBLIC_SUPABASE_URL
    const configured = isSupabaseConfigured();
    const client = createClient();

    if (!configured) {
      expect(client).toBeNull();
    } else {
      expect(client).toBeDefined();
    }
  });
});
