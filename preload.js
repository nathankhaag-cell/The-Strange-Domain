// =====================================================
//  PRELOAD — Exposes safe IPC to renderer (your web app)
//  This bridges Electron's main process with your existing
//  script.js without requiring any nodeIntegration.
// =====================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ── Platform info ──
    platform: process.platform,
    isElectron: true,

    // ── Native notifications ──
    showNotification: (title, body) => {
        ipcRenderer.send('show-notification', { title, body });
    },

    // ── Flash taskbar/dock ──
    flashFrame: () => {
        ipcRenderer.send('flash-frame');
    },

    // ── Badge count (macOS dock / tray tooltip) ──
    updateBadge: (count) => {
        ipcRenderer.send('update-badge', count);
    },

    // ── Open URL in default browser ──
    openExternal: (url) => {
        ipcRenderer.send('open-external', url);
    },

    // ── Window focus events ──
    onWindowFocus: (callback) => {
        ipcRenderer.on('window-focus', (event, focused) => callback(focused));
    },

    // ── Screen capture sources (for screen sharing) ──
    getScreenSources: () => {
        return ipcRenderer.invoke('get-screen-sources');
    },

    // ── Link preview metadata (fetches OG tags from URLs) ──
    fetchLinkPreview: (url) => {
        return ipcRenderer.invoke('fetch-link-preview', url);
    },

    // ── Auto-updater ──
    // Listen for update status events from main process
    onUpdaterStatus: (callback) => {
        ipcRenderer.on('updater-status', (event, data) => callback(data));
    },
    // Manually trigger an update check (e.g., from a settings button)
    checkForUpdates: () => {
        ipcRenderer.send('check-for-updates');
    },
    // Trigger install & restart after update is downloaded
    installUpdate: () => {
        ipcRenderer.send('install-update');
    },
});