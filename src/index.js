"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path_1 = require("path");
var FileManager_1 = require("./js/FileManager");
var windowConfig = new FileManager_1["default"]({
    configName: 'user-preferences',
    defaults: {
        windowBounds: { width: 1000, height: 600 },
        windowLocation: { x: 0, y: 0 }
    }
});
require('electron-reload')(__dirname, {
    electron: path_1["default"].join(__dirname, '..', 'node_modules', '.bin', 'electron')
});
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
var mainWindow;
var shoulQuit = electron_1.app.requestSingleInstanceLock();
var createWindow = function (w, h, xx, yy) {
    mainWindow = new electron_1.BrowserWindow({
        x: xx, y: yy,
        webPreferences: {
            nodeIntegration: true
        },
        width: w, height: h,
        icon: path_1["default"].join(__dirname, 'icon.ico'),
        title: "Pixel Launcher", minWidth: 800, minHeight: 600,
        maxWidth: 1280, maxHeight: 720, fullscreenable: false, fullscreenWindowTitle: false, fullscreen: false,
        maximizable: false,
        titleBarStyle: "hidden", frame: false, transparent: true,
        hasShadow: true, thickFrame: true
    });
    mainWindow.loadURL("file://" + __dirname + "/index.html");
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function () {
        mainWindow = null;
        electron_1.app.quit();
    });
    mainWindow.on('move', function () {
        var x = mainWindow.getPosition()[0];
        var y = mainWindow.getPosition()[1];
        windowConfig.set('windowLocation', { x: x, y: y });
    });
    mainWindow.on('resize', function () {
        var _a = mainWindow.getBounds(), width = _a.width, height = _a.height;
        windowConfig.set('windowBounds', { width: width, height: height });
    });
};
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
if (!shoulQuit) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', function (e, comd, workDir) {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
    electron_1.app.on('ready', function () {
        var _a = windowConfig.get('windowBounds'), width = _a.width, height = _a.height;
        var _b = windowConfig.get('windowLocation'), x = _b.x, y = _b.y;
        setTimeout(function () { createWindow(width, height, x, y); }, 500);
    });
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
