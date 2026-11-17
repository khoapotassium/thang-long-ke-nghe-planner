# Thăng Long Kẻ Nghệ Planner

Trang web cộng đồng, không chính thức, giúp khám phá hoạt động và lên lịch tham dự **Lễ hội Thiết kế Sáng tạo Hà Nội 2026 – “Thăng Long Kẻ Nghệ”** (13–29/11/2026).

**Website:** [khoapotassium.github.io/thang-long-ke-nghe-planner](https://khoapotassium.github.io/thang-long-ke-nghe-planner/)
**Nguồn sự kiện:** [lehoithietkesangtao.vn](https://lehoithietkesangtao.vn/)

> Đây không phải website của Ban tổ chức. Thời gian và địa điểm có thể thay đổi; vui lòng kiểm tra thông tin chính thức trước khi tham dự.

## Tính năng

- Xem hoạt động theo ngày, tìm kiếm có dấu hoặc không dấu và lọc theo loại hình.
- Sắp xếp hoạt động theo khoảng cách gần nhất nếu cho phép truy cập vị trí.
- Xem địa điểm trên bản đồ; mở chỉ đường.
- Tạo lịch gợi ý theo thời gian rảnh, sở thích và nhịp độ; chọn tuyến mẫu.
- Lưu hoạt động, thêm điểm riêng, cảnh báo trùng giờ và ước tính thời gian di chuyển.
- Xuất lịch `.ics` hoặc chia sẻ lịch trình bằng liên kết.
- Dùng giao diện tiếng Việt hoặc tiếng Anh; hỗ trợ cài lên màn hình chính và sử dụng khi mạng yếu.

## Quyền riêng tư

- Vị trí chỉ được dùng trên thiết bị để tính khoảng cách, không gửi lên máy chủ.
- Lịch đã lưu, điểm riêng và tùy chọn ngôn ngữ được lưu trong trình duyệt của bạn.
- Đo lường truy cập và gửi góp ý là các tích hợp tùy chọn, cấu hình trong `config.js`.
- Xem [Chính sách quyền riêng tư](privacy.html) để biết thêm chi tiết.

## Triển khai

Bản đồ dùng Leaflet (có sẵn trong `vendor/leaflet`) với nền OpenStreetMap, miễn phí và không cần API key. Bản đồ bị khóa trong phạm vi Hà Nội (`maxBounds`, `minZoom: 10`) nên chỉ hiển thị khu vực Hà Nội.

Dữ liệu sự kiện thuộc website/agenda của Ban tổ chức. Dự án cộng đồng này không liên kết hay được Ban tổ chức chứng thực.
