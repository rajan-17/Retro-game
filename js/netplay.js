// NEXUS NETPLAY - WebRTC P2P + WebSocket Fallback Room Engine
(function(global) {
    'use strict';

    const ICE_SERVERS = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ];

    class NexusNetplayClient {
        constructor() {
            this.ws = null;
            this.pc = null;
            this.dc = null;
            this.role = null; // 'host' | 'guest' | 'controller'
            this.roomCode = null;
            this.peerId = null;
            this.mode = 'stream'; // 'stream' | 'controller'
            this.transport = 'none'; // 'p2p' | 'relay' | 'ws-pad' | 'none'
            this.connected = false;
            this.relayTimer = null;
            this.iceWatchdog = null;
            this.pingTimer = null;
            this.wsHeartbeat = null;
            this.callbacks = {};
            this.pendingIce = [];
        }

        getWsUrl() {
            const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
            return `${proto}//${location.host}/ws`;
        }

        connectWs() {
            return new Promise((resolve, reject) => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    resolve();
                    return;
                }
                if (this.ws) {
                    try { this.ws.close(); } catch (e) {}
                }
                const ws = new WebSocket(this.getWsUrl());
                this.ws = ws;
                let settled = false;

                ws.onopen = () => {
                    settled = true;
                    this.startHeartbeat();
                    resolve();
                };
                ws.onerror = (err) => {
                    if (!settled) {
                        settled = true;
                        reject(err);
                    }
                    this.emit('status', 'DISCONNECTED');
                };
                ws.onclose = () => {
                    this.stopHeartbeat();
                    this.stopRelayStream();
                    if (this.connected) {
                        this.connected = false;
                        this.emit('peerLeft', {});
                    }
                    this.emit('status', 'OFFLINE');
                };
                ws.onmessage = (ev) => {
                    try {
                        const msg = JSON.parse(ev.data);
                        this.handleMessage(msg);
                    } catch (e) {}
                };
            });
        }

        startHeartbeat() {
            this.stopHeartbeat();
            this.wsHeartbeat = setInterval(() => {
                this.wsSend({ type: 'ping', ts: Date.now() });
            }, 20000);
        }

        stopHeartbeat() {
            if (this.wsHeartbeat) {
                clearInterval(this.wsHeartbeat);
                this.wsHeartbeat = null;
            }
        }

        wsSend(obj) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(obj));
            }
        }

        on(event, fn) {
            this.callbacks[event] = fn;
        }

        emit(event, payload) {
            if (typeof this.callbacks[event] === 'function') {
                this.callbacks[event](payload);
            }
        }

        async createRoom({ rom, title, system, mode, getStream, getCanvas }) {
            this.role = 'host';
            this.mode = mode || 'stream';
            this.getStream = getStream;
            this.getCanvas = getCanvas;
            await this.connectWs();
            this.wsSend({
                type: 'create_room',
                rom,
                title,
                system,
                mode: this.mode
            });
        }

        setHostMode(mode) {
            this.mode = mode;
            this.wsSend({ type: 'update_room', mode });
        }

        async joinRoom(code, clientType = 'guest') {
            this.role = clientType === 'controller' ? 'controller' : 'guest';
            this.roomCode = String(code || '').toUpperCase().trim();
            await this.connectWs();
            this.wsSend({
                type: 'join_room',
                code: this.roomCode,
                clientType
            });
        }

        sendInput(btn, pressed, player = 2) {
            const payload = { type: 'input', player, btn, pressed: !!pressed };
            if (this.dc && this.dc.readyState === 'open') {
                try {
                    this.dc.send(JSON.stringify({ t: 'in', p: player, b: btn, d: pressed ? 1 : 0 }));
                    return;
                } catch (e) {}
            }
            this.wsSend(payload);
        }

        close() {
            this.stopRelayStream();
            this.stopPing();
            this.stopHeartbeat();
            if (this.iceWatchdog) {
                clearTimeout(this.iceWatchdog);
                this.iceWatchdog = null;
            }
            if (this.dc) {
                try { this.dc.close(); } catch (e) {}
                this.dc = null;
            }
            if (this.pc) {
                try { this.pc.close(); } catch (e) {}
                this.pc = null;
            }
            if (this.ws) {
                try { this.ws.close(); } catch (e) {}
                this.ws = null;
            }
            this.connected = false;
            this.transport = 'none';
        }

        handleMessage(msg) {
            switch (msg.type) {
                case 'room_created':
                    this.roomCode = msg.code;
                    this.emit('roomCreated', { code: msg.code });
                    this.emit('status', 'WAITING FOR P2');
                    break;

                case 'room_joined':
                    this.roomCode = msg.code;
                    this.peerId = msg.peerId;
                    this.mode = msg.mode || 'stream';
                    this.emit('roomJoined', msg);
                    if (this.role === 'controller') {
                        this.connected = true;
                        this.transport = 'ws-pad';
                        this.emit('status', 'CONTROLLER LIVE');
                        this.startPing();
                    } else {
                        this.emit('status', 'CONNECTING...');
                    }
                    break;

                case 'peer_joined':
                    this.peerId = msg.peerId;
                    this.connected = true;
                    this.emit('peerJoined', msg);
                    if (msg.clientType === 'controller') {
                        this.transport = 'ws-pad';
                        this.emit('status', 'P2 PAD LIVE');
                        this.startPing();
                    } else {
                        this.startHostWebRTC(msg.peerId);
                    }
                    break;

                case 'peer_left':
                    this.connected = false;
                    this.transport = 'none';
                    this.stopRelayStream();
                    this.stopPing();
                    if (this.pc) {
                        try { this.pc.close(); } catch (e) {}
                        this.pc = null;
                    }
                    this.emit('peerLeft', msg);
                    this.emit('status', 'WAITING FOR P2');
                    break;

                case 'room_closed':
                    this.connected = false;
                    this.stopPing();
                    this.emit('roomClosed', {});
                    this.emit('status', 'HOST LEFT');
                    break;

                case 'error':
                    this.emit('error', msg);
                    break;

                case 'input':
                    if (typeof msg.btn === 'number' && msg.btn >= 0 && msg.btn <= 9) {
                        this.emit('input', msg);
                    }
                    break;

                case 'video_frame':
                    if (typeof msg.dataUrl === 'string' && /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(msg.dataUrl)) {
                        this.emit('videoFrame', msg.dataUrl);
                    }
                    break;

                case 'rtc_offer':
                    if (this.role === 'guest') {
                        this.handleGuestOffer(msg);
                    }
                    break;

                case 'rtc_answer':
                    if (this.role === 'host' && this.pc) {
                        this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                            .then(() => this.flushIce())
                            .catch(() => {});
                    }
                    break;

                case 'rtc_ice':
                    if (msg.candidate && this.pc) {
                        if (this.pc.remoteDescription) {
                            this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(() => {});
                        } else {
                            this.pendingIce.push(msg.candidate);
                        }
                    }
                    break;

                case 'ping':
                    if (msg.relay) {
                        this.wsSend({ type: 'pong', relay: true, ts: msg.ts, targetId: msg.fromId });
                    }
                    break;

                case 'pong':
                    if (msg.relay && msg.ts) {
                        const rtt = Math.max(1, Date.now() - msg.ts);
                        this.emit('latency', rtt);
                    }
                    break;
            }
        }

        async flushIce() {
            while (this.pendingIce.length > 0 && this.pc) {
                const c = this.pendingIce.shift();
                try {
                    await this.pc.addIceCandidate(new RTCIceCandidate(c));
                } catch (e) {}
            }
        }

        async startHostWebRTC(targetId) {
            try {
                if (this.pc) {
                    try { this.pc.close(); } catch (e) {}
                }
                this.pendingIce = [];
                this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

                // Attach emulator video + audio stream
                if (typeof this.getStream === 'function') {
                    const stream = this.getStream();
                    if (stream) {
                        stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
                    }
                }

                // Low-latency unordered DataChannel for P2 inputs & ping
                this.dc = this.pc.createDataChannel('inputs', { ordered: false, maxRetransmits: 0 });
                this.setupDataChannel(this.dc);

                this.pc.onicecandidate = (ev) => {
                    if (ev.candidate) {
                        this.wsSend({ type: 'rtc_ice', targetId, candidate: ev.candidate });
                    }
                };

                this.pc.onconnectionstatechange = () => {
                    const state = this.pc ? this.pc.connectionState : 'closed';
                    if (state === 'connected') {
                        if (this.iceWatchdog) {
                            clearTimeout(this.iceWatchdog);
                            this.iceWatchdog = null;
                        }
                        this.stopRelayStream();
                        this.transport = 'p2p';
                        this.emit('status', 'P2P LIVE');
                        this.startPing();
                    } else if (state === 'failed' || state === 'disconnected') {
                        if (this.connected && this.transport !== 'relay') {
                            this.enableRelayFallback();
                        }
                    }
                };

                // Fallback to WebSocket frame relay if P2P ICE fails behind strict mobile NAT
                if (this.iceWatchdog) clearTimeout(this.iceWatchdog);
                this.iceWatchdog = setTimeout(() => {
                    if (this.connected && this.transport !== 'p2p') {
                        this.enableRelayFallback();
                    }
                }, 4500);

                const offer = await this.pc.createOffer();
                await this.pc.setLocalDescription(offer);
                this.wsSend({ type: 'rtc_offer', targetId, sdp: this.pc.localDescription });
            } catch (err) {
                console.warn('[Netplay] WebRTC unavailable, using WS relay:', err);
                this.enableRelayFallback();
            }
        }

        async handleGuestOffer(msg) {
            try {
                if (this.pc) {
                    try { this.pc.close(); } catch (e) {}
                }
                this.pendingIce = [];
                this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

                this.pc.ontrack = (ev) => {
                    if (ev.streams && ev.streams[0]) {
                        this.emit('remoteStream', ev.streams[0]);
                    }
                };

                this.pc.ondatachannel = (ev) => {
                    this.dc = ev.channel;
                    this.setupDataChannel(this.dc);
                };

                this.pc.onicecandidate = (ev) => {
                    if (ev.candidate) {
                        this.wsSend({ type: 'rtc_ice', candidate: ev.candidate });
                    }
                };

                this.pc.onconnectionstatechange = () => {
                    const state = this.pc ? this.pc.connectionState : 'closed';
                    if (state === 'connected') {
                        this.connected = true;
                        this.transport = 'p2p';
                        this.emit('status', 'P2P LIVE');
                        this.startPing();
                    }
                };

                await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                await this.flushIce();
                const answer = await this.pc.createAnswer();
                await this.pc.setLocalDescription(answer);
                this.wsSend({ type: 'rtc_answer', sdp: this.pc.localDescription });
            } catch (err) {
                console.warn('[Netplay] Guest WebRTC error, waiting for relay:', err);
                this.connected = true;
                this.transport = 'relay';
                this.emit('status', 'RELAY LIVE');
                this.startPing();
            }
        }

        setupDataChannel(dc) {
            dc.onopen = () => {
                if (this.iceWatchdog) {
                    clearTimeout(this.iceWatchdog);
                    this.iceWatchdog = null;
                }
                this.stopRelayStream();
                this.connected = true;
                this.transport = 'p2p';
                this.emit('status', 'P2P LIVE');
                this.startPing();
            };
            dc.onmessage = (ev) => {
                try {
                    const data = JSON.parse(ev.data);
                    if (data.t === 'in') {
                        this.emit('input', { player: data.p || 2, btn: data.b, pressed: !!data.d });
                    } else if (data.t === 'ping') {
                        dc.send(JSON.stringify({ t: 'pong', ts: data.ts }));
                    } else if (data.t === 'pong' && data.ts) {
                        this.emit('latency', Math.max(1, Date.now() - data.ts));
                    }
                } catch (e) {}
            };
        }

        enableRelayFallback() {
            if (!this.connected) return;
            this.transport = 'relay';
            this.emit('status', 'RELAY LIVE');
            this.startPing();
            if (this.role === 'host' && typeof this.getCanvas === 'function' && !this.relayTimer) {
                this.relayTimer = setInterval(() => {
                    if (!this.connected || this.transport !== 'relay') {
                        this.stopRelayStream();
                        return;
                    }
                    const canvas = this.getCanvas();
                    if (!canvas) return;
                    try {
                        const dataUrl = canvas.toDataURL('image/webp', 0.65);
                        this.wsSend({ type: 'video_frame', dataUrl });
                    } catch (e) {}
                }, 40); // ~25 FPS fallback relay
            }
        }

        stopRelayStream() {
            if (this.relayTimer) {
                clearInterval(this.relayTimer);
                this.relayTimer = null;
            }
        }

        startPing() {
            this.stopPing();
            this.pingTimer = setInterval(() => {
                if (!this.connected) return;
                if (this.dc && this.dc.readyState === 'open') {
                    try {
                        this.dc.send(JSON.stringify({ t: 'ping', ts: Date.now() }));
                        return;
                    } catch (e) {}
                }
                this.wsSend({ type: 'ping', relay: true, ts: Date.now() });
            }, 2000);
        }

        stopPing() {
            if (this.pingTimer) {
                clearInterval(this.pingTimer);
                this.pingTimer = null;
            }
        }
    }

    global.NexusNetplay = new NexusNetplayClient();
})(window);
