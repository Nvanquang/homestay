# 02 · Wireframes – Giai đoạn 1

> Mỗi màn hình có: **meta (route, role, slice)** · **component** · **action** · **status/state** · **wireframe Desktop (≥1024px) + Mobile (<768px)**. Tablet (768–1023px) mô tả bằng một dòng "Tablet" cho từng màn.
> Dữ liệu chi tiết từng ô nằm ở `04-screen-data.md`; hành vi tương tác ở `03-ux-behavior.md`.
> **v1.1:** bổ sung **mục 0.6 – Hệ màu & Design tokens** (màu trang, form, component, trạng thái; tham chiếu phong cách Airbnb, đạt WCAG AA). Mọi mô tả màu bằng chữ trong file này hiểu theo token ở 0.6.

---

## 0. Nền tảng layout dùng chung (làm một lần ở S01, dùng cho mọi slice)

### 0.1 Breakpoint & lưới
| | Mobile | Tablet | Desktop |
|---|---|---|---|
| Khoảng | < 768 | 768–1023 | ≥ 1024 (thiết kế ở 1280) |
| Lưới | 4 cột, gutter 16, lề 16 | 8 cột, gutter 24, lề 24 | 12 cột, gutter 24, container tối đa 1200 (Public) / fluid (Host, Admin) |
| Điều hướng | Header gọn + Bottom nav (Public/Account) · Hamburger drawer (Host/Admin) | Header đầy đủ, sidebar thu gọn icon | Header đầy đủ, sidebar 240px (Host/Admin) |
| Overlay | Bottom sheet / full-screen | Modal giữa 560px | Modal giữa 480–640px, drawer phải 420px |
| Chạm | Vùng bấm ≥ 44×44, input cao 48, font input ≥ 16px (tránh zoom iOS) | | Hover/focus-visible rõ |

### 0.2 Ký hiệu wireframe
```
[ Nút ]  nút chính/phụ        ( ) radio    [x] checkbox    [▼] dropdown
▢ ảnh/placeholder             ░░ skeleton   ⓘ tooltip       ✓ thành công   ⚠ cảnh báo   ✕ lỗi
─── đường phân cách            ┌─┐ khung    ← → điều hướng   ⋮ menu hành động
```

### 0.3 Bốn "shell" (khung trang)

**Public Shell** (P01–P10)
```
Desktop                                                              Mobile
┌──────────────────────────────────────────────────────────────┐    ┌──────────────────────────────┐
│ ◈ Logo   [Tìm kiếm nhanh*]     Trở thành Host  VI▼  ₫ VND▼  👤▼ │    │ ◈ Logo              VI▼  ☰  │
├──────────────────────────────────────────────────────────────┤    ├──────────────────────────────┤
│                         NỘI DUNG                              │    │          NỘI DUNG            │
├──────────────────────────────────────────────────────────────┤    ├──────────────────────────────┤
│ Footer: Giới thiệu · Trợ giúp · Điều khoản · Quyền riêng tư   │    │ 🔍Khám phá ♡Yêu thích* ✈Chuyến* │
└──────────────────────────────────────────────────────────────┘    │ ✉Hộp thư* 👤Tài khoản         │
 * ẩn/khoá ở giai đoạn 1: Yêu thích, Chuyến đi, Hộp thư (🔒 Phase sau)    └──────────────────────────────┘
 ₫ VND▼ (chọn tiền tệ) chỉ bật từ S13; trước đó ẩn.
```
Menu người dùng 👤▼: *Khách vãng lai* → Đăng nhập, Đăng ký. *Đã đăng nhập* → Hồ sơ, Cài đặt, Xác minh danh tính, **Chuyển sang chế độ Host / Guest**, Đăng xuất.

**Account Shell** (C01–C03): Public Shell + tiêu đề trang + sub-nav ngang (Hồ sơ · Cài đặt · Xác minh).
**Host Shell** (H02–H08)
```
Desktop                                                          Mobile
┌────────┬─────────────────────────────────────────────┐        ┌──────────────────────────────┐
│ ◈ Logo │ Chế độ Host ▾ (Chuyển sang Guest)  VI▼  👤▼  │        │ ☰  Chế độ Host          VI▼  👤 │
│ Listing│─────────────────────────────────────────────│        ├──────────────────────────────┤
│ Xác minh│ Breadcrumb: Listing › Nhà trên đồi › Lịch    │        │ Breadcrumb thu gọn (← Quay lại)│
│ 🔒Booking│ Tiêu đề trang      [Hành động chính]        │        │ Tiêu đề trang                 │
│ 🔒Thu nhập│ ─────────────────────────────────────────── │        │ NỘI DUNG                      │
│        │ NỘI DUNG                                     │        │ [Hành động chính – sticky dưới]│
└────────┴─────────────────────────────────────────────┘        └──────────────────────────────┘
 ☰ mở drawer trái (Listing, Xác minh, 🔒Booking, 🔒Thu nhập, Đăng xuất)
```
**Admin Shell** (A01 không dùng shell; A03, A04, A18 dùng)
```
Desktop                                                          Mobile (back-office tối thiểu dùng được trên tablet/phone)
┌─────────┬───────────────────────────────────────────┐         ┌──────────────────────────────┐
│ Admin   │ [🔍 Tìm nhanh]               Tên · Vai trò ▾ │         │ ☰ Admin               Tên ▾  │
│ Duyệt DT│───────────────────────────────────────────│         ├──────────────────────────────┤
│ Duyệt tin│ Tiêu đề · bộ lọc · bảng dữ liệu / chi tiết   │         │ Danh sách dạng thẻ dọc         │
│ Nhân sự │                                           │         │ Chi tiết full-screen           │
│ (menu theo vai trò)                                  │         └──────────────────────────────┘
└─────────┴───────────────────────────────────────────┘
```

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

### 0.5 Bảng trạng thái chuẩn (badge & ô lịch)

**Hồ sơ xác minh (IdentityVerification)**: `Chưa nộp` (neutral ○) · `Chờ duyệt` (warning ⏳) · `Đã xác minh` (success ✓) · `Bị từ chối` (error ✕) · `Cần cập nhật` (attention ⚠ – giấy tờ hết hạn).
**Listing**: `Nháp` (neutral ✎) · `Chờ duyệt` (warning ⏳) · `Đang hiển thị` (success ●) · `Cần chỉnh sửa` (attention ✎) · `Bị từ chối` (error ✕) · `Tạm ẩn` (neutral ⏸) · `Bị khoá` (error đặc 🔒).
**Ô lịch (H06)**: `Trống` (nền trắng, viền default) · `Đã đặt` (success đặc, icon ✓) · `Giữ chỗ` (warning, icon ⏱) · `Chờ Host` (attention, icon ?) · `Host chặn` (neutral + sọc chéo, icon ⊘) · `Chặn từ iCal` (như Host chặn, viền nét đứt, icon ⇄ — 🔒 chưa có dữ liệu ở giai đoạn 1) · `Quá khứ` (chữ disabled, không chọn được) · `Đang được chọn` (nền brand-50, viền 2px brand-600). **Mã màu chi tiết: xem 0.6.**


---

### 0.6 Hệ màu & Design tokens (áp dụng thống nhất cho toàn bộ wireframe)

> **Hướng tham chiếu:** phong cách Airbnb – nền trắng, chữ gần đen, **một** màu thương hiệu (hồng-đỏ) dành riêng cho hành động chính, phần còn lại là thang xám trung tính; màu ngữ nghĩa chỉ xuất hiện khi có trạng thái. Đây là bảng màu **đề xuất gần với Airbnb**, không sao chép nguyên bản; giá trị hex đã được tinh chỉnh để đạt **WCAG AA** (có tính tỷ lệ tương phản ở 0.6.4).
> **Quy ước tên màu trong các mô tả wireframe:** "xám" = `neutral` · "xanh" = `success` · "đỏ" = `error` · "vàng" = `warning` · "cam" = `attention` · "xanh dương" = `info` · "viền đậm/nền đậm" = `--gray-900`. Mọi chỗ ghi màu bằng chữ trong file này **phải hiểu theo token ở đây**, dev không chọn mã hex riêng.

#### 0.6.1 Nguyên tắc dùng màu
| # | Nguyên tắc | Ý nghĩa thực tế |
|---|---|---|
| C1 | **Tỷ lệ 90 / 9 / 1**: 90% trắng–xám, 9% đen `--gray-900` (chữ, viền nhấn, nút phụ), 1% thương hiệu | Màn hình trông sạch; mắt người dùng tự dồn vào CTA chính |
| C2 | **Thương hiệu `--brand-600` chỉ dành cho:** nút chính (mỗi màn **tối đa 1 nút chính** hiển thị cùng lúc), logo, mục đang chọn ở Bottom nav (mobile), vạch nhấn mục đang chọn ở Sidebar, tim yêu thích | Không dùng cho viền ô nhập, tiêu đề, badge, biểu đồ |
| C3 | Trạng thái chọn của control (checkbox, radio, switch, chip, tab, ngày chọn) dùng **đen `--gray-900`**, không dùng hồng | Giống Airbnb; tách "đang chọn" khỏi "hành động chính" |
| C4 | **Màu ngữ nghĩa nhất quán toàn hệ thống**: xanh = thành công/đã duyệt/hợp lệ · đỏ = lỗi/từ chối/nguy hiểm · vàng = đang chờ · cam = cần người dùng hành động · xanh dương = thông tin trung tính | Một trạng thái = một màu ở mọi màn |
| C5 | **Không bao giờ chỉ dùng màu** để truyền nghĩa: luôn đi kèm icon + chữ (hoặc hoa văn với ô lịch) | Người mù màu, in đen trắng |
| C6 | Chữ nhỏ (<18,66px đậm / <24px thường) cần tỷ lệ ≥ **4,5:1**; chữ lớn, icon, viền control cần ≥ **3:1** | WCAG 2.1 AA |
| C7 | Nền trang mặc định **trắng**; chỉ Back-office (Admin) dùng nền canvas xám `--gray-50` kèm panel trắng | Public/Account/Host giống nhau để Host chuyển qua lại không "lạc" |
| C8 | Không dùng gradient, không bóng màu; nút chính **màu phẳng** (khác Airbnb có gradient) để dễ triển khai và nhất quán | Giảm rủi ro khi làm thư viện component |
| C9 | **Giai đoạn 1 chỉ có chế độ sáng.** Token đặt theo vai trò ngữ nghĩa nên thêm dark mode sau không phải sửa wireframe | Ngoài phạm vi 13 slice |

#### 0.6.2 Bảng màu gốc (primitive)
**Thương hiệu**
| Token | Hex | Dùng cho |
|---|---|---|
| `--brand-50` | `#FFF0F3` | Nền tint rất nhạt (hiếm dùng: vùng nhấn thương hiệu, nền focus tạm trên lịch Host) |
| `--brand-100` | `#FFD9E0` | Viền tint |
| `--brand-500` | `#FF385C` | **Đồ hoạ**: logo, tim yêu thích, vòng tròn vị trí xấp xỉ trên bản đồ. **Không dùng làm chữ** hay nền nút (chữ trắng chỉ đạt 3,52:1) |
| `--brand-600` | `#E00B41` | **Nút chính (nền)**, chữ nhấn thương hiệu, tab Bottom nav đang chọn |
| `--brand-700` | `#C20A38` | Nút chính khi hover; chữ trên nền `--brand-50` |
| `--brand-800` | `#A30830` | Nút chính khi pressed |

**Trung tính (thang xám)**
| Token | Hex | Dùng cho |
|---|---|---|
| `--gray-0` | `#FFFFFF` | Nền trang, nền thẻ, nền ô nhập |
| `--gray-50` | `#F7F7F7` | Nền canvas Admin, nền footer, hover hàng/thẻ, nền ô chỉ đọc/disabled |
| `--gray-100` | `#EBEBEB` | Skeleton, đường kẻ nhẹ, nền badge trung tính, dòng đang chọn trong bảng |
| `--gray-200` | `#DDDDDD` | Viền thẻ/đường phân cách (**trang trí, không dùng làm viền ô nhập**) |
| `--gray-400` | `#B0B0B0` | Chữ/icon **disabled** (được miễn tỷ lệ tương phản) |
| `--gray-500` | `#6A6A6A` | Chữ phụ, placeholder, **viền ô nhập/checkbox/radio**, icon thứ cấp |
| `--gray-700` | `#484848` | Chữ trên badge trung tính |
| `--gray-900` | `#222222` | Chữ chính, nút phụ, trạng thái đang chọn, toast/tooltip (nền) |

**Ngữ nghĩa** (mỗi nhóm 4 giá trị: `fg` chữ/icon · `bg` nền nhạt · `border` viền nhạt · `solid` nền đặc cho nút/ô nhấn)
| Nhóm | `fg` | `bg` | `border` | `solid` | Ý nghĩa |
|---|---|---|---|---|---|
| `success` | `#00793A` | `#E6F4EA` | `#A8D5B5` | `#00793A` | Thành công, Đã xác minh, Đang hiển thị, Đã đặt, giảm giá |
| `error` | `#C13515` | `#FFF0ED` | `#F2B8A8` | `#C13515` | Lỗi nhập liệu, Bị từ chối, Bị khoá, hành động nguy hiểm |
| `warning` | `#8A5A00` | `#FFF4D6` | `#F0D58A` | `#8A5A00` | Chờ duyệt, Giữ chỗ, cảnh báo mềm, bị khoá bởi người khác |
| `attention` | `#B34700` | `#FFEDE0` | `#F5C9A6` | `#B34700` | Cần người dùng làm gì đó: Cần chỉnh sửa, Cần cập nhật, Chờ Host |
| `info` | `#0B57D0` | `#E8F0FE` | `#AECBFA` | `#0B57D0` | Thông tin trung tính, link trong banner, vùng kéo-thả đang hover |

#### 0.6.3 Token ngữ nghĩa (đây là thứ component thực sự tham chiếu) – dạng CSS
```css
:root {
  /* --- Primitive --- */
  --brand-50:#FFF0F3; --brand-100:#FFD9E0; --brand-500:#FF385C;
  --brand-600:#E00B41; --brand-700:#C20A38; --brand-800:#A30830;
  --gray-0:#FFFFFF; --gray-50:#F7F7F7; --gray-100:#EBEBEB; --gray-200:#DDDDDD;
  --gray-400:#B0B0B0; --gray-500:#6A6A6A; --gray-700:#484848; --gray-900:#222222;
  --success-fg:#00793A; --success-bg:#E6F4EA; --success-border:#A8D5B5; --success-solid:#00793A;
  --error-fg:#C13515;   --error-bg:#FFF0ED;   --error-border:#F2B8A8;   --error-solid:#C13515;
  --warning-fg:#8A5A00; --warning-bg:#FFF4D6; --warning-border:#F0D58A; --warning-solid:#8A5A00;
  --attention-fg:#B34700; --attention-bg:#FFEDE0; --attention-border:#F5C9A6; --attention-solid:#B34700;
  --info-fg:#0B57D0;    --info-bg:#E8F0FE;    --info-border:#AECBFA;    --info-solid:#0B57D0;

  /* --- Bề mặt --- */
  --bg-page:var(--gray-0);        /* Public, Account, Host */
  --bg-canvas:var(--gray-50);     /* Admin shell, A01 */
  --bg-surface:var(--gray-0);     /* thẻ, panel, modal, ô nhập */
  --bg-subtle:var(--gray-50);     /* hover, readonly, footer, header bảng */
  --bg-muted:var(--gray-100);     /* skeleton, badge trung tính, hàng đang chọn */
  --bg-inverse:var(--gray-900);   /* toast, tooltip, ô lịch đang chọn */
  --overlay:rgba(0,0,0,.5);       /* nền mờ sau modal/sheet */

  /* --- Chữ --- */
  --text-primary:var(--gray-900);
  --text-secondary:var(--gray-500);
  --text-disabled:var(--gray-400);
  --text-inverse:var(--gray-0);
  --text-brand:var(--brand-600);
  --text-link:var(--gray-900);          /* gạch chân; hover → --brand-600 */
  --text-error:var(--error-fg);
  --text-success:var(--success-fg);

  /* --- Viền --- */
  --border-subtle:var(--gray-100);      /* đường kẻ trong bảng, header/footer */
  --border-default:var(--gray-200);     /* thẻ, panel, divider */
  --border-input:var(--gray-500);       /* ô nhập, checkbox, radio */
  --border-strong:var(--gray-900);      /* hover/focus/đang chọn */
  --border-error:var(--error-fg);

  /* --- Hành động --- */
  --action-primary-bg:var(--brand-600);
  --action-primary-hover:var(--brand-700);
  --action-primary-active:var(--brand-800);
  --action-primary-text:var(--gray-0);
  --action-secondary-border:var(--gray-900);
  --action-danger-bg:var(--error-solid);
  --action-danger-hover:#A82D12;
  --action-danger-active:#8F250F;
  --neutral-badge-bg:var(--gray-100);
  --action-disabled-bg:var(--gray-100);
  --action-disabled-text:var(--gray-400);

  /* --- Focus --- */
  --focus-ring:0 0 0 2px var(--gray-0), 0 0 0 4px var(--gray-900); /* trên nền tối: đổi 2 lớp cho nhau */

  /* --- Độ cao (bóng) --- */
  --shadow-1:0 1px 2px rgba(0,0,0,.08), 0 1px 1px rgba(0,0,0,.04);        /* header sticky, thẻ */
  --shadow-2:0 2px 4px rgba(0,0,0,.08), 0 6px 16px rgba(0,0,0,.10);       /* thẻ hover, dropdown, popover */
  --shadow-3:0 8px 28px rgba(0,0,0,.18);                                   /* modal, drawer, bottom sheet */
}
```
Tailwind/CSS-in-JS: ánh xạ 1-1 theo tên (`bg-page`, `text-secondary`, `border-input`, `action-primary`…); **cấm dùng mã hex trực tiếp trong component**.

#### 0.6.4 Kiểm tra tương phản (tính bằng công thức WCAG)
| Cặp màu (chữ/icon trên nền) | Nền dùng ở | Tỷ lệ | Đạt | Dùng cho |
|---|---|---|---|---|
| Chữ chính `--text-primary` #222222 | nền trang | 15.91:1 | ✅ AA | Thân bài, nhãn, tiêu đề |
| Chữ chính trên canvas | `--bg-canvas` | 14.85:1 | ✅ AA | Back-office |
| Chữ phụ `--text-secondary` #6A6A6A | nền trang | 5.41:1 | ✅ AA | Mô tả, helper, placeholder, meta |
| Chữ phụ trên canvas | `--bg-canvas` | 5.05:1 | ✅ AA | Header bảng, footer |
| Chữ phụ trên nền muted | `--bg-muted` | 4.54:1 | ✅ AA | Ô lịch Host chặn |
| Viền input `--border-input` #6A6A6A | nền trang | 5.41:1 | ✅ AA | Ô nhập, checkbox, radio (≥3:1) |
| Chữ trắng trên nút chính #E00B41 | `--action-primary-bg` | 4.89:1 | ✅ AA | Nút chính |
| Chữ trắng trên nút chính hover #C20A38 | `--action-primary-hover` | 6.19:1 | ✅ AA | Hover |
| Chữ trắng trên nút chính pressed #A30830 | `--action-primary-active` | 7.97:1 | ✅ AA | Pressed |
| Chữ thương hiệu #E00B41 trên trắng | nền trang | 4.89:1 | ✅ AA | Link nhấn mạnh, nhãn thương hiệu |
| Chữ thương hiệu đậm #C20A38 trên brand-50 | `--brand-50` | 5.60:1 | ✅ AA | Chữ trên nền tint hồng |
| Logo/icon thương hiệu #FF385C trên trắng | nền trang | 3.52:1 | ✅ ≥3:1 | **Chỉ đồ hoạ ≥3:1** (logo, tim yêu thích) – KHÔNG dùng làm chữ |
| Chữ trắng trên #222222 | `--bg-inverse` | 15.91:1 | ✅ AA | Toast, tooltip, ô lịch đã chọn |
| Chữ lỗi #C13515 trên trắng | nền trang | 5.54:1 | ✅ AA | Helper lỗi |
| Chữ lỗi trên error-bg | `--error-bg` | 5.00:1 | ✅ AA | Banner/badge lỗi |
| Chữ trắng trên nút nguy hiểm #C13515 | `--action-danger-bg` | 5.54:1 | ✅ AA | Nút Từ chối/Xoá/Khoá |
| Chữ thành công #00793A trên trắng | nền trang | 5.53:1 | ✅ AA | Giảm giá, ✓ |
| Chữ thành công trên success-bg | `--success-bg` | 4.87:1 | ✅ AA | Badge/banner thành công |
| Chữ trắng trên success đặc #00793A | `--success-solid` | 5.53:1 | ✅ AA | Ô lịch Đã đặt |
| Chữ cảnh báo #8A5A00 trên warning-bg | `--warning-bg` | 5.41:1 | ✅ AA | Badge Chờ duyệt, Giữ chỗ |
| Chữ cảnh báo #8A5A00 trên trắng | nền trang | 5.93:1 | ✅ AA | Icon/chữ cảnh báo lẻ |
| Chữ chú ý #B34700 trên attention-bg | `--attention-bg` | 4.83:1 | ✅ AA | Badge Cần chỉnh sửa, Chờ Host |
| Chữ chú ý #B34700 trên trắng | nền trang | 5.50:1 | ✅ AA | Nguồn giá Đặc biệt |
| Chữ thông tin #0B57D0 trên trắng | nền trang | 6.39:1 | ✅ AA | Link trong banner, nguồn giá Cuối tuần |
| Chữ thông tin trên info-bg | `--info-bg` | 5.57:1 | ✅ AA | Banner thông tin |
| Chữ trung tính #484848 trên #EBEBEB | `--neutral-badge-bg` | 7.67:1 | ✅ AA | Badge Nháp, Tạm ẩn, Chưa nộp |

**Giá trị đã thử và loại bỏ** (không đạt, đừng dùng):
| Cặp | Tỷ lệ | Kết quả |
|---|---|---|
| Chữ trắng trên #FF385C (brand-500) | 3.52:1 | ❌ |
| Chữ #E00B41 trên brand-50 | 4.43:1 | ❌ |
| Chữ #B0B0B0 trên trắng | 2.17:1 | ❌ |
| Viền #DDDDDD trên trắng | 1.36:1 | ❌ |

> Hệ quả thiết kế: nút chính dùng `#E00B41` (không phải `#FF385C`); chữ nhấn thương hiệu **không** đặt trên nền `--brand-50` bằng `--brand-600` mà dùng `--brand-700`; viền ô nhập dùng `--gray-500` (không phải `--gray-200`).

#### 0.6.5 Màu theo bề mặt (trang, shell, khối)
| Bề mặt | Nền | Viền/đường kẻ | Ghi chú |
|---|---|---|---|
| Public Shell – trang (P01–P10) | `--bg-page` | – | Hero P01 nền trắng, ảnh là điểm nhấn màu duy nhất |
| Public Header | `--bg-surface`; có `--shadow-1` khi cuộn | dưới: `--border-subtle` | Logo `--brand-500`; link `--text-primary`; ô tìm kiếm thu gọn: viền `--border-default` + `--shadow-1` |
| Footer | `--bg-subtle` | trên: `--border-default` | Chữ `--text-secondary`, link `--text-primary` |
| Bottom nav (mobile) | `--bg-surface` | trên: `--border-subtle` | Mục chưa chọn `--text-secondary`; **đang chọn `--brand-600`** (icon + nhãn đậm); mục 🔒 `--text-disabled` |
| Account Shell (C01–C03) | `--bg-page` | sub-nav: gạch chân mục đang chọn `--gray-900` 2px | Khối nội dung: thẻ `--bg-surface` + viền `--border-default`, bo 12 |
| Host Shell – trang (H02–H08) | `--bg-page` | – | Cùng nền với Public để Host chuyển chế độ không bị lệch giao diện |
| Sidebar (Host/Admin) | `--bg-surface` | phải: `--border-subtle` | Mục hover `--bg-subtle`; **đang chọn**: nền `--bg-subtle` + chữ đậm `--text-primary` + vạch trái 3px `--brand-600`; mục 🔒 `--text-disabled` + icon khoá |
| Admin Shell – trang (A03, A04, A18) | **`--bg-canvas`** | – | Mọi khối nội dung là panel `--bg-surface` + `--border-default` + bo 12 (tách vùng dữ liệu dày đặc) |
| A01 Đăng nhập quản trị | `--bg-canvas` | – | Thẻ trắng giữa trang, `--shadow-2`; không dùng logo hồng lớn (dùng logo xám `--gray-900` + chữ "Admin Console") để người dùng nhận ra khác site công khai |
| Form (mọi nơi) | nền trang/panel | – | Ô nhập luôn `--bg-surface`; không tô nền vùng form |
| Modal / Drawer / Bottom sheet | `--bg-surface` + `--shadow-3` | tiêu đề/chân: `--border-subtle` | Nền mờ `--overlay`; tay kéo sheet `--gray-200` |
| Vùng chọn/nhấn mạnh trong nội dung (ví dụ khối "Lý do từ chối") | `--error-bg` / `--attention-bg` theo ngữ nghĩa | viền `*-border` | Chữ tiêu đề `*-fg`, chữ thân `--text-primary` |
| Skeleton | nền `--gray-100`, ánh sáng quét `--gray-50` (1,2 s) | – | `prefers-reduced-motion`: tĩnh |

#### 0.6.6 Màu theo component (đặc tả đủ trạng thái)

**Nút (CMP-01)**
| Biến thể | Default | Hover | Pressed | Focus | Disabled | Loading |
|---|---|---|---|---|---|---|
| **Primary** | nền `--action-primary-bg`, chữ `--action-primary-text` | nền `--action-primary-hover` | nền `--action-primary-active` | `--focus-ring` | nền `--action-disabled-bg`, chữ `--action-disabled-text` | giữ nền default, spinner trắng thay chữ |
| **Secondary** | nền `--bg-surface`, viền 1px `--action-secondary-border`, chữ `--text-primary` | nền `--bg-subtle` | nền `--bg-muted` | `--focus-ring` | viền `--border-default`, chữ `--text-disabled` | spinner `--gray-900` |
| **Tertiary** (link) | chữ `--text-primary` gạch chân | nền `--bg-subtle`, chữ `--text-brand` | nền `--bg-muted` | `--focus-ring` | chữ `--text-disabled` | – |
| **Danger** (đặc) | nền `--action-danger-bg`, chữ trắng | nền `--action-danger-hover` | nền `--action-danger-active` | `--focus-ring` | như Primary disabled | spinner trắng |
| **Danger outline** | viền 1px `--error-fg`, chữ `--error-fg`, nền trắng | nền `--error-bg` | nền `--error-border` | `--focus-ring` | như Secondary disabled | spinner `--error-fg` |
Quy tắc: mỗi màn **một** Primary. Hành động huỷ/quay lại = Secondary hoặc Tertiary. Hành động huỷ bỏ dữ liệu (Xoá, Từ chối, Khoá) = Danger hoặc Danger outline, **không** dùng Primary.

**Ô nhập (CMP-02/03/04)**
| Trạng thái | Nền | Viền | Chữ | Phụ |
|---|---|---|---|---|
| Default | `--bg-surface` | 1px `--border-input` | `--text-primary`; placeholder `--text-secondary` | Nhãn `--text-primary`; helper `--text-secondary` |
| Hover | như default | 1px `--border-strong` | | |
| Focus | như default | **2px `--border-strong`** (không đổi sang hồng) | | + `--focus-ring` ngoài |
| Error | như default | **2px `--border-error`** | | Helper lỗi `--text-error` + icon ✕ (không chỉ dựa vào màu) |
| Success (hiếm: kiểm tra xong) | như default | 1px `--border-input` | | Icon ✓ `--success-fg` |
| Disabled | `--bg-subtle` | 1px `--border-default` | `--text-disabled` | |
| Read-only | `--bg-subtle` | 1px `--border-default` | `--text-primary` | Icon khoá tuỳ chọn |

**Checkbox / Radio / Switch / Stepper (CMP-05/06)**
| Control | Chưa chọn | Đã chọn | Disabled |
|---|---|---|---|
| Checkbox | viền 1px `--border-input`, nền trắng | nền `--gray-900`, dấu ✓ trắng | viền `--border-default`, nền `--bg-subtle` |
| Radio | viền 1px `--border-input` | viền 2px `--gray-900`, chấm giữa `--gray-900` | như trên |
| Switch | rãnh `--gray-500`, núm trắng, nhãn "Tắt" | rãnh `--gray-900`, núm trắng, nhãn "Bật" | rãnh `--gray-200` |
| Stepper (−/+) | nút tròn viền `--border-input`, icon `--text-primary` | – | viền `--border-default`, icon `--text-disabled` ở biên min/max |
| Thẻ chọn (chính sách huỷ, kiểu đặt, loại hình) | viền 1px `--border-default`, nền trắng; hover viền `--border-strong` | **viền 2px `--gray-900` + nền `--bg-subtle` + dấu ✓ góc** | viền `--border-default`, chữ `--text-disabled` |

**Chip lọc, Tab, Link**
| Component | Default | Hover | Đang chọn |
|---|---|---|---|
| FilterChip (CMP-20) | nền trắng, viền 1px `--border-default`, chữ `--text-primary` | viền `--border-strong` | nền `--bg-subtle`, viền **2px `--gray-900`**; số lượng lọc: huy hiệu nền `--gray-900` chữ trắng |
| Tab (P05, H04 mobile, A04) | chữ `--text-secondary` | chữ `--text-primary`, gạch chân 2px `--gray-200` | chữ `--text-primary` đậm, gạch chân 2px `--gray-900` |
| Link trong nội dung | chữ `--text-link` gạch chân | chữ `--text-brand` | – |
| Link trong banner | `*-fg` của banner, gạch chân | đậm hơn | – |

**Badge trạng thái (CMP-10)** – dạng *tint*: nền `*-bg`, chữ + icon `*-fg`, viền 1px `*-border`, bo 999px, kèm **icon + chữ**; riêng "Bị khoá" dạng *solid*: nền `--error-solid`, chữ trắng + icon 🔒.

| Nhóm màu | Dùng cho |
|---|---|
| `neutral` (nền `--bg-muted`, chữ `--gray-700`) | Chưa nộp, Nháp, Tạm ẩn |
| `warning` | Chờ duyệt, Giữ chỗ |
| `attention` | Cần chỉnh sửa, Cần cập nhật, Chờ Host |
| `success` | Đã xác minh, Đang hiển thị, Đã đặt, Đã duyệt |
| `error` | Bị từ chối; (solid) Bị khoá |
| `info` | Mới, Thông tin phụ (ví dụ "Bản xem trước") |

**Banner / Alert (CMP-08)**: nền `*-bg`, viền 1px `*-border`, icon + **tiêu đề** màu `*-fg`, **nội dung** `--text-primary`, link `*-fg` gạch chân, bo 12. Ánh xạ: lỗi hệ thống/validate tổng = `error` · "Chờ duyệt", "tài khoản chưa xác minh" = `warning` · "Cần chỉnh sửa/ cần cập nhật" = `attention` · hướng dẫn, quyền riêng tư = `info` · "Đã xác minh", "Đổi mật khẩu thành công" = `success`.

**Toast (CMP-07)**: nền `--bg-inverse`, chữ `--text-inverse`, nút hành động chữ trắng gạch chân, `--shadow-3`; **Toast lỗi**: nền `--error-solid`, chữ trắng (không tự tắt).

**Tooltip / Popover**: tooltip nền `--bg-inverse` chữ trắng bo 8; popover nền `--bg-surface` + `--shadow-2` + viền `--border-default`.

**Thẻ & bảng**
| Phần tử | Quy định |
|---|---|
| Thẻ chung (panel, ListingRowHost) | nền `--bg-surface`, viền `--border-default`, bo 12; hover (nếu bấm được) `--shadow-2` |
| ListingCard (CMP-19) | không viền, ảnh bo 12, vùng chờ ảnh `--bg-muted`; tiêu đề `--text-primary` đậm; thông tin phụ và dòng "Đã gồm phí và thuế" `--text-secondary`; giá `--text-primary` đậm; nhãn Instant Book: nền trắng + viền `--border-default` + icon ⚡ `--gray-900` (đặt trên ảnh, có `--shadow-1`); tim yêu thích 🔒: viền trắng nét đen mờ, khi bật **tô `--brand-500`** |
| DataTable (CMP-24) | đầu bảng nền `--bg-subtle`, chữ `--text-secondary` đậm; hàng viền dưới `--border-subtle`; hover `--bg-subtle`; **hàng đang chọn `--bg-muted`**; hàng được gắn cờ ⚑: vạch trái 3px `--warning-fg` |
| Dòng "Lý do từ chối" (H02, H05) | khối `--error-bg` (từ chối) hoặc `--attention-bg` (cần chỉnh sửa), vạch trái 4px `*-fg` |

**Modal & Sheet (CMP-09/25)**: nền `--bg-surface`, `--shadow-3`, nền mờ `--overlay`; nút xác nhận hành động nguy hiểm dùng **Danger**, nút còn lại Secondary; xác nhận bình thường dùng Primary.

**Tải tệp (CMP-13)**
| Trạng thái | Quy định |
|---|---|
| Vùng thả rỗng | viền 1px **nét đứt** `--border-input`, nền `--bg-subtle`, icon `--text-secondary` |
| Đang kéo qua | viền 2px nét đứt `--info-fg`, nền `--info-bg` |
| Đang tải | thẻ tệp viền `--border-default`; thanh tiến trình rãnh `--bg-muted`, phần đã tải `--gray-900`; chữ % `--text-secondary` |
| Đã tải | icon ✓ `--success-fg` |
| Lỗi | viền 2px `--border-error`, chữ lỗi `--text-error` + icon ✕, nút "Thử lại" Tertiary |

**WizardNav (CMP-15)**
| Trạng thái bước | Quy định |
|---|---|
| Chưa làm ○ | số/biểu tượng `--text-secondary` |
| Đang làm ◐ | nền `--bg-subtle`, chữ `--text-primary` đậm, vạch trái 3px `--gray-900` |
| Hoàn thành ✓ | icon ✓ `--success-fg`, chữ `--text-primary` |
| Có lỗi ⚠ | icon ⚠ `--error-fg`, chữ `--text-primary` |
| Chưa mở 🔒 | chữ + icon `--text-disabled` |
Thanh tiến độ mobile: rãnh `--bg-muted`, phần đã đi `--gray-900`. SaveIndicator: "Đã lưu" `--text-secondary`; "Đang lưu…" `--text-secondary` + spinner; "Lưu thất bại" `--error-fg` + nút Thử lại.

**Bảng giá (CMP-22)**: nhãn/giá `--text-primary`; dòng **giảm giá** (số âm) `--success-fg`; dòng **Tổng** đậm, đường kẻ trên `--border-default`; chú thích ("Đã gồm phí và thuế", "Giá quy đổi") `--text-secondary`; vi phạm/không khả dụng `--text-error` + icon ✕; CTA vô hiệu theo Primary disabled.

**DateRangePicker khách (CMP-16 – P01/P02/P03)**
| Ô | Quy định |
|---|---|
| Ngày thường | chữ `--text-primary`, hover viền tròn 1px `--border-strong` |
| Ngày đầu/cuối được chọn | nền `--gray-900`, chữ trắng, tròn |
| Khoảng giữa | nền `--bg-subtle`, chữ `--text-primary` |
| Ngày không trống / quá khứ | chữ `--text-disabled`, **gạch ngang** với ngày đã đặt (không chỉ mờ) |
| Ngày vi phạm quy tắc (đêm tối thiểu, báo trước) | chữ `--text-disabled`, tooltip lý do |

**Lịch Host (CMP-23 – H06)** (mỗi trạng thái có **màu + icon + hoa văn** để không phụ thuộc màu)
| Trạng thái ô | Nền | Chữ/icon | Viền | Ghi chú |
|---|---|---|---|---|
| Trống | `--bg-surface` | `--text-primary` | 1px `--border-default` | Hover: viền `--border-strong` |
| Đã đặt | `--success-solid` | trắng, icon ✓ | – | |
| Giữ chỗ | `--warning-bg` | `--warning-fg`, icon ⏱ | 1px `--warning-border` | |
| Chờ Host | `--attention-bg` | `--attention-fg`, icon ? | 1px `--attention-border` | |
| Host chặn | `--bg-muted` + **sọc chéo** `--gray-200` | `--text-secondary`, icon ⊘ | 1px `--border-default` | |
| Chặn từ iCal 🔒 | như Host chặn | icon ⇄ | **nét đứt** `--border-input` | Chưa có dữ liệu ở giai đoạn 1 |
| Quá khứ | `--bg-surface` | `--text-disabled` | không viền | Không chọn được |
| **Đang được chọn** | `--brand-50` | `--text-primary` | **2px `--brand-600`** | Màu thương hiệu duy nhất trên lịch (dấu "đang thao tác") |
| Chấm "khách không đặt được" | – | chấm 6px `--gray-500` | – | Ngoài quy tắc đặt |
| Dải thời gian chuẩn bị | `--bg-subtle` (mờ) | – | – | Chỉ thông tin |
| Xung đột (409) | – | – | nhấp nháy 3 s viền `--error-fg` | |

**Nguồn giá (chấm màu trên lịch giá – H08)**: Cơ bản `--gray-500` · Cuối tuần `--info-fg` · Mùa `--success-fg` · Lễ `--brand-600` · Đặc biệt `--attention-fg`. Mỗi chấm luôn đi kèm nhãn chữ trong chú thích/tooltip.

**Bản đồ (CMP-21)**
| Phần tử | Quy định |
|---|---|
| Marker giá (mặc định) | nền trắng, chữ `--text-primary` đậm, viền 1px `--border-default`, `--shadow-2` |
| Marker hover / đang chọn | nền `--gray-900`, chữ trắng |
| Marker đã xem | nền `--bg-muted`, chữ `--text-secondary` |
| Cụm (cluster) | nền trắng, viền 2px `--gray-900`, chữ đậm |
| Vòng tròn vị trí xấp xỉ (H04 bước 2, P03) | tô `--brand-500` @ 12%, viền `--brand-500` @ 70% (đồ hoạ, không có chữ) |
| Khung vùng tìm kiếm (bbox) | viền nét đứt `--gray-900`, tô `--gray-900` @ 6% |
| Nút "Tìm trong khu vực này" | Secondary, nổi `--shadow-2` |

**Back-office**
| Phần tử | Quy định |
|---|---|
| LockBanner (CMP-31) | bạn đang giữ khoá: `info` · **người khác đang xử lý**: `warning` + chế độ chỉ xem · **mất khoá**: `error` |
| SecureImageViewer (CMP-30) | ảnh che mờ + lớp phủ `rgba(34,34,34,.6)`, nút "Bấm để xem" dạng **Secondary đảo** (nền trắng, chữ `--gray-900`); watermark chữ trắng 55% có bóng chữ mờ; khi URL hết hạn quay về trạng thái che |
| Cờ ⚑ (trùng giấy tờ/địa chỉ) | banner `warning`; trong bảng: icon ⚑ `--warning-fg` + vạch trái 3px |
| Nút quyết định | **Duyệt** = Primary · **Yêu cầu chỉnh sửa** = Secondary · **Từ chối** = Danger outline (trong dialog xác nhận: Danger đặc) |
| Hàng nhân sự bị khoá | chữ `--text-secondary`, badge `neutral` "Đã khoá" + icon ⏸ |

**Trạng thái trang**
| Trang | Quy định |
|---|---|
| Rỗng (CMP-12) | minh hoạ nét xám (`--gray-200` / `--gray-500`), tiêu đề `--text-primary`, mô tả `--text-secondary`, CTA Primary hoặc Secondary |
| 403/404/500/Bảo trì | như Rỗng; mã lỗi lớn chữ `--gray-200` làm hoạ tiết, không dùng đỏ để tránh cảm giác "sự cố nghiêm trọng" ở 404 |
| Xác minh email (P09) | ✓ `--success-fg` / ⚠ `--warning-fg` (hết hạn) / ℹ `--info-fg` (đã dùng) / ✕ `--error-fg` (token hỏng) – icon tròn 56px nền `*-bg` |
| Offline banner | `--bg-inverse` chữ trắng, cố định đầu trang |

#### 0.6.7 Bảng ánh xạ trạng thái nghiệp vụ → màu (nguồn duy nhất, thay cho mô tả ở 0.5)
| Thực thể | Trạng thái | Nhóm màu | Icon |
|---|---|---|---|
| Hồ sơ xác minh | Chưa nộp | neutral | ○ |
| | Chờ duyệt | warning | ⏳ |
| | Đã xác minh | success | ✓ |
| | Bị từ chối | error | ✕ |
| | Cần cập nhật | attention | ⚠ |
| Listing | Nháp | neutral | ✎ (bút) |
| | Chờ duyệt | warning | ⏳ |
| | Đang hiển thị | success | ● |
| | Cần chỉnh sửa | attention | ✎ |
| | Bị từ chối | error | ✕ |
| | Tạm ẩn | neutral | ⏸ |
| | Bị khoá | error (solid) | 🔒 |
| Nhân sự | Hoạt động | success | ● |
| | Chờ kích hoạt | warning | ✉ |
| | Đã khoá | neutral | ⏸ |
| Quy tắc giá | Sắp tới | info | ⏳ |
| | Đang áp dụng | success | ● |
| | Đã qua | neutral | ⌛ |
| Tệp tải lên | Đang tải / Đã tải / Lỗi | neutral / success / error | ↑ / ✓ / ✕ |

#### 0.6.8 Ví dụ áp dụng (đối chiếu nhanh khi dựng giao diện)

**P06 – Đăng nhập** (nhãn token đặt trong ngoặc vuông)
```
┌ nền trang [bg-page] ────────────────────────────────────────────────┐
│ Header [bg-surface | border-subtle]   Logo [brand-500]               │
│        ┌ Banner thành công [success-bg | success-border] ─────────┐ │
│        │ ✓ Email đã được xác minh   (tiêu đề success-fg, nội dung   │ │
│        │   text-primary)                                           │ │
│        └──────────────────────────────────────────────────────────┘ │
│        Đăng nhập                      (text-primary, đậm)           │
│        Email                          (nhãn text-primary)           │
│        [________________________]     (nền bg-surface, viền 1px     │
│                                        border-input; focus 2px      │
│                                        border-strong)               │
│        Mật khẩu [______________ 👁]   (icon text-secondary)         │
│        [x] Ghi nhớ   Quên mật khẩu?   (checkbox gray-900; link      │
│                                        text-link gạch chân)         │
│        [        Đăng nhập        ]    (Primary: action-primary-bg,  │
│                                        chữ trắng)                   │
│        Chưa có tài khoản? Đăng ký     (text-secondary + link)       │
└──────────────────────────────────────────────────────────────────────┘
 Lỗi: ô viền 2px [border-error], dòng "✕ Email hoặc mật khẩu không đúng" [text-error]
```
**H06 – Lịch Host (một tuần)**
```
 T2        T3        T4          T5          T6         T7        CN
┌────────┬────────┬──────────┬──────────┬──────────┬─────────┬────────┐
│  15    │  16    │ 17 ✓     │ 18 ✓     │ 19 ⏱     │ 20 ?    │ 21 ⊘   │
│ Trống  │ Trống  │ Đã đặt   │ Đã đặt   │ Giữ chỗ  │ Chờ Host│ Chặn   │
│ trắng/ │ trắng/ │ nền      │ nền      │ nền      │ nền     │ nền    │
│ viền   │ viền   │ success- │ success- │ warning- │ attent- │ muted  │
│ default│ default│ solid    │ solid    │ bg       │ ion-bg  │ + sọc  │
└────────┴────────┴──────────┴──────────┴──────────┴─────────┴────────┘
 Ô đang chọn: nền brand-50 + viền 2px brand-600   |  Nút "Chặn 3 ngày": Primary
```
**A03 – Quyết định** (đáy chi tiết): `[Từ chối… ]` Danger outline · `[Yêu cầu chỉnh sửa…]` Secondary · `[Duyệt hồ sơ]` Primary. Nền trang `--bg-canvas`, mọi khối là panel `--bg-surface`.

#### 0.6.9 Danh mục "cấm"
| ❌ Không làm | ✅ Thay bằng |
|---|---|
| Dùng `--brand-500` làm nền nút hoặc chữ | `--brand-600` (nút) / `--brand-700` (chữ trên tint) |
| Hai nút Primary cạnh nhau | 1 Primary + 1 Secondary/Tertiary |
| Nút Primary cho hành động phá huỷ | Danger / Danger outline |
| Viền ô nhập `#DDDDDD` | `--border-input` (`#6A6A6A`) |
| Chỉ tô màu để phân biệt trạng thái | Màu + icon + chữ (+ hoa văn với ô lịch) |
| Hex/rgba viết tay trong component | Token ở 0.6.3 |
| Gradient, bóng màu, viền hồng ở trạng thái focus | Focus ring đen 2px + khoảng trắng |
| Dùng đỏ cho trạng thái không phải lỗi (404, trang rỗng) | neutral / info |
| Đặt chữ `--text-secondary` lên nền `--gray-200` trở đi | Chữ `--text-primary` hoặc đổi nền nhạt hơn |

---

## S01 · Đăng ký, xác minh email, đăng nhập, quên mật khẩu

### P07 · Đăng ký
| Mục | Giá trị |
|---|---|
| Route / Role | `/register` · Khách vãng lai |
| Component | CMP-02 (Họ tên, Email), CMP-03 (Mật khẩu), CMP-05 (đồng ý điều khoản), CMP-01, CMP-08, CMP-14 |
| Action | Gửi đăng ký · Đăng nhập (link) · Đổi ngôn ngữ · Xem Điều khoản/Quyền riêng tư (mở tab mới) |
| State | **Default** · **Validating** (inline khi rời ô) · **Submitting** (nút loading, khoá form) · **Error trường** (email sai định dạng, mật khẩu yếu, chưa tick điều khoản) · **Error email đã tồn tại** · **Error mạng/5xx** (banner + giữ dữ liệu) · **Success → "Kiểm tra email"** (có Gửi lại, đếm ngược 60s; Đổi email) |

🖥 Desktop (form giữa trang, 440px; cột trái minh hoạ ẩn dưới 1024)
```
┌───────────────────────────────────────────────────────────────────────────┐
│ Public Header                                                              │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐   ┌────────────────────────────────┐     │
│  │  ▢  Minh hoạ + thông điệp   │   │  Tạo tài khoản                 │     │
│  │  "Đặt chỗ ở như người bản   │   │  Họ và tên      [______________]│     │
│  │   địa"                      │   │  Email          [______________]│     │
│  │                             │   │  Mật khẩu       [__________ 👁]│     │
│  │                             │   │   ✓ ≥ 8 ký tự  ○ có chữ & số   │     │
│  │                             │   │  [x] Tôi đồng ý Điều khoản và   │     │
│  │                             │   │      Chính sách quyền riêng tư  │     │
│  │                             │   │  [        Tạo tài khoản        ]│     │
│  │                             │   │  Đã có tài khoản? Đăng nhập     │     │
│  └─────────────────────────────┘   └────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile (1 cột, nút sticky dưới khi bàn phím mở)
```
┌──────────────────────────────┐
│ ◈ Logo             VI▼  ☰   │
│ Tạo tài khoản                │
│ Họ và tên                    │
│ [__________________________] │
│ Email                        │
│ [__________________________] │
│ Mật khẩu                     │
│ [______________________ 👁]  │
│ ✓ ≥ 8 ký tự  ○ có chữ & số   │
│ [x] Tôi đồng ý Điều khoản…   │
│ [      Tạo tài khoản        ]│
│ Đã có tài khoản? Đăng nhập   │
└──────────────────────────────┘
```
Tablet: form giữa 480px, bỏ cột minh hoạ.

**Trạng thái thành công "Kiểm tra email" (thay thế form tại chỗ)**
```
        ┌─────────────────────────────────────┐
        │   ✉  Kiểm tra hộp thư của bạn        │
        │   Chúng tôi đã gửi liên kết xác minh │
        │   tới an***@mail.com                │
        │   [ Gửi lại email ]  (còn 52s)       │
        │   Sai email? Đăng ký lại             │
        └─────────────────────────────────────┘
```

### P06 · Đăng nhập
| Mục | Giá trị |
|---|---|
| Route / Role | `/login?returnTo=` · Khách vãng lai |
| Component | CMP-02 Email, CMP-03 Mật khẩu, CMP-05 (Ghi nhớ đăng nhập – tuỳ chọn), CMP-01, CMP-08 |
| Action | Đăng nhập · Quên mật khẩu → P08 · Đăng ký → P07 · Gửi lại email xác minh (khi lỗi chưa xác minh) |
| State | **Default** · **Submitting** · **Sai thông tin** (thông báo chung "Email hoặc mật khẩu không đúng") · **Chưa xác minh email** (banner vàng + Gửi lại) · **Tạm khoá** (banner đỏ + đếm ngược "Thử lại sau mm:ss") · **Banner thành công** (đến từ P09/P08: "Email đã xác minh"/"Đã đặt lại mật khẩu") · **Tài khoản bị khoá** · **Lỗi mạng** |

🖥 Desktop
```
┌───────────────────────────────────────────────────────────┐
│ Public Header                                              │
│              ┌─────────────────────────────────┐          │
│              │ [✓ Email đã được xác minh]       │ ← banner │
│              │ Đăng nhập                        │          │
│              │ Email    [____________________]  │          │
│              │ Mật khẩu [______________ 👁]     │          │
│              │ [x] Ghi nhớ        Quên mật khẩu?│          │
│              │ [         Đăng nhập            ] │          │
│              │ Chưa có tài khoản? Đăng ký       │          │
│              └─────────────────────────────────┘          │
└───────────────────────────────────────────────────────────┘
```
📱 Mobile: cùng nội dung 1 cột, full-width, banner nằm trên cùng, nút "Đăng nhập" sticky đáy.
Tablet: như desktop, khung 480px.

### P09 · Xác minh email
| Mục | Giá trị |
|---|---|
| Route / Role | `/verify-email?token=` · Khách vãng lai (mở từ email) |
| Component | CMP-08, CMP-01, CMP-11, minh hoạ trạng thái |
| Action | Đăng nhập · Gửi lại email · Về trang chủ |
| State | **Đang xác minh** (skeleton + spinner nhỏ) · **Thành công** (✓, nút Đăng nhập, tự chuyển sau 5s, có thể huỷ đếm) · **Hết hạn** (⚠ + Gửi lại – cần nhập email) · **Đã dùng** (ℹ + Đăng nhập) · **Token không hợp lệ** (✕ + Gửi lại) · **Lỗi mạng** (Thử lại) |

```
🖥/📱 (một thẻ giữa trang, 480px; mobile full-width)
┌───────────────────────────────────┐
│               ✓                   │
│     Email đã được xác minh         │
│  Bạn có thể đăng nhập ngay bây giờ │
│  [          Đăng nhập           ] │
│  Tự động chuyển sau 5 giây · Huỷ   │
└───────────────────────────────────┘
```

### P08 · Quên / đặt lại mật khẩu (2 bước, cùng màn)
| Mục | Giá trị |
|---|---|
| Route / Role | `/forgot-password` (bước 1) · `/reset-password?token=` (bước 2) · Khách vãng lai |
| Component | CMP-02 Email, CMP-03 Mật khẩu mới + Nhập lại, CMP-01, CMP-08 |
| Action | Gửi liên kết · Quay lại đăng nhập · Đặt lại mật khẩu · Yêu cầu liên kết mới |
| State | **B1 Default / Submitting / Đã gửi (trung tính)** · **B1 429** (gửi quá nhiều) · **B2 Default / Validating / Submitting** · **B2 Mật khẩu không khớp / yếu** · **B2 Token hết hạn hoặc đã dùng** (màn lỗi + yêu cầu liên kết mới) · **B2 Thành công** → P06 |

```
Bước 1 (🖥 440px / 📱 full-width)             Bước 2
┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│ Quên mật khẩu?                    │      │ Đặt mật khẩu mới                  │
│ Nhập email để nhận liên kết đặt lại│      │ Mật khẩu mới      [_________ 👁] │
│ Email [__________________________]│      │  ✓ ≥ 8 ký tự  ○ có chữ & số       │
│ [     Gửi liên kết đặt lại      ] │      │ Nhập lại          [_________ 👁] │
│ ← Quay lại đăng nhập              │      │ [    Đặt lại mật khẩu          ] │
└──────────────────────────────────┘      └──────────────────────────────────┘
```

---

## S02 · Hồ sơ và cài đặt tài khoản

### C01 · Hồ sơ cá nhân
| Mục | Giá trị |
|---|---|
| Route / Role | `/account/profile` · Guest, Host (đã đăng nhập) |
| Component | Account Shell, CMP-13 (ảnh đại diện – chọn/cắt), CMP-02 (Họ tên, SĐT, Giới thiệu*), CMP-02 readonly (Email), CMP-10 (trạng thái xác minh danh tính), CMP-01, CMP-32 |
| Action | Đổi ảnh · Lưu thay đổi · Huỷ thay đổi · Đi tới Xác minh danh tính (C03) · Đi tới Cài đặt |
| State | **Loading** (skeleton) · **Default** · **Dirty** (nút Lưu bật, cảnh báo rời trang) · **Saving** · **Saved** (toast) · **Lỗi trường** · **Lỗi tải ảnh** (sai định dạng/quá nặng) · **Lỗi mạng** |
\* "Giới thiệu bản thân" ngắn dùng cho hồ sơ Host công khai (P04) [Assumption – cần PO chốt có/không].

🖥 Desktop
```
┌────────────────────────────────────────────────────────────────────────┐
│ Public Header                                                           │
│ Tài khoản   [ Hồ sơ ] Cài đặt  Xác minh                                 │
│ ┌──────────────┐  ┌────────────────────────────────────────────────┐   │
│ │   ( ▢ ảnh )  │  │ Họ và tên    [__________________________]      │   │
│ │ [Đổi ảnh]    │  │ Email        an@mail.com   ✓ Đã xác minh        │   │
│ │ JPG/PNG ≤5MB │  │ Số điện thoại[__________________________]      │   │
│ │              │  │ Giới thiệu   [__________________________]      │   │
│ │ Xác minh DT: │  │                                      0/300      │   │
│ │ [Chưa nộp]   │  │ [ Huỷ ]                       [ Lưu thay đổi ]  │   │
│ │ Xác minh ngay→│  └────────────────────────────────────────────────┘   │
│ └──────────────┘                                                        │
└────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile: ảnh + trạng thái xác minh nằm trên cùng (căn giữa), form 1 cột, thanh nút **sticky đáy** [Huỷ][Lưu]. Tablet: 2 cột như desktop, ảnh thu nhỏ.

### C02 · Cài đặt tài khoản
| Mục | Giá trị |
|---|---|
| Route / Role | `/account/settings` · Guest, Host |
| Component | CMP-04 (Ngôn ngữ), CMP-04 (Tiền tệ hiển thị – 🔒 bật ở S13), CMP-03 ×3 (mật khẩu cũ/mới/nhập lại), CMP-05 Switch (Chế độ Host), CMP-25 ConfirmDialog, CMP-08 |
| Action | Đổi ngôn ngữ (áp dụng ngay) · Đổi mật khẩu · Bật/tắt chế độ Host · Đăng xuất mọi thiết bị* |
| State | **Loading** · **Default** · **Đổi ngôn ngữ**: đang áp dụng → giao diện đổi, toast · **Đổi mật khẩu**: Default/Submitting/Sai mật khẩu cũ/Trùng mật khẩu cũ/Thành công (banner "Các thiết bị khác đã đăng xuất") · **Chế độ Host**: Tắt/Bật-chưa xác minh (kèm banner → H02)/Bật-đã duyệt · **Lỗi mạng** |
\* Tuỳ chọn, không có trong đặc tả.

🖥 Desktop
```
┌────────────────────────────────────────────────────────────────────────┐
│ Tài khoản   Hồ sơ [ Cài đặt ] Xác minh                                   │
│ ┌─ Ngôn ngữ & Tiền tệ ─────────────────────────────────────────────┐   │
│ │ Ngôn ngữ        [Tiếng Việt ▼]                                     │   │
│ │ Tiền tệ hiển thị[VND ▼]   ⓘ Giá quy đổi chỉ để tham khảo (S13)     │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│ ┌─ Mật khẩu ───────────────────────────────────────────────────────┐   │
│ │ Mật khẩu hiện tại [__________ 👁]                                  │   │
│ │ Mật khẩu mới      [__________ 👁]                                  │   │
│ │ Nhập lại          [__________ 👁]            [ Đổi mật khẩu ]       │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│ ┌─ Chế độ Host ────────────────────────────────────────────────────┐   │
│ │ Cho thuê chỗ ở trên nền tảng              ( ● Bật  )               │   │
│ │ ⚠ Bạn cần xác minh để tạo listing  → Hoàn tất xác minh             │   │
│ └────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile: ba khối xếp dọc thành **accordion** (mặc định mở khối vừa tương tác); nút trong từng khối full-width. Tablet: 1 cột 600px.

---

## S03 · Đăng nhập quản trị, nhân sự và phân quyền

### A01 · Đăng nhập quản trị
| Mục | Giá trị |
|---|---|
| Route / Role | `/admin/login` · Admin, CSKH, Kế toán |
| Component | CMP-02, CMP-03, CMP-01, CMP-08; **không** có link Đăng ký/Quên mật khẩu công khai [Assumption: reset do Admin thực hiện] |
| Action | Đăng nhập |
| State | Default · Submitting · Sai thông tin · Tạm khoá · **Không có quyền back-office** (thông báo chung) · Tài khoản bị khoá · Lỗi mạng |
```
🖥/📱 (nền `--bg-canvas`, thẻ trắng giữa trang, logo xám `--gray-900`, không Public Header)
┌─────────────────────────────────┐
│  ◈ Admin Console                 │
│  Email    [__________________]   │
│  Mật khẩu [____________ 👁]      │
│  [         Đăng nhập          ]  │
└─────────────────────────────────┘
```

### A18 · Nhân sự và phân quyền
| Mục | Giá trị |
|---|---|
| Route / Role | `/admin/staff` · **Admin** |
| Component | Admin Shell, CMP-24 DataTable (Họ tên, Email, Vai trò, Trạng thái, Lần đăng nhập cuối), CMP-09 Drawer "Tạo/Sửa nhân sự", CMP-25 ConfirmDialog (lý do), CMP-10, CMP-12, tab "Lịch sử thay đổi" |
| Action | Tạo nhân sự · Đổi vai trò · Khoá/Mở khoá · Xem lịch sử · Tìm/Lọc theo vai trò, trạng thái |
| State | Loading (skeleton bảng) · Default · **Rỗng** (chưa có nhân sự ngoài bạn) · Lọc không kết quả · Drawer: Default/Submitting/Email trùng/Lỗi trường · **Không thể tự khoá/hạ quyền chính mình** (nút disabled + tooltip) · Thành công (toast) · Lỗi mạng · **403** (vai trò khác vào URL) |

🖥 Desktop
```
┌─────────┬────────────────────────────────────────────────────────────────┐
│ Duyệt DT│ Nhân sự và phân quyền                         [ + Tạo nhân sự ]  │
│ Duyệt tin│ [🔍 Tìm tên/email] [Vai trò ▼] [Trạng thái ▼]                    │
│ ▶Nhân sự│ ┌────────────┬─────────────┬─────────┬──────────┬──────────┬───┐│
│         │ │ Họ tên     │ Email       │ Vai trò │ Trạng thái│ Đăng nhập │ ⋮ ││
│         │ ├────────────┼─────────────┼─────────┼──────────┼──────────┼───┤│
│         │ │ Lan CSKH   │ lan@…       │ CSKH    │ ● Hoạt động│ 10 phút   │ ⋮ ││
│         │ │ Minh KT    │ minh@…      │ Kế toán │ ⏸ Đã khoá │ 3 ngày    │ ⋮ ││
│         │ └────────────┴─────────────┴─────────┴──────────┴──────────┴───┘│
│         │ ‹ 1 2 3 ›                                                         │
└─────────┴────────────────────────────────────────────────────────────────┘
Drawer phải 420px "Tạo nhân sự": Họ tên · Email · Vai trò (CSKH/Kế toán/Admin) · [Tạo & gửi lời mời]
```
📱 Mobile: bộ lọc gom vào nút "Lọc"; mỗi nhân sự = thẻ dọc (tên, vai trò badge, trạng thái, ⋮); "Tạo nhân sự" là FAB góc dưới phải; drawer → full-screen.
Tablet: bảng giữ 4 cột (ẩn "Đăng nhập cuối").

---

## S04 · Hồ sơ xác minh Host và Admin duyệt

### P10 · Trở thành Host
| Mục | Giá trị |
|---|---|
| Route / Role | `/become-host` · Khách vãng lai, Guest |
| Component | Hero + CMP-01 CTA, khối lợi ích (3), khối "Cách thức hoạt động" (4 bước: Đăng ký → Xác minh → Đăng tin → Nhận khách), khối **Cần chuẩn bị gì** (CCCD/hộ chiếu, giấy tờ quyền khai thác), FAQ accordion, CMP-08 |
| Action | Bắt đầu (→ FL-S04-A) · Xem Trợ giúp · Quay lại |
| State | **Khách vãng lai** (CTA = "Đăng ký để bắt đầu") · **Guest chưa xác minh email** (CTA bị chặn kèm banner) · **Guest đủ điều kiện** (CTA = "Bắt đầu") · **Đã là Host chưa duyệt** (CTA = "Tiếp tục xác minh") · **Đã duyệt** (CTA = "Tới Listing của tôi") · Đang gọi API (CTA loading) · Lỗi |
```
🖥 Desktop                                           📱 Mobile
┌──────────────────────────────────────────┐   ┌───────────────────────────┐
│ Header                                    │   │ Header                    │
│ ┌──────────────────────┬───────────────┐ │   │ Cho thuê chỗ ở của bạn    │
│ │ Cho thuê chỗ ở của   │      ▢        │ │   │ [  Bắt đầu  ]             │
│ │ bạn trên Homestay    │   hình ảnh    │ │   │ ▢ hình                    │
│ │ [  Bắt đầu  ]        │               │ │   │ Lợi ích ①②③ (dọc)        │
│ └──────────────────────┴───────────────┘ │   │ Cách hoạt động 1-4 (dọc)  │
│ Lợi ích:  ① ② ③                          │   │ Cần chuẩn bị gì (checklist)│
│ Cách hoạt động: 1 → 2 → 3 → 4             │   │ FAQ ▾                     │
│ Cần chuẩn bị: ▢CCCD/hộ chiếu ▢Giấy tờ KT  │   │ [ Bắt đầu ] sticky đáy    │
│ FAQ ▾                                     │   └───────────────────────────┘
└──────────────────────────────────────────┘
```

### H02 · Hồ sơ xác minh Host (và C03 · Xác minh danh tính cho Guest – cùng component)
| Mục | H02 | C03 |
|---|---|---|
| Route / Role | `/host/verification` · Host | `/account/verification` · Guest, Host |
| Phần form | A. Thông tin cá nhân (họ tên theo giấy tờ, ngày sinh, SĐT) · B. Giấy tờ danh tính (loại: CCCD / hộ chiếu; mặt trước, mặt sau; số giấy tờ) · C. Giấy tờ quyền khai thác chỗ ở | Chỉ A + B |
| Component | CMP-13 ×(3–4), CMP-02, CMP-04 (loại giấy tờ), CMP-10, CMP-08, CMP-01, hướng dẫn ảnh đạt chuẩn (checklist: rõ nét, đủ 4 góc, không loá) |
| Action | Chọn/chụp ảnh · Xem trước · Xoá/Thay tệp · Gửi hồ sơ · Lưu nháp · **Sửa & gửi lại** (khi bị từ chối) · Rút hồ sơ* |
| State (cấp màn) | **Chưa nộp** (form trống) · **Đang nhập** (nháp tự lưu) · **Đang tải tệp** (progress từng tệp) · **Gửi** (loading) · **Chờ duyệt** (form khoá, đọc-only, mốc thời gian gửi) · **Đã xác minh** (✓, CTA "Tạo listing") · **Bị từ chối** (khối lý do nổi bật, form mở lại, trường bị nêu tô viền) · **Cần cập nhật** (giấy tờ hết hạn) · **Lỗi tệp** (sai định dạng/quá nặng/ảnh mờ do BE) · **Mất mạng khi tải** (tệp lỗi có nút Thử lại) |
| State (cấp tệp) | Trống · Đang tải x% · Đã tải ✓ · Lỗi ✕ (Thử lại / Xoá) |

🖥 Desktop (H02 – trạng thái "Bị từ chối")
```
┌────────┬────────────────────────────────────────────────────────────────┐
│ Sidebar│ Hồ sơ xác minh Host                    Trạng thái: [✕ Bị từ chối]│
│        │ ┌────────────────────────────────────────────────────────────┐ │
│        │ │ ⚠ Lý do từ chối: Ảnh mặt sau CCCD bị mờ. Vui lòng chụp lại. │ │
│        │ └────────────────────────────────────────────────────────────┘ │
│        │ A. Thông tin cá nhân                                            │
│        │   Họ tên theo giấy tờ [__________]  Ngày sinh [__/__/____]       │
│        │ B. Giấy tờ danh tính   Loại (●CCCD ○Hộ chiếu)  Số [__________]   │
│        │   ┌───────────────┐ ┌───────────────┐                           │
│        │   │ Mặt trước ✓   │ │ Mặt sau ✕ mờ  │ ← viền đỏ                 │
│        │   │ ▢ xem trước   │ │ [Thay tệp]    │                           │
│        │   └───────────────┘ └───────────────┘                           │
│        │ C. Giấy tờ quyền khai thác chỗ ở  ┌──────────────┐ [+ Thêm tệp]  │
│        │                                    │ so_do.pdf ✓  │               │
│        │                                    └──────────────┘               │
│        │ ─────────────────────────────────────────────────────────────── │
│        │ [ Lưu nháp ]                              [ Sửa & gửi lại ]       │
└────────┴────────────────────────────────────────────────────────────────┘
```
📱 Mobile: khối A/B/C xếp dọc, **stepper 3 bước** trên cùng (A › B › C); mỗi ô tệp rộng full-width với nút **"Chụp ảnh"** và **"Chọn từ thư viện"**; thanh nút sticky đáy. Tablet: 2 cột cho cặp ảnh mặt trước/sau.
Màn "Chờ duyệt": thay form bằng thẻ tóm tắt + dòng thời gian (Đã gửi → Đang xem xét → Kết quả) + danh sách tệp đã nộp (chỉ tên, không xem ảnh lại nếu không cần).

### A03 · Duyệt hồ sơ danh tính (Host và Guest)
| Mục | Giá trị |
|---|---|
| Route / Role | `/admin/identity-reviews` (danh sách), `/admin/identity-reviews/:id` (chi tiết) · **Admin** |
| Component | CMP-24 DataTable (Người nộp, Loại Host/Guest, Ngày gửi, Trạng thái, Cờ ⚑, Người đang xử lý), bộ lọc, CMP-31 LockBanner, CMP-30 SecureImageViewer, panel thông tin, CMP-25 ConfirmDialog (Duyệt / Từ chối + lý do), CMP-10, khối "Cờ rủi ro" (trùng giấy tờ → link tới tài khoản kia) |
| Action | Mở hồ sơ (nhận khoá) · Bấm để xem ảnh (ghi log) · Duyệt · Từ chối (chọn lý do + ghi chú) · Trả lại hàng đợi (nhả khoá) · Lọc/Tìm |
| State (danh sách) | Loading · Default · Rỗng ("Không còn hồ sơ chờ") · Lọc không kết quả · Lỗi |
| State (chi tiết) | **Đang tải** · **Tự do** (nhận khoá thành công) · **Bị khoá bởi người khác** (chỉ xem, nút quyết định disabled) · **Mất khoá** (hết hạn/ bị tiếp quản → banner + chuyển chỉ xem) · **Ảnh che mờ / đã hiển thị / URL hết hạn (bấm xem lại → ghi log lần nữa)** · **Gắn cờ trùng** · **Đã xử lý** (hồ sơ đã được người khác duyệt → chỉ xem) · **Đang gửi quyết định** · Lỗi 409 |

🖥 Desktop – chi tiết (chia 2 cột)
```
┌─────────┬────────────────────────────────────────────────────────────────────────┐
│ ▶Duyệt DT│ ← Hồ sơ #1042  Host   ⏳ Chờ duyệt                [ Trả lại hàng đợi ] │
│ Duyệt tin│ ⚑ Giấy tờ trùng với tài khoản Host khác: nguyen.b@…  [Xem tài khoản]    │
│ Nhân sự │ ┌──────────────────────────┐ ┌─────────────────────────────────────┐ │
│         │ │ ẢNH GIẤY TỜ              │ │ THÔNG TIN                           │ │
│         │ │ ┌──────────────────────┐ │ │ Họ tên theo giấy tờ: Nguyễn Văn A    │ │
│         │ │ │ ░░░ che mờ ░░░       │ │ │ Số giấy tờ: 0791********             │ │
│         │ │ │ [👁 Bấm để xem]      │ │ │ Ngày sinh / SĐT / Email tài khoản    │ │
│         │ │ │ watermark: Admin·giờ │ │ │ Giấy tờ quyền khai thác: [tệp.pdf]   │ │
│         │ │ └──────────────────────┘ │ │ Lịch sử: gửi lần 1 (từ chối), lần 2  │ │
│         │ │ Mặt trước | Mặt sau | KT │ │                                     │ │
│         │ └──────────────────────────┘ └─────────────────────────────────────┘ │
│         │ ──────────────────────────────────────────────────────────────────── │
│         │ [ Từ chối… ]                                          [ Duyệt hồ sơ ]  │
└─────────┴────────────────────────────────────────────────────────────────────────┘
Dialog "Từ chối": Lý do (▼ danh mục bắt buộc) + Ghi chú gửi Host (bắt buộc) + [Xác nhận từ chối]
```
📱 Mobile/Tablet: danh sách = thẻ; chi tiết = 1 cột: LockBanner → cờ → tab [Ảnh | Thông tin | Lịch sử] → thanh quyết định sticky đáy [Từ chối][Duyệt]. Ảnh giấy tờ mở toàn màn hình, cho phóng to.

---

## S05 · Host tạo listing nháp: thông tin cơ bản, vị trí, ảnh

### H03 · Danh sách listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/host/listings` · Host (cả chưa duyệt – xem được nhưng không tạo được) |
| Component | Host Shell, banner trạng thái xác minh (CMP-08), CMP-19 biến thể "ListingRowHost" (ảnh bìa, tên, khu vực, CMP-10 trạng thái, tiến độ nháp "5/8 bước", ngày cập nhật), menu ⋮, CMP-01 "Tạo listing", bộ lọc trạng thái, CMP-12, CMP-11 |
| Action | Tạo listing · Tiếp tục chỉnh sửa (nháp) · Sửa · Xem trạng thái duyệt (→H05) · Xem trước công khai · 🔒 Lịch (→H06, hiện từ khi Đang hiển thị/Tạm ẩn) · 🔒 Giá theo mùa (→H08) · Tạm ẩn/Hiện* · Xoá nháp (có xác nhận)* |
| State | **Loading** · **Default** · **Rỗng, chưa xác minh** (EmptyState: "Hoàn tất xác minh để tạo listing" → H02) · **Rỗng, đã xác minh** ("Tạo listing đầu tiên") · **Lọc không kết quả** · **Host chưa xác minh** (nút Tạo bị disabled + tooltip; danh sách nháp cũ nếu có vẫn xem) · **Lỗi tải** (Thử lại) · **Đang xoá nháp** |
\* Ngoài danh sách nghiệm thu S05–S08; để trong menu nhưng bật khi có slice tương ứng.

🖥 Desktop
```
┌────────┬──────────────────────────────────────────────────────────────────────┐
│ Sidebar│ Listing của tôi                                  [ + Tạo listing ]    │
│ ▶Listing│ [⚠ Hồ sơ xác minh đang chờ duyệt – bạn chưa thể tạo listing  Xem →]   │
│ Xác minh│ Lọc: [Tất cả ▼]                                                       │
│        │ ┌──────────────────────────────────────────────────────────────────┐ │
│        │ │ ▢  Nhà trên đồi Đà Lạt          [● Đang hiển thị]            ⋮  │ │
│        │ │    Đà Lạt · Nguyên căn · 4 khách    Cập nhật 2 ngày trước        │ │
│        │ │    [Xem trạng thái] [Sửa] [Lịch] [Giá]                           │ │
│        │ ├──────────────────────────────────────────────────────────────────┤ │
│        │ │ ▢  (chưa có tên)                 [Nháp · 5/8 bước]           ⋮  │ │
│        │ │    ▓▓▓▓▓░░░                      [ Tiếp tục chỉnh sửa ]          │ │
│        │ └──────────────────────────────────────────────────────────────────┘ │
└────────┴──────────────────────────────────────────────────────────────────────┘
```
📱 Mobile: mỗi listing là thẻ dọc (ảnh trên, thông tin dưới), hành động chính 1 nút full-width + ⋮ cho phần còn lại; "Tạo listing" = FAB. Tablet: lưới 2 cột.

### H04 · Tạo/sửa listing (wizard 8 bước) – khung chung cho S05, S06, S07
| Mục | Giá trị |
|---|---|
| Route / Role | `/host/listings/:id/edit/:step` · Host đã được duyệt |
| Bước | 1 Thông tin cơ bản · 2 Vị trí · 3 Ảnh *(S05)* · 4 Tiện nghi · 5 Quy tắc lưu trú · 6 Giá & phí *(S06)* · 7 Chính sách huỷ & kiểu đặt · 8 Giấy tờ pháp lý & Rà soát gửi duyệt *(S07)* |
| Component chung | CMP-15 WizardNav, CMP-32 SaveIndicator, CMP-01 (Quay lại / Lưu & thoát / Tiếp tục), CMP-08 (lỗi cấp bước), CMP-25 (thoát khi có thay đổi chưa lưu) |
| State cấp wizard | **Loading nháp** · **Default** · **Dirty** (chưa lưu) · **Đang lưu** · **Đã lưu** · **Lưu thất bại** (giữ dữ liệu cục bộ + Thử lại) · **Phiên hết hạn** (modal đăng nhập lại, không mất dữ liệu) · **Listing không tồn tại/không phải của bạn** (404) · **Listing đã Chờ duyệt** (form chuyển sang chỉ đọc kèm banner) · **Listing Cần chỉnh sửa/Bị từ chối** (hiện khối lý do ở đầu, trường liên quan được đánh dấu) |
| State cấp bước (WizardNav) | ○ Chưa làm · ◐ Đang làm · ✓ Hoàn thành · ⚠ Có lỗi/thiếu (khi gửi duyệt) · 🔒 Chưa mở (phải hoàn thành bước trước) |

🖥 Desktop – khung chung
```
┌────────┬────────────────────────────────────────────────────────────────────────┐
│ Sidebar│ ← Listing của tôi                 Đã lưu 10:42        [ Lưu & thoát ]    │
│ (thu gọn)│ ┌──────────────┐ ┌─────────────────────────────────────┐ ┌───────────┐ │
│        │ │ WizardNav    │ │ NỘI DUNG BƯỚC (tối đa 640px)         │ │ Gợi ý /   │ │
│        │ │ ✓ 1 Cơ bản   │ │                                      │ │ Xem trước │ │
│        │ │ ✓ 2 Vị trí   │ │  …form…                              │ │ (tuỳ bước)│ │
│        │ │ ◐ 3 Ảnh      │ │                                      │ │ ⓘ mẹo     │ │
│        │ │ ○ 4 Tiện nghi│ │                                      │ │           │ │
│        │ │ ○ 5 Quy tắc  │ │ ────────────────────────────────     │ │           │ │
│        │ │ ○ 6 Giá      │ │ [ ← Quay lại ]        [ Tiếp tục → ] │ │           │ │
│        │ │ ○ 7 Chính sách│ └─────────────────────────────────────┘ └───────────┘ │
│        │ │ ○ 8 Gửi duyệt│                                                         │
│        │ └──────────────┘                                                         │
└────────┴────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile – khung chung
```
┌──────────────────────────────┐
│ ←   Tạo listing   [Lưu & thoát]│
│ Bước 3/8 · Ảnh   ▓▓▓░░░░░    │ ← thanh tiến độ, bấm để mở danh sách bước (bottom sheet)
│ Đã lưu 10:42                  │
├──────────────────────────────┤
│  NỘI DUNG BƯỚC (1 cột)        │
│  (gợi ý ⓘ thu thành dòng gập) │
├──────────────────────────────┤
│ [ ← Quay lại ] [ Tiếp tục → ] │ ← sticky đáy
└──────────────────────────────┘
```
Tablet: WizardNav thu thành thanh ngang trên cùng, bỏ cột gợi ý (chuyển thành khối gập).

#### Bước 1 · Thông tin cơ bản
Component: CMP-05 Radio thẻ (Nguyên căn / Phòng riêng), CMP-02 (Tên listing, Mô tả), CMP-06 ×4 (Số khách tối đa, Phòng ngủ, Giường, Phòng tắm), CMP-04 (Giờ nhận phòng, Giờ trả phòng), CMP-04 (Tiền tệ listing – mặc định VND).
Action: Tiếp tục (validate + lưu nháp) · Lưu & thoát.
State: Default · Lỗi trường (thiếu tên, mô tả < số ký tự tối thiểu, số khách < 1) · Đang lưu · Đã lưu · Lưu thất bại.
```
🖥 / 📱 (1 cột; desktop có thêm cột gợi ý bên phải)
 Loại hình *       [ ◉ Nguyên căn ] [ ○ Phòng riêng ]
 Tên listing *     [____________________________]  0/80
 Mô tả *           [____________________________]  0/2000
                   [____________________________]
 Số khách tối đa   [−] 4 [+]     Phòng ngủ [−] 2 [+]
 Giường            [−] 3 [+]     Phòng tắm [−] 1 [+]
 Giờ nhận phòng    [14:00 ▼]     Giờ trả phòng [12:00 ▼]
 Tiền tệ listing   [VND ▼]  ⓘ không đổi được sau khi có booking
```

#### Bước 2 · Vị trí trên bản đồ
Component: CMP-21 MapPanel (marker kéo được, tìm địa chỉ), CMP-04 Khu vực (Location seed: Tỉnh/Thành → Khu vực), CMP-02 Địa chỉ chính xác (riêng tư), CMP-02 Toạ độ thủ công (Vĩ độ/Kinh độ – khi thiếu token), vòng tròn "vùng hiển thị công khai", CMP-08 giải thích riêng tư.
Action: Tìm địa chỉ · Kéo ghim · Dùng vị trí hiện tại* · Nhập toạ độ tay · Tiếp tục.
State: **Map loading** · **Default** · **Địa chỉ không tìm thấy** · **Ghim ngoài khu vực đã chọn** (cảnh báo) · **Không có token / Mapbox lỗi** (ẩn bản đồ, hiện form toạ độ + banner) · **Lỗi trường** · Đang lưu/Đã lưu.
```
🖥 Desktop (form trái – bản đồ phải)                📱 Mobile (bản đồ trên 240px, form dưới)
┌───────────────────────┬────────────────────────┐   ┌──────────────────────────┐
│ Khu vực * [Lâm Đồng ▼] │ ┌────────────────────┐ │   │ ┌──────────────────────┐ │
│          [Đà Lạt ▼]    │ │  🔍 tìm địa chỉ    │ │   │ │ 🔍 tìm địa chỉ        │ │
│ Địa chỉ chính xác *    │ │      ◯ ← vùng công │ │   │ │      ◯  📍           │ │
│ [____________________] │ │       📍 ghim kéo  │ │   │ └──────────────────────┘ │
│ ⓘ Chỉ khách đã đặt     │ │                    │ │   │ Khu vực * [Đà Lạt ▼]      │
│   thành công mới thấy  │ └────────────────────┘ │   │ Địa chỉ chính xác *       │
│ Toạ độ: 11.94, 108.45  │ Khách thấy: "Phường 3, │   │ [______________________]  │
│ (sửa tay)              │ Đà Lạt" và vùng khoanh │   │ ⓘ Địa chỉ không hiển thị  │
└───────────────────────┴────────────────────────┘   │ công khai                 │
                                                      └──────────────────────────┘
```

#### Bước 3 · Ảnh
Component: CMP-13 FileUploader (nhiều tệp), CMP-28 SortablePhotoGrid, bộ đếm "x/5 tối thiểu · y/30", nhãn "Ảnh bìa", nút chú thích tuỳ chọn.
Action: Thêm ảnh · Kéo-thả sắp xếp / nút ↑↓ · Đặt làm ảnh bìa · Xoá · Thử lại tệp lỗi · Tiếp tục.
State: **Trống** · **Đang tải (progress từng ảnh)** · **Một số ảnh lỗi** · **Đủ tối thiểu** · **Đang sắp xếp** · **Dưới 5 ảnh** (cho phép Tiếp tục khi lưu nháp; chỉ chặn ở bước gửi duyệt – S07) · **Vượt giới hạn** · **Mất mạng** (hàng đợi, tự tiếp tục).
```
🖥 Desktop                                           📱 Mobile
┌──────────────────────────────────────────┐   ┌──────────────────────────┐
│ Ảnh chỗ ở   3/5 tối thiểu · tối đa 30     │   │ Ảnh chỗ ở  3/5 tối thiểu  │
│ ┌──────────────────────────────────────┐ │   │ ┌──────────────────────┐ │
│ │  ⬆ Kéo ảnh vào đây hoặc [Chọn ảnh]   │ │   │ │ [📷 Chụp] [🖼 Thư viện]│ │
│ └──────────────────────────────────────┘ │   │ └──────────────────────┘ │
│ ┌─────────┐┌────┐┌────┐┌────┐             │   │ ┌─────────┐ ┌────────┐   │
│ │▢ BÌA    ││ ▢  ││ ▢  ││░░░ │ ← đang tải │   │ │▢ BÌA    │ │ ▢      │   │
│ │         ││    ││    ││ 62%│             │   │ │         │ │ ↑ ↓ ⋮  │   │
│ └─────────┘└────┘└────┘└────┘             │   │ └─────────┘ └────────┘   │
│ ⚠ IMG_204.jpg lỗi: quá 10MB  [Thử lại][Xoá]│   │ ⚠ IMG_204.jpg lỗi [Thử lại]│
└──────────────────────────────────────────┘   └──────────────────────────┘
```

---

## S06 · Tiện nghi, quy tắc lưu trú, giá & phí

#### Bước 4 · Tiện nghi
Component: CMP-29 AmenityPicker (tìm kiếm; nhóm: Thiết yếu, Phòng bếp, Giải trí, An toàn, Ngoài trời…; chọn bằng checkbox thẻ), bộ đếm đã chọn.
State: Loading danh mục (skeleton) · Default · Đang tìm (lọc tại chỗ) · Không có kết quả tìm · Lỗi tải danh mục (Thử lại) · Đã chọn ≥1.
```
🖥 Desktop (lưới 3 cột)                              📱 Mobile (1 cột, nhóm gập)
 [🔍 Tìm tiện nghi]            Đã chọn 6              [🔍 Tìm]            Đã chọn 6
 ▾ Thiết yếu                                           ▾ Thiết yếu
  [x] Wi-Fi  [x] Điều hoà  [ ] Máy nước nóng             [x] Wi-Fi
 ▾ Phòng bếp                                              [x] Điều hoà
  [x] Bếp    [ ] Tủ lạnh  [ ] Lò vi sóng                  [ ] Máy nước nóng
                                                        ▸ Phòng bếp (1)
```

#### Bước 5 · Quy tắc lưu trú
Component: CMP-06 (Đêm tối thiểu, Đêm tối đa, Thời gian chuẩn bị giữa 2 booking [đêm], Báo trước tối thiểu [ngày/giờ], Giới hạn đặt xa nhất [tháng]), CMP-02 Nội quy (hút thuốc, thú cưng, tiệc tùng, giờ yên tĩnh – chọn Có/Không + ghi chú), CMP-08 giải thích.
State: Default · **Lỗi chéo trường** (tối thiểu > tối đa → cả hai ô viền đỏ + dòng lỗi) · Lỗi trường · Đang lưu/Đã lưu.
```
 Đêm tối thiểu [−] 1 [+]      Đêm tối đa [−] 30 [+]
 ✕ Đêm tối thiểu không được lớn hơn đêm tối đa             ← lỗi chéo
 Thời gian chuẩn bị giữa hai booking   [Không ▼ | 1 đêm | 2 đêm]   ⓘ
 Báo trước tối thiểu    [Cùng ngày ▼]   Đặt xa nhất [12 tháng ▼]
 Nội quy:  Hút thuốc (○ Có ◉ Không)  Thú cưng (○ Có ◉ Không)  Tiệc (○ Có ◉ Không)
           Giờ yên tĩnh [22:00 ▼] – [07:00 ▼]    Ghi chú thêm [____________]
```
(Desktop: hai cột nhãn–ô; Mobile: 1 cột, mỗi nhóm trong thẻ riêng.)

#### Bước 6 · Giá & phí + Bảng giá xem trước
Component: CMP-02 số tiền có hậu tố tiền tệ (Giá cơ bản/đêm; Phí vệ sinh [1 lần/booking]; Phụ thu thêm khách: *Số khách tính giá cơ bản* + *Mức phụ thu mỗi khách thêm/đêm*; Giảm tuần [%, từ 7 đêm]; Giảm tháng [%, từ 28 đêm]), **CMP-22 PriceBreakdown (xem trước)** kèm CMP-16 chọn ngày ví dụ + CMP-17 số khách ví dụ.
Action: Nhập giá · Đổi ngày/khách ví dụ · Mở rộng "giá từng đêm" · Tiếp tục.
State: Default · **Preview loading** (skeleton, gọi PricingEngine) · **Preview OK** · **Preview lỗi** (Thử lại) · **Chưa đủ dữ liệu** ("Nhập giá cơ bản để xem trước") · **Lỗi trường** (giá ≤ 0, % ngoài 0–100, giảm tháng < giảm tuần → cảnh báo mềm) · **Ngày ví dụ vi phạm đêm tối thiểu/tối đa** (hiển thị lý do trong preview).
```
🖥 Desktop (form trái – preview phải, sticky)          📱 Mobile (preview nằm cuối, thu gọn)
┌───────────────────────────┬──────────────────────┐   ┌──────────────────────────┐
│ Giá cơ bản/đêm  [1.200.000]₫│ XEM TRƯỚC BẢNG GIÁ   │   │ Giá cơ bản/đêm [1.200.000]₫│
│ Phí vệ sinh     [  200.000]₫│ Ngày [12/12 – 15/12]  │   │ Phí vệ sinh    [  200.000]₫│
│ Phụ thu thêm khách          │ Khách [ 5 ▼ ]         │   │ Phụ thu thêm khách …       │
│  Giá cho [ 2 ] khách đầu    │ ────────────────────  │   │ Giảm tuần [10]% / tháng [20]%│
│  Mỗi khách thêm [100.000]₫  │ 3 đêm × 1.200.000  3,6tr│   │ ▾ Xem trước bảng giá       │
│ Giảm tuần  [10]% (≥7 đêm)   │ Phụ thu (3 khách thêm   │   │ ┌──────────────────────┐ │
│ Giảm tháng [20]% (≥28 đêm)  │  × 3 đêm)          900k│   │ │ Ngày [12/12–15/12]   │ │
│ ⓘ Đủ cả hai ngưỡng → áp     │ Phí vệ sinh        200k│   │ │ 3 đêm × 1.200.000 3,6tr│ │
│   mức giảm tháng            │ Giảm giá            0  │   │ │ …                    │ │
│                             │ ▸ Giá từng đêm          │   │ │ Tổng tiền host đặt 4,7tr│ │
│                             │ Tổng               4,7tr│   │ └──────────────────────┘ │
│                             │ ⓘ Phí dịch vụ & thuế    │   └──────────────────────────┘
│                             │  sẽ hiển thị khi khách xem│
└───────────────────────────┴──────────────────────┘
```
Ghi chú thiết kế: preview ở bước 6 chỉ thể hiện các khoản **Host kiểm soát**; phí dịch vụ & thuế do nền tảng cấu hình và chỉ hiện ở P03 (xem A9 trong 01-user-flow).

---

## S07 · Chính sách huỷ, kiểu đặt, giấy tờ pháp lý, gửi duyệt

#### Bước 7 · Chính sách huỷ & Kiểu đặt
Component: CMP-05 Radio thẻ ×3 (Linh hoạt / Trung bình / Nghiêm ngặt) mỗi thẻ có tóm tắt 1 dòng + nút "Xem bảng mốc hoàn tiền" (mở CMP-27 trong Modal/BottomSheet), CMP-05 Radio thẻ ×2 (Instant Book / Request to Book) kèm mô tả "Host có 24 giờ để phản hồi".
State: Default · Đã chọn · **Chưa chọn** (lỗi khi Tiếp tục) · Modal bảng mốc: Loading/OK/Lỗi.
```
 Chính sách huỷ *
 ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
 │ ◉ Linh hoạt        │ │ ○ Trung bình       │ │ ○ Nghiêm ngặt      │
 │ Hoàn 100% trước    │ │ Hoàn 100% trước    │ │ Hoàn 50% nếu ≥ 7   │
 │ 24 giờ check-in    │ │ 5 ngày check-in    │ │ ngày; sau đó 0%    │
 │ [Xem bảng mốc]     │ │ [Xem bảng mốc]     │ │ [Xem bảng mốc]     │
 └────────────────────┘ └────────────────────┘ └────────────────────┘
 Kiểu đặt *      ( ) Instant Book – khách đặt và thanh toán ngay
                 ( ) Request to Book – bạn duyệt trong 24 giờ
 (Mobile: ba thẻ xếp dọc, thẻ đã chọn có viền đậm + dấu ✓)
```

#### Bước 8 · Giấy tờ pháp lý & Rà soát gửi duyệt
Component: CMP-13 (giấy tờ quyền khai thác, đăng ký lưu trú/giấy phép – theo yêu cầu quốc gia), **Checklist điều kiện gửi duyệt** (mỗi dòng ✓/✕ + link nhảy tới bước), tóm tắt listing (xem trước ảnh bìa, tên, giá, chính sách), CMP-01 "Gửi duyệt", CMP-25 xác nhận.
Action: Tải giấy tờ · Nhảy tới bước thiếu · Xem trước trang công khai · Gửi duyệt.
State: **Chưa đủ điều kiện** (nút Gửi duyệt disabled; mỗi mục thiếu hiển thị rõ: "Cần thêm 2 ảnh (hiện 3/5)", "Thiếu giấy tờ quyền khai thác", "Hồ sơ xác minh Host chưa được duyệt") · **Đủ điều kiện** (nút bật) · **Đang gửi** · **Gửi thành công** → H05 · **Lỗi BE từ chối gửi** (hiển thị lý do từ API, ưu tiên hơn kiểm tra FE) · Tải tệp: trạng thái như CMP-13.
```
🖥 Desktop                                             📱 Mobile
┌─────────────────────────────┬──────────────────┐   ┌────────────────────────────┐
│ Giấy tờ pháp lý              │ ĐIỀU KIỆN GỬI DUYỆT│   │ Điều kiện gửi duyệt         │
│ Giấy tờ quyền khai thác *    │ ✓ Thông tin cơ bản │   │ ✓ Cơ bản  ✓ Vị trí          │
│  [+ Tải lên]  so_do.pdf ✓    │ ✓ Vị trí           │   │ ✕ Ảnh 3/5 → Đi tới bước 3   │
│ Số giấy phép lưu trú (nếu cần)│ ✕ Ảnh 3/5 [→ Bước 3]│   │ ✓ Giá  ✓ Chính sách         │
│  [______________]            │ ✓ Giá & phí        │   │ Giấy tờ quyền khai thác *    │
│                              │ ✓ Chính sách huỷ   │   │ [+ Tải lên]                  │
│                              │ ✕ Giấy tờ [→ ...]   │   │ ─────────────────────────── │
│ [ Xem trước trang công khai ] │ ┌────────────────┐ │   │ [ Xem trước ]               │
│                              │ │ Tóm tắt listing │ │   │ [ Gửi duyệt ] (disabled)     │
│                              │ └────────────────┘ │   └────────────────────────────┘
│                              │ [ Gửi duyệt ] (off) │
└─────────────────────────────┴──────────────────┘
```

### H05 · Trạng thái duyệt listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/host/listings/:id/status` · Host |
| Component | CMP-10 trạng thái lớn, timeline (Đã gửi → Đang xem xét → Kết quả), khối **Lý do** (khi Cần chỉnh sửa/Từ chối: danh sách mục cần sửa, link nhảy tới bước), tóm tắt listing, CMP-01 theo trạng thái |
| Action (theo trạng thái) | Chờ duyệt: Xem trước, Rút lại để sửa* · Cần chỉnh sửa/Bị từ chối: **Sửa & gửi lại** · Đang hiển thị: **Xem trang công khai**, Lịch, Giá theo mùa · Tạm ẩn: Hiện lại* · Bị khoá: Liên hệ hỗ trợ |
| State | **Loading** · **Chờ duyệt** (kèm "Đã gửi 2 giờ trước") · **Đang hiển thị** · **Cần chỉnh sửa** · **Bị từ chối** · **Tạm ẩn** · **Bị khoá** (lý do) · **Lịch sử nhiều lần gửi** (danh sách lần 1, lần 2…) · **Lỗi tải** |
```
🖥 Desktop                                              📱 Mobile
┌────────────────────────────────────────────────┐   ┌───────────────────────────┐
│ ← Nhà trên đồi Đà Lạt                           │   │ ← Nhà trên đồi Đà Lạt      │
│ Trạng thái: [✎ Cần chỉnh sửa]                   │   │ [✎ Cần chỉnh sửa]          │
│ ┌────────────────────────────────────────────┐ │   │ ┌───────────────────────┐ │
│ │ Lý do từ Admin (12/12 10:20)               │ │   │ │ Lý do từ Admin         │ │
│ │ • Ảnh phòng ngủ bị mờ  → Sửa ở bước 3      │ │   │ │ • Ảnh phòng ngủ mờ →B3 │ │
│ │ • Thiếu giấy phép lưu trú → Sửa ở bước 8   │ │   │ └───────────────────────┘ │
│ └────────────────────────────────────────────┘ │   │ Timeline (dọc)            │
│ Timeline:  ● Đã gửi ─ ● Đang xem xét ─ ◐ Kết quả │   │ ● Đã gửi 12/12            │
│ Lịch sử: Lần 1 (từ chối) · Lần 2 (hiện tại)     │   │ ● Đang xem xét            │
│ [ Xem trước ]                [ Sửa & gửi lại ]   │   │ ◐ Kết quả                 │
└────────────────────────────────────────────────┘   │ [ Sửa & gửi lại ] sticky   │
                                                       └───────────────────────────┘
```

---

## S08 · Admin duyệt listing lần đầu

### A04 · Duyệt listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/admin/listing-reviews` (hàng đợi), `/admin/listing-reviews/:id` · **Admin** |
| Component | CMP-24 (Listing, Host, Khu vực, Ngày gửi, Lần gửi, Cờ ⚑ trùng địa chỉ, Người đang xử lý), CMP-31 LockBanner, banner cảnh báo trùng địa chỉ (BR-LST-06), tabs [Nội dung \| Ảnh \| Giấy tờ \| Giá & chính sách \| *Thay đổi (🔒 disabled)*], CMP-26 xem ảnh, CMP-30 xem giấy tờ (có log), CMP-25 (Duyệt / Yêu cầu sửa / Từ chối + lý do), CMP-10 |
| Action | Mở & nhận khoá · Xem từng tab · Xem giấy tờ (ghi log) · **Duyệt** · **Yêu cầu chỉnh sửa** (lý do theo mục) · **Từ chối** (lý do) · Trả lại hàng đợi · Mở trang xem trước dạng công khai |
| State | Hàng đợi: Loading/Default/Rỗng/Lọc rỗng/Lỗi · Chi tiết: **Đang tải** · **Tự do** · **Bị khoá bởi người khác** · **Mất khoá** · **Có cảnh báo trùng địa chỉ** · **Đã xử lý bởi người khác** (409 → chỉ xem) · **Đang gửi quyết định** · **Thành công** (toast + quay lại hàng đợi, mở listing kế tiếp) · **Thiếu lý do** (lỗi inline, chặn gửi) · Lỗi mạng |

🖥 Desktop – chi tiết
```
┌─────────┬──────────────────────────────────────────────────────────────────────────┐
│ Duyệt DT│ ← Listing #318 · Nhà trên đồi Đà Lạt     ⏳ Chờ duyệt (lần 1)  [Trả lại]     │
│ ▶Duyệt tin│ ⚑ Địa chỉ trùng với listing #207 của Host khác  [Xem listing #207]        │
│ Nhân sự │ Tabs: [Nội dung] Ảnh  Giấy tờ  Giá & chính sách  (🔒 Thay đổi)              │
│         │ ┌────────────────────────────────┐ ┌────────────────────────────────────┐ │
│         │ │ Gallery (lightbox)             │ │ Host: Nguyễn Văn A  ✓ Đã xác minh   │ │
│         │ │ ▢▢▢▢▢                          │ │ Loại: Nguyên căn · Sức chứa 4        │ │
│         │ │ Mô tả …                        │ │ Địa chỉ chính xác (Admin thấy đủ)    │ │
│         │ │ Tiện nghi …                    │ │ [Mini map]                          │ │
│         │ │ Nội quy …                      │ │ Chính sách huỷ · Kiểu đặt · Giá      │ │
│         │ └────────────────────────────────┘ └────────────────────────────────────┘ │
│         │ ───────────────────────────────────────────────────────────────────────── │
│         │ [ Từ chối… ]   [ Yêu cầu chỉnh sửa… ]                      [ Duyệt listing ] │
└─────────┴──────────────────────────────────────────────────────────────────────────┘
Dialog lý do: ☐ Ảnh ☐ Mô tả ☐ Giấy tờ ☐ Giá ☐ Khác  + Ghi chú chi tiết gửi Host (bắt buộc)
```
📱 Mobile/Tablet: 1 cột; tabs cuộn ngang; thanh quyết định sticky đáy [Từ chối][Sửa][Duyệt] (Sửa/Từ chối mở bottom sheet nhập lý do).

---

## S09 · Lịch listing và chống đặt trùng

### H06 · Lịch listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/host/listings/:id/calendar` · Host (listing Đang hiển thị / Tạm ẩn) |
| Component | CMP-23 CalendarMonth (điều hướng tháng, nút Hôm nay), legend 5 trạng thái, panel hành động (Drawer phải 380px / BottomSheet), khối **Quy tắc lưu trú** (đêm tối thiểu/tối đa, thời gian chuẩn bị, báo trước, đặt xa nhất – cùng dữ liệu bước 5), CMP-32 SaveIndicator, chip múi giờ listing, "Đồng bộ iCal gần nhất" (🔒 Phase sau – ẩn), CMP-07/08 |
| Action | Chọn 1 ngày / kéo chọn khoảng ngày · **Chặn ngày** · **Mở ngày** · Sửa quy tắc lưu trú · Chuyển tháng · Chuyển sang Giá theo mùa (H08) · Bấm ngày đã đặt → xem popover |
| State (trang) | **Loading** (skeleton lưới) · **Default** · **Rỗng** (tháng không có sự kiện – vẫn hiển thị lưới) · **Listing chưa được duyệt** (banner "Lịch mở sau khi listing được duyệt", lưới read-only) · **Lỗi tải** · **Offline** |
| State (ô ngày) | Trống · Đã đặt · Giữ chỗ · Chờ Host · Host chặn · Quá khứ · **Được chọn** · **Ngoài quy tắc đặt** (trong thời gian báo trước / quá giới hạn đặt xa: Host vẫn chặn/mở được, ô có chấm mờ "khách không đặt được") · **Hover** (tooltip trạng thái) |
| State (hành động) | Panel: Chọn trống → [Chặn] · Chọn đã chặn → [Mở] · Chọn **hỗn hợp** (cả trống + đã đặt) → chỉ áp cho ngày hợp lệ, hiển thị "Bỏ qua 2 ngày đã đặt" · **Đang áp dụng** · **409 xung đột** (ngày vừa bị đặt/giữ chỗ: toast + tải lại lịch, giữ lựa chọn còn hợp lệ) · **Thành công** (toast + Hoàn tác trong 5 giây*) |
\* Hoàn tác = gọi API ngược lại; tuỳ chọn.

🖥 Desktop
```
┌────────┬───────────────────────────────────────────────────────────────────────┐
│ Sidebar│ ← Nhà trên đồi Đà Lạt · Lịch                  Múi giờ: Asia/Ho_Chi_Minh │
│        │ [Lịch] [Giá theo mùa →]                               Đã lưu 10:42      │
│        │ ‹  Tháng 12/2026  ›   [Hôm nay]      Legend: ▢Trống ■Đã đặt ◔Giữ chỗ    │
│        │                                      ?Chờ Host ▨Chặn                     │
│        │ ┌──┬──┬──┬──┬──┬──┬──┐ ┌──────────────────────────────┐                 │
│        │ │T2│T3│T4│T5│T6│T7│CN│ │ ĐÃ CHỌN: đêm 14–16/12 (3 đêm) │                 │
│        │ ├──┼──┼──┼──┼──┼──┼──┤ │ Trạng thái: Trống            │                 │
│        │ │ 1│ 2│ 3│ 4│ 5│ 6│ 7│ │ [  Chặn 3 ngày  ]            │                 │
│        │ │ 8│ 9│10│11│12│13│14│ │ ──────────────────────────── │                 │
│        │ │15│16│▓▓│▓▓│▓▓│20│21│ │ Quy tắc lưu trú  [Sửa]       │                 │
│        │ │  │  │đặt│đặt│đặt│  │  │ │ Tối thiểu 1 · Tối đa 30 đêm   │                 │
│        │ │22│23│▨▨│▨▨│27│28│29│ │ Chuẩn bị: không · Báo trước: 0 │                 │
│        │ └──┴──┴──┴──┴──┴──┴──┘ └──────────────────────────────┘                 │
└────────┴───────────────────────────────────────────────────────────────────────┘
```
📱 Mobile
```
┌──────────────────────────────┐
│ ←  Lịch · Nhà trên đồi        │
│ [Lịch] [Giá theo mùa]         │
│ ‹ Tháng 12/2026 ›  [Hôm nay]  │
│ T2 T3 T4 T5 T6 T7 CN          │
│ 1  2  3  4  5  6  7          │
│ 8  9  10 11 12 13 14         │
│ 15 16 ▓▓ ▓▓ ▓▓ 20 21         │
│ 22 23 ▨▨ ▨▨ 27 28 29         │
│ Legend (cuộn ngang) ▢■◔?▨     │
│ ▸ Quy tắc lưu trú  [Sửa]      │
├──────────────────────────────┤
│ Đã chọn đêm 14–16/12 · 3 đêm  │ ← BottomSheet hiện khi có chọn
│ [      Chặn 3 ngày         ]  │
└──────────────────────────────┘
```
Tablet: lưới lịch + panel phải 320px. Chọn khoảng bằng chạm ngày đầu rồi ngày cuối (mobile), kéo chuột (desktop), Shift+click (bàn phím/desktop).

---

## S10 · Giá theo mùa, lễ, ngày đặc biệt

### H08 · Giá theo mùa/lễ/ngày đặc biệt
| Mục | Giá trị |
|---|---|
| Route / Role | `/host/listings/:id/pricing-rules` · Host (listing Đang hiển thị / Tạm ẩn) [Assumption] |
| Component | Khối **Thứ tự ưu tiên giá** (4 bậc: Đặc biệt/Lễ → Mùa → Cuối tuần → Cơ bản; sau cùng giảm tuần/tháng) dạng stepper dọc, ô **Giá cuối tuần** (kèm "Đêm áp dụng: Thứ Sáu, Thứ Bảy – theo cấu hình quốc gia"), DataTable/ListCards **Quy tắc giá** (Tên, Loại, Khoảng ngày, Giá/đêm, Trạng thái ⏳sắp tới/●đang áp dụng/⌛đã qua), Modal/Sheet **Thêm-sửa quy tắc**, CMP-23 **Lịch giá** (mỗi ô: giá + nhãn nguồn), CMP-25 xoá, CMP-32 |
| Action | Sửa giá cuối tuần · Thêm quy tắc (Mùa/Lễ/Đặc biệt) · Sửa · Xoá · Xem lịch giá theo tháng · Bấm một ngày → tooltip "Giá 1.800.000 – nguồn: Lễ 30/4" · Lọc theo loại |
| State | **Loading** · **Default** · **Rỗng** (chưa có quy tắc: "Chỉ dùng giá cơ bản và cuối tuần") · **Modal: Default/Validating/Submitting/Lỗi trường (giá ≤ 0, ngày kết thúc < bắt đầu, ngày quá khứ)/Trùng cùng nhóm ưu tiên (liệt kê quy tắc xung đột) [Assumption A6]/Lưu thành công** · **Cảnh báo ảnh hưởng** ("Quy tắc này thay đổi giá của 5 đêm đã có booking? – không ảnh hưởng booking cũ" 🔒 Phase sau) · **Lịch giá loading** · **Lỗi tải/lưu** · **Offline** |

🖥 Desktop
```
┌────────┬───────────────────────────────────────────────────────────────────────┐
│ Sidebar│ ← Nhà trên đồi Đà Lạt · Giá          [Lịch →]                           │
│        │ Thứ tự áp dụng: ① Đặc biệt/Lễ → ② Mùa → ③ Cuối tuần → ④ Cơ bản → giảm tuần/tháng│
│        │ ┌─ Giá cơ bản & cuối tuần ───────────────────────────────────────┐   │
│        │ │ Giá cơ bản 1.200.000₫ [Sửa ở bước 6]  Cuối tuần [1.500.000]₫    │   │
│        │ │ ⓘ Áp dụng cho đêm Thứ Sáu và Thứ Bảy                           │   │
│        │ └────────────────────────────────────────────────────────────────┘   │
│        │ Quy tắc giá                                  [+ Thêm quy tắc] [Loại ▼]│
│        │ ┌──────────┬────────┬───────────────┬──────────┬────────┬───┐       │
│        │ │ Tên      │ Loại   │ Khoảng ngày   │ Giá/đêm  │ Trạng thái│ ⋮ │       │
│        │ ├──────────┼────────┼───────────────┼──────────┼────────┼───┤       │
│        │ │ Tết 2027 │ Lễ     │ 05/02–12/02   │ 2.400.000│ ⏳ Sắp tới│ ⋮ │       │
│        │ │ Mùa hè   │ Mùa    │ 01/06–31/08   │ 1.600.000│ ⌛ Đã qua│ ⋮ │       │
│        │ └──────────┴────────┴───────────────┴──────────┴────────┴───┘       │
│        │ Lịch giá  ‹ Tháng 2/2027 ›   Chú thích: [Lễ][Mùa][Cuối tuần][Cơ bản]    │
│        │ │ 5 │ 6 │ 7 │ 8 │…  mỗi ô: số ngày + giá (k) + chấm màu nguồn          │
└────────┴───────────────────────────────────────────────────────────────────────┘
Modal "Thêm quy tắc": Loại (◉Lễ ○Mùa ○Ngày đặc biệt) · Tên · Khoảng ngày [DateRange] · Giá/đêm [___]₫ · [Huỷ][Lưu]
```
📱 Mobile
```
┌──────────────────────────────┐
│ ←  Giá · Nhà trên đồi         │
│ [Lịch] [Giá theo mùa]         │
│ Thứ tự áp dụng ▸ (gập)        │
│ Cơ bản 1.200.000₫  Sửa ở B6 → │
│ Cuối tuần [1.500.000]₫        │
│ Quy tắc giá          [+ Thêm] │
│ ┌──────────────────────────┐ │
│ │ Tết 2027 · Lễ   ⏳ Sắp tới │ │
│ │ 05/02–12/02 · 2.400.000₫ ⋮│ │
│ └──────────────────────────┘ │
│ Lịch giá (cuộn dọc theo tháng)│
└──────────────────────────────┘
 Thêm/Sửa → bottom sheet cao 90%
```

---

## S11 · Trang chủ và tìm kiếm

### P01 · Trang chủ
| Mục | Giá trị |
|---|---|
| Route / Role | `/` · Khách vãng lai, Guest (Host ở chế độ Guest) |
| Component | Public Shell, Hero + CMP-18 SearchBar (Đi đâu · Ngày · Khách), CMP-16, CMP-17, danh sách **Điểm đến phổ biến** (từ Location seed + số listing), **Chỗ ở nổi bật** (CMP-19 carousel), banner "Trở thành Host" → P10, khối Cách hoạt động (3 bước), Footer |
| Action | Nhập/chọn điểm đến (gợi ý) · Chọn ngày · Chọn khách · **Tìm** · Bấm điểm đến phổ biến · Bấm thẻ listing · Bấm "Trở thành Host" |
| State | **Loading** (skeleton hero + carousel) · **Default** · **SearchBar: rỗng / đang gợi ý / không có gợi ý / ngày không hợp lệ / thiếu điểm đến** · **Không có listing nổi bật** (ẩn khối, không hiển thị rỗng) · **Lỗi tải khối** (từng khối tự thử lại, không phá trang) · **Offline** |

🖥 Desktop
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ◈ Logo                       Trở thành Host   VI▼  ₫▼  👤▼                  │
├──────────────────────────────────────────────────────────────────────────┤
│                  Tìm chỗ ở như người bản địa                              │
│ ┌──────────────────────┬──────────────────┬──────────────┬───────────┐   │
│ │ Đi đâu               │ Nhận – Trả phòng │ Khách        │ [ 🔍 Tìm ] │   │
│ │ [Đà Lạt, Lâm Đồng___]│ [12/12 → 15/12]  │ [2 người lớn]│           │   │
│ └──────────────────────┴──────────────────┴──────────────┴───────────┘   │
│ Điểm đến phổ biến                                                         │
│  [▢ Đà Lạt 120+] [▢ Hội An 85] [▢ Sa Pa 60] [▢ Vũng Tàu 74]               │
│ Chỗ ở nổi bật  ‹ ▢ ▢ ▢ ▢ ›                                                │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ Bạn có chỗ ở? Trở thành Host                       [ Bắt đầu ]     │    │
│ └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile
```
┌──────────────────────────────┐
│ ◈ Logo              VI▼  ☰   │
│ ┌──────────────────────────┐ │
│ │ 🔍 Bạn muốn đi đâu?       │ │ ← bấm → mở full-screen: Điểm đến › Ngày › Khách
│ │ Ngày bất kỳ · Thêm khách  │ │
│ └──────────────────────────┘ │
│ Điểm đến phổ biến →(cuộn ngang)│
│ [▢Đà Lạt][▢Hội An][▢Sa Pa]    │
│ Chỗ ở nổi bật → (carousel)     │
│ [ Banner Trở thành Host ]     │
├──────────────────────────────┤
│ 🔍Khám phá ♡ ✈ ✉ 👤           │
└──────────────────────────────┘
```
Tablet: SearchBar 1 hàng thu gọn, lưới điểm đến 3 cột.
SearchBar mobile (full-screen 3 bước, có thể chạm bước bất kỳ): `Đi đâu` (ô tìm + gợi ý + "Gần tôi"*) → `Ngày` (CMP-16 1 tháng cuộn dọc) → `Khách` (CMP-17) → nút **Tìm** sticky đáy.

### P02 · Kết quả tìm kiếm (danh sách + bản đồ)
| Mục | Giá trị |
|---|---|
| Route / Role | `/search?destination=&checkin=&checkout=&adults=&children=&sort=&price=&type=&bedrooms=&amenities=&instant=&policy=&bbox=` · Khách vãng lai, Guest |
| Component | CMP-18 SearchBar thu gọn, hàng **FilterChip** (Giá, Loại hình, Phòng ngủ, Tiện nghi, Instant Book, Chính sách huỷ, [Đánh giá 🔒]), nút **Bộ lọc** (CMP-20 FilterPanel), Select **Sắp xếp** (Liên quan, Giá ↑, Giá ↓, [Đánh giá 🔒], Mới nhất), tổng số kết quả, CMP-19 ×N, CMP-21 MapPanel + nút "Tìm trong khu vực này" + công tắc "Tìm khi di chuyển bản đồ", chip "Khu vực bản đồ ✕", phân trang "Hiển thị thêm" |
| Action | Đổi điểm đến/ngày/khách · Mở/đóng/Áp dụng/Xoá bộ lọc · Đổi sắp xếp · Di chuyển/zoom/vẽ vùng bản đồ · Bấm marker (popup thẻ) · Hover thẻ ↔ marker sáng lên · Bấm thẻ → P03 (giữ ngày/khách) · Chuyển Danh sách ⇄ Bản đồ (mobile) · Xoá tất cả bộ lọc |
| State (trang) | **Loading lần đầu** (skeleton thẻ + map placeholder) · **Loading cập nhật** (giữ kết quả cũ mờ 60% + thanh tiến trình trên, tránh nhảy layout) · **Có kết quả** · **Hết kết quả khi tải thêm** ("Bạn đã xem hết") · **0 kết quả** (EmptyState + gợi ý: Bỏ bớt bộ lọc [liệt kê chip], Đổi ngày, Mở rộng bản đồ, Xem khu vực lân cận) · **Lỗi** (Thử lại, giữ tham số) · **Offline** · **Ngày không hợp lệ** (check-out ≤ check-in → lỗi ở SearchBar) · **Không có token Mapbox/lỗi bản đồ** (ẩn bản đồ, banner nhỏ "Bản đồ tạm không khả dụng", danh sách dùng bình thường, bỏ nút Bản đồ) |
| State (giá trên thẻ) | **Có ngày** → "5.300.000 ₫ tổng · 3 đêm" + dòng nhỏ "Đã gồm phí và thuế" + "1.766.000 ₫/đêm" · **Chưa chọn ngày** → "Từ 1.200.000 ₫/đêm" · **Giá quy đổi** (S13) → nhãn "≈" + tooltip tiền tệ gốc · **Giá đang tính** (skeleton dòng giá) |
| State (thẻ) | Default · Hover · Loading ảnh (blur placeholder) · Lỗi ảnh (ảnh mặc định) · Nhãn "Instant Book" |

🖥 Desktop (≥1024: danh sách trái 55% – bản đồ phải 45%, sticky)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◈ Logo  [Đà Lạt │ 12/12–15/12 │ 2 người lớn │🔍]          VI▼ ₫▼ 👤▼            │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Giá ▼][Loại hình ▼][Phòng ngủ ▼][Tiện nghi ▼][⚡Instant][Chính sách ▼][Bộ lọc(2)]│
│ 48 chỗ ở · Sắp xếp [Liên quan ▼]  [x] Tìm khi di chuyển bản đồ                  │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────────┐ │
│ │ ┌────────┐ Nhà trên đồi · Nguyên căn │ │          B Ả N   Đ Ồ              │ │
│ │ │ ▢ ◂ ▸  │ Phường 3, Đà Lạt · 4 khách │ │     (5,3tr)   (4,8tr)            │ │
│ │ └────────┘ 2 PN · 3 giường  ⚡Instant │ │          ● (6,1tr)               │ │
│ │            5.300.000 ₫ tổng · 3 đêm   │ │  (2,2tr)                         │ │
│ │            Đã gồm phí và thuế         │ │              [Tìm trong khu vực này]│ │
│ ├──────────────────────────────────────┤ │  [+][−]                          │ │
│ │ ┌────────┐ Phòng riêng view núi …    │ └──────────────────────────────────┘ │
│ │ └────────┘                           │                                       │
│ │ [ Hiển thị thêm ]                    │                                       │
│ └──────────────────────────────────────┘                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile (mặc định Danh sách; nút nổi **Bản đồ** ⇄ **Danh sách**)
```
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ ←  Đà Lạt · 12/12–15/12 · 2  │      │ ←  Đà Lạt · 12/12–15/12 · 2  │
│ [Sắp xếp ▼]      [⚙ Lọc (2)] │      │ ┌──────────────────────────┐ │
│ 48 chỗ ở                      │      │ │       BẢN ĐỒ toàn màn    │ │
│ ┌──────────────────────────┐ │      │ │   (5,3tr) (4,8tr)        │ │
│ │ ▢ ◂ ▸  ♡🔒              │ │      │ │         ●                │ │
│ │ Nhà trên đồi · Nguyên căn │ │      │ │ [Tìm trong khu vực này]  │ │
│ │ Phường 3, Đà Lạt          │ │      │ └──────────────────────────┘ │
│ │ 5.300.000 ₫ tổng · 3 đêm  │ │      │ ┌ thẻ marker được chọn ────┐ │
│ │ Đã gồm phí và thuế        │ │      │ │ ▢ Nhà trên đồi 5,3tr     │ │
│ └──────────────────────────┘ │      │ └──────────────────────────┘ │
│            [ 🗺 Bản đồ ]      │      │            [ ☰ Danh sách ]   │
└──────────────────────────────┘      └──────────────────────────────┘
```
Bộ lọc (Desktop = Modal 640px; Mobile = full-screen sheet có header [✕ Xoá tất cả] và footer sticky **[Hiển thị 48 kết quả]** – số cập nhật theo lựa chọn):
```
┌ Bộ lọc ─────────────────────────────────────────── ✕ ┐
│ Khoảng giá/đêm   [min 0 ₫]──●──────●──[max 5.000.000 ₫]│
│ Loại hình        ( ) Tất cả (●) Nguyên căn ( ) Phòng riêng│
│ Phòng ngủ        [Bất kỳ][1][2][3][4+]                   │
│ Tiện nghi        [x] Wi-Fi [x] Bếp [ ] Hồ bơi  Xem thêm ▾│
│ Đặt phòng        [ ] Chỉ Instant Book                    │
│ Chính sách huỷ   [ ] Linh hoạt [ ] Trung bình [ ] Nghiêm ngặt│
│ (🔒 Điểm đánh giá – ẩn đến khi có đánh giá)               │
│ [ Xoá tất cả ]                       [ Hiển thị 48 kết quả ]│
└──────────────────────────────────────────────────────────┘
```
Tablet: danh sách 1 cột + bản đồ thu thành bảng trượt hoặc chuyển đổi như mobile (<900px), thẻ ngang.

---

## S12 · Chi tiết listing, hồ sơ Host công khai, chính sách huỷ công khai

### P03 · Chi tiết listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/rooms/:listingId?checkin=&checkout=&adults=&children=` · Khách vãng lai, Guest; **Chế độ xem trước** cho Host chủ listing và Admin (listing chưa công khai) |
| Component | CMP-26 Gallery+Lightbox, tiêu đề + khu vực xấp xỉ + loại hình + sức chứa, CMP-33 HostCard, khối **Điểm nổi bật**, Mô tả (xem thêm), CMP-29 **Tiện nghi** (10 mục + modal "Xem tất cả"), **Lịch trống** (CMP-16 chỉ đọc + chọn ngày), **Nội quy & giờ nhận/trả**, **Chính sách huỷ** (tóm tắt + CMP-27 timeline rút gọn → P05), **Vị trí** (CMP-21 vòng tròn xấp xỉ + dòng "Địa chỉ chính xác sẽ được cung cấp sau khi đặt phòng được xác nhận"), **Đánh giá** (🔒 "Chưa có đánh giá"), **Thẻ đặt phòng** (desktop sticky phải) / **Thanh giá + CTA dưới đáy** (mobile): CMP-16, CMP-17, CMP-22 PriceBreakdown, CTA |
| Action | Mở lightbox/Xem tất cả ảnh · Xem tất cả tiện nghi · Chọn ngày/khách · Mở bảng giá chi tiết/giá từng đêm · Xem chính sách huỷ → P05 · Xem hồ sơ Host → P04 · 🔒 **Đặt phòng / Gửi yêu cầu** (disabled ở giai đoạn 1: tooltip "Tính năng đặt phòng sẽ sớm ra mắt") · 🔒 Yêu thích · Chia sẻ (copy link) · Quay lại kết quả (giữ vị trí cuộn) |
| State (trang) | **Loading** (skeleton gallery + khối) · **Default** · **Không tồn tại / không còn hiển thị** (404 riêng: "Chỗ ở này hiện không khả dụng" + Gợi ý tìm chỗ khác) · **Chế độ xem trước** (banner vàng cố định "Đây là bản xem trước, chưa hiển thị công khai") · **Lỗi tải** · **Offline** |
| State (thẻ đặt phòng) | **Chưa chọn ngày** ("Từ 1.200.000 ₫/đêm" + "Thêm ngày để xem tổng giá") · **Đang tính giá** (skeleton) · **Có giá** (bảng đầy đủ: tiền phòng, phụ thu, phí vệ sinh, giảm giá [số âm, màu xanh], phí dịch vụ, thuế, **Tổng**) · **Ngày không còn trống** (lỗi + gợi ý khoảng trống gần nhất) · **Vi phạm đêm tối thiểu/tối đa/báo trước** (lỗi chỉ rõ quy tắc: "Tối thiểu 2 đêm") · **Vượt sức chứa** (GuestPicker chặn tại max + ghi chú) · **Giá quy đổi** (S13: nhãn "Giá quy đổi, chỉ tham khảo" + hiển thị giá gốc) · **Tỷ giá quá hạn** (chỉ hiển thị tiền tệ listing) · **Lỗi tính giá** (Thử lại) · **CTA disabled** (giai đoạn 1) |

🖥 Desktop
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                        │
│ Nhà trên đồi Đà Lạt                                  [↗ Chia sẻ] [♡🔒]         │
│ ┌──────────────────────────┬──────────┬──────────┐                           │
│ │                          │   ▢      │   ▢      │                           │
│ │      ▢ ẢNH LỚN           ├──────────┼──────────┤  [ Xem tất cả 12 ảnh ]    │
│ │                          │   ▢      │   ▢      │                           │
│ └──────────────────────────┴──────────┴──────────┘                           │
│ ┌────────────────────────────────────────────┐ ┌───────────────────────────┐ │
│ │ Nguyên căn tại Phường 3, Đà Lạt             │ │ 1.200.000 ₫ / đêm          │ │
│ │ 4 khách · 2 phòng ngủ · 3 giường · 1 tắm     │ │ [12/12 → 15/12] [2 khách ▼]│ │
│ │ ── HostCard: Nguyễn A ✓ Đã xác minh · Xem →  │ │ ──────────────────────────  │ │
│ │ ── Điểm nổi bật …                           │ │ 3 đêm × 1.200.000   3.600.000│ │
│ │ ── Mô tả … [Xem thêm]                       │ │ Phụ thu thêm khách    300.000│ │
│ │ ── Tiện nghi (10) …  [Xem tất cả 28]         │ │ Phí vệ sinh           200.000│ │
│ │ ── Lịch trống (2 tháng) …                   │ │ Giảm giá                   0 │ │
│ │ ── Nội quy · Nhận phòng 14:00 – Trả 12:00    │ │ Phí dịch vụ           410.000│ │
│ │ ── Chính sách huỷ: Linh hoạt  [Xem chi tiết] │ │ Thuế                  320.000│ │
│ │ ── Vị trí: bản đồ vòng tròn xấp xỉ           │ │ Tổng                4.830.000│ │
│ │ ── Đánh giá: Chưa có đánh giá                │ │ [ Đặt phòng ] (disabled 🔒)  │ │
│ └────────────────────────────────────────────┘ │ ⓘ Chưa bị trừ tiền          │ │
│                                                  └───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```
📱 Mobile
```
┌──────────────────────────────┐
│ ←                  ↗   ♡🔒    │
│ ┌──────────────────────────┐ │
│ │ ▢ ẢNH (vuốt)      1/12   │ │
│ └──────────────────────────┘ │
│ Nhà trên đồi Đà Lạt           │
│ Nguyên căn · Phường 3, Đà Lạt │
│ 4 khách · 2 PN · 3 giường     │
│ ─ HostCard ─                  │
│ ─ Điểm nổi bật ─              │
│ ─ Mô tả [Xem thêm] ─          │
│ ─ Tiện nghi [Xem tất cả] ─    │
│ ─ Lịch trống (1 tháng) ─      │
│ ─ Nội quy / Nhận–Trả phòng ─  │
│ ─ Chính sách huỷ [Chi tiết] ─ │
│ ─ Vị trí (bản đồ xấp xỉ) ─    │
│ ─ Đánh giá: chưa có ─         │
├──────────────────────────────┤
│ 4.830.000 ₫ · 3 đêm  Chi tiết▲│ ← sticky đáy
│ [ Chọn ngày ]  [Đặt phòng 🔒] │
└──────────────────────────────┘
 "Chi tiết ▲" mở BottomSheet: ngày/khách + PriceBreakdown đầy đủ
```
Tablet: thẻ đặt phòng chuyển xuống thanh sticky đáy như mobile; gallery lưới 1+2.

### P04 · Hồ sơ công khai của Host
| Mục | Giá trị |
|---|---|
| Route / Role | `/hosts/:hostId` · Khách vãng lai, Guest |
| Component | Ảnh + tên + CMP-10 "Đã xác minh", ngày tham gia, số listing đang hiển thị, Giới thiệu*, (🔒 tỷ lệ/thời gian phản hồi, điểm đánh giá – ẩn đến khi có dữ liệu), lưới CMP-19 các listing **đang hiển thị** |
| Action | Bấm thẻ listing → P03 · Quay lại · Chia sẻ |
| State | Loading · Default · **Host chưa có listing đang hiển thị** (EmptyState "Host chưa có chỗ ở nào đang mở") · **Host không tồn tại/bị khoá** (404) · Lỗi tải · Không hiển thị email/SĐT/giấy tờ (bất kỳ trạng thái nào) |
```
🖥 Desktop                                                📱 Mobile
┌─────────────────────────────────────────────┐  ┌──────────────────────────┐
│ ┌────────────┐  Nguyễn Văn A  ✓ Đã xác minh │  │      ( ▢ ảnh )           │
│ │  ( ▢ ảnh ) │  Tham gia từ 03/2026         │  │  Nguyễn Văn A ✓          │
│ │            │  3 chỗ ở đang mở             │  │  Tham gia 03/2026 · 3 chỗ ở│
│ └────────────┘  Giới thiệu: …               │  │  Giới thiệu …            │
│ Chỗ ở của Nguyễn Văn A (3)                   │  │ Chỗ ở của Nguyễn Văn A   │
│ [▢ thẻ] [▢ thẻ] [▢ thẻ]                      │  │ [▢ thẻ dọc] [▢ thẻ dọc]   │
└─────────────────────────────────────────────┘  └──────────────────────────┘
```
Tablet: lưới 2 cột.

### P05 · Chính sách huỷ
| Mục | Giá trị |
|---|---|
| Route / Role | `/cancellation-policies` (anchor `#flexible` / `#moderate` / `#strict`) · Khách vãng lai, Guest, Host |
| Component | Tabs/Anchor 3 chính sách, CMP-27 **PolicyTimeline** (đường thời gian trực quan) + **PolicyTable** (cột: Thời điểm huỷ · Tiền phòng · Phí vệ sinh · Phí dịch vụ Guest), mục "Trường hợp đặc biệt" (Host huỷ, bất khả kháng), giải thích "Thời điểm tính theo giờ check-in của listing", CMP-08 |
| Action | Chuyển tab/anchor · Quay lại listing (nếu đến từ P03: nút "← Về chỗ ở") · Chia sẻ link |
| State | Loading (skeleton bảng) · Default · **Highlight chính sách của listing đang xem** (huy hiệu "Áp dụng cho chỗ ở này") · Lỗi tải (có nội dung dự phòng tĩnh?*) · Anchor không hợp lệ → mặc định tab đầu |
\* Đề xuất: dữ liệu từ `CancellationPolicy` (seed), không hard-code ở FE.
```
🖥 Desktop                                           📱 Mobile
┌──────────────────────────────────────────────┐  ┌──────────────────────────┐
│ Chính sách huỷ                                │  │ Chính sách huỷ           │
│ [ Linh hoạt ] Trung bình  Nghiêm ngặt          │  │ [Linh hoạt|Trung bình|NN]│
│ Timeline:                                     │  │ Timeline (dọc)           │
│  ──●────────────●───────────●──────▶          │  │ ● ≥24 giờ: hoàn 100%     │
│    ≥24h        <24h      sau check-in         │  │ ● <24 giờ: …             │
│    100%        −đêm đầu   chỉ đêm chưa ở       │  │ ● Sau check-in: …        │
│ ┌───────────┬────────┬────────┬───────────┐   │  │ ▸ Xem bảng chi tiết      │
│ │ Thời điểm │ Tiền phòng│ Phí VS │ Phí DV    │   │  │  (thẻ cho từng mốc)       │
│ └───────────┴────────┴────────┴───────────┘   │  │ Trường hợp đặc biệt ▸     │
│ Trường hợp đặc biệt: Host huỷ · Bất khả kháng │  └──────────────────────────┘
└──────────────────────────────────────────────┘
```

---

## S13 · Tiền tệ hiển thị và tỷ giá (mở rộng C02, P02, P03)

| Vị trí | Thay đổi UI | State bổ sung |
|---|---|---|
| Header (Public/Account) | `₫ VND ▼` mở dropdown (Desktop) / bottom sheet (Mobile) liệt kê tiền tệ được hỗ trợ + ô tìm | Đang tải tỷ giá · Lỗi tỷ giá (dùng tiền tệ listing + toast) |
| C02 | Bật ô "Tiền tệ hiển thị" (đã chừa chỗ từ S02) | Chưa có lựa chọn → mặc định VND |
| P02 thẻ listing | Giá = giá quy đổi, tiền tố "≈", tooltip "Giá gốc 5.300.000 ₫ · Tỷ giá ngày dd/mm" | **Tỷ giá quá hạn** → hiển thị tiền tệ listing + banner trên cùng kết quả |
| P03 thẻ đặt phòng/PriceBreakdown | Mỗi dòng quy đổi; dòng cuối: "Giá quy đổi chỉ để tham khảo. Bạn sẽ thanh toán bằng {tiền tệ listing/cổng}" | Như trên + **làm tròn theo từng loại tiền** (VND 0 chữ số thập phân, USD 2…) |
```
 Dropdown tiền tệ (🖥)                       Bottom sheet (📱)
 ┌────────────────────┐                      ┌──────────────────────────┐
 │ 🔍 Tìm tiền tệ      │                      │ Tiền tệ hiển thị      ✕  │
 │ ◉ ₫ VND – Đồng VN   │                      │ 🔍 Tìm                    │
 │ ○ $ USD – Đô la Mỹ  │                      │ ◉ ₫ VND  ○ $ USD  ○ € EUR │
 │ ○ € EUR – Euro      │                      │ ⓘ Giá quy đổi tham khảo   │
 │ ⓘ Tỷ giá cập nhật   │                      │ [      Áp dụng        ]   │
 │   theo ngày         │                      └──────────────────────────┘
 └────────────────────┘
```
