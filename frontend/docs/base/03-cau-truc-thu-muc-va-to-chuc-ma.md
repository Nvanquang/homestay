# Cấu trúc thư mục và tổ chức mã

Mục tiêu của cách tổ chức: người mới biết **đặt mã ở đâu** mà không phải hỏi, và kiến trúc không mục nát khi số màn hình tăng từ vài chục lên gần 100.

---

## 1. Tổng quan monorepo

```
booking/
├── apps/
│   ├── web/                    # Công khai, Guest, Host
│   └── backoffice/             # Admin, CSKH, Kế toán
├── packages/
│   ├── ui/                     # Hệ thống thiết kế, không chứa nghiệp vụ
│   ├── api-client/             # Client sinh từ OpenAPI + chuẩn hoá lỗi
│   ├── shared/                 # Hàm thuần: tiền, ngày, hằng số, schema chung, thông điệp chung
│   └── config/                 # tsconfig, Biome, dependency-cruiser dùng chung
├── docs/adr/                   # Quyết định kiến trúc
└── e2e/                        # Kịch bản Playwright xuyên ứng dụng
```

### 1.1. `packages/ui`

```
packages/ui/src/
├── styles/tokens.css           # @theme: màu, phông, bo góc, bóng, chuyển động
├── primitives/                 # Button, Input, Dialog, Popover, Tabs... (từ shadcn, đã chỉnh)
├── components/                 # Ghép từ primitive, vẫn không chứa nghiệp vụ: DateRangePicker, Gallery, MoneyText, Countdown...
├── patterns/                   # Mẫu giao diện: EmptyState, ErrorState, ConfirmDialog, PageHeader, DataTable...
├── hooks/                      # useMediaQuery, useDisclosure...
├── lib/cn.ts                   # clsx + tailwind-merge
└── index.ts                    # API công khai
```

### 1.2. `packages/api-client`

```
packages/api-client/src/
├── generated/schema.d.ts       # sinh bởi openapi-typescript (không sửa tay, commit vào git)
├── client.ts                   # createClient + middleware dùng chung
├── errors.ts                   # ApiError, chuẩn hoá Problem Details, danh sách mã lỗi
├── query-keys.ts               # (tuỳ chọn) khung factory khoá truy vấn
└── index.ts
```

### 1.3. `packages/shared`

```
packages/shared/src/
├── money/                      # kiểu Money, formatMoney, so sánh
├── dates/                      # StayDate (YYYY-MM-DD), chuyển đổi, múi giờ listing
├── constants/                  # vai trò, trạng thái booking, giới hạn
├── schemas/                    # schema Zod dùng chung (email, mật khẩu, điện thoại...)
├── messages/{vi,en}/           # common.json, errors.json (thông điệp dùng cho cả hai app)
└── index.ts
```

Quy tắc: `shared` **không import React**, không import `ui`.

---

## 2. Cấu trúc `apps/web`

```
apps/web/
├── messages/{vi,en}/*.json     # thông điệp theo namespace (search, booking, host...)
├── public/                     # tĩnh: favicon, ảnh nền, robots tĩnh nếu có
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (public)/       # trang công khai: trang chủ, tìm kiếm, chi tiết listing...
│   │   │   ├── (auth)/         # đăng nhập, đăng ký, quên mật khẩu, xác minh email
│   │   │   ├── (account)/      # hồ sơ, cài đặt, hộp thư, thông báo (cần đăng nhập)
│   │   │   ├── (guest)/        # đặt phòng, chuyến đi, yêu thích, khiếu nại
│   │   │   ├── (host)/host/    # dashboard, listing, lịch, booking, thu nhập
│   │   │   ├── layout.tsx
│   │   │   ├── error.tsx  loading.tsx  not-found.tsx
│   │   ├── global-error.tsx
│   │   ├── sitemap.ts  robots.ts
│   ├── features/               # nghiệp vụ, mỗi feature một thư mục
│   ├── components/             # thành phần dùng chung của riêng web: SiteHeader, SiteFooter, LocaleSwitcher
│   ├── lib/                    # api (server/client), auth, query-client, utils riêng web
│   ├── i18n/                   # routing.ts, request.ts, navigation.ts
│   ├── env.ts                  # biến môi trường đã kiểm tra
│   ├── proxy.ts                # ngôn ngữ + kiểm tra thô phiên
│   └── styles/globals.css
└── next.config.ts
```

### 2.1. Các feature của `web` và slice tương ứng

| Feature | Nội dung | Slice |
|---|---|---|
| `auth` | Đăng ký, đăng nhập, quên mật khẩu, xác minh email | S01 |
| `account` | Hồ sơ, cài đặt, xác minh danh tính, đồng ý điều khoản | S02, S04, S53 |
| `host-onboarding` | Trở thành Host, hồ sơ xác minh Host, tài khoản payout | S04, S29 |
| `listing-editor` | Danh sách listing, luồng tạo/sửa nhiều bước, trạng thái duyệt | S05 đến S07, S48 |
| `calendar` | Lịch listing, đồng bộ iCal | S09, S21 |
| `pricing` | Giá theo mùa/lễ, khuyến mãi Host | S10, S47 |
| `search` | Trang chủ, kết quả, bản đồ, bộ lọc | S11 |
| `listing-detail` | Chi tiết listing, hồ sơ Host công khai, chính sách huỷ | S12 |
| `currency` | Chọn tiền tệ hiển thị, hiển thị giá quy đổi | S13 |
| `booking` | Giữ chỗ, thanh toán, kết quả, khai báo lưu trú | S14, S15, S17, S22, S23 |
| `trips` | Chuyến đi, chi tiết booking, hoá đơn, huỷ, đổi | S16, S25, S27 |
| `host-bookings` | Dashboard, danh sách/chi tiết booking, yêu cầu chờ, huỷ, duyệt đổi | S18, S19, S26, S27 |
| `earnings` | Thu nhập và payout của Host | S30 |
| `messaging` | Hộp thư, hội thoại | S36 |
| `notifications` | Trung tâm thông báo | S37 |
| `reviews` | Viết và xem đánh giá | S38, S39 |
| `disputes` | Khiếu nại phía Guest và Host | S40, S41 |
| `favorites` | Yêu thích | S51 |
| `static-pages` | Điều khoản, quyền riêng tư, trợ giúp, liên hệ | S52 |

### 2.2. Bản đồ route đề xuất của `web`

Tất cả nằm dưới `/[locale]/` (`/vi`, `/en`). Mã trong ngoặc là mã màn hình.

| Nhóm | Đường dẫn (rút gọn) |
|---|---|
| Công khai | `/` (P01), `/search` (P02), `/listings/[id]` (P03), `/hosts/[id]` (P04), `/cancellation-policies` (P05), `/become-a-host` (P10), `/terms` (P11), `/privacy` (P12), `/help` (P13), `/contact` (P14) |
| Xác thực | `/login` (P06), `/register` (P07), `/forgot-password`, `/reset-password` (P08), `/verify-email` (P09) |
| Tài khoản | `/account/profile` (C01), `/account/settings` (C02), `/account/verification` (C03), `/inbox` (C04), `/inbox/[id]` (C05), `/notifications` (C06), `/terms/accept` (C07) |
| Guest: đặt phòng | `/booking/new?listing=…` (G01), `/bookings/[id]/pay` (G02), `/bookings/[id]/result` (G03), `/bookings/[id]/declaration` (G04) |
| Guest: sau đặt | `/wishlists` (G05), `/trips` (G06), `/trips/[id]` (G07), `/trips/[id]/change` (G08), `/trips/[id]/cancel` (G09), `/trips/[id]/payments` (G10), `/trips/[id]/review` (G11), `/disputes` (G12), `/disputes/new` (G13), `/disputes/[id]` (G14) |
| Host: tổng quan | `/host` (H01), `/host/verification` (H02), `/host/payout-account` (H15), `/host/earnings` (H16) |
| Host: listing | `/host/listings` (H03), `/host/listings/new` và `/host/listings/[id]/edit/[step]` (H04), `/host/listings/[id]/status` (H05), `/host/listings/[id]/calendar` (H06), `/host/listings/[id]/ical` (H07), `/host/listings/[id]/pricing` (H08), `/host/promotions` (H09) |
| Host: booking | `/host/requests` (H10), `/host/bookings` (H11), `/host/bookings/[id]` (H12), `/host/bookings/[id]/change-request` (H13), `/host/bookings/[id]/cancel` (H14), `/host/reviews` (H17), `/host/disputes` (H18), `/host/disputes/new` (H19), `/host/disputes/[id]` (H20) |

Quy tắc đặt tên URL: chữ thường, dùng dấu gạch nối, danh từ số nhiều cho tập hợp, định danh nằm trong đường dẫn, bộ lọc nằm trong query (nuqs). Thêm slug mô tả vào URL listing là tuỳ chọn cho SEO.

---

## 3. Cấu trúc `apps/backoffice`

Cùng khung với `web`, khác ở nhóm route và feature. Ứng dụng đặt `noindex`, không có sitemap, ưu tiên máy tính (tối thiểu 1024 px; vẫn không vỡ trên màn nhỏ hơn).

```
apps/backoffice/src/app/[locale]/
├── (auth)/login                # A01
├── (admin)/admin/...           # Admin
├── (support)/support/...       # CSKH
├── (accounting)/accounting/... # Kế toán
└── (shared)/reports/...        # báo cáo dùng chung, hiển thị theo quyền
```

| Vai trò | Nhóm màn hình (mã) |
|---|---|
| Admin | Dashboard (A02), duyệt danh tính (A03), duyệt và quản lý listing (A04, A06), người dùng (A05), booking (A07), khiếu nại (A08), kiểm duyệt (A09), bất khả kháng (A10), coupon (A11), cấu hình (A12 đến A14), danh mục (A15, A16), điều khoản (A17), nhân sự (A18), nhật ký (A19) |
| CSKH | Hàng đợi (K01), chi tiết khiếu nại (K02), tra cứu (K03, K04), hội thoại (K05), huỷ hộ/hoàn tiền ngoại lệ (K06) |
| Kế toán | Dashboard (T01), đối soát (T02), payout (T03, T04), hoàn tiền (T05), sổ cái (T06, T07), hoá đơn VAT (T08) |
| Báo cáo | A20 đến A28, hiển thị theo quyền |

Menu điều hướng sinh từ **danh sách quyền** do API `me` trả về, không từ so sánh tên vai trò viết cứng trong giao diện. Mỗi trang tự khai quyền cần có và hiển thị trạng thái «không có quyền» khi API trả 403.

---

## 4. Cấu trúc một feature

```
features/booking/
├── index.ts                    # API công khai: chỉ xuất ra thứ mà app/ hoặc feature khác được dùng
├── components/                 # UI riêng của feature (Server hoặc Client Component)
├── hooks/                      # useHoldBooking, usePaymentStatus...
├── api/                        # query options, mutation functions, query keys của feature
├── schemas/                    # Zod cho form của feature
├── lib/                        # logic thuần (không React, không gọi mạng)
├── types.ts
└── *.test.ts(x)                # test nằm cạnh mã
```

Không phải feature nào cũng đủ mọi thư mục; chỉ tạo khi cần.

### Đặt mã ở đâu?

| Loại mã | Nơi đặt |
|---|---|
| Component không biết gì về nghiệp vụ (Button, Dialog, DateRangePicker) | `packages/ui` |
| Component biết nghiệp vụ nhưng chỉ một feature dùng | `features/<feature>/components` |
| Component nghiệp vụ nhiều feature dùng (ví dụ `ListingCard`) | Đưa vào feature sở hữu khái niệm đó (`listing-detail`) và xuất qua `index.ts`; nếu thật sự trung lập, `apps/web/src/components` |
| Hàm thuần dùng ở cả hai ứng dụng (tiền, ngày) | `packages/shared` |
| Hàm thuần chỉ một ứng dụng | `apps/<app>/src/lib` |
| Gọi API của một nhóm nghiệp vụ | `features/<feature>/api` |
| Cấu hình client API, middleware chung | `packages/api-client` |
| Schema form của feature | `features/<feature>/schemas` |
| Schema dùng chung (email, mật khẩu) | `packages/shared/schemas` |
| Thông điệp i18n của feature | `apps/<app>/messages/{vi,en}/<feature>.json` |
| Thông điệp lỗi và nhãn chung | `packages/shared/messages` |

---

## 5. Quy tắc phụ thuộc

Chiều phụ thuộc, từ trên xuống dưới (chỉ được import lớp bên dưới, không import ngược lên):

```
app/ (route)  →  features/  →  components/ (của app)  →  packages/ui, packages/api-client, packages/shared
```

| Quy tắc | Giải thích |
|---|---|
| `app/` chỉ ghép trang | Lấy dữ liệu đầu trang, chọn layout, gọi component của feature; không chứa logic nghiệp vụ dài |
| Feature không import ruột feature khác | Chỉ import qua `features/<tên>/index.ts`. Cần ghép hai feature thì ghép ở `app/` |
| Hai feature không phụ thuộc vòng | Nếu cần chia sẻ, đẩy phần chung xuống `packages/shared` hoặc component chung |
| `packages/ui` không biết nghiệp vụ | Không import `api-client`, không có từ ngữ như booking, listing, host trong tên prop |
| `packages/shared` không import React | Giữ để dùng được trong test và phía server |
| `api-client` không import `ui` | |
| Hai ứng dụng không import nhau | Cái gì dùng chung thì lên `packages/` |
| Module chỉ chạy phía server | Đầu file ghi `import "server-only"`; module chỉ chạy phía trình duyệt nằm trong Client Component |

Kiểm tra tự động bằng **dependency-cruiser** với các quy tắc: `no-circular`, `no-cross-feature-internals`, `ui-no-business`, `shared-no-react`, `apps-no-cross-import`. Chạy trong hook trước push và trong CI (file 09).

---

## 6. Ranh giới Server Component và Client Component

| Quy tắc | Chi tiết |
|---|---|
| Mặc định là Server Component | Không ghi gì ở đầu file |
| `"use client"` đặt càng thấp trong cây càng tốt | Chỉ ở component thật sự cần tương tác; không đặt ở layout hay trang trừ khi bắt buộc |
| Truyền dữ liệu đơn giản qua ranh giới | Props phải tuần tự hoá được; không truyền hàm, class, Date không cần thiết |
| Thư viện chỉ chạy ở trình duyệt | Bản đồ Mapbox, kéo thả, thư viện dựa vào `window`: bọc trong Client Component và tải bằng `next/dynamic` với `ssr: false` |
| Provider đặt ở một component client riêng | `Providers` (QueryClient, theme, toast) bọc ở `layout`, nội dung vẫn là Server Component |
| Trang cần SEO lấy dữ liệu ở server | Search, chi tiết listing, hồ sơ Host, chính sách huỷ, trang tĩnh |
| Trang riêng tư tương tác nhiều dùng TanStack Query | Dữ liệu có thể được lấy trước ở server để vẽ lần đầu nhanh |

---

## 7. Quy ước đặt tên

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Tệp và thư mục | `kebab-case` | `listing-card.tsx`, `use-hold-booking.ts` |
| Component | `PascalCase`, xuất kiểu named | `export function ListingCard()` |
| Hook | `useXxx` | `usePaymentStatus` |
| Hàm, biến | `camelCase` | `formatMoney` |
| Kiểu, interface | `PascalCase`, không tiền tố `I` | `BookingSummary` |
| Schema Zod | `xxxSchema`, kiểu suy ra `XxxInput` | `holdBookingSchema` |
| Hằng số | `SCREAMING_SNAKE_CASE` cho hằng cố định | `HOLD_MINUTES` |
| Khoá thông điệp i18n | `namespace.khu-vuc.hanh-dong`, tiếng Anh, không có dấu | `booking.pay.submit` |
| Nhánh Git | `feat/S11-search` | Mã slice ở đầu |
| Test | `xxx.test.ts(x)` cạnh mã; E2E ở `e2e/` | |

Quy tắc xuất:
- Chỉ dùng **default export** khi Next.js yêu cầu (page, layout, route handler…); mọi nơi khác dùng named export.
- **Barrel file** (`index.ts`) chỉ có ở gốc feature và gốc gói; không tạo barrel ở từng thư mục con (làm chậm build và che mất vòng phụ thuộc).
- Mỗi tệp một component chính; component phụ rất nhỏ có thể ở cùng tệp.
- Không dùng đường dẫn tương đối dài (`../../../`); dùng alias `@/` trong ứng dụng và tên gói giữa các gói.
