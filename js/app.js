// ─── Global state ────────────────────────────────────────
let lanternor = [];
let anmalningar = [];

// ─── Helpers ─────────────────────────────────────────────
function countMembers(id) {
  return anmalningar.filter(a => a.lanterna_id === id).length;
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.className = 'toast', 3500);
}

function updateStats() {
  document.getElementById('s-total').textContent = lanternor.length;
  document.getElementById('s-members').textContent = anmalningar.length;
  const spots = lanternor.reduce(
    (s, l) => s + Math.max(0, l.max_platser - countMembers(l.id)), 0
  );
  document.getElementById('s-spots').textContent = spots;
}

// ─── Data loading ─────────────────────────────────────────
async function loadData() {
  const [{ data: l, error: le }, { data: a, error: ae }] = await Promise.all([
    sb.from('lanternor').select('*').order('created_at', { ascending: false }),
    sb.from('anmalningar').select('lanterna_id, email')
  ]);

  if (le) { console.error('Fel vid hämtning av lanternor:', le.message); }
  if (ae) { console.error('Fel vid hämtning av anmälningar:', ae.message); }

  lanternor = l || [];
  anmalningar = a || [];

  renderMap();
  renderList();
  updateStats();
}

// ─── Init ─────────────────────────────────────────────────
loadData();
