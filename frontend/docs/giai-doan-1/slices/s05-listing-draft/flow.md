### S05 · Tạo listing nháp: cơ bản, vị trí, ảnh (H03, H04 bước 1–3)
```mermaid
flowchart TD
  H3["H03 Danh sách listing"] -->|"Tạo listing"| G{"Host đã được duyệt?"}
  G -->|"Chưa"| B["Màn chặn: Cần xác minh → H02"]
  G -->|"Rồi"| S1["H04 bước 1: Thông tin cơ bản"]
  S1 -->|"Tiếp tục (tự lưu nháp)"| S2["H04 bước 2: Vị trí trên bản đồ"]
  S2 -->|"Tiếp tục"| S3["H04 bước 3: Ảnh"]
  S3 -->|"Tiếp tục"| S4["→ bước 4 (S06)"]
  S1 & S2 & S3 -->|"Lưu & thoát"| H3
  H3 -->|"Tiếp tục chỉnh sửa listing nháp"| R["Mở đúng bước dang dở"]
```
Nhánh phụ: không có token Mapbox → nhập toạ độ thủ công (S05 ghi chú); đóng trình duyệt giữa chừng → mở lại thấy đủ dữ liệu các bước đã nhập; chuyển bước bằng thanh tiến độ (chỉ cho nhảy tới bước đã hoàn thành hoặc bước kế tiếp).

---

