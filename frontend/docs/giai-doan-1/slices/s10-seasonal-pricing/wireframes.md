## S10 · Giá theo mùa, lễ, ngày đặc biệt

### H08 · Giá theo mùa/lễ/ngày đặc biệt
| Mục | Giá trị |
|---|---|
| Route / Role | `/host/listings/:id/pricing-rules` · Host (listing Đang hiển thị / Tạm ẩn) [Assumption] |
| Component | Khối **Thứ tự ưu tiên giá** (4 bậc: Đặc biệt/Lễ → Mùa → Cuối tuần → Cơ bản; sau cùng giảm tuần/tháng) dạng stepper dọc, ô **Giá cuối tuần** (kèm "Đêm áp dụng: Thứ Sáu, Thứ Bảy – theo cấu hình quốc gia"), DataTable/ListCards **Quy tắc giá** (Tên, Loại, Khoảng ngày, Giá/đêm, Trạng thái ⏳sắp tới/●đang áp dụng/⌛đã qua), Modal/Sheet **Thêm-sửa quy tắc**, CMP-23 **Lịch giá** (mỗi ô: giá + nhãn nguồn), CMP-25 xoá, CMP-32 |
| Action | Sửa giá cuối tuần · Thêm quy tắc (Mùa/Lễ/Đặc biệt) · Sửa · Xoá · Xem lịch giá theo tháng · Bấm một ngày → tooltip "Giá 1.800.000 – nguồn: Lễ 30/4" · Lọc theo loại |
| State | **Loading** · **Default** · **Rỗng** (chưa có quy tắc: "Chỉ dùng giá cơ bản và cuối tuần") · **Modal: Default/Validating/Submitting/Lỗi trường (giá ≤ 0, ngày kết thúc < bắt đầu, ngày quá khứ)/Trùng cùng nhóm ưu tiên (liệt kê quy tắc xung đột) [Assumption A6]/Lưu thành công** · **Cảnh báo ảnh hưởng** ("Quy tắc này thay đổi giá của 5 đêm đã có booking? – không ảnh hưởng booking cũ" 🔒 Phase sau) · **Lịch giá loading** · **Lỗi tải/lưu** · **Offline** |

🖥 Desktop
```
┌────────┬───────────────────────────────────────────────────────────────────────┐
│ Sidebar│ ← Nhà trên đồi Đà Lạt · Giá          [Lịch →]                           │
│        │ Thứ tự áp dụng: ① Đặc biệt/Lễ → ② Mùa → ③ Cuối tuần → ④ Cơ bản → giảm tuần/tháng│
│        │ ┌─ Giá cơ bản & cuối tuần ───────────────────────────────────────┐   │
│        │ │ Giá cơ bản 1.200.000₫ [Sửa ở bước 6]  Cuối tuần [1.500.000]₫    │   │
│        │ │ ⓘ Áp dụng cho đêm Thứ Sáu và Thứ Bảy                           │   │
│        │ └────────────────────────────────────────────────────────────────┘   │
│        │ Quy tắc giá                                  [+ Thêm quy tắc] [Loại ▼]│
│        │ ┌──────────┬────────┬───────────────┬──────────┬────────┬───┐       │
│        │ │ Tên      │ Loại   │ Khoảng ngày   │ Giá/đêm  │ Trạng thái│ ⋮ │       │
│        │ ├──────────┼────────┼───────────────┼──────────┼────────┼───┤       │
│        │ │ Tết 2027 │ Lễ     │ 05/02–12/02   │ 2.400.000│ ⏳ Sắp tới│ ⋮ │       │
│        │ │ Mùa hè   │ Mùa    │ 01/06–31/08   │ 1.600.000│ ⌛ Đã qua│ ⋮ │       │
│        │ └──────────┴────────┴───────────────┴──────────┴────────┴───┘       │
│        │ Lịch giá  ‹ Tháng 2/2027 ›   Chú thích: [Lễ][Mùa][Cuối tuần][Cơ bản]    │
│        │ │ 5 │ 6 │ 7 │ 8 │…  mỗi ô: số ngày + giá (k) + chấm màu nguồn          │
└────────┴───────────────────────────────────────────────────────────────────────┘
Modal "Thêm quy tắc": Loại (◉Lễ ○Mùa ○Ngày đặc biệt) · Tên · Khoảng ngày [DateRange] · Giá/đêm [___]₫ · [Huỷ][Lưu]
```
📱 Mobile
```
┌──────────────────────────────┐
│ ←  Giá · Nhà trên đồi         │
│ [Lịch] [Giá theo mùa]         │
│ Thứ tự áp dụng ▸ (gập)        │
│ Cơ bản 1.200.000₫  Sửa ở B6 → │
│ Cuối tuần [1.500.000]₫        │
│ Quy tắc giá          [+ Thêm] │
│ ┌──────────────────────────┐ │
│ │ Tết 2027 · Lễ   ⏳ Sắp tới │ │
│ │ 05/02–12/02 · 2.400.000₫ ⋮│ │
│ └──────────────────────────┘ │
│ Lịch giá (cuộn dọc theo tháng)│
└──────────────────────────────┘
 Thêm/Sửa → bottom sheet cao 90%
```

---

