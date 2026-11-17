# Hướng dẫn triển khai Cloudflare Worker

## Yêu cầu
- Tài khoản Cloudflare (miễn phí đủ dùng — Free plan: 100 000 req/ngày).
- Không cần bật Workers Logs (tránh lưu IP trong log).

---

## Bước 1: Tạo KV namespace

1. Vào **Cloudflare Dashboard → Workers & Pages → KV**.
2. Nhấn **Create namespace**, đặt tên `FEEDBACK_KV`.
3. Ghi lại **Namespace ID**.

---

## Bước 2: Tạo Worker

1. Vào **Workers & Pages → Create application → Create Worker**.
2. Đặt tên worker, ví dụ `tlkn-feedback`.
3. Nhấn **Deploy** (bỏ qua code mặc định, sẽ thay sau).

---

## Bước 3: Upload code

Cách đơn giản nhất (không cần Wrangler CLI):

1. Vào Worker vừa tạo → **Edit Code**.
2. Xóa toàn bộ code mặc định, dán nội dung file `feedback-worker.js`.
3. Nhấn **Save and Deploy**.

> Nếu muốn dùng Wrangler CLI: `wrangler deploy --name tlkn-feedback`

---

## Bước 4: Bind KV namespace

1. Trong trang Worker → **Settings → Bindings → Add binding**.
2. Chọn **KV Namespace**.
3. **Variable name**: `FEEDBACK_KV` (phải đúng chính xác).
4. **KV Namespace**: chọn `FEEDBACK_KV` vừa tạo.
5. **Save**.

---

## Bước 5: Thêm biến môi trường

1. **Settings → Variables → Add variable** (chọn **Encrypt** cho token).

| Tên biến        | Giá trị                                              |
|-----------------|------------------------------------------------------|
| `ALLOWED_ORIGIN`| `https://ten-github-ban.github.io` (không có / cuối)|
| `ADMIN_TOKEN`   | Chuỗi ngẫu nhiên ≥ 32 ký tự (giữ bí mật)           |

2. **Save and Deploy**.

---

## Bước 6: Cập nhật config.js trong web

Mở `config.js` và điền URL Worker:

```js
feedbackEndpoint: 'https://tlkn-feedback.ten-ban.workers.dev/feedback',
```

---

## Kiểm tra

```bash
# Gửi thử góp ý
curl -X POST https://tlkn-feedback.ten-ban.workers.dev/feedback \
  -H "Content-Type: application/json" \
  -H "Origin: https://ten-github-ban.github.io" \
  -d '{"kind":"site","lang":"vi","text":"Test góp ý"}'
# → {"ok":true}

# Xem góp ý (thay YOUR_ADMIN_TOKEN)
curl https://tlkn-feedback.ten-ban.workers.dev/feedback \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
# → {"count":1,"items":[...]}
```

---

## Lưu ý

- **Không bật Workers Logs** để tránh lưu IP trong hệ thống Cloudflare.
- Dữ liệu tự xóa sau 31/12/2026 (TTL thiết lập khi lưu).
- Worker miễn phí có giới hạn 10ms CPU/request — đủ dùng cho việc ghi KV.
- KV miễn phí cho 1.000 lượt ghi/ngày; mỗi góp ý tốn 2 lượt (1 góp ý + 1 bộ đếm chống spam) → tối đa khoảng 500 góp ý/ngày.
- Số điện thoại và email trong góp ý bị thay bằng `[sđt]`, `[email]` cả ở trình duyệt lẫn ở Worker.
- Xem góp ý nhanh: dán lệnh `curl` ở trên với ADMIN_TOKEN, hoặc vào Dashboard → KV → FEEDBACK_KV để xem từng mục.
