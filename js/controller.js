// NEXUS WIRELESS CONTROLLER - External Script (CSP script-src 'self')
(function() {
    'use strict';
    const params = new URLSearchParams(window.location.search);
    const initialRoom = (params.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    let activePlayer = parseInt(params.get('p') || '2', 10) === 1 ? 1 : 2;

    const roomGate = document.getElementById('roomGate');
    const gamepadDeck = document.getElementById('gamepadDeck');
    const roomCodeInput = document.getElementById('roomCodeInput');
    const btnConnectRoom = document.getElementById('btnConnectRoom');
    const roomErrMsg = document.getElementById('roomErrMsg');
    const ctrlRoomBadge = document.getElementById('ctrlRoomBadge');
    const ctrlStatusBadge = document.getElementById('ctrlStatusBadge');
    const ctrlPingBadge = document.getElementById('ctrlPingBadge');
    const ctrlGameTitle = document.getElementById('ctrlGameTitle');
    const btnPlayerToggle = document.getElementById('btnPlayerToggle');
    const btnFullscreen = document.getElementById('btnFullscreen');

    function updatePlayerBtn() {
        btnPlayerToggle.textContent = `PLAYER: P${activePlayer}`;
        ctrlGameTitle.textContent = `READY PLAYER ${activePlayer}`;
    }
    updatePlayerBtn();

    btnPlayerToggle.addEventListener('click', () => {
        activePlayer = activePlayer === 2 ? 1 : 2;
        updatePlayerBtn();
    });

    btnFullscreen.addEventListener('click', () => {
        const docEl = document.documentElement;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
            else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    });

    NexusNetplay.on('roomJoined', (info) => {
        roomGate.style.display = 'none';
        gamepadDeck.classList.add('active');
        ctrlRoomBadge.textContent = `ROOM: ${info.code}`;
        ctrlStatusBadge.textContent = 'CONNECTED';
        ctrlStatusBadge.className = 'ctrl-pill live';
        if (info.title) ctrlGameTitle.textContent = String(info.title).toUpperCase();
    });

    NexusNetplay.on('status', (st) => {
        ctrlStatusBadge.textContent = st;
        if (String(st).includes('LIVE')) ctrlStatusBadge.className = 'ctrl-pill live';
    });

    NexusNetplay.on('latency', (ms) => {
        ctrlPingBadge.textContent = `PING: ${ms}ms`;
    });

    NexusNetplay.on('roomClosed', () => {
        ctrlStatusBadge.textContent = 'HOST LEFT';
        ctrlStatusBadge.className = 'ctrl-pill err';
    });

    NexusNetplay.on('error', (err) => {
        roomErrMsg.textContent = (err && err.message) ? err.message : 'Could not join room';
        ctrlStatusBadge.textContent = 'ERROR';
        ctrlStatusBadge.className = 'ctrl-pill err';
    });

    async function connectToRoom(code) {
        const clean = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
        if (clean.length < 4) {
            roomErrMsg.textContent = 'Enter a valid Room Code';
            return;
        }
        roomErrMsg.textContent = 'Connecting...';
        try {
            await NexusNetplay.joinRoom(clean, 'controller');
        } catch (e) {
            roomErrMsg.textContent = 'Connection failed. Check network.';
        }
    }

    btnConnectRoom.addEventListener('click', () => connectToRoom(roomCodeInput.value));
    roomCodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') connectToRoom(roomCodeInput.value);
    });

    if (initialRoom) {
        roomCodeInput.value = initialRoom;
        connectToRoom(initialRoom);
    }

    const activeTouchBtns = new Map();
    const buttonElements = Array.from(document.querySelectorAll('[data-btn]'));
    const pressedCounts = {};

    function setBtnState(btnCode, pressed, el) {
        const prev = pressedCounts[btnCode] || 0;
        const next = pressed ? prev + 1 : Math.max(0, prev - 1);
        pressedCounts[btnCode] = next;

        if (pressed && prev === 0) {
            if (el) el.classList.add('pressed');
            if (navigator.vibrate) {
                try { navigator.vibrate(14); } catch (e) {}
            }
            NexusNetplay.sendInput(btnCode, true, activePlayer);
        } else if (!pressed && prev > 0 && next === 0) {
            if (el) el.classList.remove('pressed');
            NexusNetplay.sendInput(btnCode, false, activePlayer);
        }
    }

    function getBtnFromPoint(x, y) {
        const hit = document.elementFromPoint(x, y);
        return hit ? hit.closest('[data-btn]') : null;
    }

    gamepadDeck.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
            const el = getBtnFromPoint(t.clientX, t.clientY);
            if (el) {
                const btnCode = parseInt(el.dataset.btn, 10);
                activeTouchBtns.set(t.identifier, { btnCode, el });
                setBtnState(btnCode, true, el);
            }
        }
    }, { passive: false });

    gamepadDeck.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
            const prev = activeTouchBtns.get(t.identifier);
            const el = getBtnFromPoint(t.clientX, t.clientY);
            const nextCode = el ? parseInt(el.dataset.btn, 10) : null;
            if (prev && prev.btnCode !== nextCode) {
                setBtnState(prev.btnCode, false, prev.el);
                activeTouchBtns.delete(t.identifier);
            }
            if (el && (!prev || prev.btnCode !== nextCode)) {
                activeTouchBtns.set(t.identifier, { btnCode: nextCode, el });
                setBtnState(nextCode, true, el);
            }
        }
    }, { passive: false });

    function handleTouchEnd(e) {
        e.preventDefault();
        for (const t of e.changedTouches) {
            const prev = activeTouchBtns.get(t.identifier);
            if (prev) {
                setBtnState(prev.btnCode, false, prev.el);
                activeTouchBtns.delete(t.identifier);
            }
        }
    }
    gamepadDeck.addEventListener('touchend', handleTouchEnd, { passive: false });
    gamepadDeck.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    buttonElements.forEach(el => {
        const btnCode = parseInt(el.dataset.btn, 10);
        let mouseDown = false;
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            mouseDown = true;
            setBtnState(btnCode, true, el);
        });
        const release = () => {
            if (mouseDown) {
                mouseDown = false;
                setBtnState(btnCode, false, el);
            }
        };
        el.addEventListener('mouseup', release);
        el.addEventListener('mouseleave', release);
    });

    const keyMap = {
        ArrowUp: 4, KeyW: 4,
        ArrowDown: 5, KeyS: 5,
        ArrowLeft: 6, KeyA: 6,
        ArrowRight: 7, KeyD: 7,
        Space: 0, KeyZ: 0, KeyK: 0,
        KeyX: 1, KeyJ: 1,
        ShiftLeft: 2, ShiftRight: 2, KeyC: 2,
        Enter: 3, KeyP: 3
    };
    const heldKeys = new Set();
    window.addEventListener('keydown', (e) => {
        if (document.activeElement === roomCodeInput) return;
        const code = keyMap[e.code];
        if (code !== undefined && !heldKeys.has(e.code)) {
            heldKeys.add(e.code);
            const el = document.querySelector(`[data-btn="${code}"]`);
            setBtnState(code, true, el);
        }
    });
    window.addEventListener('keyup', (e) => {
        const code = keyMap[e.code];
        if (code !== undefined && heldKeys.has(e.code)) {
            heldKeys.delete(e.code);
            const el = document.querySelector(`[data-btn="${code}"]`);
            setBtnState(code, false, el);
        }
    });
})();
