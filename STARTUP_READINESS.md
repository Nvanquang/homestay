# Danh Sách Kiểm Tra Khởi Tạo & Sẵn Sàng (Startup Readiness Checklist)

> **Giai đoạn Khởi tạo Độc lập (Dedicated Initialization Phase)**:  
> Phiên làm việc đầu tiên không viết code tính năng vội vã, mà tập trung xây dựng nền tảng: môi trường chạy được, khung test xác minh được, và trạng thái sẵn sàng.

---

## 1. Kết Quả Khởi Tạo Hạ Tầng (Infrastructure Readiness)

| Hạng mục kiểm tra | Công cụ / Cấu hình | Trạng thái | Lệnh xác minh |
|---|---|---|---|
| **Cấu trúc Monorepo & Router** | `AGENTS.md` (Router) + `docs/harness/` | [x] Đã hoàn thành | `Test-Path AGENTS.md` |
| **Môi trường chạy Local** | `docker-compose.yml`, `.env.example` | [x] Đã hoàn thành | `docker compose config` |
| **Backend Build & Toolchain** | Java 21, Gradle 9.7, Spring Boot 4.1.1 | [x] Đã hoàn thành | `cd backend; .\gradlew.bat compileJava` |
| **Backend Smoke/Unit Test** | JUnit 5 Platform | [x] Đã hoàn thành | `cd backend; .\gradlew.bat test` |
| **Frontend Toolchain & Types** | Next.js 16, React 19, TypeScript 5 | [x] Đã hoàn thành | `cd frontend; cmd /c npx tsc --noEmit` |
| **Frontend Test Harness** | Vitest 5 + Smoke Test component | [x] Đã hoàn thành | `cd frontend; cmd /c npm test` |
| **Hệ thống xác minh tập trung** | `scripts/verify.ps1` & `scripts/verify.sh` | [x] Đã hoàn thành | `.\scripts\verify.ps1 -Target all` |
| **Quản lý trạng thái & Quyết định** | `PROGRESS.md`, `DECISIONS.md` | [x] Đã hoàn thành | Kiểm tra file tồn tại |

---

## 2. Danh Sách Kiểm Tra Tiền Bay (Pre-flight Checklist cho Mỗi Phiên)

Trước khi Agent bắt đầu viết code cho bất kỳ task mới nào, thực hiện các bước kiểm tra nhanh sau:
- [ ] 1. Chạy `.\scripts\verify.ps1 -Target all` để đảm bảo codebase đang ở trạng thái xanh sạch.
- [ ] 2. Đọc `PROGRESS.md` để xác định task tiếp theo theo nguyên tắc `WIP = 1`.
- [ ] 3. Kiểm tra container cơ sở hạ tầng đã bật chưa (`docker compose ps`).
- [ ] 4. Đọc Topic Doc liên quan trong `docs/harness/` nếu cần thêm ngữ cảnh chuyên sâu.
