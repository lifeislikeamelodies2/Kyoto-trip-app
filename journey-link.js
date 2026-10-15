(() => {
  'use strict';

  const DB_NAME = 'kyoto-travel-journal-v1';
  const MAP_APP_URL = 'https://lifeislikeamelodies2.github.io/kyoto-ar-camera/map/';
  const $ = id => document.getElementById(id);

  const validPoint = p =>
    Array.isArray(p) &&
    p.length === 2 &&
    p.every(Number.isFinite) &&
    Math.abs(p[0]) <= 180 &&
    Math.abs(p[1]) <= 85;

  function day(iso) {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '';
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  }

  function distance(a, b) {
    if (!validPoint(a) || !validPoint(b)) return 0;
    const rad = Math.PI / 180;
    const dlat = (b[1] - a[1]) * rad;
    const dlon = (b[0] - a[0]) * rad;
    const h = Math.sin(dlat / 2) ** 2 +
      Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dlon / 2) ** 2;
    return 6371008.8 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
  }

  const lineLength = points =>
    Array.isArray(points)
      ? points.slice(1).reduce((sum, point, i) => sum + distance(points[i], point), 0)
      : 0;

  const routeDistance = route =>
    route?.confirmed === true && Array.isArray(route.segments)
      ? route.segments.reduce((sum, seg) => sum + lineLength(seg.coordinates), 0)
      : 0;

  const formatDistance = meters =>
    meters < 1000 ? Math.round(meters) + ' m' : (meters / 1000).toFixed(1) + ' km';

  function formatDate(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return m ? Number(m[2]) + '月' + Number(m[3]) + '日' : '';
  }

  async function openExistingDatabase() {
    if (!('indexedDB' in window)) return null;

    if (typeof indexedDB.databases === 'function') {
      try {
        const list = await indexedDB.databases();
        if (!list.some(item => item.name === DB_NAME)) return null;
      } catch (_) {}
    }

    return new Promise((resolve, reject) => {
      let created = false;
      const request = indexedDB.open(DB_NAME);
      request.onupgradeneeded = () => {
        created = true;
        request.transaction.abort();
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        if (created || request.error?.name === 'AbortError') resolve(null);
        else reject(request.error);
      };
      request.onblocked = () => resolve(null);
    });
  }

  function getAll(store) {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async function loadSummary() {
    const db = await openExistingDatabase();
    if (!db) return null;

    try {
      if (!db.objectStoreNames.contains('photos') || !db.objectStoreNames.contains('routes')) {
        return null;
      }

      const names = ['photos', 'routes'];
      if (db.objectStoreNames.contains('settings')) names.push('settings');
      const tx = db.transaction(names, 'readonly');

      const photosPromise = getAll(tx.objectStore('photos'));
      const routesPromise = getAll(tx.objectStore('routes'));
      const settingsPromise = names.includes('settings')
        ? getAll(tx.objectStore('settings'))
        : Promise.resolve([]);

      const [photosRaw, routes, settings] = await Promise.all([
        photosPromise,
        routesPromise,
        settingsPromise
      ]);

      const edits = new Map(
        settings
          .filter(item => typeof item?.id === 'string' && item.id.startsWith('photo-details:'))
          .map(item => [item.id.slice('photo-details:'.length), item.changes || {}])
      );
      const photos = photosRaw.map(photo => ({...photo, ...(edits.get(photo.id) || {})}));

      const dates = [
        ...photos.map(photo => day(photo.capturedAt)).filter(Boolean),
        ...routes.map(route => /^\d{4}-\d{2}-\d{2}$/.test(route.date || '') ? route.date : '').filter(Boolean)
      ].sort();

      if (!dates.length) return {empty:true};

      const latestDate = dates.at(-1);
      const dailyPhotos = photos
        .filter(photo => day(photo.capturedAt) === latestDate)
        .sort((a,b) => new Date(a.capturedAt) - new Date(b.capturedAt));
      const dailyRoute = routes.find(route => route.date === latestDate && route.confirmed === true);
      const confirmedRoutes = routes.filter(route => route.confirmed === true);

      return {
        empty:false,
        latestDate,
        photos: dailyPhotos.length,
        pins: dailyPhotos.filter(photo => validPoint(photo.point)).length,
        dailyDistance: dailyRoute ? routeDistance(dailyRoute) : null,
        totalDistance: confirmedRoutes.reduce((sum, route) => sum + routeDistance(route), 0)
      };
    } finally {
      db.close();
    }
  }

  function cardHtml() {
    return `
      <section class="journey-dashboard" id="journeyDashboard" aria-label="旅の記録">
        <div class="journey-summary-card">
          <span class="journey-kicker">TRIP LOG</span>
          <div class="journey-summary-head">
            <strong>旅の道のり</strong>
            <span id="journeySyncState">読込中</span>
          </div>
          <div class="journey-distance-row">
            <b id="journeyDistance">—</b>
            <small id="journeyDate">地図アプリと同期</small>
          </div>
          <div class="journey-meta" id="journeyMeta">写真 —枚　地点 —</div>
          <div class="journey-total" id="journeyTotal">累計 —</div>
        </div>

        <a class="journey-open-card" href="${MAP_APP_URL}" aria-label="旅のしるし 地図アプリを開く">
          <span class="journey-open-kicker">TRAVEL MAP</span>
          <strong>旅のしるし</strong>
          <span class="journey-open-action">地図アプリを開く</span>
          <span class="journey-open-arrow" aria-hidden="true">→</span>
        </a>
      </section>`;
  }

  async function updateSummary() {
    const state = $('journeySyncState');
    if (!state) return;

    try {
      const summary = await loadSummary();
      if (!summary || summary.empty) {
        state.textContent = '記録なし';
        $('journeyDistance').textContent = '—';
        $('journeyDate').textContent = 'まだ道のりは記録されていません';
        $('journeyMeta').textContent = '写真 0枚　地点 0';
        $('journeyTotal').textContent = '累計 0 m';
        return;
      }

      state.textContent = '同期済';
      $('journeyDistance').textContent =
        summary.dailyDistance === null ? '未確定' : formatDistance(summary.dailyDistance);
      $('journeyDate').textContent =
        formatDate(summary.latestDate) + (summary.dailyDistance === null ? '・ルート未保存' : 'の記録');
      $('journeyMeta').textContent =
        '写真 ' + summary.photos + '枚　地点 ' + summary.pins;
      $('journeyTotal').textContent =
        '累計 ' + formatDistance(summary.totalDistance);
    } catch (error) {
      console.warn('Journey summary could not be loaded.', error);
      state.textContent = '未同期';
      $('journeyDistance').textContent = '—';
      $('journeyDate').textContent = '地図アプリを開いて記録を確認';
      $('journeyMeta').textContent = '同じ端末・同じブラウザで連携します';
      $('journeyTotal').textContent = '';
    }
  }

  function mount() {
    const top = document.querySelector('.top-shell');
    const dashboard = document.querySelector('.top-dashboard');
    if (!top || !dashboard || $('journeyDashboard')) return;
    dashboard.insertAdjacentHTML('afterend', cardHtml());
    updateSummary();
  }

  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(mount).observe(app, {childList:true, subtree:true});
  mount();

  window.addEventListener('pageshow', () => {
    if ($('journeyDashboard')) updateSummary();
  });
})();
