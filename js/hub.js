// Master Retro NES Console Hub Manager
class ArcadeHub {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.activeGameId = 'emulator';
        
        // Input state
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false, // NES Button A
            jumpJustPressed: false,
            slash: false, // NES Button B
            slashJustPressed: false,
            start: false,
            select: false
        };

        // Initialize NES Emulator
        this.games = {
            emulator: new (window.NesEmulator || NesEmulator)(this.canvas, this)
        };

        this.bindEvents();
        this.initSettingsToolbar();
    }

    bindEvents() {
        // Universal Keyboard mappings
        window.addEventListener('keydown', (e) => {
            Sound.init();
            if (e.repeat) return;

            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.input.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.input.right = true;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.input.up = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.input.down = true;
                    break;
                case 'Space':
                case 'KeyZ':
                case 'KeyK':
                    this.input.jump = true; // Button A
                    this.input.jumpJustPressed = true;
                    e.preventDefault();
                    break;
                case 'KeyX':
                case 'KeyJ':
                    this.input.slash = true; // Button B
                    this.input.slashJustPressed = true;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                case 'KeyC':
                    this.input.select = true; // Select
                    break;
                case 'Enter':
                case 'KeyP':
                    this.input.start = true; // Start
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.input.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.input.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.input.up = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.input.down = false;
                    break;
                case 'Space':
                case 'KeyZ':
                case 'KeyK':
                    this.input.jump = false;
                    break;
                case 'KeyX':
                case 'KeyJ':
                    this.input.slash = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                case 'KeyC':
                    this.input.select = false;
                    break;
                case 'Enter':
                case 'KeyP':
                    this.input.start = false;
                    break;
            }
        });

        // Touch & Mouse bindings for on-screen controller
        const bindTouch = (id, onDown, onUp) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const hDown = (e) => { e.preventDefault(); Sound.init(); onDown(); };
            const hUp = (e) => { e.preventDefault(); onUp(); };
            btn.addEventListener('touchstart', hDown, { passive: false });
            btn.addEventListener('touchend', hUp, { passive: false });
            btn.addEventListener('mousedown', hDown);
            btn.addEventListener('mouseup', hUp);
            btn.addEventListener('mouseleave', hUp);
        };

        // D-Pad
        bindTouch('btnLeft', () => { this.input.left = true; }, () => { this.input.left = false; });
        bindTouch('btnRight', () => { this.input.right = true; }, () => { this.input.right = false; });
        bindTouch('btnUp', () => { this.input.up = true; }, () => { this.input.up = false; });
        bindTouch('btnDown', () => { this.input.down = true; }, () => { this.input.down = false; });

        // Select & Start
        bindTouch('btnSelect', () => { this.input.select = true; }, () => { this.input.select = false; });
        bindTouch('btnStart', () => { this.input.start = true; }, () => { this.input.start = false; });

        // Action Buttons: B & A
        bindTouch('btnSlash', () => { this.input.slash = true; }, () => { this.input.slash = false; }); // B button
        bindTouch('btnJump', () => { this.input.jump = true; }, () => { this.input.jump = false; }); // A button
    }

    initSettingsToolbar() {
        // NES Cartridge Selector
        const romSelect = document.getElementById('romSelect');
        if (romSelect) {
            romSelect.addEventListener('change', (e) => {
                Sound.playClick();
                if (this.games.emulator) {
                    this.games.emulator.loadRomFromUrl(e.target.value);
                }
            });
        }

        // Theme Switcher
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                Sound.playClick();
                document.body.className = '';
                if (e.target.value !== 'matrix') {
                    document.body.classList.add('theme-' + e.target.value);
                }
            });
        }

        // Scanlines Toggle
        const toggleScanlines = document.getElementById('toggleScanlines');
        if (toggleScanlines) {
            toggleScanlines.addEventListener('click', () => {
                Sound.playClick();
                const active = document.body.classList.toggle('scanlines-disabled');
                toggleScanlines.textContent = active ? 'Scanlines: OFF' : 'Scanlines: ON';
                toggleScanlines.classList.toggle('active', !active);
            });
        }

        // Sound Toggle
        const toggleSound = document.getElementById('toggleSound');
        if (toggleSound) {
            toggleSound.addEventListener('click', () => {
                const s = Sound.toggleMute();
                toggleSound.textContent = s ? '🔊 Sound: ON' : '🔇 Sound: OFF';
                toggleSound.classList.toggle('active', s);
            });
        }
    }

    loop() {
        const emu = this.games.emulator;
        if (emu) {
            emu.update(this.input);
            emu.render();
        }

        this.input.jumpJustPressed = false;
        this.input.slashJustPressed = false;

        requestAnimationFrame(() => this.loop());
    }

    start() {
        if (this.games.emulator) {
            this.games.emulator.start();
        }
        this.loop();
    }
}

window.ArcadeHub = ArcadeHub;

// Robust Hub Initialization (handles both loading and already-loaded DOM)
function initHub() {
    if (window.ArcadeHubInstance) return;
    try {
        window.ArcadeHubInstance = new ArcadeHub();
        window.ArcadeHubInstance.start();
        console.log("Retro NES Console successfully started!");
    } catch (e) {
        console.error("Error starting Retro NES Console:", e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHub);
} else {
    initHub();
}
