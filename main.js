// =====================================================
//  THE STRANGE DOMAIN — ELECTRON MAIN PROCESS
//  Wraps the existing web app into a native desktop client
//  connecting to the same Firebase backend.
// =====================================================

const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, shell, session, desktopCapturer, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// ── Fix Windows GPU shader cache permission error ──
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disk-cache-dir', path.join(app.getPath('userData'), 'cache'));

// ── Globals ──
let mainWindow = null;
let tray       = null;
let isQuitting = false;

// ── Constants ──
const APP_NAME  = 'The Strange Domain';
const DEV_MODE  = process.argv.includes('--dev');
const MIN_WIDTH  = 960;
const MIN_HEIGHT = 640;

// =====================================================
//  AUTO-UPDATER CONFIGURATION
// =====================================================
function setupAutoUpdater() {
    // Don't auto-update in dev mode
    if (DEV_MODE) {
        console.log('[UPDATER] Dev mode — auto-update disabled');
        return;
    }

    // Check for updates silently on launch
    autoUpdater.checkForUpdates().catch(err => {
        console.error('[UPDATER] Check failed:', err.message);
    });

    // ── Update events → notify renderer ──
    autoUpdater.on('checking-for-update', () => {
        sendUpdaterStatus('checking');
    });

    autoUpdater.on('update-available', (info) => {
        console.log(`[UPDATER] Update available: v${info.version}`);
        sendUpdaterStatus('available', { version: info.version });
    });

    autoUpdater.on('update-not-available', () => {
        sendUpdaterStatus('not-available');
    });

    autoUpdater.on('download-progress', (progress) => {
        const pct = Math.floor(progress.percent);
        sendUpdaterStatus('downloading', { percent: pct });
        // Update tray tooltip with download progress
        if (tray) tray.setToolTip(`${APP_NAME} — Downloading update ${pct}%`);
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log(`[UPDATER] Update downloaded: v${info.version}`);
        sendUpdaterStatus('downloaded', { version: info.version });
        if (tray) tray.setToolTip(APP_NAME);

        // Show native dialog asking user to restart
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Ready',
            message: `The Strange Domain v${info.version} is ready to install.`,
            detail: 'Restart now to apply the update, or it will install automatically on next launch.',
            buttons: ['Restart Now', 'Later'],
            defaultId: 0,
            cancelId: 1,
        }).then(({ response }) => {
            if (response === 0) {
                autoUpdater.quitAndInstall(false, true);
            }
        });
    });

    autoUpdater.on('error', (err) => {
        console.error('[UPDATER] Error:', err.message);
        sendUpdaterStatus('error', { message: err.message });
        if (tray) tray.setToolTip(APP_NAME);
    });
}

// Helper: send update status to renderer (only if window exists)
function sendUpdaterStatus(status, data = {}) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('updater-status', { status, ...data });
    }
}

// =====================================================
//  SINGLE INSTANCE LOCK
//  Prevents multiple copies from running simultaneously
// =====================================================
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// =====================================================
//  CREATE MAIN WINDOW
// =====================================================
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        title: APP_NAME,
        icon: getTrayIcon(),
        backgroundColor: '#0a0a0a',

        // Frameless with custom title bar for that terminal look
        // Set to false if you prefer OS-native title bar
        frame: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0a0a0a',
            symbolColor: '#00ff41',
            height: 36
        },

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            // Required for Firebase & WebRTC
            webSecurity: true,
            // Enable media (mic, camera, screen share)
            // The permission handler below manages prompts
        },

        show: false, // show after ready-to-show to avoid white flash
    });

    // Load the app
    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    // Show window when content is ready (no white flash)
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (DEV_MODE) mainWindow.webContents.openDevTools();
    });

    // ── Handle external links — open in default browser ──
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    // Also catch navigation to external URLs
    mainWindow.webContents.on('will-navigate', (event, url) => {
        const appOrigin = `file://`;
        if (!url.startsWith(appOrigin)) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    // ── Media permissions — auto-grant mic/camera/screen for the app ──
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = ['media', 'mediaKeySystem', 'display-capture', 'notifications'];
        if (allowedPermissions.includes(permission)) {
            callback(true);
        } else {
            callback(false);
        }
    });

    // Also handle permission checks
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        const allowed = ['media', 'mediaKeySystem', 'display-capture', 'notifications'];
        return allowed.includes(permission);
    });

    // ── Spellchecker — use OS built-in via Electron session ──
    // Detects the user's system language automatically
    session.defaultSession.setSpellCheckerEnabled(true);
    // No need to set languages — Electron auto-detects from OS locale

    // Right-click context menu: show spell suggestions + standard edit actions
    mainWindow.webContents.on('context-menu', (event, params) => {
        const menuTemplate = [];

        // Spell suggestions (only when a misspelled word is selected)
        if (params.misspelledWord) {
            const suggestions = params.dictionaryWordSuggestions || [];
            if (suggestions.length > 0) {
                suggestions.slice(0, 5).forEach(suggestion => {
                    menuTemplate.push({
                        label: suggestion,
                        click: () => mainWindow.webContents.replaceMisspelling(suggestion)
                    });
                });
            } else {
                menuTemplate.push({ label: 'No suggestions', enabled: false });
            }
            menuTemplate.push(
                { type: 'separator' },
                {
                    label: 'Add to dictionary',
                    click: () => session.defaultSession.addWordToSpellCheckerDictionary(params.misspelledWord)
                },
                { type: 'separator' }
            );
        }

        // Standard edit actions — always available on editable fields
        if (params.isEditable || params.editFlags.canCopy) {
            menuTemplate.push(
                { label: 'Cut',   role: 'cut',   enabled: params.editFlags.canCut },
                { label: 'Copy',  role: 'copy',  enabled: params.editFlags.canCopy },
                { label: 'Paste', role: 'paste', enabled: params.editFlags.canPaste },
                { type: 'separator' },
                { label: 'Select All', role: 'selectAll' }
            );
        }

        if (menuTemplate.length > 0) {
            const menu = Menu.buildFromTemplate(menuTemplate);
            menu.popup({ window: mainWindow });
        }
    });

    // ── Window close → quit the app ──
    mainWindow.on('close', () => {
        isQuitting = true;
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // ── Window focus/blur — tell renderer for presence ──
    mainWindow.on('focus', () => {
        mainWindow.webContents.send('window-focus', true);
    });
    mainWindow.on('blur', () => {
        mainWindow.webContents.send('window-focus', false);
    });
}

// =====================================================
//  SYSTEM TRAY
// =====================================================
function createTray() {
    const icon = getTrayIcon();
    tray = new Tray(icon);
    tray.setToolTip(APP_NAME);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show The Strange Domain',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Check for Updates',
            click: () => {
                autoUpdater.checkForUpdates().catch(err => {
                    dialog.showErrorBox('Update Check Failed', err.message);
                });
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);

    // Click tray icon to toggle window
    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
}

// =====================================================
//  TRAY ICON — generates a green "74" icon in-memory
//  Replace with a real .png for production builds
// =====================================================
function getTrayIcon() {
    // Try loading a real icon file first
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    try {
        const img = nativeImage.createFromPath(iconPath);
        if (!img.isEmpty()) return img.resize({ width: 16, height: 16 });
    } catch (e) { /* fall through to generated icon */ }

    // Generate a simple green square icon as fallback
    const size = 16;
    const buf = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
                buf[i]     = 0;
                buf[i + 1] = 255;
                buf[i + 2] = 65;
                buf[i + 3] = 255;
            } else {
                buf[i]     = 10;
                buf[i + 1] = 10;
                buf[i + 2] = 10;
                buf[i + 3] = 255;
            }
        }
    }
    return nativeImage.createFromBuffer(buf, { width: size, height: size });
}

// =====================================================
//  IPC HANDLERS — renderer ↔ main process communication
// =====================================================
function setupIPC() {
    // Native notification from renderer
    ipcMain.on('show-notification', (event, { title, body }) => {
        if (Notification.isSupported() && mainWindow && !mainWindow.isFocused()) {
            const notif = new Notification({ title, body, silent: false });
            notif.on('click', () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            });
            notif.show();
        }
    });

    // Flash taskbar on new message
    ipcMain.on('flash-frame', () => {
        if (mainWindow && !mainWindow.isFocused()) {
            mainWindow.flashFrame(true);
        }
    });

    // Update tray tooltip (e.g., with unread count)
    ipcMain.on('update-badge', (event, count) => {
        if (tray) {
            tray.setToolTip(count > 0 ? `${APP_NAME} (${count} unread)` : APP_NAME);
        }
        // macOS dock badge
        if (process.platform === 'darwin') {
            app.setBadgeCount(count);
        }
    });

    // Open external URL
    ipcMain.on('open-external', (event, url) => {
        shell.openExternal(url);
    });

    // Manually trigger update check from renderer (e.g., settings page button)
    ipcMain.on('check-for-updates', () => {
        autoUpdater.checkForUpdates().catch(err => {
            sendUpdaterStatus('error', { message: err.message });
        });
    });

    // Trigger install-and-restart from renderer
    ipcMain.on('install-update', () => {
        autoUpdater.quitAndInstall(false, true);
    });

    // Screen capture sources — returns thumbnails for the picker UI
    ipcMain.handle('get-screen-sources', async () => {
        try {
            const sources = await desktopCapturer.getSources({
                types: ['window', 'screen'],
                thumbnailSize: { width: 320, height: 180 },
                fetchWindowIcons: false
            });
            return sources.map(s => ({
                id:        s.id,
                name:      s.name,
                thumbnail: s.thumbnail.toDataURL()
            }));
        } catch (e) {
            console.error('desktopCapturer error:', e);
            return [];
        }
    });

    // Link preview — fetch URL and extract Open Graph metadata
    ipcMain.handle('fetch-link-preview', async (event, url) => {
        try {
            const html = await fetchWithTimeout(url, 8000);
            if (!html) return null;

            const og = {};
            const ogRegex = /<meta\s+(?:[^>]*?)property=["']og:([^"']+)["']\s+(?:[^>]*?)content=["']([^"']*)["']/gi;
            let match;
            while ((match = ogRegex.exec(html)) !== null) {
                og[match[1].toLowerCase()] = decodeHtmlEntities(match[2]);
            }
            const ogRegex2 = /<meta\s+(?:[^>]*?)content=["']([^"']*)["']\s+(?:[^>]*?)property=["']og:([^"']+)["']/gi;
            while ((match = ogRegex2.exec(html)) !== null) {
                const key = match[2].toLowerCase();
                if (!og[key]) og[key] = decodeHtmlEntities(match[1]);
            }

            const twRegex = /<meta\s+(?:[^>]*?)(?:name|property)=["']twitter:([^"']+)["']\s+(?:[^>]*?)content=["']([^"']*)["']/gi;
            while ((match = twRegex.exec(html)) !== null) {
                const key = match[1].toLowerCase();
                if (!og[key]) og[key] = decodeHtmlEntities(match[2]);
            }
            const twRegex2 = /<meta\s+(?:[^>]*?)content=["']([^"']*)["']\s+(?:[^>]*?)(?:name|property)=["']twitter:([^"']+)["']/gi;
            while ((match = twRegex2.exec(html)) !== null) {
                const key = match[2].toLowerCase();
                if (!og[key]) og[key] = decodeHtmlEntities(match[1]);
            }

            if (!og.title) {
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch) og.title = decodeHtmlEntities(titleMatch[1].trim());
            }
            if (!og.description) {
                const descMatch = html.match(/<meta\s+(?:[^>]*?)name=["']description["']\s+(?:[^>]*?)content=["']([^"']*)["']/i)
                    || html.match(/<meta\s+(?:[^>]*?)content=["']([^"']*)["']\s+(?:[^>]*?)name=["']description["']/i);
                if (descMatch) og.description = decodeHtmlEntities(descMatch[1]);
            }

            if (!og.image) {
                const iconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i);
                if (iconMatch) {
                    let iconUrl = iconMatch[1];
                    if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
                    else if (iconUrl.startsWith('/')) {
                        const u = new URL(url);
                        iconUrl = u.origin + iconUrl;
                    }
                    og._favicon = iconUrl;
                }
            }

            if (!og.title && !og.description && !og.image) return null;

            return {
                title:       og.title       || '',
                description: og.description || '',
                image:       og.image       || '',
                site_name:   og.site_name   || og['site_name'] || '',
                type:        og.type        || '',
                video:       og.video       || og['video:url'] || og['video:secure_url'] || '',
                favicon:     og._favicon    || '',
                url:         url
            };
        } catch (e) {
            console.error('Link preview fetch error:', e.message);
            return null;
        }
    });
}

function decodeHtmlEntities(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
}

function fetchWithTimeout(url, timeout) {
    return new Promise((resolve, reject) => {
        const proto = url.startsWith('https') ? require('https') : require('http');
        const req = proto.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; StrangeDomainBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: timeout
        }, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                let redirect = res.headers.location;
                if (redirect.startsWith('/')) {
                    const u = new URL(url);
                    redirect = u.origin + redirect;
                }
                res.resume();
                return fetchWithTimeout(redirect, timeout).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                res.resume();
                return resolve(null);
            }
            const contentType = res.headers['content-type'] || '';
            if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
                res.resume();
                return resolve(null);
            }
            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => {
                data += chunk;
                if (data.length > 65536) { res.destroy(); resolve(data); }
            });
            res.on('end', () => resolve(data));
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

// =====================================================
//  APP LIFECYCLE
// =====================================================
app.whenReady().then(() => {
    createMainWindow();
    createTray();
    setupIPC();
    setupAutoUpdater(); // ← check for updates on launch

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        } else if (mainWindow) {
            mainWindow.show();
        }
    });
});

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', () => {
    if (tray) { tray.destroy(); tray = null; }
    app.quit();
});