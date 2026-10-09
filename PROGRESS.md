# Nhật Ký Tiến Độ Dự Án (Project Progress Tracker)

> **Chiến lược thực thi (ADR-006)**: **Frontend-First** – Xây dựng toàn bộ giao diện 13 Slices Giai đoạn 1 với Mock API & Zod Contracts trước khi chuyển sang làm Backend ở Giai đoạn 2.  
> **Nguyên tắc quản lý trạng thái theo ACID**:  
> - **Atomicity**: Một slice hoàn thành khi toàn bộ form validation, giao diện và test component đỗ.  
> - **Consistency**: Trạng thái trong bảng phản ánh đúng kết quả thực tế từ `.\scripts\verify.ps1 -Target fe`.  
> - **Isolation**: Tuân thủ nghiêm ngặt **WIP = 1** (chỉ có duy nhất 1 mục `[-] in_progress`).  
> - **Durability**: Lưu trữ tiến độ bền vững vào tệp này.

---

## 1. Công Việc Đang Thực Hiện (Current Active Task)

- **Active Task**: `Slice FE-S10: Giá Theo Mùa & Ngày Lễ (H08)` (Hoàn tất xác minh, chờ nghiệm thu)
- **WIP Count**: `0 / 1` (Tuân thủ giới hạn WIP = 1)
- **Cổng xác minh hiện tại**: `.\scripts\verify.ps1 -Target fe` -> `PASSED (Exit code 0)`

---

## 2. Giai Đoạn 1: Phát Triển Toàn Bộ Frontend (13 Vertical Slices + Foundations)

Quy ước trạng thái:
- `[ ] pending`: Chưa bắt đầu
- `[-] in_progress`: Đang thực hiện (Tối đa 1 mục duy nhất)
- `[x] passing`: Đã vượt qua câu lệnh xác minh (Pass-State Gating)

### Nền Tảng: Thiết Lập Base Dự Án (FE Base Setup Checklist - docs/base)
- [x] **Harness Setup**: Tạo cấu trúc 5 phân hệ, router AGENTS.md, module hóa tài liệu Giai đoạn 1: `Test-Path AGENTS.md` -> `passing`
- [x] **Frontend Harness**: Khung kiểm thử Vitest, TypeScript strict check: `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **FE-Base-01 Cấu Trúc & Env**: Tổ chức thư mục theo `docs/base/03` (`features/`, `components/`, `lib/`), alias path, Zod env validation (`env.ts`): `.\scripts\verify.ps1 -Target fe -Tier 1` -> `passing`
- [x] **FE-Base-02 Design Tokens & Shells**: Cấu hình token Tailwind v4 (`tokens.css`), hệ màu WCAG AA Airbnb-style, phông sans, 4 Layout Shells (`Public`, `Account`, `Host`, `Admin`): `.\scripts\verify.ps1 -Target fe -Tier 1` -> `passing`
- [x] **FE-Base-03 i18n & Error Handling**: Cấu hình `next-intl` định tuyến `[locale]` (vi/en), middleware chuyển hướng, chuẩn hoá lỗi Problem Details và tiện ích Money/Date: `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **FE-Base-04 Cổng Vào Xây Giao Diện**: Trang thử nghiệm `/dev/ui` chứa đầy đủ Token, 4 Shells và các UI Primitives đầu tiên (CMP-01 đến CMP-12): `.\scripts\verify.ps1 -Target fe -Tier 2` -> `passing`

---

### Slice FE-S01: Đăng Ký, Xác Minh Email, Đăng Nhập, Quên Mật Khẩu (P06, P07, P08, P09)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s01-auth/README.md`*
- [x] **S01 Contract & Mock**: Zod schema form đăng ký/đăng nhập + Mock auth handlers (cookie session giả lập): `.\scripts\verify.ps1 -Target fe -Tier 1` -> `passing`
- [x] **S01 UI Implementation**: Màn hình P06 (Đăng nhập), P07 (Đăng ký), P08 (Quên/Đặt lại MK), P09 (Xác minh email): `.\scripts\verify.ps1 -Target fe -Tier 2` -> `passing`
- [x] **S01 DB Schema & OpenAPI Contract**: Flyway migration `V1__create_auth_schema.sql`, ER diagram `db-design.md`, OpenAPI 3.1 `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S02: Hồ Sơ Người Dùng & Cài Đặt Tài Khoản (C01, C02)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s02-account/README.md`*
- [x] **S02 Account UI**: Màn hình C01 (Hồ sơ), C02 (Cài đặt, đổi MK, chuyển đổi chế độ Host/Guest): `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **S02 DB Schema & OpenAPI Contract**: ER diagram `db-design.md`, OpenAPI 3.0 `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S03: Back-office Đăng Nhập & Phân Quyền (A01, A18)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s03-admin-rbac/README.md`*
- [x] **S03 Admin UI**: Màn hình A01 (Admin Login), A18 (Quản lý nhân sự CSKH/Kế toán, phân quyền DataTable): `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **S03 DB Schema & OpenAPI Contract**: ER diagram `db-design.md`, OpenAPI 3.1 `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S04: Xác Minh Danh Tính Host (P10, H02, C03, A03)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s04-host-verification/README.md`*
- [x] **S04 Host Onboarding UI**: P10 (Trang giới thiệu Host), H02/C03 (Tải giấy tờ CCCD/Passport), A03 (Admin duyệt danh tính kèm SecureImageViewer, Soft lock, Watermark): `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **S04 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S05: Host Tạo Listing Nháp: Cơ Bản, Vị Trí, Ảnh (H03, H04 Bước 1–3)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s05-listing-draft/README.md`*
- [x] **S05 Listing Step 1-3 UI**: H03 (Danh sách listing), H04 Wizard (Bước 1: Loại phòng; Bước 2: Ghim vị trí bản đồ & vùng bảo vệ riêng tư BR-SRC-04; Bước 3: Upload ảnh kèm dnd-kit sắp xếp và hoàn tác 5s): `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **S05 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S06: Tiện Nghi, Quy Tắc Lưu Trú, Giá & Phí (H04 Bước 4–6)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s06-listing-amenities-pricing/README.md`*
- [x] **S06 Listing Step 4-6 UI**: H04 Wizard (Bước 4: Tiện nghi; Bước 5: Quy tắc lưu trú; Bước 6: Giá cơ bản & phí dọn dẹp kèm PriceBreakdown): `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **S06 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S07: Chính Sách Hủy, Pháp Lý & Gửi Duyệt (H04 Bước 7–8, H05)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s07-listing-policy-submit/README.md`*
- [x] **S07 Listing Step 7-8 UI**: H04 Wizard (Bước 7: Chính sách hủy & kiểu đặt; Bước 8: Giấy phép pháp lý; H05: Theo dõi trạng thái duyệt): `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **S07 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S08: Admin Thẩm Định & Duyệt Listing (A04)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s08-admin-review-listing/README.md`*
- [x] **S08 Admin Review UI**: A04 (Hàng đợi duyệt, chi tiết duyệt phòng, lock banner, kiểm tra ảnh/tiện nghi/giấy tờ, phê duyệt hoặc từ chối có lý do): `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **S08 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S09: Lịch Listing & Chống Đặt Trùng (H06)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s09-listing-calendar/README.md`*
- [x] **S09 Host Calendar UI**: H06 (Lịch tháng, chọn khoảng ngày để chặn/mở, hiển thị trạng thái đã đặt, lưu tự động): `.\scripts\verify.ps1 -Target fe -Tier 2` -> `passing`
- [x] **S09 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing`

---

### Slice FE-S10: Giá Theo Mùa & Ngày Lễ (H08)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s10-seasonal-pricing/README.md`*
- [x] **S10 Pricing Rules UI**: H08 (Bảng quy tắc giá theo mùa/lễ/cuối tuần, thứ tự ưu tiên áp dụng, định dạng tiền vi-VN): `.\scripts\verify.ps1 -Target fe -Tier 2` -> `passing` (2026-10-09)
- [x] **S10 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing` (2026-10-09)

---

### Slice FE-S11: Trang Chủ, Tìm Kiếm & Bản Đồ (P01, P02)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s11-home-search/README.md`*
- [x] **S11 Home & Search UI**: P01 (Trang chủ, thanh tìm kiếm viên thuốc), P02 (Kết quả tìm kiếm, bộ lọc URL, danh sách + bản đồ marker giá): `.\scripts\verify.ps1 -Target fe -Tier 2` -> `passing` (2026-10-09)
- [x] **S11 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing` (2026-10-09)

---

### Slice FE-S12: Chi Tiết Listing, Hồ Sơ Host & Chính Sách Hủy (P03, P04, P05)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s12-listing-detail/README.md`*
- [x] **S12 Listing Detail UI**: P03 (Lưới ảnh 1+4, Sticky Booking Box, tính giá qua Mock API), P04 (Hồ sơ Host công khai), P05 (Trang chính sách hủy): `.\scripts\verify.ps1 -Target fe -Tier 2` -> `passing` (2026-10-09)
- [x] **S12 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing` (2026-10-09)

---

### Slice FE-S13: Đa Tiền Tệ & Bảng Tỷ Giá (C02, P02, P03 Mở Rộng)
*Đặc tả: `frontend/docs/giai-doan-1/slices/s13-currency-exchange/README.md`*
- [x] **S13 Currency Switcher UI**: Menu đổi tiền tệ (VND, USD, EUR...), chuyển đổi hiển thị định dạng số tự động: `.\scripts\verify.ps1 -Target fe -Tier 2` -> `passing` (2026-10-09)
- [x] **S13 DB Schema & OpenAPI Contract**: `db-design.md`, `openapi.yaml`: `Code-check` -> `passing` (2026-10-09)

---

### Giai Đoạn Nghiệm Thu Cuối: Kiểm Thử Hành Trình Xuyên Suốt (E2E Journeys J1–J5)
*Đặc tả: `frontend/docs/giai-doan-1/appendices/e2e-journeys.md`*
- [-] **E2E Journeys Verification**: Kiểm thử 5 hành trình người dùng (J1–J5), bảo đảm tích hợp liền mạch giữa các module Giai đoạn 1: `.\scripts\verify.ps1 -Target fe` -> `in_progress`

---

## 3. Giai Đoạn 2: Phát Triển Backend (Spring Boot 4 Modular Monolith)
*(Tạm thời hoãn lại cho đến khi hoàn thành nghiệm thu toàn bộ 13 Slice Giai đoạn 1 của Frontend)*
- [ ] **Backend Slices**: S01 đến S14 (Flyway migrations, Spring Modulith packages, PostgreSQL PostGIS exclusion constraints, Outbox events, Mock Gateway).
