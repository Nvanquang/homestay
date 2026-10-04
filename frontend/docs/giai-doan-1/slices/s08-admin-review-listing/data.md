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

