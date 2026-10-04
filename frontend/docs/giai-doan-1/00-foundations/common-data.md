# Hợp Đồng Dữ Liệu Dùng Chung (Money, DateTime, Pagination, Enums)

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
