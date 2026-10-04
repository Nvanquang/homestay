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

