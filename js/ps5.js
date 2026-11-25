// PlayStation 5 Retro Arcade - Interactive Dashboard & Ambient Engine
(function() {
    'use strict';

    // ========================================================
    // 1. Comprehensive Game Library (17 Retro Classics)
    // ========================================================
    const GAMES = [
        {
            id: 'super-tilt-bro',
            title: 'Super Tilt Bro',
            sub: 'Smash Bros Platform Fighter',
            system: 'FIGHTING',
            rom: 'roms/super-tilt-bro.nes',
            icon: '🥊',
            color: '#e63946',
            gradient: 'radial-gradient(circle at 60% 20%, #4a0e17 0%, #050811 75%)',
            desc: 'The renowned 2D platform brawler! Choose your fighter, unleash specials, recover with airdashes, and knock opponents clean out of the arena with tournament-grade physics.',
            rating: '4.9 ★★★★★',
            plat: 1, gold: 3, silver: 5, bronze: 12,
            completion: 94
        },
        {
            id: 'sgt-helmet',
            title: 'Sgt. Helmet: Commando',
            sub: 'Contra Style Military Action',
            system: 'ACTION',
            rom: 'roms/sgthelmet.nes',
            icon: '🎖️',
            color: '#2b9348',
            gradient: 'radial-gradient(circle at 60% 20%, #123d1e 0%, #050811 75%)',
            desc: 'Action-packed military infiltration commando tribute! Take down enemy squads, dodge minefields, and rescue hostages deep behind enemy lines.',
            rating: '4.8 ★★★★★',
            plat: 1, gold: 2, silver: 6, bronze: 10,
            completion: 82
        },
        {
            id: 'nova-squirrel',
            title: 'Nova the Squirrel',
            sub: 'Super Mario World Platformer',
            system: 'PLATFORMER',
            rom: 'roms/novathesquirrel.nes',
            icon: '🐿️',
            color: '#fb8500',
            gradient: 'radial-gradient(circle at 60% 20%, #5a2e00 0%, #050811 75%)',
            desc: 'Vibrant action platformer inspired by 16-bit classics! Copy enemy abilities, discover secret exits, and explore massive handcrafted worlds with clever puzzles.',
            rating: '5.0 ★★★★★',
            plat: 1, gold: 4, silver: 8, bronze: 14,
            completion: 78
        },
        {
            id: 'flappy-bird',
            title: 'Flappy Bird Retro',
            sub: 'Viral Arcade Reflex Challenge',
            system: 'ARCADE',
            rom: 'roms/flappybird.nes',
            icon: '🐤',
            color: '#52b788',
            gradient: 'radial-gradient(circle at 60% 20%, #15412c 0%, #050811 75%)',
            desc: 'The world-famous viral arcade sensation ported natively to 8-bit console hardware! Tap with precision rhythm to thread through green pipes.',
            rating: '4.7 ★★★★☆',
            plat: 1, gold: 1, silver: 3, bronze: 8,
            completion: 65
        },
        {
            id: 'twin-dragons',
            title: 'Twin Dragons',
            sub: 'High-Production Action Quest',
            system: 'PLATFORMER',
            rom: 'roms/twindragons.nes',
            icon: '🐉',
            color: '#3a0ca3',
            gradient: 'radial-gradient(circle at 60% 20%, #1c0651 0%, #050811 75%)',
            desc: 'Critically acclaimed platform adventure featuring Dinky and Minky on an epic mission to rescue stolen dragon eggs. Superb animation and multi-phase boss fights.',
            rating: '4.9 ★★★★★',
            plat: 1, gold: 4, silver: 7, bronze: 15,
            completion: 90
        },
        {
            id: 'the-mad-wizard',
            title: 'The Mad Wizard',
            sub: 'Metroidvania Exploration Quest',
            system: 'ADVENTURE',
            rom: 'roms/themadwizard.nes',
            icon: '🧙',
            color: '#6a0dad',
            gradient: 'radial-gradient(circle at 60% 20%, #350657 0%, #050811 75%)',
            desc: 'Enthralling open-ended fantasy Metroidvania! Cast spells, levitate across chasms, unlock ancient artifacts, and reclaim your wizard territory from dark forces.',
            rating: '4.8 ★★★★★',
            plat: 1, gold: 3, silver: 5, bronze: 11,
            completion: 71
        },
        {
            id: 'super-pakpak',
            title: 'Super PakPak',
            sub: 'Pac-Man Dot Munching Arcade',
            system: 'ARCADE',
            rom: 'roms/superpakpak.nes',
            icon: '🟡',
            color: '#ffd166',
            gradient: 'radial-gradient(circle at 60% 20%, #524016 0%, #050811 75%)',
            desc: 'Classic maze navigation and dot-eating retro arcade action! Dodge prowling ghosts, snatch power pellets, and clear maze after maze at breakneck speeds.',
            rating: '4.8 ★★★★★',
            plat: 1, gold: 2, silver: 4, bronze: 9,
            completion: 88
        },
        {
            id: 'invaders',
            title: 'Invaders',
            sub: 'Space Invaders Galactic Defense',
            system: 'SHOOTER',
            rom: 'roms/invaders.nes',
            icon: '👾',
            color: '#118ab2',
            gradient: 'radial-gradient(circle at 60% 20%, #083c4e 0%, #050811 75%)',
            desc: 'The iconic alien defense war! Shield behind destructible bunkers, time your laser shots, and intercept descending extraterrestrial armadas wave by wave.',
            rating: '4.7 ★★★★☆',
            plat: 1, gold: 2, silver: 5, bronze: 12,
            completion: 80
        },
        {
            id: 'driar',
            title: 'Driar',
            sub: '38-Level Star Quest Platformer',
            system: 'PUZZLE',
            rom: 'roms/driar.nes',
            icon: '⭐',
            color: '#00b4d8',
            gradient: 'radial-gradient(circle at 60% 20%, #004553 0%, #050811 75%)',
            desc: 'Charming puzzle-platformer featuring ingenious screen-wrapping wrap-around mechanics and 38 handcrafted levels filled with mind-bending challenges.',
            rating: '4.9 ★★★★★',
            plat: 1, gold: 3, silver: 6, bronze: 10,
            completion: 85
        },
        {
            id: 'virus-cleaner',
            title: 'Virus Cleaner',
            sub: 'Dr. Mario Style Medical Puzzle',
            system: 'PUZZLE',
            rom: 'roms/viruscleaner.nes',
            icon: '💊',
            color: '#ef476f',
            gradient: 'radial-gradient(circle at 60% 20%, #521423 0%, #050811 75%)',
            desc: 'Falling-pill color-matching puzzle game! Line up matching medicine capsules to eradicate stubborn viruses inside the console memory.',
            rating: '4.8 ★★★★★',
            plat: 1, gold: 2, silver: 5, bronze: 11,
            completion: 75
        },
        {
            id: 'super-uwol',
            title: 'Super Uwol',
            sub: 'Coin Snatching Castle Quest',
            system: 'PLATFORMER',
            rom: 'roms/superuwol.nes',
            icon: '💰',
            color: '#f39c12',
            gradient: 'radial-gradient(circle at 60% 20%, #593905 0%, #050811 75%)',
            desc: 'Fast-paced arcade coin hunting through mysterious haunted mansion vaults! Collect all gold coins before the spooky ghouls catch up with you.',
            rating: '4.8 ★★★★★',
            plat: 1, gold: 2, silver: 6, bronze: 10,
            completion: 70
        },
        {
            id: 'blaster',
            title: 'Blaster',
            sub: 'Sci-Fi Rapid Fire Shoot Em Up',
            system: 'SHOOTER',
            rom: 'roms/blaster.nes',
            icon: '⚡',
            color: '#e74c3c',
            gradient: 'radial-gradient(circle at 60% 20%, #521913 0%, #050811 75%)',
            desc: 'High-octane science fiction shoot-em-up! Dodge incoming bullet curtains and decimate alien battleships in frantic arcade combat.',
            rating: '4.7 ★★★★☆',
            plat: 1, gold: 3, silver: 4, bronze: 8,
            completion: 60
        },
        {
            id: 'the-invasion',
            title: 'The Invasion',
            sub: 'Deep Space Alien Fleet Defense',
            system: 'SHOOTER',
            rom: 'roms/theinvasion.nes',
            icon: '🛸',
            color: '#8338ec',
            gradient: 'radial-gradient(circle at 60% 20%, #3e1279 0%, #050811 75%)',
            desc: 'Defend your deep space forward outpost against 14 escalating waves of high-speed extraterrestrial invaders.',
            rating: '4.6 ★★★★☆',
            plat: 1, gold: 1, silver: 3, bronze: 9,
            completion: 55
        },
        {
            id: 'c-room',
            title: 'C-Room',
            sub: 'Dungeon Maze & Escape',
            system: 'ADVENTURE',
            rom: 'roms/croom.nes',
            icon: '🗝️',
            color: '#06d6a0',
            gradient: 'radial-gradient(circle at 60% 20%, #024835 0%, #050811 75%)',
            desc: 'Navigate subterranean labyrinth rooms, discover cryptic keys, disarm hidden floor triggers, and escape the dungeon.',
            rating: '4.7 ★★★★☆',
            plat: 1, gold: 2, silver: 4, bronze: 8,
            completion: 68
        },
        {
            id: 'debris-dodger',
            title: 'Debris Dodger',
            sub: 'High-Speed Reflex Evasion',
            system: 'ARCADE',
            rom: 'roms/debrisdodger.nes',
            icon: '🚀',
            color: '#ff0054',
            gradient: 'radial-gradient(circle at 60% 20%, #5e001f 0%, #050811 75%)',
            desc: 'Intense arcade reflex game! Steer through an overwhelming asteroid storm moving at hypersonic velocity.',
            rating: '4.8 ★★★★★',
            plat: 1, gold: 3, silver: 5, bronze: 10,
            completion: 92
        },
        {
            id: 'starter-quest',
            title: 'Starter Quest',
            sub: 'Classic 2D Action Platformer',
            system: 'PLATFORMER',
            rom: 'roms/starter_kit.nes',
            icon: '🏰',
            color: '#4361ee',
            gradient: 'radial-gradient(circle at 60% 20%, #15256e 0%, #050811 75%)',
            desc: 'Pure retro platforming challenge with precision jumping, moving platforms, and treacherous spike pits.',
            rating: '4.7 ★★★★☆',
            plat: 1, gold: 2, silver: 4, bronze: 7,
            completion: 64
        },
        {
            id: 'pong-1k',
            title: 'Pong 1K',
            sub: 'The Grandfather of Video Games',
            system: 'ARCADE',
            rom: 'roms/pong1k.nes',
            icon: '🏓',
            color: '#e2eafc',
            gradient: 'radial-gradient(circle at 60% 20%, #202b44 0%, #050811 75%)',
            desc: 'The original 1972 table tennis arcade simulation that launched the entire interactive entertainment industry.',
            rating: '4.9 ★★★★★',
            plat: 1, gold: 1, silver: 2, bronze: 5,
            completion: 100
        }
    ];

    // ========================================================
    // 2. PlayStation 5 Synthesized Web Audio Sound System
    // ========================================================
    class PS5AudioEngine {
        constructor() {
            this.ctx = null;
            this.enabled = localStorage.getItem('ps5_sound') !== 'false';
        }

        init() {
            if (this.ctx) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            } catch (e) {}
        }

        toggleSound() {
            this.enabled = !this.enabled;
            localStorage.setItem('ps5_sound', this.enabled);
            return this.enabled;
        }

        playFocus() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(540, now);
                osc.frequency.exponentialRampToValueAtTime(820, now + 0.07);

                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.07);
            } catch (e) {}
        }

        playLaunch() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                // PS5 chord sound: Root + 5th + Octave (C4, G4, C5)
                const freqs = [261.63, 392.00, 523.25];
                freqs.forEach((f, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(f, now + idx * 0.04);
                    osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.45);

                    gain.gain.setValueAtTime(0.07, now + idx * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.04);
                    osc.stop(now + 0.45);
                });
            } catch (e) {}
        }

        playBack() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);

                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.09);
            } catch (e) {}
        }

        playDrawer() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);

                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            } catch (e) {}
        }
    }

    const psSound = new PS5AudioEngine();

    // ========================================================
    // 3. Ambient Particle & PlayStation Glyphs Canvas Engine
    // ========================================================
    class AmbientCanvas {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.numParticles = 50;
            this.mouse = { x: -1000, y: -1000 };
            this.symbols = ['✕', '○', '□', '△'];
            this.colors = [
                'rgba(0, 112, 209, 0.45)', // PS Blue
                'rgba(230, 46, 82, 0.45)',  // Red / Circle
                'rgba(0, 170, 102, 0.45)',  // Green / Triangle
                'rgba(255, 85, 187, 0.45)', // Pink / Square
                'rgba(255, 255, 255, 0.35)' // Star white
            ];

            this.resize();
            this.initParticles();
            this.bindEvents();
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        resize() {
            if (!this.canvas) return;
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
        }

        initParticles() {
            this.particles = [];
            for (let i = 0; i < this.numParticles; i++) {
                const isGlyph = Math.random() < 0.35;
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4 - 0.15,
                    size: isGlyph ? (10 + Math.random() * 12) : (1.5 + Math.random() * 2.5),
                    alpha: 0.15 + Math.random() * 0.4,
                    alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    isGlyph: isGlyph,
                    symbol: this.symbols[Math.floor(Math.random() * this.symbols.length)],
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.02
                });
            }
        }

        bindEvents() {
            window.addEventListener('resize', () => {
                this.resize();
            });
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            window.addEventListener('mouseleave', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            });
        }

        animate() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.width, this.height);

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Mouse interaction repulsion
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    p.x += (dx / dist) * force * 1.5;
                    p.y += (dy / dist) * force * 1.5;
                }

                // Normal drift
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.rotSpeed;

                // Pulsate alpha
                p.alpha += p.alphaSpeed;
                if (p.alpha > 0.65 || p.alpha < 0.15) {
                    p.alphaSpeed = -p.alphaSpeed;
                }

                // Wrap boundaries
                if (p.x < -30) p.x = this.width + 30;
                if (p.x > this.width + 30) p.x = -30;
                if (p.y < -30) p.y = this.height + 30;
                if (p.y > this.height + 30) p.y = -30;

                // Render particle
                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0.05, Math.min(1, p.alpha));
                if (p.isGlyph) {
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate(p.rot);
                    this.ctx.font = `bold ${Math.floor(p.size)}px -apple-system, BlinkMacSystemFont, sans-serif`;
                    this.ctx.fillStyle = p.color;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(p.symbol, 0, 0);
                } else {
                    this.ctx.fillStyle = p.color;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.restore();
            }

            requestAnimationFrame(this.animate);
        }
    }

    // Initialize Ambient Canvas
    const ambientBg = new AmbientCanvas('ps5AmbientCanvas');

    // ========================================================
    // 4. UI State Management
    // ========================================================
    let activeFilter = 'all';
    let focusedIndex = 0;
    let searchQuery = '';
    let filteredGames = [...GAMES];
    let sessionSeconds = 120; // 2 minutes starting point

    // DOM Elements
    const track = document.getElementById('ps5CarouselTrack');
    const heroTitle = document.getElementById('ps5HeroTitle');
    const heroDesc = document.getElementById('ps5HeroDesc');
    const heroSystemBadge = document.getElementById('ps5SystemBadge');
    const heroExtraTag = document.getElementById('ps5ExtraTag');
    const heroRating = document.getElementById('ps5HeroRating');
    const trophyPlat = document.getElementById('ps5TrophyPlat');
    const trophyGold = document.getElementById('ps5TrophyGold');
    const trophySilver = document.getElementById('ps5TrophySilver');
    const trophyBronze = document.getElementById('ps5TrophyBronze');
    const trophyCompletion = document.getElementById('ps5TrophyCompletion');
    const activityBar = document.getElementById('ps5ActivityBar');
    const playtimeEl = document.getElementById('ps5Playtime');
    const btnPlayHero = document.getElementById('btnPlayHero');
    const btnFullscreenHero = document.getElementById('btnFullscreenHero');
    const btnOpenDrawerHero = document.getElementById('btnOpenDrawerHero');
    const btnFooterQuickMenu = document.getElementById('btnFooterQuickMenu');
    const btnProfilePill = document.getElementById('btnProfilePill');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    const quickDrawer = document.getElementById('ps5QuickDrawer');
    const btnToggleSound = document.getElementById('btnToggleSound');
    const cinemaModal = document.getElementById('ps5CinemaModal');
    const cinemaFrame = document.getElementById('ps5CinemaFrame');
    const cinemaTitle = document.getElementById('ps5CinemaTitle');
    const btnCloseCinema = document.getElementById('btnCloseCinema');
    const btnFullscreenCinema = document.getElementById('btnFullscreenCinema');
    const clockEl = document.getElementById('ps5Clock');
    const searchInput = document.getElementById('ps5SearchInput');
    const filterChips = document.querySelectorAll('.ps5-filter-chip');
    const themeChips = document.querySelectorAll('.ps5-theme-chip');

    // Restore saved theme
    const savedTheme = localStorage.getItem('ps5_theme') || 'default';
    if (savedTheme && savedTheme !== 'default') {
        document.body.className = savedTheme;
    }
    themeChips.forEach(chip => {
        chip.classList.toggle('active', chip.dataset.theme === savedTheme);
    });

    // Restore sound button state
    if (btnToggleSound) {
        btnToggleSound.textContent = psSound.enabled ? '🔊 Sound: ON' : '🔇 Sound: MUTED';
    }

    // ========================================================
    // 5. Real-time Clock & Playtime Counter
    // ========================================================
    function updateClock() {
        if (!clockEl) return;
        const now = new Date();
        let hours = now.getHours();
        const mins = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        clockEl.textContent = `${hours}:${mins} ${ampm}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    function updatePlaytime() {
        sessionSeconds++;
        const hrs = Math.floor(sessionSeconds / 3600);
        const mins = Math.floor((sessionSeconds % 3600) / 60);
        if (playtimeEl) {
            playtimeEl.textContent = `${hrs}h ${String(mins).padStart(2, '0')}m`;
        }
    }
    setInterval(updatePlaytime, 1000);

    // ========================================================
    // 6. Render Carousel Cards & 3D Interactive Tilt
    // ========================================================
    function renderCarousel() {
        if (!track) return;
        track.innerHTML = '';

        if (filteredGames.length === 0) {
            track.innerHTML = `
                <div style="padding: 40px 20px; color: var(--ps-text-dim); font-size: 14px; text-align: center; width: 100%;">
                    🔍 No games found matching "${searchQuery}". Press Esc or clear search to reset.
                </div>
            `;
            return;
        }

        filteredGames.forEach((g, idx) => {
            const card = document.createElement('div');
            card.className = `ps5-card ${idx === focusedIndex ? 'focused' : ''}`;
            card.dataset.id = g.id;
            card.dataset.index = idx;
            card.style.background = `linear-gradient(145deg, rgba(16, 24, 44, 0.95), ${g.color}33)`;

            card.innerHTML = `
                <div class="ps5-card-sheen"></div>
                <div class="ps5-card-header">
                    <span class="ps5-card-system">${g.system}</span>
                </div>
                <div class="ps5-card-icon">${g.icon}</div>
                <div class="ps5-card-footer">
                    <div class="ps5-card-title">${g.title}</div>
                    <div class="ps5-card-sub">${g.sub}</div>
                </div>
            `;

            // Interactive 3D Parallax Tilt & Sheen Reflection
            const sheen = card.querySelector('.ps5-card-sheen');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                const rotX = -y * 18;
                const rotY = x * 18;
                card.style.transform = `perspective(600px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.08) translateY(-6px)`;
                if (sheen) {
                    const sheenX = ((x + 0.5) * 100).toFixed(1);
                    const sheenY = ((y + 0.5) * 100).toFixed(1);
                    sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.35) 0%, transparent 65%)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                if (sheen) {
                    sheen.style.background = '';
                }
            });

            // Single tap selects/previews; second tap launches
            card.addEventListener('click', () => {
                if (focusedIndex === idx) {
                    launchGame(filteredGames[idx]);
                } else {
                    focusGame(idx, true);
                }
            });

            track.appendChild(card);
        });

        // Ensure focused card updates hero
        if (filteredGames.length > 0) {
            updateHero(filteredGames[focusedIndex]);
        }
    }

    // ========================================================
    // 7. Focus Game & Hero Updating
    // ========================================================
    function focusGame(idx, playSound = false) {
        if (idx < 0 || idx >= filteredGames.length) return;
        focusedIndex = idx;

        const cards = track.querySelectorAll('.ps5-card');
        cards.forEach((c, i) => {
            c.classList.toggle('focused', i === idx);
        });

        const targetCard = cards[idx];
        if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        const game = filteredGames[idx];
        updateHero(game);

        if (playSound) {
            psSound.playFocus();
        }
    }

    function updateHero(game) {
        if (!game) return;
        if (heroTitle) heroTitle.textContent = game.title;
        if (heroDesc) heroDesc.textContent = game.desc;
        if (heroSystemBadge) heroSystemBadge.textContent = game.system;
        if (heroExtraTag) heroExtraTag.textContent = `${game.sub} • 60 FPS • Stereo`;
        if (heroRating) heroRating.textContent = game.rating || '★ 4.9';

        // Trophies & Activity
        if (trophyPlat) trophyPlat.textContent = game.plat || 1;
        if (trophyGold) trophyGold.textContent = game.gold || 3;
        if (trophySilver) trophySilver.textContent = game.silver || 5;
        if (trophyBronze) trophyBronze.textContent = game.bronze || 10;
        if (trophyCompletion) trophyCompletion.textContent = `${game.completion || 80}% Unlocked`;
        if (activityBar) activityBar.style.width = `${game.completion || 80}%`;

        // Update ambient background gradient
        const dashboard = document.querySelector('.ps5-dashboard');
        if (dashboard && game.gradient) {
            dashboard.style.background = game.gradient;
        }
    }

    // ========================================================
    // 8. Launch Game in Cinema Viewport
    // ========================================================
    function launchGame(game) {
        if (!game) return;
        psSound.playLaunch();

        if (cinemaTitle) cinemaTitle.textContent = `${game.title} [${game.system}]`;
        if (cinemaFrame) {
            cinemaFrame.src = `player.html?rom=${encodeURIComponent(game.rom)}`;
        }
        if (cinemaModal) {
            cinemaModal.classList.add('open');
        }
    }

    function closeCinema() {
        psSound.playBack();
        if (cinemaModal) {
            cinemaModal.classList.remove('open');
        }
        if (cinemaFrame) {
            cinemaFrame.src = 'about:blank';
        }
    }

    // ========================================================
    // 9. Quick Control Center Drawer
    // ========================================================
    function toggleDrawer(forceState) {
        if (!quickDrawer) return;
        const willOpen = forceState !== undefined ? forceState : !quickDrawer.classList.contains('open');
        if (willOpen) {
            quickDrawer.classList.add('open');
            psSound.playDrawer();
        } else {
            quickDrawer.classList.remove('open');
            psSound.playBack();
        }
    }

    if (btnOpenDrawerHero) btnOpenDrawerHero.addEventListener('click', () => toggleDrawer(true));
    if (btnFooterQuickMenu) btnFooterQuickMenu.addEventListener('click', () => toggleDrawer());
    if (btnProfilePill) btnProfilePill.addEventListener('click', () => toggleDrawer());
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', () => toggleDrawer(false));

    // Console Theme Switching
    themeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const theme = chip.dataset.theme;
            themeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            if (theme === 'default') {
                document.body.className = '';
            } else {
                document.body.className = theme;
            }
            localStorage.setItem('ps5_theme', theme);
            psSound.playFocus();
        });
    });

    // Sound Toggle Button
    if (btnToggleSound) {
        btnToggleSound.addEventListener('click', () => {
            const isEnabled = psSound.toggleSound();
            btnToggleSound.textContent = isEnabled ? '🔊 Sound: ON' : '🔇 Sound: MUTED';
            if (isEnabled) psSound.playFocus();
        });
    }

    // ========================================================
    // 10. Instant Search & Category Filtering
    // ========================================================
    function applyFilterAndSearch() {
        filteredGames = GAMES.filter(g => {
            const matchesFilter = (activeFilter === 'all') || (g.system.toLowerCase() === activeFilter.toLowerCase());
            const matchesSearch = !searchQuery || 
                g.title.toLowerCase().includes(searchQuery) ||
                g.sub.toLowerCase().includes(searchQuery) ||
                g.desc.toLowerCase().includes(searchQuery);
            return matchesFilter && matchesSearch;
        });

        focusedIndex = 0;
        renderCarousel();
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.dataset.filter;
            applyFilterAndSearch();
            psSound.playFocus();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            applyFilterAndSearch();
        });

        // Clear search on Escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchQuery = '';
                applyFilterAndSearch();
                searchInput.blur();
            }
        });
    }

    // ========================================================
    // 11. Buttons & Keyboard Navigation
    // ========================================================
    if (btnPlayHero) {
        btnPlayHero.addEventListener('click', () => {
            if (filteredGames[focusedIndex]) {
                launchGame(filteredGames[focusedIndex]);
            }
        });
    }

    if (btnFullscreenHero) {
        btnFullscreenHero.addEventListener('click', () => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            }
        });
    }

    if (btnCloseCinema) btnCloseCinema.addEventListener('click', closeCinema);

    if (btnFullscreenCinema) {
        btnFullscreenCinema.addEventListener('click', () => {
            if (cinemaFrame.requestFullscreen) {
                cinemaFrame.requestFullscreen();
            } else if (cinemaFrame.webkitRequestFullscreen) {
                cinemaFrame.webkitRequestFullscreen();
            }
        });
    }

    // PS5 Keyboard Navigation
    window.addEventListener('keydown', (e) => {
        // If typing in search, let it type unless Escape
        if (document.activeElement === searchInput) {
            return;
        }

        // If in cinema modal
        if (cinemaModal && cinemaModal.classList.contains('open')) {
            if (e.key === 'Escape') {
                closeCinema();
            }
            return;
        }

        // If drawer is open
        if (quickDrawer && quickDrawer.classList.contains('open')) {
            if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
                toggleDrawer(false);
            }
            return;
        }

        if (e.key === '/' || e.key === 's' && e.ctrlKey) {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
            return;
        }

        if (e.key === 'q' || e.key === 'Q') {
            toggleDrawer(true);
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'KeyD') {
            if (focusedIndex < filteredGames.length - 1) {
                focusGame(focusedIndex + 1, true);
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
            if (focusedIndex > 0) {
                focusGame(focusedIndex - 1, true);
            }
        } else if (e.key === 'Enter' || e.key === 'Space') {
            e.preventDefault();
            if (filteredGames[focusedIndex]) {
                launchGame(filteredGames[focusedIndex]);
            }
        }
    });

    // Initial render
    renderCarousel();

})();
