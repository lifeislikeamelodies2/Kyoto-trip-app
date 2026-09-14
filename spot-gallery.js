(() => {
  const GALLERIES = {
    kamishichiken: [
      { src: 'assets/spots/kamishichiken-02.avif', alt: '上七軒・上七軒歌舞練場の画像' }
    ],
    daikakuji: [
      { src: 'assets/spots/daikakuji.jpg', alt: '大覚寺の画像' },
      { src: 'assets/spots/daikakuji-02.avif', alt: '大覚寺の境内・建物の画像' }
    ]
  };

  const AUTOPLAY_MS = 5000;
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
      const footer = document.createElement('div');
      footer.className = 'spot-gallery-footer';
      const dots = document.createElement('div');
      dots.className = 'spot-gallery-dots';
      dots.setAttribute('aria-label', '画像の選択');

      const dotButtons = images.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `spot-gallery-dot${index === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `${index + 1}枚目の画像`);
        dots.appendChild(dot);
        return dot;
      });

      footer.appendChild(dots);
      gallery.appendChild(footer);

      const getIndex = () => {
        const width = track.clientWidth || 1;
        return Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / width)));
      };

      const goTo = (index, behavior = 'smooth') => {
        const target = (index + images.length) % images.length;
        track.scrollTo({ left: track.clientWidth * target, behavior });
      };

      const updateDots = () => {
        const index = getIndex();
        dotButtons.forEach((dot, i) => dot.classList.toggle('active', i === index));
      };

      let timer = null;
      const stopAutoplay = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };
      const startAutoplay = () => {
        stopAutoplay();
        timer = setInterval(() => {
          if (!gallery.isConnected) {
            stopAutoplay();
            return;
          }
          if (document.hidden) return;
          goTo(getIndex() + 1);
        }, AUTOPLAY_MS);
      };
      const restartAutoplay = () => startAutoplay();

      dotButtons.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          goTo(index);
          restartAutoplay();
        });
      });

      let ticking = false;
      track.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          updateDots();
          ticking = false;
        });
      }, { passive: true });

      track.addEventListener('touchstart', stopAutoplay, { passive: true });
      track.addEventListener('touchend', restartAutoplay, { passive: true });
      track.addEventListener('pointerdown', stopAutoplay, { passive: true });
      track.addEventListener('pointerup', restartAutoplay, { passive: true });

      startAutoplay();
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
