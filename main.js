const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('fs'), path = require('path');
let autoUpdater = null; try { autoUpdater = require('electron-updater').autoUpdater; } catch {}
if (process.env.APPIMAGE) app.commandLine.appendSwitch('no-sandbox');
let win = null;
const file = () => path.join(app.getPath('userData'), 'arise.json');
const kf = () => path.join(app.getPath('userData'), 'arise-key.json');
const SYS = 'You are a supportive productivity coach inside the ARISE app. Use only the data given. Never shame the user. Be concise, concrete and realistic. Plain text only.';
const SYS_CHAT = 'You are the AI Coach inside ARISE, a Solo Leveling style productivity app. You have READ-ONLY access to the APP DATA below. Answer using only that data. Never invent numbers. If something is not in the data, say you do not have it. You cannot change anything in the app: if an action would help, tell the user which button to press and let them decide. Be supportive, never shaming. Use short Markdown (bold, lists). Reply in the language the user writes in.';
const readKeys = () => { try { const j = JSON.parse(fs.readFileSync(kf(), 'utf8')); return j.keys || (j.k ? { anthropic: j.k } : {}); } catch { return {}; } };
const flags = k => Object.fromEntries(Object.keys(PROV).map(p => [p, !!k[p]]));
const oa = (name, url, nokey) => ({ name, nokey, url: () => url,
  req: (k, m, msgs, sys) => ({ h: k ? { authorization: 'Bearer ' + k } : {}, b: { model: m, max_tokens: 1200, messages: [{ role: 'system', content: sys }, ...msgs] } }),
  out: j => (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '' });
const PROV = {
  anthropic: { name: 'Anthropic', url: () => 'https://api.anthropic.com/v1/messages',
    req: (k, m, msgs, sys) => ({ h: { 'x-api-key': k, 'anthropic-version': '2023-06-01' }, b: { model: m, max_tokens: 1200, system: sys, messages: msgs } }),
    out: j => (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n') },
  gemini: { name: 'Gemini', url: m => `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`,
    req: (k, m, msgs, sys) => ({ h: { 'x-goog-api-key': k }, b: { systemInstruction: { parts: [{ text: sys }] }, contents: msgs.map(x => ({ role: x.role === 'assistant' ? 'model' : 'user', parts: [{ text: x.content }] })) } }),
    out: j => ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(p => p.text || '').join('\n') },
  deepseek: oa('DeepSeek', 'https://api.deepseek.com/chat/completions'),
  groq: oa('Groq', 'https://api.groq.com/openai/v1/chat/completions'),
  openrouter: oa('OpenRouter', 'https://openrouter.ai/api/v1/chat/completions'),
  mistral: oa('Mistral', 'https://api.mistral.ai/v1/chat/completions'),
  cerebras: oa('Cerebras', 'https://api.cerebras.ai/v1/chat/completions'),
  nvidia: oa('NVIDIA', 'https://integrate.api.nvidia.com/v1/chat/completions'),
  ollama: oa('Ollama', 'http://localhost:11434/v1/chat/completions', true)
};
async function callAI(p, model, sys, msgs) {
  const P = PROV[p], k = readKeys()[p];
  if (!P) return { ok: false, error: 'Unknown provider.' };
  if (!k && !P.nokey) return { ok: false, error: `Add a ${P.name} API key first.` };
  if (!/^[\w.\-\/:]{1,100}$/.test(model || '')) return { ok: false, error: 'Model name has invalid characters.' };
  const r = P.req(k, model, msgs, String(sys).slice(0, 16000));
  let last = 'Network error.';
  for (let i = 0; i < 2; i++) {
    const ac = new AbortController(), to = setTimeout(() => ac.abort(), 45000);
    try {
      const res = await fetch(P.url(model), { method: 'POST', signal: ac.signal, headers: { 'content-type': 'application/json', ...r.h }, body: JSON.stringify(r.b) });
      clearTimeout(to);
      if (res.ok) { const t = P.out(await res.json()).trim(); return t ? { ok: true, text: t } : { ok: false, error: 'Empty reply from ' + P.name + '. Try again or change model.' }; }
      let msg = ''; try { const j = await res.json(); msg = String((j.error && (j.error.message || j.error)) || '').slice(0, 160); } catch {}
      if (res.status === 401 || res.status === 403) return { ok: false, error: `${P.name} rejected the key (${res.status}). Use a key made for ${P.name}, not another provider. ${msg}` };
      if (res.status === 404) return { ok: false, error: `Model "${model}" not found at ${P.name}. Edit the model name. ${msg}` };
      if (res.status === 400) return { ok: false, error: `${P.name} rejected the request (400). ${msg}` };
      last = res.status === 429 ? `${P.name} rate limit or quota reached (429). ${msg}` : `${P.name} error ${res.status}. ${msg}`;
      if (res.status !== 429 && res.status < 500) return { ok: false, error: last };
    } catch (err) { clearTimeout(to); last = err.name === 'AbortError' ? 'Request timed out after 45 s.' : P.nokey ? 'Cannot reach Ollama. Start it (ollama serve) and pull the model.' : 'Network error. Check internet.'; }
    await new Promise(r2 => setTimeout(r2, 1200));
  }
  return { ok: false, error: last };
}
const readState = () => { try { return JSON.parse(fs.readFileSync(file(), 'utf8')); } catch { return null; } };
const writeState = s => { const t = file() + '.tmp'; fs.writeFileSync(t, JSON.stringify(s)); fs.renameSync(t, file()); };
let chain = Promise.resolve();
const serial = fn => { const p = chain.then(fn, fn); chain = p.catch(() => {}); return p; };
ipcMain.handle('load', () => readState());
ipcMain.handle('save', (e, s) => serial(async () => {
  const prev = readState(), done = Object.assign({}, prev && prev.__done, s && s.__done);
  s.__done = done; for (const q of s.quests || []) if (done[q.id] && q.status !== 'done') { q.status = 'done'; q.doneAt = done[q.id]; }
  writeState(s); return true;
}));
ipcMain.handle('questComplete', (e, id) => serial(async () => {
  const st = readState(); if (!st) return { ok: false, reason: 'nostate', msg: 'No saved data.' };
  const q = (st.quests || []).find(x => x.id === id); if (!q) return { ok: false, reason: 'missing', msg: 'Quest not found.' };
  st.__done = st.__done || {};
  if (st.__done[id] || q.status === 'done') return { ok: false, reason: 'done', msg: 'This quest is already completed.', doneAt: st.__done[id] || q.doneAt || Date.now() };
  if (!['active', 'review'].includes(q.status)) return { ok: false, reason: 'state', msg: 'This quest cannot be completed now.' };
  const now = Date.now(); if (q.start && now < new Date(q.start).getTime()) return { ok: false, reason: 'early', msg: 'This quest has not started yet.' };
  q.status = 'done'; q.doneAt = now; st.__done[id] = now; writeState(st); return { ok: true, doneAt: now };
}));
ipcMain.handle('reset', (e, fresh) => { try { const t = file() + '.tmp'; fs.writeFileSync(t, JSON.stringify(fresh)); fs.renameSync(t, file()); return true; } catch { return false; } });
ipcMain.handle('keys', () => flags(readKeys()));
ipcMain.handle('setKey', (e, p, k) => {
  if (!PROV[p]) return flags(readKeys());
  const keys = readKeys(); k = String(k || '').trim();
  if (k) keys[p] = k; else delete keys[p];
  fs.writeFileSync(kf(), JSON.stringify({ keys }), { mode: 0o600 }); return flags(keys);
});
ipcMain.handle('coach', (e, p, model, prompt) => callAI(p, model, SYS, [{ role: 'user', content: String(prompt).slice(0, 6000) }]));
ipcMain.handle('chat', (e, p, model, ctx, msgs) => {
  const m = (Array.isArray(msgs) ? msgs : []).filter(x => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').slice(-14).map(x => ({ role: x.role, content: x.content.slice(0, 4000) }));
  while (m.length && m[0].role !== 'user') m.shift();
  if (!m.length) return { ok: false, error: 'Nothing to send.' };
  return callAI(p, model, SYS_CHAT + '\n\nAPP DATA (read-only):\n' + String(ctx || '').slice(0, 14000), m);
});
ipcMain.handle('ver', () => app.getVersion());
ipcMain.handle('info', () => ({ version: app.getVersion(), electron: process.versions.electron, chrome: process.versions.chrome, platform: process.platform + ' ' + process.arch, dataDir: app.getPath('userData') }));
ipcMain.handle('uCheck', async () => {
  if (!app.isPackaged || !autoUpdater) return { state: 'dev' };
  if (process.platform === 'linux' && !process.env.APPIMAGE) return { state: 'manual' };
  try {
    autoUpdater.autoDownload = false;
    const r = await autoUpdater.checkForUpdates(), i = r && r.updateInfo;
    if (!i || i.version === app.getVersion()) return { state: 'none' };
    const n = typeof i.releaseNotes === 'string' ? i.releaseNotes : (i.releaseNotes || []).map(x => x.note).join('\n');
    return { state: 'available', version: i.version, date: i.releaseDate, notes: String(n || '').replace(/<[^>]+>/g, '').trim() };
  } catch { return { state: 'error', msg: 'Could not reach GitHub Releases. Check internet. Your data is untouched.' }; }
});
ipcMain.handle('uGet', async () => { try { await autoUpdater.downloadUpdate(); return true; } catch { return false; } });
ipcMain.handle('uInstall', () => { if (autoUpdater) autoUpdater.quitAndInstall(); });
if (autoUpdater) {
  autoUpdater.on('download-progress', p => win && win.webContents.send('upd', 'prog', Math.round(p.percent)));
  autoUpdater.on('update-downloaded', () => win && win.webContents.send('upd', 'done', 1));
}
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({ width: 1100, height: 720, minWidth: 700, backgroundColor: '#050505', title: 'ARISE', icon: path.join(__dirname, 'renderer/assets/icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true } });
  win.loadFile('renderer/index.html');
});
app.on('window-all-closed', () => app.quit());
