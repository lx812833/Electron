/**
 * createTray：托盘
 */

import path from 'path';
import { BrowserWindow, Menu, shell, Tray } from 'electron';

export default (mainWindow: BrowserWindow) => {
  const tray = new Tray(
    path.resolve(__dirname, process.platform == 'darwin' ? '../../resources/trayTemplate@2x.png' : '../../resources/windowTray.png')
  );

  const contextMenu = Menu.buildFromTemplate([
    { label: '退出程序', role: 'quit' },
    { type: 'separator' },
    { label: '问题反馈', click: () => shell.openExternal('https://www.bilibili.com/') }
  ]);

  tray.on('click', () => {
    mainWindow.show();
  })
  tray.setToolTip('application');
  tray.setContextMenu(contextMenu);
}