const { BrowserWindow, app } = require("electron");
const path = require("path");

/**
 * app模块：控制应用程序的事件生命周期
 * BrowserWindow模块：创建和管理应用程序窗口。
*/

/**
 * preload预加载：某一个渲染进程，在页面加载之前加载一个本地脚本，这个脚本能调用所有Node API、能调用window工具
 * 要将此脚本附加到渲染器流程，在现有的 BrowserWindow 构造器中将路径中的预加载脚本传入 webPreferences.preload 选项
*/

// 创建窗口（主进程---Electron运行环境）
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    x: 1500,
    y: 100,
    width: 300,
    height: 300,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, './frontEnd/preload.js')
    }
  })

  // 嵌入网页
  // mainWindow.loadURL("https://www.bilibili.com/?spm_id_from=333.1007.0.0")

  // 嵌入本地页面（渲染进程---浏览器运行环境）
  mainWindow.loadFile(path.resolve(__dirname, "index.html"));
  // 打开开发者工具
  // mainWindow.webContents.toggleDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // 当所有的窗口都被关闭时触发
  // 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
  // 对应用程序和它们的菜单栏来说应该时刻保持激活状态, 
  // 直到用户使用 Cmd + Q 明确退出
  app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
      app.quit();
    }
  })

  // macOS 激活时事件
  app.on("activate", () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口，点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})