## S06 · Tiện nghi, quy tắc lưu trú, giá & phí

- **Tiện nghi**: tìm kiếm không phân biệt dấu/hoa thường; danh mục gập/mở, nhớ trạng thái; bộ đếm "Đã chọn n"; không bắt buộc số tối thiểu (chốt O2).
- **Quy tắc lưu trú**: kiểm tra chéo ngay khi đổi số: tối thiểu > tối đa → cả hai ô báo "Đêm tối thiểu không được lớn hơn đêm tối đa" và chặn Tiếp tục (S06 AC). Đặt xa nhất phải lớn hơn báo trước. Thông báo ⓘ: "Thay đổi chỉ áp dụng cho đặt phòng mới".
- **Ô tiền** (giá, phí): `inputmode="numeric"`, tự thêm dấu phân cách khi gõ, bỏ ký tự lạ khi dán; VND không thập phân; > 0 cho giá cơ bản; ≥ 0 cho phí; giới hạn trên theo cấu hình (BE trả `maxAmount`). Hậu tố tiền tệ cố định theo tiền tệ listing.
- **Phụ thu thêm khách**: "Số khách tính giá cơ bản" ≤ Số khách tối đa; ô phụ thu bị disabled nếu hai số bằng nhau (không có khách "thêm").
- **Giảm tuần/tháng**: 0–100 (%); tuần áp từ **7 đêm**, tháng từ **28 đêm** [A14]; cảnh báo mềm nếu giảm tháng < giảm tuần ("Giảm theo tháng thường cao hơn giảm theo tuần"); chú thích "Khi đủ điều kiện cả hai, hệ thống áp mức giảm tháng" (BR-PRC-02).
- **Bảng giá xem trước**:
  - Ngày và số khách ví dụ mặc định: nhận phòng sau 14 ngày, 3 đêm, số khách = số khách tính giá cơ bản + 1 (nếu còn chỗ); có **nút nhanh 3 đêm / 7 đêm / 28 đêm** để kiểm tra giảm tuần/tháng.
  - Gọi lại sau 500 ms khi bất kỳ trường giá đổi (huỷ request trước); đang tính → skeleton **chỉ ở phần số**, giữ khung.
  - Nếu ngày ví dụ vi phạm đêm tối thiểu/tối đa: hiển thị dòng giải thích thay cho bảng ("Khoảng này ít hơn số đêm tối thiểu (2)").
  - Hiển thị **chỉ các khoản Host kiểm soát**; ghi chú phí dịch vụ & thuế (A9). "Giá từng đêm" mở rộng, mỗi đêm có nhãn nguồn giá (Cơ bản, hoặc Cuối tuần/Mùa/Lễ khi S10 có).
  - Chưa nhập giá cơ bản → hiển thị trạng thái gợi ý, **không** hiển thị 0 ₫.

---

