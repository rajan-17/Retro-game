// Headless simulated DOM environment to catch runtime errors
const fs = require('fs');

global.window = global;
global.addEventListener = () => {};
global.window.addEventListener = () => {};
global.document = {
    getElementById: (id) => {
        if (id === 'gameCanvas') {
            return {
                getContext: () => ({
                    fillRect: () => {},
                    fillText: () => {},
                    strokeRect: () => {},
                    createImageData: () => ({ data: new Uint8Array(256 * 240 * 4) }),
                    putImageData: () => {},
                    drawImage: () => {},
                    save: () => {},
                    restore: () => {},
                    beginPath: () => {},
                    arc: () => {},
                    fill: () => {},
                    stroke: () => {}
                }),
                addEventListener: () => {},
                width: 800,
                height: 448
            };
        }
        return {
            addEventListener: () => {},
            classList: { toggle: () => {} },
            getAttribute: () => 'roms/starter_kit.nes',
            value: 'roms/starter_kit.nes',
            dataset: {},
            style: {},
            innerHTML: ''
        };
    },
    querySelectorAll: () => [],
    querySelector: () => ({ innerHTML: "", style: {} }),
    createElement: () => ({
        getContext: () => ({
            putImageData: () => {}
        }),
        width: 256,
        height: 240
    }),
    addEventListener: () => {},
    head: { appendChild: () => {} },
    body: { appendChild: () => {} }
};

global.localStorage = {
    getItem: () => '0',
    setItem: () => {}
};

global.AudioContext = function() {};
global.requestAnimationFrame = (cb) => { /* single frame */ };

const files = [
    'js/config.js',
    'js/audio.js',
    'js/games/emulator_wrapper.js',
    'js/hub.js'
];

console.log("=== SIMULATING RETRO NES CONSOLE IN NODEJS ===");

for (const file of files) {
    try {
        const code = fs.readFileSync('/home/ubuntu/ascii-platformer/' + file, 'utf8');
        eval(code);
        console.log("  ✓ Loaded:", file);
    } catch (err) {
        console.error("  ✗ ERROR LOADING", file, err);
        process.exit(1);
    }
}

try {
    const hub = eval("new ArcadeHub()");
    console.log("  ✓ new ArcadeHub() succeeded!");
    hub.start();
    console.log("  ✓ hub.start() succeeded!");

    hub.games.emulator.update(hub.input);
    hub.games.emulator.render();
    console.log("  ✓ hub.games.emulator update() & render() succeeded!");
    console.log("=== ALL SIMULATIONS PASSED WITHOUT ERRORS! ===");
} catch (err) {
    console.error("  ✗ RUNTIME ERROR IN ARCADE HUB:", err);
    process.exit(1);
}
