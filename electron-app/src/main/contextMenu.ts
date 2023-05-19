/**
 * contextMenu：自定义右键菜单
 */

import { app, ipcMain, Menu, MenuItemConstructorOptions, dialog, shell } from 'electron';

ipcMain.on('showContextMenu', () => {
  const template = [
    {
      label: '退出程序',
      click: () => app.quit()
    },
    { type: 'separator' },
    {
      label: '消息框',
      click: () => setMessageBox()
    },
    { type: 'separator' },
    {
      label: '访问官网',
      click: () => shell.openExternal('https://www.bilibili.com/')
    }
  ] as MenuItemConstructorOptions[]

  const menu = Menu.buildFromTemplate(template);
  menu.popup();
})

const setMessageBox = async () => {
  const result = await dialog.showMessageBox({
    type: 'warning',
    message: '你要退出吗？',
    detail: '有问题去摸摸鱼吧',
    buttons: ['取消', '退出'],
    // 取消按钮的索引，使用esc根据索引调用取消按钮，默认为0，所以建议在buttons中将取消设置为第一个
    cancelId: 0,
    checkboxLabel: '接收协议',
    checkboxChecked: false,
  })
  if (!result.checkboxChecked) {
    return dialog.showErrorBox('通知', '你还没有去摸鱼');
  }
  if (result.response === 1) {
    app.quit();
  }
}