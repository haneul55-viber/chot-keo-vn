import { getDestinationById } from "@/data/destinations";
import { getMealUnitRange } from "@/lib/pricing/engine";
import {
  MealBudgetLevel,
  MealSession,
  ProviderResponse,
  RestaurantPlace,
} from "@/lib/types";
import { PlacesProvider, PlacesQuery } from "./types";

interface SeedPlaceTemplate {
  name: string;
  specialty: string;
  cuisine: string;
  mealSessions: MealSession[];
  priceLevel: MealBudgetLevel;
  rating: number;
  reviewCount: number;
  address: string;
  areaIdx: number;
  dLat: number;
  dLng: number;
}

const DESTINATION_PLACE_SEEDS: Record<string, SeedPlaceTemplate[]> = {
  "da-lat": [
    {
      name: "Lẩu Gà Lá É Tao Ngộ",
      specialty: "Lẩu gà lá é măng tươi nóng hổi",
      cuisine: "Lẩu & Nướng",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "trung_binh",
      rating: 4.6,
      reviewCount: 4280,
      address: "05 Đường 3/4, Phường 3, Đà Lạt",
      areaIdx: 0,
      dLat: -0.011,
      dLng: -0.014,
    },
    {
      name: "Bánh Căn Lệ Đà Lạt",
      specialty: "Bánh căn trứng cút xíu mại chén nóng",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["breakfast", "lunch"],
      priceLevel: "binh_dan",
      rating: 4.5,
      reviewCount: 2890,
      address: "27/44 Yersin, Phường 10, Đà Lạt",
      areaIdx: 3,
      dLat: 0.002,
      dLng: -0.004,
    },
    {
      name: "Tiệm Nướng Túi Mơ To",
      specialty: "BBQ than hồng giữa vườn cúc họa mi view đồi",
      cuisine: "Lẩu & Nướng",
      mealSessions: ["dinner"],
      priceLevel: "trung_binh",
      rating: 4.7,
      reviewCount: 3650,
      address: "Hẻm 31 Sào Nam, Phường 11, Đà Lạt",
      areaIdx: 2,
      dLat: 0.009,
      dLng: 0.025,
    },
    {
      name: "Bánh Ướt Lòng Gà Trang",
      specialty: "Bánh ướt lòng gà ta trộn rau răm hành tây",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["breakfast", "lunch"],
      priceLevel: "binh_dan",
      rating: 4.6,
      reviewCount: 3120,
      address: "15F Tăng Bạt Hổ, Phường 1, Đà Lạt",
      areaIdx: 0,
      dLat: 0.003,
      dLng: -0.021,
    },
    {
      name: "Nem Nướng Bà Hùng",
      specialty: "Nem nướng cuốn bánh tráng giòn chấm tương đậu",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "binh_dan",
      rating: 4.4,
      reviewCount: 2450,
      address: "328 Phan Đình Phùng, Phường 2, Đà Lạt",
      areaIdx: 0,
      dLat: 0.007,
      dLng: -0.022,
    },
    {
      name: "Nhà Hàng Memory Đà Lạt Acoustic & Fine Dining",
      specialty: "Bò sốt tiêu rừng, salad dâu tây & rượu vang Đà Lạt",
      cuisine: "Nhà hàng Âu - Việt",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "cao_cap",
      rating: 4.8,
      reviewCount: 1640,
      address: "24 Hùng Vương, Phường 10, Đà Lạt",
      areaIdx: 3,
      dLat: 0.005,
      dLng: 0.015,
    },
  ],
  "da-nang": [
    {
      name: "Hải Sản Bé Mặn Mỹ Khê",
      specialty: "Ghẹ hấp sả, tôm hùm nướng phô mai chọn tại bể",
      cuisine: "Hải sản tươi sống",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "cao_cap",
      rating: 4.6,
      reviewCount: 5420,
      address: "Lô 8 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
      areaIdx: 0,
      dLat: 0.015,
      dLng: 0.046,
    },
    {
      name: "Mì Quảng Bà Mua",
      specialty: "Mì Quảng ếch, gà ta & bánh tráng cuốn thịt heo",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["breakfast", "lunch", "dinner"],
      priceLevel: "binh_dan",
      rating: 4.6,
      reviewCount: 4180,
      address: "95A Nguyễn Tri Phương, Thanh Khê, Đà Nẵng",
      areaIdx: 1,
      dLat: 0.001,
      dLng: -0.009,
    },
    {
      name: "Nhà Hàng Bếp Cuốn Đà Nẵng",
      specialty: "Mẹt cuốn Đà Thành, bánh xèo tôm nhảy giòn rụm",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "trung_binh",
      rating: 4.9,
      reviewCount: 3890,
      address: "31-33 Trần Bạch Đằng, Mỹ An, Đà Nẵng",
      areaIdx: 2,
      dLat: -0.009,
      dLng: 0.044,
    },
    {
      name: "Bún Chả Cá Hờn Gia Truyền",
      specialty: "Bún chả cá thu tươi nấu măng cay ngọt thanh",
      cuisine: "Bún & Phở",
      mealSessions: ["breakfast", "lunch"],
      priceLevel: "binh_dan",
      rating: 4.5,
      reviewCount: 2740,
      address: "113/3 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng",
      areaIdx: 1,
      dLat: 0.014,
      dLng: 0.018,
    },
    {
      name: "Nhà Hàng Madame Lân Bờ Sông Hàn",
      specialty: "Ẩm thực ba miền không gian phố cổ ven sông Hàn",
      cuisine: "Nhà hàng Việt",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "trung_binh",
      rating: 4.7,
      reviewCount: 4920,
      address: "04 Bạch Đằng, Hải Châu, Đà Nẵng",
      areaIdx: 1,
      dLat: 0.022,
      dLng: 0.021,
    },
  ],
  "nha-trang": [
    {
      name: "Hải Sản Thanh Sương Nha Trang",
      specialty: "Ốc hương sốt trứng muối, nhum biển nướng mỡ hành",
      cuisine: "Hải sản tươi sống",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "trung_binh",
      rating: 4.7,
      reviewCount: 4650,
      address: "15 Trần Phú, Vĩnh Nguyên, Nha Trang",
      areaIdx: 0,
      dLat: -0.032,
      dLng: 0.016,
    },
    {
      name: "Nem Nướng Đặng Văn Quyên",
      specialty: "Nem nướng Ninh Hòa chính gốc rau sống 10 loại",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "binh_dan",
      rating: 4.5,
      reviewCount: 3420,
      address: "16A Lãn Ông, Xương Huân, Nha Trang",
      areaIdx: 0,
      dLat: 0.014,
      dLng: -0.004,
    },
    {
      name: "Bún Cá Sứa Năm Beo Chợ Đầm",
      specialty: "Bún cá dầm sứa giòn nước dùng cá cờ ngọt trong",
      cuisine: "Bún & Phở",
      mealSessions: ["breakfast", "lunch"],
      priceLevel: "binh_dan",
      rating: 4.6,
      reviewCount: 2180,
      address: "B2 Chung cư Phan Bội Châu, Nha Trang",
      areaIdx: 0,
      dLat: 0.016,
      dLng: -0.003,
    },
    {
      name: "Bò Nướng Lạc Cảnh (Từ 1975)",
      specialty: "Bò ướp mật ong nướng than hoa công thức 50 năm",
      cuisine: "Lẩu & Nướng",
      mealSessions: ["dinner"],
      priceLevel: "trung_binh",
      rating: 4.5,
      reviewCount: 3890,
      address: "77 Nguyễn Bỉnh Khiêm, Nha Trang",
      areaIdx: 0,
      dLat: 0.019,
      dLng: 0.001,
    },
    {
      name: "Costa Seafood Nha Trang",
      specialty: "Tôm hùm bông Khánh Hòa & cua Hoàng Đế thượng hạng",
      cuisine: "Hải sản tươi sống",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "cao_cap",
      rating: 4.8,
      reviewCount: 1820,
      address: "32-34 Trần Phú, Lộc Thọ, Nha Trang",
      areaIdx: 0,
      dLat: 0.002,
      dLng: 0.002,
    },
  ],
  "phu-quoc": [
    {
      name: "Bún Quậy Kiến Xây Bạch Đằng",
      specialty: "Bún tươi ép tại chỗ, chả tôm chả cá quậy nước chấm tắc",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["breakfast", "lunch", "dinner"],
      priceLevel: "binh_dan",
      rating: 4.6,
      reviewCount: 5120,
      address: "28 Bạch Đằng, Dương Đông, Phú Quốc",
      areaIdx: 0,
      dLat: -0.068,
      dLng: -0.024,
    },
    {
      name: "Nhà Hàng Xin Chào Seafood Phú Quốc",
      specialty: "Gỏi cá trích Phú Quốc & lẩu ghẹ Hàm Ninh ngắm hoàng hôn",
      cuisine: "Hải sản tươi sống",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "trung_binh",
      rating: 4.6,
      reviewCount: 3740,
      address: "66 Trần Hưng Đạo, Dương Đông, Phú Quốc",
      areaIdx: 0,
      dLat: -0.075,
      dLng: -0.025,
    },
    {
      name: "Bún Kèn Út Lượm",
      specialty: "Bún kèn cá nhồng nấu nước cốt dừa béo thơm đặc trưng",
      cuisine: "Bún & Phở",
      mealSessions: ["breakfast"],
      priceLevel: "binh_dan",
      rating: 4.5,
      reviewCount: 1680,
      address: "42 Đường 30/4, Dương Đông, Phú Quốc",
      areaIdx: 0,
      dLat: -0.071,
      dLng: -0.019,
    },
    {
      name: "Ra Khơi Seafood Restaurant",
      specialty: "Còi biên mai nướng muối ớt, mực trứng hấp gừng",
      cuisine: "Hải sản tươi sống",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "trung_binh",
      rating: 4.5,
      reviewCount: 3910,
      address: "131 Đường 30/4, Dương Đông, Phú Quốc",
      areaIdx: 0,
      dLat: -0.072,
      dLng: -0.015,
    },
    {
      name: "On The Rocks — Mango Bay Fine Dining",
      specialty: "Bàn ăn sát ghềnh đá ngắm biển chiều & hải sản Âu - Á",
      cuisine: "Nhà hàng Âu - Việt",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "cao_cap",
      rating: 4.8,
      reviewCount: 1940,
      address: "Bãi Ông Lang, Phú Quốc",
      areaIdx: 2,
      dLat: -0.015,
      dLng: -0.042,
    },
  ],
  "ha-noi": [
    {
      name: "Phở Gia Truyền Bát Đàn",
      specialty: "Phở bò tái chín nước dùng xương hầm trong ngọt Phố Cổ",
      cuisine: "Bún & Phở",
      mealSessions: ["breakfast", "lunch", "dinner"],
      priceLevel: "binh_dan",
      rating: 4.5,
      reviewCount: 5840,
      address: "49 Bát Đàn, Hoàn Kiếm, Hà Nội",
      areaIdx: 0,
      dLat: 0.005,
      dLng: -0.008,
    },
    {
      name: "Bún Chả Hương Liên (Bún Chả Obama)",
      specialty: "Bún chả nướng than hoa kèm nem cua bể giòn rụm",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "binh_dan",
      rating: 4.5,
      reviewCount: 6420,
      address: "24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội",
      areaIdx: 3,
      dLat: -0.012,
      dLng: 0.001,
    },
    {
      name: "Chả Cá Thăng Long Đường Thành",
      specialty: "Chả cá lăng nướng nghệ thì là ăn kèm mắm tôm bún rối",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "trung_binh",
      rating: 4.7,
      reviewCount: 4120,
      address: "6B Đường Thành, Hoàn Kiếm, Hà Nội",
      areaIdx: 0,
      dLat: 0.004,
      dLng: -0.006,
    },
    {
      name: "Nhà Hàng Tầm Vị (1 Sao Michelin)",
      specialty: "Cơm nhà Bắc Bộ tinh tế: thịt kho trứng, canh cua cà pháo",
      cuisine: "Nhà hàng Việt",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "cao_cap",
      rating: 4.7,
      reviewCount: 2560,
      address: "4B Yên Thế, Ba Đình, Hà Nội",
      areaIdx: 2,
      dLat: 0.001,
      dLng: -0.016,
    },
    {
      name: "Bánh Mì 25 Hàng Cá",
      specialty: "Bánh mì pate gan truyền thống & bơ mật ong nóng giòn",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["breakfast", "lunch"],
      priceLevel: "binh_dan",
      rating: 4.8,
      reviewCount: 7350,
      address: "25 Hàng Cá, Hoàn Kiếm, Hà Nội",
      areaIdx: 0,
      dLat: 0.009,
      dLng: -0.005,
    },
  ],
};

function buildGenericRestaurantSeeds(destName: string): SeedPlaceTemplate[] {
  return [
    {
      name: `Quán Sáng Gia Truyền ${destName}`,
      specialty: `Bún & phở đặc sản địa phương ${destName}`,
      cuisine: "Bún & Phở",
      mealSessions: ["breakfast", "lunch"],
      priceLevel: "binh_dan",
      rating: 4.6,
      reviewCount: 1850,
      address: `Số 18 Đường Trung Tâm, ${destName}`,
      areaIdx: 0,
      dLat: 0.003,
      dLng: -0.004,
    },
    {
      name: `Bếp Bản Địa ${destName} Xưa`,
      specialty: `Mâm cơm đặc sản vùng miền & món cuốn ${destName}`,
      cuisine: "Đặc sản địa phương",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "trung_binh",
      rating: 4.8,
      reviewCount: 2640,
      address: `45 Đại lộ Du Lịch, ${destName}`,
      areaIdx: 0,
      dLat: -0.005,
      dLng: 0.006,
    },
    {
      name: `Lẩu & Nướng Khói Thông ${destName}`,
      specialty: "Set nướng than hoa & lẩu đặc sản cho nhóm bạn",
      cuisine: "Lẩu & Nướng",
      mealSessions: ["dinner"],
      priceLevel: "trung_binh",
      rating: 4.6,
      reviewCount: 1920,
      address: `102 Phố Ẩm Thực, ${destName}`,
      areaIdx: 1,
      dLat: 0.008,
      dLng: 0.009,
    },
    {
      name: `Nhà Hàng Gió Biển & Panorama ${destName}`,
      specialty: "Hải sản tươi sống & thực đơn Fine Dining bản địa",
      cuisine: "Hải sản tươi sống",
      mealSessions: ["lunch", "dinner"],
      priceLevel: "cao_cap",
      rating: 4.7,
      reviewCount: 1480,
      address: `01 Đường Ven Sông/Biển, ${destName}`,
      areaIdx: 2,
      dLat: -0.011,
      dLng: 0.012,
    },
    {
      name: `Ăn Vặt & Chợ Đêm Cổ Truyền ${destName}`,
      specialty: "Bánh xèo, chè bản địa & đồ nướng xiên que",
      cuisine: "Đặc sản địa phương",
      mealSessions: ["breakfast", "lunch", "dinner"],
      priceLevel: "binh_dan",
      rating: 4.5,
      reviewCount: 2290,
      address: `Khu Phố Đêm Trung Tâm, ${destName}`,
      areaIdx: 0,
      dLat: 0.001,
      dLng: 0.002,
    },
  ];
}

/**
 * Bayesian weighted rating:
 * WR = (v / (v + m)) * R + (m / (v + m)) * C
 * m = 600 reviews confidence threshold, C = 4.30 baseline rating
 */
export function computeBayesianScore(
  rating: number,
  reviewCount: number,
  m = 600,
  C = 4.3
): number {
  const score =
    (reviewCount / (reviewCount + m)) * rating +
    (m / (reviewCount + m)) * C;
  return Number(score.toFixed(2));
}

function localDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.2, Number((R * c).toFixed(1)));
}

export class MockPlacesProvider implements PlacesProvider {
  readonly name = "ChotKeo Culinary Places (Mock v1 — Google Maps Bayesian Ranking)";

  async searchRestaurants(
    query: PlacesQuery
  ): Promise<ProviderResponse<RestaurantPlace>> {
    const dest = getDestinationById(query.destinationId);
    const fetchedAt = new Date().toISOString();

    if (!dest) {
      return { min: 0, max: 0, items: [], source: this.name, fetchedAt };
    }

    const refLat = query.nearLat ?? dest.lat;
    const refLng = query.nearLng ?? dest.lng;

    const seeds =
      DESTINATION_PLACE_SEEDS[dest.id] ?? buildGenericRestaurantSeeds(dest.name);

    let items: RestaurantPlace[] = seeds.map((tpl, idx) => {
      const lat = Number((dest.lat + tpl.dLat).toFixed(5));
      const lng = Number((dest.lng + tpl.dLng).toFixed(5));
      const unitRange = getMealUnitRange(tpl.priceLevel, dest.id);
      const area =
        dest.popularAreas[tpl.areaIdx % dest.popularAreas.length] ??
        dest.popularAreas[0];

      return {
        id: `place-${dest.id}-${idx + 1}`,
        name: tpl.name,
        specialty: tpl.specialty,
        cuisine: tpl.cuisine,
        mealSessions: tpl.mealSessions,
        priceLevel: tpl.priceLevel,
        estimatedPerPerson: unitRange,
        rating: tpl.rating,
        reviewCount: tpl.reviewCount,
        bayesianScore: computeBayesianScore(tpl.rating, tpl.reviewCount),
        distanceKm: localDistanceKm(refLat, refLng, lat, lng),
        address: tpl.address,
        area,
        lat,
        lng,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${tpl.name} ${dest.name}`
        )}`,
      };
    });

    if (query.session && query.session !== "all") {
      items = items.filter((p) =>
        p.mealSessions.includes(query.session as MealSession)
      );
    }
    if (query.cuisine && query.cuisine !== "all") {
      items = items.filter((p) => p.cuisine === query.cuisine);
    }
    if (query.priceLevel && query.priceLevel !== "all") {
      items = items.filter((p) => p.priceLevel === query.priceLevel);
    }
    if (query.minRating && query.minRating > 0) {
      items = items.filter((p) => p.rating >= query.minRating!);
    }

    // Sort descending by Bayesian weighted score, tie-break by proximity
    items.sort(
      (a, b) =>
        b.bayesianScore - a.bayesianScore || a.distanceKm - b.distanceKm
    );

    const mins = items.map((i) => i.estimatedPerPerson.min);
    const maxes = items.map((i) => i.estimatedPerPerson.max);

    return {
      min: mins.length > 0 ? Math.min(...mins) : 0,
      max: maxes.length > 0 ? Math.max(...maxes) : 0,
      items,
      source: this.name,
      fetchedAt,
    };
  }
}

/**
 * Phase 2 Stub: Google Places API (New Text Search / Nearby Search)
 * Required env var:
 * - GOOGLE_PLACES_API_KEY
 */
export class GooglePlacesProviderStub implements PlacesProvider {
  readonly name = "Google Places API v1 (Phase 2 Stub)";

  async searchRestaurants(
    query: PlacesQuery
  ): Promise<ProviderResponse<RestaurantPlace>> {
    void query;
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      throw new Error(
        "Missing GOOGLE_PLACES_API_KEY. Set PLACES_PROVIDER=mock or provide API key."
      );
    }
    throw new Error("GooglePlacesProviderStub is a Phase 2 placeholder.");
  }
}
