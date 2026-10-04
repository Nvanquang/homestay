## S10 · Giá theo mùa, lễ, ngày đặc biệt (H08)

- **Khối thứ tự ưu tiên** (luôn hiển thị, gập được): ① Đặc biệt/Lễ → ② Mùa → ③ Cuối tuần → ④ Cơ bản; sau cùng "Giảm giá tuần/tháng áp lên tổng tiền đêm". Mục đích: Host hiểu vì sao một đêm có giá đó.
- **Giá cuối tuần**: sửa tại chỗ (Enter hoặc rời ô để lưu, SaveIndicator); nhãn đêm áp dụng lấy từ cấu hình quốc gia (VN: Thứ Sáu, Thứ Bảy).
- **Thêm/Sửa quy tắc** (Modal/Sheet): Loại · Tên (tuỳ chọn, mặc định theo loại) · Khoảng ngày (DateRange, không cho ngày quá khứ) · Giá/đêm (> 0).
  - **Trùng cùng nhóm ưu tiên** [A6]: lỗi inline liệt kê quy tắc xung đột kèm link "Sửa quy tắc đó"; không lưu. Khác nhóm chồng nhau → cho phép, hiển thị gợi ý "Trong khoảng này giá Lễ sẽ ưu tiên hơn giá Mùa".
- **Lịch giá**: mỗi ô = số ngày + giá rút gọn (1,8tr) + chấm màu nguồn; bấm ô → tooltip "Đêm 05/02: 2.400.000 ₫ – nguồn: Tết 2027 (Lễ)". Dữ liệu từ BE (G1), tải theo tháng.
- **Sửa/xoá quy tắc đang áp dụng hoặc sắp tới**: ConfirmDialog nêu hậu quả ("Giá các đêm chưa đặt trong khoảng này sẽ trở về giá mùa/cuối tuần/cơ bản. Booking đã xác nhận không bị ảnh hưởng"). Quy tắc **đã qua**: chỉ đọc.
- **Rỗng**: giải thích "Hiện tại chỉ áp dụng giá cơ bản và giá cuối tuần" + CTA Thêm quy tắc đầu tiên.
- Sau mỗi thay đổi: lịch giá và bảng quy tắc refetch; hiển thị toast.

---

