# Bảo mật (1): OWASP, xác thực, mật khẩu, mã hoá

Phần 1 của bảo mật backend: khung đe doạ, ánh xạ OWASP, xác thực, phiên, mật khẩu, mã hoá và dữ liệu nhạy cảm. Phần 2 (phân quyền, kiểm tra đầu vào, upload, CORS, CSRF, header, giới hạn tốc độ) nằm ở file 05. Cách frontend phối hợp nằm ở `frontend/06-bao-mat-frontend.md`.

Dự án chạy local với dữ liệu giả, nhưng các biện pháp được thiết kế như hệ thống thật; phần chỉ bật ở môi trường thật được ghi rõ.

---

## 1. Nguyên tắc

1. **Bảo mật là yêu cầu thiết kế, không phải bước cuối.** Mỗi slice qua danh sách kiểm tra bảo mật trước khi đóng.
2. **Mặc định từ chối, cho phép tường minh.**
3. **Không tin bất cứ thứ gì từ client:** giá, trạng thái, vai trò, chủ sở hữu, số tiền do server quyết định.
4. **Phòng thủ nhiều lớp:** kiểm tra quyền ở đường dẫn, hành động và đối tượng; ràng buộc DB là lớp cuối.
5. **Giảm bề mặt tấn công và giảm dữ liệu:** chỉ thu thập và lưu thứ cần; ít thư viện; ít endpoint công khai.
6. **Thất bại an toàn:** khi không chắc thì từ chối, không lộ chi tiết.
7. **Truy vết được:** mọi thao tác nhạy cảm có audit log; mọi sự kiện bảo mật có log riêng.
8. **Đặc quyền tối thiểu:** tài khoản DB, khoá lưu trữ, container, quyền nhân sự.

---

## 2. Mô hình đe doạ rút gọn

**Tài sản cần bảo vệ:** tiền và sổ cái; tồn kho (lịch); giấy tờ danh tính và dữ liệu cá nhân; thông tin đăng nhập và phiên; cấu hình phí và thuế; nhật ký kiểm toán.

**Biên tin cậy:** trình duyệt ⇄ API; API ⇄ DB/MinIO; API ⇄ cổng thanh toán (webhook vào, gọi ra); API ⇄ nguồn iCal và Frankfurter (gọi ra); nhân sự ⇄ back-office.

**Mối đe doạ đặc thù của hệ thống đặt phòng:**

| Mối đe doạ | Ví dụ | Biện pháp chính |
|---|---|---|
| Truy cập đối tượng trái phép (BOLA) | Guest đổi mã booking trong URL để xem booking người khác | Kiểm tra sở hữu ở mọi truy vấn (file 05) |
| Giả mạo giá, trạng thái | Gửi `price` hoặc `status` trong yêu cầu | Server tính giá, DTO không có các trường này (file 02) |
| Giả mạo callback thanh toán | Gửi callback «thành công» giả | Chữ ký HMAC, thời gian, chống phát lại, đối chiếu với cổng (file 05, 06) |
| Chiếm tài khoản | Dò mật khẩu, nhồi thông tin đăng nhập, đặt lại mật khẩu | Argon2id, giới hạn tốc độ, khoá tạm, token đặt lại an toàn |
| Lạm dụng giữ chỗ | Giữ chỗ hàng loạt để khoá tồn kho đối thủ | Giới hạn số giữ chỗ và tốc độ theo người dùng, theo listing |
| Gian lận Host | Listing giả, ảnh đánh cắp, giấy tờ giả | Duyệt thủ công, cảnh báo địa chỉ trùng, ghi nhật ký |
| Lộ giấy tờ danh tính | Nhân sự hoặc kẻ tấn công tải hàng loạt | Bucket riêng, URL ký ngắn hạn theo lần xem, audit mọi lượt xem, quyền riêng |
| SSRF qua iCal | URL iCal trỏ tới dịch vụ nội bộ | Bộ bảo vệ SSRF (file 05) |
| Lạm dụng coupon | Dò mã, dùng quá giới hạn | Giới hạn tốc độ, cập nhật nguyên tử, thông báo lỗi chung |
| Cào dữ liệu | Quét toàn bộ listing, danh sách Host | Giới hạn tốc độ công khai, giới hạn trang, không trả dữ liệu thừa |
| Thao túng đánh giá | Tạo đánh giá giả | Chỉ booking Hoàn tất, một đánh giá mỗi bên, kiểm duyệt |
| Nhân sự lạm quyền | CSKH hoàn tiền sai, Admin đổi cấu hình trái phép | RBAC chi tiết, hạn mức, lý do bắt buộc, audit không sửa được |

Lưu mô hình này ở `docs/threat-model.md` (STRIDE theo từng biên tin cậy); xem lại khi thêm tích hợp hoặc luồng nhạy cảm mới.

---

## 3. OWASP Top 10:2025 ánh xạ vào dự án

Tên hạng mục dưới đây viết gọn; đối chiếu bản chính thức tại owasp.org khi cần trích dẫn.

| Hạng mục | Biện pháp trong dự án | File |
|---|---|---|
| A01 Kiểm soát truy cập bị hỏng (gồm SSRF) | Mặc định từ chối; RBAC + kiểm tra đối tượng; 404 cho tài nguyên không thuộc quyền; bộ bảo vệ SSRF; test ma trận phân quyền | 05 |
| A02 Cấu hình bảo mật sai | Cấu hình có kiểm tra, profile tách biệt, tắt chi tiết lỗi, Actuator cổng riêng, Swagger chỉ local, header bảo mật, Docker không đặc quyền | 05, 07 |
| A03 Lỗi chuỗi cung ứng phần mềm | Khoá phiên bản, quét phụ thuộc và image, cổng thêm thư viện, SBOM, ghim action CI | 07 |
| A04 Lỗi mật mã | Argon2id, TLS ở môi trường thật, token ngẫu nhiên an toàn và băm khi lưu, mã hoá trường nhạy cảm, không tự viết mật mã | mục 8 dưới đây |
| A05 Injection (gồm XSS) | Truy vấn tham số hoá, danh sách cho phép cho sắp xếp, kiểm tra đầu vào, không ghép SQL | 05 |
| A06 Thiết kế không an toàn | Mô hình đe doạ, bất biến do DB bảo vệ, idempotency, giới hạn luồng nhạy cảm, xem xét thiết kế mỗi slice | mục 2, 06 |
| A07 Lỗi xác thực | Phiên an toàn, Argon2id, giới hạn thử, token xác minh/đặt lại an toàn, không lộ tài khoản tồn tại | mục 4 đến 7 |
| A08 Lỗi toàn vẹn phần mềm và dữ liệu | Chữ ký webhook, không tin dữ liệu client, không deserialize đa hình, kiểm tra CI, sổ cái chỉ thêm | 05, 06 |
| A09 Lỗi ghi log và cảnh báo bảo mật | Log có cấu trúc, audit log, sự kiện bảo mật có danh mục và chỉ số, cảnh báo (môi trường thật) | 07 |
| A10 Xử lý sai điều kiện ngoại lệ | Xử lý ngoại lệ tập trung, thất bại an toàn, không nuốt lỗi, rollback đúng, dọn tài nguyên | 03 |

---

## 4. OWASP API Security Top 10 (bản 2023) ánh xạ vào dự án

Bản 2023 là bản mới nhất mình xác nhận được; kiểm tra owasp.org xem đã có bản mới chưa.

| Hạng mục | Biện pháp | File |
|---|---|---|
| API1 Phân quyền cấp đối tượng bị hỏng (BOLA) | Truy vấn luôn kèm chủ sở hữu (`findByIdAndHostId`); trả 404 khi không thuộc quyền; test BOLA cho mọi tài nguyên | 05 |
| API2 Xác thực bị hỏng | Mục 4 đến 7 của file này | 04 |
| API3 Phân quyền cấp thuộc tính bị hỏng | DTO riêng theo vai trò (không lộ thừa trường), cấm gán hàng loạt, trường lạ bị từ chối | 02, 05 |
| API4 Tiêu thụ tài nguyên không giới hạn | Giới hạn kích thước, `limit` tối đa, giới hạn tốc độ, timeout, giới hạn xuất báo cáo, `statement_timeout` | 05, 06 |
| API5 Phân quyền cấp chức năng bị hỏng | `@PreAuthorize` theo quyền chi tiết cho nhân sự; chuỗi lọc `/staff/**` riêng | 05 |
| API6 Truy cập không giới hạn vào luồng nghiệp vụ nhạy cảm | Giới hạn giữ chỗ, yêu cầu đặt chờ (3), thử coupon, tạo tài khoản, liên hệ, tin nhắn | mục 11, 05 |
| API7 SSRF | Bộ bảo vệ SSRF cho iCal và mọi URL do người dùng cung cấp | 05 |
| API8 Cấu hình bảo mật sai | Như A02 | 05, 07 |
| API9 Quản lý kho API không đúng | Kho endpoint do OpenAPI quản lý, test ma trận phân quyền duyệt mọi endpoint, tắt phiên bản cũ có kế hoạch, không có endpoint «ẩn» | 03, 08 |
| API10 Sử dụng API bên ngoài không an toàn | Coi dữ liệu từ cổng thanh toán, Frankfurter, iCal là **không tin cậy**: kiểm tra chữ ký, giới hạn kích thước, kiểm tra kiểu và khoảng, timeout | 05 |

---

## 5. Xác thực: lựa chọn và lý do

**Phiên cookie lưu trong PostgreSQL (Spring Session JDBC), không dùng JWT.**

| Lý do | Chi tiết |
|---|---|
| Phù hợp kiến trúc | Ứng dụng web cùng origin (qua rewrite), không có client di động hay bên thứ ba |
| Thu hồi tức thì | Khoá tài khoản, đổi mật khẩu, đổi vai trò là vô hiệu hoá phiên ngay; JWT khó thu hồi |
| Bí mật không ở trình duyệt | Cookie HttpOnly, JavaScript không đọc được |
| Đơn giản hơn | Không có làm mới token, không lưu token trong `localStorage` |

Hai loại tài khoản (`account.type`): **USER** (Guest/Host) và **STAFF** (Admin, CSKH, Kế toán). Đăng nhập người dùng từ chối tài khoản STAFF và ngược lại; nhân sự **không tự đăng ký**, do Admin tạo.

Cấu hình Spring Security theo nhiều `SecurityFilterChain` có thứ tự, mỗi chuỗi khớp một nhóm đường dẫn:

| Chuỗi | Khớp | Đặc điểm |
|---|---|---|
| Webhook | `/api/v1/webhooks/**` | Không phiên, không CSRF, xác thực bằng chữ ký |
| Nhân sự | `/api/v1/staff/**` | Phiên nhân sự, thời hạn ngắn hơn, giới hạn tốc độ chặt hơn |
| Người dùng và công khai | `/api/v1/**` | Phiên người dùng; chỉ danh sách đường dẫn công khai tường minh được `permitAll` |
| Còn lại | mọi thứ khác | **`denyAll`** |

Mỗi chuỗi kết thúc bằng `anyRequest().denyAll()` hoặc `authenticated()` và mọi endpoint còn phải có quy tắc ở mức phương thức (file 05).

---

## 6. Mật khẩu

| Hạng mục | Quy định |
|---|---|
| Băm | **Argon2id** (`Argon2PasswordEncoder` của Spring Security, cần Bouncy Castle) |
| Tham số | Không thấp hơn mức tối thiểu khuyến nghị của OWASP (khoảng 19 MiB bộ nhớ, 2 vòng lặp, song song hoá 1); đo trên máy mục tiêu để một lần băm mất vài trăm mili giây; tham số nằm trong cấu hình |
| Định dạng lưu | `DelegatingPasswordEncoder` (có tiền tố thuật toán) để **nâng cấp tham số khi người dùng đăng nhập** (`upgradeEncoding`) |
| So sánh | Do bộ mã hoá làm (thời gian không phụ thuộc nội dung) |
| Độ dài & Quy tắc [A4] | **Tối thiểu 8 ký tự** (`auth.passwordMinLength=8`), tối đa 128 ký tự; bắt buộc chứa cả chữ cái và chữ số; cho phép mọi ký tự hợp lệ và cho phép dán mật khẩu |
| Danh sách chặn | Từ chối mật khẩu nằm trong danh sách mật khẩu phổ biến (tệp cục bộ), chứa email hoặc tên người dùng |
| Lưu | Chỉ lưu giá trị băm; không bao giờ ghi mật khẩu vào log, audit, sự kiện, phản hồi |
| Đổi mật khẩu | Yêu cầu mật khẩu cũ; sau khi đổi **huỷ mọi phiên khác** và gửi email thông báo |
| Câu hỏi bảo mật, gợi ý mật khẩu | Không dùng |

Nhân sự (STAFF): tài khoản do Admin tạo, **mật khẩu tạm bắt buộc đổi ở lần đăng nhập đầu** (qua link mời [A12b]), thông báo qua email. Thiết kế sẵn điểm cắm cho **MFA (TOTP)** bằng một `AuthenticationProvider` bổ sung; ở bản local chưa bật, ở môi trường thật nên bật bắt buộc cho nhân sự.

---

## 7. Đăng ký, xác minh email, đặt lại mật khẩu

### 7.1. Token xác minh và đặt lại

| Hạng mục | Quy định |
|---|---|
| Sinh | `SecureRandom`, 256 bit, mã hoá URL-safe |
| Lưu | **Chỉ lưu giá trị băm** (SHA-256) cùng thời điểm hết hạn, loại, tài khoản; token gốc chỉ có trong email |
| Hạn dùng | Xác minh email 24 giờ (`auth.verifyTokenTtlHours=24`); đặt lại mật khẩu 1 giờ (`auth.resetTokenTtlMinutes=60`) |
| Cooldown gửi lại | Gửi lại email xác minh có cooldown 60 giây (`auth.resendCooldownSec=60`), tối đa 3 lần/giờ (`auth.resendMaxPerHour=3`) [A2] |
| Dùng một lần | Dùng xong bị vô hiệu; yêu cầu mới vô hiệu token cũ cùng loại |
| So sánh | Thời gian không đổi; tra bằng giá trị băm |
| Sau khi đặt lại | Huỷ mọi phiên của tài khoản, gửi email thông báo, **không tự đăng nhập** |
| Liên kết | Chứa token trong query param (`/verify-email?token=...`, `/reset-password?token=...`); không ghi token vào log |

### 7.2. Chống liệt kê tài khoản

- Đăng ký: phản hồi **giống nhau** dù email đã tồn tại hay chưa («chúng tôi đã gửi email»); nếu đã tồn tại, gửi email báo cho chủ tài khoản thay vì tạo mới [O1].
- Quên mật khẩu: luôn trả phản hồi trung tính (202 Accepted), gửi email chỉ khi tài khoản tồn tại.
- Đăng nhập: thông báo chung «email hoặc mật khẩu không đúng». **Thời gian phản hồi như nhau** dù email có tồn tại hay không (luôn thực hiện một lần băm với giá trị giả khi không tìm thấy tài khoản).
- Trạng thái khoá tài khoản (BR-ACC-06): sau 5 lần nhập sai liên tiếp, khoá tạm 15 phút, trả mã HTTP 423 và timestamp `lockedUntil` (`auth.maxFailedAttempts=5`, `auth.lockMinutes=15`).
- Email được chuẩn hoá (chữ thường, cắt khoảng trắng, chuẩn hoá Unicode) và lưu cột chuẩn hoá có ràng buộc unique.

---

## 8. Phiên

| Hạng mục | Người dùng (`USER`) | Nhân sự (`STAFF`) [A12] |
|---|---|---|
| Cookie | `SESSION`, HttpOnly, `SameSite=Lax`, `Secure` ở môi trường thật, phạm vi đường dẫn gốc | Như bên trái |
| Hết hạn do không hoạt động | 30 phút (cấu hình `server.servlet.session.timeout=30m`) | 15 phút (hoặc 30 phút theo chính sách back-office) |
| Hết hạn tuyệt đối | 24 giờ | 8 giờ |
| Khi đăng nhập | **Đổi mã phiên** (chống cố định phiên, `changeSessionId`) | Như bên trái |
| Khi đổi mật khẩu, đổi vai trò/quyền, khoá tài khoản | Huỷ mọi phiên của tài khoản đó | Như bên trái |
| Khi đăng xuất | Huỷ phiên phía server và xoá cookie | Như bên trái |
| Nhiều phiên đồng thời | Cho phép; người dùng thấy và đăng xuất các phiên khác | Giới hạn 1 phiên hoạt động |
| Nội dung phiên | Chỉ định danh tài khoản và loại; **không** lưu dữ liệu cá nhân hay bí mật | Như bên trái |
| «Ghi nhớ đăng nhập» | Không | Không |

- Quyền (authority) được nạp khi đăng nhập; thay đổi quyền kéo theo huỷ phiên nên có hiệu lực ngay.
- Phiên nhân sự gắn tới một tên miền và một chuỗi lọc riêng, phiên Guest không dùng được ở `/staff/**`.
- Bảng phiên có chỉ mục theo `principal_name` để huỷ theo tài khoản, và có job dọn phiên hết hạn.

---

## 9. Bảo vệ chống dò mật khẩu (brute force)

Kết hợp ba lớp, vì mỗi lớp riêng lẻ có điểm yếu:

| Lớp | Cách làm |
|---|---|
| Giới hạn tốc độ theo **IP** và theo **tài khoản** | Bucket4j (file 05): ví dụ 5 lần/phút/IP và 10 lần/giờ/tài khoản cho đăng nhập; vượt thì 429 |
| Làm chậm và khoá tạm theo tài khoản | Sau 5 lần sai liên tiếp: khoá tạm tăng dần (1, 5, 15 phút); gửi email báo chủ tài khoản; Admin mở khoá được |
| Phát hiện nhồi thông tin đăng nhập | Cảnh báo (log bảo mật, chỉ số) khi một IP thử nhiều tài khoản khác nhau trong thời gian ngắn |

Lưu ý thiết kế:
- Khoá tài khoản vĩnh viễn làm kẻ tấn công khoá được người khác (tấn công từ chối dịch vụ); vì vậy dùng khoá **tạm**, kết hợp theo IP.
- Bộ đếm lưu ở bảng DB (hoặc bộ nhớ, chấp nhận mất khi khởi động lại ở bản local); thiết kế qua interface để chuyển sang kho dùng chung khi chạy nhiều instance.
- Khi chạy sau proxy (Next.js rewrite, reverse proxy thật) phải cấu hình **tin cậy header `X-Forwarded-For` chỉ từ proxy đã biết**, nếu không IP trong giới hạn tốc độ là IP của proxy hoặc bị giả mạo (file 07).
- Mọi sự kiện đăng nhập thất bại, khoá, mở khoá ghi vào log bảo mật (không ghi mật khẩu).

---

## 10. Mật mã và bảo vệ dữ liệu lưu trữ

| Chủ đề | Quy định |
|---|---|
| Không tự viết mật mã | Dùng JDK, Spring Security Crypto, thư viện đã được kiểm chứng |
| Số ngẫu nhiên | `SecureRandom` cho token, mã, khoá; không dùng `Random`, `Math.random` |
| Băm | SHA-256 trở lên cho token lưu trữ; **không** dùng MD5, SHA-1 cho mục đích bảo mật |
| Chữ ký webhook | HMAC-SHA256 trên nội dung thô + dấu thời gian, so sánh thời gian không đổi |
| Truyền tải | HTTP trên `*.localhost` ở local; ở môi trường thật chỉ TLS 1.2 trở lên, HSTS (file 07) |
| Mã hoá trường nhạy cảm | Dữ liệu **hạn chế** (số tài khoản ngân hàng của Host, số giấy tờ) mã hoá cấp ứng dụng bằng AES-GCM, khoá lấy từ biến môi trường, có `keyId` để quay vòng khoá; nằm sau một converter/dịch vụ duy nhất |
| Mã hoá ổ đĩa | Môi trường thật bật mã hoá ổ đĩa DB và bucket; local không bắt buộc |
| Khoá và bí mật | Không trong mã nguồn, không trong image; quản lý ở file 07 |
| Lưu giữ khoá | Khoá mã hoá tách khỏi dữ liệu và khỏi bản sao lưu |

---

## 11. Phân loại dữ liệu và cách xử lý

| Loại | Ví dụ | Lưu | API trả về | Log | Truy cập |
|---|---|---|---|---|---|
| Công khai | Nội dung listing đã duyệt, danh mục | Thường | Có | Có | Mọi người |
| Nội bộ | Cấu hình, số liệu tổng hợp | Thường | Theo quyền | Có | Nhân sự theo quyền |
| Bí mật | Email, điện thoại, tên đầy đủ, địa chỉ chính xác, nội dung tin nhắn, khai báo lưu trú | Thường, có chỉ mục hạn chế | Chỉ khi có quyền và đúng thời điểm (ví dụ địa chỉ sau xác nhận) | **Không** (dùng định danh) | Theo quyền, audit khi nhân sự xem |
| Hạn chế | Giấy tờ danh tính, số tài khoản ngân hàng, mã giao dịch, token, băm mật khẩu | Mã hoá cấp ứng dụng hoặc bucket riêng | Gần như không (che, hoặc URL ký ngắn hạn theo từng lần xem) | **Không bao giờ** | Quyền riêng, **luôn audit** |

Quy tắc chung:
- **Tối thiểu hoá dữ liệu:** không thu và không lưu thứ không có mục đích nghiệp vụ.
- **Che khi trả ra:** số tài khoản chỉ trả vài chữ số cuối; điện thoại/email của đối phương che theo luật nghiệp vụ trước khi booking xác nhận (việc che do **backend** làm).
- **Thời hạn lưu trữ** theo cấu hình; **xoá hoặc ẩn danh hoá** khi hết hạn hoặc theo yêu cầu (FR-CMP-05, 07); dữ liệu bắt buộc giữ lại cho sổ cái và pháp lý được ẩn danh hoá các trường định danh thay vì xoá bản ghi.
- **Sự kiện giữa module** không mang dữ liệu bí mật thừa; chỉ định danh.
- **Dữ liệu seed và test** là dữ liệu giả; tuyệt đối không dùng dữ liệu thật.

---

## 12. Chống lạm dụng luồng nghiệp vụ (API6)

| Luồng | Giới hạn mẫu (cấu hình được) |
|---|---|
| Giữ chỗ | Tối đa 3 giữ chỗ đang hiệu lực mỗi Guest; 10 lần tạo/phút/người dùng |
| Request to Book chờ | Tối đa 3 yêu cầu chờ mỗi Guest (OQ-06), kiểm tra trong transaction có khoá |
| Thanh toán | 10 lần khởi tạo/phút/người dùng |
| Coupon | 10 lần thử/giờ/người dùng; lỗi chung không phân biệt «mã không tồn tại» và «mã hết hạn» với người chưa đủ điều kiện |
| Đăng ký, gửi lại xác minh, quên mật khẩu | 5 đến 3 lần/giờ theo IP và theo email |
| Liên hệ hỗ trợ, tin nhắn | 5/giờ/IP (liên hệ), 30/phút/người dùng (tin nhắn) |
| Tìm kiếm và đọc công khai | 120/phút/IP; `limit` tối đa; không cho quét sâu hơn số trang giới hạn |
| Xin URL upload | 30/phút/người dùng; giới hạn số ảnh mỗi listing |
| Tạo khiếu nại, đánh giá | Một khiếu nại/đánh giá mỗi booking mỗi bên (ràng buộc unique) |

---

## 13. Danh sách kiểm tra bảo mật cho mỗi slice

- [ ] Có dữ liệu mới thuộc loại **bí mật** hoặc **hạn chế**? Đã phân loại, che, mã hoá, loại khỏi log và sự kiện?
- [ ] Mọi endpoint mới có quy tắc truy cập và kiểm tra đối tượng; test BOLA đã thêm?
- [ ] Request DTO không có trường server quyết định; Response DTO không lộ thừa?
- [ ] Luồng này có thể bị lạm dụng hàng loạt? Đã có giới hạn?
- [ ] Có đầu vào làm thay đổi truy vấn, đường dẫn, URL gọi ra? Đã kiểm tra bằng danh sách cho phép?
- [ ] Có luồng xác thực/đặt lại/xác minh mới? Đã chống liệt kê tài khoản và dùng token băm?
- [ ] Lỗi trả ra không lộ chi tiết nội bộ; thất bại theo hướng an toàn?
- [ ] Thao tác nhạy cảm có audit log cùng transaction?
- [ ] Có tích hợp bên ngoài mới? Đã coi dữ liệu là không tin cậy, có timeout, kiểm tra chữ ký?
- [ ] Cập nhật `docs/threat-model.md` nếu có biên tin cậy hoặc tài sản mới.
