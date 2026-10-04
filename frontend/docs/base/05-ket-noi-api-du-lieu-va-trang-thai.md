# Kết nối API, dữ liệu và quản lý trạng thái

Quy tắc cho mọi thứ liên quan tới việc lấy, gửi và giữ dữ liệu. Phần bảo mật của phiên và CSRF được nhắc ở đây ở mức cách dùng; lý do và các biện pháp khác nằm ở file 06.

---

## 1. Bức tranh tổng thể

```
Trình duyệt ──(cùng origin, /api/*)──► Next.js rewrite ──► Backend Spring (BACKEND_URL)
Server Component ──(BACKEND_URL, chuyển tiếp cookie)────────► Backend Spring
Trình duyệt ──(URL ký sẵn, chỉ upload/xem file)───────────► MinIO
```

| Bên gọi | Dùng cho | Cách gọi |
|---|---|---|
| Server Component | Dữ liệu cần SEO hoặc cần có ngay ở lần vẽ đầu: tìm kiếm, chi tiết listing, hồ sơ Host, chính sách huỷ, trang tĩnh; thông tin người dùng hiện tại | Client phía server, chuyển tiếp cookie phiên |
| Client Component | Tương tác, thao tác ghi, polling, dữ liệu riêng tư thay đổi theo thời gian | Client phía trình duyệt qua `/api`, bọc bằng TanStack Query |
| Trình duyệt tới MinIO | Tải ảnh lên bằng URL ký, xem file riêng tư bằng URL ký ngắn hạn | `fetch`/XHR trực tiếp tới URL được cấp |

Trình duyệt **không** gọi thẳng backend ở cổng 8080.

---

## 2. Sinh client từ OpenAPI

| Việc | Quy định |
|---|---|
| Nguồn | `openapi.json` do springdoc của backend xuất ra |
| Lệnh | `pnpm gen:api` sinh `packages/api-client/src/generated/schema.d.ts` bằng `openapi-typescript` |
| Lưu trữ | File sinh ra **được commit**; không sửa tay |
| CI | Sinh lại và so sánh; khác nghĩa là backend đổi mà frontend chưa cập nhật, CI đỏ |
| Phiên bản API | Đường dẫn `/api/v1/...`; thay đổi phá vỡ ở `v2` |
| Kiểu | Dùng kiểu sinh sẵn cho request và response; không khai báo lại tay |

Gọi API bằng `openapi-fetch` (đường dẫn và kiểu được kiểm tra khi biên dịch). Nếu muốn hook sinh sẵn có thể thêm `openapi-react-query`, nhưng phải tuân theo quy ước khoá truy vấn ở mục 5.

---

## 3. Hai client dùng chung một bộ middleware

`packages/api-client` xuất hai hàm tạo client; cả hai cùng áp các bước sau.

| Bước | Client trình duyệt | Client server |
|---|---|---|
| Địa chỉ gốc | `/api` (cùng origin) | `BACKEND_URL` |
| Cookie phiên | Trình duyệt tự gửi (`credentials: "same-origin"`) | Đọc từ `cookies()` của yêu cầu hiện tại và chuyển tiếp |
| CSRF | Đọc cookie `XSRF-TOKEN`, gửi header `X-XSRF-TOKEN` với mọi phương thức không phải GET/HEAD | Không cần cho GET; thao tác ghi đi từ trình duyệt |
| Ngôn ngữ | `Accept-Language` theo ngôn ngữ đang chọn | Như nhau |
| Mã yêu cầu | Thêm `X-Request-Id` để đối chiếu log | Như nhau |
| Cache | Không áp | Mặc định `no-store`; cho phép cache có chủ đích theo mục 9 |
| Lỗi | Chuẩn hoá thành `ApiError` (mục 4) | Như nhau |
| 401 | Xoá cache người dùng và chuyển về đăng nhập với `returnTo` an toàn | Chuyển hướng ở phía server |

Quy tắc:
- Module client phía server có `import "server-only"`.
- Không tự dựng `fetch` rải rác; mọi lời gọi qua hai client này.
- **Đăng nhập, đăng xuất, đổi mật khẩu thực hiện từ trình duyệt** (qua `/api`). Server Component không thể ghi cookie, nên `Set-Cookie` của backend trả cho lời gọi phía server sẽ bị mất.
- `getCurrentUser()` phía server dùng `cache()` của React để một lần render chỉ gọi API một lần; kết quả (gồm **danh sách quyền**) có thể truyền xuống phía client qua provider hoặc hydrate vào TanStack Query.

---

## 4. Mô hình lỗi

Backend trả lỗi theo Problem Details kèm các trường: `status`, `code` (mã nghiệp vụ ổn định), `traceId`, `errors[]` (theo field: `field`, `code`), có thể kèm `retryAfter`. Frontend chuẩn hoá thành:

```ts
// minh hoạ
type ApiError = {
  status: number;
  code: string;                 // ví dụ "calendar.unavailable"
  traceId?: string;
  fieldErrors: { field: string; code: string }[];
  retryAfterSeconds?: number;
};
```

| Nguyên tắc | Chi tiết |
|---|---|
| Không hiển thị `detail` của backend | Thông điệp hiển thị luôn lấy từ i18n theo `code`: khoá `errors.<code>`; không có khoá thì dùng `errors.generic` |
| Mã lỗi là hợp đồng | Danh sách mã được khai báo trong OpenAPI và trong `packages/api-client/errors.ts`; thêm mã mới ở backend phải thêm thông điệp VI/EN |
| Hiển thị mã tham chiếu | Lỗi không lường trước hiển thị `traceId` rút gọn để hỗ trợ tra cứu |
| Lỗi theo field | Ánh xạ `fieldErrors` vào React Hook Form bằng `setError` |

Ví dụ nhóm mã (cần thống nhất với backend, đây chỉ là gợi ý):

| Nhóm | Ví dụ mã | Cách phản hồi trên giao diện |
|---|---|---|
| Lịch và giữ chỗ | `calendar.unavailable`, `booking.hold_expired`, `booking.min_nights` | Thông báo, đề xuất chọn ngày khác, tải lại bảng giá |
| Phiên bản/xung đột | `common.version_conflict` | «Dữ liệu đã thay đổi», tải lại |
| Thanh toán | `payment.declined`, `payment.pending`, `payment.amount_changed` | Hướng dẫn thử lại hoặc đổi phương thức |
| Quyền | `auth.forbidden`, `auth.unverified_host` | Trang không có quyền hoặc dẫn tới bước xác minh |
| Giới hạn | `common.rate_limited` | Báo chờ, đếm ngược theo `retryAfter` |

---

## 5. TanStack Query

### 5.1. Thiết lập mặc định

| Tuỳ chọn | Giá trị | Lý do |
|---|---|---|
| `staleTime` | 30 giây (ghi đè theo bảng ở 5.3) | Tránh gọi lại liên tục khi chuyển trang |
| `gcTime` | 5 phút | Mặc định hợp lý |
| `retry` (truy vấn) | Không thử lại với 4xx; thử lại tối đa 1 lần với lỗi mạng hoặc 5xx | Không lặp các lỗi chắc chắn thất bại |
| `retry` (mutation) | Không tự thử lại | Thử lại chỉ khi có `Idempotency-Key` và do người dùng bấm |
| `refetchOnWindowFocus` | Bật cho danh sách riêng tư; tắt cho trang thanh toán và form đang sửa | Tránh ghi đè khi người dùng đang thao tác |
| Lỗi toàn cục | `QueryCache.onError` xử lý 401; lỗi khác về component | |

### 5.2. Khoá truy vấn

- Dùng **factory theo feature**, không viết mảng khoá rải rác:

```ts
// minh hoạ: features/booking/api/keys.ts
export const bookingKeys = {
  all: ["bookings"] as const,
  list: (filters: BookingFilters) => [...bookingKeys.all, "list", filters] as const,
  detail: (id: string) => [...bookingKeys.all, "detail", id] as const,
};
```

- Khoá luôn gồm mọi tham số ảnh hưởng tới kết quả (bộ lọc, trang, ngôn ngữ nếu có).
- Dùng `queryOptions()` để một định nghĩa phục vụ cả prefetch ở server lẫn `useQuery` ở client.

### 5.3. Thời gian «tươi» theo loại dữ liệu

| Loại dữ liệu | `staleTime` gợi ý | Ghi chú |
|---|---|---|
| Nội dung listing, hồ sơ Host, danh mục | 5 phút | Ít thay đổi |
| Kết quả tìm kiếm | 30 giây | |
| **Khả dụng, bảng giá, báo giá** | **0** (luôn lấy mới khi mở/đổi ngày) | Quyết định tiền và tồn kho, không dựa dữ liệu cũ |
| Chi tiết booking, trạng thái thanh toán | 0 + polling khi cần | |
| Danh sách chuyến đi, booking của Host | 30 giây | |
| Người dùng hiện tại, quyền | 5 phút, làm mới sau thay đổi | |
| Tin nhắn, thông báo | Theo polling (mục 7) | |

### 5.4. Làm mới sau khi ghi (invalidation)

| Thao tác | Làm mất hiệu lực |
|---|---|
| Giữ chỗ, thanh toán xong, huỷ, đổi | Chi tiết booking, danh sách chuyến đi, **khả dụng và giá của listing đó** |
| Host chặn/mở ngày, đổi giá | Lịch listing, khả dụng và giá của listing |
| Host chấp nhận/từ chối yêu cầu | Danh sách yêu cầu chờ, danh sách booking, chi tiết booking |
| Gửi đánh giá | Danh sách đánh giá, trạng thái của booking |
| Thêm/bỏ yêu thích | Danh sách yêu thích (đã cập nhật lạc quan, mục 6) |

Mỗi mutation khai báo rõ khoá nào bị làm mất hiệu lực; không dùng `invalidateQueries()` cho cả cache.

---

## 6. Mutation, chống gửi đúp và cập nhật lạc quan

### 6.1. `Idempotency-Key`

Bắt buộc với: giữ chỗ/tạo booking, thanh toán, huỷ, đổi booking, chấp nhận/từ chối yêu cầu đặt, hoàn tiền và mọi thao tác tiền do nhân sự thực hiện.

| Quy tắc | Chi tiết |
|---|---|
| Tạo khoá | `crypto.randomUUID()` khi người dùng **bắt đầu một ý định** (mở bước thanh toán, mở màn huỷ) |
| Giữ khoá | Trong state/ref của form; dùng lại cho mọi lần thử cùng ý định (bấm lại, mạng chập chờn) |
| Đổi khoá | Sau khi có kết quả dứt khoát (thành công hoặc lỗi nghiệp vụ không thể thử lại) hoặc khi nội dung yêu cầu thay đổi |
| Gửi | Header `Idempotency-Key` |
| Xung đột khoá | Backend trả lỗi khi cùng khoá nhưng khác nội dung; frontend tạo khoá mới và yêu cầu người dùng xác nhận lại |
| Giao diện | Vô hiệu nút khi đang gửi; không dựa riêng vào việc đó, khoá idempotency là lớp bảo vệ thật |

### 6.2. Cập nhật lạc quan

| Được phép | Không được phép |
|---|---|
| Thêm/bỏ yêu thích, đánh dấu thông báo/tin nhắn đã đọc, sắp xếp lại ảnh nháp | Giữ chỗ, thanh toán, huỷ, đổi booking, hoàn tiền, payout, chấp nhận/từ chối yêu cầu, bất kỳ thao tác tiền |

Cập nhật lạc quan luôn có cách hoàn lại khi lỗi.

---

## 7. Polling và thời gian

| Dữ liệu | Chu kỳ | Điều kiện dừng |
|---|---|---|
| Trạng thái thanh toán sau khi quay về từ cổng | 2 giây trong 60 giây đầu, sau đó 5 giây | Khi đạt trạng thái cuối (xác nhận, thất bại, hết hạn); hết thời gian chờ thì hiển thị «đang xử lý, chúng tôi sẽ email cho bạn» |
| Hội thoại đang mở | 5 đến 10 giây | Tab ẩn hoặc rời trang |
| Số tin chưa đọc, thông báo | 30 đến 60 giây | Tab ẩn |
| Yêu cầu đặt chờ Host phản hồi | 30 đến 60 giây | Tab ẩn |
| Hết hạn giữ chỗ | **Không polling**; đếm ngược cục bộ và kiểm tra khi gửi | |

Quy tắc: `refetchInterval` là hàm trả `false` khi đạt trạng thái cuối; đặt `refetchIntervalInBackground: false`; tăng dần khoảng cách khi lỗi liên tiếp.

### Đếm ngược theo giờ máy chủ

1. API trả thời điểm hết hạn (`expiresAt`, UTC) và thời gian máy chủ lúc phản hồi (`serverTime`, hoặc dùng header `Date`).
2. Khi nhận dữ liệu, tính `offset = serverTime - Date.now()`.
3. Thời gian còn lại = `expiresAt - (Date.now() + offset)`; cập nhật mỗi giây.
4. Về 0 thì lấy lại trạng thái booking từ API, **không** tự quyết định đã hết hạn.
5. Truy cập: thông báo qua vùng `aria-live="polite"` tại các mốc (còn 5 phút, 1 phút, hết hạn), không đọc mỗi giây.

Ghi chú: giữ chỗ 15 phút được **backend** đánh giá lúc đọc; đồng hồ chỉ là hiển thị.

---

## 8. Bốn loại trạng thái

| Loại | Nơi giữ | Ví dụ |
|---|---|---|
| Dữ liệu từ server | TanStack Query (hoặc Server Component) | Listing, booking, tin nhắn |
| Trạng thái URL | nuqs | Bộ lọc tìm kiếm, sắp xếp, trang, tab đang chọn, ngày và số khách |
| Trạng thái form | React Hook Form | Nội dung form, lỗi, trạng thái đã chạm |
| Trạng thái giao diện cục bộ | `useState`/`useReducer` | Mở/đóng hộp thoại, tab con |
| Trạng thái giao diện chia sẻ tạm thời | Context hoặc Zustand (hiếm) | Marker bản đồ đang được rê chuột để đồng bộ với danh sách |

Quy tắc: **không** sao chép dữ liệu server vào store toàn cục; không dùng Zustand cho thứ có thể nằm trên URL hoặc trong Query.

### Trạng thái trên URL (nuqs)

- Các tham số: `destination`, `checkIn`, `checkOut` (dạng `YYYY-MM-DD`), `guests`, `priceMin`, `priceMax`, `type`, `amenities`, `instantBook`, `sort`, `cursor`/`page`, `bounds` (khung bản đồ).
- Mỗi tham số có **parser và giá trị mặc định**; giá trị sai kiểu hoặc ngoài khoảng bị bỏ và quay về mặc định, không gây lỗi.
- Giá trị mặc định không ghi lên URL cho gọn.
- Đổi bộ lọc dùng `replace` (không đẩy lịch sử mỗi lần); đổi trang dùng `push`.
- Trang tìm kiếm đọc cùng bộ parser ở server để vẽ lần đầu đúng với URL.
- Không đưa dữ liệu cá nhân vào URL.

---

## 9. Chính sách cache của Next.js ở phía server

Mặc định mọi lời gọi từ server là **không cache**. Chỉ cache có chủ đích:

| Loại dữ liệu | Chính sách |
|---|---|
| Nội dung công khai ít đổi (chi tiết listing không gồm giá/khả dụng, hồ sơ Host, chính sách huỷ, trang tĩnh, danh mục) | `revalidate` 60 đến 300 giây (trang tĩnh pháp lý có thể dài hơn) |
| **Khả dụng, giá, báo giá, booking, người dùng, tin nhắn, mọi lời gọi có cookie** | `no-store`; **không bao giờ cache** |
| Kết quả tìm kiếm | `no-store` hoặc `revalidate` rất ngắn |
| Ngôn ngữ | Đưa ngôn ngữ vào tham số hoặc URL của lời gọi để cache không lẫn giữa VI và EN |

- Không bật Cache Components ở giai đoạn đầu; xem lại khi có số liệu hiệu năng cần cải thiện.
- Lời gọi nào chuyển tiếp cookie người dùng thì **bắt buộc** `no-store` để không rò rỉ dữ liệu giữa người dùng.
- Phản hồi dữ liệu nhạy cảm (giấy tờ danh tính, thông tin thanh toán) phải có `Cache-Control: no-store` từ backend.

---

## 10. Phân trang và danh sách

- API dùng **cursor**; frontend giữ `cursor` hiện tại trên URL (nuqs) để quay lại và chia sẻ được.
- Kết quả tìm kiếm dùng nút «Xem thêm» hoặc phân trang; **không** dùng cuộn vô hạn cho tìm kiếm chính (khó truy cập, mất vị trí khi quay lại, chân trang không với tới).
- Khi quay lại từ trang chi tiết, khôi phục vị trí cuộn và bộ lọc (URL giữ trạng thái).

---

## 11. Tải file lên

1. Client kiểm tra nhanh: loại tệp cho phép, kích thước tối đa, số lượng, kích thước ảnh tối thiểu (để phản hồi sớm; backend kiểm tra lại).
2. Gọi API xin URL ký sẵn (kèm loại, kích thước).
3. Tải trực tiếp lên MinIO (hiển thị tiến độ, cho phép huỷ và thử lại).
4. Gọi API xác nhận hoàn tất để gắn tệp vào đối tượng (listing, hồ sơ xác minh, bằng chứng khiếu nại).
5. Xem trước bằng URL tạm của trình duyệt và **giải phóng URL tạm** khi xong.

Giấy tờ danh tính và bằng chứng nhạy cảm đi qua bucket riêng tư; xem lại chúng chỉ bằng URL ký ngắn hạn do API cấp theo từng lần xem (file 06).

---

## 12. Hợp đồng cần thống nhất với backend trước khi làm màn có dữ liệu

- [ ] `openapi.json` đầy đủ, có khai báo mã lỗi nghiệp vụ.
- [ ] Dạng lỗi Problem Details với `code`, `traceId`, `errors[]`.
- [ ] Tên cookie phiên và cookie CSRF, tên header CSRF.
- [ ] Endpoint người dùng hiện tại trả về vai trò **và danh sách quyền**.
- [ ] Quy ước `Idempotency-Key` (endpoint nào, thời hạn khoá, lỗi khi trùng khoá khác nội dung).
- [ ] Phân trang cursor: tên tham số và trường trả về.
- [ ] Mọi phản hồi liên quan tới giữ chỗ/thanh toán có `serverTime` và `expiresAt`.
- [ ] `Accept-Language` và `X-Request-Id` được backend đọc và ghi log.
- [ ] Dạng `Money` (`amount` số nguyên, `currency`) và `StayDate` (`YYYY-MM-DD`) thống nhất ở mọi DTO.
