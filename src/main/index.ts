import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { PDFDocument } from 'pdf-lib'
import type { PrintOptions } from '../shared/types/types'

let mainWindow: BrowserWindow | null = null

function parsePageRanges(input: string, totalPages: number): number[] {
  const pages = new Set<number>()

  for (const part of input.split(',')) {
    const trimmed = part.trim()

    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        if (i >= 1) pages.add(i)
      }
    } else {
      const n = Number(trimmed)
      if (n >= 1 && n <= totalPages) pages.add(n)
    }
  }

  return Array.from(pages).sort((a, b) => a - b)
}

async function buildFilteredPdf(
  options: PrintOptions & { file: Uint8Array; password?: string }
): Promise<Uint8Array> {
  const originalBuffer = Buffer.from(options.file)
  console.log('[PRINT] password:', options.password)

  const pdfDoc = await PDFDocument.load(originalBuffer, {
    ignoreEncryption: true, // 👈
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
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  } else {
    mainWindow.loadURL('http://localhost:5173')
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }
}

// IPC'S


ipcMain.handle('open-pdf-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })
  return result.filePaths
})

ipcMain.handle('read-pdf-file', async (_event, filePath: string) => {
  const buffer = fs.readFileSync(filePath)
  return buffer.toString('base64')
})

ipcMain.handle('get-printers', async () => {
  console.log('[PRINTERS] Handler chamado')

  if (!mainWindow) {
    console.log('[PRINTERS] mainWindow null')
    return []
  }

  const printers = await mainWindow.webContents.getPrintersAsync()
  console.log('[PRINTERS] Encontradas:', printers.length)

  return printers.map(p => ({
    name: p.name,
    isDefault: p.isDefault,
  }))
})

ipcMain.handle(
  'print-silent',
  async (_event, options: PrintOptions & { file: Uint8Array; password?: string }) => {
    const tmpHtmlPath = path.join(app.getPath('temp'), `alfa-print-${Date.now()}.html`)
    let printWin: BrowserWindow | null = null

    try {
      const printerName = options.printerName
      if (!printerName) throw new Error('Nenhuma impressora selecionada.')

      // Envia o PDF ORIGINAL (ainda criptografado) — o PDF.js descriptografa no client
      const pdfBase64 = Buffer.from(options.file).toString('base64')

      // Calcula quais páginas imprimir (em JS, repassado pro script)
      const pageRangeConfig = JSON.stringify({
        pageRange: options.pageRange,
        currentPage: options.currentPage,
        customPages: options.customPages,
      })

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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    const { ipcRenderer } = require('electron');

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const base64 = '${pdfBase64}';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const password = ${options.password ? `'${options.password}'` : 'undefined'};
    const config = ${pageRangeConfig};

    function parsePageRanges(input, totalPages) {
      const pages = new Set();
      for (const part of input.split(',')) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(Number);
          for (let i = start; i <= Math.min(end, totalPages); i++) {
            if (i >= 1) pages.add(i);
          }
        } else {
          const n = Number(trimmed);
          if (n >= 1 && n <= totalPages) pages.add(n);
        }
      }
      return Array.from(pages).sort((a, b) => a - b);
    }

    const loadingTask = pdfjsLib.getDocument({
      data: bytes,
      ...(password ? { password } : {}),
    });

    loadingTask.promise.then(async (pdf) => {
      const container = document.getElementById('container');
      const totalPages = pdf.numPages;

      let pagesToRender;
      if (config.pageRange === 'current') {
        pagesToRender = [config.currentPage || 1];
      } else if (config.pageRange === 'custom' && config.customPages) {
        pagesToRender = parsePageRanges(config.customPages, totalPages);
      } else {
        pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      for (const pageNum of pagesToRender) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

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
    }).catch((err) => {
      console.error('Erro ao renderizar PDF para impressão:', err);
      ipcRenderer.send('pdf-render-complete'); // libera mesmo com erro pra não travar
    });
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
          webSecurity: false,
        },
      })

      await printWin.loadFile(tmpHtmlPath)

      await new Promise<void>((resolve) => {
        ipcMain.once('pdf-render-complete', () => {
          console.log('[PRINT] PDF.js renderização concluída')
          resolve()
        })
        setTimeout(resolve, 15000)
      })

      return await new Promise((resolve) => {
        printWin!.webContents.print(
          {
            silent: true,
            printBackground: true,
            deviceName: printerName,
            copies: options.copies || 1,
            color: options.color !== false,
          },
          (success, errorType) => {
            console.log('[PRINT] success:', success)
            console.log('[PRINT] error:', errorType)
            resolve({ success, error: success ? null : errorType })
          }
        )
      })
    } catch (err: any) {
      console.error('[PRINT] Erro:', err)
      return { success: false, error: err.message }
    } finally {
      if (printWin && !printWin.isDestroyed()) printWin.close()
      setTimeout(() => {
        try { fs.unlinkSync(tmpHtmlPath) } catch { }
      }, 5000)
    }
  }
)

ipcMain.handle(
  'save-as-pdf',
  async (_event, options: PrintOptions & { file: Uint8Array; password?: string }) => {
    if (options.password) {
      return {
        success: false,
        error: 'PDFs protegidos por senha não podem ser salvos diretamente. Use "Imprimir" e selecione "Microsoft Print to PDF" como impressora.',
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
    } catch (err: any) {
      console.error('[save-as-pdf] Erro:', err)
      return { success: false, error: err.message }
    }
  }
)

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})