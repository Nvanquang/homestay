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

