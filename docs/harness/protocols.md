# Quy Trình Thực Thi & Quy Tắc Vận Hành Agent (Agent Protocols & Operating Rules)

Tài liệu này định nghĩa các quy tắc cốt lõi về kỷ luật thực thi, quản lý trạng thái và bàn giao phiên làm việc sạch cho AI Agent trong dự án Homestay Booking.

---

## 1. Nguyên Tắc Cốt Lõi: Fix Harness First

Khi Agent gặp lỗi hoặc thực hiện sai yêu cầu, **không đổi mô hình hay gõ prompt mơ hồ hơn**. Hãy kiểm tra và khắc phục điểm nghẽn tại 5 tầng phòng thủ:
1. **Mô tả nhiệm vụ (Task Description)**: Đầu vào có rõ ràng, tiêu chí nghiệm thu có đo đếm được không?
2. **Cung cấp ngữ cảnh (Context Provision)**: Agent có được cung cấp đúng Topic Doc và file liên quan chưa, hay đang bị "Lost in the Middle"?
3. **Môi trường thực thi (Execution Environment)**: Container DB, MinIO, Node, Java có sẵn sàng không?
4. **Phản hồi xác minh (Verification Feedback)**: Có câu lệnh kiểm thử cụ thể trả về lỗi chi tiết để Agent tự sửa không?
5. **Quản lý trạng thái (State Management)**: `PROGRESS.md` có phản ánh đúng trạng thái thực tế không?

---

## 2. Quy Tắc Giới Hạn Phạm Vi: WIP = 1 (Work In Progress = 1)

1. **Tài nguyên chú ý là hữu hạn ($C/k$)**: Khi Agent ôm đồm nhiều việc cùng lúc, ngữ cảnh phân mảnh và tỷ lệ hallucination tăng vọt.
2. **Quy tắc bất di bất dịch**: Tại bất kỳ thời điểm nào, chỉ có **duy nhất 1 task** ở trạng thái `in_progress` trong `PROGRESS.md`.
3. **Không nhảy cóc (No Overreaching)**: Hoàn thành dứt điểm tính năng hiện tại, chạy câu lệnh xác minh pass 100%, ghi nhật ký rồi mới chuyển sang task tiếp theo.

---

## 3. Cấu Trúc Bộ Ba Của Feature Lists (Feature Primitives)

Mọi tính năng hoặc nhiệm vụ trong `PROGRESS.md` bắt buộc phải tuân theo cấu trúc bộ ba:
```markdown
- [Trạng thái] [Mô tả hành vi]: [Câu lệnh xác minh]
```
- **Mô tả hành vi**: Mô tả cụ thể hành vi của hệ thống (Ví dụ: `Auth: Đăng ký tài khoản với email hợp lệ và mật khẩu Argon2`).
- **Câu lệnh xác minh**: Lệnh terminal chạy tự động kiểm tra tính đúng đắn (Ví dụ: `.\scripts\verify.ps1 -Target be -Tier 2`).
- **Trạng thái**:
  - `[ ] pending`: Chưa thực hiện.
  - `[-] in_progress`: Đang thực hiện (Tối đa 1 mục tại một thời điểm).
  - `[x] passing`: Đã vượt qua câu lệnh xác minh với mã thoát 0.

---

## 4. Tách Biệt Người Làm và Người Kiểm Tra (Generator / Evaluator Separation)

- **Độ lệch tự tin (Confidence Bias)**: Mô hình tạo mã nguồn luôn có xu hướng đánh giá cao và thiên vị bài làm của chính mình.
- **Cơ chế tách biệt**:
  - **Generator Phase**: Agent tạo mã tính năng dựa trên đặc tả.
  - **Evaluator Phase**: Đóng vai trò Checker độc lập, kiểm tra lại ranh giới:
    - Có vi phạm ranh giới 14 package trong Spring Modulith không?
    - Frontend có lén tính giá hoặc giữ giờ không?
    - Frontend có bỏ quên i18n hoặc hardcode chuỗi giao diện thay vì dùng `messages/vi.json` & `messages/en.json` không?
    - Dữ liệu tiền có dùng đúng số nguyên và loại tiền không?
    - Test có chạy thật trên PostgreSQL PostGIS hay bị mock qua loa?

---

## 5. Bàn Giao Trạng Thái Sạch (Clean State Handoff) & Hợp Đồng FE-to-BE

Trước khi kết thúc bất kỳ phiên làm việc nào, Agent bắt buộc phải đảm bảo **các điều kiện bàn giao sạch**:
1. **Build Pass**: Cả Frontend (`npm run build` hoặc `npm run lint`) và Backend (`gradlew compileJava`) đều biên dịch thành công.
2. **Test Pass**: Mọi bài test liên quan đến phần vừa làm đều đạt màu xanh (`passing`).
3. **FE-to-BE Handover Contract**: Sau khi hoàn tất triển khai và kiểm thử Frontend cho mỗi Slice (từ FE-S01 đến FE-S13), Agent **bắt buộc tự động sinh 2 tệp hợp đồng kỹ thuật** tại thư mục `frontend/docs/giai-doan-1/slices/sXX-.../` để chuẩn bị cho giai đoạn Backend (BE):
   - `db-design.md`: Thiết kế CSDL chi tiết (Sơ đồ ER Mermaid, cấu trúc bảng PostgreSQL/PostGIS, chỉ mục đánh chỉ số, ràng buộc toàn vẹn, Flyway migration DDL).
   - `openapi.yaml`: Đặc tả OpenAPI 3.0/3.1 Contract chuẩn (paths, schemas, response status, headers, chuẩn lỗi RFC 9457 Problem Details) để BE làm theo mà không bị lệch hợp đồng.
4. **Xóa File Rác**: Không để lại file tạm, log debug rải rác ngoài thư mục `scratch/`.
5. **Cập nhật Tiến độ**: Cập nhật `PROGRESS.md` và `DECISIONS.md` phản ánh trung thực hiện trạng.
6. **Sẵn Sàng Cho Phiên Mới**: Đảm bảo phiên Agent tiếp theo có thể chạy bài kiểm thử Fresh Session (đọc `AGENTS.md` và bắt đầu ngay mà không cần con người giải thích lại).

---

## 6. Kiểm Soát 4 Chi Phí Ẩn (Hidden Costs Control)

| Chi phí ẩn | Nguy cơ | Biện pháp kiểm soát của Harness |
|---|---|---|
| **Verification Debt** | Viết code nhiều nhưng nợ kiểm thử dồn ứ | Pass-state Gating bắt buộc kiểm thử tức thì từng task nhỏ |
| **Comprehension Rot** | Mất dần hiểu biết về toàn cục dự án theo thời gian | Topic Docs trong `docs/harness/` đóng vai trò bản đồ kiến trúc sống |
| **Cognitive Surrender** | Tin tưởng mù quáng vào kết quả sinh ra của AI | Bộ test 3 tầng và công cụ đánh giá ranh giới Modulith |
| **Token Blowout** | Nhồi nhét toàn bộ tài liệu vào 1 file khiến tràn context | Phân tách chỉ dẫn: `AGENTS.md` chỉ giữ 50–150 dòng làm router |
