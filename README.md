# Thăng Long Kẻ Nghệ Planner

Web cộng đồng (không chính thức) giúp lên lịch trình đi **Lễ hội Thiết kế Sáng tạo Hà Nội 2026 – "Thăng Long Kẻ Nghệ"** (13–29/11/2026).  
Dữ liệu tổng hợp từ [lehoithietkesangtao.vn](https://lehoithietkesangtao.vn/) và agenda chính thức.

## Tính năng
- Xem sự kiện theo từng ngày, tách "chỉ diễn ra hôm nay" và "đang mở cửa nhiều ngày"
- Lọc theo loại hình; tìm kiếm có/không dấu; xem sự kiện gần vị trí bạn
- Bản đồ tương tác (Leaflet + OpenStreetMap)
- Tuyến gợi ý: thêm cả tuyến vào lịch một chạm
- Lịch của tôi: sắp xếp thứ tự, ước tính đi lại, cảnh báo trùng giờ, mở Google Maps
- Xuất `.ics` (Google Calendar / Apple Calendar), chia sẻ lịch trình qua link
- **Trang chính là Gợi ý**: mở web là có ngay lịch gợi ý cho hôm nay; bấm "Chỉnh" để đổi giờ rảnh, sở thích, nhịp độ
- Thêm địa điểm riêng (chỉ lưu trên máy bạn)
- Chạy khi mạng yếu (PWA, có thể thêm ra màn hình chính)
- Giao diện Việt + Anh

## Cấu trúc
```
index.html              giao diện chính
styles.css
app.js                  toàn bộ logic
config.js               cấu hình (GoatCounter, endpoint góp ý, link Threads...)
sw.js                   Service Worker (offline)
manifest.webmanifest    PWA manifest
privacy.html            trang quyền riêng tư (vi/en)
favicon.svg
og-image.png
icons/                  icon-192.png, icon-512.png
vendor/leaflet/         thư viện bản đồ (offline, không cần CDN)
data/events.json        dữ liệu sự kiện (do script tạo, không sửa tay)
data/build-report.json  báo cáo build (kiểm tra sau mỗi lần chạy)
data/kiem-tra-du-lieu.csv  bảng rà soát thủ công
data-src/               nguồn dữ liệu thô
scripts/build_events.py script gộp dữ liệu
worker/                 Cloudflare Worker nhận góp ý
.github/workflows/      GitHub Actions tự động cập nhật
```

## Đưa lên GitHub Pages

1. Tạo repo Public và push project lên nhánh `main`.
2. Workflow `Deploy GitHub Pages` tự chạy mỗi khi push. Nếu GitHub yêu cầu chọn nguồn lần đầu, vào **Settings → Pages** và chọn **GitHub Actions**.
3. Sau khi workflow hoàn tất, web ở `https://<ten>.github.io/<repo>/`.
4. Sửa `og:image` trong `index.html` thành URL tuyệt đối:  
   `https://<ten>.github.io/lich-ke-nghe/og-image.png`

## Thiết lập GoatCounter (đo lường – miễn phí, không cookie)

1. Đăng ký tại [goatcounter.com](https://www.goatcounter.com/).
2. Tạo site, copy **Code** (chuỗi ngắn, ví dụ `tlkn`).
3. Mở `config.js`, điền `goatcounterCode: 'tlkn'`.

## Thiết lập góp ý (Cloudflare Worker)

Xem hướng dẫn chi tiết trong `worker/README-worker.md`.

Sau khi deploy, điền URL vào `config.js`:
```js
feedbackEndpoint: 'https://tlkn-feedback.ten.workers.dev/feedback',
```

Nếu để trống, nút góp ý sẽ chuyển người dùng sang Threads.

## Chạy GitHub Actions lần đầu

Action cron tự chạy lúc 06:17 và 17:17 mỗi ngày (giờ VN).  
Để chạy ngay: **Actions → Cập nhật dữ liệu sự kiện → Run workflow**.

Action cần quyền ghi vào repo: đã thiết lập trong file workflow (`permissions: contents: write`).  
Nếu gặp lỗi permission, vào **Settings → Actions → General → Workflow permissions** → chọn *Read and write permissions*.

## Thêm ảnh sự kiện

BTC chưa công bố ảnh qua API, nên mỗi thẻ đang dùng **hình vẽ theo loại hình** (triển lãm, pavilion, biểu diễn…). Muốn thay bằng ảnh thật cho sự kiện nào:

1. Bỏ ảnh vào thư mục `images/` (nên là .jpg vuông, khoảng 300×300px, dưới 60KB), ví dụ `images/mui-theu.jpg`.
2. Thêm `"image": "images/mui-theu.jpg"` vào mục của sự kiện đó trong `data-src/overrides.json` (sự kiện có trong API) hoặc `data-src/agenda-extra.json` (sự kiện chép tay).
3. Chạy lại script (hoặc chờ Action tự chạy).

Nên để ảnh trong `images/` thay vì dùng link ảnh ở web khác: link ngoài sẽ làm máy chủ đó thấy IP người xem, khi đó cần ghi thêm vào trang Quyền riêng tư. Chỉ dùng ảnh bạn tự chụp hoặc được BTC/tác giả cho phép.

Các hình vẽ và icon web nằm trong `scripts/art-sprite.svg` (đã chép vào đầu `index.html`). Nếu sửa file này, chép lại khối `<svg>` vào `index.html`.

## Cập nhật dữ liệu thủ công

Nếu BTC thay đổi thông tin sự kiện:
- **Giờ / địa điểm sự kiện API**: sửa trong `data-src/overrides.json`
- **Hoạt động chỉ có trong agenda**: sửa trong `data-src/agenda-extra.json`
- **Tọa độ địa điểm**: sửa trong `data-src/venues.json`

Sau đó chạy lại script: `python3 scripts/build_events.py` (hoặc để Action tự chạy).

**Không sửa trực tiếp `data/events.json`** — file sẽ bị ghi đè lần build tiếp.

Sau mỗi lần build, kiểm tra `data/build-report.json`:
- `newApiEvents`: sự kiện API mới chưa có override → cần xem và bổ sung `overrides.json`
- `venuesWithoutCoords`: địa điểm chưa có tọa độ
- `suppressedExtras`: mục chép tay đã được thay bằng dữ liệu API

## Checklist trước khi ra mắt

- [ ] Điền `goatcounterCode` trong `config.js`
- [ ] Deploy Cloudflare Worker, điền `feedbackEndpoint` trong `config.js`
- [ ] Điền `threadsUrl` trong `config.js` (link bài Threads đã đăng)
- [ ] Chạy GitHub Action lần đầu (kiểm tra Action tab có xanh không)
- [ ] Đổi `og:image` trong `index.html` thành link đầy đủ `https://<ten>.github.io/<repo>/og-image.png`, rồi dán link web vào ô soạn bài Threads xem ảnh xem trước có hiện không
- [ ] Điền `contact` trong `config.js` (email hoặc link Threads) để hiện ở trang Quyền riêng tư
- [ ] Rà soát tọa độ còn null trong `data-src/venues.json`
- [ ] Test trên điện thoại: lưu sự kiện, xuất `.ics`, chia sẻ link, thêm ra màn hình chính

## Mẫu bài đăng Threads

```
✦ Thăng Long Kẻ Nghệ Planner ✦
Web cộng đồng giúp lên kế hoạch đi Lễ hội Thiết kế Sáng tạo Hà Nội 2026.

📍 Xem sự kiện trên bản đồ
🗓 Lên lịch tự động theo thời gian rảnh
📲 Thêm vào lịch điện thoại (.ics)

👉 [link GitHub Pages]

Dữ liệu tự cập nhật 2 lần/ngày từ web chính thức. Nếu thấy sai sót, các bạn có thể góp ý ngay trên web hoặc ngay trên thread này để mình khắc phục sớm nhất nhé! 🙏

#ThăngLongKẻNghệ #LeHoiThietKe #HaNoi2026
```

---

Bản đồ © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.  
Dữ liệu sự kiện © [lehoithietkesangtao.vn](https://lehoithietkesangtao.vn/).

## Khi sửa giao diện sau ra mắt
Người đã mở web sẽ tự nhận bản mới ở lần mở kế tiếp (service worker tải ngầm). Nếu đổi lớn, tăng `VERSION` trong `sw.js` (vd `tlkn-v2`) để xóa bộ nhớ cũ.
