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

