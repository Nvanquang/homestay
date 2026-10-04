## S01 · Đăng ký, xác minh email, đăng nhập, quên mật khẩu

**Validation (P07 / P06 / P08)**
| Trường | Quy tắc | Thông điệp (VI) |
|---|---|---|
| Họ tên | bắt buộc, 2–80 ký tự, cắt khoảng trắng đầu/cuối | "Vui lòng nhập họ và tên (2–80 ký tự)" |
| Email | bắt buộc, định dạng email, chuẩn hoá chữ thường, tối đa 254 | "Email chưa đúng định dạng" |
| Mật khẩu | ≥ 8 ký tự, gồm chữ và số [A4]; tối đa 128; cho dán; không cắt khoảng trắng | "Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số" |
| Điều khoản | phải tick | "Bạn cần đồng ý Điều khoản để tiếp tục" |
| Nhập lại mật khẩu (P08 B2) | trùng mật khẩu mới | "Mật khẩu nhập lại chưa khớp" |

**Hành vi chính**
1. **Danh sách yêu cầu mật khẩu** đổi ○→✓ theo thời gian thực; thanh độ mạnh chỉ là gợi ý, không chặn.
2. **Email đã tồn tại** (P07): lỗi inline kèm "Đăng nhập" / "Quên mật khẩu?" [O1: cân nhắc phản hồi trung tính để tránh dò email; hiện chọn inline cho dễ dùng, bù bằng giới hạn tần suất 429].
3. **Màn "Kiểm tra email"**: nút **Gửi lại** có đếm ngược 60 s; sau 3 lần/giờ → 429 → thông báo "Bạn đã yêu cầu quá nhiều lần, thử lại sau mm:ss". Có "Sai email? Đăng ký lại" (đưa về form, giữ họ tên).
4. **P09 gọi API xác minh đúng 1 lần khi mount** (bảo vệ khỏi gọi đôi do StrictMode/refresh – token dùng một lần nếu gọi 2 lần sẽ báo "đã dùng" sai). Dùng `useRef`/cờ để chặn lần gọi thứ hai.
5. **Đăng nhập**:
   - Lỗi sai thông tin luôn chung chung ("Email hoặc mật khẩu không đúng").
   - Chưa xác minh email → banner vàng + nút **Gửi lại email xác minh** (A2).
   - Tạm khoá (BE trả `lockedUntil`) → banner đỏ đếm ngược; nút Đăng nhập disabled tới khi hết; không tiết lộ số lần còn lại.
   - Sau đăng nhập: `returnTo` (**chỉ chấp nhận đường dẫn nội bộ bắt đầu bằng `/`**, không `//` và không URL đầy đủ – chống open redirect) → nếu không có: nhân sự → `/admin`; Host đang ở chế độ Host → `/host/listings`; còn lại → `/`.
   - Đã đăng nhập mà vào `/login` → chuyển về trang đích mặc định.
6. **Quên mật khẩu**: thông báo "đã gửi" luôn trung tính ("Nếu email tồn tại, chúng tôi đã gửi hướng dẫn"). Khi mở trang đặt lại, FE **kiểm tra token ngay khi tải** (trước khi người dùng nhập) → token hỏng hiện màn lỗi + yêu cầu liên kết mới. Thành công → về P06 kèm banner; **mọi phiên cũ bị đăng xuất** (BE).
7. Đổi ngôn ngữ trên trang auth **giữ nguyên giá trị đã nhập**, chỉ đổi nhãn/thông điệp.
8. Enter gửi form; Esc không làm gì; focus tự đặt vào ô đầu tiên khi mở trang (trừ mobile để tránh bật bàn phím không mong muốn).

**Edge case**: dán email có khoảng trắng (cắt); trình quản lý mật khẩu tự điền (không validate lỗi "trống" sai); mở liên kết xác minh ở trình duyệt khác (vẫn thành công, đăng nhập ở thiết bị gốc); người dùng đã xác minh bấm lại liên kết cũ ("Đã dùng" kèm nút Đăng nhập, không báo lỗi đỏ).

---

