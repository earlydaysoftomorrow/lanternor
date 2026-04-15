// ─── State ────────────────────────────────────────────────
let pickLat = null;
let pickLng = null;
let pickMarker = null;
let pickMap = null;

// ─── Open / close ─────────────────────────────────────────
function openCreate() {
  document.getElementById('create-overlay').classList.add('open');

  // Init the mini pick-map lazily on first open
  setTimeout(() => {
    if (!pickMap) {
      pickMap = L.map('pick-map', { zoomControl: true }).setView([59.33, 17.0], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(pickMap);

      pickMap.on('click', e => {
        pickLat = parseFloat(e.latlng.lat.toFixed(6));
        pickLng = parseFloat(e.latlng.lng.toFixed(6));
        if (pickMarker) pickMap.removeLayer(pickMarker);
        pickMarker = L.marker([pickLat, pickLng]).addTo(pickMap);
        const hint = document.getElementById('pick-hint');
        hint.textContent = `Markerat: ${pickLat}, ${pickLng}`;
        hint.className = 'pick-hint picked';
      });
    }
    pickMap.invalidateSize();
  }, 120);
}

function closeCreate() {
  document.getElementById('create-overlay').classList.remove('open');

  // Reset form fields
  ['f-namn', 'f-beskr', 'f-plats', 'f-spots', 'f-email']
    .forEach(id => document.getElementById(id).value = '');
  document.querySelectorAll('.checkbox-grid input')
    .forEach(cb => cb.checked = false);

  // Reset map pin
  pickLat = null;
  pickLng = null;
  if (pickMarker && pickMap) {
    pickMap.removeLayer(pickMarker);
    pickMarker = null;
  }
  const hint = document.getElementById('pick-hint');
  hint.textContent = 'Klicka på kartan för att placera lanternan';
  hint.className = 'pick-hint';
}

// ─── Submit ───────────────────────────────────────────────
async function submitCreate() {
  const namn = document.getElementById('f-namn').value.trim();
  const plats = document.getElementById('f-plats').value.trim();
  const spots = parseInt(document.getElementById('f-spots').value);
  const email = document.getElementById('f-email').value.trim();

  if (!namn || !plats || !spots || !email) {
    showToast('Fyll i namn, plats, antal platser och e-post.', 'error');
    return;
  }
  if (!pickLat || !pickLng) {
    showToast('Markera platsen på kartan.', 'error');
    return;
  }

  const inriktningar = [
    ...document.querySelectorAll('.checkbox-grid input:checked')
  ].map(cb => cb.value);

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Publicerar…';

  const { error } = await sb.from('lanternor').insert({
    namn,
    plats,
    beskrivning: document.getElementById('f-beskr').value.trim() || null,
    max_platser: spots,
    kontakt_email: email,
    inriktningar,
    lat: pickLat,
    lng: pickLng
  });

  btn.disabled = false;
  btn.textContent = 'Publicera lanterna';

  if (error) {
    showToast('Fel: ' + error.message, 'error');
    return;
  }

  closeCreate();
  await loadData();
  showToast('Lanternan är publicerad!', 'success');
}
