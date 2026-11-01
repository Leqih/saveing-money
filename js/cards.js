/* ---------- card art (same library as the canvas card component) ---------- */
const PAPER = '#ECEAE3', INK = '#111111';
// a card's colour says how much multiplier it is worth while it holds
const TYPES = {
  1: { label: '+1 mult', core: '#2E8BFF', chipText: '#FFFFFF', dark: false },
  2: { label: '+2 mult', core: '#FF4D6A', chipText: '#FFFFFF', dark: false },
  3: { label: '+3 mult', core: '#A55BFF', chipText: '#FFFFFF', dark: true },
  4: { label: '+4 mult', core: '#FF8A00', chipText: '#111111', dark: true },
  5: { label: '+5 mult', core: '#FF3D8A', chipText: '#FFFFFF', dark: true }
};
const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
const ci = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const el = (x, y, a, b) => `M${x - a} ${y}a${a} ${b} 0 1 0 ${2 * a} 0a${a} ${b} 0 1 0 ${-2 * a} 0Z`;
const star4 = (x, y, s) => `M${x} ${y - s}L${x + s * 0.3} ${y - s * 0.3}L${x + s} ${y}L${x + s * 0.3} ${y + s * 0.3}L${x} ${y + s}L${x - s * 0.3} ${y + s * 0.3}L${x - s} ${y}L${x - s * 0.3} ${y - s * 0.3}Z`;
const ART = {
  '01': { b: 'M-20 100H260C260 176 200 230 120 230C40 230 -20 176 -20 100Z' + rr(-30, 86, 300, 24, 12), bs: 'M150 84L214 -10M178 86L244 0', bw: 12, as: 'M78 40L162 124M162 40L78 124', aw: 18, e: [100, 168, 140, 168] },
  '03': { b: 'M48 82H192L174 240H66Z' + rr(34, 56, 172, 30, 12), bs: 'M140 58L172 -14', bw: 14, a: ci(94, 204, 13) + ci(120, 212, 13) + ci(146, 204, 13), e: [104, 130, 136, 130] },
  '04': { b: el(120, 154, 66, 90) + ci(70, 54, 20) + ci(102, 32, 22) + ci(140, 28, 22) + ci(176, 42, 20) + ci(202, 74, 16), as: 'M-10 216Q120 192 250 216', aw: 10, e: [100, 150, 140, 150] },
  '05': { b: ci(120, 112, 116) + ci(120, 112, 54), rule: 'evenodd', a: ci(120, 112, 40), e: [108, 112, 132, 112] },
  '06': { b: ci(110, 112, 120), cut: ci(172, 76, 98), a: star4(196, 176, 16) + star4(220, 132, 9) + star4(170, 210, 8), e: [52, 132, 80, 144] },
  '07': { bs: 'M-10 40H38L68 156H196L224 66H52', bw: 20, b: ci(92, 196, 20) + ci(182, 196, 20), e: [118, 108, 146, 108], ec: 'body' },
  '10': { b: 'M48 -10H192V204L174 190L156 204L138 190L120 204L102 190L84 204L66 190L48 204Z', as: 'M78 128L108 158L166 96', aw: 16, e: [100, 58, 140, 58] },
  '15': { b: rr(26, 48, 188, 150, 24), cut: rr(128, 98, 100, 52, 16), a: ci(162, 124, 13), e: [70, 118, 100, 118] },
  '16': { b: 'M100 18H152V206H100V84L64 102V58Z', a: ci(188, 182, 18), e: [116, 60, 136, 60] },
  '17': { b: rr(24, 96, 192, 112, 22) + rr(36, 66, 168, 34, 14), as: 'M120 110V196', aw: 8, e: [66, 152, 88, 152] },
  '13': { b: el(116, 138, 112, 78) + rr(40, 188, 30, 44, 8) + rr(150, 188, 30, 44, 8) + 'M58 76L84 30L110 68Z' + ci(224, 136, 26), cut: rr(94, 62, 52, 10, 5), a: ci(120, 28, 22), e: [154, 118, 180, 118] }
};
const coreOf = no => TYPES[CARDS[no].plus].core;
// flat, chunky illustrations in the card's own colour: a shape in the main colour, a darker and a lighter tone of it, and small yellow / white / ink accents; details are cut out of the shapes
const mix = (hex, k) => { const n = parseInt(hex.slice(1), 16), m = k < 0 ? 0 : 255, f = Math.abs(k); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (m - v) * f)); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); };
const palOf = (core, off) => off ? { P: '#B9B6AD', D: '#98958C', L: '#D8D5CC', Y: '#CFCCC2', W: '#ECEAE3', I: '#5E5E66', bg: '#E3E1D9', stage: '#D8D5CC' }
  : { P: core, D: mix(core, -0.32), L: mix(core, 0.55), Y: '#FFD21F', W: '#FFFFFF', I: mix(core, -0.5), bg: mix(core, 0.86), stage: mix(core, 0.7) };
const sp = (x, y, s, f) => `<path d="${star4(x, y, s)}" fill="${f}"/>`;
const ILL = {
  '01': p => `<path d="M30 118H210C210 164 172 192 120 192C68 192 30 164 30 118Z" fill="${p.P}"/><path d="M30 118H210C210 126 208 132 206 138H34C32 132 30 126 30 118Z" fill="${p.D}" opacity=".35"/>
    <rect x="22" y="102" width="196" height="24" rx="12" fill="${p.D}"/><rect x="90" y="188" width="60" height="14" rx="7" fill="${p.D}"/>
    <path d="M62 102Q60 68 84 70M104 102Q102 52 128 58M148 102Q148 74 168 78" fill="none" stroke="${p.Y}" stroke-width="11" stroke-linecap="round"/>
    <circle cx="176" cy="94" r="16" fill="${p.W}"/><circle cx="176" cy="94" r="7" fill="${p.Y}"/>
    <path d="M136 22L178 88M160 16L206 82" stroke="${p.I}" stroke-width="9" stroke-linecap="round"/>
    <path d="M52 146Q80 160 108 146T164 146" fill="none" stroke="${p.W}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="190" cy="164" r="26" fill="${p.W}"/><path d="M172 182L208 146" stroke="${p.I}" stroke-width="8" stroke-linecap="round"/>`,
  '03': p => `<path d="M62 78H178L165 192Q164 200 156 200H84Q76 200 75 192Z" fill="${p.P}"/><path d="M62 78H178L176 94H64Z" fill="${p.D}" opacity=".4"/>
    <rect x="52" y="64" width="136" height="22" rx="11" fill="${p.D}"/><path d="M68 64Q120 20 172 64Z" fill="${p.W}" stroke="${p.D}" stroke-width="0"/><path d="M84 54Q104 36 124 34" fill="none" stroke="${p.L}" stroke-width="6" stroke-linecap="round"/>
    <path d="M130 52L152 12" stroke="${p.Y}" stroke-width="11" stroke-linecap="round"/><path d="M138 36L150 42" stroke="${p.I}" stroke-width="5" stroke-linecap="round"/>
    <rect x="76" y="104" width="88" height="56" rx="12" fill="${p.W}"/><path d="M92 124H148M92 140H130" stroke="${p.P}" stroke-width="7" stroke-linecap="round"/>${sp(146, 142, 7, p.Y)}
    <circle cx="94" cy="186" r="10" fill="${p.I}"/><circle cx="120" cy="188" r="10" fill="${p.I}"/><circle cx="146" cy="186" r="10" fill="${p.I}"/>${sp(200, 52, 9, p.Y)}${sp(40, 120, 6, p.W)}`,
  '04': p => `<rect x="26" y="152" width="188" height="28" rx="14" fill="${p.D}"/><path d="M40 156V92Q40 78 54 78H88Q100 78 106 92Q116 120 146 124Q200 130 208 156Z" fill="${p.P}"/>
    <path d="M146 124Q198 130 208 156H150Z" fill="${p.L}"/><path d="M40 134H100" stroke="${p.D}" stroke-width="8" stroke-linecap="round"/>
    <path d="M96 100L124 120M108 90L136 112M122 86L148 108" stroke="${p.W}" stroke-width="7" stroke-linecap="round"/><rect x="40" y="72" width="62" height="16" rx="8" fill="${p.D}" opacity=".55"/>
    <path d="M12 118H34M4 136H30M14 154H30" stroke="${p.I}" stroke-width="6" stroke-linecap="round" opacity=".85"/>${sp(204, 70, 10, p.Y)}${sp(178, 40, 6, p.W)}`,
  '05': p => `<rect x="38" y="46" width="164" height="150" rx="26" fill="${p.W}" stroke="${p.D}" stroke-width="0"/><path d="M38 72Q38 46 64 46H176Q202 46 202 72V90H38Z" fill="${p.P}"/>
    <rect x="68" y="30" width="16" height="32" rx="8" fill="${p.I}"/><rect x="156" y="30" width="16" height="32" rx="8" fill="${p.I}"/>
    <text x="120" y="176" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="94" fill="${p.P}">0</text><path d="M62 72H100M140 72H178" stroke="${p.W}" stroke-width="7" stroke-linecap="round" opacity=".9"/>${sp(212, 34, 10, p.Y)}${sp(26, 150, 7, p.Y)}`,
  '06': p => `<path d="M156 30A82 82 0 1 0 204 150A66 66 0 0 1 156 30Z" fill="${p.P}"/><path d="M156 30A82 82 0 0 0 52 62A84 84 0 0 1 156 30Z" fill="${p.L}" opacity=".7"/>
    <circle cx="70" cy="118" r="11" fill="${p.D}"/><circle cx="96" cy="156" r="7" fill="${p.D}"/><circle cx="62" cy="84" r="6" fill="${p.D}"/>
    ${sp(180, 70, 14, p.Y)}${sp(206, 112, 8, p.Y)}${sp(150, 112, 6, p.W)}${sp(36, 40, 7, p.Y)}
    <rect x="86" y="176" width="92" height="22" rx="11" fill="${p.W}"/><circle cx="112" cy="174" r="17" fill="${p.W}"/><circle cx="142" cy="170" r="21" fill="${p.W}"/>`,
  '07': p => `<path d="M62 78H208L190 148H80Z" fill="${p.P}" stroke="${p.P}" stroke-width="10" stroke-linejoin="round"/><path d="M96 92L102 138M126 92V138M156 92L152 138M182 92L174 138M74 112H198" stroke="${p.W}" stroke-width="5" stroke-linecap="round" opacity=".9"/>
    <path d="M22 50H52L82 150H184" fill="none" stroke="${p.I}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="98" cy="180" r="15" fill="${p.I}"/><circle cx="98" cy="180" r="5" fill="${p.W}"/><circle cx="176" cy="180" r="15" fill="${p.I}"/><circle cx="176" cy="180" r="5" fill="${p.W}"/>
    <circle cx="184" cy="46" r="30" fill="${p.Y}"/><path d="M184 46V28M184 46L198 54" stroke="${p.I}" stroke-width="6" stroke-linecap="round"/>${sp(98, 40, 8, p.D)}`,
  '10': p => `<path d="M64 26H176V190L162 178L148 190L134 178L120 190L106 178L92 190L78 178L64 190Z" fill="${p.D}" transform="translate(6 8)" opacity=".5"/><path d="M64 26H176V190L162 178L148 190L134 178L120 190L106 178L92 190L78 178L64 190Z" fill="${p.W}"/>
    <rect x="80" y="42" width="80" height="14" rx="7" fill="${p.P}"/><path d="M82 72H128M82 86H112M144 72H158M130 86H158" stroke="${p.L}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="120" cy="132" r="28" fill="${p.P}"/><path d="M106 132L116 142L136 120" fill="none" stroke="${p.W}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>${sp(194, 52, 11, p.Y)}${sp(40, 110, 7, p.Y)}`,
  '15': p => `<rect x="34" y="78" width="172" height="112" rx="26" fill="${p.P}"/><path d="M34 104Q34 78 60 78H180Q206 78 206 104V112H34Z" fill="${p.D}" opacity=".45"/>
    <rect x="62" y="40" width="96" height="48" rx="10" fill="${p.Y}" transform="rotate(-8 110 64)"/><path d="M70 62H140" stroke="${p.I}" stroke-width="7" stroke-linecap="round" transform="rotate(-8 110 64)"/>
    <rect x="144" y="116" width="62" height="42" rx="16" fill="${p.W}"/><circle cx="172" cy="137" r="8" fill="${p.P}"/><path d="M48 106V170M60 170H132" fill="none" stroke="${p.W}" stroke-width="0"/>
    <circle cx="192" cy="54" r="19" fill="${p.Y}"/><path d="M186 54H198M192 48V60" stroke="${p.I}" stroke-width="4" stroke-linecap="round"/><rect x="44" y="94" width="92" height="84" rx="18" fill="none" stroke="${p.W}" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/>${sp(26, 56, 8, p.Y)}`,
  '16': p => `<circle cx="112" cy="116" r="84" fill="${p.W}"/><circle cx="112" cy="116" r="84" fill="none" stroke="${p.P}" stroke-width="14"/><circle cx="112" cy="116" r="54" fill="${p.P}"/><circle cx="112" cy="116" r="34" fill="${p.W}"/><circle cx="112" cy="116" r="16" fill="${p.D}"/>
    <path d="M118 110L200 28" stroke="${p.I}" stroke-width="9" stroke-linecap="round"/><path d="M186 14L214 42L198 44L194 60L186 52L178 50L180 34Z" fill="${p.Y}"/>${sp(40, 40, 9, p.Y)}${sp(210, 150, 7, p.Y)}`,
  '17': p => `<path d="M82 76V54Q82 34 102 34H138Q158 34 158 54V76" fill="none" stroke="${p.I}" stroke-width="11" stroke-linecap="round"/>
    <rect x="36" y="90" width="168" height="104" rx="26" fill="${p.P}"/><rect x="30" y="68" width="180" height="38" rx="16" fill="${p.D}"/><rect x="104" y="90" width="32" height="30" rx="8" fill="${p.Y}"/>
    <rect x="62" y="132" width="116" height="42" rx="12" fill="${p.W}"/><path d="M76 146H122M76 160H106" stroke="${p.L}" stroke-width="7" stroke-linecap="round"/><path d="M152 168q-14-8-8-18q6-4 8 2q2-6 8-2q6 10-8 18z" fill="${p.P}"/>${sp(212, 70, 8, p.Y)}`,
  '02': p => `<ellipse cx="116" cy="186" rx="78" ry="12" fill="${p.D}"/><path d="M58 92H172V150Q172 188 136 188H94Q58 188 58 150Z" fill="${p.P}"/><path d="M58 92H172V106H58Z" fill="${p.D}" opacity=".4"/>
    <path d="M172 112H190Q208 112 208 132Q208 152 186 152H172" fill="none" stroke="${p.D}" stroke-width="13" stroke-linecap="round"/><ellipse cx="115" cy="92" rx="57" ry="11" fill="${p.D}"/><ellipse cx="115" cy="93" rx="46" ry="6.500" fill="${p.I}"/>
    <path d="M86 70Q76 54 90 40M116 72Q106 52 120 34M146 70Q138 56 150 44" fill="none" stroke="${p.I}" stroke-width="7" stroke-linecap="round" opacity=".85"/>
    <rect x="94" y="116" width="14" height="38" rx="7" fill="${p.W}"/><rect x="122" y="116" width="14" height="38" rx="7" fill="${p.W}"/>${sp(206, 56, 10, p.Y)}${sp(30, 120, 7, p.Y)}`,
  '08': p => `<rect x="44" y="150" width="108" height="26" rx="13" fill="${p.D}"/><rect x="44" y="144" width="108" height="26" rx="13" fill="${p.Y}"/><rect x="56" y="118" width="108" height="26" rx="13" fill="${p.D}"/><rect x="56" y="112" width="108" height="26" rx="13" fill="${p.Y}"/><rect x="40" y="86" width="108" height="26" rx="13" fill="${p.D}"/><rect x="40" y="80" width="108" height="26" rx="13" fill="${p.Y}"/>
    <path d="M70 92H118M84 124H134M70 156H124" stroke="${p.D}" stroke-width="5" stroke-linecap="round" opacity=".45"/>
    <circle cx="176" cy="132" r="38" fill="${p.D}"/><circle cx="176" cy="126" r="38" fill="${p.Y}"/><circle cx="176" cy="126" r="25" fill="none" stroke="${p.D}" stroke-width="3" stroke-dasharray="4 5"/><text x="176" y="140" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="38" fill="${p.I}">¢</text>${sp(204, 48, 10, p.W)}${sp(30, 46, 7, p.Y)}`,
  '09': p => `<rect x="94" y="184" width="52" height="14" rx="7" fill="${p.D}"/><rect x="113" y="62" width="14" height="128" rx="7" fill="${p.P}"/><rect x="30" y="52" width="180" height="14" rx="7" fill="${p.D}"/>
    <path d="M52 66L30 128M52 66L74 128M188 66L166 128M188 66L210 128" stroke="${p.I}" stroke-width="3.500" stroke-linecap="round"/><path d="M20 128H84A32 32 0 0 1 20 128Z" fill="${p.P}"/><path d="M156 128H220A32 32 0 0 1 156 128Z" fill="${p.P}"/>
    <circle cx="44" cy="120" r="9" fill="${p.Y}"/><circle cx="62" cy="122" r="7" fill="${p.Y}"/><circle cx="186" cy="120" r="9" fill="${p.Y}"/><circle cx="204" cy="122" r="7" fill="${p.Y}"/>
    <circle cx="120" cy="54" r="14" fill="${p.Y}"/>${sp(214, 36, 9, p.Y)}${sp(26, 34, 7, p.W)}`,
  '11': p => `<rect x="40" y="94" width="160" height="96" rx="12" fill="${p.W}"/><rect x="52" y="106" width="136" height="72" rx="8" fill="${p.L}"/><path d="M66 106L110 178M120 106L164 178" stroke="${p.W}" stroke-width="6" opacity=".55"/>
    <rect x="94" y="122" width="52" height="50" rx="10" fill="${p.Y}"/><path d="M106 124V116Q106 104 120 104Q134 104 134 116V124" fill="none" stroke="${p.I}" stroke-width="6" stroke-linecap="round"/><path d="M104 142H136" stroke="${p.I}" stroke-width="5" stroke-linecap="round"/>
    ${[0, 1, 2, 3, 4].map(i => `<rect x="${32 + i * 35}" y="48" width="35" height="46" fill="${i % 2 ? p.W : p.P}"/><circle cx="${49.500 + i * 35}" cy="94" r="17.500" fill="${i % 2 ? p.W : p.P}"/>`).join('')}<rect x="32" y="40" width="175" height="12" rx="6" fill="${p.D}"/>${sp(214, 120, 9, p.Y)}`,
  '12': p => `<path d="M30 88H98L90 186Q89 194 81 194H47Q39 194 38 186Z" fill="${p.P}"/><rect x="24" y="76" width="80" height="16" rx="8" fill="${p.D}"/><path d="M76 74L92 34" stroke="${p.Y}" stroke-width="10" stroke-linecap="round"/>
    <path d="M110 108H178L170 190Q169 198 161 198H127Q119 198 118 190Z" fill="${p.D}"/><rect x="104" y="96" width="80" height="16" rx="8" fill="${p.P}"/><path d="M156 94L172 54" stroke="${p.W}" stroke-width="10" stroke-linecap="round"/>
    <rect x="40" y="116" width="48" height="40" rx="9" fill="${p.W}"/><path d="M52 132H76M52 144H68" stroke="${p.L}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="196" cy="58" r="30" fill="${p.Y}"/><text x="196" y="72" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="40" fill="${p.I}">2</text>`,
  '14': p => `<path d="M56 192Q42 108 108 50Q166 12 204 28Q206 96 150 150Q112 184 56 192Z" fill="${p.P}"/><path d="M56 192Q126 110 196 36" fill="none" stroke="${p.D}" stroke-width="8" stroke-linecap="round"/>
    <path d="M92 150L70 138M110 128L84 112M128 106L102 88M146 84L124 68M120 160L100 152M140 138L120 128M160 116L142 106" stroke="${p.L}" stroke-width="5" stroke-linecap="round"/>
    <path d="M208 120Q214 134 224 140M30 80Q24 92 14 96" fill="none" stroke="${p.I}" stroke-width="5" stroke-linecap="round" opacity=".6"/>${sp(36, 44, 10, p.Y)}${sp(216, 74, 8, p.W)}${sp(190, 188, 7, p.Y)}`,
  '18': p => `<path d="M120 24L196 48V112Q196 168 120 202Q44 168 44 112V48Z" fill="${p.D}" transform="translate(0 8)"/><path d="M120 24L196 48V112Q196 168 120 202Q44 168 44 112V48Z" fill="${p.P}"/><path d="M120 40L180 58V112Q180 154 120 182Z" fill="${p.L}" opacity=".35"/>
    <circle cx="120" cy="108" r="40" fill="${p.W}"/><path d="M100 108L115 123L142 92" fill="none" stroke="${p.P}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${sp(206, 30, 10, p.Y)}${sp(30, 90, 7, p.Y)}`,
  '19': p => `<rect x="52" y="30" width="136" height="164" rx="20" fill="${p.D}" transform="translate(6 8)" opacity=".45"/><rect x="52" y="30" width="136" height="164" rx="20" fill="${p.W}"/><rect x="52" y="30" width="136" height="34" rx="20" fill="${p.P}"/><rect x="52" y="50" width="136" height="14" fill="${p.P}"/>
    ${[78, 104, 130].map((y, i) => `<circle cx="80" cy="${y + 36}" r="10" fill="${p.P}"/><path d="M75 ${y + 36}L79 ${y + 40}L86 ${y + 31}" fill="none" stroke="${p.W}" stroke-width="3.500" stroke-linecap="round" stroke-linejoin="round"/><rect x="100" y="${y + 31}" width="${[70, 54, 62][i]}" height="10" rx="5" fill="${p.L}"/>`).join('')}
    ${[76, 108, 140, 172].map(x => `<rect x="${x - 6}" y="20" width="12" height="26" rx="6" fill="${p.I}"/>`).join('')}${sp(204, 80, 9, p.Y)}`,
  '20': p => `<rect x="20" y="82" width="86" height="60" rx="30" fill="none" stroke="${p.P}" stroke-width="16"/><rect x="77" y="98" width="86" height="60" rx="30" fill="none" stroke="${p.D}" stroke-width="16"/><rect x="134" y="82" width="86" height="60" rx="30" fill="none" stroke="${p.P}" stroke-width="16"/>
    <path d="M120 40L104 70H128L112 100" fill="none" stroke="${p.Y}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>${sp(36, 40, 9, p.Y)}${sp(208, 44, 9, p.Y)}${sp(190, 186, 8, p.W)}`,
  '21': p => `<g transform="rotate(-14 84 118)"><rect x="36" y="70" width="96" height="96" rx="22" fill="${p.D}" transform="translate(0 7)"/><rect x="36" y="70" width="96" height="96" rx="22" fill="${p.W}"/><circle cx="62" cy="96" r="9" fill="${p.I}"/><circle cx="106" cy="96" r="9" fill="${p.I}"/><circle cx="84" cy="118" r="9" fill="${p.I}"/><circle cx="62" cy="140" r="9" fill="${p.I}"/><circle cx="106" cy="140" r="9" fill="${p.I}"/></g>
    <g transform="rotate(16 160 110)"><rect x="116" y="62" width="84" height="84" rx="20" fill="${p.D}" transform="translate(0 7)"/><rect x="116" y="62" width="84" height="84" rx="20" fill="${p.Y}"/><circle cx="144" cy="90" r="8" fill="${p.I}"/><circle cx="172" cy="118" r="8" fill="${p.I}"/></g>${sp(206, 40, 11, p.Y)}${sp(30, 44, 8, p.W)}`,
  '22': p => `<path d="M120 22L146 78L208 86L162 128L174 190L120 160L66 190L78 128L32 86L94 78Z" fill="${p.D}" transform="translate(0 8)"/><path d="M120 22L146 78L208 86L162 128L174 190L120 160L66 190L78 128L32 86L94 78Z" fill="${p.Y}"/>
    <path d="M120 150C102 134 92 124 92 112C92 102 100 96 108 96C113 96 118 99 120 104C122 99 127 96 132 96C140 96 148 102 148 112C148 124 138 134 120 150Z" fill="${p.P}"/>${sp(214, 40, 9, p.W)}${sp(26, 150, 8, p.Y)}`,
  '23': p => `<rect x="112" y="84" width="12" height="108" rx="6" fill="${p.I}"/><path d="M28 98A92 82 0 0 1 208 98Z" fill="${p.P}"/><path d="M28 98A92 82 0 0 1 74 28L98 98Z" fill="${p.W}"/><path d="M118 98L118 16A92 82 0 0 1 164 28L118 98Z" fill="${p.W}"/><path d="M28 98Q44 112 59 98Q74 112 89 98Q104 112 118 98Q132 112 148 98Q164 112 178 98Q194 112 208 98" fill="none" stroke="${p.D}" stroke-width="5"/>
    <circle cx="196" cy="34" r="20" fill="${p.Y}"/><path d="M60 196Q120 176 190 196" fill="none" stroke="${p.D}" stroke-width="8" stroke-linecap="round" opacity=".5"/>${sp(36, 40, 9, p.Y)}`,
  '24': p => `<circle cx="60" cy="52" r="26" fill="${p.D}"/><circle cx="180" cy="52" r="26" fill="${p.D}"/><circle cx="120" cy="120" r="76" fill="${p.D}" transform="translate(0 7)"/><circle cx="120" cy="120" r="76" fill="${p.P}"/><circle cx="120" cy="120" r="58" fill="${p.W}"/>
    ${Array.from({ length: 12 }, (_, k) => { const a = k / 12 * Math.PI * 2; return `<path d="M${(120 + Math.cos(a) * 48).toFixed(1)} ${(120 + Math.sin(a) * 48).toFixed(1)}L${(120 + Math.cos(a) * 54).toFixed(1)} ${(120 + Math.sin(a) * 54).toFixed(1)}" stroke="${p.I}" stroke-width="4" stroke-linecap="round"/>`; }).join('')}
    <path d="M120 120V82M120 120L146 134" stroke="${p.I}" stroke-width="8" stroke-linecap="round"/><circle cx="120" cy="120" r="7" fill="${p.Y}"/><path d="M92 200L74 214M148 200L166 214" stroke="${p.I}" stroke-width="8" stroke-linecap="round"/>${sp(212, 100, 8, p.Y)}`,
  '25': p => `<path d="M82 152H158L148 200H92Z" fill="${p.D}"/><rect x="74" y="140" width="92" height="18" rx="9" fill="${p.P}"/><path d="M120 140V92" stroke="${p.D}" stroke-width="8" stroke-linecap="round"/>
    <path d="M120 100C70 100 52 56 56 28C100 28 130 52 120 100Z" fill="${p.P}"/><path d="M120 100C150 94 176 74 184 48C150 44 122 62 120 100Z" fill="${p.L}"/><path d="M120 100Q100 70 70 42" fill="none" stroke="${p.W}" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="120" cy="206" rx="52" ry="7" fill="${p.D}" opacity=".25"/>${sp(200, 60, 9, p.Y)}${sp(32, 130, 7, p.Y)}`,
  '26': p => `<ellipse cx="120" cy="188" rx="86" ry="14" fill="${p.D}" opacity=".5"/>
    ${[-62, -32, 32, 62].map(a => `<ellipse cx="120" cy="124" rx="24" ry="62" fill="${p.L}" transform="rotate(${a} 120 176)"/>`).join('')}${[-30, 30].map(a => `<ellipse cx="120" cy="116" rx="26" ry="68" fill="${p.P}" transform="rotate(${a} 120 176)"/>`).join('')}<ellipse cx="120" cy="108" rx="28" ry="72" fill="${p.D}"/><ellipse cx="120" cy="108" rx="14" ry="50" fill="${p.P}" opacity=".6"/>
    <circle cx="120" cy="40" r="10" fill="${p.Y}"/>${sp(40, 56, 9, p.Y)}${sp(202, 66, 9, p.W)}`,
  '13': p => `<path d="M60 70L82 34L104 66Z" fill="${p.D}"/><ellipse cx="116" cy="134" rx="90" ry="64" fill="${p.P}"/><ellipse cx="116" cy="150" rx="66" ry="36" fill="${p.L}" opacity=".55"/>
    <rect x="52" y="172" width="34" height="30" rx="12" fill="${p.D}"/><rect x="148" y="172" width="34" height="30" rx="12" fill="${p.D}"/><ellipse cx="206" cy="132" rx="22" ry="26" fill="${p.D}"/><circle cx="200" cy="124" r="4" fill="${p.W}"/><circle cx="208" cy="140" r="4" fill="${p.W}"/>
    <rect x="86" y="76" width="56" height="10" rx="5" fill="${p.D}"/><path d="M28 124Q10 108 24 96Q36 92 36 106" fill="none" stroke="${p.D}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="114" cy="40" r="22" fill="${p.Y}"/><text x="114" y="49" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="24" fill="${p.I}">$</text><path d="M56 118Q64 94 92 90" fill="none" stroke="${p.W}" stroke-width="7" stroke-linecap="round" opacity=".8"/>`
};
const illo = (no, core, off) => { const p = palOf(core, off); return `<circle cx="120" cy="108" r="96" fill="${p.stage}" opacity="${off ? 0.6 : 0.55}"/><ellipse cx="120" cy="208" rx="64" ry="8" fill="${p.D}" opacity=".22"/>${ILL[no](p)}`; };
// state: 'on' holds, 'broken' cracked for today (or the week), 'pending' asleep until something is done
function cardHTML(c, state = 'on') {
  const t = TYPES[c.plus], off = state !== 'on';
  const face = t.dark ? INK : PAPER, ink = t.dark ? PAPER : INK;
  const shape = off ? (t.dark ? '#5A5A5E' : '#B9B6AD') : ink;
  const core = off ? '#CFCCC2' : t.core;
  const sub = t.dark ? 'rgba(236,234,227,0.7)' : '#5E5E66';
  const dot = n => (c.diff >= n ? ink : (t.dark ? 'rgba(236,234,227,0.25)' : '#CFCCC2'));
  const ry = off ? 1.4 : 8;
  const sticker = state === 'broken' ? (c.weekly ? 'Broken · until Sunday' : 'Broken · back tomorrow') : state === 'pending' ? 'Asleep · log one to wake it' : '';
  // a collectible-card build: white sleeve, a frame in the card's colour, name plaque row, art window, rule text box, footer strip
  const lip = off ? '#A8A59B' : `color-mix(in srgb, ${t.core} 62%, #000)`;
  const win = palOf(t.core, off).bg;
  const box = t.dark ? 'rgba(236,234,227,0.10)' : 'rgba(17,17,17,0.06)';
  const key = t.dark ? 'rgba(236,234,227,0.22)' : 'rgba(17,17,17,0.14)';
  const nameSize = c.name.length > 11 ? 12 : 14;
  return `<div style="width:240px;height:340px;box-sizing:border-box;border-radius:24px;padding:4px;background:#FFF;box-shadow:0 7px 0 ${lip},0 18px 24px -6px rgba(20,20,30,0.45);color:${ink};font-family:var(--f-body)">
  <div style="height:100%;box-sizing:border-box;border-radius:20px;padding:8px;background:${core}">
  <div style="position:relative;height:100%;border-radius:13px;background:${face};overflow:hidden">
   <span style="position:absolute;left:8px;top:8px;width:26px;height:26px;border-radius:50%;background:${key};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:11px">${c.no}</span>
   <span style="position:absolute;left:40px;right:40px;top:8px;height:26px;display:flex;align-items:center;justify-content:center;font-family:var(--f-display);font-size:${nameSize}px;text-transform:uppercase;white-space:nowrap;letter-spacing:0.2px">${c.name}</span>
   <span style="position:absolute;right:8px;top:8px;width:26px;height:26px;border-radius:50%;background:${off ? '#8A8A92' : t.core};color:${t.chipText};display:flex;align-items:center;justify-content:center;font-family:var(--f-display);font-size:12px">+${c.plus}</span>
   <div style="position:absolute;left:8px;right:8px;top:42px;height:160px;border-radius:12px;background:${win};box-shadow:inset 0 0 0 2px ${key};overflow:hidden">
    <svg width="200" height="160" viewBox="0 0 240 224" aria-hidden="true" style="position:absolute;left:0;top:0">
     ${illo(c.no, t.core, off)}
     ${state === 'broken' ? `<path d="M30 0L96 70L72 104L150 168L128 224" fill="none" stroke="${win}" stroke-width="9" stroke-linejoin="bevel"/><path d="M96 70L132 52M150 168L198 150" fill="none" stroke="${win}" stroke-width="6"/>` : ''}
    </svg>
   </div>
   <div style="position:absolute;left:8px;right:8px;top:210px;height:68px;box-sizing:border-box;padding:6px 10px;border-radius:10px;background:${box};display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;line-height:1.35;overflow:hidden;color:${t.dark ? PAPER : INK}">${c.cond}</div>
   <div style="position:absolute;left:12px;right:12px;bottom:8px;display:flex;justify-content:space-between;align-items:center;font-family:var(--f-mono);font-size:11px"><span>${c.weekly ? 'Weekly' : 'Daily'}</span><span style="display:inline-flex;gap:4px"><i style="width:7px;height:7px;border-radius:50%;background:${dot(1)}"></i><i style="width:7px;height:7px;border-radius:50%;background:${dot(2)}"></i><i style="width:7px;height:7px;border-radius:50%;background:${dot(3)}"></i></span></div>
   ${sticker ? `<span style="position:absolute;right:12px;top:182px;padding:3px 9px;border-radius:8px;background:#111;color:${state === 'broken' ? '#FF8A9B' : '#ECEAE3'};font-family:var(--f-mono);font-size:11px;transform:rotate(-4deg)">${sticker}</span>` : ''}
  </div></div></div>`;
}
const scaled = (c, s, state) => `<div style="width:${240 * s}px;height:${340 * s}px" aria-hidden="true"><div style="width:240px;height:340px;transform:scale(${s});transform-origin:0 0">${cardHTML(c, state)}</div></div>`;
// a card's art as a small icon on its colour, used where the canvas had mascot tiles
const tintOf = no => mix(coreOf(no), 0.8);
function artIcon(no, size) {
  return `<svg width="${size}" height="${Math.round(size * 224 / 240)}" viewBox="0 0 240 224" aria-hidden="true">${ILL[no](palOf(coreOf(no), false))}</svg>`;
}
