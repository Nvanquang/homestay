# Cấu trúc, kiến trúc phân lớp và clean code

Mục tiêu: người mới biết đặt mã ở đâu, và kiến trúc không mục nát khi số module và slice tăng. Kiến trúc là **modular monolith**: mỗi module nghiệp vụ là một gói, bên trong phân lớp, giữa các module chỉ giao tiếp qua giao diện công khai hoặc sự kiện.

---

## 1. Cấu trúc dự án

```
backend/
├── pom.xml                     # parent: BOM, Enforcer, Spotless, phiên bản plugin
├── api/                        # ứng dụng Spring Boot (chạy ở chế độ api hoặc worker bằng profile)
│   └── src/
│       ├── main/java/com/booking/
│       │   ├── BookingApplication.java
│       │   ├── shared/         # nhân dùng chung: Clock, Money, ErrorCode, ngoại lệ, audit, idempotency, web chung
│       │   ├── accounts/       # tài khoản, xác thực, vai trò, quyền
│       │   ├── listings/  calendar/  pricing/  bookings/  payments/  ledger/  payouts/
│       │   ├── search/  messaging/  reviews/  disputes/  promotions/
│       │   ├── compliance/  files/  notifications/  admin/  reports/
│       └── main/resources/
│           ├── application.yml  application-local.yml  application-test.yml  application-prod.yml
│           └── db/migration/<module>/V…__mo-ta.sql
├── mock-gateway/               # cổng thanh toán giả (module Maven riêng)
├── infra/                      # docker-compose, script sao lưu/phục hồi, khởi tạo DB
└── docs/                       # adr/, threat-model.md
```

- Các module nghiệp vụ nằm ngay dưới gói gốc để **Spring Modulith** nhận diện. Danh sách trên là gợi ý, đối chiếu lại với 14 module của đặc tả (tách hoặc gộp cho khớp).
- `shared` là «nhân» nhỏ, **không chứa nghiệp vụ**; chỉ những thứ thật sự dùng chung (kiểu tiền, thời gian, mã lỗi, nền tảng web, audit, idempotency).
- Gói gốc của module là **giao diện công khai** của module; mọi gói con là nội bộ.

### 1.1. Bên trong một module

```
com.booking.bookings/
├── BookingsApi.java            # cổng vào công khai cho module khác (use case dạng interface)
├── BookingConfirmed.java       # sự kiện công khai (record, chỉ mang định danh và dữ liệu tối thiểu)
├── package-info.java           # đánh dấu @NullMarked
├── web/                        # controller, request/response DTO, mapper
├── application/                # dịch vụ use case (@Transactional), command, query
├── domain/                     # entity, value object, dịch vụ miền, policy, giao diện repository
└── infrastructure/             # repository JPA, truy vấn jOOQ, adapter ngoài, listener sự kiện
```

Không phải module nào cũng đủ cả bốn gói; chỉ tạo khi cần.

---

## 2. Kiến trúc phân lớp

```
web  →  application  →  domain  ←  infrastructure
```

| Lớp | Trách nhiệm | Không được làm |
|---|---|---|
| `web` | Nhận và kiểm tra cú pháp yêu cầu, gọi một use case, ánh xạ kết quả ra DTO, trả mã HTTP | Chứa logic nghiệp vụ, mở transaction, gọi repository, trả entity |
| `application` | Một use case một phương thức: kiểm tra quyền (đối tượng), điều phối miền và hạ tầng, **ranh giới transaction**, ghi audit, phát sự kiện | Biết HTTP (`HttpServletRequest`, mã trạng thái), chứa quy tắc nghiệp vụ chi tiết |
| `domain` | Quy tắc nghiệp vụ, bất biến, máy trạng thái, tính toán (giá, hoàn tiền), policy phân quyền theo đối tượng | Phụ thuộc Spring MVC, HTTP, jOOQ, thư viện ngoài; thực hiện I/O |
| `infrastructure` | Cài đặt lưu trữ, truy vấn, adapter dịch vụ ngoài, listener | Chứa quy tắc nghiệp vụ |

Quy tắc phụ thuộc:
- Chỉ phụ thuộc theo chiều mũi tên; `domain` không import `web`, `application`, `infrastructure`.
- Thực dụng: entity JPA được phép mang annotation JPA ở `domain`, nhưng không mang annotation web (Jackson, Spring MVC).
- **Giữa các module:** chỉ gọi qua `*Api` công khai hoặc nghe sự kiện công khai; không import gói con của module khác; không truy cập bảng của module khác bằng JOIN (đọc chéo module qua `*Api` hoặc một read model được phép). `ApplicationModules.verify()` kiểm tra điều này trong test.
- Phụ thuộc vòng giữa module bị cấm; phá vòng bằng sự kiện hoặc đẩy khái niệm chung xuống `shared`.

---

## 3. Tách DTO và Entity

**Bắt buộc, không ngoại lệ:** entity không rời khỏi tầng `application`/`domain` của module.

| Đối tượng | Nơi | Rời module được? | Ghi chú |
|---|---|---|---|
| Request DTO | `web` | Không | `record`, có annotation kiểm tra, **mỗi use case một DTO** |
| Command, Query | `application` | Không | Đã được kiểm tra và chuẩn hoá; không chứa trường server quyết định (người dùng hiện tại lấy từ ngữ cảnh bảo mật) |
| Entity, Value Object | `domain` | **Không** | Không có annotation Jackson; không có `getXxx()` trả ra danh sách thay đổi được |
| Read model, projection | `application` hoặc `infrastructure` | Không | Dùng cho truy vấn đọc (tìm kiếm, báo cáo) |
| Response DTO | `web` | Không | `record`, chỉ chứa trường được phép hiển thị cho **vai trò đó**; có thể có nhiều DTO cho cùng đối tượng (`GuestBookingView`, `HostBookingView`) |
| DTO/Interface công khai của module | Gói gốc module | Có | Kiểu tối thiểu cho module khác (ví dụ `BookingSummary`) |
| Sự kiện | Gói gốc module | Có | `record` bất biến, mang định danh và dữ liệu tối thiểu, **không mang entity, không mang dữ liệu cá nhân thừa** |

Quy tắc chống gán hàng loạt (mass assignment):
- Cấm gán thẳng DTO vào entity bằng phản chiếu (`BeanUtils.copyProperties`, ánh xạ tự động hai chiều). Cập nhật qua **phương thức nghiệp vụ** của entity (`booking.cancel(reason, actor)`), không qua setter công khai.
- Request DTO **không bao giờ** chứa các trường: `id` của đối tượng đang tạo, `role`, `status`, `price`, `fee`, `ownerId`/`hostId`/`guestId` (lấy từ phiên), `createdAt`, `version`, cờ xác minh.
- Cấu hình Jackson **từ chối trường lạ** ở yêu cầu vào; thêm trường không khai báo bị 400 thay vì bị bỏ qua.
- Mapping bằng MapStruct hoặc phương thức tĩnh; mỗi mapper có test cho từng trường nhạy cảm không lọt ra.
- Có test tự động: serialize mọi Response DTO và khẳng định không chứa tên trường cấm (`passwordHash`, `token`, `secret`, `idDocument`, `iban`, …).

---

## 4. Áp dụng SOLID

| Nguyên tắc | Áp dụng cụ thể trong dự án |
|---|---|
| **S**ingle Responsibility | Một lớp một lý do thay đổi: `PricingEngine` chỉ tính giá; `RefundCalculator` chỉ tính hoàn tiền; `BookingStateMachine` chỉ quyết định chuyển trạng thái; `LedgerService` là nơi duy nhất ghi bút toán |
| **O**pen/Closed | Mở rộng bằng dữ liệu hoặc chiến lược, không sửa lõi: quy tắc giá là chuỗi quy tắc có thứ tự ưu tiên; chính sách huỷ là **bảng mốc theo dữ liệu**; thêm phương thức thanh toán là thêm một adapter |
| **L**iskov Substitution | Adapter thật và adapter giả của `PaymentGateway`, `FileStorage`, `Mailer` đều phải qua **cùng một bộ test hợp đồng** để thay nhau được |
| **I**nterface Segregation | Cổng nhỏ theo nhu cầu (`PaymentGateway` chỉ có khởi tạo thanh toán, truy vấn trạng thái, hoàn tiền); không tạo interface «thần thánh» |
| **D**ependency Inversion | `application` phụ thuộc interface do `domain` hoặc `application` định nghĩa; `infrastructure` cài đặt; dùng constructor injection |

Không tạo interface cho thứ chỉ có một cài đặt và không có ranh giới ngoài (ví dụ `BookingServiceImpl` đi kèm `BookingService`).

---

## 5. DRY, KISS, YAGNI

### DRY: không lặp lại **tri thức**

Mỗi luật nghiệp vụ có đúng **một nơi** cài đặt:

| Tri thức | Nơi duy nhất |
|---|---|
| Cách tính giá, phí, thuế | `PricingEngine` (tìm kiếm, báo giá, thanh toán, đổi booking đều gọi) |
| Chuyển trạng thái booking | `BookingStateMachine` |
| Ghi tiền | `LedgerService` |
| Làm tròn, định dạng tiền | `Money` |
| Mã lỗi và mã HTTP tương ứng | `ErrorCode` |
| Kiểm tra quyền theo đối tượng | Các lớp policy ở `domain` |
| Lấy thời gian hiện tại | `Clock` |

Nhưng **không** ép DRY cho trùng lặp ngẫu nhiên: mỗi use case có DTO riêng, test có dữ liệu riêng. Quy tắc «ba lần»: lặp hai lần thì chấp nhận, lần thứ ba mới trừu tượng hoá.

### KISS

- Chọn cách đơn giản nhất thoả bất biến: ràng buộc DB thay cho thuật toán phức tạp ở code.
- Không dùng mẫu thiết kế khi một hàm là đủ; không tạo lớp trừu tượng khi chỉ có một lựa chọn.
- Một use case đọc từ trên xuống dưới được; nếu cần sơ đồ để hiểu một phương thức, hãy tách nhỏ.

### YAGNI: những thứ **chưa làm** và điều kiện xem lại

| Chưa làm | Làm khi |
|---|---|
| Message broker (Kafka, RabbitMQ) | Cần giao tiếp giữa nhiều tiến trình độc lập hoặc khối lượng sự kiện vượt khả năng một DB |
| Redis, cache phân tán | Chạy nhiều instance cần giới hạn tốc độ/phiên/cache chung, hoặc đo thấy DB là nút cổ chai |
| CQRS, event sourcing | Mô hình đọc thật sự tách khỏi ghi với khối lượng lớn (sổ cái đã chỉ-thêm là đủ) |
| OAuth2/OIDC/JWT | Cần đăng nhập bên thứ ba, ứng dụng di động, hoặc nhiều dịch vụ độc lập |
| Bộ máy chính sách (OPA, Cedar) | Luật phân quyền nhiều tới mức khó giữ trong code |
| Row-level security của PostgreSQL | Nhiều tenant dùng chung bảng |
| Tách microservice | Khác biệt rõ về quy mô hoặc đội ngũ, kèm bằng chứng |
| Feature flag | Cần phát hành từng phần cho người dùng thật |
| Multi-tenancy | Có yêu cầu nhiều doanh nghiệp trên cùng nền tảng |

---

## 6. Quy ước viết mã

### 6.1. Đặt tên và cỡ

| Mục | Quy tắc |
|---|---|
| Tên | Tiếng Anh, theo ngôn ngữ nghiệp vụ (`checkIn`, `holdExpiresAt`), tên nói lên ý định; không viết tắt khó hiểu |
| Lớp use case | Động từ: `HoldBooking`, `CancelBooking`, `ConfirmPayment` (hoặc `BookingCommands` gom theo nhóm nhỏ) |
| Phương thức | Ngắn, một việc; khoảng 30 dòng là ngưỡng nên tách; tối đa 4 tham số (nhiều hơn thì gom thành đối tượng) |
| Cờ boolean làm tham số | Tránh; tách thành hai phương thức hoặc dùng enum |
| Hằng số | Không số hoặc chuỗi «ma thuật»; giá trị nghiệp vụ nằm trong cấu hình (`SystemConfig`), giá trị kỹ thuật nằm trong hằng có tên |
| Chú thích | Giải thích **vì sao**, không giải thích **cái gì**; tài liệu Javadoc cho giao diện công khai của module |

### 6.2. Java

- **Bất biến mặc định:** `record` cho DTO, command, sự kiện, value object; trường `final`; bộ sưu tập trả ra là không sửa được.
- **Constructor injection** duy nhất; cấm field injection (`@Autowired` trên trường); không trạng thái tĩnh có thể thay đổi.
- **Không Lombok** (đã chốt ở kiến trúc): dùng `record` và mã tường minh.
- **Null:** đánh dấu gói `@NullMarked` (JSpecify); trả về `Optional` chỉ cho kết quả có thể vắng mặt ở giao diện, không dùng làm tham số hay trường.
- **Thời gian:** `Instant` cho thời điểm, `LocalDate` cho ngày lưu trú, `ZoneId` của listing cho quy đổi; **không** gọi `now()` trực tiếp, luôn qua `Clock`.
- **Tiền:** chỉ qua `Money`; cấm `double`/`float` cho tiền.
- **Số ngẫu nhiên và mã:** `SecureRandom` cho mọi giá trị liên quan bảo mật.
- **Stream:** dùng vừa phải, không lồng sâu; ưu tiên vòng lặp rõ ràng khi có tác dụng phụ.
- **`equals`/`hashCode` của entity:** dựa trên định danh; tránh dùng entity làm khoá map khi chưa có id.
- **Phạm vi truy cập:** mặc định package-private; chỉ `public` khi thuộc giao diện module hoặc framework yêu cầu.

### 6.3. Ngoại lệ (tóm tắt; chi tiết ở file 03)

- Ném ngoại lệ miền **không kiểm tra (unchecked)** có mã lỗi; không ném `Exception`/`RuntimeException` trần.
- Không bắt `Exception` rộng để nuốt lỗi; không dùng ngoại lệ để điều khiển luồng bình thường.

### 6.4. Cấu hình

- Cấu hình có kiểu: `@ConfigurationProperties` bằng `record`, có `@Validated`; không rải `@Value` trong mã nghiệp vụ.
- Không giá trị nghiệp vụ viết cứng (phí, thuế, thời hạn, ngưỡng): đọc từ `SystemConfig`/`CountryConfig` có hiệu lực theo thời điểm.

---

## 7. Công cụ kiểm tra tự động

| Công cụ | Việc |
|---|---|
| Spotless | Định dạng thống nhất; kiểm tra trong `verify` |
| Maven Enforcer | Phiên bản Java/Maven, hội tụ phụ thuộc, cấm phụ thuộc xấu |
| Cờ biên dịch | Bật cảnh báo đầy đủ, coi cảnh báo là lỗi |
| Spring Modulith | `ApplicationModules.verify()` |
| ArchUnit | Quy tắc lớp: controller không import entity/repository; `domain` không import web/infrastructure; cấm `now()`; cấm `@Autowired` trên trường; cấm `printStackTrace` |
| SpotBugs + FindSecBugs | Phân tích tĩnh có luật bảo mật (chạy trong CI) |
| Error Prone + NullAway | Tuỳ chọn, bật khi nền ổn định |

---

## 8. Danh sách kiểm tra cho người review

- [ ] Logic nghiệp vụ nằm ở `domain`/`application`, không ở controller hay repository?
- [ ] Có entity rời khỏi module hoặc lọt ra response không? Response DTO chỉ chứa trường được phép?
- [ ] Request DTO có chứa trường mà server phải quyết định (role, status, price, owner)?
- [ ] Module gọi module khác chỉ qua `*Api` hoặc sự kiện?
- [ ] Luật nghiệp vụ mới có bị cài đặt ở hai nơi? Có dùng `PricingEngine`, `LedgerService`, `BookingStateMachine`, `Money`, `Clock` chưa?
- [ ] Có giá trị nghiệp vụ viết cứng không?
- [ ] Constructor injection, bất biến, không `Lombok`, không `now()` trực tiếp?
- [ ] Phương thức quá dài hoặc quá nhiều tham số?
- [ ] Có thêm thư viện hoặc trừu tượng chưa cần (vi phạm YAGNI)?
