# Tài liệu đặc tả nghiệp vụ – Hệ thống đặt phòng lưu trú

Mô hình marketplace, tham chiếu Airbnb. Phiên bản 1.0 (đã cập nhật theo phản hồi của khách hàng), ngày cập nhật 03/10/2026.

| Hạng mục | Nội dung |
|---|---|
| Phạm vi | Hệ thống hoàn chỉnh, 14 module nghiệp vụ, không theo hướng MVP |
| Thị trường | Việt Nam trước, thiết kế sẵn để mở rộng quốc tế |
| Ngôn ngữ | Tiếng Việt + English, kiến trúc cho phép thêm ngôn ngữ |
| Cách đọc | Các đề xuất ở bản 0.9 đã được chấp thuận (trừ những điểm đã điều chỉnh). Thông tin còn thiếu nằm ở mục 7.2 |

Nguyên tắc: mỗi yêu cầu trả lời được câu hỏi **ai làm gì, trong điều kiện nào, theo quy tắc nào, và điều gì xảy ra sau đó**.

---

## 1. Bối cảnh, mục tiêu, phạm vi và ràng buộc

### 1.1. Hệ thống giải quyết vấn đề gì, ai gặp vấn đề

> **Lưu ý:** phần này do BA suy ra từ mô hình Airbnb và các quyết định đã chốt, đã được chấp thuận. Có thể bổ sung bối cảnh thực tế của thị trường mục tiêu khi khách hàng cung cấp.

| Đối tượng | Vấn đề gặp phải | Hệ thống giải quyết bằng |
|---|---|---|
| Guest (khách lưu trú) | Khó tìm chỗ ở ngoài khách sạn mà vẫn tin cậy; giá không rõ ràng; rủi ro chuyển tiền trực tiếp cho người lạ; khó huỷ/hoàn tiền khi có sự cố | Tìm kiếm có lọc, giá tổng minh bạch, thanh toán qua nền tảng, chính sách huỷ rõ ràng, đánh giá hai chiều, giải quyết tranh chấp |
| Host (chủ chỗ ở) | Khó tiếp cận khách; quản lý lịch và thanh toán thủ công; rủi ro khách huỷ, không thanh toán hoặc gây hư hại | Kênh đăng tin có xác minh, lịch và giá linh hoạt, thanh toán được nền tảng đảm bảo, payout định kỳ, đồng bộ iCal |
| Chủ nền tảng (khách hàng của dự án) | Cần mô hình kinh doanh có thể mở rộng, có doanh thu từ hoa hồng và phí dịch vụ, kiểm soát được chất lượng và rủi ro | Cấu hình phí/chính sách, duyệt tin, báo cáo, đối soát, kiểm soát dòng tiền |

### 1.2. Mục tiêu đo được

> Các chỉ số dưới đã được chấp thuận. Khách hàng vẫn cần cung cấp **số liệu hiện tại (baseline)** và **mục tiêu kinh doanh** (số Host, listing, booking, doanh thu theo 6/12 tháng) để hiệu chỉnh ngưỡng (xem 7.2).

**Mục tiêu về trải nghiệm và vận hành**

| Mã | Chỉ số | Mục tiêu | Đo ở đâu |
|---|---|---|---|
| KPI-01 | Thời gian từ khi chọn listing đến khi Instant Book được xác nhận (bao gồm thanh toán) | ≤ 3 phút ở phân vị 75 | Booking |
| KPI-02 | Số booking xác nhận trùng đêm trên nền tảng | 0 | Booking, Lịch |
| KPI-03 | Tỷ lệ thanh toán thành công trên số lần bắt đầu thanh toán | ≥ 90% (chưa tính lỗi do người dùng huỷ) | Thanh toán |
| KPI-04 | Tỷ lệ Request to Book được Host phản hồi trong 24 giờ | ≥ 80% | Booking |
| KPI-05 | Thời gian duyệt hồ sơ Host và listing | ≤ 48 giờ làm việc | Quản trị |
| KPI-06 | Payout đúng lịch (đủ điều kiện và thông tin hợp lệ) | 100% | Thanh toán |
| KPI-07 | Chênh lệch đối soát giữa hệ thống và cổng thanh toán | 0 sau chu kỳ đối soát hằng ngày | Kế toán |
| KPI-08 | Tiếp nhận khiếu nại | ≤ 24 giờ | Hỗ trợ |
| KPI-09 | Tỷ lệ Host huỷ booking | ≤ 3% tổng booking | Huỷ/hoàn tiền |

**Mục tiêu kinh doanh (khách hàng cung cấp, mục 7.2):** số Host và listing sau 6/12 tháng; số booking/tháng; GMV; doanh thu hoa hồng và phí dịch vụ; tỷ lệ Host quay lại; tỷ lệ Guest đặt lại.

### 1.3. Phạm vi

**Trong phạm vi:** 14 module ở Chương 4, gồm đồng bộ iCal (tối thiểu import/export), đa tiền tệ, đa ngôn ngữ (VI/EN), cấu hình pháp lý theo quốc gia, giai đoạn đầu vận hành tại Việt Nam.

**Ngoài phạm vi (không làm ở phiên bản đầu), tất cả đã chốt:**

| Hạng mục | Trạng thái |
|---|---|
| Thanh toán tại chỗ | **Đã chốt: không hỗ trợ** |
| Vận hành thực tế tại quốc gia ngoài Việt Nam (chỉ thiết kế sẵn khả năng mở rộng) | Đã chốt |
| Ứng dụng di động native (chỉ website responsive) | Đã chốt |
| Listing nhiều phòng cùng loại như khách sạn (mỗi listing là một đơn vị đặt) | Đã chốt (OQ-21) |
| Tiền cọc và bảo vệ hư hại tài sản | Đã chốt (OQ-24) |
| Bảo hiểm cho Host/Guest | Đã chốt |
| Chương trình thành viên, điểm thưởng, ví nội bộ | Đã chốt |
| Thanh toán chia đợt, đặt cọc một phần | Đã chốt (thu 100% khi đặt) |
| Đồng bộ lịch qua API channel manager (chỉ dùng iCal) | Đã chốt |
| Ngôn ngữ ngoài Việt/Anh | Đã chốt (kiến trúc sẵn sàng thêm sau) |
| Dịch vụ bổ sung (trải nghiệm, đưa đón, thuê xe…) | Đã chốt |
| Thông báo qua SMS và push notification (chỉ dùng email và thông báo trong website) | Đã chốt |
| Tích hợp eKYC xác minh danh tính (Admin duyệt thủ công) | Đã chốt |

### 1.4. Ràng buộc

| Loại | Nội dung | Trạng thái |
|---|---|---|
| Ngân sách | Chưa có thông tin | **Cần khách hàng cung cấp** |
| Thời hạn | Chưa có thông tin (mốc ra mắt, mốc nghiệm thu từng giai đoạn) | **Cần khách hàng cung cấp** |
| Pháp lý | Giai đoạn đầu áp dụng quy định Việt Nam: khai báo lưu trú, VAT/hoá đơn, thuế, bảo vệ dữ liệu cá nhân, quy định kinh doanh lưu trú; phải xác nhận với tư vấn pháp lý địa phương trước khi triển khai | Đã chốt hướng, chờ tư vấn pháp lý |
| Tích hợp: cổng thanh toán | Visa/Mastercard (nhà cung cấp chưa chốt), MoMo, VNPay | Đã chốt phương thức; nhà cung cấp thẻ chọn khi triển khai (OQ-18) |
| Tích hợp: tỷ giá | Frankfurter API, dùng bản v2 (bản v1 chỉ có tiền tệ ECB, không có VND); tỷ giá cập nhật theo ngày; hệ thống lưu snapshot tỷ giá tại thời điểm thanh toán | Đã chốt |
| Tích hợp: lịch | Chỉ iCal import/export với Airbnb, Booking…; không tích hợp API channel manager | Đã chốt |
| Tích hợp: thông báo | Email là kênh gửi duy nhất, kèm thông báo hiển thị trong website; không SMS, không push | Đã chốt; nhà cung cấp email chọn khi triển khai |
| Tích hợp: bản đồ | Mapbox: hiển thị bản đồ và tìm theo khu vực | Đã chốt |
| Tích hợp: xác minh danh tính | Admin duyệt thủ công hồ sơ CCCD/hộ chiếu; chưa tích hợp eKYC | Đã chốt |
| Vận hành | CSKH và kế toán xử lý hằng ngày; hệ thống phải hỗ trợ đối soát | Đã chốt |

### 1.5. Quy tắc nghiệp vụ quan trọng không được sai

Đây là các bất biến (invariant) mà thiết kế, phát triển và kiểm thử phải bảo đảm tuyệt đối.

| # | Quy tắc | Tham chiếu |
|---|---|---|
| 1 | Không bao giờ có hai booking xác nhận hoặc giữ chỗ cho cùng một đêm của một listing | BR-CAL-01 |
| 2 | Booking chỉ được xác nhận khi thanh toán thành công 100% | BR-BKG-04 |
| 3 | Request to Book không bị charge tiền trước khi Host chấp nhận; quá 24 giờ không phản hồi thì tự hết hạn và mở lại lịch | BR-BKG-02, BR-PAY-01 |
| 4 | Giữ chỗ Instant Book chỉ kéo dài 15 phút; hết hạn thì tự mở lại lịch | BR-BKG-01 |
| 5 | Số tiền Guest thấy = số tiền gửi sang cổng thanh toán = số tiền ghi sổ; giá, phí, thuế, tỷ giá khoá tại thời điểm thanh toán | BR-PRC-06, BR-PRC-07 |
| 6 | Chính sách huỷ áp dụng là chính sách tại thời điểm xác nhận booking; số tiền hoàn hiển thị trước khi huỷ phải bằng số tiền thực hoàn | BR-CNL-03, AC Module 8 |
| 7 | Tiền chỉ đủ điều kiện payout sau 24 giờ kể từ check-in; không payout trước thời điểm này | BR-PAY-02 |
| 8 | Một khoản tiền chỉ được hoàn một lần; số liệu tài chính không sửa/xoá trực tiếp, mọi thay đổi có bút toán | BR-PAY-09 |
| 9 | Host chưa xác minh không được đăng tin; tin chưa được Admin duyệt không hiển thị | BR-ACC-01, BR-LST-01 |
| 10 | Địa chỉ chính xác và thông tin liên hệ chỉ cung cấp cho Guest sau khi booking xác nhận | BR-BKG-07, BR-SRC-04 |
| 11 | Giá mỗi đêm áp theo thứ tự: đặc biệt/lễ → mùa → cuối tuần → cơ bản; sau đó mới áp giảm tuần/tháng | BR-PRC-01 |
| 12 | Commission tính trên giá sau discount; các chương trình giảm giá không cộng dồn trừ khi được cấu hình cho phép | BR-PRC-04, BR-PRM-01 |
| 13 | Khiếu nại và đánh giá chỉ nhận trong 14 ngày sau check-out; đánh giá ẩn đến khi cả hai gửi hoặc hết hạn | BR-DSP-01, BR-REV |
| 14 | Thay đổi cấu hình phí, thuế, chính sách chỉ áp dụng cho booking tạo sau thay đổi | BR-ADM-02 |
| 15 | Mọi thao tác nhạy cảm (duyệt, khoá, hoàn tiền, đổi cấu hình, xem dữ liệu danh tính) đều có log người thực hiện, thời gian, lý do | BR-ADM-03, BR-ACC-05 |

---

## 2. Actor và use case

### 2.1. Danh sách actor

| Actor | Loại | Mô tả | Làm được gì | Giới hạn |
|---|---|---|---|---|
| Guest | Người dùng | Khách tìm và đặt chỗ ở | Tìm kiếm, xem chi tiết, đặt (Instant/Request), thanh toán, dùng coupon, đổi/huỷ booking, nhắn tin, đánh giá, khiếu nại, xác minh danh tính khi được yêu cầu | Không bắt buộc xác minh để đặt, trừ các trường hợp tại BR-ACC-03; chỉ thấy địa chỉ chính xác sau khi booking xác nhận |
| Host | Người dùng | Chủ chỗ ở, cho thuê nguyên căn hoặc phòng riêng | Xác minh danh tính, tạo/sửa listing, đặt giá và phí, quản lý lịch và iCal, chọn Instant/Request và chính sách huỷ, chấp nhận/từ chối yêu cầu và yêu cầu đổi, huỷ booking, tạo Host Promotion, quản lý payout, đánh giá Guest, khiếu nại | Không được đăng tin khi chưa xác minh; tin phải được Admin duyệt; huỷ booking bị phạt |
| Admin | Nội bộ | Quản trị nền tảng | Duyệt Host và listing, quản lý người dùng, cấu hình phí/thuế/chính sách, quản lý Platform Coupon, khai báo bất khả kháng, kiểm duyệt đánh giá, quyết định tranh chấp và hoàn tiền, xem báo cáo | Mọi thao tác nhạy cảm đều ghi log |
| CSKH | Nội bộ | Hỗ trợ khách hàng | Tiếp nhận, phân loại, xử lý khiếu nại; xem hội thoại liên quan; huỷ hộ hoặc hoàn tiền ngoại lệ theo quyền được cấp | Không sửa cấu hình phí và chính sách; quyết định hoàn tiền lớn thuộc Admin |
| Kế toán | Nội bộ | Tài chính | Đối soát thanh toán/payout/hoàn tiền, xử lý payout lỗi, xuất hoá đơn VAT và báo cáo tài chính | Chỉ truy cập dữ liệu tài chính |
| Hệ thống (tác vụ tự động) | Hệ thống | Bộ lập lịch của nền tảng | Hết hạn giữ chỗ và yêu cầu, payout hằng ngày, đồng bộ iCal, gửi thông báo và nhắc, mở/đóng cửa sổ đánh giá, cập nhật tỷ giá | Hoạt động theo cấu hình của Admin |
| Cổng thanh toán | Bên ngoài | Visa/Mastercard, MoMo, VNPay | Xử lý thanh toán và hoàn tiền, trả kết quả cho hệ thống | Kết quả cần đối soát |
| Frankfurter | Bên ngoài | Dịch vụ tỷ giá (API v2) | Cung cấp tỷ giá theo ngày | Không phải thời gian thực; lỗi dịch vụ xử lý theo BR-PRC |
| Nền tảng đối tác iCal | Bên ngoài | Airbnb, Booking… | Cung cấp/nhận lịch iCal | Độ trễ đồng bộ có thể gây trùng lịch (OQ-20) |
| Dịch vụ email | Bên ngoài | Kênh gửi thông báo duy nhất | Gửi email thông báo và xác minh email | Nhà cung cấp chọn khi triển khai |
| Mapbox | Bên ngoài | Dịch vụ bản đồ | Hiển thị bản đồ, tìm theo khu vực | Phụ thuộc dịch vụ Mapbox |

### 2.2. Danh sách use case

| Mã | Use case | Actor chính | Module | Tiền điều kiện | Kết quả |
|---|---|---|---|---|---|
| **Guest** | | | | | |
| UC-01 | Đăng ký, đăng nhập, xác minh email | Guest, Host | ACC | Chưa có tài khoản hoặc chưa đăng nhập | Tài khoản hoạt động |
| UC-02 | Cập nhật hồ sơ, chọn ngôn ngữ và tiền tệ hiển thị | Guest, Host | ACC | Đã đăng nhập | Hồ sơ được cập nhật |
| UC-03 | Gửi hồ sơ xác minh danh tính Guest (Admin duyệt thủ công) | Guest | ACC | Thuộc trường hợp yêu cầu xác minh | Admin duyệt, Guest được phép tiếp tục đặt |
| UC-04 | Tìm kiếm và lọc listing | Guest | SRC | Không bắt buộc đăng nhập | Danh sách listing còn trống |
| UC-05 | Xem chi tiết listing và giá tổng | Guest | SRC, PRC | Listing đang hiển thị | Guest thấy bảng giá cuối cùng |
| UC-06 | Lưu listing vào wishlist | Guest | SRC | Đã đăng nhập | Listing nằm trong wishlist |
| UC-07 | Đặt phòng Instant Book | Guest | BKG | Listing bật Instant Book, còn trống | Booking xác nhận sau thanh toán |
| UC-08 | Gửi yêu cầu Request to Book | Guest | BKG | Listing bật Request to Book, còn trống | Yêu cầu chờ Host, lịch giữ tạm |
| UC-09 | Thanh toán booking | Guest | PAY | Có giữ chỗ hoặc Host đã chấp nhận | Đã thu 100%, booking xác nhận |
| UC-10 | Áp coupon | Guest | PRM | Coupon hợp lệ | Giá được giảm theo điều kiện |
| UC-11 | Yêu cầu đổi ngày hoặc số khách | Guest | BKG | Booking đã xác nhận | Host duyệt, thu thêm/hoàn chênh lệch |
| UC-12 | Huỷ booking (Guest) | Guest | CNL | Booking đã xác nhận | Hoàn tiền theo chính sách, lịch mở lại |
| UC-13 | Nhắn tin với Host | Guest | MSG | Đã đăng nhập | Tin nhắn được lưu |
| UC-14 | Đánh giá Host và listing | Guest | REV | Booking hoàn tất, trong 14 ngày | Đánh giá được công bố theo quy tắc |
| UC-15 | Tạo khiếu nại | Guest | DSP | Trong 14 ngày sau check-out | Khiếu nại được tiếp nhận |
| **Host** | | | | | |
| UC-16 | Nộp hồ sơ xác minh Host | Host | ACC | Đã đăng ký | Admin duyệt hoặc từ chối |
| UC-17 | Tạo và gửi duyệt listing | Host | LST | Host đã xác minh | Listing chờ Admin duyệt |
| UC-18 | Chỉnh sửa, tạm ẩn, xoá listing | Host | LST | Listing tồn tại | Cập nhật hoặc duyệt lại tuỳ mức thay đổi |
| UC-19 | Thiết lập giá và phí | Host | PRC | Listing tồn tại | Bảng giá có hiệu lực |
| UC-20 | Quản lý lịch và quy tắc đêm | Host | CAL | Listing tồn tại | Lịch cập nhật |
| UC-21 | Nhập/xuất lịch iCal | Host | CAL | Có URL iCal | Lịch đồng bộ với nền tảng khác |
| UC-22 | Chọn kiểu đặt và chính sách huỷ | Host | LST, CNL | Listing tồn tại | Cấu hình áp dụng cho booking mới |
| UC-23 | Chấp nhận hoặc từ chối Request to Book | Host | BKG | Có yêu cầu chờ, trong 24 giờ | Guest được yêu cầu thanh toán hoặc yêu cầu bị từ chối |
| UC-24 | Duyệt yêu cầu đổi booking | Host | BKG | Có yêu cầu đổi, trong 24 giờ | Booking đổi hoặc giữ nguyên |
| UC-25 | Huỷ booking (Host) | Host | CNL | Booking đã xác nhận | Hoàn 100% Guest, áp phạt và giảm ranking |
| UC-26 | Tạo Host Promotion | Host | PRM | Listing tồn tại | Khuyến mãi có hiệu lực |
| UC-27 | Quản lý tài khoản payout, xem payout | Host | PAY | Host đã xác minh | Nhận payout đúng lịch |
| UC-28 | Đánh giá Guest, phản hồi đánh giá | Host | REV | Booking hoàn tất, trong 14 ngày | Đánh giá/phản hồi được ghi nhận |
| UC-29 | Tạo hoặc phản hồi khiếu nại | Host | DSP | Có booking liên quan | Khiếu nại được ghi nhận |
| **Admin, CSKH, Kế toán** | | | | | |
| UC-30 | Duyệt hồ sơ Host | Admin | ACC, ADM | Có hồ sơ chờ | Host được duyệt hoặc từ chối kèm lý do |
| UC-31 | Duyệt listing | Admin | LST, ADM | Có listing chờ | Listing hiển thị hoặc bị từ chối/yêu cầu sửa |
| UC-32 | Quản lý người dùng, khoá/mở khoá | Admin | ADM | Có quyền Admin | Trạng thái tài khoản cập nhật |
| UC-33 | Cấu hình phí, thuế, chính sách, tham số | Admin | ADM | Có quyền cấu hình | Áp dụng cho booking mới |
| UC-34 | Quản lý Platform Coupon | Admin | PRM | Có quyền Admin | Coupon có hiệu lực |
| UC-35 | Khai báo sự kiện bất khả kháng | Admin | CNL | Có nguồn chính thức | Booking trong phạm vi được xử lý theo chính sách riêng |
| UC-36 | Kiểm duyệt đánh giá | Admin | REV | Có báo cáo vi phạm | Giữ hoặc gỡ đánh giá |
| UC-37 | Quyết định tranh chấp và hoàn tiền | Admin | DSP | Khiếu nại đã đủ hồ sơ | Quyết định ghi nhận, chuyển Kế toán thực hiện |
| UC-38 | Xem và xuất báo cáo | Admin, Kế toán | ADM | Có quyền xem báo cáo | Báo cáo theo bộ lọc |
| UC-39 | Tiếp nhận và xử lý khiếu nại, hỗ trợ | CSKH | DSP | Có yêu cầu | Khiếu nại được phân loại/xử lý hoặc leo thang |
| UC-40 | Huỷ hộ, hoàn tiền ngoại lệ | CSKH, Admin | CNL | Có lý do và quyền phù hợp | Booking huỷ, hoàn tiền ghi nhận |
| UC-41 | Đối soát thanh toán, payout, hoàn tiền | Kế toán | PAY | Có dữ liệu giao dịch | Sai lệch được xử lý |
| UC-42 | Xử lý payout lỗi, hoàn tiền thủ công | Kế toán | PAY | Có giao dịch lỗi | Giao dịch được xử lý |
| UC-43 | Xuất hoá đơn VAT, báo cáo tài chính | Kế toán | CMP | Giao dịch đủ điều kiện | Hoá đơn/báo cáo được xuất |
| **Hệ thống tự động** | | | | | |
| UC-44 | Hết hạn giữ chỗ và yêu cầu | Hệ thống | BKG | Quá 15 phút hoặc 24 giờ | Lịch mở lại, thông báo Guest |
| UC-45 | Payout hằng ngày | Hệ thống | PAY | Booking đủ điều kiện payout | Host nhận tiền, ghi sổ |
| UC-46 | Đồng bộ iCal định kỳ | Hệ thống | CAL | Listing có URL iCal | Lịch cập nhật |
| UC-47 | Gửi email thông báo và nhắc, hiển thị thông báo trong website | Hệ thống | MSG | Có sự kiện nghiệp vụ | Người dùng nhận thông báo |
| UC-48 | Mở/đóng cửa sổ đánh giá và công bố đánh giá | Hệ thống | REV | Booking hoàn tất | Đánh giá công bố đúng quy tắc |
| UC-49 | Cập nhật tỷ giá từ Frankfurter | Hệ thống | PRC | Dịch vụ Frankfurter sẵn sàng | Tỷ giá mới có hiệu lực |

### 2.3. Đặc tả chi tiết các use case trọng yếu

#### UC-07. Đặt phòng Instant Book

- **Actor:** Guest. **Actor phụ:** Hệ thống, cổng thanh toán, Host (nhận thông báo).
- **Tiền điều kiện:** Listing đang hiển thị, bật Instant Book, còn trống trong khoảng ngày chọn, thoả sức chứa và ràng buộc đêm; Guest đã đăng nhập; nếu thuộc trường hợp yêu cầu xác minh thì đã xác minh (UC-03).
- **Luồng chính:**
  1. Guest chọn ngày và số khách, xem bảng giá chi tiết (tiền phòng, phụ thu, phí vệ sinh, giảm giá, phí dịch vụ, thuế, tổng).
  2. Guest chọn phương thức thanh toán và xác nhận đặt.
  3. Hệ thống giữ chỗ 15 phút, khoá giá, phí, thuế, tỷ giá.
  4. Guest thanh toán 100% (UC-09).
  5. Cổng thanh toán trả kết quả thành công.
  6. Hệ thống xác nhận booking, lưu snapshot chính sách huỷ, khoá lịch, hiển thị địa chỉ chính xác cho Guest.
  7. Hệ thống gửi thông báo cho Guest và Host.
- **Luồng thay thế:** Guest áp coupon trước bước 2 (UC-10); Guest đổi tiền tệ hiển thị trước bước 2 thì giá được quy đổi lại; Guest bị yêu cầu xác minh ở bước 2 thì tạm dừng, xác minh xong tiếp tục.
- **Ngoại lệ:**
  - Hết 15 phút chưa thanh toán: huỷ giữ chỗ, mở lịch (UC-44).
  - Thanh toán thất bại: giữ chỗ còn hiệu lực đến hết 15 phút, Guest được thử lại.
  - Thanh toán thành công nhưng giữ chỗ vừa hết hạn: đối soát; xác nhận nếu lịch còn trống, nếu không thì hoàn tiền tự động.
  - Người khác đặt trước trong lúc Guest xem: báo hết chỗ ở bước 3.
- **Hậu điều kiện:** Booking ở trạng thái Đã xác nhận; lịch bị khoá; tiền được giữ trung gian chờ điều kiện payout.
- **Quy tắc liên quan:** BR-CAL-01, BR-BKG-01, BR-BKG-04, BR-BKG-08, BR-PRC-06, BR-PRC-07.

#### UC-08 và UC-23. Request to Book và phản hồi của Host

- **Actor:** Guest (UC-08), Host (UC-23). **Actor phụ:** Hệ thống, cổng thanh toán.
- **Tiền điều kiện:** Listing bật Request to Book, còn trống; Guest đã đăng nhập.
- **Luồng chính:**
  1. Guest gửi yêu cầu kèm ngày, số khách, lời nhắn; **chưa bị charge**.
  2. Hệ thống giữ lịch tạm và thông báo Host.
  3. Host chấp nhận trong 24 giờ.
  4. Hệ thống yêu cầu Guest thanh toán trong thời hạn quy định (24 giờ, OQ-05) và khoá giá tại thời điểm Host chấp nhận.
  5. Guest thanh toán 100%; hệ thống xác nhận booking và thông báo hai bên.
- **Luồng thay thế:** Host từ chối kèm lý do → mở lại lịch; Guest rút yêu cầu → mở lại lịch.
- **Ngoại lệ:**
  - Host không phản hồi trong 24 giờ: yêu cầu tự hết hạn, mở lịch, Guest không bị charge.
  - Guest không thanh toán đúng hạn sau khi Host chấp nhận: tự huỷ, mở lịch.
  - Nhiều Guest cùng yêu cầu một khoảng ngày: xử lý theo OQ-06.
  - Host chặn lịch trong lúc có yêu cầu chờ: không áp dụng cho yêu cầu đang giữ lịch.
- **Hậu điều kiện:** Booking Đã xác nhận, hoặc yêu cầu Hết hạn/Bị từ chối/Đã rút mà không phát sinh giao dịch.
- **Quy tắc liên quan:** BR-BKG-02, BR-BKG-03, BR-BKG-04, BR-PAY-01, BR-CAL-03.

#### UC-37. Quyết định tranh chấp và hoàn tiền

- **Actor:** Admin. **Actor phụ:** CSKH, Guest, Host, Kế toán.
- **Tiền điều kiện:** Có khiếu nại gửi trong 14 ngày sau check-out (hoặc sự cố an toàn trong lúc lưu trú) kèm mô tả và bằng chứng.
- **Luồng chính:**
  1. Bên khiếu nại gửi hồ sơ (UC-15 hoặc UC-29); hệ thống giữ phần tiền liên quan trong payout và phần dự phòng.
  2. Bên còn lại nhận thông báo và phản hồi trong thời hạn cấu hình.
  3. CSKH tiếp nhận, phân loại, thu thập thông tin (UC-39).
  4. Admin xem chính sách huỷ/hoàn tiền áp dụng và bằng chứng (ảnh, video, chat), ra quyết định.
  5. Hệ thống ghi nhận quyết định, thông báo hai bên, chuyển Kế toán thực hiện hoàn tiền/khấu trừ.
- **Luồng thay thế:** Hai bên tự thoả thuận và rút khiếu nại; sự cố nghiêm trọng được leo thang ngay.
- **Ngoại lệ:**
  - Khiếu nại ngoài hạn 14 ngày: từ chối tiếp nhận trừ khi Admin cho phép.
  - Bên bị khiếu nại không phản hồi: Admin quyết định theo bằng chứng sẵn có.
  - Hoàn tiền vượt phần đang giữ: trừ payout tương lai hoặc yêu cầu Host hoàn trả (BR-PAY-04).
  - Host không còn hoạt động và đã nhận payout: xử lý theo chính sách rủi ro (OQ-09).
- **Hậu điều kiện:** Khiếu nại đóng; quyết định và lý do được lưu không sửa xoá; giao dịch tài chính có bút toán.
- **Quy tắc liên quan:** BR-DSP-01, BR-DSP-02, BR-DSP-03, BR-PAY-03, BR-PAY-04.

### 2.4. Vòng đời booking

| Trạng thái | Ý nghĩa | Chuyển sang |
|---|---|---|
| Giữ chỗ | Instant Book: Guest đang thanh toán, lịch bị giữ 15 phút | Đã xác nhận / Hết hạn |
| Chờ Host | Request to Book: chờ Host phản hồi tối đa 24 giờ, Guest chưa bị charge | Chờ thanh toán / Bị từ chối / Hết hạn / Guest rút |
| Chờ thanh toán | Host đã chấp nhận, Guest phải thanh toán trong thời hạn quy định | Đã xác nhận / Hết hạn |
| Đã xác nhận | Đã thu 100% tiền, lịch được khoá | Đang lưu trú / Đã huỷ |
| Đang lưu trú | Từ giờ check-in đến check-out | Hoàn tất / Đã huỷ (trường hợp đặc biệt) |
| Hoàn tất | Đã check-out; mở đánh giá và khiếu nại 14 ngày | không |
| Đã huỷ | Huỷ bởi Guest, Host, Admin hoặc bất khả kháng; ghi nhận bên huỷ | không |
| Hết hạn / Bị từ chối | Không phát sinh thanh toán; lịch được mở lại | không |

---

## 3. Các quyết định nghiệp vụ đã chốt

Bảng dưới tổng hợp các quyết định đã chốt, gồm cả các đề xuất đã được chấp thuận. Các giá trị còn thiếu nằm ở mục 7.2.

| **Chủ đề** | **Quyết định** |
|---|---|
| Mô hình | Trung gian như Airbnb; đa quốc gia, đa tiền tệ; nguyên căn và phòng riêng |
| Nguồn thu | Host trả commission (khoảng 10–15%, tính trên giá sau discount); Guest trả giá phòng + phí dịch vụ + thuế |
| Tiền tệ | Ra mắt Việt Nam; Guest chọn tiền tệ hiển thị, quy đổi từ tiền tệ listing; tỷ giá lấy từ Frankfurter API (v2), lưu snapshot tại thời điểm thanh toán; Host nhận payout theo đồng tiền của tài khoản payout |
| Thanh toán | Visa/Mastercard, MoMo, VNPay; không trả tại chỗ; thu 100% khi đặt |
| Xác minh và duyệt | Host bắt buộc xác minh (CCCD/hộ chiếu + giấy tờ quyền khai thác chỗ ở), Admin duyệt; Guest xác minh khi booking giá trị cao, tài khoản bất thường hoặc Host/Admin yêu cầu; Admin duyệt mọi tin đăng; thay đổi quan trọng thì duyệt lại |
| Giá | Theo đêm, cuối tuần, mùa/lễ, tuần/tháng, phí vệ sinh, phụ thu khách. Ưu tiên: đặc biệt/lễ → mùa → cuối tuần → cơ bản → giảm tuần/tháng. Guest thấy tổng giá cuối đã gồm mọi phí trước khi thanh toán |
| Đặt phòng | Host chọn Instant Book hoặc Request to Book; giữ chỗ 15 phút khi thanh toán; Request: Host có 24 giờ, Guest chưa bị charge, Host chấp nhận thì Guest thanh toán trong thời hạn, lịch được giữ tạm trong thời gian chờ, quá hạn tự huỷ và mở lịch |
| Đổi booking | Guest yêu cầu đổi ngày/số khách; Host duyệt trong 24 giờ; từ chối thì giữ booking cũ; chênh lệch thu thêm hoặc hoàn; chính sách huỷ theo booking sau khi đổi |
| Dòng tiền | Nền tảng giữ tiền đến 24 giờ sau check-in; giữ một phần dự phòng tranh chấp; payout phần còn lại theo chu kỳ hằng ngày; refund vượt phần giữ thì trừ payout tương lai hoặc yêu cầu Host hoàn trả; Host không hoạt động thì theo chính sách rủi ro đã thoả thuận |
| Huỷ | Host chọn Linh hoạt/Trung bình/Nghiêm ngặt; phí dịch vụ và phí vệ sinh xử lý theo từng policy; Host huỷ: phạt % giá trị booking, giảm ranking, có thể khoá nhận booking; bất khả kháng do Admin xác định theo nguồn chính thức |
| Khuyến mãi | Platform Coupon và Host Promotion; không cộng dồn nếu không được cấu hình cho phép |
| iCal | Chỉ dùng iCal import/export, không tích hợp API channel manager |
| Nền tảng | Website responsive, không có ứng dụng di động native |
| Thông báo | Gửi qua email; không SMS, không push; có thông báo hiển thị trong website |
| Bản đồ | Mapbox cho hiển thị bản đồ và tìm theo khu vực |
| Xác minh danh tính | Admin duyệt thủ công CCCD/hộ chiếu; chưa tích hợp eKYC |
| Đánh giá và tranh chấp | Hai chiều, 14 ngày sau check-out, ẩn đến khi cả hai gửi hoặc hết hạn; khiếu nại trong 14 ngày sau check-out; Admin/CSKH xử lý, Admin quyết định hoàn tiền dựa trên chính sách và bằng chứng |
| Pháp lý, vận hành | Cấu hình theo quốc gia; khai báo lưu trú và xuất VAT khi áp dụng; xác nhận với tư vấn pháp lý địa phương; CSKH + kế toán vận hành hằng ngày |

## 4. Đặc tả chi tiết theo module

Quy ước mã: **ACC** tài khoản, **LST** listing, **CAL** lịch, **PRC** giá, **SRC** tìm kiếm, **BKG** đặt phòng, **PAY** thanh toán, **CNL** huỷ/hoàn tiền, **PRM** khuyến mãi, **MSG** tin nhắn/thông báo, **REV** đánh giá, **DSP** tranh chấp, **ADM** quản trị, **CMP** pháp lý. FR là yêu cầu chức năng, BR là quy tắc nghiệp vụ. Nội dung đánh dấu chưa được khách hàng xác nhận.

### 4.1. Tài khoản và phân quyền

**Mục tiêu:** Cho phép người dùng tham gia nền tảng với mức xác minh phù hợp vai trò, bảo vệ niềm tin hai phía.

**Actor:** Guest, Host, Admin, CSKH, Kế toán.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-ACC-01 | Đăng ký, đăng nhập bằng email; xác minh email bằng liên kết hoặc mã gửi qua email. Số điện thoại là thông tin hồ sơ, không xác minh qua SMS. |
| FR-ACC-02 | Một tài khoản có thể vừa là Guest vừa là Host, chuyển đổi chế độ khi sử dụng. |
| FR-ACC-03 | Host nộp hồ sơ xác minh gồm CCCD/hộ chiếu và giấy tờ chứng minh quyền khai thác chỗ ở; Admin duyệt hoặc từ chối kèm lý do. |
| FR-ACC-04 | Hệ thống yêu cầu Guest xác minh danh tính khi rơi vào các trường hợp tại BR-ACC-03; Guest nộp CCCD/hộ chiếu và Admin duyệt thủ công. |
| FR-ACC-05 | Quản lý hồ sơ cá nhân: tên, ảnh, ngôn ngữ, tiền tệ hiển thị; Host quản lý thêm tài khoản payout. |
| FR-ACC-06 | Phân quyền nội bộ theo vai trò Admin, CSKH, Kế toán với quyền xem/sửa/duyệt tách biệt. |
| FR-ACC-07 | Admin khoá/mở khoá tài khoản kèm lý do; lưu lịch sử thao tác. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-ACC-01 | Host chưa được xác minh không được gửi duyệt hoặc xuất bản listing. |
| BR-ACC-02 | Thay đổi thông tin quan trọng của Host (họ tên, giấy tờ danh tính, giấy tờ quyền khai thác, tài khoản payout) phải được duyệt lại. Payout tạm dừng trong thời gian xác minh lại tài khoản payout. |
| BR-ACC-03 | Guest phải xác minh khi: booking có giá trị vượt ngưỡng cấu hình (xem OQ-22), tài khoản có dấu hiệu bất thường, hoặc theo yêu cầu của Host/Admin. |
| BR-ACC-04 | Mỗi giấy tờ danh tính chỉ gắn với một tài khoản Host. |
| BR-ACC-05 | Dữ liệu danh tính chỉ vai trò được cấp quyền mới xem được và mọi lần xem được ghi log. |
| BR-ACC-06 | Tài khoản bị khoá không được tạo hoặc nhận booking mới; booking đang tồn tại xử lý theo Module 8 và 12. |

#### Luồng nghiệp vụ

- **Chính:** Host đăng ký → xác minh email/SĐT → nộp hồ sơ → Admin duyệt → Host được tạo listing.

- **Phụ:** Guest đặt phòng bị yêu cầu xác minh → booking tạm dừng → Guest hoàn tất xác minh → tiếp tục đặt (nếu giữ chỗ đã hết hạn thì kiểm tra lại lịch).

- **Ngoại lệ:** hồ sơ bị từ chối → Host nhận lý do và nộp lại; giấy tờ hết hạn → yêu cầu cập nhật; giấy tờ trùng tài khoản khác → chuyển Admin điều tra.

#### Tiêu chí nghiệm thu

- Khi Host chưa xác minh bấm gửi duyệt listing, hệ thống chặn và hướng dẫn hoàn tất xác minh.

- Khi Host đổi tài khoản payout, hệ thống yêu cầu xác minh lại và thông báo trạng thái payout.

- Khi booking của Guest vượt ngưỡng, hệ thống yêu cầu xác minh trước bước thanh toán.

### 4.2. Quản lý chỗ ở (Listing)

**Mục tiêu:** Cho Host đăng tin đầy đủ, minh bạch và được kiểm duyệt trước khi hiển thị.

**Actor:** Host, Admin.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-LST-01 | Host tạo listing: loại hình (nguyên căn/phòng riêng), địa chỉ và vị trí trên bản đồ Mapbox, mô tả, ảnh, tiện nghi, sức chứa, số phòng ngủ/giường/phòng tắm, giờ nhận/trả phòng, nội quy, chính sách huỷ, kiểu đặt (Instant Book/Request to Book), tiền tệ listing. |
| FR-LST-02 | Lưu nháp và tiếp tục chỉnh sửa sau. |
| FR-LST-03 | Gửi duyệt; Admin duyệt, từ chối hoặc yêu cầu chỉnh sửa kèm lý do. |
| FR-LST-04 | Host tạm ẩn/hiện listing; xoá listing khi không còn booking tương lai. |
| FR-LST-05 | Host chỉnh sửa listing đã duyệt; hệ thống xác định thay đổi có cần duyệt lại hay không. |
| FR-LST-06 | Khai báo thông tin pháp lý lưu trú theo quốc gia (ví dụ số giấy phép/đăng ký lưu trú nếu áp dụng). |
| FR-LST-07 | Host xem trạng thái tin và lý do nếu bị từ chối hoặc khoá. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-LST-01 | Trạng thái listing: Nháp → Chờ duyệt → Đang hiển thị / Cần chỉnh sửa / Bị từ chối; ngoài ra có Tạm ẩn và Bị khoá. |
| BR-LST-02 | Thay đổi quan trọng (địa chỉ, loại hình, sức chứa, giấy tờ quyền khai thác, ảnh chính) cần Admin duyệt lại. Trong lúc chờ, phiên bản đã duyệt cũ tiếp tục hiển thị. |
| BR-LST-03 | Thay đổi giá, lịch, mô tả nhỏ không cần duyệt lại; thay đổi chính sách huỷ chỉ áp dụng cho booking mới. |
| BR-LST-04 | Số ảnh tối thiểu để gửi duyệt do Admin cấu hình. Mặc định 5 ảnh. |
| BR-LST-05 | Không được xoá listing khi còn booking đã xác nhận; tạm ẩn chỉ chặn booking mới. |
| BR-LST-06 | Hệ thống cảnh báo Admin khi phát hiện địa chỉ trùng với listing khác của Host khác. |

#### Luồng nghiệp vụ

- **Chính:** Host tạo listing → điền đủ thông tin → gửi duyệt → Admin duyệt → listing hiển thị.

- **Phụ:** Admin yêu cầu chỉnh sửa → Host sửa và gửi lại; Host tạm ẩn rồi hiện lại listing.

- **Ngoại lệ:** Host sửa thông tin quan trọng khi đang có booking tương lai → booking không bị ảnh hưởng, Admin duyệt lại nội dung mới; listing bị khoá → booking tương lai xử lý theo Module 8.

#### Tiêu chí nghiệm thu

- Listing chỉ xuất hiện trong tìm kiếm sau khi Admin duyệt.

- Khi Admin từ chối, Host thấy lý do cụ thể và có thể chỉnh sửa, gửi lại.

- Host không thể xoá listing đang có booking tương lai đã xác nhận.

### 4.3. Lịch và tình trạng phòng

**Mục tiêu:** Bảo đảm lịch chính xác, tránh đặt trùng, kể cả khi Host đăng trên nhiều nền tảng.

**Actor:** Host, Guest (gián tiếp), hệ thống, nền tảng đối tác iCal.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-CAL-01 | Host xem lịch theo tháng với trạng thái: trống, đã đặt, đang giữ chỗ, chờ Host, Host chặn, chặn từ iCal. |
| FR-CAL-02 | Host chặn/mở ngày thủ công. |
| FR-CAL-03 | Host cấu hình đêm tối thiểu/tối đa, thời gian chuẩn bị giữa hai booking, thời gian báo trước tối thiểu, giới hạn đặt xa nhất. |
| FR-CAL-04 | Import lịch từ URL iCal của nền tảng khác, đồng bộ định kỳ. |
| FR-CAL-05 | Export URL iCal của listing để nền tảng khác nhập. |
| FR-CAL-06 | Đồng bộ hai chiều thực hiện bằng cách nhập iCal của đối tác và xuất iCal của listing; không tích hợp API channel manager. |
| FR-CAL-07 | Cảnh báo Host khi phát hiện xung đột lịch hoặc import iCal lỗi. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-CAL-01 | Mỗi đêm của một listing chỉ thuộc về một booking hoặc một lượt giữ chỗ; không cho phép overbooking trên nền tảng. |
| BR-CAL-02 | Booking từ ngày A đến ngày B tính B − A đêm; ngày check-out có thể là ngày check-in của booking khác (trừ khi có thời gian chuẩn bị). |
| BR-CAL-03 | Giữ chỗ 15 phút (Instant Book) và giữ chỗ chờ Host (Request to Book) khoá ngày với Guest khác. |
| BR-CAL-04 | Ngày bị chặn từ iCal được coi như Host chặn. |
| BR-CAL-05 | Chu kỳ đồng bộ iCal do Admin cấu hình. Chu kỳ 15 đến 60 phút; hiển thị thời điểm đồng bộ gần nhất cho Host. |
| BR-CAL-06 | Ngày giờ tính theo múi giờ của vị trí listing. |

#### Luồng nghiệp vụ

- **Chính:** Host chặn ngày hoặc nhập iCal → lịch cập nhật → tìm kiếm chỉ hiển thị listing còn trống.

- **Phụ:** Host xuất iCal sang Airbnb/Booking để các nền tảng đó chặn ngày đã đặt tại đây.

- **Ngoại lệ:** URL iCal lỗi hoặc không truy cập được → giữ lịch cũ, cảnh báo Host; trùng lịch do độ trễ đồng bộ → xem OQ-20.

#### Tiêu chí nghiệm thu

- Hai Guest không thể cùng đặt thành công một đêm của cùng listing.

- Ngày bị chặn từ iCal không xuất hiện là còn trống trong tìm kiếm sau lần đồng bộ kế tiếp.

- Listing không cho chọn khoảng ngày vi phạm đêm tối thiểu/tối đa hoặc thời gian báo trước.

### 4.4. Giá và phí

**Mục tiêu:** Tính giá minh bạch, nhất quán và hiển thị tổng chi phí cuối cùng cho Guest trước khi thanh toán.

**Actor:** Host, Guest, Admin, hệ thống, nhà cung cấp tỷ giá.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-PRC-01 | Host đặt giá cơ bản theo đêm bằng tiền tệ listing. |
| FR-PRC-02 | Host đặt giá cuối tuần. |
| FR-PRC-03 | Host đặt giá theo mùa/lễ và giá đặc biệt cho từng ngày hoặc khoảng ngày. |
| FR-PRC-04 | Host đặt mức giảm theo tuần và theo tháng. |
| FR-PRC-05 | Host đặt phí vệ sinh (một lần mỗi booking). |
| FR-PRC-06 | Host đặt phụ thu thêm khách: số khách tính giá cơ bản, mức phụ thu mỗi khách thêm mỗi đêm. |
| FR-PRC-07 | Hệ thống hiển thị bảng giá chi tiết trước thanh toán: tiền phòng, phụ thu, phí vệ sinh, giảm giá, phí dịch vụ, thuế, tổng cuối. |
| FR-PRC-08 | Hiển thị giá theo tiền tệ Guest chọn, quy đổi từ tiền tệ listing. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-PRC-01 | Giá mỗi đêm áp theo thứ tự ưu tiên: giá đặc biệt/lễ → giá mùa → giá cuối tuần → giá cơ bản. Sau đó áp giảm giá tuần/tháng lên tổng tiền đêm. |
| BR-PRC-02 | Khi booking đủ điều kiện cả giảm tuần và tháng, áp mức giảm tháng. |
| BR-PRC-03 | Phụ thu thêm khách tính cho mỗi đêm có số khách vượt ngưỡng. |
| BR-PRC-04 | Commission Host khoảng 10–15% (cấu hình), tính trên giá sau discount. Cơ sở tính gồm tiền phòng, phụ thu và phí vệ sinh, không gồm thuế (OQ-03). |
| BR-PRC-05 | Phí dịch vụ Guest do Admin cấu hình (tỷ lệ cụ thể do khách hàng cung cấp, OQ-02). Thuế/VAT cấu hình theo quốc gia/khu vực. |
| BR-PRC-06 | Tổng giá cuối hiển thị cho Guest bao gồm mọi phí và thuế; không phát sinh khoản ẩn sau bước thanh toán. |
| BR-PRC-07 | Giá, phí, thuế và tỷ giá của booking được khoá tại thời điểm thanh toán; thay đổi sau không ảnh hưởng booking đã xác nhận. |
| BR-PRC-08 | Làm tròn theo quy tắc của từng loại tiền tệ; tỷ giá lấy từ Frankfurter API (v2, có hỗ trợ VND), cập nhật theo ngày; hệ thống lưu snapshot tỷ giá (nguồn, ngày, giá trị) tại thời điểm thanh toán. |
| BR-PRC-09 | Ngày nào được coi là cuối tuần cấu hình theo quốc gia (OQ-27). |

#### Luồng nghiệp vụ

- **Chính:** Guest chọn ngày/khách → hệ thống tính giá theo thứ tự ưu tiên → hiển thị bảng giá chi tiết → Guest thanh toán.

- **Phụ:** Guest đổi tiền tệ hiển thị → hệ thống quy đổi và hiển thị lại; Host sửa giá khi Guest đang xem → giá được tính lại khi Guest đặt.

- **Ngoại lệ:** nhà cung cấp tỷ giá lỗi → dùng tỷ giá gần nhất còn hợp lệ trong thời hạn cấu hình, nếu quá hạn thì chỉ cho thanh toán bằng tiền tệ listing; giá chồng nhiều quy tắc → áp thứ tự BR-PRC-01.

#### Tiêu chí nghiệm thu

- Một đêm vừa thuộc lễ vừa là cuối tuần được tính theo giá lễ.

- Giảm giá tuần/tháng chỉ áp khi số đêm đạt ngưỡng và áp sau khi đã tính giá từng đêm.

- Tổng tiền trên màn hình thanh toán trùng khớp tuyệt đối với số tiền gửi sang cổng thanh toán.

### 4.5. Tìm kiếm và khám phá

**Mục tiêu:** Giúp Guest tìm đúng chỗ ở còn trống với giá minh bạch.

**Actor:** Guest, hệ thống.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-SRC-01 | Tìm theo điểm đến hoặc khu vực (nhập địa danh hoặc chọn vùng trên bản đồ Mapbox), ngày, số khách (người lớn, trẻ em). |
| FR-SRC-02 | Lọc theo khoảng giá, loại hình, số phòng ngủ, tiện nghi, Instant Book, chính sách huỷ, điểm đánh giá. |
| FR-SRC-03 | Sắp xếp theo độ liên quan, giá, đánh giá, mới nhất. |
| FR-SRC-04 | Hiển thị kết quả dạng danh sách và bản đồ Mapbox. |
| FR-SRC-05 | Hiển thị tổng giá cho kỳ lưu trú đã chọn. |
| FR-SRC-06 | Danh sách yêu thích (wishlist), chia sẻ. |
| FR-SRC-07 | Trang chi tiết listing: ảnh, mô tả, tiện nghi, lịch, đánh giá, thông tin Host, nội quy, chính sách huỷ. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-SRC-01 | Chỉ hiển thị listing đang hiển thị, còn trống đủ ngày, thoả sức chứa, đêm tối thiểu/tối đa và thời gian báo trước. |
| BR-SRC-02 | Giá hiển thị trong kết quả đã gồm phí và thuế khi Guest đã chọn ngày. |
| BR-SRC-03 | Xếp hạng dựa trên độ liên quan, điểm đánh giá, tỷ lệ phản hồi, tỷ lệ Host huỷ; Host vi phạm huỷ bị giảm ranking theo Module 8. |
| BR-SRC-04 | Địa chỉ chính xác không hiển thị công khai; chỉ hiển thị khu vực xấp xỉ cho đến khi booking được xác nhận. |
| BR-SRC-05 | Tiền tệ và ngôn ngữ hiển thị theo lựa chọn của Guest. |

#### Luồng nghiệp vụ

- **Chính:** Guest nhập điểm đến, ngày, số khách → xem kết quả → lọc/sắp xếp → mở chi tiết → bắt đầu đặt.

- **Phụ:** Guest lưu listing vào wishlist; Guest không chọn ngày → xem giá tham khảo “từ… / đêm”.

- **Ngoại lệ:** không có kết quả → gợi ý ngày hoặc khu vực lân cận; listing hết chỗ trong lúc Guest xem → báo khi bấm đặt.

#### Tiêu chí nghiệm thu

- Listing không đủ sức chứa hoặc không còn trống không xuất hiện khi lọc theo ngày và số khách.

- Giá trên kết quả khớp với giá ở bước thanh toán.

- Địa chỉ chính xác chỉ hiện sau khi booking được xác nhận.

### 4.6. Đặt phòng

**Mục tiêu:** Cho phép Guest đặt chỗ nhanh (Instant Book) hoặc có Host duyệt (Request to Book), không đặt trùng, thanh toán an toàn.

**Actor:** Guest, Host, hệ thống.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-BKG-01 | Guest chọn ngày, số khách, xem bảng giá chi tiết và chọn phương thức thanh toán. |
| FR-BKG-02 | Instant Book: giữ chỗ 15 phút → thanh toán → xác nhận. |
| FR-BKG-03 | Request to Book: Guest gửi yêu cầu (chưa bị charge), lịch được giữ tạm → Host phản hồi trong 24 giờ → nếu chấp nhận, Guest thanh toán trong thời hạn quy định → xác nhận. |
| FR-BKG-04 | Host chấp nhận hoặc từ chối yêu cầu (kèm lý do); Guest có thể rút yêu cầu. |
| FR-BKG-05 | Guest yêu cầu đổi ngày hoặc số khách; Host duyệt trong 24 giờ; chênh lệch giá thu thêm hoặc hoàn. |
| FR-BKG-06 | Hiển thị trạng thái và chi tiết booking cho hai bên, kèm hướng dẫn nhận phòng sau khi xác nhận. |
| FR-BKG-07 | Ghi nhận check-in và check-out theo lịch; Guest/Host báo vấn đề khi nhận phòng. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-BKG-01 | Giữ chỗ Instant Book hết 15 phút mà chưa thanh toán thì tự huỷ và mở lại lịch. |
| BR-BKG-02 | Request to Book quá 24 giờ không được Host phản hồi thì tự hết hạn, mở lại lịch, Guest không bị charge. |
| BR-BKG-03 | Sau khi Host chấp nhận, Guest phải thanh toán trong thời hạn cấu hình; quá hạn thì tự huỷ và mở lịch. Mặc định 24 giờ (OQ-05). |
| BR-BKG-04 | Booking chỉ được xác nhận khi thanh toán thành công 100%. |
| BR-BKG-05 | Đổi booking: Host từ chối thì giữ booking cũ; chính sách huỷ áp dụng theo booking sau khi thay đổi được duyệt. Host không phản hồi trong 24 giờ thì coi như từ chối (OQ-07). |
| BR-BKG-06 | Số khách không được vượt sức chứa; ràng buộc đêm tối thiểu/tối đa luôn được kiểm tra. |
| BR-BKG-07 | Địa chỉ chính xác và thông tin liên hệ chỉ cung cấp cho Guest sau khi booking xác nhận. |
| BR-BKG-08 | Chính sách huỷ, giá và phí của booking được lưu lại (snapshot) tại thời điểm xác nhận. |

#### Luồng nghiệp vụ

- **Chính (Instant Book):** Guest chọn → hệ thống giữ chỗ 15 phút → Guest thanh toán → xác nhận → thông báo hai bên.

- **Chính (Request to Book):** Guest gửi yêu cầu → giữ lịch → Host chấp nhận trong 24 giờ → Guest thanh toán → xác nhận.

- **Phụ:** Host từ chối; Guest rút yêu cầu; Guest yêu cầu đổi ngày/số khách và Host chấp nhận → thu thêm hoặc hoàn chênh lệch.

- **Ngoại lệ và edge case:** thanh toán thành công đúng lúc giữ chỗ vừa hết hạn (đối soát với cổng, xác nhận nếu lịch còn trống, nếu không thì hoàn tiền tự động); Guest mở nhiều tab đặt cùng ngày; nhiều Guest cùng yêu cầu một khoảng ngày (OQ-06); Host chặn lịch khi đang có yêu cầu chờ.

#### Tiêu chí nghiệm thu

- Hai Guest cùng đặt một ngày: chỉ một người giữ chỗ thành công, người còn lại nhận thông báo hết chỗ.

- Request to Book không phát sinh giao dịch thu tiền cho tới khi Host chấp nhận.

- Yêu cầu hết hạn sau 24 giờ tự mở lại lịch và thông báo Guest.

### 4.7. Thanh toán, giữ tiền và payout

**Mục tiêu:** Thu tiền an toàn, giữ tiền trung gian, chi trả Host đúng hạn và đối soát được.

**Actor:** Guest, Host, Kế toán, Admin, cổng thanh toán.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-PAY-01 | Thanh toán bằng Visa/Mastercard, MoMo, VNPay; thu 100% giá trị booking. |
| FR-PAY-02 | Hiển thị số tiền cuối cùng, tiền tệ thanh toán và tỷ giá đã khoá. |
| FR-PAY-03 | Phát hành biên nhận cho Guest; xuất hoá đơn VAT khi áp dụng. |
| FR-PAY-04 | Ghi sổ từng booking: tiền Guest trả, phí dịch vụ, commission, thuế, phần của Host. |
| FR-PAY-05 | Giữ tiền đến 24 giờ sau check-in; giữ một phần dự phòng tranh chấp. |
| FR-PAY-06 | Payout theo chu kỳ hằng ngày (lịch cấu hình được) qua chuyển khoản hoặc phương thức phù hợp từng quốc gia; ngưỡng payout tối thiểu; tự retry khi lỗi. |
| FR-PAY-07 | Hoàn tiền về phương thức thanh toán gốc. |
| FR-PAY-08 | Host quản lý tài khoản payout, xem sao kê và lịch sử payout. |
| FR-PAY-09 | Kế toán đối soát với cổng thanh toán, payout, hoàn tiền; xuất báo cáo. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-PAY-01 | Instant Book: thu khi đặt. Request to Book: chỉ thu sau khi Host chấp nhận. |
| BR-PAY-02 | Tiền booking đủ điều kiện payout sau 24 giờ kể từ check-in, rồi vào chu kỳ payout hằng ngày kế tiếp. |
| BR-PAY-03 | Nền tảng giữ một phần dự phòng tranh chấp. Mặc định 10% phần Host nhận, giải phóng khi hết 14 ngày sau check-out nếu không có khiếu nại (OQ-08). |
| BR-PAY-04 | Hoàn tiền vượt phần đang giữ thì trừ vào payout tương lai hoặc yêu cầu Host hoàn trả. Host không còn hoạt động: xử lý theo chính sách rủi ro đã thoả thuận (OQ-09). |
| BR-PAY-05 | Số dư dưới ngưỡng payout được cộng dồn sang chu kỳ sau. |
| BR-PAY-06 | Payout lỗi do thông tin sai: giữ số dư, retry theo cấu hình, thông báo Host cập nhật thông tin. |
| BR-PAY-07 | Payout theo đồng tiền của tài khoản payout Host; quy đổi theo tỷ giá Frankfurter tại thời điểm payout (OQ-17). |
| BR-PAY-08 | Nền tảng chịu trách nhiệm phần thuế thuộc doanh thu của nền tảng; Host chịu nghĩa vụ thuế đối với thu nhập của Host. Cách xuất hoá đơn cần xác nhận với tư vấn pháp lý (OQ-04). |
| BR-PAY-09 | Mọi thay đổi số liệu tài chính của booking đều có bút toán và lịch sử, không sửa xoá trực tiếp. |

#### Luồng nghiệp vụ

- **Chính:** Guest thanh toán → cổng trả kết quả → booking xác nhận → tiền giữ trung gian → 24 giờ sau check-in đủ điều kiện → payout hằng ngày cho Host (trừ commission và phần dự phòng).

- **Phụ:** hoàn tiền khi huỷ hoặc Admin quyết định; thu thêm hoặc hoàn chênh lệch khi đổi booking.

- **Ngoại lệ:** thanh toán thất bại/đang chờ (pending) kéo dài; cổng thanh toán báo thành công nhưng hệ thống không nhận được callback (đối soát bù); chargeback từ ngân hàng phát hành (OQ-19); payout thất bại nhiều lần.

#### Tiêu chí nghiệm thu

- Tiền chỉ vào trạng thái “có thể payout” sau 24 giờ kể từ check-in.

- Mỗi booking có bảng phân bổ: Guest trả, phí dịch vụ, commission, thuế, payout Host khớp tổng.

- Payout lỗi không làm mất số dư của Host; Host nhận thông báo và có thể cập nhật tài khoản.

### 4.8. Huỷ, đổi và hoàn tiền

**Mục tiêu:** Quy định rõ ràng, tự động tính hoàn tiền công bằng cho Guest và Host.

**Actor:** Guest, Host, Admin, CSKH, hệ thống.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-CNL-01 | Host chọn một trong ba chính sách: Linh hoạt, Trung bình, Nghiêm ngặt cho từng listing. |
| FR-CNL-02 | Guest huỷ booking; hệ thống tính và hiển thị số tiền hoàn dự kiến trước khi Guest xác nhận. |
| FR-CNL-03 | Host huỷ booking: hoàn đầy đủ cho Guest, áp phạt Host, giảm ranking, có thể khoá quyền nhận booking. |
| FR-CNL-04 | Admin/CSKH huỷ hộ hoặc hoàn tiền ngoại lệ kèm lý do. |
| FR-CNL-05 | Admin tạo sự kiện bất khả kháng: khu vực, khoảng thời gian, nguồn chính thức; booking trong phạm vi được xử lý theo chính sách bất khả kháng. |
| FR-CNL-06 | Hỗ trợ Guest khi Host huỷ: tìm chỗ thay thế, bồi thường theo từng trường hợp. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-CNL-01 | Mốc hoàn tiền theo bảng chính sách ở Chương 5 (đã chốt). |
| BR-CNL-02 | Phí dịch vụ và phí vệ sinh được xử lý theo từng chính sách (xem Chương 5). |
| BR-CNL-03 | Chính sách áp dụng là chính sách tại thời điểm booking được xác nhận; Host đổi chính sách sau đó không ảnh hưởng booking cũ. |
| BR-CNL-04 | Host huỷ: phạt theo % giá trị booking. Bậc phạt theo thời điểm huỷ (OQ-10). |
| BR-CNL-05 | Host huỷ nhiều lần trong một khoảng thời gian bị giảm ranking và có thể bị khoá quyền nhận booking. Ngưỡng ở OQ-11. |
| BR-CNL-06 | Host huỷ: Guest được hoàn 100% gồm phí dịch vụ và có thể nhận bồi thường theo chính sách (OQ-12). |
| BR-CNL-07 | Bất khả kháng do Admin xác định dựa trên nguồn chính thức, áp dụng theo khu vực và thời gian bị ảnh hưởng; mức hoàn theo chính sách riêng (OQ-13); không phạt Host và Guest. |
| BR-CNL-08 | Thời điểm huỷ tính theo múi giờ của listing và giờ check-in đã công bố. |
| BR-CNL-09 | Yêu cầu hết hạn hoặc bị từ chối (chưa thu tiền) không áp chính sách huỷ. |

#### Luồng nghiệp vụ

- **Chính:** Guest bấm huỷ → hệ thống hiển thị số tiền hoàn → Guest xác nhận → mở lại lịch → hoàn tiền → thông báo hai bên.

- **Phụ:** Host huỷ → hoàn 100% → áp phạt và giảm ranking → hỗ trợ Guest tìm chỗ thay thế; huỷ do bất khả kháng.

- **Ngoại lệ và edge case:** huỷ đúng thời điểm biên của mốc; huỷ khi đang có yêu cầu đổi booking; trả phòng sớm; Guest không đến (no-show); Host huỷ vì trùng lịch iCal; hoàn tiền thất bại về phương thức gốc (xử lý thủ công bởi Kế toán).

#### Tiêu chí nghiệm thu

- Số tiền hoàn hiển thị trước khi huỷ khớp với số tiền thực hoàn.

- Host huỷ được ghi nhận, ảnh hưởng ranking và Guest được hoàn đầy đủ.

- Booking trong vùng bất khả kháng đã được Admin xác nhận được hoàn theo chính sách riêng, không bị phạt.

### 4.9. Khuyến mãi và coupon

**Mục tiêu:** Cho nền tảng và Host thu hút khách mà không làm sai lệch giá, hoa hồng.

**Actor:** Admin, Host, Guest.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-PRM-01 | Admin tạo Platform Coupon: mã hoặc tự động; giảm % hoặc số tiền cố định; thời gian hiệu lực; phạm vi (quốc gia, khu vực, listing); đêm/giá trị tối thiểu; đối tượng (ví dụ Guest mới); giới hạn lượt dùng. |
| FR-PRM-02 | Host tạo Host Promotion cho listing của mình: % giảm, thời gian áp dụng, điều kiện (đêm tối thiểu, đặt sớm, đặt sát ngày). |
| FR-PRM-03 | Guest nhập mã hoặc thấy khuyến mãi được áp dụng tự động; xem rõ mức giảm trong bảng giá. |
| FR-PRM-04 | Hệ thống kiểm tra điều kiện, giới hạn và tính giảm giá. |
| FR-PRM-05 | Báo cáo hiệu quả coupon/khuyến mãi. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-PRM-01 | Mặc định không cộng dồn nhiều chương trình giảm giá; chỉ cộng dồn khi chương trình được cấu hình cho phép. |
| BR-PRM-02 | Khi có nhiều ưu đãi hợp lệ, hệ thống tự áp ưu đãi có lợi nhất cho Guest (OQ-14). |
| BR-PRM-03 | Commission tính trên giá sau discount. |
| BR-PRM-04 | Platform Coupon do nền tảng chịu chi phí, Host Promotion do Host chịu; Host nhận như chưa có coupon nền tảng, commission tính trên giá sau discount của Host và trước coupon nền tảng (OQ-15). |
| BR-PRM-05 | Giảm giá tuần/tháng không cộng dồn với Host Promotion, áp mức có lợi hơn cho Guest (OQ-16). |
| BR-PRM-06 | Coupon của booking bị huỷ được hoàn lại hay mất: chưa chốt (xem 7.2). |

#### Luồng nghiệp vụ

- **Chính:** Guest nhập mã/được áp dụng khuyến mãi → hệ thống kiểm tra → cập nhật bảng giá → thanh toán.

- **Phụ:** Admin dừng coupon sớm; Host kết thúc khuyến mãi.

- **Ngoại lệ:** coupon hết lượt giữa lúc Guest đang thanh toán; coupon hết hạn trong thời gian giữ chỗ; Guest nhập mã không hợp lệ.

#### Tiêu chí nghiệm thu

- Hai chương trình không cộng dồn thì hệ thống chỉ áp một chương trình.

- Commission tính đúng trên giá sau discount theo cấu hình.

- Coupon vượt giới hạn lượt dùng bị từ chối với thông báo rõ ràng.

### 4.10. Tin nhắn và thông báo

**Mục tiêu:** Giúp Guest và Host trao đổi trên nền tảng, và thông báo đúng sự kiện đúng người.

**Actor:** Guest, Host, CSKH, hệ thống.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-MSG-01 | Chat Guest–Host gắn với listing hoặc booking, trước và sau khi đặt. |
| FR-MSG-02 | Hạn chế chia sẻ thông tin liên hệ trực tiếp trước khi booking được xác nhận. |
| FR-MSG-03 | Thông báo qua email (kênh gửi duy nhất) và hiển thị trong website theo sự kiện: yêu cầu đặt, chấp nhận/từ chối, thanh toán, xác nhận, nhắc check-in, huỷ, đổi booking, đánh giá, payout, khiếu nại, kết quả xét duyệt. |
| FR-MSG-04 | Mẫu thông báo song ngữ Việt/Anh theo ngôn ngữ người dùng. |
| FR-MSG-05 | Người dùng chọn loại thông báo muốn nhận, trừ thông báo bắt buộc. |
| FR-MSG-06 | CSKH xem hội thoại liên quan khi có khiếu nại; người dùng báo cáo tin nhắn vi phạm. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-MSG-01 | Thông báo bắt buộc (xác nhận, huỷ, thanh toán, thay đổi chính sách, quyết định tranh chấp) không thể tắt. |
| BR-MSG-02 | Nội dung chat được lưu để làm bằng chứng khi có tranh chấp. |
| BR-MSG-03 | Hệ thống che số điện thoại, email, liên kết trong chat trước khi booking xác nhận. Tự động che số điện thoại, email, liên kết ngoài (OQ-25). |
| BR-MSG-04 | Tốc độ và tỷ lệ phản hồi của Host được ghi nhận và hiển thị. |

#### Luồng nghiệp vụ

- **Chính:** sự kiện nghiệp vụ phát sinh → hệ thống chọn mẫu theo ngôn ngữ → gửi qua kênh người dùng chọn.

- **Phụ:** Guest nhắn Host trước khi đặt; Host trả lời; nhắc nhở tự động.

- **Ngoại lệ:** gửi thông báo thất bại → thử lại và ghi log; người dùng tắt thông báo không bắt buộc → vẫn nhận thông báo bắt buộc qua email.

#### Tiêu chí nghiệm thu

- Mỗi sự kiện trong danh sách FR-MSG-03 tạo đúng thông báo cho đúng người nhận.

- Thông tin liên hệ trực tiếp bị che trước khi booking xác nhận.

- CSKH xem được lịch sử chat của booking đang có khiếu nại.

### 4.11. Đánh giá và uy tín

**Mục tiêu:** Xây dựng niềm tin bằng đánh giá hai chiều công bằng, khó bị gây áp lực.

**Actor:** Guest, Host, Admin.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-REV-01 | Sau check-out, hệ thống mời cả hai bên đánh giá trong 14 ngày. |
| FR-REV-02 | Guest đánh giá tổng và theo tiêu chí (sạch sẽ, đúng mô tả, giao tiếp, vị trí, nhận phòng, giá trị) kèm nhận xét. |
| FR-REV-03 | Host đánh giá Guest kèm nhận xét. |
| FR-REV-04 | Đánh giá ẩn cho đến khi cả hai gửi hoặc hết 14 ngày. |
| FR-REV-05 | Host phản hồi công khai đánh giá của Guest. |
| FR-REV-06 | Báo cáo đánh giá vi phạm; Admin kiểm duyệt. |
| FR-REV-07 | Tính điểm trung bình cho listing và Host; trao huy hiệu Host uy tín theo điều kiện cấu hình. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-REV-01 | Chỉ booking đã hoàn tất lưu trú mới được đánh giá, mỗi bên một đánh giá cho mỗi booking. |
| BR-REV-02 | Đánh giá chỉ sửa được trước khi được công bố. |
| BR-REV-03 | Chỉ gỡ đánh giá khi vi phạm quy định nội dung (xúc phạm, thông tin cá nhân, spam…), không gỡ vì đánh giá tiêu cực. |
| BR-REV-04 | Booking bị huỷ không được đánh giá. Cả khi Host huỷ cũng không đánh giá; việc Host huỷ ảnh hưởng ranking (OQ-28). |
| BR-REV-05 | Điều kiện huy hiệu Host uy tín do Admin cấu hình. |

#### Luồng nghiệp vụ

- **Chính:** check-out → mời đánh giá → hai bên gửi → công bố đồng thời (hoặc khi hết 14 ngày).

- **Phụ:** Host phản hồi đánh giá; Admin gỡ đánh giá vi phạm.

- **Ngoại lệ:** chỉ một bên gửi → công bố khi hết 14 ngày; có khiếu nại đang mở trong thời gian đánh giá.

#### Tiêu chí nghiệm thu

- Đánh giá của một bên không hiển thị cho bên kia cho đến khi cả hai gửi hoặc hết 14 ngày.

- Sau 14 ngày sau check-out, hệ thống không nhận thêm đánh giá.

- Đánh giá bị Admin gỡ không còn tính vào điểm trung bình.

### 4.12. Hỗ trợ và tranh chấp

**Mục tiêu:** Xử lý khiếu nại minh bạch, có bằng chứng, có thời hạn và có quyết định ràng buộc về tiền.

**Actor:** Guest, Host, CSKH, Admin, Kế toán.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-DSP-01 | Guest/Host tạo khiếu nại gắn với booking: loại vấn đề (không đúng mô tả, vệ sinh, an toàn, không vào được chỗ ở, huỷ phút chót, hư hại…), mô tả, bằng chứng (ảnh, video, tin nhắn). |
| FR-DSP-02 | Bên còn lại được thông báo và phản hồi trong thời hạn cấu hình. |
| FR-DSP-03 | CSKH tiếp nhận, phân loại, thu thập thông tin; Admin quyết định hoàn tiền/bồi thường dựa trên chính sách và bằng chứng. |
| FR-DSP-04 | Quyết định được ghi nhận, thông báo hai bên và chuyển Kế toán thực hiện (hoàn tiền, khấu trừ payout). |
| FR-DSP-05 | Theo dõi SLA và trạng thái khiếu nại. |
| FR-DSP-06 | Lưu lịch sử khiếu nại theo booking, Host, Guest. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-DSP-01 | Khiếu nại được gửi trong 14 ngày sau check-out; sự cố an toàn hoặc không vào được chỗ ở được tiếp nhận ngay trong thời gian lưu trú. |
| BR-DSP-02 | Khiếu nại đang mở giữ lại phần tiền liên quan trong payout và phần dự phòng. |
| BR-DSP-03 | Admin có quyền quyết định cuối cùng về hoàn tiền dựa trên chính sách và bằng chứng. |
| BR-DSP-04 | Khiếu nại về hư hại tài sản do Guest: chưa có tiền cọc hay bảo vệ hư hại ở giai đoạn đầu, xử lý qua quy trình tranh chấp (OQ-24). |
| BR-DSP-05 | Thời hạn phản hồi và SLA xử lý do Admin cấu hình (OQ-26). |
| BR-DSP-06 | Cơ chế kháng nghị quyết định: chưa chốt (xem 7.2). |

#### Luồng nghiệp vụ

- **Chính:** bên khiếu nại gửi hồ sơ → bên kia phản hồi → CSKH xác minh → Admin quyết định → thực hiện hoàn tiền/khấu trừ → đóng khiếu nại.

- **Phụ:** hai bên tự thoả thuận và rút khiếu nại; leo thang lên Admin do vi phạm nghiêm trọng.

- **Ngoại lệ:** quá 14 ngày → từ chối tiếp nhận trừ trường hợp Admin cho phép; bên bị khiếu nại không phản hồi → Admin quyết định theo bằng chứng sẵn có; Host đã nhận payout và không còn số dư (OQ-09).

#### Tiêu chí nghiệm thu

- Khiếu nại ngoài hạn bị từ chối tiếp nhận với thông báo rõ ràng.

- Khi Admin quyết định hoàn tiền, Kế toán thấy yêu cầu thực hiện kèm lý do và bằng chứng.

- Mọi quyết định được lưu lịch sử và không sửa xoá được.

### 4.13. Quản trị và báo cáo

**Mục tiêu:** Cung cấp công cụ vận hành, cấu hình và báo cáo cho Admin, CSKH, Kế toán.

**Actor:** Admin, CSKH, Kế toán.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-ADM-01 | Duyệt hồ sơ Host và listing. |
| FR-ADM-02 | Quản lý người dùng: tìm kiếm, xem hồ sơ, khoá/mở khoá. |
| FR-ADM-03 | Cấu hình: commission, phí dịch vụ, thuế theo quốc gia, chính sách huỷ, ngưỡng payout, lịch payout, thời gian giữ chỗ, hạn 14 ngày, nguồn tỷ giá, ngôn ngữ. |
| FR-ADM-04 | Quản lý Platform Coupon. |
| FR-ADM-05 | Quản lý sự kiện bất khả kháng. |
| FR-ADM-06 | Kiểm duyệt đánh giá và nội dung báo cáo vi phạm. |
| FR-ADM-07 | Xử lý khiếu nại và quyết định hoàn tiền. |
| FR-ADM-08 | Báo cáo (xem bảng bên dưới), có lọc theo thời gian, quốc gia, listing và xuất file. |
| FR-ADM-09 | Nhật ký hoạt động (audit log) cho mọi thao tác nhạy cảm. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-ADM-01 | Phân quyền theo vai trò: Kế toán chỉ truy cập dữ liệu tài chính; CSKH xử lý khiếu nại, không sửa cấu hình phí và chính sách. |
| BR-ADM-02 | Thay đổi commission, phí, thuế, chính sách chỉ áp dụng cho booking tạo sau thời điểm thay đổi. |
| BR-ADM-03 | Mọi thao tác duyệt, khoá, hoàn tiền, thay đổi cấu hình đều ghi log gồm người thực hiện, thời gian, giá trị cũ/mới. |
| BR-ADM-04 | Báo cáo tài chính hiển thị theo đồng tiền gốc và đồng tiền báo cáo; quy đổi theo tỷ giá Frankfurter (OQ-17). |

#### Luồng nghiệp vụ

- **Chính:** Host gửi hồ sơ/listing → Admin duyệt; người dùng khiếu nại → CSKH/Admin xử lý; Kế toán đối soát hằng ngày.

- **Phụ:** Admin cấu hình lại tham số vận hành; xuất báo cáo định kỳ.

- **Ngoại lệ:** hai Admin cùng xử lý một hồ sơ (khoá bản ghi theo người đang xử lý); thay đổi cấu hình sai (có thể khôi phục từ log).

#### Tiêu chí nghiệm thu

- Mỗi thay đổi cấu hình tài chính có log và không ảnh hưởng booking đã tạo.

- CSKH không thể truy cập màn hình cấu hình phí.

- Báo cáo xuất ra khớp số liệu giao dịch cùng kỳ.

#### Danh sách báo cáo chính

| **Báo cáo** | **Nội dung chính** | **Người dùng chính** |
|---|---|---|
| Booking | Số lượng, trạng thái, kênh đặt, tỷ lệ chuyển đổi, Instant/Request | Admin |
| Doanh thu | Tổng giá trị giao dịch, doanh thu nền tảng theo ngày/tháng/quốc gia | Admin, Kế toán |
| Commission | Commission và phí dịch vụ thu được, theo Host/listing | Kế toán |
| Payout Host | Đã chi, đang chờ, thất bại, số dư giữ lại | Kế toán |
| Refund | Hoàn tiền theo lý do, theo chính sách, thất bại | Kế toán, CSKH |
| Cancellation | Huỷ theo bên huỷ, thời điểm, lý do; Host huỷ và hậu quả | Admin, CSKH |
| User/Host | Đăng ký mới, hoạt động, xác minh, bị khoá | Admin |
| Occupancy | Tỷ lệ lấp đầy theo listing, khu vực, thời gian | Admin |
| Top properties | Listing dẫn đầu theo doanh thu, booking, đánh giá | Admin |

### 4.14. Pháp lý, tuân thủ và an toàn

**Mục tiêu:** Bảo đảm hệ thống cấu hình được theo quy định từng quốc gia và bảo vệ dữ liệu, giao dịch.

**Actor:** Admin, Kế toán, Host, Guest, tư vấn pháp lý.

#### Yêu cầu chức năng

| **Mã** | **Yêu cầu chức năng** |
|---|---|
| FR-CMP-01 | Cấu hình quy định theo quốc gia/khu vực: thuế, VAT, hoá đơn, khai báo lưu trú, thông tin bắt buộc của listing và Guest. |
| FR-CMP-02 | Thu thập thông tin khai báo lưu trú của Guest (họ tên, giấy tờ, quốc tịch…) khi quy định yêu cầu; hỗ trợ xuất dữ liệu cho Host/nền tảng khai báo. |
| FR-CMP-03 | Xuất hoá đơn VAT khi áp dụng. |
| FR-CMP-04 | Điều khoản dịch vụ, chính sách quyền riêng tư; ghi nhận phiên bản và thời điểm người dùng đồng ý. |
| FR-CMP-05 | Quyền của người dùng với dữ liệu cá nhân: xem, yêu cầu xoá, theo thời hạn lưu trữ. |
| FR-CMP-06 | Phát hiện gian lận: giám sát hành vi và giao dịch bất thường, chuyển Admin xem xét. |
| FR-CMP-07 | Lưu trữ dữ liệu giao dịch theo thời hạn luật định. |

#### Quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|---|---|
| BR-CMP-01 | Giai đoạn đầu áp dụng đầy đủ quy định Việt Nam; khi mở rộng quốc tế bổ sung rule về VAT, lưu trú, hoá đơn và nghĩa vụ Host theo từng quốc gia. |
| BR-CMP-02 | Các yêu cầu pháp lý cụ thể (khai báo lưu trú, thuế cho nền tảng thương mại điện tử, hoá đơn, bảo vệ dữ liệu cá nhân, quy định về kinh doanh lưu trú) phải được xác nhận với tư vấn pháp lý địa phương trước khi triển khai. |
| BR-CMP-03 | Người dùng phải đồng ý điều khoản mới nhất để tiếp tục sử dụng khi điều khoản thay đổi. |
| BR-CMP-04 | Dữ liệu danh tính và thanh toán chỉ truy cập theo quyền và có log. |

#### Luồng nghiệp vụ

- **Chính:** Admin cấu hình quy định cho quốc gia → listing/booking thuộc quốc gia đó áp dụng rule tương ứng.

- **Phụ:** thêm quốc gia mới bằng cấu hình và rule mới.

- **Ngoại lệ:** Guest từ chối cung cấp thông tin khai báo bắt buộc → không cho hoàn tất booking; quy định thay đổi giữa lúc booking đã xác nhận (OQ mở).

#### Tiêu chí nghiệm thu

- Booking tại listing thuộc quốc gia có yêu cầu khai báo lưu trú không hoàn tất nếu thiếu thông tin bắt buộc.

- Thuế/VAT áp đúng theo cấu hình của quốc gia/khu vực của listing.

- Lịch sử đồng ý điều khoản của người dùng được lưu theo phiên bản.

## 5. Chính sách huỷ và hoàn tiền

Các mốc dưới đã được chấp thuận. Thời điểm tính theo giờ check-in của listing.

| **Chính sách** | **Thời điểm huỷ** | **Tiền phòng** | **Phí vệ sinh** | **Phí dịch vụ Guest** |
|---|---|---|---|---|
| Linh hoạt | Từ 24 giờ trở lên trước check-in | Hoàn 100% | Hoàn 100% | Hoàn 100% |
| Linh hoạt | Dưới 24 giờ trước check-in | Hoàn 100% trừ đêm đầu | Hoàn 100% | Không hoàn |
| Linh hoạt | Sau check-in | Hoàn các đêm chưa ở, trừ 1 đêm kế tiếp | Không hoàn | Không hoàn |
| Trung bình | Từ 5 ngày trở lên trước check-in | Hoàn 100% | Hoàn 100% | Hoàn 100% |
| Trung bình | Dưới 5 ngày trước check-in | Hoàn 50% | Hoàn 100% | Không hoàn |
| Trung bình | Sau check-in | Hoàn 50% các đêm chưa ở | Không hoàn | Không hoàn |
| Nghiêm ngặt | Trong 48 giờ sau khi đặt và còn từ 14 ngày trước check-in | Hoàn 100% | Hoàn 100% | Hoàn 100% |
| Nghiêm ngặt | Từ 7 ngày trở lên trước check-in (ngoài trường hợp trên) | Hoàn 50% | Hoàn 100% | Không hoàn |
| Nghiêm ngặt | Dưới 7 ngày hoặc sau check-in | Không hoàn | Không hoàn | Không hoàn |

#### Các trường hợp đặc biệt

- **Host huỷ:** hoàn 100% tổng số tiền Guest đã trả; phạt Host theo % giá trị booking; giảm ranking; có thể khoá quyền nhận booking khi tái phạm (OQ-10, OQ-11, OQ-12).

- **Bất khả kháng:** Admin xác định sự kiện, khu vực, thời gian; mức hoàn theo chính sách riêng (OQ-13); không áp dụng phạt.

- **Đổi booking đã được duyệt:** chính sách huỷ áp dụng theo booking sau thay đổi.

- **Chênh lệch giá khi đổi:** Guest thanh toán thêm, hoặc được hoàn phần chênh lệch về phương thức gốc.

## 6. Yêu cầu phi chức năng ở mức nghiệp vụ

Các mục dưới chỉ nêu yêu cầu từ góc nhìn nghiệp vụ; giải pháp kỹ thuật do nhóm phát triển quyết định.

- **Tính toàn vẹn dữ liệu tài chính:** không mất, không trùng giao dịch; mọi số liệu có thể đối soát với cổng thanh toán.

- **Chống đặt trùng:** không có hai booking xác nhận cho cùng một đêm của một listing.

- **Đa ngôn ngữ, đa tiền tệ, đa múi giờ:** mọi nội dung, giá, thời điểm hiển thị đúng theo người dùng và listing.

- **Bảo mật và quyền riêng tư:** dữ liệu danh tính, thanh toán được bảo vệ; truy cập theo quyền và có log.

- **Khả năng mở rộng quốc gia:** thêm quốc gia, tiền tệ, ngôn ngữ, quy định thuế bằng cấu hình thay vì sửa nghiệp vụ lõi.

- **Khả năng kiểm toán:** mọi quyết định tài chính và duyệt đều có người thực hiện, thời gian, lý do.

## 7. Quyết định chi tiết (mã OQ) và thông tin còn thiếu

### 7.1. Các quyết định chi tiết đã chốt

Mã OQ giữ nguyên để truy vết từ các quy tắc ở Chương 4. Toàn bộ mục dưới là quyết định đã chốt (đề xuất ở bản 0.9 đã được chấp thuận, trừ các mục đã điều chỉnh).

| Mã | Nội dung | Quyết định | Module |
|---|---|---|---|
| OQ-01 | Guest thực sự thanh toán bằng đồng tiền nào, khi MoMo/VNPay chỉ xử lý VND? | Guest thanh toán bằng đồng tiền cổng hỗ trợ (VND qua MoMo/VNPay; thẻ quốc tế theo tiền tệ cổng hỗ trợ). Tiền tệ hiển thị quy đổi bằng tỷ giá Frankfurter v2, lưu snapshot tại thời điểm thanh toán, hiển thị rõ số tiền thực trả. | 7, 4 |
| OQ-02 | Tỷ lệ phí dịch vụ Guest và tỷ lệ commission Host cụ thể; cố định hay theo quốc gia/Host? | Cấu hình theo quốc gia, có thể ghi đè theo Host. Tỷ lệ cụ thể (phí dịch vụ Guest, commission 10–15%) chờ khách hàng cung cấp. | 4 |
| OQ-03 | Commission tính trên những khoản nào? | Tiền phòng + phụ thu + phí vệ sinh, sau discount, không gồm thuế. | 4, 7 |
| OQ-04 | VAT/hoá đơn: nền tảng xuất hoá đơn cho khoản nào? | Nền tảng xuất hoá đơn cho phí dịch vụ và commission; tiền phòng do Host chịu trách nhiệm. Cần tư vấn pháp lý/kế toán. | 7, 14 |
| OQ-05 | Thời hạn Guest thanh toán sau khi Host chấp nhận Request to Book; giá khoá lúc nào? | 24 giờ; giá khoá tại thời điểm Host chấp nhận. | 6 |
| OQ-06 | Nhiều Guest cùng gửi Request cho cùng khoảng ngày thì xử lý thế nào? | Lịch giữ độc quyền cho một yêu cầu tại một thời điểm; mỗi Guest tối đa 3 yêu cầu chờ đồng thời để tránh chiếm lịch. | 3, 6 |
| OQ-07 | Đổi booking: Host không phản hồi trong 24 giờ; giá ngày mới tính theo giá nào? | Coi như từ chối; giá tính theo bảng giá hiện hành của khoảng ngày mới. | 6 |
| OQ-08 | Tỷ lệ và thời gian giữ phần dự phòng tranh chấp. | 10% phần Host nhận, giữ đến hết 14 ngày sau check-out. | 7, 12 |
| OQ-09 | Chính sách rủi ro khi Host không hoạt động và đã nhận payout. | Nền tảng tạm chịu trong hạn mức, sau đó truy thu qua điều khoản hợp đồng với Host; cân nhắc quỹ bảo đảm. | 7, 12 |
| OQ-10 | Mức phạt Host huỷ (% giá trị booking). | 10% nếu huỷ từ 14 ngày trở lên, 20% nếu dưới 14 ngày, 30% nếu dưới 48 giờ; khấu trừ vào payout. | 8 |
| OQ-11 | Ngưỡng khoá quyền nhận booking. | 3 lần Host huỷ trong 90 ngày thì khoá lịch 30 ngày; tái phạm xem xét khoá tài khoản. | 8 |
| OQ-12 | Bồi thường Guest khi Host huỷ và nguồn chi. | Hoàn 100% + hỗ trợ tìm chỗ thay thế + voucher; chi từ tiền phạt Host. | 8 |
| OQ-13 | Mức hoàn và ai chịu chi phí khi bất khả kháng. | Hoàn 100% cho Guest; Host không nhận payout cho phần đã huỷ; nền tảng không phạt hai bên. | 8 |
| OQ-14 | Khi có nhiều ưu đãi hợp lệ, ai chọn? | Hệ thống tự áp ưu đãi có lợi nhất cho Guest. | 9 |
| OQ-15 | Platform Coupon: phần Host nhận tính trên giá trước hay sau coupon? | Nền tảng chịu chi phí coupon; Host nhận như chưa có coupon (commission tính trên giá sau discount của Host, trước coupon nền tảng). | 9, 4 |
| OQ-16 | Giảm giá tuần/tháng có cộng dồn với Host Promotion không? | Không cộng dồn, áp mức có lợi hơn cho Guest. | 9, 4 |
| OQ-17 | Nhà cung cấp tỷ giá; xử lý chênh lệch tỷ giá khi hoàn tiền và payout. | Nhà cung cấp tỷ giá: Frankfurter v2. Hoàn theo số tiền gốc đã thu; payout quy đổi theo tỷ giá thời điểm payout, chênh lệch nền tảng quản lý theo quy định kế toán. | 4, 7, 13 |
| OQ-18 | Nhà cung cấp thẻ quốc tế và cổng thanh toán dùng cho từng quốc gia. | Một cổng thẻ quốc tế cho Visa/Mastercard cùng cổng nội địa MoMo/VNPay. Nhà cung cấp thẻ cụ thể chọn khi triển khai. | 7 |
| OQ-19 | Quy trình xử lý chargeback. | Tạm giữ payout liên quan, cung cấp bằng chứng cho ngân hàng, trừ Host nếu lỗi thuộc Host. | 7 |
| OQ-20 | iCal: chu kỳ đồng bộ và trách nhiệm khi trùng lịch do độ trễ. | Đồng bộ 15 đến 60 phút; Host huỷ do trùng lịch iCal được miễn phạt lần đầu nếu có bằng chứng, các lần sau tính như Host huỷ. | 3, 8 |
| OQ-21 | Hỗ trợ listing nhiều phòng cùng loại (như khách sạn nhỏ) không? | Chưa hỗ trợ ở giai đoạn đầu: mỗi listing một đơn vị đặt. | 2, 3 |
| OQ-22 | Ngưỡng “booking giá trị cao” để yêu cầu xác minh Guest. | Cấu hình theo quốc gia và tiền tệ; giá trị ngưỡng ban đầu chờ khách hàng cung cấp. | 1 |
| OQ-23 | Ngưỡng payout tối thiểu và giờ chốt chu kỳ hằng ngày; phương thức payout theo quốc gia. | Ngưỡng và giờ chốt cấu hình được; ra mắt Việt Nam chỉ cần chuyển khoản ngân hàng. Giá trị cụ thể chờ khách hàng cung cấp. | 7 |
| OQ-24 | Có tiền cọc hoặc bảo vệ hư hại tài sản cho Host không? | Chưa có ở giai đoạn đầu; Host khiếu nại hư hại qua quy trình tranh chấp. | 12 |
| OQ-25 | Mức chặn thông tin liên hệ trong chat trước khi xác nhận booking. | Tự động che số điện thoại, email, liên kết ngoài. | 10 |
| OQ-26 | SLA tiếp nhận và xử lý khiếu nại; thời hạn bên kia phản hồi. | Tiếp nhận trong 24 giờ, bên kia phản hồi trong 72 giờ, quyết định trong 7 ngày làm việc. | 12 |
| OQ-27 | Ngày nào là “cuối tuần” cho giá cuối tuần. | Cấu hình theo quốc gia; Việt Nam: tối thứ Sáu và thứ Bảy. | 4 |
| OQ-28 | Có cho đánh giá booking bị huỷ (đặc biệt Host huỷ) không? | Không đánh giá; việc Host huỷ ảnh hưởng ranking và chỉ số uy tín. | 11 |

### 7.2. Thông tin còn thiếu

Đây là các giá trị hoặc quyết định chưa có, không làm thay đổi cấu trúc nghiệp vụ nhưng cần có trước khi cấu hình và nghiệm thu.

| # | Nội dung | Ghi chú |
|---|---|---|
| 1 | Ngân sách và thời hạn (mốc ra mắt, mốc nghiệm thu từng giai đoạn) | Khách hàng cung cấp |
| 2 | Baseline hiện tại và mục tiêu kinh doanh (số Host, listing, booking, doanh thu theo 6/12 tháng) | Để hiệu chỉnh ngưỡng KPI-01 đến KPI-09 |
| 3 | Tỷ lệ cụ thể: phí dịch vụ Guest và commission Host (10–15%) | OQ-02 |
| 4 | Ngưỡng “booking giá trị cao”, ngưỡng payout tối thiểu, giờ chốt payout | OQ-22, OQ-23 |
| 5 | Nhà cung cấp thẻ quốc tế và nhà cung cấp email | OQ-18 |
| 6 | Tư vấn pháp lý Việt Nam: khai báo lưu trú, VAT/hoá đơn, thuế nền tảng, dữ liệu cá nhân | OQ-04, BR-CMP-02 |
| 7 | Coupon của booking bị huỷ: hoàn lại hay mất | BR-PRM-06. Gợi ý: hoàn lại nếu Host huỷ hoặc bất khả kháng, mất nếu Guest huỷ |
| 8 | Cơ chế kháng nghị quyết định tranh chấp | BR-DSP-06. Gợi ý: một lần kháng nghị trong 7 ngày, Admin cấp cao xem xét lại |

### 7.3. Hệ quả của các quyết định mới (đã áp dụng vào tài liệu)

- Vì thông báo chỉ qua email, đăng ký và xác minh dùng email; số điện thoại là thông tin liên hệ, **không xác minh bằng OTP SMS** (FR-ACC-01).
- Thông báo vẫn hiển thị trong website (không cần dịch vụ ngoài); không có push và SMS (FR-MSG-03).
- Frankfurter cập nhật tỷ giá theo ngày, không theo thời gian thực; “khoá tại thời điểm thanh toán” nghĩa là lưu lại tỷ giá mới nhất có tại thời điểm đó (BR-PRC-08).
- Chỉ dùng iCal nên có độ trễ đồng bộ; rủi ro trùng lịch được xử lý theo OQ-20 (BR-CAL-05).
- Không có eKYC nên Admin duyệt hồ sơ danh tính của cả Host lẫn Guest bằng tay; cần tính tải công việc cho Admin (KPI-05).
