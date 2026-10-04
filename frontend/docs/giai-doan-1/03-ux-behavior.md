# 03 · UX Behavior – Giai đoạn 1

> Mô tả **hành vi tương tác**: validation, thời gian, phản hồi, trạng thái trung gian, phím tắt, truy cập (a11y), xử lý lỗi và xung đột. Mã `A#`/`O#` là giả định/câu hỏi mở cần PO xác nhận (A1–A9 ở `01-user-flow.md`, A10+ ở cuối file này).
> Cấu trúc: **Phần 0 – quy tắc chung** áp dụng mọi slice → **Phần theo slice S01…S13** chỉ nêu cái riêng của slice đó.

---

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

## S01 · Đăng ký, xác minh email, đăng nhập, quên mật khẩu

**Validation (P07 / P06 / P08)**
| Trường | Quy tắc | Thông điệp (VI) |
|---|---|---|
| Họ tên | bắt buộc, 2–80 ký tự, cắt khoảng trắng đầu/cuối | "Vui lòng nhập họ và tên (2–80 ký tự)" |
| Email | bắt buộc, định dạng email, chuẩn hoá chữ thường, tối đa 254 | "Email chưa đúng định dạng" |
| Mật khẩu | ≥ 8 ký tự, gồm chữ và số [A4]; tối đa 128; cho dán; không cắt khoảng trắng | "Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số" |
| Điều khoản | phải tick | "Bạn cần đồng ý Điều khoản để tiếp tục" |
| Nhập lại mật khẩu (P08 B2) | trùng mật khẩu mới | "Mật khẩu nhập lại chưa khớp" |

**Hành vi chính**
1. **Danh sách yêu cầu mật khẩu** đổi ○→✓ theo thời gian thực; thanh độ mạnh chỉ là gợi ý, không chặn.
2. **Email đã tồn tại** (P07): lỗi inline kèm "Đăng nhập" / "Quên mật khẩu?" [O1: cân nhắc phản hồi trung tính để tránh dò email; hiện chọn inline cho dễ dùng, bù bằng giới hạn tần suất 429].
3. **Màn "Kiểm tra email"**: nút **Gửi lại** có đếm ngược 60 s; sau 3 lần/giờ → 429 → thông báo "Bạn đã yêu cầu quá nhiều lần, thử lại sau mm:ss". Có "Sai email? Đăng ký lại" (đưa về form, giữ họ tên).
4. **P09 gọi API xác minh đúng 1 lần khi mount** (bảo vệ khỏi gọi đôi do StrictMode/refresh – token dùng một lần nếu gọi 2 lần sẽ báo "đã dùng" sai). Dùng `useRef`/cờ để chặn lần gọi thứ hai.
5. **Đăng nhập**:
   - Lỗi sai thông tin luôn chung chung ("Email hoặc mật khẩu không đúng").
   - Chưa xác minh email → banner vàng + nút **Gửi lại email xác minh** (A2).
   - Tạm khoá (BE trả `lockedUntil`) → banner đỏ đếm ngược; nút Đăng nhập disabled tới khi hết; không tiết lộ số lần còn lại.
   - Sau đăng nhập: `returnTo` (**chỉ chấp nhận đường dẫn nội bộ bắt đầu bằng `/`**, không `//` và không URL đầy đủ – chống open redirect) → nếu không có: nhân sự → `/admin`; Host đang ở chế độ Host → `/host/listings`; còn lại → `/`.
   - Đã đăng nhập mà vào `/login` → chuyển về trang đích mặc định.
6. **Quên mật khẩu**: thông báo "đã gửi" luôn trung tính ("Nếu email tồn tại, chúng tôi đã gửi hướng dẫn"). Khi mở trang đặt lại, FE **kiểm tra token ngay khi tải** (trước khi người dùng nhập) → token hỏng hiện màn lỗi + yêu cầu liên kết mới. Thành công → về P06 kèm banner; **mọi phiên cũ bị đăng xuất** (BE).
7. Đổi ngôn ngữ trên trang auth **giữ nguyên giá trị đã nhập**, chỉ đổi nhãn/thông điệp.
8. Enter gửi form; Esc không làm gì; focus tự đặt vào ô đầu tiên khi mở trang (trừ mobile để tránh bật bàn phím không mong muốn).

**Edge case**: dán email có khoảng trắng (cắt); trình quản lý mật khẩu tự điền (không validate lỗi "trống" sai); mở liên kết xác minh ở trình duyệt khác (vẫn thành công, đăng nhập ở thiết bị gốc); người dùng đã xác minh bấm lại liên kết cũ ("Đã dùng" kèm nút Đăng nhập, không báo lỗi đỏ).

---

## S02 · Hồ sơ và cài đặt

**Hồ sơ (C01)**
- Ảnh đại diện: chọn → cắt vuông (kéo/zoom) → xem trước → Lưu; JPG/PNG/WebP ≤ 5 MB [A5]; có "Xoá ảnh". Lỗi định dạng/kích thước hiện ngay dưới ô, không gọi API.
- Họ tên 2–80; SĐT (tuỳ chọn) chuẩn hoá +84/0…, không xác minh qua SMS (FR-ACC-01); Giới thiệu ≤ 300.
- Email **chỉ đọc** (đổi email ngoài phạm vi giai đoạn 1); hiển thị "✓ Đã xác minh".
- Nút Lưu chỉ bật khi dirty; Huỷ khôi phục giá trị đã lưu; thay đổi dirty + rời trang → ConfirmDialog.
- Khối "Xác minh danh tính": hiển thị badge trạng thái (xem 0.5 wireframe) và CTA tương ứng (Chưa nộp → "Xác minh ngay", Bị từ chối → "Xem lý do & nộp lại").

**Cài đặt (C02)**
- **Đổi ngôn ngữ**: áp dụng **tức thì** (không reload): tải gói ngôn ngữ, đổi nhãn, định dạng ngày/số, `html lang`; gọi API lưu (optimistic; lỗi → hoàn lại ngôn ngữ cũ + toast lỗi). Toast: "Đã đổi sang English. Email gửi sau đó sẽ dùng ngôn ngữ này."
- **Đổi mật khẩu**: cần mật khẩu hiện tại; mật khẩu mới ≠ mật khẩu cũ; sau thành công xoá cả 3 ô, hiện banner "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất" (S02 AC); phiên hiện tại giữ nguyên. Sai mật khẩu cũ → lỗi tại ô đó, không xoá ô khác.
- **Chế độ Host**: công tắc **một chiều** ở giai đoạn 1 [A11]: Bật → toast + menu Host xuất hiện + (nếu chưa duyệt) banner cố định "Hoàn tất xác minh để tạo listing →H02"; sau khi bật, công tắc đổi thành dòng trạng thái "Đã bật chế độ Host" (việc chuyển qua lại giữa **hiển thị** Guest/Host dùng bộ chuyển ở header – FR-ACC-02).
- Khối Tiền tệ: ở giai đoạn 1 hiển thị disabled kèm "Sắp có"; bật ở S13.

---

## S03 · Back-office: đăng nhập quản trị và phân quyền

- **A01**: tách giao diện và tên miền con/đường dẫn `/admin`; không có đăng ký/quên mật khẩu công khai; lỗi quyền hiển thị chung ("Tài khoản không có quyền truy cập") – không nói tài khoản có tồn tại hay không.
- **Phiên back-office**: hết hạn do không hoạt động sau 30 phút [A12]; cảnh báo modal ở phút 28 ("Phiên sắp hết hạn – Tiếp tục làm việc") với đếm ngược.
- **Menu theo vai trò** (hằng số, không hard-code từng màn):

| Vai trò | Mục menu giai đoạn 1 |
|---|---|
| Admin | Duyệt hồ sơ danh tính · Duyệt listing · Nhân sự và phân quyền |
| CSKH | (không có mục nào ở giai đoạn 1 – màn hình đích mặc định "Chưa có công việc nào được giao" + 403 khi vào URL khác) |
| Kế toán | như CSKH |

- **A18 – Tạo nhân sự**: drawer gồm Họ tên, Email, Vai trò → "Tạo và gửi lời mời" (BE gửi email đặt mật khẩu tái sử dụng luồng P08 [A12b]). Sau tạo: dòng mới nổi bật 3 s, trạng thái "Chờ kích hoạt".
- **Khoá/mở khoá/đổi vai trò**: luôn mở `ConfirmDialog` có trường **Lý do** (bắt buộc, ≥ 10 ký tự) và hiển thị hậu quả ("Nhân sự sẽ bị đăng xuất ngay"). Kết quả ghi log (người làm, thời gian, giá trị cũ/mới) và hiện ở tab **Lịch sử** của nhân sự.
- **Bảo vệ**: không tự khoá/hạ quyền chính mình; không hạ quyền/khoá Admin cuối cùng → nút disabled + tooltip lý do (BE vẫn kiểm tra).
- Bảng: phân trang phía máy chủ 20 dòng/trang, sắp xếp theo cột, tìm kiếm debounce 300 ms, giữ bộ lọc trong URL.
- **403** hiển thị trong chính Admin Shell (giữ menu), nội dung "Bạn không có quyền xem trang này" + nút Về trang chủ quản trị.

---

## S04 · Xác minh Host và Admin duyệt

**P10 – logic CTA**
| Trạng thái người dùng | CTA | Hành vi |
|---|---|---|
| Chưa đăng nhập | "Đăng ký để bắt đầu" | → P07 với `returnTo=/become-host?start=1` |
| Đã đăng nhập, chưa xác minh email | "Bắt đầu" (disabled) + banner | Banner: "Xác minh email trước" + Gửi lại |
| Đủ điều kiện | "Bắt đầu" | Gọi bật chế độ Host → H02 |
| Là Host, hồ sơ chưa nộp/bị từ chối/chờ duyệt | "Tiếp tục xác minh" | → H02 |
| Host đã duyệt | "Tới Listing của tôi" | → H03 |

**H02 / C03 – form & tải tệp**
- Tệp: JPG/PNG/PDF (giấy tờ danh tính chỉ ảnh), ≤ 10 MB/tệp, tối đa 2 tệp danh tính (trước/sau) và 5 tệp quyền khai thác [A5]. Kiểm tra loại/kích thước phía FE trước khi tải.
- **Tải trực tiếp lên kho riêng bằng URL ký** ngay khi chọn tệp (tối đa 3 tệp song song); mỗi ô hiển thị progress %, nút Huỷ, Thử lại khi lỗi; xem trước bằng `URL.createObjectURL` (huỷ khi rời trang).
- Nút **Gửi hồ sơ** bật khi: thông tin bắt buộc hợp lệ + mọi tệp bắt buộc **đã tải xong**. Trước khi gửi: ConfirmDialog "Sau khi gửi, bạn không thể sửa hồ sơ cho tới khi có kết quả".
- Thông tin văn bản tự lưu nháp (30 s); **tệp chưa gửi được lưu giữ** khi quay lại (hiển thị tên tệp + "Đã tải").
- Sau khi gửi: form chuyển sang chế độ chỉ đọc; **số giấy tờ che (giữ 4 số cuối)**; **không hiển thị lại ảnh giấy tờ** (chỉ tên tệp, trạng thái ✓) – ảnh nhạy cảm không cache (`Cache-Control: no-store`).
- **Bị từ chối**: khối lý do ở đầu trang; trường/tệp bị nêu có viền đỏ; chỉ cần thay mục bị nêu; nút "Sửa & gửi lại". **Đã xác minh**: CTA "Tạo listing". **Cần cập nhật** (giấy tờ hết hạn): banner cam, mở lại form.
- Người dùng đang mở H02 ở trạng thái Chờ duyệt: tự refetch khi quay lại tab và mỗi 60 s khi tab đang hiển thị; khi chuyển Đã xác minh → toast + CTA.
- Giấy tờ trùng tài khoản Host khác (BR-ACC-04): **không tiết lộ cho Host** thông tin về tài khoản kia; Host chỉ thấy "Đang chờ duyệt".

**A03 – hành vi duyệt**
| Chủ đề | Hành vi |
|---|---|
| Hàng đợi | Mặc định sắp **cũ nhất trước**; cột "Chờ" hiển thị thời gian đã chờ ("3 giờ"); lọc theo loại (Host/Guest), trạng thái, cờ ⚑, "Của tôi"; bấm hàng → mở chi tiết |
| Khoá bản ghi (soft lock) | Mở chi tiết → gọi nhận khoá. **Heartbeat 60 s**; khoá hết hạn sau 5 phút không heartbeat [A13]; nhả khi đóng, sau quyết định, hoặc "Trả lại hàng đợi". Người thứ hai mở → LockBanner "Đang được {tên} xử lý từ {giờ}" + chế độ chỉ xem, nút quyết định disabled |
| Mất khoá giữa chừng | Banner đỏ "Hồ sơ đã được người khác tiếp nhận" → mọi nút quyết định disabled; nút "Nhận lại" nếu khoá còn tự do |
| Xem ảnh giấy tờ | Mặc định **che mờ**; bấm "Bấm để xem" → gọi API ghi log (**mỗi lần xem = 1 log**: ai, khi nào, bản ghi nào, BR-ACC-05) → nhận URL ký hết hạn ngắn (120 s [A13b]) → hiển thị kèm **watermark** (tên Admin + giờ). Hết hạn/ chuyển tab >60 s → tự che lại; xem lại = log lần nữa. Chặn menu chuột phải/kéo ảnh (chỉ mang tính răn đe, ghi chú trong dev docs) |
| Quyết định | **Duyệt**: ConfirmDialog nhẹ; với hồ sơ có cờ ⚑ cần tick "Tôi đã kiểm tra cảnh báo trùng giấy tờ" trước khi bật nút. **Từ chối**: bắt buộc chọn lý do (danh mục: Ảnh mờ · Giấy tờ hết hạn · Thông tin không khớp · Giấy tờ không hợp lệ · Khác) + ghi chú gửi Host (≥ 10 ký tự) |
| Sau quyết định | Toast "Đã duyệt hồ sơ #1042 · Email đã gửi cho Host" → tự mở hồ sơ kế tiếp (bật/tắt bằng tuỳ chọn "Tự mở hồ sơ kế tiếp") |
| Xung đột | 409 "Hồ sơ đã được xử lý" → chuyển chỉ xem + hiển thị kết quả |
| Dùng lại cho Guest (C03) | Hàng đợi chung; cột Loại phân biệt; chi tiết ẩn mục "Giấy tờ quyền khai thác" khi là Guest |

---

## S05 · Host tạo listing nháp

**Danh sách (H03)**
- Mặc định sắp **cập nhật gần nhất trước**; lọc theo trạng thái; thẻ nháp hiển thị tiến độ "x/8 bước" (số bước đã hoàn thành) và nút "Tiếp tục chỉnh sửa" mở **bước dang dở** (bước đầu tiên chưa hoàn thành).
- **Tạo listing** khi Host chưa được xác minh: nút disabled + tooltip; nếu bấm bằng bàn phím/mobile → modal "Cần xác minh trước" với CTA → H02. Kiểm tra lại ở API (S05 AC).
- Xoá nháp: ConfirmDialog; chỉ với trạng thái Nháp (BR-LST-05: listing có booking không xoá được – menu ẩn mục Xoá).

**Wizard (H04) – chung**
- **Tạo bản ghi nháp khi bấm Tiếp tục lần đầu ở bước 1** (không tạo bản ghi rỗng khi vừa mở `/new`); sau đó URL chuyển sang `/host/listings/:id/edit/:step`.
- **Lưu nháp**: (a) khi bấm Tiếp tục / Quay lại / Lưu & thoát, (b) 30 s sau lần sửa cuối khi dirty (lưu một phần, **không hiển thị lỗi validate**). SaveIndicator: "Đang lưu…" → "Đã lưu 10:42" → hoặc "Lưu thất bại – Thử lại" (giữ dữ liệu cục bộ, thử lại tự động khi online).
- **Điều hướng bước**: Tiếp tục = validate chặt bước hiện tại + lưu + sang bước kế. WizardNav: bước đã **hoàn thành** hoặc **kế tiếp** bấm được; các bước sau đó là 🔒. Quay lại luôn được. Dữ liệu các bước đã nhập **còn nguyên** khi quay lại (S05 AC).
- **Hai tab cùng sửa**: mỗi bản ghi có phiên bản; lưu với phiên bản cũ → 409 → banner Tải lại.
- **Phiên hết hạn** khi đang sửa: modal đăng nhập lại; đăng nhập xong tự lưu lại thay đổi cục bộ.
- Listing đang **Chờ duyệt**: wizard mở ở chế độ chỉ đọc + banner "Đang chờ duyệt – bạn không thể chỉnh sửa".

**Bước 1 – validation**: Tên 10–80 ký tự [A5b]; Mô tả 50–2000; Số khách 1–30; Phòng ngủ 0–20 (0 = studio); Giường ≥ 1; Phòng tắm ≥ 0,5 bước 0,5; Giờ nhận ≤ Giờ trả không bắt buộc (khác ngày hợp lệ); Tiền tệ listing khoá sau lần duyệt đầu.

**Bước 2 – bản đồ**
- Khu vực bắt buộc (Tỉnh/Thành → Khu vực từ danh mục); Địa chỉ chính xác bắt buộc ≤ 200 ký tự.
- **Ghim**: kéo ghim hoặc chọn kết quả tìm kiếm; sau khi kéo, hỏi một lần "Cập nhật địa chỉ theo vị trí ghim?" (không tự ghi đè nếu người dùng đã gõ).
- **Quyền riêng tư**: vẽ **vòng tròn vùng hiển thị công khai** quanh ghim + dòng chú thích; nhắc "Địa chỉ chính xác chỉ gửi cho khách sau khi đặt phòng được xác nhận" (BR-SRC-04). Địa chỉ chính xác **không** xuất hiện trong bất kỳ API công khai nào.
- Ghim nằm ngoài vùng của khu vực đã chọn → cảnh báo mềm (không chặn).
- **Thiếu token/Mapbox lỗi**: ẩn bản đồ, hiển thị ô Vĩ độ/Kinh độ (−90…90 / −180…180, tối đa 6 số lẻ) + banner "Bản đồ tạm thời không dùng được. Bạn có thể nhập toạ độ thủ công." (S05 ghi chú rủi ro).

**Bước 3 – ảnh**
- Định dạng JPG/PNG/WebP ≤ 10 MB; tối đa 30 ảnh [A5]; HEIC → thông báo "Hãy chuyển sang JPG/PNG" (hoặc BE chuyển đổi).
- Chọn nhiều ảnh cùng lúc; tải song song tối đa 3; mỗi ảnh có progress, Huỷ, Thử lại; mất mạng → hàng đợi, tự tiếp tục.
- **Thứ tự**: kéo-thả (chuột/cảm ứng) + nút ↑/↓ và "Đặt làm ảnh bìa" (bàn phím, mobile). Lưu thứ tự **optimistic**, debounce 500 ms; lỗi → trả lại thứ tự cũ + toast. **Ảnh đầu tiên = ảnh bìa** (nhãn "Ảnh bìa").
- Xoá ảnh: lập tức biến mất + toast **Hoàn tác 5 s** rồi mới gọi xoá thật.
- Dưới 5 ảnh: **không chặn** Tiếp tục; chỉ hiển thị "x/5" (chặn thật ở bước 8 – S07).

---

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

## S07 · Chính sách huỷ, kiểu đặt, giấy tờ, gửi duyệt, trạng thái

- **Chọn chính sách**: thẻ radio có tóm tắt 1 dòng; "Xem bảng mốc hoàn tiền" mở modal (bảng từ API `CancellationPolicy`, không hard-code); chọn lại được bất kỳ lúc nào ở nháp. Chú thích: "Thay đổi sau này chỉ áp dụng cho booking mới" (BR-LST-03).
- **Kiểu đặt**: giải thích hậu quả từng lựa chọn ngay trong thẻ (Instant: khách thanh toán ngay; Request: bạn có 24 giờ phản hồi, khách chưa bị trừ tiền).
- **Bước 8 – điều kiện gửi duyệt**:
  - Checklist lấy từ API kiểm tra đủ điều kiện (nguồn sự thật = BE); FE chỉ hiển thị. Mỗi mục thiếu có link nhảy tới đúng bước ("Cần thêm 2 ảnh (3/5) → Đi tới bước 3").
  - Nút **Gửi duyệt** disabled khi còn mục thiếu; mục thiếu đầu tiên được focus khi bấm nút bằng bàn phím giả lập; Host chưa xác minh → mục đầu "Hồ sơ xác minh chưa được duyệt → H02".
  - Danh sách loại giấy tờ bắt buộc **động theo quốc gia** (BE trả danh sách) – FR-LST-06.
  - Bấm Gửi duyệt → ConfirmDialog tóm tắt ("Sau khi gửi bạn không thể chỉnh sửa cho tới khi có kết quả") → loading → chuyển H05 + toast. Lỗi BE từ chối → hiển thị lý do chính xác từ API ở checklist (ưu tiên hơn FE).
- **H05**:
  - Chờ duyệt: refetch khi quay lại tab (không polling dày); hiển thị "Đã gửi {thời điểm tương đối}".
  - **Cần chỉnh sửa/Bị từ chối**: khối lý do liệt kê **theo mục** (ảnh, mô tả, giấy tờ, giá, vị trí, khác); mỗi mục có nút nhảy đến bước tương ứng; nút "Sửa & gửi lại" mở bước đầu tiên bị nêu. Trong lúc sửa, trạng thái vẫn là Cần chỉnh sửa/Bị từ chối (banner "Đang sửa theo yêu cầu"); gửi lại ở bước 8.
  - Lịch sử các lần gửi: danh sách rút gọn (lần, ngày, kết quả), bấm mở lý do cũ.
  - Đang hiển thị: nút "Xem trang công khai" (mở P03 tab mới), "Lịch", "Giá theo mùa".
  - Bị khoá: chỉ đọc + lý do + "Liên hệ hỗ trợ".

---

## S08 · Admin duyệt listing lần đầu (A04)

- Hàng đợi, khoá bản ghi, heartbeat, mất khoá, 409: **giống A03** (dùng lại logic).
- **Cảnh báo trùng địa chỉ (BR-LST-06)**: banner vàng ở đầu chi tiết + link mở listing/Host trùng (tab mới). Duyệt khi có cảnh báo → bắt buộc tick "Tôi đã kiểm tra cảnh báo trùng địa chỉ".
- **Rà soát**: tab **Nội dung / Ảnh / Giấy tờ / Giá & chính sách**; tab **Thay đổi** (so sánh cũ/mới) hiển thị disabled kèm tooltip (S08 ghi chú). Admin thấy **địa chỉ chính xác** + mini map; xem giấy tờ theo cơ chế che-mờ-có-log (như A03).
- "Xem như khách": mở P03 ở **chế độ xem trước** trong tab mới.
- **Quyết định**:
  - **Duyệt** → Listing "Đang hiển thị", email Host.
  - **Yêu cầu chỉnh sửa**: tick các mục cần sửa (Ảnh, Mô tả, Giấy tờ, Giá, Vị trí, Khác) + ghi chú **bắt buộc** cho từng mục tick (≥ 10 ký tự). Dữ liệu này đi thẳng tới khối lý do ở H05.
  - **Từ chối**: lý do + ghi chú bắt buộc.
  - Hậu quả hiển thị rõ trong dialog ("Host sẽ nhận email và có thể sửa rồi gửi lại").
- Sau quyết định: toast + (tuỳ chọn) tự mở listing kế tiếp; hàng đợi cập nhật không cần tải lại.

---

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

## S12 · Chi tiết listing, hồ sơ Host, chính sách huỷ

**P03**
- **Gallery**: desktop lưới 1+4 → "Xem tất cả ảnh" mở lightbox (← → Esc, đếm "3/12"); mobile carousel vuốt + chạm mở lightbox có pinch-zoom; nút Back của trình duyệt **đóng lightbox** (đẩy một mục lịch sử khi mở).
- **Thẻ đặt phòng**:
  - Khởi tạo ngày/khách từ URL; đổi ngày/khách → cập nhật URL (`replace`) và gọi báo giá (debounce 300 ms, huỷ request cũ).
  - Date picker hiển thị **ngày không trống bị gạch**, ngày vi phạm quy tắc có tooltip lý do; chọn khoảng vi phạm **đêm tối thiểu/tối đa/báo trước** → thông báo inline cụ thể ("Chỗ ở này yêu cầu tối thiểu 2 đêm") và **không** gọi báo giá.
  - Khoảng ngày không còn trống (ví dụ vừa bị đặt) → lỗi + gợi ý "Khoảng trống gần nhất: 20–23/12".
  - GuestPicker chặn tăng khi đạt sức chứa; dòng chú thích "Tối đa 4 khách".
  - Bảng giá: các dòng theo thứ tự tiền phòng → phụ thu → phí vệ sinh → giảm giá (số âm) → phí dịch vụ → thuế → **Tổng**; "Xem giá từng đêm" mở rộng; hiển thị "Đã gồm phí và thuế" (BR-PRC-06). Giá chưa tính xong → skeleton từng dòng.
  - **CTA giai đoạn 1**: nút "Đặt phòng"/"Gửi yêu cầu" (tuỳ kiểu đặt) **disabled** với tooltip/chú thích "Đặt phòng sẽ sớm ra mắt" (`bookingEnabled=false`). Khi bật: kiểm tra đăng nhập → returnTo → luồng đặt (ngoài phạm vi).
  - Mobile: thanh đáy hiển thị tổng giá (hoặc "Từ …/đêm") + nút; "Chi tiết ▲" mở sheet đầy đủ; thanh ẩn khi sheet/bàn phím mở.
- **Quyền riêng tư địa chỉ (BR-SRC-04)**: chỉ hiển thị khu vực xấp xỉ + bản đồ vòng tròn; không hiển thị toạ độ chính xác, không có nút "Chỉ đường" ở giai đoạn này.
- **Chế độ xem trước** (Host chủ listing, Admin): banner vàng cố định; mọi dữ liệu là bản đang xem (nháp/chờ duyệt); không thể chia sẻ; người khác truy cập listing chưa công khai → trang 404 "Chỗ ở này hiện không khả dụng".
- **Chia sẻ**: mobile dùng Web Share API; desktop sao chép liên kết + toast "Đã sao chép".
- **Tối ưu chia sẻ/SEO**: `<title>`, mô tả, ảnh Open Graph, canonical; liên kết chia sẻ **không** kèm thông tin riêng tư.
- **Mục Đánh giá**: "Chưa có đánh giá" (giai đoạn 1).
- Điều hướng "Quay lại kết quả": trở về P02 với **cùng bộ lọc và vị trí cuộn**.

**P04**: chỉ hiển thị listing **Đang hiển thị**; thông tin riêng tư (email, SĐT, giấy tờ) **không** bao giờ xuất hiện; Host bị khoá/không tồn tại → 404; chỉ số phản hồi/đánh giá ẩn đến khi có dữ liệu.

**P05**: lấy bảng mốc từ API; anchor theo `#flexible|#moderate|#strict`; nếu mở từ P03 → tab mặc định là chính sách của listing, gắn nhãn "Áp dụng cho chỗ ở này", có nút "← Về chỗ ở". Dòng ghi chú cố định: "Thời điểm tính theo giờ check-in của chỗ ở".

---

## S13 · Tiền tệ hiển thị và tỷ giá

- **Chọn tiền tệ**: header (mọi trang) hoặc C02; mở dropdown/sheet có ô tìm; chọn → áp dụng **ngay** cho toàn trang: gửi lại các truy vấn giá với `currency` mới (BE quy đổi và làm tròn), **skeleton chỉ ở các dòng giá**, phần còn lại giữ nguyên.
- Đã đăng nhập: lưu vào User; chưa đăng nhập: lưu cục bộ. Lần truy cập sau tự áp dụng.
- **Nhãn bắt buộc** (BR-SRC-05, S13 AC): mọi giá quy đổi có tiền tố "≈" + tooltip/dòng chú thích "Giá quy đổi, chỉ để tham khảo. Tiền tệ của chỗ ở: VND. Tỷ giá ngày dd/mm/yyyy"; ở bảng giá chi tiết (P03) hiển thị **thêm** số tiền theo tiền tệ listing.
- **Tỷ giá lỗi/quá hạn**: BE trả cờ `fxStale`/`fxUnavailable` → hiển thị **tiền tệ của listing** + banner nhỏ "Chưa thể quy đổi tiền tệ, đang hiển thị theo VND"; bộ chọn tiền tệ disabled cho tới khi phục hồi.
- Làm tròn theo loại tiền do BE xử lý; FE chỉ **định dạng** theo tiền tệ và ngôn ngữ.

---

## Phụ lục A · Bảng thông điệp nền tảng (VI / EN) – để đưa vào gói i18n

| Khoá | VI | EN |
|---|---|---|
| `common.retry` | Thử lại | Try again |
| `common.saved_at` | Đã lưu {time} | Saved at {time} |
| `common.offline` | Mất kết nối. Một số thao tác tạm thời không dùng được. | You're offline. Some actions are unavailable. |
| `common.session_expired` | Phiên đã hết hạn. Hãy đăng nhập lại để tiếp tục. | Your session has expired. Sign in to continue. |
| `auth.generic_login_error` | Email hoặc mật khẩu không đúng | Incorrect email or password |
| `auth.email_unverified` | Email của bạn chưa được xác minh | Your email isn't verified yet |
| `auth.locked` | Tài khoản tạm khoá. Thử lại sau {time} | Account temporarily locked. Try again in {time} |
| `listing.min_gt_max` | Đêm tối thiểu không được lớn hơn đêm tối đa | Minimum nights can't exceed maximum nights |
| `listing.photos_min` | Cần thêm {n} ảnh (hiện {c}/{min}) | {n} more photos needed ({c}/{min}) |
| `listing.address_private` | Địa chỉ chính xác chỉ gửi cho khách sau khi đặt phòng được xác nhận | The exact address is shared only after a booking is confirmed |
| `price.includes_fees` | Đã gồm phí và thuế | Includes fees and taxes |
| `price.from_per_night` | Từ {price}/đêm | From {price}/night |
| `price.converted_note` | Giá quy đổi, chỉ để tham khảo | Converted price, for reference only |
| `calendar.conflict` | Một số ngày vừa được đặt. Lịch đã được cập nhật. | Some dates were just booked. The calendar has been refreshed. |
| `lock.held_by` | Đang được {name} xử lý từ {time} | Being handled by {name} since {time} |

## Phụ lục B · Giả định / câu hỏi mở bổ sung (A10 trở đi và O#)

| Mã | Nội dung | Gợi ý |
|---|---|---|
| A11 | Công tắc "Chế độ Host" ở C02 là **một chiều** trong giai đoạn 1; chuyển hiển thị Guest/Host dùng bộ chuyển ở header | Tắt hẳn vai trò Host cần chính sách xử lý listing/booking đang có |
| A12 / A12b | Hết phiên back-office sau 30 phút không hoạt động; nhân sự mới đặt mật khẩu qua email mời (tái dùng P08) | Cần BA/Bảo mật xác nhận |
| A13 / A13b | Khoá bản ghi hết hạn sau 5 phút không heartbeat; URL xem ảnh giấy tờ sống 120 s | Tham số nên đặt trong SystemConfig |
| A5b | Giới hạn độ dài nội dung listing: Tên 10–80 ký tự, Mô tả 50–2000 ký tự | Cần PO chốt |
| A14 | Giảm giá tuần áp từ 7 đêm, tháng từ 28 đêm | Đặc tả ghi "đủ số đêm", chưa nêu ngưỡng |
| A16 | Dải "thời gian chuẩn bị" chỉ hiển thị thông tin trên lịch Host | |
| A17 | Danh mục giấy tờ pháp lý theo quốc gia do BE trả động | Cần danh sách cho Việt Nam |
| A18 | "Chọn vùng trên bản đồ" = khung nhìn hiện tại (bbox); vẽ vùng tự do để giai đoạn sau | Đáp ứng S11 AC |
| O1 | Đăng ký email đã tồn tại: báo lỗi trực tiếp hay phản hồi trung tính? | Hiện chọn trực tiếp + giới hạn 429 |
| O2 | Số tiện nghi tối thiểu để gửi duyệt? | Hiện không bắt buộc |
| O3 | Host có thể rút lại listing đã gửi duyệt để sửa ("Rút lại") ở giai đoạn 1 không? | Hiện không có; wireframe H05 để mục này ở dạng tuỳ chọn |
