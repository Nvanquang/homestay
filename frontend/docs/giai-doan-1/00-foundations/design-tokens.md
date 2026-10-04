# Design Tokens & Typography (Phong cách Airbnb, WCAG AA)


---

### 0.1 Breakpoint & lưới
| | Mobile | Tablet | Desktop |
|---|---|---|---|
| Khoảng | < 768 | 768–1023 | ≥ 1024 (thiết kế ở 1280) |
| Lưới | 4 cột, gutter 16, lề 16 | 8 cột, gutter 24, lề 24 | 12 cột, gutter 24, container tối đa 1200 (Public) / fluid (Host, Admin) |
| Điều hướng | Header gọn + Bottom nav (Public/Account) · Hamburger drawer (Host/Admin) | Header đầy đủ, sidebar thu gọn icon | Header đầy đủ, sidebar 240px (Host/Admin) |
| Overlay | Bottom sheet / full-screen | Modal giữa 560px | Modal giữa 480–640px, drawer phải 420px |
| Chạm | Vùng bấm ≥ 44×44, input cao 48, font input ≥ 16px (tránh zoom iOS) | | Hover/focus-visible rõ |


---

### 0.2 Ký hiệu wireframe
```
[ Nút ]  nút chính/phụ        ( ) radio    [x] checkbox    [▼] dropdown
▢ ảnh/placeholder             ░░ skeleton   ⓘ tooltip       ✓ thành công   ⚠ cảnh báo   ✕ lỗi
─── đường phân cách            ┌─┐ khung    ← → điều hướng   ⋮ menu hành động
```


---

### 0.5 Bảng trạng thái chuẩn (badge & ô lịch)

**Hồ sơ xác minh (IdentityVerification)**: `Chưa nộp` (neutral ○) · `Chờ duyệt` (warning ⏳) · `Đã xác minh` (success ✓) · `Bị từ chối` (error ✕) · `Cần cập nhật` (attention ⚠ – giấy tờ hết hạn).
**Listing**: `Nháp` (neutral ✎) · `Chờ duyệt` (warning ⏳) · `Đang hiển thị` (success ●) · `Cần chỉnh sửa` (attention ✎) · `Bị từ chối` (error ✕) · `Tạm ẩn` (neutral ⏸) · `Bị khoá` (error đặc 🔒).
**Ô lịch (H06)**: `Trống` (nền trắng, viền default) · `Đã đặt` (success đặc, icon ✓) · `Giữ chỗ` (warning, icon ⏱) · `Chờ Host` (attention, icon ?) · `Host chặn` (neutral + sọc chéo, icon ⊘) · `Chặn từ iCal` (như Host chặn, viền nét đứt, icon ⇄ — 🔒 chưa có dữ liệu ở giai đoạn 1) · `Quá khứ` (chữ disabled, không chọn được) · `Đang được chọn` (nền brand-50, viền 2px brand-600). **Mã màu chi tiết: xem 0.6.**


---


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
