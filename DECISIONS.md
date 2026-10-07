# Nhật Ký Quyết Định Kỹ Thuật (Architecture Decision Records - ADR)

Tệp này thuộc **Phân hệ Trạng thái (State Subsystem)** của Harness, lưu giữ lịch sử và lý do đằng sau các quyết định kiến trúc cốt lõi để ngăn ngừa hiện tượng "Comprehension Rot".

---

## ADR-001: Kiến Trúc Modular Monolith Thay Vì Microservices
- **Ngày quyết định**: 2026-10-04
- **Bối cảnh**: Dự án phục vụ mô hình đặt phòng Marketplace local với yêu cầu nghiêm ngặt về tính nhất quán của giao dịch (lịch phòng, giữ chỗ, thanh toán, sổ cái).
- **Quyết định**: Sử dụng mô hình **Spring Boot 4 Modular Monolith** kết hợp Spring Modulith.
- **Lý do**:
  - Giữ các thao tác nguyên tử trong cùng một database transaction cục bộ, tránh giao dịch phân tán (2PC / Saga) phức tạp.
  - Chạy local cực kỳ nhẹ nhàng với Docker Compose.
  - Đảm bảo ranh giới giữa 14 module bằng unit test tự động (`ApplicationModules.verify()`).

---

## ADR-002: Bất Biến Lõi Nghiệp Vụ Tính Giá & Giữ Chỗ
- **Ngày quyết định**: 2026-10-04
- **Bối cảnh**: Trình duyệt có thể bị thao túng hoặc sai lệch múi giờ, dẫn tới tính sai tiền hoặc giữ phòng quá hạn.
- **Quyết định**:
  - Frontend **tuyệt đối không** tính giá, phụ phí, hoàn tiền. Server `PricingEngine` là nguồn sự thật duy nhất.
  - Giữ chỗ 15 phút tính theo mốc `expiresAt` (UTC) từ backend.
  - Sử dụng bean `TestableClock` tại backend để tua nhanh thời gian phục vụ kiểm thử.

---

## ADR-003: Chống Đặt Trùng Bằng PostgreSQL Exclusion Constraints
- **Ngày quyết định**: 2026-10-04
- **Bối cảnh**: KPI-02 yêu cầu tỷ lệ đặt trùng bằng 0, kể cả khi có nhiều request đồng thời trong cùng một mili-giây.
- **Quyết định**: Sử dụng PostgreSQL + PostGIS với `EXCLUSION USING gist (listing_id WITH =, booked_dates WITH &&)`.
- **Hệ quả**: Khi có xung đột ngày, PostgreSQL ném lỗi SQL `23P01`. Tầng ứng dụng bắt lỗi này và trả về `409 Conflict - BOOKING_OVERLAPPING_DATES`. Không dùng H2 cho kiểm thử tích hợp (bắt buộc dùng PostgreSQL thật qua Testcontainers hoặc Docker Compose).

---

## ADR-004: OpenAPI Contract-First Cho Giao Tiếp FE - BE
- **Ngày quyết định**: 2026-10-04
- **Bối cảnh**: Tránh sai lệch kiểu dữ liệu (Interface mismatch) giữa TypeScript (Frontend) và Java (Backend).
- **Quyết định**: Backend xuất `openapi.json` tự động qua `springdoc-openapi 3.x`. Frontend sử dụng `openapi-typescript` + `openapi-fetch` để tự động sinh kiểu dữ liệu TypeScript (`npm run gen:api`).

---

## ADR-005: Bảo Mật Phiên Với Spring Session JDBC
- **Ngày quyết định**: 2026-10-04
- **Bối cảnh**: Lưu trữ phiên đăng nhập bền vững trên local mà không cần triển khai thêm Redis.
- **Quyết định**: Sử dụng Spring Session lưu vào PostgreSQL qua JDBC. Cookie HttpOnly với thuộc tính `SameSite=Lax`. Next.js đóng vai trò proxy chuyển hướng `/api/*` về backend cùng origin.

---

## ADR-006: Chiến Lược Phát Triển Toàn Bộ Frontend Trước (Frontend-First via Contract & Mock)
- **Ngày quyết định**: 2026-10-04
- **Bối cảnh**: Nhóm phát triển muốn hoàn thiện toàn bộ trải nghiệm người dùng, mẫu tương tác kiểu Airbnb, thiết kế giao diện và luồng nghiệp vụ 13 slice Giai đoạn 1 trước khi xây dựng Backend.
- **Quyết định**:
  - Tập trung 100% nguồn lực hoàn thành **Giai đoạn 1: Frontend (S01 đến S13)**.
  - Sử dụng tầng **Mock API & Zod Schemas** dựa trên hợp đồng dữ liệu tại `docs/giai-doan-1/slices/sxx/data.md` để đảm bảo khi ghép Backend ở Giai đoạn 2 sẽ không bị lệch giao tiếp (Interface Mismatch).
  - Vẫn tuân thủ bất biến: Frontend không tự tính giá hay tự chạy đồng hồ, mà nhận kết quả tính toán từ Mock layer (đóng vai trò `PricingEngine` ảo).
  - Cổng kiểm soát nghiệm thu chính trong giai đoạn này là `.\scripts\verify.ps1 -Target fe`.

---

## ADR-007: Xử Lý Rủi Ro Lộ Tài Khoản (User Enumeration) Khi Đăng Ký Tài Khoản
- **Ngày quyết định**: 2026-10-05
- **Bối cảnh**:
  - Khi người dùng đăng ký với email đã tồn tại (`POST /api/v1/auth/register`), hệ thống đứng trước 2 phương án đối nghịch giữa Tính bảo mật (Privacy/Security) và Trải nghiệm người dùng (UX):
    + *Phương án A*: Trả về `409 Conflict` ("Email đã tồn tại"), hiển thị inline banner kèm đường dẫn "Đăng nhập ngay" hoặc "Quên mật khẩu". Nhược điểm: Kẻ tấn công có thể kiểm tra danh sách email xem email nào đã có tài khoản trên sàn.
    + *Phương án B*: Luôn trả về `201 Created` giả định và gửi email thông báo "Tài khoản đã tồn tại" tới địa chỉ đó. Nhược điểm: Tăng tỷ lệ rời bỏ (drop-off) do khách hàng không nhận được email ngay hoặc email rơi vào thư rác (spam box), gây bối rối và làm giảm chuyển đổi người dùng mới.
- **Quyết định**: Chọn **Phương án A (Chấp nhận trả lời 409 Conflict rõ ràng khi Đăng ký)** kết hợp với cơ chế phòng vệ nhiều lớp:
  1. **Rate Limiting nghiêm ngặt**: Áp dụng giới hạn tối đa 5 yêu cầu đăng ký/phút từ cùng 1 địa chỉ IP và 10 yêu cầu/giờ trên cùng subnet qua API Gateway.
  2. **Thử thách bảo mật (Invisible CAPTCHA/Turnstile)**: Kích hoạt khi phát hiện tần suất cao hoặc IP lạ trước khi gọi endpoint đăng ký.
  3. **Bảo mật tuyệt đối ở luồng Quên mật khẩu**: Endpoint `POST /api/v1/auth/forgot-password` bắt buộc trả về `202 Accepted` trung tính, không để lộ email có tồn tại hay không.
- **Lý do**:
  - Homestay Marketplace là nền tảng thương mại dịch vụ B2C, người dùng thường đăng ký tài khoản từ lâu và quên mất. Việc báo lỗi ngay trên màn hình P07 kèm nút "Đăng nhập ngay" giúp phục hồi người dùng lập tức mà không làm đứt gãy luồng đặt phòng.
  - Rủi ro user enumeration ở luồng đăng ký được triệt tiêu hiệu quả bằng Rate Limiting ở tầng Reverse Proxy / Gateway mà không làm suy giảm UX cốt lõi.


