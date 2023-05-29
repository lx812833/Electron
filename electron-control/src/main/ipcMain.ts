import { join } from 'path';
import { ipcMain, BrowserWindow } from 'electron';

export default (mainWindow: BrowserWindow) => {
  ipcMain.handle('login', async () => {
    const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    return code;
  })

  ipcMain.on('start-control', (_, remoteCode) => {
    mainWindow.webContents.send('control-state-change', {
      name: remoteCode,
      type: 1
    });

    const childWin = new BrowserWindow({
      width: 1000,
      height: 680,
    });
    childWin.loadFile(join(__dirname, '../renderer/src/control/index.html'));
  })
}