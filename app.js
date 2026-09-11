(() => {
  const app = document.getElementById('app');

  const esc = (value) => String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');

  const mapQuery = (spot) => encodeURIComponent(spot.mapQuery || `${spot.name} ${spot.address}`);
  const appleMapUrl = (spot) => `https://maps.apple.com/?q=${mapQuery(spot)}`;
  const googleMapUrl = (spot) => `https://www.google.com/maps/search/?api=1&query=${mapQuery(spot)}`;

  const hrefFor = (params = {}) => {
    const url = new URL(window.location.href);
    url.search = '';
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
    return url.pathname + (url.search || '');
  };

  const navigate = (params = {}) => {
    history.pushState({}, '', hrefFor(params));
    render();
    window.scrollTo({top:0, behavior:'instant'});
  };

  const bindInternalLinks = () => {
    document.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const raw = link.getAttribute('data-route') || '';
        const params = {};
        new URLSearchParams(raw).forEach((v,k) => params[k] = v);
        navigate(params);
      });
    });
  };

  let topClockTimer = null;
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
            <strong>緊急連絡先</strong>
            <span class="emergency-action">登録画面</span>
            <small>※登録した内容の修正URLと内容QRコードは保持してください</small>
          </a>

          <div class="next-plan-card">
            <div class="next-plan-head">
              <span class="next-plan-label">次の行先</span>
              <span class="next-plan-temp">暫定</span>
            </div>
            <div class="next-plan-title">${esc(TOP_NEXT_PLAN.title)}</div>

            <div class="plan-compact-grid">
              <div class="plan-compact-row">
                <span class="plan-key">移動時間</span>
                <b id="nextMoveAt">${esc(formatPlanTime(TOP_NEXT_PLAN.moveAt))}</b>
                <span class="plan-count-label">移動時間まで</span>
                <strong id="moveCountdown">${esc(minutesUntil(TOP_NEXT_PLAN.moveAt))}</strong>
              </div>
              <div class="plan-compact-row">
                <span class="plan-key">予定開始</span>
                <b id="nextStartAt">${esc(formatPlanTime(TOP_NEXT_PLAN.startAt))}</b>
                <span class="plan-count-label">予定開始まで</span>
                <strong id="startCountdown">${esc(minutesUntil(TOP_NEXT_PLAN.startAt))}</strong>
              </div>
            </div>

            <span id="topNowClock" hidden>--:--</span>
            <div class="next-map-row">
              ${nextApple
                ? `<a href="${esc(nextApple)}" target="_blank" rel="noopener">Map</a>`
                : `<span class="disabled">Map</span>`}
              ${nextGoogle
                ? `<a href="${esc(nextGoogle)}" target="_blank" rel="noopener">Google Map</a>`
                : `<span class="disabled">Google Map</span>`}
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

  function renderTourism() {
    document.title = '観光スポット一覧｜京都旅行';
    document.body.className = '';

    const allTags = [...new Set(SPOTS.flatMap(s => s.tags || []))];
    const allDays = [...new Set(SPOTS.flatMap(s => (s.days && s.days.length) ? s.days : ['未定']))]
      .sort((a,b) => {
        if (a === '未定') return 1;
        if (b === '未定') return -1;
        const na = parseInt(a,10), nb = parseInt(b,10);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        return String(a).localeCompare(String(b), 'ja');
      });

    const tagButtons = ['すべて', ...allTags].map((t,i) =>
      `<button class="filter-btn${i===0?' active':''}" type="button" data-filter-type="tag" data-value="${esc(t)}">${esc(t)}</button>`
    ).join('');
    const dayButtons = ['すべて', ...allDays].map((d,i) =>
      `<button class="filter-btn${i===0?' active':''}" type="button" data-filter-type="day" data-value="${esc(d)}">${esc(d)}</button>`
    ).join('');

    const links = SPOTS.map(s => {
      const tags = s.tags || [];
      const days = (s.days && s.days.length) ? s.days : ['未定'];
      const creative = tags.includes('創作関連');
      const badges = tags.map(t => `<span class="tag${t === '創作関連' ? ' creative' : ''}">${esc(t)}</span>`).join('') +
        days.map(d => `<span class="day-badge">${esc(d)}</span>`).join('');
      return `<a class="place-link spot-card${creative ? ' creative-card' : ''}" href="${hrefFor({spot:s.id})}" data-route="spot=${encodeURIComponent(s.id)}" data-tags="${esc(tags.join('|'))}" data-days="${esc(days.join('|'))}">
        <b>${esc(s.name)}</b><small>${esc(s.category)}</small><span class="meta-row">${badges}</span>
      </a>`;
    }).join('');

    app.innerHTML = `
      <main class="wrap"><div class="card">
        <div class="page-nav"><a href="${hrefFor()}" data-route="">← TOP</a></div>
        <div class="eyebrow">KYOTO TRIP</div>
        <h1>観光スポット一覧</h1>
        <div class="filters">
          <div><div class="filter-title">テーマで絞り込み</div><div class="filter-row">${tagButtons}</div></div>
          <div><div class="filter-title">行く日で絞り込み</div><div class="filter-row">${dayButtons}</div></div>
        </div>
        <div class="grid" id="spotGrid">${links}</div>
        <div class="empty" id="emptyMessage">該当するスポットはありません。</div>
      </div></main>`;

    let activeTag = 'すべて';
    let activeDay = 'すべて';
    const applyFilters = () => {
      let visible = 0;
      document.querySelectorAll('.spot-card').forEach(card => {
        const tags = (card.dataset.tags || '').split('|').filter(Boolean);
        const days = (card.dataset.days || '').split('|').filter(Boolean);
        const show = (activeTag === 'すべて' || tags.includes(activeTag)) &&
          (activeDay === 'すべて' || days.includes(activeDay));
        card.style.display = show ? 'block' : 'none';
        if (show) visible++;
      });
      document.getElementById('emptyMessage').style.display = visible ? 'none' : 'block';
    };

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.filterType;
        const value = btn.dataset.value;
        document.querySelectorAll(`.filter-btn[data-filter-type="${type}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (type === 'tag') activeTag = value;
        if (type === 'day') activeDay = value;
        applyFilters();
      });
    });
    bindInternalLinks();
  }

  function renderSpot(spot) {
    document.title = `${spot.name}｜京都旅行`;
    document.body.className = '';
    const tags = (spot.tags || []).map(t => `<span class="tag${t === '創作関連' ? ' creative' : ''}">${esc(t)}</span>`).join('');
    const dayText = (spot.days && spot.days.length) ? spot.days.join('・') : '日程未定';
    const photo = spot.image
      ? `<figure class="spot-photo"><img src="${esc(spot.image)}" alt="${esc(spot.name)}の画像" loading="eager"></figure>`
      : '';
    const spotReservation = spot.reservation
      ? `<section class="section reservation-box"><div class="label">予約・予定</div><div class="reservation-details">${esc(spot.reservation)}</div></section>`
      : '';
    const relatedFood = spot.relatedFoodId
      ? `<section class="section related-place"><div class="label">現在の店舗・食事スポット</div><div class="related-copy">この場所では現在「個室居酒屋 池田屋 はなの舞 京都三条河原町店」が営業しています。</div><a class="related-link" href="${hrefFor({food:spot.relatedFoodId})}" data-route="food=${encodeURIComponent(spot.relatedFoodId)}">池田屋 はなの舞の食事ページを見る →</a><a class="related-list-link" href="${hrefFor({page:'food'})}" data-route="page=food">食事スポット一覧を見る</a></section>`
      : '';
    const oldMap = spot.oldMap
      ? `<section class="section old-map-section"><div class="label">幕末期周辺図</div><img class="old-map-image" src="${esc(spot.oldMap)}" alt="${esc((spot.oldMapArea || spot.name) + 'の幕末期周辺図')}" loading="lazy"><div class="old-map-area">${esc(spot.oldMapArea || '')}</div><div class="old-map-desc">元治元年（1864年）頃の位置関係をもとにした復元イメージです。</div><div class="old-map-credit">参考：<a href="${esc(OLD_MAP_SOURCE_URL)}" target="_blank" rel="noopener">${esc(OLD_MAP_SOURCE_NAME)}</a></div></section>`
      : '';
    app.innerHTML = `
      <main class="wrap"><article class="card">
        <div class="eyebrow">${esc(spot.category)} ｜ KYOTO TRIP</div>
        <h1>${esc(spot.name)}</h1>
        <div class="address">${esc(spot.address)}</div>
        <div class="meta-row">${tags}<span class="day-badge">${esc(dayText)}</span></div>
        ${photo}
        <div class="maps">
          <a class="btn apple" href="${esc(appleMapUrl(spot))}" target="_blank" rel="noopener">Appleマップで開く</a>
          <a class="btn google" href="${esc(googleMapUrl(spot))}" target="_blank" rel="noopener">Google Mapsで開く</a>
        </div>
        ${oldMap}
        ${spotReservation}
        ${relatedFood}
        <section class="section"><div class="label">営業時間・参拝可能時間</div><div class="hours">${esc(spot.hours)}</div></section>
        <section class="section"><div class="label">備考</div><div class="note">${esc(spot.note)}</div></section>
        <div class="source">情報確認：${esc(spot.checkedAt || UPDATED_AT)}　<a href="${esc(spot.source)}" target="_blank" rel="noopener">公式・参考情報</a></div>
        <a class="back" href="${hrefFor({page:'tourism'})}" data-route="page=tourism">← 観光スポット一覧へ</a>
      </article></main>`;
    bindInternalLinks();
  }

  function renderFood() {
    document.title = '食事スポット一覧｜京都旅行';
    document.body.className = '';

    const links = FOOD_SPOTS.map(s => {
      const tags = s.tags || [];
      const days = (s.days && s.days.length) ? s.days : [];
      const badges = tags.map(t => `<span class="tag">${esc(t)}</span>`).join('') +
        days.map(d => `<span class="day-badge">${esc(d)}</span>`).join('');
      const reservation = s.reservation
        ? `<div class="reservation-summary">予約：${esc(s.reservation)}</div>`
        : '';
      return `<a class="place-link food-card" href="${hrefFor({food:s.id})}" data-route="food=${encodeURIComponent(s.id)}">
        <b>${esc(s.name)}</b><small>${esc(s.category)}</small><span class="meta-row">${badges}</span>${reservation}
      </a>`;
    }).join('');

    app.innerHTML = `
      <main class="wrap"><div class="card">
        <div class="page-nav"><a href="${hrefFor()}" data-route="">← TOP</a></div>
        <div class="eyebrow">KYOTO TRIP</div>
        <h1>食事スポット一覧</h1>
        ${FOOD_SPOTS.length
          ? `<div class="grid">${links}</div>`
          : `<div class="coming-soon"><strong>現在準備中です</strong>食事スポットが決まり次第、こちらに追加します。</div>`}
      </div></main>`;
    bindInternalLinks();
  }

  function renderFoodSpot(spot) {
    document.title = `${spot.name}｜京都旅行`;
    document.body.className = '';
    const tags = (spot.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const dayText = (spot.days && spot.days.length) ? spot.days.join('・') : '';
    const dayBadge = dayText ? `<span class="day-badge">${esc(dayText)}</span>` : '';
    const photo = spot.image
      ? `<figure class="spot-photo"><img src="${esc(spot.image)}" alt="${esc(spot.name)}の画像" loading="eager"></figure>`
      : '';
    const reservation = spot.reservation
      ? `<section class="section reservation-box"><div class="label">予約</div><div class="reservation-details">${esc(spot.reservation)}</div></section>`
      : '';

    app.innerHTML = `
      <main class="wrap"><article class="card">
        <div class="eyebrow">${esc(spot.category)} ｜ KYOTO TRIP</div>
        <h1>${esc(spot.name)}</h1>
        <div class="address">${esc(spot.address)}</div>
        <div class="meta-row">${tags}${dayBadge}</div>
        ${photo}
        <div class="maps">
          <a class="btn apple" href="${esc(appleMapUrl(spot))}" target="_blank" rel="noopener">Appleマップで開く</a>
          <a class="btn google" href="${esc(googleMapUrl(spot))}" target="_blank" rel="noopener">Google Mapsで開く</a>
        </div>
        ${reservation}
        <section class="section"><div class="label">営業時間</div><div class="hours">${esc(spot.hours)}</div></section>
        <section class="section"><div class="label">備考</div><div class="note">${esc(spot.note)}</div></section>
        <div class="source">情報確認：${esc(spot.checkedAt || UPDATED_AT)}　<a href="${esc(spot.source)}" target="_blank" rel="noopener">公式・参考情報</a></div>
        <a class="back" href="${hrefFor({page:'food'})}" data-route="page=food">← 食事スポット一覧へ</a>
      </article></main>`;
    bindInternalLinks();
  }

  function render() {
    const p = new URLSearchParams(window.location.search);
    const spotId = p.get('spot');
    if (spotId) {
      const spot = SPOTS.find(s => s.id === spotId);
      if (spot) return renderSpot(spot);
    }
    const foodId = p.get('food');
    if (foodId) {
      const food = FOOD_SPOTS.find(s => s.id === foodId);
      if (food) return renderFoodSpot(food);
    }
    if (p.get('page') === 'tourism') return renderTourism();
    if (p.get('page') === 'food') return renderFood();
    renderTop();
  }

  window.addEventListener('popstate', render);
  render();
})();
