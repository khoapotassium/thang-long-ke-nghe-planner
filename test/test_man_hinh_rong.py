import re, sys, os, pathlib
BASE = os.environ.get('BASE', 'http://localhost:8899')
pathlib.Path('shots').mkdir(exist_ok=True)
from playwright.sync_api import sync_playwright
FAKE = """const OD=Date,NOW=new OD('2026-11-21T08:00:00+07:00').getTime();class MD extends OD{constructor(...a){a.length?super(...a):super(NOW)}static now(){return NOW}};Date=MD;"""
R=[]
def check(c,m): R.append((bool(c),m)); print(("  ✓ " if c else "  ✗ ")+m)
with sync_playwright() as pw:
    b=pw.chromium.launch(args=["--no-sandbox"])
    ctx=b.new_context(viewport={"width":1440,"height":900},locale="vi-VN")
    ctx.add_init_script(FAKE); ctx.route(re.compile(r"^https?://(?!localhost).*"),lambda r:r.abort())
    p=ctx.new_page(); errs=[]
    p.on("pageerror",lambda e:errs.append(str(e)))
    p.goto(BASE + "/",wait_until="load"); p.wait_for_timeout(800)
    check(p.locator("#view-plan").is_visible(),"Máy tính: mở vào trang Gợi ý")
    p.locator(".tabbar [data-view=list]").click(); p.wait_for_selector("#list article.card"); p.wait_for_timeout(600)
    check(p.locator("#view-map").is_visible() and p.locator("#view-list").is_visible(),"Danh sách và bản đồ cùng hiện")
    check(not p.locator(".tabbar [data-view=map]").is_visible(),"Ẩn tab Bản đồ trên máy tính")
    tb=p.locator(".tabbar").bounding_box(); check(tb["y"]<200,f"Thanh tab ở trên (y={tb['y']:.0f})")
    lb=p.locator("#view-list").bounding_box(); mb=p.locator("#map").bounding_box()
    check(mb["x"]>lb["x"]+lb["width"]-1,f"Bản đồ bên phải danh sách ({lb['width']:.0f}px | {mb['width']:.0f}x{mb['height']:.0f}px)")
    n=p.locator(".leaflet-interactive").count(); check(n>5,f"{n} điểm trên bản đồ")
    p.screenshot(path="shots/wide-1.png")
    # bấm vào thẻ → bản đồ bay tới
    card=p.locator("#list article.card:has([data-focus])").nth(2)
    card.locator("h3").click(); p.wait_for_timeout(900)
    check(p.locator(".leaflet-popup").count()==1,"Bấm thẻ → mở popup trên bản đồ")
    check("focus" in (card.get_attribute("class") or ""),"Thẻ được đánh dấu")
    # cuộn xuống: bản đồ vẫn dính trên màn hình
    p.mouse.wheel(0,2500); p.wait_for_timeout(500)
    mb2=p.locator("#map").bounding_box(); check(0<=mb2["y"]<150,f"Cuộn xuống, bản đồ vẫn hiện (y={mb2['y']:.0f})")
    p.locator("#list article.card:has([data-focus])").nth(8).locator("[data-focus]").click(); p.wait_for_timeout(1500)
    check(p.locator(".leaflet-popup").count()==1,"Nút 'Xem trên bản đồ' hoạt động")
    p.screenshot(path="shots/wide-2.png")
    # lưu từ popup
    before=p.locator("#mine-count").inner_text()
    p.locator(".leaflet-popup [data-save]").first.click(); p.wait_for_timeout(400)
    check(p.locator("#mine-count").inner_text()!=before,"Lưu từ popup bản đồ")
    # bản đồ bị khóa trong Hà Nội: thu nhỏ hết cỡ, kéo ra xa, vẫn không ra khỏi Hà Nội
    import math
    for _ in range(12): p.evaluate("document.querySelector('.leaflet-control-zoom-out').click()"); p.wait_for_timeout(300)
    m=p.locator("#map").bounding_box(); cx,cy=m["x"]+m["width"]/2,m["y"]+m["height"]/2
    p.mouse.move(cx,cy); p.mouse.down(); p.mouse.move(cx-500,cy-400,steps=10); p.mouse.up(); p.wait_for_timeout(600)
    check("leaflet-disabled" in (p.locator(".leaflet-control-zoom-out").get_attribute("class") or ""),"Không thu nhỏ quá mức thành phố (minZoom 10)")
    def tile_ll(z,x,y): n=2**z; return (math.degrees(math.atan(math.sinh(math.pi*(1-2*(y+.5)/n)))),(x+.5)/n*360-180)
    srcs=p.eval_on_selector_all(".leaflet-tile","els=>els.map(e=>e.src||e.getAttribute('src')||'')")
    tiles=[tuple(map(int,re.search(r"/(\d+)/(\d+)/(\d+)\.png",s).groups())) for s in srcs if re.search(r"/(\d+)/(\d+)/(\d+)\.png",s)]
    out=[t for t in tiles if t[0]<10 or not (20.2<tile_ll(*t)[0]<21.7 and 105.0<tile_ll(*t)[1]<106.3)]
    check(tiles and not out,f"Chỉ tải nền bản đồ trong vùng Hà Nội ({len(tiles)} ô, {len(out)} ô ngoài vùng)")
    p.screenshot(path="shots/wide-2b-zoom-min.png")
    # các tab khác
    p.locator(".tabbar [data-view=plan]").click(); p.wait_for_timeout(300)
    check(not p.locator("#view-map").is_visible(),"Tab Gợi ý lịch: một cột")
    p.wait_for_timeout(500); p.screenshot(path="shots/wide-3-plan.png")
    p.locator(".tabbar [data-view=mine]").click(); p.wait_for_timeout(300); p.screenshot(path="shots/wide-4-mine.png")
    # thu nhỏ cửa sổ → về giao diện điện thoại
    p.locator(".tabbar [data-view=list]").click(); p.wait_for_timeout(300)
    p.set_viewport_size({"width":600,"height":900}); p.wait_for_timeout(500)
    check(not p.locator("#view-map").is_visible() and p.locator("#view-list").is_visible(),"Cửa sổ hẹp: chỉ còn danh sách")
    check(p.locator(".tabbar [data-view=map]").is_visible(),"Cửa sổ hẹp: có lại tab Bản đồ")
    tb=p.locator(".tabbar").bounding_box(); check(tb["y"]>700,"Cửa sổ hẹp: thanh tab về đáy")
    p.locator(".tabbar [data-view=map]").click(); p.wait_for_timeout(300)
    p.set_viewport_size({"width":1280,"height":800}); p.wait_for_timeout(500)
    check(p.locator("#view-map").is_visible() and p.locator("#view-list").is_visible(),"Đang ở tab Bản đồ rồi phóng to cửa sổ → chia đôi")
    p.screenshot(path="shots/wide-5-1280.png")
    # iPad dọc 768: dùng giao diện điện thoại
    p.set_viewport_size({"width":768,"height":1024}); p.wait_for_timeout(400)
    check(p.evaluate("document.documentElement.scrollWidth<=innerWidth"),"768px không tràn ngang")
    check(not errs,"Không lỗi JS "+" | ".join(errs[:2]))
    b.close()
bad=[m for o,m in R if not o]; print("❌ "+"; ".join(bad) if bad else "✅ Tất cả đạt"); sys.exit(1 if bad else 0)
