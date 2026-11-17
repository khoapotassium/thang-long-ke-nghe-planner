(function () {
  "use strict";
  const CFG = window.APP_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ------------------------------------------------------------ lưu trên máy (localStorage)
  const K = { plan: "tlkn-plan-v2", custom: "tlkn-custom-v1", lang: "tlkn-lang" };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* chế độ riêng tư */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } }
  };

  // ------------------------------------------------------------ ngôn ngữ
  const I18N = {
    vi: {
      subtitle: "Thăng Long Kẻ Nghệ – Lễ hội Thiết kế Sáng tạo Hà Nội 2026 · web cộng đồng",
      searchPh: "Tìm hoạt động, địa điểm…", nearMe: "📍 Gần tôi nhất", openNow: "Đang mở",
      mapHint: "Bản đồ hiện hoạt động của ngày đang chọn. Tọa độ gần đúng — hãy dùng nút Chỉ đường.",
      tabList: "Sự kiện", tabMap: "Bản đồ", tabPlan: "Gợi ý", tabMine: "Lịch của tôi",
      today: "Hôm nay", pastDay: "Ngày này đã qua.", noEvents: "Không có hoạt động phù hợp với ngày và bộ lọc đang chọn.",
      fixedTitle: "Theo giờ cố định", openTitle: "Mở cửa trong ngày",
      save: "★ Lưu", saved: "✓ Đã lưu", directions: "Chỉ đường", details: "Chi tiết", report: "Báo sai",
      open: "Mở", unknownTime: "Giờ: BTC đang cập nhật", fromAgenda: "Theo agenda BTC", liveNow: "Đang diễn ra", noCoords: "Chưa có vị trí trên bản đồ", onMap: "Xem trên bản đồ", mapPanelHint: "Bấm vào một thẻ để xem vị trí. Tọa độ gần đúng — hãy dùng nút Chỉ đường.",
      km: "{0} km", walkMin: "~{0} phút đi bộ", rideMin: "~{0} phút đi xe",
      pTitle: "Gợi ý", pWhen: "Lúc", pTime: "Giờ", pLike: "Thích", pPace: "Nhịp", allTypes: "Tất cả", pEdit: "Chỉnh", pFor: "Gợi ý cho",
      from: "Từ", to: "đến", pRun: "Gợi ý lịch trình", wMorning: "Sáng", wAfternoon: "Chiều", wEvening: "Tối", wAllDay: "Cả ngày",
      iExhibit: "Triển lãm & sắp đặt", iShow: "Biểu diễn & phim", iWorkshop: "Workshop", iTalk: "Tọa đàm", iExperience: "Trải nghiệm & tour",
      paceRelax: "Thong thả", paceNormal: "Vừa phải", pacePacked: "Đi nhiều",
      errWindow: "Giờ kết thúc phải sau giờ bắt đầu.", errPast: "Khung giờ này đã qua, hãy chọn giờ muộn hơn.", noPlan: "Không tìm được hoạt động phù hợp trong khung giờ này. Thử mở rộng giờ hoặc bỏ bớt lựa chọn sở thích.",
      resultTitle: "Lịch gợi ý · {0}", saveAll: "Lưu cả lịch", swap: "Đổi", remove: "Bỏ", stops: "{0} điểm",
      routesTitle: "Chọn tuyến mẫu", orSep: "Hoặc", addRoute: "Xếp tuyến này cho {0}", rGuom: "Nửa ngày quanh Hồ Gươm", rGuomD: "Pavilion bờ hồ → Lý Thái Tổ → Hàng Dầu → Tràng Tiền",
      rPhoCo: "Phố cổ – Đồng Xuân", rPhoCoD: "Đình phố nghề → Hàng Buồm → Lãn Ông → chợ Đồng Xuân → Tháp nước", rPark: "Công viên Thống Nhất cho gia đình", rParkD: "Pavilion Kén & Mây, triển lãm, trung tâm thiên nhiên",
      exportIcs: "Xuất ra lịch điện thoại", share: "Chia sẻ lịch", addCustom: "+ Thêm điểm riêng",
      mineEmpty: "Chưa có gì trong lịch của bạn. Vào “Gợi ý lịch” để xếp tự động, hoặc bấm “★ Lưu” ở từng hoạt động.",
      openRoute: "Xem cả tuyến trên Google Maps", clash: "⚠ Trùng giờ với “{0}”", custom: "Điểm riêng",
      cTitle: "Tên điểm (vd: ăn trưa, cà phê)", cPlace: "Địa điểm (không bắt buộc)", cDate: "Ngày", cSave: "Thêm vào lịch", cCancel: "Hủy", cErrTitle: "Hãy nhập tên điểm.", cErrTime: "Giờ kết thúc phải sau giờ bắt đầu.",
      sharedBanner: "Bạn được chia sẻ một lịch trình.", addToMine: "Thêm vào lịch của tôi",
      fbAsk: "Thông tin nào chưa đúng?", fbTime: "Sai giờ", fbPlace: "Sai địa điểm", fbCancel: "Đã hủy/đổi", fbOther: "Khác",
      fbNote: "Ghi chú thêm (không cần ghi tên, số điện thoại hay email)", fbSend: "Gửi", fbThanks: "Cảm ơn bạn! Mình sẽ kiểm tra và sửa sớm.", fbErr: "Chưa gửi được. Bạn có thể bình luận trên Threads giúp mình.",
      fbNeedReason: "Hãy chọn một lý do.", fbNeedText: "Hãy ghi vài chữ góp ý.", fbThreads: "Góp ý qua Threads", siteFbTitle: "Góp ý cho web", siteFbPh: "Bạn muốn web có thêm gì, hoặc chỗ nào khó dùng?",
      unofficial: "Web cộng đồng, không phải trang chính thức của Ban tổ chức.", sourcesNote: "Dữ liệu tổng hợp từ trang sự kiện và agenda chính thức của BTC; lịch có thể thay đổi, hãy kiểm tra lại trước khi đi.",
      updated: "Cập nhật dữ liệu:", privacy: "Quyền riêng tư", wipe: "Xóa toàn bộ dữ liệu của tôi trên máy này", wipeSure: "Bấm lần nữa để xóa hẳn (không khôi phục được)",
      wiped: "Đã xóa lịch, điểm riêng và cài đặt trên máy này.", addedN: "Đã thêm {0} mục vào lịch", already: "Các mục này đã có trong lịch",
      savedTo: "Đã lưu vào {0}", removedFrom: "Đã bỏ khỏi {0}", copied: "Đã sao chép link lịch trình", copyFail: "Link đã ở trên thanh địa chỉ, hãy sao chép", emptyPlan: "Lịch đang trống",
      icsDone: "Đã tạo file lịch – mở file để thêm vào lịch điện thoại", geoFail: "Không lấy được vị trí. Bạn vẫn có thể dùng web bình thường.",
      typeLabel: "Loại", here: "Bạn đang ở đây", conflictTag: "Lịch chưa thống nhất", loadFail: "Không tải được dữ liệu. Hãy thử tải lại trang."
    },
    en: {
      subtitle: "Thăng Long Kẻ Nghệ – Hanoi Creative Design Festival 2026 · community site",
      searchPh: "Search activities, places…", nearMe: "📍 Nearest to me", openNow: "Open now",
      mapHint: "The map shows activities on the selected day. Locations are approximate — use Directions.",
      tabList: "Events", tabMap: "Map", tabPlan: "For you", tabMine: "My plan",
      today: "Today", pastDay: "This day has passed.", noEvents: "No activities match this day and filters.",
      fixedTitle: "Scheduled times", openTitle: "Open during the day",
      save: "★ Save", saved: "✓ Saved", directions: "Directions", details: "Details", report: "Report issue",
      open: "Open", unknownTime: "Time: to be announced", fromAgenda: "From official agenda", liveNow: "On now", noCoords: "No map location yet", onMap: "Show on map", mapPanelHint: "Click a card to see where it is. Locations are approximate — use Directions.",
      km: "{0} km", walkMin: "~{0} min walk", rideMin: "~{0} min by car/bike",
      pTitle: "Suggestions", pWhen: "When", pTime: "Hours", pLike: "Into", pPace: "Pace", allTypes: "All", pEdit: "Edit", pFor: "Suggested for",
      from: "From", to: "to", pRun: "Suggest a plan", wMorning: "Morning", wAfternoon: "Afternoon", wEvening: "Evening", wAllDay: "All day",
      iExhibit: "Exhibitions", iShow: "Shows & films", iWorkshop: "Workshops", iTalk: "Talks", iExperience: "Experiences & tours",
      paceRelax: "Relaxed", paceNormal: "Balanced", pacePacked: "See a lot",
      errWindow: "End time must be after start time.", errPast: "This time window has passed — pick a later time.", noPlan: "Nothing fits this window. Try a longer window or fewer interests.",
      resultTitle: "Suggested plan · {0}", saveAll: "Save whole plan", swap: "Swap", remove: "Remove", stops: "{0} stops",
      routesTitle: "Pick a ready-made route", orSep: "Or", addRoute: "Schedule this route for {0}", rGuom: "Half a day around Hoàn Kiếm Lake", rGuomD: "Lakeside pavilions → Lý Thái Tổ → Hàng Dầu → Tràng Tiền",
      rPhoCo: "Old Quarter – Đồng Xuân", rPhoCoD: "Craft communal houses → Hàng Buồm → Lãn Ông → Đồng Xuân Market → Water Tower", rPark: "Thống Nhất Park for families", rParkD: "Cocoon & Cloud pavilions, exhibitions, nature centre",
      exportIcs: "Add to phone calendar", share: "Share plan", addCustom: "+ Add my own stop",
      mineEmpty: "Your plan is empty. Use “Plan for me”, or tap “★ Save” on any activity.",
      openRoute: "Open the whole route in Google Maps", clash: "⚠ Overlaps with “{0}”", custom: "My stop",
      cTitle: "Stop name (e.g. lunch, coffee)", cPlace: "Place (optional)", cDate: "Date", cSave: "Add to plan", cCancel: "Cancel", cErrTitle: "Please enter a name.", cErrTime: "End time must be after start time.",
      sharedBanner: "Someone shared a plan with you.", addToMine: "Add to my plan",
      fbAsk: "What's wrong?", fbTime: "Wrong time", fbPlace: "Wrong place", fbCancel: "Cancelled/changed", fbOther: "Other",
      fbNote: "Extra notes (no names, phone numbers or emails needed)", fbSend: "Send", fbThanks: "Thank you! I'll check and fix it soon.", fbErr: "Couldn't send. Please comment on Threads instead.",
      fbNeedReason: "Please pick a reason.", fbNeedText: "Please write a few words.", fbThreads: "Feedback on Threads", siteFbTitle: "Feedback on this site", siteFbPh: "What would make this site more useful?",
      unofficial: "Community site, not the organisers' official website.", sourcesNote: "Data compiled from the organisers' event pages and official agenda; schedules may change, please double-check before you go.",
      updated: "Data updated:", privacy: "Privacy", wipe: "Delete all my data on this device", wipeSure: "Tap again to delete for good (cannot be undone)",
      wiped: "Your plan, stops and settings were deleted from this device.", addedN: "Added {0} items to your plan", already: "These are already in your plan",
      savedTo: "Saved to {0}", removedFrom: "Removed from {0}", copied: "Plan link copied", copyFail: "The link is in the address bar — copy it from there", emptyPlan: "Your plan is empty",
      icsDone: "Calendar file created – open it to add to your phone calendar", geoFail: "Couldn't get your location. Everything else still works.",
      typeLabel: "Type", here: "You are here", conflictTag: "Date not confirmed", loadFail: "Couldn't load data. Please reload the page."
    }
  };
  const TYPES = {
    "trien-lam": ["Triển lãm", "Exhibition"], "pavilion": ["Pavilion", "Pavilion"], "sap-dat": ["Sắp đặt", "Installation"],
    "bieu-dien": ["Biểu diễn", "Performance"], "phim": ["Chiếu phim", "Film"], "workshop": ["Workshop", "Workshop"],
    "toa-dam": ["Tọa đàm", "Talk"], "su-kien": ["Sự kiện", "Event"], "trai-nghiem": ["Trải nghiệm", "Experience"],
    "tour": ["Tour", "Tour"], "hoi-cho": ["Hội chợ", "Fair"]
  };
  const INTERESTS = {
    iExhibit: ["trien-lam", "pavilion", "sap-dat"], iShow: ["bieu-dien", "phim"], iWorkshop: ["workshop"],
    iTalk: ["toa-dam", "su-kien"], iExperience: ["trai-nghiem", "tour", "hoi-cho"]
  };
  const FLEX_TYPES = new Set(["trien-lam", "pavilion", "sap-dat", "trai-nghiem", "hoi-cho"]);
  const DUR = { "trien-lam": 45, "pavilion": 30, "sap-dat": 20, "trai-nghiem": 60, "hoi-cho": 60 };
  const PACE = { paceRelax: { f: 1.4, buf: 15, max: 4 }, paceNormal: { f: 1, buf: 10, max: 6 }, pacePacked: { f: 0.7, buf: 5, max: 9 } };
  const WINDOWS = { wMorning: [480, 720], wAfternoon: [780, 1080], wEvening: [1080, 1320], wAllDay: [480, 1320] };
  const ROUTES = [
    { id: "guom", name: "rGuom", desc: "rGuomD", items: ["pavilion-ho-guong-unesco-sovico-vi-su-phat-trien-ben-vung", "pavilion-kien-truc-va-nghe-thuat-art-hanoi-2026", "trien-lam-mach-song-vo-hinh", "ag-tinh-hoa-hoi-tu", "ag-luu-dau-thu-moc", "ag-son-mai-viet-nhat", "trien-lam-noi-mien-sang-tao", "giup-nhau-lam-nghe-craft-toolkit-ha-noi-2026", "chuoi-hoat-dong-mui-theu-ke-nghe"] },
    { id: "phoco", name: "rPhoCo", desc: "rPhoCoD", items: ["trien-lam-chuyen-dinh-kim-ngan", "trien-lam-chuyen-dinh-xuan-phien-thi", "trien-lam-chuyen-dinh-ha-vi", "trung-bay-lang-nghe-son-dong-van-hoa-tra-viet-va-viet-phuc", "trien-lam-theo-buoc-di-san-cong-dong-2026", "trien-lam-ven-lop-hoa-diep", "trien-lam-nghe-thuat-cham-dong-xuan", "ag-dong-dong-xuan", "sap-dat-am-thanh-thap-an-ca-the-tower-of-hidden-songs"] },
    { id: "park", name: "rPark", desc: "rParkD", items: ["pavilion-ken", "pavilion-may", "trien-lam-cong-doai-lang-duong-lam", "ag-y-tuong-sang-tao", "trung-tam-thien-nhien-luu-dong", "trien-lam-chat-xua-chuyen-moi", "ag-mot-chu-15-phut"] }
  ];

  let lang = store.get(K.lang, (navigator.language || "vi").toLowerCase().startsWith("vi") ? "vi" : "en");
  const t = (k, ...a) => { let s = (I18N[lang] && I18N[lang][k]) || I18N.vi[k] || k; a.forEach((v, i) => { s = s.replace("{" + i + "}", v); }); return s; };
  const typeName = (ty) => (TYPES[ty] || [ty, ty])[lang === "en" ? 1 : 0];
  const titleOf = (ev) => (lang === "en" && ev.titleEn) ? ev.titleEn : ev.title;

  // ------------------------------------------------------------ đo lường ẩn danh (GoatCounter)
  function loadAnalytics() {
    if (!CFG.goatcounterCode) return;
    const s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + CFG.goatcounterCode + ".goatcounter.com/count");
    document.head.appendChild(s);
  }
  function track(name) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); } catch (e) { /* bỏ qua */ }
  }

  // ------------------------------------------------------------ thời gian
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const today = () => ymd(new Date());
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const toMin = (s) => { if (!s) return null; const [h, m] = s.split(":").map(Number); return h * 60 + (m || 0); };
  const hm = (m) => pad(Math.floor(m / 60)) + ":" + pad(m % 60);
  const parseDay = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return ymd(d); };
  const WD = { vi: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"], en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
  const shortDay = (s) => { const d = parseDay(s); return d.getDate() + "/" + (d.getMonth() + 1); };
  const longDay = (s) => WD[lang][parseDay(s).getDay()] + ", " + shortDay(s);

  // ------------------------------------------------------------ trạng thái
  const state = { data: null, byId: {}, day: "", types: new Set(), q: "", openNow: false, here: null, view: "plan",
    plan: [], custom: [], win: "wAllDay", from: 480, to: 1320, interests: new Set(), pace: "paceNormal", result: null, exclude: new Set(), shared: null, fbOpen: null };

  // Mỗi mục trong lịch: {id, date, from, to, at?, end?}  (from/to = khung giờ của buổi; at/end = giờ dự định)
  const keyOf = (p) => p.id + "@" + p.date + "@" + (p.from || "");
  const loadMine = () => { state.plan = store.get(K.plan, []); state.custom = store.get(K.custom, []); };
  const saveMine = () => {
    store.set(K.plan, state.plan); store.set(K.custom, state.custom);
    const el = $("#mine-count"), n = state.plan.length + state.custom.length, up = n > +el.textContent;
    el.textContent = n; el.classList.toggle("zero", !n);
    if (up) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  };

  // ------------------------------------------------------------ dữ liệu
  function slotsOn(ev, date) {
    const out = [];
    ev.sessions.filter((s) => s.date === date).forEach((s) => {
      const venue = s.venue || ev.venue;
      if (!s.times.length) out.push({ from: null, to: null, note: s.note, venue });
      s.times.forEach((x) => out.push({ from: x.from || null, to: x.to || null, note: s.note, venue }));
    });
    return out;
  }
  const isFlexSlot = (ev, sl) => !sl.from || (FLEX_TYPES.has(ev.type) && sl.to && toMin(sl.to) - toMin(sl.from) >= 150);
  const hasGeo = (v) => v && typeof v.lat === "number" && typeof v.lng === "number";
  function km(a, b) {
    const R = 6371, r = (x) => x * Math.PI / 180;
    const dLa = r(b.lat - a.lat), dLo = r(b.lng - a.lng);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h)) * 1.3;   // ×1.3: đường thực tế dài hơn đường chim bay
  }
  function travel(a, b) {
    if (!hasGeo(a) || !hasGeo(b)) return { min: 15, km: null, ride: false };
    const d = km(a, b);
    if (d < 0.05) return { min: 0, km: 0, ride: false };
    if (d <= 2.5) return { min: Math.max(2, Math.round(d / 4.5 * 60)), km: d, ride: false };
    return { min: Math.round(10 + d * 3), km: d, ride: true };
  }
  const travelText = (tr) => (tr.ride ? t("rideMin", tr.min) : t("walkMin", tr.min)) + (tr.km ? " · " + t("km", tr.km.toFixed(1)) : "");
  const dirUrl = (v) => hasGeo(v)
    ? "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + v.lat + "," + v.lng
    : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((v.name || "") + " " + (v.address || "") + " Hà Nội");

  function matches(ev) {
    if (state.types.size && !state.types.has(ev.type)) return false;
    if (state.q) {
      const strip = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
      const hay = strip([ev.title, ev.titleEn, ev.venue.name, ev.venue.address].join(" "));
      if (!hay.includes(strip(state.q))) return false;
    }
    return true;
  }
  const isLive = (sl, date) => date === today() && sl.from && sl.to && nowMin() >= toMin(sl.from) && nowMin() < toMin(sl.to);

  // ------------------------------------------------------------ giao diện chung
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { el.hidden = true; }, 2600);
  }
  function applyI18n() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $("#lang-toggle").textContent = lang === "vi" ? "EN" : "VI";
  }
  function renderDays() {
    const f = state.data.festival, td = today(), out = [];
    for (let d = f.start; d <= f.end; d = addDays(d, 1)) {
      const cls = ["day", d < td ? "past" : "", d === td ? "today" : "", d === state.day ? "active" : ""].join(" ");
      out.push('<button class="' + cls + '" data-day="' + d + '"><small>' + (d === td ? t("today") : WD[lang][parseDay(d).getDay()]) + "</small><b>" + parseDay(d).getDate() + "</b></button>");
    }
    $("#days").innerHTML = out.join("");
    const a = $("#days .active"); if (a) a.scrollIntoView({ inline: "center", block: "nearest" });
  }
  function renderTypeChips() {
    const present = new Set(state.data.events.map((e) => e.type));
    $("#type-chips").innerHTML = Object.keys(TYPES).filter((k) => present.has(k)).map((k) =>
      '<button class="chip' + (state.types.has(k) ? " on" : "") + '" data-type="' + k + '" aria-pressed="' + state.types.has(k) + '">' + esc(typeName(k)) + "</button>").join("");
    $("#near-me").classList.toggle("on", !!state.here);
    $("#open-now").classList.toggle("on", state.openNow);
    $("#open-now").hidden = state.day !== today();
  }

  // ------------------------------------------------------------ thẻ hoạt động
  const isSaved = (id, date, from) => state.plan.some((p) => p.id === id && p.date === date && (p.from || "") === (from || ""));
  function slotText(sl) {
    if (!sl.from) return t("unknownTime");
    return sl.to ? sl.from + "–" + sl.to : sl.from;
  }
  function feedbackHtml(id) {
    return '<div class="fb" data-fb="' + esc(id) + '"><b>' + t("fbAsk") + '</b><div class="chips">' +
      ["fbTime", "fbPlace", "fbCancel", "fbOther"].map((r) => '<button class="chip" data-fbreason="' + r + '">' + t(r) + "</button>").join("") +
      '</div><textarea maxlength="300" placeholder="' + esc(t("fbNote")) + '"></textarea><input type="text" name="website" tabindex="-1" autocomplete="off" hidden>' +
      '<div class="row"><button class="btn small primary" data-fbsend="' + esc(id) + '">' + t("fbSend") + '</button><span class="error" hidden></span></div></div>';
  }
  const ART = new Set(Object.keys(TYPES));
  function thumbHtml(ev) {   // ảnh sự kiện nếu có (trường "image"), nếu không dùng hình vẽ theo loại hình
    const ty = ART.has(ev.type) ? ev.type : "su-kien";
    if (ev.image) return '<div class="thumb ty-' + ty + '"><img src="' + esc(ev.image) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>';
    return '<div class="thumb ty-' + ty + '"><svg aria-hidden="true"><use href="#art-' + ty + '"/></svg></div>';
  }
  function cardHtml(ev, date, slots) {
    const v = slots[0].venue;
    const times = slots.map((sl) => '<span class="time">' + esc(slotText(sl)) + "</span>" + (sl.note ? " · " + esc(sl.note) : "")).join("<br>");
    const live = slots.some((sl) => isLive(sl, date));
    const dist = state.here && hasGeo(v) ? " · " + t("km", km(state.here, v).toFixed(1)) : "";
    const tags = ['<span class="tag">' + esc(typeName(ev.type)) + "</span>",
      live ? '<span class="tag live">' + t("liveNow") + "</span>" : "",
      ev.source === "agenda" ? '<span class="tag">' + t("fromAgenda") + "</span>" : "",
      ev.conflict ? '<span class="tag warn">' + t("conflictTag") + "</span>" : "",
      !hasGeo(v) ? '<span class="tag warn">' + t("noCoords") + "</span>" : ""].join("");
    const saveBtns = slots.map((sl) => {
      const on = isSaved(ev.id, date, sl.from);
      const label = (on ? t("saved") : t("save")) + (slots.length > 1 && sl.from ? " " + sl.from : "");
      return '<button class="btn small ' + (on ? "saved" : "primary") + '" data-save="' + esc(ev.id) + '" data-date="' + date + '" data-from="' + esc(sl.from || "") + '" data-to="' + esc(sl.to || "") + '">' + label + "</button>";
    }).join("");
    return '<article class="card" id="c-' + esc(ev.id) + '">' + thumbHtml(ev) + "<h3>" + esc(titleOf(ev)) + "</h3>" +
      '<p class="meta">' + times + "</p>" +
      '<p class="meta">📍 ' + esc(v.name) + (v.address && v.address !== v.name ? " — " + esc(v.address) : "") + dist + "</p>" +
      '<div class="tags">' + tags + "</div>" +
      (ev.conflict ? '<p class="note">⚠ ' + esc(ev.conflict) + "</p>" : ev.note ? '<p class="note">' + esc(ev.note) + "</p>" : "") +
      '<div class="actions">' + saveBtns +
      '<a class="btn small" target="_blank" rel="noopener" href="' + dirUrl(v) + '" data-track="directions">' + t("directions") + "</a>" +
      (hasGeo(v) ? '<button class="btn small ghost wide-only" data-focus="' + esc(ev.id) + '">⌖ ' + t("onMap") + "</button>" : "") +
      '<a class="btn small ghost" target="_blank" rel="noopener" href="' + esc(ev.url) + '">' + t("details") + "</a>" +
      '<button class="btn small ghost" data-report="' + esc(ev.id) + '">' + t("report") + "</button></div>" +
      (state.fbOpen === ev.id ? feedbackHtml(ev.id) : "") + "</article>";
  }

  function renderList() {
    const date = state.day, rows = [];
    state.data.events.forEach((ev) => {
      if (!matches(ev)) return;
      let slots = slotsOn(ev, date);
      if (!slots.length) return;
      if (state.openNow && date === today()) {
        slots = slots.filter((sl) => isLive(sl, date) || (sl.from && toMin(sl.from) >= nowMin() && toMin(sl.from) - nowMin() <= 120));
        if (!slots.length) return;
      }
      rows.push({ ev, slots, flex: slots.every((sl) => isFlexSlot(ev, sl)), start: Math.min(...slots.map((sl) => toMin(sl.from) ?? 9999)),
        dist: state.here && hasGeo(slots[0].venue) ? km(state.here, slots[0].venue) : 999 });
    });
    const sorter = state.here ? (a, b) => a.dist - b.dist : (a, b) => a.start - b.start || a.ev.title.localeCompare(b.ev.title, "vi");
    const fixed = rows.filter((r) => !r.flex).sort(sorter), flex = rows.filter((r) => r.flex).sort(sorter);
    let html = date < today() ? '<p class="hint">' + t("pastDay") + "</p>" : "";
    if (!rows.length) html += '<p class="empty">' + t("noEvents") + "</p>";
    if (fixed.length) html += '<h2 class="section-title">' + t("fixedTitle") + " · " + fixed.length + "</h2>" + fixed.map((r) => cardHtml(r.ev, date, r.slots)).join("");
    if (flex.length) html += '<h2 class="section-title">' + t("openTitle") + " · " + flex.length + "</h2>" + flex.map((r) => cardHtml(r.ev, date, r.slots)).join("");
    $("#list").innerHTML = html;
  }

  // ------------------------------------------------------------ bản đồ
  let map = null, layer = null, markerOf = {};
  const wideMQ = window.matchMedia("(min-width: 1024px)");
  const isWide = () => wideMQ.matches;
  function renderMap() {
    if (!window.L) { $("#map").innerHTML = '<p class="empty">Map unavailable</p>'; return; }
    if (!map) {
      map = L.map("map").setView([21.031, 105.851], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
      layer = L.layerGroup().addTo(map);
    }
    setTimeout(() => map.invalidateSize(), 50);
    layer.clearLayers(); markerOf = {};
    const groups = {}, date = state.day;
    state.data.events.forEach((ev) => {
      if (!matches(ev)) return;
      slotsOn(ev, date).forEach((sl) => {
        if (!hasGeo(sl.venue)) return;
        const k = sl.venue.lat.toFixed(4) + "," + sl.venue.lng.toFixed(4);
        (groups[k] = groups[k] || { v: sl.venue, items: [] }).items.push({ ev, sl });
      });
    });
    const pts = [];
    Object.values(groups).forEach((g) => {
      const anySaved = g.items.some((x) => isSaved(x.ev.id, date, x.sl.from));
      const m = L.circleMarker([g.v.lat, g.v.lng], { radius: anySaved ? 11 : 8, color: "#fff", weight: 2, fillOpacity: .95, fillColor: anySaved ? "#c8962e" : "#8f2a1c" });
      const li = g.items.slice(0, 12).map((x) => {
        const on = isSaved(x.ev.id, date, x.sl.from);
        return "<li><b>" + esc(titleOf(x.ev)) + "</b><br>" + esc(slotText(x.sl)) + ' <button class="btn small ' + (on ? "saved" : "primary") + '" data-save="' + esc(x.ev.id) +
          '" data-date="' + date + '" data-from="' + esc(x.sl.from || "") + '" data-to="' + esc(x.sl.to || "") + '">' + (on ? t("saved") : t("save")) + "</button></li>";
      }).join("");
      m.bindPopup('<div class="pop"><h4>📍 ' + esc(g.v.name) + "</h4><ul>" + li + '</ul><a target="_blank" rel="noopener" href="' + dirUrl(g.v) + '">' + t("directions") + " →</a></div>", { maxWidth: 300, maxHeight: 260, autoPanPadding: [20, 20] });
      m.addTo(layer); pts.push([g.v.lat, g.v.lng]);
      g.items.forEach((x) => { markerOf[x.ev.id] = m; });
    });
    if (state.here) { L.circleMarker([state.here.lat, state.here.lng], { radius: 7, color: "#fff", weight: 2, fillColor: "#1f5f8b", fillOpacity: 1 }).bindPopup(t("here")).addTo(layer); }
    if (state.keepMapView) { state.keepMapView = false; return; }
    if (pts.length > 1) map.fitBounds(pts.filter((p) => p[0] > 20.99 && p[1] > 105.82), { padding: [30, 30], maxZoom: 16 });
  }

  function focusOnMap(id) {
    const m = markerOf[id]; if (!map || !m) return false;
    $$("#list .card.focus").forEach((c) => c.classList.remove("focus"));
    const c = document.getElementById("c-" + id); if (c) c.classList.add("focus");
    map.closePopup();
    const ll = m.getLatLng(), z = Math.max(map.getZoom(), 16);
    if (map.getCenter().distanceTo(ll) < 5 && map.getZoom() === z) { m.openPopup(); }
    else {   // mở popup sau khi bay xong để popup tự canh vừa khung (có hẹn giờ dự phòng nếu trình duyệt bỏ lỡ sự kiện moveend)
      let done = false; const open = () => { if (!done) { done = true; m.openPopup(); } };
      map.once("moveend", open); setTimeout(open, 700); map.flyTo(ll, z, { duration: .5 });
    }
    track("map-focus"); return true;
  }

  // ------------------------------------------------------------ tự xếp lịch
  // Bước 1: chọn các suất có giờ cố định (biểu diễn, workshop, tọa đàm…) không chồng nhau, ưu tiên điểm cao.
  // Bước 2: lấp khoảng trống giữa các suất bằng điểm mở cửa trong ngày, ưu tiên điểm gần, có tính thời gian đi lại.
  function candidates(date, opts) {
    const allow = new Set(); state.interests.forEach((k) => INTERESTS[k].forEach((ty) => allow.add(ty)));
    const out = [];
    state.data.events.forEach((ev) => {
      if (opts.only && !opts.only.includes(ev.id)) return;
      if (!opts.only && allow.size && !allow.has(ev.type)) return;
      if (opts.exclude.has(ev.id)) return;
      slotsOn(ev, date).forEach((sl) => {
        if (!sl.from) return;                            // không rõ giờ: không tự xếp
        const flex = isFlexSlot(ev, sl);
        const fixedDur = sl.to ? toMin(sl.to) - toMin(sl.from) : 90;
        let score = 50;
        const nDays = new Set(ev.sessions.map((s) => s.date)).size;
        if (nDays === 1) score += 25; else if (nDays <= 3) score += 12;
        if (!hasGeo(sl.venue)) score -= 8;
        if (opts.only) score += 30 - opts.only.indexOf(ev.id) * 2;
        out.push({ ev, sl, flex, score, open: toMin(sl.from), close: sl.to ? toMin(sl.to) : toMin(sl.from) + fixedDur, fixedDur, v: sl.venue });
      });
    });
    return out;
  }
  function makePlan(date, from, to, opts) {
    const pace = PACE[state.pace], cands = candidates(date, opts);
    const chosen = [];
    // Bước 1
    const fixed = cands.filter((c) => !c.flex && c.open >= from && c.open + Math.min(c.fixedDur, 180) <= to).sort((a, b) => b.score - a.score);
    const maxFixed = Math.max(1, Math.round(pace.max / 2));
    for (const c of fixed) {
      if (chosen.length >= maxFixed) break;
      if (chosen.some((x) => x.ev.id === c.ev.id)) continue;
      const s = c.open, e = c.open + Math.min(c.fixedDur, 180);
      const ok = chosen.every((x) => e + travel(c.v, x.v).min + pace.buf <= x.at || x.end + travel(x.v, c.v).min + pace.buf <= s);
      if (ok) chosen.push({ ...c, at: s, end: e });
    }
    chosen.sort((a, b) => a.at - b.at);
    // Bước 2
    const result = [];
    let cur = from, pos = (date === today() && state.here) ? state.here : null;
    const fixedQueue = chosen.slice();
    const used = new Set(chosen.map((c) => c.ev.id));
    const flexC = cands.filter((c) => c.flex);
    while (result.length + fixedQueue.length < pace.max) {
      const next = fixedQueue[0];
      const limit = next ? next.at : to;
      let best = null;
      for (const c of flexC) {
        if (used.has(c.ev.id)) continue;
        const tr = pos ? travel(pos, c.v) : { min: 0 };
        const dur = Math.max(15, Math.min(Math.round((DUR[c.ev.type] || 45) * pace.f), c.close - c.open));
        const start = Math.max(cur + tr.min, c.open);
        const end = start + dur;
        if (end > c.close || end > to) continue;
        const toNext = next ? travel(c.v, next.v).min + pace.buf : 0;
        if (end + toNext > limit) continue;
        const sc = c.score - tr.min * 1.2 - (start - cur - tr.min) * 0.2;
        if (!best || sc > best.sc) best = { c, start, end, sc, tr };
      }
      if (best) {
        used.add(best.c.ev.id);
        result.push({ ...best.c, at: best.start, end: best.end });
        cur = best.end + pace.buf; pos = best.c.v;
        continue;
      }
      if (!next) break;
      result.push(fixedQueue.shift());
      cur = next.end + pace.buf; pos = next.v;
    }
    while (fixedQueue.length) result.push(fixedQueue.shift());
    result.sort((a, b) => a.at - b.at);
    return result;
  }

  function renderPlannerForm() {
    $("#p-day").textContent = longDay(state.day);
    $("#p-windows").innerHTML = Object.keys(WINDOWS).map((k) => '<button class="seg-b' + (state.win === k ? " on" : "") + '" data-win="' + k + '">' + t(k) + "</button>").join("");
    const opts = (sel) => { let h = ""; for (let m = 360; m <= 1410; m += 30) h += '<option value="' + m + '"' + (m === sel ? " selected" : "") + ">" + hm(m) + "</option>"; return h; };
    $("#p-from").innerHTML = opts(state.from); $("#p-to").innerHTML = opts(state.to);
    $("#p-interests").innerHTML = '<button class="chip' + (state.interests.size ? "" : " on") + '" data-int="all">' + t("allTypes") + "</button>" +
      Object.keys(INTERESTS).map((k) => '<button class="chip' + (state.interests.has(k) ? " on" : "") + '" data-int="' + k + '">' + t(k) + "</button>").join("");
    $("#p-pace").innerHTML = Object.keys(PACE).map((k) => '<button class="seg-b' + (state.pace === k ? " on" : "") + '" data-pace="' + k + '">' + t(k) + "</button>").join("");
    const routesHtml = ROUTES.map((r) => {
      const n = r.items.filter((id) => state.byId[id] && slotsOn(state.byId[id], state.day).length).length;
      if (n < 2) return "";
      return '<div class="route"><h3>' + t(r.name) + "</h3><p>" + t(r.desc) + '</p><button class="btn small primary" data-route="' + r.id + '">' + t("addRoute", shortDay(state.day)) + "</button></div>";
    }).join("");
    $("#routes").innerHTML = routesHtml; $("#routes-wrap").hidden = !routesHtml;
  }
  function runPlanner(only, silent) {
    const err = $("#p-error"); err.hidden = true;
    let from = state.from, to = state.to;
    if (to <= from) { if (!silent) { err.textContent = t("errWindow"); err.hidden = false; } return; }
    if (state.day === today()) {
      const n = Math.ceil(nowMin() / 15) * 15;
      if (to <= n + 30) { if (!silent) { err.textContent = t("errPast"); err.hidden = false; } else { state.result = null; renderPlannerForm(); renderResult(); } return; }
      from = Math.max(from, n);
    }
    if (!only) state.exclude = state.exclude || new Set();
    state.result = { date: state.day, from, to, only: only || null, items: makePlan(state.day, from, to, { only: only || null, exclude: state.exclude }) };
    renderPlannerForm(); renderResult();
    if (!silent) { track(only ? "plan-route" : "plan-auto"); $("#p-result").scrollIntoView({ behavior: "smooth", block: "start" }); }
  }
  function timelineHtml(items, opts) {
    let html = '<div class="timeline">';
    items.forEach((it, i) => {
      if (i > 0) {
        const tr = travel(items[i - 1].v, it.v);
        if (tr.min > 0) html += '<div class="walk">↓ ' + esc(travelText(tr)) + "</div>";
      }
      const extra = opts.result
        ? '<button class="btn small ghost" data-swap="' + esc(it.ev.id) + '">' + t("swap") + "</button>"
        : "";
      html += '<div class="tl-item"><div class="tl-time">' + hm(it.at) + "<small>" + hm(it.end) + "</small></div>" +
        cardHtml(it.ev, opts.date, [it.sl]).replace('<div class="actions">', '<div class="actions">' + extra) + "</div>";
    });
    return html + "</div>";
  }
  function renderResult() {
    const r = state.result, box = $("#p-result");
    if (!r) { box.innerHTML = ""; return; }
    if (!r.items.length) { box.innerHTML = '<p class="empty">' + t("noPlan") + "</p>"; return; }
    box.innerHTML = '<div class="result-head"><h2>' + t("resultTitle", longDay(r.date)) + " · " + t("stops", r.items.length) +
      '</h2><button class="btn primary" id="p-save">' + t("saveAll") + "</button></div>" + timelineHtml(r.items, { date: r.date, result: true });
  }
  function saveResult() {
    const r = state.result; if (!r) return;
    let n = 0;
    r.items.forEach((it) => {
      const p = { id: it.ev.id, date: r.date, from: it.sl.from || "", to: it.sl.to || "", at: hm(it.at), end: hm(it.end) };
      const i = state.plan.findIndex((x) => keyOf(x) === keyOf(p));
      if (i >= 0) state.plan[i] = p; else { state.plan.push(p); n++; }
    });
    saveMine(); toast(n ? t("addedN", n) : t("already")); track("plan-save");
    setView("mine");
  }

  // ------------------------------------------------------------ lịch của tôi
  function mineItems() {
    const items = [];
    state.plan.forEach((p) => {
      const ev = state.byId[p.id]; if (!ev) return;
      const sl = slotsOn(ev, p.date).find((s) => (s.from || "") === (p.from || "")) || { from: p.from || null, to: p.to || null, venue: ev.venue };
      const at = toMin(p.at) ?? toMin(sl.from) ?? 9999;
      const end = toMin(p.end) ?? toMin(sl.to) ?? (at === 9999 ? 9999 : at + 60);
      items.push({ kind: "ev", p, ev, sl, v: sl.venue, date: p.date, at, end, flexNoTime: !p.at && isFlexSlot(ev, sl) });
    });
    state.custom.forEach((c) => items.push({ kind: "custom", c, date: c.date, at: toMin(c.from), end: toMin(c.to), v: null }));
    return items;
  }
  function renderMine() {
    const items = mineItems();
    if (!items.length) { $("#mine").innerHTML = '<p class="empty">' + t("mineEmpty") + "</p>"; return; }
    const days = [...new Set(items.map((x) => x.date))].sort();
    $("#mine").innerHTML = days.map((date) => {
      const list = items.filter((x) => x.date === date).sort((a, b) => a.at - b.at);
      let html = "";
      list.forEach((it, i) => {
        if (i > 0 && it.v && list[i - 1].v) {
          const tr = travel(list[i - 1].v, it.v);
          if (tr.min > 0) html += '<div class="walk">↓ ' + esc(travelText(tr)) + "</div>";
        }
        const clash = !it.flexNoTime && it.at !== 9999 && list.find((o) => o !== it && !o.flexNoTime && o.at !== 9999 && it.at < o.end && o.at < it.end);
        const clashHtml = clash ? '<p class="conflict">' + t("clash", esc(clash.kind === "ev" ? titleOf(clash.ev) : clash.c.title)) + "</p>" : "";
        const timeCol = it.at === 9999 ? "—" : (it.flexNoTime ? t("open") + "<small>" + esc(slotText(it.sl)) + "</small>" : hm(it.at) + "<small>" + hm(it.end) + "</small>");
        if (it.kind === "custom") {
          html += '<div class="tl-item"><div class="tl-time">' + timeCol + '</div><article class="card"><h3>' + esc(it.c.title) + '</h3><p class="meta">' + esc(t("custom")) + (it.c.place ? " · 📍 " + esc(it.c.place) : "") + "</p>" + clashHtml +
            '<div class="actions"><button class="btn small ghost" data-delcustom="' + esc(it.c.id) + '">' + t("remove") + "</button></div></article></div>";
        } else {
          const card = cardHtml(it.ev, date, [it.sl]).replace("</article>", clashHtml + "</article>");
          html += '<div class="tl-item"><div class="tl-time">' + timeCol + "</div>" + card + "</div>";
        }
      });
      const pts = list.filter((x) => hasGeo(x.v));
      let route = "";
      if (pts.length >= 2) {
        const o = pts[0].v, d = pts[pts.length - 1].v, w = pts.slice(1, -1).map((x) => x.v.lat + "," + x.v.lng).join("|");
        route = '<a class="btn small" target="_blank" rel="noopener" data-track="route-map" href="https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=' + o.lat + "," + o.lng +
          "&destination=" + d.lat + "," + d.lng + (w ? "&waypoints=" + encodeURIComponent(w) : "") + '">' + t("openRoute") + "</a>";
      }
      return '<section class="plan-day"><h2>' + longDay(date) + " · " + t("stops", list.length) + " " + route + '</h2><div class="timeline">' + html + "</div></section>";
    }).join("");
  }
  function customForm(open) {
    const box = $("#custom-form");
    if (!open) { box.hidden = true; box.innerHTML = ""; return; }
    const f = state.data.festival; let opts = "";
    for (let d = f.start; d <= f.end; d = addDays(d, 1)) if (d >= today()) opts += '<option value="' + d + '"' + (d === state.day ? " selected" : "") + ">" + longDay(d) + "</option>";
    box.innerHTML = '<div class="filters"><input type="text" id="c-title" maxlength="80" placeholder="' + esc(t("cTitle")) + '">' +
      '<input type="text" id="c-place" maxlength="80" placeholder="' + esc(t("cPlace")) + '">' +
      '<div class="row time-row"><label>' + t("cDate") + ' <select id="c-date">' + opts + "</select></label>" +
      '<label>' + t("from") + ' <input type="time" id="c-from" value="12:00"></label><label>' + t("to") + ' <input type="time" id="c-to" value="13:00"></label></div>' +
      '<p class="error" id="c-err" hidden></p><div class="row"><button class="btn primary" id="c-save">' + t("cSave") + '</button><button class="btn ghost" id="c-cancel">' + t("cCancel") + "</button></div></div>";
    box.hidden = false; $("#c-title").focus();
  }
  function saveCustom() {
    const title = $("#c-title").value.trim(), from = $("#c-from").value, to = $("#c-to").value, err = $("#c-err");
    if (!title) { err.textContent = t("cErrTitle"); err.hidden = false; return; }
    if (!from || !to || toMin(to) <= toMin(from)) { err.textContent = t("cErrTime"); err.hidden = false; return; }
    state.custom.push({ id: "c" + Date.now().toString(36), date: $("#c-date").value, title, place: $("#c-place").value.trim(), from, to });
    saveMine(); customForm(false); renderMine(); track("custom-add");
  }

  // ------------------------------------------------------------ xuất lịch .ics
  function icsEsc(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function fold(line) {   // RFC 5545: mỗi dòng ≤ 75 byte UTF-8, không cắt giữa một ký tự
    const out = []; let cur = "", n = 0;
    for (const ch of line) {
      const b = new TextEncoder().encode(ch).length;
      if (n + b > 74) { out.push(cur); cur = " "; n = 1; }
      cur += ch; n += b;
    }
    out.push(cur); return out.join("\r\n");
  }
  function utc(date, m) {   // giờ Việt Nam = UTC+7
    const [y, mo, d] = date.split("-").map(Number);
    return new Date(Date.UTC(y, mo - 1, d, Math.floor(m / 60) - 7, m % 60)).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  function exportIcs() {
    const items = mineItems();
    if (!items.length) { toast(t("emptyPlan")); return; }
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Thang Long Ke Nghe Planner//VI", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Thăng Long Kẻ Nghệ"];
    items.forEach((it, i) => {
      L.push("BEGIN:VEVENT", "UID:" + i + "-" + (it.kind === "ev" ? it.ev.id : it.c.id) + "-" + it.date + "@tlkn-planner", "DTSTAMP:" + stamp);
      if (it.at !== 9999 && !it.flexNoTime) { L.push("DTSTART:" + utc(it.date, it.at), "DTEND:" + utc(it.date, Math.max(it.end, it.at + 15))); }
      else { L.push("DTSTART;VALUE=DATE:" + it.date.replace(/-/g, ""), "DTEND;VALUE=DATE:" + addDays(it.date, 1).replace(/-/g, "")); }
      if (it.kind === "ev") {
        L.push(fold("SUMMARY:" + icsEsc(titleOf(it.ev))), fold("LOCATION:" + icsEsc(it.v.name + (it.v.address ? ", " + it.v.address : ""))),
          fold("DESCRIPTION:" + icsEsc((it.flexNoTime ? t("open") + " " + slotText(it.sl) + ". " : "") + it.ev.url)));
        if (hasGeo(it.v)) L.push("GEO:" + it.v.lat + ";" + it.v.lng);
      } else {
        L.push(fold("SUMMARY:" + icsEsc(it.c.title)));
        if (it.c.place) L.push(fold("LOCATION:" + icsEsc(it.c.place)));
      }
      L.push("END:VEVENT");
    });
    L.push("END:VCALENDAR");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([L.join("\r\n")], { type: "text/calendar;charset=utf-8" }));
    a.download = "thang-long-ke-nghe.ics"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast(t("icsDone")); track("export-ics");
  }

  // ------------------------------------------------------------ chia sẻ (chỉ gửi mã hoạt động, không gửi điểm riêng)
  const enc = (p) => [p.id, p.date.slice(5).replace("-", ""), (p.from || "").replace(":", ""), (p.at || "").replace(":", ""), (p.end || "").replace(":", "")].join("~");
  function dec(s) {
    const y = state.data.festival.start.slice(0, 4);
    return s.split(",").map((x) => {
      const [id, md, f, a, e] = x.split("~");
      if (!id || !md || md.length !== 4 || !state.byId[id]) return null;
      const c = (v) => v && v.length === 4 ? v.slice(0, 2) + ":" + v.slice(2) : "";
      const p = { id, date: y + "-" + md.slice(0, 2) + "-" + md.slice(2), from: c(f) };
      const sl = slotsOn(state.byId[id], p.date).find((s) => (s.from || "") === p.from); p.to = sl ? (sl.to || "") : "";
      if (c(a)) { p.at = c(a); p.end = c(e); }
      return p;
    }).filter(Boolean);
  }
  async function share() {
    if (!state.plan.length) { toast(t("emptyPlan")); return; }
    const url = location.origin + location.pathname + "#p=" + encodeURIComponent(state.plan.map(enc).join(","));
    track("share");
    if (navigator.share) { try { await navigator.share({ title: "Thăng Long Kẻ Nghệ Planner", url }); return; } catch (e) { if (e.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(url); toast(t("copied")); } catch (e) { history.replaceState(null, "", url); toast(t("copyFail")); }
  }
  function checkShared() {
    const m = location.hash.match(/#p=([^&]+)/); if (!m) return;
    const items = dec(decodeURIComponent(m[1])); if (!items.length) return;
    state.shared = items; $("#shared-banner").hidden = false; track("shared-open");
  }

  // ------------------------------------------------------------ góp ý ẩn danh
  function mask(s) {
    return String(s || "").replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]").replace(/(\+?84|0)[\s.-]?\d(?:[\s.-]?\d){7,9}/g, "[sđt]").slice(0, 300);
  }
  async function sendFeedback(box, payload) {
    const errEl = box.querySelector(".error");
    if (box.querySelector('input[name="website"]').value) return;           // bẫy chống spam tự động
    if (!CFG.feedbackEndpoint) {
      errEl.innerHTML = CFG.threadsUrl ? '<a target="_blank" rel="noopener" href="' + esc(CFG.threadsUrl) + '">' + t("fbThreads") + "</a>" : t("fbErr");
      errEl.hidden = false; return;
    }
    try {
      const r = await fetch(CFG.feedbackEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "omit", referrerPolicy: "no-referrer" });
      if (!r.ok) throw new Error(r.status);
      box.innerHTML = '<p class="hint">' + t("fbThanks") + "</p>"; track("feedback");
    } catch (e) {
      errEl.innerHTML = t("fbErr") + (CFG.threadsUrl ? ' <a target="_blank" rel="noopener" href="' + esc(CFG.threadsUrl) + '">Threads</a>' : ""); errEl.hidden = false;
    }
  }
  function renderSiteFeedback() {
    $("#site-feedback").innerHTML = '<div class="fb" data-fb="site"><b>' + t("siteFbTitle") + '</b><textarea maxlength="300" placeholder="' + esc(t("siteFbPh")) + '"></textarea>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" hidden><div class="row"><button class="btn small primary" data-fbsend="site">' + t("fbSend") + "</button>" +
      (CFG.threadsUrl ? '<a class="btn small ghost" target="_blank" rel="noopener" href="' + esc(CFG.threadsUrl) + '">' + t("fbThreads") + "</a>" : "") + '<span class="error" hidden></span></div></div>';
  }

  // ------------------------------------------------------------ điều hướng
  function setView(v, silent) {
    if (v === "map" && isWide()) v = "list";      // màn hình rộng: bản đồ luôn nằm cạnh danh sách
    state.view = v;
    const split = isWide() && v === "list";
    document.body.classList.toggle("split", split);
    ["list", "map", "plan", "mine"].forEach((k) => { $("#view-" + k).hidden = !(k === v || (split && k === "map")); });
    $$(".tab").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    $("#days").hidden = v === "mine";
    renderView(); if (!silent) { window.scrollTo(0, 0); track("tab-" + v); }
  }
  function renderView() {
    if (state.view === "list") { renderTypeChips(); renderList(); if (document.body.classList.contains("split")) renderMap(); }
    if (state.view === "map") renderMap();
    if (state.view === "plan") { renderPlannerForm(); renderResult(); }
    if (state.view === "mine") renderMine();
  }
  function renderAll() { applyI18n(); renderDays(); renderView(); renderSiteFeedback(); $("#mine-count").textContent = state.plan.length + state.custom.length; }

  function toggleSave(btn) {
    if (btn.closest(".leaflet-popup")) state.keepMapView = true;
    const p = { id: btn.dataset.save, date: btn.dataset.date, from: btn.dataset.from || "", to: btn.dataset.to || "" };
    const i = state.plan.findIndex((x) => keyOf(x) === keyOf(p));
    if (i >= 0) { state.plan.splice(i, 1); toast(t("removedFrom", shortDay(p.date))); track("unsave"); }
    else { state.plan.push(p); toast(t("savedTo", shortDay(p.date))); track("save"); }
    saveMine(); renderView();
    if (map) map.closePopup();
  }

  function bind() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("button, a, input, textarea, label");
      if (!b) {
        const card = e.target.closest("#list .card");
        if (card && document.body.classList.contains("split")) focusOnMap(card.id.slice(2));
        return;
      }
      if (b.dataset.focus) { focusOnMap(b.dataset.focus); return; }
      const d = b.dataset;
      if (b.classList.contains("day")) {
        state.day = d.day; state.result = null; state.exclude = new Set(); renderDays();
        if (state.view === "plan") { renderPlannerForm(); runPlanner(null, true); } else renderView();
        track("day"); return;
      }
      if (d.view) { setView(d.view); return; }
      if (d.save) { toggleSave(b); return; }
      if (d.type) { state.types.has(d.type) ? state.types.delete(d.type) : state.types.add(d.type); renderView(); track("filter"); return; }
      if (d.win) { state.win = d.win; [state.from, state.to] = WINDOWS[d.win]; renderPlannerForm(); return; }
      if (d.int) { if (d.int === "all") state.interests.clear(); else state.interests.has(d.int) ? state.interests.delete(d.int) : state.interests.add(d.int); renderPlannerForm(); return; }
      if (d.pace) { state.pace = d.pace; renderPlannerForm(); return; }
      if (d.route) { const r = ROUTES.find((x) => x.id === d.route); state.exclude = new Set(); state.from = 540; state.to = 1080; runPlanner(r.items); return; }
      if (d.swap) { state.exclude.add(d.swap); runPlanner(state.result && state.result.only); return; }
      if (d.delcustom) { state.custom = state.custom.filter((c) => c.id !== d.delcustom); saveMine(); renderMine(); return; }
      if (d.report) { state.fbOpen = state.fbOpen === d.report ? null : d.report; renderView(); const c = document.getElementById("c-" + d.report); if (c) c.scrollIntoView({ block: "nearest" }); return; }
      if (d.fbreason) { b.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === b)); return; }
      if (d.fbsend) {
        const box = b.closest(".fb"), errEl = box.querySelector(".error"), on = box.querySelector(".chip.on"), text = mask(box.querySelector("textarea").value.trim());
        errEl.hidden = true;
        if (d.fbsend !== "site" && !on) { errEl.textContent = t("fbNeedReason"); errEl.hidden = false; return; }
        if ((d.fbsend === "site" || (on && on.dataset.fbreason === "fbOther")) && text.length < 3) { errEl.textContent = t("fbNeedText"); errEl.hidden = false; return; }
        sendFeedback(box, { kind: d.fbsend === "site" ? "site" : "event", eventId: d.fbsend === "site" ? "" : d.fbsend, reason: on ? on.dataset.fbreason : "", text, lang });
        return;
      }
      if (d.track) { track(d.track); return; }
    });
    document.addEventListener("input", (e) => { if (e.target.closest(".fb") && e.target.tagName === "TEXTAREA") { const er = e.target.closest(".fb").querySelector(".error"); if (er) er.hidden = true; } });
    $("#lang-toggle").addEventListener("click", () => { lang = lang === "vi" ? "en" : "vi"; store.set(K.lang, lang); renderAll(); track("lang-" + lang); });
    let qt; $("#q").addEventListener("input", (e) => { state.q = e.target.value.trim(); clearTimeout(qt); qt = setTimeout(() => { renderList(); if (state.q) track("search"); }, 200); });
    $("#open-now").addEventListener("click", () => { state.openNow = !state.openNow; renderView(); });
    $("#near-me").addEventListener("click", () => {
      if (state.here) { state.here = null; renderView(); return; }
      if (!navigator.geolocation) { toast(t("geoFail")); return; }
      navigator.geolocation.getCurrentPosition((pos) => {
        state.here = { lat: pos.coords.latitude, lng: pos.coords.longitude };   // chỉ giữ trong bộ nhớ, không lưu, không gửi
        renderView(); track("near-me");
      }, () => toast(t("geoFail")), { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    });
    $("#p-from").addEventListener("change", (e) => { state.from = +e.target.value; state.win = ""; renderPlannerForm(); });
    $("#p-to").addEventListener("change", (e) => { state.to = +e.target.value; state.win = ""; renderPlannerForm(); });
    $("#p-run").addEventListener("click", () => { state.exclude = new Set(); runPlanner(null); });
    $("#p-result").addEventListener("click", (e) => { if (e.target.id === "p-save") saveResult(); });
    $("#export-ics").addEventListener("click", exportIcs);
    $("#share-plan").addEventListener("click", share);
    $("#add-custom").addEventListener("click", () => customForm($("#custom-form").hidden));
    $("#custom-form").addEventListener("click", (e) => { if (e.target.id === "c-save") saveCustom(); if (e.target.id === "c-cancel") customForm(false); });
    $("#import-shared").addEventListener("click", () => {
      let n = 0; state.shared.forEach((p) => { if (!state.plan.some((x) => keyOf(x) === keyOf(p))) { state.plan.push(p); n++; } });
      saveMine(); $("#shared-banner").hidden = true; history.replaceState(null, "", location.pathname); toast(t("addedN", n)); track("shared-import"); setView("mine");
    });
    $("#dismiss-shared").addEventListener("click", () => { $("#shared-banner").hidden = true; history.replaceState(null, "", location.pathname); });
    let wipeTimer = null;
    $("#wipe").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      if (!btn.dataset.sure) {   // chạm lần 1: chỉ hỏi lại, tránh xóa nhầm
        btn.dataset.sure = "1"; btn.textContent = t("wipeSure"); btn.classList.add("danger");
        clearTimeout(wipeTimer);
        wipeTimer = setTimeout(() => { delete btn.dataset.sure; btn.textContent = t("wipe"); btn.classList.remove("danger"); }, 5000);
        return;
      }
      clearTimeout(wipeTimer); delete btn.dataset.sure; btn.textContent = t("wipe"); btn.classList.remove("danger");
      Object.values(K).forEach((k) => store.del(k));
      state.plan = []; state.custom = []; state.here = null;
      try { if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); } } catch (e) { /* bỏ qua */ }
      $("#mine-count").textContent = "0"; $("#mine-count").classList.add("zero"); renderAll(); toast(t("wiped"));   // không ghi lại gì vào localStorage
    });
  }

  // ------------------------------------------------------------ khởi động
  async function init() {
    loadAnalytics(); applyI18n();
    try {
      const r = await fetch("data/events.json", { cache: "no-cache" });
      state.data = await r.json();
    } catch (e) { $("#list").innerHTML = '<p class="empty">' + t("loadFail") + "</p>"; return; }
    state.data.events.forEach((ev) => { state.byId[ev.id] = ev; });
    const f = state.data.festival, td = today();
    state.day = td < f.start ? f.start : td > f.end ? f.end : td;
    if (state.day === td) { const n = Math.ceil(nowMin() / 30) * 30; if (n < 1290) { state.from = Math.max(480, n); state.win = ""; } }
    $("#updated").textContent = (state.data.generatedAt || "").replace("T", " ").slice(0, 16);
    $("#agenda-link").href = f.agendaUrl || "#";
    loadMine(); bind(); applyI18n(); renderDays(); renderSiteFeedback(); $("#mine-count").textContent = state.plan.length + state.custom.length; $("#mine-count").classList.toggle("zero", !(state.plan.length + state.custom.length));
    setView("plan", true); runPlanner(null, true); checkShared();
    wideMQ.addEventListener("change", () => { setView(state.view === "map" ? "list" : state.view, true); if (map) setTimeout(() => map.invalidateSize(), 60); });
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  init();
})();
