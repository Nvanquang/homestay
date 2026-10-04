# Features Directory

Tổ chức các module nghiệp vụ theo chuẩn Feature-based (dựa theo `docs/base/03-cau-truc-thu-muc-va-to-chuc-ma.md`).

## Cấu trúc của một feature:
```
features/<feature-name>/
├── index.ts        # Public API: chỉ xuất các component/hook/type được dùng bên ngoài
├── components/     # UI components riêng biệt của feature
├── hooks/          # React hooks tùy biến của feature
├── api/            # Query options, mutation functions, query keys của feature
├── schemas/        # Zod validation schemas
├── lib/            # Logic thuần (không phụ thuộc React)
├── types.ts        # Type definitions của feature
└── *.test.ts(x)    # Tests đặt cạnh mã nguồn
```

## Quy tắc ranh giới:
1. `app/` chỉ làm nhiệm vụ ghép trang từ các feature.
2. Không feature nào được import nội bộ (`/internal`) của feature khác; chỉ import qua `features/<feature>/index.ts`.
3. Tránh phụ thuộc vòng giữa các feature. Các hàm thuần dùng chung phải đưa vào `src/lib/` hoặc `packages/shared`.
