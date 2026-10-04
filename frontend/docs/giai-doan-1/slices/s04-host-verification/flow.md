### S04 · Xác minh Host (P10, H02, C03, A03)

**FL-S04-A · Từ "Trở thành Host" tới được duyệt**
```mermaid
flowchart TD
  P["P10 Trở thành Host"] -->|"Bấm Bắt đầu"| G{"Đã đăng nhập?"}
  G -->|"Chưa"| L["P06/P07 với returnTo=/become-host?start=1"]
  L --> G
  G -->|"Rồi"| E{"Email đã xác minh?"}
  E -->|"Chưa"| E1["Chặn: yêu cầu xác minh email"]
  E -->|"Rồi"| H["Bật chế độ Host (API) → H02"]
  H --> F["H02 Form: ảnh CCCD/hộ chiếu + giấy tờ quyền khai thác"]
  F -->|"Upload qua URL ký + Gửi"| W["H02 trạng thái: Chờ duyệt"]
  W --> AD["A03 Admin mở hồ sơ → khoá theo người xử lý"]
  AD -->|"Duyệt"| OK["Host nhận email → H02: Đã xác minh → CTA Tạo listing"]
  AD -->|"Từ chối + lý do"| NO["Host nhận email → H02: Bị từ chối + lý do → Sửa & Gửi lại"]
  AD -->|"Gắn cờ trùng giấy tờ (BR-ACC-04)"| FL["Hồ sơ gắn cờ cho Admin, Host vẫn thấy Chờ duyệt"]
```
**FL-S04-B · Guest xác minh danh tính (C03)** – cùng form với H02 phần danh tính (không có giấy tờ quyền khai thác), vào từ: (a) menu tài khoản, (b) yêu cầu của hệ thống ở giai đoạn đặt phòng sau này. Sau khi duyệt, Guest quay lại `returnTo`.

**FL-S04-C · Admin duyệt (A03)**
```mermaid
flowchart TD
  Q["A03 Hàng đợi (lọc: loại Host/Guest, trạng thái, có cờ)"] --> O["Mở hồ sơ"]
  O -->|"Hồ sơ đang được người khác xử lý"| RO["Chế độ chỉ xem + biểu ngữ tên người xử lý"]
  O -->|"Tự do"| CL["Nhận hồ sơ (lock) → xem thông tin"]
  CL --> IM["Bấm để xem ảnh giấy tờ → ghi log mỗi lần xem"]
  IM --> DC{"Quyết định"}
  DC -->|"Duyệt"| A1["Xác nhận → cập nhật → email"]
  DC -->|"Từ chối"| A2["Bắt buộc chọn lý do + ghi chú → email"]
  DC -->|"Trả lại hàng đợi"| A3["Nhả khoá"]
```

---

