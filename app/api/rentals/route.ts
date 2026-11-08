import { NextRequest, NextResponse } from "next/server";
import { withProviderCache } from "@/lib/cache";
import { getRentalProvider } from "@/lib/providers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const destinationId = searchParams.get("destinationId") ?? "da-lat";
    const startDate = searchParams.get("startDate") ?? "2026-11-15";

    const cacheKey = `rentals:${destinationId}:${startDate}`;
    const provider = getRentalProvider();
    const result = await withProviderCache(cacheKey, () =>
      provider.searchRentals({ destinationId, startDate })
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "RENTAL_FETCH_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách cửa hàng thuê xe máy.",
      },
      { status: 500 }
    );
  }
}
