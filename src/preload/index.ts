const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openPDFDialog: () => ipcRenderer.invoke('open-pdf-dialog'),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printPDF: (options: any) => {
    ipcRenderer.send('print-pdf', options)
  },
  readPdfFile: (filePath: string) => ipcRenderer.invoke('read-pdf-file', filePath),
})