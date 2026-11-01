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
