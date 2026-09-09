(() => {
  const app = document.getElementById('app');

  const esc = (value) => String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');

  const mapQuery = (spot) => encodeURIComponent(`${spot.name} ${spot.address}`);
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

  function renderTop() {
    document.title = '京都旅行';
    document.body.className = 'top-page';
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
      const badges = tags.map(t => `<span class="tag">${esc(t)}</span>`).join('') +
        days.map(d => `<span class="day-badge">${esc(d)}</span>`).join('');
      return `<a class="place-link spot-card" href="${hrefFor({spot:s.id})}" data-route="spot=${encodeURIComponent(s.id)}" data-tags="${esc(tags.join('|'))}" data-days="${esc(days.join('|'))}">
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
    const tags = (spot.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const dayText = (spot.days && spot.days.length) ? spot.days.join('・') : '日程未定';
    app.innerHTML = `
      <main class="wrap"><article class="card">
        <div class="eyebrow">${esc(spot.category)} ｜ KYOTO TRIP</div>
        <h1>${esc(spot.name)}</h1>
        <div class="address">${esc(spot.address)}</div>
        <div class="meta-row">${tags}<span class="day-badge">${esc(dayText)}</span></div>
        <div class="maps">
          <a class="btn apple" href="${esc(appleMapUrl(spot))}" target="_blank" rel="noopener">Appleマップで開く</a>
          <a class="btn google" href="${esc(googleMapUrl(spot))}" target="_blank" rel="noopener">Google Mapsで開く</a>
        </div>
        <section class="section"><div class="label">営業時間・参拝可能時間</div><div class="hours">${esc(spot.hours)}</div></section>
        <section class="section"><div class="label">備考</div><div class="note">${esc(spot.note)}</div></section>
        <div class="source">情報確認：${esc(UPDATED_AT)}　<a href="${esc(spot.source)}" target="_blank" rel="noopener">公式・参考情報</a></div>
        <a class="back" href="${hrefFor({page:'tourism'})}" data-route="page=tourism">← 観光スポット一覧へ</a>
      </article></main>`;
    bindInternalLinks();
  }

  function renderFood() {
    document.title = '食事スポット一覧｜京都旅行';
    document.body.className = '';
    if (!FOOD_SPOTS.length) {
      app.innerHTML = `
        <main class="wrap"><div class="card">
          <div class="page-nav"><a href="${hrefFor()}" data-route="">← TOP</a></div>
          <div class="eyebrow">KYOTO TRIP</div>
          <h1>食事スポット一覧</h1>
          <div class="coming-soon"><strong>現在準備中です</strong>食事スポットが決まり次第、こちらに追加します。</div>
        </div></main>`;
    } else {
      app.innerHTML = `
        <main class="wrap"><div class="card">
          <div class="page-nav"><a href="${hrefFor()}" data-route="">← TOP</a></div>
          <div class="eyebrow">KYOTO TRIP</div>
          <h1>食事スポット一覧</h1>
          <div class="grid">${FOOD_SPOTS.map(s => `<div class="place-link"><b>${esc(s.name || '')}</b></div>`).join('')}</div>
        </div></main>`;
    }
    bindInternalLinks();
  }

  function render() {
    const p = new URLSearchParams(window.location.search);
    const spotId = p.get('spot');
    if (spotId) {
      const spot = SPOTS.find(s => s.id === spotId);
      if (spot) return renderSpot(spot);
    }
    if (p.get('page') === 'tourism') return renderTourism();
    if (p.get('page') === 'food') return renderFood();
    renderTop();
  }

  window.addEventListener('popstate', render);
  render();
})();
