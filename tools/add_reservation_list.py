from pathlib import Path
import re

ap = Path('app.js')
app = ap.read_text(encoding='utf-8')

old_nav = '''        <nav class="top-actions" aria-label="メインメニュー">
          <a class="top-button primary" href="${hrefFor({page:'tourism'})}" data-route="page=tourism">観光スポット一覧</a>
          <a class="top-button secondary" href="${hrefFor({page:'food'})}" data-route="page=food">食事スポット一覧</a>
        </nav>'''
new_nav = '''        <nav class="top-actions" aria-label="メインメニュー">
          <a class="top-button primary" href="${hrefFor({page:'tourism'})}" data-route="page=tourism">観光スポット一覧</a>
          <a class="top-button secondary" href="${hrefFor({page:'food'})}" data-route="page=food">食事スポット一覧</a>
          <a class="top-button reservation" href="${hrefFor({page:'reservations'})}" data-route="page=reservations">予約済み一覧</a>
        </nav>'''
if old_nav not in app:
    raise SystemExit('Top nav block not found')
app = app.replace(old_nav, new_nav, 1)

reservation_fn = r'''
  function renderReservations() {
    document.title = '予約済み一覧｜京都旅行';
    document.body.className = '';

    const schedule = [
      {kind:'food', id:'ikedaya-hananomai', sort:'2026-12-04T18:30:00+09:00', time:'12月4日（金）18:30', note:'公式Webより予約済', type:'食事'},
      {kind:'spot', id:'shouei', sort:'2026-12-04T21:00:00+09:00', time:'12月4日（金）21:00', note:'チェックイン（2泊／12月6日（日）10:00までにチェックアウト）', type:'宿泊'},
      {kind:'spot', id:'shimabara', sort:'2026-12-05T14:15:00+09:00', time:'12月5日（土）14:15', note:'14:10集合／見学 約1時間10分', type:'観光'}
    ];

    const reservations = schedule.map(item => {
      const source = item.kind === 'food'
        ? FOOD_SPOTS.find(s => s.id === item.id)
        : SPOTS.find(s => s.id === item.id);
      return source ? {...source, ...item} : null;
    }).filter(Boolean).sort((a,b) => new Date(a.sort) - new Date(b.sort));

    const cards = reservations.map(s => {
      const params = s.kind === 'food' ? {food:s.id} : {spot:s.id};
      const route = `${s.kind}=${encodeURIComponent(s.id)}`;
      const tags = [s.type, ...(s.tags || []).filter(t => t !== '予約済')];
      const days = (s.days && s.days.length) ? s.days : [];
      const badges = tags.map(t => `<span class="tag">${esc(t)}</span>`).join('') +
        days.map(d => `<span class="day-badge">${esc(d)}</span>`).join('');
      return `<a class="place-link reservation-list-card" href="${hrefFor(params)}" data-route="${route}">
        <div class="reservation-list-time">${esc(s.time)}</div>
        <b>${esc(s.name)}</b>
        <small>${esc(s.category)}</small>
        <span class="meta-row">${badges}</span>
        <div class="reservation-list-summary"><span>予約・予定</span><strong>${esc(s.note)}</strong></div>
      </a>`;
    }).join('');

    app.innerHTML = `
      <main class="wrap"><div class="card">
        <div class="page-nav"><a href="${hrefFor()}" data-route="">← TOP</a></div>
        <div class="eyebrow">KYOTO TRIP</div>
        <h1>予約済み一覧</h1>
        <div class="reservation-list-intro">予約・集合時刻の早い順です。時刻は一覧上で確認でき、カードを押すと各スポットの詳細ページへ移動します。</div>
        <div class="grid reservation-list-grid">${cards || '<div class="coming-soon">予約済みの予定はありません。</div>'}</div>
      </div></main>`;
    bindInternalLinks();
  }

'''
marker = '  function renderFood() {'
if 'function renderReservations()' not in app:
    if marker not in app:
        raise SystemExit('renderFood marker not found')
    app = app.replace(marker, reservation_fn + marker, 1)

router_old = "    if (p.get('page') === 'tourism') return renderTourism();\n    if (p.get('page') === 'food') return renderFood();"
router_new = "    if (p.get('page') === 'tourism') return renderTourism();\n    if (p.get('page') === 'food') return renderFood();\n    if (p.get('page') === 'reservations') return renderReservations();"
if router_old not in app:
    raise SystemExit('Router marker not found')
app = app.replace(router_old, router_new, 1)
ap.write_text(app, encoding='utf-8')

sp = Path('style.css')
css = sp.read_text(encoding='utf-8')
extra = '''

/* Reservation list */
.top-button.reservation{background:#eee7da;color:var(--accent);border-color:#cfc3b2}
.reservation-list-intro{font-size:13px;color:var(--muted);margin:8px 0 18px}
.reservation-list-grid{gap:14px}
.reservation-list-card{padding:17px 18px}
.reservation-list-time{font-size:20px;line-height:1.3;font-weight:900;color:var(--accent);margin-bottom:8px;font-variant-numeric:tabular-nums}
.reservation-list-card>b{display:block;font-size:18px;line-height:1.45}
.reservation-list-summary{margin-top:9px;padding:10px 12px;border-radius:11px;background:#f5eee3;color:var(--accent);display:grid;gap:2px}
.reservation-list-summary span{font-size:10px;font-weight:800;color:var(--muted)}
.reservation-list-summary strong{font-size:13px;line-height:1.45}
.top-page .top-actions{gap:6px}
.top-page .top-button{min-height:42px;padding:7px 14px}
@media(max-width:480px){
  .reservation-list-time{font-size:18px}
  .reservation-list-card>b{font-size:16px}
}
'''
if '/* Reservation list */' not in css:
    css += extra
sp.write_text(css, encoding='utf-8')

ip = Path('index.html')
index = ip.read_text(encoding='utf-8')
version = '20260911-2330'
index = re.sub(r'(style\.css\?v=)[^"\']+', rf'\g<1>{version}', index)
index = re.sub(r'(data\.js\?v=)[^"\']+', rf'\g<1>{version}', index)
index = re.sub(r'(app\.js\?v=)[^"\']+', rf'\g<1>{version}', index)
ip.write_text(index, encoding='utf-8')
