# Cấu trúc, kiến trúc phân lớp và clean code

Mục tiêu: người mới biết đặt mã ở đâu, và kiến trúc không mục nát khi số module và slice tăng. Kiến trúc là **modular monolith**: mỗi module nghiệp vụ là một gói, bên trong phân lớp, giữa các module chỉ giao tiếp qua giao diện công khai hoặc sự kiện.

---

## 1. Cấu trúc dự án

```
backend/
├── build.gradle                # Cấu hình Gradle: Java 21, Spring Boot 4.1.1, Modulith, Lombok
├── gradlew / gradlew.bat       # Gradle Wrapper
├── src/
│   ├── main/
│   │   ├── java/backend/homestaybooking/
│   │   │   ├── BackendApplication.java
│   │   │   ├── shared/         # Nhân dùng chung: Clock, Money, ErrorCode, GlobalExceptionHandler, SecurityConfig, AuditService, Idempotency
│   │   │   ├── auth/           # Module S01: Xác thực, phân quyền RBAC, token, phiên đăng nhập
│   │   │   ├── listing/        # Module Listing, tiện nghi, quy tắc, chính sách
│   │   │   ├── pricing/        # Module Tính giá, bảng giá theo mùa, khuyến mãi
│   │   │   ├── booking/        # Module Đặt phòng, giữ chỗ, máy trạng thái
│   │   │   ├── payment/        # Module Thanh toán, webhook cổng thanh toán
│   │   │   ├── search/         # Module Tìm kiếm, lọc, toạ độ không gian
│   │   │   ├── messaging/      # Module Tin nhắn giữa Host và Guest
│   │   │   ├── review/         # Module Đánh giá và phản hồi
│   │   │   ├── dispute/        # Module Tranh chấp và khiếu nại
│   │   │   ├── admin/          # Module Quản trị hệ thống, phê duyệt listing/KYC
│   │   │   ├── finance/        # Module Kế toán, sổ cái đối soát doanh thu, payout
│   │   │   ├── notification/   # Module Thông báo (email, push, SMS)
│   │   │   ├── report/         # Module Báo cáo thống kê
│   │   │   └── audit/          # Module Kiểm toán sự kiện hệ thống
│   │   └── resources/
│   │       ├── application.yaml  application-local.yaml  application-test.yaml
│   │       └── db/migration/   # Flyway migrations: V1__init..., V2__create_auth...
│   └── test/                   # Unit tests, Integration tests, ModulithTests, ArchitectureTests
└── docs/                       # Tài liệu thiết kế kiến trúc và đặc tả base
```

- Các module nghiệp vụ nằm ngay dưới gói gốc `backend.homestaybooking.*` để **Spring Modulith** nhận diện tự động.
- `shared` là «nhân» dùng chung (shared kernel), **không chứa nghiệp vụ cụ thể**; chỉ cung cấp các nền tảng dùng chung (tiền tệ, đồng hồ thời gian, mã lỗi, bảo mật, audit, idempotency).
- Gói gốc và giao diện service của module là **giao diện công khai**; các gói implementation (`impl`), repository, entity là nội bộ của module.

### 1.1. Cấu trúc chuẩn bên trong một module nghiệp vụ

Mọi module nghiệp vụ (ví dụ: `auth`, `listing`, `booking`...) được chuẩn hóa phân chia theo các thư mục chức năng:

```
backend.homestaybooking.<module>/
├── entity/                 # Các thực thể JPA (@Entity) ánh xạ bảng CSDL; sử dụng Lombok
├── repository/             # Các interface Spring Data JPA Repository
├── service/                # Giao diện dịch vụ nghiệp vụ (Interfaces)
│   └── impl/               # Lớp triển khai cụ thể (@Service, @RequiredArgsConstructor, @Slf4j)
├── dto/                    # Các Java record bất biến phục vụ Request/Response contract (khớp OpenAPI)
├── web/                    # REST Controllers (@RestController, @RequestMapping)
└── package-info.java       # Khai báo ranh giới module Spring Modulith
```

---

## 2. Kiến trúc phân lớp

Luồng phụ thuộc một chiều chuẩn mực:

```
web (Controller)  →  service (Interface)  →  service.impl (Service Implementation)
                             ↓                         ↓
                            dto               repository  →  entity
```

| Lớp | Trách nhiệm | Không được làm |
|---|---|---|
| `web` | Nhận và kiểm tra cú pháp yêu cầu (`@Valid`), gọi `service`, ánh xạ kết quả ra DTO, trả mã HTTP RFC 9457 | Chứa logic nghiệp vụ, mở transaction, gọi `repository`, import hay trả `entity` ra client |
| `service` | Khai báo hợp đồng nghiệp vụ (Interface): use case rõ ràng, nhận/trả DTO hoặc kiểu miền | Phụ thuộc chi tiết hạ tầng hay công nghệ lưu trữ |
| `service.impl` | Triển khai use case: kiểm tra quyền, điều phối miền và repository, **ranh giới transaction (`@Transactional`)**, ghi audit log, phát sự kiện | Biết HTTP (`HttpServletRequest`, mã HTTP), chứa logic format view của client |
| `repository` | Cài đặt truy vấn CSDL qua Spring Data JPA, thực hiện các câu lệnh cập nhật nguyên tử (atomic update) chống race condition | Chứa quy tắc nghiệp vụ phức tạp |
| `entity` | Thực thể JPA đại diện cho mô hình dữ liệu quan hệ; ứng dụng **Lombok** để loại bỏ boilerplate | Bị lộ ra tầng `web` hoặc serialize trực tiếp thành JSON response |
| `dto` | Java `record` bất biến mang dữ liệu qua các tầng; kiểm tra hợp lệ bằng Jakarta Validation | Mang logic xử lý CSDL hay nghiệp vụ phức tạp |

Quy tắc phụ thuộc và bất biến kiến trúc (được kiểm tra tự động bởi ArchUnit):
- **Controller không phụ thuộc Entity/Repository:** Controller chỉ được phép phụ thuộc vào `service` và `dto`.
- **Ranh giới module:** Giữa các module chỉ giao tiếp qua Service interface công khai hoặc sự kiện; không import trực tiếp repository, entity hoặc lớp nội bộ (`impl`) của module khác.
- **Tính độc lập của `shared`:** Package `shared` là nhân nền tảng, tuyệt đối không phụ thuộc vào bất kỳ module nghiệp vụ cụ thể nào.
- **Bất biến thời gian:** Mọi thao tác lấy thời gian bắt buộc qua bean `java.time.Clock`, cấm gọi trực tiếp `Instant.now()`, `LocalDateTime.now()`.

---

## 3. Tách DTO và Entity

**Bắt buộc, không ngoại lệ:** entity không rời khỏi tầng `service`/`repository` của module.

| Đối tượng | Nơi | Rời module được? | Ghi chú |
|---|---|---|---|
| Request DTO | `dto` | Không | `record`, có annotation validation (`@NotBlank`, `@Size`, `@Email`...) |
| Response DTO | `dto` | Có (nếu là kiểu trả về của Service) | `record`, chỉ chứa trường được phép hiển thị cho vai trò đó; không lộ thông tin nhạy cảm |
| Entity | `entity` | **Không** | `@Entity` JPA, dùng Lombok (`@Getter`, `@Setter`, `@Builder`); tuyệt đối không trả ra controller |
| Projection / Read model | `dto` hoặc `repository` | Không | Dùng cho truy vấn đọc tối ưu (báo cáo, tìm kiếm) |
| Sự kiện Modulith | Gói gốc module | Có | `record` bất biến, mang định danh và dữ liệu tối thiểu, không mang entity |

Quy tắc chống gán hàng loạt (mass assignment):
- Cấm sao chép tự động DTO vào entity bằng phản chiếu (`BeanUtils.copyProperties`).
- Request DTO **không bao giờ** chứa các trường do máy chủ quyết định: `id` của đối tượng đang tạo, `role`, `status`, `price`, `ownerId`/`userId` (luôn lấy từ phiên đăng nhập), `createdAt`, `lockedUntil`.
- Cấu hình Jackson từ chối trường lạ ở yêu cầu vào (HTTP 400 thay vì âm thầm bỏ qua).

---

## 4. Áp dụng SOLID & Thiết kế Hướng Giao Diện

| Nguyên tắc | Áp dụng cụ thể trong dự án |
|---|---|
| **S**ingle Responsibility | Một lớp một lý do thay đổi: `PricingEngine` chỉ tính giá; `TokenService` chỉ quản lý token; `AuthService` điều phối phiên; `LedgerService` ghi sổ cái |
| **O**pen/Closed | Mở rộng qua cấu hình và chiến lược: quy tắc giá theo thứ tự ưu tiên; chính sách hủy theo bảng mốc dữ liệu; phương thức thanh toán thêm adapter mới |
| **L**iskov Substitution | Adapter thật và adapter mock (ví dụ: cổng thanh toán, gửi mail giả lập) đều thỏa mãn cùng một Interface hợp đồng |
| **I**nterface Segregation | Tách nhỏ interface theo nhu cầu (`TokenService` tách riêng với `AuthService`); Controller chỉ phụ thuộc vào Interface nghiệp vụ cần thiết |
| **D**ependency Inversion | Tầng `web` phụ thuộc vào Interface `service`; triển khai nằm ở `service.impl`; sử dụng constructor injection thông qua Lombok `@RequiredArgsConstructor` |

---

## 5. DRY, KISS, YAGNI

### DRY: Không lặp lại tri thức nghiệp vụ

Mỗi luật nghiệp vụ có đúng **một nơi** cài đặt duy nhất:

| Tri thức | Nơi duy nhất |
|---|---|
| Cách tính giá, phụ phí, thuế | `PricingEngine` (Backend làm chủ quyền tính giá theo Invariant) |
| Chuyển trạng thái đặt phòng | `BookingStateMachine` |
| Ghi sổ cái và tiền | `LedgerService` |
| Làm tròn, quy đổi tiền tệ | Value Object `Money` |
| Danh mục mã lỗi và HTTP status | Enum `ErrorCode` chuẩn hóa |
| Xác thực, cấp token, mã hóa mật khẩu | `AuthService` & `TokenService` |
| Lấy thời gian hiện tại | Bean `java.time.Clock` |

### KISS: Đơn giản và Thực dụng

- Chọn cách đơn giản nhất thỏa mãn bất biến: dùng ràng buộc PostgreSQL (như `chk_users_email_lowercase`, exclusion constraint `btree_gist`) thay cho thuật toán kiểm tra phức tạp và dễ gặp race condition trong code.
- Áp dụng phân lớp rõ ràng: `entity`, `repository`, `service`, `impl`, `dto`, `web` giúp cấu trúc dự án đồng nhất, dễ đọc, dễ bảo trì.

### YAGNI: Những thứ chưa làm khi chưa có nhu cầu thực tế

- Chưa dùng Kafka/RabbitMQ khi PostgreSQL Outbox + Spring Modulith Events là đủ.
- Chưa dùng Redis phân tán khi Spring Session JDBC và Bucket4j in-memory đáp ứng tốt yêu cầu hiện tại.
- Chưa dùng JWT/OAuth2 phức tạp khi hệ thống dùng Session Cookie HttpOnly chuẩn OWASP.

---

## 6. Quy ước viết mã (Clean Code Guidelines)

### 6.1. Đặt tên và cấu trúc

| Mục | Quy tắc |
|---|---|
| Ngôn ngữ mã nguồn | Tiếng Anh thống nhất (`UserEntity`, `AuthService`, `LoginRequest`) |
| Gói và thư mục | Chữ thường, phân chia rõ ràng: `entity`, `repository`, `service`, `service.impl`, `dto`, `web` |
| Phương thức | Ngắn gọn, tập trung một nhiệm vụ; tối đa 4 tham số (nhiều hơn gom thành đối tượng/record) |
| Hằng số | `UPPER_SNAKE_CASE`, nằm trong cấu hình hoặc lớp liên quan; không dùng chuỗi/số ma thuật |
| Chú thích | Tập trung giải thích **vì sao** (lý do thiết kế, quyết định kiến trúc), không giải thích cú pháp hiển nhiên |

### 6.2. Ứng dụng Lombok & Java Hiện Đại

- **Lombok trên Entity:**
  - Bắt buộc dùng `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder` trên các lớp `@Entity`.
  - **Tuyệt đối không viết getter/setter thủ công**, giữ entity ngắn gọn và tập trung vào các trường dữ liệu và ràng buộc JPA.
  - Các phương thức nghiệp vụ đặc thù (như `isEmailVerified()`, `isHost()`, kiểm tra logic) được viết tường minh bên trong entity.
- **Lombok trên Service và Controller:**
  - Bắt buộc dùng `@RequiredArgsConstructor` để tự động sinh constructor injection cho toàn bộ các trường `private final`.
  - Cấm sử dụng Field Injection (`@Autowired` trên trường).
  - Sử dụng `@Slf4j` cho việc ghi log nghiệp vụ và kiểm toán.
- **DTO và Value Object:**
  - Bắt buộc dùng Java `record` bất biến; không dùng Lombok cho DTO.
- **Thời gian & Tiền tệ:**
  - Luôn inject `Clock` để lấy thời gian (`clock.instant()`). Cấm gọi `Instant.now()`, `LocalDateTime.now()`.
  - Toàn bộ giá trị tiền tệ sử dụng Value Object `Money` bất biến.

### 6.3. Ngoại lệ và Xử lý lỗi

- Ném ngoại lệ nghiệp vụ `BusinessException` đi kèm `ErrorCode` định danh.
- Tất cả lỗi trả về client đều được bắt tự động bởi `GlobalExceptionHandler` theo chuẩn **RFC 9457 Problem Details**.

---

## 7. Công cụ kiểm tra tự động và Cổng chất lượng

Hệ sinh thái kiểm thử đảm bảo kiến trúc không bị thoái hóa:

| Công cụ | Nhiệm vụ xác minh |
|---|---|
| **Gradle Compiler** | `cmd /c "gradlew.bat compileJava compileTestJava"` kiểm tra cú pháp và xử lý annotation Lombok |
| **ArchUnit (`ArchitectureTests`)** | Cấm controller phụ thuộc entity/repository; cấm gọi `now()` trực tiếp; cấm `shared` phụ thuộc module nghiệp vụ |
| **Spring Modulith (`ModulithTests`)** | Kiểm tra tính đóng gói và ranh giới giữa 14 module nghiệp vụ |
| **Verification Runner (`verify.ps1`)** | Script chạy kiểm thử đa tầng tự động: `.\scripts\verify.ps1 -Target be` |

---

## 8. Danh sách kiểm tra khi Review Code (Checklist)

- [ ] Thực thể JPA nằm trong `entity/`, sử dụng Lombok (`@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`), không có getter/setter thủ công?
- [ ] Repository nằm trong `repository/`, kế thừa `JpaRepository`?
- [ ] Nghiệp vụ được khai báo Interface trong `service/` và triển khai trong `service/impl/`?
- [ ] Lớp triển khai Service và Controller sử dụng `@RequiredArgsConstructor` và `@Slf4j`?
- [ ] DTO là Java `record` nằm trong `dto/`, không có entity nào bị lọt ra ngoài controller?
- [ ] Controller trong `web/` chỉ phụ thuộc vào `service` và `dto`, tuyệt đối không gọi `repository` hay `entity`?
- [ ] Mọi thao tác lấy thời gian đều qua `Clock`, không có lời gọi `Instant.now()` trực tiếp?
- [ ] Toàn bộ test của Gradle (`ArchitectureTests`, `ModulithTests`, Unit tests) đều đạt chuẩn với exit code 0?
