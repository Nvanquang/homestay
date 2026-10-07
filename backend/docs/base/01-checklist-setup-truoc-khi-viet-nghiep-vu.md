# Checklist setup trước khi viết slice nghiệp vụ

Chỉ viết nghiệp vụ thật (đặt phòng, thanh toán, sổ cái…) khi **Cổng vào viết nghiệp vụ** ở cuối file đã đạt. Mỗi mục có tiêu chí «Xong khi» kiểm tra được.

Ước lượng: 6 đến 10 ngày cho một người; nặng hơn nền frontend vì nhiều hạ tầng cắt ngang. Phần này nên làm trước hoặc đầu slice **S01**. Nếu S01 bị chật, tách thành slice nền riêng (mã tạm `S00-BE`), demo bằng endpoint `GET /api/v1/health` và `GET /api/v1/me`, đăng nhập thử và một bản ghi audit.

---

## A. Môi trường

| # | Việc | Xong khi | File |
|---|---|---|---|
| A1 | JDK 21, Maven wrapper, Docker; ghim phiên bản | `./mvnw -v` đúng bản; sai bản thì build báo lỗi (Maven Enforcer) | 07 |
| A2 | Docker Compose: PostgreSQL + PostGIS, MinIO, Mailpit, `api`, `worker`, `mock-gateway` | Một lệnh dựng đủ; **mọi cổng chỉ gắn vào `127.0.0.1`** | 07 |
| A3 | Tệp `.env.example`, `.env` không vào git, mật khẩu ngẫu nhiên cho từng dịch vụ | Không có mật khẩu mặc định (`postgres/postgres`) nào còn dùng | 07 |

## B. Khung dự án

| # | Việc | Xong khi | File |
|---|---|---|---|
| B1 | Maven multi-module (`api`, `mock-gateway`), gói theo module nghiệp vụ, module `shared` | `./mvnw verify` xanh trên bản build sạch | 02 |
| B2 | Spring Modulith: test `ApplicationModules.verify()` | Import vi phạm ranh giới module làm test đỏ | 02, 08 |
| B3 | Quy tắc ArchUnit: không `Instant.now()`/`LocalDate.now()` (dùng `Clock`), controller không import repository/entity, domain không import web | Vi phạm làm test đỏ | 02, 08 |
| B4 | Spotless (định dạng), Maven Enforcer (phiên bản Java, hội tụ phụ thuộc, cấm phụ thuộc xấu), cờ biên dịch cảnh báo là lỗi | `./mvnw verify` chặn mã sai định dạng và phụ thuộc xung đột | 02, 07 |
| B5 | Profile cấu hình `local`, `test`, `prod`; thuộc tính cấu hình có kiểm tra (`@ConfigurationProperties` + `@Validated`) | Thiếu hoặc sai cấu hình bắt buộc thì ứng dụng không khởi động, báo rõ tên | 07 |
| B6 | Bean `Clock` dùng chung; bản `MutableClock` cho test | Mọi mã lấy thời gian qua `Clock` | 06, 08 |

## C. Cơ sở dữ liệu

| # | Việc | Xong khi | File |
|---|---|---|---|
| C1 | Flyway: migration nền, `ddl-auto=validate`, `open-in-view=false` | Khởi động trên DB trống tự dựng schema; schema lệch thì khởi động lỗi | 06 |
| C2 | Extension: `btree_gist`, `postgis`, `pg_trgm` (nếu dùng), hàm tạo UUID | Migration tạo extension chạy được trên image đã chọn | 06 |
| C3 | Ba vai trò DB: `app_owner` (migration), `app_rw` (runtime), `app_ro` (đọc/báo cáo) | Ứng dụng chạy bằng `app_rw`; `app_rw` không có quyền DDL | 06 |
| C4 | Bảng nền: `account`, session (Spring Session), `activity_log`, `idempotency_key`, `shedlock`, bảng sự kiện của Modulith | Migration tạo đủ; `activity_log` chỉ cho INSERT và SELECT | 06, 07 |
| C5 | Timeout phía DB: `statement_timeout`, `lock_timeout`, `idle_in_transaction_session_timeout` | Truy vấn treo bị cắt; có test | 06 |

## D. Cắt ngang (cross-cutting)

| # | Việc | Xong khi | File |
|---|---|---|---|
| D1 | Tiền: kiểu `Money` (số nguyên đơn vị nhỏ nhất + tiền tệ), quy tắc làm tròn | Có test cho VND/USD, làm tròn, chia phần | 06 |
| D2 | Danh mục mã lỗi `ErrorCode` + `@RestControllerAdvice` trả Problem Details | Mọi loại lỗi chính (validation, 401, 403, 404, 409, 429, 500) trả đúng dạng, không lộ chi tiết nội bộ | 03 |
| D3 | Bộ lọc `X-Request-Id`, log JSON có cấu trúc, MDC | Mỗi dòng log có `requestId`; log không chứa dữ liệu cá nhân | 07 |
| D4 | Bảo mật nền: chuỗi lọc mặc định từ chối, Spring Session JDBC, CSRF (cookie `XSRF-TOKEN`), header bảo mật, CORS tắt | Gọi endpoint chưa khai báo quyền bị 401/403; ghi mà không có CSRF bị từ chối | 04, 05 |
| D5 | Đăng nhập khung: Argon2id, `GET /api/v1/me` trả vai trò và quyền | Đăng nhập thử bằng tài khoản seed và đọc `me` | 04 |
| D6 | Hạ tầng idempotency: bảng, bộ chặn, test phát lại | Cùng `Idempotency-Key` hai lần chỉ thực hiện một lần; khác nội dung bị từ chối | 03, 06 |
| D7 | Dịch vụ audit `AuditService` ghi cùng transaction | Một thao tác mẫu ghi đúng một dòng audit; rollback thì không có dòng audit sai | 07 |
| D8 | Giới hạn tốc độ (Bucket4j trong bộ nhớ) cho đăng nhập, đăng ký, quên mật khẩu | Vượt ngưỡng trả 429 kèm `Retry-After` | 05 |
| D9 | Sự kiện module: Modulith event publication registry; ShedLock; một job mẫu | Sự kiện gửi lại được khi listener lỗi; job không chạy chồng | 06, 07 |
| D10 | Adapter ngoài: lưu trữ (MinIO/S3), email (Mailpit), HTTP client có **bộ bảo vệ SSRF** và timeout | Adapter có interface; HTTP client từ chối địa chỉ nội bộ | 05, 07 |
| D11 | Actuator ở cổng quản trị riêng, chỉ `health`, `info`, `metrics`; Swagger UI chỉ ở profile `local` | Cổng quản trị không được frontend rewrite tới | 07 |
| D12 | Xuất `openapi.json`; kiểm tra khác biệt phá vỡ hợp đồng trong CI | PR đổi hợp đồng phá vỡ làm CI đỏ | 03, 08 |

## E. Kiểm thử nền

| # | Việc | Xong khi | File |
|---|---|---|---|
| E1 | Lớp nền test tích hợp: Testcontainers (PostgreSQL + PostGIS, MinIO), Flyway, `MutableClock` | Một test tích hợp chạy trên DB thật, tự dọn | 08 |
| E2 | Bộ khung kiểm thử đồng thời (N luồng, rào xuất phát, lặp lại) | Một kịch bản mẫu chạy ổn định nhiều lần | 06, 08 |
| E3 | **Test ma trận phân quyền tự động:** duyệt mọi endpoint, mỗi endpoint phải có quy tắc truy cập | Thêm endpoint không khai báo quyền thì test đỏ | 05, 08 |
| E4 | Test hợp đồng lỗi và test không lộ trường nhạy cảm trong DTO | Có test cho dạng Problem Details; DTO không chứa `passwordHash`… | 03, 08 |
| E5 | Test an toàn nền: CSRF, header, không lộ stack trace, SSRF validator | Chạy trong CI | 08 |

## F. CI và tài liệu

| # | Việc | Xong khi | File |
|---|---|---|---|
| F1 | Pipeline CI: build + test + Spotless + Enforcer + quét phụ thuộc + quét bí mật + build image + quét image | Một PR mẫu chạy hết các bước | 07 |
| F2 | Bảo vệ nhánh chính, mẫu PR có checklist bảo mật | Không merge được khi CI đỏ | 07, 08 |
| F3 | ADR nền; README chạy trong 10 phút; mô hình đe doạ bản đầu (`docs/threat-model.md`) | Người khác chạy được theo README | 00, 04 |
| F4 | Script sao lưu và phục hồi PostgreSQL + MinIO; diễn tập phục hồi một lần | Phục hồi ra hệ thống chạy được và sổ cái khớp | 07 |

---

## Cổng vào viết nghiệp vụ

Chỉ khi **tất cả** các điều sau đúng thì mới viết slice nghiệp vụ:

- [ ] Một lệnh dựng cả hệ thống local trên máy sạch; các cổng chỉ nghe ở `127.0.0.1`.
- [ ] `./mvnw verify` xanh: biên dịch, định dạng, Enforcer, test đơn vị, test tích hợp, kiểm tra ranh giới module, ArchUnit.
- [ ] Mặc định từ chối hoạt động và **test ma trận phân quyền** bắt được endpoint thiếu quy tắc.
- [ ] Đăng nhập thử bằng phiên cookie JDBC có CSRF; `GET /api/v1/me` trả vai trò và quyền.
- [ ] Lỗi trả theo Problem Details với mã lỗi nghiệp vụ; không lộ stack trace hay SQL.
- [ ] Idempotency, audit cùng transaction, giới hạn tốc độ, `Clock` có thể tua: mỗi thứ có test.
- [ ] Ứng dụng chạy bằng tài khoản DB `app_rw`; `activity_log` không sửa/xoá được.
- [ ] Khung kiểm thử đồng thời và lớp nền Testcontainers sẵn sàng.
- [ ] `openapi.json` được xuất và kiểm tra khác biệt trong CI.
- [ ] Log JSON có `requestId`; không có bí mật hay dữ liệu cá nhân trong log mẫu.
- [ ] Hợp đồng với frontend (file 03, mục 9) đã thống nhất và có trong OpenAPI.
- [ ] ADR nền đã viết; README đã được một người khác thử.

Khi đạt cổng, viết nghiệp vụ theo thứ tự 14 slices trong `docs/harness/slices-plan.md` và `frontend/docs/giai-doan-1/README.md`. Mỗi slice chỉ **ghép** từ nền này; nếu phải sửa nền, tạo thay đổi nền riêng kèm ADR.
