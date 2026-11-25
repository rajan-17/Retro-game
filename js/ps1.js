// PlayStation player: configures EmulatorJS (PCSX-ReARMed core) from the URL and boots it.
// Lives in its own file because the page CSP forbids inline scripts.
(function () {
    'use strict';

    const PS1_ROM_RE = /^roms\/ps1\/[A-Za-z0-9 _()\[\].!,'&+-]+\.(?:chd|pbp|iso|bin|img|zip|7z)$/i;
    const params = new URLSearchParams(window.location.search);
    const rom = (params.get('rom') || '').trim();
    const title = (params.get('title') || 'PlayStation').slice(0, 80);

    document.title = `${title} • PlayStation • Nexus Retro Arcade`;

    function showNotice(heading, html) {
        document.getElementById('ps1NoticeTitle').textContent = heading;
        document.getElementById('ps1NoticeBody').innerHTML = html;
        document.getElementById('ps1Notice').classList.add('show');
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    if (!rom || rom.includes('..') || rom.includes('\\') || !PS1_ROM_RE.test(rom)) {
        const hint = params.get('hint') || '';
        showNotice('💿 INSERT DISC',
            `<p><b>${escapeHtml(title)}</b> isn't in your library yet.</p>` +
            `<p>Copy your own backup of the disc into <code>roms/ps1/</code>` +
            (hint ? `, for example:<br><code>${escapeHtml(hint)}</code>` : '.') +
            `</p><p>CHD works best. PBP, ISO, single-track BIN, or a ZIP/7Z of a CUE+BIN set also work. ` +
            `The arcade picks it up within a few seconds.</p>`);
        return;
    }

    // Encode each path segment so names with spaces, brackets or apostrophes load correctly.
    const romUrl = rom.split('/').map(encodeURIComponent).join('/');

    async function boot() {
        let bios = '';
        try {
            const res = await fetch('/api/ps1', { cache: 'no-store' });
            if (res.ok) bios = (await res.json()).bios || '';
        } catch (_) { /* fall back to HLE BIOS */ }
        if (!bios) document.getElementById('ps1BiosHint').classList.add('show');

        window.EJS_player = '#game';
        window.EJS_core = 'psx';
        window.EJS_gameName = title;
        window.EJS_gameUrl = romUrl;
        window.EJS_biosUrl = bios;
        window.EJS_pathtodata = 'emulatorjs/data/';
        window.EJS_color = '#00f0ff';
        window.EJS_backgroundColor = '#06080e';
        window.EJS_language = 'en-US';
        window.EJS_disableAutoLang = false;   // don't fetch localization files we don't ship
        window.EJS_threads = false;           // needs cross-origin isolation, which we don't enable
        window.EJS_startOnLoaded = false;     // a click to start lets the browser unlock audio
        window.EJS_onGameStart = () => document.getElementById('ps1BiosHint').classList.remove('show');

        const s = document.createElement('script');
        s.src = 'emulatorjs/data/loader.js';
        s.onerror = () => showNotice('⚠️ EMULATOR MISSING',
            '<p>Could not load <code>emulatorjs/data/loader.js</code>. Make sure the emulatorjs folder is present.</p>');
        document.body.appendChild(s);
    }

    boot();
})();
