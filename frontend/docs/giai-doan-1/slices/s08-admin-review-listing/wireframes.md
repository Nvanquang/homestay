## S08 · Admin duyệt listing lần đầu

### A04 · Duyệt listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/admin/listing-reviews` (hàng đợi), `/admin/listing-reviews/:id` · **Admin** |
| Component | CMP-24 (Listing, Host, Khu vực, Ngày gửi, Lần gửi, Cờ ⚑ trùng địa chỉ, Người đang xử lý), CMP-31 LockBanner, banner cảnh báo trùng địa chỉ (BR-LST-06), tabs [Nội dung \| Ảnh \| Giấy tờ \| Giá & chính sách \| *Thay đổi (🔒 disabled)*], CMP-26 xem ảnh, CMP-30 xem giấy tờ (có log), CMP-25 (Duyệt / Yêu cầu sửa / Từ chối + lý do), CMP-10 |
| Action | Mở & nhận khoá · Xem từng tab · Xem giấy tờ (ghi log) · **Duyệt** · **Yêu cầu chỉnh sửa** (lý do theo mục) · **Từ chối** (lý do) · Trả lại hàng đợi · Mở trang xem trước dạng công khai |
| State | Hàng đợi: Loading/Default/Rỗng/Lọc rỗng/Lỗi · Chi tiết: **Đang tải** · **Tự do** · **Bị khoá bởi người khác** · **Mất khoá** · **Có cảnh báo trùng địa chỉ** · **Đã xử lý bởi người khác** (409 → chỉ xem) · **Đang gửi quyết định** · **Thành công** (toast + quay lại hàng đợi, mở listing kế tiếp) · **Thiếu lý do** (lỗi inline, chặn gửi) · Lỗi mạng |

🖥 Desktop – chi tiết
```
┌─────────┬──────────────────────────────────────────────────────────────────────────┐
│ Duyệt DT│ ← Listing #318 · Nhà trên đồi Đà Lạt     ⏳ Chờ duyệt (lần 1)  [Trả lại]     │
│ ▶Duyệt tin│ ⚑ Địa chỉ trùng với listing #207 của Host khác  [Xem listing #207]        │
│ Nhân sự │ Tabs: [Nội dung] Ảnh  Giấy tờ  Giá & chính sách  (🔒 Thay đổi)              │
│         │ ┌────────────────────────────────┐ ┌────────────────────────────────────┐ │
│         │ │ Gallery (lightbox)             │ │ Host: Nguyễn Văn A  ✓ Đã xác minh   │ │
│         │ │ ▢▢▢▢▢                          │ │ Loại: Nguyên căn · Sức chứa 4        │ │
│         │ │ Mô tả …                        │ │ Địa chỉ chính xác (Admin thấy đủ)    │ │
│         │ │ Tiện nghi …                    │ │ [Mini map]                          │ │
│         │ │ Nội quy …                      │ │ Chính sách huỷ · Kiểu đặt · Giá      │ │
│         │ └────────────────────────────────┘ └────────────────────────────────────┘ │
│         │ ───────────────────────────────────────────────────────────────────────── │
│         │ [ Từ chối… ]   [ Yêu cầu chỉnh sửa… ]                      [ Duyệt listing ] │
└─────────┴──────────────────────────────────────────────────────────────────────────┘
Dialog lý do: ☐ Ảnh ☐ Mô tả ☐ Giấy tờ ☐ Giá ☐ Khác  + Ghi chú chi tiết gửi Host (bắt buộc)
```
📱 Mobile/Tablet: 1 cột; tabs cuộn ngang; thanh quyết định sticky đáy [Từ chối][Sửa][Duyệt] (Sửa/Từ chối mở bottom sheet nhập lý do).

---

