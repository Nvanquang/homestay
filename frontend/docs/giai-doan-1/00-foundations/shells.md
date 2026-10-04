# 4 Khung Trang (Public, Account, Host, Admin Shells)

### 0.3 Bốn "shell" (khung trang)

**Public Shell** (P01–P10)
```
Desktop                                                              Mobile
┌──────────────────────────────────────────────────────────────┐    ┌──────────────────────────────┐
│ ◈ Logo   [Tìm kiếm nhanh*]     Trở thành Host  VI▼  ₫ VND▼  👤▼ │    │ ◈ Logo              VI▼  ☰  │
├──────────────────────────────────────────────────────────────┤    ├──────────────────────────────┤
│                         NỘI DUNG                              │    │          NỘI DUNG            │
├──────────────────────────────────────────────────────────────┤    ├──────────────────────────────┤
│ Footer: Giới thiệu · Trợ giúp · Điều khoản · Quyền riêng tư   │    │ 🔍Khám phá ♡Yêu thích* ✈Chuyến* │
└──────────────────────────────────────────────────────────────┘    │ ✉Hộp thư* 👤Tài khoản         │
 * ẩn/khoá ở giai đoạn 1: Yêu thích, Chuyến đi, Hộp thư (🔒 Phase sau)    └──────────────────────────────┘
 ₫ VND▼ (chọn tiền tệ) chỉ bật từ S13; trước đó ẩn.
```
Menu người dùng 👤▼: *Khách vãng lai* → Đăng nhập, Đăng ký. *Đã đăng nhập* → Hồ sơ, Cài đặt, Xác minh danh tính, **Chuyển sang chế độ Host / Guest**, Đăng xuất.

**Account Shell** (C01–C03): Public Shell + tiêu đề trang + sub-nav ngang (Hồ sơ · Cài đặt · Xác minh).
**Host Shell** (H02–H08)
```
Desktop                                                          Mobile
┌────────┬─────────────────────────────────────────────┐        ┌──────────────────────────────┐
│ ◈ Logo │ Chế độ Host ▾ (Chuyển sang Guest)  VI▼  👤▼  │        │ ☰  Chế độ Host          VI▼  👤 │
│ Listing│─────────────────────────────────────────────│        ├──────────────────────────────┤
│ Xác minh│ Breadcrumb: Listing › Nhà trên đồi › Lịch    │        │ Breadcrumb thu gọn (← Quay lại)│
│ 🔒Booking│ Tiêu đề trang      [Hành động chính]        │        │ Tiêu đề trang                 │
│ 🔒Thu nhập│ ─────────────────────────────────────────── │        │ NỘI DUNG                      │
│        │ NỘI DUNG                                     │        │ [Hành động chính – sticky dưới]│
└────────┴─────────────────────────────────────────────┘        └──────────────────────────────┘
 ☰ mở drawer trái (Listing, Xác minh, 🔒Booking, 🔒Thu nhập, Đăng xuất)
```
**Admin Shell** (A01 không dùng shell; A03, A04, A18 dùng)
```
Desktop                                                          Mobile (back-office tối thiểu dùng được trên tablet/phone)
┌─────────┬───────────────────────────────────────────┐         ┌──────────────────────────────┐
│ Admin   │ [🔍 Tìm nhanh]               Tên · Vai trò ▾ │         │ ☰ Admin               Tên ▾  │
│ Duyệt DT│───────────────────────────────────────────│         ├──────────────────────────────┤
│ Duyệt tin│ Tiêu đề · bộ lọc · bảng dữ liệu / chi tiết   │         │ Danh sách dạng thẻ dọc         │
│ Nhân sự │                                           │         │ Chi tiết full-screen           │
│ (menu theo vai trò)                                  │         └──────────────────────────────┘
└─────────┴───────────────────────────────────────────┘
```
