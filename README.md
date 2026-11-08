# ChotKeo.vn — Ứng dụng Dự toán Ngân sách Du lịch Nội địa Việt Nam

**ChotKeo.vn** là ứng dụng web lập kế hoạch và ước tính tổng chi phí (khoảng **Thấp nhất – Cao nhất**) cho các chuyến du lịch nội địa Việt Nam theo quy trình **7 bước trực quan**. Giao diện hoàn toàn bằng **Tiếng Việt (`vi-VN`)**, đơn vị tiền tệ **VNĐ**, định dạng ngày **`dd/MM/yyyy`**, ưu tiên thiết bị di động (mobile-first) và hỗ trợ chế độ Sáng/Tối.

---

## Tính năng nổi bật (7 Bước Wizard)

1. **Bước 1 – Thông tin cơ bản**: Chọn điểm đi & điểm đến (dropdown tìm kiếm thông minh hỗ trợ gõ không dấu across 15 tỉnh/thành Việt Nam), chọn ngày bằng `react-day-picker` (`dd/MM/yyyy`), số người lớn/trẻ em, số phòng; tự động tính số ngày & đêm.
2. **Bước 2 – Phát hiện Ngày đặc biệt & Lễ Tết**: Đối chiếu lịch trình với `/data/holidays.json` (2026–2027). Tự động cảnh báo biên độ tăng giá (%), hiển thị mẹo tối ưu và tính năng **Gợi ý ngày đi lân cận rẻ hơn (±3 ngày)** chỉ với 1 cú nhấp.
3. **Bước 3 – Di chuyển liên tỉnh**: Chuyển đổi linh hoạt giữa **Vé máy bay khứ hồi** (Vietnam Airlines, Vietjet Air, Bamboo Airways, Vietravel Airlines) và **Xe giường nằm / Cabin VIP** (Phương Trang, Thành Bưởi, Hoàng Long, Kumho Samco, Sao Việt...). So sánh trực diện **Chi phí vs. Thời gian**, cho phép chốt 1 chuyến hoặc giữ khoảng giá (`range`).
4. **Bước 4 – Lưu trú**: Lọc theo loại hình (`hotel`, `homestay`, `resort`, `hostel`), trần giá/đêm, điểm đánh giá, khu vực, tiện nghi và miễn phí hủy phòng. Hỗ trợ **chọn nhiều nơi ở để chia đêm** (split stays), chuyển đổi **Danh sách ↔ Bản đồ**, và liên kết sâu tới Agoda / Booking.com / Traveloka / Trivago.
5. **Bước 5 – Ăn uống & Ẩm thực**: Tuỳ chỉnh số bữa/ngày (mặc định 3 bữa) và 3 phân khúc chi tiêu (`Bình dân`, `Trung bình`, `Cao cấp`) điều chỉnh theo từng thành phố. Đề xuất quán ăn đặc sản gần khách sạn xếp hạng bằng thuật toán **Bayesian Average** (điểm sao cân bằng với số lượng review) kèm nút **Mở Google Maps**.
6. **Bước 6 – Di chuyển tại chỗ**: So sánh chi phí giữa **Gọi xe công nghệ** (Xanh SM, Grab, Be — tự động nâng lên xe 7 chỗ hoặc nhiều xe khi đi nhóm đông) và **Thuê xe máy tự lái** (xe số, tay ga, xe côn + nhiên liệu ước tính + thông tin tiền cọc + giao xe tận khách sạn + bản đồ tiệm thuê xe).
7. **Bước 7 – Tổng kết & Chốt ngân sách**: Hiển thị tổng chi phí **THẤP NHẤT – CAO NHẤT**, trung bình/người và trung bình/ngày; bảng chi tiết 6 hạng mục + biểu đồ Donut (`Recharts`), bật/tắt **10% quỹ dự phòng**, **Lưu chuyến đi** (`localStorage`), **Chia sẻ liên kết** (`?trip=...`), **Xuất PDF**, và bảng ghi nhận nguồn dữ liệu kèm dấu thời gian (`fetchedAt`).

---

## Cấu trúc Thư mục

```text
/
├── app/                        # Next.js App Router & Backend Route Handlers
│   ├── api/
│   │   ├── flights/route.ts    # API vé máy bay khứ hồi (TTL Cache 6h)
│   │   ├── buses/route.ts      # API xe giường nằm / limousine
│   │   ├── lodging/route.ts    # API khách sạn, homestay, resort, hostel
│   │   ├── places/route.ts     # API quán ăn xếp hạng Bayesian
│   │   ├── rentals/route.ts    # API cửa hàng thuê xe máy
│   │   ├── rides/route.ts      # API ước tính cước Grab / Be / Xanh SM
│   │   └── holidays/route.ts   # API tra cứu lễ Tết & phân tích hệ số giá
│   ├── globals.css             # Tailwind CSS v4 + hệ màu Sunlit Linen / Midnight Bay + Print PDF
│   ├── layout.tsx              # Root layout (vi-VN, Plus Jakarta Sans + Be Vietnam Pro + JetBrains Mono)
│   └── page.tsx                # Trang chính khởi chạy Wizard
├── .agents/skills/             # Antigravity workspace skills (bao gồm ui-ux-pro-max)
├── design-system/chotkeo-vn/   # MASTER.md — Hệ thống thiết kế chuẩn hóa từ ui-ux-pro-max
├── components/
│   ├── layout/                 # Header, DestinationHero, WizardStepper, LiveBudgetSidebar, StickySummaryBar
│   ├── steps/                  # Step1Basics -> Step7Summary
│   ├── shared/                 # InteractiveMap
│   └── ui/                     # Các thành phần giao diện shadcn/ui (Bento 3xl + 44px touch targets)
├── data/
│   ├── holidays.json           # Cấu hình ngày lễ, nghỉ hè, cao điểm 2026–2027
│   ├── meal-costs.json         # Bảng đơn giá bữa ăn & hệ số điều chỉnh theo đô thị
│   └── destinations.ts         # Dữ liệu điểm đi/đến, sân bay, tọa độ GPS
└── lib/
    ├── types.ts                # Toàn bộ TypeScript interfaces
    ├── cache.ts                # Bộ nhớ đệm server-side TTL 6 giờ
    ├── holidays.ts             # Thuật toán phát hiện trùng lễ & gợi ý dời lịch
    ├── format.ts               # Định dạng VNĐ, dd/MM/yyyy, mã hóa URL chia sẻ
    ├── store/useTripStore.ts   # Zustand store đồng bộ localStorage
    ├── pricing/                # Pure Pricing Engine + Unit Tests (Vitest)
    │   ├── engine.ts
    │   └── __tests__/pricing.test.ts
    └── providers/              # Adapter interfaces + Phase 1 Mock + Phase 2 Stubs
        ├── types.ts
        ├── flight.provider.ts
        ├── bus.provider.ts
        ├── lodging.provider.ts
        ├── places.provider.ts
        ├── rental.provider.ts
        ├── ride.provider.ts
        └── index.ts
```

---

## Cài đặt & Khởi chạy

### Yêu cầu hệ thống
- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

### Các lệnh thực thi

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy môi trường phát triển (http://localhost:3000)
npm run dev

# 3. Chạy kiểm thử đơn vị (Vitest) cho Pricing Engine
npm test

# 4. Build bản Production và khởi chạy
npm run build
npm start
```

---

## Kiến trúc Dữ liệu & Hướng dẫn Tích hợp API Thực tế (Phase 2)

Ứng dụng **tuyệt đối không cào (scrape) dữ liệu trực tiếp trên trình duyệt**. Toàn bộ dữ liệu đi qua Route Handlers (`/app/api/*`) → Bộ nhớ đệm 6 giờ (`/lib/cache.ts`) → Adapter Interfaces (`/lib/providers/types.ts`).

Mỗi provider đều trả về chuẩn cấu trúc:
```ts
interface ProviderResponse<T> {
  min: number;
  max: number;
  items: T[];
  source: string;
  fetchedAt: string;
  cached?: boolean;
}
```

### Cách cắm API thực tế (Phase 2)

1. Sao chép tệp biến môi trường mẫu:
   ```bash
   cp .env.example .env.local
   ```
2. Triển khai hàm gọi HTTP thật bên trong các lớp `*Stub` đã được chuẩn bị sẵn trong `/lib/providers/*.provider.ts`:
   - **Vé máy bay (`lib/providers/flight.provider.ts` → `AmadeusFlightProviderStub`)**:
     - Điền `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET` và đổi `FLIGHT_PROVIDER=amadeus`.
     - Gọi `GET https://api.amadeus.com/v2/shopping/flight-offers` với `currencyCode=VND` rồi ánh xạ sang `FlightOption[]`.
   - **Xe khách (`lib/providers/bus.provider.ts` → `VexereBusProviderStub`)**:
     - Điền `VEXERE_PARTNER_TOKEN` và đổi `BUS_PROVIDER=vexere`.
   - **Lưu trú (`lib/providers/lodging.provider.ts` → `AffiliateLodgingProviderStub`)**:
     - Điền `AGODA_AFFILIATE_CID`, `AGODA_API_KEY` hoặc `BOOKING_AFFILIATE_ID` và đổi `LODGING_PROVIDER=affiliate`.
     - Lưu ý: Nếu giá trả về từ API đối tác đã bao gồm giá theo ngày lễ thực tế, có thể đặt hệ số lễ lưu trú về `1.0` hoặc chuẩn hóa về giá cơ sở.
   - **Quán ăn & Tiệm thuê xe (`lib/providers/places.provider.ts`, `rental.provider.ts`)**:
     - Điền `GOOGLE_PLACES_API_KEY` và đổi `PLACES_PROVIDER=google`, `RENTAL_PROVIDER=google`.
     - Dùng Google Places API (New Nearby/Text Search) lấy `rating`, `userRatingCount`, tọa độ và truyền qua hàm `computeBayesianScore(rating, userRatingCount)` có sẵn.
   - **Xe công nghệ (`lib/providers/ride.provider.ts`)**:
     - Điền `RIDE_ESTIMATE_API_KEY` và đổi `RIDE_PROVIDER=partner`.

---

## Hướng dẫn Chỉnh sửa `holidays.json`

Tệp cấu hình lễ Tết và mùa cao điểm nằm tại `/data/holidays.json`. Bạn có thể thêm hoặc chỉnh sửa bất kỳ giai đoạn nào mà không cần sửa mã nguồn:

```json
{
  "id": "festival-hoa-da-lat-2027",
  "name": "Festival Hoa Đà Lạt 2027",
  "startDate": "2027-12-18",
  "endDate": "2027-12-22",
  "type": "peak_season",
  "description": "Tuần lễ Festival Hoa Đà Lạt thu hút lượng lớn du khách nội địa.",
  "priceMultiplier": {
    "transport": { "min": 1.2, "max": 1.45 },
    "lodging": { "min": 1.3, "max": 1.65 },
    "localServices": { "min": 1.05, "max": 1.15 }
  }
}
```

### Quy ước các trường trong `holidays.json`
- `startDate` / `endDate`: Ngày dương lịch theo chuẩn ISO `YYYY-MM-DD` (hệ thống tự động hiển thị sang `dd/MM/yyyy` trên UI).
- `type`: Một trong 3 giá trị `"public_holiday"` | `"school_break"` | `"peak_season"`.
- `priceMultiplier`:
  - `transport`: Hệ số nhân cho vé máy bay / xe khách liên tỉnh (`1.0` = không tăng, `1.5` = +50%).
  - `lodging`: Hệ số nhân theo từng đêm lưu trú nằm trong khoảng ngày đặc biệt.
  - `localServices`: Hệ số nhân cho ăn uống và di chuyển nội đô trong những ngày trùng lễ.
