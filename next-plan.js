(() => {
  'use strict';

  // 出発前テスト用：修正版A案の1日目・2日目を 2026/11/6・11/7 に移し、
  // 11/8 は「予定なし」の終了状態を確認する3日目として扱います。
  const TEST_RANGE = {
    start: '2026-11-06T00:00:00+09:00',
    end: '2026-11-08T23:59:59+09:00'
  };

  const PLANS = [
    {
        "day": 1,
        "title": "京都駅 集合",
        "startAt": "2026-11-06T07:30:00+09:00",
        "moveAt": null,
        "mapQuery": "京都駅"
    },
    {
        "day": 1,
        "title": "湯の宿 松栄｜荷物預け",
        "startAt": "2026-11-06T07:40:00+09:00",
        "moveAt": "2026-11-06T07:30:00+09:00",
        "mapQuery": "湯の宿 松栄 京都"
    },
    {
        "day": 1,
        "title": "大覚寺",
        "startAt": "2026-11-06T09:00:00+09:00",
        "moveAt": "2026-11-06T08:10:00+09:00",
        "mapQuery": "大覚寺 京都"
    },
    {
        "day": 1,
        "title": "北野天満宮",
        "startAt": "2026-11-06T10:25:00+09:00",
        "moveAt": "2026-11-06T10:00:00+09:00",
        "mapQuery": "北野天満宮 京都"
    },
    {
        "day": 1,
        "title": "上七軒",
        "startAt": "2026-11-06T11:10:00+09:00",
        "moveAt": "2026-11-06T11:10:00+09:00",
        "mapQuery": "上七軒 京都"
    },
    {
        "day": 1,
        "title": "昼食｜上七軒・千本今出川周辺",
        "startAt": "2026-11-06T11:15:00+09:00",
        "moveAt": "2026-11-06T11:15:00+09:00",
        "mapQuery": "千本今出川 京都"
    },
    {
        "day": 1,
        "title": "朱雀門跡・千本通周辺",
        "startAt": "2026-11-06T13:05:00+09:00",
        "moveAt": "2026-11-06T12:45:00+09:00",
        "mapQuery": "朱雀門跡 京都"
    },
    {
        "day": 1,
        "title": "壬生寺・壬生塚・歴史資料室",
        "startAt": "2026-11-06T13:25:00+09:00",
        "moveAt": "2026-11-06T13:10:00+09:00",
        "mapQuery": "壬生寺 京都"
    },
    {
        "day": 1,
        "title": "壬生屯所旧跡・八木家",
        "startAt": "2026-11-06T14:00:00+09:00",
        "moveAt": "2026-11-06T13:55:00+09:00",
        "mapQuery": "壬生屯所旧跡 八木家 京都"
    },
    {
        "day": 1,
        "title": "佐伯・由起緒 借家候補地",
        "startAt": "2026-11-06T15:00:00+09:00",
        "moveAt": "2026-11-06T15:00:00+09:00",
        "mapQuery": "京都市中京区壬生賀陽御所町 壬生坊城町"
    },
    {
        "day": 1,
        "title": "西本願寺",
        "startAt": "2026-11-06T15:35:00+09:00",
        "moveAt": "2026-11-06T15:12:00+09:00",
        "mapQuery": "西本願寺 京都"
    },
    {
        "day": 1,
        "title": "湯の宿 松栄｜チェックイン・休憩",
        "startAt": "2026-11-06T16:30:00+09:00",
        "moveAt": "2026-11-06T16:05:00+09:00",
        "mapQuery": "湯の宿 松栄 京都"
    },
    {
        "day": 1,
        "title": "長州藩邸跡・桂小五郎像",
        "startAt": "2026-11-06T17:50:00+09:00",
        "moveAt": "2026-11-06T17:15:00+09:00",
        "mapQuery": "長州藩邸跡 桂小五郎像 京都"
    },
    {
        "day": 1,
        "title": "個室居酒屋 池田屋 はなの舞 京都三条河原町店｜公式Web予約済",
        "startAt": "2026-11-06T18:30:00+09:00",
        "moveAt": "2026-11-06T18:05:00+09:00",
        "mapQuery": "個室居酒屋 池田屋 はなの舞 京都三条河原町店"
    },
    {
        "day": 1,
        "title": "東本願寺｜夜間拝観（A案テスト）",
        "startAt": "2026-11-06T20:15:00+09:00",
        "moveAt": "2026-11-06T19:50:00+09:00",
        "mapQuery": "東本願寺 京都"
    },
    {
        "day": 1,
        "title": "渉成園",
        "startAt": "2026-11-06T20:55:00+09:00",
        "moveAt": "2026-11-06T20:50:00+09:00",
        "mapQuery": "渉成園 京都"
    },
    {
        "day": 1,
        "title": "湯の宿 松栄｜宿へ戻る",
        "startAt": "2026-11-06T21:50:00+09:00",
        "moveAt": "2026-11-06T21:25:00+09:00",
        "mapQuery": "湯の宿 松栄 京都"
    },
    {
        "day": 2,
        "title": "朝食｜湯の宿 松栄",
        "startAt": "2026-11-07T07:00:00+09:00",
        "moveAt": null,
        "mapQuery": "湯の宿 松栄 京都"
    },
    {
        "day": 2,
        "title": "金戒光明寺｜境内・会津関連",
        "startAt": "2026-11-07T08:25:00+09:00",
        "moveAt": "2026-11-07T08:00:00+09:00",
        "mapQuery": "金戒光明寺 京都"
    },
    {
        "day": 2,
        "title": "金戒光明寺｜御朱印等",
        "startAt": "2026-11-07T09:00:00+09:00",
        "moveAt": "2026-11-07T09:00:00+09:00",
        "mapQuery": "金戒光明寺 京都"
    },
    {
        "day": 2,
        "title": "京都霊山護国神社",
        "startAt": "2026-11-07T09:50:00+09:00",
        "moveAt": "2026-11-07T09:35:00+09:00",
        "mapQuery": "京都霊山護国神社"
    },
    {
        "day": 2,
        "title": "坂本龍馬・中岡慎太郎遭難之地（近江屋跡）",
        "startAt": "2026-11-07T10:45:00+09:00",
        "moveAt": "2026-11-07T10:30:00+09:00",
        "mapQuery": "近江屋跡 京都"
    },
    {
        "day": 2,
        "title": "本間精一郎遭難地",
        "startAt": "2026-11-07T11:05:00+09:00",
        "moveAt": "2026-11-07T10:55:00+09:00",
        "mapQuery": "本間精一郎遭難地 京都"
    },
    {
        "day": 2,
        "title": "麻 現在の家候補地",
        "startAt": "2026-11-07T11:30:00+09:00",
        "moveAt": "2026-11-07T11:15:00+09:00",
        "mapQuery": "木屋町通五条上る 高瀬川 京都"
    },
    {
        "day": 2,
        "title": "昼食｜木屋町・河原町周辺",
        "startAt": "2026-11-07T11:40:00+09:00",
        "moveAt": "2026-11-07T11:40:00+09:00",
        "mapQuery": "木屋町 河原町 京都"
    },
    {
        "day": 2,
        "title": "角屋｜1階見学（間に合えば）",
        "startAt": "2026-11-07T13:30:00+09:00",
        "moveAt": "2026-11-07T13:10:00+09:00",
        "mapQuery": "角屋もてなしの文化美術館 京都"
    },
    {
        "day": 2,
        "title": "角屋｜14:10集合",
        "startAt": "2026-11-07T14:10:00+09:00",
        "moveAt": "2026-11-07T14:00:00+09:00",
        "mapQuery": "角屋もてなしの文化美術館 京都"
    },
    {
        "day": 2,
        "title": "角屋もてなしの文化美術館｜予約見学",
        "startAt": "2026-11-07T14:15:00+09:00",
        "moveAt": "2026-11-07T14:10:00+09:00",
        "mapQuery": "角屋もてなしの文化美術館 京都"
    },
    {
        "day": 2,
        "title": "麻・元婚家候補地",
        "startAt": "2026-11-07T15:55:00+09:00",
        "moveAt": "2026-11-07T15:25:00+09:00",
        "mapQuery": "京都市中京区二条通東洞院西入仁王門町"
    },
    {
        "day": 2,
        "title": "藤井家候補地",
        "startAt": "2026-11-07T16:20:00+09:00",
        "moveAt": "2026-11-07T16:05:00+09:00",
        "mapQuery": "新町通丸太町下る 京都"
    },
    {
        "day": 2,
        "title": "蛤御門",
        "startAt": "2026-11-07T16:40:00+09:00",
        "moveAt": "2026-11-07T16:30:00+09:00",
        "mapQuery": "蛤御門 京都御苑"
    },
    {
        "day": 2,
        "title": "京都御苑内を移動",
        "startAt": "2026-11-07T16:55:00+09:00",
        "moveAt": "2026-11-07T16:55:00+09:00",
        "mapQuery": "京都御苑"
    },
    {
        "day": 2,
        "title": "鷹司邸跡",
        "startAt": "2026-11-07T17:15:00+09:00",
        "moveAt": "2026-11-07T16:55:00+09:00",
        "mapQuery": "鷹司邸跡 京都御苑"
    },
    {
        "day": 2,
        "title": "先斗町 すいしん 本店へ移動",
        "startAt": "2026-11-07T18:05:00+09:00",
        "moveAt": "2026-11-07T17:30:00+09:00",
        "mapQuery": "先斗町 すいしん 本店 京都"
    },
    {
        "day": 2,
        "title": "先斗町 すいしん 本店｜予約（6,050円／人）",
        "startAt": "2026-11-07T18:30:00+09:00",
        "moveAt": "2026-11-07T18:05:00+09:00",
        "mapQuery": "先斗町 すいしん 本店 京都"
    },
    {
        "day": 2,
        "title": "島原 夜散策",
        "startAt": "2026-11-07T20:30:00+09:00",
        "moveAt": "2026-11-07T20:00:00+09:00",
        "mapQuery": "島原 京都"
    },
    {
        "day": 2,
        "title": "湯の宿 松栄｜宿へ戻る",
        "startAt": "2026-11-07T21:15:00+09:00",
        "moveAt": "2026-11-07T21:00:00+09:00",
        "mapQuery": "湯の宿 松栄 京都"
    }
];


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


    if (next) {
      return { kind: 'plan', plan: next };
    }

    if (dayKey === '2026-11-08' && nowMs >= testStart && nowMs <= testEnd) {
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
          <span class="next-plan-temp">A案テスト ${esc(formatDate(plan.startAt))}・${esc(plan.day)}日目</span>
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


    if (state.kind === 'empty-day3') {
      card.innerHTML = `
        <div class="next-plan-head">
          <span class="next-plan-label">次の予定</span>
          <span class="next-plan-temp">A案テスト 11/8・3日目</span>
        </div>
        <div class="next-plan-title">1日目・2日目のテスト日程は終了しました</div>
        <div class="plan-compact-grid">
          <div class="plan-compact-row"><span class="plan-key">状態</span><b>予定なし</b><span class="plan-count-label">テスト確認</span><strong>完了状態</strong></div>
        </div>
        <div class="next-map-row"><span class="disabled">Map</span><span class="disabled">Google Map</span></div>`;
      return;
    }

    card.innerHTML = `
      <div class="next-plan-head">
        <span class="next-plan-label">次の予定</span>
        <span class="next-plan-temp">A案テスト終了</span>
      </div>
      <div class="next-plan-title">11/6〜11/8 のA案テスト日程は終了しました</div>
      <div class="plan-compact-grid">
        <div class="plan-compact-row"><span class="plan-key">状態</span><b>終了</b><span class="plan-count-label">本番日程</span><strong>未切替</strong></div>
      </div>
      <div class="next-map-row"><span class="disabled">Map</span><span class="disabled">Google Map</span></div>`;
  };

  const app = document.getElementById('app');
  if (!app) return;

  const observer = new MutationObserver(() => renderCard());
  observer.observe(app, { childList: true });

  renderCard();
  window.setInterval(renderCard, 5000);
})();
