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
  const carry = carryDebt(h.extra, S.debt, dailyBudget());
  S.debt = carry.debt;
  // whatever tomorrow can't absorb raises this week's target: every dollar still has to be won back by saving
  h.overflow = carry.overflow; S.overflow = (S.overflow || 0) + h.overflow;
  S.teaWeek += teaOf(S.today);
  S.revisit = S.wish; S.wish = [];
  S.today = [];
  // Sunday has no next morning to ask on, so unlogged days still waiting are asked about before the week is settled
  if (S.day === 6) { renderTable(); if (pendingUnlogged().length) { S.sunCheck = true; renderSunUnlogged(); } else { settleWeek(); renderWeek(); } return; }
  S.day += 1; S.clock = 8.5;
  renderTable();
  if (S.prefs.morning) renderMorning(); else toast(`${DAYS[S.day]} · allowed today $${todayBudget()}`);
  monthTurn(dateOf(S.week, S.day - 1), dateOf(S.week, S.day));
}
function renderSunUnlogged() {
  const p = pendingUnlogged(), one = p.length === 1;
  sheet('Sunday check', `
    <div class="bar-top"><h1>Sun · before the summary</h1></div>
    <div class="unlogged"><b>${one ? `Nothing logged ${p[0].day === 6 ? 'today' : 'on ' + DAYS[p[0].day]}` : `Nothing logged on ${p.length} days this week`}</b><span>Did you really spend nothing? An unlogged day counts as 0 pts. If you really spent nothing, ${one ? 'it’s' : 'they’re'} restored to a zero-spend score of ${p.reduce((a, y) => a + y.potential.score, 0)} pts (base multiplier only; cards add nothing on an unlogged day).</span><div class="ibtns"><button class="rvbtn lime" data-act="sun-unlogged-yes">Really spent nothing</button><button class="rvbtn" data-act="sun-unlogged-no">Forgot to log</button></div></div>`);
}
function startWeek() {
  const lastDay = dateOf(S.week, 6);
  S.lastWeek = DAYS.map((_, i) => (weekHist().find(h => h.day === i) || { entries: [] }).entries.map(x => ({ ...x })));
  S.autoEnded = false; S.clock = 8.5;
  // an overspent Sunday still comes out of Monday's allowance, so the week boundary is no free night out
  S.stake = S.nextStake; S.overflow = 0;
  if (S.slotPending) { S.slots = 4; S.slotPending = false; }
  if (S.nextBase) { S.base = S.nextBase; S.nextBase = null; }
  S.weekOpen = false;
  // back after weeks away, the new week is the calendar's week and starts on today's weekday, a short week like a first one;
  // weeks nobody played are skipped rather than scored. A demo that ran ahead of the calendar just goes on to Monday
  const real = dayNo(), w = nextWeekNo();
  S.week = w; S.day = S.weekStart = w === Math.floor(real / 7) + 1 ? real % 7 : 0;
  S.held = []; S.teaWeek = 0; S.firstDraw = false; S.estimated = false;
  draft = {};
  renderTable(); renderDraw();
  monthTurn(lastDay, dateOf(S.week, 0));
}

// the game only moves on when a day is ended, so coming back after days away first ends the days that went by:
// the open day keeps what was logged, the ones after it wait as unlogged until the morning asks about them.
// It stops at Sunday, which settles the week; the next week then starts on the calendar's day (see startWeek)
function catchUp() {
  const real = dayNo(), at = () => (S.week - 1) * 7 + S.day;
  if (real <= at() || !S.held.length || S.weekOpen || S.sunCheck || app.querySelector('.sheet')) return false;
  const from = dateOf(S.week, S.day);
  S.away = real - at(); S.autoEnded = true;
  while (S.day < 6 && at() < real) endDay();
  app.querySelectorAll('.sheet').forEach(n => n.remove());
  if (at() < real) { endDay(); return true; }
  S.clock = clockNow(); renderTable(); renderMorning();
  monthTurn(from, dateOf(S.week, S.day));
  return true;
}
// a tab left open overnight catches up when it is looked at again
document.addEventListener('visibilitychange', () => { if (!document.hidden) catchUp(); });

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
    if (nx && nx.dataset.act === 'settings-save') { const b = allowanceBtn(w); nx.disabled = b.off; nx.textContent = b.text; }
    else if (nx) nx.disabled = w < 50;
  }
  if (e.target.id === 'note') draft.note = e.target.value.trim();
  if (e.target.id === 'newcat') draft.newName = e.target.value.trim();
});
