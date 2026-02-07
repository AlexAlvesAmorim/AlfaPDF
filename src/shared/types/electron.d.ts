import { PrintOptions } from './PrintDialog';

export {};

declare global {
  interface Window {
    electronAPI?: {
      getFileContent: (path: string) => Promise<string>;
      openPDFDialog: () => Promise<string | null>;
      printPDF: (options: {
        file: Uint8Array;
        pages: number[];
        scale: number;
      } & PrintOptions) => void;
      onOpenPDFDialog: (callback: () => void) => void;
      removeOpenPDFDialogListeners?: () => void;
    };
  }
}