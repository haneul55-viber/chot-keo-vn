import { NextRequest, NextResponse } from "next/server";
import { withProviderCache } from "@/lib/cache";
import { getPlacesProvider } from "@/lib/providers";
import { MealBudgetLevel, MealSession } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const destinationId = searchParams.get("destinationId") ?? "da-lat";
    const nearLatRaw = searchParams.get("nearLat");
    const nearLngRaw = searchParams.get("nearLng");
    const session = (searchParams.get("session") ?? "all") as
      | MealSession
      | "all";
    const cuisine = searchParams.get("cuisine") ?? "all";
    const priceLevel = (searchParams.get("priceLevel") ?? "all") as
      | MealBudgetLevel
      | "all";
    const minRatingRaw = searchParams.get("minRating");

    const nearLat = nearLatRaw ? Number(nearLatRaw) : undefined;
    const nearLng = nearLngRaw ? Number(nearLngRaw) : undefined;
    const minRating = minRatingRaw ? Number(minRatingRaw) : undefined;

    const cacheKey = `places:${destinationId}:${nearLat ?? "c"}:${
      nearLng ?? "c"
    }:${session}:${cuisine}:${priceLevel}:${minRating ?? 0}`;

    const provider = getPlacesProvider();
    const result = await withProviderCache(cacheKey, () =>
      provider.searchRestaurants({
        destinationId,
        nearLat,
        nearLng,
        session,
        cuisine,
        priceLevel,
        minRating,
      })
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "PLACES_FETCH_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách quán ăn.",
      },
      { status: 500 }
    );
  }
}
