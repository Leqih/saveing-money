// Scoring rules, tested without a browser: js/rules.js is loaded on its own and never reads the game state.
// Run with `npm test` (or `node --test tests/`).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'rules.js'), 'utf8');
const { CARDS, scoreDay, carryDebt, targetFor, starsFrom, clashes } =
  vm.runInNewContext(`${src}\n;({ CARDS, scoreDay, carryDebt, targetFor, starsFrom, clashes })`, {});

// a Wednesday on a $50/day allowance, nothing earlier this week, base multiplier 1
const ctx = (held, more = {}) => ({ held, daily: 50, allowance: 50, baseMult: 1, teaBefore: 0, weekBefore: 0, weekCap: 175, dayIdx: 2, bankLinked: false, wishToday: 0, assumeLogged: false, glued: null, ...more });
const card = (ev, no) => ev.cards.find(c => c.no === no);
const TAKEOUT = '01', NIGHT = '06', WALKER = '04', COFFEE = '03', WEEKLY_CAP = '15', BOOKKEEPER = '10', CHAIN = '20', HIGH_ROLLER = '21', WEEKEND = '23', ZERO_DAY = '05';

test('every card holding: score is money left times 1 plus each card', () => {
  const ev = scoreDay([{ cat: 'meal', amt: 8 }], ctx([TAKEOUT, NIGHT, WALKER]));
  assert.equal(ev.mult, 1 + 2 + 2 + 1);
  assert.equal(ev.base, 50);
  assert.equal(ev.score, 300);
});

test('meals and commute only count once they pass the essentials allowance', () => {
  assert.equal(scoreDay([{ cat: 'meal', amt: 45 }], ctx([])).d.extra, 0);
  assert.equal(scoreDay([{ cat: 'meal', amt: 50 }], ctx([])).d.extra, 5);
});

test('takeout breaks Takeout Nemesis, and stopping there gives half back', () => {
  const ev = scoreDay([{ cat: 'takeout', amt: 20 }], ctx([TAKEOUT, NIGHT, WALKER]));
  assert.equal(card(ev, TAKEOUT).state, 'broken');
  assert.equal(card(ev, TAKEOUT).saved, true);
  assert.equal(card(ev, TAKEOUT).gain, 1);
  assert.equal(ev.score, 30 * (1 + 1 + 2 + 1));
});

test('spending again after the break gives up the stop-loss', () => {
  const ev = scoreDay([{ cat: 'takeout', amt: 20 }, { cat: 'tea', amt: 5 }], ctx([TAKEOUT]));
  assert.equal(card(ev, TAKEOUT).saved, false);
  assert.equal(card(ev, TAKEOUT).gain, 0);
});

test('Coffee Quota: the 4th cup breaks it, each cup after that costs a point', () => {
  const fourth = scoreDay([{ cat: 'tea', amt: 5 }], ctx([COFFEE], { teaBefore: 3 }));
  assert.equal(card(fourth, COFFEE).state, 'broken');
  assert.equal(card(fourth, COFFEE).gain, 0);
  const fifth = scoreDay([{ cat: 'tea', amt: 5 }], ctx([COFFEE], { teaBefore: 4 }));
  assert.equal(card(fifth, COFFEE).gain, -1);
});

test('Weekly Cap already broken: every $20 more costs a point that day', () => {
  const ev = scoreDay([{ cat: 'online', amt: 45 }], ctx([WEEKLY_CAP], { weekBefore: 180 }));
  assert.equal(card(ev, WEEKLY_CAP).gain, -3);
});

test('Bookkeeper sleeps until something is logged', () => {
  assert.equal(card(scoreDay([], ctx([BOOKKEEPER])), BOOKKEEPER).state, 'pending');
  assert.equal(card(scoreDay([{ cat: 'commute', amt: 3 }], ctx([BOOKKEEPER])), BOOKKEEPER).state, 'on');
  assert.equal(card(scoreDay([], ctx([BOOKKEEPER], { assumeLogged: true })), BOOKKEEPER).state, 'on');
});

test('Chain Reaction is worth +1 for each other card holding', () => {
  const ev = scoreDay([], ctx([CHAIN, WALKER, NIGHT]));
  assert.equal(card(ev, CHAIN).gain, 2);
  const broke = scoreDay([{ cat: 'taxi', amt: 12 }], ctx([CHAIN, WALKER, NIGHT]));
  assert.equal(card(broke, CHAIN).gain, 1);
});

test('High Roller costs 3 on any extra, glue cannot save it, and the multiplier never drops below 1', () => {
  const ev = scoreDay([{ cat: 'tea', amt: 4 }], ctx([HIGH_ROLLER], { glued: HIGH_ROLLER }));
  assert.equal(card(ev, HIGH_ROLLER).state, 'broken');
  assert.equal(card(ev, HIGH_ROLLER).gain, -3);
  assert.equal(ev.mult, 1);
});

test('glue mends the broken card it was used on', () => {
  const ev = scoreDay([{ cat: 'takeout', amt: 10 }], ctx([TAKEOUT], { glued: TAKEOUT }));
  assert.equal(card(ev, TAKEOUT).state, 'on');
  assert.equal(card(ev, TAKEOUT).gain, 2);
});

test('Night Cat breaks on anything after 10 pm', () => {
  assert.equal(card(scoreDay([{ cat: 'other', amt: 5, night: true }], ctx([NIGHT])), NIGHT).state, 'broken');
});

test('Weekend Brake sleeps on weekdays and caps the weekend at $40', () => {
  assert.equal(card(scoreDay([], ctx([WEEKEND])), WEEKEND).state, 'pending');
  assert.equal(card(scoreDay([{ cat: 'other', amt: 40 }], ctx([WEEKEND], { dayIdx: 5 })), WEEKEND).state, 'on');
  assert.equal(card(scoreDay([{ cat: 'other', amt: 41 }], ctx([WEEKEND], { dayIdx: 6 })), WEEKEND).state, 'broken');
});

test('overspending leaves no negative score', () => {
  const ev = scoreDay([{ cat: 'online', amt: 80 }], ctx([]));
  assert.equal(ev.base, 0);
  assert.equal(ev.left, -30);
  assert.equal(ev.score, 0);
});

test('Zero Day clashes with Takeout Nemesis', () => {
  assert.equal(clashes(ZERO_DAY, TAKEOUT), true);
  assert.equal(clashes(TAKEOUT, ZERO_DAY), true);
  assert.equal(clashes(TAKEOUT, NIGHT), false);
  assert.ok(Object.keys(CARDS).length >= 26);
});

test('overspending comes out of tomorrow, at most half a day; the rest raises the target', () => {
  assert.deepEqual({ ...carryDebt(30, 0, 50) }, { debt: 0, overflow: 0 });
  assert.deepEqual({ ...carryDebt(70, 0, 50) }, { debt: 20, overflow: 0 });
  assert.deepEqual({ ...carryDebt(80, 0, 50) }, { debt: 25, overflow: 5 });
  assert.deepEqual({ ...carryDebt(40, 20, 50) }, { debt: 10, overflow: 0 });
});

test('weekly target: 1.5 days of allowance a day, raised by stake, graduations, a 4th slot and overflow', () => {
  const base = { daily: 50, days: 7, stakeK: 1, baseMult: 1, slots: 3, overflow: 0 };
  assert.equal(targetFor(base), 530);
  assert.equal(targetFor({ ...base, days: 2 }), 150);
  assert.equal(targetFor({ ...base, overflow: 5 }), 540);
  assert.equal(targetFor({ ...base, baseMult: 2 }), 660);
  assert.equal(targetFor({ ...base, slots: 4 }), 660);
  assert.equal(targetFor({ ...base, stakeK: 1.8 }), 950);
});

test('stars: 1 at the target, 2 at 1.7x, 3 at 2.6x', () => {
  assert.equal(starsFrom(99, 100), 0);
  assert.equal(starsFrom(100, 100), 1);
  assert.equal(starsFrom(170, 100), 2);
  assert.equal(starsFrom(260, 100), 3);
});
