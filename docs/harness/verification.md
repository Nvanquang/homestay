# Ma Trận Xác Minh 3 Tầng & Hướng Dẫn Xử Lý Lỗi (Verification Matrix & Recovery)

Harness thực thi nguyên tắc: **Khả năng mô hình ≠ Độ tin cậy thực thi**. AI Agent có xu hướng tự tin quá mức (*Confidence Calibration Bias*). Vì vậy, trạng thái hoàn thành chỉ được công nhận khi toàn bộ quy trình kiểm thử 3 tầng chạy thành công (Pass-State Gating).

---

## 1. Ma Trận Xác Minh 3 Tầng (3-Tier Verification Matrix)

| Tầng (Tier) | Phạm Vi | Frontend Command | Backend Command | Điều Kiện Đạt (Exit Gate) |
|---|---|---|---|---|
| **Tier 1: Static & Syntax** | Phân tích tĩnh, typecheck, lint, formatting | `npm run lint`<br/>`npx tsc --noEmit` | `gradlew.bat compileJava`<br/>`gradlew.bat testClasses` | 0 lỗi linter, 0 lỗi TypeScript, Java compile sạch sẽ |
| **Tier 2: Runtime & Unit** | Unit test, component test, module boundary test | `npm test` (vitest) | `gradlew.bat test` | Toàn bộ unit test & `ApplicationModules.verify()` đỗ 100% |
| **Tier 3: E2E & Contract** | Đồng bộ hợp đồng API, kiểm tra luồng tích hợp, chống đặt trùng | `npm run gen:api`<br/>(kiểm tra `git diff` rỗng) | Testcontainers PostgreSQL integration test | API contract khớp 100%, không xung đột schema |

---

## 2. Câu Lệnh Xác Minh Tức Thì (Instant Verification Commands)

Các lệnh này được đóng gói trong thư mục `scripts/`:

```powershell
# Chạy trên Windows PowerShell từ thư mục gốc dự án:
.\scripts\verify.ps1 -Target fe -Tier 1      # Kiểm tra tĩnh Frontend
.\scripts\verify.ps1 -Target fe -Tier 2      # Chạy unit test Frontend
.\scripts\verify.ps1 -Target be -Tier 1      # Kiểm tra compile Backend
.\scripts\verify.ps1 -Target be -Tier 2      # Chạy test Backend
.\scripts\verify.ps1 -Target all            # Chạy toàn bộ Tier 1 và Tier 2 cả FE + BE
```

---

## 3. Quy Tắc Pass-State Gating

1. **Không tự xưng `passing` bằng suy diễn**: Agent tuyệt đối **không** được đánh dấu một task hoặc feature sang trạng thái `passing` trong `PROGRESS.md` nếu chưa thực sự chạy câu lệnh xác minh và nhận mã thoát `exit code 0`.
2. **Khắc phục điểm mù của Unit Test**:
   - Unit test không bắt được: Sai lệch kiểu dữ liệu API (Interface mismatch), rò rỉ tài nguyên kết nối DB, hoặc lỗi tương tranh đặt trùng phòng.
   - Bắt buộc kiểm tra Tier 3 cho các thay đổi liên quan đến API endpoint hoặc database migration.

---

## 4. Hướng Dẫn Sửa Lỗi Hướng Tới Agent (Agent-Oriented Error Messages)

Khi câu lệnh xác minh thất bại, Agent cần phân tích theo công thức 3 câu hỏi:
1. **WHAT**: Lỗi cụ thể là gì (file nào, dòng nào, mã lỗi gì)?
2. **WHY**: Nguyên nhân gốc rễ (do vi phạm kiểu TypeScript, thiếu cột trong DB, hay vi phạm ranh giới package của Spring Modulith)?
3. **HOW TO FIX**: Các bước cụ thể để khắc phục và câu lệnh tái xác minh ngay lập tức.

### Bảng xử lý một số lỗi thường gặp:

| Hiện tượng | Nguyên nhân phổ biến | Cách khắc phục |
|---|---|---|
| `ApplicationModules.verify()` fails | Package này truy cập nội bộ package khác trái phép | Di chuyển DTO/Interface ra package gốc của module (public API), giữ logic ẩn trong internal package |
| `npm run gen:api` fail / diff lớn | Backend thay đổi endpoint hoặc chưa chạy backend để lấy OpenAPI spec | Khởi động backend hoặc xuất file OpenAPI tĩnh, chạy lại gen:api và commit file type |
| `23P01 exclusion violation` trong test | PostgreSQL từ chối khoảng ngày trùng (`daterange`) | Đây là hành vi ĐÚNG của DB; cập nhật code Java để bắt SQLException/DataAccessException và ném ra `OverlapBookingException` |
| `tsc` báo thiếu thuộc tính | UI Component gọi field chưa khai báo trong schema Zod hoặc API type | Khớp lại Zod schema với API contract, cập nhật type |
