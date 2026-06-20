import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openPdfDialog: () => ipcRenderer.invoke('open-pdf-dialog'),
    readPdfFile: (filePath: string) => ipcRenderer.invoke('read-pdf-file', filePath),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    printSilent: (options: any) => ipcRenderer.invoke('print-silent', options),
    saveAsPdf: (options: any) => ipcRenderer.invoke('save-as-pdf', options),
})