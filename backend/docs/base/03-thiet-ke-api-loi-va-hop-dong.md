# Thiết kế API, xử lý lỗi và hợp đồng với frontend

API là hợp đồng giữa backend và hai ứng dụng frontend. Hợp đồng này phải **nhất quán, ổn định và chống lạm dụng**. Phần frontend tương ứng nằm ở `frontend/05-ket-noi-api-du-lieu-va-trang-thai.md`; mục 9 của file này trả lời các điều frontend cần chốt.

---

## 1. Nguyên tắc REST áp dụng

| Nguyên tắc | Cách làm |
|---|---|
| Tài nguyên là danh từ số nhiều | `/listings`, `/bookings`, `/bookings/{id}/payments` |
| Phương thức đúng ngữ nghĩa | `GET` đọc (an toàn, không đổi trạng thái), `POST` tạo hoặc hành động, `PUT` thay thế toàn bộ, `PATCH` cập nhật một phần, `DELETE` xoá |
| Chuyển trạng thái là hành động có tên | `POST /bookings/{id}/cancel`, `/accept`, `/reject`; không dùng `PATCH {status: "CANCELLED"}` vì trạng thái do máy trạng thái quyết định |
| GET không đổi trạng thái | Không bao giờ; cũng không có tác dụng phụ nghiệp vụ |
| Không tiết lộ cấu trúc nội bộ | Định danh là UUID; không dùng số tuần tự cho tài nguyên người dùng |
| Phản hồi nhất quán | Cùng một loại đối tượng luôn có cùng dạng, cùng tên trường |

### Mã trạng thái HTTP

| Mã | Dùng khi |
|---|---|
| 200 | Thành công có nội dung |
| 201 | Tạo thành công; kèm `Location` |
| 202 | Đã nhận, xử lý bất đồng bộ (ví dụ xuất báo cáo) |
| 204 | Thành công không nội dung |
| 400 | Yêu cầu sai cú pháp, JSON hỏng, trường lạ, kiểu sai |
| 401 | Chưa xác thực hoặc phiên hết hạn |
| 403 | Đã xác thực nhưng không có quyền **thực hiện hành động** |
| 404 | Không tìm thấy, **hoặc không thuộc quyền xem của người gọi** (không phân biệt, để tránh dò tìm) |
| 409 | Xung đột trạng thái hoặc tài nguyên (hết chỗ, phiên bản cũ, đã tồn tại) |
| 412 | Điều kiện tiên quyết `If-Match` không khớp |
| 413 | Nội dung quá lớn |
| 415 | Kiểu nội dung không hỗ trợ |
| 422 | Cú pháp đúng nhưng vi phạm quy tắc kiểm tra dữ liệu hoặc nghiệp vụ |
| 429 | Vượt giới hạn tốc độ; kèm `Retry-After` |
| 500 | Lỗi không lường trước (không lộ chi tiết) |
| 503 | Dịch vụ tạm thời không khả dụng (hết thời gian chờ DB, cổng ngoài lỗi) |

Phân biệt 400 và 422: 400 cho lỗi cấu trúc yêu cầu; 422 cho lỗi giá trị/quy tắc (theo từng field). Giữ một cách dùng nhất quán trong toàn hệ thống.

---

## 2. Cấu trúc đường dẫn và Danh mục Endpoint Giai đoạn 1 (S01–S13)

| Nhóm | Tiền tố | Xác thực | Ghi chú |
|---|---|---|---|
| Công khai | `/api/v1/public/**` (hoặc alias `/api/v1/**` cho search/listings/config) | Không | Tìm kiếm, chi tiết listing, hồ sơ Host, danh mục, chính sách huỷ, trang tĩnh; có giới hạn tốc độ theo IP |
| Tài khoản & Xác thực | `/api/v1/auth/**` | Không (trừ `/logout`) | Đăng ký, xác minh email, đăng nhập, quên mật khẩu |
| Người dùng cá nhân | `/api/v1/me/**` | Phiên User (`GUEST`/`HOST`) | Hồ sơ, cài đặt, đổi mật khẩu, bật chế độ Host, KYC Guest |
| Host quản trị listing & lịch | `/api/v1/host/**` | Phiên User (cần cờ `isHost` / `HOST`) | Hồ sơ xác minh Host, tạo & sửa listing nháp, lịch, bảng giá |
| Nhân sự & Back-office | `/api/v1/admin/**` (hoặc `/api/v1/staff/**`) | Phiên Staff (`ADMIN`, `SUPPORT`, `ACCOUNTANT`) | Đăng nhập quản trị, quản lý nhân sự, duyệt danh tính, duyệt listing |
| Tệp đính kèm | `/api/v1/uploads/**` | Phiên đăng nhập | Luồng xin URL ký và hoàn tất upload |
| Khoá xử lý (Soft Lock) | `/api/v1/locks/**` | Phiên Staff | Khoá tạm tài nguyên khi duyệt (A03, A04) |
| Webhook | `/api/v1/webhooks/**` | Chữ ký, không phiên, không CSRF | Cổng thanh toán (giai đoạn sau) |
| Quản trị kỹ thuật | Cổng riêng (ví dụ 8081) | Chỉ nội bộ | Actuator; **không** được frontend rewrite tới |

### 2.1 Bảng chi tiết Endpoint Giai đoạn 1 (13 Slices)

| Slice | Phương thức & Đường dẫn | Mục đích nghiệp vụ | Mã trạng thái chính |
|---|---|---|---|
| **S01** | `POST /api/v1/auth/register` | Đăng ký tài khoản (chống lộ email tồn tại [O1]) | 201 `{emailMasked, resendAvailableIn}` · 409 · 422 · 429 |
| **S01** | `POST /api/v1/auth/verify-email` | Xác minh email bằng token (dùng 1 lần) | 200 `{result: 'VERIFIED'}` · 400 · 410 |
| **S01** | `POST /api/v1/auth/resend-verification` | Gửi lại email xác minh (cooldown 60s) | 204 · 429 `{retryAfterSec}` |
| **S01** | `POST /api/v1/auth/login` | Đăng nhập Guest/Host (đặt cookie `SESSION`) | 200 `User` · 401 · 403 `auth.unverified_email` · 423 |
| **S01** | `POST /api/v1/auth/logout` | Đăng xuất (huỷ phiên + xoá cookie) | 204 |
| **S01** | `POST /api/v1/auth/forgot-password` | Yêu cầu đặt lại mật khẩu (phản hồi trung tính) | 202 |
| **S01** | `GET /api/v1/auth/reset-password/validate?token=` | Kiểm tra hiệu lực token đặt lại mật khẩu | 200 `{valid, reason?}` |
| **S01** | `POST /api/v1/auth/reset-password` | Đặt lại mật khẩu mới | 204 · 410 (token hết hạn/đã dùng) |
| **S01/S02** | `GET /api/v1/me` | Nạp thông tin phiên người dùng hiện tại | 200 `User` · 401 |
| **S02** | `PATCH /api/v1/me` | Cập nhật hồ sơ (họ tên, phone, bio, ngôn ngữ, tiền tệ) | 200 `User` · 422 |
| **S02** | `POST /api/v1/me/avatar` · `DELETE /api/v1/me/avatar` | Cập nhật / xoá ảnh đại diện | 200 / 204 |
| **S02** | `POST /api/v1/me/password` | Đổi mật khẩu (huỷ phiên khác) | 204 · 422 `auth.invalid_credentials` |
| **S02** | `POST /api/v1/me/host-mode` | Bật chế độ Host (chuyển đổi 1 chiều [A11]) | 200 `{isHost: true, hostVerification}` |
| **S02/S04** | `GET /api/v1/me/verification` · `PUT` · `POST …/submit` | Nộp hồ sơ xác minh danh tính Guest (C03) | 200 · 422 |
| **S03** | `POST /api/v1/admin/auth/login` | Đăng nhập nhân sự (chỉ cho phép `STAFF`) | 200 `StaffUser` · 401 · 403 |
| **S03** | `GET /api/v1/admin/staff` | Danh sách nhân sự & phân quyền (A18) | 200 `Paged<StaffDTO>` |
| **S03** | `POST /api/v1/admin/staff` | Tạo nhân sự mới + gửi email mời [A12b] | 201 `StaffDTO` · 409 · 422 |
| **S03** | `PATCH /api/v1/admin/staff/{id}/role` | Đổi vai trò (`ADMIN`, `SUPPORT`, `ACCOUNTANT`) | 200 · 403 `staff.last_admin` |
| **S03** | `POST /api/v1/admin/staff/{id}/lock` · `/unlock` | Khoá / mở khoá tài khoản nhân sự kèm lý do | 200 · 409 `staff.self_action` |
| **S03** | `GET /api/v1/admin/staff/{id}/activity` | Lịch sử thao tác nhân sự (ActivityLog) | 200 `Paged<ActivityLogDTO>` |
| **S04** | `GET /api/v1/host/verification` | Xem hồ sơ xác minh Host (H02) | 200 `HostVerificationDTO` |
| **S04** | `PUT /api/v1/host/verification` | Lưu nháp hồ sơ xác minh Host | 200 `HostVerificationDTO` |
| **S04** | `POST /api/v1/host/verification/submit` | Nộp hồ sơ duyệt Host | 200 `{status: 'PENDING'}` · 422 |
| **S04** | `GET /api/v1/admin/identity-reviews` | Hàng đợi hồ sơ KYC chờ duyệt (A03) | 200 `Paged<IdentityReviewSummaryDTO>` |
| **S04** | `POST /api/v1/admin/identity-reviews/{id}/documents/{attId}/view` | Lấy URL ký xem giấy tờ KYC (sống 120s, audit log) | 200 `{signedUrl, expiresAt}` |
| **S04** | `POST /api/v1/admin/identity-reviews/{id}/decision` | Phê duyệt hoặc từ chối hồ sơ KYC | 200 `{status}` · 422 |
| **S05** | `GET /api/v1/host/listings` | Danh sách listing của Host (H03) | 200 `Paged<HostListingSummaryDTO>` |
| **S05** | `POST /api/v1/host/listings` | Khởi tạo listing nháp (Bước 1: thông tin cơ bản) | 201 `{id, version}` · 403 `auth.unverified_host` |
| **S05** | `GET /api/v1/host/listings/{id}` | Nạp toàn bộ dữ liệu listing nháp (8 bước) | 200 `HostListingDetailDTO` · 404 |
| **S05** | `PATCH /api/v1/host/listings/{id}` | Lưu từng bước wizard (kèm `version` kiểm tra 409) | 200 `{id, version}` · 409 `common.version_conflict` |
| **S05** | `DELETE /api/v1/host/listings/{id}` | Xoá listing nháp | 204 · 400 |
| **S05** | `PUT /api/v1/host/listings/{id}/photos/order` | Sắp xếp thứ tự ảnh | 200 |
| **S05** | `POST /api/v1/host/listings/{id}/photos` | Gắn ảnh đã upload vào listing (tối thiểu 5, tối đa 30) | 201 `ListingPhotoDTO` |
| **S05** | `PATCH /api/v1/host/listings/{id}/photos/{pid}` · `DELETE …` | Sửa chú thích / xoá ảnh | 200 / 204 |
| **S05/S11** | `GET /api/v1/geocode` · `GET /api/v1/geocode/reverse` | Gợi ý địa chỉ và toạ độ (proxy giấu token Mapbox) | 200 `GeocodeDTO` |
| **S06** | `GET /api/v1/host/listings/{id}/pricing-preview` | Bảng giá xem trước theo số đêm và số khách (H04 B6) | 200 `PricingPreviewDTO` |
| **S07** | `GET /api/v1/host/listings/{id}/readiness` | Checklist điều kiện gửi duyệt (H04 B8) | 200 `ReadinessDTO` |
| **S07** | `POST /api/v1/host/listings/{id}/legal-docs` | Gắn giấy tờ pháp lý listing | 201 |
| **S07** | `POST /api/v1/host/listings/{id}/submit` | Gửi duyệt listing lần đầu | 200 `{status: 'PENDING_REVIEW'}` · 422 `{violations}` |
| **S07** | `GET /api/v1/host/listings/{id}/review-status` | Xem tiến độ và lý do yêu cầu sửa listing (H05) | 200 `ReviewStatusDTO` |
| **S08** | `GET /api/v1/admin/listing-reviews` | Hàng đợi listing chờ Admin duyệt (A04) | 200 `Paged<ListingReviewSummaryDTO>` |
| **S08** | `GET /api/v1/admin/listing-reviews/{id}` | Chi tiết listing thẩm định (thấy toạ độ/địa chỉ chính xác) | 200 `AdminListingReviewDetailDTO` |
| **S08** | `POST /api/v1/admin/listing-reviews/{id}/documents/{attId}/view` | URL ký xem giấy tờ pháp lý listing (sống 120s, audit log) | 200 `{signedUrl, expiresAt}` |
| **S08** | `POST /api/v1/admin/listing-reviews/{id}/decision` | Quyết định duyệt listing (`APPROVE`/`NEEDS_CHANGES`/`REJECT`) | 200 `{status}` · 422 |
| **S08** | `GET /api/v1/admin/listings/{id}/preview` | Xem trước giao diện listing công khai (P03) | 200 `ListingDetailDTO` |
| **S09** | `GET /api/v1/host/listings/{id}/calendar?from=&to=` | Dữ liệu lịch listing (H06) | 200 `CalendarDTO` |
| **S09** | `POST /api/v1/host/listings/{id}/calendar/blocks` | Chặn khoảng ngày (All-or-Nothing) | 200 · 409 `{conflicts: [dates]}` |
| **S09** | `DELETE /api/v1/host/listings/{id}/calendar/blocks` | Mở chặn khoảng ngày | 204 · 409 |
| **S09** | `PATCH /api/v1/host/listings/{id}/stay-rules` | Cập nhật quy tắc lưu trú nhanh trên lịch | 200 `StayRulesDTO` |
| **S10** | `GET /api/v1/host/listings/{id}/pricing-rules` | Danh sách quy tắc giá mùa / lễ / đặc biệt (H08) | 200 `List<PriceRuleDTO>` |
| **S10** | `POST /api/v1/host/listings/{id}/pricing-rules` | Tạo quy tắc giá (chặn chồng ngày cùng nhóm ưu tiên [A6]) | 201 `PriceRuleDTO` · 409 `{conflictingRuleIds}` |
| **S10** | `PATCH /api/v1/host/listings/{id}/pricing-rules/{rid}` · `DELETE …` | Cập nhật / xoá quy tắc giá | 200 / 204 |
| **S10** | `PUT /api/v1/host/listings/{id}/pricing-rules/weekend` | Cập nhật giá cuối tuần | 200 `PriceRuleDTO` |
| **S10** | `GET /api/v1/host/listings/{id}/price-calendar?from=&to=` | Lịch tính giá từng ngày theo PricingEngine | 200 `PriceCalendarDTO` |
| **S11** | `GET /api/v1/public/search/suggest?q=` | Gợi ý tìm kiếm điểm đến và listing (P01 SearchBar) | 200 `List<SuggestionDTO>` |
| **S11** | `GET /api/v1/public/search/listings` | Tìm kiếm listing có lọc, phân trang, toạ độ marker (P02) | 200 `SearchResponseDTO` |
| **S11** | `GET /api/v1/public/search/count` | Đếm nhanh số kết quả khi tương tác bộ lọc | 200 `{count: number}` |
| **S12** | `GET /api/v1/public/listings/{id}` | Chi tiết listing công khai (P03) (toạ độ/địa chỉ đã làm mờ) | 200 `ListingDetailDTO` · 404 |
| **S12** | `GET /api/v1/public/listings/{id}/availability?from=&to=` | Lịch trống & quy tắc lưu trú cho Guest | 200 `AvailabilityDTO` |
| **S12** | `GET /api/v1/public/listings/{id}/quote` | Báo giá chi tiết đã gồm phí sàn & VAT (BR-PRC-06) | 200 `QuoteDTO` · 422 `{violations}` |
| **S12** | `GET /api/v1/public/hosts/{id}` | Hồ sơ công khai của Host (P04) (ẩn email/SĐT/giấy tờ) | 200 `PublicHostProfileDTO` · 404 |
| **S12** | `GET /api/v1/public/cancellation-policies` | Danh mục chính sách huỷ & các mốc hoàn tiền (P05) | 200 `List<CancellationPolicyDTO>` |
| **S13/Base**| `GET /api/v1/config/public` | Cấu hình tham số toàn cục (flags, limits, currencies) | 200 `PublicConfigDTO` |
| **Base** | `GET /api/v1/locations` | Danh mục quốc gia, tỉnh thành, khu vực | 200 `List<LocationDTO>` |
| **Base** | `GET /api/v1/amenities` | Danh mục tiện nghi theo nhóm | 200 `List<AmenityDTO>` |
| **Base** | `POST /api/v1/uploads` | Bước 1 luồng upload: xin URL ký MinIO | 201 `{attachmentId, uploadUrl, expiresAt}` |
| **Base** | `POST /api/v1/uploads/{id}/complete` | Bước 3 luồng upload: xác thực tệp đã tải | 200 `{status: 'UPLOADED' \| 'REJECTED'}` |
| **Base** | `DELETE /api/v1/uploads/{id}` | Huỷ tệp mồ côi | 204 |
| **Base** | `POST /api/v1/locks/{type}/{id}` | Soft lock hồ sơ duyệt danh tính / listing (A03/A04) | 200 `{heldBy, expiresAt}` · 409 |
| **Base** | `PUT /api/v1/locks/{type}/{id}/heartbeat` · `DELETE …` | Gia hạn lock / Nhả lock | 200 / 204 |

---

## 3. Phiên bản API

| Quy tắc | Chi tiết |
|---|---|
| Cách đánh phiên bản | Trong đường dẫn: `/api/v1/...` |
| Thay đổi cho phép trong cùng phiên bản (không phá vỡ) | Thêm endpoint, thêm trường tuỳ chọn trong **response**, thêm giá trị enum mà client đã được dặn là phải chịu được giá trị lạ (xem dưới), thêm mã lỗi mới |
| Thay đổi phá vỡ (phải lên `v2`) | Bỏ hoặc đổi tên trường/endpoint, đổi kiểu hoặc ý nghĩa trường, siết chặt kiểm tra, đổi dạng lỗi, đổi ngữ nghĩa idempotency |
| Quy trình phá vỡ | Phát hành `v2` song song; đánh dấu `v1` lỗi thời bằng header `Deprecation` và `Sunset`; thời gian chuyển đổi do dự án quy định; tài liệu ở OpenAPI |
| Kiểm tra tự động | CI so sánh `openapi.json` với bản trước (công cụ như oasdiff) và chặn thay đổi phá vỡ trong `v1` |
| Enum | Frontend phải xử lý giá trị enum chưa biết một cách an toàn (hiển thị mặc định), để backend thêm giá trị mới không phá vỡ |
| Không có phiên bản trong header hay nội dung | Một cách duy nhất để tránh nhầm lẫn |

---

## 4. Quy ước yêu cầu, phản hồi và Hợp đồng DTO cốt lõi

| Mục | Quy ước |
|---|---|
| Định dạng | `application/json; charset=utf-8`; tên trường `camelCase` |
| Định danh | UUID dạng chuỗi |
| Thời điểm | ISO 8601 UTC (`2026-10-05T08:30:00Z`) |
| Ngày lưu trú | `LocalDate` dạng `YYYY-MM-DD` (không có múi giờ); kèm `timeZone` IANA của listing khi cần |
| Enum | Chuỗi in hoa `SNAKE_CASE` (`PENDING_PAYMENT`, `NEEDS_CHANGES`) |
| Trường thiếu so với null | Tài liệu hoá rõ; ưu tiên không trả trường không có giá trị thay vì `null` lẫn lộn |
| Trường lạ trong yêu cầu | **Từ chối** (400) |
| Ngôn ngữ | Đọc `Accept-Language` (`vi`, `en`); thông điệp lỗi chuẩn hoá theo `code` để frontend dịch |
| Giới hạn kích thước | Thân yêu cầu JSON tối đa 1 MB (cấu hình) |

### 4.1 Kiểu Tiền tệ (`Money`) & Quy đổi hiển thị (S13)
```json
{
  "amount": 1500000,
  "currency": "VND",
  "formatted": "1.500.000 ₫",
  "converted": {
    "original": { "amount": 6000, "currency": "USD", "formatted": "$60.00" },
    "rate": 25000.0,
    "rateDate": "2026-10-07"
  }
}
```
- `amount`: Số nguyên đơn vị nhỏ nhất (VND: đồng, USD: cents). **Frontend không bao giờ tự tính tiền**.
- `formatted`: Chuỗi định dạng hiển thị sẵn theo ngôn ngữ yêu cầu.
- `converted`: Trả về khi người dùng chọn tiền tệ hiển thị khác tiền tệ gốc của chỗ ở (S13).

### 4.2 Thông tin phiên người dùng (`GET /api/v1/me`)
```json
{
  "id": "e3f2b1a0-...",
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "emailVerified": true,
  "phone": "+84901234567",
  "avatarUrl": "https://storage.local/public/avatars/user-1.webp",
  "bio": "Yêu thích du lịch homestay",
  "language": "vi",
  "displayCurrency": "VND",
  "isHost": true,
  "staffRole": null,
  "hostVerification": "APPROVED",
  "guestVerification": "NONE",
  "status": "ACTIVE",
  "createdAt": "2026-01-15T09:00:00Z",
  "authorities": ["listing:create", "listing:edit", "booking:create"]
}
```

### 4.3 Bảo vệ quyền riêng tư địa chỉ & Toạ độ bản đồ (BR-SRC-04)
- **Công khai (P01, P02, P03, P04):** Tuyệt đối **không** trả `exactAddress`, `exactLat`, `exactLng`. Trả đối tượng `publicArea`:
```json
{
  "publicArea": {
    "centerLat": 21.0285,
    "centerLng": 105.8542,
    "radiusM": 500,
    "label": "Quận Hoàn Kiếm, Hà Nội"
  }
}
```
- **Chủ sở hữu (Host) & Admin (H04, A04):** Nhận đầy đủ `exactAddress`, `exactLat`, `exactLng` để quản lý và kiểm duyệt.

### 4.4 Cấu hình công khai toàn cục (`GET /api/v1/config/public`)
```json
{
  "minPhotos": 5,
  "maxPhotos": 30,
  "maxUploadMb": 10,
  "passwordPolicy": { "minLength": 8, "requireLetters": true, "requireNumbers": true },
  "resendCooldownSec": 60,
  "weekendNights": ["FRI", "SAT"],
  "bookingEnabled": false,
  "reviewsEnabled": false,
  "mapboxEnabled": true,
  "currencySwitchEnabled": true,
  "searchPageSize": 24,
  "supportedCurrencies": [
    { "code": "VND", "symbol": "₫", "name": "Việt Nam Đồng", "decimals": 0 },
    { "code": "USD", "symbol": "$", "name": "US Dollar", "decimals": 2 }
  ]
}
```

---

## 5. Phân trang, lọc, sắp xếp

| Mục | Quy tắc |
|---|---|
| Phân trang | **Cursor**: tham số `limit` (mặc định 20, tối đa 50; back-office tối đa 100) và `cursor` (chuỗi **mờ**, do server tạo); phản hồi `{ "items": [...], "nextCursor": "...", "total": 120 }` |
| Ổn định | Sắp xếp luôn có khoá phụ duy nhất (`id`) để cursor không lặp hoặc sót |
| Lọc & Sắp xếp | Tham số khai báo rõ ràng; giá trị `sort` thuộc enum cho phép (`RELEVANCE`, `PRICE_ASC`, `PRICE_DESC`, `NEWEST`) |

---

## 6. Điều khiển đồng thời và Soft Locking

- **Khoá lạc quan (Optimistic Lock):** Listing nháp, cài đặt tài khoản gửi trường `version`. Xung đột trả **409** với mã `common.version_conflict`.
- **Soft Lock hồ sơ thẩm định (A03, A04):** Tránh 2 Admin duyệt trùng một hồ sơ:
  - `POST /api/v1/locks/{type}/{id}`: Giữ lock (thời hạn 5 phút [A13]).
  - Phản hồi khi bị người khác giữ: **409** kèm `{ heldBy: { id, name }, since, expiresAt }`.
  - `PUT /api/v1/locks/{type}/{id}/heartbeat`: Duy trì lock thêm 5 phút khi tab đang mở.
  - `DELETE /api/v1/locks/{type}/{id}`: Nhả lock khi thoát hoặc hoàn tất phê duyệt.

---

## 7. Idempotency ở API

Header `Idempotency-Key`: chuỗi 16 đến 64 ký tự (UUID khuyến nghị).
- Bắt buộc với: Đặt phòng, giữ chỗ, thanh toán, huỷ, nộp hồ sơ KYC, duyệt/từ chối nhân sự, hoàn tiền.
- Bị trùng lặp: Trả phản hồi đã lưu kèm header `Idempotent-Replayed: true`. Đang xử lý: 409 `idempotency.in_progress`. Khác payload: 422 `idempotency.key_reused`.

---

## 8. Mô hình lỗi và Danh mục mã lỗi (`ErrorCode`)

Mọi lỗi (4xx, 5xx) trả chuẩn **Problem Details (RFC 9457)**:
```json
{
  "type": "about:blank",
  "title": "Unprocessable Entity",
  "status": 422,
  "code": "listing.readiness_failed",
  "traceId": "4f8c2c7e9b3a4d1e",
  "errors": [
    { "field": "photos", "code": "listing.min_photos_required", "params": { "min": 5, "current": 3 } }
  ],
  "retryAfterSeconds": null
}
```

### 8.1 Danh mục mã lỗi chuẩn hoá (Đối chiếu 13 Slices Frontend)

| Nhóm | Mã lỗi (`code`) | Mã HTTP | Ý nghĩa & Phản hồi FE |
|---|---|---|---|
| **Chung** | `common.validation_failed` | 422 | Vi phạm kiểm tra dữ liệu đầu vào |
| | `common.version_conflict` | 409 | Dữ liệu đã bị thay đổi ở tab/thiết bị khác, cần tải lại |
| | `common.rate_limited` | 429 | Thao tác quá nhanh, kèm `Retry-After` |
| | `common.not_found` | 404 | Không tìm thấy hoặc không thuộc quyền xem |
| | `common.bad_request` | 400 | Cú pháp JSON hỏng hoặc trường lạ |
| | `common.internal` | 500 | Lỗi máy chủ không mong muốn (không lộ stack trace) |
| **Xác thực & Tài khoản (S01, S02)** | `auth.unauthenticated` | 401 | Phiên chưa đăng nhập hoặc đã hết hạn |
| | `auth.forbidden` | 403 | Không đủ quyền thực hiện hành động |
| | `auth.invalid_credentials` | 401/422 | Sai email hoặc mật khẩu / sai mật khẩu hiện tại (`WRONG_CURRENT`) |
| | `auth.unverified_email` | 403 | Tài khoản chưa xác minh email (`EMAIL_UNVERIFIED`) |
| | `auth.unverified_host` | 403 | Tài khoản chưa được duyệt làm Host (`HOST_NOT_VERIFIED`) |
| | `auth.account_locked` | 423 | Tài khoản bị tạm khoá do nhập sai quá 5 lần (`lockedUntil`) |
| | `auth.token_expired` | 410 | Token xác minh hoặc đặt lại mật khẩu đã hết hạn |
| | `auth.token_invalid` | 400 | Token không hợp lệ hoặc đã sử dụng |
| **Nhân sự & RBAC (S03)** | `staff.last_admin` | 409 | Không thể hạ quyền hoặc khoá Admin duy nhất (`LAST_ADMIN`) |
| | `staff.self_action` | 409 | Không thể tự khoá hoặc đổi quyền chính mình (`SELF_ACTION`) |
| | `staff.forbidden_role` | 403 | Vai trò không được phép truy cập (`FORBIDDEN_ROLE`) |
| **Xác minh KYC & Listing (S04, S07, S08)** | `identity.already_submitted` | 409 | Đang có hồ sơ chờ duyệt |
| | `identity.locked_by_other` | 409 | Hồ sơ đang được Admin khác xử lý |
| | `listing.not_ready` | 422 | Listing chưa đủ điều kiện gửi duyệt (thiếu ảnh, vị trí, giá...) |
| | `listing.duplicate_address` | 409 | Địa chỉ hoặc toạ độ trùng với listing khác (`SAME_ADDRESS`) |
| **Lịch & Giá (S06, S09, S10, S12)** | `calendar.unavailable` | 409 | Ngày chọn đã có người đặt hoặc bị chặn |
| | `calendar.conflicts` | 409 | Xung đột chặn lịch, kèm danh sách `{conflicts: [dates]}` |
| | `pricing.rule_conflict` | 409 | Trùng khoảng ngày với quy tắc giá khác cùng bậc ưu tiên [A6] |
| | `pricing.min_nights_violation` | 422 | Chưa đạt số đêm tối thiểu (`MIN_NIGHTS`) |
| | `pricing.max_nights_violation` | 422 | Vượt quá số đêm tối đa (`MAX_NIGHTS`) |
| | `pricing.notice_hours_violation` | 422 | Không đáp ứng thời gian đặt trước tối thiểu (`NOTICE`) |
| | `pricing.capacity_exceeded` | 422 | Số lượng khách vượt sức chứa tối đa (`CAPACITY`) |
| **Tệp tin (Upload)** | `file.type_not_allowed` | 422 | Định dạng tệp không được hỗ trợ |
| | `file.too_large` | 422 | Kích thước tệp vượt giới hạn cho phép |
| | `file.invalid_content` | 422 | Nội dung tệp không khớp magic bytes |
| **Idempotency** | `idempotency.key_required` | 400 | Thiếu header Idempotency-Key bắt buộc |
| | `idempotency.in_progress` | 409 | Yêu cầu đang được xử lý, thử lại sau |
| | `idempotency.key_reused` | 422 | Khoá Idempotency bị tái sử dụng với payload khác |

---

## 9. Hợp đồng với frontend (Tổng hợp Đồng bộ Giai đoạn 1)

| Hạng mục frontend cần | Quyết định của backend |
|---|---|
| `openapi.json` đầy đủ, có mã lỗi | springdoc xuất `openapi.json` khi build; danh mục `ErrorCode` có trong tài liệu; `operationId` ổn định |
| Dạng lỗi | Problem Details RFC 9457 như mục 8 |
| Cookie phiên, cookie CSRF, header CSRF | Phiên: cookie `SESSION` (HttpOnly, `SameSite=Lax`, `Secure` ở môi trường thật). CSRF: cookie `XSRF-TOKEN`, header `X-XSRF-TOKEN` |
| Người dùng hiện tại | `GET /api/v1/me` trả đầy đủ hồ sơ, `isHost`, `staffRole`, `hostVerification`, `guestVerification`, `authorities` |
| Ẩn toạ độ công khai (BR-SRC-04) | Public API trả `publicArea` làm mờ; Owner và Admin nhận toạ độ và địa chỉ chính xác |
| `Idempotency-Key` | Header bắt buộc cho các thao tác đổi trạng thái quan trọng; cache phản hồi 24h |
| Phân trang cursor | `limit`, `cursor`, phản hồi `{items, nextCursor, total}` |
| Thời gian server | Mọi phản hồi liên quan giữ chỗ và kiểm duyệt có `serverTime` (UTC) và `expiresAt` (UTC); header `Date` luôn có |
| `Accept-Language`, `X-Request-Id` | Backend đọc cả hai; `X-Request-Id` được kiểm tra định dạng và gắn vào log MDC |
| `Money` & Quy đổi tỷ giá (S13) | Trả `amount` số nguyên đơn vị nhỏ nhất, `currency`, `formatted` và khối `converted` khi khác tiền tệ gốc |
| Giới hạn tốc độ | 429 kèm `Retry-After` |
| Đăng nhập, đăng xuất | Trình duyệt thực hiện qua `/api/v1/auth/*` hoặc `/api/v1/admin/auth/*` |


---

## 10. Cache HTTP

| Loại phản hồi | Header |
|---|---|
| Dữ liệu công khai ít đổi (nội dung listing, danh mục, chính sách huỷ) | `Cache-Control: public, max-age=60` kèm `ETag`; `Vary: Accept-Language` |
| Khả dụng, báo giá, giá | `Cache-Control: no-store` |
| Mọi phản hồi cần đăng nhập | `Cache-Control: no-store` (mặc định của Spring Security cho phản hồi đã xác thực) |
| Phản hồi lỗi | `no-store` |

---

## 11. OpenAPI

- Dùng springdoc-openapi 3.x; chú thích tối thiểu, ưu tiên suy ra từ kiểu và annotation kiểm tra.
- Khai báo: sơ đồ bảo mật (cookie phiên, CSRF), các mã lỗi cho từng endpoint, ví dụ mẫu, `operationId` ổn định (frontend sinh client theo tên này, đổi tên là thay đổi phá vỡ).
- `openapi.json` được xuất khi build và đưa vào CI; **Swagger UI chỉ ở profile `local`** và không được frontend rewrite tới.
- Mô tả không chứa dữ liệu thật hay bí mật.

---

## 12. Danh sách kiểm tra cho một endpoint mới

- [ ] Đường dẫn, phương thức, mã trạng thái đúng quy ước; hành động có tên; GET không đổi trạng thái.
- [ ] **Quy tắc truy cập khai báo** (`@PreAuthorize` hoặc công khai tường minh) và kiểm tra **đối tượng** (chủ sở hữu) ở `application`; test ma trận phân quyền biết endpoint này.
- [ ] Request DTO riêng, có kiểm tra, không chứa trường server quyết định; Response DTO riêng theo vai trò.
- [ ] Danh sách có phân trang cursor, `limit` tối đa, sắp xếp theo danh sách cho phép.
- [ ] Thao tác ghi tiền hoặc tạo booking có `Idempotency-Key` bắt buộc.
- [ ] Cập nhật tài nguyên chia sẻ có `version`/`If-Match`.
- [ ] Mã lỗi nghiệp vụ mới đã thêm vào `ErrorCode` và OpenAPI.
- [ ] Giới hạn tốc độ nếu là luồng nhạy cảm (đăng nhập, đặt, thanh toán, upload, tin nhắn, liên hệ).
- [ ] Audit log nếu là thao tác nhạy cảm.
- [ ] Header cache đúng; không `no-store` thì chắc chắn dữ liệu công khai.
- [ ] Có test: thành công, lỗi kiểm tra, không quyền, không thuộc quyền xem, trùng lặp (idempotency), đồng thời nếu liên quan.
- [ ] `openapi.json` đã cập nhật và không phá vỡ hợp đồng `v1`.
