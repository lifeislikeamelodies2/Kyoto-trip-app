// Add itinerary spots and normalize tourism tags to the current eight-category system.
(() => {
  const TAG_ORDER = ['新撰組', '長州', '土佐', '会津', '一般観光地', '事件地', '創作関連', '宿泊'];

  const upsertSpot = (spot) => {
    const index = SPOTS.findIndex((item) => item.id === spot.id);
    if (index >= 0) {
      SPOTS[index] = { ...SPOTS[index], ...spot };
    } else {
      SPOTS.push(spot);
    }
  };

  upsertSpot({
    id: 'yagi-house',
    name: '壬生屯所旧跡・八木家',
    address: '〒604-8821 京都府京都市中京区壬生梛ノ宮町24',
    category: '新撰組・史跡',
    hours: '9:00〜17:00（公式案内では最終受付16:00）。臨時休止の場合があるため当日公式サイトを確認。',
    note: '新撰組発祥の地として知られる壬生屯所旧跡。文久3年（1863）に浪士組の一部が壬生に残り、八木家を屯所として活動を始めた。芹沢鴨らが暗殺された場所でもあり、奥座敷の鴨居にはその際のものと伝わる刀傷が残る。現在は京都市指定有形文化財で、見学ではガイド案内のほか、抹茶と屯所餅が付く拝観プランもある。今回の工程では壬生寺の後、14:00開始のガイドを基準に訪問する。',
    source: 'https://www.mibu-yagike.jp/info/index.html',
    tags: ['新撰組', '事件地'],
    days: ['1日目'],
    checkedAt: '2026-09-14',
    mapQuery: '壬生屯所旧跡 八木家 京都'
  });

  upsertSpot({
    id: 'kamishichiken',
    name: '上七軒・上七軒歌舞練場',
    address: '京都府京都市上京区今出川通七本松西入真盛町742周辺',
    category: '一般観光地・花街',
    hours: '上七軒の街並みは散策可。上七軒歌舞練場の一般入場可否・催事時間は時期により異なるため、訪問時は公式案内を確認。',
    note: '北野天満宮の東側に広がる、京都五花街の一つ。今回の工程では北野天満宮の参拝後に短時間立ち寄り、花街の街並みを見る予定。上七軒歌舞練場は映画『国宝』（2025年）のロケ地でもあり、京都市メディア支援センターによれば、劇中の「浪花座」の舞台袖・舞台として使用され、喜久雄たち役者の稽古風景や、『曽根崎心中』上演中の喜久雄を俊介と春江が客席から見つめる場面などが撮影された。',
    source: 'https://ja.kyoto.travel/support/film/tourisms/film_detail/273/free',
    tags: ['一般観光地'],
    days: ['1日目'],
    checkedAt: '2026-09-14',
    mapQuery: '上七軒歌舞練場 京都'
  });

  const normalizeTags = (spot) => {
    const raw = new Set(spot.tags || []);
    const normalized = [];
    const add = (tag) => {
      if (!normalized.includes(tag)) normalized.push(tag);
    };

    if (raw.has('新撰組') || raw.has('新選組')) add('新撰組');
    if (raw.has('長州')) add('長州');
    if (raw.has('土佐')) add('土佐');
    if (raw.has('会津')) add('会津');
    if (raw.has('一般観光地') || raw.has('一般観光')) add('一般観光地');
    if (raw.has('事件地') || raw.has('禁門の変')) add('事件地');
    if (raw.has('創作関連')) add('創作関連');
    if (raw.has('宿泊')) add('宿泊');

    spot.tags = TAG_ORDER.filter((tag) => normalized.includes(tag));
  };

  SPOTS.forEach(normalizeTags);

  // Filter buttons are ordered with CSS instead of repeatedly moving DOM nodes.
  // The previous MutationObserver-based reordering could trigger itself continuously
  // and make the page extremely slow or unresponsive on mobile Safari.
  const style = document.createElement('style');
  style.id = 'tourism-tag-order';
  style.textContent = `
    .filter-btn[data-filter-type="tag"][data-value="すべて"] { order: 0; }
    .filter-btn[data-filter-type="tag"][data-value="新撰組"] { order: 1; }
    .filter-btn[data-filter-type="tag"][data-value="長州"] { order: 2; }
    .filter-btn[data-filter-type="tag"][data-value="土佐"] { order: 3; }
    .filter-btn[data-filter-type="tag"][data-value="会津"] { order: 4; }
    .filter-btn[data-filter-type="tag"][data-value="一般観光地"] { order: 5; }
    .filter-btn[data-filter-type="tag"][data-value="事件地"] { order: 6; }
    .filter-btn[data-filter-type="tag"][data-value="創作関連"] { order: 7; }
    .filter-btn[data-filter-type="tag"][data-value="宿泊"] { order: 8; }
  `;
  document.head.appendChild(style);
})();
