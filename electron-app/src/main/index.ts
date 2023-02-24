import { app, shell, ipcMain, Menu, BrowserWindow, screen, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

// 是否是苹果系统
const isMac = process.platform === 'darwin';

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x: screen.getPrimaryDisplay().workAreaSize.width - 900,
    y: 0,
    width: 700,
    height: 450,
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

  // 如果应用过于复杂，在加载本地资源时出现白屏，这时可以监测窗口的 ready-to-show 事件
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  })

  // 使用 shell 模块，用操作系统的默认浏览器打开网页链接
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

  applicationMenu(mainWindow);


  mainWindow.webContents.openDevTools();
  // 将窗口移动到屏幕中心
  // mainWindow.center();
}

// 创建菜单
const applicationMenu = (mainWindow: BrowserWindow) => {
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

// 自定义右键消息框菜单
const messageBox = async () => {
  const result = await dialog.showMessageBox({
    type: 'warning',
    message: '你要退出吗？',
    detail: '有问题可以访问后盾人网站',
    buttons: ['取消', '退出'],
    // 取消按钮的索引，使用esc根据索引调用取消按钮，默认为0，所以建议在buttons中将取消设置为第一个
    cancelId: 0,
    checkboxLabel: '接收协议',
    checkboxChecked: false,
  })
  if (!result.checkboxChecked) {
    return dialog.showErrorBox('通知', '你没有接收协议');
  }
  if (result.response === 1) {
    app.quit();
  }
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
    dialog.showErrorBox("通知", value);
  })

  // 自定义右键菜单
  ipcMain.on('showContextMenu', (event) => {
    const popupMenuTemplate = [
      { label: '退出', click: () => app.quit() },
      { type: 'separator' },
      { label: '消息框', click: () => messageBox() }
    ]
    // @ts-ignore (define in dts)
    const popupMenu = Menu.buildFromTemplate(popupMenuTemplate);
    // @ts-ignore (define in dts)
    popupMenu.popup(BrowserWindow.fromWebContents(event.sender));
  })

  // 为一个 invokeable的IPC 添加一个handler。 
  // 每当一个渲染进程调用 ipcRenderer.invoke(channel, ...args) 时这个处理器就会被调用
  // 如果 listener 返回一个 Promise，那么 Promise 的最终结果就是远程调用的返回值。 否则， 监听器的返回值将被用来作为应答值。

  ipcMain.handle('mainShow', async (_event, ...args) => {
    // const result = await somePromise(..._args);
    // return result;
    return args[0];
  })

  // 选择文件
  ipcMain.handle('selectFile', () => {
    return dialog.showOpenDialog({
      message: '选择文件',
      // 默认路径，默认选择的文件
      defaultPath: '微信图片_20221103132225.jpg',
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
