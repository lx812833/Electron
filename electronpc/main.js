const { app, shell, screen, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const { createTray } = require("./tray"); // 托盘
const { windowMove } = require("./windowMove"); // 拖动

let mainWindow;
const createWindow = () => {
  // 创建浏览窗口
  mainWindow = new BrowserWindow({
    x: screen.getPrimaryDisplay().workAreaSize.width - 900,
    y: 100,
    width: 900,
    height: 670,
    show: false,
    frame: false,
    icon: path.join(__dirname, "./icons/logo.png"),
    skipTaskbar: true,
    autoHideMenuBar: true,
    useContentSize: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      allowCrossOrigin: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js")
    }
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  })

  mainWindow.loadURL("http://192.168.1.12:8080/#/");

  // 最大化
  // mainWindow.maximize();

  // 打开开发工具
  mainWindow.webContents.openDevTools();

  // 将窗口移动到屏幕中心
  mainWindow.center();

  // 托盘
  createTray(mainWindow);

  // 拖动
  windowMove(mainWindow);

  process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态, 
// 直到用户使用 Cmd + Q 明确退出
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
})

ipcMain.on("window-min", () => {
  mainWindow.minimize();
});

ipcMain.on("window-max", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on("window-close", () => {
  mainWindow.destroy();
});