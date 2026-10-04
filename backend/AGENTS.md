# Chỉ Dẫn Dành Riêng Cho Backend (Backend Agent Instructions)

Tệp này quy định các chuẩn mực kiến trúc và quy tắc triển khai phía máy chủ cho dự án Homestay Booking.

---

## 1. Công Nghệ & Nền Tảng Cốt Lõi
- **Runtime & Framework**: Java 21 LTS, Spring Boot 4.1.1, Spring Framework 7, Hibernate 7, Jakarta EE 11.
- **Build Tool**: Gradle Wrapper (`gradlew.bat` trên Windows, `./gradlew` trên Linux).
- **Kiến trúc module**: **Spring Modulith 2.x**. Mỗi module nghiệp vụ trong 14 module là một package con độc lập, có public API ở root package và internal implementation ẩn bên trong.
- **Cơ sở dữ liệu**: PostgreSQL 16 + PostGIS.
- **Migration**: Flyway (SQL thuần cho constraints, functions, và PostGIS).
- **Lưu trữ tệp**: AWS SDK v2 kết nối MinIO local.
- **Tài liệu API**: `springdoc-openapi 3.x` tại `http://localhost:8080/v3/api-docs`.

---

## 2. Quy Tắc Kỹ Thuật Không Thể Thương Lượng (Backend Invariants)
1. **Ranh Giới Module**: Các module không được phép trực tiếp gọi repository hoặc internal service của module khác. Giao tiếp liên module phải qua interface public hoặc Spring Modulith Events (`@ApplicationModuleListener`).
2. **Chống Đặt Trùng Tuyệt Đối**:
   - Dùng cột kiểu `daterange` và ràng buộc `EXCLUSION USING gist (listing_id WITH =, booked_dates WITH &&)`.
   - Bắt mã lỗi SQL `23P01` và ném exception `OverlapBookingException` chuyển thành `HTTP 409 Conflict`.
   - Không được dựa vào truy vấn kiểm tra SELECT trước INSERT thông thường vì không bảo đảm chống race condition.
3. **Đúng Đắn Về Tiền & Sổ Cái**:
   - Tiền luôn là số nguyên theo đơn vị nhỏ nhất (Minor Unit: VND là số nguyên, USD là cents) kèm mã ISO tiền tệ.
   - Sổ cái kế toán (Ledger) là bất biến: chỉ ghi thêm bút toán Nợ/Có (Double-entry), không sửa hoặc xóa bản ghi cũ.
4. **Kiểm Thử Thời Gian (Time-Travel)**:
   - Mọi thao tác lấy thời gian hiện tại bắt buộc phải inject bean `java.time.Clock`, không dùng `Instant.now()` hay `LocalDateTime.now()` trực tiếp.
   - Hỗ trợ endpoint `/api/dev/clock/advance` trên profile local để tua nhanh thời gian khi test.

---

## 3. Quy Trình Xác Minh Backend (Verification Commands)
- **Tier 1 (Compile & Check)**:
  ```powershell
  cmd /c "gradlew.bat compileJava compileTestJava"
  ```
- **Tier 2 (Unit & Modulith Boundary Test)**:
  ```powershell
  cmd /c "gradlew.bat test"
  ```
- **Xác minh qua Harness script**:
  ```powershell
  .\..\scripts\verify.ps1 -Target be
  ```
