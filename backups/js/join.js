// ─── State ────────────────────────────────────────────────
let joinTarget = null;

// ─── Open / close ─────────────────────────────────────────
function openJoin(id) {
  joinTarget = lanternor.find(l => l.id === id);
  if (!joinTarget) return;

  const m = countMembers(joinTarget.id);
  document.getElementById('join-title').textContent = joinTarget.namn;
  document.getElementById('join-desc').textContent =
    joinTarget.plats + ' · ' + (joinTarget.max_platser - m) + ' platser kvar';
  document.getElementById('j-namn').value = '';
  document.getElementById('j-email').value = '';
  document.getElementById('join-overlay').classList.add('open');
}

function closeJoin() {
  document.getElementById('join-overlay').classList.remove('open');
  joinTarget = null;
}

// ─── Submit ───────────────────────────────────────────────
async function submitJoin() {
  const email = document.getElementById('j-email').value.trim();
  if (!email) {
    showToast('Ange din e-postadress.', 'error');
    return;
  }
  if (!joinTarget) return;

  const alreadyJoined = anmalningar.find(
    a => a.lanterna_id === joinTarget.id && a.email === email
  );
  if (alreadyJoined) {
    showToast('Den e-postadressen är redan anmäld.', 'error');
    return;
  }

  const btn = document.getElementById('btn-join-submit');
  btn.disabled = true;
  btn.textContent = 'Anmäler…';

  const { error } = await sb.from('anmalningar').insert({
    lanterna_id: joinTarget.id,
    namn: document.getElementById('j-namn').value.trim() || null,
    email
  });

  btn.disabled = false;
  btn.textContent = 'Anmäl mig';

  if (error) {
    showToast('Fel: ' + error.message, 'error');
    return;
  }

  closeJoin();
  await loadData();
  showToast('Du är anmäld!', 'success');
}
