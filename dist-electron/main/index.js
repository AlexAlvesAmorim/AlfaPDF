import { app, BrowserWindow, Menu } from 'electron'

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  Menu.setApplicationMenu(null)

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow)
