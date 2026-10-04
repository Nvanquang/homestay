## S11 · Trang chủ và tìm kiếm

### P01 · Trang chủ
| Mục | Giá trị |
|---|---|
| Route / Role | `/` · Khách vãng lai, Guest (Host ở chế độ Guest) |
| Component | Public Shell, Hero + CMP-18 SearchBar (Đi đâu · Ngày · Khách), CMP-16, CMP-17, danh sách **Điểm đến phổ biến** (từ Location seed + số listing), **Chỗ ở nổi bật** (CMP-19 carousel), banner "Trở thành Host" → P10, khối Cách hoạt động (3 bước), Footer |
| Action | Nhập/chọn điểm đến (gợi ý) · Chọn ngày · Chọn khách · **Tìm** · Bấm điểm đến phổ biến · Bấm thẻ listing · Bấm "Trở thành Host" |
| State | **Loading** (skeleton hero + carousel) · **Default** · **SearchBar: rỗng / đang gợi ý / không có gợi ý / ngày không hợp lệ / thiếu điểm đến** · **Không có listing nổi bật** (ẩn khối, không hiển thị rỗng) · **Lỗi tải khối** (từng khối tự thử lại, không phá trang) · **Offline** |

🖥 Desktop
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ◈ Logo                       Trở thành Host   VI▼  ₫▼  👤▼                  │
├──────────────────────────────────────────────────────────────────────────┤
│                  Tìm chỗ ở như người bản địa                              │
│ ┌──────────────────────┬──────────────────┬──────────────┬───────────┐   │
│ │ Đi đâu               │ Nhận – Trả phòng │ Khách        │ [ 🔍 Tìm ] │   │
│ │ [Đà Lạt, Lâm Đồng___]│ [12/12 → 15/12]  │ [2 người lớn]│           │   │
│ └──────────────────────┴──────────────────┴──────────────┴───────────┘   │
│ Điểm đến phổ biến                                                         │
│  [▢ Đà Lạt 120+] [▢ Hội An 85] [▢ Sa Pa 60] [▢ Vũng Tàu 74]               │
│ Chỗ ở nổi bật  ‹ ▢ ▢ ▢ ▢ ›                                                │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ Bạn có chỗ ở? Trở thành Host                       [ Bắt đầu ]     │    │
│ └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile
```
┌──────────────────────────────┐
│ ◈ Logo              VI▼  ☰   │
│ ┌──────────────────────────┐ │
│ │ 🔍 Bạn muốn đi đâu?       │ │ ← bấm → mở full-screen: Điểm đến › Ngày › Khách
│ │ Ngày bất kỳ · Thêm khách  │ │
│ └──────────────────────────┘ │
│ Điểm đến phổ biến →(cuộn ngang)│
│ [▢Đà Lạt][▢Hội An][▢Sa Pa]    │
│ Chỗ ở nổi bật → (carousel)     │
│ [ Banner Trở thành Host ]     │
├──────────────────────────────┤
│ 🔍Khám phá ♡ ✈ ✉ 👤           │
└──────────────────────────────┘
```
Tablet: SearchBar 1 hàng thu gọn, lưới điểm đến 3 cột.
SearchBar mobile (full-screen 3 bước, có thể chạm bước bất kỳ): `Đi đâu` (ô tìm + gợi ý + "Gần tôi"*) → `Ngày` (CMP-16 1 tháng cuộn dọc) → `Khách` (CMP-17) → nút **Tìm** sticky đáy.

### P02 · Kết quả tìm kiếm (danh sách + bản đồ)
| Mục | Giá trị |
|---|---|
| Route / Role | `/search?destination=&checkin=&checkout=&adults=&children=&sort=&price=&type=&bedrooms=&amenities=&instant=&policy=&bbox=` · Khách vãng lai, Guest |
| Component | CMP-18 SearchBar thu gọn, hàng **FilterChip** (Giá, Loại hình, Phòng ngủ, Tiện nghi, Instant Book, Chính sách huỷ, [Đánh giá 🔒]), nút **Bộ lọc** (CMP-20 FilterPanel), Select **Sắp xếp** (Liên quan, Giá ↑, Giá ↓, [Đánh giá 🔒], Mới nhất), tổng số kết quả, CMP-19 ×N, CMP-21 MapPanel + nút "Tìm trong khu vực này" + công tắc "Tìm khi di chuyển bản đồ", chip "Khu vực bản đồ ✕", phân trang "Hiển thị thêm" |
| Action | Đổi điểm đến/ngày/khách · Mở/đóng/Áp dụng/Xoá bộ lọc · Đổi sắp xếp · Di chuyển/zoom/vẽ vùng bản đồ · Bấm marker (popup thẻ) · Hover thẻ ↔ marker sáng lên · Bấm thẻ → P03 (giữ ngày/khách) · Chuyển Danh sách ⇄ Bản đồ (mobile) · Xoá tất cả bộ lọc |
| State (trang) | **Loading lần đầu** (skeleton thẻ + map placeholder) · **Loading cập nhật** (giữ kết quả cũ mờ 60% + thanh tiến trình trên, tránh nhảy layout) · **Có kết quả** · **Hết kết quả khi tải thêm** ("Bạn đã xem hết") · **0 kết quả** (EmptyState + gợi ý: Bỏ bớt bộ lọc [liệt kê chip], Đổi ngày, Mở rộng bản đồ, Xem khu vực lân cận) · **Lỗi** (Thử lại, giữ tham số) · **Offline** · **Ngày không hợp lệ** (check-out ≤ check-in → lỗi ở SearchBar) · **Không có token Mapbox/lỗi bản đồ** (ẩn bản đồ, banner nhỏ "Bản đồ tạm không khả dụng", danh sách dùng bình thường, bỏ nút Bản đồ) |
| State (giá trên thẻ) | **Có ngày** → "5.300.000 ₫ tổng · 3 đêm" + dòng nhỏ "Đã gồm phí và thuế" + "1.766.000 ₫/đêm" · **Chưa chọn ngày** → "Từ 1.200.000 ₫/đêm" · **Giá quy đổi** (S13) → nhãn "≈" + tooltip tiền tệ gốc · **Giá đang tính** (skeleton dòng giá) |
| State (thẻ) | Default · Hover · Loading ảnh (blur placeholder) · Lỗi ảnh (ảnh mặc định) · Nhãn "Instant Book" |

🖥 Desktop (≥1024: danh sách trái 55% – bản đồ phải 45%, sticky)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◈ Logo  [Đà Lạt │ 12/12–15/12 │ 2 người lớn │🔍]          VI▼ ₫▼ 👤▼            │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Giá ▼][Loại hình ▼][Phòng ngủ ▼][Tiện nghi ▼][⚡Instant][Chính sách ▼][Bộ lọc(2)]│
│ 48 chỗ ở · Sắp xếp [Liên quan ▼]  [x] Tìm khi di chuyển bản đồ                  │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────────┐ │
│ │ ┌────────┐ Nhà trên đồi · Nguyên căn │ │          B Ả N   Đ Ồ              │ │
│ │ │ ▢ ◂ ▸  │ Phường 3, Đà Lạt · 4 khách │ │     (5,3tr)   (4,8tr)            │ │
│ │ └────────┘ 2 PN · 3 giường  ⚡Instant │ │          ● (6,1tr)               │ │
│ │            5.300.000 ₫ tổng · 3 đêm   │ │  (2,2tr)                         │ │
│ │            Đã gồm phí và thuế         │ │              [Tìm trong khu vực này]│ │
│ ├──────────────────────────────────────┤ │  [+][−]                          │ │
│ │ ┌────────┐ Phòng riêng view núi …    │ └──────────────────────────────────┘ │
│ │ └────────┘                           │                                       │
│ │ [ Hiển thị thêm ]                    │                                       │
│ └──────────────────────────────────────┘                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile (mặc định Danh sách; nút nổi **Bản đồ** ⇄ **Danh sách**)
```
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ ←  Đà Lạt · 12/12–15/12 · 2  │      │ ←  Đà Lạt · 12/12–15/12 · 2  │
│ [Sắp xếp ▼]      [⚙ Lọc (2)] │      │ ┌──────────────────────────┐ │
│ 48 chỗ ở                      │      │ │       BẢN ĐỒ toàn màn    │ │
│ ┌──────────────────────────┐ │      │ │   (5,3tr) (4,8tr)        │ │
│ │ ▢ ◂ ▸  ♡🔒              │ │      │ │         ●                │ │
│ │ Nhà trên đồi · Nguyên căn │ │      │ │ [Tìm trong khu vực này]  │ │
│ │ Phường 3, Đà Lạt          │ │      │ └──────────────────────────┘ │
│ │ 5.300.000 ₫ tổng · 3 đêm  │ │      │ ┌ thẻ marker được chọn ────┐ │
│ │ Đã gồm phí và thuế        │ │      │ │ ▢ Nhà trên đồi 5,3tr     │ │
│ └──────────────────────────┘ │      │ └──────────────────────────┘ │
│            [ 🗺 Bản đồ ]      │      │            [ ☰ Danh sách ]   │
└──────────────────────────────┘      └──────────────────────────────┘
```
Bộ lọc (Desktop = Modal 640px; Mobile = full-screen sheet có header [✕ Xoá tất cả] và footer sticky **[Hiển thị 48 kết quả]** – số cập nhật theo lựa chọn):
```
┌ Bộ lọc ─────────────────────────────────────────── ✕ ┐
│ Khoảng giá/đêm   [min 0 ₫]──●──────●──[max 5.000.000 ₫]│
│ Loại hình        ( ) Tất cả (●) Nguyên căn ( ) Phòng riêng│
│ Phòng ngủ        [Bất kỳ][1][2][3][4+]                   │
│ Tiện nghi        [x] Wi-Fi [x] Bếp [ ] Hồ bơi  Xem thêm ▾│
│ Đặt phòng        [ ] Chỉ Instant Book                    │
│ Chính sách huỷ   [ ] Linh hoạt [ ] Trung bình [ ] Nghiêm ngặt│
│ (🔒 Điểm đánh giá – ẩn đến khi có đánh giá)               │
│ [ Xoá tất cả ]                       [ Hiển thị 48 kết quả ]│
└──────────────────────────────────────────────────────────┘
```
Tablet: danh sách 1 cột + bản đồ thu thành bảng trượt hoặc chuyển đổi như mobile (<900px), thẻ ngang.

---

