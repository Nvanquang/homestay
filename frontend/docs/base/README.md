# Bản Đồ Tài Liệu Cấu Hình Nền Tảng Frontend (Frontend Base Docs Router)

> **Mục tiêu**: Hướng dẫn Agent và lập trình viên thiết lập nền tảng kỹ thuật vững chắc trước khi dựng màn hình thật theo [Checklist Setup](./01-checklist-setup-truoc-khi-xay-giao-dien.md).  
> **Nguyên tắc**: Khi thực hiện từng mục trong checklist, chỉ đọc đúng file chuyên đề liên quan.

---

## Danh Mục Tài Liệu Cấu Hình Nền Tảng

| Tệp | Chủ Đề | Nội Dung Chính | Kích Thước |
|---|---|---|---|
| [**01-checklist-setup-truoc-khi-xay-giao-dien.md**](./01-checklist-setup-truoc-khi-xay-giao-dien.md) | **Checklist Tổng Thể** | Tiêu chí nghiệm thu 8 nhóm (A -> H) và "Cổng vào xây giao diện" | ~9 KB |
| [**02-khoi-tao-monorepo-va-cong-cu.md**](./02-khoi-tao-monorepo-va-cong-cu.md) | **Khởi Tạo & Tooling** | Cấu hình Node, Next.js config, Biome, TypeScript strict, env validation | ~12 KB |
| [**03-cau-truc-thu-muc-va-to-chuc-ma.md**](./03-cau-truc-thu-muc-va-to-chuc-ma.md) | **Cấu Trúc Thư Mục** | Tổ chức thư mục `features/`, route groups `(public)`, `(host)`, `(admin)`, quy tắc import | ~15 KB |
| [**04-nguyen-tac-xay-dung-frontend.md**](./04-nguyen-tac-xay-dung-frontend.md) | **Nguyên Tắc Lập Trình** | Invariant giá tiền, Server/Client components, xử lý trạng thái Loading/Error/Empty | ~14 KB |
| [**05-ket-noi-api-du-lieu-va-trang-thai.md**](./05-ket-noi-api-du-lieu-va-trang-thai.md) | **API & State** | Client API type-safe, TanStack Query factory, chuẩn hoá Problem Details, Mock layer | ~16 KB |
| [**06-bao-mat-frontend.md**](./06-bao-mat-frontend.md) | **Bảo Mật Máy Khách** | HttpOnly Cookie, CSRF, CSP, chống XSS, bảo vệ dữ liệu nhạy cảm | ~17 KB |
| [**07-design-system-va-nen-tang-giao-dien.md**](./07-design-system-va-nen-tang-giao-dien.md) | **Design System** | Token Tailwind v4, shadcn/ui primitives, 4 Shell layouts, trang `/dev/ui` | ~13 KB |
| [**08-i18n-seo-hieu-nang-truy-cap.md**](./08-i18n-seo-hieu-nang-truy-cap.md) | **i18n, A11y & SEO** | next-intl routing `[locale]`, từ điển thông điệp song ngữ, accessibility WCAG AA | ~12 KB |
| [**09-kiem-thu-chat-luong-va-quy-trinh.md**](./09-kiem-thu-chat-luong-va-quy-trinh.md) | **Kiểm Thử & Quy Trình** | Vitest, Testing Library, MSW, Playwright khói, pass-state gating | ~13 KB |
