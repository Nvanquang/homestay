<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Chỉ Dẫn Dành Riêng Cho Frontend (Frontend Agent Instructions)

Tệp này quy định các chuẩn mực phát triển giao diện phía máy khách cho dự án Homestay Booking.

---

## 1. Công Nghệ & Thư Viện Cốt Lõi
- **Framework**: Next.js 16 (App Router), React 19, TypeScript strict mode.
- **Styling**: Tailwind CSS v4 (`@theme`), token thiết kế màu sắc, bo góc, phông chữ sans hiện đại.
- **Components**: Radix UI qua `shadcn/ui` (Dialog, Popover, Tabs, Slider, Vaul Drawer, Tooltip, Sonner toast).
- **Forms & Validation**: `react-hook-form` + `zod` + `@hookform/resolvers`.
- **Data Fetching**: TanStack Query v5 cho client interactions, `fetch` trong Server Components.
- **Date & Calendar**: `date-fns` v4 + `@date-fns/tz`, `react-day-picker` v9 (chọn khoảng ngày).
- **Map**: `mapbox-gl` + `react-map-gl` với marker nhãn giá HTML và clustering.
- **URL State**: `nuqs` để đồng bộ bộ lọc tìm kiếm lên URL.

---

## 2. Các Điều Cấm Kỵ Tuyệt Đối Phía Frontend (Inviolable Rules)
1. **Không tính tiền**: Tuyệt đối không tự tính toán giá phòng, chiết khấu, phụ phí, thuế hay hoàn tiền tại trình duyệt. Chỉ hiển thị số tiền từ API trả về.
2. **Không dựa vào đồng hồ máy khách**: Đếm ngược giữ phòng 15 phút phải dựa vào thời điểm `expiresAt` (UTC) của backend.
3. **Không tự làm Auth phía Next.js**: Phiên đăng nhập thuộc quyền sở hữu của Backend Spring Boot qua HttpOnly Cookie. Next.js rewrite `/api/*` về `http://localhost:8080/api/*`.
4. **Không tự ý gõ tay kiểu dữ liệu API**: Luôn đồng bộ kiểu API từ backend bằng `npm run gen:api`.

---

## 3. Quy Trình Xác Minh Frontend (Verification Commands)
- **Tier 1 (Typecheck & Lint)**:
  ```powershell
  cmd /c npx tsc --noEmit
  npm run lint
  ```
- **Tier 2 (Unit & Component Test)**:
  ```powershell
  cmd /c npm test
  ```
- **Xác minh nhanh qua Harness script**:
  ```powershell
  .\..\scripts\verify.ps1 -Target fe
  ```

---

## 4. Quy Tắc Tra Cứu Đặc Tả Giao Diện (Slice-Doc Isolation Rule)
- **Mục tiêu**: Ngăn ngừa hiện tượng tràn ngữ cảnh (*Token Blowout*) và thoái hóa độ hiểu (*Lost in the Middle*).
- **Quy tắc bắt buộc đối với Agent**:
  1. **Không nạp toàn bộ thư mục docs**: Tuyệt đối không đọc toàn bộ thư mục `docs/` trong cùng một lượt.
  2. **Tra cứu nền tảng (Foundations)**: Khi cần thiết lập Tokens, Layout Shells, hoặc tra cứu 34 UI Components dùng chung, chỉ đọc các tệp tương ứng trong `docs/giai-doan-1/00-foundations/`.
  3. **Tra cứu theo Slice (WIP = 1)**: Khi thực thi nhiệm vụ thuộc Slice `Sxx`:
     - Đọc trực tiếp tệp tổng hợp `docs/giai-doan-1/slices/sxx-<name>/README.md` (chỉ ~10–20 KB) hoặc đọc riêng từng khía cạnh: `flow.md`, `wireframes.md`, `ux-behavior.md`, `data.md`.
     - Sử dụng `data.md` làm căn cứ để định nghĩa Zod Schema và Mock API contract.
  4. **Kiểm tra nghiệm thu**: Sử dụng `docs/giai-doan-1/appendices/e2e-journeys.md` cho các bài kiểm tra E2E liên slice.

