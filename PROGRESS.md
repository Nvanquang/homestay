# Nhật Ký Tiến Độ Dự Án (Project Progress Tracker)

> **Nguyên tắc quản lý trạng thái theo ACID**:  
> - **Atomicity**: Một tính năng chỉ hoàn thành khi toàn bộ các bước kiểm thử liên quan đều đỗ.  
> - **Consistency**: Trạng thái trong bảng phải phản ánh đúng kết quả thực tế từ câu lệnh xác minh.  
> - **Isolation**: Tuân thủ nghiêm ngặt **WIP = 1** (chỉ có duy nhất 1 mục `[-] in_progress`).  
> - **Durability**: Mọi thay đổi trạng thái đều được lưu bền vững vào file này.

---

## 1. Công Việc Đang Thực Hiện (Current Active Task)

- **Active Task**: `Không có (Đã hoàn thành thiết lập Harness & Sẵn sàng cho Slice S01)`
- **WIP Count**: `0 / 1` (Tuân thủ giới hạn WIP = 1)

---

## 2. Bảng Phân Rã Tính Năng (Feature Triple: Behavior | Verification | State)

Quy ước trạng thái:
- `[ ] pending`: Chưa bắt đầu
- `[-] in_progress`: Đang thực hiện (Tối đa 1 mục)
- `[x] passing`: Đã vượt qua câu lệnh xác minh (Pass-State Gating)

### Slice S00: Thiết Lập Hạ Tầng Harness & Khung Kiểm Thử (Infrastructure & Harness Setup)
- [x] **Harness Setup**: Tạo cấu trúc 5 phân hệ, router AGENTS.md và tài liệu harness: `Test-Path AGENTS.md, docs/harness/architecture.md` -> `passing`
- [x] **Frontend Harness**: Cài đặt test runner Vitest, smoke test và typecheck sạch: `.\scripts\verify.ps1 -Target fe` -> `passing`
- [x] **Backend Harness**: Cấu hình Gradle, Java 21, Spring Boot test harness: `.\scripts\verify.ps1 -Target be` -> `passing`
- [x] **Verification Script**: Tạo script xác minh 3 tầng tự động verify.ps1 và verify.sh: `.\scripts\verify.ps1 -Target all` -> `passing`

---

### Slice S01: Đăng Ký, Đăng Nhập & Quản Lý Phiên (Auth & Session Management)
- [ ] **Auth Backend Schema**: Flyway migration tạo bảng `users`, `roles`, Spring Session JDBC: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Auth API**: Triển khai endpoint đăng ký, đăng nhập với mật khẩu Argon2: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Auth OpenAPI Sync**: Xuất OpenAPI spec và sinh client TypeScript cho Frontend: `cd frontend; npm run gen:api` -> `pending`
- [ ] **Auth Frontend UI**: Trang đăng ký/đăng nhập Form với Zod validation & React Hook Form: `.\scripts\verify.ps1 -Target fe -Tier 2` -> `pending`

---

### Slice S02: Hồ Sơ Người Dùng & Xác Thực Danh Tính (Profile & Identity Verification)
- [ ] **Profile API & Upload**: Upload giấy tờ tùy thân giả lên MinIO private bucket qua Presigned URL: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Identity Review UI**: Giao diện Back-office duyệt hồ sơ danh tính thủ công: `.\scripts\verify.ps1 -Target fe -Tier 2` -> `pending`

---

### Slice S03: Tạo Listing Phòng & Lưu Bản Nháp (Listing Creation Multi-step)
- [ ] **Listing Data Model**: Migration bảng `listings`, ranh giới package Spring Modulith: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Listing Multi-Step Form**: Frontend form nhiều bước với dnd-kit sắp xếp ảnh và Zod auto-save draft: `.\scripts\verify.ps1 -Target fe -Tier 2` -> `pending`

---

### Slice S04: Bảng Giá & Công Thức Tính Giá (Pricing Engine)
- [ ] **Pricing Engine Core**: Module tính giá phòng theo đêm, cuối tuần, phí dọn dẹp, tiền tệ (bất biến): `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Pricing Quote API**: API báo giá chi tiết cho frontend hiển thị: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`

---

### Slice S05: Quản Lý Lịch Phòng & Ngày Khóa (Calendar & Availability)
- [ ] **Calendar Exclusions**: Dữ liệu ngày chặn với PostgreSQL `daterange`: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Calendar UI**: Chọn khoảng ngày bằng react-day-picker hiển thị giá từng đêm: `.\scripts\verify.ps1 -Target fe -Tier 2` -> `pending`

---

### Slice S06: Đặt Chỗ, Giữ Chỗ 15 Phút & Chống Đặt Trùng (Booking & Anti-Double Booking)
- [ ] **Anti-Double Booking**: Giới hạn loại trừ `EXCLUSION USING gist` bắt lỗi `23P01`: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Hold Countdown UI**: Đếm ngược giữ phòng 15 phút theo giờ UTC server: `.\scripts\verify.ps1 -Target fe -Tier 2` -> `pending`

---

### Slice S07: Cổng Thanh Toán Giả Lập & Webhook (Payment Mock & Webhooks)
- [ ] **Mock Gateway Service**: Dịch vụ giả lập thanh toán thẻ, MoMo, VNPay có chữ ký HMAC: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Payment Callback Handler**: Xử lý callback bất đồng bộ, chống xử lý trùng (Idempotency): `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`

---

### Slice S08: Chính Sách Hủy & Hoàn Tiền (Cancellation & Refunds)
- [ ] **Cancellation Calculator**: Tính toán tỷ lệ hoàn tiền theo chính sách và múi giờ listing: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`

---

### Slice S09: Sổ Cái Bất Biến & Quyết Toán Host (Ledger & Host Payouts)
- [ ] **Immutable Double-Entry Ledger**: Bút toán Nợ/Có bất biến ghi nhận mọi dòng tiền: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Payout Worker**: Job giải ngân T+1 sau khi khách check-in thành công: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`

---

### Slice S10: Nhắn Tin Nội Bộ (Guest-Host Messaging)
- [ ] **Messaging API**: Trò chuyện theo ngữ cảnh booking: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Messaging UI**: Chat panel với auto-scroll và polling: `.\scripts\verify.ps1 -Target fe -Tier 2` -> `pending`

---

### Slice S11: Tìm Kiếm Địa Lý & Bản Đồ (Geospatial Search & Map)
- [ ] **PostGIS Search**: Truy vấn `ST_DWithin` kết hợp khoảng ngày và số khách: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
- [ ] **Mapbox Interactive UI**: Bản đồ đồng bộ marker nhãn giá và bộ lọc URL qua `nuqs`: `.\scripts\verify.ps1 -Target fe -Tier 2` -> `pending`

---

### Slice S12: Đánh Giá Hai Chiều (Blind Reviews)
- [ ] **Blind Review Logic**: Khóa đánh giá cho đến khi cả hai bên gửi hoặc hết hạn 14 ngày: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`

---

### Slice S13: Xử Lý Khiếu Nại & Quản Trị (Disputes & Back-office)
- [ ] **Dispute Workflow**: Luồng can thiệp của CSKH/Admin và ghi nhật ký kiểm toán: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`

---

### Slice S14: Đồng Bộ Lịch iCal Hai Chiều (iCal Sync Worker)
- [ ] **iCal Sync Engine**: Phân tích và phát sinh feed iCal với ical4j qua ShedLock: `.\scripts\verify.ps1 -Target be -Tier 2` -> `pending`
