## S04 · Xác minh Host và Admin duyệt

**P10 – logic CTA**
| Trạng thái người dùng | CTA | Hành vi |
|---|---|---|
| Chưa đăng nhập | "Đăng ký để bắt đầu" | → P07 với `returnTo=/become-host?start=1` |
| Đã đăng nhập, chưa xác minh email | "Bắt đầu" (disabled) + banner | Banner: "Xác minh email trước" + Gửi lại |
| Đủ điều kiện | "Bắt đầu" | Gọi bật chế độ Host → H02 |
| Là Host, hồ sơ chưa nộp/bị từ chối/chờ duyệt | "Tiếp tục xác minh" | → H02 |
| Host đã duyệt | "Tới Listing của tôi" | → H03 |

**H02 / C03 – form & tải tệp**
- Tệp: JPG/PNG/PDF (giấy tờ danh tính chỉ ảnh), ≤ 10 MB/tệp, tối đa 2 tệp danh tính (trước/sau) và 5 tệp quyền khai thác [A5]. Kiểm tra loại/kích thước phía FE trước khi tải.
- **Tải trực tiếp lên kho riêng bằng URL ký** ngay khi chọn tệp (tối đa 3 tệp song song); mỗi ô hiển thị progress %, nút Huỷ, Thử lại khi lỗi; xem trước bằng `URL.createObjectURL` (huỷ khi rời trang).
- Nút **Gửi hồ sơ** bật khi: thông tin bắt buộc hợp lệ + mọi tệp bắt buộc **đã tải xong**. Trước khi gửi: ConfirmDialog "Sau khi gửi, bạn không thể sửa hồ sơ cho tới khi có kết quả".
- Thông tin văn bản tự lưu nháp (30 s); **tệp chưa gửi được lưu giữ** khi quay lại (hiển thị tên tệp + "Đã tải").
- Sau khi gửi: form chuyển sang chế độ chỉ đọc; **số giấy tờ che (giữ 4 số cuối)**; **không hiển thị lại ảnh giấy tờ** (chỉ tên tệp, trạng thái ✓) – ảnh nhạy cảm không cache (`Cache-Control: no-store`).
- **Bị từ chối**: khối lý do ở đầu trang; trường/tệp bị nêu có viền đỏ; chỉ cần thay mục bị nêu; nút "Sửa & gửi lại". **Đã xác minh**: CTA "Tạo listing". **Cần cập nhật** (giấy tờ hết hạn): banner cam, mở lại form.
- Người dùng đang mở H02 ở trạng thái Chờ duyệt: tự refetch khi quay lại tab và mỗi 60 s khi tab đang hiển thị; khi chuyển Đã xác minh → toast + CTA.
- Giấy tờ trùng tài khoản Host khác (BR-ACC-04): **không tiết lộ cho Host** thông tin về tài khoản kia; Host chỉ thấy "Đang chờ duyệt".

**A03 – hành vi duyệt**
| Chủ đề | Hành vi |
|---|---|
| Hàng đợi | Mặc định sắp **cũ nhất trước**; cột "Chờ" hiển thị thời gian đã chờ ("3 giờ"); lọc theo loại (Host/Guest), trạng thái, cờ ⚑, "Của tôi"; bấm hàng → mở chi tiết |
| Khoá bản ghi (soft lock) | Mở chi tiết → gọi nhận khoá. **Heartbeat 60 s**; khoá hết hạn sau 5 phút không heartbeat [A13]; nhả khi đóng, sau quyết định, hoặc "Trả lại hàng đợi". Người thứ hai mở → LockBanner "Đang được {tên} xử lý từ {giờ}" + chế độ chỉ xem, nút quyết định disabled |
| Mất khoá giữa chừng | Banner đỏ "Hồ sơ đã được người khác tiếp nhận" → mọi nút quyết định disabled; nút "Nhận lại" nếu khoá còn tự do |
| Xem ảnh giấy tờ | Mặc định **che mờ**; bấm "Bấm để xem" → gọi API ghi log (**mỗi lần xem = 1 log**: ai, khi nào, bản ghi nào, BR-ACC-05) → nhận URL ký hết hạn ngắn (120 s [A13b]) → hiển thị kèm **watermark** (tên Admin + giờ). Hết hạn/ chuyển tab >60 s → tự che lại; xem lại = log lần nữa. Chặn menu chuột phải/kéo ảnh (chỉ mang tính răn đe, ghi chú trong dev docs) |
| Quyết định | **Duyệt**: ConfirmDialog nhẹ; với hồ sơ có cờ ⚑ cần tick "Tôi đã kiểm tra cảnh báo trùng giấy tờ" trước khi bật nút. **Từ chối**: bắt buộc chọn lý do (danh mục: Ảnh mờ · Giấy tờ hết hạn · Thông tin không khớp · Giấy tờ không hợp lệ · Khác) + ghi chú gửi Host (≥ 10 ký tự) |
| Sau quyết định | Toast "Đã duyệt hồ sơ #1042 · Email đã gửi cho Host" → tự mở hồ sơ kế tiếp (bật/tắt bằng tuỳ chọn "Tự mở hồ sơ kế tiếp") |
| Xung đột | 409 "Hồ sơ đã được xử lý" → chuyển chỉ xem + hiển thị kết quả |
| Dùng lại cho Guest (C03) | Hàng đợi chung; cột Loại phân biệt; chi tiết ẩn mục "Giấy tờ quyền khai thác" khi là Guest |

---

