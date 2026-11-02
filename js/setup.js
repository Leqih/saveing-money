/* ---------- first use ---------- */
function renderLaunch() {
  const sh = sheet('Penny Round', `<div class="l-wrap">
    <span class="l-abs l-tag">WEEK 01</span>
    <div class="l-abs bub bgb y" style="--d:520ms;--f:6.4s" aria-hidden="true"></div>
    <div class="l-abs bub bgb o" style="--d:640ms;--f:5.6s" aria-hidden="true"></div>
    <div class="l-abs bub b1" style="--d:80ms;--f:5.2s"><span>Where did this week’s<br>money go?</span></div>
    <div class="l-abs bub b2" style="--d:280ms;--f:6s"><span>Ordered<br>takeout again?</span></div>
    <div class="l-abs bub b3" style="--d:520ms;--f:5.4s"><span>Draw 8 rule cards,<br>keep 3 to stay on track</span></div>
    <div class="l-abs ball" style="--d:820ms" aria-label="Mult ×6"><svg width="132" height="128" viewBox="0 0 120 116" aria-hidden="true"><defs>
      <radialGradient id="jB" cx=".5" cy=".62" r=".72"><stop offset="0" stop-color="#FFD0EE"/><stop offset=".45" stop-color="#FF6CC4"/><stop offset=".85" stop-color="#F0189A"/><stop offset="1" stop-color="#C80C7A"/></radialGradient>
      <radialGradient id="jC" cx=".5" cy=".95" r=".5"><stop offset="0" stop-color="#FFE9F7" stop-opacity=".9"/><stop offset="1" stop-color="#FFE9F7" stop-opacity="0"/></radialGradient>
      <linearGradient id="jG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF" stop-opacity=".95"/><stop offset="1" stop-color="#FFF" stop-opacity=".05"/></linearGradient>
      <linearGradient id="jE" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF" stop-opacity=".95"/><stop offset=".45" stop-color="#FFF" stop-opacity=".1"/><stop offset="1" stop-color="#FF9AD8" stop-opacity=".7"/></linearGradient>
      <clipPath id="jK"><path d="M34 10H86C104 10 112 18 112 36V80C112 98 104 106 86 106H34C16 106 8 98 8 80V36C8 18 16 10 34 10Z"/></clipPath>
      <filter id="jBl"><feGaussianBlur stdDeviation="1.4"/></filter><filter id="jBl2"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="jT" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="1.2" flood-color="#9C0A5E" flood-opacity=".55"/></filter></defs>
      <ellipse cx="60" cy="110" rx="40" ry="5" fill="#FF7FD0" opacity=".55" filter="url(#jBl2)"/>
      <path d="M34 10H86C104 10 112 18 112 36V80C112 98 104 106 86 106H34C16 106 8 98 8 80V36C8 18 16 10 34 10Z" fill="url(#jB)"/>
      <g clip-path="url(#jK)"><path d="M34 10H86C104 10 112 18 112 36V80C112 98 104 106 86 106H34C16 106 8 98 8 80V36C8 18 16 10 34 10Z" fill="none" stroke="#B30A6C" stroke-opacity=".55" stroke-width="9" filter="url(#jBl)"/><ellipse cx="60" cy="104" rx="40" ry="16" fill="url(#jC)"/></g>
      <path d="M22 17C36 11 84 11 98 17C103 20 104 26 100 31C84 24 36 24 20 31C16 26 17 20 22 17Z" fill="url(#jG)"/>
      <path d="M34 10H86C104 10 112 18 112 36V80C112 98 104 106 86 106H34C16 106 8 98 8 80V36C8 18 16 10 34 10Z" fill="none" stroke="url(#jE)" stroke-width="2.200"/>
      <ellipse cx="17" cy="50" rx="2.400" ry="9" fill="#FFF" opacity=".75" filter="url(#jBl)"/><circle cx="98" cy="40" r="2.600" fill="#FFF" opacity=".85"/><circle cx="92" cy="49" r="1.300" fill="#FFF" opacity=".7"/>
      <text x="60" y="66" font-family="Archivo Black, Arial Black, sans-serif" font-size="40" text-anchor="middle" fill="#FFF" stroke="#FFF" stroke-width="1.500" stroke-linejoin="round" filter="url(#jT)">×6</text>
      <text x="60" y="87" font-family="DM Sans, sans-serif" font-size="11" font-weight="900" fill="#FFF" fill-opacity=".92" text-anchor="middle" letter-spacing="1">Mult</text></svg></div>
    <div class="l-abs stk pill30" style="--r:-7deg;--d:900ms;--f:5.8s;left:262px;top:206px">$30 <small>/wk</small></div>
    <div class="l-abs stk ring" style="--r:12deg;--d:1000ms;right:20px;top:64px" aria-hidden="true"><svg width="74" height="74" viewBox="0 0 96 96"><defs><path id="launch-ring" d="M48 48m-36 0a36 36 0 1 1 72 0a36 36 0 1 1-72 0"/></defs><circle cx="48" cy="48" r="46" fill="#FFF"/><circle cx="48" cy="48" r="25" fill="#111"/><path d="M48 31C50 43 53 46 65 48C53 50 50 53 48 65C46 53 43 50 31 48C43 46 46 43 48 31Z" fill="#FF4D6A"/><text font-family="DM Sans, sans-serif" font-size="9.5" font-weight="900" fill="#8A8A92" letter-spacing="2"><textPath href="#launch-ring">ORIGINAL · PENNY ROUND · WEEK 1 ·</textPath></text></svg></div>
    <div class="l-abs stk cbub" style="--r:8deg;--d:760ms;--f:4.8s;left:252px;top:66px" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="#FFF"/><circle cx="15" cy="15" r="9.500" fill="none" stroke="#A855F7" stroke-width="2.200"/><text x="15" y="20.500" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="14" fill="#A855F7">$</text></svg></div>
    <div class="l-abs stk burst" style="--r:-10deg;--d:1100ms;--f:6.2s;left:8px;top:248px" aria-hidden="true"><svg width="76" height="76" viewBox="0 0 76 76"><polygon points="38.0,2.0 44.0,11.7 53.6,5.6 54.8,16.9 66.1,15.6 62.3,26.3 73.1,30.0 65.0,38.0 73.1,46.0 62.3,49.7 66.1,60.4 54.8,59.1 53.6,70.4 44.0,64.3 38.0,74.0 32.0,64.3 22.4,70.4 21.2,59.1 9.9,60.4 13.7,49.7 2.9,46.0 11.0,38.0 2.9,30.0 13.7,26.3 9.9,15.6 21.2,16.9 22.4,5.6 32.0,11.7" fill="#A4FF2E" stroke="#FFF" stroke-width="3.500" stroke-linejoin="round"/></svg><b>Over!</b></div>
    <div class="l-abs stk epill" style="--r:-4deg;--d:1200ms;--f:5s;left:226px;top:352px" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="14" fill="#FFD92E"/><ellipse cx="10.500" cy="12" rx="1.500" ry="2.200" fill="#111"/><ellipse cx="19.500" cy="12" rx="1.500" ry="2.200" fill="#111"/><ellipse cx="15" cy="20" rx="2.600" ry="3.400" fill="#111"/></svg><b>!!!?!</b></div>
    <svg class="l-abs stk sp" style="--r:0deg;--d:1300ms;left:334px;top:226px;width:30px" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#FFF"/></svg>
    <svg class="l-abs stk sp" style="--r:12deg;--d:1400ms;left:20px;top:384px;width:22px" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#FFD92E"/></svg>
    <svg class="l-abs stk sp" style="--r:-8deg;--d:1500ms;left:352px;top:432px;width:20px" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#FFF"/></svg>
    <svg class="l-abs stk sp" style="--r:0deg;--d:1600ms;left:196px;top:500px;width:18px" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#FFD92E"/></svg>
    <div class="l-abs stk fan2" style="--r:-6deg;--d:1000ms;--f:6s;left:20px;top:506px" aria-hidden="true">${['06', '03', '04'].map(no => scaled(CARDS[no], 0.22)).join('')}</div>
    <svg class="l-abs stk flower" style="--r:14deg;--d:1250ms;--f:5.4s;left:140px;top:516px;width:44px" viewBox="0 0 40 40" aria-hidden="true"><g fill="#6DFF8C" stroke="#FFF" stroke-width="2.500"><circle cx="20" cy="10" r="8"/><circle cx="20" cy="30" r="8"/><circle cx="10" cy="20" r="8"/><circle cx="30" cy="20" r="8"/></g><circle cx="20" cy="20" r="6" fill="#FFD92E"/></svg>
    <div class="l-abs l-foot">
      <h1>Money left × cards held<br>= today’s score.</h1>
      <p>Every entry shows right away if it breaks a rule. On Sunday, see whether you passed.</p>
      <button class="cap lime bigbtn" data-act="launch-go"><div class="top">Start week 1</div></button>
      <button class="linkbtn" data-act="launch-skip">Skip setup, draw cards</button>
    </div>
  </div>`);
  sh.classList.add('launch');
}
const setupFormula = s => `(${s.income} − ${s.fixed} − ${s.save}) ÷ 4.3 − ${s.ess ?? essQuota}×7`;
const progHTML = (step, back) => `<div class="cv-prog">${back ? `<button class="cv-back" data-act="${back}" aria-label="Back to the previous step">‹</button>` : ''}<span class="px" style="font-size:14px">${step} / 3</span><i class="pbar" style="--from:${Math.round((step - 1) / 3 * 100)}%;--to:${Math.round(step / 3 * 100)}%" aria-hidden="true"></i></div>`;
// first use, step 1: income minus fixed costs minus savings gives the weekly allowance
function renderSetup() {
  const s = S.setup, w = weeklyFrom(s);
  const field = (k, label, sub) => `<div class="cv-field"><div><label for="su-${k}">${label}${sub ? `<small>${sub}</small>` : ''}</label><input id="su-${k}" inputmode="numeric" data-setup="${k}" value="${s[k]}"></div></div>`;
  sheet('Set budget', `
    ${progHTML(1)}
    <h1 style="margin:4px 0 0;font-weight:900;font-size:28px;line-height:1.25">Let’s work out<br>what you can spend a week</h1>
    ${field('income', 'Monthly income', '')}${field('fixed', 'Fixed costs', 'Rent, phone, subscriptions')}${field('save', 'Monthly savings', 'Save first, spend later')}
    <div style="position:relative;height:128px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <div style="width:300px;max-width:88%;height:104px;border-radius:52px;background:#FFD54A;transform:rotate(-5deg);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 10px 18px rgba(20,20,30,0.15)">
        <span style="font-size:12px;font-weight:900;color:#111111">Your weekly allowance</span>
        <span id="setup-week" style="font-family:var(--f-display);font-size:44px;line-height:1.05;color:#111111">${money(w)}</span>
      </div>
      <span class="px" id="setup-formula" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);white-space:nowrap;padding:2px 10px;border-radius:10px;background:#111;color:#FFF;font-size:12px">${w >= 50 ? setupFormula(s) : 'Weekly allowance must be at least $50'}</span>
      <svg width="66" height="66" viewBox="0 0 60 64" aria-hidden="true" style="position:absolute;right:-4px;top:-14px;transform:rotate(-125deg)"><path d="M14 34V12a5 5 0 0 1 10 0v16h2v-6a5 5 0 0 1 10 0v6h2v-3a5 5 0 0 1 10 0v15c0 10-7 18-17 18h-4c-7 0-12-4-15-10l-5-11a5 5 0 0 1 8-5z" fill="#FFF" stroke="#1E88E5" stroke-width="4" stroke-linejoin="round"/></svg>
      <div aria-hidden="true" style="position:absolute;left:0;top:-6px;width:62px;height:62px;background:#6CFF2E;clip-path:polygon(50% 0%,61% 18%,82% 10%,80% 32%,100% 42%,85% 58%,95% 79%,72% 80%,62% 100%,50% 84%,38% 100%,28% 80%,5% 79%,15% 58%,0% 42%,20% 32%,18% 10%,39% 18%);display:flex;align-items:center;justify-content:center;transform:rotate(-12deg)"><span style="font-size:12px;font-weight:900;color:#0F4A00">Adjust</span></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:76px;padding:0 12px 0 18px;border-radius:22px;background:#E3F7D5">
      <div style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:900;font-size:14px">Essentials allowance</span><span style="font-size:11px;color:#3F5F2A">Meals and commuting up to this a day don’t count against the allowance; it comes out of the budget first</span></div>
      <div style="display:flex;align-items:center;gap:8px"><button class="cv-mini" data-quota="-5" aria-label="Decrease"><span>−</span></button><span class="px" style="font-size:20px;min-width:48px;text-align:center">${money(S.setup.ess ?? essQuota)}</span><button class="cv-mini" data-quota="5" aria-label="Increase"><span>+</span></button></div>
    </div>
    <button class="cap lime bigbtn" data-act="setup-next" ${w >= 50 ? '' : 'disabled'}><div class="top">Next: find where money leaks</div></button>
    <button class="linkbtn" data-act="setup-skip">Skip, use the default ${money(BASE)}</button>`);
}
// step 2: weak spots decide which cards the first deal puts in front of you
function renderWeak() {
  const picks = WEAK.filter(w => S.weak.includes(w.id));
  const first = picks.length ? CARDS[picks[0].card] : CARDS['04'];
  sheet('Weak spots', `
    ${progHTML(2, 'weak-back')}
    <h1 style="margin:4px 0 0;font-weight:900;font-size:28px;line-height:1.25">Where does your money<br>leak most easily?</h1>
    <p class="note left" style="color:#5E5E66;font-size:12px">Pick as many as you like. Your first deal will favor cards that guard these spots.</p>
    <div role="group" aria-label="Where you spend most easily" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
      ${WEAK.map(w => `<button class="cv-opt" aria-pressed="${S.weak.includes(w.id)}" data-weak="${w.id}"><span class="cv-tile" style="background:${w.bg}"><svg width="40" height="40" viewBox="0 0 60 60" aria-hidden="true">${w.svg}</svg></span>${w.name}${S.weak.includes(w.id) ? '<span class="cv-tick" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#FFF" stroke-width="1.8" fill="none"/></svg></span>' : ''}</button>`).join('')}
    </div>
    <h2 style="margin-top:4px">${picks.length ? 'The first deal will favor' : 'Nothing picked? Here’s an easy one to hold'}</h2>
    <div class="cv-ticket">
      <span class="cv-tile" style="width:96px;height:96px;border-radius:16px;background:${tintOf(first.no)}">${artIcon(first.no, 72)}</span>
      <div style="display:flex;flex-direction:column;gap:4px;min-width:0">
        <span style="font-weight:900;font-size:20px">${first.name}</span>
        <span class="px" style="font-size:16px;color:#E4FF1A">Hold for +${first.plus} Mult</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.75)">${first.cond}${picks.length > 1 ? `; also ${picks.slice(1).map(w => CARDS[w.card].name).join(', ')}` : ''}</span>
      </div>
      <span class="sticker" style="right:10px;top:-12px">${picks.length ? 'Priority' : 'Starter pick'}</span>
    </div>
    <button class="cap lime bigbtn" data-act="weak-next" style="margin-top:4px"><div class="top">${picks.length ? 'Next: how often a week' : 'That’s it, draw cards'}</div></button>
    <button class="linkbtn" data-act="import">Import your bank transactions to find them automatically</button>`);
}
// step 3: how often each chosen spot happens, so the first week can be estimated
function renderFreq() {
  const picks = WEAK.filter(w => S.weak.includes(w.id));
  const labelsOf = w => w.id === 'weekend' ? ['$50', '$80', '$120+'] : ['1–2×', '3–5×', 'Every day'];
  const fullOf = w => w.id === 'weekend' ? ['About $50', 'About $80', '$120+'] : FREQ.map(f => f.label);
  const DISH = ['#F25550', '#111111', '#F1B94B', '#3F86D6', '#4CB05A', '#E97FB1'];
  // the dish fills up with how often: half, three quarters, full
  const GLYPH = ['<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3a9 9 0 000 18z" fill="#111111"/></svg>', '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 12V3a9 9 0 11-9 9z" fill="#111111"/></svg>', '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="#111111"/></svg>'];
  const rows = picks.map((w, r) => { const cur = S.freq[w.id] ?? 1; return `<div class="fk-row" role="group" aria-label="${w.name}${w.id === 'weekend' ? ' spending' : ' weekly frequency'}">
      <span class="fk-name"><i class="dish" style="--d:${DISH[r % 6]}"></i>${w.name}</span>
      <div class="fk-well">${labelsOf(w).map((l, i) => `<button class="fk-cap ${cur === i ? 'on' : ''}" data-freq="${w.id}:${i}" aria-label="${fullOf(w)[i]}" aria-pressed="${cur === i}"><i class="fk-dish">${GLYPH[i]}<small>${l}</small></i></button>`).join('')}</div>
    </div>`; }).join('');
  sheet('Weekly Frequency', `
    ${progHTML(3, 'freq-back')}
    <h1 style="margin:4px 0 0;font-weight:900;font-size:28px;line-height:1.25">How often a week<br>do they happen?</h1>
    <div class="fk-list">${rows}</div>
    <button class="cap lime bigbtn" data-act="weak-go" style="margin-top:4px"><div class="top">Draw cards</div></button>`);
}
function renderGuide() {
  sheet('How to play', `
    <div class="bar-top"><h1>How to play</h1>${CLOSE_BTN}</div>
    <div class="gstack">
      <div class="gcard g-orange"><span class="n">1</span><div><h3>Every week, draw 8 and keep 3</h3><p>The 3 rule cards you keep all work this week, e.g. "No takeout today". Each one shows how much multiplier you earn for holding it.</p></div>${scaled(CARDS['01'], 0.35)}</div>
      <div class="gcard g-lav"><span class="n">2</span><div><h3>Every entry tells you right away</h3><p>See whether a card will break before you save. A broken card stops counting for the day; stop spending and you get half its multiplier back, and it returns at midnight. Weekly cards stay broken until Sunday and lose more multiplier if you keep overspending.</p></div><span class="gv">Broke!</span></div>
      <div class="gcard g-lime"><span class="n">3</span><div><h3>Money left × multiplier = score</h3><p>The multiplier starts at 1 and each held card adds to it. Reach the weekly target to pass and earn stars; missing it costs nothing.</p></div><span class="gv">30×6</span></div>
    </div>
    <button class="cap lime bigbtn" data-act="close"><div class="top">Got it</div></button>`);
}

/* ---------- settings ---------- */
// the save button compares against what next week will use: the pending allowance if one is set, else this week's
function allowanceBtn(w) {
  const q = S.setup.ess ?? essQuota, planned = S.nextBase || S.base, plannedQ = S.nextQuota ?? essQuota;
  if (w < 50) return { off: true, text: `Change to ${money(w)}` };
  if (w === planned && q === plannedQ) return { off: true, text: S.nextBase || S.nextQuota != null ? `Already set for Monday` : `It’s already ${money(S.base)}` };
  return { off: false, text: w === S.base && q === essQuota ? `Keep ${money(w)} next week` : `From Monday: ${money(w)}` };
}
function renderSettings() {
  const s = S.setup, w = weeklyFrom(s), p = S.prefs;
  const field = (k, label, sub) => `<div class="cv-field"><div><label for="st-${k}">${label}${sub ? `<small>${sub}</small>` : ''}</label><input id="st-${k}" inputmode="numeric" data-setup="${k}" value="${s[k]}"></div></div>`;
  const sw = (k, label, sub) => `<div class="set-row"><div><b>${label}</b><small>${sub}</small></div><button class="sw" data-pref="${k}" aria-pressed="${p[k]}" aria-label="${label}"><i></i></button></div>`;
  sheet('Settings', `
    <div class="bar-top"><h1>Settings</h1>${CLOSE_BTN}</div>
    <h2>Budget</h2>
    <div class="set-row"><div><b>Weekly allowance</b><small id="setup-formula">${w >= 50 ? setupFormula(s) : 'Weekly allowance must be at least $50'}</small></div><b class="px" id="setup-week" style="font-size:20px">${money(w)}</b></div>
    ${S.nextBase || S.nextQuota != null ? `<p class="note left">This week stays at ${money(S.base)} with essentials ${money(essQuota)} a day; ${money(S.nextBase || S.base)} and ${money(S.nextQuota ?? essQuota)} a day start next Monday.</p>` : ''}
    ${field('income', 'Monthly income', '')}${field('fixed', 'Fixed costs', 'Rent, phone, subscriptions')}${field('save', 'Monthly savings', 'Save first, spend later')}
    <div class="set-row"><div><b>Essentials allowance</b><small>Meals and commuting within this amount a day don’t count</small></div><div style="display:flex;align-items:center;gap:8px"><button class="cv-mini" data-quota="-5" aria-label="Decrease"><span>−</span></button><span class="px" style="font-size:20px;min-width:44px;text-align:center">${money(S.setup.ess ?? essQuota)}</span><button class="cv-mini" data-quota="5" aria-label="Increase"><span>+</span></button></div></div>
    <h2>Bank</h2>
    ${S.bank ? `<div class="set-row"><div><b>${esc(S.bank.name)}</b><small>Checks your log every night · honest nights ${(S.honest || 0) % 7}/7 for a free Glue</small></div><button class="mini" data-act="bank-off">Disconnect</button></div>` : `<div class="set-row"><div><b>Connect a bank</b><small>It catches purchases you forget to log. You still log everything yourself.</small></div><button class="mini" data-act="bank-link">Connect</button></div>`}
    <h2>Reminders</h2>
    ${sw('evening', 'Evening reminder to end the day', 'Also shows a “Done logging?” card on the home screen')}
    <div class="set-row ${p.evening ? '' : 'off'}"><div><b>Reminder time</b><small>Send a notification at that time</small></div><div class="seg3">${[20.5, 21.5, 22].map(c => `<button data-evat="${c}" aria-pressed="${p.eveningAt === c}" ${p.evening ? '' : 'disabled'}>${fmtClock(c)}</button>`).join('')}</div></div>
    ${sw('ruleAlerts', 'Rule reminders before you spend', 'E.g. mealtime reminds Takeout Nemesis, 21:30 reminds Night Cat')}
    ${sw('morning', 'Morning "Good morning" card', 'Yesterday’s score, wish list, what you can spend today')}
    <details class="about"><summary>About this demo</summary>
    <div class="set-row"><div><b>How to play</b><small>The rules in three steps</small></div><button class="mini" data-act="help">Watch</button></div>
    <div class="set-row"><div><b>Replay home tips</b><small>The tips shown on your first visit to home</small></div><button class="mini" data-act="coach-reset">Watch again</button></div>
    <div class="set-row"><div><b>Start over</b><small>Return to the launch screen and clear all demo data</small></div><button class="mini" data-act="restart">Start over</button></div>
</details>
    ${(b => `<button class="go" data-act="settings-save" ${b.off ? 'disabled' : ''}>${b.text}</button>`)(allowanceBtn(w))}`);
}


/* ---------- import from a bank: connect (demo) or paste a CSV, then review ---------- */
// merchant keywords, checked in this order; anything unmatched is Other
const GUESS = [
  ['takeout', /doordash|uber ?eats|grubhub|postmates|seamless|chipotle|mcdonald|burger king|wendy|taco bell|domino|papa john|pizza|kfc|chick-?fil|panda express|five guys|shake shack|jimmy john|wingstop|popeyes/],
  ['taxi', /\buber(?! ?eats)|\blyft\b|waymo|\btaxi\b|\bcab\b/],
  ['tea', /starbucks|dunkin|peet|blue bottle|philz|dutch bros|tim hortons|coffee|\bcafe\b|boba|gong cha|kung fu tea|tiger sugar|sharetea|\btea\b/],
  ['online', /amazon|amzn|temu|shein|ebay|etsy|walmart\.com|target\.com|best ?buy|apple\.com|nike\.com|aliexpress|shopify/],
  ['commute', /\bmta\b|\bbart\b|clipper|metro|transit|septa|\bcta\b|parking|shell|chevron|exxon|\bbp\b|\bgas\b|fuel|\btoll|ez-?pass|amtrak/],
  ['meal', /whole foods|trader joe|safeway|kroger|costco|aldi|publix|grocery|sprouts|h-?e-?b\b/]
];
// payments, deposits and fixed bills (already covered by the budget's fixed costs) are not discretionary spending
const NOT_SPEND = /payment|thank you|deposit|payroll|transfer|refund|autopay|interest|credit card|statement|netflix|spotify|hulu|disney|youtube|icloud|adobe|rent\b|insurance|geico|verizon|at&t|comcast|xfinity|t-mobile|utilit|\bpg&e|con ?ed/;
const guessCat = d => { const t = d.toLowerCase(); const hit = GUESS.find(([, re]) => re.test(t)); return hit ? hit[0] : 'other'; };
// one line per transaction: a date, a description and an amount; purchases are negative on most bank CSVs and positive on Apple Card's
function parseTx(text) {
  const rows = [];
  text.split(/\r?\n/).forEach(line => {
    const found = [...line.matchAll(/-?\$?\(?\d{1,3}(?:,\d{3})*\.\d{2}\)?|-?\$?\d+\.\d{2}/g)]; if (!found.length) return;
    const raw = found[found.length - 1][0], neg = /-|\(/.test(raw), n = Math.abs(parseFloat(raw.replace(/[^0-9.]/g, '')));
    const date = (line.match(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2}/) || [''])[0];
    let desc = line.replace(raw, ' ').replace(date, ' ').replace(/["$]/g, ' ').replace(/,+/g, ' ').replace(/\s+/g, ' ').trim();
    desc = desc.replace(/^(posted|pending|purchase|sale|debit|credit)\b\s*/i, '');
    if (!desc || NOT_SPEND.test(desc.toLowerCase())) return;
    rows.push({ date, desc: desc.slice(0, 40), amt: Math.max(0.01, cents(n)), neg });
  });
  const anyNeg = rows.some(r => r.neg), spend = rows.filter(r => anyNeg ? r.neg : true);
  return spend.map((r, i) => ({ id: i, date: r.date, desc: r.desc, amt: r.amt, cat: guessCat(r.desc), on: true }));
}
const SAMPLE_BANK = `Posted  DoorDash*Chipotle  -32.40
Posted  Starbucks #12345  -6.45
Posted  Uber *Trip  -18.20
Posted  Amazon.com*2K4LM  -41.99
Posted  Whole Foods Market  -62.18
Posted  MTA*NYCT PAYGO  -2.90
Posted  Dunkin’ #3321  -4.10
Posted  Shell Oil 5712  -41.00
Posted  Netflix.com  -15.49
Posted  Payment Thank You  250.00`;
const BANKS = ['Chase', 'Bank of America', 'Wells Fargo', 'Capital One', 'Apple Card'];
let IMP = null;
function renderImport() {
  const I = IMP, tabs = [['bank', 'Connect bank'], ['paste', 'Paste CSV']];
  const rows = I.rows || [], on = rows.filter(r => r.on), total = on.reduce((a, r) => a + r.amt, 0);
  const body = I.busy ? `<div class="imp-busy"><i></i><b>Connecting to ${esc(I.bank)}…</b><small>Reading the last few days of transactions</small></div>`
    : rows.length ? `<p class="note left" style="margin:0">${I.src === 'bank' ? 'Sample data from a demo account. ' : ''}Used only to guess your habits. Nothing is logged. Tap a category to change it, or untick what you don’t want.</p>
      <div class="imp-list">${rows.map((r, i) => `<div class="imp-row ${r.on ? '' : 'off'}">
        <button class="imp-chk" data-impi="${i}" aria-pressed="${r.on}" aria-label="Include ${esc(r.desc)}"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3"/></svg></button>
        ${catBadge(r.cat)}
        <span class="imp-main"><b>${esc(r.desc)}</b><select class="imp-cat" data-impc="${i}" aria-label="Category for ${esc(r.desc)}">${CATS.map(c => `<option value="${c.id}" ${c.id === r.cat ? 'selected' : ''}>${c.name}</option>`).join('')}</select></span>
        <span class="px imp-amt">${money(r.amt)}</span></div>`).join('')}</div>`
    : I.src === 'paste' ? `<p class="note left" style="margin:0">Export transactions from your bank, Apple Card, Venmo or Cash App as CSV and paste the lines here. Only purchases are used; payments and deposits are skipped.</p>
      <textarea class="imp-text" id="imp-text" rows="8" placeholder="05/12/2026,STARBUCKS #1234,-6.45&#10;05/12/2026,DOORDASH*CHIPOTLE,-32.40" aria-label="Transactions"></textarea>
      <div class="actions"><button class="cap" data-act="imp-sample"><div class="top">Try a sample</div></button><button class="go" data-act="imp-parse">Read it</button></div>`
    : `<p class="note left" style="margin:0">Pick your bank. In the real app this is a secure link through your bank; here it loads a demo account.</p>
      <div class="imp-banks">${BANKS.map(b => `<button class="imp-bank" data-act="imp-bank" data-bank="${b}"><i>${b[0]}</i><b>${b}</b><span aria-hidden="true">›</span></button>`).join('')}</div>`;
  const cta = rows.length && !I.busy ? `<button class="go" data-act="imp-add" ${on.length ? '' : 'disabled'}>Use these to find my habits</button>` : '';
  sheet('Import', `
    <div class="bar-top"><h1>Import</h1>${CLOSE_BTN}</div>
    ${rows.length || I.busy ? '' : `<div class="seg" role="tablist" aria-label="Source">${tabs.map(([k, n]) => `<button role="tab" aria-selected="${I.src === k}" data-act="imp-tab" data-src="${k}">${n}</button>`).join('')}</div>`}
    ${body}${cta}`);
}


/* ---------- profile: who you are in the game, badges, notifications, bank and settings in one place ---------- */
const PERSON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#111" aria-hidden="true"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 21c0-4.800 3.800-7.500 8.500-7.500s8.500 2.700 8.500 7.500z"/></svg>';
function profileHTML(ev) {
  const unseen = inboxItems(ev).filter(i => !S.seen.has(i.key)).length;
  return `<button class="pf" data-act="profile" aria-label="Profile, week ${S.week}${unseen ? `, ${unseen} new notification${unseen > 1 ? 's' : ''}` : ''}"><span class="n">W${S.week}</span><span class="l">You</span>${unseen ? `<span class="badge">${unseen}</span>` : ''}</button>`;
}
function badgeList() {
  const hb = Math.max(S.honestBest || 0, S.honest || 0), sd = streakDays();
  return [
    { name: 'Honest week', desc: '7 honest nights in a row', got: hb >= 7, prog: `${Math.min(7, hb)}/7`, color: '#E4FF1A', no: '10' },
    { name: 'On a roll', desc: '3 days holding every card', got: sd >= 3, prog: `${Math.min(3, sd)}/3`, color: '#FF8A1F', no: '04' },
    { name: 'Zero day', desc: 'A day with no extra spending', got: S.history.some(h => h.extra === 0 && !h.unlogged), prog: '0/1', color: '#8FD3FF', no: '05' },
    { name: 'Habit buster', desc: 'Graduate a rule card', got: S.grad.length >= 1, prog: '0/1', color: '#FF4D6A', no: '01' },
    { name: 'Star saver', desc: 'Earn 3 stars', got: S.starsTotal >= 3, prog: `${Math.min(3, S.starsTotal)}/3`, color: '#C9C3FF', no: '13' },
    { name: 'Stake climber', desc: 'Pass a week and raise the stake', got: (S.maxStake || 0) >= 1, prog: '0/1', color: '#6EE59A', no: '16' }
  ];
}
function renderProfile() {
  const ev = evaluate(S.today), unseen = inboxItems(ev).filter(i => !S.seen.has(i.key)).length, bl = badgeList(), got = bl.filter(b => b.got).length;
  const link = (act, title, sub, right = '') => `<button class="set-row pf-link" data-act="${act}"><div><b>${title}</b><small>${sub}</small></div>${right}<span class="pf-go" aria-hidden="true">›</span></button>`;
  sheet('Profile', `
    <div class="bar-top"><h1>Profile</h1>${CLOSE_BTN}</div>
    <div class="pf-card"><span class="pf-av"><span class="n">W${S.week}</span><span class="l">You</span></span><div><b>Week ${S.week} · ${STAKES[S.stake].name}</b><small>Base mult ×${S.baseMult} · ${S.grad.length} habit${S.grad.length === 1 ? '' : 's'} graduated</small></div></div>
    <div class="pf-stats"><div><b class="px">★ ${S.stars}</b><small>Stars</small></div><div><b class="px">${(S.honest || 0) % 7}/7</b><small>Honest nights</small></div><div><b class="px">${streakDays()}</b><small>Day streak</small></div></div>
    <h2>Badges <small>${got} of ${bl.length}</small></h2>
    <div class="pf-badges">${bl.map(b => `<div class="pf-b ${b.got ? 'on' : ''}" style="--c:${b.color}"><span class="pf-shape" style="--c:${tintOf(b.no)}">${artIcon(b.no, 46)}</span><b>${b.name}</b><small>${b.got ? b.desc : b.prog}</small></div>`).join('')}</div>
    <h2>Account</h2>
    ${link('inbox', 'Notifications', unseen ? `${unseen} new` : 'Nothing new', unseen ? `<span class="pf-n">${unseen}</span>` : '')}
    ${S.bank ? `<div class="set-row"><div><b>${esc(S.bank.name)}</b><small>Checks your log every night</small></div><button class="mini" data-act="bank-off-profile">Disconnect</button></div>` : link('bank-link', 'Connect a bank', 'Catches purchases you forget to log')}
    ${link('settings', 'Settings', 'Budget and reminders')}`);
}
