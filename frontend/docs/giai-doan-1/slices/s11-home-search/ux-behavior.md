## S11 · Trang chủ và tìm kiếm

**SearchBar**
- **Điểm đến**: combobox (ARIA) – gợi ý sau 2 ký tự (debounce 300 ms) từ danh mục Location (khu vực + tên listing nổi bật*); phím ↑↓ Enter chọn; Esc đóng; hiển thị "Tìm gần đây" (localStorage, tối đa 5) khi ô rỗng và được focus.
- **Ngày**: không cho chọn quá khứ; trả phòng > nhận phòng; hiển thị "n đêm"; xoá ngày được. **Khách**: người lớn ≥ 1, trẻ em ≥ 0, tối đa 16 tổng [A7].
- Thiếu điểm đến khi bấm Tìm → lỗi inline "Hãy chọn điểm đến" (không điều hướng). Có thể tìm không cần ngày/khách.

**Kết quả (P02)**
- **URL là nguồn sự thật**: mọi thay đổi (điểm đến, ngày, khách, lọc, sắp xếp, vùng bản đồ) cập nhật query string; nút Back khôi phục đúng trạng thái; chia sẻ được liên kết. Thay đổi bộ lọc dùng `replace` (không đẩy lịch sử mỗi lần), thay đổi tìm kiếm chính dùng `push`.
- **Cập nhật kết quả**: giữ danh sách cũ mờ 60% + thanh tiến trình mảnh trên đầu; sau khi dữ liệu mới về thì thay thế và **giữ vị trí cuộn** nếu chỉ đổi sắp xếp/bản đồ, **cuộn lên đầu** nếu đổi bộ lọc/tìm kiếm.
- **Bộ lọc**: chip hiển thị giá trị đã chọn ("Giá: 500k–2tr"); mở panel → thay đổi **chưa áp dụng** cho tới khi bấm "Hiển thị n kết quả"; số n **cập nhật trực tiếp** (debounce 400 ms) – nếu n = 0 nút đổi thành "Không có kết quả" và disabled. "Xoá tất cả" trả về mặc định (giữ điểm đến/ngày/khách).
- **Sắp xếp**: Liên quan (mặc định) · Giá thấp→cao · Giá cao→thấp · Mới nhất · (🔒 Đánh giá – ẩn khi `reviewsEnabled=false` [A8]). Giá sắp xếp theo **tổng giá khi có ngày**, theo giá/đêm khi chưa chọn ngày.
- **Phân trang**: 24 thẻ/lần, nút **"Hiển thị thêm"** (không cuộn vô hạn tự động để chân trang truy cập được); hiển thị "Đang xem 24/48".
- **Thẻ listing**: ảnh carousel (mũi tên desktop, vuốt mobile; tải lười, ảnh đầu ưu tiên); hover thẻ làm marker tương ứng nổi bật và ngược lại; bấm thẻ: **desktop mở tab mới**, mobile mở cùng tab; giữ `checkin/checkout/adults/children` trong URL chi tiết.
- **Giá trên thẻ**: có ngày → "Tổng … · n đêm" + "Đã gồm phí và thuế" + giá/đêm trung bình phụ; chưa có ngày → "Từ … /đêm" (S11 AC). Khi tính giá chậm: skeleton dòng giá, thẻ vẫn bấm được.
- **Bản đồ**:
  - Marker hiện **tổng giá** (có ngày) hoặc giá/đêm (rút gọn "5,3tr"); gom cụm khi zoom < 12; bấm marker → popup thẻ rút gọn → bấm để mở chi tiết.
  - Di chuyển/zoom: hiện nút **"Tìm trong khu vực này"** (mặc định). Bật "Tìm khi di chuyển bản đồ" → tự cập nhật sau 500 ms. Khu vực áp dụng = khung nhìn hiện tại (bbox) [A18]; hiển thị chip "Khu vực bản đồ ✕" để gỡ.
  - Mobile: bản đồ toàn màn hình; thẻ marker đang chọn nổi ở đáy; nút ☰ trở về danh sách; giữ trạng thái bản đồ khi chuyển qua lại.
  - **Không có token Mapbox/lỗi tải**: ẩn bản đồ và nút "Bản đồ", chỉ danh sách + banner nhỏ có thể đóng (S11 AC).
- **0 kết quả**: tiêu đề "Không tìm thấy chỗ ở phù hợp"; gợi ý theo thứ tự: (1) gỡ từng bộ lọc đang bật (chip có ✕), (2) "Thử ngày khác", (3) "Xem toàn bộ {khu vực}"; hiển thị cả khi bản đồ đang thu hẹp.
- **Hiệu năng**: ảnh `srcset`/lazy; skeleton lần đầu ≤ 200 ms; mục tiêu phản hồi tìm kiếm tham khảo < 500 ms (S11 AC) – FE hiển thị loading nếu quá 200 ms.

**Trang chủ (P01)**: Điểm đến phổ biến (≤ 8, theo số listing đang hiển thị), Chỗ ở nổi bật (≤ 8, theo xếp hạng); khối nào lỗi hoặc rỗng thì **ẩn khối đó** thay vì hiện lỗi to; SearchBar mobile mở full-screen 3 bước.

---

