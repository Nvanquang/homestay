# Hành Trình Xuyên Slice (E2E User Journeys J1–J5)

## 5. Hành trình xuyên slice (kiểm thử nghiệm thu giai đoạn)

| # | Hành trình | Slice đi qua | Kết quả kỳ vọng |
|---|---|---|---|
| J1 | Người mới → Host đăng tin đầu tiên → hiển thị | S01→S04→S05→S06→S07→S08 | Listing xuất hiện trong P02 |
| J2 | Guest tìm → xem chi tiết → thấy giá tổng | S11→S12→S13 | Giá tổng = tiền phòng + phụ thu + phí vệ sinh − giảm giá + phí dịch vụ + thuế |
| J3 | Host bị từ chối → sửa → gửi lại → được duyệt | S07→S08 | Lý do hiện đúng, lần gửi lại vào hàng đợi |
| J4 | Host chặn ngày → Guest không còn thấy listing khi tìm đúng ngày đó | S09→S11 | Listing biến mất khỏi kết quả |
| J5 | Host đặt giá lễ → Guest thấy giá lễ ở đúng đêm | S10→S11/S12 | Giá đêm đúng thứ tự ưu tiên |

---
