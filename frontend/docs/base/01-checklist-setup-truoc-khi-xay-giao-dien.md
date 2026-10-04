# Checklist setup trước khi xây giao diện

Chỉ bắt đầu dựng màn hình thật (tìm kiếm, đặt phòng, dashboard…) khi **Cổng vào xây giao diện** ở cuối file đã đạt. Mỗi mục có tiêu chí «Xong khi» kiểm tra được.

Ước lượng: 3 đến 5 ngày cho một người. Phần này nên làm trước hoặc đầu slice **S01** (đăng ký/đăng nhập, vốn đã gom khung kỹ thuật). Nếu S01 bị chật, tách thành một slice nền riêng, mã tạm là `S00`, demo bằng trang trạng thái hệ thống hiển thị kết nối API, ngôn ngữ và token giao diện.

Chi tiết cách làm của từng mục nằm ở file được trỏ tới.

---

## A. Môi trường

| # | Việc | Xong khi | File |
|---|---|---|---|
| A1 | Cài Node LTS, bật Corepack, pnpm đúng phiên bản; có `.nvmrc`, `engines`, `packageManager` | `node -v` và `pnpm -v` khớp file; chạy sai phiên bản thì cài đặt báo lỗi | 02 |
| A2 | Docker Compose của backend chạy được (API, PostgreSQL, MinIO, Mailpit) | Gọi được `GET /api/health` từ máy dev | 02 |
| A3 | Tên miền local riêng cho từng ứng dụng: `app.localhost`, `admin.localhost` | Mở được hai ứng dụng song song, đăng nhập một bên không làm mất phiên bên kia | 02, 06 |

## B. Repo và công cụ

| # | Việc | Xong khi | File |
|---|---|---|---|
| B1 | Monorepo pnpm với `apps/web`, `apps/backoffice`, `packages/{ui,api-client,shared,config}` | `pnpm install` rồi `pnpm dev` chạy cả hai ứng dụng | 02, 03 |
| B2 | `tsconfig` gốc ở chế độ strict, alias đường dẫn | `pnpm typecheck` xanh trên toàn repo | 02 |
| B3 | Biome cấu hình (lint + format + quy tắc a11y) | `pnpm lint` xanh; lỗi định dạng bị báo | 02, 09 |
| B4 | Git hook (kiểm tra file thay đổi, kiểm tra thông điệp commit) | Commit sai quy ước hoặc lỗi lint bị chặn | 09 |
| B5 | Kiểm tra ranh giới thư mục (dependency-cruiser hoặc quy tắc import) | Import vi phạm (feature chạm ruột feature khác) làm CI đỏ | 03, 09 |
| B6 | Pipeline CI tối thiểu: cài đặt khoá lockfile, typecheck, lint, test, build | Một PR mẫu chạy hết các bước | 09 |

## C. Khung ứng dụng

| # | Việc | Xong khi | File |
|---|---|---|---|
| C1 | Cấu hình `next.config.ts` (transpile gói nội bộ, `remotePatterns`, rewrites, header) | Ảnh từ MinIO hiển thị qua `next/image`; `/api/*` chuyển tiếp tới backend | 02 |
| C2 | Biến môi trường có kiểm tra bằng Zod, có `.env.example` | Thiếu hoặc sai biến thì ứng dụng không khởi động, báo rõ tên biến | 02 |
| C3 | Tailwind v4 + token giao diện nạp từ `packages/ui` | Lớp tiện ích dựng từ token hoạt động ở cả hai ứng dụng, kể cả class nằm trong `packages/ui` | 02, 07 |
| C4 | shadcn/ui khởi tạo theo chế độ monorepo, thêm được component vào `packages/ui` | Thêm một component bằng CLI và dùng được ở cả hai ứng dụng | 02, 07 |
| C5 | Phông, favicon, `viewport`, metadata gốc | Không có layout shift do phông; tiêu đề trang đúng | 07, 08 |
| C6 | next-intl: định tuyến `vi`/`en`, tệp thông điệp, bộ chuyển ngôn ngữ | Đổi ngôn ngữ đổi toàn bộ nhãn mẫu; URL có tiền tố ngôn ngữ | 08 |
| C7 | `proxy.ts`: chuyển hướng theo ngôn ngữ và kiểm tra thô sự hiện diện của phiên | Truy cập trang riêng tư khi chưa đăng nhập bị chuyển về đăng nhập, có `returnTo` an toàn | 06 |
| C8 | Khung trang: layout gốc, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx` | Gây lỗi cố ý thì thấy trang lỗi đúng giao diện, không lộ chi tiết kỹ thuật | 04, 07 |

## D. Kết nối backend

| # | Việc | Xong khi | File |
|---|---|---|---|
| D1 | Pipeline sinh client: `pnpm gen:api` đọc `openapi.json` | Đổi một DTO ở backend rồi sinh lại thì chỗ dùng ở frontend báo lỗi kiểu | 05 |
| D2 | Hai client: dùng phía server (chuyển tiếp cookie) và phía trình duyệt | Cùng một endpoint gọi được từ Server Component và từ Client Component | 05 |
| D3 | Middleware client: CSRF, ngôn ngữ, mã yêu cầu, chuẩn hoá lỗi, xử lý 401 | Mutation không có token CSRF bị backend từ chối; 401 đưa về đăng nhập | 05, 06 |
| D4 | Mô hình lỗi: ánh xạ mã lỗi nghiệp vụ sang thông điệp song ngữ | Lỗi xác thực field hiện đúng dưới ô nhập; lỗi không rõ hiện thông báo chung | 05 |
| D5 | `QueryClientProvider` với mặc định (staleTime, retry), khoá truy vấn theo factory | Truy vấn mẫu hoạt động, không retry với lỗi 4xx | 05 |
| D6 | Phiên người dùng: `getCurrentUser()` phía server, hook phía client | Hiển thị tên người dùng ở header ở cả server và client không nhấp nháy | 05, 06 |
| D7 | Tiện ích tiền, ngày, thời gian máy chủ lệch giờ | Có test cho định dạng tiền VND/USD và ngày không lệch theo múi giờ máy | 04, 05 |

## E. Hệ thống thiết kế tối thiểu

| # | Việc | Xong khi | File |
|---|---|---|---|
| E1 | Token: màu, phông, bo góc, bóng, khoảng cách, chuyển động | Một trang `/dev/ui` hiển thị toàn bộ token | 07 |
| E2 | Bộ primitive đợt đầu (xem danh sách ở file 07) | Mỗi primitive có đủ biến thể, trạng thái focus/disabled/lỗi, dùng được bằng bàn phím | 07 |
| E3 | Layout vỏ cho `web` (header, thanh tìm kiếm rỗng, footer) và `backoffice` (sidebar, topbar) | Điều hướng thử giữa vài route rỗng, đúng trên điện thoại và máy tính | 07 |
| E4 | Mẫu trạng thái dùng chung: Skeleton, EmptyState, ErrorState, ConfirmDialog, Toast | Mỗi mẫu có trong `/dev/ui` | 07 |

## F. An toàn nền

| # | Việc | Xong khi | File |
|---|---|---|---|
| F1 | Header bảo mật và CSP (chế độ báo cáo khi dev, kiểm tra trong E2E) | Trình duyệt không báo vi phạm CSP ở các trang nền; bản đồ vẫn tải được | 06 |
| F2 | Quy tắc lint cấm `dangerouslySetInnerHTML`, `eval`, `any` | Thêm thử một dòng vi phạm thì lint đỏ | 06, 09 |
| F3 | Không lưu token hoặc dữ liệu cá nhân ở `localStorage`/`sessionStorage` | Rà soát code và có quy tắc review | 06 |
| F4 | `pnpm audit` và chặn script cài đặt không tin cậy | CI chạy audit; chỉ gói được liệt kê mới chạy script cài đặt | 06 |

## G. Kiểm thử

| # | Việc | Xong khi | File |
|---|---|---|---|
| G1 | Vitest + Testing Library + MSW chạy được | Một test thành phần và một test hàm tiền pass trong CI | 09 |
| G2 | Playwright với một kịch bản khói: mở trang chủ, đổi ngôn ngữ, đăng nhập | Chạy được local với backend Docker Compose | 09 |
| G3 | Kiểm tra truy cập tự động (axe) trong Playwright | Trang nền không có lỗi axe nghiêm trọng | 09 |

## H. Tài liệu và quy trình

| # | Việc | Xong khi | File |
|---|---|---|---|
| H1 | `docs/adr` có ADR cho các quyết định nền | ADR về stack, cấu trúc, phiên, cache, i18n | 00 |
| H2 | Mẫu PR có checklist slice (tiêu chí chấp nhận, a11y, i18n, bảo mật) | Tạo PR mẫu thấy checklist | 09 |
| H3 | README cho người mới: chạy dự án trong 10 phút | Một người ngoài làm theo được mà không hỏi thêm | 02 |

---

## Cổng vào xây giao diện

Chỉ khi **tất cả** các điều sau đúng thì mới dựng màn hình nghiệp vụ:

- [ ] Một lệnh dựng cả hệ thống local (backend Docker Compose + `pnpm dev`) và chạy được trên máy sạch.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` đều xanh; CI chạy các lệnh này.
- [ ] Client API sinh tự động và có một lời gọi thật từ Server Component và từ Client Component.
- [ ] Đăng nhập thử bằng phiên cookie hoạt động qua rewrite cùng origin, kèm CSRF; phiên hai ứng dụng tách biệt.
- [ ] Đổi ngôn ngữ VI/EN hoạt động; không có chuỗi hiển thị viết cứng trong component mẫu.
- [ ] Token và các primitive đợt đầu có trong `/dev/ui`, dùng bàn phím được, đạt axe.
- [ ] Có mẫu trang lỗi, trang không tìm thấy, trạng thái tải, trạng thái rỗng.
- [ ] Header bảo mật và CSP đang hoạt động; bản đồ Mapbox tải được dưới CSP.
- [ ] Quy tắc ranh giới thư mục được kiểm tra tự động.
- [ ] ADR nền đã viết; README chạy dự án đã được một người khác thử.

Khi đạt cổng, dựng màn hình theo thứ tự slice trong `slices/00-tong-quan-va-thu-tu-slice.md`. Mỗi màn mới chỉ **ghép** từ nền này; nếu thấy phải sửa nền, tạo thay đổi nền riêng kèm ADR rồi mới tiếp tục.
