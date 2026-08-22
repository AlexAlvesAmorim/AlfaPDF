import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater, UpdateInfo } from 'electron-updater'
import * as fs from 'fs'
import * as path from 'path'
import { PDFDocument } from 'pdf-lib'
import type { PrintOptions, PrintSettings } from '../shared/types/types'
import { parsePageRanges } from '../shared/utils/pageRanges'
import {
  addRecentFile,
  clearRecentFiles,
  getRecentFiles,
  loadSettings,
  saveSettings,
} from './settings'

// Necessário para o pipeline de impressão carregar o pdf.js local via file://
app.commandLine.appendSwitch('allow-file-access-from-files')

let mainWindow: BrowserWindow | null = null

function getPdfPathFromArgs(argv: string[]): string | null {
  for (const raw of argv) {
    let candidate = raw.trim()

    if (candidate.startsWith('"') && candidate.endsWith('"')) {
      candidate = candidate.slice(1, -1)
    }

    if (candidate.toLowerCase().startsWith('file://')) {
      try {
        candidate = decodeURIComponent(new URL(candidate).pathname)
        candidate = candidate.replace(/^\/([A-Za-z]:)/, '$1')
      } catch {
        continue
      }
    }

    if (!candidate.toLowerCase().endsWith('.pdf')) continue

    const resolved = path.isAbsolute(candidate)
      ? candidate
      : path.resolve(process.cwd(), candidate)

    if (fs.existsSync(resolved)) return resolved
  }

  return null
}

let pendingPdfPath: string | null = getPdfPathFromArgs(process.argv)

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const pdfPath = getPdfPathFromArgs(argv)

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      if (pdfPath) {
        sendPdfToRenderer(pdfPath)
      }
    }
  })
}

async function sendPdfToRenderer(pdfPath: string): Promise<void> {
  if (!mainWindow) return

  try {
    if (mainWindow.webContents.isLoading()) {
      await new Promise<void>((resolve) => {
        mainWindow?.webContents.once('did-finish-load', () => resolve())
      })
    }

    const buffer = await fs.promises.readFile(pdfPath)
    const fileName = path.basename(pdfPath)

    addRecentFile(pdfPath)
    app.addRecentDocument(pdfPath)

    mainWindow.webContents.send('open-pdf-from-system', { buffer: new Uint8Array(buffer), fileName })
  } catch (err) {
    console.error('[OPEN-PDF] Erro ao ler PDF do sistema:', err)
  }
}

function parsePageRangesInMain(input: string, totalPages: number): number[] {
  return parsePageRanges(input, totalPages)
}

async function copyPdfjsToTemp(tmpDir: string): Promise<void> {
  const pdfjsRoot = path.join(app.getAppPath(), 'node_modules', 'pdfjs-dist', 'build')

  await fs.promises.writeFile(
    path.join(tmpDir, 'pdf.mjs'),
    await fs.promises.readFile(path.join(pdfjsRoot, 'pdf.mjs'))
  )
  await fs.promises.writeFile(
    path.join(tmpDir, 'pdf.worker.mjs'),
    await fs.promises.readFile(path.join(pdfjsRoot, 'pdf.worker.mjs'))
  )
}

async function openPdfInPrintWindow(
  options: PrintOptions & { file: Uint8Array; password?: string }
): Promise<BrowserWindow | null> {
  const tmpDir = fs.mkdtempSync(path.join(app.getPath('temp'), 'alfa-print-'))
  const tmpHtmlPath = path.join(tmpDir, 'index.html')
  let printWin: BrowserWindow | null = null

  try {
    const qualityScale = options.printQuality === 'draft' ? 1.0
      : options.printQuality === 'high' ? 3.0
      : 2.0

    const totalPages = await (async () => {
      try {
        const pdfDoc = await PDFDocument.load(Buffer.from(options.file), {
          ignoreEncryption: true,
        })
        return pdfDoc.getPageCount()
      } catch {
        return 0
      }
    })()

    let pagesToRender: number[]
    let renderAll = false

    if (options.pageRange === 'current') {
      pagesToRender = [options.currentPage ?? 1]
    } else if (options.pageRange === 'custom' && options.customPages) {
      pagesToRender = totalPages > 0
        ? parsePageRangesInMain(options.customPages, totalPages)
        : parsePageRangesInMain(options.customPages, Number.MAX_SAFE_INTEGER)
    } else {
      pagesToRender = totalPages > 0
        ? Array.from({ length: totalPages }, (_, i) => i + 1)
        : []
      renderAll = totalPages <= 0
    }

    await copyPdfjsToTemp(tmpDir)

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: white; }
    canvas { display: block; page-break-after: always; }
    @media print {
      canvas { page-break-after: always; margin: 0; }
    }
  </style>
</head>
<body>
  <div id="container"></div>
  <script>
    const { ipcRenderer } = require('electron');

    (async () => {
      try {
        const pdfjsLib = await import('./pdf.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.mjs';

        const payload = await new Promise((resolve) => {
          ipcRenderer.once('print-window-payload', (_event, data) => resolve(data));
          ipcRenderer.send('print-window-ready');
        });

        const { bytes, password, pagesToRender, renderAll, renderScale } = payload;

        const loadingTask = pdfjsLib.getDocument({
          data: bytes,
          ...(password ? { password } : {}),
        });

        const pdf = await loadingTask.promise;
        const container = document.getElementById('container');

        const list = renderAll
          ? Array.from({ length: pdf.numPages }, (_, i) => i + 1)
          : pagesToRender;

        for (const pageNum of list) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: renderScale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          container.appendChild(canvas);

          await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport,
            background: 'white',
          }).promise;
        }

        ipcRenderer.send('pdf-render-complete');
      } catch (err) {
        console.error('[PRINT] Erro ao renderizar:', err);
        ipcRenderer.send('pdf-render-complete');
      }
    })();
  </script>
</body>
</html>`

    fs.writeFileSync(tmpHtmlPath, htmlContent, 'utf-8')

    printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: false,
        contextIsolation: false,
        nodeIntegration: true,
        webSecurity: true,
      },
    })

    let payloadDelivered = false
    const deliverPayload = () => {
      if (payloadDelivered) return
      payloadDelivered = true
      printWin?.webContents.send('print-window-payload', {
        bytes: options.file,
        password: options.password ?? null,
        pagesToRender,
        renderAll,
        renderScale: qualityScale,
      })
    }

    ipcMain.once('print-window-ready', () => {
      if (printWin?.webContents.isLoading()) {
        printWin.webContents.once('did-finish-load', deliverPayload)
      } else {
        deliverPayload()
      }
    })

    await printWin.loadFile(tmpHtmlPath)

    await new Promise<void>((resolve) => {
      ipcMain.once('pdf-render-complete', () => resolve())
      setTimeout(() => { if (!payloadDelivered) deliverPayload() }, 1500)
      setTimeout(resolve, 20000)
    })

    return printWin
  } catch {
    if (printWin && !printWin.isDestroyed()) printWin.close()
    return null
  } finally {
    setTimeout(() => {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { void 0 }
    }, 10000)
  }
}

async function buildFilteredPdf(
  options: PrintOptions & { file: Uint8Array; password?: string }
): Promise<Uint8Array> {
  const originalBuffer = Buffer.from(options.file)

  const pdfDoc = await PDFDocument.load(originalBuffer, {
    ignoreEncryption: true,
  })

  const totalPages = pdfDoc.getPageCount()

  let pagesToInclude: number[]

  if (options.pageRange === 'current') {
    pagesToInclude = [options.currentPage ?? 1]
  } else if (options.pageRange === 'custom' && options.customPages) {
    pagesToInclude = parsePageRanges(options.customPages, totalPages)
  } else {
    pagesToInclude = Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const newDoc = await PDFDocument.create()
  const copiedPages = await newDoc.copyPages(pdfDoc, pagesToInclude.map(p => p - 1))
  copiedPages.forEach(page => newDoc.addPage(page))

  return newDoc.save()
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    if (pendingPdfPath) {
      sendPdfToRenderer(pendingPdfPath)
      pendingPdfPath = null
    }
  })

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  } else if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('open-pdf-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })
  return result.filePaths
})

ipcMain.handle('read-pdf-file', async (_event, filePath: string) => {
  const buffer = fs.readFileSync(filePath)
  addRecentFile(filePath)
  app.addRecentDocument(filePath)
  return buffer.toString('base64')
})

ipcMain.handle('get-recent-documents', () => getRecentFiles())

ipcMain.handle('clear-recent-documents', () => {
  clearRecentFiles()
  app.clearRecentDocuments()
  return true
})

ipcMain.handle('get-printers', async () => {
  if (!mainWindow) {
    return []
  }

  const printers = await mainWindow.webContents.getPrintersAsync()

  return printers.map(p => ({
    name: p.name,
  }))
})

ipcMain.handle(
  'print-silent',
  async (_event, options: PrintOptions & { file: Uint8Array; password?: string }) => {
    if (!options.printerName) {
      return { success: false, error: 'Nenhuma impressora selecionada.' }
    }

    const printWin = await openPdfInPrintWindow(options)
    if (!printWin) return { success: false, error: 'Falha ao preparar janela de impressão.' }

    try {
      return await new Promise((resolve) => {
        printWin.webContents.print(
          {
            silent: true,
            printBackground: true,
            deviceName: options.printerName,
            copies: options.copies || 1,
            color: options.color !== false,
          },
          (success, errorType) => {
            resolve({ success, error: success ? null : errorType })
          }
        )
      })
    } finally {
      if (!printWin.isDestroyed()) printWin.close()
    }
  }
)

ipcMain.handle(
  'save-as-pdf',
  async (_event, options: PrintOptions & { file: Uint8Array; password?: string }) => {
    if (options.password) {
      return {
        success: false,
        error: 'PDFs protegidos por senha não podem ser salvos diretamente pelo aplicativo. Use "Imprimir" e selecione "Microsoft Print to PDF" como impressora.',
      }
    }

    try {
      const pdfBytes = await buildFilteredPdf(options)

      const { filePath: savePath, canceled } = await dialog.showSaveDialog({
        title: 'Salvar PDF',
        defaultPath: path.join(app.getPath('documents'), 'documento.pdf'),
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation'],
      })

      if (canceled || !savePath) {
        return { success: false, canceled: true }
      }

      fs.writeFileSync(savePath, Buffer.from(pdfBytes))

      return { success: true, path: savePath }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[save-as-pdf] Erro:', message)
      return { success: false, error: message }
    }
  }
)

ipcMain.handle('get-app-version', () => app.getVersion())

// === CONFIGURAÇÕES (persistência) ========================================
// As preferências de impressão são memorizadas e reutilizadas no próximo
// print, até que o usuário as altere novamente.

ipcMain.handle('get-print-settings', () => loadSettings().print)

ipcMain.handle(
  'save-print-settings',
  (_event, print: Partial<PrintSettings>) => {
    saveSettings({ print })
    return true
  }
)

// === AUTO-UPDATE (GitHub Releases) ========================================
// Fluxo: ao iniciar, verifica update -> baixa em background -> notifica renderer.
// O usuario pode instalar imediatamente ("Instalar agora") ou ao fechar o app.
// autoUpdaterrega o canal "latest" do GitHub Releases por padrao.

let updateDownloaded = false
let pendingUpdateInfo: UpdateInfo | null = null

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function notifyRenderer(channel: string, payload?: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload)
  }
}

autoUpdater.on('checking-for-update', () => {
  console.log('[autoUpdater] Verificando atualizacoes...')
  notifyRenderer('update-checking')
})

autoUpdater.on('update-available', (info: UpdateInfo) => {
  console.log('[autoUpdater] Atualizacao disponivel:', info.version)
  notifyRenderer('update-available', { version: info.version, releaseNotes: info.releaseNotes })
})

autoUpdater.on('update-not-available', (info: UpdateInfo) => {
  console.log('[autoUpdater] Aplicativo atualizado:', info.version)
  notifyRenderer('update-not-available', { version: info.version })
})

autoUpdater.on('download-progress', (progress) => {
  notifyRenderer('update-progress', {
    percent: Math.round(progress.percent),
    transferred: progress.transferred,
    total: progress.total,
  })
})

autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
  console.log('[autoUpdater] Atualizacao baixada:', info.version)
  updateDownloaded = true
  pendingUpdateInfo = info
  notifyRenderer('update-downloaded', { version: info.version })
})

autoUpdater.on('error', (err: Error) => {
  console.error('[autoUpdater] Erro:', err.message)
  notifyRenderer('update-error', { message: err.message })
})

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    return result != null
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[check-for-updates] Erro:', message)
    return false
  }
})

ipcMain.handle('quit-and-install', async () => {
  if (!updateDownloaded) return false
  // Fechar todas as janelas antes de instalar evita avisos
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close()
  }
  // O quitAndInstall do electron-updater executa o instalador baixado.
  // Como o app foi instalado em Program Files (requer admin), o update também precisa.
  // autoInstallOnAppQuit=true instala ao fechar o app (menos intrusivo).
  autoUpdater.quitAndInstall()
  return true
})

ipcMain.handle('get-update-status', () => ({
  downloaded: updateDownloaded,
  version: pendingUpdateInfo?.version ?? null,
}))




ipcMain.handle(
  'print-native',
  async (_event, options: PrintOptions & { file: Uint8Array; password?: string }) => {
    const printWin = await openPdfInPrintWindow(options)
    if (!printWin) return { success: false, error: 'Falha ao preparar janela de impressão.' }

    try {
      return await new Promise((resolve) => {
        printWin.webContents.print(
          {
            silent: false,
            printBackground: true,
            copies: options.copies || 1,
            color: options.color !== false,
          },
          (success, errorType) => {
            resolve({ success, error: success ? null : errorType })
          }
        )
      })
    } finally {
      if (!printWin.isDestroyed()) printWin.close()
    }
  }
)

app.whenReady().then(() => {
  createWindow()
  // Verifica atualizacao apos janela carregar completamente
  // Isso garante que o renderer esteja pronto para receber eventos IPC
  if (mainWindow) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch((err: Error) => {
          console.error('[autoUpdater] Falha na verificacao inicial:', err.message)
        })
      }, 1000)
    })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})



app.on('open-file', (event, filePath) => {
  event.preventDefault()
  if (mainWindow) {
    sendPdfToRenderer(filePath)
  } else {
    pendingPdfPath = filePath
  }
})