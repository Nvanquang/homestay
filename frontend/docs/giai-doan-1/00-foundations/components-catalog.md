# Danh Mục Component Dùng Chung (CMP-01 đến CMP-34)

### 0.4 Component dùng chung (đặt tên để tái sử dụng giữa các slice)

| Mã | Component | Biến thể / trạng thái bắt buộc | Dùng ở |
|---|---|---|---|
| CMP-01 | Button | primary · secondary · tertiary(link) · danger; default/hover/focus/active/**loading**/disabled | tất cả |
| CMP-02 | TextField / TextArea | label, helper, counter, prefix/suffix; default/focus/filled/**error**/disabled/readonly | tất cả form |
| CMP-03 | PasswordField | ẩn/hiện, thanh độ mạnh, danh sách yêu cầu (✓/○) | P06–P08, C02 |
| CMP-04 | Select / Combobox | tìm trong danh sách, trạng thái rỗng "Không có kết quả" | khu vực, ngôn ngữ |
| CMP-05 | Checkbox / Radio / Switch | checked/unchecked/indeterminate/disabled | form, filter |
| CMP-06 | NumberStepper | min/max, giữ-bấm lặp, disabled ở biên | số khách, phòng ngủ… |
| CMP-07 | Toast | success/info/warning/error; có nút Hoàn tác/Thử lại; tự tắt 5s (lỗi: không tự tắt) | tất cả |
| CMP-08 | Banner/Alert | info/success/warning/error; có CTA; đóng được hoặc cố định | tất cả |
| CMP-09 | Modal ⇄ BottomSheet | Desktop=modal/drawer, Mobile=bottom sheet/full-screen; khoá cuộn nền, trả focus khi đóng | tất cả |
| CMP-10 | StatusBadge | nhóm màu ngữ nghĩa **+ icon + chữ** (không chỉ màu) – bảng trạng thái ở 0.5, màu cụ thể ở 0.6.6–0.6.7 | trạng thái hồ sơ, listing |
| CMP-11 | Skeleton | khớp đúng layout cuối | mọi màn có dữ liệu |
| CMP-12 | EmptyState | minh hoạ + tiêu đề + mô tả + CTA | danh sách rỗng |
| CMP-13 | FileUploader | kéo-thả/chọn tệp/chụp ảnh (mobile); progress, huỷ, thử lại, xem trước, xoá; lỗi kiểu/kích thước | H02, C03, H04 |
| CMP-14 | Header + LangSwitcher + CurrencySwitcher + UserMenu | khách / đã đăng nhập / chế độ Host | Public, Account |
| CMP-15 | WizardNav | danh sách bước: chưa làm / đang làm / hoàn thành / có lỗi; SaveIndicator | H04 |
| CMP-16 | DateRangePicker | 2 tháng (desktop) / 1 tháng cuộn dọc (mobile); ngày bị vô hiệu + lý do; hiển thị số đêm | P01, P02, P03, H04 |
| CMP-17 | GuestPicker | người lớn, trẻ em; max theo sức chứa | P01, P02, P03 |
| CMP-18 | SearchBar | 3 ô (Đi đâu / Ngày / Khách) + nút Tìm; mobile = thẻ thu gọn mở full-screen | P01, P02 |
| CMP-19 | ListingCard | dọc (grid) / ngang (list); ảnh carousel, loại hình, khu vực, giá, nhãn (Instant Book) | P02, P04 |
| CMP-20 | FilterChip + FilterPanel | chip trên cùng; panel = modal (desktop) / full-screen sheet (mobile) | P02 |
| CMP-21 | MapPanel (Mapbox) | marker giá, cụm, popup thẻ, vẽ vùng; **fallback không token** | P02, P03, H04 |
| CMP-22 | PriceBreakdown | từng dòng; mở rộng "giá từng đêm"; giảm giá (số âm); tổng; nhãn tiền tệ quy đổi | H04 preview, P03 |
| CMP-23 | CalendarMonth (Host) | ô ngày + trạng thái (xem 0.5); chọn khoảng; legend | H06, H08 |
| CMP-24 | DataTable (back-office) | cột, lọc, sắp xếp, phân trang, hàng chọn; mobile = thẻ | A03, A04, A18 |
| CMP-25 | ConfirmDialog | tiêu đề, hậu quả, trường lý do (bắt buộc/tuỳ chọn), nút xác nhận danger | A03, A04, A18, H05 |
| CMP-26 | Gallery + Lightbox | lưới 1+4 (desktop) / carousel vuốt (mobile); phím ←→ Esc | P03 |
| CMP-27 | PolicyTable / PolicyTimeline | bảng mốc hoàn tiền; timeline trực quan | P03, P05, H04 bước 7 |
| CMP-28 | SortablePhotoGrid | kéo-thả (desktop) + nút ↑↓/"Đặt làm ảnh bìa" (mobile & bàn phím) | H04 bước 3 |
| CMP-29 | AmenityPicker | nhóm theo danh mục, tìm kiếm, đếm đã chọn | H04 bước 4, P03 |
| CMP-30 | SecureImageViewer | che mờ mặc định, bấm để xem (ghi log), watermark tên Admin, hết hạn URL | A03 |
| CMP-31 | LockBanner | "Đang được [tên] xử lý từ hh:mm" + chế độ chỉ xem | A03, A04 |
| CMP-32 | SaveIndicator | Đã lưu hh:mm · Đang lưu… · Lưu thất bại – Thử lại | H04, H06, H08 |
| CMP-33 | HostCard | ảnh, tên, đã xác minh, ngày tham gia, nút xem hồ sơ | P03, P04 |
| CMP-34 | SidebarNav | mục, active, badge số đếm, thu gọn | Host/Admin Shell |
