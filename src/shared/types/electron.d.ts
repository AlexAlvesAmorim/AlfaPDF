import { PrintOptions } from '@/shared/types';

export {};

/** Resultado retornado pelo canal IPC 'save-as-pdf' */
export interface SavePdfResult {
  success: boolean;
  path?: string;
  canceled?: boolean;
  error?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      /** Abre o diálogo nativo de seleção de arquivo PDF e retorna os caminhos selecionados. */
      openPdfDialog: () => Promise<string[]>;

      /** Lê um arquivo PDF do disco e retorna o conteúdo em base64. */
      readPdfFile: (filePath: string) => Promise<string>;

      /** Lista as impressoras disponíveis no sistema. */
      getPrinters: () => Promise<{ name: string; isDefault?: boolean }[]>;

      /** Envia o PDF para impressão silenciosa (sem diálogo do OS). */
      printSilent: (
        options: PrintOptions & { file: Uint8Array }
      ) => Promise<boolean>;

      /** Salva o PDF (ou um subconjunto de páginas) em disco via diálogo nativo. */
      saveAsPdf: (
        options: PrintOptions & { file: Uint8Array }
      ) => Promise<SavePdfResult>;
    };
  }
}