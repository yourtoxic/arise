/* ARISE puzzle section: five games, progression, daily challenges. Loaded after app.js (shares its globals). */
const PZN = { nback: 'Dual N-Back', nono: 'Nonograms', sudoku: 'Sudoku', logic: 'Logic Grid', tangram: 'Block Puzzle' };
const PZI = {
  nback: ['Trains working memory and attention.', 'A square lights up on the grid and a tone plays. Press Position when the square is where it was N steps ago. Press Sound when the tone matches the one N steps ago. Keys: A = position, L = sound. Your N rises when accuracy is 85% or more and falls below 60%. The daily challenge runs for 5 minutes and adapts N as you play.'],
  nono: ['Trains deduction and pattern recognition.', 'Numbers beside each row and column give the lengths of the filled runs, in order. Tap to fill a cell. Switch to Mark mode (or right-click) to cross out cells you know are empty. Solve it to reveal pixel art for your collection.'],
  sudoku: ['Trains logic and concentration.', 'Fill the grid so every row, column and 3x3 box holds each symbol once. Killer: dashed cages show a sum, symbols in a cage never repeat and add up to the sum. Wordoku: letters replace numbers and the middle row spells a mystery word. 5 mistakes end the game. 3 hints per puzzle.'],
  logic: ['Trains structured reasoning.', 'Use the clues to work out which items belong together. In each grid tap a cell once for a cross (not this one), twice for a check (this is it), three times to clear. A check removes the rest of its row and column automatically. Check solution shows wrong checks.'],
  tangram: ['Trains spatial reasoning and mental rotation.', 'Fill the dark silhouette exactly with all pieces, with no overlap. Drag a piece onto the board, or tap a piece then tap the board. Rotate (R) and Flip (F) change the selected piece. Tap a placed piece to pick it up again.']
};
const PZH = {
  nback: { steps: ['A 3x3 grid lights one square about every 2.5 seconds and plays a tone.', 'N is how far back you compare. With N = 2 you compare with two steps ago.', 'Same square as N steps ago? Press Position match (A).', 'Same tone as N steps ago? Press Sound match (L). Both can match at once.', 'No match? Press nothing. The first N steps can never match.'], ex: 'N = 2, squares: top-left, center, top-left. The third square equals the one two steps back, so press A.', ctl: 'Keys A and L, or the two buttons. Sound on/off button.', score: 'Correct match +10, correct non-press +1, false alarm -5, missed match 0. Accuracy = correct decisions / all decisions. 85% or more raises N next time, below 60% lowers N and gives no reward. Easy N=1, medium N=2, hard N=3, adaptive uses your saved N. Daily = 5 minutes and N adapts every 20 trials.', tips: 'Say the positions silently to yourself. Keep your eyes on the grid and listen at the same time.' },
  nono: { steps: ['Numbers beside a row or above a column are the lengths of filled runs, in order. "3 1" means a block of 3, a gap, then 1.', 'Start with big clues. A 5 in a 5-wide row fills the whole row. A 0 means an empty line.', 'Fill cells you are sure about. Mark cells you know are empty with x.', 'A clue turns dim when its line matches. Solve every line to reveal the pixel art.'], ex: 'Row clue "2 1" in 5 cells: possible as ##.#. or ##..# or .##.#. The cell 2 is always filled.', ctl: 'Fill and Mark buttons (or right-click to mark), Check lines, Clear.', score: 'Base 200 / 400 / 700 for easy / medium / hard minus seconds taken. A new picture joins your collection.', tips: 'Work on rows and columns in turns. Each new filled cell gives new certainty on the crossing line.' },
  sudoku: { steps: ['Every row, column and 3x3 box must contain each symbol exactly once.', 'Click a cell, then press a number (or letter) on the pad or keyboard.', 'Killer: dashed cages show a sum. Symbols in a cage never repeat and add up to the number. A 2-cell cage with sum 3 must be 1 and 2.', 'Wordoku: letters replace numbers and the middle row spells a mystery word.', 'A wrong entry counts as a mistake. 5 mistakes end the game.'], ex: 'If a row already has 1 to 8, the last empty cell must be 9.', ctl: 'Click cells, keys 1-9 (or letters), Backspace erase, arrow keys move, Hint button (3 per game).', score: 'Base 300 / 500 / 800 (+150 Killer, +100 Wordoku) minus half the seconds, 30 per mistake and 50 per hint.', tips: 'Look for a cell with only one possible symbol first. Same-symbol cells are highlighted when you select one.' },
  logic: { steps: ['Read all clues first. Every table links two categories.', 'Tap a cell once for a cross (not this one), twice for a check (this is it), three times to clear.', 'A check automatically crosses the rest of its row and column.', '"Either A or B" clues mean exactly one of the two is true.', 'Solved when every table has the right checks. Check solution highlights wrong checks.'], ex: '"Mia is not the cat owner": cross the Mia / cat cell. "The tea drinker is the dog owner": check dog / tea in the Pets x Drinks table.', ctl: 'Tap cells, Check solution, Hint.', score: 'Base 200 / 400 / 700 minus half the seconds, 20 per wrong check found and 40 per hint.', tips: 'Begin with direct "is" clues, then use the crosses to leave only one choice in a row.' },
  tangram: { steps: ['Fill the dark silhouette exactly with all pieces. No gaps, no overlap.', 'Tap a piece in the tray to select it, or drag it onto the board.', 'Rotate turns the piece 90 degrees. Flip mirrors it. Both work on the selected piece.', 'Drop or tap on the board: the piece snaps to the grid where it fits. Tap a placed piece to pick it up again.', 'Solved when every piece is placed.'], ex: 'A long 3-cell bar fits only in a straight 3-cell stretch of the silhouette.', ctl: 'Drag and drop or tap, R rotate, F flip, Hint (places one piece correctly).', score: 'Base 200 / 400 / 700 minus half the seconds and 50 per hint.', tips: 'Place pieces that fit corners and notches of the silhouette first.' }
};
const pzHelp = g => { const h = PZH[g]; return `<ol>${h.steps.map(x => `<li>${x}</li>`).join('')}</ol><p><b>Example:</b> ${h.ex}</p><p><b>Controls:</b> ${h.ctl}</p><p><b>Scoring:</b> ${h.score}</p><p><b>Tips:</b> ${h.tips}</p><p class="mute">Rewards: easy 3 XP, medium 6, hard 10, daily +5. Only the first 2 practice wins per game each day pay XP, max 40 puzzle XP a day.</p>`; };
let pz = { game: '', stage: 'menu', diff: 'easy', daily: false, variant: 'standard', st: null, res: null }, nbT = null, nbT0 = null, tgDrag = null, tgSup = false;
const pzS = () => { const P = S.pz = S.pz || {}; P.best = P.best || {}; P.hist = P.hist || []; P.gallery = P.gallery || []; P.daily = P.daily || {}; P.xp = P.xp || {}; P.resume = P.resume || {}; P.nb = P.nb || { n: 1, sessions: 0 }; P.chestDay = P.chestDay || ''; return P; };
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const mk = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const seedFor = g => pz.daily ? hash('daily:' + g + ':' + today()) : (Date.now() ^ (Math.random() * 1e9)) >>> 0;
const shuf = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtT = s => p2(Math.floor(s / 60)) + ':' + p2(s % 60);
const pzStop = () => { clearInterval(nbT); clearTimeout(nbT0); nbT = nbT0 = null; };
const DB = { easy: 3, medium: 6, hard: 10 }, BASE = { easy: 200, medium: 400, hard: 700 };

/* ---------- rewards, history, badges ---------- */
function pzReward(game, diff, daily) {
  const P = pzS(), dk = today(), L = P.xp[dk] = P.xp[dk] || { total: 0, g: {}, d: {} };
  let xp = DB[diff] || 6, note = '';
  if (daily) { if (L.d[game]) daily = false; else { L.d[game] = 1; xp += 5; } }
  if (!daily) { if ((L.g[game] || 0) >= 2) { xp = 0; note = 'Practice XP limit reached for this game today.'; } else L.g[game] = (L.g[game] || 0) + 1; }
  xp = Math.max(0, Math.min(xp, 40 - L.total)); if (xp === 0 && !note) note = 'Daily puzzle XP cap (40) reached.'; L.total += xp;
  if (xp) addXp(xp, 'Puzzle: ' + PZN[game]);
  if (Object.keys(L.d).length >= 3 && P.chestDay !== dk) { P.chestDay = dk; S.chests.push({ id: crypto.randomUUID(), at: Date.now(), day: dk, n: ++S.chestN, status: 'available' }); say('PUZZLE CHEST', 'Three daily puzzles done. A chest waits in Rewards.', 1); }
  return { xp, note };
}
function pzFinish(ok, d) {
  const P = pzS(), g = pz.game; let r = { ok, score: d.score || 0, acc: d.acc, time: d.time, msg: d.msg || '', xp: 0, note: '', art: d.art };
  if (ok) {
    Object.assign(r, pzReward(g, pz.diff, pz.daily)); const k = g + ':' + pz.diff;
    if (!P.best[k] || r.score > P.best[k]) P.best[k] = r.score;
    if (pz.daily) P.daily[today()] = Object.assign(P.daily[today()] || {}, { [g]: 1 });
  }
  P.hist.push({ g, diff: pz.diff, v: pz.variant, daily: pz.daily, ok, score: r.score, acc: d.acc, time: d.time, at: Date.now() }); P.hist = P.hist.slice(-80);
  delete P.resume[g]; pz.stage = 'end'; pz.res = r; pz.st = null; pzStop(); save(); render();
}
const pzBadges = () => { const P = pzS(), h = P.hist.filter(x => x.ok), has = g => h.some(x => x.g === g); return [['Mind Palace', 'Reach N=3 in Dual N-Back', (P.nb.max || 0) >= 3], ['Pixel Collector', 'Collect 5 pixel arts', P.gallery.length >= 5], ['Gallery Master', 'Collect all ' + ARTS.length + ' pixel arts', P.gallery.length >= ARTS.length], ['Grid Master', 'Solve a hard Sudoku', h.some(x => x.g === 'sudoku' && x.diff === 'hard')], ['Cage Breaker', 'Solve a Killer Sudoku', h.some(x => x.v === 'killer')], ['All-Rounder', 'Win each of the 5 games once', Object.keys(PZN).every(has)], ['Daily Devotee', 'Finish 3 daily puzzles in one day', !!P.chestDay]]; };
const pzKeep = () => { if (pz.st && pz.game && pz.game !== 'nback') pzS().resume[pz.game] = { diff: pz.diff, daily: pz.daily, variant: pz.variant, st: pz.st }; };

/* ---------- Dual N-Back ---------- */
const NBF = [262, 294, 330, 349, 392, 440, 494, 523];
function tone(f) { if (pz.st && pz.st.mute) return; try { AC = AC || new AudioContext(); const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime; o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.25 * (S.snd.vol || .6), t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .6); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .65); } catch {} }
function nbStart() {
  const P = pzS(), n = (pz.daily || pz.diff === 'adaptive') ? Math.max(1, P.nb.n) : { easy: 1, medium: 2, hard: 3 }[pz.diff] || 1;
  pz.st = { n, maxN: n, pos: [], snd: [], pm: [], sm: [], nn: [], i: -1, rp: false, rs: false, rec: [], len: pz.daily ? 99999 : 20 + n * 4, t0: Date.now(), endAt: pz.daily ? Date.now() + 300000 : 0, mute: false };
  pz.stage = 'play'; pzStop(); nbT0 = setTimeout(() => { nbTick(); nbT = setInterval(nbTick, 2500); }, 700);
}
function nbScore(s) {
  const i = s.i, n = s.nn[i]; if (i < n) return; let ok = 0, sc = 0;
  for (const [m, p] of [[s.pm[i], s.rp], [s.sm[i], s.rs]]) { if (m && p) { ok++; sc += 10; } else if (!m && !p) { ok++; sc += 1; } else if (!m && p) sc -= 5; }
  s.rec.push({ ok, sc }); const b = document.getElementById('nbbox'); if (b) { b.classList.remove('okfb', 'badfb'); b.classList.add(ok === 2 ? 'okfb' : 'badfb'); }
}
function nbPaint() {
  const s = pz.st; if (!s || s.i < 0) return; for (let k = 0; k < 9; k++) { const c = document.getElementById('nbc' + k); if (c) c.classList.toggle('on', k === s.pos[s.i] && Date.now() - s.shown < 1000); }
  const info = document.getElementById('nbinfo'); if (info) info.textContent = `Trial ${s.i + 1}${s.endAt ? '' : ' of ' + s.len} · N = ${s.n}${s.endAt ? ' · ' + fmtT(Math.max(0, Math.ceil((s.endAt - Date.now()) / 1000))) + ' left' : ''}`;
  for (const [id, v] of [['nbp', s.rp], ['nbs', s.rs]]) { const e = document.getElementById(id); if (e) e.classList.toggle('pressed', v); }
}
function nbTick() {
  const s = pz.st; if (!s || view !== 'pz' || pz.game !== 'nback' || pz.stage !== 'play') return pzStop();
  if (s.i >= 0) nbScore(s);
  if (s.i + 1 >= s.len || (s.endAt && Date.now() >= s.endAt)) return nbEnd();
  if (s.endAt && s.rec.length >= 20 && s.rec.length % 20 === 0 && s.lastAd !== s.rec.length) { s.lastAd = s.rec.length; const l = s.rec.slice(-20), a = l.reduce((x, r) => x + r.ok, 0) / (l.length * 2); if (a >= .85) s.n = Math.min(8, s.n + 1); else if (a < .6) s.n = Math.max(1, s.n - 1); s.maxN = Math.max(s.maxN, s.n); }
  const i = ++s.i, n = s.n, r = Math.random, gen = (arr, k) => { let v; if (i >= n && r() < .3) v = arr[i - n]; else { do v = Math.floor(r() * k); while (i >= n && v === arr[i - n]); } arr.push(v); };
  gen(s.pos, 9); gen(s.snd, 8); s.nn[i] = n; s.pm[i] = i >= n && s.pos[i] === s.pos[i - n]; s.sm[i] = i >= n && s.snd[i] === s.snd[i - n]; s.rp = s.rs = false; s.shown = Date.now();
  const b = document.getElementById('nbbox'); if (b) b.classList.remove('okfb', 'badfb');
  nbPaint(); setTimeout(nbPaint, 1050); tone(NBF[s.snd[i]]);
}
function nbEnd() {
  const s = pz.st, P = pzS(), tot = s.rec.length * 2, ok = s.rec.reduce((x, r) => x + r.ok, 0), acc = tot ? ok / tot : 0, score = Math.max(0, s.rec.reduce((x, r) => x + r.sc, 0)), time = Math.round((Date.now() - s.t0) / 1000);
  P.nb.sessions++; P.nb.acc = Math.round(acc * 100); P.nb.max = Math.max(P.nb.max || 0, s.maxN);
  P.nb.n = pz.daily ? s.n : acc >= .85 ? Math.min(8, s.n + 1) : acc < .6 ? Math.max(1, s.n - 1) : s.n;
  const done = pz.daily ? time >= 290 : s.rec.length >= 10 && acc >= .6;
  pzFinish(done, { score, acc: Math.round(acc * 100), time, msg: `Reached N = ${s.maxN}. ${acc >= .85 ? 'Next session N goes up.' : acc < .6 ? 'Accuracy under 60%: no reward. N goes down next time.' : 'N stays the same.'}` });
}
const nbView = () => `<div class="win"><div class="nbg" id="nbbox">${[...Array(9)].map((_, i) => `<div class="nbc" id="nbc${i}"></div>`).join('')}</div>
  <div class="row" style="justify-content:center"><button class="btn nbp" id="nbp" data-act="pznbp">Position match (A)</button><button class="btn nbp" id="nbs" data-act="pznbs">Sound match (L)</button></div>
  <p class="mute" style="text-align:center" id="nbinfo">Get ready…</p><div class="row" style="justify-content:center"><button class="btn q" data-act="pzmute">Sound ${pz.st.mute ? 'off' : 'on'}</button></div></div>`;

/* ---------- Nonograms ---------- */
const ARTS = [
  { id: 'heart', n: 'Heart', d: 'easy', c: '#ff4d6d', r: ['.#.#.', '#####', '#####', '.###.', '..#..'] }, { id: 'dagger', n: 'Dagger', d: 'easy', c: '#9fe3ff', r: ['..#..', '..#..', '.###.', '..#..', '..#..'] }, { id: 'skull', n: 'Skull', d: 'easy', c: '#e8e8f0', r: ['.###.', '#####', '#.#.#', '.###.', '.#.#.'] },
  { id: 'shield', n: 'Shield', d: 'medium', c: '#3a7bff', r: ['########', '########', '###..###', '##....##', '##....##', '.##..##.', '..####..', '...##...'] }, { id: 'potion', n: 'Potion', d: 'medium', c: '#8b5cff', r: ['..####..', '...##...', '...##...', '..####..', '.######.', '########', '########', '.######.'] }, { id: 'crown', n: 'Crown', d: 'medium', c: '#ffd166', r: ['#..##..#', '##.##.##', '########', '########', '.######.', '########', '########', '........'] },
  { id: 'castle', n: 'Castle', d: 'hard', c: '#7a8aa8', r: ['#.#.##.#.#', '##########', '.########.', '.########.', '.###..###.', '.##....##.', '.##....##.', '.##....##.', '##########', '##########'] }, { id: 'gate', n: 'Dungeon Gate', d: 'hard', c: '#00d9ff', r: ['..######..', '.########.', '##......##', '#........#', '#..####..#', '#..#..#..#', '#..#..#..#', '#..####..#', '#........#', '##########'] }, { id: 'tree', n: 'World Tree', d: 'hard', c: '#38e8a8', r: ['....##....', '...####...', '..######..', '.########.', '..######..', '.########.', '##########', '....##....', '....##....', '...####...'] }];
const nClue = l => { const r = []; let c = 0; for (const x of l) { if (x === 1) c++; else if (c) { r.push(c); c = 0; } } if (c) r.push(c); return r.length ? r : [0]; };
const artGrid = a => a.r.map(r => [...r].map(c => c === '#' ? 1 : 0));
const nonoLines = (a, g) => { const n = a.r.length, A = artGrid(a), rows = [], cols = []; for (let i = 0; i < n; i++) { rows.push(nClue(A[i])); cols.push(nClue(A.map(r => r[i]))); } const gr = i => g.slice(i * n, i * n + n), gc = j => [...Array(n)].map((_, i) => g[i * n + j]); return { rows, cols, rok: rows.map((c, i) => JSON.stringify(nClue(gr(i))) === JSON.stringify(c)), cok: cols.map((c, j) => JSON.stringify(nClue(gc(j))) === JSON.stringify(c)) }; };
function nonoStart() {
  const P = pzS(), rnd = mk(seedFor('nono')), pool = ARTS.filter(a => a.d === pz.diff), fresh = pool.filter(a => !P.gallery.includes(a.id)), src = pz.daily ? pool : (fresh.length ? fresh : pool), a = src[Math.floor(rnd() * src.length)];
  pz.st = { id: a.id, n: a.r.length, g: Array(a.r.length ** 2).fill(0), mode: 'fill', el: 0, chk: '' }; pz.stage = 'play';
}
const artSvg = (a, px) => `<svg viewBox="0 0 ${a.r.length} ${a.r.length}" width="${px}" height="${px}" shape-rendering="crispEdges">${a.r.map((row, y) => [...row].map((c, x) => c === '#' ? `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${a.c}" opacity="${(x + y) % 2 ? 1 : .88}"/>` : '').join('')).join('')}</svg>`;
function nonoSet(i, v) { const s = pz.st; s.g[i] = s.g[i] === v ? 0 : v; s.chk = ''; const a = ARTS.find(x => x.id === s.id), L = nonoLines(a, s.g); if (L.rok.every(Boolean) && L.cok.every(Boolean)) { const n = s.n; if (!pzS().gallery.includes(a.id)) pzS().gallery.push(a.id); pzFinish(true, { score: Math.max(50, BASE[pz.diff] - s.el), time: s.el, acc: 100, art: a.id, msg: `Collected: ${a.n}` }); } }
const nonoView = () => { const s = pz.st, a = ARTS.find(x => x.id === s.id), n = s.n, L = nonoLines(a, s.g), cs = n > 8 ? 26 : n > 5 ? 32 : 40;
  return `<div class="win" style="overflow-x:auto"><div class="row"><button class="btn ${s.mode === 'fill' ? '' : 'q'}" data-act="pznm" data-m="fill">Fill</button><button class="btn ${s.mode === 'mark' ? '' : 'q'}" data-act="pznm" data-m="mark">Mark empty (x)</button><button class="btn q" data-act="pznchk">Check lines</button><button class="btn q" data-act="pznclr">Clear</button><small>${esc(s.chk)}</small></div>
  <div class="ng" style="--n:${n};--cs:${cs}px"><div></div>${L.cols.map((c, j) => `<div class="nclc ${L.cok[j] ? 'ok' : ''}">${c.join('<br>')}</div>`).join('')}${L.rows.map((c, i) => `<div class="nclr ${L.rok[i] ? 'ok' : ''}">${c.join(' ')}</div>${[...Array(n)].map((_, j) => { const v = s.g[i * n + j]; return `<button class="ncell ${v === 1 ? 'f' : v === 2 ? 'x' : ''}" data-act="pznc" data-i="${i * n + j}" aria-label="cell ${i + 1},${j + 1}">${v === 2 ? '×' : ''}</button>`; }).join('')}`).join('')}</div></div>`; };

/* ---------- Sudoku, Killer, Wordoku ---------- */
const SDB = [...Array(81).keys()].map(i => [Math.floor(i / 9), i % 9, Math.floor(i / 27) * 3 + Math.floor(i % 9 / 3)]);
function sdSolve(g, limit, rnd, cg, maxNodes) {
  const rows = Array(9).fill(0), cols = Array(9).fill(0), box = Array(9).fill(0), cu = cg ? cg.cages.map(() => 0) : [], cs = cg ? cg.cages.map(() => 0) : [], ce = cg ? cg.cages.map(c => c.cells.length) : [], a = g.slice();
  let cnt = 0, first = null, nodes = 0;
  const put = (i, d, on) => { const [r, c, b] = SDB[i], m = 1 << d; if (on) { rows[r] |= m; cols[c] |= m; box[b] |= m; } else { rows[r] &= ~m; cols[c] &= ~m; box[b] &= ~m; } if (cg) { const k = cg.of[i]; if (on) { cu[k] |= m; cs[k] += d; ce[k]--; } else { cu[k] &= ~m; cs[k] -= d; ce[k]++; } } };
  for (let i = 0; i < 81; i++) if (a[i]) put(i, a[i], true);
  const cand = i => { const [r, c, b] = SDB[i]; let m = ~(rows[r] | cols[c] | box[b]) & 0x3fe; if (cg) { const k = cg.of[i], rem = cg.cages[k].sum - cs[k]; m &= ~cu[k]; for (let d = 1; d <= 9; d++) if ((m & (1 << d)) && (d > rem || (ce[k] === 1 && d !== rem) || rem - d < ce[k] - 1)) m &= ~(1 << d); } return m; };
  const rec = () => { if (cnt >= limit || nodes++ > maxNodes) return; let bi = -1, bm = 0, bc = 10; for (let i = 0; i < 81; i++) if (!a[i]) { const m = cand(i); let c = 0, x = m; while (x) { c++; x &= x - 1; } if (c < bc) { bc = c; bi = i; bm = m; if (c <= 1) break; } } if (bi < 0) { cnt++; if (!first) first = a.slice(); return; } if (!bc) return; let ds = []; for (let d = 1; d <= 9; d++) if (bm & (1 << d)) ds.push(d); if (rnd) ds = shuf(ds, rnd); for (const d of ds) { a[bi] = d; put(bi, d, true); rec(); put(bi, d, false); a[bi] = 0; if (cnt >= limit) return; } };
  rec(); return { count: cnt, sol: first, aborted: nodes > maxNodes };
}
const WORDS = ['DANGEROUS', 'HYDRAULIC', 'BIRTHDAYS', 'FLOWCHART'];
function sdGen(diff, kind, rnd) {
  const full = sdSolve(Array(81).fill(0), 1, rnd, null, 1e6).sol;
  if (kind !== 'killer') {
    const g = full.slice(), target = { easy: 40, medium: 32, hard: 26 }[diff]; let rem = 81;
    for (const i of shuf([...Array(81).keys()], rnd)) { if (rem <= target) break; const v = g[i]; g[i] = 0; if (sdSolve(g, 2, null, null, 2e5).count !== 1) g[i] = v; else rem--; }
    return { puz: g, sol: full };
  }
  const of = Array(81).fill(-1), cages = [], nbs = i => { const r = Math.floor(i / 9), c = i % 9, o = []; if (r > 0) o.push(i - 9); if (r < 8) o.push(i + 9); if (c > 0) o.push(i - 1); if (c < 8) o.push(i + 1); return o; };
  for (const i of shuf([...Array(81).keys()], rnd)) { if (of[i] >= 0) continue; const k = cages.length, cells = [i], used = new Set([full[i]]); of[i] = k; const want = 1 + Math.floor(rnd() * 4);
    while (cells.length < want) { const opt = cells.flatMap(nbs).filter(x => of[x] < 0 && !used.has(full[x])); if (!opt.length) break; const x = opt[Math.floor(rnd() * opt.length)]; of[x] = k; cells.push(x); used.add(full[x]); }
    cages.push({ cells, sum: cells.reduce((t, x) => t + full[x], 0) }); }
  const cg = { of, cages }, g = Array(81).fill(0), order = shuf([...Array(81).keys()], rnd); let k = 0;
  const first = { easy: 26, medium: 18, hard: 10 }[diff]; for (; k < first; k++) g[order[k]] = full[order[k]];
  while (sdSolve(g, 2, null, cg, 4e5).count !== 1 && k < 81) { g[order[k]] = full[order[k]]; k++; }
  return { puz: g, sol: full, cg };
}
function sdStart() {
  const rnd = mk(seedFor('sudoku')), kind = pz.daily ? 'standard' : pz.variant, o = sdGen(pz.diff, kind, rnd); let word = null, map = null;
  if (kind === 'wordoku') { word = WORDS[Math.floor(rnd() * WORDS.length)]; map = [''].concat(o.sol.slice(36, 45).reduce((m, d, c) => { m[d - 1] = word[c]; return m; }, Array(9).fill(''))); }
  pz.st = { kind, puz: o.puz, sol: o.sol, cur: o.puz.slice(), cg: o.cg || null, word, map, sel: -1, mis: 0, hint: 0, en: 0, el: 0 }; pz.stage = 'play';
}
const sdSym = (s, d) => s.map ? s.map[d] : d;
function sdPlace(d) {
  const s = pz.st, i = s.sel; if (i < 0 || s.puz[i]) return; if (d === 0) { s.cur[i] = 0; return; } if (s.cur[i] === s.sol[i]) return; s.en++; s.cur[i] = d; if (d !== s.sol[i]) { s.mis++; if (s.mis >= 5) return sdEnd(false); } sdDone();
}
function sdDone() { const s = pz.st; if (s.cur.every((v, i) => v === s.sol[i])) sdEnd(true); }
function sdEnd(ok) { const s = pz.st, sc = Math.max(50, { easy: 300, medium: 500, hard: 800 }[pz.diff] + (s.kind === 'killer' ? 150 : s.kind === 'wordoku' ? 100 : 0) - Math.floor(s.el / 2) - s.mis * 30 - s.hint * 50); pzFinish(ok, { score: ok ? sc : 0, time: s.el, acc: s.en ? Math.round((s.en - s.mis) / s.en * 100) : 100, msg: ok ? (s.word ? 'Mystery word: ' + s.word : '') + ` Mistakes ${s.mis}, hints ${s.hint}.` : 'Five mistakes. The puzzle is over, try again.' }); }
const sdView = () => { const s = pz.st, sel = s.sel, sr = sel >= 0 ? SDB[sel] : null, cg = s.cg;
  const cell = i => { const [r, c, b] = SDB[i], v = s.cur[i], cls = ['sd']; if (s.puz[i]) cls.push('fix'); else if (v && v !== s.sol[i]) cls.push('wrong'); if (i === sel) cls.push('sel'); else if (sr && (r === sr[0] || c === sr[1] || b === sr[2])) cls.push('hi'); if (sel >= 0 && v && v === s.cur[sel]) cls.push('same'); if (c % 3 === 0) cls.push('bl'); if (r % 3 === 0) cls.push('bt'); if (c === 8) cls.push('br'); if (r === 8) cls.push('bb');
    let lab = ''; if (cg) { const k = cg.of[i], cc = cg.cages[k]; if (r > 0 && cg.of[i - 9] !== k) cls.push('cT'); if (r < 8 && cg.of[i + 9] !== k) cls.push('cB'); if (c > 0 && cg.of[i - 1] !== k) cls.push('cL'); if (c < 8 && cg.of[i + 1] !== k) cls.push('cR'); if (r === 0) cls.push('cT'); if (r === 8) cls.push('cB'); if (c === 0) cls.push('cL'); if (c === 8) cls.push('cR'); if (Math.min(...cc.cells) === i) lab = `<i class="cs">${cc.sum}</i>`; }
    return `<button class="${cls.join(' ')}" data-act="pzsc" data-i="${i}">${lab}${v ? sdSym(s, v) : ''}</button>`; };
  return `<div class="win"><div class="sdg">${[...Array(81).keys()].map(cell).join('')}</div>
  <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button class="btn" data-act="pzsn" data-d="${d}">${sdSym(s, d)}</button>`).join('')}<button class="btn q" data-act="pzsn" data-d="0">Erase</button><button class="btn q" data-act="pzsh" ${s.hint >= 3 ? 'disabled' : ''}>Hint (${3 - s.hint})</button></div>
  <p class="mute" style="text-align:center">Mistakes ${s.mis}/5 · Hints ${s.hint}/3${s.word ? ' · Mystery word: ' + s.word.length + ' letters (middle row)' : ''}</p></div>`; };

/* ---------- Logic grid ---------- */
const LGC = [{ name: 'People', t: x => x, pool: ['Mia', 'Leo', 'Zoe', 'Kai', 'Ava', 'Sam'] }, { name: 'Pets', t: x => `the ${x} owner`, pool: ['cat', 'dog', 'fox', 'owl', 'rabbit', 'parrot'] }, { name: 'Drinks', t: x => `the ${x} drinker`, pool: ['tea', 'coffee', 'juice', 'milk', 'soda', 'cocoa'] }, { name: 'Colors', t: x => `the ${x} fan`, pool: ['red', 'blue', 'green', 'gold', 'black', 'white'] }];
const lgPerms = n => { const o = [], rec = (a, r) => { if (!r.length) return o.push(a); r.forEach((x, i) => rec(a.concat(x), r.filter((_, j) => j !== i))); }; rec([], [...Array(n).keys()]); return o; };
const lgT = (q, per) => { const r = j => per[q.a][q.i] === per[q.b][j]; return q.t === 'is' ? r(q.j) : q.t === 'not' ? !r(q.j) : r(q.j) || r(q.j2); };
function lgCount(n, K, clues, lim) { const P = lgPerms(n), per = [[...Array(n).keys()]]; let c = 0; const ok = k => clues.every(q => q.a > k || q.b > k || lgT(q, per)), rec = k => { if (c >= lim) return; if (k === K) { c++; return; } for (const p of P) { per[k] = p; if (ok(k)) rec(k + 1); } }; rec(1); return c; }
function lgGen(diff, rnd) {
  const n = diff === 'easy' ? 3 : 4, K = diff === 'hard' ? 4 : 3, cats = LGC.slice(0, K).map(d => ({ name: d.name, k: LGC.indexOf(d), items: shuf(d.pool, rnd).slice(0, n) })), per = cats.map((c, k) => k === 0 ? [...Array(n).keys()] : shuf([...Array(n).keys()], rnd)), pool = [];
  for (let a = 0; a < K; a++) for (let b = a + 1; b < K; b++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const tr = per[a][i] === per[b][j]; pool.push({ t: tr ? 'is' : 'not', a, i, b, j }); if (tr) pool.push({ t: 'or', a, i, b, j, j2: (j + 1 + Math.floor(rnd() * (n - 1))) % n }); }
  let clues = [], cur = lgCount(n, K, clues, 1e6);
  for (const q of shuf(pool, rnd)) { if (cur === 1) break; const c2 = lgCount(n, K, clues.concat(q), 1e6); if (c2 < cur) { clues.push(q); cur = c2; } }
  for (const q of clues.slice()) { const rest = clues.filter(x => x !== q); if (lgCount(n, K, rest, 2) === 1) clues = rest; }
  return { n, K, cats, per, clues: shuf(clues, rnd) };
}
function lgStart() { const g = lgGen(pz.diff, mk(seedFor('logic'))), mx = {}; for (let a = 0; a < g.K; a++) for (let b = a + 1; b < g.K; b++) mx[a + '' + b] = Array(g.n * g.n).fill(0); pz.st = Object.assign(g, { mx, el: 0, hint: 0, chk: 0, bad: [], note: '' }); pz.stage = 'play'; }
const lgTrue = (s, m, idx) => { const a = +m[0], b = +m[1], i = Math.floor(idx / s.n), j = idx % s.n; return s.per[a][i] === s.per[b][j]; };
function lgSet(m, idx, v) { const s = pz.st, M = s.mx[m], n = s.n; M[idx] = v; if (v === 1) { const i = Math.floor(idx / n), j = idx % n; for (let k = 0; k < n; k++) { if (k !== j && !M[i * n + k]) M[i * n + k] = 2; if (k !== i && !M[k * n + j]) M[k * n + j] = 2; } } s.bad = []; s.note = ''; lgDone(); }
function lgDone() { const s = pz.st; if (Object.keys(s.mx).every(m => s.mx[m].every((v, idx) => (v === 1) === lgTrue(s, m, idx)))) pzFinish(true, { score: Math.max(40, BASE[pz.diff] - Math.floor(s.el / 2) - s.chk * 20 - s.hint * 40), time: s.el, acc: Math.max(0, 100 - s.chk * 10), msg: `Wrong checks found: ${s.chk}, hints: ${s.hint}.` }); }
const lgClue = (s, q) => { const D = (a, i) => a === 0 ? s.cats[0].items[i] : LGC[s.cats[a].k].t(s.cats[a].items[i]), up = x => x[0].toUpperCase() + x.slice(1); return up(q.t === 'is' ? `${D(q.a, q.i)} is ${D(q.b, q.j)}.` : q.t === 'not' ? `${D(q.a, q.i)} is not ${D(q.b, q.j)}.` : `${D(q.a, q.i)} is either ${D(q.b, q.j)} or ${D(q.b, q.j2)}.`); };
const lgView = () => { const s = pz.st, n = s.n;
  return `<div class="win"><h3>Clues</h3><ol class="lgl">${s.clues.map(q => `<li>${esc(lgClue(s, q))}</li>`).join('')}</ol></div><div class="lgw">${Object.keys(s.mx).sort().map(m => { const A = s.cats[+m[0]], B = s.cats[+m[1]]; return `<div class="win"><small>${A.name} × ${B.name}</small><table class="lg"><tr><th></th>${B.items.map(x => `<th>${x}</th>`).join('')}</tr>${A.items.map((x, i) => `<tr><th>${x}</th>${B.items.map((_, j) => { const v = s.mx[m][i * n + j]; return `<td><button class="lgc s${v} ${s.bad.includes(m + ':' + (i * n + j)) ? 'bad' : ''}" data-act="pzlc" data-m="${m}" data-i="${i * n + j}" aria-label="${x} / ${B.items[j]}">${v === 1 ? '✓' : v === 2 ? '×' : ''}</button></td>`; }).join('')}</tr>`).join('')}</table></div>`; }).join('')}</div>
  <div class="row"><button class="btn" data-act="pzlk">Check solution</button><button class="btn q" data-act="pzlh">Hint</button><small>${esc(s.note)} Hints ${s.hint} · Wrong checks found ${s.chk}</small></div>`; };

/* ---------- Block puzzle (tangram) ---------- */
const tgNorm = c => { const mr = Math.min(...c.map(x => x[0])), mc = Math.min(...c.map(x => x[1])); return c.map(x => [x[0] - mr, x[1] - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
const tgRot = c => tgNorm(c.map(([r, k]) => [k, -r])), tgFlip = c => tgNorm(c.map(([r, k]) => [r, -k]));
const TGC = ['#3a7bff', '#8b5cff', '#38e8a8', '#ffd166', '#ff4d6d', '#00d9ff', '#ff7a3c'];
function tgGen(diff, rnd) {
  const { W, H, k, cut } = { easy: { W: 4, H: 4, k: 4, cut: 2 }, medium: { W: 5, H: 5, k: 5, cut: 3 }, hard: { W: 6, H: 5, k: 7, cut: 4 } }[diff], cells = new Set([...Array(W * H).keys()]);
  const nb = i => [[0, 1], [1, 0], [0, -1], [-1, 0]].map(([dr, dc]) => [Math.floor(i / W) + dr, i % W + dc]).filter(([r, c]) => r >= 0 && r < H && c >= 0 && c < W).map(([r, c]) => r * W + c);
  const conn = set => { const a = [...set], seen = new Set([a[0]]), q = [a[0]]; while (q.length) { const x = q.pop(); for (const y of nb(x)) if (set.has(y) && !seen.has(y)) { seen.add(y); q.push(y); } } return seen.size === set.size; };
  for (let t = 0, done = 0; t < 80 && done < cut; t++) { const i = Math.floor(rnd() * W * H); if (!cells.has(i) || nb(i).length === 4) continue; cells.delete(i); if (conn(cells)) done++; else cells.add(i); }
  const id = new Map([...cells].map(i => [i, i])), size = new Map([...cells].map(i => [i, 1])); let cnt = cells.size, maxS = Math.ceil(cnt / k) + 1, tries = 0;
  while (cnt > k && tries++ < 8000) { const arr = [...cells], i = arr[Math.floor(rnd() * arr.length)], ns = nb(i).filter(x => cells.has(x)), j = ns[Math.floor(rnd() * ns.length)]; if (j === undefined) continue; const a = id.get(i), b = id.get(j); if (a === b || size.get(a) + size.get(b) > maxS) continue; for (const [x, y] of id) if (y === b) id.set(x, a); size.set(a, size.get(a) + size.get(b)); size.delete(b); cnt--; if (tries > 4000) maxS++; }
  const groups = {}; for (const [i, g] of id) (groups[g] = groups[g] || []).push([Math.floor(i / W), i % W]);
  const pieces = Object.values(groups).map((sol, n) => { let c = tgNorm(sol); for (let r = Math.floor(rnd() * 4); r > 0; r--) c = tgRot(c); if (rnd() < .5) c = tgFlip(c); return { id: n, sol, cells: c, pos: null }; });
  return { W, H, target: [...cells].map(i => [Math.floor(i / W), i % W]), pieces };
}
function tgStart() { pz.st = Object.assign(tgGen(pz.diff, mk(seedFor('tangram'))), { sel: null, el: 0, hint: 0 }); pz.stage = 'play'; }
const tgOcc = (s, skip) => { const m = new Map(); for (const p of s.pieces) if (p.pos && p.id !== skip) for (const [r, c] of p.cells) m.set((r + p.pos[0]) * s.W + c + p.pos[1], p.id); return m; };
const tgCan = (s, p, r0, c0) => { const T = new Set(s.target.map(([r, c]) => r * s.W + c)), O = tgOcc(s, p.id); return p.cells.every(([r, c]) => { const k = (r + r0) * s.W + c + c0; return r + r0 >= 0 && c + c0 >= 0 && c + c0 < s.W && T.has(k) && !O.has(k); }); };
function tgDrop(pid, r, c) { const s = pz.st, p = s.pieces.find(x => x.id === pid); if (!p) return false; for (const [dr, dc] of p.cells) { if (tgCan(s, p, r - dr, c - dc)) { p.pos = [r - dr, c - dc]; s.sel = null; tgDone(); return true; } } return false; }
function tgDone() { const s = pz.st, O = tgOcc(s); if (O.size === s.target.length && s.pieces.every(p => p.pos)) pzFinish(true, { score: Math.max(40, BASE[pz.diff] - Math.floor(s.el / 2) - s.hint * 50), time: s.el, acc: 100, msg: `Hints used: ${s.hint}.` }); }
function tgHint() { const s = pz.st, O = tgOcc(s), p = s.pieces.find(x => !x.pos) || s.pieces.find(x => { const sc = x.sol.map(([r, c]) => r * s.W + c); return !(x.pos && x.cells.every(([r, c]) => sc.includes((r + x.pos[0]) * s.W + c + x.pos[1]))); }); if (!p) return; const mr = Math.min(...p.sol.map(x => x[0])), mc = Math.min(...p.sol.map(x => x[1])); p.cells = tgNorm(p.sol); p.pos = null; for (const q of s.pieces) if (q !== p && q.pos) { const occ = tgOcc(s, q.id); if (p.cells.some(([r, c]) => (r + mr) * s.W + c + mc === -1)) {} } const mine = new Set(p.cells.map(([r, c]) => (r + mr) * s.W + c + mc)); for (const q of s.pieces) if (q !== p && q.pos && q.cells.some(([r, c]) => mine.has((r + q.pos[0]) * s.W + c + q.pos[1]))) q.pos = null; p.pos = [mr, mc]; s.hint++; s.sel = null; tgDone(); }
const tgView = () => { const s = pz.st, O = tgOcc(s), T = new Set(s.target.map(([r, c]) => r * s.W + c)), cs = s.W > 5 ? 44 : 52;
  const mini = p => { const w = Math.max(...p.cells.map(x => x[1])) + 1, h = Math.max(...p.cells.map(x => x[0])) + 1; return `<div class="tgp ${s.sel === p.id ? 'sel' : ''}" data-pid="${p.id}" data-act="pztp" data-id="${p.id}" style="grid-template-columns:repeat(${w},22px);grid-template-rows:repeat(${h},22px)">${p.cells.map(([r, c]) => `<i style="grid-row:${r + 1};grid-column:${c + 1};background:${TGC[p.id % 7]}"></i>`).join('')}</div>`; };
  return `<div class="win"><div class="row"><button class="btn q" data-act="pztr">Rotate (R)</button><button class="btn q" data-act="pztf">Flip (F)</button><button class="btn q" data-act="pzth">Hint</button><small>Hints ${s.hint} · ${s.sel === null ? 'Select a piece' : 'Piece ' + (s.sel + 1) + ' selected'}</small></div>
  <div class="tgb" style="grid-template-columns:repeat(${s.W},${cs}px);grid-template-rows:repeat(${s.H},${cs}px)">${[...Array(s.W * s.H).keys()].map(k => { const r = Math.floor(k / s.W), c = k % s.W, o = O.get(k); return T.has(k) ? `<div class="tgc ${o !== undefined ? 'on' : ''}" data-tc="1" data-r="${r}" data-c="${c}" ${o !== undefined ? `data-pid="${o}"` : ''} data-act="pztc" style="${o !== undefined ? 'background:' + TGC[o % 7] : ''}"></div>` : '<div class="tgn"></div>'; }).join('')}</div>
  <div class="tgt">${s.pieces.filter(p => !p.pos).map(mini).join('') || '<span class="mute">All pieces placed.</span>'}</div></div>`; };

/* ---------- hub, intro, end ---------- */
const pzDaily = g => !!(pzS().daily[today()] || {})[g];
const pzHub = () => { const P = pzS(), L = P.xp[today()] || { total: 0, d: {} }, h = P.hist.slice(-6).reverse();
  return `<h1>Puzzle</h1><div class="win"><h3>Cognitive training</h3><small>Puzzle XP today ${L.total}/40 · Daily puzzles done ${Object.keys(L.d).length}/5 (3 daily puzzles earn a chest). Practice gives XP for the first 2 wins per game each day.</small></div>
  <div class="pzg">${Object.keys(PZN).map(g => { const bs = Object.keys(P.best).filter(k => k.startsWith(g + ':')).map(k => P.best[k]); return `<div class="win"><h3>${PZN[g]}</h3><small>${PZI[g][0]}</small><p class="mute">Best score: ${bs.length ? Math.max(...bs) : '-'}</p><div class="row"><button class="btn" data-act="pzopen" data-g="${g}">Play</button><button class="btn q" data-act="pzdaily" data-g="${g}">Daily ${pzDaily(g) ? '✓' : ''}</button></div></div>`; }).join('')}</div>
  <div class="win"><h3>Puzzle badges</h3><div class="bd">${pzBadges().map(([n, d, on]) => `<div class="win ${on ? '' : 'off'}"><h3>${on ? n : 'Locked'}</h3><small>${d}</small></div>`).join('')}</div></div>
  <div class="win"><h3>Pixel art collection <small>${P.gallery.length}/${ARTS.length}</small></h3><div class="gal">${ARTS.map(a => P.gallery.includes(a.id) ? `<div title="${a.n}">${artSvg(a, 72)}<small>${a.n}</small></div>` : `<div class="off"><div class="gq">?</div><small>${a.d}</small></div>`).join('')}</div></div>
  <div class="win"><h3>Recent</h3>${h.map(x => `<div class="item"><span>${PZN[x.g]} · ${x.daily ? 'daily' : x.diff}${x.v && x.v !== 'standard' ? ' · ' + x.v : ''} <small>${x.ok ? 'won' : 'failed'}${x.acc != null ? ' · accuracy ' + x.acc + '%' : ''}${x.time ? ' · ' + fmtT(x.time) : ''}</small></span><b>${x.score}</b></div>`).join('') || '<span class="mute">No puzzles yet.</span>'}${P.nb.sessions ? `<small>N-Back: current N ${P.nb.n}, best N ${P.nb.max || 1}, last accuracy ${P.nb.acc}%</small>` : ''}</div>`; };
const pzIntro = () => { const g = pz.game, rs = pzS().resume[g], ds = g === 'nback' ? ['easy', 'medium', 'hard', 'adaptive'] : ['easy', 'medium', 'hard'];
  return `<h1>${PZN[g]}${pz.daily ? ' · Daily challenge' : ''}</h1><div class="win"><h3>How to play</h3><p>${PZI[g][1]}</p>${pzHelp(g)}${pz.daily ? '<small>Daily: the same puzzle for everyone today, medium level' + (g === 'nback' ? ', 5 minutes, adaptive N' : '') + '. Bonus XP the first time each day.</small>' : ''}</div>
  <div class="win">${pz.daily ? '' : `<div class="row"><b>Difficulty</b>${ds.map(d => `<button class="btn ${pz.diff === d ? '' : 'q'}" data-act="pzdiff" data-d="${d}">${d}${d === 'adaptive' ? ' (N ' + pzS().nb.n + ')' : ''}</button>`).join('')}</div>${g === 'sudoku' ? `<div class="row"><b>Type</b>${['standard', 'killer', 'wordoku'].map(v => `<button class="btn ${pz.variant === v ? '' : 'q'}" data-act="pzvar" data-v="${v}">${v}</button>`).join('')}</div>` : ''}`}
  <div class="row"><button class="btn" data-act="pzstart">Start</button>${rs ? '<button class="btn q" data-act="pzcont">Continue saved game</button>' : ''}<button class="btn q" data-act="pzback">Back</button></div></div>`; };
const pzEnd = () => { const r = pz.res, a = r.art && ARTS.find(x => x.id === r.art); return `<h1>${PZN[pz.game]}</h1><div class="win ${r.ok ? '' : 'sys'} pzend"><h3>${r.ok ? 'Puzzle complete!' : 'Not this time'}</h3>${a ? `<div class="pop">${artSvg(a, 180)}</div>` : ''}<p>${esc(r.msg || '')}</p><div class="grid"><div class="win"><small>Score</small><span>${r.score}</span></div><div class="win"><small>Time</small><span style="font-size:26px">${r.time != null ? fmtT(r.time) : '-'}</span></div><div class="win"><small>Accuracy</small><span style="font-size:26px">${r.acc != null ? r.acc + '%' : '-'}</span></div><div class="win"><small>XP</small><span>${r.ok ? '+' + r.xp : 0}</span></div></div>${r.note ? `<small>${esc(r.note)}</small>` : ''}<div class="row"><button class="btn" data-act="pzstart">Play again</button><button class="btn q" data-act="pzback">Puzzle hub</button></div></div>`; };
const pzBar = () => `<div class="row" style="justify-content:space-between"><h1 style="margin:0">${PZN[pz.game]} <small>${pz.daily ? 'daily' : pz.diff}${pz.game === 'sudoku' && pz.variant !== 'standard' && !pz.daily ? ' · ' + pz.variant : ''}</small></h1><div class="row"><span class="tag" id="pzclk">${pz.game === 'nback' ? '' : fmtT(pz.st.el)}</span>${pz.game !== 'nback' ? `<button class="btn q" data-act="pzhelp">${pz.help ? 'Hide help' : 'How to play'}</button>` : ''}<button class="btn q" data-act="pzrestart">Restart</button><button class="btn q" data-act="pzexit">Exit</button></div></div>`;
function vPz() { if (pz.stage === 'menu') return pzHub(); if (pz.stage === 'intro') return pzIntro(); if (pz.stage === 'end') return pzEnd(); return pzBar() + (pz.help ? `<div class="win"><h3>How to play</h3>${pzHelp(pz.game)}<small>The timer is paused while this help is open.</small></div>` : '') + ({ nback: nbView, nono: nonoView, sudoku: sdView, logic: lgView, tangram: tgView })[pz.game](); }
function pzBegin() { pzStop(); pz.help = false; ({ nback: nbStart, nono: nonoStart, sudoku: sdStart, logic: lgStart, tangram: tgStart })[pz.game](); }
function pzAfter() { if (view !== 'pz' || pz.stage !== 'play' || !pz.st) return; if (pz.game === 'nback') { if (!nbT && !nbT0) { pz.stage = 'intro'; pzStop(); return render(); } nbPaint(); } }

/* ---------- actions ---------- */
function pzAct(b) {
  const a = b.dataset.act, d = b.dataset, s = pz.st, P = pzS();
  if (a === 'pzopen' || a === 'pzdaily') { pz = { game: d.g, stage: 'intro', diff: a === 'pzdaily' ? 'medium' : 'easy', daily: a === 'pzdaily', variant: 'standard', st: null, res: null }; return true; }
  if (a === 'pzdiff') { pz.diff = d.d; return true; } if (a === 'pzvar') { pz.variant = d.v; return true; }
  if (a === 'pzback') { pzStop(); pz = { game: '', stage: 'menu', diff: 'easy', daily: false, variant: 'standard', st: null, res: null }; return true; }
  if (a === 'pzstart' || a === 'pzrestart') { delete P.resume[pz.game]; pzBegin(); return true; }
  if (a === 'pzcont') { const r = P.resume[pz.game]; if (!r) return true; pz.diff = r.diff; pz.daily = r.daily; pz.variant = r.variant; pz.st = r.st; pz.stage = 'play'; return true; }
  if (a === 'pzexit') { pzKeep(); pzStop(); pz = { game: '', stage: 'menu', diff: 'easy', daily: false, variant: 'standard', st: null, res: null }; return true; }
  if (!s) return false;
  if (a === 'pzhelp') { pz.help = !pz.help; return true; }
  switch (a) {
    case 'pznbp': s.rp = true; nbPaint(); return false; case 'pznbs': s.rs = true; nbPaint(); return false; case 'pzmute': s.mute = !s.mute; return true;
    case 'pznm': s.mode = d.m; break;
    case 'pznc': { const i = +d.i; nonoSet(i, s.mode === 'mark' ? 2 : 1); break; }
    case 'pznchk': { const L = nonoLines(ARTS.find(x => x.id === s.id), s.g); s.chk = `${L.rok.filter(Boolean).length + L.cok.filter(Boolean).length} of ${s.n * 2} lines match their clues.`; break; }
    case 'pznclr': s.g.fill(0); s.chk = ''; break;
    case 'pzsc': s.sel = +d.i; break;
    case 'pzsn': sdPlace(+d.d); break;
    case 'pzsh': { if (s.hint >= 3) break; let i = s.sel >= 0 && !s.puz[s.sel] && s.cur[s.sel] !== s.sol[s.sel] ? s.sel : s.cur.findIndex((v, k) => v !== s.sol[k]); if (i < 0) break; s.cur[i] = s.sol[i]; s.sel = i; s.hint++; sdDone(); break; }
    case 'pzlc': { const M = s.mx[d.m], i = +d.i, v = M[i]; lgSet(d.m, i, v === 0 ? 2 : v === 2 ? 1 : 0); break; }
    case 'pzlk': { s.bad = []; for (const m of Object.keys(s.mx)) s.mx[m].forEach((v, i) => { if (v === 1 && !lgTrue(s, m, i)) s.bad.push(m + ':' + i); }); if (s.bad.length) { s.chk++; s.note = s.bad.length + ' wrong check(s) highlighted.'; } else s.note = 'No wrong checks so far. Keep going.'; break; }
    case 'pzlh': { const opts = []; for (const m of Object.keys(s.mx)) s.mx[m].forEach((v, i) => { if (v !== 1 && lgTrue(s, m, i)) opts.push([m, i]); }); if (opts.length) { const [m, i] = opts[Math.floor(Math.random() * opts.length)]; s.hint++; lgSet(m, i, 1); } break; }
    case 'pztp': s.sel = s.sel === +d.id ? null : +d.id; break;
    case 'pztc': { if (tgSup) { tgSup = false; break; } const r = +d.r, c = +d.c; if (s.sel !== null) { const p = s.pieces.find(x => x.id === s.sel); if (p) { if (p.pos) p.pos = null; if (!tgDrop(p.id, r, c)) s.note = 'Does not fit there.'; } } else if (d.pid !== undefined) { const p = s.pieces.find(x => x.id === +d.pid); if (p) { p.pos = null; s.sel = p.id; } } break; }
    case 'pztr': case 'pztf': { if (s.sel === null) break; const p = s.pieces.find(x => x.id === s.sel); p.pos = null; p.cells = a === 'pztr' ? tgRot(p.cells) : tgFlip(p.cells); break; }
    case 'pzth': tgHint(); break;
    default: return false;
  }
  if (pz.stage === 'play') pzKeep(); return true;
}
/* keyboard, drag-and-drop, timer */
document.addEventListener('keydown', e => {
  if (view !== 'pz' || pz.stage !== 'play' || !pz.st || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; const k = e.key, s = pz.st;
  if (pz.game === 'nback') { if (k === 'a' || k === 'A') { s.rp = true; nbPaint(); } if (k === 'l' || k === 'L') { s.rs = true; nbPaint(); } return; }
  if (pz.game === 'sudoku') { if (/^[1-9]$/.test(k)) sdPlace(+k); else if (k === 'Backspace' || k === 'Delete' || k === '0') sdPlace(0); else if (k.startsWith('Arrow') && s.sel >= 0) { const m = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[k], n = s.sel + m; if (n >= 0 && n < 81 && !(Math.abs(m) === 1 && Math.floor(n / 9) !== Math.floor(s.sel / 9))) s.sel = n; e.preventDefault(); } else if (/^[a-zA-Z]$/.test(k) && s.map) { const d = s.map.findIndex(x => x === k.toUpperCase()); if (d > 0) sdPlace(d); } else return; pzKeep(); save(); render(); return; }
  if (pz.game === 'tangram' && (k === 'r' || k === 'R' || k === 'f' || k === 'F') && s.sel !== null) { const p = s.pieces.find(x => x.id === s.sel); p.pos = null; p.cells = (k === 'r' || k === 'R') ? tgRot(p.cells) : tgFlip(p.cells); pzKeep(); render(); }
});
document.addEventListener('contextmenu', e => { const c = e.target.closest && e.target.closest('.ncell'); if (c && pz.game === 'nono' && pz.st) { e.preventDefault(); nonoSet(+c.dataset.i, 2); pzKeep(); save(); render(); } });
document.addEventListener('pointerdown', e => { if (pz.game !== 'tangram' || pz.stage !== 'play' || !e.target.closest) return; const el = e.target.closest('[data-pid]'); if (el) tgDrag = { id: +el.dataset.pid, x: e.clientX, y: e.clientY, moved: false, g: null }; });
document.addEventListener('pointermove', e => { const D = tgDrag; if (!D) return; if (!D.moved && Math.hypot(e.clientX - D.x, e.clientY - D.y) > 8) { D.moved = true; const p = pz.st.pieces.find(x => x.id === D.id); if (p && p.pos) { p.pos = null; } D.g = document.createElement('div'); D.g.className = 'tgghost'; D.g.style.background = TGC[D.id % 7]; document.body.appendChild(D.g); } if (D.g) { D.g.style.left = e.clientX - 14 + 'px'; D.g.style.top = e.clientY - 14 + 'px'; } });
document.addEventListener('pointerup', e => { const D = tgDrag; tgDrag = null; if (!D) return; if (D.g) D.g.remove(); if (!D.moved) return; tgSup = true; setTimeout(() => { tgSup = false; }, 50); const el = document.elementFromPoint(e.clientX, e.clientY), t = el && el.closest && el.closest('[data-tc]'); if (t && pz.stage === 'play') { const ok = tgDrop(D.id, +t.dataset.r, +t.dataset.c); if (!ok) pz.st.note = 'Does not fit there.'; } pzKeep(); save(); if (pz.stage === 'play') render(); });
setInterval(() => { if (view === 'pz' && pz.stage === 'play' && pz.st && pz.game !== 'nback' && !pz.help) { pz.st.el++; const c = document.getElementById('pzclk'); if (c) c.textContent = fmtT(pz.st.el); if (pz.st.el % 10 === 0) { pzKeep(); save(); } } }, 1000);

GUIDE.splice(GUIDE.findIndex(g => g[0] === 'Puzzle games') + 1, 0, ...Object.keys(PZH).map(g => [PZN[g] + (g === 'tangram' ? ' / Tangram' : '') + ' (how to play)', pzHelp(g)]));
