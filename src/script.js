// =====================================================
//  SYSTEM DIALOG ENGINE
// =====================================================
function sysToast(msg, type = 'info') {
    const wrap = document.getElementById('sys-toast-wrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `sys-toast sys-toast-${type}`;
    el.textContent = `${{ info:'▸', warn:'⚠', error:'✕' }[type]||'▸'} ${msg}`;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3100);
}
function sysConfirm({ title='CONFIRM', msg, confirmText='CONFIRM', cancelText='ABORT', danger=false, onConfirm, onCancel }={}) {
    const dialog=document.getElementById('sys-dialog'); const titleEl=document.getElementById('sys-dialog-title'); const iconEl=document.getElementById('sys-dialog-icon'); const msgEl=document.getElementById('sys-dialog-msg'); const btnsEl=document.getElementById('sys-dialog-btns');
    if(!dialog){if(confirm(msg))onConfirm?.();else onCancel?.();return;}
    titleEl.textContent=title; iconEl.className=`text-sm ${danger?'text-red-500':'text-[#00ff41]'}`; iconEl.textContent=danger?'⚠':'◈'; msgEl.textContent=msg; btnsEl.innerHTML='';
    const cb=document.createElement('button'); cb.className='sys-btn sys-btn-cancel'; cb.textContent=cancelText; cb.onclick=()=>{close();onCancel?.();}; 
    const ob=document.createElement('button'); ob.className=`sys-btn ${danger?'sys-btn-danger':'sys-btn-confirm'}`; ob.textContent=confirmText; ob.onclick=()=>{close();onConfirm?.();};
    btnsEl.appendChild(cb); btnsEl.appendChild(ob); dialog.classList.remove('hidden');
    dialog.onclick=e=>{if(e.target===dialog)close();}; const onKey=e=>{if(e.key==='Escape'){close();onCancel?.();}}; document.addEventListener('keydown',onKey,{once:true});
    function close(){dialog.classList.add('hidden');dialog.onclick=null;document.removeEventListener('keydown',onKey);}
}
function sysAlert({ title='SYSTEM', msg, type='info' }={}) {
    const dialog=document.getElementById('sys-dialog'); if(!dialog){alert(msg);return;}
    document.getElementById('sys-dialog-title').textContent=title;
    const iconEl=document.getElementById('sys-dialog-icon'); iconEl.className=`text-sm ${{info:'text-[#00ff41]',warn:'text-yellow-400',error:'text-red-400'}[type]}`; iconEl.textContent={info:'◈',warn:'⚠',error:'✕'}[type];
    document.getElementById('sys-dialog-msg').textContent=msg;
    const btnsEl=document.getElementById('sys-dialog-btns'); btnsEl.innerHTML='';
    const ok=document.createElement('button'); ok.className='sys-btn sys-btn-ok'; ok.textContent='OK'; ok.onclick=close; btnsEl.appendChild(ok);
    dialog.classList.remove('hidden'); dialog.onclick=e=>{if(e.target===dialog)close();}; const onKey=e=>{if(e.key==='Escape'||e.key==='Enter')close();}; document.addEventListener('keydown',onKey,{once:true});
    function close(){dialog.classList.add('hidden');dialog.onclick=null;document.removeEventListener('keydown',onKey);}
}

// =====================================================
//  MOBILE DETECTION & LAYOUT
// =====================================================
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768;

function initMobileMode() {
    if (!isMobile) return;
    document.body.classList.add('mobile-mode');

    // Show bottom tab bar
    const tabBar = document.getElementById('mobile-tab-bar');
    if (tabBar) tabBar.style.display = 'flex';

    // Hide desktop input bar position fix — move above tab bar
    // (handled in CSS via sticky + padding-bottom)

    // Mirror voice count badge to mobile button
    setupMobileVoiceCountMirror();
}

function toggleMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    if (!drawer) return;
    drawer.classList.toggle('open');
}

function openMobileDrawer() {
    document.getElementById('mobile-drawer')?.classList.add('open');
}

function closeMobileDrawer() {
    document.getElementById('mobile-drawer')?.classList.remove('open');
}

function toggleMobileCrew() {
    const overlay = document.getElementById('mobile-crew-overlay');
    if (!overlay) return;
    const isOpen = !overlay.classList.contains('hidden');
    if (isOpen) {
        overlay.classList.add('hidden');
        overlay.style.display = '';
        document.getElementById('mob-tab-crew')?.classList.remove('active');
        document.getElementById('mob-tab-chat')?.classList.add('active');
    } else {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        document.getElementById('mob-tab-crew')?.classList.add('active');
        document.getElementById('mob-tab-chat')?.classList.remove('active');
        // Sync crew list content to mobile overlay
        const desktopCrew = document.getElementById('crew-list');
        const mobileCrew  = document.getElementById('mobile-crew-list');
        if (desktopCrew && mobileCrew) mobileCrew.innerHTML = desktopCrew.innerHTML;
    }
}

function setupMobileVoiceCountMirror() {
    // Watch vc-count-comms and mirror to mobile-vc-count-comms
    const source = document.getElementById('vc-count-comms');
    const target = document.getElementById('mobile-vc-count-comms');
    if (!source || !target) return;
    const obs = new MutationObserver(() => {
        target.textContent = source.textContent;
        target.classList.toggle('hidden', source.classList.contains('hidden'));
    });
    obs.observe(source, { childList: true, attributes: true, attributeFilter: ['class'] });
}

function renderMobileChannels() {
    if (!isMobile) return;

    // Mirror text channels
    const mobileContainer = document.getElementById('mobile-text-channels');
    if (mobileContainer) {
        mobileContainer.innerHTML = '';
        textChannels.forEach(ch => {
            const isUnread = unreadChannels.has(ch.id);
            const isActive = currentChannelId === ch.id && !isDMChannel;
            const isMutedCh = mutedChannels.has(ch.id);
            const btn = document.createElement('button');
            btn.className = `w-full flex items-center text-left px-3 py-2 rounded transition group
                ${isActive ? 'bg-zinc-900 border-l-2 border-[#00ff41]' : 'hover:bg-zinc-800'}`;
            btn.innerHTML = `
                <i class="fas ${ch.icon} mr-3 text-sm ${isActive ? 'text-[#00ff41]' : 'text-[#007a2a]'}"></i>
                <span class="retro-font uppercase tracking-wider text-sm ${isActive ? 'text-[#00ff41]' : 'text-[#007a2a]'}">${ch.name}</span>
                ${isMutedCh ? '<i class="fas fa-bell-slash ml-1 text-[9px] text-[#7f0000]"></i>' : ''}
                ${isUnread && !isMutedCh ? '<span class="ml-auto text-[#00ff41] text-xs animate-pulse font-bold">[!]</span>' : ''}
            `;
            btn.onclick = () => { switchChannel(ch.id, false); closeMobileDrawer(); };
            mobileContainer.appendChild(btn);
        });
    }

    // Mirror DMs
    const mobileDMContainer = document.getElementById('mobile-dm-channels');
    if (mobileDMContainer) {
        mobileDMContainer.innerHTML = '';
        if (activeDMs.length === 0) {
            mobileDMContainer.innerHTML = `<div class="px-2 text-[9px] text-[#004411] uppercase tracking-widest">No active links...</div>`;
        } else {
            activeDMs.forEach(({ uid, callsign, dmId }) => {
                const isActive  = currentChannelId === dmId && isDMChannel;
                const hasUnread = unreadDMs.has(dmId);
                const wrap = document.createElement('div');
                wrap.className = 'dm-btn-wrap relative group/dm';
                const btn = document.createElement('button');
                btn.className = `w-full flex items-center text-left px-3 py-2 rounded transition group
                    ${isActive ? 'bg-zinc-900 border-l-2 border-[#00ff41]' : 'hover:bg-zinc-800'}`;
                btn.innerHTML = `
                    <i class="fas fa-user-secret mr-3 text-sm ${isActive ? 'text-[#00ff41]' : 'text-[#004411]'}"></i>
                    <span class="retro-font uppercase tracking-wider text-sm flex-1 ${isActive ? 'text-[#00ff41]' : 'text-[#004411]'}">${escapeHtml(callsign)}</span>
                    ${hasUnread ? '<span class="text-[#00ff41] text-xs animate-pulse font-bold">[!]</span>' : ''}
                `;
                btn.onclick = () => { openDM(uid, callsign); closeMobileDrawer(); };
                wrap.appendChild(btn);

                const hideBtn = document.createElement('button');
                hideBtn.className = 'dm-hide-btn';
                hideBtn.innerHTML = '✕';
                hideBtn.title = 'Hide conversation';
                hideBtn.onclick = (e) => { e.stopPropagation(); hideDMChannel(uid, dmId); };
                wrap.appendChild(hideBtn);

                mobileDMContainer.appendChild(wrap);
            });
        }
    }

    // Update menu badge if any unreads
    const menuBadge = document.getElementById('mob-badge-menu');
    if (menuBadge) {
        const hasAny = unreadChannels.size > 0 || unreadDMs.size > 0;
        menuBadge.classList.toggle('show', hasAny);
    }
}


// ==================== GLOBAL STATE ====================
let currentChannelId  = null;
let isDMChannel       = false;
let currentDMTarget   = null;
let currentUserData   = null;
let currentUID        = null;
let currentChatRef    = null;
let crewListener      = null;
let isAdmin           = false;
let isMuted           = false;
let muteListener      = null;
let adminLogListener  = null;

const unreadChannels  = new Set();
const unreadDMs       = new Set();
const mutedChannels   = new Set();   // channel IDs whose notifications are silenced
let activeDMs         = [];
let dmListeners       = {};

const textChannels = [
    { id: "general-chat", name: "#general", desc: "Agent chatter & mission updates", icon: "fa-comment-dots" },
    { id: "memes",        name: "#memes",   desc: "Anomaly-grade humor only",       icon: "fa-laugh-beam"  },
    { id: "bugs",        name: "#bug_reports",   desc: "User bug submission",        icon: "fa-envelope"    }
];

const EMOJIS = ['👍','👎','❤️','😂','🔥','😮','👀','💀','🗿','💯'];

// Replace with your free key from https://imgbb.com/signup
const IMGBB_API_KEY = "1e75ac7036f44357c841b198ab2aab17";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJ7NMgvML-RAUNgMDlrKMrnBV9bg8PqIs",
  authDomain: "the-strange-domain.firebaseapp.com",
  databaseURL: "https://the-strange-domain-default-rtdb.firebaseio.com",
  projectId: "the-strange-domain",
  storageBucket: "the-strange-domain.firebasestorage.app",
  messagingSenderId: "906271570951",
  appId: "1:906271570951:web:8a0a8ca899a8cd962dbea2",
  measurementId: "G-8WDHCTL2XE"
};

let auth, db;


// =====================================================
//  INIT
// =====================================================
function initApp() {
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db   = firebase.database();

        initEmojiPicker();

        document.getElementById("content-area").innerHTML = `
            <div class="flex items-center justify-center h-full text-[#00ff41] retro-font text-2xl">
                ESTABLISHING SECURE UPLINK...
            </div>`;

        auth.onAuthStateChanged(async user => {
            if (!user) { window.location.replace("login.html"); return; }
            currentUID = user.uid;

            // ── Fetch profile + DMs in parallel (profile includes banned/role/muted) ──
            const [profileSnap, dmSnap] = await Promise.all([
                db.ref(`users/${currentUID}`).once('value'),
                db.ref(`users/${currentUID}/dms`).once('value')
            ]);

            // Check ban first — it's inside the profile snap, no extra round-trip needed
            if (profileSnap.child('banned').val() === true) {
                await auth.signOut();
                window.location.replace("login.html?banned=1");
                return;
            }

            // Apply profile data immediately
            currentUserData = profileSnap.val() || {};
            isAdmin = currentUserData.role === 'admin';
            updateHeader();

            // Apply DMs
            if (dmSnap.exists()) {
                dmSnap.forEach(child => {
                    const { callsign, dmId } = child.val();
                    if (!activeDMs.find(d => d.uid === child.key))
                        activeDMs.push({ uid: child.key, callsign, dmId });
                });
            }

            // Refresh IP-based location on every session (non-blocking)
            refreshUserLocation(user.uid);

            // Boot everything else — no more awaits blocking the UI
            setupPresence(user.uid);
            setupMuteListener();
            setupDMNotifications();
            renderDMList();
            renderCrew();
            renderTextChannels();
            setupVoicePresenceWatchers();
            setupGlobalNotifications();
            initMobileMode();

            // Check for unread messages from while the user was offline,
            // then open the default channel
            checkInitialUnreads().then(() => {
                switchChannel("general-chat", false);
            });
        });
    } catch (err) {
        console.error("Firebase init failed:", err);
    }
}


// =====================================================
//  HELPERS
// =====================================================
// Refresh IP geolocation on each session start — always updates so location stays current
async function refreshUserLocation(uid) {
    try {
        const res  = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
            await db.ref(`users/${uid}/location`).set({
                lat:     data.latitude,
                lon:     data.longitude,
                city:    data.city         || '',
                country: data.country_name || '',
                ip:      data.ip            || '',
                updated: Date.now()
            });
        }
    } catch (e) { /* non-critical, silently ignore */ }
}

function setupPresence(uid) {
    const onlineRef    = db.ref(`users/${uid}/online`);
    const connectedRef = db.ref(".info/connected");
    connectedRef.on("value", snap => {
        if (snap.val() === true) {
            onlineRef.onDisconnect().set(false);
            onlineRef.set(true);
        }
    });
}

function getMessagesRef(channelId, isDM) {
    return isDM
        ? db.ref(`dms/${channelId}/messages`)
        : db.ref(`channels/${channelId}/messages`);
}

function getDMId(uid1, uid2) { return [uid1, uid2].sort().join('_'); }

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
}

function playNotificationSound(channelId) {
    // Check per-channel mute (DMs use key "dm")
    const key = channelId || 'dm';
    if (mutedChannels.has(key)) return;
    playTickSound();
}


// =====================================================
//  IMAGE UPLOAD via ImgBB (no Firebase Storage needed)
// =====================================================
async function uploadImageToImgBB(file) {
    if (!IMGBB_API_KEY || IMGBB_API_KEY === "YOUR_IMGBB_API_KEY") {
        throw new Error("ImgBB API key not set. Add your key to IMGBB_API_KEY in script.js — get one free at imgbb.com");
    }
    const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload  = () => res(reader.result.split(',')[1]);
        reader.onerror = () => rej(new Error("File read failed"));
        reader.readAsDataURL(file);
    });
    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', base64);
    form.append('name', `${currentUID}_${Date.now()}`);
    const resp = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
    const json = await resp.json();
    if (!json.success) throw new Error(json.error?.message || "ImgBB upload failed");
    return json.data.display_url;
}

// Attach file to chat message — images use ImgBB, other files use catbox.moe
function triggerImageUpload() {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z,.json,.csv,.py,.js,.html,.css';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 200 * 1024 * 1024) { sysToast("FILE TOO LARGE: MAX 200 MB", "error"); return; }
        const btn = document.getElementById("upload-img-btn");
        if (btn) { btn.textContent = "UPLOADING..."; btn.disabled = true; }
        try {
            const isImage = file.type.startsWith('image/');
            let url;
            if (isImage && file.size <= 10 * 1024 * 1024) {
                // Small images → ImgBB (fast, permanent)
                url = await uploadImageToImgBB(file);
                await getMessagesRef(currentChannelId, isDMChannel).push({
                    uid: currentUID, callsign: currentUserData.callsign,
                    avatar: currentUserData.avatar || "", text: "",
                    imageUrl: url, timestamp: Date.now()
                });
            } else {
                // Everything else (videos, audio, docs, large images) → catbox.moe
                url = await uploadToCatbox(file);
                if (!url) throw new Error("Upload returned empty URL");

                const fileExt  = file.name.split('.').pop().toLowerCase();
                const fileType = file.type.startsWith('video/') ? 'video'
                    : file.type.startsWith('audio/') ? 'audio'
                    : file.type.startsWith('image/') ? 'image'
                    : 'file';

                await getMessagesRef(currentChannelId, isDMChannel).push({
                    uid: currentUID, callsign: currentUserData.callsign,
                    avatar: currentUserData.avatar || "", text: "",
                    fileUrl: url, fileName: file.name, fileType: fileType,
                    fileExt: fileExt, fileSize: file.size, timestamp: Date.now()
                });
            }
        } catch (err) {
            sysToast("UPLOAD FAILED: " + err.message, "error");
        } finally {
            if (btn) { btn.textContent = "📎"; btn.disabled = false; }
        }
    };
    input.click();
}

// Upload any file to catbox.moe (browser-side, works with CORS)
async function uploadToCatbox(file) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', file);
    const resp = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    if (!resp.ok) throw new Error(`Catbox upload failed: ${resp.status}`);
    const url = await resp.text();
    if (!url.startsWith('http')) throw new Error('Catbox returned invalid URL');
    return url.trim();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// Upload new profile avatar
async function uploadAvatarImage() {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { sysToast('FILE TOO LARGE: MAX 5 MB', 'error'); return; }
        // Open crop modal — upload happens after crop is applied
        openCropModal(file);
    };
    input.click();
}


// =====================================================
//  USER PROFILE
// =====================================================
async function loadUserProfile() {
    const snap = await db.ref(`users/${currentUID}`).once('value');
    currentUserData = snap.val() || {};
    isAdmin = currentUserData.role === 'admin';
    updateHeader();
}

function updateHeader() {
    document.getElementById("header-username").textContent = currentUserData.callsign || "Unknown";
    document.getElementById("header-title").textContent    = currentUserData.title    || "DRIFTER";
    document.getElementById("header-avatar").src           = currentUserData.avatar   ||
        "https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png";

    // Show/hide admin button
    const adminBtn = document.getElementById("admin-panel-btn");
    if (adminBtn) adminBtn.classList.toggle("hidden", !isAdmin);
}

function showProfileModal() {
    if (!currentUserData) return;
    document.getElementById("edit-callsign").value = currentUserData.callsign || "";
    document.getElementById("edit-title").value    = currentUserData.title    || "";
    document.getElementById("edit-bio").value      = currentUserData.bio      || "";
    const av = document.getElementById("edit-avatar");
    if (av) av.value = currentUserData.avatar || "";
    const preview = document.getElementById("avatar-preview");
    if (preview) preview.src = currentUserData.avatar ||
        "https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png";
    document.getElementById("edit-profile-modal").classList.remove("hidden");
}

function closeEditProfile() {
    document.getElementById("edit-profile-modal").classList.add("hidden");
}

async function saveProfile() {
    const title  = document.getElementById("edit-title").value.trim();
    const bio    = document.getElementById("edit-bio").value.trim();
    const avatar = (document.getElementById("edit-avatar")?.value || "").trim() || currentUserData.avatar;
    try {
        await db.ref(`users/${currentUID}`).update({ title, bio, avatar });
        Object.assign(currentUserData, { title, bio, avatar });
        updateHeader();
        closeEditProfile();
    } catch (err) { sysToast("UPDATE FAILED: " + err.message, "error"); }
}


// =====================================================
//  SIDEBAR RENDERING
// =====================================================
function setChannelHeader(icon, name, desc) {
    document.getElementById("channel-header-icon").className = `fas ${icon} text-[#004411] text-sm`;
    document.getElementById("channel-header-name").textContent = name;
    document.getElementById("channel-header-desc").textContent = desc;
}

function toggleChannelMute(e, channelId) {
    e.stopPropagation();
    if (mutedChannels.has(channelId)) {
        mutedChannels.delete(channelId);
    } else {
        mutedChannels.add(channelId);
    }
    renderTextChannels();
}

function renderTextChannels() {
    const container = document.getElementById("text-channels");
    if (!container) return;
    container.innerHTML = "";
    textChannels.forEach(ch => {
        const isUnread = unreadChannels.has(ch.id);
        const isActive = currentChannelId === ch.id && !isDMChannel;
        const isMuted  = mutedChannels.has(ch.id);
        const wrap = document.createElement("div");
        wrap.className = "ch-btn-wrap relative group/ch";
        const btn = document.createElement("button");
        btn.id = `chan-${ch.id}`;
        btn.className = `w-full flex items-center text-left px-3 py-2 rounded transition group
            ${isActive ? 'bg-zinc-900 border-l-2 border-[#00ff41]' : 'hover:bg-zinc-800'}`;
        btn.innerHTML = `
            <i class="fas ${ch.icon} mr-3 text-sm
                ${isActive ? 'text-[#00ff41]' : 'text-[#007a2a] group-hover:text-[#00ff41]'}"></i>
            <span class="retro-font uppercase tracking-wider text-sm
                ${isActive ? 'text-[#00ff41]' : 'text-[#007a2a] group-hover:text-[#00ff41]'}">${ch.name}</span>
            ${isMuted  ? '<i class="fas fa-bell-slash ml-1 text-[9px] text-[#7f0000]"></i>' : ''}
            ${isUnread && !isMuted ? '<span class="ml-auto text-[#00ff41] text-xs animate-pulse font-bold">[!]</span>' : '<span class="ml-auto"></span>'}
            <button class="ch-mute-btn ${isMuted ? 'muted' : ''}"
                    onclick="toggleChannelMute(event, '${ch.id}')"
                    title="${isMuted ? 'Unmute channel' : 'Mute channel'}">${isMuted ? '🔕' : '🔔'}</button>
        `;
        btn.onclick = () => switchChannel(ch.id, false);
        wrap.appendChild(btn);
        container.appendChild(wrap);
    });
    // Mirror to mobile drawer
    renderMobileChannels();
    // Update header badge
    updateHeaderUnreadBadge();
}


function renderDMList() {
    const container = document.getElementById("dm-channels");
    if (!container) return;
    container.innerHTML = "";
    if (activeDMs.length === 0) {
        container.innerHTML = `<div class="px-2 text-[9px] text-[#004411] uppercase tracking-widest">No active links...</div>`;
        return;
    }
    activeDMs.forEach(({ uid, callsign, dmId }) => {
        const isActive  = currentChannelId === dmId && isDMChannel;
        const hasUnread = unreadDMs.has(dmId);
        const wrap = document.createElement("div");
        wrap.className = "dm-btn-wrap relative group/dm";
        const btn = document.createElement("button");
        btn.id = `dm-btn-${uid}`;
        btn.className = `w-full flex items-center text-left px-3 py-2 rounded transition group
            ${isActive ? 'bg-zinc-900 border-l-2 border-[#00ff41]' : 'hover:bg-zinc-800'}`;
        btn.innerHTML = `
            <i class="fas fa-user-secret mr-3 text-sm
                ${isActive ? 'text-[#00ff41]' : 'text-[#004411] group-hover:text-[#00ff41]'}"></i>
            <span class="retro-font uppercase tracking-wider text-sm flex-1
                ${isActive ? 'text-[#00ff41]' : 'text-[#004411] group-hover:text-[#00ff41]'}">${escapeHtml(callsign)}</span>
            ${hasUnread ? '<span class="text-[#00ff41] text-xs animate-pulse font-bold">[!]</span>' : ''}
        `;
        btn.onclick = () => openDM(uid, callsign);
        wrap.appendChild(btn);

        // Hide/close DM button
        const hideBtn = document.createElement("button");
        hideBtn.className = "dm-hide-btn";
        hideBtn.innerHTML = "✕";
        hideBtn.title = "Hide conversation";
        hideBtn.onclick = (e) => { e.stopPropagation(); hideDMChannel(uid, dmId); };
        wrap.appendChild(hideBtn);

        container.appendChild(wrap);
    });
    // Mirror to mobile drawer
    renderMobileChannels();
    // Update header badge
    updateHeaderUnreadBadge();
}


// =====================================================
//  HEADER UNREAD NOTIFICATION BADGE
// =====================================================
function updateHeaderUnreadBadge() {
    const badge = document.getElementById('header-unread-badge');
    const count = document.getElementById('header-unread-count');
    if (!badge || !count) return;

    const total = unreadChannels.size + unreadDMs.size;
    if (total > 0) {
        count.textContent = total > 99 ? '99+' : total;
        badge.classList.remove('hidden');
        // Update document title
        document.title = `(${total}) The Strange Domain`;
    } else {
        badge.classList.add('hidden');
        document.title = 'The Strange Domain';
    }
}

/** Click the badge → jump to the first channel/DM with unread messages */
function jumpToFirstUnread() {
    // Try unread channels first
    for (const ch of textChannels) {
        if (unreadChannels.has(ch.id)) {
            switchChannel(ch.id, false);
            return;
        }
    }
    // Try unread DMs
    for (const { uid, callsign, dmId } of activeDMs) {
        if (unreadDMs.has(dmId)) {
            openDM(uid, callsign);
            return;
        }
    }
}


// =====================================================
//  CHANNEL SWITCHING
// =====================================================
function switchChannel(id, dm) {
    if (currentChannelId === id && isDMChannel === dm) return;

    // Mark the channel we're LEAVING as read (persist timestamp)
    if (currentChannelId) {
        markChannelRead(currentChannelId);
    }

    currentChannelId = id;
    isDMChannel      = dm;

    if (dm) unreadDMs.delete(id);
    else    unreadChannels.delete(id);

    // Mark the channel we're ENTERING as read
    markChannelRead(id);

    if (currentChatRef) { currentChatRef.off(); currentChatRef = null; }
    detachAllReactionListeners();

    renderTextChannels();
    renderDMList();

    const inputBar = document.getElementById("chat-input-bar");
    if (inputBar) inputBar.classList.remove("hidden");

    if (dm) {
        setChannelHeader("fa-user-secret", `@ ${currentDMTarget?.callsign || "???"}`, "direct signal");
    } else {
        const ch = textChannels.find(c => c.id === id);
        if (ch) setChannelHeader(ch.icon, ch.name, ch.desc);
    }
    loadTextChat(id, dm);
}

/** Persist a last-read timestamp so we can detect unreads across sessions */
function markChannelRead(channelId) {
    if (!currentUID || !channelId) return;
    db.ref(`users/${currentUID}/lastRead/${channelId}`).set(Date.now()).catch(() => {});
}


// =====================================================
//  CHAT LOADING
// =====================================================
async function loadTextChat(channelId, isDM) {
    const area = document.getElementById("content-area");
    area.innerHTML = `<div id="messages" class="max-w-3xl mx-auto pb-24"></div>`;

    const msgContainer = document.getElementById("messages");
    currentChatRef     = getMessagesRef(channelId, isDM);

    const snap = await currentChatRef.orderByChild('timestamp').limitToLast(50).once('value');
    snap.forEach(child => renderMessage(child.key, child.val()));
    // Scroll the actual overflow container, not the inner messages div
    area.scrollTop = area.scrollHeight;

    // Track whether initial load is complete so we only highlight truly new messages
    let initialLoadDone = false;
    setTimeout(() => { initialLoadDone = true; }, 200);

    currentChatRef.on("child_added", snap => {
        const msg = snap.val();
        if (!document.getElementById(`msg-${snap.key}`)) {
            renderMessage(snap.key, msg);
            const el  = document.getElementById(`msg-${snap.key}`);

            const scrollBox = document.getElementById("content-area");
            if (scrollBox && el) {
                const isOwnMessage = msg.uid === currentUID;
                const nearBottom   = scrollBox.scrollHeight - scrollBox.scrollTop - scrollBox.clientHeight < 400;
                const isNewMessage = initialLoadDone;

                // Highlight incoming messages from others (not own, not initial load)
                if (isNewMessage && !isOwnMessage) {
                    el.classList.add("message-new");
                    el.addEventListener("animationend", () => el.classList.remove("message-new"), { once: true });
                }

                // Scroll to bottom for new messages when near bottom or it's your own message
                if (nearBottom || isOwnMessage) {
                    scrollBox.scrollTo({ top: scrollBox.scrollHeight, behavior: isNewMessage ? "smooth" : "instant" });
                }
            }
        }
    });

    currentChatRef.on("child_changed", snap => {
        const data   = snap.val();
        const textEl = document.getElementById(`text-${snap.key}`);
        if (textEl && textEl.dataset.editing !== "true") {
            textEl.dataset.raw = data.text || "";
            // Rebuild inner HTML with linkified text + edited badge
            let html = linkifyText(escapeHtml(data.text || ""));
            if (data.edited) {
                html += `<span class="edited-tag" id="edited-${snap.key}">(edited)</span>`;
            }
            textEl.innerHTML = html;
            // Also re-process embeds for the updated text
            const embedContainer = document.getElementById(`embeds-${snap.key}`);
            if (embedContainer) embedContainer.innerHTML = '';
            if (data.text) processMessageEmbeds(snap.key, data.text);
        }
        // Reactions are handled by their own per-message listener (listenReactions).
        // Do NOT call renderReactions here — data.reactions may be undefined when
        // Firebase strips empty nodes, which would wipe all pills.
    });

    currentChatRef.on("child_removed", snap => {
        document.getElementById(`msg-${snap.key}`)?.remove();
    });
}

async function sendMessage() {
    if (isMuted) return;   // silently blocked — UI already shows muted notice
    const input = document.getElementById("message-input");
    const text  = input.value.trim();
    if (!text || !currentChannelId) return;
    try {
        await getMessagesRef(currentChannelId, isDMChannel).push({
            uid: currentUID, callsign: currentUserData.callsign,
            avatar: currentUserData.avatar || "", text, timestamp: Date.now()
        });
        input.value = "";
    } catch (err) { console.error(err); }
}


// =====================================================
//  MESSAGE RENDERING
// =====================================================
function renderMessage(id, msg) {
    const container = document.getElementById("messages");
    if (!container || document.getElementById(`msg-${id}`)) return;

    const isOwn = msg.uid === currentUID;
    const msgDate = new Date(msg.timestamp);
    const now     = new Date();
    const isToday = msgDate.toDateString() === now.toDateString();
    const isYesterday = msgDate.toDateString() === new Date(now - 86400000).toDateString();
    const timePart = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const time = isToday ? `Today at ${timePart}`
        : isYesterday ? `Yesterday at ${timePart}`
        : `${msgDate.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })} ${timePart}`;

    const div = document.createElement("div");
    div.id = `msg-${id}`;
    div.className = "message group p-4 border-l-2 border-[#004411] hover:border-[#00ff41] bg-zinc-950/50 flex gap-4 mb-3 transition-all";

    const bodyHtml = msg.imageUrl
        ? `<div class="mt-1">
               <img src="${escapeHtml(msg.imageUrl)}"
                    class="max-w-sm max-h-72 border border-[#004411] hover:border-[#00ff41] transition-colors cursor-pointer object-contain"
                    onclick="window.open('${escapeHtml(msg.imageUrl)}','_blank')"
                    alt="uploaded image">
           </div>`
        : msg.fileUrl
        ? renderFileAttachment(msg)
        : `<div class="text-[#00ff41]/90 leading-relaxed retro-font text-lg break-words"
                id="text-${id}" data-raw="${escapeHtml(msg.text || '')}">${linkifyText(escapeHtml(msg.text || ''))}${msg.edited ? `<span class="edited-tag" id="edited-${id}">(edited)</span>` : ''}</div>
           <div id="embeds-${id}" class="embed-container"></div>`;

    const hasAttachment = msg.imageUrl || msg.fileUrl;
    const editDeleteControls = isOwn && !hasAttachment
        ? `<div class="msg-controls flex gap-1.5 opacity-0 transition-opacity">
               <button onclick="editMessageInline('${id}')"
                   class="text-[11px] text-yellow-700 hover:text-yellow-400 retro-font uppercase border border-transparent hover:border-yellow-700/50 px-2 py-0.5 transition-all">EDIT</button>
               <button onclick="deleteMessage('${id}')"
                   class="text-[11px] text-red-900 hover:text-red-500 retro-font uppercase border border-transparent hover:border-red-900/50 px-2 py-0.5 transition-all">PURGE</button>
           </div>`
        : isOwn
        ? `<div class="msg-controls flex gap-1.5 opacity-0 transition-opacity">
               <button onclick="deleteMessage('${id}')"
                   class="text-[11px] text-red-900 hover:text-red-500 retro-font uppercase border border-transparent hover:border-red-900/50 px-2 py-0.5 transition-all">PURGE</button>
           </div>`
        : isAdmin
        ? `<div class="msg-controls flex gap-1.5 opacity-0 transition-opacity">
               <button onclick="adminDeleteMessage('${id}', '${escapeHtml(msg.callsign || '')}')"
                   class="admin-msg-delete">⬡ DEL</button>
           </div>`
        : '';

    div.innerHTML = `
        <img src="${escapeHtml(msg.avatar || 'https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png')}"
             class="w-10 h-10 border border-[#00ff41] object-cover shadow-[0_0_5px_rgba(0,255,65,0.25)] flex-shrink-0 self-start mt-0.5 ${!isOwn ? 'cursor-pointer hover:shadow-[0_0_12px_rgba(0,255,65,0.55)] transition-shadow' : ''}"
             ${!isOwn ? `onclick="showUserProfile('${msg.uid}','${escapeHtml(msg.callsign || '')}')" title="View profile"` : ''}>
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-1 gap-2">
                <div class="flex items-center gap-3 flex-wrap">
                    <span class="retro-font text-[#00ff41] font-bold tracking-wider ${!isOwn ? 'cursor-pointer hover:underline decoration-[#007a2a] underline-offset-2' : ''}"
                          ${!isOwn ? `onclick="showUserProfile('${msg.uid}','${escapeHtml(msg.callsign || '')}')"` : ''}>${escapeHtml(msg.callsign || '???')}</span>
                    <span class="text-[10px] text-[#004411] uppercase">${time}</span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <button class="react-trigger" onclick="showEmojiPicker('${id}', this)">
                        <i class="far fa-smile mr-1"></i>REACT
                    </button>
                    ${editDeleteControls}
                </div>
            </div>
            ${bodyHtml}
            <div id="reactions-${id}" class="flex flex-wrap gap-1.5 mt-2"></div>
        </div>
    `;

    container.appendChild(div);
    // Live reactions listener — handles both initial state and future updates.
    listenReactions(id);

    // Fetch link embeds asynchronously after render
    if (!msg.imageUrl && !msg.fileUrl && msg.text) {
        processMessageEmbeds(id, msg.text);
    }
}


// =====================================================
//  INLINE EDITING
// =====================================================
function editMessageInline(id) {
    const textEl = document.getElementById(`text-${id}`);
    if (!textEl) return;
    const rawText = textEl.dataset.raw || "";
    textEl.dataset.editing      = "true";
    textEl.dataset.originalText = rawText;
    textEl.innerHTML = `
        <div class="flex flex-col gap-2 mt-1">
            <textarea id="edit-ta-${id}" class="edit-textarea" rows="2">${escapeHtml(rawText)}</textarea>
            <div class="flex gap-3 items-center">
                <button onclick="saveEditMessage('${id}')"
                    class="text-xs border border-[#004411] hover:border-[#00ff41] hover:text-[#00ff41] text-[#004411] px-3 py-0.5 retro-font uppercase tracking-widest transition-all">SAVE_TX</button>
                <button onclick="cancelEditMessage('${id}')"
                    class="text-xs text-[#004411] hover:text-red-400 retro-font uppercase tracking-widest transition-all">ABORT</button>
                <span class="text-[9px] text-[#004411] ml-2 tracking-widest">ENTER TO SAVE · ESC TO ABORT</span>
            </div>
        </div>
    `;
    const ta = document.getElementById(`edit-ta-${id}`);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    ta.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEditMessage(id); }
        if (e.key === 'Escape') cancelEditMessage(id);
    });
}

async function saveEditMessage(id) {
    const ta = document.getElementById(`edit-ta-${id}`);
    if (!ta) return;
    const newText = ta.value.trim();
    if (!newText) return;

    await getMessagesRef(currentChannelId, isDMChannel).child(id).update({ text: newText, edited: true }).catch(console.error);

    // Restore UI immediately — child_changed skips editing elements so we do it here
    const textEl = document.getElementById(`text-${id}`);
    if (!textEl) return;
    delete textEl.dataset.editing;
    textEl.dataset.raw = newText;
    let html = linkifyText(escapeHtml(newText));
    html += `<span class="edited-tag" id="edited-${id}">(edited)</span>`;
    textEl.innerHTML = html;

    // Re-process embeds for the updated text
    const embedContainer = document.getElementById(`embeds-${id}`);
    if (embedContainer) embedContainer.innerHTML = '';
    processMessageEmbeds(id, newText);
}

function cancelEditMessage(id) {
    const textEl = document.getElementById(`text-${id}`);
    if (!textEl) return;
    const orig = textEl.dataset.originalText || "";
    delete textEl.dataset.editing;
    textEl.dataset.raw = orig;
    textEl.textContent = orig;
}

function deleteMessage(id) {
    sysConfirm({
        title: "PURGE DATA", msg: "Permanently delete this transmission? This cannot be undone.",
        confirmText: "PURGE", danger: true,
        onConfirm: () => getMessagesRef(currentChannelId, isDMChannel).child(id).remove().catch(console.error)
    });
}


// =====================================================
//  EMOJI REACTIONS
// =====================================================

// Per-message reaction listeners — keyed by msgId → Firebase ref.
// Kept so we can detach them all when switching channels.
const _rxListeners = {};

// Attach a live .on('value') to a message's reactions node.
// This is the sole place that calls renderReactions, so pills
// are never wiped by unrelated child_changed events on the parent.
function listenReactions(msgId) {
    if (_rxListeners[msgId]) return;
    const ref = getMessagesRef(currentChannelId, isDMChannel)
                    .child(`${msgId}/reactions`);
    ref.on('value', snap => {
        renderReactions(msgId, snap.val() || {});
    });
    _rxListeners[msgId] = ref;
}

// Detach every reaction listener — called on channel switch.
function detachAllReactionListeners() {
    Object.values(_rxListeners).forEach(ref => ref.off('value'));
    for (const k in _rxListeners) delete _rxListeners[k];
}

function initEmojiPicker() {
    const picker = document.getElementById("emoji-picker");
    EMOJIS.forEach(emoji => {
        const btn = document.createElement("button");
        btn.className   = "emoji-opt";
        btn.textContent = emoji;
        btn.onclick = e => {
            e.stopPropagation();
            if (picker.dataset.targetMsgId) toggleReaction(picker.dataset.targetMsgId, emoji);
            hideEmojiPicker();
        };
        picker.appendChild(btn);
    });
    document.addEventListener("click", e => {
        if (!e.target.closest('#emoji-picker') && !e.target.closest('.react-trigger')) hideEmojiPicker();
    });
}

function showEmojiPicker(msgId, btn) {
    const picker = document.getElementById("emoji-picker");
    const rect   = btn.getBoundingClientRect();
    picker.dataset.targetMsgId = msgId;

    // Show offscreen first to measure actual rendered width
    picker.style.visibility = 'hidden';
    picker.style.left = '0px';
    picker.style.top  = '0px';
    picker.classList.remove("hidden");

    const pickerW = picker.offsetWidth;
    const pickerH = picker.offsetHeight;
    const margin  = 8;
    const vw      = window.innerWidth;
    const vh      = window.innerHeight;

    // Center under the button, clamped so it never leaves the viewport
    let left = rect.left + (rect.width / 2) - (pickerW / 2);
    left = Math.max(margin, Math.min(left, vw - pickerW - margin));

    // Prefer below the button, flip above if not enough room
    let top = rect.bottom + 4;
    if (top + pickerH > vh - margin) top = rect.top - pickerH - 4;

    picker.style.left = `${left}px`;
    picker.style.top  = `${top}px`;
    picker.style.visibility = '';
}

function hideEmojiPicker() {
    const picker = document.getElementById("emoji-picker");
    picker.classList.add("hidden");
    delete picker.dataset.targetMsgId;
}

async function toggleReaction(msgId, emoji) {
    if (!currentUID || !currentChannelId) return;
    const safeKey     = encodeURIComponent(emoji);
    const reactionRef = getMessagesRef(currentChannelId, isDMChannel).child(`${msgId}/reactions/${safeKey}/${currentUID}`);
    const snap = await reactionRef.once('value');
    snap.exists() ? await reactionRef.remove() : await reactionRef.set(true);
}

function renderReactions(msgId, reactions) {
    const container = document.getElementById(`reactions-${msgId}`);
    if (!container) return;
    container.innerHTML = "";
    Object.entries(reactions || {}).forEach(([safeKey, uids]) => {
        const emoji   = decodeURIComponent(safeKey);
        const users   = Object.keys(uids || {});
        if (!users.length) return;
        const hasReacted = users.includes(currentUID);
        const btn = document.createElement("button");
        btn.className   = `reaction-pill ${hasReacted ? 'reacted' : ''}`;
        btn.innerHTML   = `<span class="emoji">${emoji}</span><span>${users.length}</span>`;
        btn.onclick     = () => toggleReaction(msgId, emoji);
        container.appendChild(btn);
    });
}


// =====================================================
//  PRIVATE MESSAGING
// =====================================================
async function loadActiveDMs() {
    const snap = await db.ref(`users/${currentUID}/dms`).once('value').catch(() => null);
    if (!snap?.exists()) return;
    snap.forEach(child => {
        const { callsign, dmId } = child.val();
        if (!activeDMs.find(d => d.uid === child.key))
            activeDMs.push({ uid: child.key, callsign, dmId });
    });
    renderDMList();
    setupDMNotifications();
}

async function openDM(targetUID, targetCallsign) {
    if (!currentUID || !targetUID || targetUID === currentUID) return;
    const dmId = getDMId(currentUID, targetUID);
    currentDMTarget = { uid: targetUID, callsign: targetCallsign };
    await db.ref(`users/${currentUID}/dms/${targetUID}`)
        .set({ callsign: targetCallsign, dmId, lastOpened: Date.now() })
        .catch(console.error);
    if (!activeDMs.find(d => d.uid === targetUID)) {
        activeDMs.push({ uid: targetUID, callsign: targetCallsign, dmId });
        setupDMNotificationFor(dmId);
    }
    renderDMList();
    switchChannel(dmId, true);
}

function hideDMChannel(targetUID, dmId) {
    // If this DM is currently open, switch back to default channel
    if (currentChannelId === dmId && isDMChannel) {
        switchChannel(textChannels[0]?.id || 'general-chat', false);
    }

    // Remove from active DMs array
    activeDMs = activeDMs.filter(d => d.uid !== targetUID);

    // Detach the notification listener for this DM
    if (dmListeners[dmId]) {
        dmListeners[dmId].off();
        delete dmListeners[dmId];
    }

    // Clear any unread state
    unreadDMs.delete(dmId);

    // Remove from Firebase so it doesn't reload on next login
    db.ref(`users/${currentUID}/dms/${targetUID}`).remove().catch(() => {});

    // Re-render
    renderDMList();
    renderCrewDOM();
}

function setupDMNotifications() { activeDMs.forEach(({ dmId }) => setupDMNotificationFor(dmId)); }

function setupDMNotificationFor(dmId) {
    if (dmListeners[dmId]) return;
    const ref = db.ref(`dms/${dmId}/messages`).orderByChild('timestamp').startAt(Date.now());
    ref.on('child_added', snap => {
        const msg = snap.val();
        if (msg.uid !== currentUID) {
            playNotificationSound('dm');
            if (currentChannelId !== dmId) {
                unreadDMs.add(dmId);
                renderDMList();
                renderCrewDOM();
            } else {
                // User is viewing this DM right now — keep lastRead current
                markChannelRead(dmId);
            }
        }
    });
    dmListeners[dmId] = ref;
}


// =====================================================
//  CREW LIST — granular child listeners, no full-tree re-download
// =====================================================
const crewCache = {};   // uid → user object, kept in sync

function renderCrewDOM() {
    const container = document.getElementById("crew-list");
    if (!container) return;
    container.innerHTML = "";

    const online  = [];
    const offline = [];
    Object.entries(crewCache).forEach(([uid, user]) => {
        (user.online ? online : offline).push({ uid, user });
    });

    if (online.length === 0 && offline.length === 0) {
        container.innerHTML = `<div class="text-[9px] text-[#004411] uppercase p-2 tracking-widest">No crew found...</div>`;
        return;
    }

    const renderGroup = (members, isOnline) => {
        if (members.length === 0) return;
        const label = document.createElement("div");
        label.className = "text-[8px] text-[#004411] uppercase tracking-widest px-2 pt-3 pb-1 select-none";
        label.textContent = isOnline ? "● Online" : "○ Offline";
        container.appendChild(label);

        members.forEach(({ uid, user }) => {
            const isSelf    = uid === currentUID;
            const dmId      = getDMId(currentUID, uid);
            const hasUnread = !isSelf && unreadDMs.has(dmId);

            const item = document.createElement("div");
            item.className = `crew-item flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-900 rounded transition border border-transparent hover:border-[#004411] cursor-default ${isOnline ? '' : 'crew-item-offline'}`;
            item.innerHTML = `
                <div class="relative flex-shrink-0">
                    <img src="${escapeHtml(user.avatar || 'https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png')}"
                         class="w-8 h-8 rounded border ${isOnline ? 'border-[#007a2a]' : 'border-[#003018]'} object-cover bg-black ${!isSelf ? 'cursor-pointer hover:border-[#00ff41] transition-colors' : ''}"
                         ${!isSelf ? `onclick="showUserProfile('${uid}','${escapeHtml(user.callsign || '')}')" title="View profile"` : ''}>
                    <div class="${isOnline ? 'status-dot-online' : 'status-dot-offline'}"></div>
                </div>
                <div class="overflow-hidden flex-1 min-w-0">
                    <div class="retro-font ${isOnline ? 'text-[#00ff41]' : 'text-[#004411]'} text-xs truncate uppercase leading-none">
                        ${escapeHtml(user.callsign || '???')}
                        ${isSelf ? '<span class="text-[#004411] text-[9px] ml-1">(you)</span>' : ''}
                    </div>
                    <div class="text-[8px] text-[#004411] truncate tracking-tighter uppercase mt-0.5">
                        ${escapeHtml(user.title || 'VOID DRIFTER')}
                    </div>
                </div>
                ${hasUnread ? '<span class="text-[#00ff41] text-[9px] animate-pulse font-bold flex-shrink-0">[!]</span>' : ''}
                ${!isSelf ? `<button class="dm-btn flex-shrink-0"
                    onclick="openDM('${uid}','${escapeHtml(user.callsign || '')}')">PM</button>` : ''}
            `;
            container.appendChild(item);
        });
    };

    renderGroup(online, true);
    renderGroup(offline, false);

    // Mirror to mobile crew overlay if open
    const mobileCrewOverlay = document.getElementById('mobile-crew-overlay');
    const mobileCrew = document.getElementById('mobile-crew-list');
    if (mobileCrew && mobileCrewOverlay && !mobileCrewOverlay.classList.contains('hidden')) {
        mobileCrew.innerHTML = container.innerHTML;
    }
}

function renderCrew() {
    if (crewListener) { crewListener.off(); crewListener = null; }

    // Seed the cache then keep it in sync with granular events
    crewListener = db.ref('users');
    crewListener.once('value', snap => {
        snap.forEach(child => { crewCache[child.key] = child.val(); });
        renderCrewDOM();

        // After seed, only listen for granular changes — no more full downloads
        crewListener.on('child_added',   s => { crewCache[s.key] = s.val(); renderCrewDOM(); });
        crewListener.on('child_changed', s => { crewCache[s.key] = s.val(); renderCrewDOM(); });
        crewListener.on('child_removed', s => { delete crewCache[s.key];    renderCrewDOM(); });
    });
}


// =====================================================
//  GLOBAL CHANNEL NOTIFICATIONS
// =====================================================

/** Check all public channels and DMs for messages newer than lastRead */
async function checkInitialUnreads() {
    // Fetch all lastRead timestamps in one go
    const lastReadSnap = await db.ref(`users/${currentUID}/lastRead`).once('value').catch(() => null);
    const lastReadData = lastReadSnap?.val() || {};

    // Check public channels
    const channelChecks = textChannels.map(async (channel) => {
        const lastRead = lastReadData[channel.id] || 0;
        try {
            const snap = await db.ref(`channels/${channel.id}/messages`)
                .orderByChild('timestamp')
                .startAt(lastRead + 1)
                .limitToLast(1)
                .once('value');
            if (snap.exists()) {
                let hasOtherMsg = false;
                snap.forEach(child => {
                    if (child.val().uid !== currentUID) hasOtherMsg = true;
                });
                if (hasOtherMsg) unreadChannels.add(channel.id);
            }
        } catch (e) { /* ignore */ }
    });

    // Check DMs
    const dmChecks = activeDMs.map(async ({ dmId }) => {
        const lastRead = lastReadData[dmId] || 0;
        try {
            const snap = await db.ref(`dms/${dmId}/messages`)
                .orderByChild('timestamp')
                .startAt(lastRead + 1)
                .limitToLast(1)
                .once('value');
            if (snap.exists()) {
                let hasOtherMsg = false;
                snap.forEach(child => {
                    if (child.val().uid !== currentUID) hasOtherMsg = true;
                });
                if (hasOtherMsg) unreadDMs.add(dmId);
            }
        } catch (e) { /* ignore */ }
    });

    await Promise.all([...channelChecks, ...dmChecks]);

    // Don't mark the channel we're about to open as unread
    unreadChannels.delete('general-chat');

    renderTextChannels();
    renderDMList();
}

/** Live listeners for new messages arriving while app is open */
function setupGlobalNotifications() {
    const startTime = Date.now();
    textChannels.forEach(channel => {
        db.ref(`channels/${channel.id}/messages`)
            .orderByChild('timestamp').startAt(startTime)
            .on('child_added', snap => {
                const msg = snap.val();
                if (msg.uid !== currentUID) {
                    playNotificationSound(channel.id);
                    if (channel.id !== currentChannelId || isDMChannel) {
                        unreadChannels.add(channel.id);
                        renderTextChannels();
                    } else {
                        // User is viewing this channel right now — keep lastRead current
                        markChannelRead(channel.id);
                    }
                }
            });
    });
}


// =====================================================
//  LOGOUT
// =====================================================
function logout() {
    sysConfirm({
        title: "END TRANSMISSION", msg: "Terminate your session and disconnect from the domain?",
        confirmText: "DISCONNECT", cancelText: "STAY", danger: true,
        onConfirm: () => db.ref(`users/${currentUID}/online`).set(false).then(() => auth.signOut().then(() => window.location.replace("login.html")))
    });
}

// =====================================================
//  USER PROFILE VIEW (clicking other users)
// =====================================================
let _profileTargetUID      = null;
let _profileTargetCallsign = null;

async function showUserProfile(uid, callsign) {
    if (!uid) return;
    _profileTargetUID      = uid;
    _profileTargetCallsign = callsign;

    const modal = document.getElementById('user-profile-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    // Reset while loading
    document.getElementById('up-callsign').textContent = callsign || '???';
    document.getElementById('up-title').textContent    = '...';
    document.getElementById('up-bio').textContent      = '';
    document.getElementById('up-avatar').src           = 'https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png';
    document.getElementById('up-bio-wrap').classList.add('hidden');
    document.getElementById('up-no-bio').classList.add('hidden');
    document.getElementById('up-online-badge').classList.add('hidden');
    document.getElementById('up-offline-badge').classList.add('hidden');
    document.getElementById('up-actions').classList.add('hidden');

    try {
        const snap = await db.ref(`users/${uid}`).once('value');
        const user = snap.val() || {};

        document.getElementById('up-avatar').src           = user.avatar   || 'https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png';
        document.getElementById('up-callsign').textContent = user.callsign || callsign || '???';
        document.getElementById('up-title').textContent    = user.title    || 'VOID DRIFTER';

        if (user.bio && user.bio.trim()) {
            document.getElementById('up-bio').textContent = user.bio.trim();
            document.getElementById('up-bio-wrap').classList.remove('hidden');
        } else {
            document.getElementById('up-no-bio').classList.remove('hidden');
        }

        if (user.online) {
            document.getElementById('up-online-badge').classList.remove('hidden');
        } else {
            document.getElementById('up-offline-badge').classList.remove('hidden');
        }

        // Only show DM button for other users
        if (uid !== currentUID) {
            document.getElementById('up-actions').classList.remove('hidden');
        }
    } catch (err) {
        console.error('Failed to load profile:', err);
    }
}

function closeUserProfile(e) {
    // If called from backdrop click, only close when clicking the backdrop itself
    if (e && e.currentTarget === e.target) {
        document.getElementById('user-profile-modal').classList.add('hidden');
        _profileTargetUID = _profileTargetCallsign = null;
        return;
    }
    if (e) return; // stopPropagation handles inner clicks
    document.getElementById('user-profile-modal').classList.add('hidden');
    _profileTargetUID = _profileTargetCallsign = null;
}

function userProfileDM() {
    if (!_profileTargetUID || !_profileTargetCallsign) return;
    document.getElementById('user-profile-modal').classList.add('hidden');
    openDM(_profileTargetUID, _profileTargetCallsign);
    _profileTargetUID = _profileTargetCallsign = null;
}


// =====================================================
//  MUTE LISTENER — watches own mute status in real-time
// =====================================================
function setupMuteListener() {
    if (muteListener) muteListener.off();
    muteListener = db.ref(`users/${currentUID}/muted`);
    muteListener.on('value', snap => {
        isMuted = snap.val() === true;
        const notice   = document.getElementById("muted-notice");
        const controls = document.getElementById("input-controls");
        if (notice && controls) {
            notice.classList.toggle("hidden", !isMuted);
            controls.classList.toggle("hidden", isMuted);
        }
    });
}


// =====================================================
//  ADMIN — message deletion
// =====================================================
function adminDeleteMessage(msgId, callsign) {
    if (!isAdmin) return;
    sysConfirm({ title: "PURGE MESSAGE", msg: `Delete transmission from ${callsign}? This action will be logged.`,
        confirmText: "PURGE", danger: true,
        onConfirm: () => getMessagesRef(currentChannelId, isDMChannel).child(msgId).remove()
            .then(() => writeAdminLog('PURGE_MSG', callsign, `in ${currentChannelId}`)).catch(console.error)
    });
}


// =====================================================
//  ADMIN — panel open / close / tabs
// =====================================================
function showAdminPanel() {
    if (!isAdmin) return;
    document.getElementById("admin-panel-modal").classList.remove("hidden");
    adminTab('users');
    loadAdminUserList();
    loadAdminLog();
}

function closeAdminPanel() {
    document.getElementById("admin-panel-modal").classList.add("hidden");
    if (adminLogListener) { adminLogListener.off(); adminLogListener = null; }
}

function adminTab(tab) {
    ['users','log'].forEach(t => {
        document.getElementById(`admin-tab-content-${t}`).classList.toggle('hidden', t !== tab);
        const btn = document.getElementById(`admin-tab-${t}`);
        btn.classList.toggle('active', t === tab);
        if (t !== tab) {
            btn.style.borderBottomColor = 'transparent';
            btn.style.color = '';
        }
    });
}


// =====================================================
//  ADMIN — user list
// =====================================================
async function loadAdminUserList() {
    const snap = await db.ref('users').once('value');
    const container = document.getElementById("admin-user-list");
    container.innerHTML = "";

    let total = 0, online = 0, muted = 0, banned = 0;

    snap.forEach(child => {
        const uid  = child.key;
        const user = child.val();
        total++;
        if (user.online)  online++;
        if (user.muted)   muted++;
        if (user.banned)  banned++;

        const isSelf       = uid === currentUID;
        const userIsAdmin  = user.role === 'admin';
        const userIsMuted  = user.muted  === true;
        const userIsBanned = user.banned === true;

        let rowClass = 'admin-user-row';
        if (userIsAdmin)  rowClass += ' is-admin';
        if (userIsMuted)  rowClass += ' is-muted';
        if (userIsBanned) rowClass += ' is-banned';

        const badges = [
            userIsAdmin  ? `<span class="admin-badge admin">ADMIN</span>` : '',
            userIsMuted  ? `<span class="admin-badge muted">MUTED</span>` : '',
            userIsBanned ? `<span class="admin-badge banned">BANNED</span>` : '',
            user.online  ? `<span class="text-[9px] text-[#00ff41] font-bold retro-font tracking-widest">● ONLINE</span>`
                         : `<span class="text-[9px] text-[#004411] retro-font tracking-widest">○ OFFLINE</span>`,
        ].filter(Boolean).join('');

        // Build action buttons (can't act on yourself)
        const actions = isSelf ? `<span class="text-[9px] text-[#004411] retro-font tracking-widest">(YOU)</span>` : `
            <div class="flex gap-2 flex-wrap">
                ${userIsMuted
                    ? `<button class="admin-action-btn unmute" onclick="adminUnmute('${uid}','${escapeHtml(user.callsign || '')}')">UNMUTE</button>`
                    : `<button class="admin-action-btn mute"   onclick="adminMute('${uid}','${escapeHtml(user.callsign || '')}')">MUTE</button>`
                }
                ${userIsBanned
                    ? `<button class="admin-action-btn unban" onclick="adminUnban('${uid}','${escapeHtml(user.callsign || '')}')">UNBAN</button>`
                    : `<button class="admin-action-btn ban"   onclick="adminBan('${uid}','${escapeHtml(user.callsign || '')}')">BAN</button>`
                }
                ${userIsAdmin
                    ? `<button class="admin-action-btn demote"  onclick="adminDemote('${uid}','${escapeHtml(user.callsign || '')}')">DEMOTE</button>`
                    : `<button class="admin-action-btn promote" onclick="adminPromote('${uid}','${escapeHtml(user.callsign || '')}')">PROMOTE</button>`
                }
            </div>
        `;

        const row = document.createElement('div');
        row.id = `admin-row-${uid}`;
        row.className = rowClass;
        row.innerHTML = `
            <img src="${escapeHtml(user.avatar || 'https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png')}"
                 class="w-10 h-10 border border-[#004411] object-cover flex-shrink-0">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="retro-font text-[#00ff41] text-sm uppercase tracking-wider">${escapeHtml(user.callsign || '???')}</span>
                    ${badges}
                </div>
                <div class="text-[9px] text-[#004411] uppercase tracking-widest mt-0.5">${escapeHtml(user.title || 'VOID DRIFTER')}</div>
            </div>
            <div class="flex-shrink-0">${actions}</div>
        `;
        container.appendChild(row);
    });

    // Update stats
    const stats = document.getElementById("admin-stats");
    if (stats) stats.innerHTML = `
        CREW: ${total} &nbsp;|&nbsp; ONLINE: ${online}<br>
        MUTED: ${muted} &nbsp;|&nbsp; BANNED: ${banned}
    `;
}

// Reload a single row after action
async function refreshAdminRow(uid) {
    const snap = await db.ref(`users/${uid}`).once('value');
    const user = snap.val();
    if (!user) return;

    const userIsAdmin  = user.role  === 'admin';
    const userIsMuted  = user.muted === true;
    const userIsBanned = user.banned === true;

    const oldRow = document.getElementById(`admin-row-${uid}`);
    if (!oldRow) { loadAdminUserList(); return; }  // fallback full reload

    let rowClass = 'admin-user-row';
    if (userIsAdmin)  rowClass += ' is-admin';
    if (userIsMuted)  rowClass += ' is-muted';
    if (userIsBanned) rowClass += ' is-banned';

    const badges = [
        userIsAdmin  ? `<span class="admin-badge admin">ADMIN</span>` : '',
        userIsMuted  ? `<span class="admin-badge muted">MUTED</span>` : '',
        userIsBanned ? `<span class="admin-badge banned">BANNED</span>` : '',
        user.online  ? `<span class="text-[9px] text-[#00ff41] font-bold retro-font tracking-widest">● ONLINE</span>`
                     : `<span class="text-[9px] text-[#004411] retro-font tracking-widest">○ OFFLINE</span>`,
    ].filter(Boolean).join('');

    const actions = `
        <div class="flex gap-2 flex-wrap">
            ${userIsMuted
                ? `<button class="admin-action-btn unmute" onclick="adminUnmute('${uid}','${escapeHtml(user.callsign || '')}')">UNMUTE</button>`
                : `<button class="admin-action-btn mute"   onclick="adminMute('${uid}','${escapeHtml(user.callsign || '')}')">MUTE</button>`
            }
            ${userIsBanned
                ? `<button class="admin-action-btn unban" onclick="adminUnban('${uid}','${escapeHtml(user.callsign || '')}')">UNBAN</button>`
                : `<button class="admin-action-btn ban"   onclick="adminBan('${uid}','${escapeHtml(user.callsign || '')}')">BAN</button>`
            }
            ${userIsAdmin
                ? `<button class="admin-action-btn demote"  onclick="adminDemote('${uid}','${escapeHtml(user.callsign || '')}')">DEMOTE</button>`
                : `<button class="admin-action-btn promote" onclick="adminPromote('${uid}','${escapeHtml(user.callsign || '')}')">PROMOTE</button>`
            }
        </div>
    `;

    oldRow.className = rowClass;
    oldRow.innerHTML = `
        <img src="${escapeHtml(user.avatar || 'https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png')}"
             class="w-10 h-10 border border-[#004411] object-cover flex-shrink-0">
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
                <span class="retro-font text-[#00ff41] text-sm uppercase tracking-wider">${escapeHtml(user.callsign || '???')}</span>
                ${badges}
            </div>
            <div class="text-[9px] text-[#004411] uppercase tracking-widest mt-0.5">${escapeHtml(user.title || 'VOID DRIFTER')}</div>
        </div>
        <div class="flex-shrink-0">${actions}</div>
    `;
}


// =====================================================
//  ADMIN ACTIONS
// =====================================================
async function adminMute(uid, callsign) {
    if (!isAdmin) return;
    sysConfirm({ title: "MUTE OPERATOR", msg: `Silence ${callsign}? They will be unable to send messages.`, confirmText: "MUTE", danger: true, onConfirm: async () => {
    await db.ref(`users/${uid}`).update({ muted: true });
    writeAdminLog('MUTE', callsign);
        refreshAdminRow(uid);
    } });
}

async function adminUnmute(uid, callsign) {
    if (!isAdmin) return;
    sysConfirm({ title: "RESTORE SIGNAL", msg: `Restore transmission rights to ${callsign}?`, confirmText: "UNMUTE", onConfirm: async () => {
    await db.ref(`users/${uid}`).update({ muted: false });
    writeAdminLog('UNMUTE', callsign);
        refreshAdminRow(uid);
    } });
}

async function adminBan(uid, callsign) {
    if (!isAdmin) return;
    sysConfirm({ title: "TERMINATE ACCESS", msg: `Ban ${callsign}? They will be signed out immediately and blocked from re-entering.`, confirmText: "BAN", danger: true, onConfirm: async () => {
    await db.ref(`users/${uid}`).update({ banned: true, online: false });
    writeAdminLog('BAN', callsign);
        refreshAdminRow(uid);
    } });
}

async function adminUnban(uid, callsign) {
    if (!isAdmin) return;
    sysConfirm({ title: "RESTORE ACCESS", msg: `Unban ${callsign}? They will be able to sign in again.`, confirmText: "UNBAN", onConfirm: async () => {
    await db.ref(`users/${uid}`).update({ banned: false });
    writeAdminLog('UNBAN', callsign);
        refreshAdminRow(uid);
    } });
}

async function adminPromote(uid, callsign) {
    if (!isAdmin) return;
    sysConfirm({ title: "PROMOTE OPERATOR", msg: `Promote ${callsign} to ADMIN? They will gain full operator privileges.`, confirmText: "PROMOTE", onConfirm: async () => {
    await db.ref(`users/${uid}`).update({ role: 'admin' });
    writeAdminLog('PROMOTE', callsign, '→ ADMIN');
        refreshAdminRow(uid);
    } });
}

async function adminDemote(uid, callsign) {
    if (!isAdmin) return;
    sysConfirm({ title: "DEMOTE OPERATOR", msg: `Remove admin privileges from ${callsign}?`, confirmText: "DEMOTE", danger: true, onConfirm: async () => {
    await db.ref(`users/${uid}`).update({ role: 'member' });
    writeAdminLog('DEMOTE', callsign, '→ MEMBER');
        refreshAdminRow(uid);
    } });
}


// =====================================================
//  ADMIN ACTION LOG
// =====================================================
function writeAdminLog(action, target, detail = '') {
    db.ref('adminLog').push({
        action,
        target,
        detail,
        by:        currentUserData.callsign || currentUID,
        timestamp: Date.now()
    }).catch(console.error);
}

function loadAdminLog() {
    if (adminLogListener) adminLogListener.off();
    const container = document.getElementById("admin-log-list");
    if (!container) return;
    container.innerHTML = "";

    adminLogListener = db.ref('adminLog').orderByChild('timestamp').limitToLast(100);
    adminLogListener.on('value', snap => {
        container.innerHTML = "";
        const entries = [];
        snap.forEach(child => entries.unshift(child.val())); // newest first
        if (entries.length === 0) {
            container.innerHTML = `<div class="log-entry text-[#004411]">NO ENTRIES ON RECORD</div>`;
            return;
        }
        entries.forEach(e => {
            const time = new Date(e.timestamp).toLocaleString();
            const div = document.createElement('div');
            div.className = 'log-entry';
            div.innerHTML = `<span class="log-time">${time}</span><span class="log-action">[${e.action}]</span><span class="log-target">${escapeHtml(e.target)}</span>${e.detail ? ` <span class="text-[#004411]">${escapeHtml(e.detail)}</span>` : ''} <span class="text-[#002208]">— by ${escapeHtml(e.by)}</span>`;
            container.appendChild(div);
        });
    });
}


window.addEventListener("load", initApp);

// =====================================================
//  WEBRTC VOICE / VIDEO — "VOICE RELAY"
//  Signaling via Firebase RTDB at /voice-rooms/{roomId}/
//
//  Architecture: full-mesh peer connections.
//  Each joiner:
//    1. Writes their presence to /voice-rooms/{roomId}/participants/{uid}
//    2. For every existing participant, creates an RTCPeerConnection,
//       sends an offer, and writes it to
//       /voice-rooms/{roomId}/signals/{targetUid}/{myUid}/offer
//    3. Watches /voice-rooms/{roomId}/signals/{myUid}/ for offers/answers/ICE
//  On leave: cleans up Firebase presence + signal nodes, closes all PCs.
// =====================================================

// ── State ────────────────────────────────────────────
let vcRoomId       = null;   // e.g. "comms"
let vcLocalStream  = null;   // MediaStream (mic + optional cam)
let vcPeers        = {};     // uid → { pc: RTCPeerConnection, stream: MediaStream|null }
let vcMicEnabled    = true;
let vcCamEnabled    = false;
let vcScreenSharing = false;
let vcScreenTrack   = null;   // the active screen video track
let vcParticipants = {};     // uid → { callsign, avatar, muted }
let vcSignalRef    = null;   // ref we .on() for incoming signals
let vcPresenceRef  = null;   // our presence node (removed onDisconnect)
let vcRoomRef      = null;   // participants node

// ── Audio device & per-user volume state ─────────────
let selectedAudioInput  = '';  // deviceId for microphone
let selectedAudioOutput = '';  // deviceId for speakers
let vcUserVolumes       = {};  // uid → 0.0-1.0
let _micTestStream      = null;
let _micTestAnimFrame   = null;

const VC_STUN = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// ── Join / Leave ──────────────────────────────────────
async function toggleVoiceChannel(roomId) {
    if (vcRoomId === roomId) {
        leaveVoiceChannel();
    } else {
        if (vcRoomId) leaveVoiceChannel(); // switch rooms
        await joinVoiceChannel(roomId);
    }
}

async function joinVoiceChannel(roomId) {
    vcRoomId = roomId;

    // Request mic using selected device (or default)
    try {
        const audioConstraints = selectedAudioInput
            ? { deviceId: { exact: selectedAudioInput } }
            : true;
        vcLocalStream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: false
        });
    } catch (err) {
        vcLocalStream = null; // no mic available — join muted
        console.warn('No mic:', err);
    }

    vcMicEnabled = true;
    vcCamEnabled = false;

    // Update sidebar button
    const btn = document.getElementById(`voice-channel-btn-${roomId}`);
    if (btn) btn.classList.add('in-call');

    // Open the voice panel
    const panel = document.getElementById('voice-panel');
    panel.classList.add('open');
    document.getElementById('voice-panel-status').textContent = 'JOINING...';
    // Allow the CSS transition to start then measure
    setTimeout(vcUpdateMobileInputOffset, 320);

    // Register presence
    vcRoomRef     = db.ref(`voice-rooms/${roomId}/participants`);
    vcPresenceRef = vcRoomRef.child(currentUID);
    vcPresenceRef.onDisconnect().remove();
    await vcPresenceRef.set({
        callsign: currentUserData.callsign || '???',
        avatar:   currentUserData.avatar   || '',
        muted:    false,
        joinedAt: Date.now()
    });

    // Add our own tile immediately
    vcParticipants[currentUID] = {
        callsign: currentUserData.callsign || '???',
        avatar:   currentUserData.avatar   || '',
        muted:    false
    };
    vcRenderTile(currentUID, true);
    if (vcLocalStream) {
        vcAttachStream(currentUID, vcLocalStream, true);
    }

    // Listen for incoming signals addressed to us
    vcSignalRef = db.ref(`voice-rooms/${roomId}/signals/${currentUID}`);
    vcSignalRef.on('child_added', async snap => {
        const fromUid = snap.key;
        const data    = snap.val();
        if (!data) return;
        await vcHandleIncomingSignal(fromUid, data);
    });
    vcSignalRef.on('child_changed', async snap => {
        const fromUid = snap.key;
        const data    = snap.val();
        if (!data) return;
        await vcHandleIncomingSignal(fromUid, data);
    });

    // Watch participants list — connect to anyone already there
    vcRoomRef.on('value', snap => {
        const current = {};
        snap.forEach(child => {
            current[child.key] = child.val();
        });
        vcSyncParticipants(current);
    });

    // Update controls UI
    vcUpdateControls();
}

async function vcHandleIncomingSignal(fromUid, data) {
    if (fromUid === currentUID) return;

    let pc = vcPeers[fromUid]?.pc;

    if (data.offer) {
        // Someone is calling us — create a PC if we don't have one
        if (!pc) pc = vcCreatePeer(fromUid);
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await db.ref(`voice-rooms/${vcRoomId}/signals/${fromUid}/${currentUID}/answer`).set({
                type: answer.type,
                sdp:  answer.sdp
            });
        } catch (e) { console.error('Answer error:', e); }
    }

    if (data.answer && pc) {
        if (pc.signalingState === 'have-local-offer') {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (e) { console.error('Set answer error:', e); }
        }
    }

    if (data.ice && pc) {
        const candidates = Array.isArray(data.ice) ? data.ice : [data.ice];
        for (const c of candidates) {
            if (c?.candidate) {
                try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch(e) {}
            }
        }
    }
}

async function vcSyncParticipants(current) {
    const panel = document.getElementById('voice-panel');
    const count = Object.keys(current).length;

    // Update count badge
    const badge = document.getElementById(`vc-count-${vcRoomId}`);
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    }

    document.getElementById('voice-panel-status').textContent =
        count === 1 ? 'AWAITING CREW...' : `${count} CONNECTED`;

    // Update participant metadata and muted state on tiles
    Object.entries(current).forEach(([uid, info]) => {
        vcParticipants[uid] = info;
        const mutedEl = document.getElementById(`vc-muted-${uid}`);
        if (mutedEl) mutedEl.style.display = info.muted ? 'block' : 'none';
    });

    // Initiate connections to newly joined participants we haven't connected to yet
    for (const uid of Object.keys(current)) {
        if (uid === currentUID) continue;
        if (!vcPeers[uid]) {
            // We only initiate if our UID is "greater" to avoid both sides offering simultaneously
            if (currentUID > uid) {
                await vcInitiateCall(uid);
            }
            // The other side (with smaller UID) will wait for our offer via signal listener
            // but we still create a peer entry so we don't re-initiate
            if (!vcPeers[uid]) vcPeers[uid] = { pc: null, stream: null };
        }
    }

    // Remove tiles for people who left
    Object.keys(vcPeers).forEach(uid => {
        if (!current[uid]) {
            vcRemovePeer(uid);
        }
    });
}

async function vcInitiateCall(targetUid) {
    const pc = vcCreatePeer(targetUid);
    try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await db.ref(`voice-rooms/${vcRoomId}/signals/${targetUid}/${currentUID}/offer`).set({
            type: offer.type,
            sdp:  offer.sdp
        });
    } catch (e) { console.error('Offer error:', e); }
}

function vcCreatePeer(remoteUid) {
    const pc = new RTCPeerConnection(VC_STUN);

    // Add our local tracks
    if (vcLocalStream) {
        vcLocalStream.getTracks().forEach(track => pc.addTrack(track, vcLocalStream));
    }

    // Collect ICE candidates and batch-write to Firebase
    const iceBatch = [];
    let iceTimer   = null;
    pc.onicecandidate = ({ candidate }) => {
        if (!candidate) return;
        iceBatch.push({ candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex });
        clearTimeout(iceTimer);
        iceTimer = setTimeout(() => {
            db.ref(`voice-rooms/${vcRoomId}/signals/${remoteUid}/${currentUID}/ice`).set([...iceBatch]).catch(() => {});
        }, 150);
    };

    // When remote tracks arrive, attach to tile
    pc.ontrack = ({ streams }) => {
        if (!streams?.[0]) return;
        const stream = streams[0];
        if (!vcPeers[remoteUid]) vcPeers[remoteUid] = { pc, stream: null };
        vcPeers[remoteUid].stream = stream;
        // Render tile if not present yet
        if (!document.getElementById(`vc-tile-${remoteUid}`)) {
            vcRenderTile(remoteUid, false);
        }
        vcAttachStream(remoteUid, stream, false);
    };

    // Connection state logging
    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') {
            console.warn(`WebRTC connection to ${remoteUid} failed, restarting ICE`);
            pc.restartIce();
        }
    };

    // Render a placeholder tile immediately
    if (!document.getElementById(`vc-tile-${remoteUid}`)) {
        const info = vcParticipants[remoteUid] || {};
        if (!vcParticipants[remoteUid]) {
            // Fetch from DB if we don't have their info yet
            db.ref(`users/${remoteUid}`).once('value').then(s => {
                const u = s.val() || {};
                vcParticipants[remoteUid] = { callsign: u.callsign || '???', avatar: u.avatar || '' };
                vcRenderTile(remoteUid, false);
            });
        } else {
            vcRenderTile(remoteUid, false);
        }
    }

    vcPeers[remoteUid] = { pc, stream: null };
    return pc;
}

function vcRemovePeer(uid) {
    const peer = vcPeers[uid];
    if (peer?.pc) { try { peer.pc.close(); } catch(e) {} }
    delete vcPeers[uid];
    delete vcParticipants[uid];
    document.getElementById(`vc-tile-${uid}`)?.remove();
}

function leaveVoiceChannel() {
    if (!vcRoomId) return;

    // Stop screen share first if active
    if (vcScreenSharing) vcStopShare();

    // Stop all local tracks
    if (vcLocalStream) {
        vcLocalStream.getTracks().forEach(t => t.stop());
        vcLocalStream = null;
    }

    // Close all peer connections
    Object.keys(vcPeers).forEach(uid => vcRemovePeer(uid));
    vcPeers = {};

    // Clean up Firebase
    if (vcPresenceRef) { vcPresenceRef.remove().catch(() => {}); vcPresenceRef = null; }
    if (vcSignalRef)   { vcSignalRef.off(); vcSignalRef = null; }
    if (vcRoomRef)     { vcRoomRef.off(); vcRoomRef = null; }
    // Clean up our signal inbox
    db.ref(`voice-rooms/${vcRoomId}/signals/${currentUID}`).remove().catch(() => {});

    // Update UI
    const btn = document.getElementById(`voice-channel-btn-${vcRoomId}`);
    if (btn) btn.classList.remove('in-call');

    const badge = document.getElementById(`vc-count-${vcRoomId}`);
    if (badge) badge.classList.add('hidden');

    document.getElementById('voice-panel').classList.remove('open', 'minimized');
    // Reset minimize button label
    const minBtn = document.getElementById('vc-btn-minimize');
    if (minBtn) minBtn.innerHTML = '<i class="fas fa-chevron-down mr-1"></i>HIDE';
    document.getElementById('voice-participants').innerHTML = '';
    vcUpdateMobileInputOffset();

    vcParticipants = {};
    vcRoomId       = null;
    vcCamEnabled   = false;
    vcMicEnabled   = true;
}

// ── Mic / Cam controls ────────────────────────────────
async function vcToggleMic() {
    if (!vcLocalStream) return;
    vcMicEnabled = !vcMicEnabled;
    vcLocalStream.getAudioTracks().forEach(t => { t.enabled = vcMicEnabled; });
    // Update our presence muted state
    if (vcPresenceRef) vcPresenceRef.update({ muted: !vcMicEnabled }).catch(() => {});
    vcUpdateControls();
    // Update our own tile muted badge
    const mutedEl = document.getElementById(`vc-muted-${currentUID}`);
    if (mutedEl) mutedEl.style.display = vcMicEnabled ? 'none' : 'block';
}

async function vcToggleCam() {
    if (vcCamEnabled) {
        // Turn camera off
        if (vcLocalStream) {
            vcLocalStream.getVideoTracks().forEach(t => { t.stop(); vcLocalStream.removeTrack(t); });
        }
        vcCamEnabled = false;
        vcUpdateLocalTileVideo();
    } else {
        // Turn camera on
        try {
            const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoTrack = camStream.getVideoTracks()[0];
            if (!vcLocalStream) {
                vcLocalStream = new MediaStream([videoTrack]);
            } else {
                vcLocalStream.addTrack(videoTrack);
            }
            // Add track to all existing peer connections
            Object.values(vcPeers).forEach(({ pc }) => {
                if (pc && pc.signalingState !== 'closed') {
                    try { pc.addTrack(videoTrack, vcLocalStream); } catch(e) {}
                }
            });
            vcCamEnabled = true;
            vcUpdateLocalTileVideo();
        } catch (e) {
            console.warn('Camera unavailable:', e);
        }
    }
    vcUpdateControls();
}

async function vcToggleShare() {
    if (vcScreenSharing) {
        // Stop sharing
        vcStopShare();
    } else {
        // Check if someone else is already sharing
        if (vcRoomId) {
            const snap = await db.ref(`voice-rooms/${vcRoomId}/participants`).once('value');
            let sharerCallsign = null;
            snap.forEach(child => {
                const p = child.val();
                if (p.screensharing && child.key !== currentUID) {
                    sharerCallsign = p.callsign || 'someone';
                }
            });
            if (sharerCallsign) {
                sysToast(`${sharerCallsign.toUpperCase()} IS ALREADY SHARING THEIR SCREEN`, 'warn');
                return;
            }
        }

        try {
            let screenStream;

            // ── Electron: use desktopCapturer via preload bridge ──
            if (window.electronAPI && window.electronAPI.getScreenSources) {
                const sources = await window.electronAPI.getScreenSources();
                if (!sources || sources.length === 0) {
                    sysToast('NO SCREEN SOURCES FOUND', 'error');
                    return;
                }
                // Show picker modal and wait for selection
                const sourceId = await showScreenPicker(sources);
                if (!sourceId) return; // user cancelled

                screenStream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: sourceId,
                            maxFrameRate: 60
                        }
                    }
                });
            } else {
                // ── Standard browser getDisplayMedia ──
                screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always', frameRate: { ideal: 30, max: 60 } },
                    audio: false
                });
            }

            vcScreenTrack   = screenStream.getVideoTracks()[0];
            vcScreenSharing = true;

            // Replace or add video track in all peer connections
            Object.values(vcPeers).forEach(({ pc }) => {
                if (!pc || pc.signalingState === 'closed') return;
                const senders  = pc.getSenders();
                const vidSend  = senders.find(s => s.track && s.track.kind === 'video');
                if (vidSend) {
                    // Replace existing video sender — no renegotiation needed
                    vidSend.replaceTrack(vcScreenTrack).catch(e => console.warn('replaceTrack:', e));
                } else {
                    // No video sender yet — add a new one (triggers renegotiation)
                    pc.addTrack(vcScreenTrack, screenStream);
                }
            });

            // Show screen share in our local tile (separate "share" tile)
            vcRenderShareTile(screenStream);

            // Mark presence as screensharing so others can see it
            if (vcPresenceRef) vcPresenceRef.update({ screensharing: true }).catch(() => {});

            // Handle browser's native "Stop sharing" button
            vcScreenTrack.onended = () => vcStopShare();

            vcUpdateControls();
        } catch (e) {
            if (e.name !== 'NotAllowedError') {
                console.error('Screen share error:', e);
            }
            vcScreenSharing = false;
            vcScreenTrack   = null;
        }
    }
}

function vcStopShare() {
    if (!vcScreenSharing) return;

    if (vcScreenTrack) {
        vcScreenTrack.stop();
        vcScreenTrack.onended = null;
        vcScreenTrack = null;
    }
    vcScreenSharing = false;

    // Restore camera track in all senders, or null it out
    Object.values(vcPeers).forEach(({ pc }) => {
        if (!pc || pc.signalingState === 'closed') return;
        const senders = pc.getSenders();
        const vidSend = senders.find(s => s.track && s.track.kind === 'video');
        if (vidSend) {
            const camTrack = vcCamEnabled && vcLocalStream
                ? vcLocalStream.getVideoTracks()[0] || null
                : null;
            vidSend.replaceTrack(camTrack).catch(() => {});
        }
    });

    // Remove the share tile
    document.getElementById('vc-share-tile')?.remove();

    // Clear presence flag
    if (vcPresenceRef) vcPresenceRef.update({ screensharing: false }).catch(() => {});

    vcUpdateControls();
}

function vcRenderShareTile(stream) {
    // Remove existing share tile if any
    document.getElementById('vc-share-tile')?.remove();

    const grid = document.getElementById('voice-participants');
    if (!grid) return;

    const tile = document.createElement('div');
    tile.id        = 'vc-share-tile';
    tile.className = 'vc-tile screenshare';
    tile.innerHTML = `
        <button class="vc-fullscreen-btn" onclick="vcFullscreen('vc-share-tile')" title="Fullscreen"><i class="fas fa-expand mr-1"></i>FS</button>
        <video id="vc-share-video" autoplay playsinline muted></video>
        <div class="vc-tile-overlay">
            <div class="vc-tile-name" style="color:#00aaff">${escapeHtml(currentUserData.callsign || '???')} <span style="color:#007a2a;font-size:.65rem">(YOUR SCREEN)</span></div>
        </div>
    `;
    // Prepend so the share tile appears first
    grid.insertBefore(tile, grid.firstChild);

    const video = document.getElementById('vc-share-video');
    video.srcObject = stream;
    video.play().catch(() => {});
}

function vcUpdateLocalTileVideo() {
    const tile    = document.getElementById(`vc-tile-${currentUID}`);
    if (!tile) return;
    const video   = tile.querySelector('video');
    const avatarEl = tile.querySelector('.vc-tile-avatar');

    if (vcCamEnabled && vcLocalStream && vcLocalStream.getVideoTracks().length > 0) {
        video.srcObject = vcLocalStream;
        video.play().catch(() => {});
        if (avatarEl) avatarEl.classList.add('hidden');
    } else {
        video.srcObject = null;
        if (avatarEl) avatarEl.classList.remove('hidden');
    }
}

function vcUpdateControls() {
    const micBtn   = document.getElementById('vc-btn-mic');
    const camBtn   = document.getElementById('vc-btn-cam');
    const shareBtn = document.getElementById('vc-btn-share');

    if (micBtn) {
        micBtn.className = vcMicEnabled ? 'vc-ctrl-btn active' : 'vc-ctrl-btn muted-btn';
        micBtn.innerHTML = `<i class="fas fa-${vcMicEnabled ? 'microphone' : 'microphone-slash'} mr-1"></i>MIC`;
    }
    if (camBtn) {
        camBtn.className = vcCamEnabled ? 'vc-ctrl-btn active' : 'vc-ctrl-btn';
        camBtn.innerHTML = `<i class="fas fa-${vcCamEnabled ? 'video' : 'video-slash'} mr-1"></i>CAM`;
    }
    if (shareBtn) {
        shareBtn.className = vcScreenSharing ? 'vc-ctrl-btn share-active' : 'vc-ctrl-btn';
        shareBtn.innerHTML = `<i class="fas fa-${vcScreenSharing ? 'stop-circle' : 'desktop'} mr-1"></i>${vcScreenSharing ? 'STOP' : 'SHARE'}`;
    }
}

function vcToggleMinimize() {
    const panel  = document.getElementById('voice-panel');
    const btn    = document.getElementById('vc-btn-minimize');
    const isMin  = panel.classList.toggle('minimized');
    if (btn) {
        btn.innerHTML = isMin
            ? '<i class="fas fa-chevron-up mr-1"></i>SHOW'
            : '<i class="fas fa-chevron-down mr-1"></i>HIDE';
    }
    // Wait for CSS transition then reposition the mobile input bar
    setTimeout(vcUpdateMobileInputOffset, 320);
}

// On mobile the input bar is position:fixed, so it doesn't respond to the
// in-flow voice panel height. This measures the panel and shifts the bar up.
function vcUpdateMobileInputOffset() {
    if (!document.body.classList.contains('mobile-mode')) return;
    const panel    = document.getElementById('voice-panel');
    const inputBar = document.getElementById('chat-input-bar');
    const contentArea = document.getElementById('content-area');
    const TAB_BAR_H = 52;  // mobile tab bar height in px

    const panelH = panel ? panel.getBoundingClientRect().height : 0;
    const inputBottom = TAB_BAR_H + panelH;

    if (inputBar) inputBar.style.bottom = inputBottom + 'px';
    // Keep content-area bottom padding in sync so messages aren't hidden
    const inputH = inputBar ? 56 : 0;
    if (contentArea) contentArea.style.paddingBottom = (inputBottom + inputH + 8) + 'px';
}

function vcFullscreen(tileId) {
    const el = document.getElementById(tileId);
    if (!el) return;

    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;

    if (fsEl === el) {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    } else {
        // Enter fullscreen
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(err => {
                console.warn('Fullscreen request failed:', err);
                // Fallback: maximize tile to fill the content area
                vcTogglePseudoFullscreen(el);
            });
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else {
            // No native fullscreen API — use CSS fallback
            vcTogglePseudoFullscreen(el);
        }
    }
}

/** CSS-based fullscreen fallback for environments where the API is blocked */
function vcTogglePseudoFullscreen(el) {
    if (el.classList.contains('vc-pseudo-fs')) {
        el.classList.remove('vc-pseudo-fs');
        updateFullscreenIcon(el, false);
    } else {
        // Remove pseudo-fs from any other tile first
        document.querySelectorAll('.vc-pseudo-fs').forEach(t => {
            t.classList.remove('vc-pseudo-fs');
            updateFullscreenIcon(t, false);
        });
        el.classList.add('vc-pseudo-fs');
        updateFullscreenIcon(el, true);
    }
}

function updateFullscreenIcon(tileEl, isFullscreen) {
    const btn = tileEl.querySelector('.vc-fullscreen-btn');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = isFullscreen ? 'fas fa-compress mr-1' : 'fas fa-expand mr-1';
    }
    btn.title = isFullscreen ? 'Exit fullscreen' : 'Fullscreen';
}

// Listen for native fullscreen changes to toggle the icon
document.addEventListener('fullscreenchange', onFsChange);
document.addEventListener('webkitfullscreenchange', onFsChange);

function onFsChange() {
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    // Reset all FS buttons
    document.querySelectorAll('.vc-fullscreen-btn').forEach(btn => {
        const tile = btn.closest('.vc-tile');
        if (tile) updateFullscreenIcon(tile, tile === fsEl);
    });
}

// ESC to exit pseudo-fullscreen (native FS already handles ESC)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const pseudo = document.querySelector('.vc-pseudo-fs');
        if (pseudo) {
            pseudo.classList.remove('vc-pseudo-fs');
            updateFullscreenIcon(pseudo, false);
        }
    }
});


function vcRenderTile(uid, isLocal) {
    const grid = document.getElementById('voice-participants');
    if (!grid || document.getElementById(`vc-tile-${uid}`)) return;

    const info = vcParticipants[uid] || {};
    const tile = document.createElement('div');
    tile.id        = `vc-tile-${uid}`;
    tile.className = `vc-tile${isLocal ? '' : ' remote'}`;

    const vol = vcUserVolumes[uid] ?? 1.0;
    const volPct = Math.round(vol * 100);
    const volIcon = vol === 0 ? 'fa-volume-mute' : vol < 0.5 ? 'fa-volume-down' : 'fa-volume-up';

    tile.innerHTML = `
        <button class="vc-fullscreen-btn" onclick="vcFullscreen('vc-tile-${uid}')" title="Fullscreen"><i class="fas fa-expand mr-1"></i>FS</button>
        <div class="vc-tile-avatar" id="vc-avatar-${uid}">
            <img src="${escapeHtml(info.avatar || 'https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png')}"
                 onerror="this.src='https://static.wikia.nocookie.net/destinypedia/images/6/6e/Human.png'">
        </div>
        <video id="vc-video-${uid}" autoplay playsinline muted="${isLocal ? 'true' : 'false'}"></video>
        <div class="vc-tile-overlay">
            <div class="vc-tile-name">${escapeHtml(info.callsign || '???')}${isLocal ? ' <span style="color:var(--terminal-dim);font-size:0.65rem">(YOU)</span>' : ''}</div>
        </div>
        <div class="vc-tile-muted" id="vc-muted-${uid}" style="display:${info.muted ? 'block' : 'none'}">MUTED</div>
        ${!isLocal ? `
        <div class="vc-volume-wrap">
            <i class="fas ${volIcon}" id="vc-vol-icon-${uid}"></i>
            <input type="range" class="vc-volume-slider" min="0" max="100" value="${volPct}"
                   oninput="vcSetUserVolume('${uid}', this.value)"
                   title="Volume">
            <span class="vc-volume-label" id="vc-vol-label-${uid}">${volPct}%</span>
        </div>` : ''}
    `;
    grid.appendChild(tile);
}

function vcAttachStream(uid, stream, isLocal) {
    const video   = document.getElementById(`vc-video-${uid}`);
    const avatarEl = document.getElementById(`vc-avatar-${uid}`);
    if (!video) return;

    const hasVideo = stream.getVideoTracks().length > 0;
    video.srcObject = stream;
    video.muted     = isLocal; // never echo our own audio
    video.play().catch(() => {});

    // Apply stored per-user volume for remote users
    if (!isLocal) {
        const vol = vcUserVolumes[uid] ?? 1.0;
        video.volume = vol;
    }

    // Apply selected audio output device (speakers)
    if (!isLocal && selectedAudioOutput && typeof video.setSinkId === 'function') {
        video.setSinkId(selectedAudioOutput).catch(e => console.warn('setSinkId:', e));
    }

    if (hasVideo) {
        if (avatarEl) avatarEl.classList.add('hidden');
    } else {
        if (avatarEl) avatarEl.classList.remove('hidden');
    }

    // Watch for video track changes
    stream.onaddtrack = stream.onremovetrack = () => {
        const stillHasVideo = stream.getVideoTracks().length > 0;
        if (avatarEl) avatarEl.classList.toggle('hidden', stillHasVideo);
    };
}

// ── Participant count watchers (even when not in channel) ──
function setupVoicePresenceWatchers() {
    const roomId = 'comms';
    db.ref(`voice-rooms/${roomId}/participants`).on('value', snap => {
        const count = snap.numChildren();
        const badge = document.getElementById(`vc-count-${roomId}`);
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }
    });
}

// =====================================================
//  AUDIO DEVICE SETTINGS
// =====================================================
async function openAudioSettings() {
    const modal = document.getElementById('audio-settings-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    await enumerateAudioDevices();
    startMicTest();
}

function closeAudioSettings() {
    document.getElementById('audio-settings-modal')?.classList.add('hidden');
    stopMicTest();
}

async function enumerateAudioDevices() {
    // Need a temporary stream to get labelled devices
    let tempStream = null;
    try {
        tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) { /* no mic permission */ }

    const devices = await navigator.mediaDevices.enumerateDevices();

    // Populate microphone input dropdown
    const inputSelect  = document.getElementById('audio-input-select');
    const outputSelect = document.getElementById('audio-output-select');

    if (inputSelect) {
        inputSelect.innerHTML = '';
        const inputs = devices.filter(d => d.kind === 'audioinput');
        if (inputs.length === 0) {
            inputSelect.innerHTML = '<option value="">NO MICROPHONE DETECTED</option>';
        } else {
            inputs.forEach((d, i) => {
                const opt = document.createElement('option');
                opt.value = d.deviceId;
                opt.textContent = d.label || `MICROPHONE ${i + 1}`;
                if (d.deviceId === selectedAudioInput) opt.selected = true;
                inputSelect.appendChild(opt);
            });
            // If no selection yet, pick current
            if (!selectedAudioInput && inputs.length > 0) {
                selectedAudioInput = inputs[0].deviceId;
            }
        }
    }

    if (outputSelect) {
        outputSelect.innerHTML = '';
        const outputs = devices.filter(d => d.kind === 'audiooutput');
        if (outputs.length === 0) {
            outputSelect.innerHTML = '<option value="">DEFAULT OUTPUT</option>';
        } else {
            outputs.forEach((d, i) => {
                const opt = document.createElement('option');
                opt.value = d.deviceId;
                opt.textContent = d.label || `SPEAKER ${i + 1}`;
                if (d.deviceId === selectedAudioOutput) opt.selected = true;
                outputSelect.appendChild(opt);
            });
            if (!selectedAudioOutput && outputs.length > 0) {
                selectedAudioOutput = outputs[0].deviceId;
            }
        }
    }

    // Release temp stream
    if (tempStream) tempStream.getTracks().forEach(t => t.stop());
}

function onAudioDeviceChange() {
    const inputSel  = document.getElementById('audio-input-select');
    const outputSel = document.getElementById('audio-output-select');

    if (inputSel)  selectedAudioInput  = inputSel.value;
    if (outputSel) selectedAudioOutput = outputSel.value;

    // If currently in a voice call, switch mic live
    if (vcRoomId && vcLocalStream && selectedAudioInput) {
        switchMicDevice(selectedAudioInput);
    }

    // Apply new output to all existing remote video elements
    if (selectedAudioOutput) {
        Object.keys(vcPeers).forEach(uid => {
            const video = document.getElementById(`vc-video-${uid}`);
            if (video && typeof video.setSinkId === 'function') {
                video.setSinkId(selectedAudioOutput).catch(() => {});
            }
        });
    }

    // Restart mic test with new device
    stopMicTest();
    startMicTest();
}

async function switchMicDevice(deviceId) {
    try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: deviceId } },
            video: false
        });
        const newTrack = newStream.getAudioTracks()[0];

        // Replace track in local stream
        if (vcLocalStream) {
            const oldTrack = vcLocalStream.getAudioTracks()[0];
            if (oldTrack) {
                vcLocalStream.removeTrack(oldTrack);
                oldTrack.stop();
            }
            vcLocalStream.addTrack(newTrack);
        }

        // Replace track in all peer connection senders
        Object.values(vcPeers).forEach(({ pc }) => {
            if (!pc || pc.signalingState === 'closed') return;
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'audio');
            if (sender) sender.replaceTrack(newTrack).catch(() => {});
        });

        // Apply mute state
        newTrack.enabled = vcMicEnabled;

        sysToast('MICROPHONE SWITCHED', 'info');
    } catch (e) {
        console.error('Mic switch failed:', e);
        sysToast('FAILED TO SWITCH MICROPHONE', 'error');
    }
}

// ── Mic level meter ──
function startMicTest() {
    stopMicTest();
    const deviceId = selectedAudioInput || undefined;
    const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        _micTestStream = stream;
        const ctx      = new (window.AudioContext || window.webkitAudioContext)();
        const source   = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const bar  = document.getElementById('mic-level-bar');

        function tick() {
            analyser.getByteFrequencyData(data);
            const peak = Math.max(...data) / 255;
            if (bar) bar.style.width = (peak * 100) + '%';
            _micTestAnimFrame = requestAnimationFrame(tick);
        }
        tick();
    }).catch(() => {});
}

function stopMicTest() {
    if (_micTestStream) {
        _micTestStream.getTracks().forEach(t => t.stop());
        _micTestStream = null;
    }
    if (_micTestAnimFrame) {
        cancelAnimationFrame(_micTestAnimFrame);
        _micTestAnimFrame = null;
    }
    const bar = document.getElementById('mic-level-bar');
    if (bar) bar.style.width = '0%';
}


// =====================================================
//  PER-USER VOLUME CONTROL
// =====================================================
function vcSetUserVolume(uid, pct) {
    const vol = Math.max(0, Math.min(100, parseInt(pct, 10))) / 100;
    vcUserVolumes[uid] = vol;

    // Apply to the <video> element
    const video = document.getElementById(`vc-video-${uid}`);
    if (video) video.volume = vol;

    // Update icon
    const icon = document.getElementById(`vc-vol-icon-${uid}`);
    if (icon) {
        icon.className = 'fas ' + (vol === 0 ? 'fa-volume-mute' : vol < 0.5 ? 'fa-volume-down' : 'fa-volume-up');
    }

    // Update label
    const label = document.getElementById(`vc-vol-label-${uid}`);
    if (label) label.textContent = Math.round(vol * 100) + '%';
}


// =====================================================
//  FILE ATTACHMENT RENDERING
// =====================================================
function renderFileAttachment(msg) {
    const url      = escapeHtml(msg.fileUrl);
    const name     = escapeHtml(msg.fileName || 'file');
    const type     = msg.fileType || 'file';
    const ext      = (msg.fileExt || '').toUpperCase();
    const size     = msg.fileSize ? formatFileSize(msg.fileSize) : '';
    const openLink = `onclick="event.preventDefault();if(window.electronAPI)window.electronAPI.openExternal('${url}');else window.open('${url}','_blank')"`;

    if (type === 'video') {
        return `<div class="mt-1">
            <video src="${url}" controls preload="metadata"
                   class="max-w-md max-h-80 border border-[#004411] bg-black"
                   style="min-width:280px;"></video>
            <div class="file-attach-meta mt-1">
                <i class="fas fa-film"></i>
                <span>${name}</span>
                ${size ? `<span class="file-attach-size">${size}</span>` : ''}
                <a href="${url}" ${openLink} class="file-attach-dl" title="Download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    }

    if (type === 'audio') {
        return `<div class="mt-1 max-w-md">
            <audio src="${url}" controls preload="metadata" style="width:100%;"></audio>
            <div class="file-attach-meta mt-1">
                <i class="fas fa-music"></i>
                <span>${name}</span>
                ${size ? `<span class="file-attach-size">${size}</span>` : ''}
                <a href="${url}" ${openLink} class="file-attach-dl" title="Download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    }

    if (type === 'image') {
        return `<div class="mt-1">
            <img src="${url}" class="max-w-sm max-h-72 border border-[#004411] hover:border-[#00ff41] transition-colors cursor-pointer object-contain"
                 onclick="window.open('${url}','_blank')" alt="${name}">
            <div class="file-attach-meta mt-1">
                <i class="fas fa-image"></i>
                <span>${name}</span>
                ${size ? `<span class="file-attach-size">${size}</span>` : ''}
            </div>
        </div>`;
    }

    // Generic file — download card
    const iconClass = getFileIcon(ext);
    return `<div class="file-card" ${openLink} style="cursor:pointer;">
        <div class="file-card-icon"><i class="fas ${iconClass}"></i></div>
        <div class="file-card-info">
            <div class="file-card-name">${name}</div>
            <div class="file-card-detail">${ext ? ext + ' file' : 'File'}${size ? ' • ' + size : ''}</div>
        </div>
        <a href="${url}" ${openLink} class="file-card-dl"><i class="fas fa-download"></i></a>
    </div>`;
}

function getFileIcon(ext) {
    const map = {
        PDF: 'fa-file-pdf', DOC: 'fa-file-word', DOCX: 'fa-file-word',
        XLS: 'fa-file-excel', XLSX: 'fa-file-excel', CSV: 'fa-file-csv',
        ZIP: 'fa-file-archive', RAR: 'fa-file-archive', '7Z': 'fa-file-archive',
        TXT: 'fa-file-alt', JSON: 'fa-file-code', JS: 'fa-file-code',
        PY: 'fa-file-code', HTML: 'fa-file-code', CSS: 'fa-file-code',
        MP3: 'fa-file-audio', WAV: 'fa-file-audio', FLAC: 'fa-file-audio',
        MP4: 'fa-file-video', WEBM: 'fa-file-video', MOV: 'fa-file-video',
    };
    return map[ext] || 'fa-file';
}


// =====================================================
//  LINK PREVIEW / EMBEDS  (Discord-style)
// =====================================================
const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;
const _embedCache = {};  // url → preview data (avoid repeat fetches)

/** Turn plain-text URLs into clickable <a> links */
function linkifyText(escapedHtml) {
    return escapedHtml.replace(URL_REGEX, url => {
        // url is already HTML-escaped, decode for href
        const decoded = url.replace(/&amp;/g, '&');
        return `<a href="${decoded}" target="_blank" rel="noopener noreferrer" class="chat-link" onclick="event.stopPropagation();if(window.electronAPI){event.preventDefault();window.electronAPI.openExternal('${decoded}')}">${url}</a>`;
    });
}

const DIRECT_VIDEO_RE = /\.(mp4|webm|mov|ogg|ogv)(\?[^\s]*)?$/i;
const DIRECT_AUDIO_RE = /\.(mp3|wav|ogg|flac|aac|m4a)(\?[^\s]*)?$/i;
const DIRECT_IMAGE_RE = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?[^\s]*)?$/i;

/** Extract all URLs from raw text and fetch embeds for each */
async function processMessageEmbeds(msgId, rawText) {
    const urls = rawText.match(URL_REGEX);
    if (!urls) return;

    const container = document.getElementById(`embeds-${msgId}`);
    if (!container) return;

    // De-duplicate, max 3 embeds per message (like Discord)
    const unique = [...new Set(urls)].slice(0, 3);
    for (const url of unique) {
        try {
            // YouTube — build player directly from URL, no CORS fetch needed
            const ytId = extractYouTubeId(url);
            if (ytId) {
                renderYouTubeEmbed(container, url, ytId);
                continue;
            }
            // Direct video URL → inline player (no fetch needed)
            if (DIRECT_VIDEO_RE.test(url)) {
                renderDirectVideo(container, url);
                continue;
            }
            // Direct audio URL → inline player
            if (DIRECT_AUDIO_RE.test(url)) {
                renderDirectAudio(container, url);
                continue;
            }
            // Direct image URL → inline preview
            if (DIRECT_IMAGE_RE.test(url)) {
                renderDirectImage(container, url);
                continue;
            }
            await fetchAndRenderEmbed(msgId, url);
        } catch (e) {
            console.warn('Embed failed:', url, e);
        }
    }
}

/**
 * Render a YouTube card with:
 *  - iframe player (works when embedding is allowed)
 *  - thumbnail fallback if the video blocks embedding (Error 153 etc.)
 *  - always shows a "Watch on YouTube" link
 */
function renderYouTubeEmbed(container, url, videoId) {
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=0`;
    const openUrl  = escapeHtml(url);

    const card = document.createElement('div');
    card.className = 'embed-card';
    card.style.borderLeftColor = '#ff0000';

    // Build with both iframe and thumbnail fallback layered
    card.innerHTML = `
        <div class="embed-header">
            <img src="https://www.google.com/s2/favicons?domain=youtube.com&sz=32" class="embed-favicon">
            <span class="embed-site-name">YouTube</span>
        </div>
        <div class="embed-video-wrap" id="yt-wrap-${videoId}">
            <iframe
                src="${embedSrc}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="embed-video-iframe"
                onerror="document.getElementById('yt-wrap-${videoId}').innerHTML=document.getElementById('yt-thumb-${videoId}').outerHTML">
            </iframe>
        </div>
        <!-- Hidden thumbnail shown if iframe errors -->
        <div id="yt-thumb-${videoId}" style="display:none">
            <a href="${openUrl}" target="_blank" rel="noopener"
               onclick="event.preventDefault();if(window.electronAPI)window.electronAPI.openExternal('${openUrl}');else window.open('${openUrl}','_blank')"
               style="display:block;position:relative;cursor:pointer;">
                <img src="${thumbUrl}" style="width:100%;border:1px solid #333;" onerror="this.style.display='none'">
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                            background:rgba(0,0,0,0.75);border-radius:50%;width:56px;height:56px;
                            display:flex;align-items:center;justify-content:center;">
                    <span style="color:#fff;font-size:1.5rem;margin-left:4px;">▶</span>
                </div>
            </a>
        </div>
        <a href="${openUrl}" target="_blank" rel="noopener" class="embed-title"
            onclick="event.preventDefault();if(window.electronAPI)window.electronAPI.openExternal('${openUrl}');else window.open('${openUrl}','_blank')">
            Watch on YouTube ↗
        </a>
    `;

    // If the iframe fires an error event, swap to thumbnail
    // (onerror on iframe is unreliable — use message listener instead)
    const iframe = card.querySelector('iframe');
    if (iframe) {
        // YouTube posts a message when playback is blocked
        const handler = (e) => {
            if (typeof e.data !== 'object') return;
            if (e.data.event === 'infoDelivery' && e.data.info && e.data.info.errorCode) {
                swapToThumb();
                window.removeEventListener('message', handler);
            }
        };
        window.addEventListener('message', handler);

        // Also swap after a short delay if the iframe src returns an error page
        // by checking if it loaded a blank/error page via load event
        iframe.addEventListener('load', () => {
            try {
                // If contentDocument is accessible and empty it's an error page
                if (iframe.contentDocument && iframe.contentDocument.title &&
                    iframe.contentDocument.title.toLowerCase().includes('error')) {
                    swapToThumb();
                }
            } catch(e) { /* cross-origin, expected */ }
        });
    }

    function swapToThumb() {
        const wrap  = card.querySelector(`#yt-wrap-${videoId}`);
        const thumb = card.querySelector(`#yt-thumb-${videoId}`);
        if (wrap && thumb) {
            wrap.innerHTML = thumb.outerHTML;
            thumb.remove();
        }
    }

    const dismiss = document.createElement('button');
    dismiss.className = 'embed-dismiss';
    dismiss.innerHTML = '✕';
    dismiss.title = 'Hide embed';
    dismiss.onclick = (e) => { e.stopPropagation(); card.remove(); };
    card.appendChild(dismiss);
    container.appendChild(card);
}

function renderDirectVideo(container, url) {
    const card = document.createElement('div');
    card.className = 'embed-card';
    card.style.borderLeftColor = '#00ff41';
    card.innerHTML = `
        <div class="embed-header">
            <i class="fas fa-film" style="color:#00ff41;font-size:0.7rem"></i>
            <span class="embed-site-name">VIDEO</span>
        </div>
        <div class="embed-video-wrap">
            <video src="${escapeHtml(url)}" controls preload="metadata" class="embed-video-native"
                   style="max-height:360px;object-fit:contain;"></video>
        </div>
        <button class="embed-dismiss" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(card);
}

function renderDirectAudio(container, url) {
    const card = document.createElement('div');
    card.className = 'embed-card';
    card.style.borderLeftColor = '#00aaff';
    card.innerHTML = `
        <div class="embed-header">
            <i class="fas fa-music" style="color:#00aaff;font-size:0.7rem"></i>
            <span class="embed-site-name">AUDIO</span>
        </div>
        <audio src="${escapeHtml(url)}" controls preload="metadata" style="width:100%;height:36px;"></audio>
        <button class="embed-dismiss" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(card);
}

function renderDirectImage(container, url) {
    const card = document.createElement('div');
    card.className = 'embed-card';
    card.style.borderLeftColor = '#00ff41';
    card.innerHTML = `
        <div class="embed-thumb-wrap">
            <img src="${escapeHtml(url)}" class="embed-thumb"
                 onerror="this.parentElement.parentElement.remove()"
                 loading="lazy"
                 onclick="window.open('${escapeHtml(url)}','_blank')">
        </div>
        <button class="embed-dismiss" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(card);
}

/** Fetch OG metadata and render an embed card */
async function fetchAndRenderEmbed(msgId, url) {
    const container = document.getElementById(`embeds-${msgId}`);
    if (!container) return;

    let data = _embedCache[url];
    if (!data) {
        // Electron path: use main process to fetch (avoids CORS)
        if (window.electronAPI && window.electronAPI.fetchLinkPreview) {
            data = await window.electronAPI.fetchLinkPreview(url);
        } else {
            // Browser fallback: try a CORS proxy or skip
            data = await fetchLinkPreviewBrowser(url);
        }
        if (data) _embedCache[url] = data;
    }
    if (!data || (!data.title && !data.description && !data.image)) return;

    // Determine embed type
    const embedType = classifyEmbed(url, data);
    const card = document.createElement('div');
    card.className = 'embed-card';
    card.dataset.url = url;

    // Accent color based on site
    const accentColor = getEmbedAccent(url);
    card.style.borderLeftColor = accentColor;

    let embedHtml = '';

    // Site header
    const siteName = data.site_name || extractDomain(url);
    const favicon = data.favicon || `https://www.google.com/s2/favicons?domain=${extractDomain(url)}&sz=32`;
    embedHtml += `<div class="embed-header">
        <img src="${escapeHtml(favicon)}" class="embed-favicon" onerror="this.style.display='none'">
        <span class="embed-site-name">${escapeHtml(siteName)}</span>
    </div>`;

    // Title
    if (data.title) {
        embedHtml += `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="embed-title"
            onclick="event.preventDefault();if(window.electronAPI)window.electronAPI.openExternal('${escapeHtml(url)}');else window.open('${escapeHtml(url)}','_blank')">${escapeHtml(truncate(data.title, 120))}</a>`;
    }

    // Description
    if (data.description) {
        embedHtml += `<div class="embed-description">${escapeHtml(truncate(data.description, 250))}</div>`;
    }

    // YouTube handled upstream in processMessageEmbeds — skip to avoid duplicates
    if (embedType === 'youtube') {
        return;
    } else if (embedType === 'twitch-clip') {
        const clipSlug = extractTwitchClipSlug(url);
        if (clipSlug) {
            const parent = location.hostname || 'localhost';
            embedHtml += `<div class="embed-video-wrap">
                <iframe src="https://clips.twitch.tv/embed?clip=${clipSlug}&parent=${parent}&autoplay=false"
                    frameborder="0" allowfullscreen class="embed-video-iframe"></iframe>
            </div>`;
        } else if (data.image) {
            embedHtml += `<div class="embed-thumb-wrap"><img src="${escapeHtml(data.image)}" class="embed-thumb" onerror="this.parentElement.style.display='none'" loading="lazy"></div>`;
        }
    } else if (embedType === 'streamable') {
        const streamId = url.match(/streamable\.com\/([a-zA-Z0-9]+)/);
        if (streamId) {
            embedHtml += `<div class="embed-video-wrap">
                <iframe src="https://streamable.com/e/${streamId[1]}" frameborder="0" allowfullscreen class="embed-video-iframe"></iframe>
            </div>`;
        }
    } else if ((embedType === 'twitter-video' || embedType === 'og-video') && data.video) {
        embedHtml += `<div class="embed-video-wrap">
            <video src="${escapeHtml(data.video)}" controls preload="metadata" class="embed-video-native"></video>
        </div>`;
    } else if (data.image) {
        // Image thumbnail
        embedHtml += `<div class="embed-thumb-wrap">
            <img src="${escapeHtml(data.image)}" class="embed-thumb" 
                 onerror="this.parentElement.style.display='none'" 
                 loading="lazy"
                 onclick="window.open('${escapeHtml(data.image)}','_blank')">
        </div>`;
    }

    card.innerHTML = embedHtml;

    // Dismiss button
    const dismiss = document.createElement('button');
    dismiss.className = 'embed-dismiss';
    dismiss.innerHTML = '✕';
    dismiss.title = 'Hide embed';
    dismiss.onclick = (e) => { e.stopPropagation(); card.remove(); };
    card.appendChild(dismiss);

    container.appendChild(card);

    // Auto-scroll to keep latest content visible
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        const nearBottom = contentArea.scrollHeight - contentArea.scrollTop - contentArea.clientHeight < 200;
        if (nearBottom) contentArea.scrollTop = contentArea.scrollHeight;
    }
}

/** Browser fallback: try multiple CORS proxies in sequence until one works */
async function fetchLinkPreviewBrowser(url) {
    const proxies = [
        () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(6000) })
              .then(r => r.ok ? r.text() : Promise.reject()),
        () => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(6000) })
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(j => j.contents || Promise.reject()),
        () => fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(6000) })
              .then(r => r.ok ? r.text() : Promise.reject()),
    ];
    for (const attempt of proxies) {
        try {
            const html = await attempt();
            if (!html || typeof html !== 'string') continue;
            const result = parseLinkPreviewHtml(html, url);
            if (result) return result;
        } catch (e) { /* try next proxy */ }
    }
    return null;
}

function parseLinkPreviewHtml(html, sourceUrl) {
    const og = {};
    const getTag = (prop) => {
        const r1 = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']*)["']`, 'i');
        const r2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${prop}["']`, 'i');
        const m = html.match(r1) || html.match(r2);
        return m ? m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"') : '';
    };
    const getMeta = (name) => {
        const r1 = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
        const r2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, 'i');
        const m = html.match(r1) || html.match(r2);
        return m ? m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"') : '';
    };

    og.title = getTag('og:title') || '';
    og.description = getTag('og:description') || getMeta('description') || '';
    og.image = getTag('og:image') || '';
    og.site_name = getTag('og:site_name') || '';
    og.video = getTag('og:video') || getTag('og:video:url') || getTag('og:video:secure_url') || '';

    if (!og.title) {
        const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (m) og.title = m[1].trim();
    }

    // Favicon
    let favicon = '';
    const iconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i);
    if (iconMatch) {
        favicon = iconMatch[1];
        if (favicon.startsWith('//')) favicon = 'https:' + favicon;
        else if (favicon.startsWith('/')) {
            try { favicon = new URL(sourceUrl).origin + favicon; } catch(e){}
        }
    }

    if (!og.title && !og.description && !og.image) return null;
    return {
        title: og.title, description: og.description, image: og.image,
        site_name: og.site_name, video: og.video, favicon: favicon, url: sourceUrl
    };
}

/** Classify URL type for special embed handling */
function classifyEmbed(url, data) {
    const host = extractDomain(url).toLowerCase();
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    if ((host.includes('twitter.com') || host.includes('x.com')) && data.video) return 'twitter-video';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter';
    if (host.includes('twitch.tv') && url.includes('/clip/')) return 'twitch-clip';
    if (host.includes('clips.twitch.tv')) return 'twitch-clip';
    if (host.includes('twitch.tv')) return 'twitch';
    if (host.includes('streamable.com')) return 'streamable';
    if (host.includes('reddit.com')) return 'reddit';
    if (host.includes('github.com')) return 'github';
    if (host.includes('spotify.com')) return 'spotify';
    // Detect OG video tag from any site
    if (data.video) return 'og-video';
    return 'generic';
}

/** Per-site accent color for left border */
function getEmbedAccent(url) {
    const host = extractDomain(url).toLowerCase();
    if (host.includes('youtube.com') || host.includes('youtu.be')) return '#ff0000';
    if (host.includes('twitter.com') || host.includes('x.com')) return '#1da1f2';
    if (host.includes('twitch.tv')) return '#9146ff';
    if (host.includes('reddit.com')) return '#ff4500';
    if (host.includes('github.com')) return '#f0f6fc';
    if (host.includes('spotify.com')) return '#1db954';
    if (host.includes('discord.com') || host.includes('discord.gg')) return '#5865f2';
    return '#00ff41'; // default: terminal green
}

function extractDomain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch(e) { return url; }
}

function extractYouTubeId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
}

function extractTwitchClipSlug(url) {
    // https://clips.twitch.tv/SlugHere or https://www.twitch.tv/channel/clip/SlugHere
    const m = url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/) || url.match(/twitch\.tv\/\w+\/clip\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
}

function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '…' : str;
}


// =====================================================
//  SCREEN SOURCE PICKER (Electron desktopCapturer)
// =====================================================
let _screenPickerResolve = null;

function showScreenPicker(sources) {
    return new Promise((resolve) => {
        _screenPickerResolve = resolve;
        const modal = document.getElementById('screen-picker-modal');
        const grid  = document.getElementById('screen-picker-grid');
        if (!modal || !grid) { resolve(null); return; }

        grid.innerHTML = '';
        sources.forEach(src => {
            const tile = document.createElement('div');
            tile.className = 'screen-source-tile';
            tile.onclick = () => {
                closeScreenPicker();
                resolve(src.id);
                _screenPickerResolve = null;
            };
            // Thumbnail — Electron returns dataURL thumbnails
            const thumb = src.thumbnail;
            tile.innerHTML = `
                <img src="${thumb}" alt="${escapeHtml(src.name)}">
                <span>${escapeHtml(src.name)}</span>
            `;
            grid.appendChild(tile);
        });

        modal.classList.remove('hidden');
    });
}

function closeScreenPicker() {
    document.getElementById('screen-picker-modal')?.classList.add('hidden');
    if (_screenPickerResolve) {
        _screenPickerResolve(null);
        _screenPickerResolve = null;
    }
}


// =====================================================
//  AVATAR CROP TOOL
//  Canvas-based drag/zoom square crop before upload
// =====================================================

let _cropFile      = null;   // original File object
let _cropImg       = null;   // HTMLImageElement
let _cropOffX      = 0;      // image pan offset X (canvas px)
let _cropOffY      = 0;      // image pan offset Y
let _cropZoom      = 1;      // zoom multiplier (1 = fit)
let _cropDragging  = false;
let _cropDragStart = null;
let _cropBoxSize   = 280;    // square aperture side (canvas px)
const _CROP_OUTPUT = 400;    // output image size px

function openCropModal(file) {
    _cropFile = file;
    _cropZoom = 1;
    _cropOffX = 0;
    _cropOffY = 0;

    const modal = document.getElementById('crop-modal');
    modal.classList.remove('hidden');

    const zoomEl = document.getElementById('crop-zoom');
    if (zoomEl) { zoomEl.value = 100; }
    document.getElementById('crop-zoom-label').textContent = '100%';

    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            _cropImg = img;
            cropFitImage();
            cropDraw();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    const canvas = document.getElementById('crop-canvas');
    canvas.addEventListener('mousedown',  cropMouseDown);
    canvas.addEventListener('mousemove',  cropMouseMove);
    canvas.addEventListener('mouseup',    cropMouseUp);
    canvas.addEventListener('mouseleave', cropMouseUp);
    canvas.addEventListener('wheel',      cropWheel, { passive: false });
    canvas.addEventListener('touchstart', cropTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  cropTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   cropMouseUp);
}

function closeCropModal() {
    document.getElementById('crop-modal').classList.add('hidden');
    const canvas = document.getElementById('crop-canvas');
    canvas.removeEventListener('mousedown',  cropMouseDown);
    canvas.removeEventListener('mousemove',  cropMouseMove);
    canvas.removeEventListener('mouseup',    cropMouseUp);
    canvas.removeEventListener('mouseleave', cropMouseUp);
    canvas.removeEventListener('wheel',      cropWheel);
    canvas.removeEventListener('touchstart', cropTouchStart);
    canvas.removeEventListener('touchmove',  cropTouchMove);
    canvas.removeEventListener('touchend',   cropMouseUp);
    _cropFile = null;
    _cropImg  = null;
}

function cropFitImage() {
    const canvas = document.getElementById('crop-canvas');
    const vw = canvas.parentElement.clientWidth  || 480;
    const vh = 340;
    _cropBoxSize = Math.min(vw, vh) * 0.72;
    canvas.width  = vw;
    canvas.height = vh;

    // Fit image so its shorter side equals the box size
    const scale = _cropBoxSize / Math.min(_cropImg.width, _cropImg.height);
    _cropZoom = scale;
    document.getElementById('crop-zoom').min = Math.round(scale * 100);
    document.getElementById('crop-zoom').value = Math.round(scale * 100);
    document.getElementById('crop-zoom-label').textContent = Math.round(scale * 100) + '%';

    // Centre
    _cropOffX = (canvas.width  - _cropImg.width  * _cropZoom) / 2;
    _cropOffY = (canvas.height - _cropImg.height * _cropZoom) / 2;
}

function cropSetZoom(val) {
    const z = parseFloat(val) / 100;
    const canvas = document.getElementById('crop-canvas');
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;
    // Zoom relative to canvas centre
    _cropOffX = cx - (cx - _cropOffX) * (z / _cropZoom);
    _cropOffY = cy - (cy - _cropOffY) * (z / _cropZoom);
    _cropZoom = z;
    document.getElementById('crop-zoom-label').textContent = Math.round(z * 100) + '%';
    cropDraw();
}

function cropDraw() {
    const canvas = document.getElementById('crop-canvas');
    if (!canvas || !_cropImg) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const bs = _cropBoxSize;
    const bx = (W - bs) / 2, by = (H - bs) / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(_cropImg, _cropOffX, _cropOffY, _cropImg.width * _cropZoom, _cropImg.height * _cropZoom);

    // Dim outside box
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(0,  0,  W,  by);
    ctx.fillRect(0,  by + bs, W, H - by - bs);
    ctx.fillRect(0,  by, bx, bs);
    ctx.fillRect(bx + bs, by, W - bx - bs, bs);

    // Box border
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(bx, by, bs, bs);

    // Rule-of-thirds grid
    ctx.strokeStyle = 'rgba(0,255,65,0.18)';
    ctx.lineWidth   = 0.5;
    for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(bx + bs * i / 3, by); ctx.lineTo(bx + bs * i / 3, by + bs); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by + bs * i / 3); ctx.lineTo(bx + bs, by + bs * i / 3); ctx.stroke();
    }
}

// Drag handlers
function cropMouseDown(e) { _cropDragging = true; _cropDragStart = { x: e.clientX - _cropOffX, y: e.clientY - _cropOffY }; e.currentTarget.style.cursor = 'grabbing'; }
function cropMouseMove(e) {
    if (!_cropDragging) return;
    _cropOffX = e.clientX - _cropDragStart.x;
    _cropOffY = e.clientY - _cropDragStart.y;
    cropDraw();
}
function cropMouseUp(e)   { _cropDragging = false; if (e.currentTarget) e.currentTarget.style.cursor = 'grab'; }
function cropWheel(e)     { e.preventDefault(); const delta = -e.deltaY * 0.001; const z = document.getElementById('crop-zoom'); const newVal = Math.max(parseFloat(z.min), Math.min(400, parseFloat(z.value) + delta * 80)); z.value = newVal; cropSetZoom(newVal); }

let _cropTouchLast = null;
function cropTouchStart(e) { e.preventDefault(); if (e.touches.length === 1) { _cropDragging = true; _cropDragStart = { x: e.touches[0].clientX - _cropOffX, y: e.touches[0].clientY - _cropOffY }; } }
function cropTouchMove(e)  { e.preventDefault(); if (_cropDragging && e.touches.length === 1) { _cropOffX = e.touches[0].clientX - _cropDragStart.x; _cropOffY = e.touches[0].clientY - _cropDragStart.y; cropDraw(); } }

async function applyCrop() {
    if (!_cropImg) return;
    const canvas = document.getElementById('crop-canvas');
    const W = canvas.width, H = canvas.height;
    const bs = _cropBoxSize;
    const bx = (W - bs) / 2, by = (H - bs) / 2;

    // Render the cropped square at output size
    const out = document.createElement('canvas');
    out.width = out.height = _CROP_OUTPUT;
    const ctx = out.getContext('2d');

    // Map box coords back to image coords
    const srcX = (bx - _cropOffX) / _cropZoom;
    const srcY = (by - _cropOffY) / _cropZoom;
    const srcS = bs / _cropZoom;

    ctx.drawImage(_cropImg, srcX, srcY, srcS, srcS, 0, 0, _CROP_OUTPUT, _CROP_OUTPUT);

    closeCropModal();

    // Convert to blob and upload
    out.toBlob(async blob => {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        const btn  = document.getElementById('upload-avatar-btn');
        if (btn) { btn.textContent = 'UPLOADING...'; btn.disabled = true; }
        try {
            const url = await uploadImageToImgBB(file);
            document.getElementById('edit-avatar').value = url;
            const preview = document.getElementById('avatar-preview');
            if (preview) preview.src = url;
        } catch (err) {
            sysToast('UPLOAD FAILED: ' + err.message, 'error');
        } finally {
            if (btn) { btn.textContent = 'UPLOAD IMAGE'; btn.disabled = false; }
        }
    }, 'image/jpeg', 0.92);
}


// =====================================================
//  NOTIFICATION SOUND — keyboard click MP3
// =====================================================

function playTickSound() {
    try {
        const audio = new Audio('creatorshome-keyboard-click-327728.mp3');
        audio.volume = 0.6;
        audio.play().catch(() => { /* autoplay blocked */ });
    } catch (e) { /* Audio not available */ }
}