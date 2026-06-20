import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openPdfDialog: () => ipcRenderer.invoke('open-pdf-dialog'),
    readPdfFile: (filePath: string) => ipcRenderer.invoke('read-pdf-file', filePath),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    printSilent: (options: any) => ipcRenderer.invoke('print-silent', options),
    saveAsPdf: (options: any) => ipcRenderer.invoke('save-as-pdf', options),

    onOpenPdfFromSystem: (callback: (data: { buffer: Uint8Array; fileName: string }) => void) => {
        ipcRenderer.removeAllListeners('open-pdf-from-system')
        ipcRenderer.on('open-pdf-from-system', (_event, data) => callback(data))
    },
})