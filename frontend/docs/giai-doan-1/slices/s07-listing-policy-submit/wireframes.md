## S07 · Chính sách huỷ, kiểu đặt, giấy tờ pháp lý, gửi duyệt

#### Bước 7 · Chính sách huỷ & Kiểu đặt
Component: CMP-05 Radio thẻ ×3 (Linh hoạt / Trung bình / Nghiêm ngặt) mỗi thẻ có tóm tắt 1 dòng + nút "Xem bảng mốc hoàn tiền" (mở CMP-27 trong Modal/BottomSheet), CMP-05 Radio thẻ ×2 (Instant Book / Request to Book) kèm mô tả "Host có 24 giờ để phản hồi".
State: Default · Đã chọn · **Chưa chọn** (lỗi khi Tiếp tục) · Modal bảng mốc: Loading/OK/Lỗi.
```
 Chính sách huỷ *
 ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
 │ ◉ Linh hoạt        │ │ ○ Trung bình       │ │ ○ Nghiêm ngặt      │
 │ Hoàn 100% trước    │ │ Hoàn 100% trước    │ │ Hoàn 50% nếu ≥ 7   │
 │ 24 giờ check-in    │ │ 5 ngày check-in    │ │ ngày; sau đó 0%    │
 │ [Xem bảng mốc]     │ │ [Xem bảng mốc]     │ │ [Xem bảng mốc]     │
 └────────────────────┘ └────────────────────┘ └────────────────────┘
 Kiểu đặt *      ( ) Instant Book – khách đặt và thanh toán ngay
                 ( ) Request to Book – bạn duyệt trong 24 giờ
 (Mobile: ba thẻ xếp dọc, thẻ đã chọn có viền đậm + dấu ✓)
```

#### Bước 8 · Giấy tờ pháp lý & Rà soát gửi duyệt
Component: CMP-13 (giấy tờ quyền khai thác, đăng ký lưu trú/giấy phép – theo yêu cầu quốc gia), **Checklist điều kiện gửi duyệt** (mỗi dòng ✓/✕ + link nhảy tới bước), tóm tắt listing (xem trước ảnh bìa, tên, giá, chính sách), CMP-01 "Gửi duyệt", CMP-25 xác nhận.
Action: Tải giấy tờ · Nhảy tới bước thiếu · Xem trước trang công khai · Gửi duyệt.
State: **Chưa đủ điều kiện** (nút Gửi duyệt disabled; mỗi mục thiếu hiển thị rõ: "Cần thêm 2 ảnh (hiện 3/5)", "Thiếu giấy tờ quyền khai thác", "Hồ sơ xác minh Host chưa được duyệt") · **Đủ điều kiện** (nút bật) · **Đang gửi** · **Gửi thành công** → H05 · **Lỗi BE từ chối gửi** (hiển thị lý do từ API, ưu tiên hơn kiểm tra FE) · Tải tệp: trạng thái như CMP-13.
```
🖥 Desktop                                             📱 Mobile
┌─────────────────────────────┬──────────────────┐   ┌────────────────────────────┐
│ Giấy tờ pháp lý              │ ĐIỀU KIỆN GỬI DUYỆT│   │ Điều kiện gửi duyệt         │
│ Giấy tờ quyền khai thác *    │ ✓ Thông tin cơ bản │   │ ✓ Cơ bản  ✓ Vị trí          │
│  [+ Tải lên]  so_do.pdf ✓    │ ✓ Vị trí           │   │ ✕ Ảnh 3/5 → Đi tới bước 3   │
│ Số giấy phép lưu trú (nếu cần)│ ✕ Ảnh 3/5 [→ Bước 3]│   │ ✓ Giá  ✓ Chính sách         │
│  [______________]            │ ✓ Giá & phí        │   │ Giấy tờ quyền khai thác *    │
│                              │ ✓ Chính sách huỷ   │   │ [+ Tải lên]                  │
│                              │ ✕ Giấy tờ [→ ...]   │   │ ─────────────────────────── │
│ [ Xem trước trang công khai ] │ ┌────────────────┐ │   │ [ Xem trước ]               │
│                              │ │ Tóm tắt listing │ │   │ [ Gửi duyệt ] (disabled)     │
│                              │ └────────────────┘ │   └────────────────────────────┘
│                              │ [ Gửi duyệt ] (off) │
└─────────────────────────────┴──────────────────┘
```

### H05 · Trạng thái duyệt listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/host/listings/:id/status` · Host |
| Component | CMP-10 trạng thái lớn, timeline (Đã gửi → Đang xem xét → Kết quả), khối **Lý do** (khi Cần chỉnh sửa/Từ chối: danh sách mục cần sửa, link nhảy tới bước), tóm tắt listing, CMP-01 theo trạng thái |
| Action (theo trạng thái) | Chờ duyệt: Xem trước, Rút lại để sửa* · Cần chỉnh sửa/Bị từ chối: **Sửa & gửi lại** · Đang hiển thị: **Xem trang công khai**, Lịch, Giá theo mùa · Tạm ẩn: Hiện lại* · Bị khoá: Liên hệ hỗ trợ |
| State | **Loading** · **Chờ duyệt** (kèm "Đã gửi 2 giờ trước") · **Đang hiển thị** · **Cần chỉnh sửa** · **Bị từ chối** · **Tạm ẩn** · **Bị khoá** (lý do) · **Lịch sử nhiều lần gửi** (danh sách lần 1, lần 2…) · **Lỗi tải** |
```
🖥 Desktop                                              📱 Mobile
┌────────────────────────────────────────────────┐   ┌───────────────────────────┐
│ ← Nhà trên đồi Đà Lạt                           │   │ ← Nhà trên đồi Đà Lạt      │
│ Trạng thái: [✎ Cần chỉnh sửa]                   │   │ [✎ Cần chỉnh sửa]          │
│ ┌────────────────────────────────────────────┐ │   │ ┌───────────────────────┐ │
│ │ Lý do từ Admin (12/12 10:20)               │ │   │ │ Lý do từ Admin         │ │
│ │ • Ảnh phòng ngủ bị mờ  → Sửa ở bước 3      │ │   │ │ • Ảnh phòng ngủ mờ →B3 │ │
│ │ • Thiếu giấy phép lưu trú → Sửa ở bước 8   │ │   │ └───────────────────────┘ │
│ └────────────────────────────────────────────┘ │   │ Timeline (dọc)            │
│ Timeline:  ● Đã gửi ─ ● Đang xem xét ─ ◐ Kết quả │   │ ● Đã gửi 12/12            │
│ Lịch sử: Lần 1 (từ chối) · Lần 2 (hiện tại)     │   │ ● Đang xem xét            │
│ [ Xem trước ]                [ Sửa & gửi lại ]   │   │ ◐ Kết quả                 │
└────────────────────────────────────────────────┘   │ [ Sửa & gửi lại ] sticky   │
                                                       └───────────────────────────┘
```

---

