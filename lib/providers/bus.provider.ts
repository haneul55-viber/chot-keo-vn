import { getDestinationById, haversineDistanceKm } from "@/data/destinations";
import { createSeededRng, roundToVndStep } from "@/lib/hash";
import { BusOption, ProviderResponse } from "@/lib/types";
import { BusProvider, BusQuery } from "./types";

/**
 * Phase 1: Deterministic Mock Sleeper Bus & Limousine Provider
 * Includes major Vietnamese operators: Phương Trang (FUTA), Thành Bưởi,
 * Hoàng Long, Kumho Samco, Sao Việt, Tràng An Limousine, etc.
 */
export class MockBusProvider implements BusProvider {
  readonly name = "ChotKeo Sleeper Bus & Limousine (Mock v1)";

  async searchBuses(query: BusQuery): Promise<ProviderResponse<BusOption>> {
    const origin = getDestinationById(query.originId);
    const dest = getDestinationById(query.destinationId);
    const fetchedAt = new Date().toISOString();

    if (!origin || !dest || origin.id === dest.id) {
      return {
        min: 0,
        max: 0,
        items: [],
        source: this.name,
        fetchedAt,
      };
    }

    const straightKm = haversineDistanceKm(
      origin.lat,
      origin.lng,
      dest.lat,
      dest.lng
    );
    // Road distance in Vietnam is typically ~1.28x straight-line distance
    const roadKm = Math.max(95, Math.round(straightKm * 1.28));
    const isIsland = dest.id === "phu-quoc";

    const rng = createSeededRng(
      `bus:${origin.id}:${dest.id}:${query.startDate}`
    );
    const jitter = 0.96 + rng() * 0.08;

    const baseDurationHrs = isIsland
      ? Math.round((roadKm / 52 + 2.2) * 2) / 2
      : Math.max(2, Math.round((roadKm / 55) * 2) / 2);

    // Roundtrip standard sleeper bus fare (~1,150 VND/km each way -> ~2,300 VND/km roundtrip, floor 320k)
    const baseStandardRoundtrip = Math.max(
      340000,
      roundToVndStep((220000 + roadKm * 1250 + (isIsland ? 520000 : 0)) * jitter, 10000)
    );

    const northernRoute =
      origin.region === "Miền Bắc" && dest.region === "Miền Bắc";
    const longNorthSouth = roadKm > 850;

    const op1 = northernRoute
      ? "Sao Việt / Hà Sơn Hải Vân"
      : "Phương Trang (FUTA Bus Lines)";
    const op2 = northernRoute
      ? "Tràng An Limousine"
      : longNorthSouth
      ? "Hoàng Long Express"
      : "Kumho Samco";
    const op3 = northernRoute
      ? "Inter Bus Lines Cabin Tình Nhân"
      : dest.id === "da-lat"
      ? "Thành Bưởi / Nguyễn Kim Limousine"
      : "Bình Minh Cung Điện Di Động";

    const islandNote = isIsland
      ? "Đã bao gồm xe giường nằm đến Rạch Giá/Hà Tiên + vé tàu cao tốc khứ hồi ra đảo"
      : undefined;

    const items: BusOption[] = [
      {
        id: `bus-std-${origin.id}-${dest.id}`,
        operator: op1,
        outboundDepart: roadKm < 220 ? "07:00" : "21:30",
        inboundDepart: roadKm < 220 ? "16:30" : "21:00",
        durationHours: baseDurationHrs,
        seatType:
          roadKm < 160
            ? "Ghế ngả Limousine (11 chỗ)"
            : "Giường nằm tiêu chuẩn (34 chỗ)",
        baseRoundtripPerPerson: baseStandardRoundtrip,
        pickupPoint: `Bến xe trung tâm ${origin.name}`,
        dropoffPoint: isIsland
          ? "Cảng Bãi Vòng Phú Quốc"
          : `Bến xe / Trung tâm ${dest.name}`,
        bookingUrl: "https://futabus.vn",
        note: islandNote,
      },
      {
        id: `bus-vip-${origin.id}-${dest.id}`,
        operator: op2,
        outboundDepart: roadKm < 220 ? "08:30" : "22:15",
        inboundDepart: roadKm < 220 ? "17:30" : "22:00",
        durationHours: Math.max(1.8, Number((baseDurationHrs - 0.5).toFixed(1))),
        seatType: "Limousine phòng đơn VIP (22 phòng rèm riêng)",
        baseRoundtripPerPerson: roundToVndStep(baseStandardRoundtrip * 1.32, 10000),
        pickupPoint: `Văn phòng trung tâm ${origin.name}`,
        dropoffPoint: `Nội thành ${dest.name} (trung chuyển miễn phí)`,
        bookingUrl: "https://vexere.com",
        note: islandNote,
      },
      {
        id: `bus-cabin-${origin.id}-${dest.id}`,
        operator: op3,
        outboundDepart: roadKm < 220 ? "09:30" : "22:45",
        inboundDepart: roadKm < 220 ? "18:00" : "22:30",
        durationHours: Math.max(1.8, Number((baseDurationHrs - 0.5).toFixed(1))),
        seatType: "Cabin Cung Điện VIP (Massage, màn hình riêng, WC)",
        baseRoundtripPerPerson: roundToVndStep(baseStandardRoundtrip * 1.58, 10000),
        pickupPoint: `Đón tại điểm hẹn ${origin.name}`,
        dropoffPoint: `Trả tận sảnh khách sạn trung tâm ${dest.name}`,
        bookingUrl: "https://vexere.com",
        note: islandNote,
      },
    ];

    if (!longNorthSouth) {
      items.splice(1, 0, {
        id: `bus-hanh-${origin.id}-${dest.id}`,
        operator: northernRoute ? "Camel Travel" : "Hạnh Cafe - Hà Phương",
        outboundDepart: roadKm < 220 ? "13:00" : "20:45",
        inboundDepart: roadKm < 220 ? "15:00" : "20:30",
        durationHours: Number((baseDurationHrs + 0.3).toFixed(1)),
        seatType: "Giường nằm 38 chỗ phổ thông",
        baseRoundtripPerPerson: roundToVndStep(baseStandardRoundtrip * 0.92, 10000),
        pickupPoint: `Phố du lịch ${origin.name}`,
        dropoffPoint: `Trung tâm ${dest.name}`,
        bookingUrl: "https://vexere.com",
        note: islandNote,
      });
    }

    items.sort((a, b) => a.baseRoundtripPerPerson - b.baseRoundtripPerPerson);

    return {
      min: items[0].baseRoundtripPerPerson,
      max: items[items.length - 1].baseRoundtripPerPerson,
      items,
      source: `${this.name} (~${roadKm} km đường bộ)`,
      fetchedAt,
    };
  }
}

/**
 * Phase 2 Stub: Vexere / FUTA Partner Bus API
 * Required env vars:
 * - VEXERE_PARTNER_TOKEN
 * - VEXERE_API_BASE_URL
 */
export class VexereBusProviderStub implements BusProvider {
  readonly name = "Vexere Partner API (Phase 2 Stub)";

  async searchBuses(query: BusQuery): Promise<ProviderResponse<BusOption>> {
    void query;
    if (!process.env.VEXERE_PARTNER_TOKEN) {
      throw new Error(
        "Missing VEXERE_PARTNER_TOKEN. Set BUS_PROVIDER=mock or configure partner credentials."
      );
    }
    throw new Error("VexereBusProviderStub is a Phase 2 placeholder.");
  }
}
