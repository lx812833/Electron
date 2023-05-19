import { app, shell, BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import autoUpdater from './autoUpdater';
import appMenu from './appMenu';
import createTray from './tray';
import './contextMenu';
import './ipcMain';

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x: screen.getPrimaryDisplay().workAreaSize.width - 900,
    y: 100,
    width: 700,
    height: 450,
    show: false,
    frame: true, // 创建一个无边框窗口
    transparent: false, // 使窗口 透明, 仅在无边框窗口下起作用
    skipTaskbar: true, // 是否在任务栏中显示窗口（false）
    alwaysOnTop: false, // 窗口是否永远在别的窗口的上面
    // autoHideMenuBar: true, // 自动隐藏菜单栏（false）
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      sandbox: false, // 关闭沙盒模式，为false 时 preload.js 可以使用nodejs、electron的高级api，如fs模块
      /**
       * contextIsolation：
       *  上下文隔离（关闭上下文隔离后，Web 渲染器进程中可以使用electron与node api等部分高级api）
       *  否则，从预加载脚本公开 API 的唯 方法是通过 contextBridge API
       *  禁用上下文隔离后 contextIsolation: false，
       *  在preload.js中则不需要使用 contextBridge.exposeInMainWorld 向renderer.js 中提高接口了
      */
      contextIsolation: true,
      /**
       * nodeIntegration：
       *   当有此属性时, webview 中的访客页（guest page）将具有Node集成, 
       *   并且可以使用像 require 和 process 这样的node APIs 去访问低层系统资源。 
       *   Node 集成在访客页中默认是禁用的。 
       * 
       *  通过修改 main.js 中的 nodeIntegration 配置，
       *  来开启node支持，这时就可以在preload.js或renderer.js中使用fs 等高级模块
      */
      nodeIntegration: false,
      preload: join(__dirname, '../preload/index.js'),
    }
  })

  // 将窗口移动到屏幕中心
  mainWindow.center();

  // 调试
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }

  // 如果应用过于复杂，在加载本地资源时出现白屏，这时可以监测窗口的 ready-to-show 事件
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  })

  // 更新下载
  autoUpdater(mainWindow);

  // 菜单
  appMenu(mainWindow);

  // 托盘
  createTray();

  // 使用 shell 模块，从渲染进程打开窗口，用操作系统的默认浏览器打开网页链接
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    // action: deny 拒绝electron新建窗口打开
    // action: allow 允许electron新建窗口打开
    return { action: 'deny' };
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// 只有在 app 模块的 ready 事件被激发后才能创建浏览器窗口
// 使用 app.whenReady() API来监听此事件
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  })

  createWindow();

  app.on('activate', function () {
    // macOS 应用通常即使在没有打开任何窗口的情况下也继续运行，并且在没有窗口可用的情况下激活应用时会打开新的窗口。
    // 如果没有窗口打开则打开一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
})

// 关闭所有窗口时退出应用 (Windows & Linux)
// Cmd + Q（快捷键退出）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})
