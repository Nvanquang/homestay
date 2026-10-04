## S11 · Trang chủ và tìm kiếm

### P01
| Khối | Dữ liệu | Nguồn |
|---|---|---|
| SearchBar | destinationSuggestions[] `{type: REGION｜LISTING, id, label, sublabel}` | `GET /search/suggest?q=` (Location + listing) |
| Điểm đến phổ biến (≤8) | `{regionId, name, imageUrl, listingCount}` | Location + đếm listing ACTIVE |
| Chỗ ở nổi bật (≤8) | `ListingCardDTO` (bên dưới) | Xếp hạng (BR-SRC-03 phần có dữ liệu) |

### P02 – truy vấn
| Tham số URL | Kiểu | Ghi chú |
|---|---|---|
| destination (regionId hoặc text), checkin, checkout | | Ngày theo múi giờ listing |
| adults, children | int | [A7] |
| minPrice, maxPrice | int (đơn vị tiền tệ hiển thị) | |
| type | `ENTIRE_PLACE｜PRIVATE_ROOM` | |
| bedrooms | int (4 = 4+) | |
| amenities | id[] | |
| instant | boolean | |
| policy | `FLEXIBLE｜MODERATE｜STRICT` (nhiều) | |
| sort | `RELEVANCE｜PRICE_ASC｜PRICE_DESC｜NEWEST` (+ `RATING` khi `reviewsEnabled`) | |
| bbox | `minLng,minLat,maxLng,maxLat` | Vùng bản đồ |
| cursor/page | | 24/lần |
| currency | | Từ S13 |

### ListingCardDTO (P01, P02, P04)
| Trường | Ghi chú |
|---|---|
| id, title, propertyType, areaLabel (khu vực xấp xỉ) | **Không** có địa chỉ chính xác |
| photos[] (≤5 url, kích thước thẻ) | |
| maxGuests, bedrooms, beds | |
| bookingMode (nhãn Instant) | |
| price `{ mode: 'TOTAL'｜'FROM_NIGHTLY', total?: Money, nightlyAvg?: Money, nights?, includesFeesAndTaxes: boolean, converted?: {original: Money, rateDate} }` | TOTAL khi có ngày (BR-SRC-02); FROM_NIGHTLY khi chưa chọn ngày |
| map `{lat, lng}` (**toạ độ xấp xỉ**) | Cho marker |
| rating (🔒 ẩn khi `reviewsEnabled=false`) | |

### Phản hồi tìm kiếm – `GET /search/listings`
`{ items: ListingCardDTO[], total, nextCursor, appliedFilters, facets? {priceRange{min,max}, amenityCounts}, mapMarkers[] (≤200: id, lat, lng, priceLabel), fx? {stale} }`
Thêm `GET /search/count` (cho nút "Hiển thị n kết quả" khi chỉnh bộ lọc, chỉ trả số).

---

