# Toàn vẹn dữ liệu, giao dịch và đồng thời

Đây là trọng tâm của backend: hệ thống đặt phòng phải **không bao giờ** đặt trùng, sai tiền hay mất dấu thanh toán, kể cả khi có nhiều yêu cầu song song, callback trùng, job chạy chồng hay lỗi giữa chừng. Nguyên tắc chủ đạo: **cơ sở dữ liệu là trọng tài cuối cùng**; mã ứng dụng chỉ giúp báo lỗi sớm và dễ hiểu.

---

## 1. Ràng buộc và thiết kế schema

### 1.1. Quy tắc chung

| Chủ đề | Quy định |
|---|---|
| Khoá chính | UUID (ưu tiên loại sắp theo thời gian như UUIDv7 để chỉ mục thân thiện); không dùng số tuần tự lộ ra ngoài |
| `NOT NULL` | Mặc định cho mọi cột; cột cho phép `NULL` phải có lý do |
| Khoá ngoại | Luôn khai báo; `ON DELETE RESTRICT` (không xoá lan truyền với dữ liệu tài chính và danh tính) |
| `CHECK` | Số tiền ≥ 0, số đêm > 0, ngày check-out > check-in, trạng thái thuộc tập cho phép, mã tiền tệ đúng định dạng |
| `UNIQUE` | Email chuẩn hoá, khoá idempotency theo phạm vi, giao dịch cổng theo cổng, hoàn tiền theo thanh toán, đánh giá theo (booking, bên), khiếu nại theo (booking, bên) |
| Thời gian | `timestamptz` (UTC) ở mọi nơi; ngày lưu trú dùng `date`; múi giờ IANA lưu ở listing |
| Tiền | `bigint` đơn vị nhỏ nhất + `char(3)` mã tiền tệ; **không** `numeric` thừa, không `float` |
| Trạng thái | Cột trạng thái có `CHECK` (hoặc kiểu enum); chuyển trạng thái do máy trạng thái kiểm soát |
| Xoá | **Không xoá mềm bằng cờ ẩn mơ hồ**; dùng trạng thái nghiệp vụ rõ ràng; bản ghi tài chính và audit không bao giờ xoá |
| Đặt tên ràng buộc | Có quy ước để ánh xạ lỗi: `pk_`, `fk_`, `uq_`, `ck_`, `ex_` (ví dụ `ex_calendar_no_overlap`, `uq_payment_gateway_txn`) |
| Phiên bản dòng | Cột `version` (`@Version`) cho thực thể có thể bị sửa đồng thời |
| Cột kiểm toán | `created_at`, `updated_at` do server đặt; người tạo/sửa khi cần |

### 1.2. Các bất biến do cơ sở dữ liệu và Bộ máy nghiệp vụ bảo vệ

| Bất biến | Cơ chế & Quy tắc nghiệp vụ |
|---|---|
| Không đặt trùng một đêm của một listing (Bất biến 1) | **Exclusion constraint** trên (listing, khoảng ngày nửa mở `[check_in, check_out)`) bằng `btree_gist`; thời gian chuẩn bị (`prepNights` 0–3 đêm) cộng vào khoảng khi tính toán khả dụng |
| Thứ tự ưu tiên tính giá (PricingEngine, S10) | Bậc ①: Ngày lễ (`HOLIDAY`) & Ngày đặc biệt (`SPECIAL`) > Bậc ②: Giá theo mùa (`SEASON`) > Bậc ③: Giá cuối tuần (`WEEKEND`) > Bậc ④: Giá cơ bản (`BASE`). |
| Chống chồng chéo quy tắc giá [A6] | Hai quy tắc giá **cùng bậc ưu tiên** không được phép chồng chéo khoảng ngày (`[date_from, date_to]`); kiểm tra chặn và báo 409 `pricing.rule_conflict` |
| Ngưỡng giảm giá lưu trú dài ngày [A14] | - Giảm giá theo tuần (`weeklyDiscountPct`): áp dụng từ 7 đêm trở lên.<br>- Giảm giá theo tháng (`monthlyDiscountPct`): áp dụng từ 28 đêm trở lên.<br>- Đủ điều kiện cả hai: ưu tiên áp dụng mức giảm theo tháng (BR-PRC-02). |
| Một giao dịch cổng chỉ xử lý một lần | `UNIQUE (gateway, gateway_txn_id)` |
| Một thanh toán chỉ hoàn một lần (bất biến 8) | `UNIQUE` trên (payment_id, loại hoàn) hoặc bản ghi hoàn duy nhất theo thanh toán |
| Sổ cái chỉ thêm | Mục 1.3 |
| Một đánh giá mỗi bên mỗi booking | `UNIQUE (booking_id, author_role)` |
| Giới hạn lượt dùng coupon | Cập nhật nguyên tử có điều kiện (mục 4) |
| Khoá idempotency không trùng | `UNIQUE (principal_id, method, path, key)` |
| Booking có snapshot giá | Cột snapshot `NOT NULL` khi trạng thái ≥ đã xác nhận (CHECK có điều kiện) |

### 1.3. Sổ cái chỉ thêm (bất biến 8, BR-PAY-09)

- Vai trò DB ứng dụng (`app_rw`) chỉ được `INSERT` và `SELECT` trên bảng `ledger_entry` và `activity_log`; **thu hồi** `UPDATE`, `DELETE`, `TRUNCATE`.
- Thêm **trigger** chặn `UPDATE`/`DELETE` (phòng thủ chiều sâu, kể cả khi ai đó cấp quyền nhầm).
- Hiệu chỉnh bằng **bút toán đảo** mới, không sửa bút toán cũ.
- Mỗi bút toán thuộc một **nhóm bút toán** (một sự kiện nghiệp vụ); tổng các bút toán của nhóm khớp quy tắc cân bằng (Guest trả = phí dịch vụ + commission + thuế + phần Host). Kiểm tra ở tầng ứng dụng khi ghi **và** bằng truy vấn cân đối chạy định kỳ (job đối soát nội bộ); vi phạm là cảnh báo mức cao.
- Mọi bút toán có tham chiếu nguồn (booking, thanh toán, hoàn tiền, payout) và `LedgerService` là nơi duy nhất được ghi.

### 1.4. Vai trò cơ sở dữ liệu (đặc quyền tối thiểu)

| Vai trò | Dùng cho | Quyền |
|---|---|---|
| `app_owner` | Flyway (migration) | DDL, sở hữu schema; **không** dùng khi ứng dụng chạy |
| `app_rw` | Ứng dụng và worker lúc chạy | DML trên bảng nghiệp vụ; không DDL; chỉ INSERT/SELECT trên `ledger_entry`, `activity_log` |
| `app_ro` | Báo cáo, truy vấn đọc nặng, công cụ phân tích | Chỉ SELECT |

- Mật khẩu từng vai trò khác nhau, lấy từ biến môi trường.
- Thiết lập thời gian chờ ở mức vai trò hoặc kết nối: `statement_timeout`, `lock_timeout`, `idle_in_transaction_session_timeout`.
- Không bật quyền siêu người dùng cho ứng dụng.

---

## 2. Giao dịch (transaction)

| Quy tắc | Chi tiết |
|---|---|
| Ranh giới ở `application` | `@Transactional` trên phương thức use case; không đặt ở controller hoặc repository |
| Ngắn gọn | Chỉ chứa việc cần nguyên tử; không xử lý nặng, không chờ người dùng |
| **Không gọi bên ngoài trong transaction** | Không gọi cổng thanh toán, gửi email, tải iCal, gọi HTTP, ghi file trong khi giữ transaction và khoá DB. Việc bên ngoài chạy **sau commit** qua sự kiện (Modulith `@ApplicationModuleListener`) hoặc job |
| Chỉ đọc | `@Transactional(readOnly = true)` cho truy vấn |
| Mức cô lập | Mặc định `READ COMMITTED`. Không dùng `SERIALIZABLE` đại trà; dùng khoá tường minh và ràng buộc. Nếu một luồng cụ thể cần `SERIALIZABLE`, phải xử lý lỗi `40001` bằng thử lại có giới hạn |
| Rollback | Ngoại lệ miền là không kiểm tra (rollback mặc định); nếu dùng ngoại lệ kiểm tra phải khai báo `rollbackFor` |
| Self-invocation | Gọi `@Transactional` qua `this` không có hiệu lực; tách bean hoặc dùng phương thức công khai của bean khác |
| Phạm vi | Không để transaction mở xuyên qua nhiều use case; không lồng transaction «cho an toàn» |
| `REQUIRES_NEW` | Chỉ dùng có chủ đích (ví dụ ghi audit cho lần bị từ chối, để vẫn còn sau khi transaction chính rollback) |
| JPA | `spring.jpa.open-in-view=false`; Hibernate `ddl-auto=validate` |
| Thử lại | Chỉ thử lại thao tác **idempotent** khi gặp deadlock (`40P01`) hoặc lỗi tuần tự hoá (`40001`), tối đa vài lần, có độ trễ ngẫu nhiên; hết lượt thì trả 409/503 |

### Mẫu «ghi cùng transaction rồi phát sự kiện»

1. Trong transaction: thay đổi trạng thái, ghi sổ cái, ghi audit, ghi khoá idempotency và phát sự kiện (được lưu bền trong registry của Modulith).
2. Sau commit: listener xử lý việc bên ngoài (email, thông báo, gọi cổng) và **idempotent** (sự kiện giao **ít nhất một lần**, có thể giao lại).
3. Sự kiện không hoàn tất được gửi lại; số sự kiện tồn đọng là chỉ số giám sát (file 07).

---

## 3. Kiểm soát đồng thời

### 3.1. Chọn kỹ thuật

| Kỹ thuật | Dùng khi |
|---|---|
| **Ràng buộc DB** (unique, exclusion, CHECK) | Bất biến có thể biểu diễn khai báo: trọng tài cuối |
| **Khoá bi quan** (`SELECT … FOR UPDATE`) | Cần tuần tự hoá các thao tác đọc rồi ghi trên cùng một đối tượng (giữ chỗ trên listing) |
| **Khoá lạc quan** (`@Version` hoặc `UPDATE … WHERE version = ?`) | Sửa tài nguyên ít tranh chấp; phát hiện xung đột, báo 409/412 |
| **Cập nhật nguyên tử có điều kiện** | Bộ đếm và trạng thái: `UPDATE … SET … WHERE id = ? AND status = ?`, kiểm tra số dòng bị ảnh hưởng |
| `FOR UPDATE SKIP LOCKED` | Hàng đợi công việc nhiều worker (payout, gửi lại) |
| Khoá cố vấn (advisory lock) | Chỉ khi các cách trên không đủ; ghi chú lý do |

### 3.2. Các tình huống đồng thời cụ thể

| Tình huống | Kỹ thuật | Kết quả khi tranh chấp |
|---|---|---|
| Hai Guest giữ chỗ cùng đêm (bất biến 1) | Khoá dòng listing + exclusion constraint | Một thắng; người còn lại nhận `calendar.unavailable` |
| Quy tắc phụ thuộc trạng thái nhiều dòng (đêm tối thiểu, thời gian chuẩn bị) | Khoá dòng listing trước khi kiểm tra và ghi | Tuần tự hoá theo listing |
| Chuyển trạng thái booking (thanh toán, huỷ, chấp nhận, hết hạn) cùng lúc | Cập nhật có điều kiện theo trạng thái hiện tại + `@Version` | Một thành công; còn lại nhận `booking.invalid_state` hoặc xung đột |
| Callback thanh toán gửi hai lần hoặc song song | `UNIQUE (gateway, gateway_txn_id)` + xử lý idempotent trong transaction với khoá dòng thanh toán | Chỉ một lần xác nhận |
| Callback «thành công» đến đúng lúc giữ chỗ hết hạn | Xử lý trong một transaction: khoá listing và booking, xác nhận nếu khoảng ngày còn trống, nếu không thì tạo hoàn tiền tự động (UC-07) | Quyết định nhất quán, không để lại trạng thái lửng |
| Hoàn tiền hai lần | `UNIQUE` theo thanh toán | Lần hai bị từ chối hoặc trả kết quả cũ |
| Giới hạn lượt dùng coupon | `UPDATE coupon SET used = used + 1 WHERE id = ? AND used < limit` (số dòng = 1 mới hợp lệ) | Người sau nhận lỗi hết lượt |
| Tối đa 3 yêu cầu đặt chờ mỗi Guest (OQ-06) | Khoá dòng tài khoản Guest rồi đếm và chèn trong cùng transaction | Không vượt giới hạn dù gửi song song |
| Tạo payout hằng ngày | `FOR UPDATE SKIP LOCKED` trên các khoản đủ điều kiện + `UNIQUE` trên khoản trong payout | Không có khoản nào vào hai payout |
| Job chạy chồng (hai instance, hoặc chạy lại) | ShedLock + thiết kế job **idempotent** (chỉ xử lý dòng ở trạng thái cần xử lý bằng `SKIP LOCKED`) | Không xử lý đúp |
| Hai tab sửa cùng listing | `version` + `If-Match` | Người sau nhận `common.version_conflict` |

### 3.3. Thứ tự khoá để tránh deadlock

Luôn khoá theo **thứ tự cố định**: `account` → `listing` → `booking` → `payment` → `ledger`. Khi cần khoá nhiều dòng cùng loại, khoá theo thứ tự id tăng dần. Ghi chú thứ tự này trong mã ở những use case có khoá.

### 3.4. Phòng tránh race condition: danh sách kiểm tra

- Cấm mẫu **kiểm tra rồi hành động** («đếm; nếu < 3 thì chèn») mà không có khoá hoặc ràng buộc.
- Cấm mẫu **đọc – sửa – ghi** trong bộ nhớ trên giá trị dùng chung; dùng cập nhật nguyên tử hoặc khoá.
- Mọi quy tắc «chỉ một» phải có **ràng buộc unique** đi kèm.
- Mọi sự kiện/callback/thông điệp có thể đến hai lần: xử lý phải **idempotent**.
- Mọi job phải chịu được chạy hai lần.
- Mỗi tình huống ở mục 3.2 có **kiểm thử đồng thời** (file 08).

---

## 4. Idempotency

### 4.1. Ở API (khớp file 03, mục 7)

Bảng `idempotency_key`:

| Cột | Ý nghĩa |
|---|---|
| `principal_id`, `method`, `path`, `key` | Phạm vi khoá (unique) |
| `request_hash` | Băm nội dung yêu cầu chuẩn hoá |
| `status` | `IN_PROGRESS`, `COMPLETED` |
| `response_status`, `response_body` | Phản hồi đã lưu để phát lại |
| `created_at`, `expires_at` | Hạn 24 giờ; job dọn |

Luồng (trong transaction của use case):
1. Chèn bản ghi khoá (xung đột unique là tín hiệu «đã có»).
2. Đã có và `COMPLETED`, cùng `request_hash`: trả lại phản hồi đã lưu.
3. Đã có và `IN_PROGRESS`: 409 `idempotency.in_progress`.
4. Đã có, khác `request_hash`: 422 `idempotency.key_reused`.
5. Chưa có: thực hiện use case, lưu phản hồi và đánh dấu `COMPLETED` **trong cùng transaction** với thay đổi nghiệp vụ. Rollback thì bản ghi khoá cũng biến mất, nên thử lại được.

Cài đặt là một **bộ chặn dùng chung** (interceptor/filter + chú thích trên use case), không lặp ở từng endpoint.

### 4.2. Ở sự kiện và job

- Listener sự kiện chịu được giao lại: dựa trên ràng buộc unique tự nhiên (ví dụ «email xác nhận cho booking X đã gửi chưa» bằng một bản ghi duy nhất) hoặc bảng ghi nhận sự kiện đã xử lý.
- Job dựa vào trạng thái của dòng, không dựa vào việc «chạy đúng một lần».

### 4.3. Với dịch vụ bên ngoài

- Lời gọi tới cổng (hoàn tiền, tạo thanh toán) mang **khoá idempotency của cổng** sinh từ định danh nội bộ ổn định.
- Mô hình trạng thái ba bước cho thao tác tiền ra ngoài: `PENDING` (đã ghi ý định, trong transaction) → `SUBMITTED` (đã gọi cổng) → `COMPLETED`/`FAILED`. Sau sự cố, job tìm các bản ghi `PENDING`/`SUBMITTED` quá hạn và đối soát với cổng thay vì gọi lại mù quáng.

---

## 5. Tiền, Tỷ giá và Thời gian trong dữ liệu

- **Money:** kiểu giá trị `Money(amount: long, currency, formatted?: string)`; làm tròn theo số chữ số thập phân của từng loại tiền (VND 0, USD 2); phép chia phần (phân bổ phí sàn, VAT) dùng quy tắc xác định (phần dư gán cho một bên cố định) và test để tổng luôn khớp.
- **Quy đổi tỷ giá đa tiền tệ (S13):** Backend duy trì bảng `exchange_rate_snapshot` nạp hằng ngày từ Frankfurter/cổng tỷ giá. Khi hiển thị tiền tệ quy đổi (`converted`), đính kèm `original`, `rate` và `rateDate`. Nếu nguồn tỷ giá bị gián đoạn (`status: 'STALE' | 'UNAVAILABLE'`), phản hồi trả trạng thái để frontend fallback về tiền tệ gốc của listing (S13 AC).
- **Snapshot khi xác nhận:** giá, phí, thuế, tỷ giá, chính sách huỷ, commission được sao chép nguyên vẹn vào booking; thay đổi cấu hình sau đó **không** ảnh hưởng booking cũ (bất biến 14).
- **Thời gian:** mọi mã lấy thời gian qua `Clock`; không `Instant.now()`; test bằng `MutableClock`. Quy đổi sang giờ listing chỉ ở một dịch vụ; có test qua mốc đổi giờ và sát ranh giới ngày.

---

## 6. Chỉ mục và tối ưu truy vấn

### 6.1. Nguyên tắc chỉ mục

| Quy tắc | Chi tiết |
|---|---|
| Khoá ngoại và cột lọc/join thường dùng có chỉ mục | PostgreSQL không tự tạo chỉ mục cho khoá ngoại |
| Thứ tự cột trong chỉ mục tổ hợp | Cột so sánh bằng trước, cột khoảng/sắp xếp sau |
| Chỉ mục một phần | Cho tập con hay truy vấn (`WHERE status = 'ACTIVE'`, thông báo chưa đọc) |
| Loại chỉ mục | B-tree mặc định; GiST cho khoảng ngày và địa lý; GIN cho JSONB hoặc tìm văn bản (`pg_trgm`) nếu cần |
| Không chỉ mục thừa | Mỗi chỉ mục làm chậm ghi; định kỳ kiểm tra chỉ mục không dùng (`pg_stat_user_indexes`) |
| Bằng chứng | Truy vấn quan trọng được kiểm tra bằng `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu seed đủ lớn; ghi kết quả vào PR |

Chỉ mục ứng viên (xác nhận bằng đo, không thêm hàng loạt):

| Bảng | Chỉ mục |
|---|---|
| `listing` | (trạng thái, khu vực); địa lý GiST trên vị trí |
| `booking` | (guest_id, trạng thái, check_in); (listing_id) qua exclusion; (host_id, trạng thái) |
| `payment` | UNIQUE (gateway, gateway_txn_id); (booking_id) |
| `ledger_entry` | (booking_id); (host_id, created_at); (nhóm bút toán) |
| `message` | (conversation_id, created_at) |
| `notification` | (user_id, created_at) một phần với chưa đọc |
| `activity_log` | (loại đối tượng, id đối tượng, created_at); (actor, created_at) |
| `idempotency_key` | UNIQUE phạm vi; (expires_at) |

### 6.2. Tối ưu truy vấn

- **Phân trang cursor (keyset)** thay vì `OFFSET`, luôn có khoá sắp xếp phụ duy nhất.
- Chỉ chọn cột cần dùng (projection/jOOQ); cấm `SELECT *` trong truy vấn đọc nặng.
- Truy vấn tìm kiếm và báo cáo viết bằng jOOQ/SQL tường minh, chạy với vai trò `app_ro` khi có thể.
- Thao tác hàng loạt dùng batch (`jdbc.batch_size`); danh sách `IN` có giới hạn kích thước.
- Báo cáo nặng có giới hạn khoảng thời gian và số dòng; xuất lớn chạy bất đồng bộ.
- Bật `pg_stat_statements` và ghi các câu chậm (`log_min_duration_statement`) ở môi trường local để phát hiện sớm.
- Dữ liệu seed hiệu năng (ví dụ hàng chục nghìn listing giả) để thử tìm kiếm trước khi tuyên bố hoàn thành slice tìm kiếm.

### 6.3. Chống N+1

| Quy tắc | Chi tiết |
|---|---|
| Quan hệ lười | Mọi quan hệ JPA là `LAZY` (cả `@ManyToOne`, `@OneToOne`); không `EAGER` |
| Tải trước có chủ đích | `JOIN FETCH`/`@EntityGraph` cho nhu cầu cụ thể; không tải cả đồ thị |
| Đường đọc | Danh sách và màn hình đọc dùng **projection DTO hoặc jOOQ**, không tải entity rồi duyệt quan hệ |
| Tải theo lô | Đặt `hibernate.default_batch_fetch_size` hợp lý làm lưới an toàn |
| Không `open-in-view` | Để lỗi tải lười lộ ra sớm trong test thay vì ẩn |
| **Phát hiện bằng test** | Test tích hợp cho mỗi endpoint danh sách **khẳng định số câu lệnh SQL** (bật thống kê Hibernate hoặc bộ đếm truy vấn) không tăng theo số dòng |
| Review | Vòng lặp có gọi repository/getter quan hệ bên trong là dấu hiệu cần xem lại |

---

## 7. Cache

**Nguyên tắc: cache là tối ưu, không bao giờ là nguồn sự thật; tính đúng đắn không được phụ thuộc vào cache.** Không dùng Redis (YAGNI).

| Dữ liệu | Có cache? | Cách |
|---|---|---|
| `CountryConfig`, `SystemConfig` | Có | Bộ nhớ trong (Caffeine), TTL ngắn (ví dụ 60 giây) và xoá khi có thay đổi qua sự kiện; booking luôn dùng snapshot nên sai lệch ngắn hạn không ảnh hưởng tiền |
| Tỷ giá | Có | Bộ nhớ trong theo ngày; snapshot lưu DB |
| Danh mục (tiện nghi, khu vực, chính sách huỷ) | Có | Bộ nhớ trong, TTL, khoá theo ngôn ngữ |
| Nội dung công khai (chi tiết listing) | Cache HTTP | `Cache-Control: public, max-age=60` + `ETag` (file 03) |
| **Khả dụng, giá, báo giá, booking, thanh toán, sổ cái, quyền, phiên** | **Không bao giờ** | Luôn đọc từ DB |

Quy tắc kỹ thuật: giới hạn kích thước và TTL cho mọi cache; chống «bầy đàn» khi hết hạn bằng cơ chế nạp một lần (loading cache); khoá cache gồm mọi tham số ảnh hưởng (ngôn ngữ, quốc gia); có chỉ số tỉ lệ trúng; không cache dữ liệu cá nhân dùng chung giữa người dùng.

---

## 8. Migration cơ sở dữ liệu

| Quy tắc | Chi tiết |
|---|---|
| Công cụ | Flyway, SQL thuần, mỗi module một thư mục `db/migration/<module>` |
| Chỉ tiến tới | **Không sửa migration đã áp dụng**; sai thì thêm migration mới |
| Tương thích ngược (expand → contract) | Thêm cột nullable/có mặc định → ghi hai nơi → di chuyển dữ liệu → bỏ cột cũ ở bản sau; để triển khai và quay lui an toàn |
| Quyền | Chạy bằng `app_owner`; ứng dụng chạy bằng `app_rw` |
| Nội dung | Tạo extension, bảng, ràng buộc, chỉ mục, trigger, cấp quyền; seed tham chiếu (ma trận quyền, chính sách huỷ mặc định) |
| Dữ liệu seed demo | Tách khỏi migration, chỉ nạp ở profile `local` |
| Kiểm tra | CI chạy toàn bộ migration trên PostgreSQL thật (Testcontainers) và `flyway validate`; Hibernate `ddl-auto=validate` bắt lệch schema–entity |
| Thao tác nguy hiểm | `DROP`, đổi kiểu, khoá bảng lớn: review riêng, ghi kế hoạch và quay lui |
| Đặt tên | `V<số-thứ-tự>__mo-ta-ngan.sql`, đồng bộ giữa các module để thứ tự áp dụng xác định |

---

## 9. Danh sách kiểm tra cho PR liên quan dữ liệu

- [ ] Bất biến mới có **ràng buộc DB** đi kèm (unique, CHECK, exclusion), không chỉ kiểm tra ở code?
- [ ] Có «kiểm tra rồi hành động» hay «đọc – sửa – ghi» không? Đã có khoá, cập nhật nguyên tử hoặc ràng buộc?
- [ ] Thứ tự khoá tuân theo mục 3.3? Có thử lại khi deadlock?
- [ ] Transaction ngắn, không gọi bên ngoài bên trong? Việc ngoài chạy sau commit và idempotent?
- [ ] Thao tác ghi tiền/đặt phòng idempotent ở API, sự kiện và với cổng ngoài?
- [ ] Số tiền là `Money`; thời gian qua `Clock`; snapshot đã lưu vào booking?
- [ ] Ghi sổ cái qua `LedgerService`, chỉ thêm, tổng khớp?
- [ ] Có truy vấn mới? Đã `EXPLAIN`, có chỉ mục cần thiết, không N+1 (test đếm câu lệnh)?
- [ ] Danh sách phân trang cursor; không `SELECT *`?
- [ ] Migration chỉ tiến tới, tương thích ngược, chạy được trên DB thật trong CI?
- [ ] Có kiểm thử đồng thời cho tình huống tranh chấp mới?
