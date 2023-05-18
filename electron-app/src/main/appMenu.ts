/**
 * applicationMenu：创建菜单
 */

import { app, Menu, BrowserWindow } from 'electron';

export default (mainWindow: BrowserWindow) => {
  // 是否是苹果系统
  // win32 (Windows), linux (Linux) 和 darwin (macOS) 
  const isMac = process.platform === 'darwin';

  const menu = Menu.buildFromTemplate([
    {
      label: 'bilibili',
      submenu: [
        {
          label: '打开新窗口',
          click: () => {
            const win = new BrowserWindow({
              width: 300,
              height: 300,
            })
            win.loadURL('https://www.bilibili.com/')
          },
        },
        {
          type: 'separator', // 分割线
        },
        {
          label: '增加', // 渲染进程触发主进程通信
          click: () => mainWindow.webContents.send('increment', 1),
        },
        {
          label: '退出',
          click: async () => app.quit(),
          accelerator: 'CommandOrControl+q',  // 定义快捷键
        },
        isMac ? { label: '关闭', role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: '在线网站',
      submenu: [
        {
          label: '哔哩哔哩',
        },
      ],
    },
  ])

  Menu.setApplicationMenu(menu);
}