## S01 · Đăng ký, xác minh email, đăng nhập, quên mật khẩu

### Dữ liệu nhập / hiển thị
| Màn | Trường | Kiểu | Nguồn | Bắt buộc | Quy tắc | Hiển thị cho |
|---|---|---|---|---|---|---|
| P07 | fullName | text | User.fullName | ✓ | 2–80 | Chủ sở hữu |
| P07 | email | email | User.email | ✓ | định dạng, ≤254, chữ thường, duy nhất | Chủ sở hữu |
| P07 | password | secret | User (băm Argon2, **Chỉ BE**) | ✓ | [A4] ≥8, chữ+số, ≤128 | – (không bao giờ trả về) |
| P07 | acceptTerms | boolean | (ghi UserConsent ở giai đoạn sau) | ✓ | phải true | – |
| P07 (sau gửi) | maskedEmail | text | – | – | "an***@mail.com" | Chủ sở hữu |
| P07 (sau gửi) | resendAvailableIn | số giây | SystemConfig | – | 60 s | |
| P06 | email, password, rememberMe | | | ✓,✓,✗ | | |
| P06 (lỗi) | lockedUntil, attemptsLocked | ISO | User/BE | – | không trả số lần còn lại | |
| P09 | token | string (query) | – | ✓ | dùng một lần, có hạn | |
| P09 (kết quả) | result | `VERIFIED｜EXPIRED｜USED｜INVALID` | – | – | | |
| P08 B1 | email | | | ✓ | | |
| P08 B2 | token, newPassword, confirmPassword | | | ✓ | trùng khớp; chính sách mật khẩu | |

### API đề xuất
| Method & path | Mục đích | Phản hồi chính |
|---|---|---|
| `POST /auth/register` | Đăng ký | 201 `{ emailMasked, resendAvailableIn }` · 409 email tồn tại · 422 · 429 |
| `POST /auth/verify-email` `{token}` | Xác minh (**gọi 1 lần**) | 200 `{result}` |
| `POST /auth/resend-verification` `{email}` | Gửi lại | 204 · 429 `{retryAfterSec}` |
| `POST /auth/login` | Đăng nhập; đặt cookie HttpOnly | 200 `User` · 401 · 403 `EMAIL_UNVERIFIED` · 423 `{lockedUntil}` |
| `POST /auth/logout` | Đăng xuất | 204 |
| `POST /auth/forgot-password` `{email}` | Yêu cầu đặt lại | 202 (luôn trung tính) |
| `GET /auth/reset-password/validate?token=` | Kiểm tra token ngay khi mở trang | 200 `{valid, reason?}` |
| `POST /auth/reset-password` `{token,newPassword}` | Đặt lại | 204 · 410 token hết hạn/đã dùng |
| `GET /me` | Khởi tạo phiên | 200 `User` · 401 |

### Cấu hình liên quan (SystemConfig – seed)
`auth.maxFailedAttempts`, `auth.lockMinutes`, `auth.verifyTokenTtlHours`, `auth.resetTokenTtlMinutes`, `auth.resendCooldownSec` (60), `auth.resendMaxPerHour` (3), `auth.passwordMinLength` (8).

### Dữ liệu seed cho demo (S01 AC: mỗi vai trò có tài khoản mẫu)
| Tài khoản mẫu | Vai trò | Trạng thái |
|---|---|---|
| `guest@demo.test` | Guest | Đã xác minh email |
| `host.pending@demo.test` | Host | Đã bật chế độ Host, hồ sơ **chưa nộp** |
| `host@demo.test` | Host | Hồ sơ **đã duyệt**, có vài listing ở các trạng thái khác nhau |
| `admin@demo.test` · `support@demo.test` · `accountant@demo.test` | Admin · CSKH · Kế toán | Hoạt động |
| `unverified@demo.test` | Guest | **Chưa xác minh email** (để thử đường lỗi P06) |
Mật khẩu mẫu ghi trong README seed; Mailpit xem email tại cổng được cấu hình trong Docker Compose.

---

