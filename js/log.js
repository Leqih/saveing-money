/* ---------- log: preview before saving, verdict after ---------- */
function renderLog() {
  const editing = draft.edit != null;
  const amt = parseInt(draft.amt || '0', 10);
  const c = cat(draft.cat);
  const base = editing ? S.today.filter((_, i) => i !== draft.edit) : S.today;
  const before = evaluate(S.today);
  // with no amount typed there is nothing to preview, even if the after-10-pm switch is on
  const after = amt ? evaluate([...base, { cat: logCat(), amt, night: !!draft.night, fromWish: draft.fromWish }]) : before;
  const broke = after.cards.filter((x, k) => x.state === 'broken' && before.cards[k].state !== 'broken').map(x => CARDS[x.no].name);
  const woke = after.cards.filter((x, k) => x.state === 'on' && before.cards[k].state === 'pending').map(x => CARDS[x.no].name);
  const near = after.cards.map(x => x.near).filter(Boolean)[0];
  const slip = slipped(before, after).map(slipWhy);
  // the one line that matters, pinned above the save button so it is never scrolled away
  const tone = !amt ? '' : broke.length || slip.length ? 'bad' : 'good';
  const head = !amt ? 'Enter an amount to see if a card breaks'
    : broke.length ? (broke.length > 2 ? `Breaks ${broke.length} cards` : `Will break: ${broke.join(', ')}`) : slip.length ? (slip.length > 1 ? `Mult drops ${slip.length} ways` : `Mult drops: ${slip[0]}`) : woke.length ? `${woke.join(', ')} will wake ✓` : 'No rule touched ✓';
  const sub = !amt ? `Left to spend today ${money(before.left)} · tonight ${before.score} pts`
    : `Tonight ${before.score} → ${after.score} pts · left ${money(after.left)}`;
  // before an amount is typed nothing can break, so only hint at the wishlist once there is something to save
  const extra = amt && broke.length > 2 ? broke.join(' · ') : amt && after.left < 0 ? `Over by $${-after.left}, taken from tomorrow` : amt && near ? near : amt && broke.length ? 'Wish-list it instead: no card breaks, decide tomorrow' : '';
  const quicks = S.quicks.map((q, i) => `<button class="chip qchip ${draft.cat === q.cat && (draft.note || '') === (q.label === cat(q.cat).name ? '' : q.label) ? 'on' : ''}" data-quick="${i}">${esc(q.label)}</button>`).join('');
  const cats = CATS.map(k => `<button class="cap ${k.id === draft.cat ? 'orange' : ''}" aria-pressed="${k.id === draft.cat}" data-cat="${k.id}"><div class="top">${esc(k.name)}${k.ess ? '<small>Essential</small>' : ''}</div></button>`).join('')
    + `<button class="cap" data-act="newcat" aria-expanded="${!!draft.adding}"><div class="top">+ New category</div></button>`;
  const pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(k => `<button class="cap ${/[C⌫]/.test(k) ? 'dark' : ''}" data-key="${k}" aria-label="${k === '⌫' ? 'Delete one digit' : k === 'C' ? 'Clear' : k}"><div class="top">${k}</div></button>`).join('');
  sheet(editing ? 'Edit entry' : 'Log', `
    <div class="bar-top"><h1>${editing ? 'Edit entry' : 'Log'}</h1>${CLOSE_BTN}</div>
    <div class="amount"><b>$${amt}</b>${draft.cat === 'meal' ? `<button class="mini ${draft.delivery ? 'on' : ''}" data-delivery="${draft.delivery ? 0 : 1}" aria-pressed="${!!draft.delivery}">Delivered</button>` : ''}<span class="px" style="color:#5E5E66;font-size:12px;text-align:right">${DAYS[S.day]} ${fmtClock(S.clock)}<br>${cat(logCat()).name}</span></div>
    ${quicks ? `<div class="quick" role="group" aria-label="Favorites">${quicks}</div>` : ''}
    <div class="cats">${cats}</div>
    <div class="field"><input class="in" id="note" maxlength="24" value="${esc(draft.note || '')}" placeholder="What was it? (optional)" aria-label="Note">
      <button class="mini ${draft.night ? 'on' : ''}" data-night="${draft.night ? 0 : 1}" aria-pressed="${!!draft.night}">after 10 pm</button>
      <button class="mini" data-act="savequick">Save favorite</button></div>
    <div class="padwrap"><div class="pad" ${draft.adding ? 'inert style="visibility:hidden"' : ''}>${pad}</div>${draft.adding ? `<div class="newcat">
      <div class="field"><input class="in" id="newcat" maxlength="16" value="${esc(draft.newName || '')}" placeholder="Name, e.g. Game top-up" aria-label="New category name"><button class="mini" data-act="addcat">Add</button></div>
      <div class="toggle"><button aria-pressed="${!draft.newEss}" data-newess="0">Outside the allowance</button><button aria-pressed="${!!draft.newEss}" data-newess="1">Essential</button></div>
    </div>` : ''}</div>
    <div class="logfoot">
      <div class="vline ${tone}"><div class="vtext"><b>${head}</b><span class="px">${sub}</span>${extra ? `<small>${extra}</small>` : ''}</div>
        <div class="vmult" aria-label="Mult ×${amt ? after.mult : before.mult}">${amt && after.mult !== before.mult ? `<s>×${before.mult}</s>` : '<small>Mult</small>'}<b>×${amt ? after.mult : before.mult}</b></div></div>
      ${editing ? `<div class="actions">
        <button class="cap dark" data-act="del"><div class="top">Delete entry</div></button>
        <button class="go" data-act="save" ${amt ? '' : 'disabled'}>Save changes</button>
      </div>` : `<div class="actions">
        <button class="cap ${broke.length ? 'lime' : ''}" data-act="wish" ${!amt || c.ess ? 'disabled' : ''}><div class="top">${broke.length ? 'Move to wish list first' : 'Wish list'}</div></button>
        <button class="go" data-act="save" ${amt ? '' : 'disabled'}>${broke.length ? 'Log anyway' : 'Log it'}</button>
      </div>`}
    </div>`);
}
// redraw the log sheet in place after a pick, keeping its scroll
const refreshLog = () => replaceSheet(lastSheet(), renderLog);
// a delivered meal is takeout, not a meal: it doesn't hide inside the meal allowance or dodge Takeout Nemesis
const logCat = () => draft.cat === 'meal' && draft.delivery ? 'takeout' : draft.cat;
// the moment right after saving: a cracked card, a waking card, or a quick all-clear
function verdict(before, after) {
  const broke = after.cards.filter((x, k) => x.state === 'broken' && before.cards[k].state !== 'broken');
  const woke = after.cards.filter((x, k) => x.state === 'on' && before.cards[k].state === 'pending');
  if (!broke.length && !woke.length) {
    const near = after.cards.map(x => x.near).filter(Boolean)[0];
    const slip = slipped(before, after).map(slipWhy);
    toast(slip.length ? `Logged · ${slip.join(', ')}, mult ×${before.mult} → ×${after.mult}` : after.left < 0 && after.left < before.left ? `Logged · overdrawn $${-after.left}, taken from tomorrow’s allowance` : near ? `Logged · ${near}` : `No rule touched ✓ mult is still ×${after.mult}`);
    app.querySelectorAll('.hcard.on').forEach(n => n.classList.add('glow'));
    return;
  }
  const shown = broke.length ? broke : woke;
  app.insertAdjacentHTML('beforeend', `<div class="fb ${broke.length ? 'bad' : 'good'}" role="alert" data-act="fb-close">
    <div class="fb-tag"><i class="fb-clip" aria-hidden="true"></i><div class="fb-card"><div class="fb-in">
      <span class="fb-since">${DAYS[S.day]} · ${fmtClock(S.clock)}</span>
      <div class="fb-cards">${shown.map(x => `<div class="${broke.length ? 'shake' : 'pop'}">${scaled(CARDS[x.no], 0.5, broke.length ? 'broken' : 'on')}</div>`).join('')}</div>
      <b>${broke.length ? `${shown.map(x => CARDS[x.no].name).join(', ')} broke!` : `${shown.map(x => CARDS[x.no].name).join(', ')} woke up ✓`}</b>
      <div class="fb-sts" aria-label="Mult ×${before.mult} to ×${after.mult}, tonight’s estimate ${before.score} to ${after.score} pts"><span class="st-g"><i>Mult</i><b>×${before.mult}→×${after.mult}</b></span><span class="st-b"><b>${before.score}→${after.score}</b><i>Tonight’s pts</i></span></div>
      <small>${broke.length ? (after.cards.every(x => x.state !== "on") ? (after.left > 0 ? `Every card broke, mult ×${after.mult}. The money left still counts: keep ${money(after.left)} and tonight is ${after.score} pts.` : `Every card broke, and today’s money is gone too.`) : shown.some(x => CARDS[x.no].weekly) ? "Weekly cards stay broken until Sunday, and going over again costs more multiplier on the day it happens." : shown.some(x => x.saved) ? `Stop-loss: spend nothing more outside the allowance today and the broken card gives back half its multiplier tonight. Back at midnight.` : "Back at midnight. Your other cards can still hold today.") : "The more cards you hold today, the higher the score."}${after.left < 0 ? ` You’re already over by $${-after.left}, taken from tomorrow’s allowance.` : ""}</small>
      <button class="ok" data-act="fb-close">Got it</button>
    </div></div></div>
  </div>`);
}

/* ---------- receipts, end of day, info sheets ---------- */
function receiptHTML(h, preview) {
  const br = breakers(h.entries, h.held, h.teaBefore, h.weekBefore || 0);
  const rows = h.entries.map((x, i) => {
    const ess = !!cat(x.cat).ess;
    return `<div class="r ${ess ? 'off' : br[i] ? 'hitc' : ''}"><span>${entryName(x)}${ess ? '<i>Essential</i>' : ''}${x.night ? '<i>after 10 pm</i>' : ''}${br[i] ? `<i class="hit">Broke ${br[i].join(', ')}</i>` : ''}</span><span>$${x.amt}</span></div>`;
  }).join('') || '<div class="r off"><span>Nothing spent this day</span><span>$0</span></div>';
  const cards = h.cards.map(c => `<div class="r ${c.state === 'on' ? '' : 'off'}"><span>${c.state === 'on' ? '' : c.state === 'pending' ? 'zzz ' : 'Broke '}${CARDS[c.no].name}${c.why ? ' · ' + c.why : ''}${c.saved ? ' · stop-loss' : ''}</span><span>${gainStr(gainOf(c))}</span></div>`).join('');
  const all = h.cards.every(c => c.state === 'on');
  return `<div class="receipt">${h.unlogged ? `<span class="stamp no">Not logged</span>` : all ? `<span class="stamp">All held</span>` : ""}
    <span class="cap-t">Week ${h.week} · ${DAYS[h.day]}</span>
    <hr>${rows}<hr>
    ${overOf(h.entries) ? `<div class="r"><span>Essentials over the daily $${essQuota}</span><span>+$${overOf(h.entries)}</span></div>` : ''}
    ${h.debtIn ? `<div class="r hitc"><span>Overdrawn yesterday</span><span>−$${Math.min(h.debtIn, dailyBudget())}</span></div>` : ""}
    <div class="r"><span>Allowed today</span><span>$${h.daily}</span></div>
    <div class="r"><span>Spent outside the allowance</span><span>$${h.extra}</span></div>
    <div class="r"><span>Money left = base score</span><span>${h.base}</span></div>
    <hr><div class="r"><span>Mult starts at ${h.baseMult || 1}${(h.baseMult || 1) > 1 ? ` (graduated ${h.baseMult - 1})` : ""}</span><span>${h.baseMult || 1}</span></div>${cards}<hr>
    <div class="tot"><span class="px">${h.base} × ${h.mult}</span><b>${h.score} pts</b></div>
    ${h.extra > h.daily ? `<p class="note left" style="margin:4px 0 0">Over by $${h.extra - h.daily}, tomorrow takes at most $${debtCap()}${h.extra - h.daily > debtCap() ? `; the extra $${h.extra - h.daily - debtCap()} each add to this week’s target +${OVERFLOW_PTS}` : ''}.</p>` : ""}
    ${receiptStickers(h)}
  </div>`;
}
// the sticker collage at the foot of a receipt: a barcode label, a smiley, a total price tag and a one-line verdict
function receiptStickers(h) {
  const all = h.cards.every(c => c.state === 'on'), say = h.unlogged ? 'Log it tomorrow' : all ? 'Held it all!' : h.score > 0 ? 'Next time' : 'Don’t give up';
  const bars = Array.from({ length: 22 }, (_, i) => `<i style="width:${[1, 2, 1, 3, 1, 1, 2][(i * 5 + h.day) % 7]}px"></i>`).join('');
  return `<div class="rfoot" aria-hidden="true">
    <span class="rs rs-bar" style="--r:-4deg;--d:0ms"><span class="bars">${bars}</span><small>RC-W${String(h.week).padStart(2, '0')}D${h.day + 1}-${String(h.score).padStart(3, '0')}</small></span>
    <span class="rs rs-smile" style="--r:8deg;--d:140ms"><svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FF7BB8"/><path d="M11 17q3-4 6 0M23 17q3-4 6 0M12 25q8 8 16 0" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round"/></svg></span>
    <span class="rs rs-tag" style="--r:3deg;--d:280ms"><small>TOTAL</small><b>${h.score}</b></span>
    <span class="rs rs-say" style="--r:-7deg;--d:420ms">${say}</span>
  </div>`;
}
function dayRecord() {
  const ev = evaluate(S.today);
  const h = { week: S.week, day: S.day, baseMult: S.baseMult, held: S.held.slice(), teaBefore: S.teaWeek, weekBefore: weekExtraSoFar(), debtIn: S.debt, entries: S.today.map(x => ({ ...x })), extra: ev.d.extra, daily: ev.daily, base: ev.base, mult: ev.mult, score: ev.score, cards: ev.cards };
  // a day with nothing logged is not a perfect day: it scores 0 until the user confirms next morning that nothing was spent
  if (!S.today.length) {
    // confirming "spent nothing" only restores the money: an unlogged day can't prove any card held, so no card adds multiplier
    const asleep = ev.cards.map(c => ({ ...c, state: "pending", gain: 0, saved: false, why: "Nothing logged today" }));
    Object.assign(h, { unlogged: true, base: 0, score: 0, mult: S.baseMult, cards: asleep, potential: { base: ev.base, mult: S.baseMult, score: ev.base * S.baseMult, cards: asleep.map(c => ({ ...c, why: "Not logged, base score only" })) } });
  }
  return h;
}
// the nightly ritual: the money left drops in as the base, each held card lights up and adds its multiplier, then the score
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// a tap anywhere during tonight's count fast-forwards it to the result
let rush = false;
const pause = ms => new Promise(r => setTimeout(r, reducedMotion() || rush ? 0 : ms));
function countTo(el, to, ms) {
  return new Promise(res => {
    const from = parseFloat(el.textContent) || 0, t0 = performance.now();
    if (reducedMotion() || rush) { el.textContent = to; return res(); }
    // setTimeout rather than rAF so it still finishes when the tab is in the background
    const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); k < 1 ? setTimeout(step, 16) : res(); };
    step();
  });
}
async function playStage(sh) {
  const h = dayRecord(), prior = scorePrior(), target = weekTarget();
  const pct = v => Math.min(100, Math.round(v / target * 100));
  sh.innerHTML = `
    <div class="bar-top"><h1>${DAYS[S.day]} · tonight’s cards</h1><span class="chipk" style="background:${STAKES[S.stake].bg};color:${STAKES[S.stake].fg}">${STAKES[S.stake].name}</span></div>
    <div class="stage-orbs"><div class="blob"><b id="pb">0</b><span>Base score = money left</span></div><span class="stage-x">×</span><div class="blob m"><b id="pm">${S.baseMult}</b><span>Mult</span></div></div>
    <div class="stage-cards">${h.cards.map(c => `<div class="sc ${c.state === 'on' ? '' : 'dim'}" data-no="${c.no}">${scaled(CARDS[c.no], h.cards.length > 3 ? 0.36 : 0.46, c.state)}<span class="sc-tag" aria-hidden="true"></span></div>`).join('')}</div>
    <div class="impact lines" id="pl"></div>
    <div class="score-oval"><small id="pf">tonight</small><b id="ps">0</b></div>
    <div class="cap meter"><div class="top"><div class="row"><span>Weekly Score</span><span class="px" id="pw">${prior} / ${target}</span></div><div class="bar"><i id="pwb" style="width:${pct(prior)}%"></i></div></div></div>
    <p class="skiphint px" id="sk">Tap anywhere to skip ahead</p>
    <button class="go" data-act="play-next" id="pn" style="visibility:hidden">${S.day === 6 ? 'See weekly summary' : 'On to tomorrow'}</button>`;
  sh.classList.add('tonight'); sh.scrollTop = 0; pinFoot(sh);
  rush = false; const stop = () => { rush = true; }; sh.addEventListener('pointerdown', stop);
  const $ = id => sh.querySelector('#' + id);
  const tag = (el, txt, cls) => { const t = el.querySelector('.sc-tag'); t.textContent = txt; t.className = `sc-tag ${cls} on ${cls === 'bad' ? 'slam' : ''}`; };
  // a card duel: each card that holds is played up into the multiplier lamp and lands with a hit; a card that broke gets knocked back
  const lampM = sh.querySelector('.blob.m'), still = () => rush || reducedMotion();
  const toSheet = r => { const k = sh.getBoundingClientRect(), z = k.width / sh.offsetWidth; return { x: (r.left - k.left) / z, y: (r.top - k.top) / z + sh.scrollTop, w: r.width / z, h: r.height / z }; };
  const anim = (e, kf, o) => still() ? Promise.resolve() : e.animate(kf, { fill: 'forwards', ...o }).finished.catch(() => {});
  const drop = (cls, x, y, html = '') => { const d = document.createElement('div'); d.className = cls; d.style.left = x + 'px'; d.style.top = y + 'px'; d.innerHTML = html; sh.appendChild(d); return d; };
  const hit = async (text, bad) => {
    if (still()) return;
    const d = toSheet(lampM.getBoundingClientRect()), cx = d.x + d.w / 2, cy = d.y + d.h / 2;
    const ring = drop('fxring', cx, cy), word = drop('fxfloat' + (bad ? ' bad' : ''), cx, cy, text);
    const bits = Array.from({ length: 10 }, (_, k) => { const b = drop('fxbit', cx, cy), a = k / 10 * Math.PI * 2; b.style.background = bad ? '#FF4D6A' : k % 2 ? '#E4FF1A' : '#FFF'; return [b, a]; });
    lampM.animate([{ transform: 'scale(1)' }, { transform: bad ? 'scale(.88)' : 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 340, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    sh.animate([{ translate: '0 0' }, { translate: '4px -3px' }, { translate: '-3px 2px' }, { translate: '0 0' }], { duration: 180 });
    ring.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(2.3)', opacity: 0 }], { duration: 480, easing: 'ease-out' }).finished.then(() => ring.remove());
    word.animate([{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.25 }, { transform: 'translate(-50%,-190%) scale(1)', opacity: 0 }], { duration: 850, easing: 'ease-out' }).finished.then(() => word.remove());
    bits.forEach(([b, a]) => b.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * 62}px), calc(-50% + ${Math.sin(a) * 62}px)) scale(0)`, opacity: 0 }], { duration: 520, easing: 'ease-out' }).finished.then(() => b.remove()));
    await wait(160);
  };
  const wait = ms => still() ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
  const playHeld = async (el, text) => {
    if (still()) return;
    const a = toSheet(el.getBoundingClientRect()), d = toSheet(lampM.getBoundingClientRect());
    const dx = d.x + d.w / 2 - (a.x + a.w / 2), dy = d.y + d.h / 2 - (a.y + a.h / 2);
    const c = el.cloneNode(true); c.removeAttribute('data-no'); c.className = 'fxcard'; c.style.cssText = `left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${a.h}px`;
    sh.appendChild(c); el.style.opacity = '0.25';
    await anim(c, [{ transform: 'none' }, { transform: 'translate(0,-14px) scale(1.14) rotate(-5deg)', offset: 0.28 }, { transform: `translate(${dx}px,${dy}px) scale(.42) rotate(16deg)` }], { duration: 560, easing: 'cubic-bezier(.45,0,.75,.55)' });
    c.remove(); el.style.opacity = '';
    await hit(text, false);
  };
  const playBroke = async (el, gain) => {
    if (still()) return;
    await anim(el, [{ transform: 'none' }, { transform: 'translateX(-7px) rotate(-3deg)' }, { transform: 'translateX(7px) rotate(3deg)' }, { transform: 'translateX(-4px)' }, { transform: 'none' }], { duration: 360 });
    if (gain) await hit(gainStr(gain), gain < 0);
  };
  const line = (l, r, cls = '') => $('pl').insertAdjacentHTML('beforeend', `<div class="r ${cls}"><span>${l}</span><span>${r}</span></div>`);
  await pause(300);
  if (h.unlogged) {
    line('Nothing logged today', 'Base score starts at 0');
    line(`${S.day === 6 ? 'Before the weekly summary' : 'Tomorrow morning'} you’ll be asked: if you really spent nothing, the base score is restored; cards add no multiplier`, '', 'off');
  } else {
    line(`Allowed $${h.daily} · spent outside $${h.extra}`, `Base ${h.base}`);
    await countTo($('pb'), h.base, 600);
    let mult = S.baseMult;
    if (S.baseMult > 1) line(`Graduated cards start the multiplier at ${S.baseMult}`, `×${S.baseMult}`);
    for (const c of h.cards) {
      const card = CARDS[c.no], el = sh.querySelector(`.sc[data-no="${c.no}"]`);
      await pause(160);
      if (c.state !== 'on') {
        const g = gainOf(c);
        tag(el, c.state === 'pending' ? 'zzz' : c.saved ? `Stop-loss ${gainStr(g)}` : 'Broke', c.saved ? 'good' : 'bad');
        await playBroke(el, g);
        line(`${card.name} · ${c.why}${c.saved ? ' · stop-loss' : ''}`, gainStr(g), g > 0 ? '' : 'off');
        if (g) { mult = Math.max(1, mult + g); await countTo($('pm'), mult, 350); }
        continue;
      }
      await playHeld(el, `+${gainOf(c)}`);
      el.classList.add('pop'); mult += gainOf(c);
      tag(el, `+${gainOf(c)}`, 'good');
      await countTo($('pm'), mult, 350);
    }
  }
  $('pf').textContent = `${h.base} × ${h.mult} =`;
  await countTo($('ps'), h.score, 800);
  $('pw').textContent = `${prior + h.score} / ${target}`;
  $('pwb').style.width = pct(prior + h.score) + '%';
  if (prior < target && prior + h.score >= target) line('This week’s target score reached!', 'Cleared ✓', 'sum');
  sh.removeEventListener('pointerdown', stop); rush = false; $('sk').style.visibility = 'hidden';
  const n = $('pn'); n.style.visibility = ''; n.focus();
}
function renderEnd() {
  sheet('End today', `
    <div class="bar-top"><h1>${DAYS[S.day]} · End today</h1>${CLOSE_BTN}</div>
    <div class="prt" aria-hidden="true"><div class="prt-plate"><i class="led"></i>RECEIPT PRINTING</div><div class="prt-slot"><i class="prt-lip"></i></div></div>
    <div class="rcpt-win print">${receiptHTML(dayRecord(), true)}</div>
    <div class="actions"><button class="cap" data-act="close"><div class="top">Add more</div></button><button class="go" data-act="end-ok">Play cards, end today</button></div>`);
}
function renderDay(i, week = S.week) {
  const h = S.history.find(x => x.week === week && x.day === i);
  if (!h) return;
  const d = dateOf(week, i);
  sheet(`${DAYS[i]} receipt`, `<div class="bar-top"><h1>${MON[d.getMonth()]} ${d.getDate()} · ${DAYS[i]}</h1>${CLOSE_BTN}</div>${receiptHTML(h)}`);
}
function renderRule(no) {
  const c = CARDS[no], log = S.cardLog[no], heldNow = S.held.includes(no);
  const cur = heldNow ? evaluate(S.today).cards.find(x => x.no === no) : null;
  const hasData = S.lastWeek.some(d => d.length), sim = hasData && !heldNow ? simulate([no], S.lastWeek, S.weekStart) : null;
  const state = !cur ? '' : (cur.state === 'on' ? [`Still holding today, mult +${c.plus}.`, cur.near && sentence(cur.near)]
    : cur.state === 'pending' ? ['Still asleep: log one entry today to wake it.']
    : [sentence(`Broke today: ${cur.why}`), ...(c.weekly ? ['Stays broken until Sunday.', cur.gain < 0 && `Over again today, mult ${gainStr(cur.gain)}.`]
      : [cur.saved && `After it broke you spent nothing more outside the allowance: stop-loss +${cur.gain}.`, 'Back at midnight.'])]).filter(Boolean).join(' ');
  const stopLoss = c.penalty && !c.weekly ? 'No stop-loss, and glue can’t fix it: it costs 3 multiplier tonight.' : c.weekly ? '' : Math.floor(c.plus / 2) ? `Spend nothing more outside the allowance today and get half the multiplier back tonight (+${Math.floor(c.plus / 2)}).` : 'This card is only +1; it can’t be earned back once broken.';
  const core = coreOf(no), notUnlocked = !S.unlocked.includes(no) && !S.grad.includes(no) && c.unlock;
  const grad = c.noGrad ? `${log ? `Used for ${log.weeks} weeks, held ${log.held}/${log.days} days. ` : ''}Log one entry and it’s held; it never graduates.` : S.grad.includes(no) ? 'Already graduated: base mult +1.' : `Hold 6/7 days for ${GRAD_WEEKS} weeks to graduate: base mult +1 for good.`;
  const prog = !c.noGrad && !S.grad.includes(no) ? `<span class="rprog">${Array.from({ length: GRAD_WEEKS }, (_, q) => `<i class="${log && q < (log.streak || 0) ? 'on' : ''}"></i>`).join('')}<em>${log ? log.streak || 0 : 0}/${GRAD_WEEKS}</em></span>` : '';
  const sh = sheet(c.name, `
    <div class="bar-top"><h1>Rule card</h1>${CLOSE_BTN}</div>
    <div class="rstage">
      <button class="rflip" data-act="rflip" aria-pressed="false" aria-label="Flip the card to read the rule">
        <span class="rface rfront"><span class="rscale">${cardHTML(c, cur ? cur.state : 'on')}</span></span>
        <span class="rface rback">
          <small>No.${c.no} · ${c.name} · ${c.weekly ? 'Weekly' : 'Daily'}</small>
          ${cur ? `<div class="rnote today ${cur.state}"><i></i>${state}</div>` : ''}
          ${notUnlocked ? `<div class="rnote ink">Unlocks automatically at ★${c.unlock} stars in total (now ★${S.starsTotal}), or buy it early in the shop for ★${Math.max(1, Math.round(c.unlock / 2))}.</div>` : ''}
          <h3>Example</h3><p>${c.eg}</p>
          ${stopLoss && c.broken ? `<h3>After it breaks</h3><p>${stopLoss}</p>` : ''}
          <h3>Graduating</h3><p>${grad}</p>${prog}
          ${clashNames(no).length ? `<h3>Can’t be kept with</h3><p>${clashNames(no).join(', ')}</p>` : ''}
          ${sim ? `<p class="rsim">${S.estimated ? 'By your estimate' : 'By last week’s ledger'}: about <b class="rbig">${sim.per[no]}/${sim.days}</b> days held.</p>` : ''}
        </span>
      </button>
      <span class="rcook"><b>+${c.plus}</b><small>Mult</small></span>
      <span class="rhint px">TAP TO FLIP</span>
    </div>
    ${cur && cur.state === 'broken' && !c.noGlue ? (S.glue ? `<button class="cap lime bigbtn" data-act="glue" data-no="${no}"><div class="top">Glue it back (${S.glue} left)</div></button>` : '') : ''}`);
  sh.classList.add('rulec'); sh.style.setProperty('--rc', core);
}
