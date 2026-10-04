# Quy Tắc UX & Hành Vi Chung (Validation, Feedback, Modal, Auto-save)

## 0. Quy tắc chung

### 0.1 Nguyên tắc nguồn sự thật
| # | Quy tắc | Lý do |
|---|---|---|
| G1 | **FE không bao giờ tự tính giá.** Mọi số tiền (xem trước, tìm kiếm, chi tiết) lấy từ PricingEngine qua API; FE chỉ định dạng | PricingEngine là nguồn duy nhất (S10 ghi chú), tránh lệch với thanh toán |
| G2 | **FE không tự quyết quyền.** Ẩn/hiện menu theo vai trò để tiện dùng, nhưng mọi chặn quyền dựa vào phản hồi 403 từ API | S03 AC: chặn cả UI lẫn API |
| G3 | **Kiểm tra FE chỉ để phản hồi nhanh**; kết quả validate của BE luôn ưu tiên và phải hiển thị được (map lỗi theo `field`) | Tránh hai nguồn sự thật |
| G4 | Thao tác liên quan duyệt, xác minh, lịch, giá, tiền: **pessimistic** (chờ BE xác nhận rồi mới đổi UI). Chỉ dùng optimistic cho: đổi ngôn ngữ, sắp xếp ảnh, chặn/mở ngày (có rollback) | Giảm rủi ro hiển thị sai |

### 0.2 Form & validation
- Validate **khi rời ô** (blur) sau lần chạm đầu tiên; sau đó validate lại **khi gõ** để lỗi biến mất ngay khi đúng.
- Bấm gửi khi còn lỗi: không disable nút; hiện lỗi mọi trường, **cuộn và focus** vào trường lỗi đầu tiên, đồng thời banner tóm tắt `role="alert"` ("Có 2 trường cần sửa").
- Nút gửi: khi đang gọi API → `loading` + `aria-busy`, khoá double-click; gửi kèm khoá idempotency với thao tác tạo (đăng ký, tạo listing, gửi duyệt).
- Thông điệp lỗi **nêu nguyên nhân + cách sửa** ("Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số"), không dùng "Có lỗi xảy ra" trừ lỗi 5xx.
- Nhãn trường luôn hiển thị (không dùng placeholder thay nhãn); trường bắt buộc đánh dấu `*` và `aria-required`; autocomplete đúng loại (`email`, `current-password`, `new-password`, `name`, `tel`).
- Dữ liệu người dùng đã nhập **không bị mất** khi: lỗi mạng, 5xx, 401 (modal đăng nhập lại), đổi ngôn ngữ.
- Rời trang khi có thay đổi chưa lưu: `beforeunload` + `ConfirmDialog` nội bộ (Lưu & thoát / Bỏ thay đổi / Ở lại).

### 0.3 Thời gian & phản hồi
| Tình huống | Hành vi |
|---|---|
| Tải dữ liệu < 200 ms | Không hiện skeleton (tránh nhấp nháy) |
| 200 ms – 10 s | Skeleton khớp layout; nếu đã hiện thì giữ tối thiểu 300 ms |
| > 10 s | Thêm dòng "Đang mất nhiều thời gian hơn dự kiến…" + nút Thử lại |
| Toast thành công | Tự tắt 5 s; có nút ✕; xếp chồng tối đa 3 |
| Toast lỗi | **Không tự tắt**; kèm hành động (Thử lại) |
| Debounce | Gợi ý điểm đến 300 ms · số kết quả trong bộ lọc 400 ms · "tìm khi di chuyển bản đồ" 500 ms · xem trước giá 500 ms · tự lưu nháp 30 s sau lần sửa cuối |
| Hủy request | Dùng `AbortController` cho tìm kiếm, xem trước giá, báo giá: request mới huỷ request cũ để không hiện kết quả lỗi thời |
| Retry tự động | Chỉ cho GET (tối đa 2 lần, backoff 1 s/3 s). **Không** tự retry thao tác ghi |

### 0.4 Phiên, xung đột, offline
- **401 giữa chừng:** modal "Phiên đã hết hạn – đăng nhập lại để tiếp tục" (không rời trang); đăng nhập xong → thực hiện lại thao tác cuối.
- **409 (xung đột phiên bản):** banner "Dữ liệu đã được cập nhật ở nơi khác" + [Tải lại] (mất thay đổi cục bộ) / [Xem khác biệt]* (giữ thay đổi). Áp dụng cho listing nháp mở ở 2 tab, hồ sơ duyệt đã xử lý, lịch bị chiếm.
- **Offline:** banner cố định; mọi nút ghi disabled kèm tooltip; tự kiểm tra lại mỗi 5 s; khi online → toast "Đã kết nối lại" và refetch dữ liệu đang xem.
- **Tab ẩn lâu:** khi quay lại (`visibilitychange`) refetch dữ liệu nhạy thời gian: lịch (H06), hàng đợi duyệt (A03/A04), trạng thái duyệt (H05, H02).

### 0.5 Khả năng truy cập (WCAG 2.1 AA)
| Mục | Yêu cầu |
|---|---|
| Tương phản | Chữ thường ≥ 4.5:1; chữ lớn/icon/viền control ≥ 3:1; trạng thái không chỉ dùng màu (icon + nhãn). **Bảng màu và tỷ lệ đã kiểm: `02-wireframes.md` mục 0.6** |
| Bàn phím | Mọi hành động đạt được bằng Tab/Enter/Space/Esc/phím mũi tên; thứ tự Tab theo thứ tự đọc; `focus-visible` rõ (2px) |
| Modal/Sheet | Khoá focus trong modal, Esc đóng, trả focus về phần tử mở, `aria-modal`, tiêu đề `aria-labelledby` |
| Lịch | `role="grid"`; mũi tên di chuyển ô; Enter chọn; PageUp/PageDown đổi tháng; mỗi ô có `aria-label` đầy đủ ("Thứ Hai 15 tháng 12, trống") |
| Bản đồ | Luôn có **đối trọng dạng danh sách**; marker có `aria-label` (tên + giá); nút +/− bàn phím |
| Ảnh | `alt` mô tả cho ảnh listing (Host nhập chú thích tuỳ chọn; mặc định "Ảnh {n} của {tên listing}") |
| Thông báo động | Toast/banner lỗi dùng `aria-live` (`polite`; lỗi dùng `assertive`) |
| Chuyển động | Tôn trọng `prefers-reduced-motion` (tắt carousel tự chạy, hiệu ứng trượt) |
| Mục tiêu chạm | ≥ 44×44 px trên mobile; khoảng cách giữa hai mục chạm ≥ 8 px |
| Ngôn ngữ | `<html lang>` đổi theo VI/EN; số/ngày/tiền dùng `Intl` theo ngôn ngữ |

### 0.6 Responsive – quy tắc chuyển đổi component
| Component | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Modal | Giữa màn hình | Giữa, rộng 560 | Bottom sheet (cao tới 90%) hoặc full-screen với form dài |
| Điều hướng | Header đầy đủ / Sidebar | Sidebar icon | Bottom nav (Public) · Drawer (Host/Admin) |
| DateRangePicker | Popover 2 tháng | Popover 2 tháng | Full-screen, cuộn dọc theo tháng |
| Bảng dữ liệu | Bảng cột | Bảng ẩn cột phụ | Thẻ dọc (mỗi hàng một thẻ) |
| Hành động chính | Cuối form/ở tiêu đề | như desktop | **Sticky đáy** màn hình (cao 64 + safe-area) |
| Bộ lọc | Modal/Popover | Modal | Full-screen sheet + footer đếm kết quả |
| Bản đồ + danh sách | Song song | Chuyển đổi/ trượt | Chuyển đổi bằng nút nổi |
| Tooltip | Hover + focus | Chạm giữ | Thay bằng văn bản phụ hiển thị sẵn hoặc `ⓘ` mở sheet |

### 0.7 Quy ước tiền tệ, ngày giờ, số
- Tiền: định dạng theo ngôn ngữ và tiền tệ (`₫ 1.200.000` VI · `₫1,200,000` EN); VND không hiển thị phần thập phân; mọi tiền tệ làm tròn theo quy tắc loại tiền (BE trả sẵn chuỗi định dạng và số).
- Ngày giờ của **listing** hiển thị theo **múi giờ của listing** (BR-CAL-06), kèm chip múi giờ ở H06/H04; ngày giờ hệ thống (đã gửi, cập nhật) theo múi giờ thiết bị.
- Đêm: "3 đêm" = B − A (BR-CAL-02); ngày trả phòng không tính là đêm.

### 0.8 Quy ước QA
`data-testid` dạng `{màn}-{thành phần}-{hành động}` (ví dụ `p06-login-submit`, `h06-day-2026-12-14`); mỗi trạng thái có Storybook story tương ứng (Default / Loading / Empty / Error / Disabled / Success).

---
