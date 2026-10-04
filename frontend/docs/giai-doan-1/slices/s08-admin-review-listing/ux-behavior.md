## S08 · Admin duyệt listing lần đầu (A04)

- Hàng đợi, khoá bản ghi, heartbeat, mất khoá, 409: **giống A03** (dùng lại logic).
- **Cảnh báo trùng địa chỉ (BR-LST-06)**: banner vàng ở đầu chi tiết + link mở listing/Host trùng (tab mới). Duyệt khi có cảnh báo → bắt buộc tick "Tôi đã kiểm tra cảnh báo trùng địa chỉ".
- **Rà soát**: tab **Nội dung / Ảnh / Giấy tờ / Giá & chính sách**; tab **Thay đổi** (so sánh cũ/mới) hiển thị disabled kèm tooltip (S08 ghi chú). Admin thấy **địa chỉ chính xác** + mini map; xem giấy tờ theo cơ chế che-mờ-có-log (như A03).
- "Xem như khách": mở P03 ở **chế độ xem trước** trong tab mới.
- **Quyết định**:
  - **Duyệt** → Listing "Đang hiển thị", email Host.
  - **Yêu cầu chỉnh sửa**: tick các mục cần sửa (Ảnh, Mô tả, Giấy tờ, Giá, Vị trí, Khác) + ghi chú **bắt buộc** cho từng mục tick (≥ 10 ký tự). Dữ liệu này đi thẳng tới khối lý do ở H05.
  - **Từ chối**: lý do + ghi chú bắt buộc.
  - Hậu quả hiển thị rõ trong dialog ("Host sẽ nhận email và có thể sửa rồi gửi lại").
- Sau quyết định: toast + (tuỳ chọn) tự mở listing kế tiếp; hàng đợi cập nhật không cần tải lại.

---

