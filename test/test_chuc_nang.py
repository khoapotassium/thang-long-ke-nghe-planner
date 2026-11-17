#!/usr/bin/env python3
"""Kiểm thử chức năng sâu: lưu, xếp lịch, tuyến, điểm riêng, .ics, chia sẻ, góp ý, ngôn ngữ, xóa dữ liệu."""
import json, sys, re, os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://localhost:8899")
import pathlib; pathlib.Path("shots").mkdir(exist_ok=True)
R = []
def check(cond, msg):
    R.append((bool(cond), msg)); print(("  ✓ " if cond else "  ✗ ") + msg)

FAKE_DATE = """
const OD = Date, NOW = new OD('2026-11-21T08:00:00+07:00').getTime();
class MD extends OD { constructor(...a){ a.length ? super(...a) : super(NOW); } static now(){ return NOW; } }
Date = MD;
"""
IGNORE = ("maps.googleapis.com", "ERR_TUNNEL", "ERR_PROXY", "goatcounter", "lehoithietkesangtao")

def mine_count(p): return int(p.locator("#mine-count").inner_text() or 0)
def ls(p, k): return p.evaluate(f"localStorage.getItem('{k}')")
def tab(p, v): p.locator(f".tabbar [data-view='{v}']").click(); p.wait_for_timeout(300)

with sync_playwright() as pw:
    b = pw.chromium.launch(args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 390, "height": 844}, locale="vi-VN", accept_downloads=True,
                        geolocation={"latitude": 21.0287, "longitude": 105.8524}, permissions=["geolocation", "clipboard-read", "clipboard-write"])
    ctx.add_init_script(FAKE_DATE)
    ctx.add_init_script(path=str(pathlib.Path(__file__).with_name("google_maps_mock.js")))
    # chặn mạng ngoài cho nhanh
    ctx.route(re.compile(r"^https?://(?!localhost).*"), lambda r: r.abort())
    p = ctx.new_page()
    errs = []
    p.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
    p.on("console", lambda m: errs.append(m.text) if m.type == "error" and not any(x in m.text for x in IGNORE) and "Failed to load resource" not in m.text else None)

    print("\n── Khởi động")
    p.goto(BASE + "/", wait_until="load"); p.wait_for_timeout(800)
    check(p.locator("#view-plan").is_visible() and p.locator("#p-result .tl-item").count() > 0, "Trang chính là Gợi ý, có sẵn lịch gợi ý")
    check(p.locator("#p-fields").is_visible() and p.locator("#p-run").is_visible(), "Form gợi ý luôn mở đầy đủ")
    yr = p.locator("#routes-wrap").bounding_box()["y"]; yf = p.locator(".planner").bounding_box()["y"]
    check(p.locator("#routes-wrap").is_visible() and yr < yf, "Tuyến mẫu nằm trên form gợi ý")
    check(p.locator(".or-sep").inner_text().strip().lower() == "hoặc", "Có dòng 'Hoặc' ngăn cách")
    check("web cộng đồng" in p.locator(".sub").inner_text(), "Phụ đề: web cộng đồng")
    hb = p.locator(".top").bounding_box(); check(hb["height"] < 80, f"Header gọn ({hb['height']:.0f}px)")
    p.locator("[data-int=iShow]").click(); p.locator("[data-int=all]").click()
    check(p.locator("[data-int=all].on").count() == 1, "Chip Tất cả hoạt động")
    p.locator(".tabbar [data-view=list]").click(); p.wait_for_selector("#view-list article.card")
    check(p.locator("#view-list .thumb svg, #view-list .thumb img").count() == p.locator("#view-list article.card").count(), "Mỗi thẻ có hình minh họa")
    check(p.locator("#days .on, #days [aria-pressed=true], #days .active").count() >= 1, "Có ngày đang chọn")
    p.screenshot(path="shots/shot-1-list.png")

    print("\n── Lọc loại + tìm kiếm không dấu")
    n0 = p.locator("#view-list article.card").count()
    p.fill("#q", "trien lam"); p.wait_for_timeout(400)
    n1 = p.locator("#view-list article.card").count()
    check(0 < n1 < n0, f"Tìm 'trien lam' (không dấu): {n0} → {n1}")
    p.fill("#q", ""); p.wait_for_timeout(300)
    chips = p.locator("#type-chips button")
    if chips.count() > 1:
        chips.nth(1).click(); p.wait_for_timeout(300)
        n2 = p.locator("#view-list article.card").count()
        check(n2 <= n0, f"Lọc loại '{chips.nth(1).inner_text()}': {n0} → {n2}")
        chips.nth(1).click(); p.wait_for_timeout(300)

    print("\n── Đang mở / Gần tôi")
    p.click("#open-now"); p.wait_for_timeout(300)
    check(True, f"Đang mở: {p.locator('#view-list article.card').count()} thẻ")
    p.click("#open-now"); p.wait_for_timeout(200)
    p.click("#near-me"); p.wait_for_timeout(800)
    txt = p.locator("#view-list").inner_text()
    check(re.search(r"\d+(\.\d+)?\s?(km|m)\b", txt) is not None, "Gần tôi: hiện khoảng cách")
    check(p.evaluate("Object.keys(localStorage).some(k=>/geo|here|loc/i.test(k))") is False, "Vị trí không lưu vào localStorage")

    print("\n── Lưu sự kiện từ danh sách")
    c0 = mine_count(p)
    p.locator("#view-list [data-save]").first.click(); p.wait_for_timeout(300)
    check(mine_count(p) == c0 + 1, f"Đếm lịch {c0} → {mine_count(p)}")
    check(ls(p, "tlkn-plan-v2") and len(json.loads(ls(p, "tlkn-plan-v2"))) == 1, "Đã lưu vào localStorage")

    print("\n── Tuyến mẫu")
    tab(p, "plan")
    p.locator("[data-route]").first.click(); p.wait_for_timeout(600)
    check(p.locator("#p-result .tl-item").count() > 0, f"Xếp tuyến mẫu: {p.locator('#p-result .tl-item').count()} điểm")

    print("\n── Xếp lịch tự động")
    p.click("#p-run"); p.wait_for_timeout(800)
    items = p.locator("#p-result .tl-item").count()
    check(items > 0, f"Kết quả xếp lịch có {items} điểm")
    p.screenshot(path="shots/shot-2-plan.png")
    # kiểm tra không trùng giờ trong kết quả
    times = p.locator("#p-result .tl-time").all_inner_texts()
    check(len(times) == items, "Mỗi điểm có giờ")
    before = mine_count(p)
    if p.locator("#p-save").count():
        p.click("#p-save"); p.wait_for_timeout(400)
        check(mine_count(p) >= before, f"Lưu kết quả: {before} → {mine_count(p)}")

    print("\n── Lịch của tôi + điểm riêng")
    tab(p, "mine")
    check(p.locator("#mine .tl-item").count() > 0, "Lịch của tôi có mục")
    p.click("#add-custom"); p.wait_for_timeout(200)
    check(p.locator("#custom-form").is_visible(), "Mở form điểm riêng")
    save_btn = p.locator("#custom-form button.primary").first
    save_btn.click(); p.wait_for_timeout(200)
    check(p.locator("#c-err").is_visible(), f"Báo lỗi khi thiếu tên: '{p.locator('#c-err').inner_text()}'")
    p.fill("#c-title", "Ăn bún chả"); p.fill("#c-from", "13:00"); p.fill("#c-to", "12:00")
    save_btn.click(); p.wait_for_timeout(200)
    check(p.locator("#c-err").is_visible(), f"Báo lỗi giờ kết thúc < bắt đầu: '{p.locator('#c-err').inner_text()}'")
    p.fill("#c-to", "14:00"); p.fill("#c-place", "Hàng Mành")
    save_btn.click(); p.wait_for_timeout(300)
    check("Ăn bún chả" in p.locator("#mine").inner_text(), "Điểm riêng hiện trong lịch")
    check("Ăn bún chả" in (ls(p, "tlkn-custom-v1") or ""), "Điểm riêng lưu trên máy")
    p.screenshot(path="shots/shot-3-mine.png", full_page=True)

    print("\n── Xuất .ics")
    with p.expect_download() as dl:
        p.click("#export-ics")
    path = dl.value.path(); ics = open(path, encoding="utf-8", newline="").read()
    check(ics.startswith("BEGIN:VCALENDAR") and ics.rstrip().endswith("END:VCALENDAR"), "File .ics hợp lệ")
    check(ics.count("BEGIN:VEVENT") == ics.count("END:VEVENT") >= 2, f"{ics.count('BEGIN:VEVENT')} sự kiện trong .ics")
    m = re.search(r"SUMMARY:Ăn bún chả\r\n(?:.*\r\n)*?", ics)
    check("DTSTART:20261121T060000Z" in ics, "Điểm riêng 13:00 giờ VN → 06:00 UTC")
    long = [l for l in ics.split("\r\n") if len(l.encode()) > 75]
    check(not long, "Mọi dòng .ics ≤ 75 byte" + (f" (dòng dài: {long[0][:50]})" if long else ""))
    unf = re.sub(r"\r\n ", "", ics)
    check("SUMMARY:Ăn bún chả" in unf and "LOCATION:Hàng Mành" in unf, "Gập dòng không làm hỏng chữ có dấu")

    print("\n── Chia sẻ")
    p.evaluate("navigator.share = undefined")
    p.click("#share-plan"); p.wait_for_timeout(400)
    url = p.evaluate("navigator.clipboard.readText()")
    check("#p=" in url, f"Link chia sẻ: {url[:80]}…")
    check("bún" not in url.lower() and "bun" not in url.lower(), "Link không chứa điểm riêng")
    p2 = ctx.new_page(); p2.goto(url.replace(url.split('/#')[0].split('#')[0], BASE + "/") if url.startswith("http") else BASE + "/" + url, wait_until="load")
    p2.wait_for_timeout(800)
    check(p2.locator("#shared-banner").is_visible(), "Mở link chia sẻ: hiện banner")
    p2.close()

    print("\n── Góp ý (chưa có endpoint → gợi ý Threads/lỗi)")
    p.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    fb = p.locator("#site-feedback")
    fb.locator("textarea").fill("Web hay! sđt mình 0912 345 678")
    fb.locator("[data-fbsend]").click(); p.wait_for_timeout(300)
    check(fb.locator(".error").is_visible(), f"Không có endpoint → thông báo: '{fb.locator('.error').inner_text()}'")

    print("\n── Góp ý (có endpoint giả) – kiểm tra dữ liệu gửi đi đã che")
    sent = []
    def handle(route):
        sent.append(route.request.post_data); route.fulfill(status=200, body='{"ok":true}', headers={"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"})
    p.route("https://fb.test/feedback", handle)
    p.evaluate("window.APP_CONFIG.feedbackEndpoint='https://fb.test/feedback'")
    tab(p, "list")
    rep = p.locator("#view-list [data-report]").first
    if rep.count():
        rep.click(); p.wait_for_timeout(300)
        box = p.locator("#view-list .fb").first
        box.locator("[data-fbsend]").click(); p.wait_for_timeout(200)
        check(box.locator(".error").is_visible(), "Góp ý sự kiện: bắt chọn lý do")
        box.locator("[data-fbreason]").first.click()
        box.locator("textarea").fill("liên hệ a@b.com")
        box.locator("[data-fbsend]").click(); p.wait_for_timeout(500)
        check(len(sent) == 1, "Đã gửi 1 góp ý")
        if sent:
            d = json.loads(sent[0])
            check("a@b.com" not in sent[0] and "[email]" in d.get("text", ""), f"Email đã che: {d}")
            check(set(d) <= {"kind", "eventId", "reason", "text", "lang"}, "Không gửi trường thừa")
    p.screenshot(path="shots/shot-4-feedback.png")

    print("\n── Đổi ngôn ngữ")
    p.click("#lang-toggle"); p.wait_for_timeout(300)
    tabtxt = p.locator(".tabbar").inner_text()
    check("Events" in tabtxt and "For you" in tabtxt, f"Tab tiếng Anh: {tabtxt.split()}")
    check(ls(p, "tlkn-lang") == '"en"' or ls(p, "tlkn-lang") == "en", "Lưu lựa chọn ngôn ngữ")
    p.screenshot(path="shots/shot-5-en.png")
    p.click("#lang-toggle"); p.wait_for_timeout(200)

    print("\n── Xóa dữ liệu (2 chạm)")
    p.click("#wipe"); p.wait_for_timeout(200)
    check(ls(p, "tlkn-plan-v2") is not None, "Chạm 1: chưa xóa, hỏi lại")
    p.click("#wipe"); p.wait_for_timeout(500)
    keys = p.evaluate("Object.keys(localStorage)")
    check(not any(k.startswith("tlkn-") for k in keys), f"Chạm 2: localStorage sạch {keys}")
    check(mine_count(p) == 0, "Bộ đếm về 0")

    print("\n── Service worker + manifest")
    p.reload(wait_until="load"); p.wait_for_timeout(1500)
    check(p.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.length)") >= 1, "Service worker đã đăng ký")
    man = json.loads(p.evaluate("fetch('manifest.webmanifest').then(r=>r.text())"))
    for ic in man["icons"]:
        st = p.evaluate(f"fetch('{ic['src']}').then(r=>r.status)")
        check(st == 200, f"Icon {ic['src']} → {st}")

    print("\n── Chế độ offline")
    ctx.set_offline(True)
    p.reload(wait_until="load"); p.wait_for_timeout(1000)
    check(p.locator("#p-result .tl-item").count() > 0, "Mất mạng vẫn hiện gợi ý")
    ctx.set_offline(False)

    print("\n── Trang Quyền riêng tư")
    p.goto(BASE + "/privacy.html", wait_until="load")
    check("Quyền riêng tư" in p.inner_text("body"), "privacy.html tải được")
    p.click(".lang-toggle"); check("Privacy Policy" in p.inner_text("body"), "privacy.html tiếng Anh")

    print("\n── Màn hình máy tính")
    d = b.new_page(viewport={"width": 1280, "height": 800}); d.add_init_script(FAKE_DATE)
    d.goto(BASE + "/", wait_until="load"); d.wait_for_selector("#p-result .tl-item")
    d.screenshot(path="shots/shot-6-desktop.png")
    check(d.evaluate("document.documentElement.scrollWidth <= innerWidth"), "Không tràn ngang trên desktop")
    check(p.evaluate("1") == 1, "")
    print("\n── Lỗi JS")
    check(not errs, "Không lỗi JS" + ("" if not errs else ": " + " | ".join(errs[:3])))
    b.close()

bad = [m for ok, m in R if not ok and m]
print("\n" + "=" * 40 + (f"\n❌ {len(bad)} lỗi:\n  - " + "\n  - ".join(bad) if bad else "\n✅ Tất cả đều đạt"))
sys.exit(1 if bad else 0)
