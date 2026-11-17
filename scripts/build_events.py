#!/usr/bin/env python3
"""Gộp dữ liệu sự kiện cho Thăng Long Kẻ Nghệ Planner.

Nguồn:
  1. API công khai của BTC: https://lehoithietkesangtao.vn/api/public/events?limit=1000
  2. data-src/overrides.json   – sửa địa điểm/giờ của sự kiện API theo agenda chính thức
  3. data-src/agenda-extra.json – hoạt động chỉ có trong agenda (chép tay)
  4. data-src/venues.json       – bảng địa điểm + tọa độ

Kết quả:
  data/events.json        – dữ liệu web đọc
  data/build-report.json  – những gì cần người kiểm tra (sự kiện API mới, địa điểm thiếu tọa độ...)

Chạy:  python3 scripts/build_events.py            (lấy API trực tiếp, lỗi thì dùng bản lưu)
       python3 scripts/build_events.py --offline  (chỉ dùng bản lưu)
Chỉ dùng thư viện chuẩn của Python.
"""
import argparse
import json
import re
import sys
import unicodedata
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data-src"
OUT = ROOT / "data"
API_URL = "https://lehoithietkesangtao.vn/api/public/events?limit=1000"
DETAIL_BASE = "https://lehoithietkesangtao.vn/su-kien/"
FEST_START = date(2026, 11, 13)
FEST_END = date(2026, 11, 29)
VN = timezone(timedelta(hours=7))

TYPE_MAP = {
    "exhibition": "trien-lam", "performance": "bieu-dien", "workshop": "workshop",
    "talk": "toa-dam", "event": "su-kien", "community": "trai-nghiem",
    "pavilion": "pavilion", "tour": "tour", "conference": "su-kien",
}


# ---------------------------------------------------------------- helpers
def norm(s):
    s = unicodedata.normalize("NFD", s or "").replace("đ", "d").replace("Đ", "D")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    s = re.sub(r"[“”\"'‘’«»]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def fnv_link_id(slug):
    """Số ở cuối link trang chi tiết BTC: FNV-1a 32-bit của slug, mod 900000 + 100000."""
    h = 0x811C9DC5
    for ch in slug:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h % 900000 + 100000


def detail_url(slug):
    return f"{DETAIL_BASE}{slug}-{fnv_link_id(slug)}.html"


def to_vn(iso):
    """API trả giờ UTC không kèm múi giờ -> đổi sang giờ Việt Nam."""
    if not iso:
        return None
    dt = datetime.fromisoformat(iso[:19]).replace(tzinfo=timezone.utc)
    return dt.astimezone(VN)


def d(s):
    return date.fromisoformat(s)


def js_weekday(dt):  # 0=CN ... 6=T7 (giống JavaScript getDay)
    return (dt.weekday() + 1) % 7


def times_obj(pairs):
    return [{"from": a, "to": b} for a, b in pairs]


def expand_daily(daily, by_day=None, evening=None):
    start, end = d(daily["from"]), d(daily["to"])
    cur, out = max(start, FEST_START), min(end, FEST_END)
    sessions = []
    while cur <= out:
        wd = js_weekday(cur)
        pairs = list((by_day or {}).get(str(wd), daily.get("times", [])))
        if evening and wd in evening.get("days", []):
            pairs += evening.get("times", [])
        sessions.append({"date": cur.isoformat(), "times": times_obj(pairs)})
        cur += timedelta(days=1)
    return sessions, start.isoformat(), end.isoformat()


def explicit_sessions(items):
    out = []
    for s in items:
        row = {"date": s["date"], "times": times_obj(s.get("times", []))}
        for k in ("note", "venue"):
            if s.get(k):
                row[k] = s[k]
        out.append(row)
    out.sort(key=lambda r: (r["date"], r["times"][0]["from"] if r["times"] else ""))
    return out


# ---------------------------------------------------------------- load
def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def fetch_api(timeout=30):
    req = urllib.request.Request(API_URL, headers={
        "User-Agent": "ThangLongKeNghePlanner/1.0 (community schedule; github.io)",
        "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = json.loads(r.read().decode("utf-8"))
    items = list(data.values()) if isinstance(data, dict) else data
    if not items or "slug" not in items[0]:
        raise ValueError("API trả dữ liệu không đúng định dạng")
    return items


def load_snapshot_txt(path):
    """Đọc bản lưu dạng text (chép từ API ngày 17/11/2026)."""
    venues = ["Chợ Đồng Xuân", "Bảo tàng Hà Nội", "Đền và Di tích Phố Cổ", "Sở Văn hoá, Thể thao và Du lịch Hà Nội",
              "Rạp Chuông Vàng", "Rạp Đông Đô", "Địa điểm cộng hưởng", "Nhà hát Tuổi Trẻ", "Rạp Hồng Hà",
              "Làng Triều Khúc", "Rạp hát & Sân khấu Cộng đồng", "Công viên Thống Nhất", "Quảng trường Sáng tạo",
              "Không gian đi bộ Hoàn Kiếm", "Tháp nước Hàng Đậu", "", "Rạp Công Nhân", "Hà Nội",
              "Đoài To The West – Xóm Đoài", "Trung tâm Giao lưu Văn hóa Phố Cổ Hà Nội",
              "Trung tâm Triển lãm Hà Nội", "47 Tràng Tiền, Hà Nội"]

    def iso(x):
        return f"20{x[0:2]}-{x[2:4]}-{x[4:6]}T{x[6:8]}:{x[8:10]}:00" if x else None

    items = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        _i, slug, typ, s, e, v, title = line.split("|", 6)
        items.append({"slug": slug, "eventType": typ, "startAt": iso(s), "endAt": iso(e),
                      "venueName": venues[int(v)] or None, "title": title.strip()})
    return items


# ---------------------------------------------------------------- build
def build(api_items, api_source):
    venues = load_json(SRC / "venues.json")["venues"]
    overrides = load_json(SRC / "overrides.json")["overrides"]
    extra = load_json(SRC / "agenda-extra.json")
    by_api_name = {}
    for key, v in venues.items():
        for n in v.get("apiNames", []):
            by_api_name[n] = key

    report = {"apiSource": api_source, "newApiEvents": [], "suppressedExtras": [],
              "unusedOverrides": [], "venuesWithoutCoords": [], "warnings": []}
    used_venues = set()

    def venue_obj(key):
        v = venues.get(key)
        if not v:
            report["warnings"].append(f"Không có địa điểm '{key}' trong venues.json")
            v = venues["chua-ro"]
            key = "chua-ro"
        used_venues.add(key)
        return {"key": key, "name": v["name"], "address": v.get("address", ""),
                "lat": v.get("lat"), "lng": v.get("lng")}

    events = []
    api_slugs = set()
    for it in api_items:
        slug = it.get("slug")
        if not slug:
            continue
        s, e = to_vn(it.get("startAt")), to_vn(it.get("endAt"))
        if not s:
            continue
        ov = overrides.get(slug, {})
        if ov.get("hide"):
            api_slugs.add(slug)
            continue
        # bỏ sự kiện đã kết thúc trước lễ hội (không có override kéo dài)
        last_day = (e.date() if e and e >= s else s.date())
        if "daily" in ov:
            last_day = max(last_day, d(ov["daily"]["to"]))
        if "sessions" in ov:
            last_day = max([last_day] + [d(x["date"]) for x in ov["sessions"]])
        if last_day < FEST_START and "daily" not in ov:
            continue
        api_slugs.add(slug)

        if "sessions" in ov:
            sessions = explicit_sessions(ov["sessions"])
            start_d, end_d = sessions[0]["date"], sessions[-1]["date"]
        elif "daily" in ov:
            sessions, start_d, end_d = expand_daily(ov["daily"], ov.get("byDay"), ov.get("evening"))
        else:
            if e is None or e < s:
                if e is not None:
                    report["warnings"].append(f"{slug}: giờ kết thúc trước giờ bắt đầu trong API")
                sessions = [{"date": s.date().isoformat(), "times": times_obj([[s.strftime('%H:%M'), ""]])}]
                start_d = end_d = s.date().isoformat()
            elif s.date() == e.date():
                sessions = [{"date": s.date().isoformat(), "times": times_obj([[s.strftime('%H:%M'), e.strftime('%H:%M')]])}]
                start_d = end_d = s.date().isoformat()
            else:
                t = [[s.strftime('%H:%M'), e.strftime('%H:%M')]] if e.time() > s.time() else []
                sessions, start_d, end_d = expand_daily(
                    {"from": s.date().isoformat(), "to": e.date().isoformat(), "times": t})

        vkey = ov.get("venue") or by_api_name.get(it.get("venueName") or "", "chua-ro")
        raw_type = (it.get("eventType") or "").split(",")[0].strip().lower()
        ev = {
            "id": slug, "source": "api",
            "title": ov.get("title") or it.get("title", "").strip(),
            "type": ov.get("type") or TYPE_MAP.get(raw_type, "su-kien"),
            "venue": venue_obj(vkey),
            "startDate": start_d, "endDate": end_d,
            "sessions": [x for x in sessions if x["date"] >= FEST_START.isoformat()],
            "url": detail_url(slug),
        }
        for k in ("note", "conflict", "image"):   # image: ảnh sự kiện (đường dẫn trong thư mục images/ hoặc link https)
            if ov.get(k):
                ev[k] = ov[k]
        if not ov:
            ev["needsReview"] = True
            report["newApiEvents"].append({"slug": slug, "title": ev["title"], "venueName": it.get("venueName"),
                                           "start": s.strftime("%d/%m %H:%M"),
                                           "end": e.strftime("%d/%m %H:%M") if e else None})
        events.append(ev)

    report["unusedOverrides"] = sorted(set(overrides) - api_slugs)

    # ---- hoạt động chép tay từ agenda
    api_titles = [norm(ev["title"]) for ev in events if ev["source"] == "api"]
    api_titles += [norm(it.get("title", "")) for it in api_items]
    for x in extra["events"]:
        hit = next((k for k in x.get("matchKeys", []) if any(k in t for t in api_titles)), None)
        if hit:
            report["suppressedExtras"].append({"id": x["id"], "matchKey": hit})
            continue
        if "sessions" in x:
            sessions = explicit_sessions(x["sessions"])
            start_d, end_d = sessions[0]["date"], sessions[-1]["date"]
        else:
            sessions, start_d, end_d = expand_daily(x["daily"], x.get("byDay"), x.get("evening"))
        ev = {"id": x["id"], "source": "agenda", "title": x["title"], "titleEn": x.get("titleEn"),
              "type": x["type"], "venue": venue_obj(x["venue"]),
              "startDate": start_d, "endDate": end_d, "sessions": sessions, "url": extra["source"]}
        for k in ("note", "image"):
            if x.get(k):
                ev[k] = x[k]
        events.append(ev)

    # địa điểm theo từng buổi (vd. HWA 25/11 ở chợ Đồng Xuân)
    for ev in events:
        for s in ev["sessions"]:
            if isinstance(s.get("venue"), str):
                s["venue"] = venue_obj(s["venue"])

    for key in sorted(used_venues):
        v = venues[key]
        if v.get("lat") is None:
            report["venuesWithoutCoords"].append({"key": key, "name": v["name"]})

    events.sort(key=lambda ev: (ev["startDate"], ev["title"]))
    return events, report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true", help="không gọi API, dùng bản lưu")
    args = ap.parse_args()

    cache = SRC / "api-cache.json"
    snapshot = ROOT / "scripts" / "api_snapshot_2026-11-17.txt"
    items, source = None, None
    if not args.offline:
        try:
            items = fetch_api()
            source = "api-live"
            cache.write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")
        except Exception as ex:  # mạng lỗi, API đổi... -> dùng bản lưu, không làm hỏng web
            print(f"[cảnh báo] Không lấy được API: {ex}", file=sys.stderr)
    if items is None and cache.exists():
        items, source = load_json(cache), "api-cache"
    if items is None:
        items, source = load_snapshot_txt(snapshot), "snapshot-2026-11-17"

    events, report = build(items, source)
    now = datetime.now(VN).isoformat(timespec="minutes")
    OUT.mkdir(exist_ok=True)
    payload = {
        "generatedAt": now,
        "festival": {"name": "Thăng Long Kẻ Nghệ – Lễ hội Thiết kế Sáng tạo Hà Nội 2026",
                     "start": FEST_START.isoformat(), "end": FEST_END.isoformat(),
                     "officialUrl": "https://lehoithietkesangtao.vn/",
                     "agendaUrl": "https://www.threads.com/@lehoithietkesangtaohanoi/post/DfqvuINk2PN"},
        "sources": {"api": source, "agendaVersion": "15/11/2026"},
        "counts": {"total": len(events),
                   "api": sum(e["source"] == "api" for e in events),
                   "agenda": sum(e["source"] == "agenda" for e in events)},
        "events": events,
    }
    (OUT / "events.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(',',':')), encoding="utf-8")
    report["generatedAt"] = now
    (OUT / "build-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"OK: {payload['counts']} | nguồn API: {source} | API mới cần xem: {len(report['newApiEvents'])}"
          f" | mục chép tay bị thay bằng API: {len(report['suppressedExtras'])}")


if __name__ == "__main__":
    main()
