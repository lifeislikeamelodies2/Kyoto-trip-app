(() => {
  'use strict';

  // 出発前テスト用：PDFの1日目・2日目を 2026/9/14・9/15 に移し、
  // 9/16 は「PDF内に予定なし」の状態を確認する3日目として扱います。
  const TEST_RANGE = {
    start: '2026-09-14T00:00:00+09:00',
    end: '2026-09-16T23:59:59+09:00'
  };

  const PLANS = [
    // 1日目（PDF 12/4 → テスト 9/14）
    { day: 1, title: '京都駅 集合', startAt: '2026-09-14T07:30:00+09:00', moveAt: null, mapQuery: '京都駅' },
    { day: 1, title: '湯の宿 松栄｜荷物預け', startAt: '2026-09-14T07:50:00+09:00', moveAt: '2026-09-14T07:40:00+09:00', mapQuery: '湯の宿 松栄 京都' },
    { day: 1, title: '大覚寺', startAt: '2026-09-14T09:00:00+09:00', moveAt: '2026-09-14T08:05:00+09:00', mapQuery: '大覚寺 京都' },
    { day: 1, title: '北野天満宮', startAt: '2026-09-14T10:25:00+09:00', moveAt: '2026-09-14T10:00:00+09:00', mapQuery: '北野天満宮' },
    { day: 1, title: '上七軒', startAt: '2026-09-14T11:10:00+09:00', moveAt: '2026-09-14T11:10:00+09:00', mapQuery: '上七軒 京都' },
    { day: 1, title: '昼食｜上七軒・千本今出川周辺', startAt: '2026-09-14T11:15:00+09:00', moveAt: '2026-09-14T11:15:00+09:00', mapQuery: '千本今出川 京都' },
    { day: 1, title: '朱雀門跡・千本通周辺', startAt: '2026-09-14T13:05:00+09:00', moveAt: '2026-09-14T12:45:00+09:00', mapQuery: '朱雀門跡 京都' },
    { day: 1, title: '壬生寺・壬生塚・歴史資料室', startAt: '2026-09-14T13:25:00+09:00', moveAt: '2026-09-14T13:10:00+09:00', mapQuery: '壬生寺 京都' },
    { day: 1, title: '壬生屯所旧跡・八木家', startAt: '2026-09-14T14:00:00+09:00', moveAt: '2026-09-14T13:55:00+09:00', mapQuery: '壬生屯所旧跡 八木家 京都' },
    { day: 1, title: '佐伯・由起緒 借家候補地', startAt: '2026-09-14T15:00:00+09:00', moveAt: '2026-09-14T15:00:00+09:00', mapQuery: '京都市中京区壬生' },
    { day: 1, title: '西本願寺', startAt: '2026-09-14T15:35:00+09:00', moveAt: '2026-09-14T15:12:00+09:00', mapQuery: '西本願寺 京都' },
    { day: 1, title: '東本願寺', startAt: '2026-09-14T16:10:00+09:00', moveAt: '2026-09-14T15:55:00+09:00', mapQuery: '東本願寺 京都' },
    { day: 1, title: '湯の宿 松栄｜チェックイン・休憩', startAt: '2026-09-14T16:55:00+09:00', moveAt: '2026-09-14T16:25:00+09:00', mapQuery: '湯の宿 松栄 京都' },
    { day: 1, title: '池田屋 はなの舞', startAt: '2026-09-14T18:30:00+09:00', moveAt: '2026-09-14T17:35:00+09:00', mapQuery: '池田屋 はなの舞 京都三条河原町' },

    // 2日目（PDF 12/5 → テスト 9/15）
    { day: 2, title: '朝食｜湯の宿 松栄', startAt: '2026-09-15T07:30:00+09:00', moveAt: null, mapQuery: '湯の宿 松栄 京都' },
    { day: 2, title: '京都霊山護国神社', startAt: '2026-09-15T09:50:00+09:00', moveAt: '2026-09-15T09:00:00+09:00', mapQuery: '京都霊山護国神社' },
    { day: 2, title: '本間精一郎遭難地周辺', startAt: '2026-09-15T11:15:00+09:00', moveAt: '2026-09-15T10:35:00+09:00', mapQuery: '木屋町通四条上る 京都' },
    { day: 2, title: '昼食｜木屋町・河原町周辺', startAt: '2026-09-15T11:25:00+09:00', moveAt: '2026-09-15T11:25:00+09:00', mapQuery: '木屋町 河原町 京都' },
    { day: 2, title: '角屋 1階案内（間に合えば）', startAt: '2026-09-15T13:30:00+09:00', moveAt: '2026-09-15T12:55:00+09:00', mapQuery: '角屋もてなしの文化美術館' },
    { day: 2, title: '角屋｜受付・14:10集合', startAt: '2026-09-15T14:00:00+09:00', moveAt: '2026-09-15T14:00:00+09:00', mapQuery: '角屋もてなしの文化美術館' },
    { day: 2, title: '角屋もてなしの文化美術館', startAt: '2026-09-15T14:15:00+09:00', moveAt: '2026-09-15T14:00:00+09:00', mapQuery: '角屋もてなしの文化美術館' },
    { day: 2, title: '麻・元婚家候補地', startAt: '2026-09-15T16:05:00+09:00', moveAt: '2026-09-15T15:25:00+09:00', mapQuery: '京都市中京区仁王門町' },
    { day: 2, title: '藤井家候補地', startAt: '2026-09-15T16:35:00+09:00', moveAt: '2026-09-15T16:15:00+09:00', mapQuery: '新町通丸太町 京都' },
    { day: 2, title: '蛤御門', startAt: '2026-09-15T16:55:00+09:00', moveAt: '2026-09-15T16:45:00+09:00', mapQuery: '蛤御門 京都御苑' },
    { day: 2, title: '鷹司邸跡', startAt: '2026-09-15T17:30:00+09:00', moveAt: '2026-09-15T17:10:00+09:00', mapQuery: '鷹司邸跡 京都御苑' },
    { day: 2, title: '近江屋跡', startAt: '2026-09-15T18:05:00+09:00', moveAt: '2026-09-15T17:45:00+09:00', mapQuery: '近江屋跡 京都' },
    { day: 2, title: '麻 現在の家候補地', startAt: '2026-09-15T18:35:00+09:00', moveAt: '2026-09-15T18:15:00+09:00', mapQuery: '木屋町通五条上る 高瀬川 京都' },
    { day: 2, title: '夕食｜先斗町周辺', startAt: '2026-09-15T19:05:00+09:00', moveAt: '2026-09-15T18:45:00+09:00', mapQuery: '先斗町 京都' },
    { day: 2, title: '島原 夜散策', startAt: '2026-09-15T21:32:00+09:00', moveAt: '2026-09-15T20:45:00+09:00', mapQuery: '島原 京都' },
    { day: 2, title: '湯の宿 松栄｜宿へ戻る', startAt: '2026-09-15T22:05:00+09:00', moveAt: '2026-09-15T22:00:00+09:00', mapQuery: '湯の宿 松栄 京都' }
  ];

  const UNTYPED_DAY1_EVENING = {
    day: 1,
    date: '2026-09-14',
    title: '夕食後｜長州藩邸跡・桂小五郎像 → 先斗町・祇園（任意）',
    timeLabel: '夕食後',
    moveLabel: '時刻未定',
    mapQuery: '長州藩邸跡 桂小五郎像 京都'
  };

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatTime = (value) => {
    if (!value) return '--:--';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--:--';
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tokyo'
    }).format(d);
  };

  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'numeric', day: 'numeric', timeZone: 'Asia/Tokyo'
    }).format(d);
  };

  const countdown = (value, now = new Date()) => {
    if (!value) return '— 分';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '— 分';
    const diff = d.getTime() - now.getTime();
    if (diff <= 0) return '0 分';
    return `${Math.ceil(diff / 60000)} 分`;
  };

  const dateKeyJst = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Tokyo'
  }).format(now);

  const getState = (now = new Date()) => {
    const nowMs = now.getTime();
    const testStart = new Date(TEST_RANGE.start).getTime();
    const testEnd = new Date(TEST_RANGE.end).getTime();

    if (nowMs > testEnd) {
      return { kind: 'ended' };
    }

    const next = PLANS.find((plan) => new Date(plan.startAt).getTime() > nowMs);
    const dayKey = dateKeyJst(now);

    // 1日目18:30以降は、PDF上で時刻が固定されていない夕食後の予定を表示します。
    if (dayKey === '2026-09-14' && nowMs >= new Date('2026-09-14T18:30:00+09:00').getTime()) {
      return { kind: 'untimed', plan: UNTYPED_DAY1_EVENING };
    }

    if (next) {
      return { kind: 'plan', plan: next };
    }

    if (dayKey === '2026-09-16' && nowMs >= testStart && nowMs <= testEnd) {
      return { kind: 'empty-day3' };
    }

    return { kind: 'ended' };
  };

  const mapRowHtml = (mapQuery) => {
    if (!mapQuery) {
      return '<span class="disabled">Map</span><span class="disabled">Google Map</span>';
    }
    const q = encodeURIComponent(mapQuery);
    return `<a href="https://maps.apple.com/?q=${q}" target="_blank" rel="noopener">Map</a>` +
      `<a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Google Map</a>`;
  };

  const renderCard = () => {
    const card = document.querySelector('.next-plan-card');
    if (!card) return;

    const now = new Date();
    const state = getState(now);

    if (state.kind === 'plan') {
      const plan = state.plan;
      const moveCount = plan.moveAt && now.getTime() >= new Date(plan.moveAt).getTime() ? '移動中' : countdown(plan.moveAt, now);
      card.innerHTML = `
        <div class="next-plan-head">
          <span class="next-plan-label">次の予定</span>
          <span class="next-plan-temp">テスト ${esc(formatDate(plan.startAt))}・${esc(plan.day)}日目</span>
        </div>
        <div class="next-plan-title">${esc(plan.title)}</div>
        <div class="plan-compact-grid">
          <div class="plan-compact-row">
            <span class="plan-key">移動開始</span>
            <b>${esc(formatTime(plan.moveAt))}</b>
            <span class="plan-count-label">移動開始まで</span>
            <strong>${esc(moveCount)}</strong>
          </div>
          <div class="plan-compact-row">
            <span class="plan-key">予定開始</span>
            <b>${esc(formatTime(plan.startAt))}</b>
            <span class="plan-count-label">予定開始まで</span>
            <strong>${esc(countdown(plan.startAt, now))}</strong>
          </div>
        </div>
        <div class="next-map-row">${mapRowHtml(plan.mapQuery)}</div>`;
      return;
    }

    if (state.kind === 'untimed') {
      const plan = state.plan;
      card.innerHTML = `
        <div class="next-plan-head">
          <span class="next-plan-label">次の予定</span>
          <span class="next-plan-temp">テスト 9/14・1日目</span>
        </div>
        <div class="next-plan-title">${esc(plan.title)}</div>
        <div class="plan-compact-grid">
          <div class="plan-compact-row">
            <span class="plan-key">移動開始</span><b>${esc(plan.moveLabel)}</b>
            <span class="plan-count-label">PDF記載</span><strong>時刻未定</strong>
          </div>
          <div class="plan-compact-row">
            <span class="plan-key">予定開始</span><b>${esc(plan.timeLabel)}</b>
            <span class="plan-count-label">予定開始まで</span><strong>—</strong>
          </div>
        </div>
        <div class="next-map-row">${mapRowHtml(plan.mapQuery)}</div>`;
      return;
    }

    if (state.kind === 'empty-day3') {
      card.innerHTML = `
        <div class="next-plan-head">
          <span class="next-plan-label">次の予定</span>
          <span class="next-plan-temp">テスト 9/16・3日目</span>
        </div>
        <div class="next-plan-title">PDF内に3日目の予定はありません</div>
        <div class="plan-compact-grid">
          <div class="plan-compact-row"><span class="plan-key">状態</span><b>予定なし</b><span class="plan-count-label">テスト確認</span><strong>完了状態</strong></div>
        </div>
        <div class="next-map-row"><span class="disabled">Map</span><span class="disabled">Google Map</span></div>`;
      return;
    }

    card.innerHTML = `
      <div class="next-plan-head">
        <span class="next-plan-label">次の予定</span>
        <span class="next-plan-temp">テスト期間終了</span>
      </div>
      <div class="next-plan-title">9/14〜9/16 のテスト日程は終了しました</div>
      <div class="plan-compact-grid">
        <div class="plan-compact-row"><span class="plan-key">状態</span><b>終了</b><span class="plan-count-label">本番日程</span><strong>未切替</strong></div>
      </div>
      <div class="next-map-row"><span class="disabled">Map</span><span class="disabled">Google Map</span></div>`;
  };

  const app = document.getElementById('app');
  if (!app) return;

  const observer = new MutationObserver(() => renderCard());
  observer.observe(app, { childList: true, subtree: true });

  renderCard();
  window.setInterval(renderCard, 5000);
})();
