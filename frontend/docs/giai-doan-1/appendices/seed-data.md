# Bộ Dữ Liệu Mẫu (Demo Seed Data)

## Phụ lục · Dữ liệu seed cho demo (đủ để chạy hành trình J1–J5)

| Nhóm | Nội dung gợi ý |
|---|---|
| Location (VN) | Quốc gia Việt Nam (+ múi giờ `Asia/Ho_Chi_Minh`) · Khu vực: Đà Lạt, Hội An, Sa Pa, Vũng Tàu, Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Nha Trang, Phú Quốc |
| Amenity (≈25) | Thiết yếu: Wi-Fi, Điều hoà, Máy nước nóng, Khăn tắm · Bếp: Bếp, Tủ lạnh, Lò vi sóng, Dụng cụ nấu ăn · Giải trí: TV, Karaoke, Bể bơi · An toàn: Báo khói, Bình chữa cháy, Khoá an toàn · Ngoài trời: Sân vườn, BBQ, Chỗ đỗ xe |
| CancellationPolicy | 3 chính sách + mốc đúng bảng chấp thuận (Linh hoạt / Trung bình / Nghiêm ngặt) |
| CountryConfig VN | `weekendNights=[FRI,SAT]`; thuế/VAT và phí dịch vụ Guest: **giá trị chờ khách hàng cung cấp (OQ-02, BR-PRC-05)** – dùng số mẫu dán nhãn "Dữ liệu mẫu" để dev/QA, không hiển thị như số thật |
| SystemConfig | `listing.minPhotos=5`, `listing.maxPhotos=30`, `upload.maxMb=10`, `auth.*` (mục S01), `lock.ttlSec=300`, `lock.heartbeatSec=60`, `search.pageSize=24` |
| Listing mẫu | Vài trăm listing ACTIVE (S11) với giá/lịch/quy tắc đa dạng; một số ở `DRAFT/PENDING_REVIEW/NEEDS_CHANGES/REJECTED/PAUSED` để thử H03/H05/A04 |
| Hồ sơ danh tính mẫu | Ảnh **giả** (S04 ghi chú); một hồ sơ gắn cờ trùng để thử cảnh báo (BR-ACC-04); một listing trùng địa chỉ để thử BR-LST-06 |
| Tỷ giá mẫu | Snapshot VND→USD/EUR cho S13; một trường hợp quá hạn để thử `STALE` |
