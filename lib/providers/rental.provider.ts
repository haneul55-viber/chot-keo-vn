import { getDestinationById } from "@/data/destinations";
import { createSeededRng, roundToVndStep } from "@/lib/hash";
import { ProviderResponse, RentalShop } from "@/lib/types";
import { RentalProvider, RentalQuery } from "./types";

interface RentalSeed {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone: string;
  semiAuto: number;
  scooter: number;
  manual: number;
  depositRequirement: string;
  hotelDelivery: boolean;
  dLat: number;
  dLng: number;
}

const DESTINATION_RENTAL_SEEDS: Record<string, RentalSeed[]> = {
  "da-lat": [
    {
      name: "Thuê Xe Máy Mr. Định Đà Lạt",
      address: "11 Lý Tự Trọng, Phường 2, Đà Lạt",
      rating: 4.9,
      reviewCount: 620,
      phone: "0902 489 123",
      semiAuto: 100000,
      scooter: 130000,
      manual: 180000,
      depositRequirement: "CCCD gốc (Không giữ cọc tiền mặt)",
      hotelDelivery: true,
      dLat: 0.004,
      dLng: -0.017,
    },
    {
      name: "Happy Day Motorbike Rental",
      address: "127 Phan Bội Châu, Phường 1, Đà Lạt",
      rating: 4.8,
      reviewCount: 485,
      phone: "0263 398 999",
      semiAuto: 110000,
      scooter: 150000,
      manual: 200000,
      depositRequirement: "CCCD gốc, giao nhận tận bến xe / khách sạn",
      hotelDelivery: true,
      dLat: 0.001,
      dLng: -0.021,
    },
    {
      name: "Thảo My — Xe Ga Đời Mới Săn Mây",
      address: "42 Nguyễn Chí Thanh, Phường 1, Đà Lạt",
      rating: 4.7,
      reviewCount: 310,
      phone: "0938 712 456",
      semiAuto: 120000,
      scooter: 160000,
      manual: 230000,
      depositRequirement: "CCCD + 500.000 ₫ (hoàn trả ngay khi trả xe)",
      hotelDelivery: false,
      dLat: 0.002,
      dLng: -0.019,
    },
  ],
  "da-nang": [
    {
      name: "Bình Minh Motorbike Đà Nẵng",
      address: "36 Tạ Mỹ Duật, Sơn Trà, Đà Nẵng",
      rating: 4.9,
      reviewCount: 840,
      phone: "0986 862 986",
      semiAuto: 100000,
      scooter: 130000,
      manual: 190000,
      depositRequirement: "CCCD gốc + 500.000 ₫, tặng 1 lít xăng + 2 áo mưa",
      hotelDelivery: true,
      dLat: 0.012,
      dLng: 0.031,
    },
    {
      name: "Gia Huy — Giao Xe Sân Bay Đà Nẵng",
      address: "126/6 Trần Cao Vân, Thanh Khê, Đà Nẵng",
      rating: 4.8,
      reviewCount: 510,
      phone: "0903 529 586",
      semiAuto: 90000,
      scooter: 120000,
      manual: 180000,
      depositRequirement: "CCCD / Hộ chiếu, không thu cọc khách có vé khứ hồi",
      hotelDelivery: true,
      dLat: 0.016,
      dLng: -0.011,
    },
    {
      name: "Sơn Trà Adventure Bikes",
      address: "88 Hồ Nghinh, Phước Mỹ, Đà Nẵng",
      rating: 4.7,
      reviewCount: 295,
      phone: "0935 114 228",
      semiAuto: 110000,
      scooter: 150000,
      manual: 220000,
      depositRequirement: "CCCD + 1.000.000 ₫ (chuyên xe số đi Đỉnh Bàn Cờ)",
      hotelDelivery: true,
      dLat: 0.005,
      dLng: 0.041,
    },
  ],
  "nha-trang": [
    {
      name: "San Hô Việt Motorbike Nha Trang",
      address: "44 Hùng Vương, Lộc Thọ, Nha Trang",
      rating: 4.8,
      reviewCount: 540,
      phone: "0934 993 599",
      semiAuto: 100000,
      scooter: 140000,
      manual: 190000,
      depositRequirement: "CCCD gốc, miễn phí giao tận sảnh khách sạn Trần Phú",
      hotelDelivery: true,
      dLat: -0.004,
      dLng: -0.002,
    },
    {
      name: "Anh Cường Thuê Xe Máy Nha Trang",
      address: "08 Lý Tự Trọng, Lộc Thọ, Nha Trang",
      rating: 4.7,
      reviewCount: 390,
      phone: "0905 612 789",
      semiAuto: 110000,
      scooter: 150000,
      manual: 210000,
      depositRequirement: "CCCD + 500.000 ₫",
      hotelDelivery: true,
      dLat: 0.008,
      dLng: -0.001,
    },
  ],
  "phu-quoc": [
    {
      name: "Anh Phát — Giao Xe Sân Bay & Bến Tàu Phú Quốc",
      address: "92 Trần Hưng Đạo, Dương Đông, Phú Quốc",
      rating: 4.9,
      reviewCount: 680,
      phone: "0985 465 555",
      semiAuto: 120000,
      scooter: 150000,
      manual: 220000,
      depositRequirement: "Chụp ảnh CCCD + vé máy bay, không giữ cọc",
      hotelDelivery: true,
      dLat: -0.076,
      dLng: -0.022,
    },
    {
      name: "Thiên Phú Motorbike Đảo Ngọc",
      address: "79 Đường 30/4, Dương Đông, Phú Quốc",
      rating: 4.7,
      reviewCount: 410,
      phone: "0949 486 999",
      semiAuto: 130000,
      scooter: 170000,
      manual: 240000,
      depositRequirement: "CCCD gốc, kèm 2 mũ bảo hiểm có kính + áo mưa",
      hotelDelivery: true,
      dLat: -0.071,
      dLng: -0.016,
    },
  ],
  "ha-noi": [
    {
      name: "MOTOGO Hà Nội (Hệ thống thuê xe chuyên nghiệp)",
      address: "1081 Hồng Hà / 81 Nguyễn Khả Trạc, Hà Nội",
      rating: 4.9,
      reviewCount: 1150,
      phone: "0338 023 344",
      semiAuto: 120000,
      scooter: 160000,
      manual: 250000,
      depositRequirement: "Miễn đặt cọc cho khách có vé máy bay khứ hồi",
      hotelDelivery: true,
      dLat: 0.008,
      dLng: 0.007,
    },
    {
      name: "Phố Cổ Motorbike Rental Hàng Bạc",
      address: "26 Ngõ Trung Yên, Hoàn Kiếm, Hà Nội",
      rating: 4.7,
      reviewCount: 460,
      phone: "0942 467 674",
      semiAuto: 110000,
      scooter: 150000,
      manual: 220000,
      depositRequirement: "CCCD + 1.000.000 ₫",
      hotelDelivery: false,
      dLat: 0.005,
      dLng: -0.001,
    },
  ],
};

export class MockRentalProvider implements RentalProvider {
  readonly name = "ChotKeo Local Motorbike Shops (Mock v1)";

  async searchRentals(
    query: RentalQuery
  ): Promise<ProviderResponse<RentalShop>> {
    const dest = getDestinationById(query.destinationId);
    const fetchedAt = new Date().toISOString();

    if (!dest) {
      return { min: 0, max: 0, items: [], source: this.name, fetchedAt };
    }

    const rng = createSeededRng(`rental:${dest.id}:${query.startDate}`);
    const seeds: RentalSeed[] = DESTINATION_RENTAL_SEEDS[dest.id] ?? [
      {
        name: `MOTOGO / Minh Khang ${dest.name}`,
        address: `15 Đường Trung Tâm, ${dest.name}`,
        rating: 4.8,
        reviewCount: 430,
        phone: "0905 889 234",
        semiAuto: 110000,
        scooter: 140000,
        manual: 200000,
        depositRequirement: "CCCD gốc, miễn cọc khi có booking khách sạn",
        hotelDelivery: true,
        dLat: 0.003,
        dLng: -0.004,
      },
      {
        name: `Thuê Xe Máy Tuấn Anh ${dest.name}`,
        address: `82 Đại lộ Du Lịch, ${dest.name}`,
        rating: 4.7,
        reviewCount: 285,
        phone: "0988 341 567",
        semiAuto: 120000,
        scooter: 160000,
        manual: 220000,
        depositRequirement: "CCCD + 500.000 ₫",
        hotelDelivery: true,
        dLat: -0.005,
        dLng: 0.006,
      },
    ];

    const items: RentalShop[] = seeds.map((s, idx) => {
      const jitter = 0.96 + rng() * 0.08;
      return {
        id: `rent-${dest.id}-${idx + 1}`,
        name: s.name,
        address: s.address,
        area: dest.popularAreas[idx % dest.popularAreas.length] ?? dest.name,
        rating: s.rating,
        reviewCount: s.reviewCount,
        phone: s.phone,
        pricesPerDay: {
          semi_auto: roundToVndStep(s.semiAuto * jitter, 5000),
          scooter: roundToVndStep(s.scooter * jitter, 5000),
          manual: roundToVndStep(s.manual * jitter, 5000),
        },
        depositRequirement: s.depositRequirement,
        hotelDelivery: s.hotelDelivery,
        helmetsIncluded: true,
        lat: Number((dest.lat + s.dLat).toFixed(5)),
        lng: Number((dest.lng + s.dLng).toFixed(5)),
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${s.name} ${dest.name}`
        )}`,
      };
    });

    const allRates = items.flatMap((i) => [
      i.pricesPerDay.semi_auto,
      i.pricesPerDay.scooter,
      i.pricesPerDay.manual,
    ]);

    return {
      min: Math.min(...allRates),
      max: Math.max(...allRates),
      items,
      source: this.name,
      fetchedAt,
    };
  }
}

/**
 * Phase 2 Stub: Google Places Motorbike Rental Search
 * Required env var:
 * - GOOGLE_PLACES_API_KEY
 */
export class GooglePlacesRentalProviderStub implements RentalProvider {
  readonly name = "Google Places Rental Search (Phase 2 Stub)";

  async searchRentals(
    query: RentalQuery
  ): Promise<ProviderResponse<RentalShop>> {
    void query;
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      throw new Error("Missing GOOGLE_PLACES_API_KEY.");
    }
    throw new Error("GooglePlacesRentalProviderStub is a Phase 2 placeholder.");
  }
}
