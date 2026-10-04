# Đa ngôn ngữ, SEO, hiệu năng và truy cập

Bốn chủ đề này phải được thiết lập từ nền, vì làm bù sau thường phải sửa lại hầu hết các màn hình.

---

## 1. Đa ngôn ngữ (i18n)

Phạm vi: tiếng Việt (VI) và tiếng Anh (EN) cho cả `web` và `backoffice`. Thư viện: next-intl.

### 1.1. Định tuyến

| Quy định | Chi tiết |
|---|---|
| Tiền tố ngôn ngữ | Mọi đường dẫn nằm dưới `/vi` hoặc `/en`; ngôn ngữ mặc định là `vi` |
| Phát hiện | Lần đầu vào không có tiền tố: dựa vào lựa chọn đã lưu (cookie ngôn ngữ), rồi tới `Accept-Language`, rồi mặc định `vi`; chuyển hướng ở `proxy.ts` |
| Lưu lựa chọn | Cookie ngôn ngữ (không phải dữ liệu nhạy cảm) và trường ngôn ngữ trong hồ sơ người dùng khi đã đăng nhập |
| Chuyển ngôn ngữ | Giữ nguyên trang và tham số URL hiện tại, chỉ đổi tiền tố |
| Email | Ngôn ngữ email theo cài đặt của người dùng (do backend gửi), không theo ngôn ngữ trình duyệt lúc gửi |

### 1.2. Thông điệp

| Quy định | Chi tiết |
|---|---|
| Vị trí | `apps/<app>/messages/{vi,en}/<namespace>.json`, mỗi feature một namespace; nhãn và lỗi dùng chung ở `packages/shared/messages` |
| Khoá | Tiếng Anh, không dấu, dạng `namespace.khu-vuc.hanh-dong` (ví dụ `booking.pay.submit`) |
| Đủ hai ngôn ngữ | Một khoá phải có ở cả VI và EN; có kiểm tra tự động báo khoá thiếu hoặc thừa |
| Kiểu | Khoá được sinh kiểu TypeScript để lỗi chính tả bị bắt khi biên dịch |
| Không nối chuỗi | Không ghép câu từ nhiều mảnh; dùng tham số và cú pháp ICU (`{count, plural, ...}`) |
| Số nhiều và giới tính | Dùng ICU plural; tiếng Việt không chia số nhiều nhưng khoá vẫn dùng chung cú pháp |
| Không chuỗi cứng | Lint hoặc review chặn chữ hiển thị viết cứng trong component (kể cả `aria-label`, `title`, `placeholder`, `alt`) |
| Lỗi từ API | Hiển thị bằng khoá `errors.<code>` (file 05); không hiển thị chữ do backend trả |
| Độ dài chữ | Thiết kế chịu được chữ dài hơn 30 phần trăm (tiếng Việt thường dài hơn tiếng Anh); kiểm tra bố cục ở cả hai ngôn ngữ |

### 1.3. Định dạng theo vùng

- Số, tiền, ngày, giờ, danh sách, khoảng thời gian tương đối dùng `Intl` qua next-intl; không tự định dạng thủ công.
- Tiền luôn qua `formatMoney` (file 04); ngày lưu trú qua tiện ích `StayDate`.
- Thứ tự ngày, dấu phân cách hàng nghìn, vị trí ký hiệu tiền theo ngôn ngữ đang chọn.
- Tuần bắt đầu từ thứ Hai (VI) hoặc theo vùng (EN); lịch chọn ngày nhận ngôn ngữ và ngày bắt đầu tuần.

### 1.4. Nội dung do người dùng nhập

Mô tả listing, đánh giá, tin nhắn **không dịch tự động** và hiển thị đúng ngôn ngữ người nhập. Có thể ghi nhãn ngôn ngữ nếu API cung cấp. Tên địa danh, danh mục, tiện nghi lấy từ dữ liệu có bản dịch VI/EN do backend trả theo `Accept-Language`.

### 1.5. Quy trình dịch

1. Viết khoá và bản VI cùng lúc với component; thêm bản EN trong cùng PR.
2. Thông điệp mới không có đủ hai ngôn ngữ thì CI đỏ.
3. Dùng bản tiếng Anh làm tham chiếu cho khoá; không dùng văn bản làm khoá.

---

## 2. SEO

Chỉ áp dụng cho `web`. `backoffice` đặt `noindex` toàn bộ.

### 2.1. Chiến lược render theo trang

| Trang | Render | Lập chỉ mục |
|---|---|---|
| Trang chủ, kết quả tìm kiếm, chi tiết listing, hồ sơ Host, chính sách huỷ, trang tĩnh | Server (dữ liệu có ngay trong HTML) | Có |
| Đăng nhập, đăng ký | Server | `noindex` |
| Mọi trang riêng tư (tài khoản, Guest, Host) | Tuỳ | `noindex`, không nằm trong sitemap |
| Kết quả tìm kiếm với nhiều bộ lọc | Server | Chỉ cho phép lập chỉ mục tổ hợp chính (điểm đến); tổ hợp còn lại `noindex` hoặc `canonical` về trang gốc |

### 2.2. Metadata

- Mỗi trang xuất `generateMetadata`: tiêu đề, mô tả, `canonical`, Open Graph, Twitter card.
- Hai ngôn ngữ có **hreflang** qua lại và `x-default`.
- Tiêu đề và mô tả theo ngôn ngữ trang; trang listing lấy từ nội dung listing.
- Ảnh chia sẻ (OG) lấy từ ảnh bìa của listing.

### 2.3. Sitemap, robots và dữ liệu có cấu trúc

| Hạng mục | Quy định |
|---|---|
| `sitemap.ts` | Gồm trang chủ, trang tĩnh, listing đang hiển thị, hồ sơ Host công khai, theo cả hai ngôn ngữ; không gồm trang riêng tư |
| `robots.ts` | Cho phép trang công khai; chặn `/api`, đường dẫn riêng tư; local thì chặn toàn bộ |
| JSON-LD | Listing: loại chỗ ở với địa chỉ xấp xỉ, ảnh, tiện nghi, điểm đánh giá tổng hợp; **không** đưa địa chỉ chính xác hay thông tin liên hệ; thoát ký tự `<` khi nhúng (file 06) |
| URL | Đường dẫn ổn định; slug mô tả là tuỳ chọn, định danh luôn có trong URL; chuyển hướng 301 khi slug đổi |
| Trang 404 | Trả đúng mã 404 (`notFound()`); listing đã gỡ trả 404 hoặc 410 |

---

## 3. Hiệu năng

### 3.1. Ngân sách tham khảo

Đo trên dữ liệu seed, ở chế độ production build, giả lập điện thoại tầm trung và mạng 4G.

| Chỉ số | Mục tiêu |
|---|---|
| LCP (trang chủ, tìm kiếm, chi tiết listing) | ≤ 2,5 giây |
| INP | ≤ 200 ms |
| CLS | ≤ 0,1 |
| JS tải ban đầu (nén) của trang công khai | ≤ 200 KB, không tính bản đồ |
| Điểm Lighthouse (hiệu năng, truy cập, thực hành tốt, SEO) | ≥ 90 ở các trang công khai chính |

Vượt ngân sách thì phải có lý do ghi trong PR hoặc được sửa trước khi merge slice đó.

### 3.2. Kỹ thuật bắt buộc

| Chủ đề | Quy tắc |
|---|---|
| Server Component | Nội dung tĩnh và dữ liệu công khai vẽ ở server; Client Component nhỏ và nằm sâu |
| Tải động | Bản đồ Mapbox, lightbox/gallery đầy đủ, biểu đồ, thư viện kéo thả, trình chọn ngày nặng: tải khi cần bằng `next/dynamic` (bọc trong Client Component nếu cần `ssr: false`) |
| Bản đồ | Chỉ khởi tạo khi vào khung nhìn hoặc người dùng bấm; không tải trên trang không cần |
| Ảnh | `next/image`, `sizes` đúng, định dạng hiện đại do trình tối ưu ảnh chọn, tải lười dưới màn hình đầu, `priority` cho ảnh LCP |
| Phông | `next/font`, `display: swap`, chỉ nạp tập ký tự cần (`latin`, `vietnamese`), giới hạn số độ đậm |
| Layout shift | Mọi ảnh, bản đồ, quảng cáo nội dung có kích thước hoặc tỉ lệ khung; skeleton khớp kích thước |
| Liên kết | Prefetch mặc định cho liên kết thường dùng; tắt prefetch cho danh sách rất dài |
| Danh sách dài | Phân trang cursor; ảo hoá chỉ khi thật sự cần (ví dụ hội thoại rất dài) |
| Thư viện | Nhập từng phần (biểu tượng, date-fns); theo dõi kích thước bằng bundle analyzer |
| Mạng | Gộp các lời gọi độc lập chạy song song ở server (`Promise.all`); tránh thác nước (waterfall) |
| Hiển thị trước | Dữ liệu cần ngay lần đầu được lấy ở server rồi truyền xuống/hydrate, không để client gọi lại |

### 3.3. Đo lường

- Lighthouse CI hoặc đo thủ công theo mốc demo (M1 đến M6 trong kế hoạch slice) và ghi kết quả vào `docs/perf`.
- `web-vitals` ghi ở môi trường dev để thấy sớm hồi quy.
- Bundle analyzer chạy khi thêm thư viện lớn (file 04, mục 12).

---

## 4. Truy cập (accessibility)

Chuẩn mục tiêu: **WCAG 2.2 mức AA**.

### 4.1. Quy tắc

| Chủ đề | Yêu cầu |
|---|---|
| Bàn phím | Mọi chức năng dùng được chỉ bằng bàn phím; thứ tự Tab hợp lý; không bẫy focus (trừ hộp thoại có quản lý focus) |
| Focus | Vòng focus luôn nhìn thấy, tương phản đủ; focus không bị che bởi thanh cố định (header dính, thanh đặt phòng dưới đáy) |
| Hộp thoại, ngăn kéo, menu | Dùng Radix: bẫy focus, đóng bằng Esc, trả focus về nút mở |
| Cấu trúc | Một `h1` mỗi trang, thứ bậc tiêu đề không nhảy cấp, vùng chính (`main`), điều hướng (`nav`), có liên kết «Bỏ qua tới nội dung» |
| Nhãn | Mọi ô nhập có nhãn; nút chỉ có biểu tượng có nhãn truy cập; liên kết có chữ mô tả rõ (không «bấm vào đây») |
| Lỗi form | Gắn `aria-describedby` và `aria-invalid`; sau khi gửi lỗi, đưa focus tới ô lỗi đầu tiên hoặc tóm tắt lỗi |
| Màu | Tương phản chữ ≥ 4.5:1 (chữ lớn và thành phần giao diện ≥ 3:1); không dùng riêng màu để truyền đạt trạng thái |
| Cỡ chữ, thu phóng | Giao diện dùng được khi phóng 200 phần trăm và khi người dùng tăng cỡ chữ; không khoá thu phóng |
| Chuyển động | Tôn trọng `prefers-reduced-motion`; không có nội dung nhấp nháy |
| Vùng chạm | ≥ 44 × 44 px trên điện thoại (WCAG 2.2 yêu cầu tối thiểu 24 × 24 px, mục tiêu của dự án cao hơn) |
| Thông báo động | `aria-live="polite"` cho toast và trạng thái; đếm ngược chỉ thông báo ở các mốc |
| Ảnh | `alt` có nghĩa cho ảnh nội dung; `alt=""` cho ảnh trang trí |
| Ngôn ngữ trang | Thuộc tính `lang` của `<html>` theo ngôn ngữ đang chọn; đoạn khác ngôn ngữ có `lang` riêng |
| Kéo thả | Mọi thao tác kéo thả (sắp xếp ảnh) có cách thay thế bằng nút «Lên/Xuống» và bàn phím |

### 4.2. Thành phần cần chú ý riêng

| Thành phần | Điểm cần lo |
|---|---|
| Lịch chọn khoảng ngày | Điều hướng bằng phím mũi tên, đọc được ngày bị chặn và lý do, thông báo khoảng đã chọn |
| Bản đồ | Luôn có **chế độ danh sách tương đương**; marker có thể tới được bằng bàn phím hoặc có danh sách thay thế |
| Carousel ảnh | Nút trước/sau có nhãn; không tự chạy; có thể bỏ qua |
| Gallery toàn màn hình | Bẫy focus, Esc để đóng, mũi tên để chuyển |
| Bảng dữ liệu (back-office) | Dùng phần tử bảng thật, tiêu đề cột có `scope`, có thể sắp xếp bằng bàn phím |
| Biểu đồ | Có bảng số liệu tương đương hoặc mô tả văn bản |
| Chat | Tin nhắn mới thông báo qua vùng `aria-live`, không giành focus |

### 4.3. Kiểm tra

- **Tự động:** Biome với quy tắc a11y trong lint; `axe` trong Playwright cho các trang chính (không có lỗi mức nghiêm trọng).
- **Thủ công theo slice:** duyệt bằng bàn phím; kiểm tra với trình đọc màn hình ở luồng chính (đặt phòng, tạo listing); phóng 200 phần trăm; chế độ giảm chuyển động.
- Mỗi PR có mục «Truy cập» trong checklist (file 09).

---

## 5. Hỗ trợ trình duyệt và thiết bị

| Hạng mục | Quy định |
|---|---|
| Trình duyệt | Hai phiên bản mới nhất của Chrome, Edge, Firefox, Safari; Safari iOS và Chrome Android từ các phiên bản gần đây |
| Không hỗ trợ | Internet Explorer và các trình duyệt cũ không có tính năng CSS/JS hiện đại |
| Tính năng nâng cao | Dùng khi có hỗ trợ rộng; nếu không thì có phương án dự phòng (ví dụ bản đồ có chế độ danh sách) |
| Thiết bị | Điện thoại 360 px trở lên, máy tính bảng, máy tính; ưu tiên điện thoại cho `web` |
| Mạng chậm | Giao diện vẫn dùng được: skeleton, không chặn bởi tài nguyên nặng, thông báo khi mất kết nối |
