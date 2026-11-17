# Kiểm tra web

## A. Chạy bài kiểm tra tự động (khoảng 1 phút)
Mở PowerShell ở thư mục dự án (thư mục có `index.html`). Cài Playwright và Chromium một lần:
```powershell
py -m pip install playwright
py -m playwright install chromium
```
Mở hai terminal PowerShell. Ở terminal thứ nhất, chạy máy chủ và để terminal mở:
```powershell
py -m http.server 8899
```
Ở terminal thứ hai, chạy từng bài:
```powershell
py .\test\test_chuc_nang.py
py .\test\test_man_hinh_rong.py
```
Kết quả: dòng ✓ là đạt, ✗ là lỗi, cuối cùng có "✅ Tất cả đều đạt". Ảnh chụp lưu trong `shots\`.
Bài test dùng mock Google Maps nên không cần API key; bản web công khai lấy key từ secret `GOOGLE_MAPS_API_KEY` trong GitHub Actions.
Kiểm tra web đã đưa lên mạng:
```powershell
$env:BASE = "https://<ten>.github.io/<repo>"
py .\test\test_chuc_nang.py
```
(Trên web thật, hai bài giả lập ngày 21/11 nên số liệu "đang diễn ra" có thể khác ngày thật.)

## B. Tự thử bằng tay trên điện thoại thật
1. Mở web: vào thẳng trang **Gợi ý**, có sẵn lịch cho hôm nay; tuyến mẫu nằm trên cùng, rồi "Hoặc", rồi form Gợi ý đầy đủ.
2. Đổi ngày ở thanh ngày: lịch gợi ý tự đổi theo.
3. Chọn Sáng/Chiều/Tối, đổi giờ, bấm một vài loại hình, đổi nhịp, bấm **Gợi ý lịch trình**: lịch mới không trùng giờ, giữa hai điểm có dòng thời gian đi lại.
4. Bấm **Đổi** ở một điểm: ra điểm khác. Bấm **Lưu**: số trên tab "Lịch của tôi" nảy lên.
5. Bấm một tuyến mẫu: xếp ngay lịch theo tuyến đó.
6. Tab **Sự kiện**: tìm "trien lam" (không dấu), lọc loại, "Đang mở", "Gần tôi" (cho phép vị trí, thấy khoảng cách). Mỗi thẻ có hình minh họa.
7. Tab **Bản đồ**: có ghim, bấm ghim ra thông tin và nút Chỉ đường.
8. Tab **Lịch của tôi**: thêm điểm riêng (thử bỏ trống tên, thử giờ kết thúc sớm hơn giờ bắt đầu → phải báo lỗi); **Xuất .ics** rồi mở bằng Google/Apple Calendar, kiểm tra giờ đúng; **Chia sẻ** gửi link cho người khác mở: thấy banner và lịch (không có điểm riêng).
9. Nút **EN/VI**: đổi toàn bộ chữ, tải lại vẫn nhớ.
10. Tắt mạng, mở lại web: vẫn dùng được. Thêm ra màn hình chính: có icon Tháp Rùa.
11. Cuối trang: gửi thử góp ý có chứa số điện thoại/email, kiểm tra Worker nhận về `[sđt]`, `[email]`. Bấm **Xóa dữ liệu** hai lần: lịch và điểm riêng mất.
12. Trang Quyền riêng tư mở được, đổi ngôn ngữ được, có liên hệ.
13. Trên máy tính (cửa sổ ≥ 1024px): danh sách bên trái, bản đồ bên phải; bấm thẻ thì bản đồ bay tới điểm đó.
