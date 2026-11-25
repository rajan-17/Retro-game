// Game State Machine, Loop, and Input Management - Terminal Odyssey 2.0
class Game {
    constructor(canvas = null, hub = null) {
        this.canvas = canvas || document.getElementById('gameCanvas');
        this.hub = hub;
        this.renderer = new Renderer(this.canvas);
        this.physics = new PhysicsEngine(CONFIG.TILE_SIZE);
        this.particles = new ParticleSystem();
        this.shop = new ShopSystem(this);

        this.state = 'TITLE'; // TITLE, PLAYING, SHOP, PAUSED, STAGE_CLEAR, GAME_OVER, VICTORY
        this.currentLevelIndex = 0;
        this.level = null;

        // Player & Game Stats
        this.player = null;
        this.maxLives = 3;
        this.lives = 3;
        this.score = 0;
        this.coins = 0;
        this.highScore = parseInt(localStorage.getItem('ascii_platformer_highscore') || '0', 10);
        this.levelTimer = 0;

        // Entities
        this.enemies = [];
        this.collectibles = [];
        this.projectiles = [];
        this.boss = null;
        this.exitPortal = null;

        // Input state
        this.input = {
            left: false,
            right: false,
            jump: false,
            jumpJustPressed: false,
            slashJustPressed: false,
            dashJustPressed: false,
            shootJustPressed: false
        };

        this.bindEvents();
        this.loadLevel(0);
        this.updateHUD();
    }

    bindEvents() {
        // Keyboard listeners
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
                case 'Space':
                case 'ArrowUp':
                case 'KeyW':
                    this.input.jump = true;
                    this.input.jumpJustPressed = true;
                    e.preventDefault();
                    break;
                case 'KeyX':
                case 'KeyJ':
                    this.input.slashJustPressed = true;
                    break;
                case 'KeyC':
                case 'KeyK':
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.input.dashJustPressed = true;
                    break;
                case 'KeyV':
                case 'KeyL':
                    this.input.shootJustPressed = true;
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
                case 'KeyR':
                    if (this.state === 'GAME_OVER' || this.state === 'VICTORY') {
                        this.restartGame();
                    } else if (this.state === 'PLAYING') {
                        this.respawnPlayer();
                    }
                    break;
                case 'Enter':
                    if (this.state === 'TITLE') {
                        this.startGame();
                    } else if (this.state === 'STAGE_CLEAR') {
                        this.openShop();
                    } else if (this.state === 'GAME_OVER' || this.state === 'VICTORY') {
                        this.restartGame();
                    }
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
                case 'Space':
                case 'ArrowUp':
                case 'KeyW':
                    this.input.jump = false;
                    break;
            }
        });

        // Canvas tap/click to start
        this.canvas.addEventListener('click', () => {
            Sound.init();
            if (this.state === 'TITLE') this.startGame();
            else if (this.state === 'STAGE_CLEAR') this.openShop();
            else if (this.state === 'GAME_OVER' || this.state === 'VICTORY') this.restartGame();
        });

        // Touch / Gamepad button bindings
        const bindButton = (id, onDown, onUp = null) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            const handleDown = (e) => {
                e.preventDefault();
                Sound.init();
                onDown();
            };

            const handleUp = (e) => {
                e.preventDefault();
                if (onUp) onUp();
            };

            btn.addEventListener('touchstart', handleDown, { passive: false });
            btn.addEventListener('touchend', handleUp, { passive: false });
            btn.addEventListener('mousedown', handleDown);
            btn.addEventListener('mouseup', handleUp);
            btn.addEventListener('mouseleave', handleUp);
        };

        bindButton('btnLeft', () => { this.input.left = true; }, () => { this.input.left = false; });
        bindButton('btnRight', () => { this.input.right = true; }, () => { this.input.right = false; });
        
        bindButton('btnJump', () => {
            this.input.jump = true;
            this.input.jumpJustPressed = true;
            if (this.state === 'TITLE') this.startGame();
            else if (this.state === 'STAGE_CLEAR') this.openShop();
            else if (this.state === 'GAME_OVER' || this.state === 'VICTORY') this.restartGame();
        }, () => {
            this.input.jump = false;
        });

        bindButton('btnSlash', () => {
            this.input.slashJustPressed = true;
            if (this.state === 'TITLE') this.startGame();
        });

        bindButton('btnDash', () => {
            this.input.dashJustPressed = true;
        });

        bindButton('btnShoot', () => {
            this.input.shootJustPressed = true;
        });

        // Toolbar bindings
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.renderer.setTheme(e.target.value);
            });
        }

        const scanlinesBtn = document.getElementById('toggleScanlines');
        if (scanlinesBtn) {
            scanlinesBtn.addEventListener('click', () => {
                const active = this.renderer.toggleScanlines();
                scanlinesBtn.classList.toggle('active', active);
            });
        }

        const soundBtn = document.getElementById('toggleSound');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                Sound.init();
                const muted = Sound.toggleMute();
                soundBtn.textContent = muted ? '🔇 SFX: OFF' : '🔊 SFX: ON';
            });
        }

        const bgmBtn = document.getElementById('toggleBGM');
        if (bgmBtn) {
            bgmBtn.addEventListener('click', () => {
                Sound.init();
                const playing = Sound.toggleBGM();
                bgmBtn.textContent = playing ? '🎵 BGM: ON' : '🔇 BGM: OFF';
            });
        }
    }

    startGame() {
        this.score = 0;
        this.coins = 0;
        this.maxLives = 3;
        this.lives = 3;
        this.currentLevelIndex = 0;
        this.shop.reset();
        this.loadLevel(this.currentLevelIndex);
        this.state = 'PLAYING';
        this.updateHUD();
    }

    restartGame() {
        this.startGame();
    }

    loadLevel(index) {
        const allLevels = window.LEVELS || LEVELS;
        const rawLevel = allLevels[index];
        this.level = rawLevel;
        this.enemies = [];
        this.collectibles = [];
        this.projectiles = [];
        this.boss = null;
        this.exitPortal = null;
        this.particles.reset();

        let spawnX = 2 * CONFIG.TILE_SIZE;
        let spawnY = 2 * CONFIG.TILE_SIZE;

        for (let r = 0; r < rawLevel.height; r++) {
            const row = rawLevel.map[r];
            for (let c = 0; c < rawLevel.width; c++) {
                const char = row[c];
                const px = c * CONFIG.TILE_SIZE;
                const py = r * CONFIG.TILE_SIZE;

                if (char === CONFIG.TILES.PLAYER_SPAWN) {
                    spawnX = px;
                    spawnY = py;
                } else if (char === CONFIG.TILES.ENEMY_SLIME) {
                    this.enemies.push(new EnemySlime(px, py));
                } else if (char === CONFIG.TILES.ENEMY_FLYER) {
                    this.enemies.push(new EnemyFlyer(px, py));
                } else if (char === CONFIG.TILES.COIN) {
                    this.collectibles.push(new Collectible(px, py, false));
                } else if (char === CONFIG.TILES.GEM) {
                    this.collectibles.push(new Collectible(px, py, true));
                } else if (char === CONFIG.TILES.EXIT) {
                    this.exitPortal = new ExitPortal(px, py);
                } else if (char === CONFIG.TILES.BOSS_SPAWN) {
                    this.boss = new BossDaemon(px, py);
                }
            }
        }

        // Keep player perk upgrades
        if (!this.player) {
            this.player = new Player(spawnX, spawnY);
        } else {
            this.player.spawnX = spawnX;
            this.player.spawnY = spawnY;
            this.player.reset();
            // Reapply purchased perks
            this.player.hasTripleJump = this.shop.upgrades.triple_jump > 0;
            this.player.hasMagnet = this.shop.upgrades.magnet > 0;
            this.player.bladeLevel = this.shop.upgrades.blade || 0;
            this.player.dashCooldownMax = Math.max(20, 45 - (this.shop.upgrades.overclock_dash || 0) * 12);
        }

        this.renderer.updateCamera(this.player, this.level, this.particles);
        this.levelTimer = 0;
        this.updateHUD();
    }

    respawnPlayer() {
        this.lives--;
        this.updateHUD();
        if (this.lives <= 0) {
            this.state = 'GAME_OVER';
            Sound.playDeath();
            this.checkHighScore();
        } else {
            this.player.reset();
            Sound.playHurt();
        }
    }

    openShop() {
        this.state = 'SHOP';
        const shopOverlay = document.getElementById('shopOverlay');
        if (shopOverlay) {
            shopOverlay.style.display = 'flex';
            this.shop.renderShop(shopOverlay);
        }
    }

    closeShopAndContinue() {
        const shopOverlay = document.getElementById('shopOverlay');
        if (shopOverlay) shopOverlay.style.display = 'none';
        this.nextLevel();
    }

    nextLevel() {
        this.currentLevelIndex++;
        const allLevels = window.LEVELS || LEVELS;
        if (this.currentLevelIndex >= allLevels.length) {
            this.state = 'VICTORY';
            this.checkHighScore();
            Sound.playVictory();
        } else {
            this.loadLevel(this.currentLevelIndex);
            this.state = 'PLAYING';
        }
        this.updateHUD();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
        }
    }

    checkHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('ascii_platformer_highscore', this.highScore.toString());
            this.updateHUD();
        }
    }

    updateHUD() {
        const elScore = document.getElementById('hudScore');
        const elLives = document.getElementById('hudLives');
        const elCoins = document.getElementById('hudCoins');
        const elLevel = document.getElementById('hudLevel');
        const elHighScore = document.getElementById('hudHighScore');

        if (elScore) elScore.textContent = this.score.toString().padStart(6, '0');
        if (elLives) elLives.textContent = '♥'.repeat(Math.max(0, this.lives)) + '♡'.repeat(Math.max(0, this.maxLives - this.lives));
        if (elCoins) elCoins.textContent = `¢ ${this.coins}`;
        if (elHighScore) elHighScore.textContent = this.highScore.toString().padStart(6, '0');
        if (elLevel && this.level) elLevel.textContent = this.level.name;
    }

    update(input = null) {
        if (this.state !== 'PLAYING') return;

        this.levelTimer++;
        const inState = input || this.input;

        // 1. Update Player
        this.player.update(inState, this.level, this.physics, this.particles, Audio, this.projectiles);

        // Reset single-frame triggers
        this.input.jumpJustPressed = false;
        this.input.slashJustPressed = false;
        this.input.dashJustPressed = false;
        this.input.shootJustPressed = false;

        // 2. Coin Magnet & Collectibles
        this.physics.applyMagnet(this.player, this.collectibles);

        for (const item of this.collectibles) {
            if (item.collected) continue;
            item.update();
            if (this.physics.boxesOverlap(this.player, item)) {
                item.collected = true;
                this.score += item.value;
                this.coins += item.isGem ? 5 : 1;
                if (item.isGem) {
                    Sound.playGem();
                    this.particles.addText(item.x, item.y, `+${item.value}!`, "#00f0ff", 1.2);
                    this.particles.addSparks(item.x, item.y, 8, "#00f0ff");
                } else {
                    Sound.playCoin();
                    this.particles.addText(item.x, item.y, `+${item.value}`, "#ffd700", 0.9);
                }
                this.updateHUD();
            }
        }

        // 3. Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(this.level, this.physics);
            if (!p.alive) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Player projectiles hitting enemies
            if (p.isPlayer) {
                for (const enemy of this.enemies) {
                    if (enemy.alive && this.physics.boxesOverlap(p, enemy)) {
                        enemy.alive = false;
                        p.alive = false;
                        this.score += 200;
                        Sound.playStomp();
                        this.particles.triggerShake(4);
                        this.particles.addText(enemy.x, enemy.y, "SHOT! +200", "#00f0ff", 1.1);
                        this.particles.addSparks(enemy.x, enemy.y, 10, "#00f0ff");
                        this.updateHUD();
                        break;
                    }
                }
                // Hitting Boss
                if (this.boss && this.boss.alive && this.physics.boxesOverlap(p, this.boss)) {
                    p.alive = false;
                    this.boss.takeDamage(1, this.particles, Audio);
                    this.score += 150;
                    this.updateHUD();
                }
            } else {
                // Enemy projectile hitting player
                if (this.physics.boxesOverlap(p, this.player)) {
                    p.alive = false;
                    const tookDmg = this.player.takeDamage(1, this.particles, Audio);
                    if (tookDmg) {
                        this.lives--;
                        this.updateHUD();
                        if (this.lives <= 0) {
                            this.state = 'GAME_OVER';
                            Sound.playDeath();
                            this.checkHighScore();
                        }
                    }
                }
            }
        }

        // 4. Update Enemies & Combat
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            enemy.update(this.level, this.physics, this.particles, Audio);

            // Slash attack hit
            if (this.player.isSlashing && this.physics.checkSlashHit(this.player, enemy)) {
                enemy.alive = false;
                this.score += 250;
                Sound.playStomp();
                this.particles.triggerShake(6);
                this.particles.addText(enemy.x, enemy.y, "SLASH! +250", "#26ff48", 1.2);
                this.particles.addSparks(enemy.x, enemy.y, 14, "#ff3344");
                this.updateHUD();
                continue;
            }

            // Dash attack hit (slashing dash)
            if (this.player.isDashing && this.physics.boxesOverlap(this.player, enemy)) {
                enemy.alive = false;
                this.score += 200;
                Sound.playStomp();
                this.particles.triggerShake(6);
                this.particles.addText(enemy.x, enemy.y, "DASH HIT!", "#00f0ff", 1.1);
                this.particles.addSparks(enemy.x, enemy.y, 12, "#00f0ff");
                this.updateHUD();
                continue;
            }

            // Stomp or collision
            if (this.physics.boxesOverlap(this.player, enemy)) {
                const isFalling = this.player.vy > 0.5;
                const wasAbove = (this.player.y + this.player.height - this.player.vy) <= enemy.y + 6;

                if (isFalling && wasAbove) {
                    enemy.alive = false;
                    this.player.vy = CONFIG.PHYSICS.ENEMY_BOUNCE_FORCE;
                    this.player.jumpsLeft = this.player.hasTripleJump ? 2 : 1;
                    this.score += 200;
                    Sound.playStomp();
                    this.particles.triggerShake(4);
                    this.particles.addText(enemy.x, enemy.y, "STOMP! +200", "#ffb020", 1.1);
                    this.particles.addSparks(enemy.x, enemy.y, 12, "#ff3344");
                    this.updateHUD();
                } else {
                    const tookDmg = this.player.takeDamage(1, this.particles, Audio);
                    if (tookDmg) {
                        this.lives--;
                        this.updateHUD();
                        if (this.lives <= 0) {
                            this.state = 'GAME_OVER';
                            Sound.playDeath();
                            this.checkHighScore();
                        }
                    }
                }
            }
        }

        // 5. Update Boss
        if (this.boss && this.boss.alive) {
            this.boss.update(this.player, this.level, this.physics, this.particles, Audio, this.projectiles);

            // Slash hit on boss
            if (this.player.isSlashing && this.physics.checkSlashHit(this.player, this.boss)) {
                const dmg = 2 + this.player.bladeLevel;
                this.boss.takeDamage(dmg, this.particles, Audio);
                this.score += dmg * 100;
                this.updateHUD();
            }

            // Body collision with boss
            if (this.physics.boxesOverlap(this.player, this.boss)) {
                const tookDmg = this.player.takeDamage(1, this.particles, Audio);
                if (tookDmg) {
                    this.lives--;
                    this.updateHUD();
                    if (this.lives <= 0) {
                        this.state = 'GAME_OVER';
                        Sound.playDeath();
                        this.checkHighScore();
                    }
                }
            }

            // Boss defeated -> spawn exit portal or trigger victory
            if (!this.boss.alive && !this.exitPortal) {
                this.exitPortal = new ExitPortal(this.boss.x + 16, this.boss.y + 10);
            }
        }

        // 6. Update Exit Portal
        if (this.exitPortal) {
            this.exitPortal.update();
            if (this.physics.boxesOverlap(this.player, this.exitPortal)) {
                Sound.playVictory();
                this.particles.addText(this.player.x, this.player.y - 10, "SECTOR CLEAR!", "#26ff48", 1.4);
                this.particles.addSparks(this.exitPortal.x, this.exitPortal.y, 25, "#26ff48");
                if (this.currentLevelIndex >= LEVELS.length - 1) {
                    this.state = 'VICTORY';
                    this.checkHighScore();
                } else {
                    this.state = 'STAGE_CLEAR';
                }
            }
        }

        // 7. Update Particles & Camera
        this.particles.update();
        this.renderer.updateCamera(this.player, this.level, this.particles);
    }

    renderOverlay() {
        const ctx = this.renderer.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const theme = this.renderer.currentTheme;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.state === 'TITLE') {
            ctx.fillStyle = 'rgba(5, 5, 10, 0.88)';
            ctx.fillRect(0, 0, w, h);

            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillStyle = theme.bright;
            ctx.fillText("TERMINAL ODYSSEY 2.0", w / 2, h / 2 - 55);

            ctx.font = '14px "Courier New", monospace';
            ctx.fillStyle = theme.fg;
            ctx.fillText("Cyber Slasher Edition", w / 2, h / 2 - 28);

            ctx.fillStyle = theme.accent;
            ctx.font = 'bold 13px "Courier New", monospace';
            const pulse = Math.sin(Date.now() * 0.005) > 0 ? "PRESS [SPACE] OR TAP JUMP/SLASH TO START" : "";
            ctx.fillText(pulse, w / 2, h / 2 + 20);

            ctx.font = '11px "Courier New", monospace';
            ctx.fillStyle = theme.dim;
            ctx.fillText("Move: [A/D] | Jump: [SPACE] | Slash: [X/J] | Dash: [C/K] | Blaster: [V/L]", w / 2, h / 2 + 65);
            ctx.fillText("Features: Boss Fights, Cyber Shop, 8-Bit Chiptune BGM, iPhone & PC Controls", w / 2, h / 2 + 88);
        } else if (this.state === 'PAUSED') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(0, 0, w, h);

            ctx.font = 'bold 20px "Courier New", monospace';
            ctx.fillStyle = theme.accent;
            ctx.fillText("SYSTEM PAUSED", w / 2, h / 2);

            ctx.font = '12px "Courier New", monospace';
            ctx.fillStyle = theme.fg;
            ctx.fillText("Press [P] to Resume", w / 2, h / 2 + 30);
        } else if (this.state === 'STAGE_CLEAR') {
            ctx.fillStyle = 'rgba(0, 10, 5, 0.82)';
            ctx.fillRect(0, 0, w, h);

            ctx.font = 'bold 22px "Courier New", monospace';
            ctx.fillStyle = theme.bright;
            ctx.fillText("SECTOR LIBERATED!", w / 2, h / 2 - 35);

            ctx.font = '14px "Courier New", monospace';
            ctx.fillStyle = theme.fg;
            ctx.fillText(`Score: ${this.score}  |  Coins: ${this.coins}`, w / 2, h / 2);

            ctx.fillStyle = theme.accent;
            ctx.font = 'bold 13px "Courier New", monospace';
            ctx.fillText("TAP SCREEN OR PRESS [ENTER] FOR CYBER SHOP", w / 2, h / 2 + 45);
        } else if (this.state === 'GAME_OVER') {
            ctx.fillStyle = 'rgba(20, 0, 0, 0.88)';
            ctx.fillRect(0, 0, w, h);

            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillStyle = theme.hazard;
            ctx.fillText("CRITICAL FAILURE", w / 2, h / 2 - 30);

            ctx.font = '14px "Courier New", monospace';
            ctx.fillStyle = theme.fg;
            ctx.fillText(`Final Score: ${this.score}`, w / 2, h / 2);

            ctx.fillStyle = theme.accent;
            ctx.font = 'bold 13px "Courier New", monospace';
            ctx.fillText("PRESS [R] OR TAP TO REBOOT", w / 2, h / 2 + 40);
        } else if (this.state === 'VICTORY') {
            ctx.fillStyle = 'rgba(5, 15, 10, 0.9)';
            ctx.fillRect(0, 0, w, h);

            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillStyle = theme.bright;
            ctx.fillText("MEGA-DAEMON DESTROYED!", w / 2, h / 2 - 40);

            ctx.font = '14px "Courier New", monospace';
            ctx.fillStyle = theme.fg;
            ctx.fillText("You liberated the Entire Mainframe!", w / 2, h / 2 - 10);
            ctx.fillText(`Final Score: ${this.score}  |  High Score: ${this.highScore}`, w / 2, h / 2 + 18);

            ctx.fillStyle = theme.accent;
            ctx.font = 'bold 13px "Courier New", monospace';
            ctx.fillText("PRESS [ENTER] TO REPLAY", w / 2, h / 2 + 60);
        }

        ctx.restore();
    }

    start() {
        if (this.state === 'GAME_OVER' || this.state === 'VICTORY') {
            this.startGame();
        }
    }

    render() {
        if (this.level && this.player) {
            this.renderer.render(
                this.level,
                this.player,
                this.enemies,
                this.collectibles,
                this.exitPortal,
                this.particles,
                this.projectiles,
                this.boss
            );
        }
        if (this.state !== 'PLAYING' && this.state !== 'SHOP') {
            this.renderOverlay();
        }
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }

    init() {
        this.loadLevel(0);
        this.loop();
    }
}

window.Game = Game;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
