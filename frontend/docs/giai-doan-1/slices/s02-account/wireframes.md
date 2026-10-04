## S02 · Hồ sơ và cài đặt tài khoản

### C01 · Hồ sơ cá nhân
| Mục | Giá trị |
|---|---|
| Route / Role | `/account/profile` · Guest, Host (đã đăng nhập) |
| Component | Account Shell, CMP-13 (ảnh đại diện – chọn/cắt), CMP-02 (Họ tên, SĐT, Giới thiệu*), CMP-02 readonly (Email), CMP-10 (trạng thái xác minh danh tính), CMP-01, CMP-32 |
| Action | Đổi ảnh · Lưu thay đổi · Huỷ thay đổi · Đi tới Xác minh danh tính (C03) · Đi tới Cài đặt |
| State | **Loading** (skeleton) · **Default** · **Dirty** (nút Lưu bật, cảnh báo rời trang) · **Saving** · **Saved** (toast) · **Lỗi trường** · **Lỗi tải ảnh** (sai định dạng/quá nặng) · **Lỗi mạng** |
\* "Giới thiệu bản thân" ngắn dùng cho hồ sơ Host công khai (P04) [Assumption – cần PO chốt có/không].

🖥 Desktop
```
┌────────────────────────────────────────────────────────────────────────┐
│ Public Header                                                           │
│ Tài khoản   [ Hồ sơ ] Cài đặt  Xác minh                                 │
│ ┌──────────────┐  ┌────────────────────────────────────────────────┐   │
│ │   ( ▢ ảnh )  │  │ Họ và tên    [__________________________]      │   │
│ │ [Đổi ảnh]    │  │ Email        an@mail.com   ✓ Đã xác minh        │   │
│ │ JPG/PNG ≤5MB │  │ Số điện thoại[__________________________]      │   │
│ │              │  │ Giới thiệu   [__________________________]      │   │
│ │ Xác minh DT: │  │                                      0/300      │   │
│ │ [Chưa nộp]   │  │ [ Huỷ ]                       [ Lưu thay đổi ]  │   │
│ │ Xác minh ngay→│  └────────────────────────────────────────────────┘   │
│ └──────────────┘                                                        │
└────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile: ảnh + trạng thái xác minh nằm trên cùng (căn giữa), form 1 cột, thanh nút **sticky đáy** [Huỷ][Lưu]. Tablet: 2 cột như desktop, ảnh thu nhỏ.

### C02 · Cài đặt tài khoản
| Mục | Giá trị |
|---|---|
| Route / Role | `/account/settings` · Guest, Host |
| Component | CMP-04 (Ngôn ngữ), CMP-04 (Tiền tệ hiển thị – 🔒 bật ở S13), CMP-03 ×3 (mật khẩu cũ/mới/nhập lại), CMP-05 Switch (Chế độ Host), CMP-25 ConfirmDialog, CMP-08 |
| Action | Đổi ngôn ngữ (áp dụng ngay) · Đổi mật khẩu · Bật/tắt chế độ Host · Đăng xuất mọi thiết bị* |
| State | **Loading** · **Default** · **Đổi ngôn ngữ**: đang áp dụng → giao diện đổi, toast · **Đổi mật khẩu**: Default/Submitting/Sai mật khẩu cũ/Trùng mật khẩu cũ/Thành công (banner "Các thiết bị khác đã đăng xuất") · **Chế độ Host**: Tắt/Bật-chưa xác minh (kèm banner → H02)/Bật-đã duyệt · **Lỗi mạng** |
\* Tuỳ chọn, không có trong đặc tả.

🖥 Desktop
```
┌────────────────────────────────────────────────────────────────────────┐
│ Tài khoản   Hồ sơ [ Cài đặt ] Xác minh                                   │
│ ┌─ Ngôn ngữ & Tiền tệ ─────────────────────────────────────────────┐   │
│ │ Ngôn ngữ        [Tiếng Việt ▼]                                     │   │
│ │ Tiền tệ hiển thị[VND ▼]   ⓘ Giá quy đổi chỉ để tham khảo (S13)     │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│ ┌─ Mật khẩu ───────────────────────────────────────────────────────┐   │
│ │ Mật khẩu hiện tại [__________ 👁]                                  │   │
│ │ Mật khẩu mới      [__________ 👁]                                  │   │
│ │ Nhập lại          [__________ 👁]            [ Đổi mật khẩu ]       │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│ ┌─ Chế độ Host ────────────────────────────────────────────────────┐   │
│ │ Cho thuê chỗ ở trên nền tảng              ( ● Bật  )               │   │
│ │ ⚠ Bạn cần xác minh để tạo listing  → Hoàn tất xác minh             │   │
│ └────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile: ba khối xếp dọc thành **accordion** (mặc định mở khối vừa tương tác); nút trong từng khối full-width. Tablet: 1 cột 600px.

---

