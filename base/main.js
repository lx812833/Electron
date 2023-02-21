const { BrowserWindow, app } = require("electron");
const path = require("path");

// 创建窗口（主进程---Electron运行环境）
app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    x: 1500,
    y: 100,
    width: 300,
    height: 300,
    alwaysOnTop: true
  })

  // 嵌入网页
  // mainWindow.loadURL("https://www.bilibili.com/?spm_id_from=333.1007.0.0")

  // 嵌入本地页面（渲染进程---浏览器运行环境）
  mainWindow.loadFile(path.resolve(__dirname, "index.html"));
  // 打开开发者工具
  mainWindow.webContents.toggleDevTools();
})