import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openPdfDialog: () => ipcRenderer.invoke('open-pdf-dialog'),
    readPdfFile: (filePath: string) => ipcRenderer.invoke('read-pdf-file', filePath),
    getRecentDocuments: () => ipcRenderer.invoke('get-recent-documents'),
    clearRecentDocuments: () => ipcRenderer.invoke('clear-recent-documents'),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    getPrintSettings: () => ipcRenderer.invoke('get-print-settings'),
    savePrintSettings: (settings: unknown) => ipcRenderer.invoke('save-print-settings', settings),
    printSilent: (options: unknown) => ipcRenderer.invoke('print-silent', options),
    printNative: (options: unknown) => ipcRenderer.invoke('print-native', options),
    saveAsPdf: (options: unknown) => ipcRenderer.invoke('save-as-pdf', options),

    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    onOpenPdfFromSystem: (callback: (data: { buffer: Uint8Array; fileName: string }) => void) => {
        ipcRenderer.removeAllListeners('open-pdf-from-system')
        ipcRenderer.on('open-pdf-from-system', (_event, data) => callback(data))
    },

    // === AUTO-UPDATE ====================================================
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),

    onUpdateChecking: (callback: () => void) => {
        ipcRenderer.removeAllListeners('update-checking')
        ipcRenderer.on('update-checking', () => callback())
    },
    onUpdateAvailable: (callback: (info: { version: string; releaseNotes: unknown }) => void) => {
        ipcRenderer.removeAllListeners('update-available')
        ipcRenderer.on('update-available', (_event, info) => callback(info))
    },
    onUpdateNotAvailable: (callback: (info: { version: string }) => void) => {
        ipcRenderer.removeAllListeners('update-not-available')
        ipcRenderer.on('update-not-available', (_event, info) => callback(info))
    },
    onUpdateProgress: (callback: (progress: { percent: number; transferred: number; total: number }) => void) => {
        ipcRenderer.removeAllListeners('update-progress')
        ipcRenderer.on('update-progress', (_event, progress) => callback(progress))
    },
    onUpdateDownloaded: (callback: (info: { version: string }) => void) => {
        ipcRenderer.removeAllListeners('update-downloaded')
        ipcRenderer.on('update-downloaded', (_event, info) => callback(info))
    },
    onUpdateError: (callback: (error: { message: string }) => void) => {
        ipcRenderer.removeAllListeners('update-error')
        ipcRenderer.on('update-error', (_event, error) => callback(error))
    },
})
