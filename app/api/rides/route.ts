import { NextRequest, NextResponse } from "next/server";
import { withProviderCache } from "@/lib/cache";
import { getRideEstimateProvider } from "@/lib/providers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const destinationId = searchParams.get("destinationId") ?? "da-lat";

    const cacheKey = `rides:${destinationId}`;
    const provider = getRideEstimateProvider();
    const result = await withProviderCache(cacheKey, () =>
      provider.estimateRides({ destinationId })
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "RIDE_ESTIMATE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Không thể ước tính cước xe công nghệ.",
      },
      { status: 500 }
    );
  }
}
