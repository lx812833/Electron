const path = require("path");
const { Menu, Tray } = require("electron");

const createTray = (mainWindow) => {
  const tray = new Tray(path.join(__dirname, "./icons/logo.png"));

  const contextMenu = Menu.buildFromTemplate([{ label: "退出程序", role: "quit" }]);

  tray.on("click", () => {
    mainWindow.show();
  })

  tray.setContextMenu(contextMenu);
  tray.setTitle("傲雄DEMO管理系统");
  tray.setToolTip("傲雄DEMO管理系统");
}

module.exports = {
  createTray
}
