import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openPdfDialog: () => ipcRenderer.invoke('open-pdf-dialog'),
    readPdfFile: (filePath: string) => ipcRenderer.invoke('read-pdf-file', filePath),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    printSilent: (options: unknown) => ipcRenderer.invoke('print-silent', options),
    printNative: (options: unknown) => ipcRenderer.invoke('print-native', options),
    saveAsPdf: (options: unknown) => ipcRenderer.invoke('save-as-pdf', options),

    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    onOpenPdfFromSystem: (callback: (data: { buffer: Uint8Array; fileName: string }) => void) => {
        ipcRenderer.removeAllListeners('open-pdf-from-system')
        ipcRenderer.on('open-pdf-from-system', (_event, data) => callback(data))
    },
})