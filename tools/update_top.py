from pathlib import Path
import re

APP = Path('app.js')
CSS = Path('style.css')

app = APP.read_text(encoding='utf-8')
replacement = r'''  let topClockTimer = null;
  const EMERGENCY_REGISTER_URL = 'https://script.google.com/macros/s/AKfycbwDPIurCh2FROAdC8rbYtCHq1WXUSndcDz-UiEmpfCvI9MLSs90P1k4HYAJpxaF4gRM0g/exec?mode=register';

  // タイムテーブル確定後は、ここだけ差し替えればTOPの次予定表示が動きます。
  const TOP_NEXT_PLAN = {
    title: 'タイムテーブル未設定',
    startAt: null, // 例: '2026-12-04T18:30:00+09:00'
    moveAt: null,  // 例: '2026-12-04T18:10:00+09:00'
    mapQuery: ''
  };

  const formatPlanTime = (value) => {
    if (!value) return '--:--';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--:--';
    return new Intl.DateTimeFormat('ja-JP', {
      hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'Asia/Tokyo'
    }).format(d);
  };

  const minutesUntil = (value) => {
    if (!value) return '— 分';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '— 分';
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return '0 分';
    return `${Math.ceil(diff / 60000)} 分`;
  };

  function renderTop() {
    document.title = '京都旅行';
    document.body.className = 'top-page';

    const nextMapQuery = TOP_NEXT_PLAN.mapQuery ? encodeURIComponent(TOP_NEXT_PLAN.mapQuery) : '';
    const nextApple = nextMapQuery ? `https://maps.apple.com/?q=${nextMapQuery}` : '';
    const nextGoogle = nextMapQuery ? `https://www.google.com/maps/search/?api=1&query=${nextMapQuery}` : '';

    app.innerHTML = `
      <main class="top-shell">
        <div class="top-art">
          <img id="topImage" src="${esc(TOP_IMAGE_URL)}" alt="京都旅行 TOP画像" referrerpolicy="no-referrer">
          <div class="top-image-error" id="topImageError" hidden>TOP画像を読み込めませんでした。</div>
        </div>

        <nav class="top-actions" aria-label="メインメニュー">
          <a class="top-button primary" href="${hrefFor({page:'tourism'})}" data-route="page=tourism">観光スポット一覧</a>
          <a class="top-button secondary" href="${hrefFor({page:'food'})}" data-route="page=food">食事スポット一覧</a>
        </nav>

        <section class="top-dashboard" aria-label="旅行サポート">
          <a class="emergency-card" href="${esc(EMERGENCY_REGISTER_URL)}" target="_blank" rel="noopener">
            <span class="emergency-kicker">TRIP SAFETY</span>
            <strong>緊急連絡先登録</strong>
            <span class="emergency-copy">旅行中に必要な連絡先・対応情報を登録</span>
            <small>※登録内容を閲覧できるのは 12/4〜12/6 のみです</small>
          </a>

          <div class="next-plan-card">
            <div class="next-plan-head">
              <span class="next-plan-label">次の予定</span>
              <span class="next-plan-temp">暫定</span>
            </div>
            <div class="next-plan-title">${esc(TOP_NEXT_PLAN.title)}</div>

            <div class="next-plan-times">
              <div><span>移動開始</span><b id="nextMoveAt">${esc(formatPlanTime(TOP_NEXT_PLAN.moveAt))}</b></div>
              <div><span>予定開始</span><b id="nextStartAt">${esc(formatPlanTime(TOP_NEXT_PLAN.startAt))}</b></div>
            </div>

            <div class="countdown-grid">
              <div class="countdown-box"><span>移動開始まで</span><strong id="moveCountdown">${esc(minutesUntil(TOP_NEXT_PLAN.moveAt))}</strong></div>
              <div class="countdown-box"><span>予定開始まで</span><strong id="startCountdown">${esc(minutesUntil(TOP_NEXT_PLAN.startAt))}</strong></div>
            </div>

            <div class="top-current-time">現在 <span id="topNowClock">--:--</span></div>

            <div class="next-map-row">
              ${nextApple
                ? `<a href="${esc(nextApple)}" target="_blank" rel="noopener">Appleマップ</a>`
                : `<span class="disabled">Appleマップ</span>`}
              ${nextGoogle
                ? `<a href="${esc(nextGoogle)}" target="_blank" rel="noopener">Google Maps</a>`
                : `<span class="disabled">Google Maps</span>`}
            </div>
          </div>
        </section>
      </main>`;

    const img = document.getElementById('topImage');
    img.addEventListener('error', () => {
      if (img.dataset.fallback !== '1') {
        img.dataset.fallback = '1';
        img.src = TOP_IMAGE_FALLBACK_URL;
      } else {
        img.hidden = true;
        document.getElementById('topImageError').hidden = false;
      }
    });

    const updateTopClock = () => {
      const nowEl = document.getElementById('topNowClock');
      if (!nowEl) {
        if (topClockTimer) clearInterval(topClockTimer);
        topClockTimer = null;
        return;
      }
      nowEl.textContent = new Intl.DateTimeFormat('ja-JP', {
        hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'Asia/Tokyo'
      }).format(new Date());
      const moveEl = document.getElementById('moveCountdown');
      const startEl = document.getElementById('startCountdown');
      if (moveEl) moveEl.textContent = minutesUntil(TOP_NEXT_PLAN.moveAt);
      if (startEl) startEl.textContent = minutesUntil(TOP_NEXT_PLAN.startAt);
    };

    updateTopClock();
    if (topClockTimer) clearInterval(topClockTimer);
    topClockTimer = setInterval(updateTopClock, 30000);
    bindInternalLinks();
  }

'''
pattern = r"  function renderTop\(\) \{.*?\n  \}\n\n  function renderTourism\(\)"
if not re.search(pattern, app, flags=re.S):
    raise SystemExit('renderTop block not found')
app = re.sub(pattern, replacement + '  function renderTourism()', app, count=1, flags=re.S)
APP.write_text(app, encoding='utf-8')

css = CSS.read_text(encoding='utf-8')
marker = '/* TOP DASHBOARD 2026 */'
block = r'''

/* TOP DASHBOARD 2026 */
.top-dashboard{
  display:grid;
  grid-template-columns:minmax(0,1.18fr) minmax(0,.82fr);
  gap:12px;
  width:100%;
  align-items:stretch;
}
.emergency-card,.next-plan-card{
  border:1px solid var(--accent);
  border-radius:18px;
  background:var(--paper);
  color:var(--ink);
  min-width:0;
}
.emergency-card{
  min-height:220px;
  padding:22px 24px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  text-decoration:none;
  border-width:2px;
  box-shadow:0 8px 24px rgba(40,32,20,.05);
}
.emergency-kicker{
  font-size:11px;
  letter-spacing:.14em;
  font-weight:800;
  color:var(--muted);
  margin-bottom:8px;
}
.emergency-card strong{
  font-family:"Hiragino Mincho ProN","Yu Mincho",serif;
  font-size:30px;
  line-height:1.25;
  margin-bottom:9px;
}
.emergency-copy{font-size:14px;font-weight:700;color:var(--muted)}
.emergency-card small{font-size:11px;color:var(--muted);margin-top:13px;line-height:1.5}
.next-plan-card{
  padding:17px;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.next-plan-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.next-plan-label{font-family:"Hiragino Mincho ProN","Yu Mincho",serif;font-size:22px;font-weight:800}
.next-plan-temp{font-size:10px;font-weight:800;border:1px solid var(--line);border-radius:999px;padding:3px 7px;color:var(--muted)}
.next-plan-title{font-size:14px;font-weight:800;padding:9px 10px;background:#f9f6ef;border-radius:10px}
.next-plan-times{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.next-plan-times>div{padding:8px 9px;border:1px solid var(--line);border-radius:10px;background:#fff}
.next-plan-times span,.countdown-box span{display:block;font-size:10px;color:var(--muted);font-weight:800}
.next-plan-times b{display:block;font-size:18px;margin-top:1px}
.countdown-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.countdown-box{padding:9px;border-radius:10px;background:var(--accent);color:#fff}
.countdown-box span{color:rgba(255,255,255,.72)}
.countdown-box strong{display:block;font-size:20px;line-height:1.25;margin-top:2px}
.top-current-time{text-align:right;font-size:10px;color:var(--muted);font-weight:700}
.next-map-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:auto}
.next-map-row a,.next-map-row span{
  display:block;
  text-align:center;
  padding:8px 6px;
  border-radius:9px;
  font-size:11px;
  font-weight:800;
  text-decoration:none;
  border:1px solid var(--accent);
}
.next-map-row a{background:var(--paper);color:var(--accent)}
.next-map-row .disabled{border-color:var(--line);color:#aaa;background:#f5f2eb}
@media(max-width:620px){
  .top-dashboard{grid-template-columns:1fr}
  .emergency-card{min-height:170px;padding:20px}
  .emergency-card strong{font-size:27px}
  .next-plan-card{padding:16px}
}
'''
if marker in css:
    css = css.split(marker)[0].rstrip() + block + '\n'
else:
    css = css.rstrip() + block + '\n'
CSS.write_text(css, encoding='utf-8')
