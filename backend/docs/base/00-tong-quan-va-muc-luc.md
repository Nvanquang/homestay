# Nền tảng Backend – Tổng quan và mục lục

Bộ tài liệu này định nghĩa **các nguyên tắc chuẩn để dựng nền backend** cho hệ thống đặt phòng: kiến trúc phân lớp, thiết kế API, bảo mật, toàn vẹn dữ liệu, vận hành và kiểm thử. Mọi slice nghiệp vụ sau này được viết trên nền này và theo cùng quy tắc.

Bối cảnh: modular monolith Spring Boot, PostgreSQL, chạy local bằng Docker Compose, không đưa vào thực tế. Vì vậy mỗi chủ đề được **chọn lọc**: làm đầy đủ phần quyết định tính đúng đắn và an toàn của hệ thống (tiền, đặt phòng, danh tính), giảm nhẹ phần chỉ cần khi vận hành thật, và **ghi rõ phần cần làm nếu sau này đưa lên thật**.

Tài liệu liên quan: `kien-truc-he-thong-dat-phong.md` (kiến trúc, mục 3.3 là thư viện backend), thư mục `frontend/docs/giai-doan-1` (đặc tả giao diện 13 Vertical Slices S01–S13 và Foundations; hợp đồng giữa hai bên nằm ở file 03 của bộ này), thư mục `docs/harness/slices-plan.md` (kế hoạch 14 slices).

---

## 1. Stack nền

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Ngôn ngữ, runtime | Java 21 LTS, virtual threads (có giới hạn bởi connection pool) | Spring Boot 4 chạy được trên Java 17 trở lên và hỗ trợ cả Java 25 |
| Framework | Spring Boot 4.x (Spring Framework 7, Spring Security 7, Hibernate 7) | Kiểm tra từng thư viện có hỗ trợ Boot 4 trước khi thêm |
| Cấu trúc module | Spring Modulith 2.x | Kiểm tra ranh giới, sự kiện lưu bền (đóng vai trò outbox) |
| Cơ sở dữ liệu | PostgreSQL + PostGIS | Exclusion constraint, `FOR UPDATE`, JSONB, PostGIS |
| Truy cập dữ liệu | Spring Data JPA cho CRUD; jOOQ và SQL tường minh cho tìm kiếm, khả dụng, báo cáo, sổ cái | |
| Migration | Flyway | SQL thuần, chỉ tiến tới |
| Xác thực | Spring Security + Spring Session JDBC, mật khẩu Argon2id | Không dùng JWT (xem mục 3) |
| Tài liệu API | springdoc-openapi 3.x | Sinh `openapi.json` cho frontend |
| Job | `@Scheduled` + ShedLock | |
| File | AWS SDK v2 (S3 API) trỏ tới MinIO | |
| Quan sát | Actuator, Micrometer, log JSON có cấu trúc, OpenTelemetry (tuỳ chọn) | |
| Build | Maven (wrapper), multi-module: `api`, `mock-gateway` | |
| Kiểm thử | JUnit 5, AssertJ, Testcontainers, Awaitility, ArchUnit/Modulith verify | |
| Đóng gói | Docker (multi-stage, người dùng không đặc quyền), Docker Compose | |

---

## 2. Cách chọn các chủ đề bạn nêu

Danh sách bạn đưa là gợi ý; dưới đây là kết quả chọn lọc cho dự án này.

| Chủ đề | Quyết định | File |
|---|---|---|
| OWASP Top 10 (2025) | **Dùng** làm khung kiểm tra; ánh xạ từng hạng mục vào biện pháp cụ thể | 04 |
| OWASP API Security Top 10 (2023) | **Dùng**, ánh xạ vào thiết kế API và kiểm thử phân quyền | 04, 05 |
| Xác thực an toàn | **Dùng**: phiên cookie, Argon2id, xác minh email, đặt lại mật khẩu an toàn | 04 |
| Phân quyền, RBAC | **Dùng**: vai trò + quyền chi tiết cho nhân sự, mặc định từ chối | 05 |
| ABAC | **Dùng mức nhẹ**: quy tắc theo thuộc tính (chủ sở hữu, trạng thái, hạn mức) viết bằng lớp policy trong code; **không** dùng bộ máy chính sách ngoài (OPA, Cedar) vì chưa cần | 05 |
| Kiểm tra đầu vào, chống injection | **Dùng** | 05 |
| Upload file an toàn | **Dùng** (luồng URL ký, kiểm tra loại thật, cách ly) | 05 |
| CORS, CSRF, header bảo mật | **Dùng**; CORS mặc định tắt vì cùng origin | 05 |
| RESTful, phiên bản API | **Dùng** (`/api/v1`) | 03 |
| Tách DTO và Entity | **Dùng**, bắt buộc | 02, 03 |
| Clean Code, SOLID, DRY, KISS, YAGNI | **Dùng**, diễn giải cụ thể cho dự án; YAGNI có danh sách «chưa làm» | 02 |
| Kiến trúc phân lớp | **Dùng** bên trong từng module | 02 |
| Xử lý ngoại lệ tập trung | **Dùng**; có danh mục mã lỗi | 03 |
| Toàn vẹn dữ liệu, transaction, concurrency, race condition, idempotency | **Dùng, trọng tâm của dự án** | 06 |
| Index, tối ưu truy vấn, N+1 | **Dùng** | 06 |
| Cache | **Dùng hạn chế**: bộ nhớ trong và HTTP cache; **không Redis** | 06 |
| Giới hạn tốc độ, chống brute force | **Dùng** (bộ nhớ trong, thiết kế để chuyển sang kho dùng chung) | 04, 05 |
| Log có cấu trúc, audit log | **Dùng**; audit log là yêu cầu nghiệp vụ (bất biến 15) | 07 |
| Giám sát, quan sát | **Dùng mức vừa**: Actuator, Micrometer, chỉ số nghiệp vụ; dashboard tuỳ chọn | 07 |
| Quản lý bí mật, cấu hình an toàn | **Dùng**: biến môi trường, không bí mật trong repo; Vault chưa cần | 07 |
| An toàn phụ thuộc | **Dùng** (OWASP A03:2025 chuỗi cung ứng) | 07 |
| Docker an toàn | **Dùng** | 07 |
| HTTPS, reverse proxy | **Giảm nhẹ ở local** (HTTP trên `*.localhost`), có cấu hình sẵn cho môi trường thật | 07 |
| Least privilege | **Dùng** ở DB, MinIO, container, nhân sự | 05, 06, 07 |
| Sao lưu và phục hồi | **Dùng mức local**: script sao lưu và diễn tập phục hồi; PITR là việc của môi trường thật | 07 |
| Production readiness | **Dùng làm danh sách «nếu đưa lên thật»**, không phải mục tiêu hiện tại | 07 |
| Unit, integration, security testing | **Dùng**, kèm kiểm thử đồng thời và ma trận phân quyền tự động | 08 |
| CI/CD | **Dùng CI**; CD chỉ là dựng ảnh và chạy bằng Compose | 07, 08 |

Chưa dùng (có lý do, xem YAGNI ở file 02): Kafka/RabbitMQ, Redis, API gateway, service mesh, WAF, OAuth2/OIDC/JWT, Kubernetes, CQRS và event sourcing, row-level security của PostgreSQL.

---

## 3. Mười hai nguyên tắc cốt lõi

1. **Bất biến nghiệp vụ do cơ sở dữ liệu bảo vệ.** Không dựa vào «kiểm tra rồi mới ghi» ở tầng ứng dụng. Ràng buộc, khoá, unique là trọng tài cuối. (06)
2. **Mặc định từ chối.** Endpoint không khai báo quyền thì bị chặn; có test tự động kiểm tra. (05)
3. **Không tin dữ liệu từ client.** Giá, trạng thái, chủ sở hữu, vai trò luôn do server quyết định. (03, 05)
4. **Kiểm tra quyền ở ba tầng:** đường dẫn, hành động, **từng đối tượng**; thiếu tầng đối tượng là lỗ hổng phổ biến nhất. (05)
5. **Tách DTO và entity;** entity không bao giờ ra khỏi biên, DTO không bao giờ gán thẳng vào entity. (02)
6. **Một nơi cho mỗi luật nghiệp vụ.** Giá tính ở một bộ máy, trạng thái booking chuyển ở một máy trạng thái, tiền ghi qua một dịch vụ sổ cái. (02, 06)
7. **Transaction ngắn, không gọi bên ngoài bên trong transaction.** Việc bên ngoài đi qua sự kiện sau commit. (06)
8. **Mọi thao tác ghi tiền hoặc tạo booking đều idempotent.** (03, 06)
9. **Thất bại một cách an toàn.** Lỗi không lường trước từ chối yêu cầu và ghi log; không bỏ qua im lặng, không để lộ chi tiết nội bộ. (03)
10. **Ghi lại để truy vết.** Mọi thao tác nhạy cảm có audit log cùng transaction; log kỹ thuật có cấu trúc, không chứa dữ liệu cá nhân. (07)
11. **Đặc quyền tối thiểu** ở mọi lớp: tài khoản DB, khoá MinIO, container, quyền nhân sự. (05, 06, 07)
12. **Tự động hoá kiểm tra:** ranh giới module, quyền, hợp đồng API, đồng thời, bảo mật chạy trong CI. (08)

---

## 4. Mục lục tài liệu

| File | Nội dung | Ai đọc, khi nào |
|---|---|---|
| `01-checklist-setup-truoc-khi-viet-nghiep-vu.md` | Việc phải xong trước khi viết slice nghiệp vụ, cổng vào | Mọi người, **đọc đầu tiên** |
| `02-cau-truc-kien-truc-phan-lop-va-clean-code.md` | Cấu trúc dự án, phân lớp, DTO/Entity, SOLID, DRY, KISS, YAGNI, quy ước code | Mọi người |
| `03-thiet-ke-api-loi-va-hop-dong.md` | REST, phiên bản, DTO, phân trang, mô hình lỗi, xử lý ngoại lệ tập trung, hợp đồng với frontend | Mọi người làm endpoint |
| `04-bao-mat-1-owasp-xac-thuc-mat-khau.md` | OWASP Top 10 và API Top 10, xác thực, phiên, mật khẩu, brute force, mã hoá, dữ liệu nhạy cảm | Bắt buộc đọc |
| `05-bao-mat-2-phan-quyen-dau-vao-upload.md` | RBAC, ABAC, kiểm tra đối tượng, đầu vào, injection, SSRF, upload, CORS, CSRF, header, giới hạn tốc độ | Bắt buộc đọc |
| `06-toan-ven-du-lieu-giao-dich-dong-thoi.md` | Ràng buộc DB, transaction, concurrency, idempotency, sổ cái, index, N+1, cache, migration | Mọi người |
| `07-van-hanh-log-giam-sat-docker-ci.md` | Log, audit, giám sát, cấu hình, bí mật, Docker, HTTPS, phụ thuộc, CI/CD, sao lưu, production readiness | Mọi người |
| `08-kiem-thu-chat-luong-va-dinh-nghia-hoan-thanh.md` | Chiến lược kiểm thử, kiểm thử đồng thời, kiểm thử bảo mật, định nghĩa hoàn thành | Mọi người |
| `09-i18n-phia-backend.md` | Đa ngôn ngữ (i18n) backend: nguyên tắc, message bundle, danh mục, email, timezone, checklist | Mọi người làm dịch vụ/API |

---

## 5. Quy ước dùng trong tài liệu

- Mã slice `S01` đến `S59` lấy từ thư mục `slices`; mã bất biến (bất biến 1, 8, 14, 15…) và mã quy tắc (BR-…, OQ-…) lấy từ đặc tả nghiệp vụ.
- «Bắt buộc» là quy tắc có kiểm tra tự động hoặc bị từ chối ở review; «Nên» là mặc định, bỏ được khi có lý do ghi trong PR.
- Đoạn mã chỉ minh hoạ cấu hình hoặc mẫu; kiểm tra lại tài liệu chính thức của thư viện khi áp dụng vì phiên bản có thể đã đổi.
- Thay đổi một quy tắc nền phải kèm một ADR ngắn trong `docs/adr`.
- Tên gói Java dùng `com.booking.*` làm ví dụ; đổi theo tên miền của bạn khi khởi tạo.
