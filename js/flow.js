/* ---------- day flow ---------- */
function endDay() {
  const h = dayRecord();
  S.history.push(h);
  // honest streak: a night with nothing the bank had to catch; five in a row earns a star
  if (S.bank) {
    const caught = S.today.some(e => e.caught); S.honest = caught ? 0 : (S.honest || 0) + 1; S.honestBest = Math.max(S.honestBest || 0, S.honest);
    S.bank.feed = sampleFeed();
    // a week of honest nights earns a free bottle of glue (the same one the shop sells); two weeks also earn a star
    if (!caught && S.honest % 7 === 0) {
      const star = S.honest % 14 === 0; if (star) { S.stars += 1; S.starsTotal += 1; }
      const glue = S.glue < 3; if (glue) S.glue += 1;
      setTimeout(() => toast(`${S.honest} honest days${glue ? ' · free Glue bottle' : ''}${star ? ' · +1 ★' : ''}`), 600);
    }
  }
  const owed = Math.max(0, h.extra + S.debt - dailyBudget());
  S.debt = Math.min(debtCap(), owed);
  // whatever tomorrow can't absorb raises this week's target: every dollar still has to be won back by saving
  h.overflow = owed - S.debt; S.overflow = (S.overflow || 0) + h.overflow;
  S.teaWeek += teaOf(S.today);
  S.revisit = S.wish; S.wish = [];
  S.today = [];
  // Sunday has no next morning to ask on, so an unlogged Sunday is asked about before the week is settled
  if (S.day === 6) { renderTable(); if (h.unlogged) { S.sunCheck = true; renderSunUnlogged(h); } else { settleWeek(); renderWeek(); } return; }
  S.day += 1; S.clock = 8.5;
  renderTable();
  if (S.prefs.morning) renderMorning(); else toast(`${DAYS[S.day]} · allowed today $${todayBudget()}`);
  monthTurn(dateOf(S.week, S.day - 1), dateOf(S.week, S.day));
}
function renderSunUnlogged(h) {
  sheet('Sunday check', `
    <div class="bar-top"><h1>Sun · before the summary</h1></div>
    <div class="unlogged"><b>Nothing logged today</b><span>Did you really spend nothing? An unlogged day counts as 0 pts. If you really spent nothing, it’s restored to a zero-spend score of ${h.potential.score} pts (base multiplier only; cards add nothing on an unlogged day).</span><div class="ibtns"><button class="rvbtn lime" data-act="sun-unlogged-yes">Really spent nothing</button><button class="rvbtn" data-act="sun-unlogged-no">Forgot to log</button></div></div>`);
}
function startWeek() {
  const lastDay = dateOf(S.week, 6);
  S.lastWeek = DAYS.map((_, i) => (weekHist().find(h => h.day === i) || { entries: [] }).entries.map(x => ({ ...x })));
  S.autoEnded = false; S.clock = 8.5;
  // an overspent Sunday still comes out of Monday's allowance, so the week boundary is no free night out
  S.stake = S.nextStake; S.overflow = 0;
  if (S.slotPending) { S.slots = 4; S.slotPending = false; }
  S.weekOpen = false;
  S.week += 1; S.day = 0; S.weekStart = 0; S.held = []; S.teaWeek = 0; S.firstDraw = false; S.estimated = false;
  draft = {};
  renderTable(); renderDraw();
  monthTurn(lastDay, dateOf(S.week, 0));
}

app.addEventListener('change', e => { const sel = e.target.closest && e.target.closest('.imp-cat'); if (!sel) return; IMP.rows[+sel.dataset.impc].cat = sel.value; const top = sel.closest('.sheet'); replaceSheet(top, renderImport); });
app.addEventListener('input', e => {
  if (e.target.dataset.setup) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    S.setup[e.target.dataset.setup] = +e.target.value || 0;
    const w = weeklyFrom(S.setup);
    tickMoney(document.getElementById('setup-week'), w);
    document.getElementById('setup-formula').textContent = w >= 50 ? setupFormula(S.setup) : 'Weekly allowance must be at least $50; adjust the numbers above';
    const nx = document.querySelector("[data-act=setup-next], [data-act=settings-save]");
    // settings only saves a real change: the same allowance as now keeps the button off
    if (nx && nx.dataset.act === 'settings-save') { nx.disabled = w < 50 || w === S.base; nx.textContent = w === S.base ? `It’s already $${S.base}` : `Change to $${w}`; }
    else if (nx) nx.disabled = w < 50;
  }
  if (e.target.id === 'note') draft.note = e.target.value.trim();
  if (e.target.id === 'newcat') draft.newName = e.target.value.trim();
});
app.addEventListener('click', e => {
  const t = e.target.closest('button, .fb, .push'); if (!t) return;
  // a long press already logged the favorite; swallow the click that follows it
  const act = t.dataset.act, top = t.closest('.sheet');
  if (act === 'fb-close') { app.querySelectorAll('.fb').forEach(n => n.remove()); return; }
  if (act === 'launch-go') { swapSheet(top, renderSetup); return; }
  // skip the setup: default budget, no weak spots picked, straight to the first pack
  if (act === 'launch-skip') { S.base = BASE; top.remove(); renderTable(); S.lastWeek = estimateWeek(); S.estimated = S.lastWeek.some(d => d.length); draft = {}; renderDraw(); return; }
  if (act === 'setup-next') { S.base = weeklyFrom(S.setup); swapSheet(top, () => { renderTable(true); app.appendChild(top); renderWeak(); }); return; }
  if (t.dataset.weak) {
    const id = t.dataset.weak, wasOn = S.weak.includes(id), had = S.weak.length;
    S.weak = wasOn ? S.weak.filter(x => x !== id) : [...S.weak, id];
    replaceSheet(top, renderWeak);
    const nb = app.querySelector(`.cv-opt[data-weak="${id}"]`); if (nb) { nb.classList.add(wasOn ? 'unpick' : 'pick'); }
    return;
  }
  if (t.dataset.quota) { essQuota = Math.min(100, Math.max(0, essQuota + +t.dataset.quota)); replaceSheet(top, top.getAttribute('aria-label') === 'Settings' ? renderSettings : renderSetup); return; }
  if (act === 'setup-skip') { S.base = BASE; swapSheet(top, () => { renderTable(true); app.appendChild(top); renderWeak(); }); return; }
  if (act === 'import') { IMP = { src: 'bank', rows: null, busy: false }; renderImport(); return; }
  if (act === 'profile') { renderProfile(); return; }
  if (act === 'bank-off-profile') { S.bank = null; replaceSheet(top, renderProfile); toast('Bank disconnected'); return; }
  if (act === 'bank-link') { if (S.bank) { renderSettings(); return; } BNK = { step: 'intro' }; renderBankLink(); return; }
  if (act === 'bank-pick') { BNK = { step: 'busy', bank: t.dataset.bank }; replaceSheet(top, renderBankLink); setTimeout(() => { S.bank = { name: BNK.bank, feed: sampleFeed() }; S.honest = S.honest || 0; BNK.step = 'done'; const cur = lastSheet(); if (cur && cur.getAttribute('aria-label') === 'Bank') replaceSheet(cur, renderBankLink); }, reducedMotion() ? 0 : 1300); return; }
  if (act === 'bank-off') { S.bank = null; replaceSheet(top, renderSettings); toast('Bank disconnected'); return; }
  if (act === 'bank-add' || act === 'bank-no') {
    const tx = S.bank.feed.find(x => x.id === +t.dataset.id);
    if (act === 'bank-add') { tx.state = 'added'; S.today.push({ cat: tx.cat, amt: tx.amt, note: tx.desc.slice(0, 24), caught: true }); } else tx.state = 'dismissed';
    replaceSheet(top, renderBankCheck); return;
  }
  if (act === 'bank-continue') { swapSheet(top, renderEnd); return; }
  if (act === 'imp-tab') { IMP.src = t.dataset.src; replaceSheet(top, renderImport); return; }
  if (act === 'imp-bank') { IMP.busy = true; IMP.bank = t.dataset.bank; replaceSheet(top, renderImport); setTimeout(() => { IMP.busy = false; IMP.rows = parseTx(SAMPLE_BANK); const cur = lastSheet(); if (cur && cur.getAttribute('aria-label') === 'Import') replaceSheet(cur, renderImport); }, reducedMotion() ? 0 : 1300); return; }
  if (act === 'imp-sample') { IMP.rows = parseTx(SAMPLE_BANK); replaceSheet(top, renderImport); return; }
  if (act === 'imp-parse') { const rows = parseTx((top.querySelector('#imp-text') || {}).value || ''); if (!rows.length) { toast('No purchases found. Each line needs a date, a name and an amount like -6.45'); return; } IMP.rows = rows; replaceSheet(top, renderImport); return; }
  if (t.dataset.impi != null) { const r = IMP.rows[+t.dataset.impi]; r.on = !r.on; replaceSheet(top, renderImport); return; }
  if (act === 'imp-add') {
    const picked = IMP.rows.filter(r => r.on);
    const found = new Set(picked.map(r => r.cat)); S.weak = WEAK.filter(w => w.id !== 'night' && w.id !== 'weekend' && found.has(w.id)).map(w => w.id);
    closeSheet(top, () => { const w = app.querySelector('.sheet[aria-label="Weak spots"]'); if (w) replaceSheet(w, renderWeak); toast(S.weak.length ? `Found ${S.weak.length} spending habit${S.weak.length > 1 ? 's' : ''} to guard` : 'No usual suspects in there, nice'); });
    return;
  }
  if (t.dataset.deck) { S.deckTab = t.dataset.deck; renderTable(); return; }
  if (act === 'weak-next' && S.weak.length) { swapSheet(top, renderFreq); return; }
  if (act === 'weak-next' || act === 'weak-go') {
    // picking impulse shopping hands over that card right away instead of waiting for stars
    if (S.weak.includes('online') && !S.unlocked.includes('07')) S.unlocked.push('07');
    if (S.weak.includes('weekend') && !S.unlocked.includes('13')) S.unlocked.push('13');
    S.lastWeek = estimateWeek(); S.estimated = S.lastWeek.some(d => d.length);
    draft = {}; swapSheet(top, renderDraw);
    return;
  }
  if (t.dataset.freq) { const [id, i] = t.dataset.freq.split(':'); S.freq[id] = +i; replaceSheet(top, renderFreq); const nb = app.querySelector(`[data-freq="${id}:${i}"]`); if (nb) nb.classList.add('pop'); return; }
  if (act === 'to-top') { app.querySelector('.screen').scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (act === 'coach-next') { S.coach += 1; clearCoach(); showCoach(); return; }
  if (act === 'coach-skip') { S.coach = COACH.length; clearCoach(); return; }
  const kb = e.target.closest('.kb');
  if (kb && act === 'crt') {
    kb.classList.remove('hit'); void kb.offsetWidth; kb.classList.add('hit');
    const crt = kb.closest('.crt'), m = kb.classList.contains('o') ? 'score' : 'hold';
    crt.dataset.mode = crt.dataset.mode === m ? '' : m; clearTimeout(crt._t);
    if (crt.dataset.mode) crt._t = setTimeout(() => { crt.dataset.mode = ''; }, 4000);
    return;
  }
  if (act === 'crt') { const c = t.closest('.crt'); c.classList.remove('blip'); void c.offsetWidth; c.classList.add('blip'); return; }
  if (act === 'goflow') { S.view = 'bill'; S.billTab = 'flow'; renderTable(); return; }
  if (t.dataset.tab) { switchTab(t.dataset.tab); return; }
  if (t.dataset.bill) { S.billTab = t.dataset.bill; renderTable(); return; }
  if (t.dataset.flowcat) { S.flowCat = t.dataset.flowcat; const top0 = app.querySelector('.screen').scrollTop; renderTable(); app.querySelector('.screen').scrollTop = top0; return; }
  if (t.dataset.cal) { const [w, d] = t.dataset.cal.split('-').map(Number); renderDay(d, w); return; }
  if (t.dataset.info) { renderRule(t.dataset.info); return; }
  if (act === 'rflip') { const on = t.classList.toggle('back'); t.setAttribute('aria-pressed', String(on)); const ht = t.parentElement.querySelector('.rhint'); if (ht) ht.textContent = on ? 'TAP TO FLIP BACK' : 'TAP TO FLIP'; return; }
  if (act === 'help') { renderGuide(); return; }
  if (act === 'settings') { if (top.getAttribute('aria-label') === 'Stars') top.remove(); renderSettings(); return; }
  if (act === 'inbox') { app.querySelectorAll('.push').forEach(n => n.remove()); renderInbox(); return; }
  if (t.dataset.pref) { S.prefs[t.dataset.pref] = !S.prefs[t.dataset.pref]; replaceSheet(top, renderSettings); return; }
  if (t.dataset.evat) { S.prefs.eveningAt = +t.dataset.evat; replaceSheet(top, renderSettings); return; }
  if (act === 'settings-save') { S.base = weeklyFrom(S.setup); replaceSheet(top, renderSettings); toast(`Weekly allowance set to $${S.base}, $${dailyBudget()}`); return; }
  if (act === 'coach-reset') { S.coach = 0; S.view = 'home'; top.remove(); renderTable(); return; }
  if (act === 'restart') { clearState(); location.reload(); return; }
  if (act === 'star') { renderStarSheet(); return; }
  // settings can change what home shows, so redraw it on the way out
  if (act === 'close') { const lbl = top.getAttribute('aria-label'); closeSheet(top, lbl === 'Settings' ? renderTable : null); return; }
  if (act === 'draw') { draft = {}; renderDraw(); return; }
  if (t.dataset.pick) {
    if (draft.swiped) return;
    const no = t.dataset.pick, inHand = draft.hand.filter(x => !draft.sel.includes(x)), i = inHand.indexOf(no);
    // a side card comes to the front first; the front card is the one you keep
    if (i !== draft.ci) { draft.ci = i; glide(top.querySelector('.stack'), i, 0, () => replaceSheet(top, renderDraw)); return; }
    if (!keepFront(top, t.closest('.sc2'))) replaceSheet(top, renderDraw);
    return;
  }
  if (t.dataset.unpick) { const no = t.dataset.unpick; draft.sel = draft.sel.filter(x => x !== no); draft.ci = draft.hand.filter(x => !draft.sel.includes(x)).indexOf(no); replaceSheet(top, renderDraw); return; }
  if (act === 'use-rec') { draft.sel = draft.rec.slice(); draft.ci = 0; draft.landed = 'all'; draft.opened = true; replaceSheet(top, renderDraw); return; }
  if (act === 'choose') { keepHand(top); return; }
  if (t.dataset.day) { renderDay(+t.dataset.day); return; }
  if (act === 'log') { if (!S.held.length) { toast('Draw this week’s cards first'); return; } draft = { amt: '', cat: 'takeout', night: S.clock >= 22, note: '' }; renderLog(); return; }
  if (act === 'clock') { renderClock(); return; }
  // demo shortcut: end every remaining weekday as it stands, land on Sunday evening
  if (act === 'jump-sunday') {
    top.remove();
    while (S.day < 6) endDay();
    app.querySelectorAll('.sheet').forEach(n => n.remove());
    S.clock = 21.5; S.view = 'home'; renderTable();
    toast('It’s Sunday night; tap “End today” for the weekly summary');
    return;
  }
  if (t.dataset.clock) {
    top.remove();
    if (t.dataset.clock === 'midnight') { S.autoEnded = true; endDay(); return; }
    const before = alerts(evaluate(S.today))[0];
    S.clock = +t.dataset.clock; renderTable();
    const a = alerts(evaluate(S.today))[0];
    if (S.prefs.evening && S.clock >= S.prefs.eveningAt) pushNote('Done logging?', `It’s ${fmtClock(S.clock)}, tonight’s estimate ${evaluate(S.today).score} pts. When you’re done, tap “End today” and look at the receipt.`);
    else if (S.prefs.ruleAlerts && a && a !== before) pushNote('Your cards', a);
    return;
  }
  if (t.dataset.rv) {
    const [i, how] = t.dataset.rv.split(':'), x = S.revisit.splice(+i, 1)[0];
    let msg;
    if (how === 'buy') { S.today.push({ ...x, night: false, fromWish: true }); msg = 'Logged · wait 24 hours before buying'; }
    else { S.wishSaved = (S.wishSaved || 0) + x.amt; msg = `Skip it, saved $${x.amt}`; }
    const lbl = top.getAttribute('aria-label'); renderTable(); (lbl === 'Notifications' ? renderInbox : renderMorning)(); lastSheet().style.animation = 'none'; toast(msg); return;
  }
  if (act === 'morning-done') { S.autoEnded = false; S.wishSaved = 0; closeSheet(top, renderTable); return; }
  if (act === 'push-close') { t.closest('.push').remove(); return; }
  if (t.dataset.edit) { const i = +t.dataset.edit, x = S.today[i]; draft = { amt: String(x.amt), cat: x.cat, night: !!x.night, note: x.note || '', edit: i, fromWish: x.fromWish }; renderLog(); return; }
  // a favorite picks the category and note, and fills its usual amount when none is typed yet
  if (t.dataset.quick) { const q = S.quicks[+t.dataset.quick]; Object.assign(draft, { cat: q.cat, note: q.label === cat(q.cat).name ? '' : q.label }, q.amt && !draft.amt ? { amt: String(q.amt) } : {}); refreshLog(); return; }
  if (t.dataset.cat) { draft.cat = t.dataset.cat; refreshLog(); return; }
  if (t.dataset.night) { draft.night = t.dataset.night === '1'; refreshLog(); return; }
  if (t.dataset.delivery) { draft.delivery = t.dataset.delivery === '1'; refreshLog(); return; }
  if (t.dataset.newess) { draft.newEss = t.dataset.newess === '1'; refreshLog(); return; }
  if (t.dataset.key) { const k = t.dataset.key; draft.amt = k === 'C' ? '' : k === '⌫' ? draft.amt.slice(0, -1) : (draft.amt + k).replace(/^0+/, '').slice(0, 4); refreshLog(); return; }
  if (act === 'newcat') { draft.adding = !draft.adding; refreshLog(); return; }
  if (act === 'addcat') {
    if (!draft.newName) { toast('Give the new category a name first'); return; }
    const id = 'u' + Date.now();
    CATS.push({ id, name: draft.newName, ess: !!draft.newEss });
    Object.assign(draft, { cat: id, adding: false, newName: '', newEss: false });
    refreshLog(); toast(`Added: ${cat(id).name}`); return;
  }
  if (act === 'savequick') {
    const label = draft.note || cat(logCat()).name;
    const amt = parseInt(draft.amt, 10) || undefined;
    if (!S.quicks.some(q => q.label === label && q.cat === logCat())) { S.quicks.unshift({ label, cat: logCat(), amt }); S.quicks = S.quicks.slice(0, 8); }
    refreshLog(); toast(`Saved: ${label}; it’s at the top of Log next time`); return;
  }
  if (act === 'save') {
    const entry = { cat: logCat(), amt: parseInt(draft.amt, 10), night: !!draft.night, note: draft.note, fromWish: draft.fromWish };
    const before = evaluate(S.today);
    if (draft.edit != null) S.today[draft.edit] = entry; else S.today.push(entry);
    renderTable(); verdict(before, evaluate(S.today)); return;
  }
  if (act === 'del') { const before = evaluate(S.today); S.today.splice(draft.edit, 1); renderTable(); const after = evaluate(S.today); toast(after.mult > before.mult ? `Deleted · mult back to ×${after.mult}` : 'Deleted'); return; }
  if (act === 'wish') { S.wish.push({ cat: logCat(), amt: parseInt(draft.amt, 10), note: draft.note }); renderTable(); toast('Moved to the wish list; we’ll ask again tomorrow · no card broke'); return; }
  if (act === 'end') { if (!S.held.length) { toast('Draw this week’s cards first'); return; } if (bankCaught().length) renderBankCheck(); else renderEnd(); return; }
  if (act === 'end-ok') { t.disabled = true; playStage(top); return; }
  if (act === 'play-next') { t.disabled = true; endDay(); return; }
  if (act === 'unlogged-yes' || act === 'unlogged-no') {
    const y = S.history[S.history.length - 1];
    if (act === 'unlogged-yes') Object.assign(y, y.potential, { unlogged: false });
    y.resolved = true;
    renderTable(); renderMorning(); lastSheet().style.animation = 'none';
    toast(act === 'unlogged-yes' ? `Filled in ${y.score} pts` : 'That day counts as 0 pts. Log a quick entry whenever you spend later');
    return;
  }
  if (act === 'sun-unlogged-yes' || act === 'sun-unlogged-no') {
    const y = S.history[S.history.length - 1];
    if (act === 'sun-unlogged-yes') Object.assign(y, y.potential, { unlogged: false });
    y.resolved = true; S.sunCheck = false;
    top.remove(); settleWeek(); renderTable(); renderWeek();
    return;
  }
  if (act === 'recon' || act === 'recon-skip') {
    const R = S.weekResult, actual = parseInt((top.querySelector('#recon') || {}).value, 10);
    if (act === 'recon' && !(actual >= 0)) { toast('Enter what you really spent this week first'); return; }
    const voided = act === 'recon' && actual > R.logged * RECON_RATIO && actual - R.logged > RECON_SLACK ? R.got : 0;
    const lost = act === 'recon-skip' ? R.got - Math.floor(R.got / 2) : voided;
    S.stars -= lost; S.starsTotal -= lost; R.got -= lost; S.weeks[S.weeks.length - 1].stars = R.got; S.lastResult.stars = R.got;
    R.recon = { actual, voided, skipped: act === 'recon-skip' };
    replaceSheet(top, renderWeek); return;
  }
  if (act === 'week-plan' || act === 'week-back') { S.weekStep = act === 'week-plan' ? 2 : 1; swapSheet(top, renderWeek, false, act === 'week-back'); return; }
  // the new week opens straight on the deal; the shop is a tab in Deck, always open
  if (act === 'to-monday') { swapSheet(top, () => { startWeek(); S.pinned = []; }); return; }
  if (t.dataset.buy) {
    const o = S.shopOffers[+t.dataset.buy]; if (o.sold || S.stars < o.price) return;
    S.stars -= o.price; o.sold = true;
    if (o.kind === 'unlock') S.unlocked.push(o.no); else S.pinned.push(o.no);
    renderTable(); toast(o.kind === 'unlock' ? `Unlocked “${CARDS[o.no].name}”` : `Guaranteed next week: “${CARDS[o.no].name}”`); return;
  }
  if (act === 'reroll') { S.stars -= PRICE.reroll; rollShop(); renderTable(); return; }
  if (act === 'slot') { S.stars -= PRICE.slot; S.slotPending = true; renderTable(); toast('From next week: keep 4 cards, target +25%'); return; }
  if (act === 'glue-buy') { S.stars -= PRICE.glue; S.glue += 1; renderTable(); toast('Bought a bottle of glue; tap a broken card to use it'); return; }
  if (act === 'glue') {
    const no = t.dataset.no; S.glue -= 1; S.glued = { week: S.week, day: S.day, no };
    top.remove(); renderTable(); toast(`Glued back, “${CARDS[no].name}” holds again today +${CARDS[no].plus}`); return;
  }
  if (t.dataset.carry) { S.carry = t.dataset.carry; replaceSheet(top, renderWeek); return; }
  if (t.dataset.stake) { S.nextStake = +t.dataset.stake; replaceSheet(top, renderWeek); return; }
});
