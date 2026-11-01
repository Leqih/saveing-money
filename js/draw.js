/* ---------- weekly draw: deal up to 8, keep 3 (or 4) ---------- */
function firstHand() {
  const picks = [...new Set(S.weak.map(id => WEAK.find(w => w.id === id).card))].filter(no => S.unlocked.includes(no));
  const rest = S.unlocked.filter(no => !picks.includes(no)).sort(() => Math.random() - 0.5);
  return [...picks, ...rest].slice(0, DEALN());
}
// try every way to keep n of the dealt cards: with receipts (real or estimated) pick the highest simulated week,
// without any, pick the easiest set. A carried card always stays in the set
// every way to keep n of the hand without two overlapping cards
function combosOf(hand, n) {
  const combos = [];
  const walk = (start, pick) => { if (pick.length === n) { combos.push(pick.slice()); return; } for (let i = start; i < hand.length; i++) { if (clashIn(hand[i], pick)) continue; pick.push(hand[i]); walk(i + 1, pick); pick.pop(); } };
  walk(0, []);
  return combos;
}
// overlapping cards can leave a short hand without enough keepable cards, so ask for the most that fit
const keepN = hand => { let n = Math.min(HOLDN(), hand.length); while (n > 1 && !combosOf(hand, n).length) n--; return n; };
function bestCombo(hand, n, hasData) {
  const combos = combosOf(hand, n);
  const ok = combos.filter(c => !S.carry || !hand.includes(S.carry) || c.includes(S.carry));
  const value = c => hasData ? simulate(c, S.lastWeek, S.weekStart).total : -c.reduce((a, no) => a + CARDS[no].diff * 10 - CARDS[no].plus, 0);
  return ok.sort((a, b) => value(b) - value(a))[0] || combos[0] || hand.slice(0, n);
}
function renderDraw() {
  if (!draft.hand) {
    // a carried card and any pinned in the shop are always dealt; the carried one starts picked, the rest are random
    const forced = [...new Set([S.carry, ...S.pinned].filter(no => no && S.unlocked.includes(no)))];
    const others = S.unlocked.filter(no => !forced.includes(no)).sort(() => Math.random() - 0.5);
    draft.hand = S.firstDraw ? firstHand() : [...forced, ...others].slice(0, Math.max(DEALN(), forced.length));
    draft.sel = !S.firstDraw && S.carry && draft.hand.includes(S.carry) ? [S.carry] : [];
  }
  // once enough cards graduate the pool can run short, so never ask for more than can be kept together
  const need = keepN(draft.hand);
  const sel = draft.sel;
  const hasData = S.lastWeek.some(d => d.length);
  // once the bag is torn the cards sit in a stack: the front one full size, the rest peeking out on either side.
  // swipe sideways to bring another to the front; tap the front card to keep it
  const inHand = draft.hand.filter(no => !sel.includes(no));
  const rec = draft.rec = draft.rec || bestCombo(draft.hand, need, hasData), recMult = S.baseMult + rec.reduce((a, no) => a + CARDS[no].plus, 0);
  const ci = draft.ci = inHand.length ? Math.min(Math.max(draft.ci || 0, 0), inHand.length - 1) : 0;
  const focus = draft.opened ? inHand[ci] : null;
  const cards = inHand.map((no, i) => {
    const tag = no === S.carry && !S.firstDraw ? 'Carried' : clashIn(no, sel) ? 'Overlap' : '';
    return `<button class="sc2" data-pick="${no}" data-i="${i}" aria-label="${CARDS[no].name} +${CARDS[no].plus}${i === ci ? ', tap to keep, or drag down' : ', tap to bring it to the front'}"
      >
      <div class="sc2-face">${cardHTML(CARDS[no])}</div><i class="sc2-edge" style="background:${coreOf(no)}"></i>${tag ? `<span class="carry-tag">${tag}</span>` : ''}${rec.includes(no) ? '<span class="sticker sc2-rec">Top pick</span>' : ''}</button>`;
  }).join('');
  // the week's cards come in a crimped foil bag: it tilts toward your finger and tears open when you drag along the top
  const burst = draft.dealIn ? Array.from({ length: 28 }, (_, i) => `<i class="cf" style="--cx:${Math.round(Math.random() * 340 - 170)}px;--cy:${Math.round(-60 - Math.random() * 170)}px;--cr:${Math.round(Math.random() * 720 - 360)}deg;--cd:${Math.round(Math.random() * 120)}ms;width:${6 + (i % 4) * 2}px;height:${6 + (i % 3) * 3}px;background:${['var(--lime)', 'var(--pink)', 'var(--blue)', 'var(--orange)', '#C9C3FF', '#111'][i % 6]};border-radius:${i % 2 ? '50%' : '2px'}"></i>`).join('') : '';
  const pack = draft.opened ? '' : `<div class="bag closed" role="button" tabindex="0" aria-label="Tear open this week’s pack: hold the top and drag right">
      <svg class="bag-body" viewBox="0 0 200 250" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bagG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF3D00"/><stop offset="1" stop-color="#FF6B3A"/></linearGradient><clipPath id="bagC"><path d="${BAG_BODY}"/></clipPath></defs><path d="${BAG_BODY}" fill="url(#bagG)"/><g clip-path="url(#bagC)"><path d="M-10 214C14 186 62 186 90 222C112 196 160 196 214 226V256H-10Z" fill="#3DCBFF"/></g></svg>
      <svg class="bag-strip" viewBox="0 0 200 250" preserveAspectRatio="none" aria-hidden="true"><path d="${BAG_STRIP}" fill="#3DCBFF"/><path d="M12 28H188" stroke="#FFF" stroke-width="2" stroke-dasharray="6 6" vector-effect="non-scaling-stroke" opacity=".9"/></svg>
      <svg class="pk-arrow" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M5 5L21 21M24 8v16H8" fill="none" stroke="#FFE600" stroke-width="7" stroke-linecap="square"/></svg>
      <span class="pk-badge" aria-hidden="true"><svg width="62" height="62" viewBox="0 0 62 62"><circle cx="31" cy="31" r="28" fill="#FFF"/><g class="pk-face" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"><path d="M17 22h9M36 22h9M31 14v14"/><path d="M19 37c4 9 20 9 24 0"/></g></svg></span>
      <span class="pk-labs"><span class="pk-lab px">WEEK ${String(S.week).padStart(2, '0')}</span><b class="pk-lab pk-title">This week’s pack</b><span class="pk-lab pk-count">${draft.hand.length} rule cards</span></span>
    </div>
    <span class="pk-tear" aria-hidden="true">Hold the top → drag right to tear</span>`;
  const stage = draft.opened ? `<div class="stack ${draft.slide ? 'slide' + draft.slide : ''}">${cards}</div>
    ${burst ? `<span class="burst" aria-hidden="true">${burst}</span>` : ''}` : pack;
  // the footer keeps the picks, what they add up to and the button on screen however far the cards scroll
  const multSel = S.baseMult + sel.reduce((a, no) => a + CARDS[no].plus, 0);
  const sum = sel.length === need && hasData ? (sim => `about <b>${sim.total}</b> pts / target ${weekTarget()}`)(simulate(sel, S.lastWeek, S.weekStart)) : sel.length ? `All held <b>×${multSel}</b>` : (draft.opened ? `<button class="dsum-rec" data-act="use-rec">Best ${rec.length} · ×${recMult}</button>` : 'Tear open the pack');
  const slots = Array.from({ length: need }, (_, i) => sel[i] ? `<button class="dslot ${draft.landed === sel[i] || draft.landed === 'all' ? 'land' : ''}" data-unpick="${sel[i]}" style="background:${tintOf(sel[i])}" aria-label="${CARDS[sel[i]].name}, tap to put back">${artIcon(sel[i], 22)}</button>` : '<span class="dslot empty"></span>').join('');
  const plateBg = sel.length ? coreOf(sel[sel.length - 1]) : '#34343A', plateFg = sel.length ? TYPES[CARDS[sel[sel.length - 1]].plus].chipText : '#FFF';
  sheet('Draw rule cards', `
    <div class="bar-top"><h1>Week ${S.week}</h1>${draft.opened ? `<span class="dkc-count ${draft.landed ? 'bounce' : ''}">Dealt ${inHand.length}</span>` : ''}<span class="chipk" style="background:${STAKES[S.stake].bg};color:${STAKES[S.stake].fg}">${STAKES[S.stake].name}</span></div>
    <p class="draw-lead">Keep ${need} cards this week${S.weekStart > 0 ? `<span class="chipk" style="background:var(--lime)">Only ${weekDays()} days</span>` : ''}</p>
    <div class="hand ${draft.opened ? 'open' : ''} ${draft.dealIn ? 'dealing' : ''}"><div class="hand-in">${stage}</div></div>
    <div class="drawfoot ${draft.landed ? 'pulse' : ''}">
      <div class="deck-strips" aria-hidden="true">${sel.slice(0, -1).map((no, j, a) => `<i style="background:${coreOf(no)};bottom:${(a.length - 1 - j) * 8}px;left:${22 + (a.length - j) * 8}px;right:${22 + (a.length - j) * 8}px"></i>`).join('')}</div>
      <div class="deck-plate" style="background:${draft.plate ? draft.plate[0] : plateBg};color:${draft.plate ? draft.plate[1] : plateFg}">
        <p class="tray-hint"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${sel.length ? 'M3 8.5L7 4.5l4 4' : 'M3 5.5L7 9.5l4-4'}"/></svg>${draft.opened ? (sel.length ? `My deck · ${sel.length}/${need}` : 'Drag a card down into your deck') : 'Tear the pack open first'}</p>
        <div class="dsum"><div style="display:flex;align-items:center"><b class="dcount ${draft.landed ? 'bounce' : ''}">${sel.length}/${need}</b><div class="dslots">${slots}</div></div><span>${sum}</span></div>
      </div>
      <button class="go" data-act="choose" ${sel.length === need ? '' : 'disabled'}>${sel.length === need ? `Keep these ${need} cards` : combosOf(draft.hand, need).some(c => sel.every(x => c.includes(x))) ? `Pick ${need - sel.length} cards` : `Overlap: can’t fill ${need} slots, swap one out`}</button>
    </div>`);
  const st = lastSheet().querySelector('.stack'); if (st) layoutStack(st, ci);
  // the whole sheet is dark and takes on the colour of the card in front
  { const sh = lastSheet(); sh.classList.add('drawdark'); const col = '#FFFFFF';
    sh.style.setProperty('--tint', draft.tint || col); void sh.offsetWidth; requestAnimationFrame(() => sh.style.setProperty('--tint', col)); draft.tint = col; }
  { const pl = lastSheet().querySelector('.deck-plate'); if (pl && draft.plate) { void pl.offsetWidth; requestAnimationFrame(() => { pl.style.background = plateBg; pl.style.color = plateFg; }); } draft.plate = [plateBg, plateFg]; }
  if (draft.dealIn && !reducedMotion()) openShow(lastSheet());
  // one-shot animations only play on the render that triggered them
  draft.dealIn = false; draft.landed = null; draft.slide = 0;
}
// the cards sit side by side like a carousel: the front one is centred, its neighbours only show a coloured edge on either side
const CARD_STEP = 330;
function placeStack(stack, at, dx = 0) {
  stack.querySelectorAll('.sc2:not(.flying)').forEach(el => {
    const k = +el.dataset.i - at, off = k * CARD_STEP + dx, d = Math.min(1, Math.abs(off) / CARD_STEP);
    el.style.transform = `translate(${off.toFixed(1)}px, ${(d * 14).toFixed(1)}px) rotate(${(off / CARD_STEP * 7).toFixed(2)}deg) scale(${(1 - d * 0.07).toFixed(3)})`;
    el.style.zIndex = String(50 - Math.round(d * 4));
    el.style.opacity = Math.max(0, Math.min(1, 2.6 - Math.abs(k))).toFixed(2);
    el.dataset.k = Math.round(k);
    const eg = el.querySelector('.sc2-edge'); if (eg) eg.style.opacity = String(Math.min(1, d * 1.6));
    el.classList.toggle('front', Math.abs(k) < 0.5);
  });
  stack._at = at - dx / CARD_STEP;
}
// the row coasts to its resting card on a spring that keeps the finger's speed, so a flick carries on instead of restarting
function glide(stack, to, v0 = 0, done) {
  cancelAnimationFrame(stack._raf);
  let x = stack._at == null ? to : stack._at, v = v0, last = performance.now();
  stack.classList.add('gliding');
  const K = 190, C = 21;
  const step = now => {
    let dt = Math.min(0.032, (now - last) / 1000); last = now;
    for (let t = 0; t < dt; t += 0.004) { const h = Math.min(0.004, dt - t); v += (-K * (x - to) - C * v) * h; x += v * h; }
    if (Math.abs(x - to) < 0.0015 && Math.abs(v) < 0.02) { placeStack(stack, to); stack.classList.remove('gliding'); if (done) done(); return; }
    placeStack(stack, x); stack._raf = requestAnimationFrame(step);
  };
  stack._raf = requestAnimationFrame(step);
}
const layoutStack = placeStack;
// flat chamfered panels: the strip on top tears off the body along a slightly slanted line
// the big reveal when a pack opens: white flash, rotating light rays, shock rings, a canvas of confetti, streamers and stars from the pack and from both sides,
// a little screen shake, then the cards punch out of the pack one after another
function openShow(sh) {
  const stack = sh.querySelector('.stack'); if (!stack) return;
  const sr0 = sh.getBoundingClientRect(), r = stack.getBoundingClientRect(), z = sr0.width / sh.offsetWidth || 1;
  // everything below is in the sheet's own (unzoomed) pixels, so the cannons sit on the real screen edges at any mockup scale
  const sr = { left: sr0.left, top: sr0.top, width: sh.offsetWidth, height: sh.offsetHeight };
  const cx = (r.left + r.width / 2 - sr0.left) / z, cy = (r.top - sr0.top) / z + 220 + sh.scrollTop;
  // the row slides in from the right in its real order (front card first, then its neighbours), one after another, never piled up
  const cards = [...stack.querySelectorAll('.sc2')].filter(c => +c.dataset.k >= -1 && +c.dataset.k <= 2).sort((a, b) => +a.dataset.k - +b.dataset.k);
  // the cards are dealt out of the pack: the front one pops up first, then its neighbours slide out from behind it, one after another
  [...stack.querySelectorAll('.sc2')].forEach(el => {
    const k = +el.dataset.k, finalT = el.style.transform, finalO = el.style.opacity === '' ? 1 : +el.style.opacity;
    if (Math.abs(k) > 2) return;
    const front = k === 0, from = front ? 'translate(0px, 46px) rotate(-6deg) scale(0.68)' : 'translate(0px, 22px) rotate(0deg) scale(0.86)';
    el.animate([{ transform: from, opacity: 0 }, { transform: finalT, opacity: finalO }], { duration: front ? 640 : 560, delay: front ? 40 : 320 + Math.abs(k) * 110 + (k < 0 ? 60 : 0), easing: 'cubic-bezier(.2,1.3,.4,1)', fill: 'backwards' });
  });
  const fc = cards.find(c => +c.dataset.k === 0); if (fc) { const g = document.createElement('i'); g.className = 'cardshine'; fc.appendChild(g); setTimeout(() => g.remove(), 1700); }
  // confetti canvas
  const cv = document.createElement('canvas'); cv.className = 'confcv'; cv.width = sr.width * 2; cv.height = sr.height * 2; cv.style.cssText = `position:absolute;left:0;top:${sh.scrollTop}px;width:${sr.width}px;height:${sr.height}px;pointer-events:none;z-index:120`;
  sh.appendChild(cv); const g = cv.getContext('2d'); g.scale(2, 2);
  const COLORS = ['#E4FF1A', '#FF4D6A', '#2E8BFF', '#FF8A1F', '#C9C3FF', '#FFFFFF'], P = [];
  const y0 = cy - sh.scrollTop;
  // the canvas-confetti "realistic" recipe: several overlapping shots from one point, each with its own spread, speed and size; strong drag so they pop and hang,
  // then a slow flutter down with a wobble. Shots are staged after the cards land instead of all at once.
  const add = (x, y, ang, spread, spd, n, scale = 1, kinds = ['r', 'r', 'c', 'sp']) => { for (let i = 0; i < n; i++) { const a = ang + (Math.random() - 0.5) * spread, v = spd * (0.5 + Math.random() * 0.6); P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 8, w: (13 + Math.random() * 6) * scale, h: (7 + Math.random() * 3) * scale, c: COLORS[(Math.random() * COLORS.length) | 0], k: kinds[(Math.random() * kinds.length) | 0], ph: Math.random() * 6.28, wob: 0.6 + Math.random() * 1, term: 130 + Math.random() * 90, born: 0, life: 2000 + Math.random() * 600 }); } };
  // two party-popper cannons from the bottom corners, then a soft shower from the top of the stack; fewer, bigger, calmer pieces in the app's own colours
  const pop = (x, ang) => { add(x, sr.height - 170, ang, 0.5, 1250, 14); add(x, sr.height - 170, ang, 0.9, 950, 14); add(x, sr.height - 170, ang, 1.2, 720, 8, 1.2, ['sp', 'c']); };
  setTimeout(() => { pop(2, -Math.PI * 0.34); pop(sr.width - 2, -Math.PI * 0.66); }, 60);
  setTimeout(() => { for (let i = 0; i < 26; i++) add(30 + Math.random() * (sr.width - 60), -20, Math.PI / 2, 0.3, 60 + Math.random() * 120, 1, 1, ['r', 'c', 'sp']); }, 900);
  setTimeout(() => { pop(2, -Math.PI * 0.36); pop(sr.width - 2, -Math.PI * 0.64); }, 520);
  let last = performance.now(); const t0 = last;
  const draw = t => {
    const dt = Math.min(0.034, (t - last) / 1000); last = t; g.clearRect(0, 0, sr.width, sr.height); const el = t - t0; let alive = 0;
    const drag = Math.pow(0.9, dt * 60);
    P.forEach(p => {
      p.born += dt * 1000; if (p.born > p.life) return; alive++;
      p.vx *= drag; p.vy *= drag; p.vy += 560 * dt; if (p.vy > p.term) p.vy = p.term;
      p.ph += dt * 7 * p.wob; p.x += (p.vx + Math.sin(p.ph) * 38) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const fade = Math.min(1, (p.life - p.born) / 500); g.save(); g.globalAlpha = fade; g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c; g.shadowColor = 'rgba(20,20,40,0.22)'; g.shadowOffsetY = 2; g.shadowBlur = 3;
      const flip = Math.cos(p.ph * 1.3);
      if (p.k === 'r') { g.scale(1, flip); const r = p.h / 2; g.beginPath(); g.moveTo(-p.w / 2 + r, -p.h / 2); g.arcTo(p.w / 2, -p.h / 2, p.w / 2, p.h / 2, r); g.arcTo(p.w / 2, p.h / 2, -p.w / 2, p.h / 2, r); g.arcTo(-p.w / 2, p.h / 2, -p.w / 2, -p.h / 2, r); g.arcTo(-p.w / 2, -p.h / 2, p.w / 2, -p.h / 2, r); g.fill(); }
      else if (p.k === 'c') { g.scale(1, 0.55 + 0.45 * Math.abs(flip)); g.beginPath(); g.arc(0, 0, p.h * 0.75, 0, 6.28); g.fill(); }
      else { g.scale(0.55 + 0.45 * Math.abs(flip), 1); g.beginPath(); const R = p.w * 0.55, q = R * 0.2; g.moveTo(0, -R); g.quadraticCurveTo(q, -q, R, 0); g.quadraticCurveTo(q, q, 0, R); g.quadraticCurveTo(-q, q, -R, 0); g.quadraticCurveTo(-q, -q, 0, -R); g.fill(); }
      g.restore();
    });
    if (el < 2600 || (alive && el < 6500)) requestAnimationFrame(draw); else cv.remove();
  };
  requestAnimationFrame(draw);
}
const BAG_BODY = 'M0 52L200 46V240L188 250H8L0 242Z';
const BAG_STRIP = 'M10 0H190L200 10V46L0 52V10Z';
// the sealed bag leans toward the pointer and its eyes follow; letting go springs it back.
// pressing on it and dragging right peels the top strip; let go past halfway and it tears, otherwise it springs back
let tear = null, swipe = null;
// a small damped spring: the card eases toward its target and overshoots a little, like the reference
const tilt = (x, y, sc, r) => `perspective(900px) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotateX(${r.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
function spring(el, from, to, done, k = 190, c = 17, tick, v0 = {}) {
  const st = { r: 0, ...from }, tg = { r: 0, ...to }, v = { x: v0.x || 0, y: v0.y || 0, s: 0, r: 0 }; let last = performance.now(); const t0 = last, keys = ['x', 'y', 's', 'r'];
  const fin = () => { el.style.transform = tilt(tg.x, tg.y, tg.s, tg.r); if (tick) tick(1); done && done(); };
  el.style.transition = 'none';
  const step = t => {
    const dt = Math.min(0.032, (t - last) / 1000); last = t;
    for (const key of keys) { v[key] += (-k * (st[key] - tg[key]) - c * v[key]) * dt; st[key] += v[key] * dt; }
    st.s = Math.max(0.05, st.s);
    el.style.transform = tilt(st.x, st.y, st.s, st.r);
    if (tick) tick(Math.max(0, Math.min(1, (st.y - from.y) / ((tg.y - from.y) || 1))));
    if (t - t0 > 900 || (Math.abs(v.x) + Math.abs(v.y) < 3 && Math.abs(st.x - tg.x) + Math.abs(st.y - tg.y) < 1.5 && Math.abs(st.s - tg.s) < 0.01 && Math.abs(st.r - tg.r) < 0.3)) return fin();
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// the drop into the tray accelerates like falling, with the card tilting back and narrowing as it goes
function tween(el, from, to, dur, done, tick) {
  const f = { r: 0, ...from }, t0 = performance.now(); el.style.transition = 'none';
  const step = t => {
    const u = Math.min(1, (t - t0) / dur), p = u * u * (2.2 - 1.2 * u), lerp = k => f[k] + (to[k] - f[k]) * p;
    el.style.transform = tilt(lerp('x'), lerp('y'), lerp('s'), lerp('r'));
    if (tick) tick(p);
    if (u < 1) requestAnimationFrame(step); else done && done();
  };
  requestAnimationFrame(step);
}
// keep the front card: it drops behind the tray at the bottom on a spring and becomes the newest strip of the deck;
// then the sheet redraws and the next card slides in from the side
function keepFront(top, card, base, cur) {
  const no = card.dataset.pick, other = clashIn(no, draft.sel);
  if (other) { toast(`“${CARDS[no].name}” and “${CARDS[other].name}” overlap and can’t be kept together`); return false; }
  if (draft.sel.length >= keepN(draft.hand)) { toast(`Keep at most ${HOLDN()} cards; tap a card in the slots to put it back`); return false; }
  const left = draft.hand.filter(x => !draft.sel.includes(x));
  draft.sel.push(no); draft.landed = no;
  const foot = top.querySelector('.drawfoot');
  if (!foot || reducedMotion()) { replaceSheet(top, renderDraw); return true; }
  const a = base || card.getBoundingClientRect(), s2 = 0.86, eg = card.querySelector('.sc2-edge'), stack = card.parentElement;
  card.classList.add('flying');
  // the rest of the row closes up at the same moment: the next card springs into the front while this one drops
  [...stack.querySelectorAll('.sc2:not(.flying)')].forEach((el, i) => { el.dataset.i = i; });
  draft.ci = Math.min(draft.ci, Math.max(0, left.length - 2));
  stack.style.setProperty('--sd', '150ms'); stack.classList.add('settle'); placeStack(stack, draft.ci);
  const ty = Math.round(foot.getBoundingClientRect().top - 10 + a.height * s2 / 2 - (a.top + a.height / 2)), from = cur || { x: 0, y: 0, s: 1, r: 0 };
  foot.classList.add('receiving');
  tween(card, from, { x: 0, y: ty, s: s2, r: 16 }, 260 + 200 * Math.max(0, 1 - (from.y || 0) / (ty || 1)), () => { stack.classList.remove('settle'); stack.style.removeProperty('--sd'); replaceSheet(top, renderDraw); },
    p => { if (eg) eg.style.opacity = String(Math.max(0, Math.min(1, (p - 0.45) * 2))); });
  return true;
}
const TEAR_PX = 150, SWIPE_PX = 110;
// capture can fail if the pointer already went away (or for synthetic events); the gesture still works without it
const capture = (el, id) => { try { el.setPointerCapture(id); } catch (err) { /* keep going uncaptured */ } };
function openPack(top) {
  const hand = top.querySelector('.hand'); if (!hand || hand.classList.contains('tearing')) return;
  hand.classList.add('tearing');
  setTimeout(() => { draft.opened = true; draft.dealIn = true; replaceSheet(top, renderDraw); }, reducedMotion() ? 0 : 460);
}
// side keys of the mock-up: while still in setup they jump to a ready home screen (default budget, recommended cards held);
// afterwards each press closes any sheet and flips home → bill → deck
function quickJump() {
  const fresh = S.firstDraw && !S.held.length && S.week === 1;
  if (fresh) {
    S.base = BASE; app.querySelectorAll('.sheet').forEach(e => e.remove()); renderTable();
    S.lastWeek = estimateWeek(); S.estimated = S.lastWeek.some(d => d.length); draft = {}; renderDraw();
    S.held = draft.rec.slice(); app.querySelectorAll('.sheet').forEach(e => e.remove()); draft = {};
    S.coach = COACH.length; S.view = 'home'; renderTable(); toast('Setup skipped · press a side key to flip pages');
    return;
  }
  app.querySelectorAll('.sheet').forEach(e => e.remove());
  const order = ['home', 'bill', 'deck']; const nv = order[(order.indexOf(S.view) + 1) % 3]; if (nv === 'bill') S.billTab = S.billTab || 'flow'; switchTab(nv);
}
// scale the phone to the window so it fills the height without scrolling; on a real phone it is the whole screen
function fitDevice() {
  const d = document.querySelector('.device');
  if (innerWidth <= 440) { d.style.zoom = ''; return; }
  // round down so the scaled phone never ends a fraction of a pixel past the window
  d.style.zoom = String(Math.floor(Math.max(0.55, Math.min(1.12, (innerHeight - 48) / d.offsetHeight)) * 1000) / 1000);
}
addEventListener('resize', fitDevice); fitDevice();
// over the phone the mouse is drawn as a finger (see .touch-dot / .touch-press): a small dot while it moves,
// a touch bubble while the button is held. Both are placed with the translate property so nothing else can scale their position
{
  const dot = document.querySelector('.touch-dot'), press = document.querySelector('.touch-press'), phone = document.querySelector('.phone');
  const place = e => {
    const z = document.querySelector('.device').style.zoom || 1;
    for (const el of [dot, press]) { el.style.translate = `${e.clientX}px ${e.clientY}px`; el.style.setProperty('--z', z); }
  };
  const lift = () => { dot.classList.remove('down'); press.classList.remove('down'); };
  phone.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; place(e); dot.classList.add('on'); });
  phone.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { dot.classList.remove('on'); lift(); } });
  addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.target instanceof Node && phone.contains(e.target)) { place(e); dot.classList.add('down'); press.classList.add('down'); } });
  // a drag keeps the bubble under the pointer even when it leaves the phone, the way a captured touch does
  addEventListener('pointermove', e => { if (press.classList.contains('down')) place(e); });
  addEventListener('pointerup', lift);
  addEventListener('pointercancel', lift);
}
document.querySelector('.device').addEventListener('click', e => { if (e.target.closest('.dbtn.k')) quickJump(); });
document.querySelector('.device').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.dbtn.k')) { e.preventDefault(); quickJump(); } });
app.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('.bag.closed');
  if (b) { tear = { b, strip: b.querySelector('.bag-strip'), x: e.clientX, p: 0 }; capture(b, e.pointerId); b.classList.add('tearing-drag'); return; }
  const st = e.target.closest && e.target.closest('.stack');
  if (st) { swipe = { st, x: e.clientX, y: e.clientY, dx: 0, n: st.querySelectorAll('.sc2').length, front: st.querySelector('.sc2.front'), moved: false, id: e.pointerId, mode: 'side', dy: 0 };
    if (swipe.front) swipe.rect = swipe.front.getBoundingClientRect();
    // grabbing the row mid-glide catches it where it is
    cancelAnimationFrame(st._raf); st.classList.remove('gliding'); swipe.at0 = st._at == null ? draft.ci : st._at; draft.ci = Math.max(0, Math.min(swipe.n - 1, Math.round(swipe.at0))); }
});
app.addEventListener('pointermove', e => {
  if (tear) {
    tear.p = Math.max(0, Math.min(1, (e.clientX - tear.x) / TEAR_PX));
    tear.strip.style.transform = `translate(${(tear.p * 22).toFixed(1)}px, ${(-tear.p * 26).toFixed(1)}px) rotate(${(tear.p * 24).toFixed(1)}deg)`;
    return;
  }
  if (swipe) {
    const dx = e.clientX - swipe.x, dyy = e.clientY - swipe.y;
    // capture only once it's really a drag, so a plain tap still lands on the card button
    if ((Math.abs(dx) > 8 || Math.abs(dyy) > 10) && !swipe.moved) { swipe.moved = true; swipe.mode = dyy > 0 && dyy > Math.abs(dx) * 1.8 ? 'down' : 'side'; swipe.st.classList.add('dragging'); capture(swipe.st, swipe.id); }
    if (!swipe.moved || !swipe.front) return;
    // pulling straight down drops the card toward the tray, shrinking as it goes
    if (swipe.mode === 'down') {
      const now = performance.now(); if (swipe.ly != null && now > swipe.lt) swipe.vy = (dyy - swipe.ly) / (now - swipe.lt) * 1000; swipe.ly = dyy; swipe.lt = now;
      swipe.dy = Math.max(0, dyy); swipe.dxx = dx * 0.15; swipe.sc = 1 - Math.min(1, swipe.dy / 420) * 0.12;
      swipe.rx = Math.min(1, swipe.dy / 420) * 14;
      swipe.front.style.transform = tilt(swipe.dxx, swipe.dy, swipe.sc, swipe.rx);
      const ft = swipe.st.closest('.sheet').querySelector('.drawfoot'); if (ft) ft.classList.toggle('receiving', swipe.dy > 40);
      return;
    }
    // sideways the whole row follows the finger, with a rubber band at either end
    const lastI = swipe.n - 1, atEnd = (draft.ci === 0 && dx > 0) || (draft.ci === lastI && dx < 0);
    const nowx = performance.now(); if (swipe.lx != null && nowx > swipe.ltx) swipe.vx = (dx - swipe.lx) / (nowx - swipe.ltx) * 1000; swipe.lx = dx; swipe.ltx = nowx;
    swipe.dx = atEnd ? dx * 0.3 : dx;
    placeStack(swipe.st, swipe.at0, swipe.dx);
    return;
  }
  const b = e.target.closest && e.target.closest('.bag.closed'); if (!b) return;
  const r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  b.classList.add('tilt');
  b.style.setProperty('--ry', `${(x * 34).toFixed(1)}deg`); b.style.setProperty('--rx', `${(-y * 26).toFixed(1)}deg`);
  b.style.setProperty('--ex', `${(x * 10).toFixed(1)}px`); b.style.setProperty('--ey', `${(y * 8).toFixed(1)}px`);
});
['pointerup', 'pointercancel'].forEach(type => app.addEventListener(type, () => {
  if (tear) {
    const t = tear; tear = null; t.b.classList.remove('tearing-drag');
    if (t.p > 0.5 && type === 'pointerup') { openPack(lastSheet()); return; }
    t.strip.style.transform = '';
    if (t.p < 0.04) { const hint = lastSheet().querySelector('.pk-tear'); if (hint) { hint.classList.remove('shake'); void hint.offsetWidth; hint.classList.add('shake'); } }
    return;
  }
  if (swipe) {
    const w = swipe; swipe = null; w.st.classList.remove('dragging');
    if (!w.moved) return;
    // the click that follows a swipe shouldn't also count as a tap on a card
    draft.swiped = true; setTimeout(() => { draft.swiped = false; }, 0);
    if (w.mode === 'down') {
      const cur = { x: w.dxx || 0, y: w.dy, s: w.sc || 1, r: w.rx || 0, vy: Math.max(0, w.vy || 0) };
      if ((w.dy >= 90 || cur.vy > 700) && w.dy > 20 && keepFront(lastSheet(), w.front, w.rect, cur)) return;
      // not far enough: the card springs back up
      { const ft = w.st.closest('.sheet').querySelector('.drawfoot'); if (ft) ft.classList.remove('receiving'); }
      spring(w.front, cur, { x: 0, y: 0, s: 1, r: 0 }, () => layoutStack(w.st, draft.ci), 240, 20, null, { y: Math.min(0, -(w.dy) * 3) });
      return;
    }
    // past a short pull (or a flick) the row slides one card over on a spring; otherwise it settles back. The DOM stays put.
    const dir = Math.abs(w.dx) > 60 || Math.abs(w.vx || 0) > 500 ? -Math.sign(Math.abs(w.dx) > 60 ? w.dx : w.vx) : 0, to = Math.min(w.n - 1, Math.max(0, draft.ci + dir));
    draft.ci = to; glide(w.st, to, -(w.vx || 0) / CARD_STEP);
  }
}));
app.addEventListener('pointerout', e => {
  if (tear) return;
  const b = e.target.closest && e.target.closest('.bag.closed'); if (!b || b.contains(e.relatedTarget)) return;
  b.classList.remove('tilt'); ['--ry', '--rx', '--ex', '--ey'].forEach(v => b.style.removeProperty(v));
});
app.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.bag.closed')) { e.preventDefault(); openPack(lastSheet()); } });
// leftover cards slide back into the pack, then the week starts with the kept ones
function keepHand(top) {
  const hand = top.querySelector('.hand');
  const slots = [...top.querySelectorAll('.dslot:not(.empty)')].map(el => ({ no: el.dataset.unpick, r: el.getBoundingClientRect() }));
  const go = () => {
    S.held = draft.sel.slice(); S.view = 'home'; draft = {};
    if (reducedMotion()) { top.remove(); renderTable(); return; }
    // the home is built underneath, the draw sheet melts away, and each kept card flies from its slot to its place in the tray
    renderTable(true); app.appendChild(top);
    top.style.pointerEvents = 'none'; top.querySelector('.drawfoot') && (top.querySelector('.drawfoot').style.transition = 'transform 0.4s ease-in', top.querySelector('.drawfoot').style.transform = 'translateY(140px)');
    top.style.transition = 'opacity 0.45s ease'; top.style.animation = 'none'; requestAnimationFrame(() => { top.style.opacity = '0'; });
    const cards = [...app.querySelectorAll('.rack .hcard')];
    cards.forEach((c, i) => {
      const from = (slots[i] || slots[0] || {}).r; if (!from) return;
      const to = c.getBoundingClientRect(), dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2), sc = from.width / to.width;
      c.animate([{ translate: `${dx}px ${dy}px`, scale: sc, opacity: 0.2 }, { opacity: 1, offset: 0.2 }, { translate: '0 -14px', scale: 1.04, offset: 0.75 }, { translate: '0 0', scale: 1, opacity: 1 }], { duration: 900 + i * 110, delay: 120 + i * 90, easing: 'cubic-bezier(.3,.9,.3,1)', fill: 'backwards' });
    });
    const crt = app.querySelector('.crt'); if (crt) crt.animate([{ transform: 'scale(0.94)', opacity: 0 }, { transform: 'scale(1.02)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
    const rest = app.querySelectorAll('.wkrow, .head'); rest.forEach((el, i) => el.animate([{ opacity: 0, translate: '0 18px' }, { opacity: 1, translate: '0 0' }], { duration: 500, delay: 300 + i * 80, easing: 'ease-out', fill: 'backwards' }));
    setTimeout(() => { top.remove(); toast(`This week’s cards: ${S.held.map(no => CARDS[no].name).join(', ')}`); setTimeout(showCoach, 1400); }, 700);
  };
  if (!hand || reducedMotion()) return go();
  hand.classList.add('returning'); setTimeout(go, 520);
}
