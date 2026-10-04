## S05 · Host tạo listing nháp

### H03 – danh sách listing (mỗi dòng)
| Trường | Nguồn | Ghi chú |
|---|---|---|
| id, title (có thể rỗng khi nháp), coverPhotoUrl | Listing, ListingPhoto | |
| regionName | Location | Khu vực xấp xỉ |
| propertyType, maxGuests | Listing | |
| status | enum 0.5 | |
| draftProgress `{completedSteps, totalSteps:8, resumeStep}` | BE tính | Để nút "Tiếp tục" mở đúng bước |
| updatedAt | Listing | |
| capabilities `{canEdit, canPreview, canViewStatus, canOpenCalendar, canOpenPricing, canDelete}` | BE tính | FE chỉ đọc cờ, không tự suy luận (G2) |
| Tổng: `canCreate` + `createBlockedReason` (`HOST_NOT_VERIFIED`) | BE | |

### H04 – bước 1 · Thông tin cơ bản (`Listing`)
| Trường | Kiểu | Bắt buộc | Quy tắc |
|---|---|---|---|
| propertyType | `ENTIRE_PLACE｜PRIVATE_ROOM` | ✓ | |
| title | text | ✓ | 10–80 [A5b] |
| description | text | ✓ | 50–2000 |
| maxGuests | int | ✓ | 1–30 |
| bedrooms / beds / bathrooms | int / int / decimal(0.5) | ✓ | 0–20 / ≥1 / ≥0 |
| checkInTime / checkOutTime | HH:mm | ✓ | |
| currency | CurrencyCode | ✓ | mặc định theo quốc gia; khoá sau lần duyệt đầu |
| (nền) version | int | – | Phát hiện xung đột 2 tab |

### H04 – bước 2 · Vị trí (`Location`, `Listing`)
| Trường | Kiểu | Bắt buộc | Hiển thị cho | Ghi chú |
|---|---|---|---|---|
| regionId | id | ✓ | Công khai (tên khu vực) | Cascading Tỉnh → Khu vực |
| exactAddress | text ≤200 | ✓ | **Chủ sở hữu, Admin** (không bao giờ Công khai) | BR-SRC-04 |
| exactLat / exactLng | decimal | ✓ | **Chủ sở hữu, Admin** | Nhập tay khi `mapboxEnabled=false` |
| publicArea `{centerLat, centerLng, radiusM, label}` | | – (BE sinh) | Công khai | Dùng để vẽ vòng tròn xấp xỉ; BE làm mờ toạ độ |

### H04 – bước 3 · Ảnh (`ListingPhoto`)
| Trường | Kiểu | Quy tắc |
|---|---|---|
| id, url (nhiều kích thước), width, height | | |
| order | int | Thứ tự hiển thị; `order=0` = ảnh bìa |
| caption | text ≤120 | Tuỳ chọn; dùng làm `alt` |
| status | `UPLOADING｜READY｜REJECTED` | |
| Tổng hợp | `count`, `minRequired` (5), `maxAllowed` (30) | Từ `/config/public` |

| API (S05) | Mục đích |
|---|---|
| `GET /host/listings?status=` | H03 |
| `POST /host/listings` (kèm dữ liệu bước 1) | Tạo nháp → trả `id` |
| `GET /host/listings/:id` | Nạp toàn bộ nháp (mọi bước) |
| `PATCH /host/listings/:id` `{…, version}` | Lưu một phần; 409 nếu `version` cũ |
| `PUT /host/listings/:id/photos/order` `{photoIds[]}` | Sắp xếp |
| `POST /host/listings/:id/photos` (qua luồng upload) · `PATCH/DELETE …/photos/:pid` | Ảnh |
| `DELETE /host/listings/:id` | Xoá nháp |
| `GET /geocode?q=` · `GET /geocode/reverse?lat=&lng=` | Gợi ý địa chỉ (qua BE để giấu token nếu cần) |

---

