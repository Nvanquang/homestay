## S07 · Chính sách huỷ, kiểu đặt, giấy tờ, gửi duyệt, trạng thái

### Bước 7
| Trường | Nguồn | Ghi chú |
|---|---|---|
| cancellationPolicyId | Listing → CancellationPolicy | 1 trong 3 |
| bookingMode | Listing | `INSTANT｜REQUEST` |
| Danh mục chính sách + mốc hoàn tiền | `GET /cancellation-policies` | Bảng như P05 |

### Bước 8
| Trường | Nguồn | Quy tắc |
|---|---|---|
| requiredLegalDocs[] `{type, label, required, uploaded: Attachment?}` | CountryConfig + Attachment (LISTING_LEGAL) | Động theo quốc gia [A17] |
| legalRegistrationNumber | Listing | Nếu quốc gia yêu cầu |
| readiness `{canSubmit, items[]: {key, ok, message, stepKey, current, required}}` | BE | Nguồn sự thật cho checklist |
| summary `{coverPhoto, title, baseNightlyPrice, policy, bookingMode, area}` | Listing | Thẻ tóm tắt |

### H05 – trạng thái duyệt
| Trường | Nguồn | Hiển thị cho |
|---|---|---|
| status | Listing | Chủ sở hữu |
| revisions[] `{no, submittedAt, decidedAt?, result: PENDING｜APPROVED｜NEEDS_CHANGES｜REJECTED}` | ListingRevision | Chủ sở hữu |
| currentReview `{reasons[]: {section: PHOTOS｜DESCRIPTION｜LEGAL｜PRICING｜LOCATION｜OTHER, note, stepKey}, decidedBy?: ẩn tên Admin}` | ListingRevision | Chủ sở hữu (chỉ lý do, **không** lộ tên Admin) |
| publicUrl | | Chỉ khi `ACTIVE` |
| lockReason | Listing | Khi `LOCKED` |

| API | Mục đích |
|---|---|
| `GET /host/listings/:id/readiness` | Checklist điều kiện |
| `POST /host/listings/:id/legal-docs` (qua luồng upload) | Giấy tờ listing |
| `POST /host/listings/:id/submit` | Gửi duyệt → 200 `{status:'PENDING_REVIEW'}` · 422 `{items[]}` · 403 `HOST_NOT_VERIFIED` |
| `GET /host/listings/:id/review-status` | H05 |

---

