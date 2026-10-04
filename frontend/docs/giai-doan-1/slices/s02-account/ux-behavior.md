## S02 · Hồ sơ và cài đặt

**Hồ sơ (C01)**
- Ảnh đại diện: chọn → cắt vuông (kéo/zoom) → xem trước → Lưu; JPG/PNG/WebP ≤ 5 MB [A5]; có "Xoá ảnh". Lỗi định dạng/kích thước hiện ngay dưới ô, không gọi API.
- Họ tên 2–80; SĐT (tuỳ chọn) chuẩn hoá +84/0…, không xác minh qua SMS (FR-ACC-01); Giới thiệu ≤ 300.
- Email **chỉ đọc** (đổi email ngoài phạm vi giai đoạn 1); hiển thị "✓ Đã xác minh".
- Nút Lưu chỉ bật khi dirty; Huỷ khôi phục giá trị đã lưu; thay đổi dirty + rời trang → ConfirmDialog.
- Khối "Xác minh danh tính": hiển thị badge trạng thái (xem 0.5 wireframe) và CTA tương ứng (Chưa nộp → "Xác minh ngay", Bị từ chối → "Xem lý do & nộp lại").

**Cài đặt (C02)**
- **Đổi ngôn ngữ**: áp dụng **tức thì** (không reload): tải gói ngôn ngữ, đổi nhãn, định dạng ngày/số, `html lang`; gọi API lưu (optimistic; lỗi → hoàn lại ngôn ngữ cũ + toast lỗi). Toast: "Đã đổi sang English. Email gửi sau đó sẽ dùng ngôn ngữ này."
- **Đổi mật khẩu**: cần mật khẩu hiện tại; mật khẩu mới ≠ mật khẩu cũ; sau thành công xoá cả 3 ô, hiện banner "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất" (S02 AC); phiên hiện tại giữ nguyên. Sai mật khẩu cũ → lỗi tại ô đó, không xoá ô khác.
- **Chế độ Host**: công tắc **một chiều** ở giai đoạn 1 [A11]: Bật → toast + menu Host xuất hiện + (nếu chưa duyệt) banner cố định "Hoàn tất xác minh để tạo listing →H02"; sau khi bật, công tắc đổi thành dòng trạng thái "Đã bật chế độ Host" (việc chuyển qua lại giữa **hiển thị** Guest/Host dùng bộ chuyển ở header – FR-ACC-02).
- Khối Tiền tệ: ở giai đoạn 1 hiển thị disabled kèm "Sắp có"; bật ở S13.

---

