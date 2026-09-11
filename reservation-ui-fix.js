(() => {
  const style = document.createElement('style');
  style.textContent = `
    .top-button.reservation{
      background:var(--accent)!important;
      color:#fff!important;
      border-color:var(--accent)!important;
    }
    .reservation-list-time{display:none!important;}
    .reservation-spot-name{
      display:block;
      font-size:19px;
      line-height:1.45;
      margin-bottom:2px;
    }
    .reservation-list-summary strong{
      display:grid;
      gap:2px;
      font-size:14px;
      line-height:1.5;
    }
    .reservation-list-datetime{
      display:block;
      font-size:16px;
      font-weight:900;
      color:var(--accent);
      font-variant-numeric:tabular-nums;
    }
    .reservation-list-note{
      display:block;
      font-size:13px;
      font-weight:800;
    }
  `;
  document.head.appendChild(style);

  const applyReservationUi = () => {
    document.querySelectorAll('.top-button.reservation').forEach(button => {
      button.classList.add('primary');
    });

    document.querySelectorAll('.reservation-list-card').forEach(card => {
      const name = card.querySelector('b');
      if (name) name.classList.add('reservation-spot-name');

      const timeEl = card.querySelector('.reservation-list-time');
      const summary = card.querySelector('.reservation-list-summary');
      if (!summary) return;

      const label = summary.querySelector('span');
      if (label) label.textContent = '予定・予約';

      const strong = summary.querySelector('strong');
      if (!strong || strong.dataset.mergedTime === '1') return;

      const timeText = timeEl ? timeEl.textContent.trim() : '';
      const noteText = strong.textContent.trim();

      strong.textContent = '';
      if (timeText) {
        const datetime = document.createElement('span');
        datetime.className = 'reservation-list-datetime';
        datetime.textContent = timeText;
        strong.appendChild(datetime);
      }
      if (noteText) {
        const note = document.createElement('span');
        note.className = 'reservation-list-note';
        note.textContent = noteText;
        strong.appendChild(note);
      }
      strong.dataset.mergedTime = '1';
      if (timeEl) timeEl.remove();
    });
  };

  applyReservationUi();
  const observer = new MutationObserver(() => applyReservationUi());
  observer.observe(document.getElementById('app'), {childList:true, subtree:true});
})();
