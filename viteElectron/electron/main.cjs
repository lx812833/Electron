const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    alwaysOnTop: true,
  })

  mainWindow.loadURL("http://127.0.0.1:5173/");
}

app.whenReady().then(() => {
  createWindow();
})