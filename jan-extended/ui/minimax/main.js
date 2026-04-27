const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function startBackend() {
  const backendPath = path.join(__dirname, 'backend.py');
  backendProcess = spawn('python', [backendPath]);

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
    title: "Jan-Extended AI OS",
    backgroundColor: "#0f172a"
  });

  // Force load the local production build for stability
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`Loading UI from: ${indexPath}`);
  
  mainWindow.loadURL(`file://${indexPath}`);

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorDescription} (${errorCode})`);
    // Fallback to dev server if local file fails
    mainWindow.loadURL('http://localhost:1420');
  });

  // Open DevTools to debug blank screen
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});
