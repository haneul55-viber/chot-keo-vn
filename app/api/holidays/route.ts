import { NextRequest, NextResponse } from "next/server";
import { analyzeTripHolidays, getAllHolidays } from "@/lib/holidays";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const holidays = getAllHolidays();

  if (!startDate || !endDate) {
    return NextResponse.json({ holidays });
  }

  const analysis = analyzeTripHolidays(startDate, endDate, holidays);
  return NextResponse.json({
    holidays,
    analysis,
  });
}
