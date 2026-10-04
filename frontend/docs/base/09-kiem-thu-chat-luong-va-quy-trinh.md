# Kiểm thử, chất lượng và quy trình

Chất lượng được bảo đảm bằng máy ở mọi chỗ có thể, để người review tập trung vào thiết kế và nghiệp vụ thay vì lỗi định dạng hay kiểu.

---

## 1. Chiến lược kiểm thử

| Tầng | Công cụ | Kiểm tra gì | Chạy khi |
|---|---|---|---|
| Đơn vị | Vitest | Hàm thuần: tiền, ngày, `safeReturnTo`, ánh xạ lỗi, schema Zod, khoá truy vấn, chuyển đổi dữ liệu | Mỗi commit (file liên quan), mỗi PR (tất cả) |
| Component | Vitest + Testing Library | Hành vi của primitive và component feature: tương tác, trạng thái (đang tải, rỗng, lỗi), nhãn truy cập | Mỗi PR |
| Tích hợp phía client | Vitest + Testing Library + **MSW** | Component + TanStack Query + form với API được giả lập bằng kiểu sinh sẵn | Mỗi PR |
| Đầu cuối (E2E) | **Playwright** với backend thật trong Docker Compose | Luồng người dùng xuyên suốt, đồng thời, thanh toán, quyền, CSP | PR gắn nhãn, trước mỗi mốc demo, hằng đêm |
| Truy cập | axe qua Playwright; Biome (quy tắc a11y) | Lỗi truy cập tự phát hiện được | Mỗi PR (lint), E2E |
| Bảo mật | Vitest + Playwright (danh sách ở file 06, mục 15) | CSRF, XSS, chuyển hướng, CSP, cách ly phiên, no-store | Mỗi PR |
| Hiệu năng | Lighthouse, bundle analyzer | Ngân sách ở file 08 | Theo mốc demo |

Nguyên tắc:
- **Mỗi tiêu chí chấp nhận của slice có ít nhất một test** ở tầng thấp nhất kiểm tra được nó.
- Logic càng gần nghiệp vụ tiền và đặt phòng càng cần test kỹ; giao diện thuần trình bày chỉ cần test hành vi quan trọng.
- Không đặt mục tiêu phần trăm độ phủ; theo dõi độ phủ như một chỉ báo, không như điều kiện merge.
- Test mô tả **hành vi người dùng thấy** (truy vấn theo vai trò, nhãn), không mô tả chi tiết cài đặt.
- Không dùng snapshot cho cả cây component; chỉ cho các đầu ra nhỏ, ổn định (ví dụ định dạng tiền).

---

## 2. Kiểm thử đơn vị và component

- Đặt cạnh mã: `xxx.test.ts(x)`.
- Bộ test bắt buộc ở nền: `formatMoney` (VND, USD, làm tròn, ngôn ngữ), `StayDate` (không lệch ngày theo múi giờ máy, qua mốc 00:00 và đổi giờ), `safeReturnTo`, chuẩn hoá `ApiError`, ánh xạ lỗi theo field.
- Component dùng chung trong `packages/ui` có test cho: phím tắt và focus của hộp thoại/menu, trạng thái lỗi và vô hiệu của ô nhập, biến thể chính.
- **MSW:** mô-đun handler dùng chung kiểu sinh từ OpenAPI; test nào cũng khai báo rõ các endpoint nó cần; không để lời gọi mạng thật lọt vào test.
- Test không phụ thuộc thứ tự chạy và không phụ thuộc đồng hồ thật (dùng đồng hồ giả của Vitest cho đếm ngược và polling).

---

## 3. Kiểm thử E2E

### 3.1. Thiết lập

| Hạng mục | Quy định |
|---|---|
| Môi trường | Backend Docker Compose + hai ứng dụng chạy bản build production; địa chỉ `app.localhost` và `admin.localhost` |
| Trình duyệt | Chromium là mặc định; thêm cấu hình viewport điện thoại; WebKit chạy hằng đêm |
| Dữ liệu | Tài khoản mẫu theo vai trò từ seed; mỗi test tạo dữ liệu riêng với giá trị ngẫu nhiên (email, tên listing) để chạy song song được |
| Đăng nhập | Lưu trạng thái phiên theo vai trò (`storageState`) để không đăng nhập lại ở mọi test |
| Thời gian | Công cụ tua đồng hồ của backend (chỉ bật ở profile dev/test) để thử hết hạn giữ chỗ, payout, cửa sổ đánh giá |
| Cổng thanh toán giả | Gọi API công tắc của cổng giả để gây callback trễ, trùng, mất, thất bại |
| Email | Đọc thư qua API của Mailpit (liên kết xác minh, đặt lại mật khẩu) |
| Dọn dẹp | Script đặt lại và seed lại giữa các bộ test lớn |
| Báo cáo | Lưu trace, ảnh chụp, video khi lỗi; CI đính kèm báo cáo |

### 3.2. Kịch bản bắt buộc theo slice

| Slice | Kịch bản chính |
|---|---|
| S01 đến S03 | Đăng ký, xác minh email qua Mailpit, đăng nhập, quên mật khẩu; đăng nhập sai không lộ thông tin; phiên `app` và `admin` tách biệt; CSKH không vào được cấu hình phí |
| S04 | Host nộp hồ sơ, Admin duyệt, Host nhận email |
| S05 đến S08 | Tạo listing nhiều bước, lưu nháp, quay lại sửa, gửi duyệt, Admin duyệt, listing xuất hiện trong tìm kiếm |
| S09 | Host chặn ngày, ngày bị chặn không đặt được |
| S11 đến S12 | Lọc qua URL (mở lại URL ra đúng kết quả), không có token Mapbox vẫn dùng được danh sách, tổng giá khớp bảng giá chi tiết |
| S13 | Đổi tiền tệ hiển thị, giá quy đổi có nhãn tham khảo |
| S14 đến S17 | **Hai trình duyệt đặt cùng ngày: đúng một người giữ được**; hết hạn giữ chỗ (tua giờ); thanh toán thành công, thất bại, callback trễ, callback mất, thành công muộn; bấm thanh toán hai lần chỉ thu một lần |
| S19 | Request to Book: Host chấp nhận, từ chối, hết hạn 24 giờ |
| S21 | Nhập iCal giả làm đêm bị chặn; xung đột với booking đã có |
| S25 đến S27 | Số tiền hoàn hiển thị trước khi huỷ bằng số tiền thực hoàn ở các mốc chính sách; Host huỷ có cảnh báo phạt; đổi booking |
| S30 | Payout sau mốc check-in + 24 giờ (tua giờ) |
| S36 đến S45 | Chat che thông tin liên hệ; đánh giá công bố đồng thời; khiếu nại giữ tiền; quyết định của Admin |
| S46 đến S59 | Coupon, cấu hình có hiệu lực theo thời điểm, báo cáo khớp dữ liệu |

### 3.3. Kỷ luật

- **Không dùng `sleep` cố định;** chờ theo điều kiện (phần tử xuất hiện, phản hồi mạng).
- Test chập chờn không được bỏ qua âm thầm: gắn nhãn cách ly, mở vấn đề, sửa trong vòng một tuần.
- Mỗi lỗi nghiệp vụ nghiêm trọng đã sửa phải có test hồi quy.
- Giữ bộ E2E nhỏ và tập trung vào luồng quan trọng; chi tiết nhỏ kiểm tra ở tầng thấp hơn.

---

## 4. Cổng chất lượng tự động

### 4.1. Git hook (lefthook hoặc husky)

| Hook | Việc |
|---|---|
| `pre-commit` | Biome kiểm tra và định dạng file thay đổi; quét bí mật trên file thay đổi |
| `commit-msg` | Kiểm tra thông điệp theo Conventional Commits |
| `pre-push` | `typecheck`, kiểm tra ranh giới (dependency-cruiser), test liên quan tới thay đổi |

### 4.2. Pipeline CI

| Bước | Lệnh | Chặn merge khi |
|---|---|---|
| Cài đặt | Cài với lockfile cố định | Lockfile lệch |
| Sinh client | `gen:api` rồi so sánh | Client sinh ra khác bản đã commit |
| Kiểu | `typecheck` | Có lỗi kiểu |
| Lint và định dạng | Biome | Có lỗi |
| Ranh giới | dependency-cruiser | Vi phạm quy tắc phụ thuộc |
| Kiểm tra thông điệp | Khoá i18n VI/EN khớp nhau | Thiếu hoặc thừa khoá |
| Test | Vitest | Test đỏ |
| Build | Build cả hai ứng dụng | Build lỗi |
| Bảo mật | `pnpm audit`, quét bí mật | Lỗ hổng mức cao, lộ bí mật |
| E2E | Playwright | Test đỏ (PR gắn nhãn, nightly, trước mốc demo) |

Mục tiêu thời gian: các bước nhanh (không E2E) dưới 10 phút.

### 4.3. Bảo vệ nhánh chính

- Không đẩy thẳng lên `main`; chỉ merge qua PR đã qua các bước bắt buộc ở 4.2 và ít nhất một người review (nếu làm một mình thì tự review bằng checklist ở mục 6).
- Merge kiểu squash để lịch sử gọn, một PR một commit có nghĩa.

---

## 5. Quy ước nhánh, commit và PR

### 5.1. Nhánh

`feat/S11-search`, `fix/S15-callback-duplicate`, `chore/upgrade-next`, `docs/adr-session`. Mã slice ở đầu để truy vết. Nhánh sống ngắn (vài ngày), cập nhật từ `main` thường xuyên.

### 5.2. Commit (Conventional Commits)

Dạng `loại(phạm vi): mô tả ngắn`.

| Loại | Dùng cho |
|---|---|
| `feat` | Tính năng mới |
| `fix` | Sửa lỗi |
| `refactor` | Đổi cấu trúc không đổi hành vi |
| `test` | Thêm hoặc sửa test |
| `docs` | Tài liệu, ADR |
| `chore` | Công cụ, phụ thuộc, cấu hình |
| `perf` | Cải thiện hiệu năng |
| `style` | Định dạng, không đổi logic |

Phạm vi là tên feature hoặc gói (`search`, `booking`, `ui`, `api-client`). Ví dụ: `feat(booking): hold countdown uses server time`.

### 5.3. Kích thước PR

- Một PR phục vụ **một mục đích**; thay đổi nền (cấu hình, công cụ, `packages/ui`) tách khỏi thay đổi nghiệp vụ.
- Khoảng 400 dòng thay đổi (không tính file sinh tự động) là ngưỡng nên tách; slice lớn chia thành nhiều PR theo lát nhỏ vẫn demo được.
- Không trộn định dạng hàng loạt với thay đổi logic.

---

## 6. Mẫu PR và danh sách kiểm tra

```markdown
## Mục đích
Slice: S__ · Màn hình: __ · Mô tả ngắn

## Thay đổi chính
-

## Cách kiểm tra
Các bước và dữ liệu seed cần dùng. Ảnh chụp hoặc video nếu có thay đổi giao diện (VI/EN, 360 px và 1280 px).

## Tiêu chí chấp nhận của slice
- [ ] ...

## Danh sách kiểm tra
- [ ] Không có logic nghiệp vụ (giá, quyền, điều kiện) ở frontend
- [ ] Đủ trạng thái: đang tải, rỗng, lỗi, không có quyền
- [ ] i18n đủ VI và EN, không có chuỗi cứng
- [ ] Truy cập: bàn phím, focus, nhãn, tương phản, axe
- [ ] Bảo mật (file 06, mục 16): nội dung người dùng, URL, lưu trữ trình duyệt, no-store, CSP
- [ ] Tiền và ngày qua tiện ích chung; thao tác tiền có Idempotency-Key
- [ ] Test đã thêm ở tầng phù hợp; E2E nếu là luồng chính
- [ ] Đáp ứng 360 đến 1440 px
- [ ] Không thêm thư viện, hoặc đã qua cổng thêm thư viện
- [ ] Ngân sách hiệu năng không bị vượt (nếu là trang công khai)
```

---

## 7. Định nghĩa hoàn thành của một slice frontend

Một slice chỉ được đóng khi:

- [ ] Mọi tiêu chí chấp nhận của slice đạt và demo được trên bản local từ dữ liệu seed.
- [ ] Mọi màn hình của slice dùng component của `packages/ui`, không tự dựng lại.
- [ ] Đủ bốn trạng thái (tải, rỗng, lỗi, thành công) và trạng thái không có quyền nếu liên quan.
- [ ] VI và EN đầy đủ; kiểm tra bố cục với chữ dài.
- [ ] Truy cập: dùng bàn phím trọn luồng, axe không lỗi nghiêm trọng.
- [ ] Bảo mật: đã đi qua danh sách ở file 06, mục 16.
- [ ] Test: đơn vị/component cho logic và hành vi; E2E cho luồng chính của slice.
- [ ] CI xanh; không còn `TODO` không có vấn đề đi kèm.
- [ ] Tài liệu cập nhật nếu có quyết định nền mới (ADR) hoặc component mới (`/dev/ui`).

---

## 8. Quản lý phụ thuộc

| Quy tắc | Chi tiết |
|---|---|
| Cập nhật định kỳ | Renovate hoặc Dependabot mở PR hằng tuần; gom theo nhóm (React/Next, Radix, tooling) |
| Bản vá bảo mật | Áp dụng cho Next.js, React và thư viện nền trong vòng một tuần |
| Nâng cấp phiên bản chính | Một PR riêng, có ADR nếu đổi hành vi; chạy đầy đủ E2E |
| Phiên bản công cụ | Ghim bằng `.nvmrc`, `packageManager`, `engines`; cập nhật đồng bộ trong CI |
| Thư viện không còn bảo trì | Lên kế hoạch thay thế, ghi vào `docs/adr` |

---

## 9. Xử lý lỗi lúc chạy và quan sát

| Chủ đề | Quy định |
|---|---|
| Error boundary | `error.tsx` theo nhóm route và `global-error.tsx`; hiển thị mã tham chiếu |
| Ghi lỗi | Một hàm mỏng `reportError` của dự án; mặc định ghi log; có thể nối với công cụ như Sentry sau này |
| Dữ liệu cá nhân | Lọc trước khi gửi (email, điện thoại, giấy tờ, nội dung tin nhắn, địa chỉ chính xác) |
| Truy vết | Mã yêu cầu `X-Request-Id` gắn vào lỗi để đối chiếu với log backend |
| Công cụ dev | React Query Devtools và các công cụ gỡ lỗi chỉ bật ở dev, không vào bản build production |
| Mức log | Nhiều ở dev, tối thiểu ở production; không log phản hồi API nguyên bản |

---

## 10. Tài liệu

| Loại | Nơi | Nội dung |
|---|---|---|
| ADR | `docs/adr/NNNN-tieu-de.md` | Bối cảnh, quyết định, hệ quả, phương án đã cân nhắc |
| README gốc | `README.md` | Chạy dự án trong 10 phút (file 02, mục 12) |
| README gói | `packages/*/README.md` | Mục đích, cách dùng, quy tắc |
| Hệ thống thiết kế | Trang `/dev/ui` | Token, component, trạng thái |
| Hiệu năng | `docs/perf` | Kết quả đo theo mốc demo |
| Kế hoạch | `slices/` | Slice, tiêu chí chấp nhận, thứ tự |

Mẫu ADR:

```markdown
# NNNN. Tiêu đề
- Trạng thái: đề xuất | chấp nhận | thay thế bởi NNNN
- Ngày:
## Bối cảnh
## Quyết định
## Hệ quả
## Phương án đã cân nhắc
```

ADR nền cần có ngay từ đầu: stack và phiên bản; cấu trúc monorepo và quy tắc phụ thuộc; mô hình phiên, CSRF và cùng origin; chính sách cache; i18n và định tuyến; hệ thống thiết kế và thư viện component.
