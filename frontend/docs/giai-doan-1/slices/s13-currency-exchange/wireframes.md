## S13 · Tiền tệ hiển thị và tỷ giá (mở rộng C02, P02, P03)

| Vị trí | Thay đổi UI | State bổ sung |
|---|---|---|
| Header (Public/Account) | `₫ VND ▼` mở dropdown (Desktop) / bottom sheet (Mobile) liệt kê tiền tệ được hỗ trợ + ô tìm | Đang tải tỷ giá · Lỗi tỷ giá (dùng tiền tệ listing + toast) |
| C02 | Bật ô "Tiền tệ hiển thị" (đã chừa chỗ từ S02) | Chưa có lựa chọn → mặc định VND |
| P02 thẻ listing | Giá = giá quy đổi, tiền tố "≈", tooltip "Giá gốc 5.300.000 ₫ · Tỷ giá ngày dd/mm" | **Tỷ giá quá hạn** → hiển thị tiền tệ listing + banner trên cùng kết quả |
| P03 thẻ đặt phòng/PriceBreakdown | Mỗi dòng quy đổi; dòng cuối: "Giá quy đổi chỉ để tham khảo. Bạn sẽ thanh toán bằng {tiền tệ listing/cổng}" | Như trên + **làm tròn theo từng loại tiền** (VND 0 chữ số thập phân, USD 2…) |
```
 Dropdown tiền tệ (🖥)                       Bottom sheet (📱)
 ┌────────────────────┐                      ┌──────────────────────────┐
 │ 🔍 Tìm tiền tệ      │                      │ Tiền tệ hiển thị      ✕  │
 │ ◉ ₫ VND – Đồng VN   │                      │ 🔍 Tìm                    │
 │ ○ $ USD – Đô la Mỹ  │                      │ ◉ ₫ VND  ○ $ USD  ○ € EUR │
 │ ○ € EUR – Euro      │                      │ ⓘ Giá quy đổi tham khảo   │
 │ ⓘ Tỷ giá cập nhật   │                      │ [      Áp dụng        ]   │
 │   theo ngày         │                      └──────────────────────────┘
 └────────────────────┘
```

