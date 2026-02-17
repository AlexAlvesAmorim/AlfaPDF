import { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut } from 'electron';
import path from 'path';
import { is } from '@electron-toolkit/utils';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const isDev = is.dev;

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: isDev
    },
  });

  Menu.setApplicationMenu(null);

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../renderer/dist/index.html')
    );
  }

  if (!isDev) {

    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });

    mainWindow.webContents.on('context-menu', (e) => {
      e.preventDefault();
    });

    app.whenReady().then(() => {
      globalShortcut.register('CommandOrControl+R', () => {});
      globalShortcut.register('F5', () => {});
    });
  }
}


ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  const printers = await mainWindow.webContents.getPrintersAsync();
  return printers.map(p => ({
    name: p.name,
    isDefault: p.isDefault
  }));
});

ipcMain.handle('read-pdf-file', async (_event, filePath: string) => {
  try {
    const fs = require('fs').promises;
    const buffer = await fs.readFile(filePath);
    return new Uint8Array(buffer);
  } catch (err) {
    throw err;
  }
});

ipcMain.handle('open-pdf-dialog', async () => {
  if (!mainWindow) return null;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  return canceled ? null : filePaths[0];
});

ipcMain.handle('print-pdf', async (_event, options) => {
  if (!mainWindow) return;
  return { success: true };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
