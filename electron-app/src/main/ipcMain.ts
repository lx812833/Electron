import { app, ipcMain, BrowserWindow, nativeTheme, dialog, Notification } from 'electron'
import { writeFileSync } from 'fs';

// 退出应用
ipcMain.on('quit', () => {
  app.quit()
})

// 设置light/dark模式（nativeTheme 对象执行 深色模式 变更）
ipcMain.handle('modeToggle', async () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light';
  } else {
    nativeTheme.themeSource = 'dark';
  }
  return nativeTheme.shouldUseDarkColors;
})

// 主进程事件监听
ipcMain.on('setTitle', (event, title) => {
  // 获取用于控制网页的webContents对象
  const webContents = event.sender;
  // 获取窗口
  const window = BrowserWindow.fromWebContents(webContents) as Electron.BrowserWindow;
  // 设置窗口标题
  window.setTitle(title);
})

ipcMain.on('finish', (_event, value) => {
  dialog.showErrorBox("通知", value);
})

// 为一个 invokeable的IPC 添加一个handler。 
// 每当一个渲染进程调用 ipcRenderer.invoke(channel, ...args) 时这个处理器就会被调用
// 如果 listener 返回一个 Promise，那么 Promise 的最终结果就是远程调用的返回值。 否则， 监听器的返回值将被用来作为应答值。

ipcMain.handle('mainShow', async (_event, ...args) => {
  // const result = await somePromise(..._args);
  // return result;
  new Notification({
    title: 'Notification通知',
    body: '得每天早8点签到',
  }).show();

  return args[0];
})

// 选择文件
ipcMain.handle('selectFile', () => {
  return dialog.showOpenDialog({
    message: '选择文件',
    // 默认路径，默认选择的文件
    // defaultPath: '微信图片_20221103132225.jpg',
    // properties: ['openFile', 'openDirectory', 'multiSelections',],
    // 文件类型限制
    filters: [
      {
        name: 'images',
        extensions: ['jpg', 'png', 'gif'],
      },
    ]
  })
})

// 保存文件
ipcMain.handle('saveFile', async (_event, file) => {
  const result = await dialog.showSaveDialog({
    // 对话框窗口的标题
    title: '保存文件',
  })

  if (result.filePath) {
    writeFileSync(result.filePath, file[0]);
  }
})