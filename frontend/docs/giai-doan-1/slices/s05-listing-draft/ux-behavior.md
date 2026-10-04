## S05 · Host tạo listing nháp

**Danh sách (H03)**
- Mặc định sắp **cập nhật gần nhất trước**; lọc theo trạng thái; thẻ nháp hiển thị tiến độ "x/8 bước" (số bước đã hoàn thành) và nút "Tiếp tục chỉnh sửa" mở **bước dang dở** (bước đầu tiên chưa hoàn thành).
- **Tạo listing** khi Host chưa được xác minh: nút disabled + tooltip; nếu bấm bằng bàn phím/mobile → modal "Cần xác minh trước" với CTA → H02. Kiểm tra lại ở API (S05 AC).
- Xoá nháp: ConfirmDialog; chỉ với trạng thái Nháp (BR-LST-05: listing có booking không xoá được – menu ẩn mục Xoá).

**Wizard (H04) – chung**
- **Tạo bản ghi nháp khi bấm Tiếp tục lần đầu ở bước 1** (không tạo bản ghi rỗng khi vừa mở `/new`); sau đó URL chuyển sang `/host/listings/:id/edit/:step`.
- **Lưu nháp**: (a) khi bấm Tiếp tục / Quay lại / Lưu & thoát, (b) 30 s sau lần sửa cuối khi dirty (lưu một phần, **không hiển thị lỗi validate**). SaveIndicator: "Đang lưu…" → "Đã lưu 10:42" → hoặc "Lưu thất bại – Thử lại" (giữ dữ liệu cục bộ, thử lại tự động khi online).
- **Điều hướng bước**: Tiếp tục = validate chặt bước hiện tại + lưu + sang bước kế. WizardNav: bước đã **hoàn thành** hoặc **kế tiếp** bấm được; các bước sau đó là 🔒. Quay lại luôn được. Dữ liệu các bước đã nhập **còn nguyên** khi quay lại (S05 AC).
- **Hai tab cùng sửa**: mỗi bản ghi có phiên bản; lưu với phiên bản cũ → 409 → banner Tải lại.
- **Phiên hết hạn** khi đang sửa: modal đăng nhập lại; đăng nhập xong tự lưu lại thay đổi cục bộ.
- Listing đang **Chờ duyệt**: wizard mở ở chế độ chỉ đọc + banner "Đang chờ duyệt – bạn không thể chỉnh sửa".

**Bước 1 – validation**: Tên 10–80 ký tự [A5b]; Mô tả 50–2000; Số khách 1–30; Phòng ngủ 0–20 (0 = studio); Giường ≥ 1; Phòng tắm ≥ 0,5 bước 0,5; Giờ nhận ≤ Giờ trả không bắt buộc (khác ngày hợp lệ); Tiền tệ listing khoá sau lần duyệt đầu.

**Bước 2 – bản đồ**
- Khu vực bắt buộc (Tỉnh/Thành → Khu vực từ danh mục); Địa chỉ chính xác bắt buộc ≤ 200 ký tự.
- **Ghim**: kéo ghim hoặc chọn kết quả tìm kiếm; sau khi kéo, hỏi một lần "Cập nhật địa chỉ theo vị trí ghim?" (không tự ghi đè nếu người dùng đã gõ).
- **Quyền riêng tư**: vẽ **vòng tròn vùng hiển thị công khai** quanh ghim + dòng chú thích; nhắc "Địa chỉ chính xác chỉ gửi cho khách sau khi đặt phòng được xác nhận" (BR-SRC-04). Địa chỉ chính xác **không** xuất hiện trong bất kỳ API công khai nào.
- Ghim nằm ngoài vùng của khu vực đã chọn → cảnh báo mềm (không chặn).
- **Thiếu token/Mapbox lỗi**: ẩn bản đồ, hiển thị ô Vĩ độ/Kinh độ (−90…90 / −180…180, tối đa 6 số lẻ) + banner "Bản đồ tạm thời không dùng được. Bạn có thể nhập toạ độ thủ công." (S05 ghi chú rủi ro).

**Bước 3 – ảnh**
- Định dạng JPG/PNG/WebP ≤ 10 MB; tối đa 30 ảnh [A5]; HEIC → thông báo "Hãy chuyển sang JPG/PNG" (hoặc BE chuyển đổi).
- Chọn nhiều ảnh cùng lúc; tải song song tối đa 3; mỗi ảnh có progress, Huỷ, Thử lại; mất mạng → hàng đợi, tự tiếp tục.
- **Thứ tự**: kéo-thả (chuột/cảm ứng) + nút ↑/↓ và "Đặt làm ảnh bìa" (bàn phím, mobile). Lưu thứ tự **optimistic**, debounce 500 ms; lỗi → trả lại thứ tự cũ + toast. **Ảnh đầu tiên = ảnh bìa** (nhãn "Ảnh bìa").
- Xoá ảnh: lập tức biến mất + toast **Hoàn tác 5 s** rồi mới gọi xoá thật.
- Dưới 5 ảnh: **không chặn** Tiếp tục; chỉ hiển thị "x/5" (chặn thật ở bước 8 – S07).

---

