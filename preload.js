const { contextBridge, ipcRenderer } = require('electron');
const I = c => (...a) => ipcRenderer.invoke(c, ...a);
contextBridge.exposeInMainWorld('arise', {
  load: I('load'), save: I('save'), reset: I('reset'), questComplete: I('questComplete'), keys: I('keys'), setKey: I('setKey'), coach: I('coach'), chat: I('chat'),
  ver: I('ver'), info: I('info'), uCheck: I('uCheck'), uGet: I('uGet'), uInstall: I('uInstall'),
  onU: cb => ipcRenderer.on('upd', (e, t, v) => cb(t, v))
});
