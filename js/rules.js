/* ---------- rules ---------- */
// today's score = money left today × multiplier; the multiplier starts at 1 and every card still holding adds its +n
const CARDS = {
  '01': { no: '01', name: 'Takeout Nemesis', plus: 2, diff: 2, cond: 'No takeout today', eg: 'Order takeout today and this card breaks for the day (−2 mult). It’s back at midnight.',
    broken: d => d.has('takeout'), why: d => `Takeout today: $${d.sum('takeout')}` },
  '06': { no: '06', name: 'Night Cat', plus: 2, diff: 2, cond: 'Nothing spent after 10 pm', eg: 'Buy a coffee at 11 pm and this card breaks for the day. Daytime spending doesn’t affect it.',
    broken: d => d.night, why: d => `Spent after 10 pm $${d.nightSum}` },
  '03': { no: '03', name: 'Coffee Quota', plus: 1, diff: 1, weekly: true, cond: 'No more than 3 coffee or boba runs this week', eg: 'The first 3 are fine; the 4th breaks this card until Sunday, and each cup after that costs another −1 mult that day.',
    broken: d => d.weekTea > 3, why: d => `You’ve had ${d.weekTea} cups`, near: d => d.weekTea === 3 ? '3 cups already this week. One more breaks Coffee Quota, and each cup after that costs −1 mult.' : null,
    // past the cup that cracked it, every cup costs a point of multiplier on the day it is drunk
    penalty: d => Math.max(0, d.weekTea - Math.max(4, d.teaBefore)) },
  '04': { no: '04', name: 'Walker', plus: 1, diff: 1, cond: 'No rideshares today', eg: 'One Uber or Lyft ride breaks this card for the day. Subway and bus count as commuting, so they’re fine.',
    broken: d => d.has('taxi'), why: d => `Rideshare today: $${d.sum('taxi')}` },
  // holding Zero Day already holds these four (online buys are outside the allowance even from the wishlist), so they can't be kept alongside it
  '05': { no: '05', name: 'Zero Day', plus: 4, diff: 3, clash: ['01', '04', '13', '07', '02', '08', '09', '11'], cond: 'Nothing outside the allowance today', eg: 'Only meals and commuting are allowed; one coffee breaks it. The hardest card, and the most rewarding.',
    broken: d => d.extra > 0, why: d => `Extras today: $${d.extra}` },
  // one entry a day wakes it, so holding it says nothing about a habit changing: it never graduates
  '10': { no: '10', name: 'Bookkeeper', plus: 1, diff: 1, noGrad: true, cond: 'Log at least one entry today', eg: 'Inactive until you log something. Meals and commuting count.',
    pending: d => d.count === 0, why: () => 'Nothing logged yet today' },
  '07': { no: '07', name: 'Cool-Off', plus: 2, diff: 2, unlock: 3, cond: 'Put online orders on the wish list and wait 24 hours', eg: 'Buying on the spot breaks it. Buying from the wish list after 24 hours is fine.',
    broken: d => d.directOnline, why: d => `Bought online on the spot $${d.sum('online')}` },
  // a week-long allowance: half the week's money outside meals and commute; past it, each $20 more costs a point that day
  '15': { no: '15', name: 'Weekly Cap', plus: 2, diff: 2, weekly: true, cond: 'Extra spending this week stays under half your weekly allowance', eg: 'Saving on weekdays and splurging on the weekend is fine; only the weekly total counts. Once broken, it stays broken until Sunday, and each extra $20 after that costs −1 mult that day.',
    broken: d => d.weekExtra > d.weekCap, why: d => `Extras this week: $${d.weekExtra} (cap $${d.weekCap})`,
    near: d => d.weekExtra > d.weekCap * 0.75 ? `Extras this week: $${d.weekExtra}. $${d.weekCap - d.weekExtra + 1} more breaks Weekly Cap` : null,
    penalty: d => d.weekBefore > d.weekCap ? Math.ceil(d.extra / 20) : 0 },
  // Zero Day already allows no extra entry at all, so the two overlap
  '16': { no: '16', name: 'One-Shot', plus: 2, diff: 2, unlock: 9, clash: ['05'], cond: 'At most one purchase outside the allowance today', eg: 'A coffee is fine, but a second purchase breaks it. Save up and buy it all at once.',
    broken: d => d.extraCount > 1, why: d => `Extras today: ${d.extraCount} purchases`, near: d => d.extraCount === 1 ? 'That’s one extra purchase already. One more breaks One-Shot' : null },
  '17': { no: '17', name: 'Lunchbox', plus: 1, diff: 1, unlock: 12, cond: 'Meals today under $30', eg: 'A packed lunch or cafeteria meal keeps it going, but a $40 lunch breaks it. Delivery counts as takeout, not meals.',
    broken: d => d.sum('meal') > 30, why: d => `Meals today: $${d.sum('meal')}`, near: d => d.sum('meal') > 20 && d.sum('meal') <= 30 ? `Meals today already $${d.sum('meal')}, spend $${31 - d.sum('meal')} more and Lunchbox breaks` : null },
  '02': { no: '02', name: 'Coffee Break', plus: 1, diff: 1, unlock: 4, clash: ['05'], cond: 'At most one coffee or boba today', eg: 'One latte is fine; a second breaks it for the day. It’s back at midnight.',
    broken: d => d.teaToday > 1, why: d => `${d.teaToday} coffee runs today`, near: d => d.teaToday === 1 ? 'One coffee already today. A second breaks Coffee Break' : null },
  '08': { no: '08', name: 'Small Change', plus: 1, diff: 1, unlock: 5, clash: ['05'], cond: 'No single extra purchase over $25', eg: 'Several small purchases are fine, but one big one breaks it.',
    broken: d => d.maxExtra > 25, why: d => `One purchase of $${d.maxExtra}`, near: d => d.maxExtra > 15 && d.maxExtra <= 25 ? `Your biggest buy today is $${d.maxExtra}; anything over $25 breaks Small Change` : null },
  '09': { no: '09', name: 'Even Keel', plus: 1, diff: 1, unlock: 7, clash: ['05'], cond: 'Spend less than half your daily allowance on extras', eg: 'On a $50 day, that’s $25 or less on extras. Go over and it breaks for the day.',
    broken: d => d.extra > dailyBudget() / 2, why: d => `Extras today: $${d.extra} (half is $${Math.round(dailyBudget() / 2)})`, near: d => d.extra > dailyBudget() * 0.35 && d.extra <= dailyBudget() / 2 ? `Extras today: $${d.extra}, past $${Math.round(dailyBudget() / 2)} Even Keel breaks` : null },
  '11': { no: '11', name: 'Window Shopper', plus: 1, diff: 1, unlock: 8, clash: ['05'], cond: 'Online orders under $30 today', eg: 'Browse all you like, but a $30+ online order breaks it. Pairs well with the wish list.',
    broken: d => d.sum('online') > 30, why: d => `Online today: $${d.sum('online')}`, near: d => d.sum('online') > 20 && d.sum('online') <= 30 ? `Online today already $${d.sum('online')}; over $30 breaks Window Shopper` : null },
  '12': { no: '12', name: 'Two-Cup Week', plus: 2, diff: 2, weekly: true, unlock: 10, clash: ['03'], cond: 'No more than 2 coffee or boba runs a week', eg: 'The 3rd cup breaks it until Sunday, and each cup after that costs another −1 mult that day. A stricter Coffee Quota.',
    broken: d => d.weekTea > 2, why: d => `You’ve had ${d.weekTea} cups`, near: d => d.weekTea === 2 ? '2 cups already this week. One more breaks Two-Cup Week.' : null,
    penalty: d => Math.max(0, d.weekTea - Math.max(3, d.teaBefore)) },
  '14': { no: '14', name: 'Weekly Light', plus: 3, diff: 3, weekly: true, unlock: 13, clash: ['15'], cond: 'Extra spending this week stays under a third of your weekly allowance', eg: 'The tough version of Weekly Cap. Once broken, it stays broken until Sunday, and each extra $20 after that costs −1 mult that day.',
    broken: d => d.weekExtra > Math.round(d.weekCap * 2 / 3), why: d => `Extras this week: $${d.weekExtra} (cap $${Math.round(d.weekCap * 2 / 3)})`,
    near: d => d.weekExtra > d.weekCap * 0.5 ? `Extras this week: $${d.weekExtra}, over $${Math.round(d.weekCap * 2 / 3)} Weekly Light breaks` : null,
    penalty: d => d.weekBefore > Math.round(d.weekCap * 2 / 3) ? Math.ceil(d.extra / 20) : 0 },
  '18': { no: '18', name: 'Honest Day', plus: 2, diff: 2, unlock: 6, cond: 'Log everything yourself, with nothing for the bank to catch', eg: 'Needs a connected bank and stays inactive without one. If the bank spots a purchase you didn’t log, this card breaks for the day.',
    pending: d => !d.bankLinked, broken: d => d.caughtCount > 0, why: d => d.bankLinked ? `The bank caught ${d.caughtCount} purchase${d.caughtCount > 1 ? 's' : ''} you didn’t log` : 'Connect a bank to wake it' },
  '19': { no: '19', name: 'Full Ledger', plus: 1, diff: 1, unlock: 4, noGrad: true, clash: ['25'], cond: 'Log at least three entries today, including meals and commuting', eg: 'Inactive until your third entry. Logging the small stuff is the whole point.',
    pending: d => d.entryCount < 3, why: d => `${d.entryCount} of 3 entries logged` },
  '20': { no: '20', name: 'Chain Reaction', plus: 1, diff: 2, chain: true, unlock: 8, cond: '+1 for every other card in your hand that holds today', eg: 'Never breaks, but it only pays off when the rest of your hand holds. With three cards, it’s worth up to +2.',
    why: () => '' },
  '21': { no: '21', name: 'High Roller', plus: 5, diff: 3, noGlue: true, unlock: 14, clash: ['05'], cond: 'Spend nothing extra: +5. Spend anything: −3', eg: 'The big gamble. Glue can’t fix it and there’s no stop-loss: it either adds +5 or costs you 3 mult tonight.',
    broken: d => d.extra > 0, why: d => `Extras today: $${d.extra}`, penalty: () => 3 },
  '22': { no: '22', name: 'Wish Keeper', plus: 2, diff: 2, unlock: 7, cond: 'Put one thing on the wish list today', eg: 'Inactive until you wish-list something instead of buying it. Skip it the next morning and you keep the money.',
    pending: d => d.wishToday === 0, why: () => 'Nothing on the wish list yet today' },
  '23': { no: '23', name: 'Weekend Brake', plus: 3, diff: 2, unlock: 9, cond: 'Saturday and Sunday: at most $40 extra a day', eg: 'Inactive Monday to Friday. On the weekend, it holds as long as your extras stay under $40 a day.',
    pending: d => !d.weekend, broken: d => d.extra > 40, why: d => d.weekend ? `Extras today: $${d.extra} (limit $40)` : 'Wakes on Saturday', near: d => d.extra > 25 && d.extra <= 40 ? `Extras today: $${d.extra}, past $40 Weekend Brake breaks` : null },
  '24': { no: '24', name: 'Weekday Guard', plus: 2, diff: 2, unlock: 5, cond: 'Monday to Friday: at most $15 extra a day', eg: 'Inactive on the weekend. On a weekday, it holds as long as your extras stay under $15.',
    pending: d => d.weekend, broken: d => d.extra > 15, why: d => d.weekend ? 'Wakes on Monday' : `Extras today: $${d.extra} (limit $15)`, near: d => d.extra > 8 && d.extra <= 15 ? `Extras today: $${d.extra}, past $15 Weekday Guard breaks` : null },
  '25': { no: '25', name: 'Minimalist', plus: 3, diff: 3, unlock: 11, clash: ['19'], cond: 'At most two entries today, including meals and commuting', eg: 'Spend less, log less. A third entry breaks it for the day.',
    broken: d => d.entryCount > 2, why: d => `${d.entryCount} entries today`, near: d => d.entryCount === 2 ? 'Two entries already. A third breaks Minimalist' : null },
  '26': { no: '26', name: 'Monk Week', plus: 4, diff: 3, weekly: true, unlock: 16, clash: ['15', '14'], cond: 'Extra spending this week stays under $20 in total', eg: 'The strictest weekly card. Once broken, it stays broken until Sunday, and each extra $10 after that costs −1 mult that day.',
    broken: d => d.weekExtra > 20, why: d => `Extras this week: $${d.weekExtra} (cap $20)`, near: d => d.weekExtra > 12 ? `Extras this week: $${d.weekExtra}, over $20 Monk Week breaks` : null,
    penalty: d => d.weekBefore > 20 ? Math.ceil(d.extra / 10) : 0 },
  '13': { no: '13', name: 'Piggy Bank', plus: 2, diff: 2, unlock: 6, cond: 'At most $20 outside the allowance today', eg: 'A coffee is fine, but add takeout and it breaks.',
    broken: d => d.extra > 20, why: d => `Extras today: $${d.extra}`, near: d => d.extra > 10 && d.extra <= 20 ? `Extras today: $${d.extra}. $${21 - d.extra} more breaks Piggy Bank` : null }
};
const clashes = (a, b) => (CARDS[a].clash || []).includes(b) || (CARDS[b].clash || []).includes(a);
const clashIn = (no, sel) => sel.find(x => x !== no && clashes(no, x));
const clashNames = no => Object.keys(CARDS).filter(x => clashes(no, x)).map(x => CARDS[x].name);
const BASE = 350;
// slots can grow to four in the shop
// eight cards are dealt every week (or the whole pool while fewer are unlocked); you keep as many as you have slots
const HOLDN = () => S.slots, DEALN = () => Math.max(S.slots, Math.min(8, S.unlocked.length));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATS = [
  { id: 'takeout', name: 'Takeout' }, { id: 'tea', name: 'Coffee & Tea' }, { id: 'online', name: 'Online' }, { id: 'taxi', name: 'Rideshare' },
  { id: 'meal', name: 'Meals', ess: true }, { id: 'commute', name: 'Commute', ess: true }, { id: 'other', name: 'Other' }
];
const cat = id => CATS.find(c => c.id === id) || { name: 'Other' };
// meals and commute up to the daily allowance (set on the budget step) don't count; anything above it does
let essQuota = 45;
const essOf = list => list.filter(x => cat(x.cat).ess).reduce((a, x) => a + x.amt, 0);
const overOf = list => Math.max(0, essOf(list) - essQuota);
const extraOf = list => list.filter(x => !cat(x.cat).ess).reduce((a, x) => a + x.amt, 0) + overOf(list);
const teaOf = list => list.filter(x => x.cat === 'tea').length;

function facts(list, teaBefore, assumeLogged, weekBefore = 0, dayIdx = S.day) {
  const extra = extraOf(list);
  return {
    // the day of the week (0 = Mon), whether a bank is linked, what the bank had to catch, and wish-list use today
    dow: dayIdx, weekend: dayIdx >= 5, bankLinked: !!S.bank, caughtCount: list.filter(x => x.caught).length, wishToday: S.wish.length, entryCount: list.length,
    weekBefore, weekExtra: weekBefore + extra, weekCap: Math.round(moneyWeek() / 2), extraCount: list.filter(x => !cat(x.cat).ess).length,
    count: assumeLogged ? Math.max(1, list.length) : list.length, extra,
    night: list.some(x => x.night), nightSum: list.filter(x => x.night).reduce((a, x) => a + x.amt, 0),
    teaBefore, weekTea: teaBefore + teaOf(list), teaToday: teaOf(list), maxExtra: Math.max(0, ...list.filter(x => !cat(x.cat).ess).map(x => x.amt)), directOnline: list.some(x => x.cat === 'online' && !x.fromWish),
    has: id => list.some(x => x.cat === id), sum: id => list.filter(x => x.cat === id).reduce((a, x) => a + x.amt, 0)
  };
}
// weekBefore: money spent outside the allowance earlier this week, for cards that look at the whole week
const weekExtraSoFar = () => weekHist().reduce((a, h) => a + h.extra, 0);
function evaluate(list, held = S.held, teaBefore = S.teaWeek, assumeLogged = false, daily = todayBudget(), weekBefore = weekExtraSoFar(), dayIdx = S.day) {
  const d = facts(list, teaBefore, assumeLogged, weekBefore, dayIdx);
  const cards = held.map(no => {
    const c = CARDS[no];
    let state = c.pending && c.pending(d) ? 'pending' : c.broken && c.broken(d) ? 'broken' : 'on';
    // glue from the shop mends one cracked card for the rest of today
    if (state === 'broken' && !c.noGlue && held === S.held && S.glued && S.glued.week === S.week && S.glued.day === S.day && S.glued.no === no) state = 'on';
    // gain is what the card adds to today's multiplier: its +n while it holds, half back (stop-loss) when a daily card
    // cracked and nothing outside the allowance was spent after it, or a minus for a weekly card overrun again today
    let gain = state === 'on' ? c.plus : 0, saved = false;
    if (state === 'broken' && c.penalty) gain = -c.penalty(d);
    else if (state === 'broken' && Math.floor(c.plus / 2) > 0) {
      const at = list.findIndex((_, i) => c.broken(facts(list.slice(0, i + 1), teaBefore, assumeLogged, weekBefore)));
      saved = at >= 0 && extraOf(list) === extraOf(list.slice(0, at + 1));
      if (saved) gain = Math.floor(c.plus / 2);
    }
    return { no, state, gain, saved, why: state === 'on' ? '' : c.why(d), near: state === 'on' && c.near ? c.near(d) : null };
  });
  // a chain card is worth its +n for every other card that holds today
  cards.forEach(x => { const c = CARDS[x.no]; if (c.chain && x.state === 'on') x.gain = c.plus * cards.filter(y => y !== x && y.state === 'on').length; });
  const mult = Math.max(1, S.baseMult + cards.reduce((a, x) => a + x.gain, 0));
  const base = Math.max(0, daily - d.extra);
  return { d, cards, mult, base, daily, left: daily - d.extra, score: base * mult };
}
// days saved before stop-loss existed carry no gain, so fall back to all-or-nothing
const gainOf = c => c.gain ?? (c.state === 'on' ? CARDS[c.no].plus : 0);
const gainStr = g => g > 0 ? `+${g}` : g < 0 ? `−${-g}` : '—';
const brokenLabel = c => c.saved ? `Stop-loss +${c.gain}` : c.gain < 0 ? `Broken ${gainStr(c.gain)}` : 'Broken';
// cracked cards that lost multiplier without a new crack: the stop-loss given up, or one more cup past the quota
const slipped = (before, after) => after.cards.filter((x, k) => x.state === 'broken' && before.cards[k].state === 'broken' && x.gain < before.cards[k].gain);
const slipWhy = x => x.gain < 0 ? `${CARDS[x.no].name} now costs ${gainStr(x.gain)}` : `${CARDS[x.no].name}’s stop-loss is gone`;
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
