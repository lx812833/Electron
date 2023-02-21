const { BrowserWindow, app } = require("electron");
const path = require("path");

// 创建窗口
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

  // 嵌入本地页面
  mainWindow.loadFile(path.resolve(__dirname, "index.html"));
})