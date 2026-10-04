# Kế Hoạch 14 Slices Nghiệp Vụ (Vertical Slices Roadmap)

Theo tài liệu kiến trúc, hệ thống được phát triển theo từng vertical slice khép kín từ Database $\rightarrow$ Backend $\rightarrow$ Frontend UI. Không dựng dàn trải tất cả các module cùng lúc.

---

## Danh Sách 14 Slices Nghiệp Vụ

| Slice | Mã | Phạm Vi Nghiệp Vụ | Thư Viện Backend Chính | Thư Viện Frontend Chính |
|---|---|---|---|---|
| **S01** | `auth` | Đăng ký, đăng nhập, bảo mật phiên, phân quyền (Guest/Host/Admin) | Spring Security, Spring Session JDBC, Argon2, Datafaker | Next.js App Router, Zod, React Hook Form, shadcn/ui |
| **S02** | `profile` | Quản lý hồ sơ người dùng, xác thực danh tính giả (Admin duyệt) | MinIO S3 SDK, Spring Validation | react-dropzone, Sonner |
| **S03** | `listing-core` | Tạo listing phòng nhiều bước, lưu bản nháp, danh mục | JPA, Bean Validation, Testcontainers | dnd-kit, Zod Multi-step form |
| **S04** | `pricing-rule` | Cấu hình giá cơ bản, giá cuối tuần, phí dọn dẹp, tiền tệ | PricingEngine, BigDecimal/MinorUnit, Clock | Radix Popover, Numeric Input |
| **S05** | `calendar` | Quản lý lịch phòng, ngày chặn, số đêm tối thiểu | PostgreSQL `daterange`, PostGIS | react-day-picker (khoảng ngày), Date-fns |
| **S06** | `booking-hold` | Giữ chỗ 15 phút, chống đặt trùng (Exclusion Constraint `23P01`) | PostGIS Exclusion constraint, Spring Modulith Events | Countdown timer (dựa trên server UTC), Vaul drawer |
| **S07** | `payment-mock` | Tích hợp cổng thanh toán giả, webhook HMAC, kịch bản lỗi | Mock Gateway, RestClient, HMAC-SHA256 | Iframe/Redirect sang Mock Gateway, Sonner |
| **S08** | `cancellation` | Chính sách hủy phòng (Linh hoạt/Vừa/Nghiêm ngặt), tính toán hoàn tiền | PricingEngine cancellation calculator | Dialog xác nhận hoàn tiền, breakdown chi phí |
| **S09** | `payout-ledger` | Sổ cái bất biến (Double-entry ledger), quyết toán Host (T+1 ngày) | Sổ cái bút toán Nợ/Có (Immutable Ledger) | TanStack Table, Recharts |
| **S10** | `messaging` | Nhắn tin giữa Guest và Host trong bối cảnh booking | Polling / SSE API | Chat UI, Auto-scroll |
| **S11** | `search-map` | Tìm kiếm theo địa điểm, ngày, số khách, khoảng giá, bản đồ | jOOQ, PostGIS ST_DWithin / ST_Contains | mapbox-gl, react-map-gl, nuqs URL state |
| **S12** | `review` | Đánh giá hai chiều sau khi check-out, điều kiện đánh giá mù | Review module, Scheduled unlock | Star rating, Dialog review |
| **S13** | `dispute-admin` | Khiếu nại, CSKH xử lý hoàn tiền hoặc đền bù, khoá listing | Admin module, ActivityLog | Back-office Data Table, Action buttons |
| **S14** | `sync-ical` | Đồng bộ lịch hai chiều qua iCal (AirBnb, Google Calendar) | ical4j, ShedLock periodic worker | Input iCal URL, Sync status indicator |
