# Hệ thống thiết kế và nền tảng giao diện

Mục tiêu: giao diện hiện đại, tuỳ biến nhiều, nhất quán giữa hai ứng dụng, lấy cảm hứng **mẫu thiết kế** từ Airbnb (ưu tiên ảnh, nhiều khoảng trắng, bo góc lớn, tương tác mượt) nhưng mang thương hiệu riêng. Không sao chép logo, phông chữ, bảng màu hay hình ảnh của Airbnb.

Toàn bộ hệ thống thiết kế nằm ở `packages/ui`; ứng dụng chỉ **dùng**, không tự định nghĩa lại.

---

## 1. Các lớp của hệ thống

| Lớp | Nội dung | Nơi đặt | Biết nghiệp vụ? |
|---|---|---|---|
| L0 Token | Màu, phông, cỡ chữ, bo góc, bóng, khoảng cách, chuyển động | `packages/ui/src/styles/tokens.css` | Không |
| L1 Primitive | Button, Input, Dialog, Popover… (từ shadcn/Radix đã chỉnh) | `packages/ui/src/primitives` | Không |
| L2 Component ghép | DateRangePicker, Gallery, MoneyText, Countdown… | `packages/ui/src/components` | Không |
| L3 Pattern | EmptyState, ErrorState, ConfirmDialog, PageHeader, DataTable | `packages/ui/src/patterns` | Không |
| L4 Component nghiệp vụ | ListingCard, SearchPill, PriceBreakdown, BookingCard… | `apps/*/src/features/*/components` | Có |

Quy tắc: lớp thấp không import lớp cao. Nghiệp vụ không bao giờ lọt vào `packages/ui`.

---

## 2. Token

Mọi giá trị nhìn thấy được lấy từ token. Dưới đây là **giá trị khởi điểm** để bắt đầu, có thể đổi theo thương hiệu; điều bắt buộc là cấu trúc và việc chỉ định nghĩa ở một nơi.

### 2.1. Màu

| Nhóm | Token | Ghi chú |
|---|---|---|
| Thương hiệu | `brand-50` … `brand-900` | Chọn một màu chủ đạo riêng (không dùng hồng/đỏ đặc trưng của Airbnb). Ví dụ khởi điểm: dải xanh ngọc, với `brand-700` làm màu nút chính |
| Trung tính | `neutral-0` … `neutral-950` | Chữ, nền, viền |
| Ngữ nghĩa | `success`, `warning`, `danger`, `info` (mỗi loại có `bg`, `border`, `text`) | Trạng thái booking, thanh toán, thông báo |
| Bề mặt | `surface`, `surface-raised`, `surface-muted`, `border`, `border-strong` | Dùng tên theo vai trò, không theo màu |
| Chữ | `text`, `text-muted`, `text-inverse` | |
| Focus | `ring` | Vòng focus rõ, đạt tương phản |

Quy tắc tương phản: chữ thường đạt **tối thiểu 4.5:1**, chữ lớn và thành phần giao diện đạt 3:1. Kiểm tra từng cặp màu khi đặt token (ví dụ chữ trắng trên nền `brand` phải đạt 4.5:1, nên dùng bậc đậm như `brand-700` cho nút chính). Không truyền đạt trạng thái chỉ bằng màu: kèm biểu tượng hoặc chữ.

### 2.2. Chữ

| Mục | Giá trị khởi điểm |
|---|---|
| Phông | Một phông sans hiện đại **có hỗ trợ tiếng Việt** (ví dụ Inter hoặc Plus Jakarta Sans), tải qua `next/font` với tập ký tự `latin` và `vietnamese`; có phông dự phòng hệ thống |
| Thang cỡ | 12/16, 14/20, 16/24, 18/28, 20/28, 24/32, 30/36, 36/40 (cỡ/chiều cao dòng, px) |
| Độ đậm | 400, 500, 600, 700 |
| Chữ số | Dùng chữ số đều chiều rộng (tabular) cho bảng giá và bảng số liệu |
| Cỡ chữ ô nhập trên điện thoại | Tối thiểu 16 px để iOS không phóng to khi focus |

### 2.3. Hình dạng, bóng, khoảng cách, chuyển động

| Nhóm | Giá trị khởi điểm |
|---|---|
| Bo góc | `sm` 8, `md` 12, `lg` 16, `xl` 24 px, `pill` (hết cỡ) |
| Bóng | `card` (nhẹ), `card-hover`, `popover`, `modal`; bóng mềm, độ mờ lớn, độ đậm thấp |
| Khoảng cách | Thang 4 px (dùng thang mặc định của Tailwind) |
| Chiều rộng trang | Nội dung tối đa 80rem; trang tìm kiếm dạng chia đôi danh sách và bản đồ có thể rộng hơn |
| Lớp xếp chồng (z-index) | Header 40, popover 50, dialog 60, toast 70 |
| Chuyển động | Thời lượng 150, 200, 300 ms; đường cong mềm ra nhanh vào chậm; tắt hoặc giảm khi `prefers-reduced-motion` |
| Điểm ngắt | Mặc định Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 |

### 2.4. Khai báo trong Tailwind v4 (minh hoạ)

```css
/* packages/ui/src/styles/tokens.css  (minh hoạ) */
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-brand-700: #0f766e;           /* ví dụ khởi điểm */
  --color-surface: #ffffff;
  --color-text: #171717;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.06), 0 2px 8px rgb(0 0 0 / 0.08);
  --ease-out-soft: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

Dùng tên theo **vai trò** (`surface`, `text`) để việc thêm chế độ tối sau này chỉ là đổi giá trị token. Chế độ tối **không nằm trong phạm vi đầu**.

---

## 3. Bộ component theo đợt

### Đợt 1: có trước khi xây giao diện (thuộc cổng vào, file 01)

Button, IconButton, Link, Input, Textarea, Label, FormField (tích hợp React Hook Form), Checkbox, RadioGroup, Switch, Select, Badge, Card, Separator, Skeleton, Spinner, Avatar, Alert, Dialog, Sheet/Drawer, Popover, Tooltip, DropdownMenu, Tabs, Toast, Container, PageHeader, VisuallyHidden.

### Đợt 2: thêm cùng slice cần tới

| Component | Slice dùng đầu tiên |
|---|---|
| DataTable (TanStack Table), Pagination | S03 |
| FileDropzone, SortableImageGrid, ProgressBar | S04, S05 |
| Stepper (điều hướng form nhiều bước) | S05 |
| Calendar/DateRangePicker (react-day-picker) | S09, S11 |
| GuestPicker (bộ tăng giảm số khách), PriceRangeSlider, Combobox (địa điểm) | S11 |
| Carousel (Embla), Gallery | S11, S12 |
| MoneyText, Rating, StatusBadge | S11 đến S16 |
| Countdown | S14 |
| ConfirmDialog, EmptyState, ErrorState, Timeline | Khi cần đầu tiên |
| Chart (Recharts) | S56 đến S59 |

### Mẫu nghiệp vụ (đặt trong feature, không ở `packages/ui`)

`ListingCard`, `SearchPill`, `FilterChips`, `PriceBreakdown`, `BookingCard` (khung đặt phòng dính), `MapPriceMarker`, `CancellationPolicyTable`, `ReviewItem`, `MessageBubble`, `BookingStatusBadge`.

---

## 4. Mẫu giao diện kiểu Airbnb

| Mẫu | Hướng dẫn thiết kế | Cách làm (tóm tắt, chi tiết ở kiến trúc mục 3.2) |
|---|---|---|
| Ưu tiên ảnh | Ảnh lớn, tỷ lệ cố định (thẻ 4:3), bo góc `lg`, chữ ngắn gọn dưới ảnh | `next/image`, Embla cho vuốt ảnh |
| Thanh tìm kiếm viên thuốc | Ba phần: Địa điểm, Ngày, Khách; thu gọn khi cuộn, mở rộng khi bấm | Popover + DateRangePicker + GuestPicker, header `sticky` |
| Giá nổi bật | **Tổng giá cho kỳ lưu trú** là con số chính; giá mỗi đêm phụ; hiển thị theo dữ liệu API, nhãn «đã gồm phí/chưa gồm» theo API | `MoneyText`, `PriceBreakdown` |
| Chip bộ lọc | Hàng chip cuộn ngang; bộ lọc đầy đủ trong hộp thoại (máy tính) hoặc ngăn kéo (điện thoại) | Dialog/Vaul, nuqs |
| Chia đôi danh sách và bản đồ | Từ `lg` trở lên: danh sách bên trái, bản đồ bên phải; điện thoại: nút nổi chuyển giữa danh sách và bản đồ | Tailwind grid, `react-map-gl` |
| Nhãn giá trên bản đồ | Marker hiển thị giá, làm nổi bật khi rê chuột thẻ tương ứng | Marker HTML tuỳ chỉnh |
| Trang chi tiết | Lưới ảnh một lớn bốn nhỏ; khung đặt phòng dính bên phải; điện thoại: thanh đặt phòng cố định ở đáy | CSS grid, `sticky`, Drawer |
| Điều hướng điện thoại | Thanh điều hướng dưới (Khám phá, Yêu thích, Chuyến đi, Hộp thư, Hồ sơ) cho Guest | Component `BottomNav` của `web` |
| Phản hồi tức thì | Skeleton khớp kích thước thẻ, nút tim đổi trạng thái ngay, toast ngắn | Skeleton, cập nhật lạc quan cho yêu thích |

Nguyên tắc nhìn: nhiều khoảng trắng, bóng mềm, ít viền đậm, một màu nhấn duy nhất, chữ rõ thứ bậc, mật độ thông tin vừa phải. Back-office dùng cùng token nhưng **mật độ cao hơn** (bảng, bộ lọc, khoảng cách nhỏ hơn) và ưu tiên máy tính.

---

## 5. Bố cục và đáp ứng (responsive)

- **Mobile-first** cho `web`: thiết kế màn nhỏ trước (360 px), mở rộng dần. `backoffice` thiết kế cho từ 1024 px nhưng không vỡ trên màn nhỏ hơn.
- Lưới thẻ listing: 1 cột (dưới `sm`), 2 (`sm`), 3 (`lg`), 4 (`xl`); khi có bản đồ thì giảm một bậc.
- Vùng chạm tối thiểu **44 × 44 px** trên điện thoại.
- Dùng đơn vị tương đối (`rem`, `%`, `fr`); tránh chiều rộng cố định bằng px cho nội dung.
- Hỗ trợ vùng an toàn (tai thỏ, thanh điều hướng) bằng `env(safe-area-inset-*)` cho thanh cố định dưới đáy.
- Bảng rộng cuộn ngang trong **khung riêng**, không làm trang cuộn ngang.
- Kiểm tra tối thiểu ở 360, 768, 1024, 1440 px.

---

## 6. Các trạng thái giao diện

| Trạng thái | Quy định |
|---|---|
| Đang tải | **Skeleton** có kích thước khớp nội dung thật để tránh nhảy bố cục; không spinner toàn trang. Nút đang gửi hiển thị spinner nhỏ và bị vô hiệu |
| Rỗng | Giải thích ngắn, gợi ý hành động (ví dụ «Chưa có chuyến đi nào. Khám phá chỗ ở»). Có hình minh hoạ đơn giản của riêng dự án |
| Lỗi khối | `ErrorState` với nút «Thử lại»; hiển thị mã tham chiếu |
| Lỗi trang | `error.tsx` dùng cùng mẫu |
| Không có quyền | Trang riêng giải thích và dẫn tới bước hợp lý (đăng nhập, xác minh) |
| Thành công | Toast ngắn cho thao tác nhỏ; trang hoặc khối xác nhận cho thao tác lớn (đặt phòng) |
| Xác nhận nguy hiểm | `ConfirmDialog` nêu rõ hậu quả (số tiền hoàn, khoản phạt) và có nút huỷ rõ ràng; nút huỷ là mặc định focus cho thao tác phá huỷ |

---

## 7. Truy cập (nền)

Chi tiết và danh sách kiểm tra ở file 08. Ở mức hệ thống thiết kế:
- Dùng Radix (qua shadcn/ui) cho thành phần có hành vi phức tạp để có sẵn quản lý focus, bàn phím và aria.
- Mọi component tương tác có **vòng focus** nhìn rõ bằng token `ring`; không bỏ `outline` mà không thay thế.
- Biểu tượng trang trí có `aria-hidden`; nút chỉ có biểu tượng bắt buộc có nhãn truy cập.
- Chuyển động tuân theo `prefers-reduced-motion`.
- Toast và thông báo động dùng vùng `aria-live` phù hợp.

---

## 8. Biểu tượng và hình ảnh

- Biểu tượng: `lucide-react`, kích thước 16, 20, 24; độ dày nét nhất quán; chỉ nhập từng biểu tượng cần dùng (tree-shaking).
- Ảnh listing: tỷ lệ khung cố định để tránh layout shift; `sizes` khớp bố cục; ảnh đầu trang quan trọng `priority`, còn lại tải lười; nền màu trung tính trong lúc tải (hoặc ảnh mờ nếu API cung cấp).
- Văn bản thay thế (`alt`): ảnh listing dùng chú thích do Host nhập nếu có, nếu không dùng mô tả mặc định theo vị trí (ví dụ «Ảnh 3 của <tên listing>»); ảnh trang trí dùng `alt=""`.
- Không dùng ảnh có bản quyền của bên thứ ba; hình minh hoạ trạng thái rỗng là SVG của riêng dự án.

---

## 9. Nội dung chữ (microcopy)

- Giọng văn ngắn gọn, thân thiện, nhất quán «bạn»; không viết hoa toàn bộ.
- Nút nêu hành động cụ thể («Đặt phòng», «Xác nhận huỷ»), không dùng «Gửi» chung chung.
- Thông điệp lỗi nói điều đã xảy ra và việc có thể làm tiếp; không đổ lỗi cho người dùng, không lộ chi tiết kỹ thuật.
- Số, tiền, ngày hiển thị theo ngôn ngữ đang chọn (file 08).
- Mọi chuỗi nằm trong i18n, kể cả `aria-label` và `title`.

---

## 10. Quy trình đóng góp component

Khi cần một component mới:

1. **Tìm trước:** đã có trong `packages/ui` hoặc trong shadcn/ui chưa? Có ghép từ những cái đã có được không?
2. **Xác định lớp:** không biết nghiệp vụ thì vào `packages/ui`; biết nghiệp vụ thì vào feature.
3. **Thêm bằng CLI** (nếu từ shadcn/ui) vào `packages/ui` rồi chỉnh theo token.
4. **Đủ yêu cầu trước khi merge:**
   - [ ] Dùng token, không giá trị cứng
   - [ ] Biến thể bằng `cva`, API prop gọn
   - [ ] Đủ trạng thái (hover, focus, active, disabled, lỗi, đang tải)
   - [ ] Dùng bàn phím được, aria đúng, đạt axe
   - [ ] Không chuỗi cứng; hỗ trợ VI/EN (kể cả độ dài chữ khác nhau)
   - [ ] Đáp ứng 360 đến 1440 px
   - [ ] Có trong trang `/dev/ui` kèm các trạng thái
   - [ ] Có test cho hành vi chính (tương tác, trạng thái)
5. **Thay đổi phá vỡ:** sửa tất cả chỗ dùng trong cùng PR; đổi token lớn kèm ADR.

### Trang `/dev/ui`

Mỗi ứng dụng có trang nội bộ `/dev/ui` (chỉ bật ở môi trường phát triển) liệt kê token, mọi component với các trạng thái. Thay thế Storybook ở giai đoạn đầu; chuyển sang Storybook chỉ khi số component lớn và có nhiều người cùng làm.
