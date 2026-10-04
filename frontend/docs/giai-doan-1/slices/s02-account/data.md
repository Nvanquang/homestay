## S02 · Hồ sơ và cài đặt

| Màn | Trường | Kiểu | Nguồn | Bắt buộc | Quy tắc | Hiển thị cho |
|---|---|---|---|---|---|---|
| C01 | avatar | ảnh | User.avatarUrl | ✗ | JPG/PNG/WebP ≤5MB [A5], cắt vuông | Công khai (khi là Host: P04) |
| C01 | fullName | text | User.fullName | ✓ | 2–80 | Công khai (rút gọn tuỳ ngữ cảnh) |
| C01 | email | text (đọc) + emailVerified | User | – | không sửa được | Chủ sở hữu |
| C01 | phone | tel | User.phone | ✗ | chuẩn hoá | Chủ sở hữu |
| C01 | bio | textarea | User.bio | ✗ | ≤300 [Assumption] | Công khai (P04) |
| C01 | verificationStatus | enum | IdentityVerification | – | badge | Chủ sở hữu |
| C02 | language | select | User.language | ✓ | `vi/en` | Chủ sở hữu |
| C02 | displayCurrency | select | User.displayCurrency | ✗ | disabled tới S13 | Chủ sở hữu |
| C02 | currentPassword / newPassword / confirm | secret | – | ✓ | khác mật khẩu cũ; chính sách mật khẩu | – |
| C02 | hostModeEnabled | switch | User.isHost | – | một chiều [A11] | Chủ sở hữu |

| API | Mục đích |
|---|---|
| `PATCH /me` `{fullName,phone,bio,language,displayCurrency}` | Cập nhật hồ sơ/cài đặt |
| `POST /me/avatar` (qua luồng upload 0.3) · `DELETE /me/avatar` | Ảnh đại diện |
| `POST /me/password` `{current,new}` | Đổi mật khẩu → 204 (BE đăng xuất phiên khác) · 422 `WRONG_CURRENT` |
| `POST /me/host-mode` | Bật chế độ Host → 200 `{isHost:true, hostVerification}` |

---

