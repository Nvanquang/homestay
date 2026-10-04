# Nguyên tắc xây dựng frontend

Quy tắc viết code áp dụng cho mọi màn hình. «Bắt buộc» là quy tắc có kiểm tra tự động hoặc bị từ chối ở review; «Nên» là mặc định, có thể bỏ khi có lý do ghi trong PR.

---

## 1. Nguyên tắc nền

| # | Nguyên tắc | Hệ quả thực tế |
|---|---|---|
| 1 | Backend là nguồn sự thật nghiệp vụ | Frontend không tính giá, phí, thuế, hoàn tiền, điều kiện huỷ, quyền. Chỉ hiển thị giá trị API trả về. Phần xem trước giá ở form Host cũng gọi API |
| 2 | Server-first | Mặc định Server Component; Client Component chỉ khi cần tương tác hoặc API trình duyệt |
| 3 | Route mỏng, feature dày | `app/` chỉ ghép; logic ở `features/` |
| 4 | Phụ thuộc một chiều | Theo quy tắc ở file 03, có kiểm tra tự động |
| 5 | Kiểu dữ liệu suốt tuyến | Kiểu API sinh từ OpenAPI; không tự viết lại tay |
| 6 | Mọi trạng thái đều có thiết kế | Đang tải, rỗng, lỗi, không có quyền, thành công, ngoại tuyến |
| 7 | Truy cập, đa ngôn ngữ, điện thoại là mặc định | Không «làm sau». Tóm tắt bắt buộc: dùng bàn phím được mọi chức năng, có chỉ báo focus, nhãn đầy đủ, tương phản đạt AA, không truyền đạt thông tin chỉ bằng màu. Chi tiết ở file 08 |
| 8 | Đơn giản trước, tối ưu có bằng chứng | Chưa đo thì chưa tối ưu; chưa lặp lại 3 lần thì chưa trừu tượng hoá |
| 9 | Kỷ luật phụ thuộc | Mỗi thư viện mới qua cổng ở mục 12 |
| 10 | Tự động hoá chất lượng | Máy kiểm tra thay con người ở mọi thứ kiểm tra được |

---

## 2. TypeScript

Bắt buộc:
- Chế độ strict (cấu hình ở file 02). Không `any`; không ép kiểu `as` để lấp lỗi kiểu (chỉ `as const` và các trường hợp có chú thích lý do).
- Không dùng dấu `!` (non-null assertion) trừ khi ngay trước đó có bước kiểm tra mà trình biên dịch không hiểu; kèm chú thích.
- Dữ liệu từ ngoài vào (API, URL, `localStorage`, form) là `unknown` cho tới khi được kiểm tra bằng schema Zod hoặc kiểu sinh từ OpenAPI.
- Hàm công khai của feature và gói có kiểu trả về tường minh.

Nên:
- Dùng union có phân biệt (`status: "loading" | "error" | "success"`) thay cho nhiều boolean.
- Dùng `satisfies` cho đối tượng cấu hình; `readonly` cho dữ liệu hằng.
- Kiểu có tên (`BookingStatus`) cho trạng thái nghiệp vụ, lấy từ kiểu sinh sẵn; không viết lại chuỗi literal rải rác.
- Kiểm tra đầy đủ nhánh (`switch` kèm hàm `assertNever`) cho trạng thái booking, thanh toán, khiếu nại.

---

## 3. React

Bắt buộc:
- Hook theo quy tắc của React; quy tắc lint kiểm tra phụ thuộc phải bật và không bị tắt bằng comment trừ khi có lý do.
- Mỗi phần tử trong danh sách có `key` ổn định, không dùng chỉ số mảng khi danh sách có thể đổi thứ tự.
- Không gọi API trong `useEffect`; dùng TanStack Query (client) hoặc lấy dữ liệu trong Server Component.
- Không đồng bộ state từ props bằng `useEffect`; suy ra giá trị trong lúc render hoặc dùng `key` để reset.
- Không đặt component định nghĩa **bên trong** component khác.

Nên:
- Ưu tiên **composition**: nhận `children` và slot thay vì nhiều prop cờ (`showX`, `hideY`).
- Tách component khi có hai lý do thay đổi khác nhau hoặc quá khoảng 150 dòng.
- Trạng thái đặt thấp nhất có thể; chỉ nâng lên khi hai nhánh cùng cần.
- Trạng thái chuyển tiếp dùng `useTransition`/`useOptimistic` khi phù hợp; không tự viết cờ `isLoading` thủ công cho thứ có sẵn.
- Không viết `useMemo`/`useCallback` theo phản xạ; chỉ khi đo thấy cần hoặc khi cần giữ tham chiếu ổn định cho thư viện. (Nếu bật React Compiler thì gần như không cần.)
- Truyền `ref` như prop thường (React 19), không cần `forwardRef` cho component mới.

### Khi nào dùng Client Component

Dùng khi: có sự kiện người dùng, `useState`/`useEffect`, API của trình duyệt (`window`, `IntersectionObserver`), thư viện phụ thuộc trình duyệt (bản đồ, kéo thả), TanStack Query, React Hook Form. Ngược lại giữ ở server.

---

## 4. Thiết kế component

| Quy tắc | Chi tiết |
|---|---|
| API prop nhỏ và có nghĩa | Tối đa khoảng 7 prop; nhiều hơn thì xem lại cách chia |
| Biến thể bằng `cva` | `variant`, `size` là union có tên; không truyền chuỗi class từ ngoài để đổi kiểu |
| Cho phép mở rộng | Nhận `className` và các thuộc tính HTML chuẩn; hợp nhất bằng `cn()` |
| `asChild` khi cần đổi phần tử gốc | Mẫu của Radix, ví dụ nút hoạt động như liên kết |
| Không chứa chuỗi hiển thị viết cứng | Mọi chữ qua i18n; component dùng chung nhận chữ qua prop hoặc dùng namespace chung |
| Truy cập là một phần của API | Nhãn, vai trò, trạng thái aria do component bảo đảm, không để người dùng component tự nhớ |
| Có đủ trạng thái | Mặc định, hover, focus, active, disabled, lỗi, đang tải |
| Không phụ thuộc nghiệp vụ nếu ở `packages/ui` | Tên prop không chứa booking, listing, host |

---

## 5. Styling

Bắt buộc:
- Chỉ dùng class Tailwind và token của dự án. Không viết màu, cỡ chữ, bo góc, bóng bằng giá trị cứng; không dùng `style={{}}` trừ giá trị thật sự động (vị trí, kích thước tính toán).
- Không dùng giá trị tuỳ ý `[...]` rải rác; cần giá trị mới lặp lại thì thêm vào token.
- Hợp nhất class bằng `cn()`; không nối chuỗi thủ công.

Nên:
- **Mobile-first:** viết kiểu cho màn nhỏ trước, thêm `sm:`, `md:`, `lg:` cho màn lớn.
- Dùng `gap`, `grid`, `flex` thay cho margin lẻ; khoảng cách theo thang 4 px.
- Trạng thái dựa vào thuộc tính (`data-[state=open]:`, `aria-*`) thay vì thêm class bằng JS.
- Hỗ trợ `prefers-reduced-motion`; không bắt buộc người dùng xem hiệu ứng.
- Hình ảnh luôn có kích thước hoặc tỉ lệ khung để tránh layout shift.

---

## 6. Form

Bắt buộc:
- React Hook Form + Zod; mỗi form (hoặc mỗi bước của form nhiều bước) một schema.
- Schema ở frontend là **kiểm tra nhanh để phản hồi người dùng**, backend vẫn kiểm tra lại. Lỗi do backend trả (theo field) được ánh xạ vào đúng ô nhập.
- Mỗi ô nhập có nhãn gắn với `htmlFor`/`id`; lỗi gắn bằng `aria-describedby`; trạng thái lỗi có `aria-invalid`.
- Nút gửi bị vô hiệu hoá và hiện trạng thái đang xử lý trong lúc gửi; ngăn gửi hai lần.
- Thao tác tiền, đặt phòng, thanh toán, huỷ, hoàn tiền dùng `Idempotency-Key` (file 05).

Nên:
- Hiển thị lỗi sau khi người dùng rời ô hoặc gửi, không hiển thị ngay khi gõ.
- Form dài nhiều bước: mỗi bước một đường dẫn, lưu nháp tự động (debounce), cho phép quay lại.
- Giữ giá trị đã nhập khi lỗi; không bao giờ xoá dữ liệu người dùng vì lỗi mạng.
- Hỏi xác nhận khi rời trang có thay đổi chưa lưu.

---

## 7. Tiền

Bắt buộc:
- Kiểu `Money = { amount: integer (đơn vị nhỏ nhất), currency: ISO 4217 }`. Không dùng số thực cho tiền.
- Định dạng **chỉ** qua `formatMoney(money, locale)` của `packages/shared` (dựa trên `Intl.NumberFormat`); số chữ số thập phân theo từng loại tiền (VND 0, USD 2).
- Không cộng, trừ, nhân, chia tiền ở frontend. Cần tổng thì API trả về.
- Phân biệt rõ **tiền tệ thanh toán** (tiền tệ của listing, số tiền thật bị trừ) và **tiền tệ hiển thị** (quy đổi tham khảo). Mọi giá quy đổi có nhãn «giá quy đổi, tham khảo» và số tiền phải trả luôn hiển thị bằng tiền tệ thanh toán.
- Kiểm tra giới hạn số nguyên an toàn của JavaScript khi nhận số tiền từ API; nếu vượt thì API phải trả chuỗi.

---

## 8. Ngày và giờ

Bắt buộc:
- **Ngày lưu trú** (check-in, check-out) là chuỗi `YYYY-MM-DD`, kiểu `StayDate`, **không phải thời điểm**. Không chuyển qua `new Date("2026-10-04")` rồi dùng múi giờ máy (gây lệch một ngày). Chuyển đổi qua hàm của `packages/shared/dates`.
- **Thời điểm** (hết hạn giữ chỗ, thời gian gửi tin nhắn) là chuỗi ISO 8601 UTC; hiển thị theo múi giờ phù hợp: giờ địa phương của listing cho các mốc liên quan tới lưu trú (check-in, hạn huỷ), giờ của người dùng cho mốc cá nhân.
- Mọi mốc liên quan tới lưu trú hiển thị kèm múi giờ listing khi khác múi giờ người dùng.
- Đếm ngược dựa trên thời điểm hết hạn do server trả và độ lệch giờ máy chủ (file 05, mục polling), không tin đồng hồ máy khách.

Nên: dùng date-fns v4 với `@date-fns/tz`; lịch react-day-picker làm việc với `Date` ở **ranh giới giao diện**, chuyển qua lại `StayDate` ngay ở lớp biên.

---

## 9. Xử lý lỗi và trạng thái

| Tình huống | Cách xử lý |
|---|---|
| Lỗi hiển thị cả trang | `error.tsx` theo nhóm route; có nút thử lại; không lộ mã lỗi kỹ thuật, chỉ hiển thị mã tham chiếu |
| Lỗi ở một khối | Hiển thị `ErrorState` tại khối đó, phần còn lại vẫn dùng được |
| Lỗi thao tác (mutation) | Toast hoặc thông báo cạnh nút; lỗi theo field vào ô nhập; giữ nguyên dữ liệu |
| Lỗi mạng | Thông báo «không kết nối được», cho phép thử lại; không xoá dữ liệu đang nhập |
| 401 | Chuyển về đăng nhập kèm `returnTo` an toàn; không mất bản nháp nếu có thể |
| 403 | Trang «không có quyền» rõ ràng, không chuyển hướng im lặng |
| 404 | `not-found` có đường quay về |
| 409 và lỗi nghiệp vụ (hết chỗ, giá đổi, phiên bản cũ) | Thông điệp nghiệp vụ song ngữ theo mã lỗi; đề xuất hành động (chọn ngày khác, tải lại) |
| 429 | Báo chờ, tôn trọng `Retry-After` |

Quy tắc:
- Mỗi danh sách và khối dữ liệu có đủ bốn trạng thái: **đang tải** (skeleton, không spinner toàn trang), **rỗng** (giải thích và hành động tiếp theo), **lỗi**, **có dữ liệu**.
- Không nuốt lỗi (`catch` rỗng). Lỗi không lường trước đi tới error boundary.
- Cập nhật lạc quan chỉ cho thao tác an toàn, dễ hoàn tác (yêu thích, đánh dấu đã đọc); **không** dùng cho tiền, đặt phòng, huỷ, thanh toán (file 05).

---

## 10. Ghi log và dữ liệu cá nhân

Bắt buộc:
- Không `console.log` mã nghiệp vụ còn sót (lint cảnh báo); dùng bộ ghi log mỏng của dự án, tắt ở production.
- Không ghi vào log, URL, analytics hoặc công cụ báo lỗi: email, số điện thoại, giấy tờ, địa chỉ chính xác, nội dung tin nhắn, thông tin thanh toán.
- Không đưa dữ liệu cá nhân vào query string của URL; dùng định danh.

---

## 11. Hiệu năng (quy tắc làm việc)

- Đo trước khi tối ưu (Lighthouse, Web Vitals, bundle analyzer); ngân sách ở file 08.
- Thư viện nặng chỉ chạy ở trình duyệt (bản đồ, lightbox, biểu đồ) được tải **động** khi cần.
- Không để Client Component kéo theo cả cây: giữ nội dung tĩnh ở Server Component và truyền vào làm `children`.
- Ảnh luôn qua `next/image` với `sizes` đúng; ảnh đầu trang quan trọng dùng `priority`.
- Danh sách rất dài mới ảo hoá (virtualization); ưu tiên phân trang theo cursor.

---

## 12. Cổng thêm thư viện mới

Trước khi thêm một phụ thuộc, trả lời trong PR (một vài dòng):

| Câu hỏi | Chấp nhận khi |
|---|---|
| Có cần thật sự không? | Việc đó không làm được đơn giản bằng trình duyệt, React, Next.js hoặc thư viện đã có |
| Bảo trì ra sao? | Cập nhật trong 12 tháng gần đây, nhiều người dùng, không bị bỏ rơi |
| Kích thước và tác động? | Có thể tree-shake; ghi kích thước thêm vào bundle; thư viện nặng được tải động |
| Bảo mật? | Chạy `pnpm audit`, xem số phụ thuộc kéo theo, kiểm tra script cài đặt |
| Giấy phép? | Tương thích với dự án |
| Tương thích? | Hỗ trợ React 19, Next.js 16, Tailwind v4 (nếu liên quan) |
| Có thay thế sẵn trong dự án không? | Không trùng chức năng với thư viện đã chọn |

Thư viện đã chốt nằm ở file 00. Thêm thư viện cùng chức năng với thư viện đã chốt bị từ chối trừ khi kèm ADR.

---

## 13. Danh sách kiểm tra cho người review

- [ ] Có logic nghiệp vụ (giá, quyền, điều kiện) nằm ở frontend không? Nếu có, chuyển cho backend.
- [ ] Component có đủ các trạng thái tải, rỗng, lỗi, không có quyền?
- [ ] Mọi chuỗi hiển thị đã qua i18n (VI và EN)?
- [ ] Dùng bàn phím được chưa? Có nhãn, focus, aria đúng chưa?
- [ ] Tiền và ngày đi qua tiện ích chung chưa?
- [ ] Đặt `"use client"` ở mức thấp nhất chưa? Có kéo cả cây lên client không?
- [ ] Có dữ liệu cá nhân trong log, URL, lưu trữ trình duyệt không?
- [ ] Thao tác ghi tiền/đặt phòng có `Idempotency-Key` và chống gửi đúp chưa?
- [ ] Có import vi phạm ranh giới thư mục không (CI sẽ báo)?
- [ ] Có thư viện mới không? Đã qua cổng ở mục 12 chưa?
- [ ] Có test cho logic thuần và luồng chính chưa?
