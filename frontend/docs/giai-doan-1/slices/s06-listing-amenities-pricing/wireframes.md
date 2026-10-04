## S06 · Tiện nghi, quy tắc lưu trú, giá & phí

#### Bước 4 · Tiện nghi
Component: CMP-29 AmenityPicker (tìm kiếm; nhóm: Thiết yếu, Phòng bếp, Giải trí, An toàn, Ngoài trời…; chọn bằng checkbox thẻ), bộ đếm đã chọn.
State: Loading danh mục (skeleton) · Default · Đang tìm (lọc tại chỗ) · Không có kết quả tìm · Lỗi tải danh mục (Thử lại) · Đã chọn ≥1.
```
🖥 Desktop (lưới 3 cột)                              📱 Mobile (1 cột, nhóm gập)
 [🔍 Tìm tiện nghi]            Đã chọn 6              [🔍 Tìm]            Đã chọn 6
 ▾ Thiết yếu                                           ▾ Thiết yếu
  [x] Wi-Fi  [x] Điều hoà  [ ] Máy nước nóng             [x] Wi-Fi
 ▾ Phòng bếp                                              [x] Điều hoà
  [x] Bếp    [ ] Tủ lạnh  [ ] Lò vi sóng                  [ ] Máy nước nóng
                                                        ▸ Phòng bếp (1)
```

#### Bước 5 · Quy tắc lưu trú
Component: CMP-06 (Đêm tối thiểu, Đêm tối đa, Thời gian chuẩn bị giữa 2 booking [đêm], Báo trước tối thiểu [ngày/giờ], Giới hạn đặt xa nhất [tháng]), CMP-02 Nội quy (hút thuốc, thú cưng, tiệc tùng, giờ yên tĩnh – chọn Có/Không + ghi chú), CMP-08 giải thích.
State: Default · **Lỗi chéo trường** (tối thiểu > tối đa → cả hai ô viền đỏ + dòng lỗi) · Lỗi trường · Đang lưu/Đã lưu.
```
 Đêm tối thiểu [−] 1 [+]      Đêm tối đa [−] 30 [+]
 ✕ Đêm tối thiểu không được lớn hơn đêm tối đa             ← lỗi chéo
 Thời gian chuẩn bị giữa hai booking   [Không ▼ | 1 đêm | 2 đêm]   ⓘ
 Báo trước tối thiểu    [Cùng ngày ▼]   Đặt xa nhất [12 tháng ▼]
 Nội quy:  Hút thuốc (○ Có ◉ Không)  Thú cưng (○ Có ◉ Không)  Tiệc (○ Có ◉ Không)
           Giờ yên tĩnh [22:00 ▼] – [07:00 ▼]    Ghi chú thêm [____________]
```
(Desktop: hai cột nhãn–ô; Mobile: 1 cột, mỗi nhóm trong thẻ riêng.)

#### Bước 6 · Giá & phí + Bảng giá xem trước
Component: CMP-02 số tiền có hậu tố tiền tệ (Giá cơ bản/đêm; Phí vệ sinh [1 lần/booking]; Phụ thu thêm khách: *Số khách tính giá cơ bản* + *Mức phụ thu mỗi khách thêm/đêm*; Giảm tuần [%, từ 7 đêm]; Giảm tháng [%, từ 28 đêm]), **CMP-22 PriceBreakdown (xem trước)** kèm CMP-16 chọn ngày ví dụ + CMP-17 số khách ví dụ.
Action: Nhập giá · Đổi ngày/khách ví dụ · Mở rộng "giá từng đêm" · Tiếp tục.
State: Default · **Preview loading** (skeleton, gọi PricingEngine) · **Preview OK** · **Preview lỗi** (Thử lại) · **Chưa đủ dữ liệu** ("Nhập giá cơ bản để xem trước") · **Lỗi trường** (giá ≤ 0, % ngoài 0–100, giảm tháng < giảm tuần → cảnh báo mềm) · **Ngày ví dụ vi phạm đêm tối thiểu/tối đa** (hiển thị lý do trong preview).
```
🖥 Desktop (form trái – preview phải, sticky)          📱 Mobile (preview nằm cuối, thu gọn)
┌───────────────────────────┬──────────────────────┐   ┌──────────────────────────┐
│ Giá cơ bản/đêm  [1.200.000]₫│ XEM TRƯỚC BẢNG GIÁ   │   │ Giá cơ bản/đêm [1.200.000]₫│
│ Phí vệ sinh     [  200.000]₫│ Ngày [12/12 – 15/12]  │   │ Phí vệ sinh    [  200.000]₫│
│ Phụ thu thêm khách          │ Khách [ 5 ▼ ]         │   │ Phụ thu thêm khách …       │
│  Giá cho [ 2 ] khách đầu    │ ────────────────────  │   │ Giảm tuần [10]% / tháng [20]%│
│  Mỗi khách thêm [100.000]₫  │ 3 đêm × 1.200.000  3,6tr│   │ ▾ Xem trước bảng giá       │
│ Giảm tuần  [10]% (≥7 đêm)   │ Phụ thu (3 khách thêm   │   │ ┌──────────────────────┐ │
│ Giảm tháng [20]% (≥28 đêm)  │  × 3 đêm)          900k│   │ │ Ngày [12/12–15/12]   │ │
│ ⓘ Đủ cả hai ngưỡng → áp     │ Phí vệ sinh        200k│   │ │ 3 đêm × 1.200.000 3,6tr│ │
│   mức giảm tháng            │ Giảm giá            0  │   │ │ …                    │ │
│                             │ ▸ Giá từng đêm          │   │ │ Tổng tiền host đặt 4,7tr│ │
│                             │ Tổng               4,7tr│   │ └──────────────────────┘ │
│                             │ ⓘ Phí dịch vụ & thuế    │   └──────────────────────────┘
│                             │  sẽ hiển thị khi khách xem│
└───────────────────────────┴──────────────────────┘
```
Ghi chú thiết kế: preview ở bước 6 chỉ thể hiện các khoản **Host kiểm soát**; phí dịch vụ & thuế do nền tảng cấu hình và chỉ hiện ở P03 (xem A9 trong 01-user-flow).

---

