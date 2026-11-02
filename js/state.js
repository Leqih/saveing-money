/* ---------- state ---------- */
// a new user joins on whatever weekday today is; week 1 runs from that day to Sunday as a short week
const NOW = new Date();
const JOIN = (NOW.getDay() + 6) % 7;
// a saved game brings back its own week-1 Monday (see loadState)
let START = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - JOIN);
let S = {
  week: 1, day: JOIN, weekStart: JOIN, held: [], stars: 0, unlocked: ['01', '06', '03', '04', '05', '10', '15', '07'], lastWeek: [], estimated: false, firstDraw: true,
  base: BASE, setup: { income: 6000, fixed: 2500, save: 2000 }, weak: [], freq: {}, coach: 0, view: 'home', billTab: 'flow', cardLog: {},
  baseMult: 1, grad: [], stake: 0, nextStake: 0, carry: null, debt: 0, starsTotal: 0, slots: 3, glue: 0, glued: null, pinned: [],
  prefs: { evening: true, eveningAt: 21.5, ruleAlerts: true, morning: true },
  history: [], today: [{ cat: 'meal', amt: 8, note: 'Breakfast' }], teaWeek: 0, wish: [], revisit: [],
  quicks: [{ label: 'Breakfast', cat: 'meal', amt: 8 }, { label: 'Transit', cat: 'commute', amt: 4 }, { label: 'Starbucks', cat: 'tea', amt: 6 }, { label: 'DoorDash', cat: 'takeout', amt: 32 }]
};
let draft = {};
S.seen = new Set();
// time of day drives the evening reminder, rule alerts and the 22:00 default; the demo lets you jump between moments
// before 6am the demo starts at a morning commute rather than the middle of the night
const clockNow = (n = new Date()) => n.getHours() < 6 ? 8.5 : n.getHours() + n.getMinutes() / 60;
S.clock = clockNow(NOW);
const TIMES = [{ c: 8.5, name: 'Morning commute' }, { c: 12 + 1 / 6, name: 'Lunch' }, { c: 18.5, name: 'Dinner' }, { c: 21.5, name: 'Evening' }, { c: 22 + 2 / 3, name: 'Late night' }];
const fmtClock = c => `${String(Math.floor(c)).padStart(2, '0')}:${String(Math.round((c % 1) * 60)).padStart(2, '0')}`;
// with no receipts yet, "how often" answers on the weak-spot step stand in for last week
const FREQ = [{ label: '1–2×', n: 2 }, { label: '3–5×', n: 4 }, { label: 'Almost daily', n: 7 }];
const TYPICAL = {
  takeout: { cat: 'takeout', amt: 30, note: 'Takeout' }, tea: { cat: 'tea', amt: 6, note: 'Coffee' }, online: { cat: 'online', amt: 60, note: 'Online' },
  taxi: { cat: 'taxi', amt: 22, note: 'Rideshare' }, night: { cat: 'other', amt: 40, note: 'Late-night orders', night: true }, weekend: { cat: 'other', amt: 80, note: 'Weekend outings', weekend: true }
};
function estimateWeek() {
  const days = DAYS.map(() => []);
  S.weak.forEach(id => {
    const t = TYPICAL[id], f = S.freq[id] ?? 1, n = FREQ[f].n;
    // weekends only have two days, so the answer scales how much is spent rather than how often
    if (t.weekend) { [5, 6].forEach(d => days[d].push({ cat: t.cat, amt: [50, 80, 120][f], note: t.note })); return; }
    for (let i = 0; i < n; i++) days[Math.floor(i * 7 / n)].push({ cat: t.cat, amt: t.amt, note: t.note, night: !!t.night });
  });
  return days;
}
const START_DAY = (w, d) => { const x = new Date(START); x.setDate(x.getDate() + (w - 1) * 7 + d); return x; };
const dateOf = START_DAY;
// the six weak spots and mascot tiles from the canvas pick screen, each pointing at the card that targets it
const EYES = '<ellipse cx="25" cy="30" rx="2.6" ry="4.5" fill="#FFF"/><ellipse cx="35" cy="30" rx="2.6" ry="4.5" fill="#FFF"/>';
const WEAK = [
  { id: 'takeout', name: 'Takeout', card: '01', bg: '#FFD000', svg: `<polygon points="58,30 48.5,37.7 49.8,49.8 37.7,48.5 30,58 22.3,48.5 10.2,49.8 11.5,37.7 2,30 11.5,22.3 10.2,10.2 22.3,11.5 30,2 37.7,11.5 49.8,10.2 48.5,22.3" fill="#111"/>${EYES}` },
  { id: 'tea', name: 'Coffee & Tea', card: '03', bg: '#FF7BD5', svg: `<circle cx="30" cy="30" r="22" fill="#111"/>${EYES}` },
  { id: 'online', name: 'Online', card: '07', bg: '#2E8BFF', svg: '<rect x="6" y="16" width="48" height="28" rx="8" fill="#111"/><ellipse cx="24" cy="30" rx="2.6" ry="4.5" fill="#FFF"/><ellipse cx="36" cy="30" rx="2.6" ry="4.5" fill="#FFF"/>' },
  { id: 'taxi', name: 'Rideshare', card: '04', bg: '#2FD15C', svg: '<path d="M24 4h12v8h8v8h8v20h-8v8h-8v8H24v-8h-8v-8H8V20h8v-8h8z" fill="#111"/><rect x="23" y="24" width="5" height="10" fill="#FFF"/><rect x="33" y="24" width="5" height="10" fill="#FFF"/>' },
  { id: 'night', name: 'Late night', card: '06', bg: '#FF4D6A', svg: `<path d="M30 2C33 22 38 27 58 30C38 33 33 38 30 58C27 38 22 33 2 30C22 27 27 22 30 2Z" fill="#111"/>${EYES}` },
  { id: 'weekend', name: 'Weekend', card: '15', bg: '#A55BFF', svg: '<path d="M6 12H54L30 54Z" fill="#111" stroke="#111" stroke-width="6" stroke-linejoin="round"/><ellipse cx="25" cy="24" rx="2.6" ry="4.5" fill="#FFF"/><ellipse cx="35" cy="24" rx="2.6" ry="4.5" fill="#FFF"/>' }
];
const weeklyFrom = s => Math.round((s.income - s.fixed - s.save) / 4.3);

const weekHist = () => S.history.filter(h => h.week === S.week);
// this week's days that ended with nothing logged and haven't been answered for yet (spent nothing, or forgot)
const pendingUnlogged = () => weekHist().filter(h => h.unlogged && !h.resolved);
// days since week 1's Monday by the calendar, to compare with the day the game is on
const dayNo = (d = new Date()) => Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - START) / 864e5);
// the week after this one, or the calendar's week when weeks went by unplayed (see startWeek)
const nextWeekNo = () => Math.max(S.week + 1, Math.floor(dayNo() / 7) + 1);
const dailyBudget = () => Math.round(S.base / 7);
// money spent past today's allowance comes out of tomorrow's, so every dollar still counts after a blown day
const todayBudget = () => Math.max(0, dailyBudget() - S.debt);
// tomorrow gives up at most half its allowance, so one blown day can't zero out the rest of the week
const debtCap = () => Math.round(dailyBudget() / 2);
const weekDays = () => 7 - S.weekStart;
// stakes raise the bar after a pass, the way Balatro moves from white to black stake
// star: what a pass's stars are multiplied by on this stake (rounded), rather than a flat bonus per stake
const STAKES = [{ name: 'White Stake', k: 1, star: 1, bg: '#FFFFFF', fg: '#111' }, { name: 'Red Stake', k: 1.25, star: 1.25, bg: '#FF4D6A', fg: '#FFF' }, { name: 'Blue Stake', k: 1.5, star: 1.5, bg: '#2E8BFF', fg: '#FFF' }, { name: 'Black Stake', k: 1.8, star: 2, bg: '#111', fg: '#E4FF1A' }];
const weekTarget = () => targetFor({ daily: dailyBudget(), days: weekDays(), stakeK: STAKES[S.stake].k, baseMult: S.baseMult, slots: S.slots, overflow: S.overflow });
const scorePrior = () => weekHist().reduce((a, h) => a + h.score, 0);
const moneyWeek = () => Math.round(S.base * weekDays() / 7);
const spentWeek = () => weekHist().reduce((a, h) => a + h.extra, 0) + extraOf(S.today);
// weekBefore: money spent outside the allowance earlier this week, for cards that look at the whole week
const weekExtraSoFar = () => weekHist().reduce((a, h) => a + h.extra, 0);
// the scoring context for today as the game stands; glue only counts for this week's real hand
function dayContext(held = S.held, teaBefore = S.teaWeek, assumeLogged = false, daily = todayBudget(), weekBefore = weekExtraSoFar(), dayIdx = S.day) {
  const glued = held === S.held && S.glued && S.glued.week === S.week && S.glued.day === S.day ? S.glued.no : null;
  return { held, teaBefore, assumeLogged, daily, weekBefore, dayIdx, glued, baseMult: S.baseMult, allowance: dailyBudget(), weekCap: Math.round(moneyWeek() / 2), bankLinked: !!S.bank, wishToday: S.wish.length };
}
// the game-aware entry point used everywhere else: same arguments as always, scored by the pure scoreDay
const evaluate = (list, ...args) => scoreDay(list, dayContext(...args));
// slots can grow to four in the shop
// eight cards are dealt every week (or the whole pool while fewer are unlocked); you keep as many as you have slots
const HOLDN = () => S.slots, DEALN = () => Math.max(S.slots, Math.min(8, S.unlocked.length));
// which entry first cracked each card, so lists can point at the culprit
function breakers(list, held = S.held, teaBefore = S.teaWeek, weekBefore = weekExtraSoFar()) {
  const out = {};
  let prev = evaluate([], held, teaBefore, true, undefined, weekBefore);
  list.forEach((x, i) => {
    const now = evaluate(list.slice(0, i + 1), held, teaBefore, true, undefined, weekBefore);
    now.cards.forEach((c, k) => { if (c.state === 'broken' && prev.cards[k].state !== 'broken') (out[i] = out[i] || []).push(CARDS[c.no].name); });
    prev = now;
  });
  return out;
}
// run a week of receipts through a set of held cards: total score and how many days each card would have held
function simulate(held, days, start) {
  let tea = 0, spent = 0, total = 0;
  const per = {}; held.forEach(n => { per[n] = 0; });
  const list = days.slice(start);
  list.forEach((day, k) => {
    const ev = evaluate(day, held, tea, true, dailyBudget(), spent, start + k);
    tea += teaOf(day); spent += ev.d.extra; total += ev.score;
    ev.cards.forEach(c => { if (c.state === 'on') per[c.no]++; });
  });
  return { total, per, days: list.length };
}
