# Đa ngôn ngữ (i18n) phía backend

Phạm vi ngôn ngữ: **tiếng Việt (`vi`, mặc định) và tiếng Anh (`en`)**. Phía frontend đã có quy định ở `frontend/08` (mục 1); file này quy định phần backend và cách hai bên khớp nhau.

Quyết định nền: **nội dung Host nhập (tên, mô tả listing…) chỉ một ngôn ngữ**, không dịch tự động. Nội dung do nền tảng sở hữu (danh mục, chính sách huỷ, điều khoản, email) có đủ hai ngôn ngữ.

---

## 1. Nguyên tắc

1. **Backend trả dữ liệu trung tính về ngôn ngữ** bất cứ khi nào có thể: mã lỗi, mã trạng thái, enum, tham số. Frontend dịch. Chỉ dịch ở backend những thứ **frontend không hiển thị được**: email, tệp xuất, hoá đơn, dữ liệu danh mục có bản dịch.
2. **Không phụ thuộc ngôn ngữ của máy chủ.** Mọi định dạng và tra cứu thông điệp nhận `Locale` tường minh; không dùng `Locale.getDefault()`.
3. **Một nơi quyết định ngôn ngữ cho mỗi ngữ cảnh** (mục 3); không rải logic chọn ngôn ngữ.
4. **Thiếu bản dịch không làm hỏng hệ thống:** rơi về ngôn ngữ mặc định, ghi cảnh báo, và bị CI chặn từ trước khi tới runtime.
5. **Không lưu chữ đã dịch** vào dữ liệu nghiệp vụ (thông báo, nhật ký); lưu mã và tham số, dịch lúc hiển thị hoặc lúc gửi.
6. **Ngôn ngữ ≠ tiền tệ ≠ múi giờ.** Ba thứ độc lập; đổi ngôn ngữ không đổi tiền hay giờ.

---

## 2. Phân loại nội dung

| Loại | Ví dụ | Ai dịch | Lưu và trả thế nào |
|---|---|---|---|
| Chữ giao diện | Nhãn, nút, tiêu đề | Frontend | Không liên quan backend |
| Lỗi, trạng thái, enum | `calendar.unavailable`, `PENDING_PAYMENT` | Frontend | Backend chỉ trả **mã và tham số** |
| Danh mục của nền tảng | Tiện nghi, khu vực, loại hình, tên và mô tả chính sách huỷ | Nền tảng (Admin nhập đủ hai ngôn ngữ) | Bảng bản dịch (mục 4); trả theo ngôn ngữ yêu cầu |
| Văn bản pháp lý | Điều khoản dịch vụ, chính sách quyền riêng tư | Nền tảng | Bản theo phiên bản và ngôn ngữ (mục 4.3) |
| Email | Xác minh, xác nhận booking, huỷ, payout, khiếu nại | Backend | Mẫu + gói thông điệp (mục 6) |
| Thông báo trong website | Trung tâm thông báo | Frontend | Lưu **loại + tham số**; frontend dịch |
| Tệp xuất, hoá đơn | CSV báo cáo, hoá đơn VAT | Backend | Mục 8 |
| **Nội dung người dùng nhập** | Tên, mô tả, quy tắc nhà, đánh giá, tin nhắn | **Không dịch** | Lưu nguyên văn; listing có nhãn ngôn ngữ gốc (mục 5) |

---

## 3. Xác định ngôn ngữ

### 3.1. Danh sách hỗ trợ

`app.i18n.supported-locales: [vi, en]` và `app.i18n.default-locale: vi` trong cấu hình có kiểm tra. Thêm ngôn ngữ mới là thêm cấu hình, bản dịch và migration dữ liệu danh mục, không sửa mã nghiệp vụ.

### 3.2. Ngôn ngữ của một yêu cầu HTTP

Thứ tự ưu tiên:

1. Tham số truy vấn **`lang`** (chỉ cho các GET công khai, để khoá URL của cache phân biệt ngôn ngữ; xem mục 3.4).
2. Header `Accept-Language` (frontend gửi theo ngôn ngữ trang đang xem).
3. Ngôn ngữ ưa thích trong hồ sơ (`account.preferred_locale`) khi đã đăng nhập.
4. Mặc định (`vi`).

Cách chuẩn hoá: phân tích bằng `Locale.LanguageRange`, đối chiếu danh sách hỗ trợ bằng `Locale.lookup`; `vi-VN` về `vi`, `en-GB`/`en-US` về `en`; giá trị không hỗ trợ hoặc `*` về mặc định. Cài một `LocaleResolver` duy nhất cho toàn ứng dụng; kết quả nằm trong `LocaleContextHolder` **chỉ trong luồng xử lý yêu cầu**.

### 3.3. Ngôn ngữ ngoài ngữ cảnh yêu cầu (email, job, sự kiện)

- **Không** dùng `LocaleContextHolder` trong listener sự kiện, job hay luồng bất đồng bộ (không có yêu cầu, hoặc là luồng khác).
- Ngôn ngữ lấy từ **người nhận**: `account.preferred_locale`; đặt lúc đăng ký từ ngôn ngữ trang đăng ký (frontend gửi trường `preferredLocale` tường minh) và đổi được ở màn cài đặt (C02) qua `PATCH /me`.
- Sự kiện mang **định danh người nhận**, không mang chữ đã dịch; ngôn ngữ được tra lúc gửi. Email gửi cho người chưa có tài khoản (ví dụ liên hệ hỗ trợ) dùng ngôn ngữ của yêu cầu lúc đó, lưu cùng bản ghi.
- Liên kết trong email có **tiền tố ngôn ngữ của người nhận** (`/vi/...`, `/en/...`), dựng qua một `LinkBuilder` duy nhất (địa chỉ gốc lấy từ cấu hình, kèm ngôn ngữ).

### 3.4. Phản hồi và cache

- Phản hồi có dữ liệu phụ thuộc ngôn ngữ trả `Content-Language` và `Vary: Accept-Language` (file 03, mục 10).
- Lời gọi từ Server Component của frontend nên dùng `lang` trong URL để khoá cache tách ngôn ngữ (khớp `frontend/05`, mục 9). Header vẫn được hỗ trợ.
- Endpoint không có dữ liệu phụ thuộc ngôn ngữ không cần `Vary`.

### 3.5. Cấu hình Spring

| Thuộc tính | Giá trị | Lý do |
|---|---|---|
| `spring.messages.basename` | Danh sách gói thông điệp theo module | |
| `spring.messages.encoding` | `UTF-8` | Tiếng Việt có dấu |
| `spring.messages.fallback-to-system-locale` | `false` | **Không rơi về ngôn ngữ của máy chủ** |
| `spring.messages.use-code-as-default-message` | `false` | Không bao giờ hiển thị khoá thô cho người dùng |
| Múi giờ JVM | Không phụ thuộc; mọi chuyển đổi dùng `ZoneId` tường minh | |

---

## 4. Dữ liệu danh mục có bản dịch

### 4.1. Mô hình

- Bảng gốc giữ **mã ổn định** (`code`), thuộc tính không phụ thuộc ngôn ngữ, trạng thái, thứ tự.
- Bảng bản dịch riêng cho từng danh mục: `amenity_translation`, `location_translation`, `listing_type_translation`, `cancellation_policy_translation`.

| Cột | Ý nghĩa |
|---|---|
| `<entity>_id`, `locale` | Khoá chính tổ hợp |
| `name`, `description` | Nội dung theo ngôn ngữ |
| `name_search` | Tên đã chuẩn hoá để tìm (mục 7) |

- `locale` có `CHECK` thuộc tập ngôn ngữ hỗ trợ.
- Chọn bảng bản dịch (không phải cột JSONB) vì ràng buộc được khai báo và truy vấn, nối, tìm kiếm rõ ràng; các danh mục này nhỏ nên chi phí nối thấp.

### 4.2. Quy tắc

- **Đủ cả hai ngôn ngữ mới được kích hoạt:** màn quản trị (A15, A16, A13) bắt buộc nhập đủ `vi` và `en`; có kiểm tra ở dịch vụ và test «mọi dòng danh mục đang hoạt động đều có đủ bản dịch».
- Truy vấn lấy bản dịch theo ngôn ngữ yêu cầu và **rơi về `vi`** nếu thiếu (`COALESCE`); ghi log cảnh báo và chỉ số `i18n_missing_translation`.
- Sắp xếp danh sách theo tên dùng bộ so sánh theo ngôn ngữ (`java.text.Collator` cho `vi`/`en`) hoặc collation ICU của PostgreSQL nếu image hỗ trợ; không sắp xếp byte thô (sai thứ tự chữ có dấu).
- Mã `code` là hợp đồng với frontend và dữ liệu seed; không đổi sau khi phát hành.

### 4.3. Văn bản pháp lý có phiên bản

- `terms_version` (số phiên bản, ngày hiệu lực) và `terms_content (version_id, locale, content)`.
- **Chỉ phát hành khi có đủ hai ngôn ngữ.**
- Bản **tiếng Việt là bản có giá trị tham chiếu** (giá trị cấu hình mẫu, cần xác nhận về pháp lý); bản tiếng Anh ghi chú là bản dịch.
- Ghi nhận đồng ý (`UserConsent`) theo **phiên bản**, kèm ngôn ngữ đã hiển thị cho người dùng.

### 4.4. Cấu hình quốc gia

`CountryConfig` có `default_locale` và `invoice_locale` (ví dụ Việt Nam: `vi`), dùng cho email hệ thống chưa biết người nhận và cho hoá đơn.

---

## 5. Nội dung người dùng nhập (một ngôn ngữ)

- Tên, mô tả, quy tắc nhà, tiện ích tự khai… lưu **nguyên văn một bản**, không dịch, không tách cột theo ngôn ngữ.
- Listing có cột **`content_language`** (`vi` hoặc `en`, có `CHECK`): Host chọn khi tạo (mặc định theo ngôn ngữ giao diện Host đang dùng), sửa được; API trả để frontend hiển thị nhãn «Ngôn ngữ gốc».
- Không tự dịch, không phát hiện ngôn ngữ tự động (YAGNI); khi cần dịch hỗ trợ, đó là chức năng mới, không thuộc nền.
- Đánh giá, tin nhắn, khiếu nại: không gắn nhãn ngôn ngữ.
- **Chuẩn hoá Unicode NFC** khi nhận (file 05, mục 5); cơ sở dữ liệu UTF-8; độ dài giới hạn tính theo **ký tự**, không theo byte.
- Thuật toán che email, số điện thoại, liên kết trong tin nhắn (file 04/05) phải được **kiểm thử với văn bản tiếng Việt** và các dạng số điện thoại Việt Nam (`0xx`, `+84`, có dấu cách, dấu chấm, dấu gạch).

---

## 6. Email và thông báo

### 6.1. Mẫu và gói thông điệp

| Hạng mục | Quy định |
|---|---|
| Gói thông điệp | `i18n/<module>/messages_vi.properties` và `messages_en.properties`, UTF-8 |
| Khoá | Dạng `email.<ten-email>.<phan>` (ví dụ `email.booking_confirmed.subject`), tiếng Anh không dấu, cùng phong cách khoá ở frontend |
| Mẫu HTML | **Một mẫu Thymeleaf cho mỗi email**, dùng `#{khoá}` lấy chữ từ gói thông điệp; không nhân đôi HTML theo ngôn ngữ (trừ văn bản pháp lý dài) |
| Tham số | Dùng cú pháp tham số của `MessageFormat` (`{0}`, `{1}`), không nối chuỗi trong mã |
| Chủ đề, nội dung văn bản thuần | Cũng nằm trong gói thông điệp; luôn có cả phiên bản văn bản thuần song song HTML |
| Danh mục email | Có một danh sách đầy đủ sự kiện cần email (theo FR-MSG-03) và mẫu cho từng sự kiện |
| Thiếu khoá | Test CI bắt; ở runtime rơi về `vi`, ghi cảnh báo, tăng chỉ số; **không bao giờ gửi khoá thô** |
| Thoát ký tự | Dữ liệu người dùng chèn vào mẫu luôn được thoát (Thymeleaf mặc định); không `th:utext` với dữ liệu người dùng |
| Người nhận | Ngôn ngữ theo `account.preferred_locale` (mục 3.3) |

### 6.2. Thông báo trong website

- Bản ghi thông báo lưu **`type` + `params`** (JSON), không lưu câu chữ; frontend dịch theo `type` (khoá thông điệp trong `frontend`).
- Hệ quả: một sự kiện có **hai nơi** cần bản dịch (email ở backend, thông báo ở frontend); bảng danh mục sự kiện thông báo (FR-MSG-03) là nguồn thống nhất, và CI kiểm tra mỗi `type` có mặt ở cả hai nơi.

---

## 7. Định dạng và tìm kiếm theo ngôn ngữ

### 7.1. Số, tiền, ngày trong email và tệp xuất

| Mục | Quy định |
|---|---|
| Một bộ định dạng duy nhất | `MoneyFormatter`, `DateFormatter` ở `shared`, nhận `Locale` (và `ZoneId` nếu là ngày giờ) tường minh |
| Tiền | Theo số chữ số thập phân của loại tiền; ký hiệu và dấu phân cách theo ngôn ngữ (`vi`: dấu chấm hàng nghìn; `en`: dấu phẩy); kèm mã tiền tệ khi dễ nhầm lẫn |
| Ngày lưu trú | `LocalDate`, hiển thị theo ngôn ngữ, **không** đổi múi giờ |
| Mốc giờ liên quan lưu trú | Hiển thị theo múi giờ **của listing**, kèm tên múi giờ khi khác múi giờ người nhận |
| Mốc cá nhân | Theo múi giờ ưa thích của người dùng, mặc định múi giờ của quốc gia |
| Kiểm thử | Test với chuỗi mong đợi cụ thể cho `vi` và `en`, vì kết quả định dạng của JDK (dữ liệu CLDR) có thể thay đổi giữa các phiên bản Java |

### 7.2. Tìm kiếm tiếng Việt

- Người dùng thường gõ **không dấu** («Da Nang», «Ha Noi»). Tìm điểm đến khớp cả có dấu lẫn không dấu và cả hai ngôn ngữ.
- Cách làm: extension `unaccent` và `pg_trgm`; cột `name_search` (chữ thường, bỏ dấu, chuẩn hoá `đ`→`d`) cho **cả hai bản dịch**, chỉ mục trigram; so khớp tên đã chuẩn hoá của đầu vào.
- Phạm vi: tìm theo tên khu vực/địa danh. Tìm toàn văn trong mô tả listing do Host nhập (một ngôn ngữ) **không nằm trong nền** (YAGNI); nếu cần sau này, dùng cấu hình tìm kiếm văn bản phù hợp và bỏ dấu.
- Có test: «Đà Nẵng», «Da Nang», «da nang», «ĐÀ NẴNG», «Danang» đều ra cùng kết quả (nếu phép khớp cho phép) hoặc ghi rõ phạm vi khớp.

### 7.3. Quy tắc chữ hoa/thường và so sánh

- Chuẩn hoá kỹ thuật (email, mã) dùng `toLowerCase(Locale.ROOT)`; không dùng phiên bản không tham số (lỗi theo ngôn ngữ máy, ví dụ tiếng Thổ Nhĩ Kỳ).
- So sánh văn bản hiển thị cho người dùng (sắp xếp, tìm) dùng `Collator` hoặc cột đã chuẩn hoá, không `compareTo` thô.

---

## 8. Tệp xuất và hoá đơn

| Loại | Quy định |
|---|---|
| CSV payout (đưa cho ngân hàng, đọc bằng máy) | **Trung tính ngôn ngữ**: tiêu đề tiếng Anh cố định, ngày ISO 8601, số dùng dấu chấm thập phân, không dấu phân cách hàng nghìn |
| CSV báo cáo cho người xem | Tiêu đề theo ngôn ngữ người yêu cầu; **giá trị vẫn thô** (số, ISO) để mở được bằng bảng tính; mã hoá UTF-8 có BOM nếu cần mở đúng chữ có dấu trong Excel |
| Hoá đơn VAT | Ngôn ngữ theo `CountryConfig.invoice_locale` (Việt Nam: tiếng Việt, có thể song ngữ); số liệu và định dạng theo quy định của quốc gia (giá trị mẫu, cần xác nhận pháp lý) |
| Biên nhận cho Guest | Theo ngôn ngữ ưa thích của người nhận |

---

## 9. Quy trình và kiểm soát chất lượng

- Thêm khoá thì thêm **cả `vi` và `en`** trong cùng PR; khoá không đủ hai ngôn ngữ thì CI đỏ.
- **Bản tiếng Anh dùng làm tham chiếu cho khoá**; không dùng văn bản làm khoá.
- Quy tắc ArchUnit: cấm `Locale.getDefault()`, `String.format` không có `Locale`, `toLowerCase()`/`toUpperCase()` không tham số, `new SimpleDateFormat` (dùng `java.time`).
- Chỉ số `i18n_missing_key` và `i18n_missing_translation` phải bằng 0 trong luồng E2E.
- Không dịch tên riêng, tên thương hiệu, mã đặt phòng, địa chỉ do người dùng nhập.

---

## 10. Kiểm thử

| Kiểm thử | Nội dung |
|---|---|
| Xác định ngôn ngữ | `Accept-Language` (`vi-VN`, `en-GB`, `fr`, `*`, chuỗi hỏng, nhiều giá trị có trọng số), `lang` ưu tiên hơn header, hồ sơ người dùng, mặc định |
| Gói thông điệp | Hai ngôn ngữ có **cùng tập khoá và cùng tham số** (so khớp `{n}`) |
| Email | Mỗi mẫu dựng được ở cả hai ngôn ngữ; không còn khoá thô; liên kết có đúng tiền tố ngôn ngữ; dữ liệu người dùng được thoát |
| Ngoài ngữ cảnh yêu cầu | Listener/job gửi email theo **ngôn ngữ người nhận**, không theo luồng hiện tại (test chạy khi `LocaleContextHolder` đặt ngôn ngữ khác) |
| Danh mục | Mọi dòng đang hoạt động có đủ bản dịch; thiếu bản dịch thì rơi về `vi` và ghi chỉ số |
| Định dạng | `MoneyFormatter`, `DateFormatter` cho VND/USD, `vi`/`en`, qua mốc đổi ngày theo múi giờ listing |
| Tìm kiếm | Có dấu, không dấu, hoa/thường, hai ngôn ngữ |
| Unicode | Đi vòng DB và API với chữ có dấu tổ hợp và dựng sẵn (chuẩn hoá về NFC), emoji, độ dài tính theo ký tự |
| Che thông tin liên hệ | Văn bản tiếng Việt và số điện thoại Việt Nam |
| Header | `Content-Language` và `Vary: Accept-Language` có mặt ở phản hồi phụ thuộc ngôn ngữ |
| Quy tắc kiến trúc | ArchUnit mục 9 |

---

## 11. Bộ câu hỏi chuẩn hóa & Checklist kiểm tra PR (i18n)

### 11.1. Bộ câu hỏi chuẩn hóa thiết kế i18n Backend

| # | Câu hỏi thiết kế | Chuẩn quy định & Hướng dẫn chi tiết | Ví dụ minh họa |
|---|---|---|---|
| **1** | **Backend có trả chữ đã dịch mà frontend dịch được?** | **Không nên.** Nếu là UI text cố định, lỗi hoặc trạng thái, backend **chỉ trả mã (`code`) và tham số (`params`)**, để frontend tự dịch theo từ điển i18n của client. Chỉ dịch ở backend cho các nội dung frontend không render được (email, xuất file PDF/hoá đơn, bảng dịch danh mục). | ❌ `{ "message": "Đặt phòng thành công" }`<br>✅ `{ "code": "booking.confirmed", "bookingId": "123" }` |
| **2** | **Mọi nơi nhận `Locale` tường minh?** | **Đúng.** Cấm tuyệt đối `Locale.getDefault()` vì phụ thuộc môi trường máy chủ. Trong background job, async thread hoặc event listener, cấm phụ thuộc `LocaleContextHolder` (phải lấy `Locale` tường minh từ `account.preferred_locale` của người nhận). | ❌ `String.format("Hello %s", name)`<br>✅ `String.format(locale, "Hello %s", name)` |
| **3** | **Message key mới có đủ `vi` và `en`, cùng parameters?** | **Bắt buộc.** Mọi key trong `messages_vi.properties` và `messages_en.properties` phải có mặt đầy đủ ở cả hai file và khớp chính xác danh sách placeholder tham số `{0}`, `{1}` (hoặc `{bookingId}`). Thiếu key hoặc lệch placeholder làm CI đỏ. | ❌ `en`: `Booking {0} confirmed`<br>`vi`: `Đặt phòng thành công` *(thiếu `{0}`)*<br>✅ `vi`: `Đã xác nhận đặt phòng {0}` |
| **4** | **Danh mục mới có bảng bản dịch, đủ hai ngôn ngữ, fallback `vi`?** | **Đúng.** Áp dụng bảng bản dịch riêng (`amenity_translation`, `location_translation`, `cancellation_policy_translation`). Không bao giờ hard-code tên danh mục trong code Java. Khi thiếu bản dịch `en`, câu truy vấn `COALESCE` rơi về `vi` và ghi log cảnh báo. | `SELECT COALESCE(t.name, t_vi.name) FROM ...` |
| **5** | **Email/thông báo dùng ngôn ngữ người nhận; link có prefix ngôn ngữ; event không chứa translated text?** | **Đúng.** Domain event chỉ mang dữ liệu nghiệp vụ trung tính (`type`, `bookingId`), không mang translated text. Email dựng mẫu theo `preferredLocale` của người nhận. Mọi liên kết trong email tạo qua `LinkBuilder` có tiền tố ngôn ngữ (`/vi/...`, `/en/...`). | ❌ Event: `{ "msg": "Đã thanh toán" }`<br>✅ Event: `{ "type": "BOOKING_PAID", "bookingId": "123" }` |
| **6** | **Format số/tiền/ngày qua formatter chung; timezone theo listing?** | **Đúng.** Phân biệt rõ 3 lớp:<br>1. *Instant / transaction timestamp:* UTC ISO 8601 (`2026-10-07T08:30:00Z`).<br>2. *Check-in / check-out / quy tắc lưu trú:* `LocalDate` theo múi giờ IANA của listing.<br>3. *Display số/tiền/ngày giờ:* Dùng `MoneyFormatter`, `DateFormatter` nhận `Locale` tường minh của người nhận. | Mốc check-in 14:00 tính theo múi giờ Homestay tại Đà Nẵng (`Asia/Ho_Chi_Minh`), không phụ thuộc múi giờ thiết bị Guest. |
| **7** | **User-generated content lưu nguyên văn, NFC, không dịch?** | **Đúng.** Không tự động dịch nội dung người dùng nhập (tiêu đề listing, mô tả, nội quy, tin nhắn, đánh giá). Chuẩn hoá Unicode NFC khi nhận ở API để đảm bảo tính nhất quán nhưng giữ nguyên ý nghĩa nội dung. Listing lưu kèm `content_language` để frontend hiển thị nhãn "Ngôn ngữ gốc". | Lưu nguyên văn tiếng Việt có dấu dạng dựng sẵn NFC. |
| **8** | **Response phụ thuộc ngôn ngữ có `Content-Language` và `Vary`?** | **Đúng.** Khi response thực sự thay đổi theo locale (danh mục tiện nghi, vị trí, chính sách huỷ), backend trả header `Content-Language: vi` (hoặc `en`) và `Vary: Accept-Language`. Điều này đảm bảo HTTP/CDN cache và Next.js server cache tách biệt đúng dữ liệu. | `Content-Language: vi`<br>`Vary: Accept-Language` |
| **9** | **File export đúng loại?** | **Đúng.** Tách biệt:<br>- *Machine-readable (CSV payout ngân hàng, đối soát):* Key/Header tiếng Anh cố định, ngày ISO 8601, số chấm thập phân.<br>- *Human-readable (Báo cáo tổng hợp, hoá đơn VAT):* Header/Label theo locale người dùng, số liệu định dạng theo quy định địa phương. | CSV payout: `recipient_iban,amount_cents,currency` |

---

### 11.2. Danh sách kiểm tra (Checklist) cho mỗi PR Backend

- [ ] **Dữ liệu trung tính:** Backend không trả chữ đã dịch cho những thành phần mà frontend có thể tự dịch (trả `code` + `params`).
- [ ] **Locale tường minh:** Mọi lời gọi định dạng, message bundle nhận `Locale` tường minh; không dùng `Locale.getDefault()`; không dựa vào `LocaleContextHolder` trong worker/job/async/event.
- [ ] **Đồng bộ Message Bundle:** Message key mới có đủ cả `messages_vi.properties` và `messages_en.properties`, tham số placeholder `{0}`/`{1}` khớp nhau 100%.
- [ ] **Bảng bản dịch danh mục:** Danh mục mới có bảng `*_translation`, nhập đủ 2 ngôn ngữ, có cơ chế `COALESCE` fallback về `vi`.
- [ ] **Sự kiện & Email:** Domain event không chứa translated text; Email gửi theo `preferredLocale` của người nhận; liên kết có prefix `/vi` hoặc `/en`.
- [ ] **Múi giờ & Định dạng:** Timestamp lưu UTC; ngày lưu trú theo timezone của listing; tiền/số format qua bộ formatter dùng chung.
- [ ] **Nội dung người dùng:** Lưu nguyên văn, chuẩn hoá Unicode NFC, không tự động dịch; listing có cờ `content_language`.
- [ ] **Header Cache:** Response phụ thuộc ngôn ngữ trả đủ `Content-Language` và `Vary: Accept-Language`.
- [ ] **Tệp xuất:** Tách rõ định dạng cho máy đọc (trung tính) và cho người đọc (theo ngôn ngữ yêu cầu).
