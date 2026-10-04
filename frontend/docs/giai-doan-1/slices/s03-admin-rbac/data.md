## S03 · Back-office: đăng nhập quản trị, nhân sự, phân quyền

### A01
| Trường | Ghi chú |
|---|---|
| email, password | Cùng cơ chế phiên cookie; endpoint riêng `POST /admin/auth/login` (từ chối nếu không có `staffRole`) |

### A18 – bảng nhân sự
| Cột / trường | Nguồn | Quy tắc / ghi chú |
|---|---|---|
| fullName, email | User | |
| staffRole | User | `ADMIN｜SUPPORT｜ACCOUNTANT` (hiển thị: Admin, CSKH, Kế toán) |
| status | User | `ACTIVE｜INVITED｜LOCKED` |
| lastLoginAt | User | ISO |
| createdBy / createdAt | ActivityLog | |
| **Tab Lịch sử**: hành động, người làm, thời gian, giá trị cũ→mới, lý do | ActivityLog | BR-ADM-03 |
| Form tạo: fullName, email, staffRole | | Email duy nhất; gửi lời mời [A12b] |
| Dialog khoá/đổi vai trò: reason | | bắt buộc, ≥10 ký tự |

| API | Mục đích |
|---|---|
| `GET /admin/staff?query=&role=&status=&page=` | Danh sách |
| `POST /admin/staff` | Tạo + gửi lời mời |
| `PATCH /admin/staff/:id/role` `{role,reason}` | Đổi vai trò |
| `POST /admin/staff/:id/lock` · `/unlock` `{reason}` | Khoá/mở khoá |
| `GET /admin/staff/:id/activity` | Lịch sử |
| Mã lỗi riêng | `403 FORBIDDEN_ROLE`, `409 LAST_ADMIN`, `409 SELF_ACTION` |

**Ma trận quyền menu (hằng số FE):** Admin = {identity-reviews, listing-reviews, staff}; CSKH, Kế toán = {} ở giai đoạn 1.

---

