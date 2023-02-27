import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// 为渲染进程暴露API Custom APIs for renderer
// 该API用于向主进程传递事件
const api = {
  setTitle: (title: string) => ipcRenderer.send('setTitle', title),
  // 为渲染进程设置接口，用于接收主进程的消息
  incrementNumber: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('increment', callback),
  // 双向通信
  show: (val: any) => {
    return ipcRenderer.invoke('mainShow', val)
  },
  // 自定义右键菜单
  showContextMenu: () => ipcRenderer.send('showContextMenu'),
  // 选择文件
  selectFile: () => { return ipcRenderer.invoke('selectFile') },
  // 保存文件
  saveFile: (val: any) => { return ipcRenderer.invoke('saveFile', val) },
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
