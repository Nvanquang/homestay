## S04 · Xác minh Host và Admin duyệt

### P10
| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| Nội dung tĩnh (lợi ích, bước, FAQ) | i18n | Không lấy từ API |
| Trạng thái CTA: `anonymous｜emailUnverified｜eligible｜hostPending｜hostRejected｜hostApproved` | `GET /me` | Quyết định nhãn/đích nút |

### H02 / C03 – hồ sơ xác minh
| Trường | Kiểu | Nguồn | Bắt buộc | Quy tắc | Hiển thị cho |
|---|---|---|---|---|---|
| legalName | text | IdentityVerification | ✓ | 2–100, theo giấy tờ | Chủ sở hữu, Admin |
| dateOfBirth | date | IdentityVerification | ✓ | ≥18 tuổi [Assumption] | Chủ sở hữu, Admin |
| idType | `CCCD｜PASSPORT` | IdentityVerification | ✓ | | Chủ sở hữu, Admin |
| idNumber | text | IdentityVerification | ✓ | Theo loại; **che 4 số cuối sau khi gửi** (UI) | Chủ sở hữu (che), Admin (đủ, có log) |
| idFront / idBack (Passport: 1 ảnh) | Attachment | ID_FRONT/ID_BACK | ✓ | JPG/PNG/PDF ≤10MB [A5] | Chỉ Admin (qua API log). Chủ sở hữu chỉ thấy tên tệp |
| operatingRightDocs[] | Attachment (≤5) | OPERATING_RIGHT | ✓ chỉ H02 | | Admin |
| status | enum 0.5 | IdentityVerification | – | | Chủ sở hữu |
| submittedAt / decidedAt | ISO | | – | | Chủ sở hữu |
| rejectionReason | `{category, note}` | IdentityVerification | – | chỉ khi REJECTED | Chủ sở hữu |
| flaggedDuplicate | boolean | ActivityLog (cờ rủi ro) | – | **Chỉ Admin** | Admin |

### A03 – Admin duyệt
**Danh sách:** id, applicantName, applicantType (`HOST｜GUEST`), submittedAt, waitingFor (tính từ submittedAt), status, flag ⚑, lockedBy.
**Chi tiết:** toàn bộ trường H02 (đầy đủ) + `history[]` (các lần gửi, kết quả) + `duplicateOf` (link tài khoản trùng) + danh sách tệp (`id, purpose, fileName`, **không** URL).
**Quyết định:** `{ decision: 'APPROVE｜REJECT', reasonCategory?, note?, acknowledgedFlag? }`.

| API | Mục đích |
|---|---|
| `GET /host/verification` · `PUT /host/verification` (nháp) · `POST /host/verification/submit` | H02 |
| `GET /me/verification` · `PUT` · `POST …/submit` | C03 |
| `GET /admin/identity-reviews?type=&status=&flag=&mine=&page=` | Hàng đợi |
| `POST /admin/identity-reviews/:id/lock` (+ heartbeat/release) | Khoá |
| `POST /admin/identity-reviews/:id/documents/:attId/view` | **Ghi log + trả `signedUrl` (sống ~120 s)** |
| `POST /admin/identity-reviews/:id/decision` | Duyệt/từ chối (ghi ActivityLog, gửi email) |

**Danh mục lý do từ chối (seed):** `BLURRY`, `EXPIRED_DOC`, `MISMATCH`, `INVALID_DOC`, `OTHER`.

---

