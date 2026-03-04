# The Strange Domain — Desktop Client

An Electron-based desktop app wrapping **The Strange Domain** web app, connecting to the exact same Firebase backend. All your existing users, channels, messages, voice rooms, and admin features work out of the box.

## Desktop-Exclusive Features

| Feature | Description |
|---------|-------------|
| **System Tray** | Minimize to tray — the app stays running in the background |
| **Native Notifications** | OS-level notifications when you receive messages while the window is unfocused |
| **Taskbar Flashing** | Taskbar/dock icon flashes on new messages |
| **Badge Count** | Unread message count shown on dock (macOS) and tray tooltip |
| **Auto-Grant Media** | Mic, camera, and screen share permissions are auto-approved — no browser popups |
| **Single Instance** | Only one copy of the app can run at a time |
| **External Links** | HTTP links open in your default browser instead of inside the app |

## Project Structure

```
strange-domain-desktop/
├── main.js                    # Electron main process (window, tray, IPC)
├── preload.js                 # Secure bridge between main ↔ renderer
├── package.json               # Dependencies & build config
├── assets/
│   └── icon.png               # App icon (add your own 512×512 PNG)
├── src/
│   ├── index.html             # Main chat UI (patched for Electron)
│   ├── login.html             # Login/register page
│   ├── map.html               # 3D globe uplink map
│   ├── script.js              # Original app logic (unchanged)
│   ├── style.css              # Original styles (unchanged)
│   ├── desktop-enhancements.js # Electron-specific hooks (notifications, badges, etc.)
│   └── creatorshome-keyboard-click-327728.mp3
└── README.md
```

## Quick Start

### Prerequisites
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Install & Run

```bash
# 1. Navigate to the project folder
cd strange-domain-desktop

# 2. Install dependencies
npm install

# 3. Run the app in development mode
npm run dev
```

### Build Distributable

```bash
# Windows installer (.exe)
npm run build:win

# macOS disk image (.dmg)
npm run build:mac

# Linux AppImage + .deb
npm run build:linux
```

Built packages appear in the `dist/` folder.

## App Icon

Replace `assets/icon.png` with your own **512×512 PNG** icon. The build system will auto-generate all required sizes for each platform.

If no icon file is present, the app falls back to a programmatically generated green square.

## How It Works

The desktop app loads your existing HTML/CSS/JS files directly — no code changes required to `script.js` or `style.css`. All Firebase connections, WebRTC voice/video, and ImgBB uploads work identically to the web version because Electron's Chromium engine handles them natively.

The `desktop-enhancements.js` script monkey-patches a few existing functions (like `playNotificationSound`) to additionally fire native OS notifications and update badge counts via Electron's IPC bridge. This is non-destructive — the original web behavior is preserved.

### Architecture

```
┌─────────────────────────────────────────────┐
│              Electron Main Process           │
│  (main.js)                                   │
│  • Window management                         │
│  • System tray                               │
│  • Native notifications                      │
│  • Media permission auto-grant               │
├─────────────────────────────────────────────┤
│              Preload Bridge                   │
│  (preload.js)                                │
│  • Exposes electronAPI to renderer            │
│  • Secure contextBridge                       │
├─────────────────────────────────────────────┤
│              Renderer Process                 │
│  (Your existing web app)                     │
│  • index.html / script.js / style.css        │
│  • desktop-enhancements.js (hooks)           │
│  • Firebase Realtime DB ←→ Same backend      │
│  • WebRTC voice/video ←→ Same STUN servers   │
│  • ImgBB uploads ←→ Same API key             │
└─────────────────────────────────────────────┘
```

## Configuration

All Firebase and ImgBB configuration is in `src/script.js` (lines 191–199 and 188), exactly as in your web app. No changes needed — the desktop client shares the same backend.

## Customization

### Disable "minimize to tray" behavior
In `main.js`, find the `mainWindow.on('close', ...)` handler and remove the `event.preventDefault()` call. The app will quit normally when closed.

### Use native OS title bar
In `main.js`, change the BrowserWindow options:
```js
frame: true,
titleBarStyle: 'default',  // was 'hidden'
// Remove titleBarOverlay entirely
```

### Add auto-update
The project includes `electron-updater` as a dependency. To enable auto-updates, add your update server URL in `main.js`:
```js
const { autoUpdater } = require('electron-updater');
app.whenReady().then(() => {
    autoUpdater.checkForUpdatesAndNotify();
});
```

## License

Private — The Strange Domain
