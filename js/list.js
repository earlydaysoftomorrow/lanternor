// ─── State ────────────────────────────────────────────────
let activeFilter = 'alla';

// ─── Filter ───────────────────────────────────────────────
function setFilter(f, el) {
  activeFilter = f;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderList();
}

// ─── Render list ──────────────────────────────────────────
function renderList() {
  const el = document.getElementById('lantern-list');
  let list = [...lanternor];

  if (activeFilter === 'lediga') {
    list = list.filter(l => countMembers(l.id) < l.max_platser);
  } else if (activeFilter !== 'alla') {
    list = list.filter(l => (l.inriktningar || []).includes(activeFilter));
  }

  if (!list.length) {
    el.innerHTML = '<div class="empty">Inga lanternor matchar filtret.</div>';
    return;
  }

  el.innerHTML = list.map(l => {
    const m = countMembers(l.id);
    const left = l.max_platser - m;
    const full = left <= 0;
    const tags = (l.inriktningar || [])
      .map(t => `<span class="l-tag">${t}</span>`)
      .join('');
    return `
      <div class="l-card" id="card-${l.id}" onclick="highlightLantern('${l.id}')">
        <div class="l-card-top">
          <div class="l-name">${l.namn}</div>
          <div class="l-badge ${full ? 'full' : 'ok'}">${full ? 'Fullbokad' : left + ' kvar'}</div>
        </div>
        <div class="l-loc">${l.plats}</div>
        ${l.beskrivning ? `<div class="l-desc">${l.beskrivning}</div>` : ''}
        ${tags ? `<div class="l-tags">${tags}</div>` : ''}
        <div class="l-footer">
          <div class="l-members">${m} / ${l.max_platser} anmälda</div>
          <button class="btn-join" ${full ? 'disabled' : ''}
            onclick="event.stopPropagation(); openJoin('${l.id}')">
            ${full ? 'Fullbokad' : 'Anmäl mig'}
          </button>
        </div>
      </div>`;
  }).join('');
}

// ─── Highlight card + focus map ───────────────────────────
function highlightLantern(id) {
  document.querySelectorAll('.l-card').forEach(c => c.classList.remove('highlighted'));
  const card = document.getElementById('card-' + id);
  if (card) {
    card.classList.add('highlighted');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  focusLantern(id);
}
