/* ---------- views ---------- */
const app = document.getElementById('app');
const money = n => (n < 0 ? '−$' + Math.abs(n) : '$' + n);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const entryName = x => `${cat(x.cat).name}${x.note && x.note !== cat(x.cat).name ? ' · ' + esc(x.note) : ''}`;
const starStr = n => '★'.repeat(n);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
// end a line with exactly one stop, whether or not it already has one
const sentence = s => /[.!?]$/.test(s) ? s : s + '.';
function toast(msg) { app.querySelectorAll('.toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; app.appendChild(t); setTimeout(() => t.remove(), 2600); }
// every confirm button sits in the same place as the launch screen's: pinned at the bottom, 24px in from the sides
function pinFoot(sh) {
  if (sh.classList.contains('launch') || sh.querySelector('.drawfoot')) return;
  const isBtn = el => el.matches('.actions, .go, .cap.bigbtn') && !el.hidden;
  const kids = [...sh.children], tail = [];
  for (let i = kids.length - 1; i >= 0; i--) { if (kids[i].matches('.linkbtn')) { tail.unshift(kids[i]); continue; } if (isBtn(kids[i]) || (kids[i].hidden && tail.length)) tail.unshift(kids[i]); else break; }
  while (tail.length && !tail.some(isBtn)) tail.length = 0;
  if (!tail.length) return;
  const foot = document.createElement('div'); foot.className = 'sfoot';
  tail[0].before(foot); tail.forEach(el => foot.appendChild(el));
}
// the round close button every dismissable sheet carries in its title row
const CLOSE_BTN = '<button class="x" data-act="close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg></button>';
function sheet(label, html) { app.insertAdjacentHTML('beforeend', `<div class="sheet" role="dialog" aria-label="${label}">${html}</div>`); pinFoot(app.lastElementChild); return app.lastElementChild; }
// step-to-step moves in onboarding: the next sheet slides in from the right over the old one, which drifts left and fades; nothing blanks in between
// a number that counts toward its new value and gives a little pop
const tickState = new WeakMap();
function tickMoney(el, to) {
  const from = tickState.has(el) ? tickState.get(el).to : (parseInt(el.textContent.replace(/\D/g, ''), 10) || 0); const prev = tickState.get(el); if (prev) cancelAnimationFrame(prev.raf);
  if (reducedMotion() || from === to) { el.textContent = money(to); tickState.set(el, { to }); return; }
  const t0 = performance.now(), dur = 380, st = { to };
  tickState.set(el, st);
  el.animate([{ transform: 'scale(1.12)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.3,1.8,.5,1)' });
  const step = t => { const u = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - u, 3); el.textContent = money(Math.round(from + (to - from) * e)); if (u < 1) st.raf = requestAnimationFrame(step); else el.textContent = money(to); };
  st.raf = requestAnimationFrame(step);
}
function swapSheet(old, fn, keepTable = false, back = false) {
  const rm = () => old.remove();
  if (reducedMotion()) { rm(); fn(); return; }
  const next = fn();
  const n = app.lastElementChild;
  if (n && n !== old && n.classList.contains('sheet')) n.style.animation = `${back ? 'slideInL' : 'slideInR'} 0.42s cubic-bezier(.2,.9,.25,1) both`;
  old.style.animation = `${back ? 'slideOutR' : 'slideOutL'} 0.26s ease-in both`; old.style.pointerEvents = 'none';
  setTimeout(rm, 440);
}
// a sheet that is dismissed slides back down instead of vanishing
function closeSheet(el, then) {
  if (reducedMotion()) { el.remove(); if (then) then(); return; }
  el.classList.add('closing'); el.style.pointerEvents = 'none';
  setTimeout(() => { el.remove(); if (then) then(); }, 230);
}
function replaceSheet(old, fn) { const top = old.scrollTop; old.remove(); fn(); const n = app.lastElementChild; n.style.animation = 'none'; n.classList.add('rerender'); n.scrollTop = top; }
const lastSheet = () => [...app.querySelectorAll('.sheet')].pop();

function tilesHTML() {
  return `<div class="tiles">${DAYS.map((d, i) => {
    const h = weekHist().find(x => x.day === i);
    if (h) {
      const all = h.cards.every(c => c.state === 'on'), hit = h.cards.some(c => c.state === 'broken');
      return `<button class="tile ${hit ? 'hit' : ''} ${all ? 'zero' : ''}" data-day="${i}" aria-label="${d} ${h.score} pts, see receipt"><span>${d}</span><b>${h.unlogged ? "Unlogged" : h.score}</b></button>`;
    }
    if (i === S.day) return `<span class="tile now"><span>${d}</span><b>Today</b></span>`;
    if (i < S.weekStart) return `<span class="tile future skip" aria-label="${d}, before you joined"><span>${d}</span><b>–</b></span>`;
    return `<span class="tile future"><span>${d}</span><b>—</b></span>`;
  }).join('')}</div>`;
}
function holdHTML(ev) {
  const n = ev.cards.length, sc = n > 3 ? 0.34 : 0.4, tilt = [-7, 4, -3, 6], notes = ['#FFD3E2', '#CFE8FF', '#FFF3B0', '#D8F5C8'];
  const cards = ev.cards.map((c, i) => {
    const card = CARDS[c.no];
    const label = c.state === 'on' ? `+${gainOf(c)} Held` : c.state === 'pending' ? 'Asleep' : brokenLabel(c);
    return `<button class="hcard ${c.state}" data-info="${c.no}" style="--p:${n > 1 ? i / (n - 1) : 0};--cw:${Math.round(240 * sc)}px;--r:${tilt[i % 4]}deg;--z:${i + 1}" aria-label="${card.name}, ${label}${c.why ? ':' + c.why : ''}">${scaled(card, sc, c.state)}<span style="--nb:${coreOf(c.no)};--nt:${TYPES[card.plus].chipText}">${label}</span></button>`;
  }).join('');
  const okN = ev.cards.filter(c => c.state === 'on').length;
  return `<div class="rack"><div class="rack-in"><div class="rack-top"><span class="rack-ttl">Weekly Rules</span><span class="rack-n">${okN}/${n}</span></div><div class="hold" style="height:${Math.round(340 * sc) + 22}px">${cards}</div></div></div>`;
}
// consecutive finished days where every held card held
function streakDays() { let n = 0; for (let i = S.history.length - 1; i >= 0; i--) { const h = S.history[i]; if (h.unlogged || !h.cards.length || !h.cards.every(c => c.state === 'on')) break; n++; } return n; }
// the spend card is a little retro CRT: the money glows on the screen, a pixel coin for each bit of today's allowance still left,
// and a pink pixel tide rising from the bottom as money is spent. A coin pops when money goes.
let lastHeroLeft = null;
const COIN = ['....XXXX....', '..XXXXXXXX..', '.XXXXXXXXXX.', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', '.XXXXXXXXXX.', '.XXXXXXXXXX.', '..XXXXXXXX..', '....XXXX....'];
const ghostSVG = (cls = '', col = '') => `<svg class="gh ${cls}" ${col ? `style="fill:${col};filter:drop-shadow(0 0 5px ${col})"` : ''} width="24" height="24" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${COIN.map((row, y) => [...row].map((c, x) => c === 'X' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : '').join('')).join('')}<g fill="#B8741A"><rect x="5" y="3" width="2" height="6"/><rect x="3" y="5" width="6" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/></g><g fill="#FFF8CC"><rect x="2" y="2" width="2" height="1"/><rect x="2" y="3" width="1" height="1"/></g></svg>`;
function crtHTML(ev) {
  const ratio = Math.max(0, Math.min(1, ev.d.extra / Math.max(1, ev.daily)));
  const n = ev.left <= 0 ? 0 : Math.max(1, Math.min(6, Math.round(ev.left / Math.max(1, ev.daily) * 6)));
  const dropped = lastHeroLeft != null && ev.left < lastHeroLeft; lastHeroLeft = ev.left;
  const cols = S.held.length ? S.held.map(no => coreOf(no)) : [''];
  const ghosts = Array.from({ length: n }, (_, i) => ghostSVG(`g${i % 3}`, cols[i % cols.length])).join('') + (dropped && n < 6 ? ghostSVG('poof') : '');
  const steps = Array.from({ length: 24 }, (_, i) => [6, 11, 4, 9, 13, 5, 10, 3][i % 8]);
  const wave = `<svg class="crt-wave" viewBox="0 0 96 40" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true" style="height:${Math.round(12 + ratio * 48)}px"><path fill="currentColor" d="M0 40V${40 - steps[0]}${steps.map((h, i) => `H${(i + 1) * 4}V${40 - steps[(i + 1) % 24]}`).join('')}V40Z"/></svg>`;
  const streak = streakDays();
  return `<button class="crt ${ev.left < 0 ? 'over' : ''} ${dropped ? 'blip' : ''}" data-act="crt" aria-label="Left today ${ev.left} dollars left, spent ${ev.d.extra} dollars of ${ev.daily} dollars, today’s score ${ev.score} (money left ${ev.base} times the multiplier ${ev.mult}), streak ${streak} days">
    <span class="crt-in">
      <span class="crt-scr">
        <span class="crt-top"><span class="crt-ttl">${ev.left < 0 ? 'Over today' : 'Left to spend today'}</span><span class="crt-streak ${streak ? 'on' : ''}"><svg width="10" height="12" viewBox="0 0 12 14" aria-hidden="true"><path d="M6 0c1 3 5 4.500 5 8.500A5 5 0 011 8.500C1 6.500 2.500 5.500 3 4c1 .8 1.200 1.800 1 2.800C5.500 6 6.200 3 6 0z" fill="currentColor"/></svg>Streak ${streak} ${streak === 1 ? 'day' : 'days'}</span></span>
        <span class="crt-money">${money(ev.left)}</span>
        <span class="crt-sub"><i>▶</i> Spent $${ev.d.extra} / $${ev.daily}${S.debt ? ` · overdrawn $${Math.min(S.debt, dailyBudget())}` : ''}</span>
        <span class="crt-ghosts">${ghosts}</span>
        ${wave}
        <span class="crt-alt alt-score"><span class="crt-ttl">TODAY’S SCORE</span><span class="crt-money">${ev.score}</span><span class="crt-sub">$${ev.base} left × mult ${ev.mult}</span></span>
        <span class="crt-alt alt-hold"><span class="crt-ttl">CARDS HOLDING</span><span class="crt-money">${ev.cards.filter(c => c.state === 'on').length}/${ev.cards.length}</span><span class="crt-sub">Spent $${ev.d.extra} / $${ev.daily}</span></span>
        <span class="crt-glare"></span>
      </span>
    </span>
    <span class="crt-base"><span class="lcd"><b>Today’s score ${ev.score}</b><i>left $${ev.base} × mult ${ev.mult}</i></span><i class="kb o"></i><i class="kb"></i></span>
  </button>`;
}
function weekInfo() {
  const prior = scorePrior(), target = weekTarget(), need = target - prior, daysLeft = 7 - S.day;
  const hint = need <= 0 ? `Target reached! Extra points make bigger stars: 1.7× earns ★★, 2.6× earns ★★★.`
    : `Still need <b>${need}</b> pts, ${daysLeft} days left; about <b>${Math.ceil(need / daysLeft)}</b> pts a day will do.`;
  return { prior, target, need, daysLeft, hint, pct: Math.min(100, Math.round(prior / target * 100)) };
}
// the full week view lives one tap away: the home only shows the number
// the star badge is the home's one entry to the long-term side: how stars work, and the settings
function renderStarSheet() {
  const w = weekInfo();
  sheet('Stars', `<div class="bar-top"><h1>Stars & This Week</h1>${CLOSE_BTN}</div>
    <div class="cookie" style="width:104px;height:104px;align-self:center;position:relative"><span class="n" style="font-size:28px">${S.stars}</span><span class="l" style="font-size:12px">★ Stars</span></div>
    <div class="cap meter"><div class="top">
      <div class="row"><span>Weekly Score <span class="chipk" style="background:${STAKES[S.stake].bg};color:${STAKES[S.stake].fg}">${STAKES[S.stake].name}</span></span><span class="px">${w.prior} / ${w.target}</span></div>
      <div class="bar"><i style="width:${w.pct}%"></i></div>
      <p class="hint">${w.hint} Real money left this week: ${money(moneyWeek() - spentWeek())}.</p>
      ${tilesHTML()}
    </div></div>
    ${(() => {
      const locked = Object.values(CARDS).filter(x => x.unlock && !S.unlocked.includes(x.no) && !S.grad.includes(x.no)).sort((a, b) => a.unlock - b.unlock)[0];
      const weeks = (S.weeks || []).slice(-4).reverse();
      return (locked ? `<button class="dk-next" data-info="${locked.no}"><i class="dk-ico" style="background:${tintOf(locked.no)}">${artIcon(locked.no, 30)}</i><span class="dk-main"><b>Next unlock: ${locked.name}</b><small>${locked.cond}</small><span class="dk-bar"><i style="width:${Math.min(100, Math.round(S.starsTotal / locked.unlock * 100))}%"></i></span></span><span class="dk-tail"><b class="px">★${S.starsTotal}/${locked.unlock}</b></span></button>` : '')
        + (weeks.length ? `<h2>Recent weeks</h2>${weeks.map(k => `<div class="set-row"><div><b>Week ${k.week} · ${STAKES[k.stake].name}</b><small>${k.pass ? `Passed, ${starStr(k.stars)}` : 'Missed the target'}</small></div><b class="px">${k.total} / ${k.target}</b></div>`).join('')}` : '');
    })()}
    <button class="cap bigbtn" data-act="settings"><div class="top">Settings</div></button>`);
}
// home keeps only what you use every time you open the app: what's left today, quick add, today's rules;
// the week score and ending the day are small, and everything else (history, stars, details) lives in its own page
function homeHTML() {
  const ev = evaluate(S.today), w = weekInfo();
  const br = breakers(S.today), sumToday = S.today.reduce((a, x) => a + x.amt, 0);
  const list = S.today.map((x, i) => ({ x, i })).slice(-2).map(({ x, i }) => {
    const ess = !!cat(x.cat).ess, b = br[i];
    return `<button class="chip ${ess ? 'ess' : b ? 'hit' : 'hot'}" data-edit="${i}" aria-label="${entryName(x)} ${x.amt} dollars, tap to edit"><span class="cl">${entryName(x)}${ess ? ' · essential' : ''}${b ? ` · broke ${b.join(', ')}` : ''}</span> <b>$${x.amt}</b></button>`;
  }).join('') || '<span class="note">Nothing spent today.</span>';
  return `
    <div class="head">
      <button class="daypill" data-act="clock" aria-label="Week ${S.week} ${DAYS[S.day]}, now ${fmtClock(S.clock)}, tap to change the demo time"><span class="px" style="font-size:12px;display:flex;justify-content:space-between">Week ${S.week} · ${DAYS[S.day]}<span class="clock">${fmtClock(S.clock)} ▾</span></span></button>
      ${profileHTML(ev)}
      <button class="cookie" data-act="star" aria-label="Stars ${S.stars}, tap for the guide and settings"><span class="n">${S.stars}</span><span class="l">★ Stars</span></button>
    </div>
    <div class="hero herocrt ${ev.left < 0 ? 'over' : ''}">${crtHTML(ev)}</div>
    ${S.held.length ? holdHTML(ev) : `<button class="rulebar" data-act="draw"><div class="rtext" style="grid-column:1/-1"><small>This week’s cards</small><b>Not drawn yet</b><span>Tap to draw</span></div></button>`}
    <div class="wkrow">
      <div class="cap meter wkmini"><div class="top">
        <div class="row"><span>Today’s ledger</span><span class="px">${money(sumToday)}</span></div>
        <div class="keys">${list}</div>
        <button class="linkbtn wkgo" data-act="goflow">${S.today.length > 2 ? `+ ${S.today.length - 2} more · ` : ''}All entries ›</button>
      </div></div>
      <button class="cap lime bigbtn endbtn" data-act="end"><i class="scr a"></i><i class="scr b"></i><div class="top">End today</div></button>
    </div>`;
}

/* ---------- tab pages, ported from the canvas screens ---------- */
const CHECK = 'background-color:#E4E4EA;background-image:linear-gradient(45deg,#D4D4DB 25%,transparent 25%,transparent 75%,#D4D4DB 75%),linear-gradient(45deg,#D4D4DB 25%,transparent 25%,transparent 75%,#D4D4DB 75%);background-size:12px 12px;background-position:0 0,6px 6px';
const NAV = [
  { id: 'home', name: 'Home', bg: 'radial-gradient(circle at 50% 30%,#FFF0F5 0%,#FFB3CC 100%)', fg: '#FF4B7A', cut: '#FFE3EC', r: '24px', icon: '<svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round"><path d="M16 7.500L25.500 15.500H6.500z" stroke-width="6"/><rect x="7.500" y="14" width="17" height="14" rx="6" stroke-width="1.500"/><rect x="21.500" y="6" width="3.500" height="6.500" rx="1.750" stroke-width="1"/></g><rect x="13" y="19.500" width="6" height="8.500" rx="3" fill="var(--cut)"/></svg>' },
  { id: 'bill', name: 'Ledger', bg: 'radial-gradient(circle at 50% 30%,#E6F3FF 0%,#7FC0FF 100%)', fg: '#2E8BFF', cut: '#E6F3FF', r: '22px', icon: '<svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" stroke="currentColor" stroke-width="1.500" stroke-linejoin="round" d="M10.500 3.500h11A6.500 6.500 0 0128 10v16a2.800 2.800 0 01-4.500 2.200 3.300 3.300 0 01-5.200 0 3.300 3.300 0 01-4.600 0 3.300 3.300 0 01-5.200 0A2.800 2.800 0 014 26V10a6.500 6.500 0 016.500-6.500z"/><g fill="var(--cut)"><rect x="9.500" y="9" width="13" height="3.400" rx="1.700"/><rect x="9.500" y="15" width="13" height="3.400" rx="1.700"/><rect x="9.500" y="21" width="7.500" height="3.400" rx="1.700"/></g></svg>' },
  { id: 'deck', name: 'Deck', bg: 'radial-gradient(circle at 50% 30%,#FBFFC2 0%,#E4FF1A 100%)', fg: '#FF4B4B', cut: '#FBFFC2', r: '26px 20px 26px 20px', icon: '<svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true"><rect x="3.500" y="7" width="15" height="20" rx="6" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(-14 11 17)"/><rect x="11" y="4" width="17" height="22" rx="7" fill="currentColor" stroke="currentColor" stroke-width="1.500" stroke-linejoin="round" transform="rotate(8 19.500 15)"/><g fill="var(--cut)" transform="rotate(8 19.500 15)"><circle cx="19.500" cy="11.300" r="2.800"/><circle cx="19.500" cy="18.700" r="2.800"/><circle cx="15.800" cy="15" r="2.800"/><circle cx="23.200" cy="15" r="2.800"/></g><circle cx="19.500" cy="15" r="1.800" fill="currentColor" transform="rotate(8 19.500 15)"/></svg>' }
];
function navHTML() {
  const on = S.view === 'flow' ? 'bill' : S.view;
  return `<nav class="cv-nav" aria-label="Main navigation">${NAV.map(n => `<button data-tab="${n.id}" class="${on === n.id ? 'on' : ''}" style="background:${n.bg};color:${n.fg};--cut:${n.cut};border-radius:${n.r}" aria-label="${n.name}" ${on === n.id ? 'aria-current="page"' : ''}>${n.icon}<span>${n.name}</span></button>`).join('')}<button class="cv-log" data-act="log"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M8 2v12M2 8h12"/></svg>Log</button></nav>`;
}
function renderTable(quiet) {
  const body = { home: homeHTML, bill: billHTML, deck: deckHTML }[S.view]();
  app.innerHTML = `<div class="screen">${body}</div>${minibarHTML()}${navHTML()}`;
  app.classList.remove('scrolled');
  if (!quiet) showCoach();
}
// switching pages keeps the nav bar in place so the keys can animate, and only swaps the screen underneath
function switchTab(v) {
  const nav = app.querySelector('.cv-nav');
  if (!nav || v === S.view) { S.view = v; renderTable(); return; }
  const prevView = S.view; S.view = v;
  nav.querySelectorAll('button[data-tab]').forEach(b => { const on = b.dataset.tab === v; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  const old = app.querySelector('.screen'), scr = document.createElement('div');
  const order = ['home', 'bill', 'deck'], dir = order.indexOf(v) - order.indexOf(prevView) > 0 ? 1 : -1;
  scr.className = 'screen' + (reducedMotion() ? '' : ' enter'); scr.style.setProperty('--dir', dir); scr.innerHTML = { home: homeHTML, bill: billHTML, deck: deckHTML }[v]();
  if (reducedMotion()) old.replaceWith(scr);
  else { old.style.setProperty('--dir', dir); old.classList.add('leave'); old.inert = true; old.before(scr); setTimeout(() => old.remove(), 230); }
  const mb = app.querySelector('.minibar'); if (mb) mb.outerHTML = minibarHTML();
  // a home tip doesn't follow you to another page; it comes back when home does
  app.classList.remove('scrolled'); clearCoach(); showCoach();
}
function minibarHTML() {
  const title = { home: `Week ${S.week} · ${DAYS[S.day]}`, bill: 'Ledger', deck: 'Deck' }[S.view];
  const mult = S.held.length ? `<span class="mm">×${evaluate(S.today).mult}</span>` : '';
  return `<button class="minibar" data-act="to-top" aria-label="Back to top"><span class="mt">${title}</span><span class="mr">${mult}<span class="ms">★ ${S.stars}</span></span></button>`;
}
// past the first row the compact bar takes over; sheets just add a shadow under their pinned title
app.addEventListener('scroll', e => {
  const el = e.target;
  if (el.classList.contains('screen')) app.classList.toggle('scrolled', el.scrollTop > 56);
  else if (el.classList.contains('sheet')) el.classList.toggle('scrolled', el.scrollTop > 4);
}, true);
// replaces the old one-minute guide: tips on the real home screen, the first time it opens
const COACH = [
  { sel: '.hold', title: 'Your cards', text: 'Hold a card to earn its multiplier. If it breaks, it’s out until midnight.' },
  { sel: '.pf', title: 'Your profile', text: 'Badges, notifications and settings live here.' },
  { sel: '.hero', title: 'Today’s score', text: 'Money left today × multiplier. Spend less and hold more cards.' },
  { sel: '.cv-log', title: 'Log a spend', text: 'See which card an entry would break before you save it.' },
  { sel: '.endbtn', title: 'End the day', text: 'Tap to get today’s receipt. If you forget, it happens at midnight.' }
];
function showCoach() {
  if (S.view !== 'home' || !S.held.length || S.coach >= COACH.length || lastSheet()) return;
  const c = COACH[S.coach], scr = app.querySelector('.screen'), el = app.querySelector(c.sel);
  if (!el) return;
  if (scr.contains(el)) scr.scrollTop = Math.max(0, el.offsetTop - 160);
  el.classList.add('coach-on');
  // the nav is its own stacking layer, so lift it above the dim when the tip points into it
  const nav = el.closest('.cv-nav');
  if (nav) nav.style.zIndex = 7;
  const a = app.getBoundingClientRect(), r = el.getBoundingClientRect();
  const above = r.bottom - a.top + 140 > a.height;
  // the pointer follows the target, whatever side of the screen it is on
  const ax = Math.max(22, Math.min(a.width - 36 - 38, Math.round(r.left + r.width / 2 - a.left - 18 - 8)));
  const dots = COACH.map((_, k) => `<i class="${k === S.coach ? 'on' : ''}"></i>`).join('');
  app.insertAdjacentHTML('beforeend', `<div class="coach-dim" aria-hidden="true"></div>
    <div class="coach ${above ? 'above' : ''}" role="dialog" aria-label="Tip" style="--ax:${ax}px;${above ? `bottom:${Math.round(a.bottom - r.top + 14)}px` : `top:${Math.round(r.bottom - a.top + 14)}px`}">
      <b class="ct">${c.title}</b>
      <span>${c.text}</span>
      <div class="row"><button class="skip" data-act="coach-skip">Skip tips</button><span class="cdots" aria-hidden="true">${dots}</span><button class="ok" data-act="coach-next">${S.coach < COACH.length - 1 ? 'Next' : 'Let’s go'}</button></div>
    </div>`);
}
function clearCoach() {
  app.querySelectorAll('.coach, .coach-dim').forEach(n => n.remove());
  app.querySelectorAll('.coach-on').forEach(n => n.classList.remove('coach-on'));
  const nav = app.querySelector('.cv-nav'); if (nav) nav.style.zIndex = '';
}
const tabsHTML = (items, attr) => `<div role="tablist" style="border-radius:20px;padding:5px;${CHECK}"><div style="display:flex;align-items:center;gap:4px;height:42px;padding:0 6px;border-radius:15px;background:#FFF">
  ${items.map(t => `<button role="tab" aria-selected="${!!t.on}" class="cv-tab ${t.on ? 'on' : ''}" ${attr}="${t.id}">${t.name}</button>`).join('')}${items.extra || ''}</div></div>`;

// each category gets a color and a one-character badge so a long ledger scans at a glance
const CAT_COLOR = { takeout: '#FF4D6A', tea: '#FF7BD5', online: '#2E8BFF', taxi: '#2FD15C', meal: '#FFD000', commute: '#C9C3FF', other: '#D4D4DB' };
// the everyday categories that have no rule card get their own small flat icons in the same style
const CAT_ART = {
  meal: '<circle cx="120" cy="116" r="76" fill="#FFD21F"/><circle cx="120" cy="116" r="50" fill="#FFF"/><path d="M26 56V120M40 56V120M54 56V120M26 120H54M40 120V190" stroke="#111" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M200 56Q222 90 200 124V190" stroke="#111" stroke-width="9" stroke-linecap="round" fill="none"/>',
  commute: '<rect x="36" y="38" width="168" height="124" rx="30" fill="#8D80FF"/><rect x="54" y="58" width="60" height="44" rx="10" fill="#FFF"/><rect x="126" y="58" width="60" height="44" rx="10" fill="#FFF"/><rect x="36" y="118" width="168" height="12" fill="#6A5BE0"/><circle cx="82" cy="170" r="20" fill="#111"/><circle cx="158" cy="170" r="20" fill="#111"/><circle cx="82" cy="170" r="7" fill="#FFF"/><circle cx="158" cy="170" r="7" fill="#FFF"/>',
  other: '<rect x="30" y="52" width="180" height="120" rx="34" fill="#9A9AA6"/><circle cx="80" cy="112" r="14" fill="#FFF"/><circle cx="120" cy="112" r="14" fill="#FFF"/><circle cx="160" cy="112" r="14" fill="#FFF"/>'
};
const catBadge = id => CAT_CARD[id] ? `<i class="lg-ico" style="background:${tintOf(CAT_CARD[id])}">${artIcon(CAT_CARD[id], 30)}</i>`
  : CAT_ART[id] ? `<i class="lg-ico" style="background:${mix(CAT_COLOR[id] || '#D4D4DB', 0.78)}"><svg width="30" height="28" viewBox="0 0 240 224" aria-hidden="true">${CAT_ART[id]}</svg></i>`
  : `<i class="lg-ico" style="background:${CAT_COLOR[id] || '#D4D4DB'}">${esc(cat(id).name.slice(0, 1))}</i>`;
function flowHTML(tabs) {
  const f = S.flowCat || 'all';
  // today stays editable; past days come from history and open their receipt
  const brT = breakers(S.today);
  const days = [{ label: 'Today', date: dateOf(S.week, S.day), items: [...S.today.map((x, i) => ({ x, edit: i, breaks: brT[i] })), ...S.wish.map(x => ({ x, wish: true }))] },
    ...S.history.slice().reverse().map(h => { const br = breakers(h.entries, h.held, h.teaBefore, h.weekBefore || 0); return { label: `${DAYS[h.day]}`, date: dateOf(h.week, h.day), cal: `${h.week}-${h.day}`, unlogged: h.unlogged, items: h.entries.map((x, i) => ({ x, breaks: br[i] })) }; })];
  const all = days.flatMap(d => d.items.filter(it => !it.wish));
  const byCat = {}; all.forEach(it => { byCat[it.x.cat] = (byCat[it.x.cat] || 0) + it.x.amt; });
  const shown = all.filter(it => f === 'all' || it.x.cat === f), total = shown.reduce((a, it) => a + it.x.amt, 0);
  const chips = [['all', 'All', all.reduce((a, it) => a + it.x.amt, 0)], ...Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([id, v]) => [id, cat(id).name, v])]
    .map(([id, name, v]) => `<button class="lg-chip ${f === id ? 'on' : ''}" data-flowcat="${id}" aria-pressed="${f === id}">${id === 'all' ? '' : `<i style="background:${CAT_COLOR[id] || '#D4D4DB'}"></i>`}${name}<b>$${v}</b></button>`).join('');
  const row = it => {
    const x = it.x, ess = !!cat(x.cat).ess;
    const tags = [ess ? 'Essential' : '', x.caught ? 'caught by bank' : '', x.night ? 'after 10 pm' : '', x.fromWish ? 'waited 24 hours' : '', it.wish ? 'Wish list · decide tomorrow' : ''].filter(Boolean).join(' · ');
    const sub = [x.note ? cat(x.cat).name : '', tags].filter(Boolean).join(' · ');
    const inner = `${catBadge(x.cat)}<span class="lg-main"><b>${x.note ? esc(x.note) : cat(x.cat).name}</b>${sub ? `<small>${sub}</small>` : ''}${it.breaks ? `<em>Broke ${it.breaks.join(', ')}</em>` : ''}</span><span class="lg-amt ${it.breaks ? 'hit' : ''} ${it.wish ? 'wished' : ''}">${it.wish ? '' : '−'}$${x.amt}</span>`;
    return it.edit != null ? `<button class="lg-row" data-edit="${it.edit}" aria-label="${entryName(x)} ${x.amt} dollars, tap to edit">${inner}</button>` : `<div class="lg-row">${inner}</div>`;
  };
  const groups = days.map(d => {
    const items = d.items.filter(it => f === 'all' || it.x.cat === f);
    if (!items.length && (f !== 'all' || d.label !== 'Today')) return '';
    const sum = items.filter(it => !it.wish).reduce((a, it) => a + it.x.amt, 0);
    const head = `<span>${d.label}<small>${d.date.getMonth() + 1}/${d.date.getDate()}</small></span><span class="px">$${sum}${d.cal ? ' · receipt →' : ''}</span>`;
    return `<section class="lg-day">${d.cal ? `<button class="lg-head" data-cal="${d.cal}">${head}</button>` : `<div class="lg-head">${head}</div>`}
      <div class="lg-list">${items.map(row).join('') || `<p class="note left" style="padding:12px 14px">${d.unlogged ? 'Nothing logged this day.' : 'Nothing spent yet today. Tap Log to start.'}</p>`}</div></section>`;
  }).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center">
      <h1 style="margin:0;font-weight:900;font-size:28px">Ledger</h1>
      <span class="px" style="height:32px;padding:0 12px;border-radius:12px;border:2px solid #E2E2E8;display:inline-flex;align-items:center;font-size:14px;color:#5E5E66">${shown.length} ${shown.length === 1 ? 'entry' : 'entries'} · $${total}</span>
    </div>
    ${tabs}
    <div class="lg-chips">${chips}</div>
    ${groups || '<p class="note">No spending in this category yet.</p>'}
    <button class="linkbtn" data-act="bank-link">${S.bank ? `Bank: ${S.bank.name} · honest nights ${(S.honest || 0) % 7}/7` : 'Connect a bank to catch forgotten purchases ›'}</button>`;
}

// bill: calendar month with keycap day cells (ToyBill) and where it went (ToyCats); always real money
function monthDays() {
  const now = dateOf(S.week, S.day), y = now.getFullYear(), m = now.getMonth();
  const recs = S.history.map(h => ({ h, d: dateOf(h.week, h.day) })).filter(o => o.d.getFullYear() === y && o.d.getMonth() === m);
  return { now, y, m, recs };
}
function monthByCat(recs) {
  const by = {};
  [...recs.flatMap(o => o.h.entries), ...S.today].filter(x => !cat(x.cat).ess).forEach(x => { by[x.cat] = (by[x.cat] || 0) + x.amt; });
  return Object.entries(by).sort((a, b) => b[1] - a[1]);
}
const CAT_CARD = { takeout: '01', tea: '03', online: '07', taxi: '04' };
// a small keycap with a label on top and a number below, for the month's headline figures
const statCap = (outer, face, label, value) => `<div class="cap" style="height:76px;background:${outer}"><div class="top" style="background:${face};padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between"><span style="font-size:11px;font-weight:900">${label}</span><span class="px" style="font-size:20px;font-weight:600">${value}</span></div></div>`;
function billHTML() {
  const { now, y, m, recs } = monthDays();
  const todayExtra = extraOf(S.today);
  const spent = recs.reduce((a, o) => a + o.h.extra, 0) + todayExtra;
  const free = Math.round(S.base * 4.3), n = new Date(y, m + 1, 0).getDate(), daysLeft = n - now.getDate() + 1;
  // Entries lives in the bill tab as its first segment: today's entries, then the month views
  const tabs = tabsHTML([{ id: 'flow', name: 'Entries', on: S.billTab === 'flow' }, { id: 'cal', name: 'Calendar', on: S.billTab === 'cal' }, { id: 'cat', name: 'Categories', on: S.billTab === 'cat' }, { id: 'review', name: 'Review', on: S.billTab === 'review' }], 'data-bill');
  if (S.billTab === 'flow') return flowHTML(tabs);
  if (S.billTab === 'cat') return catsHTML(recs, spent, tabs);
  if (S.billTab === 'review') return `<div style="display:flex;justify-content:space-between;align-items:center"><h1 style="margin:0;font-weight:900;font-size:28px">${MON[m]} review</h1><span class="px" style="font-size:12px;color:#5E5E66">So far through today</span></div>${tabs}${reviewHTML(y, m)}`;
  const avg = dailyBudget();
  const tone = h => h > 1 ? ['#D43AB4', 'linear-gradient(180deg,#FF7BE3 0%,#FF52D9 100%)'] : h >= 0.8 ? ['#D12E2E', 'linear-gradient(180deg,#FF7A7A 0%,#FF4B4B 100%)'] : h >= 0.4 ? ['#CFCFD6', 'linear-gradient(180deg,#FAFAFC 0%,#EDEDF1 100%)'] : ['#86A1B0', 'linear-gradient(180deg,#C4D8E3 0%,#A9C3D1 100%)'];
  const cells = [];
  for (let i = 0, lead = (new Date(y, m, 1).getDay() + 6) % 7; i < lead; i++) cells.push('<span class="cv-day blank"></span>');
  for (let d = 1; d <= n; d++) {
    const rec = recs.find(o => o.d.getDate() === d), isNow = d === now.getDate();
    if (!rec && !isNow) { cells.push(`<span class="cv-day future"><span>${d}</span></span>`); continue; }
    const v = rec ? rec.h.extra : todayExtra, [outer, face] = tone(v / avg);
    const inner = `<span style="background:${face}">${d}<b>$${v}</b></span>`;
    cells.push(rec ? `<button class="cv-day" style="background:${outer}" data-cal="${rec.h.week}-${rec.h.day}" aria-label="${MON[m]} ${d}: spent $${v}">${inner}</button>`
      : `<span class="cv-day now" style="background:${outer}" aria-label="Today, spent so far ${v} ">${inner}</span>`);
  }
  const top3 = monthByCat(recs).slice(0, 3), max = top3.length ? top3[0][1] : 1, stripes = ['#FF4B4B', '#FF52D9', '#A9C3D1'];
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h1 style="margin:0;font-weight:900;font-size:28px">${MON[m]} bill</h1></div>
    ${tabs}
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
      ${statCap('#B7B0F0', 'linear-gradient(180deg,#ECEAFF 0%,#DCD8FF 100%)', 'Discretionary', `$${free.toLocaleString()}`)}
      ${statCap('#D12E2E', 'linear-gradient(180deg,#FF7A7A 0%,#FF4B4B 100%)', 'Spent', `$${spent.toLocaleString()}`)}
      ${statCap('#B8D000', 'linear-gradient(180deg,#F2FF7A 0%,#E4FF1A 100%)', `Left ${daysLeft} days`, money(free - spent))}
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div class="px" style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;font-size:11px;color:#8A8A92;text-align:center"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
      <div class="cv-cal">${cells.join('')}</div>
      <div class="px" style="display:flex;flex-wrap:wrap;gap:10px;font-size:11px;color:#4A4A50;margin-top:4px">
        <span style="display:flex;align-items:center;gap:4px"><i style="width:10px;height:10px;border-radius:3px;background:#A9C3D1"></i>Frugal</span>
        <span style="display:flex;align-items:center;gap:4px"><i style="width:10px;height:10px;border-radius:3px;background:#E4E4EA;border:1px solid #CFCFD6"></i>Normal</span>
        <span style="display:flex;align-items:center;gap:4px"><i style="width:10px;height:10px;border-radius:3px;background:#FF4B4B"></i>A bit much</span>
        <span style="display:flex;align-items:center;gap:4px"><i style="width:10px;height:10px;border-radius:3px;background:#FF52D9"></i>Over the daily budget</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <h2>Top three categories</h2>
      ${top3.map(([id, v], i) => `<div style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;justify-content:space-between;font-size:12px"><span style="font-weight:900">${cat(id).name}</span><span class="px">$${v} · ${Math.round(v / Math.max(1, spent) * 100)}%</span></div><div aria-hidden="true" style="height:12px;width:${Math.round(v / max * 100)}%;border-radius:3px;background:repeating-linear-gradient(90deg,${stripes[i]} 0 12px,transparent 12px 15px)"></div></div>`).join('') || '<p class="note left">No spending outside the allowance this month yet.</p>'}
    </div>`;
}
function catsHTML(recs, spent, tabs) {
  const rows = monthByCat(recs), total = Math.max(1, rows.reduce((a, r) => a + r[1], 0));
  const bands = rows.slice(0, 3);
  const rest = rows.slice(3).reduce((a, r) => a + r[1], 0);
  if (rest) bands.push(['rest', rest]);
  const STY = [
    { h: 200, bg: '#FF4B4B', sh: '#B82525', pct: 120, pc: '#111', fs: 26 }, { h: 124, bg: '#FF8CC6', sh: '#D25D9B', pct: 80, pc: '#FFF', fs: 20 },
    { h: 116, bg: '#DCD8FF', sh: '#B7B0F0', pct: 72, pc: '#5B4FC8', fs: 20 }, { h: 100, bg: '#EDEDF1', sh: '#CFCFD6', pct: 60, pc: '#B5B5BC', fs: 18 }
  ];
  const html = bands.map(([id, v], i) => {
    const s = STY[i], name = id === 'rest' ? 'Other' : cat(id).name, cardNo = CAT_CARD[id];
    return `<div class="cv-band" style="height:${s.h}px;z-index:${4 - i};${i ? 'margin-top:-18px;padding-top:32px;' : ''}background:${s.bg};box-shadow:0 9px 0 ${s.sh},0 14px 20px rgba(20,20,30,0.15)">
      <div class="cv-lbl"><span style="font-weight:900;font-size:${s.fs}px">${name}</span><span class="px" style="font-size:14px">$${v}</span>
        ${i === 0 && cardNo ? `<span class="px" style="align-self:flex-start;padding:1px 8px;border-radius:8px;background:#111;color:#E4FF1A;font-size:12px">Drew “${CARDS[cardNo].name}” — keep it</span>` : ''}</div>
      <span class="cv-pct" style="font-size:${s.pct}px;color:${s.pc}">${Math.round(v / total * 100)}%</span>
      ${i === 0 && cardNo ? `<div style="position:absolute;right:18px;top:14px;width:54px;height:54px;border-radius:14px;background:${tintOf(cardNo)};display:flex;align-items:center;justify-content:center;transform:rotate(10deg);box-shadow:0 0 0 3px #FFF">${artIcon(cardNo, 42)}</div>` : ''}
    </div>`;
  }).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h1 style="margin:0;font-weight:900;font-size:28px">Where it went</h1><span class="px" style="font-size:12px;color:#5E5E66">Outside the allowance $${spent.toLocaleString()}</span></div>
    ${tabs}
    <div style="display:flex;flex-direction:column;margin-top:6px">${html || '<p class="note">No spending outside the allowance this month yet.</p>'}</div>`;
}

// deck: every card as an icon tile, with filters (ToyDeck)
function deckHTML() {
  // keys like '10' sort as integers ahead of '01', so order by card number explicitly
  const all = Object.values(CARDS).sort((a, b) => a.no.localeCompare(b.no));
  const open = all.filter(x => S.unlocked.includes(x.no));
  const f = S.deckTab || 'all';
  const gradCards = all.filter(x => S.grad.includes(x.no));
  // the multiplier chips above the grid filter it, and their colors double as the key to the tile colors
  const plus = S.deckPlus || 0;
  const shown = (f === 'open' ? open : f === 'grad' ? gradCards : all).filter(x => !plus || x.plus === plus);
  const dots = open.slice(0, 4).map(x => `<span style="width:34px;height:34px;border-radius:50%;border:4px solid ${coreOf(x.no)};background:${tintOf(x.no)};margin-left:-10px;box-shadow:0 0 0 2px #FFF;display:flex;align-items:center;justify-content:center">${artIcon(x.no, 18)}</span>`).join('');
  const cells = shown.map(x => {
    const isOpen = S.unlocked.includes(x.no) || S.grad.includes(x.no), log = S.cardLog[x.no];
    const badge = S.grad.includes(x.no) ? '<span class="cv-grad">Graduated</span>' : S.held.includes(x.no) ? '<span class="cv-grad">This week</span>' : log && log.streak && !x.noGrad ?`<span class="cv-grad">Streak ${log.streak}/${GRAD_WEEKS}</span>` : '';
    const own = log ? '<span class="cv-own"><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 5l2 2 4-4" stroke="#FFF" stroke-width="1.8" fill="none"/></svg></span>' : '';
    return isOpen
      ? `<button class="cv-cell" data-info="${x.no}" aria-label="${x.name}, +${x.plus} Mult${log ? `, held ${log.held}/${log.days} days` : ''}"><div class="cv-icon" style="background:${tintOf(x.no)}">${artIcon(x.no, 54)}${badge}${own}</div><span class="cv-name">${x.name} <span class="px" style="font-weight:400">+${x.plus}</span></span></button>`
      : `<button class="cv-cell" data-info="${x.no}" aria-label="${x.name}, unlocks at ${x.unlock} stars"><div class="cv-icon cv-lock"><svg width="54" height="50" viewBox="0 0 240 224" aria-hidden="true">${ILL[x.no](palOf(coreOf(x.no), true))}</svg><span class="cv-star px">★${x.unlock}</span></div><span class="cv-name" style="color:#8A8A92">${x.name}</span></button>`;
  }).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center">
      <div><h1 style="margin:0;font-weight:900;font-size:28px">Deck</h1><p class="px" style="margin:2px 0 0;font-size:12px;color:#5E5E66">Week ${S.week} · ★ ${S.stars} · ${STAKES[S.stake].name}</p></div>
      <div style="display:flex;align-items:center;height:52px;padding:0 14px 0 22px;border-radius:26px;border:2px solid #E2E2E8">${dots}
        <span class="px" aria-label="Unlocked ${open.length} / ${all.length}" style="margin-left:10px;display:flex;flex-direction:column;align-items:center;font-size:14px;line-height:1"><b style="font-weight:400">${open.length}</b><i style="width:22px;height:2px;margin:3px 0;background:#111"></i><b style="font-weight:400">${all.length}</b></span></div>
    </div>
    ${tabsHTML([{ id: 'all', name: `All <span class="px" style="font-weight:400">${all.length}</span>`, on: f === 'all' }, { id: 'open', name: `Unlocked <span class="px" style="font-weight:400">${open.length}</span>`, on: f === 'open' }, { id: 'grad', name: `Graduated <span class="px" style="font-weight:400">${S.grad.length}</span>`, on: f === 'grad' }, { id: 'shop', name: 'Shop', on: f === 'shop' }], 'data-deck')}
    ${f === 'shop' ? shopBody() : `
    ${f === 'grad' ? `<p class="note left" style="margin:0">Graduated cards leave the deck and add +1 to your base multiplier (now ×${S.baseMult}).</p>` : ''}
    <div class="dk-plus" role="group" aria-label="Show cards by multiplier"><span>Mult</span>
      <button data-plus="0" aria-pressed="${!plus}">All</button>
      ${[...new Set(all.map(x => x.plus))].sort().map(n => `<button data-plus="${n}" aria-pressed="${plus === n}" style="--c:${TYPES[n].core};--t:${TYPES[n].chipText}"><i></i>+${n}</button>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));row-gap:16px;column-gap:8px">${cells || `<p class="note" style="grid-column:1/-1">${plus ? `No +${plus} cards here.` : 'No cards here yet.'}</p>`}</div>`}`;
}
