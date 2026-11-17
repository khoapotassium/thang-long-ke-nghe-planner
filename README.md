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

## Dữ liệu và ghi nhận

Dữ liệu được tổng hợp từ website sự kiện và agenda của Ban tổ chức. Workflow GitHub Actions được cấu hình để cập nhật dữ liệu định kỳ; các mục đã rà soát thủ công nằm trong `data-src/`. Dữ liệu lịch hội có thể chưa đầy đủ hoặc thay đổi sau khi website cập nhật.

Bản đồ sử dụng [Leaflet](https://leafletjs.com/) và dữ liệu bản đồ từ [OpenStreetMap](https://www.openstreetmap.org/copyright).

## Chạy trên máy cá nhân

Cần có Python. Tại thư mục dự án, chạy máy chủ:

```powershell
py -m http.server 8899
```

Sau đó mở <http://localhost:8899/> trong trình duyệt. Trên macOS/Linux, có thể dùng `python3 -m http.server 8899`.

## Kiểm thử

Cài Playwright và Chromium một lần:

```powershell
py -m pip install playwright
py -m playwright install chromium
```

Để chạy test, giữ máy chủ ở một terminal và chạy các lệnh sau trong terminal khác:

```powershell
py .\test\test_chuc_nang.py
py .\test\test_man_hinh_rong.py
```

Ảnh chụp test được lưu trong `shots\` và không đưa vào Git.

## Cập nhật dữ liệu

- Sửa thông tin sự kiện API trong `data-src/overrides.json`.
- Bổ sung hoạt động từ agenda trong `data-src/agenda-extra.json`.
- Sửa tọa độ địa điểm trong `data-src/venues.json`.
- Chạy `py .\scripts\build_events.py` trên Windows hoặc `python3 scripts/build_events.py` trên macOS/Linux.

`data/events.json` là dữ liệu được tạo tự động; không sửa trực tiếp vì lần build kế tiếp sẽ ghi đè.

## GitHub Pages

Workflow `Deploy GitHub Pages` tự chạy khi có thay đổi trên nhánh `main`. Nếu Pages chưa được bật cho repository, vào **Settings → Pages**, chọn **GitHub Actions** làm nguồn triển khai. Sau khi deploy thành công, website có địa chỉ:

<https://khoapotassium.github.io/thang-long-ke-nghe-planner/>

---

Dữ liệu sự kiện thuộc website/agenda của Ban tổ chức. Dự án cộng đồng này không liên kết hay được Ban tổ chức chứng thực.
