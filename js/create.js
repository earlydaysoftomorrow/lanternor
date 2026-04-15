// ─── State ────────────────────────────────────────────────
let pickLat = null;
let pickLng = null;
let pickMarker = null;
let pickMap = null;

const RESEND_KEY = 're_ckb1DaFs_5fWm85WspficgYDVkn2hWqUB';

// ─── Open / close ─────────────────────────────────────────
function openCreate() {
  document.getElementById('create-overlay').classList.add('open');

  setTimeout(() => {
    if (!pickMap) {
      pickMap = L.map('pick-map', { zoomControl: true }).setView([57.98, 11.64], 10);
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
        hint.textContent = 'Markerat: ' + pickLat + ', ' + pickLng;
        hint.className = 'pick-hint picked';
      });
    }
    pickMap.invalidateSize();
  }, 120);
}

function closeCreate() {
  document.getElementById('create-overlay').classList.remove('open');
  ['f-namn', 'f-beskr', 'f-plats', 'f-spots', 'f-email']
    .forEach(id => document.getElementById(id).value = '');
  document.querySelectorAll('.checkbox-grid input')
    .forEach(cb => cb.checked = false);
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

// ─── Skicka redigeringsmail via Resend ────────────────────
async function sendEditEmail(email, namn, editToken) {
  const editUrl = window.location.origin + '/redigera.html?token=' + editToken;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + RESEND_KEY
    },
    body: JSON.stringify({
      from: 'Lanternor över Tjörn <onboarding@resend.dev>',
      to: [email],
      subject: 'Din lanterna "' + namn + '" är publicerad!',
      html: '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1c1b19;">' +
        '<div style="background:#fef3dc;padding:2rem;border-radius:8px;margin-bottom:1.5rem;">' +
        '<h1 style="font-size:1.5rem;margin:0 0 0.5rem;">Din lanterna lyser!</h1>' +
        '<p style="margin:0;color:#5a5750;">' + namn + ' är nu publicerad på kartan över Tjörn.</p>' +
        '</div>' +
        '<p style="line-height:1.7;">Vill du uppdatera beskrivning, inriktning eller antal platser? Använd din personliga redigeringslänk nedan. Spara den gärna i din inkorg.</p>' +
        '<a href="' + editUrl + '" style="display:inline-block;background:#1c1b19;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;margin:1rem 0;font-weight:500;">Redigera din lanterna →</a>' +
        '<p style="font-size:0.82rem;color:#9a948a;margin-top:1.5rem;">Länken är personlig och kopplad till din e-postadress. Dela den inte med andra.</p>' +
        '<hr style="border:none;border-top:1px solid #e2ddd5;margin:1.5rem 0;">' +
        '<p style="font-size:0.78rem;color:#9a948a;">Lanternor över Tjörn · Egnahemsfabriken · <a href="https://lanternor.vercel.app" style="color:#d4840a;">lanternor.vercel.app</a></p>' +
        '</div>'
    })
  });
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

  const { data, error } = await sb.from('lanternor').insert({
    namn,
    plats,
    beskrivning: document.getElementById('f-beskr').value.trim() || null,
    max_platser: spots,
    kontakt_email: email,
    inriktningar,
    lat: pickLat,
    lng: pickLng
  }).select('id, edit_token').single();

  btn.disabled = false;
  btn.textContent = 'Publicera lanterna';

  if (error) {
    showToast('Fel: ' + error.message, 'error');
    return;
  }

  try {
    await sendEditEmail(email, namn, data.edit_token);
  } catch (e) {
    console.error('Kunde inte skicka mail:', e);
  }

  closeCreate();
  await loadData();
  showToast('Publicerad! Kolla din e-post för redigeringslänken.', 'success');
}