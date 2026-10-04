# Môi Trường & Hạ Tầng Local (Environment & Infrastructure)

Phân hệ môi trường của Harness bảo đảm mọi thứ có thể tái lập được (reproducible) trên máy cá nhân của lập trình viên và phiên làm việc của Agent.

---

## 1. Dịch Vụ Hạ Tầng (Docker Compose)

File `docker-compose.yml` tại thư mục gốc định nghĩa 4 dịch vụ cốt lõi:
1. **db**: PostgreSQL 16 tích hợp sẵn PostGIS (image `postgis/postgis:16-3.4`).
   - Cổng: `5432`
   - Cung cấp: Giới hạn loại trừ `EXCLUSION USING gist (listing_id WITH =, booked_dates WITH &&)`
2. **minio**: Giả lập AWS S3 local lưu trữ ảnh listing và giấy tờ danh tính giả.
   - Cổng: API `9000`, Web Console `9001`
   - Credentials mặc định: `minioadmin` / `minioadmin`
3. **mailpit**: Giả lập SMTP server và cung cấp giao diện web đọc email kích hoạt / biên nhận.
   - Cổng: SMTP `1025`, Web UI `8025`
4. **mock-gateway**: Cổng thanh toán giả lập (Spring Boot hoặc WireMock) cho Visa, MoMo, VNPay.
   - Cổng: `8081`

---

## 2. Hướng Dẫn Khởi Chạy Local

### Bước 1: Khởi động các container phụ trợ
```bash
docker compose up -d
```

### Bước 2: Khởi động Backend (Spring Boot API)
```bash
cd backend
./gradlew bootRun
# API chạy tại http://localhost:8080
# Swagger UI tại http://localhost:8080/swagger-ui.html
```

### Bước 3: Khởi động Frontend (Next.js)
```bash
cd frontend
npm run dev
# Giao diện chạy tại http://localhost:3000
```

---

## 3. Cơ Chế Time-Travel (Clock Bean Tua Thời Gian)

Để kiểm thử các trạng thái nhạy cảm theo thời gian (giữ chỗ 15 phút, giải ngân T+1 sau check-in, đánh giá sau check-out 14 ngày) mà không phải chờ đợi thực tế:
- Backend sử dụng một Spring bean `TestableClock` mở rộng từ `java.time.Clock`.
- Trong môi trường local (`@Profile("local")`), endpoint nội bộ cho phép tua thời gian:
  - `POST /api/dev/clock/advance?duration=PT15M` (tua tới 15 phút)
  - `POST /api/dev/clock/advance?duration=P14D` (tua tới 14 ngày)
  - `POST /api/dev/clock/reset` (quay về giờ hệ thống)
