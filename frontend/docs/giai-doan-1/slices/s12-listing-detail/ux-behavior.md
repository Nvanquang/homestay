## S12 · Chi tiết listing, hồ sơ Host, chính sách huỷ

**P03**
- **Gallery**: desktop lưới 1+4 → "Xem tất cả ảnh" mở lightbox (← → Esc, đếm "3/12"); mobile carousel vuốt + chạm mở lightbox có pinch-zoom; nút Back của trình duyệt **đóng lightbox** (đẩy một mục lịch sử khi mở).
- **Thẻ đặt phòng**:
  - Khởi tạo ngày/khách từ URL; đổi ngày/khách → cập nhật URL (`replace`) và gọi báo giá (debounce 300 ms, huỷ request cũ).
  - Date picker hiển thị **ngày không trống bị gạch**, ngày vi phạm quy tắc có tooltip lý do; chọn khoảng vi phạm **đêm tối thiểu/tối đa/báo trước** → thông báo inline cụ thể ("Chỗ ở này yêu cầu tối thiểu 2 đêm") và **không** gọi báo giá.
  - Khoảng ngày không còn trống (ví dụ vừa bị đặt) → lỗi + gợi ý "Khoảng trống gần nhất: 20–23/12".
  - GuestPicker chặn tăng khi đạt sức chứa; dòng chú thích "Tối đa 4 khách".
  - Bảng giá: các dòng theo thứ tự tiền phòng → phụ thu → phí vệ sinh → giảm giá (số âm) → phí dịch vụ → thuế → **Tổng**; "Xem giá từng đêm" mở rộng; hiển thị "Đã gồm phí và thuế" (BR-PRC-06). Giá chưa tính xong → skeleton từng dòng.
  - **CTA giai đoạn 1**: nút "Đặt phòng"/"Gửi yêu cầu" (tuỳ kiểu đặt) **disabled** với tooltip/chú thích "Đặt phòng sẽ sớm ra mắt" (`bookingEnabled=false`). Khi bật: kiểm tra đăng nhập → returnTo → luồng đặt (ngoài phạm vi).
  - Mobile: thanh đáy hiển thị tổng giá (hoặc "Từ …/đêm") + nút; "Chi tiết ▲" mở sheet đầy đủ; thanh ẩn khi sheet/bàn phím mở.
- **Quyền riêng tư địa chỉ (BR-SRC-04)**: chỉ hiển thị khu vực xấp xỉ + bản đồ vòng tròn; không hiển thị toạ độ chính xác, không có nút "Chỉ đường" ở giai đoạn này.
- **Chế độ xem trước** (Host chủ listing, Admin): banner vàng cố định; mọi dữ liệu là bản đang xem (nháp/chờ duyệt); không thể chia sẻ; người khác truy cập listing chưa công khai → trang 404 "Chỗ ở này hiện không khả dụng".
- **Chia sẻ**: mobile dùng Web Share API; desktop sao chép liên kết + toast "Đã sao chép".
- **Tối ưu chia sẻ/SEO**: `<title>`, mô tả, ảnh Open Graph, canonical; liên kết chia sẻ **không** kèm thông tin riêng tư.
- **Mục Đánh giá**: "Chưa có đánh giá" (giai đoạn 1).
- Điều hướng "Quay lại kết quả": trở về P02 với **cùng bộ lọc và vị trí cuộn**.

**P04**: chỉ hiển thị listing **Đang hiển thị**; thông tin riêng tư (email, SĐT, giấy tờ) **không** bao giờ xuất hiện; Host bị khoá/không tồn tại → 404; chỉ số phản hồi/đánh giá ẩn đến khi có dữ liệu.

**P05**: lấy bảng mốc từ API; anchor theo `#flexible|#moderate|#strict`; nếu mở từ P03 → tab mặc định là chính sách của listing, gắn nhãn "Áp dụng cho chỗ ở này", có nút "← Về chỗ ở". Dòng ghi chú cố định: "Thời điểm tính theo giờ check-in của chỗ ở".

---

