(() => {
  const GALLERIES = {
    kamishichiken: [
      { src: 'assets/spots/kamishichiken-02.webp', alt: '上七軒・上七軒歌舞練場の画像' }
    ],
    daikakuji: [
      { src: 'assets/spots/daikakuji.jpg', alt: '大覚寺の画像' },
      { src: 'assets/spots/daikakuji-chiruran.webp', alt: '大覚寺の画像（ちるらん公式サイト掲載）', credit: '出典：ちるらん公式サイト' }
    ]
  };

  const currentSpotId = () => new URLSearchParams(window.location.search).get('spot') || '';

  function buildGallery(spotId, images) {
    const gallery = document.createElement('figure');
    gallery.className = 'spot-gallery';
    gallery.dataset.galleryFor = spotId;

    const viewport = document.createElement('div');
    viewport.className = 'spot-gallery-viewport';
    const track = document.createElement('div');
    track.className = 'spot-gallery-track';

    images.forEach((item, index) => {
      const slide = document.createElement('div');
      slide.className = 'spot-gallery-slide';
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      slide.appendChild(img);
      if (item.credit) {
        const credit = document.createElement('div');
        credit.className = 'spot-gallery-credit';
        credit.textContent = item.credit;
        slide.appendChild(credit);
      }
      track.appendChild(slide);
    });

    viewport.appendChild(track);
    gallery.appendChild(viewport);

    if (images.length > 1) {
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'spot-gallery-nav prev';
      prev.setAttribute('aria-label', '前の画像');
      prev.textContent = '‹';
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'spot-gallery-nav next';
      next.setAttribute('aria-label', '次の画像');
      next.textContent = '›';
      viewport.appendChild(prev);
      viewport.appendChild(next);

      const footer = document.createElement('div');
      footer.className = 'spot-gallery-footer';
      const dots = document.createElement('div');
      dots.className = 'spot-gallery-dots';
      const counter = document.createElement('span');
      counter.className = 'spot-gallery-counter';
      counter.textContent = `1 / ${images.length}`;

      const dotButtons = images.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `spot-gallery-dot${index === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `${index + 1}枚目の画像`);
        dot.addEventListener('click', () => track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' }));
        dots.appendChild(dot);
        return dot;
      });

      footer.appendChild(dots);
      footer.appendChild(counter);
      gallery.appendChild(footer);

      const move = (delta) => {
        const width = track.clientWidth || 1;
        const current = Math.round(track.scrollLeft / width);
        const target = (current + delta + images.length) % images.length;
        track.scrollTo({ left: width * target, behavior: 'smooth' });
      };
      prev.addEventListener('click', () => move(-1));
      next.addEventListener('click', () => move(1));

      let ticking = false;
      track.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const width = track.clientWidth || 1;
          const index = Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / width)));
          dotButtons.forEach((dot, i) => dot.classList.toggle('active', i === index));
          counter.textContent = `${index + 1} / ${images.length}`;
          ticking = false;
        });
      }, { passive: true });
    }

    return gallery;
  }

  function enhanceSpotGallery() {
    const spotId = currentSpotId();
    const images = GALLERIES[spotId];
    if (!images || !images.length) return;
    const article = document.querySelector('main.wrap article.card');
    if (!article || article.querySelector(`.spot-gallery[data-gallery-for="${spotId}"]`)) return;
    const gallery = buildGallery(spotId, images);
    const existingPhoto = article.querySelector('.spot-photo');
    const maps = article.querySelector('.maps');
    if (existingPhoto) existingPhoto.replaceWith(gallery);
    else if (maps) maps.before(gallery);
  }

  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(enhanceSpotGallery).observe(app, { childList: true, subtree: true });
  enhanceSpotGallery();
})();
