import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const { contextBridge, ipcRenderer } = require2("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  openPDFDialog: () => ipcRenderer.invoke("open-pdf-dialog"),
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  printPDF: (options) => {
    ipcRenderer.send("print-pdf", options);
  },
  readPdfFile: (filePath) => ipcRenderer.invoke("read-pdf-file", filePath)
});
