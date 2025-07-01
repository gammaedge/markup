import { app, BrowserWindow, Menu, shell, dialog, ipcMain, nativeTheme } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;
let currentFilePath: string | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    // Temporarily enable DevTools to debug the issue
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createAppMenu();
}

function createAppMenu(): void {
  const template: any[] = [
    {
      label: 'Elegant Editor',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('file-new')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: handleFileOpen
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('file-save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('file-save-as')
        },
        { type: 'separator' },
        {
          label: 'Export...',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => mainWindow?.webContents.send('file-export')
        },
        {
          label: 'Print...',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => mainWindow?.webContents.send('file-print')
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function handleFileOpen(): Promise<void> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    currentFilePath = filePath;
    mainWindow?.webContents.send('file-opened', { filePath, content });
  }
}

ipcMain.handle('save-file', async (event, { content, filePath }) => {
  try {
    if (!filePath) {
      const result = await dialog.showSaveDialog({
        filters: [
          { name: 'Markdown', extensions: ['md'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled) return { success: false };
      filePath = result.filePath;
    }

    await fs.writeFile(filePath, content, 'utf-8');
    currentFilePath = filePath;
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('get-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

nativeTheme.on('updated', () => {
  mainWindow?.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
});

ipcMain.handle('export-pdf', async (event, { html, options }) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: 'document.pdf',
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });
    
    if (!filePath) return { success: false };
    
    // Create a hidden window to render the HTML
    const pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    const pdfOptions: Electron.PrintToPDFOptions = {
      landscape: false,
      printBackground: true,
      preferCSSPageSize: true
    };
    
    const data = await pdfWindow.webContents.printToPDF(pdfOptions);
    await fs.writeFile(filePath, data);
    
    pdfWindow.close();
    
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('export-html', async (event, { html, title }) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `${title || 'document'}.html`,
      filters: [{ name: 'HTML Files', extensions: ['html'] }]
    });
    
    if (!filePath) return { success: false };
    
    await fs.writeFile(filePath, html, 'utf-8');
    
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('export-docx', async (event, { buffer, title }) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `${title || 'document'}.docx`,
      filters: [{ name: 'Word Documents', extensions: ['docx'] }]
    });
    
    if (!filePath) return { success: false };
    
    await fs.writeFile(filePath, Buffer.from(buffer));
    
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('print', async (event, { html }) => {
  try {
    // Create a hidden window to render the HTML
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    printWindow.webContents.print({
      silent: false,
      printBackground: true
    });
    
    // Close the window after a delay to ensure printing is initiated
    setTimeout(() => printWindow.close(), 1000);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});