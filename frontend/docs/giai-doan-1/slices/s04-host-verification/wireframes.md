## S04 · Hồ sơ xác minh Host và Admin duyệt

### P10 · Trở thành Host
| Mục | Giá trị |
|---|---|
| Route / Role | `/become-host` · Khách vãng lai, Guest |
| Component | Hero + CMP-01 CTA, khối lợi ích (3), khối "Cách thức hoạt động" (4 bước: Đăng ký → Xác minh → Đăng tin → Nhận khách), khối **Cần chuẩn bị gì** (CCCD/hộ chiếu, giấy tờ quyền khai thác), FAQ accordion, CMP-08 |
| Action | Bắt đầu (→ FL-S04-A) · Xem Trợ giúp · Quay lại |
| State | **Khách vãng lai** (CTA = "Đăng ký để bắt đầu") · **Guest chưa xác minh email** (CTA bị chặn kèm banner) · **Guest đủ điều kiện** (CTA = "Bắt đầu") · **Đã là Host chưa duyệt** (CTA = "Tiếp tục xác minh") · **Đã duyệt** (CTA = "Tới Listing của tôi") · Đang gọi API (CTA loading) · Lỗi |
```
🖥 Desktop                                           📱 Mobile
┌──────────────────────────────────────────┐   ┌───────────────────────────┐
│ Header                                    │   │ Header                    │
│ ┌──────────────────────┬───────────────┐ │   │ Cho thuê chỗ ở của bạn    │
│ │ Cho thuê chỗ ở của   │      ▢        │ │   │ [  Bắt đầu  ]             │
│ │ bạn trên Homestay    │   hình ảnh    │ │   │ ▢ hình                    │
│ │ [  Bắt đầu  ]        │               │ │   │ Lợi ích ①②③ (dọc)        │
│ └──────────────────────┴───────────────┘ │   │ Cách hoạt động 1-4 (dọc)  │
│ Lợi ích:  ① ② ③                          │   │ Cần chuẩn bị gì (checklist)│
│ Cách hoạt động: 1 → 2 → 3 → 4             │   │ FAQ ▾                     │
│ Cần chuẩn bị: ▢CCCD/hộ chiếu ▢Giấy tờ KT  │   │ [ Bắt đầu ] sticky đáy    │
│ FAQ ▾                                     │   └───────────────────────────┘
└──────────────────────────────────────────┘
```

### H02 · Hồ sơ xác minh Host (và C03 · Xác minh danh tính cho Guest – cùng component)
| Mục | H02 | C03 |
|---|---|---|
| Route / Role | `/host/verification` · Host | `/account/verification` · Guest, Host |
| Phần form | A. Thông tin cá nhân (họ tên theo giấy tờ, ngày sinh, SĐT) · B. Giấy tờ danh tính (loại: CCCD / hộ chiếu; mặt trước, mặt sau; số giấy tờ) · C. Giấy tờ quyền khai thác chỗ ở | Chỉ A + B |
| Component | CMP-13 ×(3–4), CMP-02, CMP-04 (loại giấy tờ), CMP-10, CMP-08, CMP-01, hướng dẫn ảnh đạt chuẩn (checklist: rõ nét, đủ 4 góc, không loá) |
| Action | Chọn/chụp ảnh · Xem trước · Xoá/Thay tệp · Gửi hồ sơ · Lưu nháp · **Sửa & gửi lại** (khi bị từ chối) · Rút hồ sơ* |
| State (cấp màn) | **Chưa nộp** (form trống) · **Đang nhập** (nháp tự lưu) · **Đang tải tệp** (progress từng tệp) · **Gửi** (loading) · **Chờ duyệt** (form khoá, đọc-only, mốc thời gian gửi) · **Đã xác minh** (✓, CTA "Tạo listing") · **Bị từ chối** (khối lý do nổi bật, form mở lại, trường bị nêu tô viền) · **Cần cập nhật** (giấy tờ hết hạn) · **Lỗi tệp** (sai định dạng/quá nặng/ảnh mờ do BE) · **Mất mạng khi tải** (tệp lỗi có nút Thử lại) |
| State (cấp tệp) | Trống · Đang tải x% · Đã tải ✓ · Lỗi ✕ (Thử lại / Xoá) |

🖥 Desktop (H02 – trạng thái "Bị từ chối")
```
┌────────┬────────────────────────────────────────────────────────────────┐
│ Sidebar│ Hồ sơ xác minh Host                    Trạng thái: [✕ Bị từ chối]│
│        │ ┌────────────────────────────────────────────────────────────┐ │
│        │ │ ⚠ Lý do từ chối: Ảnh mặt sau CCCD bị mờ. Vui lòng chụp lại. │ │
│        │ └────────────────────────────────────────────────────────────┘ │
│        │ A. Thông tin cá nhân                                            │
│        │   Họ tên theo giấy tờ [__________]  Ngày sinh [__/__/____]       │
│        │ B. Giấy tờ danh tính   Loại (●CCCD ○Hộ chiếu)  Số [__________]   │
│        │   ┌───────────────┐ ┌───────────────┐                           │
│        │   │ Mặt trước ✓   │ │ Mặt sau ✕ mờ  │ ← viền đỏ                 │
│        │   │ ▢ xem trước   │ │ [Thay tệp]    │                           │
│        │   └───────────────┘ └───────────────┘                           │
│        │ C. Giấy tờ quyền khai thác chỗ ở  ┌──────────────┐ [+ Thêm tệp]  │
│        │                                    │ so_do.pdf ✓  │               │
│        │                                    └──────────────┘               │
│        │ ─────────────────────────────────────────────────────────────── │
│        │ [ Lưu nháp ]                              [ Sửa & gửi lại ]       │
└────────┴────────────────────────────────────────────────────────────────┘
```
📱 Mobile: khối A/B/C xếp dọc, **stepper 3 bước** trên cùng (A › B › C); mỗi ô tệp rộng full-width với nút **"Chụp ảnh"** và **"Chọn từ thư viện"**; thanh nút sticky đáy. Tablet: 2 cột cho cặp ảnh mặt trước/sau.
Màn "Chờ duyệt": thay form bằng thẻ tóm tắt + dòng thời gian (Đã gửi → Đang xem xét → Kết quả) + danh sách tệp đã nộp (chỉ tên, không xem ảnh lại nếu không cần).

### A03 · Duyệt hồ sơ danh tính (Host và Guest)
| Mục | Giá trị |
|---|---|
| Route / Role | `/admin/identity-reviews` (danh sách), `/admin/identity-reviews/:id` (chi tiết) · **Admin** |
| Component | CMP-24 DataTable (Người nộp, Loại Host/Guest, Ngày gửi, Trạng thái, Cờ ⚑, Người đang xử lý), bộ lọc, CMP-31 LockBanner, CMP-30 SecureImageViewer, panel thông tin, CMP-25 ConfirmDialog (Duyệt / Từ chối + lý do), CMP-10, khối "Cờ rủi ro" (trùng giấy tờ → link tới tài khoản kia) |
| Action | Mở hồ sơ (nhận khoá) · Bấm để xem ảnh (ghi log) · Duyệt · Từ chối (chọn lý do + ghi chú) · Trả lại hàng đợi (nhả khoá) · Lọc/Tìm |
| State (danh sách) | Loading · Default · Rỗng ("Không còn hồ sơ chờ") · Lọc không kết quả · Lỗi |
| State (chi tiết) | **Đang tải** · **Tự do** (nhận khoá thành công) · **Bị khoá bởi người khác** (chỉ xem, nút quyết định disabled) · **Mất khoá** (hết hạn/ bị tiếp quản → banner + chuyển chỉ xem) · **Ảnh che mờ / đã hiển thị / URL hết hạn (bấm xem lại → ghi log lần nữa)** · **Gắn cờ trùng** · **Đã xử lý** (hồ sơ đã được người khác duyệt → chỉ xem) · **Đang gửi quyết định** · Lỗi 409 |

🖥 Desktop – chi tiết (chia 2 cột)
```
┌─────────┬────────────────────────────────────────────────────────────────────────┐
│ ▶Duyệt DT│ ← Hồ sơ #1042  Host   ⏳ Chờ duyệt                [ Trả lại hàng đợi ] │
│ Duyệt tin│ ⚑ Giấy tờ trùng với tài khoản Host khác: nguyen.b@…  [Xem tài khoản]    │
│ Nhân sự │ ┌──────────────────────────┐ ┌─────────────────────────────────────┐ │
│         │ │ ẢNH GIẤY TỜ              │ │ THÔNG TIN                           │ │
│         │ │ ┌──────────────────────┐ │ │ Họ tên theo giấy tờ: Nguyễn Văn A    │ │
│         │ │ │ ░░░ che mờ ░░░       │ │ │ Số giấy tờ: 0791********             │ │
│         │ │ │ [👁 Bấm để xem]      │ │ │ Ngày sinh / SĐT / Email tài khoản    │ │
│         │ │ │ watermark: Admin·giờ │ │ │ Giấy tờ quyền khai thác: [tệp.pdf]   │ │
│         │ │ └──────────────────────┘ │ │ Lịch sử: gửi lần 1 (từ chối), lần 2  │ │
│         │ │ Mặt trước | Mặt sau | KT │ │                                     │ │
│         │ └──────────────────────────┘ └─────────────────────────────────────┘ │
│         │ ──────────────────────────────────────────────────────────────────── │
│         │ [ Từ chối… ]                                          [ Duyệt hồ sơ ]  │
└─────────┴────────────────────────────────────────────────────────────────────────┘
Dialog "Từ chối": Lý do (▼ danh mục bắt buộc) + Ghi chú gửi Host (bắt buộc) + [Xác nhận từ chối]
```
📱 Mobile/Tablet: danh sách = thẻ; chi tiết = 1 cột: LockBanner → cờ → tab [Ảnh | Thông tin | Lịch sử] → thanh quyết định sticky đáy [Từ chối][Duyệt]. Ảnh giấy tờ mở toàn màn hình, cho phóng to.

---

