from pathlib import Path
import json
import re

DATA = Path('data.js')
APP = Path('app.js')
CSS = Path('style.css')

# ---------- data.js ----------
text = DATA.read_text(encoding='utf-8')
m = re.search(r"const FOOD_SPOTS = (\[.*?\]);\s*const SPOTS = (\[.*\]);\s*$", text, re.S)
if not m:
    raise SystemExit('FOOD_SPOTS/SPOTS arrays not found')

spots = json.loads(m.group(2))
prefix = text[:m.start()]
prefix = re.sub(r"const UPDATED_AT = '[^']+';", "const UPDATED_AT = '2026-09-09';", prefix, count=1)

for s in spots:
    sid = s.get('id')
    if sid == 'pontocho':
        s['tags'] = ['長州', '花街', '創作']
    elif sid == 'shimabara':
        # 島原は史跡として新選組にも関係するため歴史側のタグは残す。
        s['tags'] = ['新選組', '長州', '花街', '創作']
    elif sid in ('fujii-home', 'saeki-home'):
        s['tags'] = ['新選組', '長州', '創作']

new_spots = [
    {
        'id': 'honma-seiichiro',
        'name': '本間精一郎遭難地',
        'address': '京都府京都市中京区 木屋町通四条上る1丁目（紙屋町・下樵木町付近）',
        'category': '土佐・事件地',
        'hours': '屋外史跡のため見学時間の設定なし。周辺は繁華街のため、通行の妨げにならないよう配慮して見学。',
        'note': '文久2年（1862）閏8月20日夜、勤王の志士・本間精一郎が先斗町からの帰途、この付近で襲撃され斬殺された。京都市公式案内では、本間は南側の瓢箪露路から木屋町へ逃れようとしたところを挟み撃ちにされたとされる。\n\n実行者については諸説あるが、岡田以蔵が下手人の一人とされる説があり、以蔵ゆかりの事件地としても語られる。実行犯の構成には史料・伝承上の幅があるため、アプリでは「岡田以蔵が下手人とされる説のある事件地」として扱う。',
        'source': 'https://ja.kyoto.travel/tourism/single02.php?category_id=9&tourism_id=201',
        'tags': ['土佐', '事件地'],
        'days': [],
        'checkedAt': '2026-09-09',
        'mapQuery': '本間精一郎遭難地 京都市中京区木屋町通四条上る'
    },
    {
        'id': 'asa-former-home',
        'name': '麻・元婚家候補地（二条東洞院西入）',
        'address': '京都府京都市中京区 二条通東洞院西入仁王門町周辺',
        'category': '土佐・創作',
        'hours': '一般の市街地のため終日通行可。住宅・事業所があるため、周囲の生活環境に配慮して散策。',
        'note': '元治元年（1864）頃、岡田以蔵は「二条東洞院西入」の商家・幸次郎方へ押し入り、金銭を「押借」しようとした件で捕縛されたとされる。史料では糸商を営む幸次郎方とされるが、現在の特定の建物を事件現場として示すものではない。\n\n【創作設定】麻が以前嫁いでいた商家を、この二条東洞院西入の一帯に想定する。創作上では、麻の元婚家を以蔵の押借事件に巻き込まれた商家、あるいはその近隣の商家として設定する。婚家で過ごした麻の過去と、後に岡田以蔵の捕縛へつながる事件が同じ街区に重なる場所。\n\n※麻および元婚家は創作上の人物・設定であり、現在の特定の住宅・商店を示すものではない。',
        'source': 'https://www.kuwana-shakyo.com/cmsfiles/contents/0000000/724/matudairasadaaki-2-6.pdf',
        'tags': ['土佐', '創作'],
        'days': [],
        'checkedAt': '2026-09-09',
        'mapQuery': '京都市中京区二条通東洞院西入仁王門町'
    },
    {
        'id': 'asa-home',
        'name': '麻 現在の家候補地（木屋町通五条上る）',
        'address': '京都府京都市下京区 木屋町通五条上る下材木町周辺',
        'category': '土佐・創作',
        'hours': '一般の住宅地・市街地のため終日通行可。実在する個人宅を目的地として扱わず、周辺住民に配慮して散策。',
        'note': '【創作設定】元婚家を離れた麻が現在暮らしている家を、木屋町通五条上る・高瀬川沿いの一帯に想定する。繁華な三条・四条界隈からはやや南へ離れながらも、高瀬川と木屋町通を通じて洛中へ出やすい場所である。\n\nかつて商家の家人として暮らしていた二条東洞院の生活とは異なり、ここは麻自身が選び直した生活の拠点。実在する特定の家屋ではなく、下材木町周辺の街区を創作上の候補地とする。',
        'source': 'https://mapfan.com/addresses/26/106/192F01',
        'tags': ['土佐', '創作'],
        'days': [],
        'checkedAt': '2026-09-09',
        'mapQuery': '京都市下京区木屋町通五条上る下材木町'
    },
    {
        'id': 'omiya-site',
        'name': '坂本龍馬・中岡慎太郎遭難之地（近江屋跡）',
        'address': '京都府京都市中京区 河原町蛸薬師下る塩屋町',
        'category': '土佐・事件地',
        'hours': '屋外史跡のため見学時間の設定なし。河原町通沿いのため、通行の妨げにならないよう配慮して見学。',
        'note': '慶応3年（1867）11月15日、土佐藩海援隊長・坂本龍馬と陸援隊長・中岡慎太郎が、醤油商・近江屋で刺客の襲撃を受けた地。龍馬はその場で絶命し、中岡も2日後に死去した。現在、近江屋の建物は残っておらず、河原町通沿いに「坂本龍馬中岡慎太郎遭難之地」の碑が立つ。\n\n実行犯については諸説あるが、京都市の龍馬関連案内では京都見廻組説が有力と紹介されている。',
        'source': 'https://ja.kyoto.travel/tourism/single02.php?category_id=9&tourism_id=2130',
        'tags': ['土佐', '事件地'],
        'days': [],
        'checkedAt': '2026-09-09',
        'mapQuery': '坂本龍馬中岡慎太郎遭難之地 京都市中京区塩屋町'
    },
]
new_ids = {s['id'] for s in new_spots}
spots = [s for s in spots if s.get('id') not in new_ids]
lodging = [s for s in spots if s.get('id') == 'matsubaya']
spots = [s for s in spots if s.get('id') != 'matsubaya'] + new_spots + lodging

foods = [
    {
        'id': 'tomizuki',
        'name': '冨月',
        'address': '京都府京都市東山区祇園町南側 八坂町570-8',
        'category': 'おやつ・甘味',
        'hours': '火〜土 11:00〜17:00（L.O.16:30）／日・祝 11:00〜19:00（L.O.18:00）／月曜定休。営業時間・定休日は変更の場合があるため来店前に確認。',
        'note': '祇園散策中のおやつ候補。甘味・喫茶利用を想定。祇園四条駅から約353m。食べログ掲載では予約不可、予算目安1,000〜1,999円。画像は後日追加予定。',
        'source': 'https://tabelog.com/kyoto/A2601/A260301/26013095/',
        'tags': ['おやつ', '祇園'],
        'days': [],
        'checkedAt': '2026-09-09',
        'mapQuery': '冨月 京都市東山区祇園町南側 八坂町570-8'
    },
    {
        'id': 'ikedaya-hananomai',
        'name': '個室居酒屋 池田屋 はなの舞 京都三条河原町店',
        'address': '〒604-8004 京都府京都市中京区三条通河原町東入中島町82 申和三条ビル',
        'category': '夕食・新選組',
        'hours': '月〜金 15:00〜23:00／土・日・祝 11:30〜23:00／年中無休。臨時変更は公式サイトで確認。',
        'note': '池田屋事件の跡地にある新選組テーマの居酒屋。店内には「池田屋大階段」「新選組の隊旗」「帳場」などの撮影スポットがある。画像は後日追加予定。',
        'source': 'https://izakaya-hananomai.com/ikedaya/',
        'tags': ['新選組', '夕食', '予約済'],
        'days': ['1日目'],
        'reservation': '2026年12月4日 18:30（公式Webより予約済）',
        'checkedAt': '2026-09-09',
        'mapQuery': '個室居酒屋 池田屋 はなの舞 京都三条河原町店'
    }
]

DATA.write_text(
    prefix
    + 'const FOOD_SPOTS = ' + json.dumps(foods, ensure_ascii=False, separators=(',', ':')) + ';\n'
    + 'const SPOTS = ' + json.dumps(spots, ensure_ascii=False, separators=(',', ':')) + ';\n',
    encoding='utf-8'
)

# ---------- app.js ----------
app = APP.read_text(encoding='utf-8')
app = app.replace(
    "const mapQuery = (spot) => encodeURIComponent(`${spot.name} ${spot.address}`);",
    "const mapQuery = (spot) => encodeURIComponent(spot.mapQuery || `${spot.name} ${spot.address}`);"
)
app = app.replace(
    "const badges = tags.map(t => `<span class=\"tag\">${esc(t)}</span>`).join('') +",
    "const badges = tags.map(t => `<span class=\"tag${t === '創作' ? ' creative' : ''}\">${esc(t)}</span>`).join('') +"
)

new_food = r'''  function renderFood() {
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
      ? `<section class="section reservation-box"><div class="label">予約</div><div class="hours">${esc(spot.reservation)}</div></section>`
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

'''
app, n = re.subn(r"  function renderFood\(\) \{.*?\n  \}\n\n(?=  function render\(\))", new_food, app, flags=re.S)
if n != 1:
    raise SystemExit(f'renderFood replacement failed: {n}')

needle = "    const spotId = p.get('spot');\n    if (spotId) {\n      const spot = SPOTS.find(s => s.id === spotId);\n      if (spot) return renderSpot(spot);\n    }\n"
replacement = needle + "    const foodId = p.get('food');\n    if (foodId) {\n      const food = FOOD_SPOTS.find(s => s.id === foodId);\n      if (food) return renderFoodSpot(food);\n    }\n"
if needle not in app:
    raise SystemExit('render route marker not found')
app = app.replace(needle, replacement, 1)
APP.write_text(app, encoding='utf-8')

# ---------- style.css ----------
css = CSS.read_text(encoding='utf-8')
if '.reservation-summary{' not in css:
    css += "\n.reservation-summary{margin-top:8px;padding:9px 11px;border-radius:10px;background:#f5eee3;color:var(--accent);font-size:12px;font-weight:800}\n.reservation-box{background:#fffaf1;border:1px solid #eadcc6;border-radius:14px;padding:14px 16px;margin-top:18px}\n.food-card .meta-row{margin-bottom:4px}\n"
CSS.write_text(css, encoding='utf-8')
