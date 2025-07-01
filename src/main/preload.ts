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
  
  onFileExport: (callback: () => void) => {
    ipcRenderer.on('file-export', callback);
  },
  
  onFilePrint: (callback: () => void) => {
    ipcRenderer.on('file-print', callback);
  },
  
  getTheme: () => ipcRenderer.invoke('get-theme'),
  
  onThemeChanged: (callback: (theme: string) => void) => {
    ipcRenderer.on('theme-changed', (event, theme) => callback(theme));
  },
  
  exportPDF: (data: { html: string; options: any }) => 
    ipcRenderer.invoke('export-pdf', data),
  
  exportHTML: (data: { html: string; title?: string }) => 
    ipcRenderer.invoke('export-html', data),
  
  exportDocx: (data: { buffer: ArrayBuffer; title?: string }) => 
    ipcRenderer.invoke('export-docx', data),
  
  print: (data: { html: string }) => 
    ipcRenderer.invoke('print', data)
});