# Tổng Hợp Các Giả Định & Câu Hỏi Mở (Assumptions & Open Questions)


---

## 7. Giả định cần xác nhận (tổng hợp)

| Mã | Giả định | Lý do / ảnh hưởng |
|---|---|---|
| A1 | Giai đoạn 1 chưa có Host Dashboard (H01) → H03 là trang đích của chế độ Host | H01 không nằm trong 13 slice |
| A2 | Tài khoản chưa xác minh email không đăng nhập được | Khớp demo S01; nếu cho đăng nhập hạn chế thì phải thêm trạng thái trong header |
| A3 | Ngôn ngữ không nằm trong URL | Đơn giản hoá; nếu cần SEO đa ngôn ngữ thì đổi sang `/vi`, `/en` |
| A4 | Quy tắc mật khẩu: ≥ 8 ký tự, có chữ và số | Đặc tả chưa nêu; BE trả thông điệp lỗi chuẩn |
| A5 | Ảnh giấy tờ: JPG/PNG/PDF, ≤ 10 MB/tệp, tối đa 5 tệp mỗi loại; ảnh listing: JPG/PNG/WebP ≤ 10 MB, tối đa 30 ảnh | Cần chốt cấu hình |
| A6 | Hai quy tắc giá **cùng nhóm ưu tiên** không được chồng ngày (chặn khi lưu) | Đặc tả chỉ quy định thứ tự giữa các nhóm |
| A7 | Sức chứa có tính trẻ em hay không (P02 có ô "trẻ em") | Cần PO chốt; mặc định: trẻ em tính vào sức chứa, không tính vào ngưỡng phụ thu nếu Host không cấu hình khác |
| A8 | Lọc/sắp xếp theo điểm đánh giá ẩn ở giai đoạn 1 (chưa có đánh giá) | Cờ `reviewsEnabled=false` |
| A9 | Cần seed CountryConfig (VAT, phí dịch vụ) trước S11 vì tổng giá phải "đã gồm phí và thuế" | Phụ thuộc ngầm chưa có trong danh sách slice |


---

## Phụ lục B · Giả định / câu hỏi mở bổ sung (A10 trở đi và O#)

| Mã | Nội dung | Gợi ý |
|---|---|---|
| A11 | Công tắc "Chế độ Host" ở C02 là **một chiều** trong giai đoạn 1; chuyển hiển thị Guest/Host dùng bộ chuyển ở header | Tắt hẳn vai trò Host cần chính sách xử lý listing/booking đang có |
| A12 / A12b | Hết phiên back-office sau 30 phút không hoạt động; nhân sự mới đặt mật khẩu qua email mời (tái dùng P08) | Cần BA/Bảo mật xác nhận |
| A13 / A13b | Khoá bản ghi hết hạn sau 5 phút không heartbeat; URL xem ảnh giấy tờ sống 120 s | Tham số nên đặt trong SystemConfig |
| A5b | Giới hạn độ dài nội dung listing: Tên 10–80 ký tự, Mô tả 50–2000 ký tự | Cần PO chốt |
| A14 | Giảm giá tuần áp từ 7 đêm, tháng từ 28 đêm | Đặc tả ghi "đủ số đêm", chưa nêu ngưỡng |
| A16 | Dải "thời gian chuẩn bị" chỉ hiển thị thông tin trên lịch Host | |
| A17 | Danh mục giấy tờ pháp lý theo quốc gia do BE trả động | Cần danh sách cho Việt Nam |
| A18 | "Chọn vùng trên bản đồ" = khung nhìn hiện tại (bbox); vẽ vùng tự do để giai đoạn sau | Đáp ứng S11 AC |
| O1 | Đăng ký email đã tồn tại: báo lỗi trực tiếp hay phản hồi trung tính? | Hiện chọn trực tiếp + giới hạn 429 |
| O2 | Số tiện nghi tối thiểu để gửi duyệt? | Hiện không bắt buộc |
| O3 | Host có thể rút lại listing đã gửi duyệt để sửa ("Rút lại") ở giai đoạn 1 không? | Hiện không có; wireframe H05 để mục này ở dạng tuỳ chọn |


---

## 6. Ngoài phạm vi giai đoạn 1 (FE chỉ chừa chỗ, không dựng)
Đặt phòng/thanh toán, đồng bộ iCal (H07), Host Dashboard (H01), Yêu thích, đánh giá, hộp thư, thông báo (C05/C06), đồng ý điều khoản (C07), khuyến mãi, so sánh bản cũ/mới của listing đã duyệt. Các điểm chừa chỗ được đánh dấu `🔒 Phase sau` trong 02-wireframes.

