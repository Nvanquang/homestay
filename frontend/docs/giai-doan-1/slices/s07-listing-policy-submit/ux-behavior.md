## S07 · Chính sách huỷ, kiểu đặt, giấy tờ, gửi duyệt, trạng thái

- **Chọn chính sách**: thẻ radio có tóm tắt 1 dòng; "Xem bảng mốc hoàn tiền" mở modal (bảng từ API `CancellationPolicy`, không hard-code); chọn lại được bất kỳ lúc nào ở nháp. Chú thích: "Thay đổi sau này chỉ áp dụng cho booking mới" (BR-LST-03).
- **Kiểu đặt**: giải thích hậu quả từng lựa chọn ngay trong thẻ (Instant: khách thanh toán ngay; Request: bạn có 24 giờ phản hồi, khách chưa bị trừ tiền).
- **Bước 8 – điều kiện gửi duyệt**:
  - Checklist lấy từ API kiểm tra đủ điều kiện (nguồn sự thật = BE); FE chỉ hiển thị. Mỗi mục thiếu có link nhảy tới đúng bước ("Cần thêm 2 ảnh (3/5) → Đi tới bước 3").
  - Nút **Gửi duyệt** disabled khi còn mục thiếu; mục thiếu đầu tiên được focus khi bấm nút bằng bàn phím giả lập; Host chưa xác minh → mục đầu "Hồ sơ xác minh chưa được duyệt → H02".
  - Danh sách loại giấy tờ bắt buộc **động theo quốc gia** (BE trả danh sách) – FR-LST-06.
  - Bấm Gửi duyệt → ConfirmDialog tóm tắt ("Sau khi gửi bạn không thể chỉnh sửa cho tới khi có kết quả") → loading → chuyển H05 + toast. Lỗi BE từ chối → hiển thị lý do chính xác từ API ở checklist (ưu tiên hơn FE).
- **H05**:
  - Chờ duyệt: refetch khi quay lại tab (không polling dày); hiển thị "Đã gửi {thời điểm tương đối}".
  - **Cần chỉnh sửa/Bị từ chối**: khối lý do liệt kê **theo mục** (ảnh, mô tả, giấy tờ, giá, vị trí, khác); mỗi mục có nút nhảy đến bước tương ứng; nút "Sửa & gửi lại" mở bước đầu tiên bị nêu. Trong lúc sửa, trạng thái vẫn là Cần chỉnh sửa/Bị từ chối (banner "Đang sửa theo yêu cầu"); gửi lại ở bước 8.
  - Lịch sử các lần gửi: danh sách rút gọn (lần, ngày, kết quả), bấm mở lý do cũ.
  - Đang hiển thị: nút "Xem trang công khai" (mở P03 tab mới), "Lịch", "Giá theo mùa".
  - Bị khoá: chỉ đọc + lý do + "Liên hệ hỗ trợ".

---

