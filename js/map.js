// ─── Init main map ────────────────────────────────────────
const map = L.map('map', { zoomControl: true }).setView([57.98, 11.64], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19
}).addTo(map);

let markers = {};

// ─── Marker icon ─────────────────────────────────────────
function makeIcon(full) {
  return L.divIcon({
    className: '',
    html: `<div class="lantern-marker${full ? ' full' : ''}"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
}

// ─── Popup content ────────────────────────────────────────
function buildPopup(l) {
  const m = countMembers(l.id);
  const left = l.max_platser - m;
  const full = left <= 0;
  const tags = (l.inriktningar || [])
    .map(t => `<span class="popup-tag">${t}</span>`)
    .join('');
  return `
    <div class="popup-name">${l.namn}</div>
    <div class="popup-loc">${l.plats}</div>
    ${tags ? `<div class="popup-tags">${tags}</div>` : ''}
    <div class="popup-row">
      <span class="popup-spots">${m}/${l.max_platser} anmälda</span>
      <button class="popup-btn" ${full ? 'disabled' : ''} onclick="openJoin('${l.id}')">
        ${full ? 'Fullbokad' : 'Anmäl mig'}
      </button>
    </div>`;
}

// ─── Render markers ───────────────────────────────────────
function renderMap() {
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  lanternor.forEach(l => {
    if (!l.lat || !l.lng) return;
    const full = countMembers(l.id) >= l.max_platser;
    const marker = L.marker([l.lat, l.lng], { icon: makeIcon(full) })
      .addTo(map)
      .bindPopup(buildPopup(l), { maxWidth: 240, minWidth: 200 });
    markers[l.id] = marker;
  });
}

// ─── Focus a lantern on the map ───────────────────────────
function focusLantern(id) {
  const l = lanternor.find(x => x.id === id);
  if (!l || !l.lat) return;
  map.setView([l.lat, l.lng], 14, { animate: true });
  if (markers[id]) markers[id].openPopup();
}
