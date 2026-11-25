// Super ASCII Bros - Authentic ASCII Mario Tribute
class MarioGame {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.physics = new PhysicsEngine(16);
        this.particles = new ParticleSystem();

        this.tileSize = 16;
        this.cameraX = 0;
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.time = 400;
        this.timerTicks = 0;
        this.state = 'TITLE'; // TITLE, PLAYING, DIE, CLEAR, GAME_OVER

        // Mario Player State
        this.player = {
            x: 48,
            y: 280,
            width: 12,
            height: 15,
            vx: 0,
            vy: 0,
            facing: 'right',
            onGround: false,
            isSuper: false,
            isFire: false,
            invulnTimer: 0,
            animTimer: 0,
            animFrame: 0
        };

        this.fireballs = [];
        this.enemies = [];
        this.items = [];
        this.blocks = [];
        this.flagpole = null;

        this.canvas.addEventListener('click', () => {
            Sound.init();
            if (this.state === 'TITLE' || this.state === 'CLEAR' || this.state === 'GAME_OVER') {
                this.start();
            }
        });

        this.initLevel();
    }

    initLevel() {
        this.fireballs = [];
        this.enemies = [];
        this.items = [];
        this.blocks = [];
        this.cameraX = 0;
        this.time = 400;

        // Reset player
        this.player.x = 48;
        this.player.y = 280;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.width = 12;
        this.player.height = this.player.isSuper ? 24 : 15;

        // Handcrafted World 1-1 ASCII Stage
        this.levelWidth = 140;
        this.levelHeight = 24;
        this.map = [];

        // Fill with air
        for (let r = 0; r < this.levelHeight; r++) {
            this.map.push(new Array(this.levelWidth).fill(' '));
        }

        // Ground floors
        for (let c = 0; c < this.levelWidth; c++) {
            // Pit gaps at 50-53 and 75-78
            if ((c >= 50 && c <= 52) || (c >= 76 && c <= 78)) continue;
            this.map[21][c] = '#';
            this.map[22][c] = '#';
            this.map[23][c] = '#';
        }

        // Mystery ? blocks and bricks
        const questionBlocks = [
            { x: 16, y: 17, item: 'coin' },
            { x: 21, y: 17, item: 'mushroom' },
            { x: 23, y: 17, item: 'coin' },
            { x: 22, y: 13, item: 'flower' },
            { x: 60, y: 17, item: 'mushroom' },
            { x: 85, y: 13, item: 'coin' },
            { x: 92, y: 17, item: 'coin' }
        ];

        const brickBlocks = [
            { x: 20, y: 17 }, { x: 22, y: 17 }, { x: 24, y: 17 },
            { x: 65, y: 17 }, { x: 66, y: 17 }, { x: 67, y: 17 }, { x: 68, y: 17 },
            { x: 80, y: 13 }, { x: 81, y: 13 }, { x: 82, y: 13 }
        ];

        questionBlocks.forEach(b => {
            this.blocks.push({ x: b.x * 16, y: b.y * 16, type: '?', item: b.item, hit: false });
        });

        brickBlocks.forEach(b => {
            this.blocks.push({ x: b.x * 16, y: b.y * 16, type: 'brick', hit: false });
        });

        // Warp Pipes (Small, Med, Large)
        const pipes = [
            { x: 28, height: 2 },
            { x: 38, height: 3 },
            { x: 46, height: 4 },
            { x: 105, height: 2 }
        ];

        pipes.forEach(p => {
            for (let h = 0; h < p.height; h++) {
                const r = 21 - 1 - h;
                this.map[r][p.x] = '|';
                this.map[r][p.x + 1] = '|';
            }
        });

        // Enemies: Goombas (m) and Koopas (k)
        const enemySpawns = [
            { x: 22 * 16, type: 'goomba' },
            { x: 34 * 16, type: 'goomba' },
            { x: 42 * 16, type: 'goomba' },
            { x: 58 * 16, type: 'koopa' },
            { x: 70 * 16, type: 'goomba' },
            { x: 72 * 16, type: 'goomba' },
            { x: 88 * 16, type: 'koopa' }
        ];

        enemySpawns.forEach(e => {
            this.enemies.push({
                x: e.x,
                y: 19 * 16,
                vx: -0.9,
                vy: 0,
                width: 14,
                height: 14,
                type: e.type,
                alive: true,
                state: 'walk' // walk, shell, squashed
            });
        });

        // Flagpole at x = 125
        this.flagpole = { x: 125 * 16, topY: 8 * 16, bottomY: 20 * 16, reached: false };
    }

    start() {
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.player.isSuper = false;
        this.player.isFire = false;
        this.initLevel();
        this.state = 'PLAYING';
    }

    update(input) {
        if (this.state !== 'PLAYING') return;

        this.timerTicks++;
        if (this.timerTicks % 60 === 0 && this.time > 0) {
            this.time--;
            if (this.time <= 0) this.killPlayer();
        }

        const p = this.player;
        if (p.invulnTimer > 0) p.invulnTimer--;

        // 1. Horizontal Movement & Acceleration
        let moveDir = 0;
        if (input.left) moveDir -= 1;
        if (input.right) moveDir += 1;

        const maxSpeed = input.dash ? 4.5 : 3.2;
        const accel = p.onGround ? 0.35 : 0.22;
        const friction = p.onGround ? 0.85 : 0.92;

        if (moveDir !== 0) {
            p.facing = moveDir > 0 ? 'right' : 'left';
            p.vx += moveDir * accel;
            if (Math.abs(p.vx) > maxSpeed) p.vx = moveDir * maxSpeed;

            p.animTimer++;
            if (p.animTimer % 5 === 0) p.animFrame = (p.animFrame + 1) % 3;
        } else {
            p.vx *= friction;
            if (Math.abs(p.vx) < 0.05) p.vx = 0;
            p.animFrame = 0;
        }

        // 2. Jump Input & Variable Height
        if (input.jumpJustPressed && p.onGround) {
            p.vy = -7.8;
            p.onGround = false;
            Sound.playJump();
            this.particles.addDust(p.x + p.width / 2, p.y + p.height, 3);
        }

        if (!input.jump && p.vy < -2.5) {
            p.vy *= 0.6;
        }

        // 3. Fireball Attack (if Fire Mario)
        if (input.slashJustPressed && p.isFire && this.fireballs.length < 2) {
            const fvx = p.facing === 'right' ? 5.5 : -5.5;
            this.fireballs.push({
                x: p.facing === 'right' ? p.x + p.width + 2 : p.x - 6,
                y: p.y + 6,
                vx: fvx,
                vy: 2.0,
                width: 8,
                height: 8,
                alive: true
            });
            Sound.playShoot();
        }

        // Gravity
        p.vy += 0.44;
        if (p.vy > 9.0) p.vy = 9.0;

        // 4. Custom Collision against Bricks & ? Blocks
        p.x += p.vx;
        // Check block side collision
        this.checkBlockCollisions(p, 'horizontal');

        p.y += p.vy;
        p.onGround = false;
        this.checkBlockCollisions(p, 'vertical');

        // Check map collision (floor & pipes)
        this.checkMapCollisions(p);

        // 5. Update Fireballs
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            const fb = this.fireballs[i];
            fb.x += fb.vx;
            fb.y += fb.vy;
            fb.vy += 0.35; // Fireball gravity

            // Bounce on ground
            const tx = Math.floor(fb.x / 16);
            const ty = Math.floor((fb.y + fb.height) / 16);
            if (this.isTileSolid(tx, ty)) {
                fb.y = ty * 16 - fb.height;
                fb.vy = -3.8; // Bounce!
            }

            // Hitting enemies
            for (const enemy of this.enemies) {
                if (enemy.alive && this.boxesOverlap(fb, enemy)) {
                    enemy.alive = false;
                    fb.alive = false;
                    this.score += 200;
                    Sound.playStomp();
                    this.particles.addSparks(enemy.x, enemy.y, 10, '#ffee33');
                    this.particles.addText(enemy.x, enemy.y, "+200", "#ff3344");
                    break;
                }
            }

            if (!fb.alive || fb.x < this.cameraX - 32 || fb.x > this.cameraX + 850) {
                this.fireballs.splice(i, 1);
            }
        }

        // 6. Update Items (Mushrooms, Flowers, Coins)
        for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            if (it.type === 'mushroom') {
                it.x += it.vx;
                it.y += it.vy;
                it.vy += 0.4;
                // Floor bounce
                const tx = Math.floor(it.x / 16);
                const ty = Math.floor((it.y + it.height) / 16);
                if (this.isTileSolid(tx, ty)) {
                    it.y = ty * 16 - it.height;
                    it.vy = 0;
                }
            }

            // Player collects item
            if (this.boxesOverlap(p, it)) {
                if (it.type === 'mushroom') {
                    p.isSuper = true;
                    p.height = 24;
                    p.y -= 10;
                    this.score += 1000;
                    Sound.playVictory();
                    this.particles.addText(p.x, p.y, "SUPER!", "#ffee33", 1.2);
                } else if (it.type === 'flower') {
                    p.isSuper = true;
                    p.isFire = true;
                    p.height = 24;
                    this.score += 1000;
                    Sound.playVictory();
                    this.particles.addText(p.x, p.y, "FIRE POWER!", "#ff3344", 1.2);
                } else if (it.type === 'coin') {
                    this.coins++;
                    this.score += 200;
                    Sound.playCoin();
                }
                this.items.splice(i, 1);
            }
        }

        // 7. Update Enemies & Stomp
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            if (enemy.state === 'walk') {
                enemy.x += enemy.vx;
                // Wall bounce
                const tx = Math.floor((enemy.vx > 0 ? enemy.x + enemy.width : enemy.x) / 16);
                const ty = Math.floor((enemy.y + 8) / 16);
                if (this.isTileSolid(tx, ty)) {
                    enemy.vx = -enemy.vx;
                }
            } else if (enemy.state === 'shell_sliding') {
                enemy.x += enemy.vx;
                // Shell kills other enemies!
                for (const other of this.enemies) {
                    if (other !== enemy && other.alive && this.boxesOverlap(enemy, other)) {
                        other.alive = false;
                        this.score += 500;
                        Sound.playStomp();
                        this.particles.addText(other.x, other.y, "+500", "#ffee33");
                    }
                }
            }

            // Player vs Enemy
            if (this.boxesOverlap(p, enemy)) {
                const stomping = p.vy > 0.5 && (p.y + p.height - p.vy <= enemy.y + 8);

                if (stomping) {
                    Sound.playStomp();
                    p.vy = -6.5; // Bounce off enemy
                    this.score += 200;

                    if (enemy.type === 'goomba') {
                        enemy.alive = false;
                        this.particles.addText(enemy.x, enemy.y, "100", "#fff");
                    } else if (enemy.type === 'koopa') {
                        if (enemy.state === 'walk') {
                            enemy.state = 'shell';
                            enemy.vx = 0;
                            this.particles.addText(enemy.x, enemy.y, "SHELL!", "#ffd700");
                        } else if (enemy.state === 'shell') {
                            enemy.state = 'shell_sliding';
                            enemy.vx = p.facing === 'right' ? 6.0 : -6.0;
                            Sound.playSpring();
                        }
                    }
                } else if (enemy.state === 'shell') {
                    // Kick stationary shell
                    enemy.state = 'shell_sliding';
                    enemy.vx = p.facing === 'right' ? 6.0 : -6.0;
                    Sound.playSpring();
                    this.particles.addText(enemy.x, enemy.y, "KICK!", "#00f0ff");
                } else if (p.invulnTimer <= 0) {
                    // Hurt player
                    if (p.isFire) {
                        p.isFire = false;
                        p.invulnTimer = 60;
                        Sound.playHurt();
                    } else if (p.isSuper) {
                        p.isSuper = false;
                        p.height = 15;
                        p.invulnTimer = 60;
                        Sound.playHurt();
                    } else {
                        this.killPlayer();
                    }
                }
            }
        }

        // 8. Check Flagpole
        if (!this.flagpole.reached && p.x + p.width >= this.flagpole.x) {
            this.flagpole.reached = true;
            this.state = 'CLEAR';
            Sound.playVictory();
            this.score += 5000;
            this.particles.addText(this.flagpole.x, this.flagpole.topY, "COURSE CLEAR! +5000", "#26ff48", 1.4);
        }

        // Pit death
        if (p.y > 380) {
            this.killPlayer();
        }

        // Camera follow (only scrolls forward like classic Mario)
        if (p.x - this.cameraX > 320) {
            this.cameraX = p.x - 320;
        }

        this.particles.update();
    }

    checkBlockCollisions(p, axis) {
        for (const b of this.blocks) {
            const box = { x: b.x, y: b.y, width: 16, height: 16 };
            if (this.boxesOverlap(p, box)) {
                if (axis === 'vertical') {
                    if (p.vy > 0) { // Landing on top
                        p.y = b.y - p.height;
                        p.vy = 0;
                        p.onGround = true;
                    } else if (p.vy < 0) { // Hitting block from below!
                        p.y = b.y + 16;
                        p.vy = 0;
                        this.hitBlock(b, p);
                    }
                } else if (axis === 'horizontal') {
                    if (p.vx > 0) {
                        p.x = b.x - p.width;
                        p.vx = 0;
                    } else if (p.vx < 0) {
                        p.x = b.x + 16;
                        p.vx = 0;
                    }
                }
            }
        }
    }

    hitBlock(b, p) {
        if (b.type === '?' && !b.hit) {
            b.hit = true;
            b.type = 'empty';
            Sound.playCoin();
            this.particles.triggerShake(3);

            if (b.item === 'mushroom' || b.item === 'flower') {
                const itemType = p.isSuper ? 'flower' : 'mushroom';
                this.items.push({
                    x: b.x,
                    y: b.y - 16,
                    vx: 1.2,
                    vy: -2.5,
                    width: 14,
                    height: 14,
                    type: itemType
                });
                Sound.playSpring();
            } else {
                this.coins++;
                this.score += 200;
                this.particles.addText(b.x + 8, b.y - 8, "+200", "#ffd700");
            }
        } else if (b.type === 'brick') {
            if (p.isSuper) {
                // Break brick!
                b.broken = true;
                const idx = this.blocks.indexOf(b);
                if (idx !== -1) this.blocks.splice(idx, 1);
                Sound.playStomp();
                this.particles.addSparks(b.x + 8, b.y + 8, 8, "#d2691e");
                this.particles.triggerShake(4);
            } else {
                // Bump brick
                Sound.playSpring();
                this.particles.triggerShake(2);
            }
        }
    }

    checkMapCollisions(p) {
        const startX = Math.floor(p.x / 16);
        const endX = Math.floor((p.x + p.width - 0.05) / 16);
        const startY = Math.floor(p.y / 16);
        const endY = Math.floor((p.y + p.height - 0.05) / 16);

        // Floor collision
        const bottomY = Math.floor((p.y + p.height) / 16);
        for (let x = startX; x <= endX; x++) {
            if (this.isTileSolid(x, bottomY)) {
                p.y = bottomY * 16 - p.height;
                p.vy = 0;
                p.onGround = true;
                break;
            }
        }

        // Wall collision
        for (let y = startY; y <= endY; y++) {
            if (this.isTileSolid(startX, y) && p.vx < 0) {
                p.x = (startX + 1) * 16;
                p.vx = 0;
            }
            if (this.isTileSolid(endX, y) && p.vx > 0) {
                p.x = endX * 16 - p.width;
                p.vx = 0;
            }
        }
    }

    isTileSolid(tx, ty) {
        if (ty < 0 || ty >= this.levelHeight || tx < 0 || tx >= this.levelWidth) return false;
        const char = this.map[ty][tx];
        return char === '#' || char === '|';
    }

    boxesOverlap(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    killPlayer() {
        this.lives--;
        Sound.playDeath();
        this.particles.triggerShake(8);
        if (this.lives <= 0) {
            this.state = 'GAME_OVER';
        } else {
            this.initLevel();
        }
    }

    renderBackgroundScenery() {
        const ctx = this.ctx;
        ctx.fillStyle = '#ffffff';
        // Draw ASCII clouds
        for (let i = 0; i < 8; i++) {
            const cx = i * 240 - (this.cameraX * 0.2) % 240;
            ctx.fillText("  _.._   ", cx, 60);
            ctx.fillText(" (    )  ", cx, 74);
            ctx.fillText("(___.__) ", cx, 88);
        }

        // Draw green hills
        ctx.fillStyle = '#00aa44';
        for (let i = 0; i < 6; i++) {
            const hx = i * 320 - (this.cameraX * 0.4) % 320;
            ctx.fillText("   /\\   ", hx, 180);
            ctx.fillText("  /  \\  ", hx, 194);
            ctx.fillText(" /____\\ ", hx, 208);
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear with classic NES blue sky
        ctx.fillStyle = '#5c94fc';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.font = 'bold 16px "Courier New", monospace';

        // 1. Render Clouds and Hills in Background
        this.renderBackgroundScenery();

        // 2. Render Ground & Pipes
        for (let r = 0; r < this.levelHeight; r++) {
            for (let c = Math.floor(this.cameraX / 16); c < Math.ceil((this.cameraX + w) / 16); c++) {
                if (c >= this.levelWidth) continue;
                const tile = this.map[r][c];
                const sx = Math.round(c * 16 - this.cameraX);
                const sy = Math.round(r * 16);

                if (tile === '#') {
                    ctx.fillStyle = '#d2691e'; // Brick ground
                    ctx.fillText('#', sx, sy + 14);
                } else if (tile === '|') {
                    ctx.fillStyle = '#00aa00'; // Green warp pipe
                    ctx.fillText('|', sx, sy + 14);
                }
            }
        }

        // 3. Render Blocks (?, Bricks)
        for (const b of this.blocks) {
            const sx = Math.round(b.x - this.cameraX);
            const sy = Math.round(b.y);

            if (b.type === '?') {
                ctx.fillStyle = '#ffd700'; // Golden ?
                ctx.fillText('[?]', sx - 4, sy + 14);
            } else if (b.type === 'brick') {
                ctx.fillStyle = '#b22222'; // Brown Brick
                ctx.fillText('[#]', sx - 4, sy + 14);
            } else if (b.type === 'empty') {
                ctx.fillStyle = '#8b5a2b';
                ctx.fillText('[_]', sx - 4, sy + 14);
            }
        }

        // 4. Render Flagpole
        if (this.flagpole) {
            const fx = Math.round(this.flagpole.x - this.cameraX);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('⚑', fx, this.flagpole.topY + 12);
            for (let y = this.flagpole.topY + 16; y < this.flagpole.bottomY; y += 14) {
                ctx.fillText('|', fx + 4, y);
            }
        }

        // 5. Render Items
        for (const it of this.items) {
            const sx = Math.round(it.x - this.cameraX);
            const sy = Math.round(it.y);
            if (it.type === 'mushroom') {
                ctx.fillStyle = '#ff3344';
                ctx.fillText('🍄', sx, sy + 12);
            } else if (it.type === 'flower') {
                ctx.fillStyle = '#ff8800';
                ctx.fillText('🔥', sx, sy + 12);
            }
        }

        // 6. Render Fireballs
        ctx.fillStyle = '#ff4400';
        for (const fb of this.fireballs) {
            const sx = Math.round(fb.x - this.cameraX);
            ctx.fillText('•', sx, fb.y + 8);
        }

        // 7. Render Enemies
        for (const e of this.enemies) {
            if (!e.alive) continue;
            const sx = Math.round(e.x - this.cameraX);
            const sy = Math.round(e.y);

            if (e.type === 'goomba') {
                ctx.fillStyle = '#8b4513';
                ctx.fillText('m', sx + 2, sy + 12);
            } else if (e.type === 'koopa') {
                ctx.fillStyle = '#00aa44';
                ctx.fillText(e.state === 'walk' ? 'k' : '(o)', sx, sy + 12);
            }
        }

        // 8. Render Mario Player
        const p = this.player;
        if (p.invulnTimer <= 0 || Math.floor(p.invulnTimer / 4) % 2 === 0) {
            const sx = Math.round(p.x + p.width / 2 - this.cameraX);
            const sy = Math.round(p.y + p.height / 2);

            ctx.textAlign = 'center';
            ctx.fillStyle = p.isFire ? '#ffffff' : (p.isSuper ? '#ff3344' : '#ff2200');

            if (p.isSuper) {
                // Taller Super Mario glyph
                ctx.fillText('O', sx, sy - 4);
                ctx.fillText('/|\\', sx, sy + 8);
            } else {
                ctx.fillText(p.onGround ? (p.animFrame % 2 === 0 ? 'o' : 'ô') : '▲', sx, sy + 4);
            }
        }

        // 9. Particles
        this.particles.render(ctx, this.cameraX, 0, { dim: '#ffffff', bright: '#ffff00' });

        // 10. Top HUD (Mario style: MARIO, WORLD, TIME)
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`MARIO: ${this.score.toString().padStart(6, '0')}`, 16, 20);
        ctx.fillText(`COINS: ¢ ${this.coins}`, 220, 20);
        ctx.fillText(`WORLD: 1-1`, 400, 20);
        ctx.fillText(`TIME: ${this.time}`, 550, 20);
        ctx.fillText(`LIVES: ${this.lives}`, 680, 20);

        // State overlays
        if (this.state === 'CLEAR') {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 22px "Courier New", monospace';
            ctx.fillText("COURSE CLEAR!", w / 2, h / 2 - 20);
            ctx.font = '13px "Courier New", monospace';
            ctx.fillText("TAP OR PRESS [ENTER] TO REPLAY", w / 2, h / 2 + 20);
        } else if (this.state === 'GAME_OVER') {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ff3344';
            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillText("GAME OVER", w / 2, h / 2);
        }

        ctx.restore();
    }
}

window.MarioGame = MarioGame;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarioGame;
}
