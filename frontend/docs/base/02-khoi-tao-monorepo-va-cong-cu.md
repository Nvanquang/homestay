# Khởi tạo monorepo và công cụ

Hướng dẫn dựng phần nền kỹ thuật. Các đoạn mã chỉ là cấu hình minh hoạ; kiểm tra lại tài liệu chính thức của từng công cụ khi thực hiện vì phiên bản có thể đã đổi.

---

## 1. Yêu cầu máy và phiên bản

| Công cụ | Yêu cầu | Cách khoá |
|---|---|---|
| Node.js | LTS đang hỗ trợ (22 hoặc 24); tối thiểu 20.9 theo Next.js 16 | `.nvmrc` + `engines` trong `package.json` gốc |
| pnpm | Bản ổn định mới, cài qua Corepack (`corepack enable`) | Trường `packageManager` trong `package.json` gốc |
| Docker | Để chạy backend, PostgreSQL, MinIO, Mailpit | Docker Compose của backend |
| Git | Bất kỳ bản gần đây | |
| Trình duyệt | Chrome hoặc Edge mới nhất để dev; Playwright tải trình duyệt riêng | |
| Trình soạn thảo | VS Code kèm Biome, Tailwind CSS IntelliSense, Playwright | `.vscode/extensions.json` đề xuất sẵn, `.vscode/settings.json` bật format khi lưu |

Thêm `.editorconfig` (2 khoảng trắng, LF, UTF-8, xuống dòng cuối file).

---

## 2. Cổng và tên miền local

Cookie **không tách theo cổng**, chỉ tách theo tên miền. Nếu `web` và `backoffice` cùng chạy ở `localhost` (cổng 3000 và 3001) thì chúng dùng chung cookie phiên, và đăng nhập Guest sẽ lẫn với đăng nhập nhân sự. Vì vậy dùng tên miền riêng, trình duyệt hiện đại tự trỏ `*.localhost` về máy bạn:

| Thành phần | Địa chỉ local |
|---|---|
| `apps/web` | `http://app.localhost:3000` |
| `apps/backoffice` | `http://admin.localhost:3001` |
| Backend API | `http://localhost:8080` (chỉ được gọi qua rewrite của Next.js và từ Server Component) |
| MinIO | `http://localhost:9000` (ảnh công khai và URL ký sẵn) |
| Mailpit | `http://localhost:8025` |

Backend cần cấu hình CORS/origin cho hai tên miền trên nếu có gọi trực tiếp, nhưng cách mặc định là **không gọi trực tiếp từ trình duyệt** mà đi qua `/api` cùng origin (mục 7).

---

## 3. Cấu trúc workspace

```
booking/
├── apps/
│   ├── web/
│   └── backoffice/
├── packages/
│   ├── ui/
│   ├── api-client/
│   ├── shared/
│   └── config/
├── docs/adr/
├── e2e/                  # Playwright (hoặc đặt trong từng app, xem file 09)
├── package.json          # script gốc, packageManager, engines
├── pnpm-workspace.yaml
├── biome.json
├── tsconfig.base.json -> packages/config
├── .nvmrc  .editorconfig  .gitignore
└── lefthook.yml
```

`pnpm-workspace.yaml` khai báo `apps/*` và `packages/*`. Phạm vi tên gói thống nhất là `@booking/*` (ví dụ `@booking/ui`).

**Gói nội bộ dùng thẳng mã nguồn**, không có bước build riêng:
- Trong `package.json` của gói, `exports` trỏ tới `./src/index.ts`.
- Mỗi ứng dụng khai báo các gói này trong `transpilePackages` của `next.config.ts`.
- Lợi ích: sửa `packages/ui` thấy ngay ở ứng dụng, không cần watch riêng.

### Script ở thư mục gốc

| Script | Việc |
|---|---|
| `dev` | Chạy song song `web` và `backoffice` |
| `build` | Build tất cả |
| `typecheck` | `tsc --noEmit` cho mọi gói |
| `lint`, `format` | Biome kiểm tra và định dạng |
| `test` | Vitest cho mọi gói |
| `e2e` | Playwright |
| `gen:api` | Sinh client từ `openapi.json` (file 05) |
| `check` | Chạy `typecheck`, `lint`, `test` (dùng trước khi mở PR) |

Vì `next lint` đã bị gỡ ở Next.js 16 và `next build` không còn tự lint, bước lint **bắt buộc** nằm trong script và CI riêng.

---

## 4. Khởi tạo hai ứng dụng

Tạo mỗi ứng dụng bằng `create-next-app` với các lựa chọn: TypeScript, App Router, thư mục `src/`, Tailwind, Turbopack, alias `@/*`, **không** ESLint (dùng Biome). Sau đó:

1. Xoá mã mẫu, đặt tên gói `@booking/web` và `@booking/backoffice`.
2. Thêm phụ thuộc gói nội bộ bằng `workspace:*`.
3. Đặt cổng dev: web 3000, backoffice 3001.
4. Cấu hình `next.config.ts` theo mục 7.

Tuỳ chọn **React Compiler** (`reactCompiler` trong cấu hình Next.js): bật sau khi nền ổn định và các thư viện đã được kiểm tra tương thích; khi bật, không viết `useMemo`/`useCallback` theo thói quen.

---

## 5. TypeScript

`packages/config/tsconfig.base.json` dùng cho mọi gói. Các cờ nên bật:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "jsx": "preserve"
  }
}
```

- Mỗi gói `extends` file này; ứng dụng thêm `plugins: [{ "name": "next" }]` và alias `@/*` về `src/*`.
- `noUncheckedIndexedAccess` buộc xử lý trường hợp phần tử không tồn tại: dễ gây phiền lúc đầu nhưng bắt được nhiều lỗi thật.
- Không dùng `any`; dùng `unknown` rồi thu hẹp kiểu (quy tắc ở file 04).

---

## 6. Biome (lint và định dạng)

Một công cụ cho cả lint và định dạng, cấu hình ở `biome.json` gốc.

| Nhóm | Thiết lập |
|---|---|
| Định dạng | 2 khoảng trắng, độ rộng dòng 100, dấu nháy kép, dấu chấm phẩy theo mặc định |
| Lint | Bật bộ quy tắc khuyến nghị; thêm nhóm **a11y** và **security** |
| Cấm | `any` tường minh, `dangerouslySetInnerHTML`, `eval`; cảnh báo `console` |
| React | Quy tắc kiểm tra phụ thuộc của hook, key trong danh sách |
| Sắp xếp | Sắp xếp import; sắp xếp thứ tự class Tailwind nếu quy tắc có sẵn |
| Ranh giới | Quy tắc cấm import đường dẫn nhất định (ví dụ cấm import `features/*/internal`) |

Biome không thay thế kiểm tra ranh giới kiến trúc đầy đủ: dùng thêm **dependency-cruiser** (xem file 03 và 09). Nếu sau này cần các quy tắc riêng của Next.js chưa có trong Biome, thêm ESLint chỉ cho các quy tắc đó và chạy bằng ESLint CLI.

---

## 7. `next.config.ts` (cấu hình nền)

Các hạng mục bắt buộc, minh hoạ:

```ts
// apps/web/next.config.ts  (minh hoạ)
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@booking/ui", "@booking/api-client", "@booking/shared"],
  images: {
    remotePatterns: [
      // Ảnh công khai của listing lưu ở MinIO (đổi theo môi trường)
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/public/**" },
    ],
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.BACKEND_URL}/api/:path*` }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]; // xem file 06
  },
};

export default withNextIntl(config);
```

Điểm cần nhớ:
- **Rewrite `/api/*`** đưa mọi lời gọi từ trình duyệt qua cùng origin tới backend. Nhờ đó cookie phiên là cookie cùng site, `SameSite=Lax` đủ dùng, không cần CORS rộng và không lộ địa chỉ backend. Giá trị `BACKEND_URL` được đọc khi build/khởi động; đổi giá trị thì khởi động lại.
- Dùng `images.remotePatterns`, không dùng `images.domains` (đã bị khuyến cáo bỏ). Chỉ liệt kê đúng host và đường dẫn của bucket ảnh công khai; **không** cho phép bucket giấy tờ danh tính.
- `headers()` gắn bộ header bảo mật (nội dung ở file 06).
- Upload ảnh đi **thẳng từ trình duyệt tới MinIO** bằng URL ký sẵn, không đi qua rewrite.
- Không bật Cache Components ở giai đoạn đầu; chính sách cache ở file 05.

---

## 8. Tailwind CSS v4 và token

Tailwind v4 cấu hình bằng CSS, không dùng `tailwind.config.js` mặc định.

- Mỗi ứng dụng có `postcss.config.mjs` dùng plugin `@tailwindcss/postcss`.
- `globals.css` của ứng dụng:

```css
@import "tailwindcss";
@import "@booking/ui/styles/tokens.css";   /* @theme: màu, phông, bo góc, bóng... */
@source "../../../../packages/ui/src";     /* quét class nằm trong gói UI */
```

- **Vấn đề hay gặp:** Tailwind không tự quét mã nằm ngoài ứng dụng như `packages/ui`. Thiếu dòng `@source` thì class trong gói UI không được sinh ra, giao diện vỡ mà không báo lỗi. Đường dẫn trong `@source` tính từ vị trí file CSS.
- Token (`@theme`) chỉ định nghĩa **một nơi** là `packages/ui/src/styles/tokens.css`; nội dung ở file 07.
- Dùng `tailwind-merge` và `clsx` qua hàm `cn()` của `packages/ui`.

---

## 9. shadcn/ui trong monorepo

- Khởi tạo bằng CLI của shadcn theo chế độ monorepo: `components.json` ở `packages/ui` trỏ alias tới `src/components`; `components.json` ở mỗi ứng dụng trỏ alias về `@booking/ui`.
- Thêm component bằng CLI **vào `packages/ui`**, rồi chỉnh theo token của dự án. Không sửa trực tiếp ở ứng dụng.
- Sau khi thêm, kiểm tra: dùng token thay cho giá trị cứng, có biến thể `cva` rõ ràng, hỗ trợ bàn phím, có chuỗi truy cập (aria) đúng, không chứa chuỗi văn bản viết cứng.
- Quy trình thêm và thay đổi component nằm ở file 07, mục «Quy trình đóng góp component».

---

## 10. Biến môi trường

Mỗi ứng dụng có `.env.example` (đưa vào git) và `.env.local` (không đưa vào git). Biến được kiểm tra bằng Zod ở `src/env.ts` và ứng dụng **không khởi động** nếu thiếu hoặc sai.

| Biến | Phạm vi | Ý nghĩa |
|---|---|---|
| `BACKEND_URL` | Chỉ server | Địa chỉ backend để rewrite và gọi từ Server Component |
| `NEXT_PUBLIC_APP_URL` | Công khai | URL gốc của ứng dụng (canonical, sitemap, liên kết trong email) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Công khai | Token **công khai** (`pk.`) của Mapbox, giới hạn theo URL; không bao giờ dùng token bí mật (`sk.`) |
| `NEXT_PUBLIC_STORAGE_URL` | Công khai | Địa chỉ gốc ảnh công khai (MinIO) |
| `CSP_MODE` | Chỉ server | `report-only` hoặc `enforce` |

Quy tắc:
- Mọi biến bắt đầu bằng `NEXT_PUBLIC_` sẽ **nằm trong mã gửi tới trình duyệt**; không đặt bí mật vào đó.
- Không đọc `process.env` rải rác; chỉ import từ `env.ts`.
- Backend và khoá bí mật không thuộc repo frontend.

---

## 11. Git hook, commit và CI (tóm tắt)

- Dùng **lefthook** (hoặc husky): trước commit chạy Biome trên file thay đổi; kiểm tra thông điệp commit theo Conventional Commits.
- CI chạy: cài đặt với lockfile cố định, `typecheck`, `lint`, kiểm tra ranh giới, `test`, `build`, `pnpm audit`.
- Chi tiết, kèm quy ước nhánh và PR, ở file 09.

---

## 12. Chạy dự án trong 10 phút (nội dung README)

1. Cài Node LTS, bật Corepack, cài Docker.
2. Khởi động backend: `docker compose up` (thư mục `infra`), chờ health check.
3. Ở thư mục frontend: `pnpm install`.
4. Sao chép `.env.example` thành `.env.local` ở hai ứng dụng và điền token Mapbox (có thể bỏ trống để bản đồ tự về chế độ danh sách).
5. `pnpm gen:api` để sinh client từ backend.
6. `pnpm dev`, mở `http://app.localhost:3000` và `http://admin.localhost:3001`.
7. Tài khoản mẫu cho mỗi vai trò nằm trong dữ liệu seed của backend (ghi trong README).
