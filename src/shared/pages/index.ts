import { app, BrowserWindow, ipcMain, dialog, webContents } from 'electron';
import path from 'path';
import { is } from '@electron-toolkit/utils';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  }

  
  if (is.dev) mainWindow.webContents.openDevTools({ mode: 'detach' });
}


ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  const printers = await mainWindow.webContents.getPrintersAsync();
  return printers.map(p => ({ name: p.name, isDefault: p.isDefault }));
});

ipcMain.handle('read-pdf-file', async (event, filePath: string) => {
  try {
    const fs = require('fs').promises;
    const buffer = await fs.readFile(filePath);
    return new Uint8Array(buffer);
  } catch (err) {
    console.error('Erro ao ler arquivo no main:', err);
    throw err;
  }
});

ipcMain.handle('open-pdf-dialog', async () => {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return canceled ? null : filePaths;
});

ipcMain.handle('print-pdf', async (_event, options) => {
  if (!mainWindow) return;
 
  console.log('Imprimindo com opções:', options);

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