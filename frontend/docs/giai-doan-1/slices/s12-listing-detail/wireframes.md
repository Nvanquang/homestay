## S12 · Chi tiết listing, hồ sơ Host công khai, chính sách huỷ công khai

### P03 · Chi tiết listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/rooms/:listingId?checkin=&checkout=&adults=&children=` · Khách vãng lai, Guest; **Chế độ xem trước** cho Host chủ listing và Admin (listing chưa công khai) |
| Component | CMP-26 Gallery+Lightbox, tiêu đề + khu vực xấp xỉ + loại hình + sức chứa, CMP-33 HostCard, khối **Điểm nổi bật**, Mô tả (xem thêm), CMP-29 **Tiện nghi** (10 mục + modal "Xem tất cả"), **Lịch trống** (CMP-16 chỉ đọc + chọn ngày), **Nội quy & giờ nhận/trả**, **Chính sách huỷ** (tóm tắt + CMP-27 timeline rút gọn → P05), **Vị trí** (CMP-21 vòng tròn xấp xỉ + dòng "Địa chỉ chính xác sẽ được cung cấp sau khi đặt phòng được xác nhận"), **Đánh giá** (🔒 "Chưa có đánh giá"), **Thẻ đặt phòng** (desktop sticky phải) / **Thanh giá + CTA dưới đáy** (mobile): CMP-16, CMP-17, CMP-22 PriceBreakdown, CTA |
| Action | Mở lightbox/Xem tất cả ảnh · Xem tất cả tiện nghi · Chọn ngày/khách · Mở bảng giá chi tiết/giá từng đêm · Xem chính sách huỷ → P05 · Xem hồ sơ Host → P04 · 🔒 **Đặt phòng / Gửi yêu cầu** (disabled ở giai đoạn 1: tooltip "Tính năng đặt phòng sẽ sớm ra mắt") · 🔒 Yêu thích · Chia sẻ (copy link) · Quay lại kết quả (giữ vị trí cuộn) |
| State (trang) | **Loading** (skeleton gallery + khối) · **Default** · **Không tồn tại / không còn hiển thị** (404 riêng: "Chỗ ở này hiện không khả dụng" + Gợi ý tìm chỗ khác) · **Chế độ xem trước** (banner vàng cố định "Đây là bản xem trước, chưa hiển thị công khai") · **Lỗi tải** · **Offline** |
| State (thẻ đặt phòng) | **Chưa chọn ngày** ("Từ 1.200.000 ₫/đêm" + "Thêm ngày để xem tổng giá") · **Đang tính giá** (skeleton) · **Có giá** (bảng đầy đủ: tiền phòng, phụ thu, phí vệ sinh, giảm giá [số âm, màu xanh], phí dịch vụ, thuế, **Tổng**) · **Ngày không còn trống** (lỗi + gợi ý khoảng trống gần nhất) · **Vi phạm đêm tối thiểu/tối đa/báo trước** (lỗi chỉ rõ quy tắc: "Tối thiểu 2 đêm") · **Vượt sức chứa** (GuestPicker chặn tại max + ghi chú) · **Giá quy đổi** (S13: nhãn "Giá quy đổi, chỉ tham khảo" + hiển thị giá gốc) · **Tỷ giá quá hạn** (chỉ hiển thị tiền tệ listing) · **Lỗi tính giá** (Thử lại) · **CTA disabled** (giai đoạn 1) |

🖥 Desktop
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                        │
│ Nhà trên đồi Đà Lạt                                  [↗ Chia sẻ] [♡🔒]         │
│ ┌──────────────────────────┬──────────┬──────────┐                           │
│ │                          │   ▢      │   ▢      │                           │
│ │      ▢ ẢNH LỚN           ├──────────┼──────────┤  [ Xem tất cả 12 ảnh ]    │
│ │                          │   ▢      │   ▢      │                           │
│ └──────────────────────────┴──────────┴──────────┘                           │
│ ┌────────────────────────────────────────────┐ ┌───────────────────────────┐ │
│ │ Nguyên căn tại Phường 3, Đà Lạt             │ │ 1.200.000 ₫ / đêm          │ │
│ │ 4 khách · 2 phòng ngủ · 3 giường · 1 tắm     │ │ [12/12 → 15/12] [2 khách ▼]│ │
│ │ ── HostCard: Nguyễn A ✓ Đã xác minh · Xem →  │ │ ──────────────────────────  │ │
│ │ ── Điểm nổi bật …                           │ │ 3 đêm × 1.200.000   3.600.000│ │
│ │ ── Mô tả … [Xem thêm]                       │ │ Phụ thu thêm khách    300.000│ │
│ │ ── Tiện nghi (10) …  [Xem tất cả 28]         │ │ Phí vệ sinh           200.000│ │
│ │ ── Lịch trống (2 tháng) …                   │ │ Giảm giá                   0 │ │
│ │ ── Nội quy · Nhận phòng 14:00 – Trả 12:00    │ │ Phí dịch vụ           410.000│ │
│ │ ── Chính sách huỷ: Linh hoạt  [Xem chi tiết] │ │ Thuế                  320.000│ │
│ │ ── Vị trí: bản đồ vòng tròn xấp xỉ           │ │ Tổng                4.830.000│ │
│ │ ── Đánh giá: Chưa có đánh giá                │ │ [ Đặt phòng ] (disabled 🔒)  │ │
│ └────────────────────────────────────────────┘ │ ⓘ Chưa bị trừ tiền          │ │
│                                                  └───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile
```
┌──────────────────────────────┐
│ ←                  ↗   ♡🔒    │
│ ┌──────────────────────────┐ │
│ │ ▢ ẢNH (vuốt)      1/12   │ │
│ └──────────────────────────┘ │
│ Nhà trên đồi Đà Lạt           │
│ Nguyên căn · Phường 3, Đà Lạt │
│ 4 khách · 2 PN · 3 giường     │
│ ─ HostCard ─                  │
│ ─ Điểm nổi bật ─              │
│ ─ Mô tả [Xem thêm] ─          │
│ ─ Tiện nghi [Xem tất cả] ─    │
│ ─ Lịch trống (1 tháng) ─      │
│ ─ Nội quy / Nhận–Trả phòng ─  │
│ ─ Chính sách huỷ [Chi tiết] ─ │
│ ─ Vị trí (bản đồ xấp xỉ) ─    │
│ ─ Đánh giá: chưa có ─         │
├──────────────────────────────┤
│ 4.830.000 ₫ · 3 đêm  Chi tiết▲│ ← sticky đáy
│ [ Chọn ngày ]  [Đặt phòng 🔒] │
└──────────────────────────────┘
 "Chi tiết ▲" mở BottomSheet: ngày/khách + PriceBreakdown đầy đủ
```
Tablet: thẻ đặt phòng chuyển xuống thanh sticky đáy như mobile; gallery lưới 1+2.

### P04 · Hồ sơ công khai của Host
| Mục | Giá trị |
|---|---|
| Route / Role | `/hosts/:hostId` · Khách vãng lai, Guest |
| Component | Ảnh + tên + CMP-10 "Đã xác minh", ngày tham gia, số listing đang hiển thị, Giới thiệu*, (🔒 tỷ lệ/thời gian phản hồi, điểm đánh giá – ẩn đến khi có dữ liệu), lưới CMP-19 các listing **đang hiển thị** |
| Action | Bấm thẻ listing → P03 · Quay lại · Chia sẻ |
| State | Loading · Default · **Host chưa có listing đang hiển thị** (EmptyState "Host chưa có chỗ ở nào đang mở") · **Host không tồn tại/bị khoá** (404) · Lỗi tải · Không hiển thị email/SĐT/giấy tờ (bất kỳ trạng thái nào) |
```
🖥 Desktop                                                📱 Mobile
┌─────────────────────────────────────────────┐  ┌──────────────────────────┐
│ ┌────────────┐  Nguyễn Văn A  ✓ Đã xác minh │  │      ( ▢ ảnh )           │
│ │  ( ▢ ảnh ) │  Tham gia từ 03/2026         │  │  Nguyễn Văn A ✓          │
│ │            │  3 chỗ ở đang mở             │  │  Tham gia 03/2026 · 3 chỗ ở│
│ └────────────┘  Giới thiệu: …               │  │  Giới thiệu …            │
│ Chỗ ở của Nguyễn Văn A (3)                   │  │ Chỗ ở của Nguyễn Văn A   │
│ [▢ thẻ] [▢ thẻ] [▢ thẻ]                      │  │ [▢ thẻ dọc] [▢ thẻ dọc]   │
└─────────────────────────────────────────────┘  └──────────────────────────┘
```
Tablet: lưới 2 cột.

### P05 · Chính sách huỷ
| Mục | Giá trị |
|---|---|
| Route / Role | `/cancellation-policies` (anchor `#flexible` / `#moderate` / `#strict`) · Khách vãng lai, Guest, Host |
| Component | Tabs/Anchor 3 chính sách, CMP-27 **PolicyTimeline** (đường thời gian trực quan) + **PolicyTable** (cột: Thời điểm huỷ · Tiền phòng · Phí vệ sinh · Phí dịch vụ Guest), mục "Trường hợp đặc biệt" (Host huỷ, bất khả kháng), giải thích "Thời điểm tính theo giờ check-in của listing", CMP-08 |
| Action | Chuyển tab/anchor · Quay lại listing (nếu đến từ P03: nút "← Về chỗ ở") · Chia sẻ link |
| State | Loading (skeleton bảng) · Default · **Highlight chính sách của listing đang xem** (huy hiệu "Áp dụng cho chỗ ở này") · Lỗi tải (có nội dung dự phòng tĩnh?*) · Anchor không hợp lệ → mặc định tab đầu |
\* Đề xuất: dữ liệu từ `CancellationPolicy` (seed), không hard-code ở FE.
```
🖥 Desktop                                           📱 Mobile
┌──────────────────────────────────────────────┐  ┌──────────────────────────┐
│ Chính sách huỷ                                │  │ Chính sách huỷ           │
│ [ Linh hoạt ] Trung bình  Nghiêm ngặt          │  │ [Linh hoạt|Trung bình|NN]│
│ Timeline:                                     │  │ Timeline (dọc)           │
│  ──●────────────●───────────●──────▶          │  │ ● ≥24 giờ: hoàn 100%     │
│    ≥24h        <24h      sau check-in         │  │ ● <24 giờ: …             │
│    100%        −đêm đầu   chỉ đêm chưa ở       │  │ ● Sau check-in: …        │
│ ┌───────────┬────────┬────────┬───────────┐   │  │ ▸ Xem bảng chi tiết      │
│ │ Thời điểm │ Tiền phòng│ Phí VS │ Phí DV    │   │  │  (thẻ cho từng mốc)       │
│ └───────────┴────────┴────────┴───────────┘   │  │ Trường hợp đặc biệt ▸     │
│ Trường hợp đặc biệt: Host huỷ · Bất khả kháng │  └──────────────────────────┘
└──────────────────────────────────────────────┘
```

---

