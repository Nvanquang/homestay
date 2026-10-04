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
