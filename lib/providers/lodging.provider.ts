import { getDestinationById } from "@/data/destinations";
import { createSeededRng, roundToVndStep } from "@/lib/hash";
import {
  LodgingOption,
  LodgingPlatform,
  LodgingType,
  ProviderResponse,
} from "@/lib/types";
import { LodgingProvider, LodgingQuery } from "./types";

interface SeedLodgingTemplate {
  name: string;
  type: LodgingType;
  areaIdx: number;
  rating: number;
  reviewCount: number;
  baseNightly: number;
  platform: LodgingPlatform;
  imageGradient: string;
  imageLabel: string;
  amenities: string[];
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  dLat: number;
  dLng: number;
}

const DESTINATION_LODGING_SEEDS: Record<string, SeedLodgingTemplate[]> = {
  "da-lat": [
    {
      name: "Dalat Note Hostel & Rooftop",
      type: "hostel",
      areaIdx: 0,
      rating: 4.4,
      reviewCount: 382,
      baseNightly: 280000,
      platform: "Booking.com",
      imageGradient: "from-teal-700 via-emerald-700 to-slate-900",
      imageLabel: "Hostel ấm cúng trung tâm",
      amenities: ["Wifi miễn phí", "Bãi đỗ xe", "Sân thượng BBQ"],
      freeCancellation: true,
      breakfastIncluded: false,
      dLat: 0.004,
      dLng: -0.008,
    },
    {
      name: "Đợi Một Người Homestay & Cafe",
      type: "homestay",
      areaIdx: 1,
      rating: 4.7,
      reviewCount: 645,
      baseNightly: 620000,
      platform: "Agoda",
      imageGradient: "from-emerald-600 via-teal-700 to-cyan-900",
      imageLabel: "Homestay giữa rừng thông",
      amenities: ["Wifi miễn phí", "View đồi thông", "Sân thượng BBQ", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.028,
      dLng: -0.015,
    },
    {
      name: "LengKeng Da Lat Homestay Săn Mây",
      type: "homestay",
      areaIdx: 2,
      rating: 4.6,
      reviewCount: 518,
      baseNightly: 750000,
      platform: "Traveloka",
      imageGradient: "from-sky-600 via-indigo-700 to-slate-900",
      imageLabel: "View thung lũng mây",
      amenities: ["Wifi miễn phí", "View đồi thông", "Sân thượng BBQ"],
      freeCancellation: false,
      breakfastIncluded: true,
      dLat: 0.016,
      dLng: 0.028,
    },
    {
      name: "Colline Hotel Dalat Center",
      type: "hotel",
      areaIdx: 0,
      rating: 4.7,
      reviewCount: 2140,
      baseNightly: 1450000,
      platform: "Agoda",
      imageGradient: "from-amber-600 via-orange-700 to-stone-900",
      imageLabel: "Khách sạn 4★ ngay Chợ Đêm",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Phòng Gym", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.001,
      dLng: -0.019,
    },
    {
      name: "Hôtel Du Parc Đà Lạt Heritage",
      type: "hotel",
      areaIdx: 3,
      rating: 4.5,
      reviewCount: 1320,
      baseNightly: 1180000,
      platform: "Trivago",
      imageGradient: "from-stone-600 via-amber-800 to-zinc-900",
      imageLabel: "Kiến trúc Pháp cổ điển",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Spa", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.005,
      dLng: -0.016,
    },
    {
      name: "Terracotta Hotel & Resort Tuyền Lâm",
      type: "resort",
      areaIdx: 1,
      rating: 4.6,
      reviewCount: 2890,
      baseNightly: 1680000,
      platform: "Booking.com",
      imageGradient: "from-emerald-700 via-green-800 to-slate-950",
      imageLabel: "Resort ven hồ Tuyền Lâm",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View đồi thông", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.041,
      dLng: -0.022,
    },
    {
      name: "Ana Mandara Villas Dalat Resort & Spa",
      type: "resort",
      areaIdx: 3,
      rating: 4.9,
      reviewCount: 1580,
      baseNightly: 3250000,
      platform: "Agoda",
      imageGradient: "from-amber-500 via-rose-700 to-slate-900",
      imageLabel: "Biệt thự nghỉ dưỡng 5★",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "Spa", "Đưa đón sân bay", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.003,
      dLng: -0.026,
    },
  ],
  "da-nang": [
    {
      name: "Rom Casa Hostel Da Nang (Container Pool)",
      type: "hostel",
      areaIdx: 2,
      rating: 4.5,
      reviewCount: 490,
      baseNightly: 310000,
      platform: "Booking.com",
      imageGradient: "from-cyan-600 via-sky-700 to-slate-900",
      imageLabel: "Hostel trẻ trung gần biển",
      amenities: ["Wifi miễn phí", "Hồ bơi"],
      freeCancellation: true,
      breakfastIncluded: false,
      dLat: -0.008,
      dLng: 0.042,
    },
    {
      name: "An Thượng Beachside Homestay",
      type: "homestay",
      areaIdx: 2,
      rating: 4.6,
      reviewCount: 530,
      baseNightly: 580000,
      platform: "Agoda",
      imageGradient: "from-teal-500 via-emerald-700 to-slate-900",
      imageLabel: "Đi bộ 3 phút ra Mỹ Khê",
      amenities: ["Wifi miễn phí", "View biển", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: false,
      dLat: -0.011,
      dLng: 0.044,
    },
    {
      name: "Vanda Hotel Da Nang (Cầu Rồng)",
      type: "hotel",
      areaIdx: 1,
      rating: 4.7,
      reviewCount: 1920,
      baseNightly: 1250000,
      platform: "Traveloka",
      imageGradient: "from-indigo-600 via-blue-800 to-slate-950",
      imageLabel: "View trực diện Cầu Rồng",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "Spa", "Phòng Gym"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.006,
      dLng: 0.021,
    },
    {
      name: "Sala Danang Beach Hotel",
      type: "hotel",
      areaIdx: 0,
      rating: 4.8,
      reviewCount: 3410,
      baseNightly: 1620000,
      platform: "Agoda",
      imageGradient: "from-sky-500 via-cyan-700 to-blue-950",
      imageLabel: "Hồ bơi vô cực biển Mỹ Khê",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Đưa đón sân bay", "Phòng Gym"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.008,
      dLng: 0.045,
    },
    {
      name: "TMS Hotel Da Nang Beach",
      type: "hotel",
      areaIdx: 0,
      rating: 4.8,
      reviewCount: 2280,
      baseNightly: 2150000,
      platform: "Trivago",
      imageGradient: "from-blue-600 via-indigo-700 to-slate-900",
      imageLabel: "Khách sạn 5★ mặt biển",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Spa", "Phòng Gym"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.002,
      dLng: 0.046,
    },
    {
      name: "Furama Resort Danang",
      type: "resort",
      areaIdx: 0,
      rating: 4.8,
      reviewCount: 3150,
      baseNightly: 3850000,
      platform: "Booking.com",
      imageGradient: "from-emerald-500 via-teal-700 to-cyan-950",
      imageLabel: "Resort biển nhiệt đới 5★",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Spa", "Đưa đón sân bay", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.018,
      dLng: 0.049,
    },
  ],
  "nha-trang": [
    {
      name: "Tabalo Hostel Nha Trang",
      type: "hostel",
      areaIdx: 0,
      rating: 4.5,
      reviewCount: 410,
      baseNightly: 260000,
      platform: "Booking.com",
      imageGradient: "from-cyan-600 via-teal-700 to-slate-900",
      imageLabel: "Cabin gỗ cách biển 200m",
      amenities: ["Wifi miễn phí"],
      freeCancellation: true,
      breakfastIncluded: false,
      dLat: 0.002,
      dLng: -0.003,
    },
    {
      name: "An An Homestay Vĩnh Hòa",
      type: "homestay",
      areaIdx: 2,
      rating: 4.6,
      reviewCount: 365,
      baseNightly: 540000,
      platform: "Agoda",
      imageGradient: "from-teal-500 via-sky-700 to-slate-900",
      imageLabel: "Homestay yên tĩnh ven vịnh",
      amenities: ["Wifi miễn phí", "View biển", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: false,
      dLat: 0.042,
      dLng: 0.012,
    },
    {
      name: "Novotel Nha Trang Trần Phú",
      type: "hotel",
      areaIdx: 0,
      rating: 4.7,
      reviewCount: 2450,
      baseNightly: 1750000,
      platform: "Agoda",
      imageGradient: "from-sky-500 via-blue-700 to-indigo-950",
      imageLabel: "100% phòng ban công hướng biển",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Spa", "Phòng Gym"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.004,
      dLng: 0.001,
    },
    {
      name: "Havana Nha Trang Hotel",
      type: "hotel",
      areaIdx: 0,
      rating: 4.6,
      reviewCount: 3890,
      baseNightly: 1290000,
      platform: "Traveloka",
      imageGradient: "from-amber-500 via-orange-700 to-slate-900",
      imageLabel: "Đường hầm riêng ra bãi biển",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Spa"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.005,
      dLng: 0.001,
    },
    {
      name: "Amiana Resort Nha Trang",
      type: "resort",
      areaIdx: 2,
      rating: 4.9,
      reviewCount: 2790,
      baseNightly: 3650000,
      platform: "Booking.com",
      imageGradient: "from-emerald-500 via-cyan-700 to-slate-950",
      imageLabel: "Hồ bơi nước mặn tự nhiên & bãi tắm riêng",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Spa", "Đưa đón sân bay", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.055,
      dLng: 0.018,
    },
    {
      name: "Alma Resort Cam Ranh",
      type: "resort",
      areaIdx: 1,
      rating: 4.8,
      reviewCount: 1950,
      baseNightly: 3100000,
      platform: "Trivago",
      imageGradient: "from-cyan-500 via-blue-700 to-slate-950",
      imageLabel: "12 hồ bơi trải dài ra Bãi Dài",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Đưa đón sân bay", "Bãi đỗ xe"],
      freeCancellation: false,
      breakfastIncluded: true,
      dLat: -0.14,
      dLng: 0.025,
    },
  ],
  "phu-quoc": [
    {
      name: "9Station Hostel & Bar Dương Đông",
      type: "hostel",
      areaIdx: 0,
      rating: 4.5,
      reviewCount: 620,
      baseNightly: 340000,
      platform: "Booking.com",
      imageGradient: "from-teal-600 via-cyan-800 to-slate-900",
      imageLabel: "Hostel có hồ bơi lớn",
      amenities: ["Wifi miễn phí", "Hồ bơi", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: false,
      dLat: -0.072,
      dLng: -0.021,
    },
    {
      name: "Peace House Homestay Phú Quốc",
      type: "homestay",
      areaIdx: 0,
      rating: 4.7,
      reviewCount: 410,
      baseNightly: 680000,
      platform: "Agoda",
      imageGradient: "from-amber-500 via-teal-700 to-slate-900",
      imageLabel: "Bungalow sân vườn nhiệt đới",
      amenities: ["Wifi miễn phí", "Bãi đỗ xe", "Sân thượng BBQ"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.068,
      dLng: -0.018,
    },
    {
      name: "Sunset Beach Resort & Spa",
      type: "hotel",
      areaIdx: 0,
      rating: 4.6,
      reviewCount: 1840,
      baseNightly: 1580000,
      platform: "Traveloka",
      imageGradient: "from-orange-500 via-rose-700 to-slate-950",
      imageLabel: "Ngắm hoàng hôn sát biển Dương Đông",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Đưa đón sân bay"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.078,
      dLng: -0.024,
    },
    {
      name: "La Festa Phu Quoc, Curio Collection",
      type: "hotel",
      areaIdx: 1,
      rating: 4.8,
      reviewCount: 940,
      baseNightly: 2950000,
      platform: "Booking.com",
      imageGradient: "from-rose-500 via-amber-600 to-indigo-950",
      imageLabel: "View Cầu Hôn & pháo hoa đêm",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Spa", "Phòng Gym"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.255,
      dLng: 0.022,
    },
    {
      name: "Salinda Resort Phu Quoc Island",
      type: "resort",
      areaIdx: 3,
      rating: 4.9,
      reviewCount: 2320,
      baseNightly: 3750000,
      platform: "Agoda",
      imageGradient: "from-emerald-500 via-teal-700 to-slate-950",
      imageLabel: "Resort boutique 5★ Bãi Trường",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "View biển", "Spa", "Đưa đón sân bay", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.095,
      dLng: -0.019,
    },
  ],
  "ha-noi": [
    {
      name: "Old Quarter View Hanoi Hostel",
      type: "hostel",
      areaIdx: 0,
      rating: 4.6,
      reviewCount: 890,
      baseNightly: 320000,
      platform: "Booking.com",
      imageGradient: "from-amber-700 via-stone-800 to-slate-950",
      imageLabel: "Ngay ngã tư Phố Cổ Hàng Đường",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.005,
      dLng: -0.003,
    },
    {
      name: "Lacaito Homestay Phố Cổ",
      type: "homestay",
      areaIdx: 3,
      rating: 4.7,
      reviewCount: 340,
      baseNightly: 690000,
      platform: "Agoda",
      imageGradient: "from-emerald-700 via-stone-700 to-zinc-900",
      imageLabel: "Biệt thự Pháp cổ yên tĩnh",
      amenities: ["Wifi miễn phí", "Ban công xanh"],
      freeCancellation: true,
      breakfastIncluded: false,
      dLat: -0.011,
      dLng: -0.002,
    },
    {
      name: "La Siesta Classic Ma May",
      type: "hotel",
      areaIdx: 0,
      rating: 4.9,
      reviewCount: 3120,
      baseNightly: 1850000,
      platform: "Agoda",
      imageGradient: "from-amber-600 via-red-800 to-slate-950",
      imageLabel: "Boutique 4★ nổi tiếng Phố Cổ",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Spa", "Phòng Gym", "Đưa đón sân bay"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.006,
      dLng: 0.001,
    },
    {
      name: "Rey Hotel Hanoi Boutique",
      type: "hotel",
      areaIdx: 0,
      rating: 4.7,
      reviewCount: 980,
      baseNightly: 1380000,
      platform: "Traveloka",
      imageGradient: "from-teal-600 via-slate-800 to-zinc-950",
      imageLabel: "Cách Hồ Gươm 400m",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Rooftop Bar"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.001,
      dLng: 0.002,
    },
    {
      name: "InterContinental Hanoi Westlake",
      type: "resort",
      areaIdx: 1,
      rating: 4.8,
      reviewCount: 2150,
      baseNightly: 3450000,
      platform: "Trivago",
      imageGradient: "from-indigo-600 via-sky-800 to-slate-950",
      imageLabel: "Pavilion nổi trên mặt Hồ Tây",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "Spa", "Phòng Gym", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.031,
      dLng: -0.024,
    },
  ],
};

function buildGenericDestinationSeeds(destName: string): SeedLodgingTemplate[] {
  return [
    {
      name: `${destName} Backpackers Cozy Hostel`,
      type: "hostel",
      areaIdx: 0,
      rating: 4.4,
      reviewCount: 310,
      baseNightly: 290000,
      platform: "Booking.com",
      imageGradient: "from-teal-600 via-emerald-800 to-slate-900",
      imageLabel: "Hostel trung tâm tiện lợi",
      amenities: ["Wifi miễn phí", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: false,
      dLat: 0.004,
      dLng: -0.005,
    },
    {
      name: `Mộc Miên ${destName} Garden Homestay`,
      type: "homestay",
      areaIdx: 1,
      rating: 4.7,
      reviewCount: 485,
      baseNightly: 620000,
      platform: "Agoda",
      imageGradient: "from-emerald-600 via-teal-700 to-slate-900",
      imageLabel: "Không gian bản địa xanh mát",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Sân thượng BBQ", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.009,
      dLng: 0.011,
    },
    {
      name: `Grand Central ${destName} Boutique Hotel`,
      type: "hotel",
      areaIdx: 0,
      rating: 4.6,
      reviewCount: 1420,
      baseNightly: 1280000,
      platform: "Traveloka",
      imageGradient: "from-sky-600 via-indigo-800 to-slate-950",
      imageLabel: "Khách sạn 4★ trung tâm",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "Phòng Gym"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.002,
      dLng: 0.004,
    },
    {
      name: `Muong Thanh Luxury ${destName}`,
      type: "hotel",
      areaIdx: 2,
      rating: 4.5,
      reviewCount: 1890,
      baseNightly: 1550000,
      platform: "Trivago",
      imageGradient: "from-amber-600 via-orange-800 to-slate-900",
      imageLabel: "Phòng rộng rãi tầm nhìn thoáng",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "Spa", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: 0.012,
      dLng: -0.008,
    },
    {
      name: `Anantara / Victoria ${destName} Retreat & Spa`,
      type: "resort",
      areaIdx: 3,
      rating: 4.9,
      reviewCount: 1120,
      baseNightly: 3150000,
      platform: "Agoda",
      imageGradient: "from-emerald-500 via-cyan-700 to-slate-950",
      imageLabel: "Nghỉ dưỡng 5★ riêng tư",
      amenities: ["Wifi miễn phí", "Bữa sáng miễn phí", "Hồ bơi", "Spa", "Đưa đón sân bay", "Bãi đỗ xe"],
      freeCancellation: true,
      breakfastIncluded: true,
      dLat: -0.018,
      dLng: 0.019,
    },
  ];
}

const PLATFORM_SEARCH_URLS: Record<LodgingPlatform, (city: string) => string> = {
  Agoda: (city) =>
    `https://www.agoda.com/vi-vn/search?city=${encodeURIComponent(city)}`,
  "Booking.com": (city) =>
    `https://www.booking.com/searchresults.vi.html?ss=${encodeURIComponent(city)}`,
  Traveloka: (city) =>
    `https://www.traveloka.com/vi-vn/hotel/search?spec=${encodeURIComponent(city)}`,
  Trivago: (city) =>
    `https://www.trivago.vn/vi/srl?search=${encodeURIComponent(city)}`,
};

export class MockLodgingProvider implements LodgingProvider {
  readonly name = "ChotKeo Meta-OTA Lodging (Mock v1: Agoda / Booking / Traveloka / Trivago)";

  async searchLodging(
    query: LodgingQuery
  ): Promise<ProviderResponse<LodgingOption>> {
    const dest = getDestinationById(query.destinationId);
    const fetchedAt = new Date().toISOString();

    if (!dest) {
      return { min: 0, max: 0, items: [], source: this.name, fetchedAt };
    }

    const templates =
      DESTINATION_LODGING_SEEDS[dest.id] ??
      buildGenericDestinationSeeds(dest.name);

    const rng = createSeededRng(`lodging:${dest.id}:${query.startDate}`);

    const items: LodgingOption[] = templates.map((tpl, index) => {
      const subtleFactor = 0.95 + rng() * 0.12;
      const nightly = roundToVndStep(tpl.baseNightly * subtleFactor, 10000);
      const area =
        dest.popularAreas[tpl.areaIdx % dest.popularAreas.length] ??
        dest.popularAreas[0];

      return {
        id: `lod-${dest.id}-${index + 1}`,
        name: tpl.name,
        type: tpl.type,
        area,
        rating: tpl.rating,
        reviewCount: tpl.reviewCount,
        pricePerNight: nightly,
        platform: tpl.platform,
        deepLink: PLATFORM_SEARCH_URLS[tpl.platform](`${tpl.name} ${dest.name}`),
        imageGradient: tpl.imageGradient,
        imageLabel: tpl.imageLabel,
        amenities: tpl.amenities,
        freeCancellation: tpl.freeCancellation,
        breakfastIncluded: tpl.breakfastIncluded,
        lat: Number((dest.lat + tpl.dLat).toFixed(5)),
        lng: Number((dest.lng + tpl.dLng).toFixed(5)),
      };
    });

    items.sort((a, b) => a.pricePerNight - b.pricePerNight);

    return {
      min: items[0]?.pricePerNight ?? 0,
      max: items[items.length - 1]?.pricePerNight ?? 0,
      items,
      source: this.name,
      fetchedAt,
    };
  }
}

/**
 * Phase 2 Stub: Agoda / Booking.com / Trivago Affiliate Partner API
 * Required env vars:
 * - AGODA_AFFILIATE_CID
 * - AGODA_API_KEY
 * - BOOKING_AFFILIATE_ID
 */
export class AffiliateLodgingProviderStub implements LodgingProvider {
  readonly name = "OTA Affiliate Partner API (Phase 2 Stub)";

  async searchLodging(
    query: LodgingQuery
  ): Promise<ProviderResponse<LodgingOption>> {
    void query;
    if (!process.env.AGODA_API_KEY && !process.env.BOOKING_AFFILIATE_ID) {
      throw new Error(
        "Missing AGODA_API_KEY / BOOKING_AFFILIATE_ID. Keep LODGING_PROVIDER=mock in Phase 1."
      );
    }
    throw new Error("AffiliateLodgingProviderStub is a Phase 2 placeholder.");
  }
}
