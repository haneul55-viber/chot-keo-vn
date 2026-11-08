import { getDestinationById, haversineDistanceKm } from "@/data/destinations";
import { createSeededRng, roundToVndStep } from "@/lib/hash";
import { FlightOption, ProviderResponse } from "@/lib/types";
import { FlightProvider, FlightQuery } from "./types";

/**
 * Phase 1: Deterministic Mock Flight Provider
 * Generates realistic roundtrip fares across Vietnam Airlines, Vietjet Air,
 * Bamboo Airways, and Vietravel Airlines calibrated by route distance & date.
 */
export class MockFlightProvider implements FlightProvider {
  readonly name = "ChotKeo Flight Aggregator (Mock v1)";

  async searchFlights(
    query: FlightQuery
  ): Promise<ProviderResponse<FlightOption>> {
    const origin = getDestinationById(query.originId);
    const dest = getDestinationById(query.destinationId);
    const fetchedAt = new Date().toISOString();

    if (
      !origin ||
      !dest ||
      origin.id === dest.id ||
      !origin.airportCode ||
      !dest.airportCode ||
      origin.airportCode === dest.airportCode
    ) {
      return {
        min: 0,
        max: 0,
        items: [],
        source: this.name,
        fetchedAt,
      };
    }

    const distanceKm = Math.max(
      220,
      haversineDistanceKm(origin.lat, origin.lng, dest.lat, dest.lng)
    );

    // Subtle weekday variation based on departure date (non-holiday baseline)
    const rng = createSeededRng(
      `flight:${origin.id}:${dest.id}:${query.startDate}:${query.endDate}`
    );
    const dateJitter = 0.94 + rng() * 0.14; // 0.94 -> 1.08

    // Baseline roundtrip airfare formula in Vietnam (taxes & fees included):
    // ~220km (SGN-DLI / SGN-PQC): ~1.65M - 3.2M
    // ~600-800km (SGN-DAD / HAN-DAD): ~2.1M - 3.9M
    // ~1150km+ (SGN-HAN / HAN-PQC): ~2.7M - 5.1M
    const baseEconomy = (1250000 + distanceKm * 1250) * dateJitter;
    const flightDuration = Math.max(50, Math.round(35 + (distanceKm / 780) * 60));

    const addMinutes = (time: string, mins: number): string => {
      const [h, m] = time.split(":").map(Number);
      const total = h * 60 + m + mins;
      const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
      const mm = String(total % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    };

    const routeDigits = String(100 + Math.floor(rng() * 799));

    const rawItems: FlightOption[] = [
      {
        id: `vj-early-${origin.id}-${dest.id}`,
        airline: "Vietjet Air",
        airlineCode: "VJ",
        outboundFlightNo: `VJ${routeDigits}`,
        inboundFlightNo: `VJ${Number(routeDigits) + 3}`,
        outboundDepart: "06:15",
        outboundArrive: addMinutes("06:15", flightDuration),
        inboundDepart: "20:45",
        inboundArrive: addMinutes("20:45", flightDuration),
        durationMinutes: flightDuration,
        cabinClass: "Eco Tiết kiệm",
        baggageIncluded: "07 kg xách tay",
        baseRoundtripPerPerson: roundToVndStep(baseEconomy * 0.88, 10000),
        bookingUrl: `https://www.vietjetair.com/vi`,
      },
      {
        id: `vu-mid-${origin.id}-${dest.id}`,
        airline: "Vietravel Airlines",
        airlineCode: "VU",
        outboundFlightNo: `VU${Number(routeDigits) + 120}`,
        inboundFlightNo: `VU${Number(routeDigits) + 125}`,
        outboundDepart: "08:40",
        outboundArrive: addMinutes("08:40", flightDuration + 5),
        inboundDepart: "17:20",
        inboundArrive: addMinutes("17:20", flightDuration + 5),
        durationMinutes: flightDuration + 5,
        cabinClass: "Phổ thông linh hoạt",
        baggageIncluded: "07 kg xách tay + 20 kg ký gửi",
        baseRoundtripPerPerson: roundToVndStep(baseEconomy * 1.02, 10000),
        bookingUrl: `https://www.vietravelairlines.com`,
      },
      {
        id: `qh-prime-${origin.id}-${dest.id}`,
        airline: "Bamboo Airways",
        airlineCode: "QH",
        outboundFlightNo: `QH${Number(routeDigits) + 50}`,
        inboundFlightNo: `QH${Number(routeDigits) + 55}`,
        outboundDepart: "10:15",
        outboundArrive: addMinutes("10:15", flightDuration),
        inboundDepart: "16:10",
        inboundArrive: addMinutes("16:10", flightDuration),
        durationMinutes: flightDuration,
        cabinClass: "Economy Smart",
        baggageIncluded: "07 kg xách tay + 20 kg ký gửi",
        baseRoundtripPerPerson: roundToVndStep(baseEconomy * 1.18, 10000),
        bookingUrl: `https://www.bambooairways.com`,
      },
      {
        id: `vn-flagship-${origin.id}-${dest.id}`,
        airline: "Vietnam Airlines",
        airlineCode: "VN",
        outboundFlightNo: `VN${1100 + Math.floor(rng() * 500)}`,
        inboundFlightNo: `VN${1605 + Math.floor(rng() * 300)}`,
        outboundDepart: "09:00",
        outboundArrive: addMinutes("09:00", flightDuration),
        inboundDepart: "18:00",
        inboundArrive: addMinutes("18:00", flightDuration),
        durationMinutes: flightDuration,
        cabinClass: "Phổ thông tiêu chuẩn",
        baggageIncluded: "10 kg xách tay + 23 kg ký gửi + suất ăn nhẹ",
        baseRoundtripPerPerson: roundToVndStep(baseEconomy * 1.42, 10000),
        bookingUrl: `https://www.vietnamairlines.com/vn/vi/home`,
      },
      {
        id: `vn-flex-${origin.id}-${dest.id}`,
        airline: "Vietnam Airlines",
        airlineCode: "VN",
        outboundFlightNo: `VN${1210 + Math.floor(rng() * 200)}`,
        inboundFlightNo: `VN${1715 + Math.floor(rng() * 200)}`,
        outboundDepart: "11:30",
        outboundArrive: addMinutes("11:30", flightDuration),
        inboundDepart: "15:30",
        inboundArrive: addMinutes("15:30", flightDuration),
        durationMinutes: flightDuration,
        cabinClass: "Phổ thông linh hoạt (Đổi vé miễn phí)",
        baggageIncluded: "12 kg xách tay + 23 kg ký gửi",
        baseRoundtripPerPerson: roundToVndStep(baseEconomy * 1.68, 10000),
        bookingUrl: `https://www.vietnamairlines.com/vn/vi/home`,
      },
    ];

    const items = rawItems.sort(
      (a, b) => a.baseRoundtripPerPerson - b.baseRoundtripPerPerson
    );

    return {
      min: items[0].baseRoundtripPerPerson,
      max: items[items.length - 1].baseRoundtripPerPerson,
      items,
      source: `${this.name} (${origin.airportCode} ⇄ ${dest.airportCode})`,
      fetchedAt,
    };
  }
}

/**
 * Phase 2 Stub: Amadeus / Skyscanner Partner Flight API
 * Required env vars:
 * - AMADEUS_CLIENT_ID
 * - AMADEUS_CLIENT_SECRET
 * - SKYSCANNER_PARTNER_KEY (optional fallback)
 */
export class AmadeusFlightProviderStub implements FlightProvider {
  readonly name = "Amadeus Self-Service Flight Offers API (Phase 2 Stub)";

  async searchFlights(query: FlightQuery): Promise<ProviderResponse<FlightOption>> {
    void query;
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error(
        "Missing AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET. Set FLIGHT_PROVIDER=mock or configure credentials."
      );
    }
    // TODO Phase 2: Exchange OAuth2 token at https://api.amadeus.com/v1/security/oauth2/token
    // and query GET /v2/shopping/flight-offers with currencyCode=VND.
    throw new Error("AmadeusFlightProviderStub is a Phase 2 placeholder.");
  }
}
