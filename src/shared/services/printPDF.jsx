const handlePrint = useCallback((options: PrintOptions) => {
  if (!window.electronAPI || !file) return;

  window.electronAPI.printPDF({
    file,
    pages: [pageNumber],
    scale,
    ...options,
  });

  setPrintOpen(false);
}, [file, scale, pageNumber]);
