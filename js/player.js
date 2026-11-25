// NEXUS UNIVERSAL PLAYER - Hardened External Script (CSP script-src 'self')
(function() {
    'use strict';

    const VALID_ROM_RE = /^roms\/[A-Za-z0-9 _()\[\].!,'-]+\.(?:nes|gb|gbc)$/i;
    const VALID_DATA_IMAGE_RE = /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/;

    function sanitizeRomPath(raw) {
        if (typeof raw !== 'string') return 'roms/super-tilt-bro.nes';
        const trimmed = raw.trim();
        if (trimmed.includes('..') || trimmed.includes('\\') || !VALID_ROM_RE.test(trimmed)) {
            return 'roms/super-tilt-bro.nes';
        }
        return trimmed;
    }

    const params = new URLSearchParams(window.location.search);
    const romUrl = sanitizeRomPath(params.get('rom') || 'roms/super-tilt-bro.nes');
    const rawTitle = (params.get('title') || (romUrl.split('/').pop().replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))).slice(0, 80);
    const gameTitle = rawTitle.toUpperCase();
    const joinRoomCode = (params.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    const roleParam = (params.get('role') || '').toLowerCase();
    const isGuestMode = !!(joinRoomCode.length >= 4 && roleParam === 'guest');
    document.getElementById('gameTitleBadge').textContent = isGuestMode ? `${gameTitle} [P2]` : gameTitle;

    const canvas = document.getElementById('screen');
    const remoteVideo = document.getElementById('remoteVideo');
    const remoteFallbackImg = document.getElementById('remoteFallbackImg');
    const guestAudioBanner = document.getElementById('guestAudioBanner');
    const ctx = canvas.getContext('2d');
    const scanlines = document.getElementById('scanlines');

    function getSafeUrl(url) {
        const clean = sanitizeRomPath(url);
        const parts = clean.split('/');
        const filename = parts.pop();
        return parts.join('/') + '/' + encodeURIComponent(filename);
    }

    const safeRomUrl = getSafeUrl(romUrl);
    function resize() {
        const container = document.querySelector('.stage-wrapper');
        if (!container) return;
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const aspect = canvas.width / canvas.height;

        let dw = cw;
        let dh = cw / aspect;
        if (dh > ch) {
            dh = ch;
            dw = ch * aspect;
        }

        const wPx = Math.floor(dw) + 'px';
        const hPx = Math.floor(dh) + 'px';
        [canvas, remoteVideo, remoteFallbackImg].forEach(el => {
            if (el) {
                el.style.width = wPx;
                el.style.height = hPx;
            }
        });
    }
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 120));
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', resize);
    }

    // --- MULTI-SYSTEM EMULATION (NES / FAMICOM & GAME BOY / GBC) ---
    const isGameBoy = romUrl.toLowerCase().endsWith('.gb') || romUrl.toLowerCase().endsWith('.gbc');

    let offscreen, offCtx, imageData, imageBuffer;
    if (isGameBoy) {
        canvas.width = 160;
        canvas.height = 144;
        resize();
    } else {
        canvas.width = 256;
        canvas.height = 240;
        resize();

        offscreen = document.createElement('canvas');
        offscreen.width = 256;
        offscreen.height = 240;
        offCtx = offscreen.getContext('2d');
        imageData = offCtx.createImageData(256, 240);
        imageBuffer = new Uint32Array(imageData.data.buffer);
    }

    // O(1) Circular Ring Buffer Web Audio Synthesizer (zero main-thread Array.shift lag)
    const RING_CAP = 16384;
    const ringBuf = new Float32Array(RING_CAP);
    let ringWrite = 0;
    let ringRead = 0;
    let audioCtx = null;
    let audioDestNode = null;
    const audioBufferSize = 2048;
    let soundMuted = false;

    function ringPush(sample) {
        const next = (ringWrite + 1) & (RING_CAP - 1);
        if (next !== ringRead) {
            ringBuf[ringWrite] = sample;
            ringWrite = next;
        }
    }

    function initAudio() {
        if (!audioCtx) {
            try {
                const AudioClass = window.AudioContext || window.webkitAudioContext;
                if (AudioClass) {
                    audioCtx = new AudioClass();
                    const scriptNode = audioCtx.createScriptProcessor(audioBufferSize, 0, 1);
                    scriptNode.onaudioprocess = (e) => {
                        const out = e.outputBuffer.getChannelData(0);
                        for (let i = 0; i < audioBufferSize; i++) {
                            if (!soundMuted && ringRead !== ringWrite) {
                                out[i] = ringBuf[ringRead];
                                ringRead = (ringRead + 1) & (RING_CAP - 1);
                            } else {
                                out[i] = 0;
                            }
                        }
                    };
                    scriptNode.connect(audioCtx.destination);
                    try {
                        audioDestNode = audioCtx.createMediaStreamDestination();
                        scriptNode.connect(audioDestNode);
                    } catch (err) {}
                }
            } catch (e) {}
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        if (isGameBoy && typeof window.XAudioJSWebAudioContextHandle !== 'undefined' && window.XAudioJSWebAudioContextHandle) {
            if (window.XAudioJSWebAudioContextHandle.state === 'suspended') {
                window.XAudioJSWebAudioContextHandle.resume().catch(() => {});
            }
        }
    }

    // Unlock suspended browser audio on any user gesture
    ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(evtName => {
        window.addEventListener(evtName, () => {
            if (!isGuestMode) initAudio();
        }, { passive: true });
    });

    // Initialize JSNES Engine (for NES)
    let nes = null;
    let romLoaded = false;

    if (!isGameBoy) {
        initAudio();
        try {
            nes = new jsnes.NES({
                sampleRate: audioCtx ? audioCtx.sampleRate : 44100,
                emulateSound: true,
                onFrame: (frameBuffer) => {
                    for (let i = 0; i < 256 * 240; i++) {
                        const p = frameBuffer[i];
                        imageBuffer[i] = 0xFF000000 | ((p & 0xFF) << 16) | (p & 0x00FF00) | ((p >> 16) & 0xFF);
                    }
                },
                onAudioSample: (left, right) => {
                    if (audioCtx && !soundMuted) {
                        ringPush((left + right) * 0.5);
                    }
                }
            });
        } catch (e) {
            console.error('Error creating JSNES instance:', e);
        }
    }

    const ctrl = jsnes.Controller;
    const nesToGb = {
        [ctrl.BUTTON_A]: 4,
        [ctrl.BUTTON_B]: 5,
        [ctrl.BUTTON_SELECT]: 6,
        [ctrl.BUTTON_START]: 7,
        [ctrl.BUTTON_UP]: 2,
        [ctrl.BUTTON_DOWN]: 3,
        [ctrl.BUTTON_LEFT]: 1,
        [ctrl.BUTTON_RIGHT]: 0
    };

    const setButton = (btn, pressed) => {
        if (!romLoaded) return;
        if (isGuestMode) {
            NexusNetplay.sendInput(btn, pressed, 2);
            return;
        }
        if (isGameBoy) {
            initAudio();
            if (window.NexusGameBoy) {
                NexusGameBoy.setButton(nesToGb[btn], pressed);
            }
        } else if (nes) {
            initAudio();
            if (pressed) nes.buttonDown(1, btn);
            else nes.buttonUp(1, btn);
        }
    };

    const keyMap = {
        'ArrowLeft': ctrl.BUTTON_LEFT,
        'KeyA': ctrl.BUTTON_LEFT,
        'ArrowRight': ctrl.BUTTON_RIGHT,
        'KeyD': ctrl.BUTTON_RIGHT,
        'ArrowUp': ctrl.BUTTON_UP,
        'KeyW': ctrl.BUTTON_UP,
        'ArrowDown': ctrl.BUTTON_DOWN,
        'KeyS': ctrl.BUTTON_DOWN,
        'Space': ctrl.BUTTON_A,
        'KeyZ': ctrl.BUTTON_A,
        'KeyK': ctrl.BUTTON_A,
        'KeyX': ctrl.BUTTON_B,
        'KeyJ': ctrl.BUTTON_B,
        'ShiftLeft': ctrl.BUTTON_SELECT,
        'ShiftRight': ctrl.BUTTON_SELECT,
        'KeyC': ctrl.BUTTON_SELECT,
        'Enter': ctrl.BUTTON_START,
        'KeyP': ctrl.BUTTON_START
    };

    window.addEventListener('keydown', (e) => {
        if (keyMap[e.code] !== undefined) {
            setButton(keyMap[e.code], true);
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                e.preventDefault();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (keyMap[e.code] !== undefined) {
            setButton(keyMap[e.code], false);
        }
    });

    function bindTouch(id, btnCode) {
        const el = document.getElementById(id);
        if (!el) return;
        const down = (e) => { e.preventDefault(); setButton(btnCode, true); };
        const up = (e) => { e.preventDefault(); setButton(btnCode, false); };
        el.addEventListener('touchstart', down, { passive: false });
        el.addEventListener('touchend', up, { passive: false });
        el.addEventListener('touchcancel', up, { passive: false });
        el.addEventListener('mousedown', down);
        el.addEventListener('mouseup', up);
        el.addEventListener('mouseleave', up);
    }

    bindTouch('btnUp', ctrl.BUTTON_UP);
    bindTouch('btnDown', ctrl.BUTTON_DOWN);
    bindTouch('btnLeft', ctrl.BUTTON_LEFT);
    bindTouch('btnRight', ctrl.BUTTON_RIGHT);
    bindTouch('btnA', ctrl.BUTTON_A);
    bindTouch('btnB', ctrl.BUTTON_B);
    bindTouch('btnSelect', ctrl.BUTTON_SELECT);
    bindTouch('btnStart', ctrl.BUTTON_START);

    let lastGamepadButtons = {};
    function pollGamepad() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0];
        if (gp && gp.buttons) {
            const check = (btnIdx, nesBtn) => {
                const pressed = gp.buttons[btnIdx] && gp.buttons[btnIdx].pressed;
                if (pressed !== lastGamepadButtons[nesBtn]) {
                    lastGamepadButtons[nesBtn] = pressed;
                    setButton(nesBtn, pressed);
                }
            };
            check(0, ctrl.BUTTON_A);
            check(1, ctrl.BUTTON_B);
            check(8, ctrl.BUTTON_SELECT);
            check(9, ctrl.BUTTON_START);
            check(12, ctrl.BUTTON_UP);
            check(13, ctrl.BUTTON_DOWN);
            check(14, ctrl.BUTTON_LEFT);
            check(15, ctrl.BUTTON_RIGHT);
        }
        requestAnimationFrame(pollGamepad);
    }
    pollGamepad();

    // HUD Controls
    document.getElementById('btnToggleSound').addEventListener('click', () => {
        soundMuted = !soundMuted;
        initAudio();
        document.getElementById('btnToggleSound').textContent = soundMuted ? 'SFX: OFF' : 'SFX: ON';
        if (isGuestMode && remoteVideo) {
            remoteVideo.muted = soundMuted;
        }
        if (isGameBoy && window.NexusGameBoy) {
            NexusGameBoy.setMuted(soundMuted);
            if (window.NexusGameBoy.core) {
                window.NexusGameBoy.core.settings[0] = !soundMuted;
            }
        }
    });

    document.getElementById('btnToggleScanlines').addEventListener('click', () => {
        const show = scanlines.style.display !== 'none';
        scanlines.style.display = show ? 'none' : 'block';
        document.getElementById('btnToggleScanlines').textContent = show ? 'CRT: OFF' : 'CRT: ON';
    });

    document.getElementById('btnReset').addEventListener('click', () => {
        if (isGuestMode) return;
        if (isGameBoy && window.NexusGameBoy) {
            NexusGameBoy.reset();
        } else if (nes && romLoaded) {
            nes.reset();
        }
    });

    // 2-Device Multiplayer Lobby
    const btn2PMode = document.getElementById('btn2PMode');
    const mpBackdrop = document.getElementById('mpBackdrop');
    const mpCloseBtn = document.getElementById('mpCloseBtn');
    const mpCopyBtn = document.getElementById('mpCopyBtn');
    const mpRoomCodeEl = document.getElementById('mpRoomCode');
    const mpQrCanvas = document.getElementById('mpQrCanvas');
    const mpStatusText = document.getElementById('mpStatusText');
    const mpPingText = document.getElementById('mpPingText');
    const mpModeHint = document.getElementById('mpModeHint');
    const mpTabStream = document.getElementById('mpTabStream');
    const mpTabController = document.getElementById('mpTabController');

    let mpSelectedMode = 'stream';
    let mpRoomStarted = false;

    function getInviteUrl() {
        const base = `${location.origin}${location.pathname.replace(/[^/]+$/, '')}`;
        const code = NexusNetplay.roomCode || '';
        if (mpSelectedMode === 'controller') {
            return `${base}controller.html?room=${encodeURIComponent(code)}`;
        }
        return `${base}player.html?rom=${encodeURIComponent(romUrl)}&title=${encodeURIComponent(rawTitle)}&room=${encodeURIComponent(code)}&role=guest`;
    }

    function refreshMpModalView() {
        if (!NexusNetplay.roomCode) return;
        mpRoomCodeEl.textContent = NexusNetplay.roomCode;
        const url = getInviteUrl();
        if (window.NexusQR) {
            NexusQR.renderToCanvas(mpQrCanvas, url, { size: 152 });
        }
        if (mpSelectedMode === 'controller') {
            mpModeHint.textContent = isGameBoy
                ? 'Scan QR on a phone to control this Game Boy screen wirelessly (Co-Pilot)!'
                : 'Scan QR on a phone to use it as a Wireless Player 2 Controller on this screen!';
        } else {
            mpModeHint.textContent = isGameBoy
                ? 'Share link or scan QR on Device 2 to stream live video/audio & co-play together!'
                : 'Share link or scan QR on Device 2 to play live on 2 separate screens anywhere!';
        }
    }

    function getHostMediaStream() {
        const stream = canvas.captureStream ? canvas.captureStream(60) : new MediaStream();
        if (audioDestNode && audioDestNode.stream) {
            audioDestNode.stream.getAudioTracks().forEach(t => stream.addTrack(t));
        }
        return stream;
    }

    NexusNetplay.on('roomCreated', () => {
        mpStatusText.textContent = 'WAITING FOR P2...';
        refreshMpModalView();
    });

    NexusNetplay.on('peerJoined', ({ clientType }) => {
        btn2PMode.textContent = '👥 P2 LIVE';
        btn2PMode.style.borderColor = '#33ff33';
        btn2PMode.style.color = '#33ff33';
        mpStatusText.textContent = clientType === 'controller' ? 'P2 GAMEPAD CONNECTED!' : 'P2 ONLINE CONNECTED!';
    });

    NexusNetplay.on('peerLeft', () => {
        btn2PMode.textContent = '👥 2P';
        btn2PMode.style.borderColor = 'var(--accent-yellow)';
        btn2PMode.style.color = 'var(--accent-yellow)';
        mpStatusText.textContent = 'WAITING FOR P2...';
        mpPingText.textContent = 'PING: --';
    });

    NexusNetplay.on('status', (st) => {
        if (mpStatusText) mpStatusText.textContent = st;
        if (isGuestMode && btn2PMode) btn2PMode.textContent = `👥 ${st}`;
    });

    NexusNetplay.on('latency', (ms) => {
        if (mpPingText) mpPingText.textContent = `PING: ${ms}ms`;
        if (isGuestMode && btn2PMode) btn2PMode.textContent = `👥 ${ms}ms`;
    });

    NexusNetplay.on('input', (msg) => {
        if (isGuestMode || !romLoaded) return;
        const player = msg.player === 1 ? 1 : 2;
        if (typeof msg.btn !== 'number' || msg.btn < 0 || msg.btn > 9) return;
        if (isGameBoy) {
            if (window.NexusGameBoy && nesToGb[msg.btn] !== undefined) {
                NexusGameBoy.setButton(nesToGb[msg.btn], !!msg.pressed);
            }
        } else if (nes) {
            if (msg.pressed) nes.buttonDown(player, msg.btn);
            else nes.buttonUp(player, msg.btn);
        }
    });

    NexusNetplay.on('remoteStream', (stream) => {
        if (!isGuestMode) return;
        canvas.style.display = 'none';
        remoteFallbackImg.style.display = 'none';
        remoteVideo.style.display = 'block';
        remoteVideo.srcObject = stream;
        remoteVideo.muted = soundMuted;
        remoteVideo.play().catch(() => {
            remoteVideo.muted = true;
            remoteVideo.play().catch(() => {});
            guestAudioBanner.style.display = 'block';
        });
    });

    NexusNetplay.on('videoFrame', (dataUrl) => {
        if (!isGuestMode || typeof dataUrl !== 'string' || !VALID_DATA_IMAGE_RE.test(dataUrl)) return;
        canvas.style.display = 'none';
        remoteVideo.style.display = 'none';
        remoteFallbackImg.style.display = 'block';
        remoteFallbackImg.src = dataUrl;
    });

    NexusNetplay.on('roomClosed', () => {
        if (isGuestMode) {
            document.getElementById('gameTitleBadge').textContent = 'HOST DISCONNECTED';
        }
    });

    if (guestAudioBanner) {
        guestAudioBanner.addEventListener('click', () => {
            remoteVideo.muted = false;
            soundMuted = false;
            remoteVideo.play().catch(() => {});
            guestAudioBanner.style.display = 'none';
        });
    }

    if (btn2PMode) {
        btn2PMode.addEventListener('click', () => {
            if (isGuestMode) return;
            mpBackdrop.classList.add('open');
            if (!mpRoomStarted) {
                mpRoomStarted = true;
                NexusNetplay.createRoom({
                    rom: romUrl,
                    title: rawTitle,
                    system: isGameBoy ? 'GB' : 'NES',
                    mode: mpSelectedMode,
                    getStream: getHostMediaStream,
                    getCanvas: () => canvas
                }).catch(() => {
                    mpStatusText.textContent = 'WS CONNECT ERROR';
                });
            } else {
                refreshMpModalView();
            }
        });
    }

    if (mpTabStream) {
        mpTabStream.addEventListener('click', () => {
            mpSelectedMode = 'stream';
            mpTabStream.classList.add('active');
            mpTabController.classList.remove('active');
            NexusNetplay.setHostMode('stream');
            refreshMpModalView();
        });
    }

    if (mpTabController) {
        mpTabController.addEventListener('click', () => {
            mpSelectedMode = 'controller';
            mpTabController.classList.add('active');
            mpTabStream.classList.remove('active');
            NexusNetplay.setHostMode('controller');
            refreshMpModalView();
        });
    }

    if (mpCopyBtn) {
        mpCopyBtn.addEventListener('click', () => {
            const url = getInviteUrl();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    mpCopyBtn.textContent = '✅ LINK COPIED!';
                    setTimeout(() => { mpCopyBtn.textContent = '📋 COPY INVITE LINK'; }, 1800);
                }).catch(() => {});
            } else {
                window.prompt('Copy invite link:', url);
            }
        });
    }

    if (mpCloseBtn) {
        mpCloseBtn.addEventListener('click', () => mpBackdrop.classList.remove('open'));
    }
    if (mpBackdrop) {
        mpBackdrop.addEventListener('click', (e) => {
            if (e.target === mpBackdrop) mpBackdrop.classList.remove('open');
        });
    }

    function startRom(binaryString) {
        if (isGameBoy) {
            if (window.NexusGameBoy) {
                NexusGameBoy.start(canvas, binaryString, gameTitle);
                romLoaded = true;
            }
        } else if (nes) {
            nes.loadROM(binaryString);
            romLoaded = true;
            initAudio();
            requestAnimationFrame(runLoop);
        }
    }

    if (isGuestMode) {
        romLoaded = true;
        document.getElementById('btnReset').style.display = 'none';
        canvas.style.display = 'none';
        remoteVideo.style.display = 'block';
        btn2PMode.textContent = '👥 JOINING...';
        NexusNetplay.joinRoom(joinRoomCode, 'guest').catch(() => {
            document.getElementById('gameTitleBadge').textContent = 'ROOM NOT FOUND';
        });
    } else {
        fetch(safeRomUrl)
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.arrayBuffer();
            })
            .then(buffer => {
                const bytes = new Uint8Array(buffer);
                let binary = '';
                for (let i = 0; i < bytes.length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                startRom(binary);
            })
            .catch(err => {
                console.error('Failed to load ROM:', err);
                ctx.fillStyle = '#06080e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ff2244';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('ROM LOAD ERROR', canvas.width / 2, canvas.height / 2 - 10);
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px monospace';
                ctx.fillText(err.message, canvas.width / 2, canvas.height / 2 + 15);
            });
    }

    // Exact 60 FPS frame accumulator (prevents 2x speed on 120Hz phones/monitors)
    const STEP_MS = 1000 / 60;
    let lastFrameMs = performance.now();
    let frameAccMs = 0;

    function runLoop(nowMs) {
        if (nes && romLoaded) {
            const dt = Math.min(100, Math.max(0, (nowMs || performance.now()) - lastFrameMs));
            lastFrameMs = nowMs || performance.now();
            frameAccMs += dt;
            let ran = false;
            let ticks = 0;
            while (frameAccMs >= STEP_MS && ticks < 3) {
                nes.frame();
                frameAccMs -= STEP_MS;
                ran = true;
                ticks++;
            }
            if (ran) {
                offCtx.putImageData(imageData, 0, 0);
                ctx.drawImage(offscreen, 0, 0, 256, 240);
            }
        }
        requestAnimationFrame(runLoop);
    }
})();
