// main.js
const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    resizable: true,
    webPreferences: {
      // preload bridges a safe, limited API to the renderer
      preload: path.join(__dirname, 'preload.js'),
      // disable direct require() in renderer for security
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // load our HTML entrypoint
  win.loadFile(path.join(__dirname, 'index.html'));

  // optional: remove default menu bar for a cleaner look
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // quit on Windows/Linux, stay alive on macOS until explicit quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS, re-create a window if none are open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
