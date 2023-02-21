const { BrowserWindow, app } = require("electron");
const path = require("path");

// 创建窗口（主进程---Electron运行环境）
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    x: 1500,
    y: 1000,
    width: 300,
    height: 300,
    alwaysOnTop: true
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
  app.on("window-all-closed", () => {
    if(process.platform != "darwin") {
      app.quit();
    }
  })

  // macOS 激活时事件
  app.on("activate", () => {
    createWindow();
  })
})