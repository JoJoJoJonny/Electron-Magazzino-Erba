import { app, BrowserWindow, protocol, session} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

import "./database";
import "./ipc";

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

protocol.registerSchemesAsPrivileged([
	{
		scheme: 'app',
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
			allowServiceWorkers: true,
			corsEnabled: true
		}
	}
]);

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
	? path.join(process.env.APP_ROOT, "public")
	: RENDERER_DIST;

app.whenReady().then(() => {
	// Registra un'intestazione CSP che bypassa tutte le restrizioni per le risorse locali
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				'Content-Security-Policy': ['default-src \'self\' \'unsafe-inline\' data:;'],
				'X-Content-Security-Policy': ['default-src \'self\' \'unsafe-inline\' data:;'],
			}
		});
	});
});

let win: BrowserWindow | null;

function createWindow() {
	win = new BrowserWindow({
		icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			contextIsolation: true,
			//sandbox: false,
			//webSecurity: false,
		},
	});

	// Test active push message to Renderer-process.
	win.webContents.on("did-finish-load", () => {
		win?.webContents.send("main-process-message", new Date().toLocaleString());
	});

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		// win.loadFile('dist/index.html')

		//win.loadFile(path.join(RENDERER_DIST, "index.html"));
		//win.loadFile(path.join(__dirname, '../dist/index.html'));
		//win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));

		// 1. Definisce il percorso di sistema assoluto (app.getAppPath() è la radice dell'ASAR).
		//const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');

		// 2. Converte il percorso di sistema in un URL file:// corretto (gestisce Windows paths).
		//const fileUrl = pathToFileURL(indexPath).toString();

		// 3. Carica l'URL formattato con loadURL.
		//win.loadURL(fileUrl);

		//win.loadURL(`app://./dist/index.html`);

		const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
		const fileUrl = pathToFileURL(indexPath).toString();

		win.loadURL(fileUrl);
	}
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
	}
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.whenReady().then(createWindow);
