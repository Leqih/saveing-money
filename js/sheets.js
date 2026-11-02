/* ---------- the bank is the referee: you still log every purchase, the bank checks the night ---------- */
const FEED_POOL = [['Starbucks #12345', 6], ['DoorDash*Chipotle', 32], ['Uber *Trip', 18], ['Amazon.com*2K4LM', 42], ['Dunkin’ #3321', 4], ['Whole Foods Market', 62], ['MTA*NYCT PAYGO', 3], ['Lyft *Ride', 15]];
const sampleFeed = () => FEED_POOL.slice().sort(() => Math.random() - 0.5).slice(0, 4).map(([desc, amt], i) => ({ id: i, desc, amt, cat: guessCat(desc), state: 'open' }));
// a purchase you logged yourself matches the bank's by amount (within a dollar); anything left over was forgotten
const loggedAs = tx => S.today.some(e => !e.caught && Math.abs(e.amt - tx.amt) <= 1);
const bankCaught = () => S.bank ? S.bank.feed.filter(tx => tx.state === 'open' && !loggedAs(tx)) : [];
let BNK = null;
function renderBankLink() {
  const B = BNK;
  const body = B.step === 'busy' ? `<div class="imp-busy"><i></i><b>Connecting to ${esc(B.bank)}…</b><small>Read-only link</small></div>`
    : B.step === 'done' ? `<div class="bk-done"><i>✓</i><b>${esc(B.bank)} is connected</b><p>Keep logging as you go. Tonight, before the cards are scored, we check your log against the bank.</p></div>`
    : `<ol class="bk-steps">
        <li><b>You still play every purchase.</b><span>Log it yourself and see what breaks before you buy. That’s the game.</span></li>
        <li><b>The bank checks the night.</b><span>Read-only: date, merchant and amount. We can’t move money, and you can disconnect any time.</span></li>
        <li><b>Forgot one? You’ll catch it.</b><span>Add anything you missed before tonight is scored. Logging a purchase before it shows up at the bank keeps your honest streak: 7 nights earns a free Glue bottle.</span></li>
      </ol>
      <h2>Choose your bank <small>Demo account, no real login</small></h2>
      <div class="imp-banks">${BANKS.map(b => `<button class="imp-bank" data-act="bank-pick" data-bank="${b}"><i>${b[0]}</i><b>${b}</b><span aria-hidden="true">›</span></button>`).join('')}</div>`;
  sheet('Bank', `
    <div class="bar-top"><h1>${B.step === 'done' ? 'Connected' : 'Connect a bank'}</h1>${CLOSE_BTN}</div>
    ${body}${B.step === 'done' ? '<button class="go" data-act="close">Got it</button>' : ''}`);
}
// before the night is scored: purchases the bank saw that you never logged
function renderBankCheck() {
  const rows = bankCaught(), name = S.bank.name;
  const breaks = tx => { const before = evaluate(S.today), after = evaluate([...S.today, { cat: tx.cat, amt: tx.amt }]); return after.cards.filter((x, k) => x.state === 'broken' && before.cards[k].state !== 'broken').map(x => CARDS[x.no].name); };
  sheet('Bank check', `
    <div class="bar-top"><h1>Bank check</h1>${CLOSE_BTN}</div>
    ${rows.length ? `<p class="note left" style="margin:0">${esc(name)} shows ${rows.length} purchase${rows.length > 1 ? 's' : ''} you didn’t log. Add what’s yours so tonight’s score is accurate, and skip the rest.</p>` : '<div class="bk-done"><i>✓</i><b>All caught up</b><p>Everything the bank saw is in your log.</p></div>'}
    <div class="imp-list">${rows.map(tx => { const br = breaks(tx); return `<div class="imp-row bk-row">${catBadge(tx.cat)}<span class="imp-main"><b>${esc(tx.desc)}</b><small>${cat(tx.cat).name}</small>${br.length ? `<em class="bk-br">Breaks ${br.join(', ')}</em>` : ''}</span><span class="px imp-amt">$${tx.amt}</span><span class="bk-btns"><button class="mini on" data-act="bank-add" data-id="${tx.id}">Add</button><button class="mini" data-act="bank-no" data-id="${tx.id}">Not mine</button></span></div>`; }).join('')}</div>
    <button class="go" data-act="bank-continue" ${rows.length ? 'disabled' : ''}>${rows.length ? `${rows.length} left to check` : 'Continue to tonight'}</button>`);
}

/* ---------- monthly review ---------- */
const HABITS = [
  { name: 'Takeout', test: x => x.cat === 'takeout' }, { name: 'Coffee & Tea', test: x => x.cat === 'tea' }, { name: 'Rideshare', test: x => x.cat === 'taxi' },
  { name: 'Online', test: x => x.cat === 'online' }, { name: 'Ordered after 10 pm', test: x => !!x.night }
];
function monthStats(y, m) {
  const recs = S.history.map(h => ({ h, d: dateOf(h.week, h.day) })).filter(o => o.d.getFullYear() === y && o.d.getMonth() === m);
  const spent = recs.reduce((a, o) => a + o.h.extra, 0), allowed = dailyBudget() * recs.length;
  const cards = {};
  recs.forEach(o => o.h.cards.forEach(c => { const k = cards[c.no] || (cards[c.no] = { held: 0, days: 0 }); k.days++; if (c.state === 'on') k.held++; }));
  const weeks = [...new Set(recs.map(o => o.h.week))].sort((a, b) => a - b);
  // habits as "times per week", so a 4-day first week compares fairly with a full one
  const rate = (w, test) => { const days = recs.filter(o => o.h.week === w); return days.length ? Math.round(days.reduce((a, o) => a + o.h.entries.filter(test).length, 0) / days.length * 7 * 10) / 10 : 0; };
  // a week with only a day or two in this month says too little, so compare weeks with at least three days
  const full = weeks.filter(w => recs.filter(o => o.h.week === w).length >= 3);
  const habits = full.length > 1 ? HABITS.map(hb => ({ name: hb.name, first: rate(full[0], hb.test), last: rate(full[full.length - 1], hb.test) })).filter(hb => hb.first || hb.last) : [];
  const best = recs.slice().sort((a, b) => b.h.score - a.h.score)[0];
  return {
    recs, full, days: recs.length, spent, allowed, score: recs.reduce((a, o) => a + o.h.score, 0), zero: recs.filter(o => o.h.extra === 0).length,
    allHeld: recs.filter(o => o.h.cards.every(c => c.state === 'on')).length, cards, weeks, habits, best,
    settled: (S.weeks || []).filter(w => weeks.includes(w.week)).length, passes: (S.weeks || []).filter(w => weeks.includes(w.week) && w.pass).length, stars: (S.weeks || []).filter(w => weeks.includes(w.week)).reduce((a, w) => a + w.stars, 0),
    grads: (S.gradLog || []).filter(g => g.date.getFullYear() === y && g.date.getMonth() === m)
  };
}
function reviewHTML(y, m) {
  const st = monthStats(y, m);
  if (!st.days) return '<p class="note">No day has been ended this month yet. Tonight, tap "End today" and data will start showing up here.</p>';
  const saved = st.allowed - st.spent;
  const cardRows = Object.entries(st.cards).sort((a, b) => b[1].held / b[1].days - a[1].held / a[1].days).map(([no, k]) => `<div class="hrow"><span class="hico" style="background:${tintOf(no)}">${artIcon(no, 26)}</span><span><b>${CARDS[no].name}</b><i style="width:${Math.round(k.held / k.days * 100)}%;background:${coreOf(no)}"></i></span><span class="px">${k.held}/${k.days} days${S.grad.includes(no) ? ' · Graduated' : ''}</span></div>`).join('');
  const habits = st.full.length > 1 && st.habits.length
    ? st.habits.map(hb => { const d = hb.last - hb.first; return `<div class="trend ${d < 0 ? 'down' : d > 0 ? 'up' : ''}"><b>${hb.name}</b><span class="px">Weekly ${hb.first} × → ${hb.last} ×</span><em>${d < 0 ? `Down ${Math.round(-d * 10) / 10} ×` : d > 0 ? `Up ${Math.round(d * 10) / 10} ×` : 'No change'}</em></div>`; }).join('')
    : `<div class="lockrow"><svg width="18" height="20" viewBox="0 0 18 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="2" y="9" width="14" height="9" rx="3" fill="currentColor" stroke="none"/><path d="M5 9V6a4 4 0 0 1 8 0v3"/></svg><span>${st.full.length > 1 ? 'No takeout, coffee, rideshare, online or late-night spending was logged this month.' : 'Habit trends unlock after two weeks with 3+ logged days each.'}</span></div>`;
  // one bar per logged day: spending outside the allowance, red when it was more than a day's allowance, with the allowance as a dashed line
  const per = dailyBudget(), top = Math.max(per * 1.6, ...st.recs.map(o => o.h.extra), 1);
  const chart = `<div class="mchart" role="img" aria-label="Spending outside the allowance for each logged day"><i class="mline" style="bottom:${Math.round(per / top * 84)}px"><em>Allowance $${per}</em></i>${st.recs.map(o => `<span class="mbar ${o.h.extra === 0 ? 'zero' : o.h.extra > per ? 'over' : ''}" style="height:${o.h.extra === 0 ? 6 : Math.max(8, Math.round(o.h.extra / top * 84))}px" title="${MON[o.d.getMonth()]} ${o.d.getDate()}: $${o.h.extra}"></span>`).join('')}</div>
    <div class="mrange"><span>${MON[st.recs[0].d.getMonth()]} ${st.recs[0].d.getDate()}</span><span>${MON[st.recs[st.recs.length - 1].d.getMonth()]} ${st.recs[st.recs.length - 1].d.getDate()}</span></div>`;
  return `
    <div class="mhero ${saved >= 0 ? '' : 'over'}"><span class="px">${MON[m]} · ${plural(st.days, 'day')} logged</span><b>${saved >= 0 ? 'Saved' : 'Over'} $${Math.abs(saved)}</b><small>Spent outside the allowance $${st.spent}, across ${st.days === 1 ? 'that day' : `these ${st.days} days`} you could spend $${st.allowed}</small></div>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
      ${statCap('#B7B0F0', 'linear-gradient(180deg,#ECEAFF 0%,#DCD8FF 100%)', 'Daily average', `$${Math.round(st.spent / st.days)}`)}
      ${statCap('#B8D000', 'linear-gradient(180deg,#F2FF7A 0%,#E4FF1A 100%)', 'Zero-spend days', plural(st.zero, 'day'))}
      ${statCap('#D12E2E', 'linear-gradient(180deg,#FF7A7A 0%,#FF4B4B 100%)', 'All cards held', plural(st.allHeld, 'day'))}
    </div>
    <h2>Day by day <small>Spent outside the allowance</small></h2>
    ${chart}
    <div class="impact">
      <div class="r"><span>Score this month</span><span>${st.score} pts</span></div>
      <div class="r"><span>Passed</span><span>${st.settled ? `${st.passes} / ${st.settled} ${st.stars ? ` · ★ ${st.stars}` : ''}` : 'This week isn’t over yet'}</span></div>
      ${st.best ? `<div class="r"><span>Best day</span><span>${MON[st.best.d.getMonth()]} ${st.best.d.getDate()} · ${st.best.h.score} pts</span></div>` : ''}
    </div>
    <h2>Have your habits changed? <small>First week → last week</small></h2>
    ${habits}
    <h2>Days each card held</h2>
    <div class="hrows">${cardRows}</div>
    ${st.grads.map(g => `<div class="gradcard"><div class="gimg">${scaled(CARDS[g.no], 0.3)}<span class="cv-grad">Graduated</span></div><div><b>Graduated this month: ${CARDS[g.no].name}</b><p>Held 6/7 days or more for ${GRAD_WEEKS} weeks in a row; base mult +1.</p></div></div>`).join('')}`;
}
// the first morning of a new month opens last month's review on top of whatever is showing
function monthTurn(prev, now) {
  if (prev.getMonth() === now.getMonth() || !monthStats(prev.getFullYear(), prev.getMonth()).days) return;
  sheet('Monthly review', `<div class="bar-top"><h1>${MON[prev.getMonth()]} review</h1>${CLOSE_BTN}</div>
    ${reviewHTML(prev.getFullYear(), prev.getMonth())}
    <button class="cap lime bigbtn" data-act="close"><div class="top">Start ${MON[now.getMonth()]}</div></button>`);
}

/* ---------- the two daily moments ---------- */
// heads-ups before the money goes out, one per held card, by time of day and state
function alerts(ev) {
  const c = S.clock, out = [];
  ev.cards.forEach(x => {
    const k = CARDS[x.no];
    if (x.state === 'pending') { out.push(`${k.name} is still asleep: log one entry today to wake it (+${k.plus}).`); return; }
    if (x.state !== 'on') return;
    if (x.near) { out.push(sentence(x.near)); return; }
    if (x.no === '01' && ((c >= 11 && c < 13.5) || (c >= 17 && c < 19.5))) out.push(`Mealtime: order takeout and Takeout Nemesis breaks, mult − ${k.plus}.`);
    if (x.no === '06' && c >= 21 && c < 22) out.push(`In ${Math.round((22 - c) * 60)} min it’s 10 pm; after that, one cent breaks Night Cat.`);
    if (x.no === '06' && c >= 22) out.push('It’s past 10 pm; spending now breaks Night Cat (−2). Put what you want on the wish list.');
    if (x.no === '04' && ((c >= 7.5 && c < 9.5) || c >= 22)) out.push('Want an Uber? Walker breaks (−1); the subway counts as commuting and is fine.');
    if (x.no === '07' && c >= 20) out.push('Evenings are when you order most: wish list first; buying on the spot breaks Cool-Off (−2).');
    if (x.no === '05') out.push(`Zero Day is still alive (+${k.plus}): spend nothing outside the allowance today to earn it.`);
  });
  return out;
}
const BELL = '<svg width="20" height="20" viewBox="0 0 20 20" fill="#E4FF1A" aria-hidden="true"><path d="M10 2a5 5 0 0 0-5 5v3.5L3.5 14h13L15 10.5V7a5 5 0 0 0-5-5zM8 15.5a2 2 0 0 0 4 0z"/></svg>';
// every notice lives here instead of on home, so the core widgets never get pushed down
function inboxItems(ev = evaluate(S.today)) {
  const out = [];
  if (!S.held.length) return out;
  const k = `${S.week}-${S.day}`;
  S.revisit.forEach((x, i) => out.push({ key: `rv-${k}-${i}-${x.amt}`, kind: 'wish', title: 'Wish list · waited 24 hours', text: `Yesterday you wanted ${entryName(x)} $${x.amt}, still want it?`,
    btns: [[`data-rv="${i}:buy"`, 'Still want it', ''], [`data-rv="${i}:skip"`, 'Skip, save', 'lime']] }));
  if (S.day === 6) out.push({ key: `sun-${S.week}`, kind: 'sunday', title: 'Today is the last day of the week', text: 'Tonight, tap "End today" to see the weekly summary: score, stars, graduation, which card to carry over, and next week’s stake.', btns: [['data-act="end"', 'End today, see the weekly summary', 'lime']] });
  else if (S.prefs.evening && S.clock >= S.prefs.eveningAt) out.push({ key: `eve-${k}`, kind: 'evening', title: `${fmtClock(S.clock)} · Done logging?`, text: `Tonight’s estimate ${ev.score} pts. When you’re done, tap "End today" for the receipt; if you forget, midnight ends the day for you.`, btns: [['data-act="end"', 'End today', 'lime']] });
  if (ev.left <= 0) out.push({ key: `over-${k}`, kind: 'stop', title: ev.left < 0 ? `You’re already over by $${-ev.left}` : `Today’s $${ev.daily} is used up exactly`, text: `Tonight is 0 pts. Anything you spend now comes out of tomorrow’s allowance. Put what you want on the wish list first.` });
  else if (ev.cards.every(c => c.state !== 'on')) out.push({ key: `broke-${k}`, kind: 'stop', title: 'Every card broke today', text: `Mult is back to ×${ev.mult}, but the money left still counts: stay under ${money(ev.left)} and tonight you still get ${ev.score} pts. All cards come back at midnight.` });
  if (S.prefs.ruleAlerts) alerts(ev).forEach(a => out.push({ key: `al-${k}-${a}`, kind: 'alert', title: `${fmtClock(S.clock)} · Rule reminder`, text: a }));
  if (S.wish.length) out.push({ key: `wl-${k}-${S.wish.length}`, kind: 'memo', title: 'Wish list', text: `It holds ${S.wish.length} items; tomorrow you’ll be asked if you still want them. They don’t count as spending and break no cards.` });
  return out;
}
function renderInbox() {
  const items = inboxItems();
  const icon = { wish: 'W', sunday: '', evening: 'E', stop: '!', alert: BELL, memo: 'R' };
  items.forEach(i => S.seen.add(i.key));
  sheet('Notifications', `
    <div class="bar-top"><h1>Notifications</h1>${CLOSE_BTN}</div>
    ${items.map(i => `<div class="ibox ${i.kind}"><span class="iic">${icon[i.kind]}</span><div><b>${i.title}</b><p>${i.text}</p>${i.btns ? `<div class="ibtns">${i.btns.map(([attr, label, cls]) => `<button class="rvbtn ${cls}" ${attr}>${label}</button>`).join('')}</div>` : ''}</div></div>`).join('')
      || '<p class="note">Nothing new. Rule reminders, evening reminders and your wish list show up here.</p>'}`);
  const bell = app.querySelector('.pf'); if (bell) { const b = bell.querySelector('.badge'); if (b) b.remove(); }
}
// what the phone notification would look like; in the real app this is a system push
function pushNote(title, body) {
  app.querySelectorAll('.push').forEach(n => n.remove());
  app.insertAdjacentHTML("beforeend", `<div class="push" role="status" data-act="inbox"><span class="appicon" aria-hidden="true">P</span><div><small>Penny Round · now</small><b>${title}</b><span>${body}</span></div><button class="x" data-act="push-close" aria-label="Dismiss notification"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg></button></div>`);
  const n = app.lastElementChild;
  setTimeout(() => n.remove(), 4500);
}
function renderClock() {
  sheet('Change time', `
    <div class="bar-top"><h1>Demo: change time</h1>${CLOSE_BTN}</div>
    <div class="clocks">${TIMES.map(t => `<button class="cap ${Math.abs(t.c - S.clock) < 0.05 ? 'orange' : ''}" data-clock="${t.c}"><div class="top"><b class="px">${fmtClock(t.c)}</b><span>${t.name}</span></div></button>`).join('')}
      <button class="cap lime" data-act="jump-sunday"><div class="top"><b class="px">Sunday</b><span>Jump to Sunday night · end the day to see the weekly summary</span></div></button>
      <button class="cap dark" data-clock="midnight"><div class="top"><b class="px">00:00</b><span>Midnight · the day ends automatically</span></div></button></div>`);
}
// first open of a new day: how yesterday scored, the wishlist that has waited 24 hours, and today's cards
function renderMorning() {
  const y = S.history[S.history.length - 1], ev = evaluate(S.today);
  const kept = y.cards.filter(c => c.state === 'on').length;
  const rv = S.revisit.map((x, i) => `<div class="rv"><span>${entryName(x)} <b class="px">$${x.amt}</b></span><span><button class="rvbtn" data-rv="${i}:buy">Still want it</button><button class="rvbtn lime" data-rv="${i}:skip">Skip</button></span></div>`).join('');
  const a = alerts(ev)[0];
  sheet('Good morning', `
    <div class="bar-top"><h1>${DAYS[S.day]} · Good morning</h1><span class="px" style="color:var(--mute)">${fmtClock(S.clock)}</span></div>
    ${(() => { const p = pendingUnlogged(); return p.length ? `<div class="unlogged"><b>${p.length > 1 ? `Nothing logged on ${p.length} days` : `Nothing logged ${p[0] === S.history[S.history.length - 1] ? 'yesterday' : 'on ' + DAYS[p[0].day]}`}</b><span>Did you really spend nothing? An unlogged day counts as 0 pts first. If you really spent nothing, ${p.length > 1 ? 'they’re' : 'it’s'} restored to a zero-spend score of ${p.reduce((a, y) => a + y.potential.score, 0)} pts (base multiplier only; cards add nothing on an unlogged day).</span><div class="ibtns"><button class="rvbtn lime" data-act="unlogged-yes">Really spent nothing</button><button class="rvbtn" data-act="unlogged-no">Forgot to log</button></div></div>` : ''; })()}
    ${S.away > 1 ? `<div class="callout">You were away for ${S.away} days, so those days ended without you. What you logged before you left is on its receipt as usual.</div>` : S.autoEnded ? '<div class="callout">Last night you didn’t tap "End today", so midnight ended the day for you; the receipt is kept as usual.</div>' : ''}
    ${S.debt ? `<div class="callout">You overdrew yesterday by <b>$${S.debt}</b>, today you can spend $${dailyBudget()} − $${Math.min(S.debt, dailyBudget())} = <b>$${todayBudget()}</b>.${(() => { const y = S.history[S.history.length - 1]; return y && y.overflow ? `The other $${y.overflow} over is no longer carried forward; it adds to this week’s target score instead: +${y.overflow * OVERFLOW_PTS}.` : ''; })()}</div>` : ""}
    <div class="cap orange hero"><div class="top">
      <div class="row"><span style="font-weight:900;font-size:14px">Allowed today</span><span class="px" style="font-size:12px">Weekly Score ${scorePrior()} / ${weekTarget()}</span></div>
      <span class="money">${money(ev.left)}</span>
      <div class="row"><span style="font-weight:900;font-size:14px">If you hold them all, tonight ${ev.base * (S.baseMult + S.held.reduce((s, no) => s + CARDS[no].plus, 0))} pts</span></div>
    </div></div>
    ${a ? `<div class="alert" role="note"><span class="bell">${BELL}</span><p>${a}</p><span class="tag">Watch today</span></div>` : ''}
    <div class="cap"><div class="top" style="display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><b>Yesterday · ${DAYS[y.day]}</b><button class="linkbtn" data-day="${y.day}" style="padding:0;color:#111111;text-decoration:underline;font-size:12px">See receipt →</button></div>
      <div class="ystat"><div><small>Score</small><b>${y.score}</b></div><div><small>Mult</small><b>×${y.mult}</b></div><div><small>Held</small><b>${kept}/${y.cards.length}</b></div></div>
    </div></div>
    ${rv ? `<div class="wish"><span class="px" style="font-size:12px;opacity:0.85">Wish list · waited 24 hours</span><span style="font-weight:900;font-size:16px">Still want these?</span>${rv}</div>`
      : S.wishSaved ? `<div class="callout">Wish list is empty, <b>saved $${S.wishSaved}</b>.</div>` : ''}
    <div class="hold-lbl">${y.cards.some(c => c.state === 'broken') ? `Cards that broke yesterday came back at midnight${y.cards.some(c => c.state === 'broken' && CARDS[c.no].weekly) ? ' (weekly ones excepted)' : ''}` : 'Today’s cards'}</div>
    ${holdHTML(ev)}
    <button class="cap lime bigbtn" data-act="morning-done"><div class="top">Start today</div></button>`);
}
// close the week once: stars, per-card held days, graduation, unlocks. The sheet below only reads the result,
// so picking a carry card or a stake can re-render it without paying out twice
const GRAD_RATIO = 0.85, GRAD_WEEKS = 2;
function settleWeek() {
  const total = scorePrior(), target = weekTarget(), pass = total >= target;
  const warm = warmup(), got = pass && !warm ? Math.round(starsFrom(total, target) * STAKES[S.stake].star) : 0, before = S.stars;
  S.stars += got; S.starsTotal += got;
  const hist = weekHist();
  const perCard = S.held.map(no => ({ no, held: hist.filter(h => h.cards.find(c => c.no === no && c.state === 'on')).length, days: hist.length }));
  const grads = [];
  perCard.forEach(p => {
    const log = S.cardLog[p.no] || (S.cardLog[p.no] = { weeks: 0, held: 0, days: 0, streak: 0 });
    log.weeks += 1; log.held += p.held; log.days += p.days;
    // a strong week is holding about six days in seven; two in a row and the habit counts as changed
    log.streak = p.days >= 3 && p.held / p.days >= GRAD_RATIO ? (log.streak || 0) + 1 : 0;
    p.streak = log.streak;
    if (log.streak >= GRAD_WEEKS && !S.grad.includes(p.no) && !CARDS[p.no].noGrad) {
      S.grad.push(p.no); S.unlocked = S.unlocked.filter(x => x !== p.no); S.baseMult += 1; grads.push(p.no);
      (S.gradLog = S.gradLog || []).push({ no: p.no, date: dateOf(S.week, 6) });
    }
  });
  const fresh = Object.values(CARDS).filter(x => x.unlock && x.unlock <= S.starsTotal && !S.unlocked.includes(x.no) && !S.grad.includes(x.no));
  fresh.forEach(x => S.unlocked.push(x.no));
  const best = perCard.slice().sort((a, b) => b.held / Math.max(1, b.days) - a.held / Math.max(1, a.days))[0];
  S.lastResult = { pass, score: total, target, stars: got, best: best.no, fresh: fresh.map(x => x.name).join(', '), grads };
  (S.weeks = S.weeks || []).push({ week: S.week, total, target, pass, stars: got, stake: S.stake, warm });
  if (pass && !warm) S.maxStake = Math.max(S.maxStake || 0, Math.min(STAKES.length - 1, S.stake + 1));
  const carryable = perCard.filter(p => !S.grad.includes(p.no));
  S.carry = carryable.length ? carryable.slice().sort((a, b) => b.held / Math.max(1, b.days) - a.held / Math.max(1, a.days))[0].no : null;
  S.nextStake = S.stake; S.weekStep = 1; S.weekOpen = true;
  // days still unlogged say nothing about what was really spent, so their allowance is left out of "saved"
  const blind = hist.filter(h => h.unlogged).length;
  S.weekResult = { total, target, pass, warm, got, before, perCard, grads, fresh, blind, real: Math.round(S.base * (weekDays() - blind) / 7), spent: hist.reduce((a, h) => a + h.extra, 0), logged: hist.reduce((a, h) => a + h.entries.reduce((b, x) => b + x.amt, 0), 0) };
}
function renderWeek() {
  const R = S.weekResult, st = STAKES[S.stake];
  const stakeOpts = R.warm ? [S.stake] : R.pass && S.stake < STAKES.length - 1 ? [S.stake + 1, S.stake] : !R.pass && S.stake > 0 ? [S.stake, S.stake - 1] : [S.stake];
  const stakeBtn = i => {
    const s = STAKES[i], tag = i > S.stake ? `Target ×${s.k}, stars for passing ×${s.star}` : i < S.stake ? `Target back to ×${s.k}` : 'Keep the current stake';
    return `<button class="stake ${S.nextStake === i ? 'on' : ''}" data-stake="${i}" aria-pressed="${S.nextStake === i}"><span class="chipk" style="background:${s.bg};color:${s.fg}">${s.name}</span><span>${tag}</span></button>`;
  };
  const step = S.weekStep || 1;
  sheet('Weekly summary', `
    ${step === 1 ? `<div class="bar-top"><h1>${R.warm ? 'Warm-up over' : `Week ${S.week} over`}</h1><span class="chipk" style="background:${st.bg};color:${st.fg}">${st.name}</span></div>
    <span class="bigstamp ${R.pass || R.warm ? '' : 'no'}">${R.warm ? 'Warm-up' : R.pass ? 'Passed' : 'Missed'}</span>
    <div class="impact">
      <div class="r"><span>Weekly Score</span><span class="${R.pass ? 'good' : 'hot'}">${R.total} / ${R.target}</span></div>
      <div class="r"><span>Stars</span><span>${R.warm ? 'Warm-up days earn none; stars start with your first full week' : R.got ? `+${starStr(R.got)} Total ${S.stars}` : `None this week, total ${R.before}`}</span></div>
      ${R.warm ? '' : `<div class="r"><span>How stars work</span><span>Target ★ · 1.7× ★★ · 2.6× ★★★${S.stake ? ` · ${st.name} Stars ×${st.star}` : ''}</span></div>`}
    </div>
    ${R.grads.map(no => `<div class="gradcard"><div class="gimg">${scaled(CARDS[no], 0.3)}<span class="cv-grad">Graduated</span></div><div><b>“${CARDS[no].name}” graduated!</b><p>Held 6/7 days or more for ${GRAD_WEEKS} weeks in a row: this habit is gone. It leaves the deck and gives you a permanent base multiplier +1: from now on the multiplier starts at <b>${S.baseMult}</b>, and the weekly target score rises 25%.</p></div></div>`).join('')}
    <h2>How your cards did <small>Hold 6/7 days for ${GRAD_WEEKS} weeks to graduate</small></h2>
    <div class="pillrow">${R.perCard.map(p => `<span class="pill ${p.held >= p.days * 0.7 ? 'ok' : p.held >= p.days * 0.4 ? 'mid' : 'no'}">${CARDS[p.no].name} ${p.held}/${p.days} days${S.grad.includes(p.no) ? ' · Graduated' : p.streak ? ` · Streak ${p.streak}/${GRAD_WEEKS}` : ''}</span>`).join('')}</div>
    <div class="cap ${R.real - R.spent >= 0 ? 'lime' : 'orange'}"><div class="top" style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span style="font-weight:900">${R.real - R.spent >= 0 ? 'Real money saved this week' : 'Real money over this week'}${R.blind ? `<small style="display:block;font-weight:500;font-size:11px">${R.blind} unlogged ${R.blind === 1 ? 'day' : 'days'} left out</small>` : ''}</span><span style="font-family:var(--f-display);font-size:28px">$${Math.abs(R.real - R.spent)}</span></div></div>
    <h2>Score each day <small>Tap a day for the receipt</small></h2>
    ${tilesHTML()}
    <button class="go" data-act="week-plan">Next: plan next week</button>` : `<div class="bar-top"><h1>Plan next week</h1><span class="chipk" style="background:${st.bg};color:${st.fg}">${st.name}</span></div>
    ${S.carry ? `<h2>Carry one card <small>It’s in next week’s deal</small></h2>
    <div class="carry">${R.perCard.filter(p => !S.grad.includes(p.no)).map(p => `<button class="hcard ${S.carry === p.no ? 'on' : 'off'}" data-carry="${p.no}" aria-pressed="${S.carry === p.no}">${scaled(CARDS[p.no], 0.46)}<span>${S.carry === p.no ? 'Carried ✓' : 'Tap to carry'}</span></button>`).join('')}</div>` : ''}
    <h2>Stake <small>${R.warm ? 'You can raise it after your first full week' : R.pass ? 'Raise it for more stars, or keep it' : 'No penalty for missing; lower it if it felt hard'}</small></h2>
    <div class="stakes">${stakeOpts.map(stakeBtn).join('')}</div>
    ${R.fresh.map(x => `<div class="unlock">${scaled(x, 0.3)}<div><b style="font-size:12px">New card unlocked</b><div style="font-weight:900;font-size:20px">${x.name}</div><p class="note left">${x.cond}. It may be dealt from now on.</p></div></div>`).join('')}
    <div class="impact plan">
      <div class="r"><span>Next week</span><span>Week ${S.week + 1} · ${STAKES[S.nextStake].name}</span></div>
      <div class="r"><span>Deal</span><span>${DEALN()} cards, keep ${S.slotPending ? 4 : HOLDN()}</span></div>
      <div class="r"><span>Carried</span><span>${S.carry ? CARDS[S.carry].name : 'None'}</span></div>
    </div>
    ${reconHTML(R)}
    <button class="linkbtn" data-act="week-back">‹ Back to this week’s results</button>`}`);
}
// before Monday, the week's log is checked against what the payment apps say was really spent; a log missing a lot loses the stars
const RECON_RATIO = 1.2, RECON_SLACK = 30;
function reconHTML(R) {
  const go = `<button class="cap lime bigbtn" data-act="to-monday"><div class="top">Start week ${nextWeekNo()} · draw cards</div></button>`;
  if (!R.got && !R.recon) return go;
  if (R.recon) return `<div class="callout">${R.recon.voided ? `Reconcile off by $${R.recon.actual - R.logged}: actually $${R.recon.actual}, only logged $${R.logged}. This week’s ${starStr(R.recon.voided)} don’t count; score unchanged.` : R.recon.skipped ? `Not reconciled; this week’s stars are halved, ${R.got ? `you get only ${starStr(R.got)}` : 'none left'}.` : `Matches: actually $${R.recon.actual}, logged $${R.logged}. Stars kept ✓`}</div>${go}`;
  return `<h2>Reconcile <small>The last step before stars</small></h2>
    <div class="impact"><p class="note left" style="margin:0">Open your bank app or Venmo and see how much you spent this week (meals and commuting too). You logged <b>$${R.logged}</b> this week. If the real amount is 20% or more above what you logged, this week’s stars don’t count.</p>
      <div class="field"><input class="in" id="recon" inputmode="numeric" maxlength="6" placeholder="Real total, $" aria-label="How much you really spent this week"><button class="mini lime" data-act="recon">Check</button></div></div>
    <button class="linkbtn" data-act="recon-skip">Skip the check (stars halved)</button>`;
}


/* ---------- shop: a tab in Deck, stars are the money ---------- */
// three tickets: a locked card bought early, or an unlocked one pinned into next week's deal
function rollShop() {
  const locked = Object.values(CARDS).filter(c => !S.unlocked.includes(c.no) && !S.grad.includes(c.no)).map(c => ({ no: c.no, kind: 'unlock', price: Math.max(1, Math.round(c.unlock / 2)) }));
  const pins = S.unlocked.filter(no => no !== S.carry && !S.pinned.includes(no)).map(no => ({ no, kind: 'pin', price: 1 }));
  const all = [...locked, ...pins.sort(() => Math.random() - 0.5)];
  // keep the recommended card on the shelf whenever it can be sold at all
  const rec = shopPick(), ri = rec ? all.findIndex(o => o.no === rec.no) : -1;
  if (ri > 0) all.unshift(all.splice(ri, 1)[0]);
  S.shopOffers = all.slice(0, 3);
}
// the card that targets last week's biggest spending category gets the "Top pick" sticker
function shopPick() {
  const by = {};
  weekHist().forEach(h => h.entries.filter(x => !cat(x.cat).ess).forEach(x => { if (CAT_CARD[x.cat]) by[x.cat] = (by[x.cat] || 0) + x.amt; }));
  const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
  return top ? { no: CAT_CARD[top[0]], why: `Last week you spent $${top[1]} on ${cat(top[0]).name}` } : null;
}
const PRICE = { reroll: 1, slot: 5, slotWas: 6, glue: 2 };
function shopBody() {
  if (!(S.shopOffers || []).length) rollShop();
  const slotDone = S.slots >= 4 || S.slotPending;
  const rec = shopPick();
  const can = n => S.stars >= n;
  const tickets = S.shopOffers.map((o, i) => {
    const c = CARDS[o.no], sold = o.sold, isRec = rec && rec.no === o.no;
    return `<button class="sticket ${isRec ? 'rec' : ''}" data-buy="${i}" ${sold || !can(o.price) ? 'disabled' : ''} aria-label="${c.name}, ${o.kind === 'unlock' ? 'Unlock' : 'Guaranteed next week'}, ${o.price} stars">
      <span class="stile" style="background:${tintOf(o.no)}">${artIcon(o.no, 56)}</span>
      <b>${c.name}</b><b class="px lime">+${c.plus} Mult</b><small>${o.kind === 'unlock' ? 'Unlock early' : 'Guaranteed next week'}</small>
      <b class="px">${sold ? 'Bought' : `★ ${o.price}`}</b>
      ${isRec ? '<b class="cv-glow rec-tag">Top pick</b>' : ''}</button>`;
  }).join('') || '<p class="note">All cards are unlocked and in next week’s deck.</p>';
  const rings = S.held.map(no => `<span class="sring" style="border-color:${coreOf(no)};background:${tintOf(no)}">${artIcon(no, 22)}</span>`).join('') + '<span class="sring add"><span class="px">+</span></span>'.repeat(Math.max(0, S.slots - S.held.length));
  return `
    <div class="pillrow"><span class="spill">★ ${S.stars} Stars</span></div>
    ${rec ? `<p class="note left">${rec.why}, recommended “${CARDS[rec.no].name}”.</p>` : ''}
    <div class="stickets">${tickets}</div>
    <div class="sband">
      <div class="px sdeal"><span>Limited</span><span>This week</span><svg width="16" height="20" viewBox="0 0 14 18" fill="#FF8A3D" aria-hidden="true"><path d="M8 0L0 10h5l-1 8 8-10H7z"/></svg></div>
      <div class="sbtns">
        <button data-act="reroll" ${can(PRICE.reroll) ? '' : 'disabled'}><span class="px">Reroll</span><span class="px sub">★ ${PRICE.reroll}</span></button>
        <button class="lime" data-act="slot" ${!slotDone && can(PRICE.slot) ? '' : 'disabled'}><span class="px">${!slotDone ? 'Add a 4th slot' : S.slots >= 4 ? 'Already 4 slots' : 'Bought · from next week'}</span><span class="px sub">${!slotDone ? `<s>${PRICE.slotWas}</s> ★ ${PRICE.slot} · target +25%` : 'Keep 4 a week'}</span></button>
      </div>
    </div>
    <div class="sglue"><div><b>Glue × ${S.glue}</b><small>Tap a broken card to glue it back, for that day only. Up to 3 bottles.</small></div><button class="cap lime" data-act="glue-buy" ${S.glue < 3 && can(PRICE.glue) ? '' : 'disabled'}><div class="top">★ ${PRICE.glue} Buy one</div></button></div>
    <div class="smine"><span style="font-weight:900;font-size:14px">My slots</span><div style="display:flex;align-items:center">${rings}<span class="px" style="margin-left:12px;font-size:20px">${S.held.length}/${S.slots}</span></div></div>
    <div class="snext">
      <div class="snext-top"><span class="snext-tag px">Next week</span><span class="chipk" style="background:${STAKES[S.nextStake].bg};color:${STAKES[S.nextStake].fg}">${STAKES[S.nextStake].name}</span></div>
      <b>Week ${S.week + 1}</b>
      <div class="snext-rows">
        <span><small>Carry</small>${S.carry ? `<i style="background:${tintOf(S.carry)}">${artIcon(S.carry, 18)}</i>${CARDS[S.carry].name}` : 'None'}</span>
        <span><small>Deal</small>Draw ${DEALN()}, keep ${S.slotPending ? 4 : HOLDN()}</span>
        ${S.pinned.length ? `<span><small>Guaranteed</small>${S.pinned.map(no => CARDS[no].name).join(', ')}</span>` : ''}
      </div>
    </div>`;
}
