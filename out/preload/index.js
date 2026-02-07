"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  openPDFDialog: () => ipcRenderer.invoke("open-pdf-dialog"),
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  printPDF: (options) => {
    ipcRenderer.send("print-pdf", options);
  },
  readPdfFile: (filePath) => ipcRenderer.invoke("read-pdf-file", filePath)
});
