import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  login: () => ipcRenderer.invoke('login'),
  startControl: (res: String) => ipcRenderer.send('start-control', res),
  controlStateChange: (callback: () => void) => ipcRenderer.on('control-state-change', callback),
  controlStateRemove: (callback: () => void) => ipcRenderer.removeListener('control-state-change', callback),
  controlCallBack: (res: String) => ipcRenderer.send('control-call-back', res),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}