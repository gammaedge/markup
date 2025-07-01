export interface ElectronAPI {
  saveFile: (data: { content: string; filePath?: string }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  onFileNew: (callback: () => void) => void;
  onFileOpened: (callback: (data: { filePath: string; content: string }) => void) => void;
  onFileSave: (callback: () => void) => void;
  onFileSaveAs: (callback: () => void) => void;
  onFileExport: (callback: () => void) => void;
  onFilePrint: (callback: () => void) => void;
  getTheme: () => Promise<string>;
  onThemeChanged: (callback: (theme: string) => void) => void;
  exportPDF: (data: { html: string; options: any }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  exportHTML: (data: { html: string; title?: string }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  exportDocx: (data: { buffer: ArrayBuffer; title?: string }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  print: (data: { html: string }) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}