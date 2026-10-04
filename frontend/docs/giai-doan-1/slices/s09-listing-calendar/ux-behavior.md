## S09 · Lịch listing (H06)

**Mô hình hiển thị**: mỗi ô là **một đêm** (đêm bắt đầu vào ngày đó). Booking 10→12 chiếm đêm 10 và 11; ô 12 trống (BR-CAL-02). Phần thời gian chuẩn bị hiển thị dải mờ sau booking (chỉ thông tin) [A16].

**Chọn ngày**
| Thiết bị | Cách chọn |
|---|---|
| Desktop | Click 1 ô; kéo chuột qua nhiều ô; Shift+click mở rộng; Esc bỏ chọn |
| Mobile/Tablet | Chạm ô đầu → chạm ô cuối; nút "Xoá chọn" |
| Bàn phím | Mũi tên di chuyển; Space bắt đầu/kết thúc chọn; Enter áp dụng |

- Ô **Quá khứ** không chọn được. Ô **Đã đặt / Giữ chỗ / Chờ Host** bấm → popover thông tin (loại, ngày, tên khách rút gọn nếu có – giai đoạn 1 chỉ "Đã đặt bởi nền tảng") **không** có hành động chặn/mở.
- Vùng chọn **hỗn hợp**: panel hiển thị "Áp dụng cho n ngày hợp lệ · bỏ qua m ngày đã đặt/giữ chỗ" và chỉ gửi ngày hợp lệ.
- Ngày **ngoài quy tắc đặt** (trong thời gian báo trước hoặc quá giới hạn đặt xa) vẫn chặn/mở được; ô có chấm mờ "khách không đặt được".

**Chặn/Mở**
- Cập nhật **optimistic** (ô đổi ngay) → gọi API → thất bại thì hoàn lại ô + toast lỗi.
- **409 xung đột** (ngày vừa có booking/giữ chỗ): toast "Một số ngày vừa được đặt. Lịch đã được cập nhật" + refetch + nhấp nháy viền các ngày xung đột 3 s. Thao tác **toàn bộ-hoặc-không** (không áp một phần).
- Toast thành công "Đã chặn 3 đêm (14–16/12)" kèm **Hoàn tác** 5 s (gọi thao tác ngược).

**Quy tắc lưu trú** (đêm tối thiểu/tối đa, chuẩn bị, báo trước, đặt xa nhất): sửa tại panel (cùng dữ liệu H04 bước 5); validate chéo như bước 5; lưu → toast + chú thích "Booking hiện có không bị ảnh hưởng".

**Làm tươi dữ liệu**: tải tháng đang xem + tháng kề; **refetch mỗi 60 s khi tab hiển thị** (giữ chỗ 15 phút hết hạn liên tục) và khi quay lại tab; hiển thị "Cập nhật lúc 10:42".
**Ngày "hôm nay"** lấy từ máy chủ theo múi giờ listing, không dùng đồng hồ thiết bị.
**Listing chưa Đang hiển thị/Tạm ẩn**: lưới read-only + banner giải thích.

---

