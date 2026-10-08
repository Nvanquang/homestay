# AGENTS.md — Bản Đồ Điều Hướng & Quy Tắc Cốt Lõi (Harness Router)

> **Kho mã nguồn là nguồn tin cậy duy nhất (Repo IS the Spec)**.  
> Tệp này là điểm chạm lối vào (entry point) bắt buộc cho mọi phiên làm việc của AI Agent.

---

## 1. Fresh Session Test (5 Câu Hỏi Cốt Lõi)

Mọi phiên Agent mới khi bắt đầu làm việc phải tự trả lời được 5 câu hỏi sau từ repo:

| # | Câu hỏi | Câu trả lời tóm tắt | Tài liệu chi tiết |
|---|---|---|---|
| **1** | **Hệ thống là gì?** | Marketplace đặt phòng homestay kiểu Airbnb (Guest, Host, Admin, CSKH, Kế toán), 14 module nghiệp vụ. | [dac-ta-nghiep-vu-he-thong-dat-phong.md](file:///e:/github-tutorio-demo/homestaybooking/docs/homestay/dac-ta-nghiep-vu-he-thong-dat-phong.md) |
| **2** | **Kiến trúc ra sao?** | Modular Monolith (Spring Boot 4.1 / Java 21) + Next.js 16 (React 19, TypeScript), PostgreSQL PostGIS, MinIO, Mailpit. | [docs/harness/architecture.md](file:///e:/github-tutorio-demo/homestaybooking/docs/harness/architecture.md) |
| **3** | **Chạy thế nào?** | `docker compose up -d` -> Backend: `./gradlew bootRun` -> Frontend: `npm run dev`. | [docs/harness/environment.md](file:///e:/github-tutorio-demo/homestaybooking/docs/harness/environment.md) |
| **4** | **Xác minh thế nào?** | Quy trình xác minh đa tầng: `.\scripts\verify.ps1 -Target fe` (hiện tại) hoặc `-Target all`. | [docs/harness/verification.md](file:///e:/github-tutorio-demo/homestaybooking/docs/harness/verification.md) |
| **5** | **Tiến độ ở đâu?** | Giai đoạn 1: **100% Frontend (S01–S13)** với Mock layer theo [ADR-006](file:///e:/github-tutorio-demo/homestaybooking/DECISIONS.md) tại [PROGRESS.md](file:///e:/github-tutorio-demo/homestaybooking/PROGRESS.md). | [PROGRESS.md](file:///e:/github-tutorio-demo/homestaybooking/PROGRESS.md) |


---

## 2. Quy Tắc Cứng Không Thể Thương Lượng (Non-Negotiable Rules)

1. **Nguyên tắc "Fix Harness First"**: Khi gặp lỗi, không đổi prompt mơ hồ hoặc đoán mò. Kiểm tra 5 tầng: Mô tả nhiệm vụ $\rightarrow$ Ngữ cảnh $\rightarrow$ Môi trường $\rightarrow$ Phản hồi xác minh $\rightarrow$ Quản lý trạng thái.
2. **Quy tắc WIP = 1**: Tại một thời điểm chỉ có DUY NHẤT 1 công việc ở trạng thái `[-] in_progress` trong `PROGRESS.md`. Không nhảy cóc tính năng khi việc hiện tại chưa hoàn thành.
3. **Pass-State Gating**: Chỉ chuyển trạng thái sang `[x] passing` khi câu lệnh xác minh tương ứng chạy thành công với mã thoát `exit code 0`. Tuyệt đối không tự suy diễn kết quả test.
4. **Bất Biến Nghiệp Vụ (Invariants)**:
   - **Giá tiền**: Frontend KHÔNG BAO GIỜ tự tính giá, phụ phí, thuế hay hoàn tiền. Toàn bộ logic giá nằm tại `PricingEngine` (Backend).
   - **Chống đặt trùng**: Bắt buộc dùng `daterange` + PostGIS exclusion constraint (`23P01`).
   - **Phiên đăng nhập**: Backend sở hữu auth và session qua Spring Session JDBC.
5. **Clean State Handoff & FE-to-BE Handover Contract**: Cuối mỗi phiên làm việc, bắt buộc đảm bảo: Build pass, Test pass, tự động sinh 2 file hợp đồng kỹ thuật cho Backend (`db-design.md` và `openapi.yaml`) tại thư mục slice tương ứng, dọn sạch file tạm, cập nhật `PROGRESS.md`, và sẵn sàng cho phiên tiếp theo.

---

## 3. Bản Đồ Điều Hướng Tài Liệu (Topic Docs Router)

Để tối ưu Context Budget và tránh hiện tượng "Lost in the Middle", hãy đọc tài liệu theo nhu cầu:

- **Kiến trúc & Ranh giới module**: [docs/harness/architecture.md](file:///e:/github-tutorio-demo/homestaybooking/docs/harness/architecture.md)
- **Quy trình xác minh & xử lý lỗi**: [docs/harness/verification.md](file:///e:/github-tutorio-demo/homestaybooking/docs/harness/verification.md)
- **Quy tắc vận hành Agent & Handoff**: [docs/harness/protocols.md](file:///e:/github-tutorio-demo/homestaybooking/docs/harness/protocols.md)
- **Môi trường, Docker & Tua thời gian**: [docs/harness/environment.md](file:///e:/github-tutorio-demo/homestaybooking/docs/harness/environment.md)
- **Kế hoạch 14 Vertical Slices**: [docs/harness/slices-plan.md](file:///e:/github-tutorio-demo/homestaybooking/docs/harness/slices-plan.md)
- **Chỉ dẫn chi tiết Frontend**: [frontend/AGENTS.md](file:///e:/github-tutorio-demo/homestaybooking/frontend/AGENTS.md)
- **Chỉ dẫn chi tiết Backend**: [backend/AGENTS.md](file:///e:/github-tutorio-demo/homestaybooking/backend/AGENTS.md)
- **Đặc tả giao diện Frontend Giai đoạn 1**: [frontend/docs/giai-doan-1/README.md](file:///e:/github-tutorio-demo/homestaybooking/frontend/docs/giai-doan-1/README.md)

