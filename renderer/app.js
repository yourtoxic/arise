const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DEF = () => ({ xp: 0, quests: [], habits: [], log: {}, penalties: [], ledger: [], feed: [], __done: {}, dg: null, dgDone: '', pz: {}, notif: { sec: 5 }, chat: [], inv: {}, equip: { weapon: '', armor: '', ring: '' }, cos: { frame: '', theme: '', skin: '' }, perks: {}, buffs: { xpQ: 0, focus: false, rest: 0 }, shield: {}, chests: [], chestN: 0, goalDays: {}, usedLog: [], rpAt: 0, shadows: {}, dungeons: 0, dDays: {}, combo: 0, comboAt: 0, firstQ: {}, subXp: {}, fiveXp: {}, allDaily: {}, tickXp: {}, actDays: {}, marshal: false, notes: [], titles: ['Rookie Hunter'], debt: 0, debtMax: 0, pause: {}, shadowOff: 0, review: { needed: false }, reviews: [], dmDone: '', snd: { on: true, vol: .6, style: 'soft' }, ai: { provider: 'gemini', models: {} }, profile: { name: '', goal: '', avatar: '', since: Date.now(), age: '', hobbies: [], heightCm: '', weightKg: '', hu: 'cm', wu: 'kg' }, focusMin: 0, focusLog: {}, act: {}, skills: [],
  cfg: { on: true, grace: 30, remind: 15, daily: 30, weekly: 100, rest: [], pen: { low: 5, medium: 10, high: 15, critical: 0 } } });
const XPQ = { low: 10, medium: 20, high: 35, critical: 50 };
const RECOVERY = { low: 'Work on it for 5 minutes', medium: 'Do a 15-minute restart session', high: 'Split the task into smaller steps', critical: 'Review workload and write a recovery plan' };
const REASONS = { underestimated: 'Underestimated time', overcommit: 'Took on too many tasks', distraction: 'Distraction', unclear: 'Task was unclear', priority: 'Competing priority', illness: 'Illness', emergency: 'Emergency', other: 'Other' };
const EXEMPT = ['illness', 'emergency'], DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ACT = { workout: ['Workout', 'min'], water: ['Water', 'glasses'], steps: ['Steps', 'steps'], sleep: ['Sleep', 'hours'] };
const SOLDIERS = [['Igris', 60, 'M60 8l10 12-4 14 18 10v34l-10 8 6 44H38l6-44-10-8V44l18-10-4-14z M24 64L8 132M96 60l16 80'], ['Beru', 300, 'M60 30c10 0 16 8 14 18l22 14-10 12 10 40-14-10-8 26H46l-8-26-14 10 10-40-10-12 22-14c-2-10 4-18 14-18zM48 28L36 6M72 28L84 6M44 60L20 52'], ['Bellion', 1000, 'M30 10l12 18h36l12-18-4 26 16 16-14 8 6 70H18l6-70-14-8 16-16z M60 28v20']];
const ABIL = { Igris: 'Knight\'s Discipline: dungeon xp +10%', Beru: 'Swarm Speed: quest xp +5%', Bellion: 'Grand Marshal: penalties -25%' };
const has = n => !!S.shadows[n] && Date.now() >= S.shadowOff;
const NAV = [['dash', 'Dashboard', 'M3 11l9-8 9 8v10H3z'], ['quests', 'Quests', 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h4'], ['cal', 'Calendar', 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4'], ['status', 'Status', 'M4 20V10M10 20V4M16 20v-8M22 20H2'], ['skills', 'Skills', 'M12 2l3 7 7 1-5 5 2 7-7-4-7 4 2-7-5-5 7-1z'], ['rewards', 'Rewards', 'M4 8h16v12H4zM12 8v12M4 12h16M8 4h8'], ['inv', 'Inventory', 'M4 7h16v13H4zM9 7V4h6v3'], ['army', 'Shadow Army', 'M12 3c4 0 6 3 6 6l3 3-3 1v8H6v-8l-3-1 3-3c0-3 2-6 6-6z'], ['coach', 'AI Coach', 'M12 3a6 6 0 016 6c0 3-2 4-2 7H8c0-3-2-4-2-7a6 6 0 016-6zM9 20h6'], ['guide', 'Guide', 'M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4zM8 8h8M8 12h6'], ['about', 'About', 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 8v.01'], ['prof', 'Profile', 'M12 4a4 4 0 100 8 4 4 0 000-8zM4 21c0-4 4-6 8-6s8 2 8 6'], ['pz', 'Puzzle', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM17 13a3 3 0 100 6 3 3 0 000-6z'], ['log', 'Quest Log', 'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5'], ['upd', 'Update', 'M12 3v12M7 10l5 5 5-5M4 20h16'], ['set', 'Settings', 'M12 8a4 4 0 100 8 4 4 0 000-8zM3 12h3M18 12h3M12 3v3M12 18v3']];
let shell = null, lastView = null, dgMin = false, dgPrev = 'dash', dgTick = null, dgBusy = false, lqT = null, sig = '', editId = '', rankUp = null, S = DEF(), view = 'dash', timer = null, toast = null, tt;
const p2 = n => String(n).padStart(2, '0'), ds = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
const loc = d => ds(d) + 'T' + p2(d.getHours()) + ':' + p2(d.getMinutes()), today = () => ds(new Date());
const dAgo = n => ds(new Date(Date.now() - n * 864e5)), save = () => window.arise.save(S), cl = n => Math.max(0, Math.min(100, n));
const lvl = xp => { let l = 1, n = 100; while (xp >= n) { xp -= n; l++; n = 100 * l; } return { l, cur: xp, need: n }; };
const rank = l => l < 5 ? 'E' : l < 10 ? 'D' : l < 20 ? 'C' : l < 35 ? 'B' : l < 50 ? 'A' : 'S';
const isRest = d => S.cfg.rest.includes(new Date(d).getDay());
function say(title, body, up) {
  if (!/INPUT/.test(title)) beep(/LEVEL|EXTRACT/.test(title) ? 'up' : /PENALTY|OVERDUE/.test(title) ? 'warn' : /COMPLETE|CLEARED/.test(title) ? 'ok' : 'info');
  S.feed.unshift({ t: Date.now(), title, body }); S.feed.length = Math.min(S.feed.length, 8);
  showToast(title, body, up, 4500);
}
function showToast(title, body, up, ms) { toast = { title, body, up }; render(); clearTimeout(tt); tt = setTimeout(() => { toast = null; paintToast(); }, ms); }
function addXp(amt, reason, raw) {
  const b = lvl(S.xp).l, gain = amt > 0 && !raw; let note = '';
  if (amt > 0 && !raw && hp() < 50) { amt = Math.round(amt * .8); note = ' (injured -20%)'; }
  if (amt > 0) {
    const rep = Math.min(S.debt, raw ? amt : Math.round(amt * .2));
    if (rep) { S.debt -= rep; amt -= rep; S.ledger.push({ t: Date.now(), amt: -rep, reason: 'Debt repayment' }); if (!S.debt) { S.debtMax = 0; say('DEBT CLEARED', 'XP debt repaid.'); } }
    S.xp += amt;
  } else { const take = Math.min(S.xp, -amt); S.xp -= take; S.debt += -amt - take; S.debtMax = Math.max(S.debtMax, S.debt); }
  S.ledger.push({ t: Date.now(), amt, reason: reason + note });
  if (gain) { S.actDays[today()] = 1; if (has('Bellion') && !S.marshal && actStreak() >= 5) { S.marshal = true; say('BADGE UNLOCKED', "Marshal's Week"); } }
  const a = lvl(S.xp).l, ri = x => 'EDCBAS'.indexOf(x);
  if (ri(rank(a)) > ri(rank(b))) { const T = TITLES[rank(a)]; if (!S.titles.includes(T)) S.titles.push(T); rankUp = { from: rank(b), to: rank(a), title: T }; }
  if (a > b) say('LEVEL UP!', `Level ${a}. Rank ${rank(a)}.`, 1);
  checkShadows();
  checkGoals();
}
const hp = () => { const open = S.penalties.filter(p => p.status === 'applied' && p.at >= Date.now() - 7 * 864e5).reduce((a, p) => a - p.xp, 0); return cl(100 - open * 100 / (Math.max(1, S.cfg.weekly / 2) * (eq('armor') === 'hunter_vest' ? 1.25 : 1))); };
function beep(type, force) {
  if (!S.snd.on && !force) return;
  try { AC = AC || new AudioContext(); const seq = { info: [660], start: [523, 784], end: [784, 523], warn: [220, 185], up: [523, 659, 784, 1046], ok: [660, 880] }[type] || [660], w = { soft: 'sine', sharp: 'square', arcade: 'triangle' }[S.snd.style] || 'sine';
    seq.forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * .14; o.type = w; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(S.snd.vol * .25, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .32); }); } catch {}
}
let AC;
function notify(t, b, ty) { const ms = Math.min(10, Math.max(1, +S.notif.sec || 5)) * 1000; beep(ty || 'info'); try { const n = new Notification(t, { body: b, silent: true }); setTimeout(() => { try { n.close(); } catch {} }, ms); } catch {} S.feed.unshift({ t: Date.now(), title: t, body: b }); S.feed.length = Math.min(S.feed.length, 8); showToast(t, b, 0, ms); }
const qState = q => { const n = Date.now(); if (q.status === 'review') return 'overdue'; if (q.status !== 'active') return q.status; if (q.start && n < new Date(q.start).getTime()) return 'upcoming'; if (q.due && n > new Date(q.due).getTime()) return 'overdue'; if (q.start) return 'ACTIVE'; return 'open'; };
const canDo = q => ['ACTIVE', 'open', 'overdue'].includes(qState(q));
const stateTag = q => { const x = qState(q); return ` <span class="tag ${x === 'ACTIVE' ? 'act' : x}">${x}</span>`; };
const todayAct = k => (S.act[today()] || {})[k] || 0;
const todayFocus = () => S.focusLog[today()] || 0;
const sumAct = k => Object.values(S.act).reduce((a, d) => a + (d[k] || 0), 0);
const sumSkill = () => S.skills.reduce((a, s) => a + s.min, 0);

function penaltyTotal(days) {
  const f = Date.now() - days * 864e5;
  return S.penalties.filter(p => p.at >= f && p.status === 'applied' || p.at >= f && p.status === 'resolved').reduce((a, p) => a - p.xp, 0);
}
const SH = [
 { n: 'Tank', tier: 'Soldier', p: 'M60 14c12 0 18 8 18 20s-6 18-18 18-18-8-18-20 6-18 18-18zM30 58h60l8 70H22zM30 58l-14 20M90 58l14 20', req: [['level', 3], ['quests', 5], ['dungeons', 3]], ab: ['Bulwark: all XP penalties -10%.'] },
 { n: 'Iron', tier: 'Soldier', p: 'M44 12h32v30H44zM36 48h48l6 80H30zM20 60l16 8M100 60l-16 8M86 70l22-40', req: [['level', 5], ['quests', 15], ['dungeons', 8], ['streak', 3]], ab: ['Iron Will: each daily quest check-in gives +1 XP.'] },
 { n: 'Kaisel', tier: 'Elite', p: 'M60 40L10 16l14 34-18 20 40-4 14 40 14-40 40 4-18-20 14-34z', req: [['level', 8], ['quests', 30], ['focus', 300], ['streak', 5]], ab: ['Skyborne: the first quest cleared each day gives +5 XP.'] },
 { n: 'Tusk', tier: 'Elite', p: 'M60 14c14 0 22 10 22 24l-6 10H44l-6-10c0-14 8-24 22-24zM44 48l-6 18M76 48l6 18M34 62h52l10 66H24z', req: [['level', 12], ['quests', 50], ['dungeons', 25], ['recov', 1]], ab: ['Arcane Study: skill session XP +20%.'] },
 { n: 'Igris', tier: 'Knight Commander', p: SOLDIERS[0][2], req: [['level', 16], ['quests', 80], ['focus', 1000], ['streak', 7]], ab: ['Discipline: finished dungeon XP +15%.', () => `Knight's Oath: dungeons on 3 days in a row give +10% more. ${oath() ? 'ACTIVE' : 'Not active'}.`, 'Order: finishing a subtask gives +1 XP (max 5 a day).'] },
 { n: 'Beru', tier: 'Marshal', p: SOLDIERS[1][2], req: [['level', 22], ['quests', 150], ['focus', 3000], ['streak', 14], ['badges', 4]], ab: ['Swift: a quest cleared before its deadline gives +10% XP.', () => `Swarm combo: consecutive low-priority quests give +10% each, max +30%. Combo now ${S.combo}.`, 'Ignite: Start for 5 min gives +2 XP (max 3 a day).'] },
 { n: 'Bellion', tier: 'Grand Marshal', p: SOLDIERS[2][2], req: [['level', 30], ['quests', 250], ['focus', 6000], ['streak', 30], ['badges', 6]], ab: ['Command: clearing every daily quest in a day gives +10 XP.', 'Resolve: a recovery dungeon finished within 24 h gives +5 XP.', "Mastery: 5 active days in a row unlock the Marshal's Week badge."] }];
const RL = { level: 'Level', quests: 'Quests cleared', dungeons: 'Dungeons cleared', focus: 'Focus minutes', streak: 'Best daily streak', recov: 'Recoveries done', badges: 'Badges' };
const metrics = () => ({ level: lvl(S.xp).l, quests: S.quests.filter(q => q.status === 'done').length, dungeons: S.dungeons, focus: S.focusMin, streak: Math.max(0, ...S.habits.map(streak)), recov: S.penalties.filter(p => p.status === 'resolved').length, badges: badges().filter(b => b[2]).length });
function checkShadows() {
  const m = metrics();
  SH.forEach((x, i) => { if (S.shadows[x.n] || (i && !S.shadows[SH[i - 1].n])) return; if (x.req.every(([k, t]) => m[k] >= t)) { S.shadows[x.n] = Date.now(); say('SHADOW EXTRACTED', x.n + ' joins your army.', 1); } });
}
const oath = () => has('Igris') && !!S.dDays[dAgo(1)] && !!S.dDays[dAgo(2)];
const actStreak = () => { let n = 0, i = S.actDays[today()] ? 0 : 1; for (; S.actDays[dAgo(i)]; i++) n++; return n; };
function beruMul(q, late) {
  if (q.priority === 'low') { S.combo = S.comboAt && Date.now() - S.comboAt < 864e5 ? S.combo + 1 : 1; S.comboAt = Date.now(); } else S.combo = 0;
  if (!has('Beru')) return 1;
  const early = !late && q.due && Date.now() < new Date(q.due).getTime();
  return (early ? 1.1 : 1) * (1 + Math.min(Math.max(S.combo - 1, 0), 3) * .1);
}
const ITEMS = {
  recovery_potion: { n: 'Recovery Potion', t: 'consumable', r: 'epic', d: 'Cancels your most recent open penalty and refunds its XP. Once per week.' },
  xp_elixir: { n: 'XP Elixir', t: 'consumable', r: 'rare', d: '+20% XP on your next 3 quests.' },
  focus_elixir: { n: 'Focus Elixir', t: 'consumable', r: 'rare', d: '+50% XP on your next completed dungeon.' },
  rest_scroll: { n: 'Rest Scroll', t: 'consumable', r: 'rare', d: 'Protects one missed daily-quest day: streak kept, no -2 XP.' },
  dagger: { n: 'Hunter Dagger', t: 'weapon', r: 'common', d: '+10% XP on low-priority (quick) quests.' },
  shadow_blade: { n: 'Shadow Blade', t: 'weapon', r: 'epic', d: '+8% XP from dungeons.' },
  hunter_vest: { n: 'Hunter Vest', t: 'armor', r: 'common', d: 'Max HP +25%: penalties lower HP less.' },
  knight_plate: { n: 'Knight Plate', t: 'armor', r: 'epic', d: 'Penalties -5%.' },
  ring_haste: { n: 'Ring of Haste', t: 'ring', r: 'rare', d: '+5% XP when a quest is cleared before its deadline.' },
  ring_focus: { n: 'Ring of Focus', t: 'ring', r: 'rare', d: '+10% XP from skill sessions.' },
  frame_cyan: { n: 'Cyan Frame', t: 'frame', r: 'common', d: 'Avatar frame. Looks only.' }, frame_gold: { n: 'Gold Frame', t: 'frame', r: 'epic', d: 'Avatar frame. Looks only.' },
  theme_crimson: { n: 'Crimson Theme', t: 'theme', r: 'rare', d: 'App colors. Looks only.' }, theme_emerald: { n: 'Emerald Theme', t: 'theme', r: 'rare', d: 'App colors. Looks only.' },
  skin_ember: { n: 'Ember Shadows', t: 'skin', r: 'rare', d: 'Shadow silhouette colors. Looks only.' }, skin_frost: { n: 'Frost Shadows', t: 'skin', r: 'rare', d: 'Shadow silhouette colors. Looks only.' },
  title_delver: { n: 'Dungeon Delver', t: 'title', r: 'common', d: 'A title. Looks only.' }, title_unyielding: { n: 'The Unyielding', t: 'title', r: 'epic', d: 'A title. Looks only.' } };
const TYPE = { consumable: 'Consumable', weapon: 'Equipment: weapon', armor: 'Equipment: armor', ring: 'Equipment: ring', frame: 'Cosmetic: frame', theme: 'Cosmetic: theme', skin: 'Cosmetic: shadow skin', title: 'Cosmetic: title' }, RAR = { common: 'Common', rare: 'Rare', epic: 'Epic' };
const SK = [{ id: 'power', st: 'STR', n: 'Power Strike', d: '+10% XP on high and critical quests.', s: 2, l: 5 }, { id: 'sprint', st: 'AGI', n: 'Sprint', d: '+5% XP when a quest is cleared before its deadline.', s: 3, l: 3 },
  { id: 'study', st: 'INT', n: 'Study Focus', d: '+10% XP from skill sessions.', s: 3, l: 4 }, { id: 'endure', st: 'VIT', n: 'Endure', d: 'Penalties -5%.', s: 2, l: 5 },
  { id: 'windy', st: 'VIT', n: 'Second Wind', d: 'Recovery dungeons 20% shorter (min 3).', s: 6, l: 10 }, { id: 'sense', st: 'PER', n: 'Sense', d: 'Warning 30 minutes before any quest deadline.', s: 2, l: 4 }];
const skill = id => !!S.perks[id], eq = slot => S.equip[slot] || '', statMap = () => Object.fromEntries(stats().map(x => [x[0], x[1]]));
const extraQ = (q, late) => { let m = 1; const early = !late && q.due && Date.now() < new Date(q.due).getTime();
  if (early && skill('sprint')) m *= 1.05; if (early && eq('ring') === 'ring_haste') m *= 1.05;
  if (['high', 'critical'].includes(q.priority) && skill('power')) m *= 1.1; if (q.priority === 'low' && eq('weapon') === 'dagger') m *= 1.1;
  if (S.buffs.xpQ > 0) { m *= 1.2; S.buffs.xpQ--; } return m; };
const dunMul = () => { let m = eq('weapon') === 'shadow_blade' ? 1.08 : 1; if (S.buffs.focus) { m *= 1.5; S.buffs.focus = false; } return m; };
const penMul = () => (has('Tank') ? .9 : 1) * (skill('endure') ? .95 : 1) * (eq('armor') === 'knight_plate' ? .95 : 1);
const skMul = () => (has('Tusk') ? 1.2 : 1) * (skill('study') ? 1.1 : 1) * (eq('ring') === 'ring_focus' ? 1.1 : 1);
const goals = () => [['Clear all daily quests', S.habits.length > 0 && S.habits.every(h => (S.log[today()] || []).includes(h.id))], ['Clear 1 quest', S.quests.some(q => q.doneAt && new Date(q.doneAt).toDateString() === new Date().toDateString())], ['Finish 1 dungeon', !!S.dDays[today()]]];
function checkGoals() { if (S.goalDays[today()] || !goals().every(g => g[1])) return; S.goalDays[today()] = 1; S.chests.push({ id: crypto.randomUUID(), at: Date.now(), day: today(), n: ++S.chestN, status: 'available' }); say('DAILY GOALS COMPLETE', 'A reward chest is waiting in Rewards.'); }
const CONS = ['xp_elixir', 'focus_elixir', 'rest_scroll', 'xp_elixir', 'recovery_potion', 'focus_elixir', 'rest_scroll'], EQS = ['dagger', 'hunter_vest', 'ring_haste', 'knight_plate', 'ring_focus', 'shadow_blade'], COSS = ['frame_cyan', 'theme_crimson', 'title_delver', 'skin_ember', 'frame_gold', 'theme_emerald', 'title_unyielding', 'skin_frost'];
function addItem(id) { const it = ITEMS[id]; if (it.t === 'consumable') { S.inv[id] = (S.inv[id] || 0) + 1; return true; } if (S.inv[id]) return false; S.inv[id] = 1; if (it.t === 'title' && !S.titles.includes(it.n)) S.titles.push(it.n); return true; }
function openChest(c) {
  if (!c || c.status !== 'available') return null;
  const n = c.n, got = [], add = id => { if (addItem(id)) got.push(id); else { addItem('xp_elixir'); got.push('xp_elixir'); } };
  add(CONS[(n - 1) % CONS.length]); if (n % 3 === 0) add(EQS[(n / 3 - 1) % EQS.length]); if (n % 5 === 0) add(COSS[(n / 5 - 1) % COSS.length]);
  c.status = 'opened'; c.items = got; c.openedAt = Date.now(); return got;
}
function useItem(id) {
  const it = ITEMS[id]; if (!it || it.t !== 'consumable' || !(S.inv[id] > 0)) return say('CANNOT USE', 'You do not have this item.');
  if (!confirm(it.n + ': ' + it.d + '\n\nUse it now?')) return;
  if (id === 'recovery_potion') { if (S.rpAt >= weekStart()) return say('LIMIT REACHED', 'One Recovery Potion per week.'); const p = S.penalties.filter(x => x.status === 'applied').pop(); if (!p) return say('NO PENALTY', 'No open penalty to cancel.');
    p.status = 'reversed'; p.audit = 'Recovery Potion ' + new Date().toLocaleString(); addXp(-p.xp, 'Recovery Potion: ' + p.title, true); if (['high', 'critical'].includes(p.level)) S.shadowOff = 0; S.rpAt = Date.now(); }
  else if (id === 'xp_elixir') { if (S.buffs.xpQ > 0) return say('ALREADY ACTIVE', 'XP Elixir is running.'); S.buffs.xpQ = 3; }
  else if (id === 'focus_elixir') { if (S.buffs.focus) return say('ALREADY ACTIVE', 'Focus Elixir is running.'); S.buffs.focus = true; }
  else if (id === 'rest_scroll') { if (S.buffs.rest > 0) return say('ALREADY ACTIVE', 'A Rest Scroll is waiting for a missed day.'); S.buffs.rest = 1; }
  S.inv[id]--; S.usedLog.push({ id, at: Date.now() }); say('ITEM USED', it.n);
}
let inspect = '';
const itemCard = (id, btns) => { const it = ITEMS[id]; return `<div class="win it r-${it.r}"><b>${it.n}</b> <small>${RAR[it.r]} · ${TYPE[it.t]}${it.t === 'consumable' ? ' · x' + (S.inv[id] || 0) : ''}</small><p>${it.d}</p><div class="row">${btns}</div></div>`; };
const skillTree = () => { const m = statMap(), L = lvl(S.xp).l; return ['STR', 'AGI', 'INT', 'VIT', 'PER'].map(st => `<div class="win"><h3>${st} <small>${m[st]}</small></h3>${SK.filter(k => k.st === st).map(k => { const un = !!S.perks[k.id], ok = m[st] >= k.s && L >= k.l;
  return `<div class="item ${un || ok ? '' : 'dim'}"><span><b>${k.n}</b> ${un ? '· unlocked' : ''}<br><small>${k.d}</small><br><small>Needs ${st} ${m[st]}/${k.s} · Level ${L}/${k.l}</small></span>${un ? '' : `<button class="btn ${ok ? '' : 'q'}" data-act="unlk" data-id="${k.id}" ${ok ? '' : 'disabled'}>Unlock</button>`}</div>`; }).join('')}</div>`).join(''); };
const goalsCard = () => `<div class="win"><h3>Daily goals <small>${goals().filter(x => x[1]).length}/3</small></h3>${goals().map(([l, d]) => `<small>${d ? '● ' : '○ '}${l}</small>`).join('<br>')}<br><small>Finish all 3 for a chest. <a href="#" data-go="rewards">Rewards</a></small></div>`;
const mdHtml = t => {
  let h = esc(t).replace(/```([\s\S]*?)```/g, (_, c) => `<pre>${c}</pre>`).replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*\n]*)\*/g, '$1<i>$2</i>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<span class="lnk">$1 ($2)</span>');
  const out = []; let list = '';
  h.split('\n').forEach(l => { let m;
    if ((m = l.match(/^\s*[-*]\s+(.*)/))) { if (list !== 'ul') { out.push(list ? `</${list}>` : '', '<ul>'); list = 'ul'; } out.push(`<li>${m[1]}</li>`); }
    else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { out.push(list ? `</${list}>` : '', '<ol>'); list = 'ol'; } out.push(`<li>${m[1]}</li>`); }
    else { if (list) { out.push(`</${list}>`); list = ''; } const hm = l.match(/^#{1,4}\s+(.*)/); out.push(hm ? `<h4>${hm[1]}</h4>` : l.trim() ? `<p>${l}</p>` : ''); } });
  if (list) out.push(`</${list}>`); return out.join('');
};
const chatBox = () => `<div class="win"><div class="chat" id="chatlog">${S.chat.map(m => `<div class="msg ${m.role}">${m.role === 'user' ? esc(m.text).replace(/\n/g, '<br>') : mdHtml(m.text)}</div>`).join('') || '<span class="mute">Ask anything about your progress. Examples: How many penalties do I have? Review my weekly performance. What should I prioritize today? Plan my overdue quests.</span>'}</div>
  <div class="row"><textarea id="cin" rows="2" placeholder="Ask AI Coach… (Enter sends, Shift+Enter new line)" class="cinp"></textarea><button class="btn" data-act="csend">Send</button><button class="btn q" data-act="cclear">Clear chat</button></div></div>`;
function chatCtx(q) {
  const t = q.toLowerCase(), L = lvl(S.xp), any = re => re.test(t), all = any(/analy|review|overall|everything|summar|week|prioriti|today|improv|behind|suggest|plan|advice|recommend|status|progress|perform/);
  const want = re => all || any(re), D = n => [...Array(n)].map((_, i) => dAgo(i)), act = S.quests.filter(x => x.status === 'active'), od = S.quests.filter(x => x.status === 'review' || (x.status === 'active' && x.due && Date.now() > new Date(x.due).getTime()));
  const sec = [`CORE: name ${S.profile.name || 'Hunter'}; rank ${rank(L.l)}; title ${S.profile.title || TITLES[rank(L.l)]}; level ${L.l}; xp ${S.xp} (${L.cur}/${L.need} to next level); HP ${Math.round(hp())}%${hp() < 50 ? ' (Injured: all XP gains -20%)' : ''}; XP debt ${S.debt}; weekly review needed: ${S.review.needed}; shadows weakened: ${Date.now() < S.shadowOff}; now ${new Date().toLocaleString()}.`];
  if (want(/quest|task|pending|overdue|complete|due|deadline|schedul|remind|active|todo|done/)) {
    const today0 = new Date().toDateString(), doneT = S.quests.filter(x => x.doneAt && new Date(x.doneAt).toDateString() === today0).length;
    sec.push(`QUESTS: completed today ${doneT}; total cleared ${S.quests.filter(x => x.status === 'done').length}; pending (active or awaiting review) ${act.length + S.quests.filter(x => x.status === 'review').length}; overdue ${od.length}.\n` + (act.concat(S.quests.filter(x => x.status === 'review')).slice(0, 25).map(x => `- ${x.title} | ${x.priority} | stake x${x.stake || 1} | start ${x.start || '-'} | due ${x.due || '-'} | ${qState(x)} | subtasks ${(x.subs || []).filter(y => y.d).length}/${(x.subs || []).length}`).join('\n') || '- none'));
  }
  if (want(/daily|habit|streak|goal|chest|reward|paus/)) sec.push(`DAILY: ${S.habits.map(h => `${h.title} (streak ${streak(h)}${paused(h, today()) ? ', paused' : ''}, today ${(S.log[today()] || []).includes(h.id) ? 'done' : 'not done'})`).join('; ') || 'no daily quests'}. Daily goals today: ${goals().map(g => `${g[0]} ${g[1] ? 'done' : 'not done'}`).join('; ')}. Chests waiting ${S.chests.filter(c => c.status === 'available').length}.`);
  if (want(/penalt|hp|xp|debt|lose|lost|why|recover|injur|cap|review|fall|behind|rule|how/)) {
    sec.push(`PENALTIES: open ${S.penalties.filter(x => x.status === 'applied').length}; ` + S.penalties.filter(x => x.status === 'applied').map(x => `${x.title} (${x.level}, ${x.xp} xp, reason ${x.reason}, recovery ${x.recovery ? x.recovery.min : '?'} min)`).join('; ') + `. XP lost to penalties in last 7 days ${penaltyTotal(7)} of weekly cap ${S.cfg.weekly}; daily cap ${S.cfg.daily}; penalty misses this calendar week ${weekMisses()}; recoveries completed ${S.penalties.filter(x => x.status === 'resolved').length}; reversed ${S.penalties.filter(x => x.status === 'reversed').length}; penalties enabled ${S.cfg.on}; grace ${S.cfg.grace} min.\nRECENT XP LEDGER: ` + S.ledger.slice(-15).map(x => `${x.amt > 0 ? '+' : ''}${x.amt} ${x.reason}`).join('; '));
    sec.push('RULES: HP falls when penalties are open (open penalty XP vs half the weekly cap); below 50% HP all XP gains are -20%; finishing the recovery dungeon resolves a penalty and restores HP. Repeat misses in a calendar week multiply penalties x1.5 then x2. Missed daily quest = -2 XP. Penalty beyond 0 XP becomes XP debt; 20% of new XP repays it.');
  }
  if (want(/focus|dungeon|session|study|week|perform|time|productiv/)) sec.push(`FOCUS: dungeons cleared ${S.dungeons}; focus minutes today ${todayFocus()}, last 7 days ${D(7).reduce((a, d) => a + (S.focusLog[d] || 0), 0)}, total ${S.focusMin}. Last 7 days (date: quests cleared, focus min, daily checks): ` + D(7).map(d => `${d}: ${S.quests.filter(x => x.doneAt && ds(new Date(x.doneAt)) === d).length}, ${S.focusLog[d] || 0}, ${(S.log[d] || []).length}`).join(' | '));
  if (want(/shadow|army|soldier|unlock|bonus|igris|beru|bellion|tank|iron|kaisel|tusk/)) { const m = metrics(); sec.push('SHADOWS: unlocked ' + (SH.filter(x => S.shadows[x.n]).map(x => x.n).join(', ') || 'none') + (Date.now() < S.shadowOff ? ' (bonuses weakened until ' + new Date(S.shadowOff).toLocaleString() + ')' : '') + '. Next: ' + (() => { const n = SH.find(x => !S.shadows[x.n]); return n ? `${n.n} needs ${n.req.map(([k, v]) => `${RL[k]} ${Math.min(m[k], v)}/${v}`).join(', ')}` : 'all unlocked'; })() + '. Bonuses: ' + SH.filter(x => S.shadows[x.n]).map(x => `${x.n}: ${x.ab.map(a => typeof a === 'function' ? a() : a).join(' ')}`).join(' | ')); }
  if (want(/inventory|item|reward|equip|weapon|armor|ring|skill|potion|elixir|scroll|chest|cosmetic/)) sec.push(`ITEMS: ${Object.entries(S.inv).filter(([, n]) => n > 0).map(([k, n]) => `${ITEMS[k] ? ITEMS[k].n : k} x${n}`).join(', ') || 'none'}; equipped weapon ${eq('weapon') || 'none'}, armor ${eq('armor') || 'none'}, ring ${eq('ring') || 'none'}; skills unlocked ${SK.filter(k => S.perks[k.id]).map(k => k.n).join(', ') || 'none'}; active buffs XP Elixir quests left ${S.buffs.xpQ}, Focus Elixir ${S.buffs.focus}, Rest Scroll ${S.buffs.rest}; recently used ${S.usedLog.slice(-5).map(u => ITEMS[u.id] ? ITEMS[u.id].n : u.id).join(', ') || 'none'}.`);
  if (want(/activity|workout|water|sleep|steps|health/)) sec.push(`ACTIVITY today: ${Object.entries(ACT).map(([k, [n, u]]) => `${n} ${todayAct(k)} ${u}`).join(', ')}; last 7 days workout ${D(7).reduce((a, d) => a + ((S.act[d] || {}).workout || 0), 0)} min.`);
  if (any(/\bage\b|hobby|hobbies|height|weight|profile|about me|who am i/)) { const P = S.profile; sec.push(`PROFILE: age ${P.age || 'not set'}; hobbies ${(P.hobbies || []).join(', ') || 'not set'}; height ${hFmt(P) || 'not set'}; weight ${wFmt(P) || 'not set'}; goal ${P.goal || 'not set'}. Do not give medical advice.`); }
  return sec.join('\n\n');
}
async function sendChat() {
  const el = document.getElementById('cin'), txt = ((el && el.value) || '').trim(); if (!txt || busy) return;
  S.chat.push({ role: 'user', text: txt, at: Date.now() }); S.chat = S.chat.slice(-40); busy = true; coach = null; if (el) el.value = ''; save(); render();
  const r = await window.arise.chat(prov(), model(), chatCtx(txt), S.chat.slice(-12).map(m => ({ role: m.role, content: m.text }))); busy = false;
  if (r.ok) S.chat.push({ role: 'assistant', text: r.text, at: Date.now() }); else coach = { err: r.error };
  save(); render();
}
const editRow = q => `<div class="row" style="margin-left:14px"><label>Start <input id="es" type="datetime-local" value="${esc(q.start || '')}"></label><label>End <input id="ee" type="datetime-local" value="${esc(q.due || '')}"></label><label>Remind <input id="er" type="number" min="0" max="1440" value="${q.remind !== undefined ? q.remind : S.cfg.remind}" style="width:70px"> min</label><button class="btn" data-act="saveq" data-id="${q.id}">Save</button><button class="btn q" data-act="cancelq">Cancel</button></div>`;
const hFmt = P => { if (!P.heightCm) return ''; if (P.hu === 'ft') { const i = Math.round(P.heightCm / 2.54); return `${Math.floor(i / 12)} ft ${i % 12} in`; } return `${P.heightCm} cm`; };
const wFmt = P => !P.weightKg ? '' : P.wu === 'lb' ? `${(P.weightKg * 2.20462).toFixed(1)} lb` : `${P.weightKg} kg`;
function parseAbout(f, P) {
  const out = {}, n = x => (x === '' || x == null ? null : Number(x));
  const age = n(f.age); if (age !== null) { if (!Number.isInteger(age) || age < 5 || age > 120) return { err: 'Age must be a whole number from 5 to 120.' }; out.age = age; } else out.age = '';
  if (f.hu === 'ft') { const ft = n(f.h1), inch = n(f.h2) || 0; if (ft !== null) { if (!(ft >= 1 && ft <= 8) || !(inch >= 0 && inch < 12)) return { err: 'Height: feet 1 to 8 and inches 0 to 11.' }; out.heightCm = Math.round((ft * 30.48 + inch * 2.54) * 10) / 10; } else out.heightCm = ''; }
  else { const c = n(f.h1); if (c !== null) { if (!(c >= 50 && c <= 260)) return { err: 'Height must be 50 to 260 cm.' }; out.heightCm = Math.round(c * 10) / 10; } else out.heightCm = ''; }
  const w = n(f.w); if (w !== null) { const kg = f.wu === 'lb' ? w / 2.20462 : w; if (!(kg >= 10 && kg <= 400)) return { err: 'Weight must be 10 to 400 kg (22 to 880 lb).' }; out.weightKg = Math.round(kg * 10) / 10; } else out.weightKg = '';
  out.hu = f.hu === 'ft' ? 'ft' : 'cm'; out.wu = f.wu === 'lb' ? 'lb' : 'kg'; return { data: out };
}
const aboutBlock = () => { const P = S.profile, hi = P.hu === 'ft' ? Math.round((P.heightCm || 0) / 2.54) : 0;
  return `<div class="win"><h3>About you</h3><div class="grid"><div class="win"><small>Age</small><span>${P.age || '-'}</span></div><div class="win"><small>Height</small><span style="font-size:24px">${hFmt(P) || '-'}</span></div><div class="win"><small>Weight</small><span style="font-size:24px">${wFmt(P) || '-'}</span></div></div>
  <div class="row"><small>Hobbies</small>${(P.hobbies || []).map((h, i) => `<span class="chipx">${esc(h)} <button class="btn q" data-act="delhob" data-id="${i}" title="Remove">x</button></span>`).join('') || '<span class="mute">none yet</span>'}</div>
  <div class="row"><label>Age <input id="pa" type="number" min="5" max="120" value="${P.age || ''}" style="width:70px"></label>
  <label>Height <select id="phu"><option value="cm" ${P.hu !== 'ft' ? 'selected' : ''}>cm</option><option value="ft" ${P.hu === 'ft' ? 'selected' : ''}>ft / in</option></select></label>
  <input id="ph1" type="number" step="any" placeholder="${P.hu === 'ft' ? 'ft' : 'cm'}" value="${P.heightCm ? (P.hu === 'ft' ? Math.floor(hi / 12) : P.heightCm) : ''}" style="width:80px">${P.hu === 'ft' ? `<input id="ph2" type="number" step="any" placeholder="in" value="${P.heightCm ? hi % 12 : ''}" style="width:70px">` : ''}
  <label>Weight <select id="pwu"><option value="kg" ${P.wu !== 'lb' ? 'selected' : ''}>kg</option><option value="lb" ${P.wu === 'lb' ? 'selected' : ''}>lb</option></select></label>
  <input id="pw" type="number" step="any" value="${P.weightKg ? (P.wu === 'lb' ? (P.weightKg * 2.20462).toFixed(1) : P.weightKg) : ''}" style="width:90px"><button class="btn" data-act="saveabout">Save</button></div>
  <div class="row"><input id="phb" placeholder="Add a hobby" maxlength="30" size="20"><button class="btn q" data-act="addhob">Add hobby</button></div>
  <small>All fields are optional and stay on this computer. They are only shown to the AI Coach if you ask about them. Not medical advice.</small></div>`; };
let guideQ = '';
const GUIDE = [
['Start here','<p>ARISE turns real tasks into quests. Do work, earn XP, level up, rank E to S. Everything saves on this computer.</p><ol><li>Quests: add a quest with a start and end time.</li><li>Dashboard: add a daily quest and check it in.</li><li>Shadow Army: run a dungeon (focus timer).</li><li>Status: look at your 7-day charts.</li></ol><p>Example: Study circuit analysis, start 7:00 PM, end 8:00 PM, remind 10 min.</p>'],
['Quest creation and scheduling','<ol><li>Quests tab: type a title.</li><li>Pick Start and End. Click the field to open the calendar and time picker, or type the value. End must be after start.</li><li>Priority sets XP: low 10, medium 20, high 35, critical 50.</li><li>Repeat: one time, daily or weekly. A new copy appears when you finish one.</li><li>Stake: safe x1, bold x1.5, risky x2. The line under the form shows the reward and the possible loss before you accept.</li><li>Daily quest link: pick a daily quest so a medium or higher penalty can pause its streak.</li></ol><p>Use Edit on an active quest to change start, end or reminder. Delete asks for confirmation. Subtasks break a big quest into steps.</p>'],
['Custom reminders','<p>Type any number of minutes from 0 to 1440 in the Remind box (0 means no reminder). You get "Your [quest] is starting soon!" before the start and "Your [quest] is ending soon!" before the end. Each reminder fires once. Edit a quest to re-arm its reminders.</p><p>Reminders work only while ARISE is open. If you create a quest already inside its reminder window, the reminder fires right away.</p>'],
['Notification time and sound','<p>Settings, Notification sounds: choose how long reminder popups stay visible, 1 to 10 seconds. This only controls the popup, never the quest times. The popup is shown inside ARISE and the desktop notification is closed after the same time where the system allows it. A sound plays with each reminder. Use Test notification to try it.</p>'],
['Quest status and ACTIVE','<p>Upcoming: before the start time. ACTIVE (glowing tag): from the start time until the end time. Overdue: after the end time and not finished; after the grace period the overdue review opens. Done quests never show ACTIVE. Status updates by itself about every 10 seconds, also across midnight. Quests without a start time never show ACTIVE.</p><p>The Complete button appears only while a quest is ACTIVE (or has no start time). Before the start time it shows UPCOMING and cannot be completed. A quest is completed once: the button disappears, a COMPLETED tag shows, and XP is paid only one time. The check is repeated by the app core, so repeated or simultaneous clicks do not add XP.</p>'],
['Daily quests and daily goals','<p>Dashboard, Daily quests: each check-in gives +5 XP. A daily quest not checked by day end costs -2 XP (rest days skipped).</p><p>Daily goals: clear all daily quests, clear 1 quest, finish 1 dungeon. Finish all 3 to earn 1 chest per day (see Rewards).</p>'],
['Dungeons (focus timer)','<p>Shadow Army tab, pick minutes, Enter dungeon. Finishing gives XP of minutes divided by 2 and counts as a dungeon. Leaving early gives nothing. "Start for 5 min" on a quest opens a 5-minute dungeon.</p><p>Starting a dungeon opens the full-screen Dungeon Gate inside the app window with a large timer and ACTIVE status. Minimize (or Esc) keeps the timer running in a small pill at the top right, click it to return. Leave gate asks for confirmation and gives no reward. When the time ends the gate closes by itself and you return to the screen you were on. A quick refresh resumes the same dungeon; if ARISE stays closed for more than 15 seconds the dungeon is cancelled without reward. The reward is paid only once.</p>'],
['XP, HP and ranks','<p>Late completion gives half XP. After 8 quests in a day XP is halved. Level needs 100 x level XP. Ranks: E under level 5, D under 10, C under 20, B under 35, A under 50, S from 50.</p><p>HP shows discipline. Open penalties lower it. Below 50% you are an Injured Hunter and all XP gains are -20% until you recover.</p>'],
['Penalties and recovery','<ol><li>Deadline passes, then the grace period (default 30 min).</li><li>Quests tab shows "Task overdue, choose your next step": mark done late, reschedule, drop, or say not done and pick a reason.</li><li>Illness and emergency give no penalty. Distraction costs more, underestimated time, unclear task and too many tasks cost less.</li><li>Penalty = base x stake x repeat multiplier (2nd miss in a week x1.5, 3rd x2) x reason weight, always inside the daily and weekly caps. One penalty per quest.</li><li>Start the recovery dungeon (5 or 15 minutes) and finish it fully to resolve the penalty and restore HP. The Recovery button alone does nothing.</li><li>Wrong penalty? Press Appeal. It is reversed and logged.</li></ol><p>High and critical penalties weaken your shadows for 24 hours. Medium or higher pause the linked daily quest streak for 1 to 2 days.</p>'],
['XP debt and weekly review','<p>If a penalty is bigger than your XP, XP goes to 0 and the rest becomes XP debt, shown on the Dashboard. 20% of new XP repays it.</p><p>When the weekly penalty cap is reached you must finish a short Weekly review (Quests tab) before creating new quests. It happens once per week.</p>'],
['Shadow Army','<p>Shadows unlock in order: Tank, Iron, Kaisel, Tusk, Igris, Beru, Bellion. Each needs several conditions at once: level, quests cleared, dungeons, focus minutes, streak, recoveries or badges. The card shows each requirement and progress. Unlocked shadows give bonuses, see the card. Tank penalties -10%, Iron +1 XP per check-in, Kaisel +5 XP for the first quest of a day, Tusk +20% skill XP, Igris dungeon XP and Knight Oath, Beru early and combo XP, Bellion all-dailies bonus.</p><p>Weakened shadows turn grey and their bonuses pause but stay unlocked.</p>'],
['Rank progression','<p>Every new rank opens a RANK UP screen, adds a title to your collection (choose it in Profile or Inventory) and S rank switches the whole app to a gold theme with a special badge.</p>'],
['Skills (skill tree)','<p>Skills tab, top: five stats STR, AGI, INT, VIT, PER. Each skill needs a stat value and a level. The Unlock button stays disabled until both are met. Skills: Power Strike, Sprint, Study Focus, Endure, Second Wind, Sense. Below it is the Learning log for study sessions.</p>'],
['Rewards, inventory and equipment','<p>Rewards tab: finish all daily goals, open the chest. Drops follow a fixed schedule.</p><p>Inventory: use Recovery Potion (once per week), XP Elixir, Focus Elixir and Rest Scroll. Equip one weapon, one armor and one ring. Inspect compares with what you wear. Cosmetics (frames, themes, shadow skins, titles) change looks only.</p>'],
['Puzzle games','<p>Puzzle tab: five games, each with instructions, difficulty, restart and exit. Dual N-Back trains working memory (keys A and L). Nonograms reveal pixel art for your collection. Sudoku has Standard, Killer (cage sums) and Wordoku (letters and a mystery word). Logic Grid uses clues with check and cross cells. Block Puzzle fits pieces into a silhouette with drag, rotate and flip.</p><p>Every game has a Daily challenge (the same puzzle all day). Unfinished Sudoku, Nonogram, Logic and Block games are saved so you can continue. XP: easy 3, medium 6, hard 10, daily +5, only for the first 2 practice wins per game each day and at most 40 puzzle XP a day, so repeating puzzles does not farm XP. Three daily puzzles in one day earn a chest. Hints and mistakes lower the score.</p>'],
['Quest Log','<p>Your private notes. Create, edit, search, pin and delete notes. Notes save automatically and never change XP, quests or penalties.</p>'],
['AI Coach and providers','<ol><li>Pick a provider and paste its key. Free options: Gemini, Groq, OpenRouter (models ending :free), Mistral, NVIDIA, or Ollama on your own PC (no key).</li><li>Type a question in the chat box. Enter sends, Shift+Enter makes a new line. It remembers the last messages of the conversation.</li><li>Answers use Markdown.</li></ol><p>The coach can read your progress (only the parts that match your question are sent) but cannot change anything. Break into steps adds subtasks only when you press Add. Examples: "How many penalties do I have?", "Why did I lose HP?", "Review my weekly performance.", "What should I prioritize today?"</p><p>Error 401 means the key belongs to another provider, 404 means a wrong model name, 429 means a free limit was reached.</p>'],
['Profile','<p>Name, goal, avatar, title, and About you: age (5 to 120), hobbies, height (cm or ft/in) and weight (kg or lb). All optional, stored only on this computer, shown to the AI only when you ask about them. Not medical advice.</p>'],
['Settings','<p>Penalties on or off, grace period, daily and weekly caps, XP per level, rest days, notification sounds, popup time, backup export and import.</p>'],
['Updates','<p>Update tab: Check for updates, read What is new, press Update now, then Restart and install. AppImage and Windows update inside the app. A .deb install must be updated by downloading the new .deb from GitHub Releases.</p>'],
['Backup and reset','<p>Settings, Export data saves a backup file. Import data restores it.</p><p>Reset application deletes all progress, notes, items and settings on this computer. Type RESET and confirm. API keys and the app itself are kept. Export a backup first, a reset cannot be undone.</p>']];
const guideHtml = () => { const q = guideQ.trim().toLowerCase(), L = GUIDE.filter(([t, h]) => !q || (t + ' ' + h.replace(/<[^>]+>/g, ' ')).toLowerCase().includes(q)); return L.map(([t, h], i) => `<details ${q || i === 0 ? 'open' : ''}><summary>${t}</summary>${h}</details>`).join('') || '<span class="mute">No match.</span>'; };
const vGuide = () => `<h1>Guide</h1><div class="win"><div class="row"><input id="gq" placeholder="Search the guide" value="${esc(guideQ)}" size="30" autocomplete="off"></div><div id="gl">${guideHtml()}</div></div>`;
const weekStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
const RW = { underestimated: .75, overcommit: .75, unclear: .75, distraction: 1.25, priority: 1, other: 1 }, REC_MIN = { low: 5, medium: 15, high: 15, critical: 15 };
const weekMisses = () => S.penalties.filter(p => p.at >= weekStart() && ['applied', 'resolved'].includes(p.status)).length;
function needReview() { const l = S.reviews[S.reviews.length - 1]; if (S.cfg.weekly > 0 && (!l || l.at < weekStart())) S.review.needed = true; }
const stakeText = (pr, m) => `Reward ${Math.round(XPQ[pr] * m)} xp on time. If missed: up to -${Math.round((S.cfg.pen[pr] || 0) * m)} xp (more after repeat misses, always capped).`;
function applyPenalty(q, reason) {
  const base = { id: crypto.randomUUID(), qid: q.id, title: q.title, level: q.priority, reason, at: Date.now() };
  if (!S.cfg.on || q.penalized) return null;
  if (EXEMPT.includes(reason)) { S.penalties.push({ ...base, xp: 0, status: 'exempt' }); return 'Exempted. No penalty.'; }
  const n = weekMisses(), wm = n >= 2 ? 2 : n === 1 ? 1.5 : 1, st = q.stake || 1, rw = RW[reason] || 1, b0 = S.cfg.pen[q.priority] || 0;
  const amt = Math.round(b0 * st * wm * rw * penMul());
  const d0 = new Date(); d0.setHours(0, 0, 0, 0);
  const td = S.penalties.filter(p => p.at >= d0.getTime() && ['applied', 'resolved'].includes(p.status)).reduce((a, p) => a - p.xp, 0);
  if (td + amt > S.cfg.daily || penaltyTotal(7) + amt > S.cfg.weekly) { needReview(); return 'Penalty cap reached. No penalty applied. Weekly review needed.'; }
  q.penalized = true;
  S.penalties.push({ ...base, xp: -amt, status: 'applied', note: `base ${b0} x${st} stake x${wm} repeat x${rw} reason`, recovery: { text: RECOVERY[q.priority], min: Math.max(3, Math.round(REC_MIN[q.priority] * (skill('windy') ? .8 : 1))), done: false } });
  addXp(-amt, 'Penalty: ' + q.title);
  if (['high', 'critical'].includes(q.priority)) S.shadowOff = Date.now() + 864e5;
  if (q.habit && q.priority !== 'low') { const e = new Date(); e.setDate(e.getDate() + (q.priority === 'medium' ? 1 : 2)); S.pause[q.habit] = { from: today(), to: ds(e) }; }
  if (S.cfg.weekly > 0 && penaltyTotal(7) >= S.cfg.weekly) needReview();
  return `-${amt} xp. Recovery dungeon added.`;
}
function dailyMiss() {
  if (!S.cfg.on) return;
  if (!S.dmDone) { S.dmDone = dAgo(1); save(); return; }
  let d = S.dmDone, c = 0, miss = 0;
  while (d < dAgo(1) && c++ < 7) {
    const nd = new Date(d + 'T00:00'); nd.setDate(nd.getDate() + 1); d = ds(nd);
    if (isRest(d)) continue;
    S.habits.forEach(h => { if ((h.since || '') > d || paused(h, d) || (S.log[d] || []).includes(h.id)) return; if (S.buffs.rest > 0) { S.buffs.rest--; S.shield[h.id + d] = 1; say('REST SCROLL USED', h.title + ' streak protected.'); return; } addXp(-2, 'Missed daily quest: ' + h.title); miss++; });
  }
  if (d !== S.dmDone) { S.dmDone = d; save(); if (miss) say('DAILY QUEST MISSED', `-${miss * 2} xp`); }
}
const alerts = () => [hp() < 50 ? '<div class="win sys"><h3>Injured Hunter</h3>HP is below 50%. XP gains are -20% until you finish recovery dungeons.</div>' : '',
  S.debt ? `<div class="win sys"><h3>XP debt: ${S.debt}</h3><small>20% of new XP repays it. Repaid ${S.debtMax - S.debt} of ${S.debtMax}.</small><div class="bar"><i style="width:${S.debtMax ? (S.debtMax - S.debt) / S.debtMax * 100 : 0}%"></i></div></div>` : '',
  S.review.needed ? '<div class="win sys"><h3>Weekly review needed</h3>New quests are locked until you finish it. <button class="btn" data-go="quests">Open</button></div>' : '',
  S.shadowOff > Date.now() ? `<div class="win sys"><h3>Shadows weakened</h3>Bonuses off until ${new Date(S.shadowOff).toLocaleTimeString()}.</div>` : ''].join('');
function checkOverdue() {
  dailyMiss();
  let hit = false;
  S.quests.forEach(q => {
    if (q.status === 'active') { const rm = q.remind !== undefined ? q.remind : S.cfg.remind, R = rm * 6e4, n = Date.now();
      if (R && q.start && !q.wStart) { const t = new Date(q.start).getTime() - n; if (t > 0 && t <= R) { q.wStart = true; hit = true; notify('ARISE', `Your ${q.title} is starting soon!`, 'start'); } }
      if (R && q.due && !q.wEnd) { const t = new Date(q.due).getTime() - n; if (t > 0 && t <= R) { q.wEnd = true; hit = true; notify('ARISE', `Your ${q.title} is ending soon!`, 'end'); } } }
    if (q.status === 'active' && q.due && !q.wSense && skill('sense')) { const t = new Date(q.due).getTime() - Date.now(); if (t > 0 && t <= 18e5) { q.wSense = true; hit = true; notify('ARISE', `Sense: ${q.title} is due in ${Math.ceil(t / 6e4)} min.`, 'warn'); } }
    if (q.status !== 'active' || q.reviewed || !q.due || Date.now() <= new Date(q.due).getTime() + S.cfg.grace * 6e4) return;
    if (isRest(q.due.slice(0, 10))) { q.reviewed = true; hit = true; return; }
    q.status = 'review'; hit = true; notify('ARISE', 'Task overdue — choose your next step: ' + q.title, 'warn');
  });
  if (hit) { save(); render(); }
}
const paused = (h, d) => { const p = S.pause[h.id]; return !!p && d >= p.from && d <= p.to; };
const streak = h => { let n = 0; for (let i = 0; i < 4000; i++) { const d = dAgo(i); if (paused(h, d) || S.shield[h.id + d]) continue; if ((S.log[d] || []).includes(h.id)) n++; else if (i) break; } return n; };
function stats() {
  let agi = 0; for (let i = 0; i < 7; i++) agi += (S.log[dAgo(i)] || []).length;
  return [['STR', Math.floor(sumAct('workout') / 10), 'Workout minutes ÷ 10'], ['AGI', agi, 'Habit checks, 7 days'],
    ['INT', S.quests.filter(q => q.status === 'done').length + Math.floor(sumSkill() / 30), 'Quests + skill hours'],
    ['VIT', Math.floor(sumAct('water') / 4) + S.penalties.filter(p => p.status === 'resolved').length, 'Water + recoveries'], ['PER', Math.floor(S.focusMin / 10), `${S.focusMin} focus min`]];
}
const badges = () => [['First blood', 'Clear 1 quest', S.quests.some(q => q.status === 'done')], ['Iron will', '7-day habit streak', S.habits.some(h => streak(h) >= 7)],
  ['Gate walker', '60 focus minutes', S.focusMin >= 60], ['Rise again', 'Resolve a penalty', S.penalties.some(p => p.status === 'resolved')],
  ['Rank D', 'Reach level 5', lvl(S.xp).l >= 5], ['Body forged', '150 workout minutes', sumAct('workout') >= 150], ['Scholar', '300 skill minutes', sumSkill() >= 300], ["Marshal's Week", '5 active days in a row (needs Bellion)', S.marshal], ['S-Rank Monarch', 'Reach S rank', lvl(S.xp).l >= 50]];

const hero = `<svg viewBox="0 0 300 300" aria-hidden="true"><defs><radialGradient id="au"><stop offset="0" stop-color="#7a3cff" stop-opacity=".7"/><stop offset="1" stop-color="#7a3cff" stop-opacity="0"/></radialGradient></defs>
<circle cx="170" cy="170" r="140" fill="url(#au)"/><g fill="#04030a" stroke="#6b2fd6" stroke-width="2"><path d="M170 40c-22 0-34 16-34 36 0 10 4 18 10 24l-34 30-8 90h132l-8-90-34-30c6-6 10-14 10-24 0-20-12-36-34-36z"/><path d="M100 130L60 250M240 130l30 110" fill="none" stroke="#00d9ff" stroke-width="3"/></g><circle cx="158" cy="78" r="3" fill="#00d9ff"/><circle cx="182" cy="78" r="3" fill="#00d9ff"/></svg>`;
const meter = (n, v, c) => `<div><small><span>${n}</span><span>${Math.round(v)}%</span></small><div class="bar ${c}"><i style="width:${v}%"></i></div></div>`;

const vDash = () => {
  const L = lvl(S.xp), open = S.habits.filter(h => !(S.log[today()] || []).includes(h.id)).length;
  const hpv = hp(), mp = cl(todayFocus() / 60 * 100), st = cl(todayAct('workout') / 30 * 70 + todayAct('water') / 6 * 30);
  const msgs = [...(open ? [['DAILY QUEST AVAILABLE', `${open} daily quest${open > 1 ? 's' : ''} remaining.`]] : []), ...(S.quests.some(q => q.status === 'review') ? [['TASK OVERDUE', 'Choose your next step in Quests.']] : []), ...S.feed.map(f => [f.title, f.body])].slice(0, 5);
  return `<div class="win hero"><div><span class="mute">${S.profile.goal ? 'Goal: ' + esc(S.profile.goal) : 'Player status'}</span><h1>WELCOME BACK, ${esc((S.profile.name || 'Hunter').toUpperCase())}.</h1>
  <div class="badge"><div class="rk"><span>${rank(L.l)}</span></div><div><b style="font-size:22px">Level ${L.l}</b><br><small>${L.cur} / ${L.need} xp</small></div></div>
  <div class="bar"><i style="width:${L.cur / L.need * 100}%"></i></div>
  <div class="meters">${meter('HP · discipline', hpv, 'hp')}${meter('MP · focus today', mp, 'mp')}${meter('Stamina · activity', st, 'st')}</div></div><div class="hbox"><img src="assets/hero.jpg" alt="Hunter"></div></div>${alerts()}${goalsCard()}
  <div class="grid">${stats().map(([n, v, d]) => `<div class="win"><b>${n}</b><span>${v}</span><small>${d}</small></div>`).join('')}</div>
  <div class="two"><div class="win"><h3>Daily quests</h3><div class="row"><input id="ht" placeholder="New daily quest" size="18"><button class="btn" data-act="addh">Add</button></div>
  ${S.habits.map(h => { const on = (S.log[today()] || []).includes(h.id); return `<div class="item"><span class="${on ? 'done' : ''}">${esc(h.title)} <small>streak ${streak(h)}${paused(h, today()) ? ' · paused' : ''}</small></span><button class="btn ${on ? 'q' : ''}" data-act="tick" data-id="${h.id}">${on ? 'Undo' : 'Check in'}</button></div>`; }).join('') || '<span class="mute">No daily quests yet.</span>'}</div>
  <div class="win sys"><h3>System</h3>${msgs.map(m => `<div class="item"><span><b>[${esc(m[0])}]</b> <small>${esc(m[1])}</small></span></div>`).join('') || '<span class="mute">No messages.</span>'}</div></div>`;
};
const vQuests = () => {
  const rev = S.quests.filter(q => q.status === 'review'), act = S.quests.filter(q => q.status === 'active'), dn = S.quests.filter(q => q.status === 'done').slice(-5);
  return `<h1>Quests</h1>${S.review.needed ? `<div class="win sys"><h3>Weekly review</h3><p>Weekly penalty cap reached. Finish this short review to create new quests.</p><div class="row"><select id="wr">${Object.entries(REASONS).filter(([k]) => !EXEMPT.includes(k)).map(([k, x]) => `<option value="${k}">${x}</option>`).join('')}</select><input id="wn" placeholder="One thing to change next week" size="34"><button class="btn" data-act="wrev">Complete review</button></div></div>` : ''}<div class="win"><div class="row"><input id="qt" placeholder="Quest title" size="24"><label>Start <input id="qs" type="datetime-local"></label><label>End <input id="qd" type="datetime-local"></label><label>Remind <input id="qm" type="number" min="0" max="1440" value="10" style="width:70px" list="rpre"> min before start and end</label><datalist id="rpre"><option value="5"><option value="10"><option value="15"><option value="30"><option value="60"></datalist>
  <select id="qp"><option>low</option><option selected>medium</option><option>high</option><option>critical</option></select>
  <select id="qr"><option value="none">One time</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select><select id="qk" title="Stake"><option value="1">Stake: safe x1</option><option value="1.5">Stake: bold x1.5</option><option value="2">Stake: risky x2</option></select><select id="qh" title="Related daily quest"><option value="">No daily quest link</option>${S.habits.map(h => `<option value="${h.id}">${esc(h.title)}</option>`).join('')}</select><button class="btn" data-act="addq">Accept quest</button></div><small id="stk">${stakeText('medium', 1)}</small></div>
  ${rev.map(q => `<div class="win sys"><h3>Task overdue — choose your next step</h3><b>${esc(q.title)}</b>
   <div class="row"><button class="btn" data-act="late" data-id="${q.id}">Mark done</button><input type="datetime-local" id="rs${q.id}"><button class="btn q" data-act="resched" data-id="${q.id}">Reschedule</button><button class="btn q" data-act="drop" data-id="${q.id}">No longer relevant</button></div>
   <div class="row"><select id="rr${q.id}">${Object.entries(REASONS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><button class="btn q" data-act="keep" data-id="${q.id}">Not done, reason given</button></div></div>`).join('')}
  <div class="win"><h3>This week</h3><div class="week">${[...Array(7)].map((_, i) => { const d = dAgo(-i), L = S.quests.filter(q => q.due && q.due.slice(0, 10) === d && q.status !== 'dropped').sort((x, y) => x.due.localeCompare(y.due));
   return `<div><b>${DAYS[new Date(d + 'T00:00').getDay()]} ${d.slice(8)}${isRest(d) ? ' · rest' : ''}</b>${L.map(q => `<div class="${q.status === 'done' ? 'done' : ''}"><small>${q.due.slice(11)}</small> ${esc(q.title)}</div>`).join('')}</div>`; }).join('')}</div></div>
  <div class="win"><h3>Active</h3>${act.map(q => `<div style="border-bottom:1px solid #102552;padding:8px 0"><div class="item" style="border:0"><span>${esc(q.title)} <small>${q.priority}${q.repeat && q.repeat !== 'none' ? ' · ' + q.repeat : ''}${q.start ? ' · ' + esc(q.start.replace('T', ' ')) + ' →' : ''}${q.due ? ' · ' + esc(q.due.replace('T', ' ')) : ''} </small>${stateTag(q)}</span>
   <span>${canDo(q) ? `<button class="btn q" data-act="five" data-id="${q.id}">Start for 5 min</button> <button class="btn" data-act="done" data-id="${q.id}">Complete</button>` : ''} <button class="btn q" data-act="editq" data-id="${q.id}">Edit</button> <button class="btn q" data-act="delq" data-id="${q.id}">Delete</button></span></div>
   ${(q.subs || []).map((x, i) => `<label style="display:block;margin-left:14px"><input type="checkbox" data-sub="${q.id}:${i}" ${x.d ? 'checked' : ''}> <span class="${x.d ? 'done' : ''}">${esc(x.t)}</span></label>`).join('')}
   <div class="row" style="margin-left:14px"><input id="sb${q.id}" placeholder="Subtask" size="18"><button class="btn q" data-act="addsub" data-id="${q.id}">Add</button></div>${editId === q.id ? editRow(q) : ''}</div>`).join('') || '<span class="mute">Nothing active.</span>'}</div>
  ${dn.length ? `<div class="win"><h3>Cleared</h3>${dn.map(q => `<div class="item"><span class="done">${esc(q.title)}</span><span class="tag done">COMPLETED</span></div>`).join('')}</div>` : ''}
  <h3>Penalty zone</h3><p class="mute">Capped, visible, reversible. Every penalty has a recovery step.</p>
  ${S.penalties.slice().reverse().slice(0, 12).map(p => `<div class="win ${p.status === 'applied' ? 'sys' : ''}"><b>${esc(p.title)}</b> <small>${p.level} · ${esc(REASONS[p.reason] || p.reason)} · ${new Date(p.at).toLocaleString()}</small>
   <div>${p.xp} xp · <b>${p.status}</b>${p.note ? ` <small>${esc(p.note)}</small>` : ''}${p.audit ? ` <small>${esc(p.audit)}</small>` : ''}</div>${p.status === 'applied' ? `<div class="row"><span>Recovery: ${esc(p.recovery.text)}. Needs a ${p.recovery.min || 15}-min recovery dungeon.</span><button class="btn" data-act="recdun" data-id="${p.id}">Start recovery dungeon</button><button class="btn q" data-act="appeal" data-id="${p.id}">Appeal</button></div>` : ''}</div>`).join('') || '<div class="win mute">No penalties. Clean record.</div>'}`;
};
const vStatus = () => {
  const days = [...Array(7)].map((_, i) => dAgo(6 - i)), pl = d => S.quests.filter(q => q.due && q.due.slice(0, 10) === d && q.status !== 'dropped');
  const mx = Math.max(1, ...days.map(d => pl(d).length)), fx = Math.max(1, ...days.map(d => S.focusLog[d] || 0));
  const bar = (v, m, c) => `<div class="bar ${c || ''}"><i style="width:${v / m * 100}%"></i></div>`;
  return `<h1>Status</h1><div class="grid">${stats().map(([n, v, d]) => `<div class="win"><b>${n}</b><span>${v}</span><small>${d}</small></div>`).join('')}</div>
  <div class="two"><div class="win"><h3>Planned vs cleared, 7 days</h3><div class="chart">${days.map(d => { const p = pl(d), c = p.filter(q => q.status === 'done').length; return `<small>${d.slice(5)}</small><div>${bar(p.length, mx, 'mp')}${bar(c, mx)}</div><small>${c}/${p.length}</small>`; }).join('')}</div>
  <small>Violet planned, blue cleared. Only quests with a due date count.</small></div>
  <div class="win"><h3>Focus minutes, 7 days</h3><div class="chart">${days.map(d => `<small>${d.slice(5)}</small>${bar(S.focusLog[d] || 0, fx)}<small>${S.focusLog[d] || 0}</small>`).join('')}</div></div></div>
  <div class="win"><h3>Activity log <small>manual entries</small></h3><div class="row"><select id="ak">${Object.entries(ACT).map(([k, [n, u]]) => `<option value="${k}">${n} (${u})</option>`).join('')}</select><input id="av" type="number" min="0" step="any" style="width:90px"><button class="btn" data-act="adda">Log</button></div>
  <small>Today: ${Object.entries(ACT).map(([k, [n, u]]) => `${n} ${todayAct(k)} ${u}`).join(' · ')}. Wellness figures are personal tracking, not medical advice.</small></div>
  <div class="win"><h3>XP ledger</h3>${S.ledger.slice(-8).reverse().map(l => `<div class="item"><span>${esc(l.reason)}</span><b>${l.amt > 0 ? '+' : ''}${l.amt}</b></div>`).join('') || '<span class="mute">Empty.</span>'}</div>`;
};
const vSkills = () => `<h1>Skills</h1>${skillTree()}<h3>Learning log</h3><div class="win"><div class="row"><input id="sn" placeholder="New skill (e.g. Circuit analysis)" size="26"><button class="btn" data-act="adds">Acquire skill</button></div></div>
  ${S.skills.map(s => { const due = Date.now() - s.last > 7 * 864e5; return `<div class="win"><div class="item" style="border:0"><span><b>${esc(s.name)}</b> <small>${(s.min / 60).toFixed(1)} h · ${s.sessions} sessions</small></span>${due ? '<b style="color:#f2b84b">Revision due</b>' : ''}</div>
   <div class="bar"><i style="width:${cl(s.min / 6)}%"></i></div><div class="row"><input id="sm${s.id}" type="number" min="1" placeholder="minutes" style="width:100px"><button class="btn" data-act="logs" data-id="${s.id}">Log session</button></div></div>`; }).join('') || '<div class="win mute">No skills yet.</div>'}`;
const vInv = () => {
  const own = Object.keys(S.inv).filter(k => S.inv[k] > 0 && ITEMS[k]), by = t => own.filter(k => ITEMS[k].t === t), none = '<div class="win mute">Nothing here yet. Earn chests in Rewards.</div>';
  const insp = id => `<button class="btn q" data-act="insp" data-id="${id}">Inspect</button>`;
  const slot = x => { const id = eq(x); return `<div class="win it"><small>${x}</small><br>${id ? `<b>${ITEMS[id].n}</b><p>${ITEMS[id].d}</p><button class="btn q" data-act="uneq" data-slot="${x}">Unequip</button>` : '<span class="mute">Empty</span>'}</div>`; };
  const detail = inspect && ITEMS[inspect] ? (() => { const it = ITEMS[inspect], cur = ['weapon', 'armor', 'ring'].includes(it.t) ? eq(it.t) : ''; return `<div class="win sys"><h3>${it.n}</h3><small>${RAR[it.r]} · ${TYPE[it.t]} · owned ${S.inv[inspect] || 0}</small><p>${it.d}</p>${cur && cur !== inspect ? `<p class="mute">Equipped now: ${ITEMS[cur].n}. ${ITEMS[cur].d}</p>` : ''}<button class="btn q" data-act="insp" data-id="">Close</button></div>`; })() : '';
  const eqs = ['weapon', 'armor', 'ring'].flatMap(by), cos = ['frame', 'theme', 'skin'].flatMap(by);
  return `<h1>Inventory</h1>${detail}<h3>Equipped</h3><div class="bd">${['weapon', 'armor', 'ring'].map(slot).join('')}</div>
  <h3>Consumables</h3><div class="bd">${by('consumable').map(id => itemCard(id, `${insp(id)}<button class="btn" data-act="use" data-id="${id}">Use</button>`)).join('') || none}</div>
  <h3>Equipment</h3><div class="bd">${eqs.map(id => itemCard(id, `${insp(id)}${eq(ITEMS[id].t) === id ? '<small>Equipped</small>' : `<button class="btn" data-act="eqp" data-id="${id}">Equip</button>`}`)).join('') || none}</div>
  <h3>Cosmetics</h3><div class="bd">${cos.map(id => itemCard(id, `${insp(id)}<button class="btn" data-act="cosn" data-id="${id}">${S.cos[ITEMS[id].t] === id ? 'Unequip' : 'Equip'}</button>`)).join('')}${by('title').map(id => itemCard(id, `<button class="btn" data-act="sett" data-t="${ITEMS[id].n}">Set title</button>`)).join('') || (cos.length ? '' : none)}</div>
  <h3>Permanent skills</h3><div class="win">${SK.filter(k => S.perks[k.id]).map(k => `<div class="item"><span><b>${k.n}</b> <small>${k.st}</small></span><small>${k.d}</small></div>`).join('') || '<span class="mute">None unlocked. See Skills.</span>'}</div>
  <h3>Achievements</h3><div class="bd">${badges().map(([n, d, on]) => `<div class="win ${on ? '' : 'off'}"><h3>${on ? n : 'Locked'}</h3><small>${d}</small></div>`).join('')}</div>`;
};
const vRewards = () => { const g = goals(), av = S.chests.filter(c => c.status === 'available'), op = S.chests.filter(c => c.status === 'opened').slice(-8).reverse(), mu = '<span class="mute">Nothing yet.</span>';
  return `<h1>Rewards</h1><div class="win"><h3>Daily goals <small>${g.filter(x => x[1]).length}/3</small></h3>${g.map(([l, d]) => `<div class="item ${d ? 'done' : ''}"><span>${d ? '● ' : '○ '}${l}</span></div>`).join('')}<small>Finish all 3 for one chest a day. Drops follow a fixed schedule, no luck.</small></div>
  <div class="win"><h3>Available</h3>${av.map(c => `<div class="item"><span>Chest #${c.n} · ${c.day}</span><button class="btn" data-act="opench" data-id="${c.id}">Open</button></div>`).join('') || mu}</div>
  <div class="win"><h3>Earned</h3>${op.map(c => `<div class="item"><span>Chest #${c.n} · ${c.day}</span><small>${c.items.map(i => ITEMS[i].n).join(', ')}</small></div>`).join('') || mu}</div>
  <div class="win"><h3>Used</h3>${S.usedLog.slice(-8).reverse().map(u => `<div class="item"><span>${ITEMS[u.id].n}</span><small>${new Date(u.at).toLocaleString()}</small></div>`).join('') || mu}</div>`; };
function armyCard(x, i) {
  const m = metrics(), un = !!S.shadows[x.n], prev = i === 0 || !!S.shadows[SH[i - 1].n], weak = un && Date.now() < S.shadowOff;
  const R = x.req.map(([k, t]) => [RL[k], Math.min(m[k], t), t]), pct = Math.round(R.reduce((a, [, c, t]) => a + c / t, 0) / R.length * 100);
  return `<div class="win sh ${un ? 'on' : 'lock'} ${weak ? 'weak' : ''} ${S.cos.skin ? S.cos.skin.replace('_', '-') : ''}"><span class="tier">${x.tier}</span><img class="sa" src="assets/shadows/${x.n.toLowerCase()}.jpeg" alt="${x.n}" draggable="false"><h3>${x.n}</h3>
  <small>${un ? (weak ? 'Weakened: bonuses off' : 'Extracted. Bonuses active') : prev ? 'Locked' : 'Locked. Extract ' + SH[i - 1].n + ' first'}</small>
  ${un ? '' : `<div class="bar"><i style="width:${pct}%"></i></div><small>${pct}% ready</small>`}
  <ul class="rq">${R.map(([l, c, t]) => `<li class="${c >= t ? 'ok' : ''}">${l}: ${c}/${t}</li>`).join('')}</ul>
  <div class="ab">${x.ab.map(t => `<p>${typeof t === 'function' ? t() : t}</p>`).join('')}</div></div>`;
}
const RB = { D: 'Level 5 reached. Tank and Iron shadows come within reach.', C: 'Strong base. Kaisel and Tusk can now be earned.', B: 'Igris the Knight Commander is close.', A: 'Elite hunter. Beru and Bellion are in sight.', S: 'You stand at the top. Bellion, the Grand Marshal, awaits.' };
const ovl = () => `<div class="ru ${rankUp.to === 'S' ? 's' : ''}"><div class="rb"><small>${rankUp.to === 'S' ? 'THE SYSTEM HAS RECOGNIZED YOU' : 'SYSTEM'}</small><h2>RANK UP</h2><div class="rr"><span>${rankUp.from}</span><i>→</i><b>${rankUp.to}</b></div>
  <p>Title unlocked: <b>${esc(rankUp.title)}</b></p>${rankUp.to === 'S' ? '<p><b>Badge: S-Rank Monarch</b></p>' : ''}<p class="mute">${RB[rankUp.to] || ''}</p><p class="mute">Level ${lvl(S.xp).l} · ${S.xp} xp</p><button class="btn" data-act="ruclose">Continue</button></div></div>`;
let logQ = '', nt;
const notesHtml = () => { const q = logQ.toLowerCase(), L = S.notes.filter(n => !q || (n.title + ' ' + n.body).toLowerCase().includes(q)).sort((a, b) => (b.pin - a.pin) || b.upd - a.upd);
  return L.map(n => `<div class="win note ${n.pin ? 'pin' : ''}"><input class="nt" data-nid="${n.id}" value="${esc(n.title)}" placeholder="Title"><textarea class="nb" data-nid="${n.id}" placeholder="Write anything…">${esc(n.body)}</textarea>
  <div class="row"><small>${new Date(n.upd).toLocaleString()}</small><button class="btn q" data-act="pinn" data-id="${n.id}">${n.pin ? 'Unpin' : 'Pin'}</button><button class="btn q" data-act="deln" data-id="${n.id}">Delete</button></div></div>`).join('') || `<div class="win mute">${q ? 'No matching notes.' : 'No notes yet.'}</div>`; };
const vLog = () => `<h1>Quest Log</h1><div class="win"><div class="row"><input id="lq" placeholder="Search notes" value="${esc(logQ)}" size="26" autocomplete="off"><button class="btn" data-act="newn">New note</button></div><small>Saves automatically. Notes never create quests or change XP.</small></div>
  <div class="notes" id="notes">${notesHtml()}</div>`;

const vArmy = () => `<h1>Shadow army</h1>${Date.now() < S.shadowOff ? `<div class="win sys"><h3>Shadows weakened</h3>Bonuses off until ${new Date(S.shadowOff).toLocaleString()}. Shadows stay unlocked.</div>` : ''}${timer && timer.rec ? '<div class="win sys"><h3>Recovery dungeon</h3>Finish it fully to resolve the penalty.</div>' : ''}<div class="win"><h3>Dungeon gate</h3><div class="timer" id="clock">${timer ? fmt(timer.left) : '25:00'}</div>
  <div class="row" style="justify-content:center"><input id="fm" type="number" min="1" max="180" value="25" style="width:70px"> min <button class="btn" data-act="fstart">${timer ? 'Open gate' : 'Enter dungeon'}</button></div>
  <p class="mute" style="text-align:center;margin:0">Clear a full run to earn xp and focus time. Leaving early earns nothing.</p></div>
  <div class="army">${SH.map((x, i) => armyCard(x, i)).join('')}</div>`;
const vSet = () => `<h1>Settings</h1><div class="win"><div class="row"><label><input type="checkbox" id="son" ${S.cfg.on ? 'checked' : ''}> Penalties enabled</label></div>
  <div class="row"><label>Grace (min) <input id="sg" type="number" min="0" value="${S.cfg.grace}" style="width:80px"></label><label>Daily cap <input id="sd" type="number" min="0" value="${S.cfg.daily}" style="width:80px"></label><label>Weekly cap <input id="sw" type="number" min="0" value="${S.cfg.weekly}" style="width:80px"></label><label>Remind before (min) <input id="sr" type="number" min="0" value="${S.cfg.remind}" style="width:70px"></label></div>
  <div class="row">${['low', 'medium', 'high', 'critical'].map(k => `<label>${k} xp <input id="sp${k}" type="number" min="0" value="${S.cfg.pen[k]}" style="width:60px"></label>`).join('')}</div>
  <div class="row">Rest days (no review, no penalty): ${DAYS.map((d, i) => `<label><input type="checkbox" class="rd" value="${i}" ${S.cfg.rest.includes(i) ? 'checked' : ''}>${d}</label>`).join(' ')}</div>
  <button class="btn" data-act="scfg">Save settings</button></div>
  <div class="win"><h3>Notification sounds</h3><div class="row"><label><input type="checkbox" id="sno" ${S.snd.on ? 'checked' : ''}> Sounds on</label><label>Volume <input id="svo" type="range" min="0" max="1" step=".05" value="${S.snd.vol}"></label><label>Style <select id="sst">${['soft', 'sharp', 'arcade'].map(x => `<option ${x === S.snd.style ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
  <div class="row">${[['info', 'Notice'], ['start', 'Quest start'], ['end', 'Quest end'], ['warn', 'Penalty'], ['up', 'Level / rank up'], ['ok', 'Complete']].map(([t, n]) => `<button class="btn q" data-act="prev" data-t="${t}">Play: ${n}</button>`).join('')}</div><div class="row"><label>Reminder popup time <input id="nsec" type="number" min="1" max="10" step="1" value="${S.notif.sec}" style="width:60px"> seconds (1 to 10)</label><button class="btn q" data-act="ntest">Test notification</button></div><button class="btn" data-act="ssnd">Save sound settings</button></div>
  <div class="win"><h3>Backup</h3><div class="row"><button class="btn" data-act="exp">Export data</button><label class="btn q">Import data<input id="imp" type="file" accept=".json" hidden></label></div><small>Import replaces current data.</small></div>
  <div class="win sys"><h3>Reset application</h3><p>Permanently deletes quests, daily quests, notes, XP, HP, debt, rank, titles, streaks, penalties, shadows, items, rewards, skills, equipment, goals, achievements, statistics and all settings on this computer. Kept: your API keys and the app itself. Export a backup first. This cannot be undone.</p><div class="row"><input id="rst" placeholder="Type RESET" size="12" autocomplete="off"><button class="btn" data-act="reset">Reset everything</button></div></div>`;
const PV = { gemini: ['Gemini', 'gemini-2.5-flash', 0, 'aistudio.google.com/apikey'], groq: ['Groq', 'llama-3.3-70b-versatile', 0, 'console.groq.com/keys'], openrouter: ['OpenRouter', 'meta-llama/llama-3.3-70b-instruct:free', 0, 'openrouter.ai/keys (pick models ending in :free)'],
  mistral: ['Mistral', 'mistral-small-latest', 0, 'console.mistral.ai'], nvidia: ['NVIDIA', 'meta/llama-3.3-70b-instruct', 0, 'build.nvidia.com'], cerebras: ['Cerebras', 'llama-3.3-70b', 0, 'cloud.cerebras.ai (may be credits, not free)'],
  ollama: ['Ollama (local)', 'llama3.2', 1, 'ollama.com (runs on your PC, fully free)'], deepseek: ['DeepSeek (paid)', 'deepseek-chat', 0, 'platform.deepseek.com'], anthropic: ['Anthropic (paid)', 'claude-sonnet-5-5', 0, 'console.anthropic.com'] };
const ready = () => PV[prov()][2] || keys[prov()];
let coach = null, busy = false, keys = {}, upd = { state: 'idle', cur: '', prog: 0, info: null };
const prov = () => S.ai.provider, model = () => S.ai.models[prov()] || PV[prov()][1];
const vCoach = () => `<h1>AI coach</h1><div class="win sys"><h3>Opt-in</h3><small>Only when you send a message or press a button, the parts of your app data that match your question are sent to the provider you choose. The coach can read your progress but can never change anything. Keys stay in a main-process file (owner-only, plain text), never in page code. The coach only suggests. Nothing changes unless you press Add.</small></div>
  <div class="win"><div class="row"><label>Provider <select id="cp">${Object.entries(PV).map(([k, [n]]) => `<option value="${k}" ${k === prov() ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>Model <input id="cm" value="${esc(model())}" size="22"></label><button class="btn q" data-act="cpsave">Save model</button></div>
  ${PV[prov()][2] ? '<div class="row mute">Runs on your computer. No key needed. Start Ollama first.</div>' : keys[prov()] ? `<div class="row">${PV[prov()][0]} key saved. <button class="btn q" data-act="ckdel">Remove key</button></div>` : `<div class="row"><input id="ck" type="password" placeholder="${PV[prov()][0]} API key" size="30"><button class="btn" data-act="ck">Save key</button></div>`}
  <small>Get it at <b>${PV[prov()][3]}</b>. Free tiers have daily limits and some may train on your prompts, so keep private text out. Use a key made for the selected provider. A key from another provider gives error 401. Model names change over time, edit the model box if you get "model not found".</small></div>
  ${ready() ? `<div class="win"><div class="row"><select id="cq">${S.quests.filter(q => q.status === 'active').map(q => `<option value="${q.id}">${esc(q.title)}</option>`).join('')}</select><button class="btn" data-act="cbreak">Break into steps</button></div>
  </div>` : ''}
  ${ready() ? chatBox() : ''}${busy ? '<div class="win mute">Coach is thinking…</div>' : ''}${coach ? `<div class="win ${coach.err ? 'sys' : ''}"><h3>${coach.err ? 'Error' : 'AI-generated suggestion'}</h3><div class="pre">${esc(coach.err || coach.text)}</div><div class="row">${coach.steps && coach.qid ? '<button class="btn" data-act="cadd">Add steps as subtasks</button>' : ''}<button class="btn q" data-act="cdis">Dismiss</button></div></div>` : ''}`;
function ctx() {
  const L = lvl(S.xp), wk = [...Array(7)].map((_, i) => dAgo(i)), act = S.quests.filter(q => q.status === 'active'), od = S.quests.filter(q => q.status === 'review');
  return [`Level ${L.l}, rank ${rank(L.l)}, ${S.xp} xp, HP ${Math.round(hp())}%${S.debt ? ', XP debt ' + S.debt : ''}.`, `Quests: ${S.quests.filter(q => q.status === 'done').length} cleared, ${act.length} active, ${od.length} overdue awaiting review.`,
    `Daily quests: ${S.habits.map(h => `${h.title} (streak ${streak(h)})`).join(', ') || 'none'}; ${(S.log[today()] || []).length}/${S.habits.length} checked today.`,
    `Focus minutes: today ${todayFocus()}, last 7 days ${wk.reduce((a, d) => a + (S.focusLog[d] || 0), 0)}, total ${S.focusMin}.`,
    `Open penalties: ${S.penalties.filter(p => p.status === 'applied').length}; XP lost to penalties this week: ${penaltyTotal(7)}.`,
    `Active quests: ${act.slice(0, 15).map(q => `${q.title} (${q.priority}${q.due ? ', due ' + q.due : ''})`).join('; ') || 'none'}.`].join('\n');
}
async function ask(kind, q) {
  busy = true; coach = null; render();
  const P = { break: `Break this task into 3-6 small concrete steps, one per line, numbered, no extra text: ${q && q.title}`,
    week: `Analyze my last week from this data. Name one strength, one weak habit and one realistic change. Under 150 words.\n${ctx()}`,
    goals: `Suggest 3-5 realistic daily goals for tomorrow based on this data. One per line, short.\n${ctx()}`,
    over: `For my overdue or incomplete quests suggest one of: reschedule, split, reduce scope or drop. Supportive, no shaming.\n${ctx()}` }[kind];
  const r = await window.arise.coach(prov(), model(), P); busy = false;
  coach = !r.ok ? { err: r.error } : { text: r.text, qid: q && q.id, steps: kind === 'break' ? r.text.split('\n').map(l => l.replace(/^\s*(\d+[.)]|[-*])\s*/, '').trim()).filter(Boolean).slice(0, 8) : null };
  render();
}
const vUpd = () => `<h1>Update</h1><div class="win"><div class="row"><span>Installed version: <b>${esc(upd.cur || '…')}</b></span><button class="btn" data-act="ucheck">Check for updates</button></div>
  ${upd.state === 'checking' ? '<p>Checking…</p>' : upd.state === 'none' ? '<p>You are up to date.</p>' : upd.state === 'dev' ? '<p class="mute">Updates work only in the installed app, not under npm start.</p>' : upd.state === 'manual' ? '<p class="mute">A .deb install cannot update itself. Download the new .deb from the GitHub Releases page, or use the AppImage for automatic updates.</p>' : upd.state === 'error' ? `<p>${esc(upd.msg || 'Update failed.')}</p>` : ''}</div>
  ${['available', 'downloading', 'ready'].includes(upd.state) && upd.info ? `<div class="win sys"><h3>Version ${esc(upd.info.version)} available</h3><small>Installed ${esc(upd.cur)} · Released ${upd.info.date ? esc(new Date(upd.info.date).toLocaleDateString()) : 'date unknown'}</small><h3 style="margin-top:12px">What's new</h3><div class="pre">${esc(upd.info.notes || 'No release notes provided.')}</div>
  ${upd.state === 'available' ? '<button class="btn" data-act="uget">Update now</button>' : upd.state === 'downloading' ? `<div class="bar"><i style="width:${upd.prog}%"></i></div><small>Downloading ${upd.prog}%</small>` : '<button class="btn" data-act="uinst">Restart and install</button>'}</div>` : ''}`;
const TITLES = { E: 'Rookie Hunter', D: 'Awakened Hunter', C: 'Seasoned Hunter', B: 'Elite Hunter', A: 'Top Ranker', S: 'Shadow Monarch' };
const avHtml = () => { const f = 'fr-' + ((S.cos.frame || 'none').replace('frame_', '')); return S.profile.avatar ? `<img class="${f}" src="${S.profile.avatar}" alt="">` : `<i class="${f}">${esc((S.profile.name || 'H')[0].toUpperCase())}</i>`; };
let calM = { y: new Date().getFullYear(), m: new Date().getMonth() }, calSel = today();
const qOn = d => S.quests.filter(q => q.due && q.due.slice(0, 10) === d && q.status !== 'dropped').sort((a, b) => a.due.localeCompare(b.due));
const vCal = () => {
  const { y, m } = calM, first = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), sel = calSel, sq = qOn(sel);
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: n }, (_, i) => ds(new Date(y, m, i + 1)))];
  const hc = (S.log[sel] || []).length, ac = Object.entries(ACT).filter(([k]) => (S.act[sel] || {})[k]).map(([k, [nm, u]]) => `${nm} ${S.act[sel][k]} ${u}`);
  return `<h1>Calendar</h1><div class="win"><div class="row" style="justify-content:space-between"><button class="btn q" data-act="calprev">Prev</button><h3 style="margin:0">${first.toLocaleString('en', { month: 'long', year: 'numeric' })}</h3><button class="btn q" data-act="calnext">Next</button></div>
  <div class="cal">${DAYS.map(d => `<small>${d}</small>`).join('')}${cells.map(d => { if (!d) return '<span></span>'; const L = qOn(d); return `<button class="cd ${d === today() ? 'tod' : ''} ${d === sel ? 'sel' : ''} ${isRest(d) ? 'rest' : ''}" data-act="calsel" data-d="${d}"><b>${+d.slice(8)}</b>${L.slice(0, 2).map(q => `<span class="${q.status === 'done' ? 'done' : ''}">${esc(q.title)}</span>`).join('')}${L.length > 2 ? `<small>+${L.length - 2} more</small>` : ''}${S.focusLog[d] ? '<i></i>' : ''}</button>`; }).join('')}</div>
  <small>Violet dot = focus time logged. Dark tint = rest day.</small></div>
  <div class="win"><h3>${sel}${isRest(sel) ? ' · rest day' : ''}</h3>
  ${sq.map(q => `<div class="item ${q.status === 'done' ? 'done' : ''}"><span>${esc(q.due.slice(11))} ${esc(q.title)} <small>${q.priority} · ${q.status}</small></span></div>`).join('') || '<span class="mute">No quests this day.</span>'}
  <p class="mute">Focus ${S.focusLog[sel] || 0} min · Daily quests checked ${hc}${ac.length ? ' · ' + ac.join(', ') : ''}</p>
  <div class="row"><input id="cqt" placeholder="Quest for this day" size="22"><input id="cqm" type="time" value="09:00"><select id="cqp"><option>low</option><option selected>medium</option><option>high</option><option>critical</option></select><button class="btn" data-act="addqd">Add quest</button></div></div>`;
};
const vProf = () => {
  const P = S.profile, L = lvl(S.xp), rk = rank(L.l), best = Math.max(0, ...S.habits.map(streak));
  const tot = [['Quests cleared', S.quests.filter(q => q.status === 'done').length], ['Focus minutes', S.focusMin], ['Skill hours', (sumSkill() / 60).toFixed(1)], ['Workout minutes', sumAct('workout')], ['Best streak', best], ['Recoveries', S.penalties.filter(p => p.status === 'resolved').length], ['Badges', badges().filter(b => b[2]).length + '/' + badges().length], ['Total xp', S.xp]];
  return `<h1>Profile</h1><div class="win prof"><div class="av fr-${(S.cos.frame || 'none').replace('frame_', '')}">${P.avatar ? `<img src="${P.avatar}" alt="">` : esc((P.name || 'H')[0].toUpperCase())}</div>
  <div><h3 style="margin:0;font-size:26px">${esc(P.name || 'Hunter')}</h3><b>${esc(P.title || TITLES[rk])}</b> · Rank ${rk} · Level ${L.l}<br><small>Joined ${new Date(P.since).toLocaleDateString()}</small>${P.goal ? `<br>Goal: ${esc(P.goal)}` : ''}</div></div>
  <div class="grid">${tot.map(([n, v]) => `<div class="win"><small>${n}</small><span>${v}</span></div>`).join('')}</div>
  ${aboutBlock()}<div class="win"><h3>Edit profile</h3><div class="row"><label>Name <input id="pn" value="${esc(P.name)}" maxlength="24"></label><label>Goal <input id="pg" value="${esc(P.goal)}" maxlength="80" size="30"></label><label>Title <select id="pt">${S.titles.map(t => `<option ${t === (P.title || TITLES[rk]) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label></div>
  <div class="row"><label class="btn q">Change avatar<input id="pav" type="file" accept="image/*" hidden></label><button class="btn q" data-act="avdel">Remove avatar</button><button class="btn" data-act="saveprof">Save profile</button></div>
  <small>Stored only on this computer. Avatar is shrunk to 160 px.</small></div>`;
};

let aboutInfo = null;
const vAbout = () => { const i = aboutInfo || {};
  return `<h1>About</h1><div class="win"><h3>ARISE</h3><p><b>From Zero to Unstoppable.</b></p><p>ARISE turns daily work into a game: quests, dungeons, XP, ranks, shadows, puzzles and an optional AI coach. It helps you plan, focus and build discipline without shame or harsh punishment.</p>
  <div class="grid"><div class="win"><small>Version</small><span style="font-size:26px">${esc(i.version || upd.cur || '-')}</span></div><div class="win"><small>Platform</small><span style="font-size:20px">${esc(i.platform || '-')}</span></div><div class="win"><small>Electron</small><span style="font-size:20px">${esc(i.electron || '-')}</span></div></div></div>
  <div class="win"><h3>What is inside</h3><ul><li>Quests with schedule, reminders, stakes and subtasks, plus calendar view</li><li>Daily quests, daily goals and reward chests</li><li>Dungeons (full-screen focus timer) and the Shadow Army</li><li>Fair penalty system: grace period, caps, recovery dungeon, appeals, XP debt</li><li>Ranks E to S with titles, skills, inventory and equipment</li><li>Five puzzle games with daily challenges</li><li>Quest Log notes, AI Coach (optional), profile and backup</li></ul></div>
  <div class="win"><h3>Privacy</h3><p>Your data stays on this computer${i.dataDir ? ' in <span class="mute">' + esc(i.dataDir) + '</span>' : ''}. There is no account and no tracking. The AI Coach sends data only when you use it, and only to the provider you chose.</p></div>
  <div class="win"><h3>Credits and license</h3><p>Made by Toxic. Released under the MIT License.</p><p class="mute">ARISE is an unofficial fan project inspired by Solo Leveling. It is not affiliated with or endorsed by its creators or publishers. Shadow Army artwork was supplied by the app owner and belongs to its respective rights holders.</p></div>
  <div class="row"><button class="btn" data-go="upd">Check for updates</button><button class="btn q" data-go="guide">Open the Guide</button></div>`; };
const fmt = s => p2(Math.floor(s / 60)) + ':' + p2(s % 60);
const V = { dash: vDash, quests: vQuests, status: vStatus, skills: vSkills, inv: vInv, army: vArmy, set: vSet, coach: vCoach, cal: vCal, rewards: vRewards, upd: vUpd, log: vLog, pz: () => vPz(), prof: vProf, guide: vGuide, about: () => vAbout() };

const setH = (el, h) => { if (el.__h === h) return false; el.innerHTML = h; el.__h = h; return true; };
const box = id => { let e = document.getElementById(id); if (!e) { e = document.createElement('div'); e.id = id; document.body.appendChild(e); } return e; };
function ensureShell() {
  const app = document.getElementById('app');
  if (shell && app.contains(shell.main)) return shell;
  app.innerHTML = `<nav><h2>ARISE</h2><div id="chipbox"></div>${NAV.map(([k, n, d]) => `<button data-go="${k}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg>${n}</button>`).join('')}</nav><main></main>`;
  shell = { nav: app.querySelector('nav'), main: app.querySelector('main'), chip: document.getElementById('chipbox') }; return shell;
}
const paintToast = () => setH(box('toastbox'), toast ? `<div class="win sys toast ${toast.up ? 'up' : ''}"><h3>${esc(toast.title)}</h3>${esc(toast.body)}</div>` : '');
const dgHtml = () => !timer ? '' : dgMin ? '<button class="dgpill" data-act="dgmax">Dungeon <b class="dgclk"></b> · open</button>' : `<div class="dg"><div class="dgin"><small>${timer.rec ? 'RECOVERY DUNGEON' : 'DUNGEON GATE'}</small><h2>${timer.rec ? 'Recovery in progress' : 'The gate is open'}</h2><div class="dgring"><div class="timer dgclk"></div></div><p class="dgst">STATUS: <b>ACTIVE</b></p><p class="mute">${timer.min} minute run. Finish it to earn the reward. Leaving early earns nothing.</p><div class="row" style="justify-content:center"><button class="btn q" data-act="dgmin">Minimize</button><button class="btn q" data-act="dgleave">Leave gate</button></div></div></div>`;
function dgPaint() { if (!timer) return; const t = fmt(timer.left), p = Math.min(100, Math.max(0, 100 - timer.left / (timer.min * 60) * 100)); document.querySelectorAll('.dgclk').forEach(e => { if (e.textContent !== t) e.textContent = t; }); const rg = document.querySelector('.dgring'); if (rg) rg.style.setProperty('--p', p + '%'); const c = document.getElementById('clock'); if (c && c.textContent !== t) c.textContent = t; }
function paintDg() { if (setH(box('dgbox'), dgHtml())) dgPaint(); document.body.classList.toggle('indg', !!timer && !dgMin); }
function render() {
  const sh = ensureShell(), ids = ['qt', 'qs', 'qm', 'qk', 'qh', 'qd', 'qp', 'qr', 'ht', 'sn', 'av', 'cqt', 'pn', 'pg', 'es', 'ee', 'er', 'cin', 'pa', 'ph1', 'ph2', 'pw', 'phb'], ae = document.activeElement, aid = ae && ae.id, sel = ae && ae.selectionStart != null ? [ae.selectionStart, ae.selectionEnd] : null;
  setH(sh.chip, `<button class="chip" data-go="prof">${avHtml()}<span>${esc(S.profile.name || 'Hunter')}<small>Lv ${lvl(S.xp).l} · Rank ${rank(lvl(S.xp).l)}</small></span></button>`);
  sh.nav.querySelectorAll('button[data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === view));
  const html = V[view](), changedView = lastView !== view; lastView = view;
  if (sh.main.__h !== html) {
    const keep = ids.map(i => document.getElementById(i)?.value); sh.main.innerHTML = html; sh.main.__h = html;
    ids.forEach((i, n) => { const e = document.getElementById(i); if (e && keep[n]) e.value = keep[n]; });
    if (aid) { const n = document.getElementById(aid); if (n && n !== document.activeElement) { n.focus(); if (sel) try { n.setSelectionRange(sel[0], sel[1]); } catch {} } }
  }
  if (changedView) { sh.main.classList.remove('enter'); void sh.main.offsetWidth; sh.main.classList.add('enter'); window.scrollTo(0, 0); }
  document.body.classList.toggle('srank', rank(lvl(S.xp).l) === 'S'); document.body.dataset.theme = (S.cos.theme || '').replace('theme_', '');
  paintToast(); setH(box('rubox'), rankUp ? ovl() : ''); paintDg();
  const cl2 = document.getElementById('chatlog'); if (cl2) cl2.scrollTop = cl2.scrollHeight;
  if (typeof pzAfter === 'function') pzAfter();
}
function finishQuest(q, late) {
  if (q.xpPaid) return; q.xpPaid = true; q.status = 'done'; q.doneAt = q.doneAt || Date.now();
  const n = S.quests.filter(x => x.status === 'done' && new Date(x.doneAt).toDateString() === new Date().toDateString()).length;
  const xp = Math.round(XPQ[q.priority] * (n > 8 ? .5 : 1) * (late ? .5 : 1) * beruMul(q, late) * (q.stake || 1) * extraQ(q, late)); addXp(xp, 'Quest: ' + q.title); if (has('Kaisel') && !S.firstQ[today()]) { S.firstQ[today()] = 1; addXp(5, 'Kaisel: first quest of the day'); }
  if (q.repeat && q.repeat !== 'none' && q.due) { const d = new Date(q.due); d.setDate(d.getDate() + (q.repeat === 'daily' ? 1 : 7)); S.quests.push({ ...q, id: crypto.randomUUID(), due: loc(d), status: 'active', reviewed: false, penalized: false, warned: false, wStart: false, wEnd: false, wSense: false, start: q.start ? ((s2) => { s2.setDate(s2.getDate() + (q.repeat === 'daily' ? 1 : 7)); return loc(s2); })(new Date(q.start)) : '', doneAt: null, subs: (q.subs || []).map(x => ({ t: x.t, d: false })) }); }
  say('QUEST COMPLETE', `+${xp} xp`);
}
function startTimer(min, rec) {
  if (timer) return; const now = Date.now(); dgPrev = view; dgMin = false;
  S.dg = { id: crypto.randomUUID(), min, rec: rec || '', start: now, end: now + min * 60000, beat: now };
  timer = { ...S.dg, left: min * 60 }; save(); dgLoop(); render();
}
function dgLoop() { clearInterval(dgTick); dgTick = setInterval(dgStep, 250); }
function dgStep() {
  if (!timer) return clearInterval(dgTick);
  const n = Date.now(); timer.left = Math.max(0, Math.ceil((timer.end - n) / 1000)); dgPaint();
  if (S.dg && n - S.dg.beat > 3000) { S.dg.beat = n; save(); }
  if (n >= timer.end) dgFinish();
}
function dgFinish() {
  if (dgBusy || !timer) return; dgBusy = true; clearInterval(dgTick);
  const t = timer, m = t.min, rc = t.rec; timer = null; S.dg = null; let xp = 0;
  if (S.dgDone !== t.id) {
    S.dgDone = t.id; S.focusMin += m; S.focusLog[today()] = todayFocus() + m;
    xp = Math.max(1, Math.round(Math.floor(m / 2) * (1 + (has('Igris') ? .15 + (oath() ? .1 : 0) : 0)) * (rc ? 1 : dunMul())));
    if (rc) { const pp = S.penalties.find(x => x.id === rc); if (pp && pp.status === 'applied') { pp.status = 'resolved'; pp.resolvedAt = Date.now(); if (has('Bellion') && Date.now() - pp.at < 864e5) addXp(5, 'Quick recovery'); } } else { S.dungeons++; S.dDays[today()] = 1; addXp(xp, `Dungeon ${m} min`); }
    save(); notify('ARISE', `Dungeon cleared. +${xp} xp`); say(rc ? 'RECOVERY COMPLETE' : 'DUNGEON CLEARED', rc ? 'Penalty resolved. HP restored.' : `+${xp} xp`); checkShadows();
  }
  dgBusy = false; dgMin = false; render();
}
function dgResume() {
  const d = S.dg; if (!d) return;
  if (Date.now() - (d.beat || d.start) > 15000) { S.dg = null; save(); setTimeout(() => say('DUNGEON INTERRUPTED', 'ARISE was closed during the dungeon. No reward.'), 400); return; }
  timer = { ...d, left: Math.max(0, Math.ceil((d.end - Date.now()) / 1000)) }; dgMin = false; dgPrev = view; dgLoop();
}
const completing = new Set();
async function completeQuest(q, late) {
  if (!q || completing.has(q.id) || q.xpPaid || q.status === 'done') return;
  if (qState(q) === 'upcoming') return say('NOT STARTED', 'This quest has not started yet.');
  completing.add(q.id);
  try {
    await save(); const r = await window.arise.questComplete(q.id, late ? 1 : 0);
    if (!r.ok) { if (r.reason === 'done') { q.status = 'done'; q.doneAt = r.doneAt; q.xpPaid = true; S.__done[q.id] = r.doneAt; } say('CANNOT COMPLETE', r.msg); }
    else { S.__done[q.id] = r.doneAt; q.doneAt = r.doneAt; finishQuest(q, late); }
  } finally { completing.delete(q.id); }
  save(); render();
}
document.addEventListener('click', e => { const t = e.target; if (t.matches && t.matches('input[type=datetime-local],input[type=date],input[type=time]')) { try { t.showPicker(); } catch {} } });
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { view = g.dataset.go; return render(); }
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act.startsWith('pz')) { if (pzAct(b)) { save(); render(); } return; }
  const id = b.dataset.id, q = S.quests.find(x => x.id === id), v = i => document.getElementById(i)?.value, a = b.dataset.act;
  if (a === 'addq') { const t = v('qt').trim(); if (!t) return say('INPUT NEEDED', 'Enter a quest title.'); if (S.review.needed) return say('WEEKLY REVIEW', 'Finish the weekly review in Quests first.'); const st = v('qs'), en = v('qd'); if (st && !en) return say('INPUT NEEDED', 'Add an end time.'); if (st && en && !(new Date(en) > new Date(st))) return say('INPUT NEEDED', 'End must be after start.'); S.quests.push({ id: crypto.randomUUID(), title: t, start: st, due: en, remind: Math.min(1440, Math.max(0, Math.round(+v('qm') || 0))), stake: +v('qk') || 1, habit: v('qh') || '', priority: v('qp'), repeat: v('qr'), status: 'active' }); say('QUEST ACCEPTED', t); document.getElementById('qt').value = ''; }
  else if (a === 'addh') { const t = v('ht').trim(); if (!t) return say('INPUT NEEDED', 'Enter a name.'); S.habits.push({ id: crypto.randomUUID(), title: t, since: today() }); }
  else if (a === 'tick') { const d = today(), l = S.log[d] = S.log[d] || [], i = l.indexOf(id), k = d + id;
    if (i < 0) { l.push(id); const g = 5 + (has('Iron') ? 1 : 0); S.tickXp[k] = g; addXp(g, 'Daily quest');
      if (S.habits.length && S.habits.every(h => l.includes(h.id)) && !S.allDaily[d]) { S.allDaily[d] = 1; if (has('Bellion')) addXp(10, 'All daily quests done'); say('DAILY QUESTS DONE', has('Bellion') ? '+10 xp' : 'All daily quests done.'); } }
    else { l.splice(i, 1); addXp(-(S.tickXp[k] || 5), 'Daily quest undone'); delete S.tickXp[k]; } }
  else if (a === 'done') { completeQuest(q, false); return; }
  else if (a === 'late') { completeQuest(q, true); return; }
  else if (a === 'resched') { if (!v('rs' + id)) return say('INPUT NEEDED', 'Pick a new date first.'); q.due = v('rs' + id); q.status = 'active'; q.reviewed = false; q.warned = false; q.wEnd = false; q.wStart = false; q.wSense = false; }
  else if (a === 'drop') q.status = 'dropped';
  else if (a === 'keep') { const r = v('rr' + id); q.status = 'active'; q.reviewed = true; q.reason = r; const m = applyPenalty(q, r); if (m) say('PENALTY', m); }
  else if (a === 'five') { if (q && has('Beru') && q.fiveDay !== today() && (S.fiveXp[today()] || 0) < 3) { q.fiveDay = today(); S.fiveXp[today()] = (S.fiveXp[today()] || 0) + 1; addXp(2, 'Start for 5 min'); } if (!timer) startTimer(5); }
  else if (a === 'fstart') { if (timer) dgMin = false; else startTimer(Math.max(1, Math.min(180, Math.round(+v('fm') || 25)))); }
  else if (a === 'dgmin') dgMin = true;
  else if (a === 'dgmax') dgMin = false;
  else if (a === 'dgleave') { if (!confirm('Leave the gate? You earn nothing for this run.')) return; clearInterval(dgTick); timer = null; S.dg = null; dgMin = false; }
  else if (a === 'recover') return;
  else if (a === 'ruclose') rankUp = null;
  else if (a === 'csend') { sendChat(); return; }
  else if (a === 'cclear') { if (!confirm('Clear the whole chat?')) return; S.chat = []; }
  else if (a === 'ntest') { S.notif.sec = Math.min(10, Math.max(1, Math.round(+v('nsec') || 5))); notify('ARISE', 'Test: your Study is starting soon!', 'start'); return; }
  else if (a === 'saveabout') { const res = parseAbout({ age: v('pa'), hu: v('phu'), h1: v('ph1'), h2: v('ph2'), w: v('pw'), wu: v('pwu') }, S.profile); if (res.err) return say('INPUT NEEDED', res.err); Object.assign(S.profile, res.data); say('PROFILE SAVED', 'About you updated.'); }
  else if (a === 'addhob') { const h = v('phb').trim().slice(0, 30); if (!h) return say('INPUT NEEDED', 'Type a hobby.'); const l = S.profile.hobbies = S.profile.hobbies || []; if (l.length >= 12) return say('LIMIT', 'Up to 12 hobbies.'); if (!l.some(x => x.toLowerCase() === h.toLowerCase())) l.push(h); }
  else if (a === 'delhob') { S.profile.hobbies.splice(+id, 1); }
  else if (a === 'reset') { if (v('rst') !== 'RESET') return say('RESET', 'Type RESET exactly to confirm.'); if (!confirm('Last warning: delete ALL ARISE progress, notes, items and settings on this computer?')) return; clearTimeout(nt); clearInterval(dgTick); timer = null; S = DEF(); window.arise.reset(S).then(ok => { if (ok) location.reload(); else say('RESET FAILED', 'Nothing was deleted. Try again.'); }); return; }
  else if (a === 'editq') editId = id;
  else if (a === 'cancelq') editId = '';
  else if (a === 'saveq') { const st = v('es'), en = v('ee'), rm = Math.round(+v('er')); if (st && !en) return say('INPUT NEEDED', 'Add an end time.'); if (st && en && !(new Date(en) > new Date(st))) return say('INPUT NEEDED', 'End must be after start.'); if (!(rm >= 0 && rm <= 1440)) return say('INPUT NEEDED', 'Reminder must be 0 to 1440 minutes.');
    q.start = st; q.due = en; q.remind = rm; q.wStart = q.wEnd = q.wSense = false; q.reviewed = false; editId = ''; say('QUEST UPDATED', q.title); }
  else if (a === 'use') useItem(id);
  else if (a === 'opench') { const got = openChest(S.chests.find(x => x.id === id)); if (got) say('CHEST OPENED', got.map(i => ITEMS[i].n).join(', ')); }
  else if (a === 'eqp') { const it = ITEMS[id]; if (!it || !S.inv[id] || !['weapon', 'armor', 'ring'].includes(it.t)) return; S.equip[it.t] = id; say('EQUIPPED', it.n); }
  else if (a === 'uneq') S.equip[b.dataset.slot] = '';
  else if (a === 'cosn') { const it = ITEMS[id]; if (!it || !S.inv[id] || !['frame', 'theme', 'skin'].includes(it.t)) return; S.cos[it.t] = S.cos[it.t] === id ? '' : id; }
  else if (a === 'sett') { if (S.titles.includes(b.dataset.t)) S.profile.title = b.dataset.t; }
  else if (a === 'insp') inspect = id || '';
  else if (a === 'unlk') { const k = SK.find(x => x.id === id), m = statMap(); if (!k || S.perks[id] || m[k.st] < k.s || lvl(S.xp).l < k.l) return say('LOCKED', 'Requirements not met.'); S.perks[id] = Date.now(); say('NEW SKILL ACQUIRED', k.n); }
  else if (a === 'delq') { if (!confirm('Delete this quest?')) return; S.quests = S.quests.filter(x => x.id !== id); }
  else if (a === 'newn') S.notes.unshift({ id: crypto.randomUUID(), title: '', body: '', pin: false, at: Date.now(), upd: Date.now() });
  else if (a === 'pinn') { const n = S.notes.find(x => x.id === id); if (n) n.pin = !n.pin; }
  else if (a === 'deln') { if (!confirm('Delete this note?')) return; S.notes = S.notes.filter(x => x.id !== id); }
  else if (a === 'recdun') { const pp = S.penalties.find(x => x.id === id); if (!pp || pp.status !== 'applied') return; if (timer) return say('DUNGEON BUSY', 'Finish or leave the current dungeon first.'); startTimer(pp.recovery.min || 15, id); }
  else if (a === 'wrev') { S.reviews.push({ at: Date.now(), reason: v('wr'), note: v('wn').trim() }); S.review.needed = false; say('REVIEW DONE', 'You can add quests again.'); }
  else if (a === 'appeal') { const p = S.penalties.find(x => x.id === id); p.status = 'reversed'; p.audit = 'Appealed ' + new Date().toLocaleString(); addXp(-p.xp, 'Appeal reversed: ' + p.title, true); if (['high', 'critical'].includes(p.level)) S.shadowOff = 0; say('PENALTY REVERSED', 'Audit entry saved.'); }
  else if (a === 'adda') { const k = v('ak'), n = +v('av'); if (!(n > 0)) return say('INPUT NEEDED', 'Enter an amount.'); const d = S.act[today()] = S.act[today()] || {};
    d[k] = (d[k] || 0) + n; const raw = k === 'workout' ? Math.floor(n / 5) : k === 'water' ? Math.floor(n) : k === 'sleep' ? 2 : Math.floor(n / 1000), g = Math.max(0, Math.min(raw, 20 - (d.xp || 0))); d.xp = (d.xp || 0) + g; if (g) addXp(g, ACT[k][0]); say('ACTIVITY LOGGED', `${ACT[k][0]} +${n} ${ACT[k][1]}`); }
  else if (a === 'adds') { const t = v('sn').trim(); if (!t) return say('INPUT NEEDED', 'Enter a skill name.'); S.skills.push({ id: crypto.randomUUID(), name: t, min: 0, sessions: 0, last: Date.now() }); say('NEW SKILL ACQUIRED', t); }
  else if (a === 'logs') { const s = S.skills.find(x => x.id === id), m = +v('sm' + id); if (!(m > 0)) return say('INPUT NEEDED', 'Enter minutes.'); s.min += m; s.sessions++; s.last = Date.now(); const xp = Math.max(1, Math.floor(m / 5 * skMul())); addXp(xp, 'Skill: ' + s.name); say('SESSION LOGGED', `+${xp} xp`); }
  else if (a === 'scfg') { const c = S.cfg; c.on = document.getElementById('son').checked; c.grace = +v('sg') || 0; c.daily = +v('sd') || 0; c.weekly = +v('sw') || 0; c.remind = +v('sr') || 0; ['low', 'medium', 'high', 'critical'].forEach(k => c.pen[k] = +v('sp' + k) || 0); c.rest = [...document.querySelectorAll('.rd:checked')].map(x => +x.value); say('SETTINGS SAVED', 'Done.'); }
  else if (a === 'calprev') { calM = calM.m ? { y: calM.y, m: calM.m - 1 } : { y: calM.y - 1, m: 11 }; }
  else if (a === 'calnext') { calM = calM.m < 11 ? { y: calM.y, m: calM.m + 1 } : { y: calM.y + 1, m: 0 }; }
  else if (a === 'calsel') calSel = b.dataset.d;
  else if (a === 'addqd') { if (S.review.needed) return say('WEEKLY REVIEW', 'Finish the weekly review in Quests first.'); const t = v('cqt').trim(); if (!t) return say('INPUT NEEDED', 'Enter a quest title.'); S.quests.push({ id: crypto.randomUUID(), title: t, due: calSel + 'T' + (v('cqm') || '09:00'), priority: v('cqp'), repeat: 'none', status: 'active' }); say('QUEST ACCEPTED', t + ' · ' + calSel); }
  else if (a === 'saveprof') { S.profile.name = v('pn').trim(); S.profile.goal = v('pg').trim(); S.profile.title = v('pt') || ''; say('PROFILE SAVED', 'Done.'); }
  else if (a === 'avdel') S.profile.avatar = '';
  else if (a === 'addsub') { const t = v('sb' + id).trim(); if (!t) return say('INPUT NEEDED', 'Enter a subtask.'); q.subs = [...(q.subs || []), { t, d: false }]; }
  else if (a === 'ck') { const k = v('ck').trim(); if (!k) return say('INPUT NEEDED', 'Enter a key.'); window.arise.setKey(prov(), k).then(x => { keys = x; say('KEY SAVED', PV[prov()][0] + ' key stored locally.'); }); return; }
  else if (a === 'ckdel') { window.arise.setKey(prov(), '').then(x => { keys = x; render(); }); return; }
  else if (a === 'cbreak') { const qq = S.quests.find(x => x.id === v('cq')); if (!qq) return say('INPUT NEEDED', 'Add an active quest first.'); ask('break', qq); return; }
  else if (a === 'creview') return;
  else if (a === 'cgoals') return;
  else if (a === 'cover') return;
  else if (a === 'cpsave') { S.ai.models[prov()] = v('cm').trim().replace(/[^\w.\-\/:]/g, ''); say('AI SETTINGS SAVED', PV[prov()][0] + ' · ' + model()); }
  else if (a === 'prev' || a === 'ssnd') { S.snd = { on: document.getElementById('sno').checked, vol: +v('svo'), style: v('sst') }; S.notif.sec = Math.min(10, Math.max(1, Math.round(+v('nsec') || 5))); if (a === 'prev') { beep(b.dataset.t, true); return; } say('SOUND SAVED', 'Done.'); }
  else if (a === 'ucheck') { upd.state = 'checking'; render(); window.arise.uCheck().then(x => { upd = { ...upd, state: x.state, msg: x.msg, info: x }; render(); }); return; }
  else if (a === 'uget') { upd.state = 'downloading'; upd.prog = 0; render(); window.arise.uGet().then(ok => { if (!ok) { upd.state = 'error'; upd.msg = 'Download failed. Your data is untouched.'; render(); } }); return; }
  else if (a === 'uinst') { window.arise.uInstall(); return; }
  else if (a === 'cdis') coach = null;
  else if (a === 'cadd') { const qq = S.quests.find(x => x.id === coach.qid); if (qq) { qq.subs = [...(qq.subs || []), ...coach.steps.map(t => ({ t, d: false }))]; say('SUBTASKS ADDED', coach.steps.length + ' steps'); } coach = null; }
  else if (a === 'exp') { const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); l.download = `arise-backup-${today()}.json`; l.click(); return; }
  save(); render();
});
document.addEventListener('keydown', e => { if (e.target.id === 'cin' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'gq') { guideQ = t.value; const b = document.getElementById('gl'); if (b) { b.innerHTML = guideHtml(); shell.main.__h = V[view](); } return; }
  if (t.id === 'lq') { logQ = t.value; clearTimeout(lqT); lqT = setTimeout(() => { const b = document.getElementById('notes'); if (b) { b.innerHTML = notesHtml(); shell.main.__h = V[view](); } }, 60); return; }
  if (t.dataset && t.dataset.nid) { const n = S.notes.find(x => x.id === t.dataset.nid); if (!n) return; if (t.classList.contains('nt')) n.title = t.value; else n.body = t.value; n.upd = Date.now(); clearTimeout(nt); nt = setTimeout(save, 400); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'phu' || e.target.id === 'pwu') { S.profile[e.target.id === 'phu' ? 'hu' : 'wu'] = e.target.value; render(); return; }
  if (e.target.id === 'qp' || e.target.id === 'qk') { const el = document.getElementById('stk'); if (el) el.textContent = stakeText(document.getElementById('qp').value, +document.getElementById('qk').value); return; }
  if (e.target.id === 'cp') { S.ai.provider = e.target.value; save(); render(); return; }
  if (e.target.id === 'pav' && e.target.files[0]) { const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 160; const s = Math.min(im.width, im.height); c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 160, 160); S.profile.avatar = c.toDataURL('image/jpeg', .85); save(); render(); }; im.src = fr.result; }; fr.readAsDataURL(e.target.files[0]); return; }
  const sb = e.target.dataset && e.target.dataset.sub; if (sb) { const [id, i] = sb.split(':'), q = S.quests.find(x => x.id === id); if (q) { const sb2 = q.subs[+i]; sb2.d = e.target.checked; if (sb2.d && !sb2.x && has('Igris') && (S.subXp[today()] || 0) < 5) { sb2.x = true; S.subXp[today()] = (S.subXp[today()] || 0) + 1; addXp(1, 'Subtask: ' + sb2.t); } save(); render(); } return; }
  if (e.target.id !== 'imp' || !e.target.files[0]) return;
  e.target.files[0].text().then(t => { try { const d = JSON.parse(t); if (typeof d.xp !== 'number') throw 0; S = { ...DEF(), ...d, cfg: { ...DEF().cfg, ...d.cfg } }; save(); say('DATA IMPORTED', 'Backup restored.'); } catch { say('IMPORT FAILED', 'File is not an ARISE backup.'); } });
});
(function fx() {
  const c = document.getElementById('fx'), x = c.getContext('2d'); if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const P = [...Array(45)].map(() => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .4, v: Math.random() * .0004 + .0001, c: Math.random() < .3 ? '138,92,255' : '0,217,255' }));
  const fit = () => { c.width = innerWidth; c.height = innerHeight; }; fit(); addEventListener('resize', fit);
  (function f() { x.clearRect(0, 0, c.width, c.height); P.forEach(p => { p.y -= p.v; if (p.y < 0) { p.y = 1; p.x = Math.random(); } x.fillStyle = `rgba(${p.c},.5)`; x.beginPath(); x.arc(p.x * c.width, p.y * c.height, p.r, 0, 7); x.fill(); }); requestAnimationFrame(f); })();
})();
window.arise.keys().then(k => { keys = k; });
window.arise.ver().then(v => { upd.cur = v; });
window.arise.info().then(i => { aboutInfo = i; if (view === 'about') render(); });
window.arise.onU((t, v) => { if (t === 'prog') { upd.prog = v; render(); } else if (t === 'done') { upd.state = 'ready'; render(); say('UPDATE READY', 'Restart to install.'); } });
window.arise.load().then(d => { if (d) S = { ...DEF(), ...d, cfg: { ...DEF().cfg, ...d.cfg } }; S.profile = { ...DEF().profile, ...S.profile }; S.__done = S.__done || {}; const unpaid = S.quests.filter(q => S.__done[q.id] && !q.xpPaid); S.quests.forEach(q => { if (q.status === 'done' && !q.xpPaid && !S.__done[q.id]) q.xpPaid = true; }); unpaid.forEach(q => { q.status = 'active'; finishQuest(q, false); }); dgResume(); if (d && d.dungeons === undefined) S.dungeons = Math.floor(S.focusMin / 15); checkShadows(); render(); checkOverdue(); setInterval(checkOverdue, 20000); setInterval(() => { const g = S.quests.map(q => q.id + qState(q)).join(); if (g !== sig) { sig = g; if (['quests', 'dash', 'cal'].includes(view)) render(); } }, 1000); window.arise.uCheck().then(x => { if (x.state === 'available') { upd = { ...upd, state: 'available', info: x }; say('UPDATE AVAILABLE', 'Version ' + x.version + '. Open the Update tab.'); } }); });

document.addEventListener('keydown', e => { if (e.key === 'Escape' && timer && !dgMin) { dgMin = true; render(); } });
addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG' && t.classList && t.classList.contains('sa')) { const x = SH.find(z => z.n === t.alt); if (x) t.outerHTML = `<svg class="sa fb" viewBox="0 0 120 150"><path d="${x.p}"/></svg>`; } }, true);
