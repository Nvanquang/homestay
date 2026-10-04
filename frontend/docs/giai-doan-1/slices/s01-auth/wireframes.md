## S01 · Đăng ký, xác minh email, đăng nhập, quên mật khẩu

### P07 · Đăng ký
| Mục | Giá trị |
|---|---|
| Route / Role | `/register` · Khách vãng lai |
| Component | CMP-02 (Họ tên, Email), CMP-03 (Mật khẩu), CMP-05 (đồng ý điều khoản), CMP-01, CMP-08, CMP-14 |
| Action | Gửi đăng ký · Đăng nhập (link) · Đổi ngôn ngữ · Xem Điều khoản/Quyền riêng tư (mở tab mới) |
| State | **Default** · **Validating** (inline khi rời ô) · **Submitting** (nút loading, khoá form) · **Error trường** (email sai định dạng, mật khẩu yếu, chưa tick điều khoản) · **Error email đã tồn tại** · **Error mạng/5xx** (banner + giữ dữ liệu) · **Success → "Kiểm tra email"** (có Gửi lại, đếm ngược 60s; Đổi email) |

🖥 Desktop (form giữa trang, 440px; cột trái minh hoạ ẩn dưới 1024)
```
┌───────────────────────────────────────────────────────────────────────────┐
│ Public Header                                                              │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐   ┌────────────────────────────────┐     │
│  │  ▢  Minh hoạ + thông điệp   │   │  Tạo tài khoản                 │     │
│  │  "Đặt chỗ ở như người bản   │   │  Họ và tên      [______________]│     │
│  │   địa"                      │   │  Email          [______________]│     │
│  │                             │   │  Mật khẩu       [__________ 👁]│     │
│  │                             │   │   ✓ ≥ 8 ký tự  ○ có chữ & số   │     │
│  │                             │   │  [x] Tôi đồng ý Điều khoản và   │     │
│  │                             │   │      Chính sách quyền riêng tư  │     │
│  │                             │   │  [        Tạo tài khoản        ]│     │
│  │                             │   │  Đã có tài khoản? Đăng nhập     │     │
│  └─────────────────────────────┘   └────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile (1 cột, nút sticky dưới khi bàn phím mở)
```
┌──────────────────────────────┐
│ ◈ Logo             VI▼  ☰   │
│ Tạo tài khoản                │
│ Họ và tên                    │
│ [__________________________] │
│ Email                        │
│ [__________________________] │
│ Mật khẩu                     │
│ [______________________ 👁]  │
│ ✓ ≥ 8 ký tự  ○ có chữ & số   │
│ [x] Tôi đồng ý Điều khoản…   │
│ [      Tạo tài khoản        ]│
│ Đã có tài khoản? Đăng nhập   │
└──────────────────────────────┘
```
Tablet: form giữa 480px, bỏ cột minh hoạ.

**Trạng thái thành công "Kiểm tra email" (thay thế form tại chỗ)**
```
        ┌─────────────────────────────────────┐
        │   ✉  Kiểm tra hộp thư của bạn        │
        │   Chúng tôi đã gửi liên kết xác minh │
        │   tới an***@mail.com                │
        │   [ Gửi lại email ]  (còn 52s)       │
        │   Sai email? Đăng ký lại             │
        └─────────────────────────────────────┘
```

### P06 · Đăng nhập
| Mục | Giá trị |
|---|---|
| Route / Role | `/login?returnTo=` · Khách vãng lai |
| Component | CMP-02 Email, CMP-03 Mật khẩu, CMP-05 (Ghi nhớ đăng nhập – tuỳ chọn), CMP-01, CMP-08 |
| Action | Đăng nhập · Quên mật khẩu → P08 · Đăng ký → P07 · Gửi lại email xác minh (khi lỗi chưa xác minh) |
| State | **Default** · **Submitting** · **Sai thông tin** (thông báo chung "Email hoặc mật khẩu không đúng") · **Chưa xác minh email** (banner vàng + Gửi lại) · **Tạm khoá** (banner đỏ + đếm ngược "Thử lại sau mm:ss") · **Banner thành công** (đến từ P09/P08: "Email đã xác minh"/"Đã đặt lại mật khẩu") · **Tài khoản bị khoá** · **Lỗi mạng** |

🖥 Desktop
```
┌───────────────────────────────────────────────────────────┐
│ Public Header                                              │
│              ┌─────────────────────────────────┐          │
│              │ [✓ Email đã được xác minh]       │ ← banner │
│              │ Đăng nhập                        │          │
│              │ Email    [____________________]  │          │
│              │ Mật khẩu [______________ 👁]     │          │
│              │ [x] Ghi nhớ        Quên mật khẩu?│          │
│              │ [         Đăng nhập            ] │          │
│              │ Chưa có tài khoản? Đăng ký       │          │
│              └─────────────────────────────────┘          │
└───────────────────────────────────────────────────────────┘
```
📱 Mobile: cùng nội dung 1 cột, full-width, banner nằm trên cùng, nút "Đăng nhập" sticky đáy.
Tablet: như desktop, khung 480px.

### P09 · Xác minh email
| Mục | Giá trị |
|---|---|
| Route / Role | `/verify-email?token=` · Khách vãng lai (mở từ email) |
| Component | CMP-08, CMP-01, CMP-11, minh hoạ trạng thái |
| Action | Đăng nhập · Gửi lại email · Về trang chủ |
| State | **Đang xác minh** (skeleton + spinner nhỏ) · **Thành công** (✓, nút Đăng nhập, tự chuyển sau 5s, có thể huỷ đếm) · **Hết hạn** (⚠ + Gửi lại – cần nhập email) · **Đã dùng** (ℹ + Đăng nhập) · **Token không hợp lệ** (✕ + Gửi lại) · **Lỗi mạng** (Thử lại) |

```
🖥/📱 (một thẻ giữa trang, 480px; mobile full-width)
┌───────────────────────────────────┐
│               ✓                   │
│     Email đã được xác minh         │
│  Bạn có thể đăng nhập ngay bây giờ │
│  [          Đăng nhập           ] │
│  Tự động chuyển sau 5 giây · Huỷ   │
└───────────────────────────────────┘
```

### P08 · Quên / đặt lại mật khẩu (2 bước, cùng màn)
| Mục | Giá trị |
|---|---|
| Route / Role | `/forgot-password` (bước 1) · `/reset-password?token=` (bước 2) · Khách vãng lai |
| Component | CMP-02 Email, CMP-03 Mật khẩu mới + Nhập lại, CMP-01, CMP-08 |
| Action | Gửi liên kết · Quay lại đăng nhập · Đặt lại mật khẩu · Yêu cầu liên kết mới |
| State | **B1 Default / Submitting / Đã gửi (trung tính)** · **B1 429** (gửi quá nhiều) · **B2 Default / Validating / Submitting** · **B2 Mật khẩu không khớp / yếu** · **B2 Token hết hạn hoặc đã dùng** (màn lỗi + yêu cầu liên kết mới) · **B2 Thành công** → P06 |

```
Bước 1 (🖥 440px / 📱 full-width)             Bước 2
┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│ Quên mật khẩu?                    │      │ Đặt mật khẩu mới                  │
│ Nhập email để nhận liên kết đặt lại│      │ Mật khẩu mới      [_________ 👁] │
│ Email [__________________________]│      │  ✓ ≥ 8 ký tự  ○ có chữ & số       │
│ [     Gửi liên kết đặt lại      ] │      │ Nhập lại          [_________ 👁] │
│ ← Quay lại đăng nhập              │      │ [    Đặt lại mật khẩu          ] │
└──────────────────────────────────┘      └──────────────────────────────────┘
```

---

