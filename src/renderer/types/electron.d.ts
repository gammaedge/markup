export interface ElectronAPI {
  saveFile: (data: { content: string; filePath?: string }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  onFileNew: (callback: () => void) => void;
  onFileOpened: (callback: (data: { filePath: string; content: string }) => void) => void;
  onFileSave: (callback: () => void) => void;
  onFileSaveAs: (callback: () => void) => void;
  getTheme: () => Promise<string>;
  onThemeChanged: (callback: (theme: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}