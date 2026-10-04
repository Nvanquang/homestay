## S03 · Đăng nhập quản trị, nhân sự và phân quyền

### A01 · Đăng nhập quản trị
| Mục | Giá trị |
|---|---|
| Route / Role | `/admin/login` · Admin, CSKH, Kế toán |
| Component | CMP-02, CMP-03, CMP-01, CMP-08; **không** có link Đăng ký/Quên mật khẩu công khai [Assumption: reset do Admin thực hiện] |
| Action | Đăng nhập |
| State | Default · Submitting · Sai thông tin · Tạm khoá · **Không có quyền back-office** (thông báo chung) · Tài khoản bị khoá · Lỗi mạng |
```
🖥/📱 (nền `--bg-canvas`, thẻ trắng giữa trang, logo xám `--gray-900`, không Public Header)
┌─────────────────────────────────┐
│  ◈ Admin Console                 │
│  Email    [__________________]   │
│  Mật khẩu [____________ 👁]      │
│  [         Đăng nhập          ]  │
└─────────────────────────────────┘
```

### A18 · Nhân sự và phân quyền
| Mục | Giá trị |
|---|---|
| Route / Role | `/admin/staff` · **Admin** |
| Component | Admin Shell, CMP-24 DataTable (Họ tên, Email, Vai trò, Trạng thái, Lần đăng nhập cuối), CMP-09 Drawer "Tạo/Sửa nhân sự", CMP-25 ConfirmDialog (lý do), CMP-10, CMP-12, tab "Lịch sử thay đổi" |
| Action | Tạo nhân sự · Đổi vai trò · Khoá/Mở khoá · Xem lịch sử · Tìm/Lọc theo vai trò, trạng thái |
| State | Loading (skeleton bảng) · Default · **Rỗng** (chưa có nhân sự ngoài bạn) · Lọc không kết quả · Drawer: Default/Submitting/Email trùng/Lỗi trường · **Không thể tự khoá/hạ quyền chính mình** (nút disabled + tooltip) · Thành công (toast) · Lỗi mạng · **403** (vai trò khác vào URL) |

🖥 Desktop
```
┌─────────┬────────────────────────────────────────────────────────────────┐
│ Duyệt DT│ Nhân sự và phân quyền                         [ + Tạo nhân sự ]  │
│ Duyệt tin│ [🔍 Tìm tên/email] [Vai trò ▼] [Trạng thái ▼]                    │
│ ▶Nhân sự│ ┌────────────┬─────────────┬─────────┬──────────┬──────────┬───┐│
│         │ │ Họ tên     │ Email       │ Vai trò │ Trạng thái│ Đăng nhập │ ⋮ ││
│         │ ├────────────┼─────────────┼─────────┼──────────┼──────────┼───┤│
│         │ │ Lan CSKH   │ lan@…       │ CSKH    │ ● Hoạt động│ 10 phút   │ ⋮ ││
│         │ │ Minh KT    │ minh@…      │ Kế toán │ ⏸ Đã khoá │ 3 ngày    │ ⋮ ││
│         │ └────────────┴─────────────┴─────────┴──────────┴──────────┴───┘│
│         │ ‹ 1 2 3 ›                                                         │
└─────────┴────────────────────────────────────────────────────────────────┘
Drawer phải 420px "Tạo nhân sự": Họ tên · Email · Vai trò (CSKH/Kế toán/Admin) · [Tạo & gửi lời mời]
```
📱 Mobile: bộ lọc gom vào nút "Lọc"; mỗi nhân sự = thẻ dọc (tên, vai trò badge, trạng thái, ⋮); "Tạo nhân sự" là FAB góc dưới phải; drawer → full-screen.
Tablet: bảng giữ 4 cột (ẩn "Đăng nhập cuối").

---

