/* ---------- what every tap does ---------- */
// a tapped element names its job in one of two ways: data-act="name" looks up ACTIONS, and a data attribute
// such as data-cat="tea" or data-key="5" looks up BY_DATA with its value. No element carries both.
// Each handler gets (t, top, e): the tapped element, the sheet it sits in (or null), and the click event.

// a sheet re-rendered in place keeps the look of having always been there
const settle = () => { lastSheet().style.animation = 'none'; };
// the onboarding steps after the budget: weak spots, then their frequency, then the first deal
const toWeak = top => swapSheet(top, () => { renderTable(true); app.appendChild(top); renderWeak(); });
const toFirstDeal = top => {
  // picking impulse shopping hands over that card right away instead of waiting for stars
  if (S.weak.includes('online') && !S.unlocked.includes('07')) S.unlocked.push('07');
  if (S.weak.includes('weekend') && !S.unlocked.includes('13')) S.unlocked.push('13');
  S.lastWeek = estimateWeek(); S.estimated = S.lastWeek.some(d => d.length);
  draft = {}; swapSheet(top, renderDraw);
};
const needCards = () => { if (S.held.length) return true; toast('Draw this week’s cards first'); return false; };
// unlogged days are either confirmed as zero-spend days (base score only) or left at 0; one answer covers them all
const resolveUnlogged = yes => pendingUnlogged().reduce((pts, y) => { if (yes) Object.assign(y, y.potential, { unlogged: false }); y.resolved = true; return pts + y.score; }, 0);
let undoDel = null;
const bankTx = t => S.bank.feed.find(x => x.id === +t.dataset.id);

const ACTIONS = {
  /* first use */
  'launch-go': (t, top) => swapSheet(top, renderSetup),
  // skip the setup: default budget, no weak spots picked, straight to the first pack
  'launch-skip': (t, top) => { S.base = BASE; top.remove(); renderTable(); S.lastWeek = estimateWeek(); S.estimated = S.lastWeek.some(d => d.length); draft = {}; renderDraw(); },
  'setup-next': (t, top) => { S.base = weeklyFrom(S.setup); toWeak(top); },
  'setup-skip': (t, top) => { S.base = BASE; toWeak(top); },
  'weak-next': (t, top) => S.weak.length ? swapSheet(top, renderFreq) : toFirstDeal(top),
  'weak-go': (t, top) => toFirstDeal(top),
  'weak-back': (t, top) => swapSheet(top, renderSetup, false, true),
  'freq-back': (t, top) => swapSheet(top, renderWeak, false, true),

  /* import and the bank */
  'import': () => { IMP = { src: 'bank', rows: null, busy: false }; renderImport(); },
  'imp-tab': (t, top) => { IMP.src = t.dataset.src; replaceSheet(top, renderImport); },
  'imp-bank': (t, top) => {
    IMP.busy = true; IMP.bank = t.dataset.bank; replaceSheet(top, renderImport);
    setTimeout(() => { IMP.busy = false; IMP.rows = parseTx(SAMPLE_BANK); const cur = lastSheet(); if (cur && cur.getAttribute('aria-label') === 'Import') replaceSheet(cur, renderImport); }, reducedMotion() ? 0 : 1300);
  },
  'imp-sample': (t, top) => { IMP.rows = parseTx(SAMPLE_BANK); replaceSheet(top, renderImport); },
  'imp-parse': (t, top) => {
    const rows = parseTx((top.querySelector('#imp-text') || {}).value || '');
    if (!rows.length) { toast('No purchases found. Each line needs a date, a name and an amount like -6.45'); return; }
    IMP.rows = rows; replaceSheet(top, renderImport);
  },
  'imp-add': (t, top) => {
    const found = new Set(IMP.rows.filter(r => r.on).map(r => r.cat));
    S.weak = WEAK.filter(w => w.id !== 'night' && w.id !== 'weekend' && found.has(w.id)).map(w => w.id);
    closeSheet(top, () => { const w = app.querySelector('.sheet[aria-label="Weak spots"]'); if (w) replaceSheet(w, renderWeak); toast(S.weak.length ? `Found ${S.weak.length} spending habit${S.weak.length > 1 ? 's' : ''} to guard` : 'No usual suspects in there, nice'); });
  },
  'bank-link': () => { if (S.bank) { renderSettings(); return; } BNK = { step: 'intro' }; renderBankLink(); },
  'bank-pick': (t, top) => {
    BNK = { step: 'busy', bank: t.dataset.bank }; replaceSheet(top, renderBankLink);
    setTimeout(() => { S.bank = { name: BNK.bank, feed: sampleFeed() }; S.honest = S.honest || 0; BNK.step = 'done'; const cur = lastSheet(); if (cur && cur.getAttribute('aria-label') === 'Bank') replaceSheet(cur, renderBankLink); }, reducedMotion() ? 0 : 1300);
  },
  'bank-off': (t, top) => { S.bank = null; replaceSheet(top, renderSettings); toast('Bank disconnected'); },
  'bank-off-profile': (t, top) => { S.bank = null; replaceSheet(top, renderProfile); toast('Bank disconnected'); },
  'bank-add': (t, top) => { const tx = bankTx(t); tx.state = 'added'; S.today.push({ cat: tx.cat, amt: tx.amt, note: tx.desc.slice(0, 24), caught: true }); replaceSheet(top, renderBankCheck); },
  'bank-no': (t, top) => { bankTx(t).state = 'dismissed'; replaceSheet(top, renderBankCheck); },
  'bank-continue': (t, top) => swapSheet(top, renderEnd),

  /* home, navigation and the sheets around it */
  'to-top': () => app.querySelector('.screen').scrollTo({ top: 0, behavior: 'smooth' }),
  'coach-next': () => { S.coach += 1; clearCoach(); showCoach(); },
  'coach-skip': () => { S.coach = COACH.length; clearCoach(); },
  'crt': (t, top, e) => {
    const kb = e.target.closest('.kb');
    // a knob flips the screen to the score or the cards for a few seconds; anywhere else just blips it
    if (kb) {
      kb.classList.remove('hit'); void kb.offsetWidth; kb.classList.add('hit');
      const crt = kb.closest('.crt'), m = kb.classList.contains('o') ? 'score' : 'hold';
      crt.dataset.mode = crt.dataset.mode === m ? '' : m; clearTimeout(crt._t);
      if (crt.dataset.mode) crt._t = setTimeout(() => { crt.dataset.mode = ''; }, 4000);
      return;
    }
    const c = t.closest('.crt'); c.classList.remove('blip'); void c.offsetWidth; c.classList.add('blip');
  },
  'goflow': () => { S.view = 'bill'; S.billTab = 'flow'; renderTable(); },
  'profile': () => renderProfile(),
  'star': () => renderStarSheet(),
  'inbox': () => { app.querySelectorAll('.push').forEach(n => n.remove()); renderInbox(); },
  'push-close': t => t.closest('.push').remove(),
  'fb-close': () => app.querySelectorAll('.fb').forEach(n => n.remove()),
  'rflip': t => { const on = t.classList.toggle('back'); t.setAttribute('aria-pressed', String(on)); const ht = t.parentElement.querySelector('.rhint'); if (ht) ht.textContent = on ? 'TAP TO FLIP BACK' : 'TAP TO FLIP'; },
  'help': () => renderGuide(),
  // settings can change what home shows, so redraw it on the way out
  'close': (t, top) => closeSheet(top, top.getAttribute('aria-label') === 'Settings' ? renderTable : null),

  /* settings */
  'settings': (t, top) => { if (top && top.getAttribute('aria-label') === 'Stars') top.remove(); renderSettings(); },
  // a new allowance starts next Monday: changing it mid-week would rescore the rest of the week on a different budget
  'settings-save': (t, top) => {
    const w = weeklyFrom(S.setup), q = S.setup.ess ?? essQuota;
    S.nextBase = w === S.base ? null : w; S.nextQuota = q === essQuota ? null : q;
    replaceSheet(top, renderSettings);
    toast(S.nextBase || S.nextQuota != null ? `From Monday: ${money(w)} a week, ${money(Math.round(w / 7))} a day` : `Staying at ${money(S.base)} a week`);
  },
  'coach-reset': (t, top) => { S.coach = 0; S.view = 'home'; top.remove(); renderTable(); },
  // one tap arms it, a second within 3 s wipes the save; anything else lets it disarm on its own
  'restart': t => {
    if (t.dataset.armed) { clearState(); location.reload(); return; }
    t.dataset.armed = '1'; t.classList.add('danger'); t.textContent = 'Tap again to erase';
    setTimeout(() => { delete t.dataset.armed; t.classList.remove('danger'); t.textContent = 'Start over'; }, 3000);
  },

  /* the weekly draw */
  'draw': () => { draft = {}; renderDraw(); },
  'use-rec': (t, top) => { draft.sel = draft.rec.slice(); draft.ci = 0; draft.landed = 'all'; draft.opened = true; replaceSheet(top, renderDraw); },
  'choose': (t, top) => keepHand(top),

  /* logging a spend */
  'log': () => { if (!needCards()) return; draft = { amt: '', cat: CATS.some(c => c.id === S.lastCat) ? S.lastCat : 'meal', night: S.clock >= 22, note: '' }; renderLog(); },
  'newcat': () => { draft.adding = !draft.adding; refreshLog(); },
  'addcat': () => {
    if (!draft.newName) { toast('Give the new category a name first'); return; }
    const id = 'u' + Date.now();
    CATS.push({ id, name: draft.newName, ess: !!draft.newEss });
    Object.assign(draft, { cat: id, adding: false, newName: '', newEss: false });
    refreshLog(); toast(`Added: ${cat(id).name}`);
  },
  'savequick': () => {
    const label = draft.note || cat(logCat()).name, amt = amtOf(draft.amt) || undefined;
    if (!S.quicks.some(q => q.label === label && q.cat === logCat())) { S.quicks.unshift({ label, cat: logCat(), amt }); S.quicks = S.quicks.slice(0, 8); }
    refreshLog(); toast(`Saved: ${label}; it’s at the top of Log next time`);
  },
  'save': () => {
    const entry = { cat: logCat(), amt: amtOf(draft.amt), night: !!draft.night, note: draft.note, fromWish: draft.fromWish };
    const past = pastDay();
    if (past) { past.entries[draft.edit] = { ...past.entries[draft.edit], ...entry }; past.edited = true; renderTable(); toast(`Ledger updated · ${DAYS[past.day]}’s score stays`); return; }
    const before = evaluate(S.today);
    if (draft.edit != null) S.today[draft.edit] = entry; else { S.today.push(entry); S.lastCat = draft.cat; }
    renderTable(); verdict(before, evaluate(S.today));
  },
  'del': () => {
    const past = pastDay();
    if (past) { undoDel = { list: past.entries, at: draft.edit, x: past.entries.splice(draft.edit, 1)[0] }; past.edited = true; renderTable(); toast('Deleted from the ledger', 'undo-del'); return; }
    const before = evaluate(S.today); undoDel = { list: S.today, week: S.week, day: S.day, at: draft.edit, x: S.today.splice(draft.edit, 1)[0] };
    renderTable(); const after = evaluate(S.today); toast(after.mult > before.mult ? `Deleted · mult back to ×${after.mult}` : 'Deleted', 'undo-del');
  },
  // a deleted entry goes back where it was; one from today only while it is still that day
  'undo-del': t => {
    t.closest('.toast').remove(); const u = undoDel; undoDel = null;
    if (!u || u.week != null && (u.week !== S.week || u.day !== S.day)) return;
    u.list.splice(Math.min(u.at, u.list.length), 0, u.x); renderTable(); toast('Entry restored');
  },
  'wish': () => { S.wish.push({ cat: logCat(), amt: amtOf(draft.amt), note: draft.note }); S.lastCat = draft.cat; renderTable(); toast('Moved to the wish list; we’ll ask again tomorrow · no card broke'); },
  'glue': (t, top) => {
    const no = t.dataset.no; if (CARDS[no].noGlue || S.glue < 1) return;
    S.glue -= 1; S.glued = { week: S.week, day: S.day, no };
    top.remove(); renderTable(); toast(`Glued back, “${CARDS[no].name}” holds again today +${CARDS[no].plus}`);
  },

  /* demo time */
  'clock': () => renderClock(),
  // demo shortcut: end every remaining weekday as it stands, land on Sunday evening
  'jump-sunday': (t, top) => {
    top.remove();
    while (S.day < 6) endDay();
    app.querySelectorAll('.sheet').forEach(n => n.remove());
    S.clock = 21.5; S.view = 'home'; renderTable();
    toast('It’s Sunday night; tap “End today” for the weekly summary');
  },

  /* ending the day and the mornings */
  'end': () => { if (!needCards()) return; if (bankCaught().length) renderBankCheck(); else renderEnd(); },
  'end-ok': (t, top) => { t.disabled = true; playStage(top); },
  'play-next': t => { t.disabled = true; endDay(); },
  'morning-done': (t, top) => { S.autoEnded = false; S.away = 0; S.wishSaved = 0; closeSheet(top, renderTable); },
  'unlogged-yes': () => { const pts = resolveUnlogged(true); renderTable(); renderMorning(); settle(); toast(`Filled in ${pts} pts`); },
  'unlogged-no': () => { const n = pendingUnlogged().length; resolveUnlogged(false); renderTable(); renderMorning(); settle(); toast(`${n > 1 ? 'Those days count' : 'That day counts'} as 0 pts. Log a quick entry whenever you spend later`); },
  'sun-unlogged-yes': (t, top) => { resolveUnlogged(true); S.sunCheck = false; top.remove(); settleWeek(); renderTable(); renderWeek(); },
  'sun-unlogged-no': (t, top) => { resolveUnlogged(false); S.sunCheck = false; top.remove(); settleWeek(); renderTable(); renderWeek(); },

  /* the weekly summary and the next week */
  'recon': (t, top) => reconcile(top, false),
  'recon-skip': (t, top) => reconcile(top, true),
  'week-plan': (t, top) => { S.weekStep = 2; swapSheet(top, renderWeek); },
  'week-back': (t, top) => { S.weekStep = 1; swapSheet(top, renderWeek, false, true); },
  // the new week opens straight on the deal; the shop is a tab in Deck, always open
  'to-monday': (t, top) => swapSheet(top, () => { startWeek(); S.pinned = []; }),

  /* the shop, in the Deck tab */
  'reroll': () => { S.stars -= PRICE.reroll; rollShop(); renderTable(); },
  'slot': () => { S.stars -= PRICE.slot; S.slotPending = true; renderTable(); toast('From next week: keep 4 cards, target +25%'); },
  'glue-buy': () => { S.stars -= PRICE.glue; S.glue += 1; renderTable(); toast('Bought a bottle of glue; tap a broken card to use it'); }
};

// before the stars: compare the week's log with what was really spent, or skip and keep half
function reconcile(top, skip) {
  const R = S.weekResult, actual = parseInt((top.querySelector('#recon') || {}).value, 10);
  if (!skip && !(actual >= 0)) { toast('Enter what you really spent this week first'); return; }
  const voided = !skip && actual > R.logged * RECON_RATIO && actual - R.logged > RECON_SLACK ? R.got : 0;
  const lost = skip ? R.got - Math.floor(R.got / 2) : voided;
  S.stars -= lost; S.starsTotal -= lost; R.got -= lost; S.weeks[S.weeks.length - 1].stars = R.got; S.lastResult.stars = R.got;
  R.recon = { actual, voided, skipped: skip };
  replaceSheet(top, renderWeek);
}

// handlers keyed by data attribute; each gets (value, t, top)
const BY_DATA = {
  /* first use and settings */
  weak: (id, t, top) => {
    const wasOn = S.weak.includes(id);
    S.weak = wasOn ? S.weak.filter(x => x !== id) : [...S.weak, id];
    replaceSheet(top, renderWeak);
    const nb = app.querySelector(`.cv-opt[data-weak="${id}"]`); if (nb) nb.classList.add(wasOn ? 'unpick' : 'pick');
  },
  freq: (v, t, top) => { const [id, i] = v.split(':'); S.freq[id] = +i; replaceSheet(top, renderFreq); const nb = app.querySelector(`[data-freq="${v}"]`); if (nb) nb.classList.add('pop'); },
  quota: (v, t, top) => {
    const q = Math.min(100, Math.max(0, (S.setup.ess ?? essQuota) + +v)), inSettings = top.getAttribute('aria-label') === 'Settings';
    S.setup.ess = q; if (!inSettings) essQuota = q;
    replaceSheet(top, inSettings ? renderSettings : renderSetup);
  },
  pref: (k, t, top) => { S.prefs[k] = !S.prefs[k]; replaceSheet(top, renderSettings); },
  evat: (v, t, top) => { S.prefs.eveningAt = +v; replaceSheet(top, renderSettings); },
  impi: (i, t, top) => { const r = IMP.rows[+i]; r.on = !r.on; replaceSheet(top, renderImport); },

  /* pages and what opens from them */
  tab: v => switchTab(v),
  bill: v => { S.billTab = v; renderTable(); },
  deck: v => { S.deckTab = v; renderTable(); },
  // tapping the chip that is already on goes back to every card
  plus: v => { S.deckPlus = +v === S.deckPlus ? 0 : +v; const top0 = app.querySelector('.screen').scrollTop; renderTable(); app.querySelector('.screen').scrollTop = top0; },
  flowcat: v => { S.flowCat = v; const top0 = app.querySelector('.screen').scrollTop; renderTable(); app.querySelector('.screen').scrollTop = top0; },
  cal: v => { const [w, d] = v.split('-').map(Number); renderDay(d, w); },
  day: v => renderDay(+v),
  info: no => renderRule(no),

  /* the weekly draw */
  pick: (no, t, top) => {
    if (draft.swiped) return;
    const i = draft.hand.filter(x => !draft.sel.includes(x)).indexOf(no);
    // a side card comes to the front first; the front card is the one you keep
    if (i !== draft.ci) { draft.ci = i; glide(top.querySelector('.stack'), i, 0, () => replaceSheet(top, renderDraw)); return; }
    if (!keepFront(top, t.closest('.sc2'))) replaceSheet(top, renderDraw);
  },
  unpick: (no, t, top) => { draft.sel = draft.sel.filter(x => x !== no); draft.ci = draft.hand.filter(x => !draft.sel.includes(x)).indexOf(no); replaceSheet(top, renderDraw); },

  /* logging a spend */
  edit: v => { const i = +v, x = S.today[i]; draft = { amt: String(x.amt), cat: x.cat, night: !!x.night, note: x.note || '', edit: i, fromWish: x.fromWish }; renderLog(); },
  // an entry on a day that has ended: week-day-index
  pedit: v => {
    const [week, day, i] = v.split('-').map(Number), x = S.history.find(h => h.week === week && h.day === day).entries[i];
    draft = { amt: String(x.amt), cat: x.cat, night: !!x.night, note: x.note || '', edit: i, fromWish: x.fromWish, past: { week, day } }; renderLog();
  },
  // a favorite picks the category and note, and fills its usual amount when none is typed yet
  quick: v => { const q = S.quicks[+v]; Object.assign(draft, { cat: q.cat, note: q.label === cat(q.cat).name ? '' : q.label }, q.amt && !draft.amt ? { amt: String(q.amt) } : {}); refreshLog(); },
  cat: v => { draft.cat = v; refreshLog(); },
  night: v => { draft.night = v === '1'; refreshLog(); },
  delivery: v => { draft.delivery = v === '1'; refreshLog(); },
  newess: v => { draft.newEss = v === '1'; refreshLog(); },
  key: k => {
    const a = k === '⌫' ? draft.amt.slice(0, -1) : k === '.' ? (draft.amt.includes('.') ? draft.amt : (draft.amt || '0') + '.') : draft.amt + k;
    if (/^\d{0,4}(\.\d{0,2})?$/.test(a)) draft.amt = a.replace(/^0+(?=\d)/, '');
    refreshLog();
  },

  /* demo time and the wish list */
  clock: (v, t, top) => {
    top.remove();
    if (v === 'midnight') { S.autoEnded = true; endDay(); return; }
    const before = alerts(evaluate(S.today))[0];
    S.clock = +v; renderTable();
    const a = alerts(evaluate(S.today))[0];
    if (S.prefs.evening && S.clock >= S.prefs.eveningAt) pushNote('Done logging?', `It’s ${fmtClock(S.clock)}, tonight’s estimate ${evaluate(S.today).score} pts. When you’re done, tap “End today” and look at the receipt.`);
    else if (S.prefs.ruleAlerts && a && a !== before) pushNote('Your cards', a);
  },
  rv: (v, t, top) => {
    const [i, how] = v.split(':'), x = S.revisit.splice(+i, 1)[0];
    let msg;
    if (how === 'buy') { S.today.push({ ...x, night: false, fromWish: true }); msg = 'Logged · you gave it 24 hours first'; }
    else { S.wishSaved = (S.wishSaved || 0) + x.amt; msg = `Skip it, saved ${money(x.amt)}`; }
    const lbl = top.getAttribute('aria-label'); renderTable(); (lbl === 'Notifications' ? renderInbox : renderMorning)(); settle(); toast(msg);
  },

  /* the weekly summary and the shop */
  carry: (no, t, top) => { S.carry = no; replaceSheet(top, renderWeek); },
  stake: (v, t, top) => { S.nextStake = +v; replaceSheet(top, renderWeek); },
  buy: v => {
    const o = S.shopOffers[+v]; if (o.sold || S.stars < o.price) return;
    S.stars -= o.price; o.sold = true;
    if (o.kind === 'unlock') S.unlocked.push(o.no); else S.pinned.push(o.no);
    renderTable(); toast(o.kind === 'unlock' ? `Unlocked “${CARDS[o.no].name}”` : `Guaranteed next week: “${CARDS[o.no].name}”`);
  }
};

app.addEventListener('click', e => {
  const t = e.target.closest('button, .fb, .push'); if (!t) return;
  const top = t.closest('.sheet'), act = t.dataset.act;
  if (act) { if (ACTIONS[act]) ACTIONS[act](t, top, e); return; }
  const key = Object.keys(t.dataset).find(k => BY_DATA[k]);
  if (key) BY_DATA[key](t.dataset[key], t, top);
});
