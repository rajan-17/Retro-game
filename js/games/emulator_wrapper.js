// Web NES Emulator Wrapper using jsnes (with Lazy Dynamic Loading)
class NesEmulator {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.nes = null;
        this.romLoaded = false;
        this.running = false;
        this.loadingScript = false;

        // Frame buffer
        this.frameBuffer = new Uint32Array(256 * 240);
        this.imageData = this.ctx.createImageData(256, 240);
        this.imageBuffer = new Uint32Array(this.imageData.data.buffer);

        // Offscreen canvas for crisp pixel scaling
        this.offscreen = document.createElement('canvas');
        this.offscreen.width = 256;
        this.offscreen.height = 240;
        this.offCtx = this.offscreen.getContext('2d');

        // Web Audio for NES sound output
        this.audioCtx = null;
        this.audioBufferSize = 4096;
        this.audioBuffer = [];
    }

    ensureLoaded(callback) {
        if (typeof jsnes !== 'undefined') {
            if (!this.nes) this.createNesInstance();
            if (callback) callback();
            return;
        }

        if (this.loadingScript) return;
        this.loadingScript = true;

        const script = document.createElement('script');
        script.src = 'js/emulator/jsnes.min.js';
        script.onload = () => {
            this.loadingScript = false;
            this.createNesInstance();
            if (callback) callback();
        };
        script.onerror = () => {
            this.loadingScript = false;
            console.warn("Could not load jsnes library.");
        };
        if (document.head) document.head.appendChild(script);
        else if (document.body) document.body.appendChild(script);
    }

    createNesInstance() {
        if (typeof jsnes === 'undefined' || this.nes) return;

        this.nes = new jsnes.NES({
            onFrame: (frameBuffer) => {
                for (let i = 0; i < 256 * 240; i++) {
                    const pixel = frameBuffer[i];
                    this.imageBuffer[i] = 0xFF000000 | ((pixel & 0xFF) << 16) | (pixel & 0x00FF00) | ((pixel >> 16) & 0xFF);
                }
            },
            onAudioSample: (left, right) => {
                if (this.audioCtx && this.audioBuffer.length < this.audioBufferSize * 2) {
                    this.audioBuffer.push((left + right) * 0.5);
                }
            }
        });

        this.initAudio();
    }

    initAudio() {
        if (this.audioCtx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                // Don't force 44100 on iOS if hardware does not support it
                this.audioCtx = new AudioContext();
                const scriptNode = this.audioCtx.createScriptProcessor(this.audioBufferSize, 0, 1);
                scriptNode.onaudioprocess = (e) => {
                    const output = e.outputBuffer.getChannelData(0);
                    for (let i = 0; i < this.audioBufferSize; i++) {
                        output[i] = this.audioBuffer.shift() || 0;
                    }
                };
                scriptNode.connect(this.audioCtx.destination);
            }
        } catch (e) {
            console.warn("AudioContext init deferred or not supported:", e);
        }
    }

    loadRomFromUrl(url) {
        this.ensureLoaded(() => {
            fetch(url)
                .then(res => res.arrayBuffer())
                .then(buffer => {
                    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
                    this.nes.loadROM(binary);
                    this.romLoaded = true;
                    this.running = true;
                })
                .catch(err => {
                    console.error("Failed to load ROM:", err);
                });
        });
    }

    start() {
        this.ensureLoaded(() => {
            if (!this.romLoaded) {
                const romSelect = document.getElementById('romSelect');
                const romUrl = (romSelect && romSelect.value) ? romSelect.value : 'roms/starter_kit.nes';
                this.loadRomFromUrl(romUrl);
            }
            this.running = true;
        });
    }

    stop() {
        this.running = false;
    }

    update(input) {
        if (!this.running || !this.nes || typeof jsnes === 'undefined') return;

        const ctrl = jsnes.Controller;
        const setBtn = (btn, pressed) => {
            if (pressed) this.nes.buttonDown(1, btn);
            else this.nes.buttonUp(1, btn);
        };

        setBtn(ctrl.BUTTON_LEFT, input.left);
        setBtn(ctrl.BUTTON_RIGHT, input.right);
        setBtn(ctrl.BUTTON_UP, input.up);
        setBtn(ctrl.BUTTON_DOWN, input.down);
        setBtn(ctrl.BUTTON_A, input.jump);
        setBtn(ctrl.BUTTON_B, input.slash || input.shootJustPressed);
        setBtn(ctrl.BUTTON_START, input.start);
        setBtn(ctrl.BUTTON_SELECT, input.select);

        this.nes.frame();
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, w, h);

        if (!this.romLoaded) {
            ctx.fillStyle = '#26ff48';
            ctx.font = 'bold 16px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText("RETRO NES EMULATOR", w / 2, h / 2 - 25);
            ctx.font = '12px "Courier New", monospace';
            ctx.fillStyle = '#a3ffb1';
            ctx.fillText("Loading cartridge from menu above...", w / 2, h / 2 + 15);
            return;
        }

        this.offCtx.putImageData(this.imageData, 0, 0);

        const scale = Math.min(w / 256, h / 240);
        const dw = 256 * scale;
        const dh = 240 * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.offscreen, dx, dy, dw, dh);
    }
}

window.NesEmulator = NesEmulator;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NesEmulator;
}
