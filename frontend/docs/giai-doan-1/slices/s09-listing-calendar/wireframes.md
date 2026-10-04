## S09 · Lịch listing và chống đặt trùng

### H06 · Lịch listing
| Mục | Giá trị |
|---|---|
| Route / Role | `/host/listings/:id/calendar` · Host (listing Đang hiển thị / Tạm ẩn) |
| Component | CMP-23 CalendarMonth (điều hướng tháng, nút Hôm nay), legend 5 trạng thái, panel hành động (Drawer phải 380px / BottomSheet), khối **Quy tắc lưu trú** (đêm tối thiểu/tối đa, thời gian chuẩn bị, báo trước, đặt xa nhất – cùng dữ liệu bước 5), CMP-32 SaveIndicator, chip múi giờ listing, "Đồng bộ iCal gần nhất" (🔒 Phase sau – ẩn), CMP-07/08 |
| Action | Chọn 1 ngày / kéo chọn khoảng ngày · **Chặn ngày** · **Mở ngày** · Sửa quy tắc lưu trú · Chuyển tháng · Chuyển sang Giá theo mùa (H08) · Bấm ngày đã đặt → xem popover |
| State (trang) | **Loading** (skeleton lưới) · **Default** · **Rỗng** (tháng không có sự kiện – vẫn hiển thị lưới) · **Listing chưa được duyệt** (banner "Lịch mở sau khi listing được duyệt", lưới read-only) · **Lỗi tải** · **Offline** |
| State (ô ngày) | Trống · Đã đặt · Giữ chỗ · Chờ Host · Host chặn · Quá khứ · **Được chọn** · **Ngoài quy tắc đặt** (trong thời gian báo trước / quá giới hạn đặt xa: Host vẫn chặn/mở được, ô có chấm mờ "khách không đặt được") · **Hover** (tooltip trạng thái) |
| State (hành động) | Panel: Chọn trống → [Chặn] · Chọn đã chặn → [Mở] · Chọn **hỗn hợp** (cả trống + đã đặt) → chỉ áp cho ngày hợp lệ, hiển thị "Bỏ qua 2 ngày đã đặt" · **Đang áp dụng** · **409 xung đột** (ngày vừa bị đặt/giữ chỗ: toast + tải lại lịch, giữ lựa chọn còn hợp lệ) · **Thành công** (toast + Hoàn tác trong 5 giây*) |
\* Hoàn tác = gọi API ngược lại; tuỳ chọn.

🖥 Desktop
```
┌────────┬───────────────────────────────────────────────────────────────────────┐
│ Sidebar│ ← Nhà trên đồi Đà Lạt · Lịch                  Múi giờ: Asia/Ho_Chi_Minh │
│        │ [Lịch] [Giá theo mùa →]                               Đã lưu 10:42      │
│        │ ‹  Tháng 12/2026  ›   [Hôm nay]      Legend: ▢Trống ■Đã đặt ◔Giữ chỗ    │
│        │                                      ?Chờ Host ▨Chặn                     │
│        │ ┌──┬──┬──┬──┬──┬──┬──┐ ┌──────────────────────────────┐                 │
│        │ │T2│T3│T4│T5│T6│T7│CN│ │ ĐÃ CHỌN: đêm 14–16/12 (3 đêm) │                 │
│        │ ├──┼──┼──┼──┼──┼──┼──┤ │ Trạng thái: Trống            │                 │
│        │ │ 1│ 2│ 3│ 4│ 5│ 6│ 7│ │ [  Chặn 3 ngày  ]            │                 │
│        │ │ 8│ 9│10│11│12│13│14│ │ ──────────────────────────── │                 │
│        │ │15│16│▓▓│▓▓│▓▓│20│21│ │ Quy tắc lưu trú  [Sửa]       │                 │
│        │ │  │  │đặt│đặt│đặt│  │  │ │ Tối thiểu 1 · Tối đa 30 đêm   │                 │
│        │ │22│23│▨▨│▨▨│27│28│29│ │ Chuẩn bị: không · Báo trước: 0 │                 │
│        │ └──┴──┴──┴──┴──┴──┴──┘ └──────────────────────────────┘                 │
└────────┴───────────────────────────────────────────────────────────────────────┘
```
📱 Mobile
```
┌──────────────────────────────┐
│ ←  Lịch · Nhà trên đồi        │
│ [Lịch] [Giá theo mùa]         │
│ ‹ Tháng 12/2026 ›  [Hôm nay]  │
│ T2 T3 T4 T5 T6 T7 CN          │
│ 1  2  3  4  5  6  7          │
│ 8  9  10 11 12 13 14         │
│ 15 16 ▓▓ ▓▓ ▓▓ 20 21         │
│ 22 23 ▨▨ ▨▨ 27 28 29         │
│ Legend (cuộn ngang) ▢■◔?▨     │
│ ▸ Quy tắc lưu trú  [Sửa]      │
├──────────────────────────────┤
│ Đã chọn đêm 14–16/12 · 3 đêm  │ ← BottomSheet hiện khi có chọn
│ [      Chặn 3 ngày         ]  │
└──────────────────────────────┘
```
Tablet: lưới lịch + panel phải 320px. Chọn khoảng bằng chạm ngày đầu rồi ngày cuối (mobile), kéo chuột (desktop), Shift+click (bàn phím/desktop).

---

