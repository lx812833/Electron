import { ipcMain } from 'electron';

ipcMain.handle('login', async () => {
  const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  return code;
})