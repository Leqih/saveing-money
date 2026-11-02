/* ---------- keep the demo across reloads ---------- */
// one saved game per browser; it starts once cards are held, so a half-done setup simply starts over
const SAVE_KEY = 'penny-round-v1';
let wiping = false;
function saveState() {
  if (wiping || (!S.held.length && !S.history.length)) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ S: { ...S, seen: [...S.seen] }, start: START.getTime(), essQuota, cats: CATS.filter(c => c.id.startsWith('u')) })); } catch (err) { /* private mode or a full store: the demo still runs, it just won't survive a reload */ }
}
function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!d || !d.S) return false;
    S = { ...S, ...d.S, seen: new Set(d.S.seen || []) };
    (S.gradLog || []).forEach(g => { g.date = new Date(g.date); });
    START = new Date(d.start); essQuota = d.essQuota ?? essQuota;
    (d.cats || []).forEach(c => { if (!CATS.some(x => x.id === c.id)) CATS.push(c); });
    return true;
  } catch (err) { return false; }
}
function clearState() { wiping = true; try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* nothing to clear */ } }
// save shortly after anything the user does, and once more on the way out
let saveT;
const queueSave = () => { clearTimeout(saveT); saveT = setTimeout(saveState, 300); };
['click', 'input', 'change', 'pointerup'].forEach(type => app.addEventListener(type, queueSave));
document.querySelector('.device').addEventListener('click', queueSave);
addEventListener('pagehide', saveState);
// a reload mid-ritual reopens the sheet that was waiting on the user, so a day or a week can't be ended twice
function resumeSheet() {
  const y = S.history[S.history.length - 1];
  if (S.sunCheck && y) renderSunUnlogged();
  else if (S.weekOpen && S.weekResult) renderWeek();
  else if (y && pendingUnlogged().length && S.held.length) renderMorning();
}

if (loadState()) { renderTable(); if (!catchUp()) resumeSheet(); toast('Welcome back · picked up where you left off'); }
else { renderTable(); renderLaunch(); }
