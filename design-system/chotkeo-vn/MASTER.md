# Design System Master File — ChotKeo.vn

> **LOGIC:** Global Source of Truth synthesized via `ui-ux-pro-max` (Product: Travel/Tourism Booking & Trip Budget Planner, Style: Bento Box Grid + Soft UI Evolution + Aurora Destination Hero, Stack: Next.js App Router + Tailwind v4 + shadcn/ui).

---

**Project:** ChotKeo.vn
**Updated:** 2026-11-09
**Category:** Domestic Travel Budget Planner & Booking Analytics (`vi-VN`)
**Design Dials:** Variance 6/10 (Balanced Editorial Bento) | Motion 5/10 (Standard + `prefers-reduced-motion`) | Density 6/10 (Standard)

---

## Global Rules

### 1. Semantic Color Palette (WCAG AA >= 4.5:1 Verified)

**Concept:** *Coastal Map Teal + Sunset Terracotta on Sunlit Linen* (evoking Hạ Long / Phú Quốc emerald waters and Hội An / Mũi Né warm terracotta).

| Role | Light Mode | Dark Mode | CSS Variable | Notes |
|------|------------|-----------|--------------|-------|
| Background | `#FAF7F2` | `#080E1A` | `--background` | Warm sunlit linen (light) / deep midnight bay (dark) |
| Surface / Card | `#FFFFFF` | `#101929` | `--card` | Elevated porcelain / slate-navy bento card |
| Surface Subtle | `#F4EFE6` | `#172338` | `--muted` | Warm sand / elevated dark panel |
| Foreground | `#0F172A` | `#F8FAFC` | `--foreground` | 15.8:1 contrast |
| Muted Foreground | `#475569` | `#94A3B8` | `--muted-foreground` | >= 5.2:1 contrast on card/background |
| Primary (Map Teal) | `#0F766E` | `#2DD4BF` | `--primary` | Trust, route precision, financial totals |
| On Primary | `#FFFFFF` | `#042F2E` | `--primary-foreground` | 5.47:1 contrast |
| Accent / CTA (Terracotta) | `#C2410C` | `#FB923C` | `--accent` | Primary progression CTA & holiday surge highlights |
| On Accent | `#FFFFFF` | `#1C0A00` | `--accent-foreground` | 5.18:1 contrast |
| Border | `#E7DFD3` | `#1E2D45` | `--border` | Visible warm stone / deep navy Hairline |
| Ring (Focus) | `#0D9488` | `#2DD4BF` | `--ring` | 2px visible keyboard focus ring |

### 2. Typography (Vietnamese Diacritic Verified)

- **Display / Heading Font:** `Plus Jakarta Sans` (`--font-heading`, weights `600, 700, 800`, `subsets: ["latin", "vietnamese"]`)
- **UI & Body Font:** `Be Vietnam Pro` (`--font-sans`, weights `400, 500, 600, 700`, `subsets: ["latin", "vietnamese"]`)
- **Numeric / Tabular VND Font:** `JetBrains Mono` (`--font-mono`, `font-variant-numeric: tabular-nums`)

### 3. Layout & Spatial Architecture

- **Destination Aurora Hero:** Contextual header banner morphing subtle gradient atmosphere per Vietnamese destination (Đà Lạt misty pine, Đà Nẵng ocean-coral, Phú Quốc sunset amber, Hà Nội heritage terracotta, Nha Trang turquoise bay) with live route telemetry (`Origin → Destination`, `dd/MM/yyyy`, `XN YĐ`, `Travelers`).
- **Desktop 12-Column Asymmetric Split (`lg:grid-cols-12`):**
  - Steps 1–6 occupy **8 columns** (`lg:col-span-8`) on the left while a sticky **4-column Live Budget Receipt ("Bảng Tạm Tính Trực Tiếp")** (`lg:col-span-4`) tracks all 6 category min–max bars in real time.
  - Step 7 expands across all **12 columns** as an executive Bento summary dashboard.
- **Mobile-First Ergonomics (`< lg`):**
  - Sticky bottom summary bar with expandable 1-tap mini-receipt sheet, safe-area padding, and `>= 44×44px` (`h-11`) touch targets on interactive steppers/buttons.
- **WCAG 2.2 Focus Not Obscured:**
  - `scroll-padding-top: 6rem; scroll-padding-bottom: 8rem;` on `html` prevents sticky bars from obscuring focused elements.

### 4. Data Visualization Rules (`charts.csv` Verified)

- **Max 6 slices** in Donut Chart, sorted descending from 12 o'clock, accompanied by direct percentage badges AND a **100% Stacked Proportional Bar + Min–Max Variance Range Meter** so meaning never relies on color alone.

### 5. Pre-Delivery Checklist

- [x] Zero emojis used as structural icons (100% crisp SVG icons via `lucide-react` with `aria-hidden="true"` on decorative icons)
- [x] `cursor-pointer` on all interactive buttons, cards, and tabs
- [x] Touch targets `>= 44px` (`h-11`) for primary actions & steppers
- [x] Smooth `200ms` transitions without layout-shifting hover transforms; `@media (prefers-reduced-motion: reduce)` respected
- [x] WCAG AA `>= 4.5:1` contrast in both Light (`#FAF7F2` / `#FFFFFF`) and Dark (`#080E1A` / `#101929`) modes
- [x] Responsive across `375px`, `768px`, `1024px`, and `1440px` with zero horizontal overflow
