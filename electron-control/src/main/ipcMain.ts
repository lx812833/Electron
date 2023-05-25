import { ipcMain, BrowserWindow } from 'electron';

export default (mainWindow: BrowserWindow) => {
  ipcMain.handle('login', async () => {
    const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    return code;
  })

  ipcMain.on('start-control', (_, res) => {
    mainWindow.webContents.send('control-state-change', {
      name: res,
      type: 1
    });
  })
}