## S10 · Giá theo mùa, lễ, ngày đặc biệt (H08)

### Quy tắc giá (`PriceRule`)
| Trường | Kiểu | Quy tắc |
|---|---|---|
| id | | |
| type | `WEEKEND｜SEASON｜HOLIDAY｜SPECIAL` | WEEKEND chỉ 1 bản ghi/listing |
| name | text ≤60 | Mặc định theo loại |
| dateFrom / dateTo | date | `SEASON/HOLIDAY/SPECIAL` bắt buộc; không quá khứ; to ≥ from; **không chồng cùng nhóm ưu tiên** (HOLIDAY+SPECIAL cùng bậc ①, SEASON bậc ②) [A6] |
| nightlyPrice | Money | > 0 |
| phase | `UPCOMING｜ACTIVE｜PAST` | BE tính (hiển thị badge) |
| weekendNights | `['FRI','SAT']` | Từ CountryConfig (Việt Nam) – chỉ đọc |

### Lịch giá – `GET /host/listings/:id/price-calendar?from=&to=`
`days[] {date, price: Money, source: BASE｜WEEKEND｜SEASON｜HOLIDAY｜SPECIAL, ruleId?}` – nguồn là kết quả của **PricingEngine**.

| API | Mục đích |
|---|---|
| `GET /host/listings/:id/pricing-rules` | Danh sách |
| `POST/PATCH/DELETE /host/listings/:id/pricing-rules/:rid` | CRUD; 409 `{conflictingRuleIds[]}` khi chồng |
| `PUT /host/listings/:id/pricing-rules/weekend` `{nightlyPrice}` | Giá cuối tuần |

**Cấu hình quốc gia (CountryConfig.VN – seed):** `weekendNights = [FRI, SAT]`.

---

