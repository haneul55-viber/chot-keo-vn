import { NextRequest, NextResponse } from "next/server";
import { withProviderCache } from "@/lib/cache";
import { getLodgingProvider } from "@/lib/providers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const destinationId = searchParams.get("destinationId") ?? "da-lat";
    const startDate = searchParams.get("startDate") ?? "2026-11-15";
    const endDate = searchParams.get("endDate") ?? "2026-11-18";

    const cacheKey = `lodging:${destinationId}:${startDate}:${endDate}`;
    const provider = getLodgingProvider();
    const result = await withProviderCache(cacheKey, () =>
      provider.searchLodging({ destinationId, startDate, endDate })
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "LODGING_FETCH_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu lưu trú.",
      },
      { status: 500 }
    );
  }
}
