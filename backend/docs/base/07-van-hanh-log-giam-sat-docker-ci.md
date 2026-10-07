# Vận hành: log, giám sát, cấu hình, Docker, CI/CD

Phần vận hành của nền backend. Dự án chạy local nên nhiều mục có hai mức: **bắt buộc ngay** và **chỉ khi đưa lên môi trường thật** (ghi rõ trong từng bảng).

---

## 1. Log có cấu trúc

| Quy tắc | Chi tiết |
|---|---|
| Định dạng | **JSON** một dòng một sự kiện, dùng log có cấu trúc tích hợp của Spring Boot (định dạng ECS hoặc Logstash); local có thể dùng định dạng dễ đọc ở profile riêng |
| Trường bắt buộc | `timestamp` (UTC), `level`, `service`, `logger`, `message`, `traceId`, `requestId`, `module`; khi có: `accountId` (định danh, không tên/email), `event` (tên sự kiện ổn định, ví dụ `booking.hold.created`) |
| Mã yêu cầu | Bộ lọc nhận `X-Request-Id` (kiểm tra định dạng và độ dài, không hợp lệ thì tự sinh), đặt vào MDC, trả lại trong header phản hồi |
| Mức log | `ERROR`: cần người xử lý (lỗi hệ thống 5xx, vi phạm bất biến, tích hợp hỏng). `WARN`: bất thường đã xử lý (callback trùng, thử lại, từ chối do giới hạn). `INFO`: sự kiện nghiệp vụ và vòng đời (booking xác nhận, job hoàn tất). `DEBUG`: chỉ khi điều tra, tắt mặc định |
| Ghi một lần | Ghi ở ranh giới (xử lý lỗi tập trung); không ghi rồi ném lại ở mọi tầng |
| **Không ghi** | Mật khẩu, token, khoá, số thẻ/tài khoản, giấy tờ, nội dung tin nhắn, email/điện thoại/địa chỉ thô, thân yêu cầu và phản hồi nguyên bản, URL ký sẵn, URL thanh toán chứa mã giao dịch |
| Che dữ liệu | Nếu bắt buộc nhắc tới dữ liệu cá nhân: dùng định danh hoặc che (chỉ vài ký tự); kiểm thử khẳng định log không chứa mẫu nhạy cảm |
| Chống chèn log | Bộ mã hoá JSON thoát xuống dòng và ký tự điều khiển; không nối dữ liệu người dùng vào thông điệp |
| Log bảo mật | Danh mục sự kiện riêng (`security.*`): đăng nhập thất bại, khoá tài khoản, từ chối quyền, CSRF/Origin sai, chữ ký webhook sai, SSRF bị chặn, vượt giới hạn tốc độ, upload bị từ chối |
| Lưu giữ | Local: xoay vòng, giữ ngắn; môi trường thật: gom tập trung, giữ theo chính sách, quyền truy cập hạn chế |

---

## 2. Audit log (nhật ký kiểm toán)

Audit log là **yêu cầu nghiệp vụ** (bất biến 15), khác với log kỹ thuật: bền vững, có cấu trúc, **không sửa xoá được**, phục vụ truy vết và tranh chấp.

| Hạng mục | Quy định |
|---|---|
| Ghi những gì | Thao tác nhân sự: duyệt/từ chối danh tính và listing, khoá/mở khoá người dùng, đổi cấu hình (kèm giá trị cũ/mới), quyết định tranh chấp, hoàn tiền/huỷ ngoại lệ, xử lý payout, đổi phân quyền, tạo/khoá nhân sự. Thao tác người dùng nhạy cảm: đổi mật khẩu, đổi tài khoản payout, đổi trạng thái booking quan trọng, huỷ. **Mọi lượt xem giấy tờ danh tính** |
| Trường | Người thực hiện (id, loại, vai trò), hành động (enum), đối tượng (loại, id), **giá trị cũ/mới** (chỉ phần thay đổi, không chứa bí mật), **lý do** (bắt buộc cho thao tác nhạy cảm), kết quả (thành công, bị từ chối), `requestId`, địa chỉ IP rút gọn, thời điểm (UTC do server đặt) |
| Cùng transaction | Ghi **trong cùng transaction** với thay đổi (không có thay đổi mà thiếu audit, không có audit cho thay đổi không xảy ra) |
| Lần bị từ chối | Ghi bằng transaction riêng (`REQUIRES_NEW`) để còn lại dù thao tác chính rollback |
| Chỉ thêm | Quyền DB chỉ `INSERT`/`SELECT`, trigger chặn sửa xoá (file 06, mục 1.3) |
| Dịch vụ duy nhất | `AuditService` ở `shared`; gọi tường minh từ `application` |
| Không chứa | Mật khẩu, token, nội dung giấy tờ, số tài khoản đầy đủ |
| Chống giả mạo (tuỳ chọn) | Chuỗi băm nối tiếp giữa các dòng để phát hiện sửa; chỉ khi có nhu cầu pháp lý |
| Truy cập | Chỉ quyền `audit:view`; xem audit cũng có thể được ghi lại |
| Lưu giữ | Theo cấu hình và yêu cầu pháp lý; không xoá trong thời hạn lưu |

---

## 3. Giám sát và quan sát

### 3.1. Mức nền (làm ngay)

| Thành phần | Quy định |
|---|---|
| Actuator | **Cổng quản trị riêng** (ví dụ 8081), chỉ nghe nội bộ, **không** được frontend rewrite tới; chỉ mở `health`, `info`, `metrics` (và `prometheus` nếu dùng); không mở `env`, `heapdump`, `threaddump`, `loggers` |
| Health | `liveness` (tiến trình còn sống) và `readiness` (DB, lưu trữ, tích hợp bắt buộc); chi tiết chỉ cho người được phép |
| Chỉ số kỹ thuật | Micrometer: HTTP (số yêu cầu, độ trễ, mã trạng thái), JVM, pool kết nối (Hikari), độ trễ job |
| **Chỉ số nghiệp vụ** | Giữ chỗ tạo mới, giữ chỗ hết hạn, **vi phạm ràng buộc đặt trùng bị chặn** (`calendar.unavailable`), callback thanh toán trùng/muộn/thiếu, thanh toán pending quá hạn, hoàn tiền thất bại, **lệch đối soát**, payout lỗi, đồng bộ iCal lỗi, số sự kiện tồn đọng chưa xử lý, đăng nhập thất bại, số lần giới hạn tốc độ chặn |
| Truy vết | `traceId` trong log; Micrometer Tracing + OpenTelemetry là tuỳ chọn |

### 3.2. Dashboard và cảnh báo

| Mục | Local | Môi trường thật |
|---|---|---|
| Dashboard | Tuỳ chọn: profile Compose `observability` (Prometheus + Grafana) | Bắt buộc |
| Cảnh báo | Màn đối soát (T02) và log mức WARN/ERROR | Cảnh báo chủ động |

Cảnh báo cần có khi đưa lên thật: lệch đối soát lớn hơn 0; thanh toán pending quá ngưỡng; payout lỗi; sự kiện tồn đọng vượt ngưỡng; job thất bại hoặc trễ; tỉ lệ 5xx vượt ngưỡng; tăng đột biến đăng nhập thất bại hoặc chữ ký webhook sai; vi phạm cân đối sổ cái.

---

## 4. Cấu hình an toàn

| Chủ đề | Quy định |
|---|---|
| Profile | `local`, `test`, `prod` tách biệt; mặc định (không chỉ định profile) phải là **cấu hình an toàn nhất**, không phải `local` |
| Kiểm tra cấu hình | `@ConfigurationProperties` bằng `record` + `@Validated`; thiếu hoặc sai thì **không khởi động** |
| Phơi bày lỗi | `server.error.include-message`, `include-stacktrace`, `include-binding-errors`, `include-exception` đều tắt |
| Jackson | Từ chối trường lạ ở yêu cầu vào; không bật kiểu mặc định đa hình |
| JPA | `open-in-view=false`, `ddl-auto=validate`; không in SQL ở mức thấp ngoài local |
| Swagger UI | Chỉ profile `local`; tắt hẳn ở `prod` |
| Cổng và địa chỉ | Chỉ nghe ở địa chỉ cần thiết; Actuator ở cổng riêng |
| Timeout | Đặt cho yêu cầu, kết nối DB, mọi `RestClient` (kết nối và đọc), HTTP phía MinIO |
| Pool kết nối | Giới hạn tối đa (virtual threads không được phép làm tràn pool DB) |
| Tắt thứ không dùng | DevTools không có trong bản chạy; không có endpoint ví dụ; không tài khoản mặc định |
| Tắt máy êm | `server.shutdown=graceful`, hoàn tất yêu cầu và job đang chạy |
| Kích thước | Giới hạn kích thước header, thân yêu cầu, multipart |

---

## 5. Quản lý bí mật

| Quy tắc | Chi tiết |
|---|---|
| Không bí mật trong repo | Không trong mã, `application.yml`, `docker-compose.yml`, Dockerfile, lịch sử git |
| Nơi chứa | `.env` ở local (không đưa vào git) kèm `.env.example`; biến môi trường hoặc **secret/mounted file** của Docker ở môi trường thật; kho bí mật chuyên dụng (ví dụ Vault) khi có nhiều dịch vụ — chưa cần ở giai đoạn này |
| Sinh bí mật local | Script sinh mật khẩu ngẫu nhiên mạnh khác nhau cho từng dịch vụ và từng vai trò DB |
| Loại bí mật | Mật khẩu DB (ba vai trò), khoá MinIO, khoá HMAC của cổng thanh toán, khoá mã hoá trường (kèm `keyId`), khoá SMTP (nếu có) |
| Quay vòng | Có quy trình đổi khoá không cần dừng hệ thống (khoá mã hoá có `keyId`, chấp nhận khoá cũ để giải mã) |
| Quét bí mật | gitleaks (hoặc tương đương) trong hook trước commit và trong CI |
| Không lộ | Không in bí mật ra log, trang lỗi, Actuator, OpenAPI; che trong `toString` của đối tượng cấu hình |
| Tách theo môi trường | Khoá local, test, thật khác nhau hoàn toàn; khoá thật không bao giờ xuất hiện ở máy phát triển |

---

## 6. An toàn phụ thuộc và chuỗi cung ứng (OWASP A03:2025)

| Biện pháp | Chi tiết |
|---|---|
| Quản lý phiên bản | Dùng BOM của Spring Boot; không ghi đè phiên bản nếu không có lý do được ghi lại; ghim phiên bản plugin Maven; dùng Maven wrapper |
| Cổng thêm thư viện | Cùng tiêu chí với frontend: cần thật sự, đang bảo trì, hỗ trợ Spring Boot 4, kích thước phụ thuộc, giấy phép |
| Kiểm tra lỗ hổng | Quét phụ thuộc trong CI (OSV-Scanner, OWASP Dependency-Check hoặc Trivy); lỗ hổng mức cao chặn merge |
| Cập nhật | Dependabot hoặc Renovate mở PR hằng tuần; **vá bảo mật trong 7 ngày** |
| Enforcer | Hội tụ phụ thuộc, cấm phụ thuộc có lỗ hổng đã biết hoặc lỗi thời, cấm bản SNAPSHOT |
| Toàn vẹn | Kiểm tra checksum khi tải phụ thuộc; chỉ dùng kho Maven Central và kho đã duyệt |
| SBOM | Sinh CycloneDX khi build, lưu cùng artifact |
| Giấy phép | Kiểm tra giấy phép tương thích (tuỳ chọn) |
| CI | Ghim phiên bản action theo mã băm commit; quyền token CI tối thiểu |
| Image | Quét image bằng Trivy hoặc Grype trong CI |

---

## 7. Docker và đóng gói

### 7.1. Image của ứng dụng

| Quy tắc | Chi tiết |
|---|---|
| Multi-stage | Giai đoạn build (JDK, Maven) tách khỏi giai đoạn chạy (chỉ JRE) |
| Base image | Tối giản và chính thống (ví dụ Eclipse Temurin JRE hoặc distroless Java); ghim phiên bản (môi trường thật ghim theo digest) |
| **Không chạy bằng root** | Tạo người dùng không đặc quyền (UID cố định, ví dụ 10001) |
| Jar phân lớp | Dùng layered jar để tận dụng cache và giảm kích thước |
| Không bí mật trong image | Không `ARG`/`ENV` chứa bí mật; `.dockerignore` loại `.env`, `.git`, tệp kiểm thử |
| Healthcheck | Gọi `liveness`/`readiness` |
| Tối thiểu | Không công cụ gỡ lỗi, shell nếu không cần |

### 7.2. Docker Compose (local)

| Quy tắc | Chi tiết |
|---|---|
| **Gắn cổng vào `127.0.0.1`** | Ví dụ `127.0.0.1:5432:5432`; nếu không, PostgreSQL, MinIO, Mailpit sẽ lộ ra toàn bộ mạng LAN (Mailpit không có xác thực) |
| Mạng nội bộ | Mạng riêng cho các dịch vụ; chỉ công bố cổng cần thiết cho máy chủ |
| Quyền hạn container | `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`, hệ thống tệp gốc chỉ đọc (`read_only: true`) kèm `tmpfs` cho `/tmp` khi có thể |
| Giới hạn tài nguyên | Giới hạn bộ nhớ và CPU để một dịch vụ không làm treo máy |
| Bí mật | Lấy từ `.env`/file; không viết cứng trong Compose |
| Phụ thuộc khởi động | `depends_on` kèm điều kiện `healthy` |
| Không mount | Không gắn `docker.sock`; không gắn thư mục nhạy cảm của máy chủ |
| Dữ liệu | Volume có tên; script sao lưu (mục 10) |

### 7.3. Phần cứng hoá bổ sung (môi trường thật)

Quét image định kỳ, ghim digest, chữ ký image, tài khoản chạy dịch vụ tách biệt, giới hạn mạng đi ra (egress) cho container (đặc biệt worker gọi URL người dùng — kết hợp bộ bảo vệ SSRF).

---

## 8. HTTPS và reverse proxy

| Chủ đề | Local | Môi trường thật |
|---|---|---|
| Giao thức | HTTP trên `*.localhost` (trình duyệt coi là ngữ cảnh an toàn); cookie `Secure` tắt | Chỉ HTTPS (TLS 1.2 trở lên, ưu tiên 1.3), chuyển hướng HTTP sang HTTPS, HSTS |
| Điểm vào | **Next.js (rewrite `/api`) đóng vai reverse proxy**; backend không công bố ra ngoài máy | Reverse proxy thật (Caddy, Nginx hoặc Traefik) kết thúc TLS, đặt trước cả frontend và API; backend chỉ nhận từ proxy |
| Header chuyển tiếp | Cấu hình `server.forward-headers-strategy` và **chỉ tin `X-Forwarded-*` từ proxy đã biết** (danh sách proxy nội bộ) | Như vậy; nếu không, IP trong giới hạn tốc độ và log sai hoặc bị giả mạo |
| Tại proxy | | Giới hạn kích thước yêu cầu, thời gian chờ, giới hạn tốc độ thô, ẩn phiên bản máy chủ, nén |
| Chứng chỉ | Tuỳ chọn thử một lần bằng chứng chỉ cục bộ (ví dụ mkcert) để kiểm tra cookie `Secure`/`SameSite` và HSTS | Chứng chỉ do CA phát hành, tự động gia hạn |
| Cổng quản trị | Chỉ nội bộ | Chỉ nội bộ, không qua proxy công khai |

Mọi khác biệt Local và Môi trường thật do **cấu hình theo profile**, không do sửa mã.

---

## 9. CI/CD

### 9.1. Pipeline CI (GitHub Actions hoặc tương đương)

| Bước | Việc | Chặn merge khi |
|---|---|---|
| 1. Chuẩn bị | Cài JDK 21, cache Maven | |
| 2. Xây dựng | Biên dịch, Spotless, Enforcer | Sai định dạng, phụ thuộc xung đột |
| 3. Kiểm thử | Test đơn vị + tích hợp (Testcontainers) + kiểm tra ranh giới Modulith + ArchUnit | Test đỏ |
| 4. Phân tích tĩnh | SpotBugs + FindSecBugs (SAST); CodeQL hoặc Semgrep nếu khả dụng | Phát hiện mức cao |
| 5. Hợp đồng API | Xuất `openapi.json`, so sánh thay đổi phá vỡ với bản chính | Phá vỡ `v1` |
| 6. Phụ thuộc | Quét lỗ hổng, quét giấy phép (tuỳ chọn) | Lỗ hổng mức cao |
| 7. Bí mật | gitleaks | Lộ bí mật |
| 8. Đóng gói | Build image, quét image, sinh SBOM | Lỗ hổng mức cao trong image |
| 9. Lưu artifact | `openapi.json`, báo cáo kiểm thử và độ phủ, SBOM | |
| 10. (Hằng đêm/trước mốc demo) | Kiểm thử đồng thời lặp nhiều lần, quét DAST bằng OWASP ZAP baseline trên Compose, E2E với frontend | Phát hiện mức cao |

Mục tiêu: các bước 1 đến 9 dưới 10 phút.

### 9.2. Quy trình

- Nhánh chính được bảo vệ: chỉ merge qua PR đạt toàn bộ bước bắt buộc và có review (tự review bằng checklist nếu làm một mình).
- Commit theo Conventional Commits; PR có mẫu và checklist bảo mật (file 04, mục 13, và file 05, mục 14).
- **CD** ở giai đoạn này chỉ là: dựng image và chạy bằng `docker compose up`. Môi trường thật cần bổ sung triển khai có kiểm soát, quay lui, di chuyển DB tương thích ngược.

---

## 10. Sao lưu và phục hồi

| Hạng mục | Local | Môi trường thật |
|---|---|---|
| PostgreSQL | Script `pg_dump` (định dạng custom), lưu vào thư mục sao lưu không đưa vào git; có thể chạy theo lịch | Sao lưu liên tục (lưu trữ WAL) và phục hồi về thời điểm (PITR); mục tiêu RPO ≤ 5 phút, RTO ≤ 1 giờ như đã nêu ở kiến trúc |
| MinIO | Đồng bộ bucket ra thư mục sao lưu (công cụ `mc mirror`) | Phiên bản hoá đối tượng, sao chép sang vùng khác |
| Bảo vệ bản sao lưu | Không lưu cùng nơi với dữ liệu gốc nếu có thể | Mã hoá, kiểm soát truy cập, khoá mã hoá trường lưu **tách riêng** |
| **Diễn tập phục hồi** | **Bắt buộc ít nhất mỗi mốc demo:** phục hồi vào môi trường trống, ứng dụng khởi động, migration khớp, **tổng sổ cái khớp**, ảnh còn truy cập được | Định kỳ, ghi lại thời gian thực tế so với RTO |
| Dữ liệu cá nhân | Bản sao lưu cũng là dữ liệu nhạy cảm: cùng quy tắc truy cập và thời hạn lưu | Thêm quy trình xoá khỏi bản sao lưu theo yêu cầu khi pháp luật đòi hỏi |
| Tài liệu | Runbook ngắn: sao lưu ở đâu, phục hồi thế nào, kiểm tra gì sau phục hồi | Runbook đầy đủ và người chịu trách nhiệm |

---

## 11. Production readiness: danh sách «nếu đưa vào thực tế»

Dự án hiện **không** nhắm tới vận hành thật, nên đây là danh sách đối chiếu để biết còn thiếu gì, không phải mục tiêu hiện tại.

| Lĩnh vực | Đã có ở bản local | Cần bổ sung khi đưa lên thật |
|---|---|---|
| Xác thực, phân quyền | Phiên JDBC, Argon2id, RBAC + ABAC nhẹ, test ma trận | **MFA bắt buộc cho nhân sự**, chính sách phiên theo rủi ro, rà soát phân quyền định kỳ |
| Dữ liệu | Ràng buộc DB, sổ cái chỉ thêm, idempotency | Mã hoá ổ đĩa, PITR, kế hoạch lưu trữ và xoá dữ liệu cá nhân theo pháp luật |
| Mạng | Cổng gắn `127.0.0.1` | TLS, WAF, reverse proxy, tách mạng, giới hạn egress |
| Bí mật | `.env`, quét bí mật | Kho bí mật, quay vòng định kỳ, tách quyền |
| Quan sát | Log JSON, Actuator, chỉ số nghiệp vụ | Dashboard, cảnh báo, trực sự cố, runbook, SLO |
| Hiệu năng | Dữ liệu seed, `EXPLAIN` | Kiểm thử tải, kích thước tài nguyên, bản sao đọc, kế hoạch mở rộng |
| Độ sẵn sàng | Tắt máy êm, health | Nhiều instance, Multi-AZ, kiểm tra phục hồi thảm hoạ |
| Chuỗi cung ứng | Quét phụ thuộc và image | Ghim digest, chữ ký image, chính sách vá nghiêm ngặt |
| Bảo mật | Kiểm thử bảo mật tự động, ZAP baseline | Đánh giá bảo mật độc lập (kiểm thử xâm nhập), chương trình báo lỗ hổng |
| Pháp lý, vận hành | Số liệu cấu hình mẫu | Tư vấn pháp lý (lưu trú dữ liệu, thanh toán trung gian, VAT, bảo vệ dữ liệu cá nhân), điều khoản, quy trình hỗ trợ |
| Thay đổi | Migration tương thích ngược | Quy trình triển khai, quay lui, cửa sổ bảo trì, thông báo |

---

## 12. Danh sách kiểm tra vận hành cho PR

- [ ] Log mới không chứa dữ liệu cá nhân hay bí mật; có `event` ổn định; mức log đúng?
- [ ] Thao tác nhạy cảm mới có audit log cùng transaction, có lý do khi cần?
- [ ] Có chỉ số nghiệp vụ hoặc cảnh báo cho luồng mới (đặc biệt luồng tiền)?
- [ ] Cấu hình mới có kiểm tra, mặc định an toàn, không bí mật trong repo?
- [ ] Thay đổi Docker/Compose giữ các cổng ở `127.0.0.1`, người dùng không đặc quyền, không bí mật trong image?
- [ ] Thư viện mới qua cổng thêm thư viện; quét phụ thuộc xanh?
- [ ] Hợp đồng `openapi.json` không bị phá vỡ?
