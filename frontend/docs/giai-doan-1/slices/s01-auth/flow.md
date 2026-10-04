### S01 · Đăng ký, xác minh email, đăng nhập, quên mật khẩu (P07, P06, P09, P08)

**FL-S01-A · Đăng ký → xác minh → đăng nhập**
```mermaid
flowchart TD
  S(["Khách vãng lai"]) --> R["P07 Đăng ký"]
  R -->|"Gửi hợp lệ"| R2["P07 trạng thái: Kiểm tra email (kèm nút Gửi lại, đếm ngược)"]
  R -->|"Email đã tồn tại"| R3["Lỗi inline + link Đăng nhập / Quên mật khẩu"]
  R2 -->|"Bấm liên kết trong email"| V["P09 Xác minh email"]
  V -->|"Token hợp lệ"| V1["P09 Thành công → nút Đăng nhập (tự chuyển sau 5 giây)"]
  V -->|"Token hết hạn"| V2["P09 Hết hạn → Gửi lại email mới"]
  V -->|"Token đã dùng"| V3["P09 Liên kết đã dùng → Đăng nhập / Gửi lại"]
  V1 --> L["P06 Đăng nhập (banner: Email đã xác minh)"]
  L -->|"Đúng"| H["Về returnTo hoặc /"]
  L -->|"Chưa xác minh email"| L2["Lỗi + Gửi lại email xác minh"]
  L -->|"Sai nhiều lần quá ngưỡng"| L3["Khoá tạm: hiển thị thời gian chờ"]
```
**FL-S01-B · Quên / đặt lại mật khẩu**
```mermaid
flowchart TD
  A["P06 → Quên mật khẩu"] --> B["P08 bước 1: nhập email"]
  B -->|"Gửi"| C["P08 bước 1b: Nếu email tồn tại, bạn sẽ nhận hướng dẫn (thông báo trung tính)"]
  C -->|"Bấm liên kết"| D["P08 bước 2: mật khẩu mới + nhập lại"]
  D -->|"Hợp lệ"| E["Thành công → P06 (banner)"]
  D -->|"Token hết hạn/đã dùng"| F["Màn lỗi token → Yêu cầu liên kết mới"]
```
Điểm quyết định: (1) thông báo "đã gửi" luôn trung tính để không lộ email nào tồn tại; (2) sau đặt lại mật khẩu, mọi phiên cũ bị đăng xuất.

---

