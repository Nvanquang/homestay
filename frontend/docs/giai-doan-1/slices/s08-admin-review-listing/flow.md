### S08 · Admin duyệt listing lần đầu (A04)
```mermaid
flowchart TD
  Q["A04 Hàng đợi listing chờ duyệt"] --> O["Mở listing (lock theo người xử lý)"]
  O --> W{"Cảnh báo trùng địa chỉ (BR-LST-06)?"}
  W -->|"Có"| WB["Banner cảnh báo + link listing/Host trùng"]
  W -->|"Không"| R["Rà soát: thông tin, ảnh, giấy tờ, giá"]
  WB --> R
  R --> D{"Quyết định"}
  D -->|"Duyệt"| A["Đang hiển thị → xuất hiện trong tìm kiếm → email Host"]
  D -->|"Yêu cầu chỉnh sửa (lý do)"| B["Cần chỉnh sửa → email Host"]
  D -->|"Từ chối (lý do)"| C["Bị từ chối → email Host"]
```
Ghi chú: bản đầu **chưa có tab so sánh cũ/mới** – chừa sẵn khung tab "Thay đổi" (disabled, tooltip "Có ở lần chỉnh sửa sau khi đã duyệt") [S08 ghi chú].

