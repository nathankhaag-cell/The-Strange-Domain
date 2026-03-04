// =====================================================
//  DESKTOP ENHANCEMENTS
//  Injected after script.js — hooks into existing globals
//  to add native desktop notifications, badge counts,
//  taskbar flashing, and focus-aware presence.
//  Only runs when window.electronAPI is available.
// =====================================================

(function () {
    if (!window.electronAPI) return; // Not in Electron, bail

    const api = window.electronAPI;
    let windowFocused = true;
    let totalUnread   = 0;

    // ── Track window focus state ──
    api.onWindowFocus((focused) => {
        windowFocused = focused;
        // Clear badge when window is focused
        if (focused) {
            totalUnread = 0;
            api.updateBadge(0);
        }
    });

    // ── Enhance notification sound to also fire native notifications ──
    const _originalPlayNotificationSound = window.playNotificationSound;
    if (typeof _originalPlayNotificationSound === 'function') {
        window.playNotificationSound = function (channelId) {
            // Call original (plays the MP3 tick)
            _originalPlayNotificationSound(channelId);

            // If window is not focused, fire native notification + flash taskbar
            if (!windowFocused) {
                totalUnread++;
                api.updateBadge(totalUnread);
                api.flashFrame();

                // Determine channel name for the notification
                let channelName = channelId || 'Direct Message';
                if (typeof textChannels !== 'undefined') {
                    const ch = textChannels.find(c => c.id === channelId);
                    if (ch) channelName = ch.name;
                }

                api.showNotification(
                    'The Strange Domain',
                    `New transmission in ${channelName}`
                );
            }
        };
    }

    // ── Intercept external link clicks to open in default browser ──
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link) {
            const href = link.getAttribute('href');
            // External links (http/https) open in browser
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                e.preventDefault();
                api.openExternal(href);
            }
        }
    });

    // ── Image click → open in default browser instead of new window ──
    document.addEventListener('click', (e) => {
        const img = e.target.closest('img[onclick]');
        if (img) {
            const onclickAttr = img.getAttribute('onclick') || '';
            const match = onclickAttr.match(/window\.open\('([^']+)'/);
            if (match && match[1].startsWith('http')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                api.openExternal(match[1]);
            }
        }
    }, true);

    // ── Add app-drag-region class to header for frameless window dragging ──
    const header = document.querySelector('header');
    if (header) {
        header.style.webkitAppRegion = 'drag';
        // Make buttons inside header non-draggable
        header.querySelectorAll('button, a, img, input, [onclick]').forEach(el => {
            el.style.webkitAppRegion = 'no-drag';
        });
    }

    // ── Desktop badge: "The Strange Domain" title with unread count ──
    const _origRenderTextChannels = window.renderTextChannels;
    if (typeof _origRenderTextChannels === 'function') {
        window.renderTextChannels = function () {
            _origRenderTextChannels();
            updateDesktopBadge();
        };
    }
    const _origRenderDMList = window.renderDMList;
    if (typeof _origRenderDMList === 'function') {
        window.renderDMList = function () {
            _origRenderDMList();
            updateDesktopBadge();
        };
    }

    function updateDesktopBadge() {
        if (windowFocused) return;
        const count = (typeof unreadChannels !== 'undefined' ? unreadChannels.size : 0)
                    + (typeof unreadDMs !== 'undefined' ? unreadDMs.size : 0);
        totalUnread = count;
        api.updateBadge(count);

        // Also update document title
        document.title = count > 0
            ? `(${count}) The Strange Domain`
            : 'The Strange Domain';
    }

    console.log('[DESKTOP] Electron enhancements loaded — native notifications enabled');
})();
