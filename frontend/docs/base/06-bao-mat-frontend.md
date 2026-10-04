# Bảo mật frontend

Dự án chạy local và dùng dữ liệu giả, nhưng mọi cấu hình dưới đây viết theo hướng **có thể đưa lên thật mà không phải làm lại**. Chỗ nào chỉ bật ở môi trường thật được ghi rõ ở mục 14.

---

## 1. Nguyên tắc

1. **Frontend không phải ranh giới bảo mật.** Người dùng kiểm soát trình duyệt của họ; mọi kiểm tra quyền, xác thực dữ liệu, giới hạn tốc độ đều do backend cưỡng chế. Phần việc của frontend là **không tạo thêm lỗ hổng** và **không làm lộ dữ liệu**.
2. **Phòng thủ nhiều lớp.** Không dựa vào một biện pháp đơn lẻ (ví dụ chỉ dựa vào React tự thoát ký tự để chống XSS).
3. **Giảm bề mặt tấn công.** Ít thư viện, ít script bên thứ ba, ít dữ liệu nhạy cảm trên trình duyệt.
4. **Mặc định an toàn.** Cấu hình mới bắt đầu từ trạng thái chặt nhất rồi mở dần có lý do.
5. **Dữ liệu cá nhân chỉ tồn tại ở nơi cần thiết, trong thời gian cần thiết.**

---

## 2. Mô hình mối đe doạ rút gọn

| Mối đe doạ | Biện pháp phía frontend | Phối hợp với backend |
|---|---|---|
| XSS (mã độc trong mô tả listing, tin nhắn, đánh giá, tên) | Không dùng `dangerouslySetInnerHTML`; hiển thị nội dung người dùng dưới dạng văn bản; CSP; kiểm tra URL | Làm sạch/giới hạn đầu vào, che thông tin liên hệ |
| CSRF | Cookie `SameSite=Lax`, header CSRF cho mọi thao tác ghi, không đổi trạng thái bằng GET | Kiểm tra token CSRF và `Origin` |
| Đánh cắp phiên | Phiên chỉ nằm trong cookie HttpOnly, không có token trong JS | Xoay phiên khi đăng nhập, hạn phiên, vô hiệu hoá khi đăng xuất |
| Clickjacking | `frame-ancestors 'none'`, `X-Frame-Options: DENY` | |
| Chuyển hướng mở (open redirect) | Chỉ cho phép `returnTo` là đường dẫn tương đối nội bộ | Cùng quy tắc cho URL quay về từ cổng thanh toán |
| Lộ dữ liệu cá nhân và giấy tờ | `no-store`, URL ký ngắn hạn, không lưu ở trình duyệt, không đưa vào log và URL | Phân quyền, ghi nhật ký truy cập |
| IDOR (truy cập tài nguyên người khác) | Chỉ là trải nghiệm: xử lý 403/404 gọn gàng | **Cưỡng chế sở hữu ở mọi endpoint** |
| Lạm dụng upload | Kiểm tra sớm loại và kích thước, URL ký có hạn | Kiểm tra lại nội dung, loại thật, kích thước |
| Chuỗi cung ứng (thư viện độc hại) | Cổng thêm thư viện, lockfile, audit, chặn script cài đặt | |
| Rò rỉ bí mật | Chỉ biến `NEXT_PUBLIC_` công khai, quét bí mật trong commit | Không đưa khoá vào frontend |
| SSRF qua Next.js | Rewrite có đích cố định, `remotePatterns` hẹp | Chặn địa chỉ nội bộ khi tải iCal |
| Liệt kê tài khoản | Thông báo đăng nhập, quên mật khẩu giống nhau dù email có tồn tại hay không | Phản hồi đồng nhất, giới hạn tốc độ |

---

## 3. Phiên và xác thực

| Quy tắc | Chi tiết |
|---|---|
| Phiên là cookie **HttpOnly** | Backend đặt cookie; JavaScript không đọc được. `Secure` ở môi trường thật; `SameSite=Lax` |
| Không token trong JavaScript | Cấm lưu token, mã phiên ở `localStorage`, `sessionStorage`, IndexedDB hoặc biến toàn cục |
| Cùng origin | Mọi lời gọi từ trình duyệt đi qua `/api` (rewrite của Next.js); không gọi chéo origin; không mở CORS rộng |
| Hai ứng dụng, hai tên miền | `app.localhost` và `admin.localhost` để cookie tách nhau; tài khoản Guest không dùng được ở back-office và ngược lại (backend cưỡng chế) |
| Đăng nhập và đăng xuất từ trình duyệt | Server Component không ghi được cookie (file 05). Sau đăng xuất xoá toàn bộ cache TanStack Query và chuyển hướng |
| Hết phiên | Khi gặp 401: chuyển về đăng nhập với `returnTo`; giữ bản nháp form nếu có thể (trong bộ nhớ, không trong `localStorage`) |
| Không có «ghi nhớ đăng nhập» ở frontend | Nếu cần thì do backend quyết định thời hạn phiên |
| Thông báo đăng nhập chung | «Email hoặc mật khẩu không đúng»; quên mật khẩu luôn trả «nếu email tồn tại, chúng tôi đã gửi hướng dẫn» |
| Mật khẩu | Dùng thuộc tính `autocomplete` đúng (`current-password`, `new-password`); không đưa mật khẩu vào URL, log, state toàn cục; quy tắc độ mạnh do backend quyết định, frontend chỉ gợi ý |

### Kiểm tra truy cập trang

- `proxy.ts` chỉ làm **kiểm tra thô**: có cookie phiên hay không để chuyển hướng sớm. Nó **không** thay cho phân quyền.
- Layout trong Next.js không chạy lại khi điều hướng phía client, nên **không** đặt kiểm tra quyền duy nhất ở layout. Mỗi trang (hoặc phần dữ liệu của trang) tự yêu cầu dữ liệu qua API; nếu API trả 401/403/404 thì hiển thị tương ứng.
- Menu và nút ẩn theo danh sách quyền từ API là **trải nghiệm**, không phải bảo vệ.

---

## 4. CSRF

- Backend phát cookie `XSRF-TOKEN` (đọc được bởi JS) và kiểm tra header `X-XSRF-TOKEN` ở mọi phương thức khác GET/HEAD/OPTIONS. Client trình duyệt (file 05) tự thêm header.
- GET không bao giờ đổi trạng thái; mọi thao tác đổi trạng thái dùng POST/PUT/PATCH/DELETE.
- **Chính sách:** thao tác nghiệp vụ không dùng Server Actions mà gọi thẳng API của backend, để một nơi duy nhất kiểm tra, ghi nhật ký và áp dụng idempotency. Nếu về sau dùng Server Actions, phải cấu hình danh sách origin cho phép và không dùng cho thao tác tiền.

---

## 5. XSS và nội dung người dùng

Bắt buộc:
- Cấm `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write` (lint chặn). Ngoại lệ duy nhất là JSON-LD cho SEO, và phải qua hàm tiện ích thoát ký tự `<`.
- Mô tả listing, tin nhắn, đánh giá, tên, bằng chứng khiếu nại đều hiển thị **dạng văn bản thuần**. Xuống dòng bằng CSS `white-space: pre-wrap`. Không hỗ trợ HTML hay Markdown. Nếu sau này cần văn bản giàu định dạng, dùng bộ làm sạch (ví dụ DOMPurify) và ghi ADR.
- Mọi `href`, `src` lấy từ dữ liệu phải qua hàm kiểm tra giao thức (chỉ `http`, `https`, `mailto`, `tel`); chặn `javascript:` và `data:`.
- Liên kết mở tab mới có `rel="noopener noreferrer"`.
- Thông tin liên hệ trong tin nhắn trước khi xác nhận booking được **backend che**; frontend hiển thị nguyên giá trị trả về, không tự khôi phục.
- Không nhúng script hoặc iframe bên thứ ba (quảng cáo, theo dõi) trừ khi có ADR; hiện không có.

---

## 6. Content Security Policy (CSP)

Chính sách khởi điểm (chặt, mở dần theo nhu cầu):

| Chỉ thị | Giá trị gợi ý | Lý do |
|---|---|---|
| `default-src` | `'self'` | Nền chặn |
| `script-src` | `'self'` + nonce theo từng yêu cầu | Nonce được tạo ở `proxy.ts`; trang phải render động để nhận nonce |
| `style-src` | `'self'` + nonce; có thể cần nới cho style nội tuyến do Radix/Mapbox, nới ở mức thấp nhất | |
| `img-src` | `'self' data: blob:` + máy chủ ảnh công khai (MinIO) + `https://api.mapbox.com` + `https://*.tiles.mapbox.com` | Ảnh listing và ô bản đồ |
| `connect-src` | `'self'` + MinIO (upload) + `https://api.mapbox.com` + `https://*.tiles.mapbox.com` + `https://events.mapbox.com` | Gọi API, upload, bản đồ |
| `worker-src` | `'self' blob:` | Mapbox GL dùng web worker |
| `child-src` | `blob:` | Mapbox GL |
| `font-src` | `'self'` | Phông tải qua `next/font` nên là self-hosted |
| `frame-ancestors` | `'none'` | Chống clickjacking |
| `base-uri` | `'self'` | |
| `object-src` | `'none'` | |
| `form-action` | `'self'` + máy chủ cổng thanh toán nếu chuyển hướng bằng form POST | |
| `upgrade-insecure-requests` | Chỉ ở môi trường thật | |

Cách vận hành:
- Biến `CSP_MODE` quyết định `Content-Security-Policy-Report-Only` (khi dev) hay `Content-Security-Policy` (enforce). **Playwright chạy ở chế độ enforce** và thất bại nếu có vi phạm ở các luồng chính (bản đồ, upload, thanh toán).
- Mỗi lần thêm nguồn ngoài phải sửa chính sách và ghi lý do trong PR.
- Nonce làm trang không còn tĩnh hoàn toàn; đây là đánh đổi chấp nhận được cho dự án này.

---

## 7. Header bảo mật

Đặt trong `headers()` của `next.config.ts` (hoặc `proxy.ts`), áp cho mọi đường dẫn:

| Header | Giá trị |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` (trang có token hoặc định danh nhạy cảm dùng `no-referrer`) |
| `Permissions-Policy` | Tắt tính năng không dùng: `camera=(), microphone=(), payment=()`; `geolocation` chỉ cho chính origin nếu có «gần tôi» |
| `X-Frame-Options` | `DENY` (kèm `frame-ancestors`) |
| `Strict-Transport-Security` | Chỉ ở môi trường thật (HTTPS) |
| `Cross-Origin-Opener-Policy` | `same-origin` (kiểm tra bản đồ và luồng thanh toán vẫn chạy) |
| `Cache-Control` | `no-store` cho nhóm route riêng tư: `(account)`, `(guest)`, `(host)` và toàn bộ back-office |

Ngoài ra: tắt `X-Powered-By` (`poweredByHeader: false`), không phát hành source map công khai ở môi trường thật.

---

## 8. Dữ liệu nhạy cảm

Danh mục: giấy tờ danh tính, thông tin thanh toán, địa chỉ chính xác (trước khi xác nhận), tin nhắn, thông tin khai báo lưu trú, số điện thoại, email.

| Quy tắc | Chi tiết |
|---|---|
| Không lưu ở trình duyệt | Cấm `localStorage`, `sessionStorage`, IndexedDB, cookie JS cho dữ liệu cá nhân; không dùng service worker lưu dữ liệu riêng tư |
| Không đưa vào URL | Chỉ dùng định danh; không email, số điện thoại, tên trong query |
| Không đưa vào log và công cụ báo lỗi | Gồm console, analytics, Sentry (nếu có): lọc trước khi gửi |
| Trang riêng tư `no-store` | Sau khi đăng xuất, bấm «Quay lại» không được hiện lại nội dung nhạy cảm |
| Giấy tờ danh tính | Chỉ hiển thị khi người có quyền chủ động bấm «Xem» (để việc xem được ghi nhật ký có chủ đích), qua **URL ký ngắn hạn** do API cấp theo từng lần xem; thẻ ảnh dùng `referrerPolicy="no-referrer"`; không có nút tải xuống nếu nghiệp vụ không cần; không tải tự động hàng loạt |
| Dữ liệu trong bộ nhớ | Xoá cache TanStack Query khi đăng xuất và khi đổi tài khoản |
| Hiển thị che | Số thẻ, giấy tờ chỉ hiện phần cuối do backend trả; frontend không tự che bằng CSS rồi vẫn giữ dữ liệu đầy đủ trong DOM |
| Tự điền | Dùng `autocomplete` đúng; ô nhạy cảm không cần tự điền có thể tắt |

---

## 9. Chuyển hướng và điều hướng an toàn

Hàm `safeReturnTo(value)` ở `packages/shared`: chỉ chấp nhận chuỗi bắt đầu bằng đúng một dấu `/`, không có `//` hoặc `\` ở đầu, không có giao thức, sau khi giải mã (một lần) vẫn thoả; còn lại thì trả về trang mặc định. Dùng cho `returnTo` sau đăng nhập và mọi chuyển hướng dựa vào tham số.

Địa chỉ chuyển sang cổng thanh toán **chỉ lấy từ phản hồi của backend** và được so với danh sách origin cho phép trước khi chuyển; không dựng từ tham số URL.

---

## 10. Thanh toán

- Ứng dụng **không có ô nhập thẻ** và không chạm vào dữ liệu thẻ; chuyển sang trang của cổng (ở local là cổng giả).
- Số tiền, phí, thuế do backend tính; frontend không gửi số tiền lên để quyết định mức thu.
- Trang kết quả **không tin tham số trên URL** do cổng trả về (ví dụ `status=success`); luôn hỏi backend trạng thái thanh toán (polling ở file 05).
- Cổng giả dùng tên miền riêng nằm trong danh sách cho phép; danh sách này khác ở môi trường thật.
- Không ghi URL thanh toán (có thể chứa mã giao dịch) vào log.
- Dùng `Idempotency-Key` (file 05) để tránh thu tiền hai lần khi bấm lại.

---

## 11. Tải file lên

- Kiểm tra sớm loại tệp (danh sách cho phép, không dựa vào phần mở rộng), kích thước và số lượng; backend kiểm tra lại nội dung thật.
- Chỉ cho ảnh định dạng thông dụng; **không nhận SVG** từ người dùng.
- Upload thẳng lên MinIO bằng URL ký có hạn; bucket được cấu hình CORS chỉ cho origin của hai ứng dụng.
- Hiển thị tên tệp dưới dạng văn bản (không chèn vào HTML).
- Giải phóng URL tạm của trình duyệt sau khi xem trước.

---

## 12. Biến môi trường và bí mật

- `NEXT_PUBLIC_*` đi vào mã gửi tới trình duyệt: chỉ đặt giá trị **công khai**.
- Mapbox: dùng token công khai (`pk.`), **giới hạn theo URL** và phạm vi tối thiểu; không dùng token bí mật (`sk.`) trong frontend.
- `.env.local` không đưa vào git; chỉ commit `.env.example` không có giá trị thật.
- Quét bí mật trong commit và CI (ví dụ gitleaks).
- Không in biến môi trường ra log hoặc trang lỗi.

---

## 13. Chuỗi cung ứng và Next.js

### 13.1. Phụ thuộc

| Biện pháp | Chi tiết |
|---|---|
| Lockfile | Commit `pnpm-lock.yaml`; CI cài với lockfile cố định |
| Kiểm tra lỗ hổng | `pnpm audit` trong CI; lỗ hổng mức cao chặn merge |
| Chặn script cài đặt | Dùng cơ chế của pnpm để chỉ cho phép script cài đặt của gói được liệt kê (`onlyBuiltDependencies`); các gói còn lại bị chặn |
| Cổng thêm thư viện | Quy trình ở file 04, mục 12; để ý tên gói giống nhau (typosquatting) |
| Cập nhật có kiểm soát | Dependabot hoặc Renovate tạo PR; xem changelog trước khi merge; vá bảo mật của Next.js, React và thư viện nền trong vòng một tuần |
| CI | Ghim phiên bản action (theo mã băm commit); không dùng `curl | sh` trong script cài đặt |

### 13.2. Cấu hình Next.js

- Rewrite chỉ có **đích cố định** (`BACKEND_URL`), không bao giờ ghép đích từ dữ liệu người dùng.
- `images.remotePatterns` hẹp: chỉ bucket ảnh công khai; không cho bucket giấy tờ; không bật `dangerouslyAllowSVG`.
- Trang lỗi không hiển thị stack trace hay chi tiết nội bộ; chỉ mã tham chiếu.
- Route Handler (nếu có) chỉ cho `GET /health` và các nhu cầu thật sự; không làm proxy tự do.
- Build và chạy production với `NODE_ENV=production`.

---

## 14. Khác biệt giữa local và môi trường thật

| Biện pháp | Local | Môi trường thật |
|---|---|---|
| Cookie `Secure` | Tắt (HTTP) | Bật |
| HSTS, `upgrade-insecure-requests` | Tắt | Bật |
| CSP | `report-only` khi dev; **enforce trong E2E** | Enforce |
| Source map công khai | Bật khi dev | Tắt |
| Token Mapbox giới hạn URL | Giới hạn cho `*.localhost` | Giới hạn cho tên miền thật |
| Danh sách origin cổng thanh toán | Cổng giả | Cổng thật |
| Dữ liệu | Hoàn toàn giả; không dùng giấy tờ thật | Dữ liệu thật |
| MFA nhân sự | Chưa có | Bật (do backend) |

Mọi khác biệt do **biến cấu hình**, không do sửa mã.

---

## 15. Kiểm thử bảo mật tối thiểu (tự động)

Các kiểm tra chạy trong CI (Vitest hoặc Playwright):

- [ ] Thao tác ghi thiếu token CSRF bị backend từ chối; client luôn gắn token.
- [ ] Nội dung chứa `<script>` hoặc `onerror=` trong mô tả listing, tin nhắn, đánh giá, tên hiển thị dạng văn bản, không chạy.
- [ ] `safeReturnTo` từ chối `//evil.com`, `https://evil.com`, `/\evil.com`, `javascript:` và các biến thể mã hoá.
- [ ] Không có vi phạm CSP ở luồng bản đồ, upload ảnh, thanh toán.
- [ ] Đăng nhập ở `app.localhost` không tạo phiên ở `admin.localhost` và ngược lại.
- [ ] Trang riêng tư có `Cache-Control: no-store`; sau đăng xuất, quay lại không hiện dữ liệu cũ.
- [ ] Không có token hay dữ liệu cá nhân trong `localStorage`/`sessionStorage` sau một phiên sử dụng điển hình.
- [ ] Phản hồi đăng nhập sai và quên mật khẩu không phân biệt email có tồn tại.
- [ ] Lint chặn `dangerouslySetInnerHTML`, `eval`, `any`.

---

## 16. Danh sách kiểm tra bảo mật cho PR

- [ ] Có nội dung do người dùng được hiển thị? Có đang hiển thị dạng văn bản?
- [ ] Có `href`/`src` lấy từ dữ liệu? Có qua kiểm tra giao thức?
- [ ] Có dữ liệu nhạy cảm trong URL, log, `localStorage`, hay cache dùng chung?
- [ ] Trang riêng tư mới có `no-store` chưa?
- [ ] Có thêm nguồn ngoài (script, ảnh, kết nối)? Đã sửa CSP và ghi lý do?
- [ ] Có thêm thư viện? Đã qua cổng thêm thư viện và `pnpm audit`?
- [ ] Có chuyển hướng dựa vào tham số? Đã dùng `safeReturnTo`?
- [ ] Thao tác ghi tiền/đặt phòng có `Idempotency-Key`?
- [ ] Có kiểm tra quyền chỉ ở giao diện? Backend có cưỡng chế chưa?
