# Bảo mật (2): phân quyền, đầu vào, upload, CORS, CSRF, header, giới hạn tốc độ

Tiếp nối file 04. Phân quyền là phần quan trọng nhất của file này: phần lớn lỗ hổng nghiêm trọng của API là **thiếu kiểm tra ở cấp đối tượng**, không phải thiếu đăng nhập.

---

## 1. Phân quyền ba tầng và mặc định từ chối

| Tầng | Câu hỏi | Cơ chế | Ví dụ |
|---|---|---|---|
| 1. Đường dẫn | Loại người dùng này có được vào nhóm API này không? | Chuỗi lọc bảo mật theo tiền tố đường dẫn | `/staff/**` chỉ cho tài khoản STAFF |
| 2. Hành động | Có quyền thực hiện **chức năng** này không? | `@PreAuthorize` theo quyền (authority) trên phương thức ở `application` | `hasAuthority('dispute:decide')` |
| 3. **Đối tượng** | Có quyền với **đối tượng cụ thể** này không? | Truy vấn kèm chủ sở hữu, lớp policy theo thuộc tính | Host chỉ sửa listing của mình |

Quy tắc bắt buộc:
- **Mặc định từ chối:** mọi endpoint phải khai báo quy tắc truy cập (hoặc đánh dấu công khai tường minh bằng một annotation riêng, ví dụ `@PublicEndpoint`). Thiếu thì bị chặn.
- Kiểm tra quyền đặt ở **`application`** (use case), không chỉ ở controller, để mọi đường vào (REST, job, sự kiện) cùng bị kiểm soát.
- Quyết định quyền **không dựa vào dữ liệu do client gửi** (vai trò, id chủ sở hữu trong thân yêu cầu).
- Lỗi quyền được ghi log bảo mật (không ghi nội dung nhạy cảm).

---

## 2. RBAC

### 2.1. Vai trò

| Vai trò | Loại tài khoản | Cách có được |
|---|---|---|
| `GUEST` | USER | Mặc định sau khi xác minh email |
| `HOST` | USER | **Chỉ sau khi hồ sơ xác minh Host được duyệt** (BR-ACC-01); một tài khoản có thể vừa `GUEST` vừa `HOST` |
| `ADMIN` | STAFF | Do Admin cấp |
| `SUPPORT` (CSKH) | STAFF | Do Admin cấp |
| `ACCOUNTANT` (Kế toán) | STAFF | Do Admin cấp |

Vai trò chỉ là **nhóm quyền**. Mã nguồn kiểm tra **quyền (authority)**, không kiểm tra tên vai trò, để thay đổi phân quyền không phải sửa code.

### 2.2. Quyền chi tiết (đặt tên `tài-nguyên:hành-động`) và ma trận cho nhân sự

| Quyền | ADMIN | SUPPORT | ACCOUNTANT | Ghi chú |
|---|:-:|:-:|:-:|---|
| `identity:review` | ✓ | | | Duyệt hồ sơ danh tính |
| `identity:view_document` | ✓ | | | Xem giấy tờ; **luôn audit**; có thể tách riêng khỏi `identity:review` |
| `listing:review` | ✓ | | | Duyệt, từ chối listing |
| `listing:manage` | ✓ | | | Tạm ẩn, xoá, quản lý |
| `user:view` | ✓ | ✓ | | |
| `user:lock` | ✓ | | | Khoá/mở khoá, cần lý do |
| `booking:view_any` | ✓ | ✓ | ✓ (chỉ phần tài chính) | |
| `booking:cancel_on_behalf` | ✓ | ✓ (có hạn mức) | | |
| `refund:exception` | ✓ | ✓ (có hạn mức) | | Thuộc tính hạn mức, mục 3.3 |
| `dispute:triage` | ✓ | ✓ | | Tiếp nhận, phân loại, leo thang |
| `dispute:decide` | ✓ | | | Ra quyết định |
| `message:view_for_dispute` | ✓ | ✓ | | Chỉ hội thoại của booking đang có khiếu nại |
| `force_majeure:manage` | ✓ | | | |
| `coupon:manage` | ✓ | | | |
| `config:write` | ✓ | | | Cấu hình quốc gia, phí, tham số, chính sách huỷ; cần lý do |
| `catalog:write` | ✓ | | | Tiện nghi, khu vực |
| `terms:manage` | ✓ | | | |
| `staff:manage` | ✓ | | | Tạo, khoá nhân sự, gán vai trò |
| `audit:view` | ✓ | | | |
| `ledger:view` | | | ✓ | |
| `payout:process` | | | ✓ | Xử lý và xử lý payout lỗi |
| `refund:process` | | | ✓ | **Người thực hiện khác người quyết định** |
| `reconciliation:manage` | | | ✓ | |
| `invoice:manage` | | | ✓ | |
| `report:view_ops` | ✓ | | | |
| `report:view_finance` | ✓ | | ✓ | |
| `report:view_support` | ✓ | ✓ | | Refund, Cancellation ở chế độ xem |

- **Tách nhiệm vụ:** người **quyết định** hoàn tiền (Admin) khác người **thực hiện** (Kế toán); không ai vừa tạo vừa xử lý cùng một khoản.
- Ma trận này là **dữ liệu cấu hình** (`role_permission`), seed bằng migration; đổi qua màn «Nhân sự và phân quyền» (A18) và có audit.
- Đối chiếu ma trận với danh sách màn hình theo actor khi triển khai từng slice.

### 2.3. Quyền của người dùng (USER)

| Hành động | Điều kiện |
|---|---|
| Đặt phòng | Email đã xác minh; tài khoản không bị khoá; booking giá trị cao cần Guest đã xác minh danh tính (BR-ACC-03) |
| Tạo, sửa listing | Có vai trò `HOST` (đã duyệt) và là chủ listing |
| Gửi duyệt listing | Host đã xác minh; listing đủ điều kiện |
| Nhận payout | Tài khoản payout đã được duyệt |
| Đánh giá, khiếu nại | Là bên của booking, trong cửa sổ thời gian |

---

## 3. Kiểm tra cấp đối tượng (chống BOLA) và ABAC nhẹ

### 3.1. Mẫu bắt buộc

- **Tải đối tượng cùng điều kiện sở hữu trong một truy vấn:** `findByIdAndHostId(id, currentHostId)`, `findByIdAndGuestId(...)`. Không tải theo `id` rồi mới so sánh (dễ quên so sánh).
- Không tìm thấy hoặc không thuộc quyền: **404**, không phải 403 (không lộ việc đối tượng có tồn tại).
- Người dùng hiện tại **luôn lấy từ ngữ cảnh bảo mật** (`Authentication`), không bao giờ từ thân hay tham số yêu cầu.
- Đối tượng con kế thừa quyền của cha: booking của listing, thanh toán của booking, tin nhắn của hội thoại; kiểm tra đi qua **chuỗi sở hữu** đầy đủ.
- Danh sách luôn lọc theo chủ sở hữu **trong truy vấn**, không lọc sau ở bộ nhớ.

### 3.2. ABAC mức nhẹ: lớp policy

Quy tắc phụ thuộc thuộc tính được viết thành **lớp policy** ở `domain`, có test từng nhánh, thay vì rải điều kiện `if` ở nhiều nơi.

| Policy | Thuộc tính tham gia |
|---|---|
| `ListingPolicy.canEdit` | Chủ listing, trạng thái listing (đang chờ duyệt có sửa được không), người gọi có `HOST` |
| `BookingPolicy.canCancel` | Bên huỷ (Guest hoặc Host), trạng thái booking, mốc thời gian theo múi giờ listing |
| `BookingPolicy.canViewAddress` | Booking đã xác nhận, người gọi là Guest của booking |
| `ChatPolicy.canViewUnmasked` | Booking đã xác nhận |
| `DisputePolicy.canCreate` | Là bên của booking, trong 14 ngày sau check-out, chưa có khiếu nại |
| `RefundPolicy.canExecuteException` | Quyền của nhân sự **và** số tiền ≤ hạn mức (`SystemConfig`) của vai trò; vượt hạn mức phải chuyển Admin |
| `ReviewPolicy.canSubmit` | Booking Hoàn tất, trong 14 ngày, chưa đánh giá |

- Policy là **hàm thuần** nhận chủ thể, đối tượng, hành động (và ngữ cảnh như `Clock`), trả về cho phép hoặc từ chối kèm mã lý do.
- Không dùng bộ máy chính sách ngoài (OPA, Cedar); khi luật nhiều tới mức khó giữ trong code mới xem lại (YAGNI, file 02).

### 3.3. Cấp thuộc tính và cấp chức năng (API3, API5)

- **Cấp thuộc tính:** Response DTO riêng theo vai trò (Guest thấy gì về booking khác Host thấy gì). Request DTO chỉ chứa trường người dùng được phép sửa (file 02).
- **Cấp chức năng:** hành động quản trị chỉ ở `/staff/**` và yêu cầu quyền tương ứng; không có endpoint «dùng chung» mà phân nhánh theo vai trò bên trong.

---

## 4. Kiểm thử phân quyền tự động

| Kiểm thử | Mô tả |
|---|---|
| **Ma trận phân quyền** | Duyệt **mọi** endpoint (từ `RequestMappingHandlerMapping`); khẳng định mỗi endpoint có quy tắc truy cập hoặc `@PublicEndpoint`; gọi với các nhân vật (ẩn danh, Guest, Host, SUPPORT, ACCOUNTANT, ADMIN) và khẳng định nhân vật không đủ quyền nhận 401/403 **và không có tác dụng phụ** |
| BOLA | Với mỗi tài nguyên: người A không đọc, sửa, xoá được tài nguyên của người B (kết quả 404) |
| Gán hàng loạt | Gửi `role`, `status`, `price`, `hostId`, `version` trong thân; khẳng định bị từ chối hoặc không có tác dụng |
| Leo thang | Tài khoản Guest không gọi được `/staff/**`; Host chưa duyệt không tạo được listing; CSKH không đổi được cấu hình |
| Hết quyền | Sau khi thu hồi quyền hoặc khoá tài khoản, phiên cũ bị từ chối ngay |

Thêm endpoint mà không khai báo quyền thì test **đỏ**; đây là chốt chặn của quy tắc mặc định từ chối (cổng vào mục E3 ở file 01).

---

## 5. Kiểm tra đầu vào

### 5.1. Các lớp kiểm tra

| Lớp | Việc | Công cụ |
|---|---|---|
| Cú pháp | Kiểu, bắt buộc, độ dài, định dạng, khoảng giá trị, kích thước danh sách | Bean Validation trên Request DTO (`@Valid`, `@Size`, `@Pattern`, `@Min`, `@Max`, `@NotNull`) |
| Chuẩn hoá | Cắt khoảng trắng, chuẩn hoá Unicode (NFC), email chữ thường, loại ký tự điều khiển | Bộ chuẩn hoá trong lớp ánh xạ |
| Ngữ nghĩa, nghiệp vụ | Đêm tối thiểu/tối đa, sức chứa, trạng thái hợp lệ, hạn mức, thời hạn | `domain`/`application`; **không** đặt ở annotation |
| Ràng buộc DB | Unique, CHECK, FK, exclusion | PostgreSQL: lớp cuối cùng |

### 5.2. Quy tắc

- **Danh sách cho phép (allowlist)** thay vì danh sách chặn: định dạng chấp nhận được khai báo rõ.
- Mọi chuỗi có `@Size` tối đa; mọi danh sách có số phần tử tối đa; mọi số có khoảng; mọi ngày có khoảng hợp lý (và khoảng ngày có độ dài tối đa).
- Từ chối **trường lạ** trong JSON và độ sâu lồng nhau quá giới hạn (cấu hình ràng buộc đọc của Jackson); kích thước thân yêu cầu có trần.
- Enum, UUID, ngày được phân tích **nghiêm ngặt**; giá trị sai trả 400/422, không đoán.
- Nội dung văn bản tự do (mô tả, tin nhắn, đánh giá): giới hạn độ dài, loại ký tự điều khiển; **lưu nguyên văn** và để lớp hiển thị tự thoát ký tự (frontend hiển thị dạng văn bản). Việc che email/điện thoại/liên kết trong tin nhắn thực hiện ở backend trước khi trả ra.
- Biểu thức chính quy: chỉ dùng mẫu thời gian tuyến tính, có giới hạn độ dài đầu vào trước khi so khớp (chống ReDoS).
- Tham số phân trang, sắp xếp, lọc (file 03, mục 5) cũng là đầu vào cần kiểm tra.
- **Không tin** trường từ client mà server có thể suy ra (giá, tổng tiền, chủ sở hữu, trạng thái).

---

## 6. Chống injection

| Loại | Quy tắc |
|---|---|
| **SQL** | Mọi truy vấn **tham số hoá**: JPA/JPQL tham số, jOOQ bind value, `JdbcClient` tham số có tên. **Cấm** nối chuỗi dữ liệu người dùng vào SQL |
| Sắp xếp, tên cột động | Chỉ nhận **enum cho phép** rồi ánh xạ sang cột cố định; không bao giờ ghép tên cột từ đầu vào |
| jOOQ SQL thuần | Dùng chỗ giữ chỗ `{0}`/bind, không nối chuỗi |
| `LIKE` | Thoát ký tự đặc biệt (`%`, `_`, `\`) khi dùng đầu vào làm mẫu |
| Native query | Có tham số; được review kỹ; có test với ký tự đặc biệt |
| Lệnh hệ điều hành | Không dùng `Runtime.exec`/`ProcessBuilder` với dữ liệu người dùng; nếu bắt buộc, danh sách lệnh cố định |
| Template (email) | Mẫu cố định trong mã/tài nguyên; dữ liệu người dùng chỉ là biến được thoát; **không** cho người dùng cung cấp mẫu |
| Chèn header, CRLF | Không đưa dữ liệu người dùng vào giá trị header phản hồi hoặc `Location` mà không kiểm tra |
| Chèn log | Log dạng JSON có cấu trúc (bộ mã hoá tự thoát xuống dòng và ký tự điều khiển); không nối chuỗi dữ liệu người dùng vào thông điệp log |
| Giải mã đối tượng (deserialization) | Cấm bật kiểu mặc định đa hình của Jackson; không giải mã dữ liệu không tin cậy bằng cơ chế tuần tự hoá Java gốc |
| XML | Tránh; nếu phải dùng, tắt thực thể ngoài và DTD |
| iCal | Phân tích bằng ical4j với giới hạn kích thước và số thành phần (mục 8) |
| Đường dẫn file | Khoá đối tượng lưu trữ do server sinh (UUID); không dùng tên tệp của người dùng làm đường dẫn |

Test bắt buộc: các ký tự `'`, `"`, `;`, `--`, `%`, `\`, chuỗi `' OR 1=1 --` và Unicode lạ trong tìm kiếm, lọc, sắp xếp, tên, mô tả; khẳng định không lỗi 500 và không rò rỉ dữ liệu.

---

## 7. Webhook cổng thanh toán

Webhook là đầu vào **không tin cậy** từ bên ngoài (API10).

| Biện pháp | Chi tiết |
|---|---|
| Xác thực bằng chữ ký | HMAC-SHA256 trên `dấu-thời-gian + "." + thân thô`; so sánh thời gian không đổi; khoá riêng cho từng cổng, lấy từ biến môi trường |
| Chống phát lại | Dấu thời gian trong dung sai (ví dụ ±5 phút) **và** lưu định danh sự kiện/giao dịch với ràng buộc unique; lặp lại không xử lý thêm |
| Không tin nội dung trạng thái | Sau khi xác thực chữ ký, **truy vấn chủ động trạng thái giao dịch** từ cổng (máy chủ tới máy chủ) để lấy sự thật; đối chiếu số tiền và tiền tệ với bản ghi thanh toán nội bộ |
| Idempotent | Xử lý nhiều lần cho cùng một giao dịch cho cùng kết quả (file 06) |
| Phản hồi nhanh | Ghi nhận bền vững rồi trả 2xx; việc nặng chạy sau (sự kiện) |
| Giới hạn | Giới hạn kích thước thân; giới hạn tốc độ; (môi trường thật) danh sách IP của cổng |
| Không phiên, không CSRF | Chuỗi lọc riêng; chữ ký thay cho cả hai |
| Lỗi chữ ký | 401/400 không giải thích chi tiết; ghi log bảo mật và tăng chỉ số |

---

## 8. Chống SSRF

Áp dụng cho **mọi** lời gọi ra tới URL do người dùng cung cấp (hiện tại: URL iCal của Host). Cổng thanh toán, Frankfurter, Mapbox là địa chỉ cố định trong cấu hình nhưng vẫn qua HTTP client có timeout.

`SafeHttpFetcher` (một lớp duy nhất, mọi nơi gọi qua nó):

| Bước | Quy định |
|---|---|
| Phân tích URL | Chỉ `http`/`https`; cổng thuộc danh sách cho phép (80, 443); **không có thông tin đăng nhập trong URL** |
| Phân giải DNS | Phân giải **tất cả** địa chỉ của tên miền; từ chối nếu **bất kỳ** địa chỉ nào là loopback, riêng tư (RFC 1918), link-local (gồm `169.254.169.254` của metadata đám mây), CGNAT, multicast, không xác định, IPv6 ULA hoặc IPv4 ánh xạ trong IPv6 |
| Chống DNS rebinding | **Kết nối tới đúng địa chỉ IP đã kiểm tra** (cố định kết quả phân giải trong bộ phân giải của client), giữ nguyên `Host`/SNI |
| Chuyển hướng | Không tự theo; xử lý thủ công tối đa 3 bước, **kiểm tra lại toàn bộ** ở mỗi bước |
| Giới hạn | Thời gian kết nối 3 giây, tổng 10 giây; tải tối đa 2 MB (cắt luồng); từ chối loại nội dung không phải `text/calendar`/`text/plain` |
| Không gửi gì thêm | Không chuyển cookie, token; `User-Agent` cố định |
| Nơi chạy | Trong **worker**, không chạy trong luồng xử lý yêu cầu người dùng |
| Ngoại lệ local | Cấu hình danh sách máy chủ cho phép (ví dụ feed iCal giả trong Docker) **chỉ ở profile `local`**, từng máy chủ cụ thể |
| Kết quả | Lỗi chung cho người dùng («không tải được»), chi tiết ghi log bảo mật |

Test bắt buộc: địa chỉ loopback, `10.x`, `172.16.x`, `192.168.x`, `169.254.169.254`, `localhost`, IPv6 `::1`, số nguyên/hex/octal của IP, tên miền trỏ về IP nội bộ, chuyển hướng tới địa chỉ nội bộ, phản hồi quá lớn, quá chậm.

---

## 9. Upload file an toàn và Quản lý tệp đính kèm (`Attachment`)

Luồng tải lên 4 bước (khớp `frontend/docs/giai-doan-1/00-foundations/common-data.md` và `frontend/docs/base/05-ket-noi-api-du-lieu-va-trang-thai.md`):

1. `POST /api/v1/uploads` `{ purpose, fileName, mime, size }`: client gửi mục đích và thông tin tệp. Backend kiểm tra quyền và hạn mức, tạo bản ghi `Attachment` (trạng thái `PENDING`) và trả **URL ký** (uploadUrl) hết hạn sau vài phút: `{ attachmentId, uploadUrl, expiresAt }`.
2. `PUT {uploadUrl}`: Client tải nhị phân trực tiếp lên MinIO vào vùng **cách ly (quarantine)**.
3. `POST /api/v1/uploads/{id}/complete`: Backend **tự kiểm tra** đối tượng đã tải: kích thước thật, **magic bytes** (loại nội dung thật), kích thước điểm ảnh. Nếu hợp lệ, chuyển sang vùng lưu trữ chính thức và trả `{ status: 'UPLOADED' }`; nếu vi phạm, xoá và trả `{ status: 'REJECTED', reason }`.
4. `DELETE /api/v1/uploads/{id}`: Xoá tệp mồ côi khi người dùng huỷ thao tác trước khi gửi hồ sơ/listing. Job định kỳ dọn các upload `PENDING` quá hạn.

| Hạng mục | Quy định chi tiết [A5] |
|---|---|
| **Mục đích (`purpose`)** | - `AVATAR`: Ảnh đại diện người dùng<br>- `LISTING_PHOTO`: Ảnh chỗ ở homestay<br>- `ID_FRONT`, `ID_BACK`, `ID_PASSPORT`: Giấy tờ tuỳ thân (CCCD / Hộ chiếu)<br>- `OPERATING_RIGHT`: Giấy chứng nhận quyền vận hành chỗ ở (S04)<br>- `LISTING_LEGAL`: Giấy phép PCCC, ĐKKD theo quốc gia (S07) |
| **Định dạng cho phép** | - Ảnh (`LISTING_PHOTO`, `AVATAR`): JPEG, PNG, WebP.<br>- Giấy tờ pháp lý & KYC (`ID_*`, `OPERATING_RIGHT`, `LISTING_LEGAL`): JPEG, PNG, PDF.<br>- **Tuyệt đối cấm:** SVG, HTML, file thực thi (.exe, .sh), nén (.zip, .rar). |
| **Kích thước & Số lượng [A5]** | - `AVATAR`: ≤ 5 MB/tệp, cắt vuông.<br>- `LISTING_PHOTO`: ≤ 10 MB/tệp; tối thiểu 5 ảnh, tối đa 30 ảnh mỗi listing.<br>- Giấy tờ danh tính & pháp lý: ≤ 10 MB/tệp; tối đa 5 tệp cho mỗi loại giấy tờ. |
| **Kiểm tra loại thật** | Theo **magic bytes** nội dung nhị phân (dùng Apache Tika / thư viện chuyên dụng), không tin `Content-Type` hoặc phần mở rộng do client gửi. |
| **Xử lý ảnh** | Đổi kích thước, nén tối ưu (WebP/JPEG) và **loại bỏ siêu dữ liệu EXIF/GPS** để bảo vệ quyền riêng tư người dùng. |
| **Bucket công khai** | Chứa `LISTING_PHOTO` và `AVATAR` đã xử lý. Cung cấp trường `viewUrl` công khai. Chính sách bucket: chỉ cho đọc từng đối tượng, cấm liệt kê (ListObjects). |
| **Bucket riêng tư (KYC & Pháp lý)** | Chứa `ID_*`, `OPERATING_RIGHT`, `LISTING_LEGAL`. Tuyệt đối **không** có `viewUrl` công khai. Chủ sở hữu chỉ thấy tên tệp đã tải; Admin xem qua API thẩm định (`POST …/documents/{attId}/view`) sinh **URL ký ngắn hạn (120 giây [A13b]) kèm ghi AuditLog**. |
| **Khoá truy cập MinIO** | Tài khoản ứng dụng chỉ có quyền trên 2 bucket tương ứng; không dùng quyền quản trị viên (`minioadmin`). |
| **Soft Locking khi duyệt [A13]** | Khi Admin mở hồ sơ KYC (A03) hoặc Listing (A04), gọi `POST /api/v1/locks/{type}/{id}` để giữ lock trong 5 phút. Nếu người khác đang giữ, trả 409 `{ heldBy: { id, name }, expiresAt }`. Duy trì qua `PUT …/heartbeat` và giải phóng qua `DELETE …`. |

Test bắt buộc: sai magic bytes, đổi phần mở rộng, SVG, tệp quá lớn, ảnh bom giải nén, tệp polyglot, tệp đôi đuôi (`a.jpg.php`), tên tệp chứa `../`, người dùng B xin xem tệp của A, URL ký đã hết hạn.

---

## 10. CORS

- **Mặc định không bật CORS**, vì frontend gọi cùng origin qua rewrite (file 03 frontend). Không bật thì trình duyệt tự chặn mọi gọi chéo origin.
- Nếu cần bật (công cụ phát triển, Swagger UI ở origin khác): chỉ cho **danh sách origin tường minh** (`app.localhost:3000`, `admin.localhost:3001`), **không bao giờ `*` kèm thông tin xác thực**, giới hạn phương thức và header, `allowCredentials` chỉ cho các origin đó.
- Cấu hình ở một chỗ duy nhất (`CorsConfigurationSource`), lấy từ cấu hình theo profile.
- **Kiểm tra `Origin`** cho yêu cầu đổi trạng thái: nếu có header `Origin` thì phải nằm trong danh sách cho phép (lớp bảo vệ bổ sung cho CSRF).
- CORS **không phải** cơ chế xác thực: không dựa vào nó để bảo vệ API.

---

## 11. CSRF

- Phiên cookie nên **bật CSRF** cho mọi phương thức không an toàn (POST, PUT, PATCH, DELETE).
- Dùng mẫu SPA của Spring Security: cookie `XSRF-TOKEN` (đọc được bởi JS), client gửi header `X-XSRF-TOKEN`; xử lý token theo mẫu SPA của Spring Security để vẫn có bảo vệ chống BREACH.
- `SameSite=Lax` cho cookie phiên là lớp bổ sung.
- GET không đổi trạng thái; không có endpoint đổi trạng thái nhận GET.
- **Ngoại lệ có chủ đích:** chuỗi webhook (không phiên, dùng chữ ký). Không miễn CSRF cho endpoint nào khác.
- Kết hợp kiểm tra `Origin` (mục 10).
- Test: thiếu hoặc sai token bị 403; token đúng được chấp nhận; token của phiên khác bị từ chối.

---

## 12. Header bảo mật của API

API chỉ trả JSON nên áp chính sách rất chặt:

| Header | Giá trị |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Content-Security-Policy` | `default-src 'none'; frame-ancestors 'none'` (cho phản hồi API) |
| `Cache-Control` | `no-store` cho phản hồi đã xác thực (mặc định của Spring Security) |
| `Referrer-Policy` | `no-referrer` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | Tắt mọi tính năng không dùng |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `Strict-Transport-Security` | **Chỉ ở môi trường thật** (HTTPS) |

Ngoài ra:
- Ẩn thông tin máy chủ và phiên bản: không trả header `Server` chi tiết, tắt trang lỗi mặc định (`server.error.include-*` đều tắt).
- Phản hồi lỗi luôn đi qua xử lý lỗi tập trung (file 03).
- Test: khẳng định các header có mặt ở phản hồi mẫu và **không** có header lộ phiên bản.

---

## 13. Giới hạn tốc độ

Bảo vệ khỏi dò mật khẩu, quét dữ liệu, lạm dụng luồng nghiệp vụ và tiêu thụ tài nguyên (API4, API6).

| Hạng mục | Thiết kế |
|---|---|
| Thuật toán | Token bucket (Bucket4j) |
| Khoá | `ip:{ip}:{nhóm-route}`, `user:{id}:{nhóm-route}`, `acct:{băm-email}:login` (băm để không giữ email thô trong bộ nhớ) |
| Chính sách | Cấu hình theo nhóm route (đăng nhập, đăng ký, đặt lại mật khẩu, tìm kiếm, giữ chỗ, thanh toán, upload, tin nhắn, liên hệ, nhân sự); giá trị mẫu ở file 04, mục 12 |
| Vị trí | Bộ lọc chạy **trước xác thực** cho nhóm công khai và đăng nhập; sau xác thực cho nhóm theo người dùng |
| Phản hồi | 429, `common.rate_limited`, `Retry-After`; không tiết lộ ngưỡng |
| Lưu trữ | Bộ nhớ trong có **giới hạn kích thước** (tránh bị làm đầy bằng nhiều khoá); đặt sau interface `RateLimiter` để chuyển sang kho dùng chung (DB hoặc Redis) khi chạy nhiều instance |
| IP thật | Cấu hình tin cậy `X-Forwarded-For` **chỉ từ proxy đã biết** (Next.js rewrite ở local, reverse proxy ở môi trường thật); nếu không, mọi người dùng bị gộp chung một IP hoặc kẻ tấn công giả mạo IP |
| Tài nguyên khác | Giới hạn kích thước yêu cầu, `limit` tối đa, giới hạn độ dài khoảng ngày, giới hạn dòng xuất báo cáo (xuất lớn chạy bất đồng bộ), `statement_timeout`, số kết nối DB, timeout cho mọi lời gọi ngoài |
| Quan sát | Chỉ số số lần chặn theo nhóm; cảnh báo khi tăng đột biến |

---

## 14. Danh sách kiểm tra cho PR

- [ ] Endpoint mới có quy tắc truy cập khai báo; test ma trận phân quyền biết nó?
- [ ] Đối tượng được tải kèm chủ sở hữu trong truy vấn? Trả 404 khi không thuộc quyền? Có test BOLA?
- [ ] Quyền kiểm tra bằng **authority**, không bằng tên vai trò viết cứng? Dữ liệu quyền không lấy từ client?
- [ ] Ma trận quyền nhân sự có thay đổi? Đã cập nhật seed và tài liệu?
- [ ] Mọi đầu vào có giới hạn kích thước, kiểu, khoảng; trường lạ bị từ chối?
- [ ] Không có SQL ghép chuỗi; sắp xếp/cột động qua enum cho phép?
- [ ] URL do người dùng cung cấp đi qua `SafeHttpFetcher`?
- [ ] Webhook mới có chữ ký, chống phát lại, truy vấn lại trạng thái, idempotent?
- [ ] Upload mới tuân thủ luồng cách ly, kiểm tra loại thật, bucket đúng loại?
- [ ] Luồng nhạy cảm có giới hạn tốc độ?
- [ ] Header, CORS, CSRF không bị nới lỏng; nếu có, đã ghi lý do?
