## S13 · Tiền tệ hiển thị và tỷ giá

- **Chọn tiền tệ**: header (mọi trang) hoặc C02; mở dropdown/sheet có ô tìm; chọn → áp dụng **ngay** cho toàn trang: gửi lại các truy vấn giá với `currency` mới (BE quy đổi và làm tròn), **skeleton chỉ ở các dòng giá**, phần còn lại giữ nguyên.
- Đã đăng nhập: lưu vào User; chưa đăng nhập: lưu cục bộ. Lần truy cập sau tự áp dụng.
- **Nhãn bắt buộc** (BR-SRC-05, S13 AC): mọi giá quy đổi có tiền tố "≈" + tooltip/dòng chú thích "Giá quy đổi, chỉ để tham khảo. Tiền tệ của chỗ ở: VND. Tỷ giá ngày dd/mm/yyyy"; ở bảng giá chi tiết (P03) hiển thị **thêm** số tiền theo tiền tệ listing.
- **Tỷ giá lỗi/quá hạn**: BE trả cờ `fxStale`/`fxUnavailable` → hiển thị **tiền tệ của listing** + banner nhỏ "Chưa thể quy đổi tiền tệ, đang hiển thị theo VND"; bộ chọn tiền tệ disabled cho tới khi phục hồi.
- Làm tròn theo loại tiền do BE xử lý; FE chỉ **định dạng** theo tiền tệ và ngôn ngữ.

---

