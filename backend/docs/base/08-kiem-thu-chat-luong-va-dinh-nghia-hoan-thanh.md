# Kiểm thử, chất lượng và định nghĩa hoàn thành

Với hệ thống tiền và đặt phòng, kiểm thử không chỉ chứng minh «chạy được» mà còn chứng minh **các bất biến giữ vững dưới tải song song, lỗi và tấn công**. Nguyên tắc: kiểm thử ở tầng thấp nhất có thể bắt được lỗi, nhưng các bất biến sống còn **bắt buộc** được kiểm thử trên PostgreSQL thật.

---

## 1. Chiến lược

| Tầng | Công cụ | Kiểm tra gì | Chạy khi |
|---|---|---|---|
| Đơn vị (không Spring) | JUnit 5, AssertJ | Logic `domain`: bộ máy giá, tính hoàn tiền, máy trạng thái, `Money`, policy phân quyền, che thông tin liên hệ, bộ bảo vệ SSRF, chuẩn hoá đầu vào | Mọi commit |
| Lát cắt web | `@WebMvcTest` | Controller: kiểm tra DTO, ánh xạ lỗi, quy tắc truy cập, mã trạng thái, dạng Problem Details | Mọi PR |
| Module | `@ApplicationModuleTest` (Spring Modulith) | Một module cùng hạ tầng thật của nó, các module khác được giả lập | Mọi PR |
| Tích hợp | Testcontainers (PostgreSQL + PostGIS, MinIO), Flyway, `MutableClock` | Luồng use case trên **DB thật**: migration, ràng buộc, truy vấn jOOQ, khoá, transaction, sự kiện | Mọi PR |
| Đồng thời | Khung kiểm thử đồng thời (mục 4) | Bất biến dưới tranh chấp | Mọi PR (bản nhanh), hằng đêm (lặp nhiều) |
| Hợp đồng | Snapshot OpenAPI, oasdiff, test DTO không lộ trường | Không phá vỡ `v1`; không lộ dữ liệu | Mọi PR |
| Bảo mật | Bộ test mục 5, SpotBugs/FindSecBugs, ZAP baseline | Phân quyền, đầu vào, upload, SSRF, CSRF, header, log | Mọi PR; ZAP hằng đêm |
| E2E | Playwright (phía frontend) với backend Compose | Luồng người dùng xuyên suốt | PR gắn nhãn, nightly, trước mốc demo |

Nguyên tắc:
- **Không dùng H2 hay DB giả** cho kiểm thử liên quan ràng buộc, khoá, `FOR UPDATE`, exclusion, PostGIS: kết quả sẽ sai khác PostgreSQL thật.
- **Mỗi tiêu chí chấp nhận của slice có ít nhất một test** ở tầng thấp nhất kiểm tra được.
- Test mô tả **hành vi và bất biến**, không mô tả chi tiết cài đặt; ít mock (ưu tiên cài đặt giả đơn giản như `FakePaymentGateway`, `MutableClock`).
- Không `Thread.sleep`; chờ theo điều kiện bằng Awaitility.
- Test độc lập, không phụ thuộc thứ tự; dữ liệu mỗi test dùng định danh ngẫu nhiên riêng để chạy song song được.
- Độ phủ (JaCoCo) là **chỉ báo**, không phải mục tiêu: nhưng các gói lõi (`pricing`, `bookings`, `calendar`, `payments`, `ledger`, `payouts`) đặt ngưỡng tối thiểu (khoảng 80% dòng) cho `domain`.
- Tuỳ chọn: kiểm thử dựa trên thuộc tính (jqwik) cho bộ máy giá, tính hoàn tiền và phân bổ sổ cái (tổng luôn khớp); kiểm thử đột biến (PIT) cho các gói lõi.

---

## 2. Kiểm thử đơn vị và miền

Bộ test bắt buộc ở nền và trong từng slice nghiệp vụ:

| Chủ đề | Nội dung |
|---|---|
| `Money` | Làm tròn theo loại tiền (VND, USD), phép chia phần, tổng luôn khớp, từ chối cộng khác tiền tệ |
| Bộ máy giá (bảng test dạng table-driven) | Thứ tự ưu tiên lễ → mùa → cuối tuần → cơ bản, giảm tuần/tháng, phụ thu, phí vệ sinh, phí dịch vụ, thuế; đêm vừa lễ vừa cuối tuần; biên số đêm |
| Tính hoàn tiền | Ba chính sách huỷ ở **từng mốc và sát biên**, theo múi giờ listing, qua đổi giờ; số tiền xem trước bằng số tiền thực hoàn |
| Máy trạng thái booking | Mọi chuyển hợp lệ và **mọi chuyển không hợp lệ bị từ chối** |
| Policy phân quyền | Mỗi nhánh của mỗi policy (mục 3.2 file 05) |
| Che thông tin liên hệ | Số điện thoại, email, liên kết ở nhiều định dạng; không che nhầm văn bản thường |
| Chuẩn hoá đầu vào | Unicode, khoảng trắng, chữ hoa/thường email |
| Bộ bảo vệ SSRF | Danh sách địa chỉ nội bộ và biến thể (file 05, mục 8) |
| Đồng hồ | Hết hạn 15 phút, 24 giờ, 14 ngày bằng `MutableClock` |

---

## 3. Kiểm thử tích hợp

- **Lớp nền** dùng chung: khởi động PostgreSQL + PostGIS và MinIO bằng Testcontainers (container tái sử dụng giữa các test để nhanh), chạy toàn bộ migration, cấp `MutableClock`, API dựng dữ liệu (test data builder).
- Dọn dữ liệu bằng cách dùng định danh riêng cho mỗi test hoặc xoá có kiểm soát; **không** dựa vào rollback giao dịch với test đồng thời (vì chúng cần commit thật).
- Kiểm thử Flyway: chạy migration từ DB trống; kiểm tra Hibernate `validate` khớp; kiểm tra các vai trò DB (`app_rw` không có DDL, không UPDATE/DELETE được `ledger_entry` và `activity_log`).
- Kiểm thử email bằng cổng SMTP giả hoặc Mailpit; kiểm thử cổng thanh toán bằng `mock-gateway` hoặc bản giả trong tiến trình, **cùng bộ test hợp đồng** với adapter thật (nguyên tắc thay thế Liskov, file 02).
- Test sự kiện: listener chịu được giao lại; sự kiện lỗi được gửi lại.

### 3.1. Phát hiện N+1

Mỗi endpoint danh sách có test **khẳng định số câu lệnh SQL không đổi khi tăng số dòng** (bật thống kê Hibernate hoặc bộ đếm truy vấn): ví dụ danh sách 5 và 50 booking cùng số câu lệnh.

---

## 4. Kiểm thử đồng thời

### 4.1. Khung kiểm thử

- Chạy **N luồng** (ví dụ 20) qua `ExecutorService`, dùng `CountDownLatch` làm **rào xuất phát** để cùng bắt đầu một lúc; mỗi luồng gọi use case thật (hoặc endpoint) với giao dịch riêng.
- **Lặp lại** kịch bản nhiều lần (ví dụ 20 lần) vì lỗi đồng thời chỉ lộ ra ngẫu nhiên.
- Khẳng định **bất biến bằng truy vấn DB sau khi chạy**, không chỉ dựa vào kết quả trả về của từng luồng.
- Bản nhanh chạy trong PR; bản nặng (nhiều vòng hơn) chạy hằng đêm và trước mốc demo.

### 4.2. Kịch bản bắt buộc

| Kịch bản | Bất biến cần khẳng định |
|---|---|
| N Guest cùng giữ chỗ một listing-đêm | Đúng một thành công; không có hai khoảng ngày chồng nhau trong DB |
| N yêu cầu giữ chỗ chồng một phần khoảng ngày | Không có chồng nhau; thời gian chuẩn bị được tôn trọng |
| Callback thanh toán gửi N lần song song | Một xác nhận, một bản ghi thanh toán, một bộ bút toán |
| Callback thành công đúng lúc giữ chỗ hết hạn | Hoặc xác nhận (nếu còn trống) hoặc hoàn tiền tự động; không trạng thái lửng |
| N yêu cầu hoàn tiền cho một thanh toán | Một hoàn tiền (bất biến 8) |
| N lượt dùng coupon vượt giới hạn | Số lượt dùng không vượt giới hạn |
| N yêu cầu đặt chờ của một Guest | Không vượt 3 (OQ-06) |
| Hai instance cùng tạo payout | Không khoản nào vào hai payout; mỗi khoản đúng một lần |
| Job chạy hai lần | Kết quả như chạy một lần |
| Phát lại `Idempotency-Key` song song | Một lần thực hiện; các lần còn lại nhận phản hồi đã lưu hoặc `in_progress` |
| Hai chuyển trạng thái xung đột (huỷ và chấp nhận) | Đúng một thành công, trạng thái cuối nhất quán |
| Hai tab sửa cùng listing | Người sau nhận xung đột phiên bản |
| Ghi sổ cái song song cho cùng booking | Tổng các bút toán vẫn khớp quy tắc cân bằng |

---

## 5. Kiểm thử bảo mật

| Nhóm | Kiểm thử bắt buộc |
|---|---|
| **Ma trận phân quyền** | Duyệt mọi endpoint; thiếu quy tắc truy cập thì đỏ; mỗi nhân vật (ẩn danh, Guest, Host, SUPPORT, ACCOUNTANT, ADMIN) nhận đúng 2xx/401/403 và không có tác dụng phụ |
| BOLA/IDOR | Người A không truy cập được tài nguyên của B (listing, booking, thanh toán, tin nhắn, tệp, khiếu nại); kết quả 404 |
| Gán hàng loạt | Gửi `role`, `status`, `price`, `hostId`, `version`, `verified` trong thân; bị từ chối hoặc không có tác dụng |
| Leo thang quyền | Guest không gọi được `/staff/**`; Host chưa duyệt không tạo được listing; sau khi thu hồi quyền, phiên cũ bị chặn |
| Xác thực | Đăng nhập sai không phân biệt email tồn tại (nội dung và thời gian); khoá tạm sau nhiều lần sai; token xác minh/đặt lại dùng một lần, hết hạn, bị vô hiệu khi có yêu cầu mới; đổi mật khẩu huỷ phiên khác; cố định phiên bị chặn (mã phiên đổi khi đăng nhập); hết hạn phiên |
| CSRF và Origin | Thiếu hoặc sai token bị từ chối; `Origin` lạ bị từ chối; webhook không bị ảnh hưởng nhưng yêu cầu chữ ký |
| Injection | Chuỗi `'`, `"`, `;`, `--`, `%`, `\`, `' OR 1=1 --` trong tìm kiếm, lọc, sắp xếp, tên, mô tả; không lỗi 500, không rò dữ liệu; sắp xếp theo giá trị ngoài danh sách cho phép bị từ chối |
| SSRF | Danh sách địa chỉ và biến thể ở file 05, mục 8, kể cả chuyển hướng và DNS rebinding giả lập |
| Webhook | Chữ ký sai/thiếu, dấu thời gian lệch, phát lại, số tiền không khớp bản ghi nội bộ |
| Upload | Sai magic bytes, đổi phần mở rộng, SVG, quá lớn, ảnh bom giải nén, tệp polyglot, tên chứa `../`, URL ký hết hạn, người B xin xem tệp của A |
| Header | Các header ở file 05, mục 12 có mặt; không lộ phiên bản máy chủ |
| Lộ dữ liệu | Không stack trace, tên bảng, SQL trong phản hồi lỗi; Response DTO không chứa tên trường cấm (`passwordHash`, `token`, `secret`, `idDocument`…) |
| Log | Chạy các luồng nhạy cảm và khẳng định log không chứa mật khẩu, token, email/điện thoại thô, giấy tờ |
| Giới hạn tốc độ | Vượt ngưỡng trả 429 kèm `Retry-After`; khoá theo IP và theo tài khoản hoạt động đúng |
| Tài nguyên | Thân yêu cầu quá lớn bị 413; `limit` vượt trần bị từ chối; khoảng ngày quá dài bị từ chối |

**Công cụ bổ sung (CI hằng đêm):**
- **OWASP ZAP baseline** quét hộp đen trên bản Compose.
- **Schemathesis** (hoặc tương đương) fuzz theo `openapi.json` để tìm lỗi 500 và vi phạm hợp đồng.
- **SpotBugs + FindSecBugs** trong mỗi PR.

---

## 6. Kiểm thử hợp đồng API

- **Snapshot OpenAPI:** `openapi.json` được so sánh với bản chính bằng oasdiff; thay đổi phá vỡ trong `v1` làm CI đỏ (file 03, mục 3).
- **Danh mục mã lỗi:** mọi `ErrorCode` có trong OpenAPI; frontend có thông điệp VI/EN tương ứng.
- **Dạng lỗi:** test mọi nhóm lỗi trả đúng Problem Details (validation, 401, 403, 404, 409, 429, 500, 503).
- **Hợp đồng adapter:** cùng một bộ test chạy cho adapter thật và giả của cổng thanh toán, lưu trữ, email.
- **Idempotency:** phát lại cùng khoá trả cùng phản hồi; khác nội dung bị từ chối.

---

## 7. Kiểm thử phục hồi và vận hành

- Diễn tập sao lưu và phục hồi mỗi mốc demo (file 07, mục 10): sau phục hồi, ứng dụng khởi động, tổng sổ cái khớp, ảnh truy cập được.
- Kiểm tra thất bại có kiểm soát: tắt mock-gateway, MinIO, Mailpit, Frankfurter; hệ thống suy giảm đúng thiết kế (hàng đợi/thử lại), không mất dữ liệu.
- Kiểm tra tắt máy êm: yêu cầu và job đang chạy hoàn tất.
- Kiểm tra `readiness` đổi trạng thái khi DB không khả dụng.

---

## 8. Dữ liệu kiểm thử

- Hoàn toàn **giả**; không bao giờ dùng dữ liệu thật hay giấy tờ thật.
- Bộ seed `local`: tài khoản mỗi vai trò, listing, lịch, giá, cấu hình quốc gia mẫu; có bộ seed lớn riêng cho thử hiệu năng.
- Test data builder cho mỗi thực thể chính; dữ liệu mặc định hợp lệ, test chỉ ghi đè điều cần kiểm tra.
- Datafaker cho dữ liệu ngẫu nhiên; **cố định hạt giống** khi cần tái hiện lỗi.

---

## 9. Định nghĩa hoàn thành của một slice backend

Một slice chỉ đóng khi:

- [ ] Mọi tiêu chí chấp nhận đạt và demo được trên bản local từ dữ liệu seed.
- [ ] **Mỗi bất biến liên quan có ràng buộc DB và test** (không chỉ kiểm tra ở code).
- [ ] Endpoint mới có quy tắc truy cập, kiểm tra đối tượng, test ma trận phân quyền và test BOLA.
- [ ] Request/Response DTO riêng; không lộ trường thừa; không trường server quyết định trong request.
- [ ] Thao tác ghi tiền/đặt phòng idempotent (API, sự kiện, cổng ngoài).
- [ ] Tình huống tranh chấp có **kiểm thử đồng thời**; không `check-then-act` không khoá.
- [ ] Truy vấn mới đã `EXPLAIN`, có chỉ mục cần thiết, test đếm câu lệnh (không N+1).
- [ ] Mã lỗi mới có trong `ErrorCode`, OpenAPI và thông điệp VI/EN ở frontend.
- [ ] Audit log cho thao tác nhạy cảm; log không chứa dữ liệu cá nhân hay bí mật; có chỉ số nghiệp vụ cho luồng tiền.
- [ ] Danh sách kiểm tra bảo mật (file 04 mục 13, file 05 mục 14) và dữ liệu (file 06 mục 9) đã duyệt.
- [ ] CI xanh: build, định dạng, Enforcer, test, ranh giới module, SAST, quét phụ thuộc/bí mật, hợp đồng OpenAPI.
- [ ] `docs/threat-model.md` và ADR được cập nhật nếu có biên tin cậy, tài sản hoặc quyết định nền mới.
- [ ] Không còn `TODO` mà không có vấn đề đi kèm.

---

## 10. Mẫu PR backend

```markdown
## Mục đích
Slice: S__ · Màn hình/endpoint: __ · Mô tả ngắn

## Thay đổi chính
-

## Bất biến liên quan và cách bảo vệ
(ràng buộc DB, khoá, idempotency; test đồng thời nào chứng minh)

## Cách kiểm tra
Các bước, dữ liệu seed, lệnh chạy test.

## Danh sách kiểm tra
- [ ] Quy tắc truy cập + kiểm tra đối tượng + test ma trận và BOLA
- [ ] DTO riêng, không lộ thừa, không trường server quyết định
- [ ] Ràng buộc DB cho bất biến; kiểm thử đồng thời nếu có tranh chấp
- [ ] Idempotency cho thao tác tiền/đặt phòng
- [ ] Transaction ngắn, không gọi bên ngoài trong transaction
- [ ] Truy vấn đã EXPLAIN, không N+1
- [ ] Mã lỗi/OpenAPI cập nhật, không phá vỡ v1
- [ ] Audit log và chỉ số; log không chứa dữ liệu cá nhân
- [ ] Không thêm thư viện, hoặc đã qua cổng thêm thư viện
- [ ] Threat model/ADR cập nhật nếu cần
```
