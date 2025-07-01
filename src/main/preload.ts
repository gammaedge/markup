import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data: { content: string; filePath?: string }) => 
    ipcRenderer.invoke('save-file', data),
  
  onFileNew: (callback: () => void) => {
    ipcRenderer.on('file-new', callback);
  },
  
  onFileOpened: (callback: (data: { filePath: string; content: string }) => void) => {
    ipcRenderer.on('file-opened', (event, data) => callback(data));
  },
  
  onFileSave: (callback: () => void) => {
    ipcRenderer.on('file-save', callback);
  },
  
  onFileSaveAs: (callback: () => void) => {
    ipcRenderer.on('file-save-as', callback);
  },
  
  getTheme: () => ipcRenderer.invoke('get-theme'),
  
  onThemeChanged: (callback: (theme: string) => void) => {
    ipcRenderer.on('theme-changed', (event, theme) => callback(theme));
  }
});