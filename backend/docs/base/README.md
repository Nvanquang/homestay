# Bản Đồ Tài Liệu & Chỉ Dẫn Nền Tảng Backend (Backend Base Router)

> **Mục tiêu**: Điều hướng tri thức cho lập trình viên và AI Agent khi xây dựng nền tảng Backend (Spring Boot 4 / Java 21) cho hệ thống Homestay Booking.  
> **Nguyên tắc**: Khi thực thi từng chặng trong quy trình xây dựng Base, chỉ đọc đúng tài liệu chuyên đề liên quan để tối ưu hóa Context Budget.  
> **Sổ tay thực thi chi tiết**: [PROMPTS_PLAYBOOK.md](./PROMPTS_PLAYBOOK.md) chứa toàn bộ danh sách Prompt chuẩn Harness cho 5 Chặng Base.

---

## 1. Danh Mục 10 Tài Liệu Nền Tảng Backend

| Tệp | Chủ Đề | Nội Dung Trọng Tâm | Kích Thước |
|---|---|---|---|
| [**00-tong-quan-va-muc-luc.md**](./00-tong-quan-va-muc-luc.md) | **Tổng Quan** | Stack nền, 12 nguyên tắc cốt lõi, danh sách công nghệ chọn lọc | ~10 KB |
| [**01-checklist-setup-truoc-khi-viet-nghiep-vu.md**](./01-checklist-setup-truoc-khi-viet-nghiep-vu.md) | **Checklist Nền Tảng** | Bảng tiêu chí 6 nhóm (A $\rightarrow$ F) và "Cổng vào viết nghiệp vụ" | ~9 KB |
| [**02-cau-truc-kien-truc-phan-lop-va-clean-code.md**](./02-cau-truc-kien-truc-phan-lop-va-clean-code.md) | **Kiến Trúc & Mã Nguồn** | Spring Modulith, phân lớp (web, app, domain), DTO tách biệt, ArchUnit rules, YAGNI | ~15 KB |
| [**03-thiet-ke-api-loi-va-hop-dong.md**](./03-thiet-ke-api-loi-va-hop-dong.md) | **API & Lỗi Chuẩn** | RESTful `/api/v1`, RFC 7807 Problem Details, ErrorCode enum, Idempotency-Key | ~28 KB |
| [**04-bao-mat-1-owasp-xac-thuc-mat-khau.md**](./04-bao-mat-1-owasp-xac-thuc-mat-khau.md) | **Bảo Mật: Xác Thực** | Spring Session JDBC (cookie HttpOnly), Argon2id, lockout chống brute-force | ~21 KB |
| [**05-bao-mat-2-phan-quyen-dau-vao-upload.md**](./05-bao-mat-2-phan-quyen-dau-vao-upload.md) | **Bảo Mật: Phân Quyền & Input** | Phân quyền 3 tầng, Mặc định từ chối (`denyAll`), CSRF `XSRF-TOKEN`, SSRF filter, Upload MinIO | ~26 KB |
| [**06-toan-ven-du-lieu-giao-dich-dong-thoi.md**](./06-toan-ven-du-lieu-giao-dich-dong-thoi.md) | **Dữ Liệu & Giao Dịch** | Flyway migrations, extensions PostgreSQL, Value Object `Money`, Concurrency, ShedLock | ~22 KB |
| [**07-van-hanh-log-giam-sat-docker-ci.md**](./07-van-hanh-log-giam-sat-docker-ci.md) | **Vận Hành & Giám Sát** | Structured JSON Logging + MDC RequestId, `AuditService` cùng transaction, Docker Compose | ~19 KB |
| [**08-kiem-thu-chat-luong-va-dinh-nghia-hoan-thanh.md**](./08-kiem-thu-chat-luong-va-dinh-nghia-hoan-thanh.md) | **Kiểm Thử & Hoàn Thành** | Testcontainers (Postgres, MinIO), Concurrency Test Harness, Test ma trận bảo mật | ~15 KB |
| [**09-i18n-phia-backend.md**](./09-i18n-phia-backend.md) | **Đa Ngôn Ngữ Backend** | MessageSource song ngữ (vi/en), email templates, timezone, validation messages | ~22 KB |

---

## 2. Đường Dẫn Đến Sổ Tay Lệnh Thực Thi

👉 **[PROMPTS_PLAYBOOK.md](./PROMPTS_PLAYBOOK.md)**: Chứa sẵn 5 prompt chuẩn theo cấu trúc bộ ba (Mô tả hành vi | Lệnh xác minh | Trạng thái) cho từng chặng từ BE-Base-01 đến BE-Base-05.
