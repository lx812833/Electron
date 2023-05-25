import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

/**
 * 在渲染进程中，使用 contextBridge.exposeInMainWorld 将 ipcRenderer 对象暴露给全局作用域时，
 * 为了避免将所有 Electron 的 API 都暴露给渲染进程，我们需要通过 window 对象来访问暴露出来的 API，而不是直接访问全局对象，这可以提高安全性。
 * 
 * 例如，如果我们在渲染进程中直接访问全局对象，就可以使用 require('electron') 来直接获取到 ipcRenderer 对象，
 * 然后就可以通过这个对象发送任意消息给主进程，这可能会导致安全问题。
 * 但是，如果我们使用 contextBridge 将 ipcRenderer 对象暴露给全局作用域，并通过 window 对象来访问，
 * 那么在渲染进程中就只能访问到暴露出来的 API，而无法直接访问 Electron 的其他 API，这可以提高安全性，防止恶意代码的执行。
 */

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
  selectFile: () => ipcRenderer.invoke('selectFile'),
  // 保存文件
  saveFile: (val: any) => ipcRenderer.invoke('saveFile', val),
  // 设置light/dark模式
  modeToggle: () => ipcRenderer.invoke('modeToggle'),
  modeSystem: () => ipcRenderer.invoke('modeSystem'),
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
