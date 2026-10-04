# 04 · Screen Data – Giai đoạn 1

> Dữ liệu **có trên từng màn hình**: trường hiển thị/nhập, nguồn (thực thể trong `mo-hinh-thuc-the-va-luong-chinh.md`), bắt buộc, quy tắc, quyền xem, trạng thái (enum) và API FE cần.
> **Tên trường & endpoint là đề xuất** để FE và BE thống nhất hợp đồng; BE chốt lại khi thiết kế DB/API. Mọi mục đánh dấu `[A#]` là giả định ở `01-user-flow` / `03-ux-behavior`.
> Cột **Hiển thị cho** dùng: `Công khai` · `Chủ sở hữu` (người tạo dữ liệu) · `Admin` · `Chỉ BE` (không bao giờ trả về FE).

---

## 0. Hợp đồng dữ liệu dùng chung

### 0.1 Kiểu cơ sở
```ts
type Lang = 'vi' | 'en';
type CurrencyCode = string;               // ISO 4217: 'VND', 'USD'…
interface Money {                         // BE trả sẵn, FE không tự tính (G1)
  amount: number;                         // đơn vị nhỏ nhất của tiền tệ (VND: đồng)
  currency: CurrencyCode;
  formatted: string;                      // "1.200.000 ₫" theo ngôn ngữ yêu cầu
}
interface Paged<T> { items: T[]; total: number; nextCursor?: string }
interface ApiError {
  code: string;                           // 'VALIDATION' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'RATE_LIMITED' | 'LOCKED' | 'INTERNAL'
  message: string;                        // đã dịch theo Accept-Language
  fields?: { field: string; code: string; message: string }[];
  retryAfterSec?: number;                 // 429
  lockedUntil?: string;                   // ISO – đăng nhập tạm khoá
  conflicts?: unknown;                    // 409: danh sách ngày/đối tượng xung đột
}
```

### 0.2 Người dùng hiện tại – `GET /me`
| Trường | Kiểu | Nguồn | Ghi chú |
|---|---|---|---|
| id | string | User | |
| fullName | string | User | |
| email | string | User | |
| emailVerified | boolean | User | A2: false → không đăng nhập được, nhưng giữ cờ cho trang xác minh |
| phone | string? | User | |
| avatarUrl | string? | User/Attachment | URL công khai đã resize |
| bio | string? | User | [Assumption] ≤ 300 |
| language | `'vi'｜'en'` | User | |
| displayCurrency | CurrencyCode | User | S13 |
| isHost | boolean | User (cờ vai trò) | Đã bật chế độ Host |
| staffRole | `null｜'ADMIN'｜'SUPPORT'｜'ACCOUNTANT'` | User | Chỉ nhân sự |
| hostVerification | `'NONE'｜'PENDING'｜'APPROVED'｜'REJECTED'｜'EXPIRED'` | IdentityVerification (loại Host) | Quyết định có tạo listing được không |
| guestVerification | như trên | IdentityVerification (loại Guest) | |
| status | `'ACTIVE'｜'LOCKED'` | User | |
| createdAt | ISO | User | |

### 0.3 Tệp đính kèm – luồng tải lên (dùng ở H02, C03, H04)
```
POST /uploads            { purpose, fileName, mime, size }  → { attachmentId, uploadUrl, expiresAt }
PUT  {uploadUrl}         (nhị phân, trực tiếp vào kho riêng)
POST /uploads/:id/complete                                  → { status:'UPLOADED' | 'REJECTED', reason? }
DELETE /uploads/:id                                         (khi chưa gắn vào hồ sơ đã gửi)
```
| Trường Attachment | Ghi chú |
|---|---|
| id, purpose (`ID_FRONT`/`ID_BACK`/`ID_PASSPORT`/`OPERATING_RIGHT`/`LISTING_LEGAL`/`LISTING_PHOTO`/`AVATAR`), fileName, mime, size | |
| status | `UPLOADING`/`UPLOADED`/`REJECTED` (kèm lý do: sai định dạng, quá nặng, nhiễm mã độc) |
| viewUrl | **chỉ ảnh công khai** (listing, avatar). Giấy tờ nhạy cảm **không** có viewUrl; Admin xem qua API ghi log (mục S04) |

### 0.4 Danh mục dùng chung (seed/BE)
- `GET /locations?type=region&parent=` → Location {id, type: COUNTRY/REGION, name{vi,en}, parentId, centroid{lat,lng}, bbox, timezone, listingCount}.
- `GET /config/public` → các tham số FE cần: `minPhotos` (5), `maxPhotos` (30), `maxUploadMb` (10), `passwordPolicy`, `resendCooldownSec` (60), `weekendNights` theo quốc gia, `bookingEnabled`, `reviewsEnabled`, `mapboxEnabled`, `supportedCurrencies`, `searchPageSize` (24).
- `GET /amenities` → Amenity {id, key, name{vi,en}, category, icon}.
- `GET /cancellation-policies` → CancellationPolicy {id, key: FLEXIBLE/MODERATE/STRICT, name, summary, milestones[]} (milestone: {label, window, roomRefund, cleaningRefund, serviceFeeRefund}).

### 0.5 Máy trạng thái

**IdentityVerification**
```
NONE ──nộp──▶ PENDING ──Admin duyệt──▶ APPROVED ──giấy tờ hết hạn──▶ EXPIRED ──nộp lại──▶ PENDING
                  └──Admin từ chối (có lý do)──▶ REJECTED ──sửa & gửi lại──▶ PENDING
```
**Listing (BR-LST-01)**
```
DRAFT ──gửi duyệt──▶ PENDING_REVIEW ──duyệt──▶ ACTIVE ◀──▶ PAUSED (Host tạm ẩn)
                          ├─yêu cầu sửa──▶ NEEDS_CHANGES ──gửi lại──▶ PENDING_REVIEW
                          └─từ chối──────▶ REJECTED ─────gửi lại──▶ PENDING_REVIEW
ACTIVE/PAUSED ──Admin──▶ LOCKED
```
**Nhãn UI ↔ enum**: Nháp=`DRAFT` · Chờ duyệt=`PENDING_REVIEW` · Đang hiển thị=`ACTIVE` · Cần chỉnh sửa=`NEEDS_CHANGES` · Bị từ chối=`REJECTED` · Tạm ẩn=`PAUSED` · Bị khoá=`LOCKED`.

**Khoá xử lý hồ sơ (soft lock, A03/A04)**: `{ resourceId, heldBy:{id,name}, since, expiresAt }`; API `POST /locks/{type}/{id}` (nhận), `PUT …/heartbeat`, `DELETE …` (nhả); phản hồi 409 + `heldBy` khi người khác đang giữ.

### 0.6 Cờ tính năng FE (đọc từ `/config/public`)
| Cờ | Giai đoạn 1 | Tác dụng |
|---|---|---|
| `bookingEnabled` | **false** | CTA đặt phòng ở P03 disabled |
| `reviewsEnabled` | **false** | Ẩn lọc/sắp xếp theo đánh giá, khối đánh giá hiển thị "Chưa có đánh giá" |
| `mapboxEnabled` | true/false theo token | false → ẩn bản đồ, toạ độ nhập tay |
| `currencySwitchEnabled` | false → true từ S13 | Bộ chọn tiền tệ |
| `icalEnabled` | false | Chừa chỗ H07 |

---

## S01 · Đăng ký, xác minh email, đăng nhập, quên mật khẩu

### Dữ liệu nhập / hiển thị
| Màn | Trường | Kiểu | Nguồn | Bắt buộc | Quy tắc | Hiển thị cho |
|---|---|---|---|---|---|---|
| P07 | fullName | text | User.fullName | ✓ | 2–80 | Chủ sở hữu |
| P07 | email | email | User.email | ✓ | định dạng, ≤254, chữ thường, duy nhất | Chủ sở hữu |
| P07 | password | secret | User (băm Argon2, **Chỉ BE**) | ✓ | [A4] ≥8, chữ+số, ≤128 | – (không bao giờ trả về) |
| P07 | acceptTerms | boolean | (ghi UserConsent ở giai đoạn sau) | ✓ | phải true | – |
| P07 (sau gửi) | maskedEmail | text | – | – | "an***@mail.com" | Chủ sở hữu |
| P07 (sau gửi) | resendAvailableIn | số giây | SystemConfig | – | 60 s | |
| P06 | email, password, rememberMe | | | ✓,✓,✗ | | |
| P06 (lỗi) | lockedUntil, attemptsLocked | ISO | User/BE | – | không trả số lần còn lại | |
| P09 | token | string (query) | – | ✓ | dùng một lần, có hạn | |
| P09 (kết quả) | result | `VERIFIED｜EXPIRED｜USED｜INVALID` | – | – | | |
| P08 B1 | email | | | ✓ | | |
| P08 B2 | token, newPassword, confirmPassword | | | ✓ | trùng khớp; chính sách mật khẩu | |

### API đề xuất
| Method & path | Mục đích | Phản hồi chính |
|---|---|---|
| `POST /auth/register` | Đăng ký | 201 `{ emailMasked, resendAvailableIn }` · 409 email tồn tại · 422 · 429 |
| `POST /auth/verify-email` `{token}` | Xác minh (**gọi 1 lần**) | 200 `{result}` |
| `POST /auth/resend-verification` `{email}` | Gửi lại | 204 · 429 `{retryAfterSec}` |
| `POST /auth/login` | Đăng nhập; đặt cookie HttpOnly | 200 `User` · 401 · 403 `EMAIL_UNVERIFIED` · 423 `{lockedUntil}` |
| `POST /auth/logout` | Đăng xuất | 204 |
| `POST /auth/forgot-password` `{email}` | Yêu cầu đặt lại | 202 (luôn trung tính) |
| `GET /auth/reset-password/validate?token=` | Kiểm tra token ngay khi mở trang | 200 `{valid, reason?}` |
| `POST /auth/reset-password` `{token,newPassword}` | Đặt lại | 204 · 410 token hết hạn/đã dùng |
| `GET /me` | Khởi tạo phiên | 200 `User` · 401 |

### Cấu hình liên quan (SystemConfig – seed)
`auth.maxFailedAttempts`, `auth.lockMinutes`, `auth.verifyTokenTtlHours`, `auth.resetTokenTtlMinutes`, `auth.resendCooldownSec` (60), `auth.resendMaxPerHour` (3), `auth.passwordMinLength` (8).

### Dữ liệu seed cho demo (S01 AC: mỗi vai trò có tài khoản mẫu)
| Tài khoản mẫu | Vai trò | Trạng thái |
|---|---|---|
| `guest@demo.test` | Guest | Đã xác minh email |
| `host.pending@demo.test` | Host | Đã bật chế độ Host, hồ sơ **chưa nộp** |
| `host@demo.test` | Host | Hồ sơ **đã duyệt**, có vài listing ở các trạng thái khác nhau |
| `admin@demo.test` · `support@demo.test` · `accountant@demo.test` | Admin · CSKH · Kế toán | Hoạt động |
| `unverified@demo.test` | Guest | **Chưa xác minh email** (để thử đường lỗi P06) |
Mật khẩu mẫu ghi trong README seed; Mailpit xem email tại cổng được cấu hình trong Docker Compose.

---

## S02 · Hồ sơ và cài đặt

| Màn | Trường | Kiểu | Nguồn | Bắt buộc | Quy tắc | Hiển thị cho |
|---|---|---|---|---|---|---|
| C01 | avatar | ảnh | User.avatarUrl | ✗ | JPG/PNG/WebP ≤5MB [A5], cắt vuông | Công khai (khi là Host: P04) |
| C01 | fullName | text | User.fullName | ✓ | 2–80 | Công khai (rút gọn tuỳ ngữ cảnh) |
| C01 | email | text (đọc) + emailVerified | User | – | không sửa được | Chủ sở hữu |
| C01 | phone | tel | User.phone | ✗ | chuẩn hoá | Chủ sở hữu |
| C01 | bio | textarea | User.bio | ✗ | ≤300 [Assumption] | Công khai (P04) |
| C01 | verificationStatus | enum | IdentityVerification | – | badge | Chủ sở hữu |
| C02 | language | select | User.language | ✓ | `vi/en` | Chủ sở hữu |
| C02 | displayCurrency | select | User.displayCurrency | ✗ | disabled tới S13 | Chủ sở hữu |
| C02 | currentPassword / newPassword / confirm | secret | – | ✓ | khác mật khẩu cũ; chính sách mật khẩu | – |
| C02 | hostModeEnabled | switch | User.isHost | – | một chiều [A11] | Chủ sở hữu |

| API | Mục đích |
|---|---|
| `PATCH /me` `{fullName,phone,bio,language,displayCurrency}` | Cập nhật hồ sơ/cài đặt |
| `POST /me/avatar` (qua luồng upload 0.3) · `DELETE /me/avatar` | Ảnh đại diện |
| `POST /me/password` `{current,new}` | Đổi mật khẩu → 204 (BE đăng xuất phiên khác) · 422 `WRONG_CURRENT` |
| `POST /me/host-mode` | Bật chế độ Host → 200 `{isHost:true, hostVerification}` |

---

## S03 · Back-office: đăng nhập quản trị, nhân sự, phân quyền

### A01
| Trường | Ghi chú |
|---|---|
| email, password | Cùng cơ chế phiên cookie; endpoint riêng `POST /admin/auth/login` (từ chối nếu không có `staffRole`) |

### A18 – bảng nhân sự
| Cột / trường | Nguồn | Quy tắc / ghi chú |
|---|---|---|
| fullName, email | User | |
| staffRole | User | `ADMIN｜SUPPORT｜ACCOUNTANT` (hiển thị: Admin, CSKH, Kế toán) |
| status | User | `ACTIVE｜INVITED｜LOCKED` |
| lastLoginAt | User | ISO |
| createdBy / createdAt | ActivityLog | |
| **Tab Lịch sử**: hành động, người làm, thời gian, giá trị cũ→mới, lý do | ActivityLog | BR-ADM-03 |
| Form tạo: fullName, email, staffRole | | Email duy nhất; gửi lời mời [A12b] |
| Dialog khoá/đổi vai trò: reason | | bắt buộc, ≥10 ký tự |

| API | Mục đích |
|---|---|
| `GET /admin/staff?query=&role=&status=&page=` | Danh sách |
| `POST /admin/staff` | Tạo + gửi lời mời |
| `PATCH /admin/staff/:id/role` `{role,reason}` | Đổi vai trò |
| `POST /admin/staff/:id/lock` · `/unlock` `{reason}` | Khoá/mở khoá |
| `GET /admin/staff/:id/activity` | Lịch sử |
| Mã lỗi riêng | `403 FORBIDDEN_ROLE`, `409 LAST_ADMIN`, `409 SELF_ACTION` |

**Ma trận quyền menu (hằng số FE):** Admin = {identity-reviews, listing-reviews, staff}; CSKH, Kế toán = {} ở giai đoạn 1.

---

## S04 · Xác minh Host và Admin duyệt

### P10
| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| Nội dung tĩnh (lợi ích, bước, FAQ) | i18n | Không lấy từ API |
| Trạng thái CTA: `anonymous｜emailUnverified｜eligible｜hostPending｜hostRejected｜hostApproved` | `GET /me` | Quyết định nhãn/đích nút |

### H02 / C03 – hồ sơ xác minh
| Trường | Kiểu | Nguồn | Bắt buộc | Quy tắc | Hiển thị cho |
|---|---|---|---|---|---|
| legalName | text | IdentityVerification | ✓ | 2–100, theo giấy tờ | Chủ sở hữu, Admin |
| dateOfBirth | date | IdentityVerification | ✓ | ≥18 tuổi [Assumption] | Chủ sở hữu, Admin |
| idType | `CCCD｜PASSPORT` | IdentityVerification | ✓ | | Chủ sở hữu, Admin |
| idNumber | text | IdentityVerification | ✓ | Theo loại; **che 4 số cuối sau khi gửi** (UI) | Chủ sở hữu (che), Admin (đủ, có log) |
| idFront / idBack (Passport: 1 ảnh) | Attachment | ID_FRONT/ID_BACK | ✓ | JPG/PNG/PDF ≤10MB [A5] | Chỉ Admin (qua API log). Chủ sở hữu chỉ thấy tên tệp |
| operatingRightDocs[] | Attachment (≤5) | OPERATING_RIGHT | ✓ chỉ H02 | | Admin |
| status | enum 0.5 | IdentityVerification | – | | Chủ sở hữu |
| submittedAt / decidedAt | ISO | | – | | Chủ sở hữu |
| rejectionReason | `{category, note}` | IdentityVerification | – | chỉ khi REJECTED | Chủ sở hữu |
| flaggedDuplicate | boolean | ActivityLog (cờ rủi ro) | – | **Chỉ Admin** | Admin |

### A03 – Admin duyệt
**Danh sách:** id, applicantName, applicantType (`HOST｜GUEST`), submittedAt, waitingFor (tính từ submittedAt), status, flag ⚑, lockedBy.
**Chi tiết:** toàn bộ trường H02 (đầy đủ) + `history[]` (các lần gửi, kết quả) + `duplicateOf` (link tài khoản trùng) + danh sách tệp (`id, purpose, fileName`, **không** URL).
**Quyết định:** `{ decision: 'APPROVE｜REJECT', reasonCategory?, note?, acknowledgedFlag? }`.

| API | Mục đích |
|---|---|
| `GET /host/verification` · `PUT /host/verification` (nháp) · `POST /host/verification/submit` | H02 |
| `GET /me/verification` · `PUT` · `POST …/submit` | C03 |
| `GET /admin/identity-reviews?type=&status=&flag=&mine=&page=` | Hàng đợi |
| `POST /admin/identity-reviews/:id/lock` (+ heartbeat/release) | Khoá |
| `POST /admin/identity-reviews/:id/documents/:attId/view` | **Ghi log + trả `signedUrl` (sống ~120 s)** |
| `POST /admin/identity-reviews/:id/decision` | Duyệt/từ chối (ghi ActivityLog, gửi email) |

**Danh mục lý do từ chối (seed):** `BLURRY`, `EXPIRED_DOC`, `MISMATCH`, `INVALID_DOC`, `OTHER`.

---

## S05 · Host tạo listing nháp

### H03 – danh sách listing (mỗi dòng)
| Trường | Nguồn | Ghi chú |
|---|---|---|
| id, title (có thể rỗng khi nháp), coverPhotoUrl | Listing, ListingPhoto | |
| regionName | Location | Khu vực xấp xỉ |
| propertyType, maxGuests | Listing | |
| status | enum 0.5 | |
| draftProgress `{completedSteps, totalSteps:8, resumeStep}` | BE tính | Để nút "Tiếp tục" mở đúng bước |
| updatedAt | Listing | |
| capabilities `{canEdit, canPreview, canViewStatus, canOpenCalendar, canOpenPricing, canDelete}` | BE tính | FE chỉ đọc cờ, không tự suy luận (G2) |
| Tổng: `canCreate` + `createBlockedReason` (`HOST_NOT_VERIFIED`) | BE | |

### H04 – bước 1 · Thông tin cơ bản (`Listing`)
| Trường | Kiểu | Bắt buộc | Quy tắc |
|---|---|---|---|
| propertyType | `ENTIRE_PLACE｜PRIVATE_ROOM` | ✓ | |
| title | text | ✓ | 10–80 [A5b] |
| description | text | ✓ | 50–2000 |
| maxGuests | int | ✓ | 1–30 |
| bedrooms / beds / bathrooms | int / int / decimal(0.5) | ✓ | 0–20 / ≥1 / ≥0 |
| checkInTime / checkOutTime | HH:mm | ✓ | |
| currency | CurrencyCode | ✓ | mặc định theo quốc gia; khoá sau lần duyệt đầu |
| (nền) version | int | – | Phát hiện xung đột 2 tab |

### H04 – bước 2 · Vị trí (`Location`, `Listing`)
| Trường | Kiểu | Bắt buộc | Hiển thị cho | Ghi chú |
|---|---|---|---|---|
| regionId | id | ✓ | Công khai (tên khu vực) | Cascading Tỉnh → Khu vực |
| exactAddress | text ≤200 | ✓ | **Chủ sở hữu, Admin** (không bao giờ Công khai) | BR-SRC-04 |
| exactLat / exactLng | decimal | ✓ | **Chủ sở hữu, Admin** | Nhập tay khi `mapboxEnabled=false` |
| publicArea `{centerLat, centerLng, radiusM, label}` | | – (BE sinh) | Công khai | Dùng để vẽ vòng tròn xấp xỉ; BE làm mờ toạ độ |

### H04 – bước 3 · Ảnh (`ListingPhoto`)
| Trường | Kiểu | Quy tắc |
|---|---|---|
| id, url (nhiều kích thước), width, height | | |
| order | int | Thứ tự hiển thị; `order=0` = ảnh bìa |
| caption | text ≤120 | Tuỳ chọn; dùng làm `alt` |
| status | `UPLOADING｜READY｜REJECTED` | |
| Tổng hợp | `count`, `minRequired` (5), `maxAllowed` (30) | Từ `/config/public` |

| API (S05) | Mục đích |
|---|---|
| `GET /host/listings?status=` | H03 |
| `POST /host/listings` (kèm dữ liệu bước 1) | Tạo nháp → trả `id` |
| `GET /host/listings/:id` | Nạp toàn bộ nháp (mọi bước) |
| `PATCH /host/listings/:id` `{…, version}` | Lưu một phần; 409 nếu `version` cũ |
| `PUT /host/listings/:id/photos/order` `{photoIds[]}` | Sắp xếp |
| `POST /host/listings/:id/photos` (qua luồng upload) · `PATCH/DELETE …/photos/:pid` | Ảnh |
| `DELETE /host/listings/:id` | Xoá nháp |
| `GET /geocode?q=` · `GET /geocode/reverse?lat=&lng=` | Gợi ý địa chỉ (qua BE để giấu token nếu cần) |

---

## S06 · Tiện nghi, quy tắc lưu trú, giá & phí

### Bước 4 – Tiện nghi (`ListingAmenity`)
`amenityIds[]` (đã chọn) + danh mục `Amenity {id, key, name, category, icon}`.

### Bước 5 – Quy tắc lưu trú (trên `Listing`)
| Trường | Kiểu | Quy tắc |
|---|---|---|
| minNights / maxNights | int | ≥1; min ≤ max (S06 AC) |
| prepNights | int | 0–3 – thời gian chuẩn bị giữa 2 booking |
| minNoticeHours | int | 0–720 – báo trước tối thiểu |
| maxAdvanceMonths | int | 1–24; > thời gian báo trước |
| houseRules `{smoking, pets, parties: boolean, quietHoursFrom, quietHoursTo, notes}` | object | Hiển thị Công khai ở P03 |

### Bước 6 – Giá & phí (`ListingPricing`)
| Trường | Kiểu | Quy tắc |
|---|---|---|
| baseNightlyPrice | Money | > 0 |
| cleaningFee | Money | ≥ 0, một lần/booking |
| baseGuests | int | 1…maxGuests |
| extraGuestFee | Money | ≥ 0 / khách thêm / đêm |
| weeklyDiscountPct | decimal | 0–100, áp từ 7 đêm [A14] |
| monthlyDiscountPct | decimal | 0–100, áp từ 28 đêm; đủ cả hai → lấy mức tháng (BR-PRC-02) |

### Bảng giá xem trước – `GET /host/listings/:id/pricing-preview?checkin=&checkout=&guests=`
| Trường phản hồi | Ghi chú |
|---|---|
| nights | int |
| nightlyBreakdown[] `{date, price: Money, source: BASE｜WEEKEND｜SEASON｜HOLIDAY｜SPECIAL}` | Hiện ở "Giá từng đêm" |
| roomSubtotal, extraGuestTotal, cleaningFee, discount (số âm) `{type: WEEKLY｜MONTHLY, pct}`, hostTotal | Money; **chưa gồm phí dịch vụ/thuế** (A9) |
| violations[] `{code: MIN_NIGHTS｜MAX_NIGHTS｜NOTICE｜ADVANCE, message}` | Hiển thị thay cho bảng |
| currency | tiền tệ listing |

---

## S07 · Chính sách huỷ, kiểu đặt, giấy tờ, gửi duyệt, trạng thái

### Bước 7
| Trường | Nguồn | Ghi chú |
|---|---|---|
| cancellationPolicyId | Listing → CancellationPolicy | 1 trong 3 |
| bookingMode | Listing | `INSTANT｜REQUEST` |
| Danh mục chính sách + mốc hoàn tiền | `GET /cancellation-policies` | Bảng như P05 |

### Bước 8
| Trường | Nguồn | Quy tắc |
|---|---|---|
| requiredLegalDocs[] `{type, label, required, uploaded: Attachment?}` | CountryConfig + Attachment (LISTING_LEGAL) | Động theo quốc gia [A17] |
| legalRegistrationNumber | Listing | Nếu quốc gia yêu cầu |
| readiness `{canSubmit, items[]: {key, ok, message, stepKey, current, required}}` | BE | Nguồn sự thật cho checklist |
| summary `{coverPhoto, title, baseNightlyPrice, policy, bookingMode, area}` | Listing | Thẻ tóm tắt |

### H05 – trạng thái duyệt
| Trường | Nguồn | Hiển thị cho |
|---|---|---|
| status | Listing | Chủ sở hữu |
| revisions[] `{no, submittedAt, decidedAt?, result: PENDING｜APPROVED｜NEEDS_CHANGES｜REJECTED}` | ListingRevision | Chủ sở hữu |
| currentReview `{reasons[]: {section: PHOTOS｜DESCRIPTION｜LEGAL｜PRICING｜LOCATION｜OTHER, note, stepKey}, decidedBy?: ẩn tên Admin}` | ListingRevision | Chủ sở hữu (chỉ lý do, **không** lộ tên Admin) |
| publicUrl | | Chỉ khi `ACTIVE` |
| lockReason | Listing | Khi `LOCKED` |

| API | Mục đích |
|---|---|
| `GET /host/listings/:id/readiness` | Checklist điều kiện |
| `POST /host/listings/:id/legal-docs` (qua luồng upload) | Giấy tờ listing |
| `POST /host/listings/:id/submit` | Gửi duyệt → 200 `{status:'PENDING_REVIEW'}` · 422 `{items[]}` · 403 `HOST_NOT_VERIFIED` |
| `GET /host/listings/:id/review-status` | H05 |

---

## S08 · Admin duyệt listing lần đầu (A04)

| Phần | Trường | Ghi chú |
|---|---|---|
| Hàng đợi | listingId, title, hostName, regionName, submittedAt, revisionNo, flagDuplicateAddress ⚑, lockedBy, status | Sắp cũ nhất trước |
| Nội dung | toàn bộ Listing (mô tả, loại hình, sức chứa, quy tắc, nội quy), ảnh (url), tiện nghi | |
| Vị trí | **exactAddress, exactLat/Lng** | **Admin thấy đủ** |
| Giấy tờ | Attachment LISTING_LEGAL: id, type, fileName (xem qua API có log) | |
| Giá & chính sách | ListingPricing, CancellationPolicy, bookingMode | |
| Cảnh báo trùng | `duplicates[] {listingId, hostId, hostName, similarity: 'SAME_ADDRESS'}` | BR-LST-06 |
| Host | id, tên, hostVerification, số listing | |
| Quyết định | `{decision: APPROVE｜NEEDS_CHANGES｜REJECT, reasons[]: {section, note}, acknowledgedDuplicate?}` | Lý do bắt buộc khi khác APPROVE |

| API | Mục đích |
|---|---|
| `GET /admin/listing-reviews?status=&flag=&mine=&page=` | Hàng đợi |
| `POST /admin/listing-reviews/:id/lock` (+ heartbeat/release) | Khoá |
| `GET /admin/listing-reviews/:id` | Chi tiết |
| `POST /admin/listing-reviews/:id/documents/:attId/view` | Xem giấy tờ (ghi log) |
| `POST /admin/listing-reviews/:id/decision` | Quyết định (ghi ActivityLog + email Host) |
| `GET /admin/listings/:id/preview` | Dữ liệu cho P03 chế độ xem trước |

---

## S09 · Lịch listing (H06)

| Dữ liệu | Kiểu | Nguồn | Ghi chú |
|---|---|---|---|
| timezone | IANA string | Location | Hiển thị chip; tính "hôm nay" |
| today | date | BE theo múi giờ listing | FE không dùng đồng hồ thiết bị |
| days[] `{date, state, bookingRef?}` | `AVAILABLE｜BOOKED｜HOLD｜PENDING_HOST｜BLOCKED｜PAST` (+ `ICAL_BLOCKED` 🔒) | CalendarBlock | Mỗi ô = một đêm |
| prepBuffer `{dates[]}` | | Listing.prepNights | Dải mờ thông tin |
| outsideBookingRules `{dates[]}` | | Listing | Ô có chấm mờ |
| rules `{minNights,maxNights,prepNights,minNoticeHours,maxAdvanceMonths}` | | Listing | Sửa tại panel |
| updatedAt | ISO | | "Cập nhật lúc …" |

| API | Mục đích |
|---|---|
| `GET /host/listings/:id/calendar?from=&to=` | Dữ liệu tháng |
| `POST /host/listings/:id/calendar/blocks` `{from, to, nights[]}` | Chặn (toàn bộ-hoặc-không) → 409 `{conflicts:[dates]}` |
| `DELETE /host/listings/:id/calendar/blocks` `{from,to}` | Mở ngày |
| `PATCH /host/listings/:id/stay-rules` | Sửa quy tắc lưu trú |

---

## S10 · Giá theo mùa, lễ, ngày đặc biệt (H08)

### Quy tắc giá (`PriceRule`)
| Trường | Kiểu | Quy tắc |
|---|---|---|
| id | | |
| type | `WEEKEND｜SEASON｜HOLIDAY｜SPECIAL` | WEEKEND chỉ 1 bản ghi/listing |
| name | text ≤60 | Mặc định theo loại |
| dateFrom / dateTo | date | `SEASON/HOLIDAY/SPECIAL` bắt buộc; không quá khứ; to ≥ from; **không chồng cùng nhóm ưu tiên** (HOLIDAY+SPECIAL cùng bậc ①, SEASON bậc ②) [A6] |
| nightlyPrice | Money | > 0 |
| phase | `UPCOMING｜ACTIVE｜PAST` | BE tính (hiển thị badge) |
| weekendNights | `['FRI','SAT']` | Từ CountryConfig (Việt Nam) – chỉ đọc |

### Lịch giá – `GET /host/listings/:id/price-calendar?from=&to=`
`days[] {date, price: Money, source: BASE｜WEEKEND｜SEASON｜HOLIDAY｜SPECIAL, ruleId?}` – nguồn là kết quả của **PricingEngine**.

| API | Mục đích |
|---|---|
| `GET /host/listings/:id/pricing-rules` | Danh sách |
| `POST/PATCH/DELETE /host/listings/:id/pricing-rules/:rid` | CRUD; 409 `{conflictingRuleIds[]}` khi chồng |
| `PUT /host/listings/:id/pricing-rules/weekend` `{nightlyPrice}` | Giá cuối tuần |

**Cấu hình quốc gia (CountryConfig.VN – seed):** `weekendNights = [FRI, SAT]`.

---

## S11 · Trang chủ và tìm kiếm

### P01
| Khối | Dữ liệu | Nguồn |
|---|---|---|
| SearchBar | destinationSuggestions[] `{type: REGION｜LISTING, id, label, sublabel}` | `GET /search/suggest?q=` (Location + listing) |
| Điểm đến phổ biến (≤8) | `{regionId, name, imageUrl, listingCount}` | Location + đếm listing ACTIVE |
| Chỗ ở nổi bật (≤8) | `ListingCardDTO` (bên dưới) | Xếp hạng (BR-SRC-03 phần có dữ liệu) |

### P02 – truy vấn
| Tham số URL | Kiểu | Ghi chú |
|---|---|---|
| destination (regionId hoặc text), checkin, checkout | | Ngày theo múi giờ listing |
| adults, children | int | [A7] |
| minPrice, maxPrice | int (đơn vị tiền tệ hiển thị) | |
| type | `ENTIRE_PLACE｜PRIVATE_ROOM` | |
| bedrooms | int (4 = 4+) | |
| amenities | id[] | |
| instant | boolean | |
| policy | `FLEXIBLE｜MODERATE｜STRICT` (nhiều) | |
| sort | `RELEVANCE｜PRICE_ASC｜PRICE_DESC｜NEWEST` (+ `RATING` khi `reviewsEnabled`) | |
| bbox | `minLng,minLat,maxLng,maxLat` | Vùng bản đồ |
| cursor/page | | 24/lần |
| currency | | Từ S13 |

### ListingCardDTO (P01, P02, P04)
| Trường | Ghi chú |
|---|---|
| id, title, propertyType, areaLabel (khu vực xấp xỉ) | **Không** có địa chỉ chính xác |
| photos[] (≤5 url, kích thước thẻ) | |
| maxGuests, bedrooms, beds | |
| bookingMode (nhãn Instant) | |
| price `{ mode: 'TOTAL'｜'FROM_NIGHTLY', total?: Money, nightlyAvg?: Money, nights?, includesFeesAndTaxes: boolean, converted?: {original: Money, rateDate} }` | TOTAL khi có ngày (BR-SRC-02); FROM_NIGHTLY khi chưa chọn ngày |
| map `{lat, lng}` (**toạ độ xấp xỉ**) | Cho marker |
| rating (🔒 ẩn khi `reviewsEnabled=false`) | |

### Phản hồi tìm kiếm – `GET /search/listings`
`{ items: ListingCardDTO[], total, nextCursor, appliedFilters, facets? {priceRange{min,max}, amenityCounts}, mapMarkers[] (≤200: id, lat, lng, priceLabel), fx? {stale} }`
Thêm `GET /search/count` (cho nút "Hiển thị n kết quả" khi chỉnh bộ lọc, chỉ trả số).

---

## S12 · Chi tiết listing, hồ sơ Host, chính sách huỷ

### P03 – `GET /listings/:id` (+ `?preview=1` cho Host/Admin)
| Nhóm | Trường | Hiển thị cho |
|---|---|---|
| Tổng quan | id, title, propertyType, areaLabel, maxGuests, bedrooms, beds, bathrooms | Công khai |
| Ảnh | photos[] `{id, urls, caption, order}` | Công khai |
| Mô tả | description | Công khai |
| Tiện nghi | amenities[] `{id, name, category, icon}` | Công khai |
| Quy tắc/nội quy | checkInTime, checkOutTime, houseRules, stayRules `{minNights,maxNights,minNoticeHours,maxAdvanceMonths}` | Công khai |
| Chính sách huỷ | policy `{id, key, name, summary, milestones[]}` | Công khai |
| Kiểu đặt | bookingMode | Công khai |
| Vị trí | publicArea `{centerLat, centerLng, radiusM, label}` | Công khai |
| Host | `{id, displayName, avatarUrl, verified, joinedAt, activeListingCount}` | Công khai |
| Đánh giá | `reviews: null` ở giai đoạn 1 | |
| Trạng thái | `isPreview`, `previewStatus` (khi xem trước) | Chủ sở hữu/Admin |
| **Không bao giờ trả** | exactAddress, exactLat/Lng, giấy tờ, email/SĐT Host | **Chỉ BE** |

### Lịch trống – `GET /listings/:id/availability?from=&to=`
`days[] {date, available: boolean, reason?: BOOKED｜BLOCKED｜MIN_NOTICE｜BEYOND_ADVANCE}` + `stayRules`.

### Báo giá – `GET /listings/:id/quote?checkin=&checkout=&adults=&children=&currency=`
| Trường | Ghi chú |
|---|---|
| nights, guests | |
| lines[] `{key: ROOM｜EXTRA_GUEST｜CLEANING｜DISCOUNT｜SERVICE_FEE｜TAX, label, amount: Money}` | DISCOUNT là số âm |
| nightlyBreakdown[] `{date, price, source}` | "Giá từng đêm" |
| total: Money | Đã gồm mọi phí và thuế (BR-PRC-06) |
| converted? `{rateDate, original: Money}` | S13 |
| violations[] | `UNAVAILABLE｜MIN_NIGHTS｜MAX_NIGHTS｜NOTICE｜ADVANCE｜CAPACITY`, kèm `nextAvailable? {from,to}` |
| quoteExpiresAt | Thời điểm báo giá hết hiệu lực (tham khảo) |

### P04 – `GET /hosts/:id`
`{id, displayName, avatarUrl, bio?, verified, joinedAt, activeListingCount, responseRate? (ẩn đến khi có), listings: ListingCardDTO[] (chỉ ACTIVE)}`. **Không** trả email/SĐT/giấy tờ.

### P05 – `GET /cancellation-policies`
Như 0.4; mỗi chính sách: `{key, name, summary, milestones[]: {label, window, roomRefund, cleaningRefund, serviceFeeRefund}, specialCases: {hostCancel, forceMajeure}}`. Ghi chú hiển thị: "Thời điểm tính theo giờ check-in của chỗ ở".

---

## S13 · Tiền tệ hiển thị và tỷ giá

| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| supportedCurrencies[] `{code, symbol, name, decimals}` | `/config/public` | |
| displayCurrency | User/local | |
| Giá trong mọi phản hồi | `Money` + `converted? {original: Money, rate, rateDate}` | BE quy đổi và làm tròn (BR-PRC-08) |
| fx `{status: OK｜STALE｜UNAVAILABLE, asOf, source}` | ExchangeRateSnapshot | STALE/UNAVAILABLE → FE về tiền tệ listing (S13 AC) |
| Truy vấn | thêm tham số `currency=` vào search/quote/price-calendar | |

---

## Phụ lục · Dữ liệu seed cho demo (đủ để chạy hành trình J1–J5)

| Nhóm | Nội dung gợi ý |
|---|---|
| Location (VN) | Quốc gia Việt Nam (+ múi giờ `Asia/Ho_Chi_Minh`) · Khu vực: Đà Lạt, Hội An, Sa Pa, Vũng Tàu, Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Nha Trang, Phú Quốc |
| Amenity (≈25) | Thiết yếu: Wi-Fi, Điều hoà, Máy nước nóng, Khăn tắm · Bếp: Bếp, Tủ lạnh, Lò vi sóng, Dụng cụ nấu ăn · Giải trí: TV, Karaoke, Bể bơi · An toàn: Báo khói, Bình chữa cháy, Khoá an toàn · Ngoài trời: Sân vườn, BBQ, Chỗ đỗ xe |
| CancellationPolicy | 3 chính sách + mốc đúng bảng chấp thuận (Linh hoạt / Trung bình / Nghiêm ngặt) |
| CountryConfig VN | `weekendNights=[FRI,SAT]`; thuế/VAT và phí dịch vụ Guest: **giá trị chờ khách hàng cung cấp (OQ-02, BR-PRC-05)** – dùng số mẫu dán nhãn "Dữ liệu mẫu" để dev/QA, không hiển thị như số thật |
| SystemConfig | `listing.minPhotos=5`, `listing.maxPhotos=30`, `upload.maxMb=10`, `auth.*` (mục S01), `lock.ttlSec=300`, `lock.heartbeatSec=60`, `search.pageSize=24` |
| Listing mẫu | Vài trăm listing ACTIVE (S11) với giá/lịch/quy tắc đa dạng; một số ở `DRAFT/PENDING_REVIEW/NEEDS_CHANGES/REJECTED/PAUSED` để thử H03/H05/A04 |
| Hồ sơ danh tính mẫu | Ảnh **giả** (S04 ghi chú); một hồ sơ gắn cờ trùng để thử cảnh báo (BR-ACC-04); một listing trùng địa chỉ để thử BR-LST-06 |
| Tỷ giá mẫu | Snapshot VND→USD/EUR cho S13; một trường hợp quá hạn để thử `STALE` |

## Phụ lục · Ma trận "màn hình × dữ liệu nhạy cảm" (kiểm tra riêng tư)
| Dữ liệu nhạy cảm | P03/P02/P04 (Công khai) | H03/H04/H05/H06 (Host chủ) | A03/A04 (Admin) |
|---|---|---|---|
| Địa chỉ chính xác & toạ độ chính xác | ❌ | ✅ | ✅ |
| Ảnh giấy tờ danh tính | ❌ | ❌ (chỉ tên tệp) | ✅ qua API có log, che mờ + watermark |
| Số giấy tờ | ❌ | ✅ che 4 số cuối | ✅ đầy đủ (log) |
| Email/SĐT Host | ❌ | ✅ (của mình) | ✅ |
| Cờ trùng giấy tờ/địa chỉ | ❌ | ❌ | ✅ |
| Tên Admin quyết định | ❌ | ❌ (chỉ lý do) | ✅ |
