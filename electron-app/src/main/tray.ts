/**
 * createTray：托盘
 */

import path from 'path';
import { Menu, shell, Tray } from 'electron';

export default () => {
  const tray = new Tray(
    path.resolve(__dirname, process.platform == 'darwin' ? '../../resources/trayTemplate@2x.png' : '../../resources/windowTray.png')
  );

  const contextMenu = Menu.buildFromTemplate([
    { label: '退出程序', role: 'quit' },
    { type: 'separator' },
    { label: '问题反馈', click: () => shell.openExternal('https://www.bilibili.com/') }
  ]);

  tray.setToolTip('application');
  tray.setContextMenu(contextMenu);
}