import { app, shell, ipcMain, Menu, BrowserWindow } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    // autoHideMenuBar: true,
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // 创建菜单
  const menu = Menu.buildFromTemplate([
    {
      label: '菜单',
      submenu: [
        {
          click: () => mainWindow.webContents.send('increment', 1),
          label: '增加',
        },
      ],
    },
  ])

  Menu.setApplicationMenu(menu);

  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
    console.log('最后结果是：' + value);
  })

  // 为一个 invokeable的IPC 添加一个handler。 
  // 每当一个渲染进程调用 ipcRenderer.invoke(channel, ...args) 时这个处理器就会被调用
  // 如果 listener 返回一个 Promise，那么 Promise 的最终结果就是远程调用的返回值。 否则， 监听器的返回值将被用来作为应答值。

  ipcMain.handle('mainShow', async (_event, ...args) => {
    // const result = await somePromise(..._args);
    // return result;
    return args[0];
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
