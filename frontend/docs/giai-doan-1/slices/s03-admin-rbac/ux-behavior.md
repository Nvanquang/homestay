## S03 · Back-office: đăng nhập quản trị và phân quyền

- **A01**: tách giao diện và tên miền con/đường dẫn `/admin`; không có đăng ký/quên mật khẩu công khai; lỗi quyền hiển thị chung ("Tài khoản không có quyền truy cập") – không nói tài khoản có tồn tại hay không.
- **Phiên back-office**: hết hạn do không hoạt động sau 30 phút [A12]; cảnh báo modal ở phút 28 ("Phiên sắp hết hạn – Tiếp tục làm việc") với đếm ngược.
- **Menu theo vai trò** (hằng số, không hard-code từng màn):

| Vai trò | Mục menu giai đoạn 1 |
|---|---|
| Admin | Duyệt hồ sơ danh tính · Duyệt listing · Nhân sự và phân quyền |
| CSKH | (không có mục nào ở giai đoạn 1 – màn hình đích mặc định "Chưa có công việc nào được giao" + 403 khi vào URL khác) |
| Kế toán | như CSKH |

- **A18 – Tạo nhân sự**: drawer gồm Họ tên, Email, Vai trò → "Tạo và gửi lời mời" (BE gửi email đặt mật khẩu tái sử dụng luồng P08 [A12b]). Sau tạo: dòng mới nổi bật 3 s, trạng thái "Chờ kích hoạt".
- **Khoá/mở khoá/đổi vai trò**: luôn mở `ConfirmDialog` có trường **Lý do** (bắt buộc, ≥ 10 ký tự) và hiển thị hậu quả ("Nhân sự sẽ bị đăng xuất ngay"). Kết quả ghi log (người làm, thời gian, giá trị cũ/mới) và hiện ở tab **Lịch sử** của nhân sự.
- **Bảo vệ**: không tự khoá/hạ quyền chính mình; không hạ quyền/khoá Admin cuối cùng → nút disabled + tooltip lý do (BE vẫn kiểm tra).
- Bảng: phân trang phía máy chủ 20 dòng/trang, sắp xếp theo cột, tìm kiếm debounce 300 ms, giữ bộ lọc trong URL.
- **403** hiển thị trong chính Admin Shell (giữ menu), nội dung "Bạn không có quyền xem trang này" + nút Về trang chủ quản trị.

---

