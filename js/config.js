// Game configuration and constants - Terminal Odyssey 2.0
const CONFIG = {
    // Canvas & Grid settings
    TILE_SIZE: 16,
    VIEW_WIDTH: 50,
    VIEW_HEIGHT: 28,
    
    // Physics parameters
    PHYSICS: {
        GRAVITY: 0.45,
        MAX_FALL_SPEED: 9.0,
        ACCELERATION: 0.55,
        DECELERATION: 0.70,
        AIR_ACCELERATION: 0.40,
        AIR_DECELERATION: 0.90,
        MAX_RUN_SPEED: 3.8,
        JUMP_FORCE: -7.8,
        DOUBLE_JUMP_FORCE: -7.0,
        TRIPLE_JUMP_FORCE: -6.6,
        SPRING_FORCE: -11.5,
        ENEMY_BOUNCE_FORCE: -7.5,
        COYOTE_TIME: 8,
        JUMP_BUFFER: 7,
        INVULNERABILITY_TIME: 70,
        
        // Combat & Ability parameters
        SLASH_DURATION: 12,     // Frames attack hitbox is active
        SLASH_COOLDOWN: 18,     // Frames between slashes
        SLASH_RANGE: 26,        // Pixel width of slash
        DASH_SPEED: 8.5,        // Speed during dash
        DASH_DURATION: 14,      // Duration of dash in frames
        DASH_COOLDOWN: 45,      // Frames between dashes
        PROJECTILE_SPEED: 6.5,  // Speed of blaster bolts
        MAGNET_RADIUS: 75       // Pixel radius for Coin Magnet perk
    },

    // Tile Legend
    TILES: {
        EMPTY: ' ',
        SOLID: '#',
        ONE_WAY: '=',
        SPIKE: '▲',
        SPIKE_DOWN: '▼',
        SPRING: '^',
        DOOR_CLOSED: 'D',
        DOOR_OPEN: '/',
        EXIT: 'E',
        COIN: '$',
        GEM: '♦',
        PLAYER_SPAWN: 'P',
        ENEMY_SLIME: 'w',
        ENEMY_FLYER: 'v',
        ENEMY_TURRET: 'T',
        BOSS_SPAWN: 'B'
    },

    // Shop Upgrade Catalog
    UPGRADES: [
        {
            id: 'heart',
            name: 'Heart Battery (+1 Max HP)',
            cost: 250,
            desc: 'Increases your maximum life hearts.',
            maxLevel: 3
        },
        {
            id: 'blade',
            name: 'Cyber Blade Mk II',
            cost: 350,
            desc: 'Increases slash range, damage & energy arc.',
            maxLevel: 2
        },
        {
            id: 'triple_jump',
            name: 'Phase Thrusters (Triple Jump)',
            cost: 450,
            desc: 'Unlocks a third mid-air leap.',
            maxLevel: 1
        },
        {
            id: 'magnet',
            name: 'Magnetic Coil',
            cost: 200,
            desc: 'Pulls nearby coins and gems directly to you.',
            maxLevel: 1
        },
        {
            id: 'overclock_dash',
            name: 'Hyper Dash Overclock',
            cost: 300,
            desc: 'Reduces dash cooldown and increases speed.',
            maxLevel: 2
        }
    ],

    // Visual Themes
    THEMES: {
        matrix: {
            name: "Matrix Green",
            bg: "#040b05",
            fg: "#26ff48",
            dim: "#0f4717",
            bright: "#a3ffb1",
            accent: "#ffee33",
            hazard: "#ff3344",
            border: "#188028",
            boss: "#ff0055"
        },
        amber: {
            name: "Amber CRT",
            bg: "#0c0802",
            fg: "#ffb020",
            dim: "#5c3a07",
            bright: "#ffe080",
            accent: "#ffd700",
            hazard: "#ff3a3a",
            border: "#a06010",
            boss: "#ff2200"
        },
        cyberpunk: {
            name: "Cyber Neon",
            bg: "#070312",
            fg: "#00f0ff",
            dim: "#2a1c47",
            bright: "#ffffff",
            accent: "#ff007f",
            hazard: "#ff0055",
            border: "#7000cc",
            boss: "#ff00aa"
        },
        gameboy: {
            name: "GameBoy Retro",
            bg: "#0f380f",
            fg: "#8bac0f",
            dim: "#306230",
            bright: "#9bbc0f",
            accent: "#9bbc0f",
            hazard: "#8bac0f",
            border: "#306230",
            boss: "#8bac0f"
        },
        classic: {
            name: "Monochrome White",
            bg: "#08080a",
            fg: "#e0e0e0",
            dim: "#40404c",
            bright: "#ffffff",
            accent: "#ffd700",
            hazard: "#ff4444",
            border: "#555566",
            boss: "#ff2244"
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

if (typeof window !== 'undefined') window.CONFIG = CONFIG;
