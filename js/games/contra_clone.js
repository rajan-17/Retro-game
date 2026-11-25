// ASCII Commando: Alien Strike - Authentic Contra Run-and-Gun Tribute
class ContraGame {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.physics = new PhysicsEngine(16);
        this.particles = new ParticleSystem();

        this.tileSize = 16;
        this.cameraX = 0;
        this.score = 0;
        this.lives = 3;
        this.state = 'TITLE'; // TITLE, PLAYING, CLEAR, GAME_OVER

        // Commando Player
        this.player = {
            x: 48,
            y: 280,
            width: 14,
            height: 18,
            vx: 0,
            vy: 0,
            facing: 'right',
            aimDir: 'forward', // forward, up, diag_up, diag_down, down, crouch
            onGround: false,
            weapon: 'R', // R (Rifle), S (Spread), L (Laser), M (Machine Gun)
            shootCooldown: 0,
            invulnTimer: 0,
            isCrouching: false,
            spinFrame: 0
        };

        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.capsules = [];
        this.boss = null;

        this.canvas.addEventListener('click', () => {
            Sound.init();
            if (this.state === 'TITLE' || this.state === 'CLEAR' || this.state === 'GAME_OVER') {
                this.start();
            }
        });

        this.initLevel();
    }

    initLevel() {
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.capsules = [];
        this.cameraX = 0;

        this.player.x = 48;
        this.player.y = 280;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.weapon = 'R';
        this.player.invulnTimer = 0;

        // Level Grid: Jungle & Military Outpost
        this.levelWidth = 130;
        this.levelHeight = 24;
        this.map = [];

        for (let r = 0; r < this.levelHeight; r++) {
            this.map.push(new Array(this.levelWidth).fill(' '));
        }

        // Ground and elevated bridges
        for (let c = 0; c < this.levelWidth; c++) {
            // Water/Pits at 40-44, 70-74
            if ((c >= 40 && c <= 43) || (c >= 72 && c <= 75)) continue;
            this.map[21][c] = '=';
            this.map[22][c] = '#';
            this.map[23][c] = '#';
        }

        // Elevated platforms
        const platforms = [
            { x: 12, y: 17, w: 6 },
            { x: 24, y: 15, w: 8 },
            { x: 48, y: 16, w: 8 },
            { x: 60, y: 14, w: 8 },
            { x: 80, y: 15, w: 10 },
            { x: 96, y: 16, w: 8 }
        ];

        platforms.forEach(p => {
            for (let i = 0; i < p.w; i++) {
                this.map[p.y][p.x + i] = '=';
            }
        });

        // Spawn Enemies
        const spawns = [
            { x: 26 * 16, y: 14 * 16, type: 'sniper' },
            { x: 38 * 16, y: 20 * 16, type: 'runner' },
            { x: 52 * 16, y: 15 * 16, type: 'turret' },
            { x: 64 * 16, y: 13 * 16, type: 'sniper' },
            { x: 82 * 16, y: 14 * 16, type: 'turret' },
            { x: 90 * 16, y: 20 * 16, type: 'runner' },
            { x: 98 * 16, y: 15 * 16, type: 'sniper' }
        ];

        spawns.forEach(s => {
            this.enemies.push({
                x: s.x,
                y: s.y,
                width: 14,
                height: 16,
                type: s.type,
                alive: true,
                shootTimer: Math.random() * 60
            });
        });

        // Flying Weapon Capsules (Float across sky)
        this.capsules.push({ x: 200, y: 120, vx: 1.2, weapon: 'S', alive: true });
        this.capsules.push({ x: 600, y: 100, vx: 1.2, weapon: 'M', alive: true });
        this.capsules.push({ x: 1000, y: 110, vx: 1.2, weapon: 'L', alive: true });

        // Fortress Boss at the end (x = 115 * 16)
        this.boss = {
            x: 115 * 16,
            y: 12 * 16,
            width: 48,
            height: 64,
            maxHp: 30,
            hp: 30,
            alive: true,
            shootTimer: 0
        };
    }

    start() {
        this.score = 0;
        this.lives = 3;
        this.initLevel();
        this.state = 'PLAYING';
    }

    update(input) {
        if (this.state !== 'PLAYING') return;

        const p = this.player;
        if (p.invulnTimer > 0) p.invulnTimer--;
        if (p.shootCooldown > 0) p.shootCooldown--;

        // 1. Aiming Direction calculation (8-Way Aiming)
        p.isCrouching = false;
        if (input.down && p.onGround) {
            p.isCrouching = true;
            p.aimDir = 'crouch';
        } else if (input.up) {
            if (input.left || input.right) p.aimDir = 'diag_up';
            else p.aimDir = 'up';
        } else if (input.down && !p.onGround) {
            if (input.left || input.right) p.aimDir = 'diag_down';
            else p.aimDir = 'down';
        } else {
            p.aimDir = 'forward';
        }

        // 2. Horizontal Movement
        let moveDir = 0;
        if (!p.isCrouching) {
            if (input.left) moveDir -= 1;
            if (input.right) moveDir += 1;
        }

        if (moveDir !== 0) {
            p.facing = moveDir > 0 ? 'right' : 'left';
            p.vx = moveDir * 3.4;
        } else {
            p.vx = 0;
        }

        // 3. Jump (Somersault Spin)
        if (input.jumpJustPressed && p.onGround) {
            p.vy = -7.5;
            p.onGround = false;
            Sound.playJump();
        }

        // Gravity
        p.vy += 0.44;
        if (p.vy > 9.0) p.vy = 9.0;

        // Somersault animation in air
        if (!p.onGround) {
            p.spinFrame = (p.spinFrame + 1) % 4;
        }

        // Move Player
        p.x += p.vx;
        p.y += p.vy;
        p.onGround = false;

        // Check map platform collisions
        const bottomY = Math.floor((p.y + p.height) / 16);
        const startX = Math.floor(p.x / 16);
        const endX = Math.floor((p.x + p.width - 0.05) / 16);

        if (p.vy > 0 && bottomY < this.levelHeight && bottomY >= 0) {
            for (let x = startX; x <= endX; x++) {
                if (x >= 0 && x < this.levelWidth) {
                    const tile = this.map[bottomY][x];
                    if (tile === '#' || tile === '=') {
                        p.y = bottomY * 16 - p.height;
                        p.vy = 0;
                        p.onGround = true;
                        break;
                    }
                }
            }
        }

        // 4. Shooting System (8-Way Aiming + Spread Gun + Laser)
        const canShoot = (input.slash || input.slashJustPressed || input.shootJustPressed) && p.shootCooldown <= 0;
        if (canShoot) {
            const cooldown = p.weapon === 'M' ? 7 : (p.weapon === 'S' ? 14 : 10);
            p.shootCooldown = cooldown;
            this.fireBullet(p);
        }

        // 5. Update Player Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx;
            b.y += b.vy;

            // Check hitting enemies
            for (const e of this.enemies) {
                if (e.alive && this.boxesOverlap(b, e)) {
                    e.alive = false;
                    b.alive = false;
                    this.score += 200;
                    Sound.playStomp();
                    this.particles.addSparks(e.x, e.y, 8, '#ff4400');
                    break;
                }
            }

            // Check hitting Boss
            if (this.boss && this.boss.alive && this.boxesOverlap(b, this.boss)) {
                b.alive = false;
                this.boss.hp -= b.dmg || 1;
                Sound.playBossHit();
                this.particles.triggerShake(4);
                this.particles.addSparks(b.x, b.y, 6, '#ff0055');

                if (this.boss.hp <= 0) {
                    this.boss.alive = false;
                    this.state = 'CLEAR';
                    Sound.playVictory();
                    this.score += 10000;
                    this.particles.triggerShake(16);
                    this.particles.addSparks(this.boss.x + 24, this.boss.y + 32, 40, '#ffd700');
                }
            }

            // Check hitting weapon capsules
            for (const cap of this.capsules) {
                if (cap.alive && this.boxesOverlap(b, cap)) {
                    cap.alive = false;
                    b.alive = false;
                    // Drop weapon upgrade icon
                    this.capsules.push({
                        x: cap.x,
                        y: cap.y,
                        vx: 0,
                        vy: 2.0,
                        weapon: cap.weapon,
                        isDropped: true,
                        alive: true
                    });
                    Sound.playSpring();
                }
            }

            if (!b.alive || b.x < this.cameraX - 40 || b.x > this.cameraX + 860 || b.y < 0 || b.y > 400) {
                this.bullets.splice(i, 1);
            }
        }

        // 6. Update Weapon Capsules
        for (let i = this.capsules.length - 1; i >= 0; i--) {
            const cap = this.capsules[i];
            if (!cap.alive) continue;

            if (cap.isDropped) {
                cap.y += cap.vy;
                if (cap.y > 280) cap.vy = 0;

                // Player pickup
                if (this.boxesOverlap(p, cap)) {
                    p.weapon = cap.weapon;
                    this.score += 1000;
                    Sound.playVictory();
                    this.particles.addText(p.x, p.y - 12, `[${cap.weapon}] GUN EQUIPPED!`, '#ffd700', 1.2);
                    this.capsules.splice(i, 1);
                    continue;
                }
            } else {
                cap.x += cap.vx;
                cap.y += Math.sin(cap.x * 0.05) * 0.8;
            }
        }

        // 7. Update Enemies & Enemy Bullets
        for (const e of this.enemies) {
            if (!e.alive) continue;

            e.shootTimer++;
            if (e.shootTimer > 90) {
                e.shootTimer = 0;
                // Shoot bullet toward player
                const angle = Math.atan2(p.y - e.y, p.x - e.x);
                this.enemyBullets.push({
                    x: e.x,
                    y: e.y + 4,
                    vx: Math.cos(angle) * 3.2,
                    vy: Math.sin(angle) * 3.2,
                    width: 6,
                    height: 6
                });
            }
        }

        // Update Boss Shooting
        if (this.boss && this.boss.alive && Math.abs(this.boss.x - p.x) < 450) {
            this.boss.shootTimer++;
            if (this.boss.shootTimer % 45 === 0) {
                Sound.playShoot();
                // Dual missile volley
                this.enemyBullets.push({ x: this.boss.x, y: this.boss.y + 16, vx: -4.0, vy: -0.5, width: 8, height: 8 });
                this.enemyBullets.push({ x: this.boss.x, y: this.boss.y + 42, vx: -4.0, vy: 0.8, width: 8, height: 8 });
            }
        }

        // Update Enemy Bullets & Player Hit
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const eb = this.enemyBullets[i];
            eb.x += eb.vx;
            eb.y += eb.vy;

            if (p.invulnTimer <= 0 && this.boxesOverlap(eb, p)) {
                this.killPlayer();
                this.enemyBullets.splice(i, 1);
                continue;
            }

            if (eb.x < this.cameraX - 40 || eb.x > this.cameraX + 860 || eb.y < 0 || eb.y > 400) {
                this.enemyBullets.splice(i, 1);
            }
        }

        // Camera follow
        if (p.x - this.cameraX > 320) {
            this.cameraX = p.x - 320;
        }

        // Fall into water/pit
        if (p.y > 360) {
            this.killPlayer();
        }

        this.particles.update();
    }

    fireBullet(p) {
        Sound.playShoot();
        const speed = 7.0;
        let bvx = p.facing === 'right' ? speed : -speed;
        let bvy = 0;
        let bx = p.facing === 'right' ? p.x + p.width + 4 : p.x - 6;
        let by = p.y + (p.isCrouching ? 10 : 4);

        if (p.aimDir === 'up') {
            bvx = 0;
            bvy = -speed;
            bx = p.x + p.width / 2;
            by = p.y - 6;
        } else if (p.aimDir === 'diag_up') {
            bvx = (p.facing === 'right' ? speed : -speed) * 0.707;
            bvy = -speed * 0.707;
            by = p.y - 4;
        } else if (p.aimDir === 'diag_down') {
            bvx = (p.facing === 'right' ? speed : -speed) * 0.707;
            bvy = speed * 0.707;
            by = p.y + p.height;
        } else if (p.aimDir === 'down') {
            bvx = 0;
            bvy = speed;
            bx = p.x + p.width / 2;
            by = p.y + p.height;
        }

        if (p.weapon === 'S') {
            // SPREAD GUN: 5-way spread!
            const angles = [-0.3, -0.15, 0, 0.15, 0.3];
            const baseAngle = Math.atan2(bvy, bvx);
            angles.forEach(a => {
                const angle = baseAngle + a;
                this.bullets.push({
                    x: bx,
                    y: by,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    width: 7,
                    height: 7,
                    glyph: '*',
                    color: '#ff3344',
                    alive: true,
                    dmg: 2
                });
            });
            this.particles.triggerShake(2);
        } else if (p.weapon === 'L') {
            // LASER: Piercing beam
            this.bullets.push({
                x: bx,
                y: by,
                vx: bvx * 1.3,
                vy: bvy * 1.3,
                width: 14,
                height: 6,
                glyph: '====',
                color: '#ff00aa',
                alive: true,
                dmg: 4
            });
            this.particles.triggerShake(3);
        } else {
            // STANDARD / MACHINE GUN
            this.bullets.push({
                x: bx,
                y: by,
                vx: bvx,
                vy: bvy,
                width: 6,
                height: 6,
                glyph: '•',
                color: '#ffee33',
                alive: true,
                dmg: 1
            });
        }
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
        this.player.weapon = 'R';
        if (this.lives <= 0) {
            this.state = 'GAME_OVER';
        } else {
            this.player.x = Math.max(48, this.cameraX + 48);
            this.player.y = 220;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.invulnTimer = 80;
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Dark jungle night sky
        ctx.fillStyle = '#08140c';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.font = 'bold 15px "Courier New", monospace';

        // 1. Distant Jungle Silhouette
        ctx.fillStyle = '#103318';
        for (let i = 0; i < 10; i++) {
            ctx.fillText("/\\/\\  /\\/\\   /\\/\\/\\  /\\/\\", i * 160 - (this.cameraX * 0.3) % 160, 180);
        }

        // 2. Render Platforms & Ground
        for (let r = 0; r < this.levelHeight; r++) {
            for (let c = Math.floor(this.cameraX / 16); c < Math.ceil((this.cameraX + w) / 16); c++) {
                if (c >= this.levelWidth) continue;
                const tile = this.map[r][c];
                const sx = Math.round(c * 16 - this.cameraX);
                const sy = Math.round(r * 16);

                if (tile === '#') {
                    ctx.fillStyle = '#225522';
                    ctx.fillText('#', sx, sy + 14);
                } else if (tile === '=') {
                    ctx.fillStyle = '#448844';
                    ctx.fillText('=', sx, sy + 14);
                }
            }
        }

        // 3. Render Weapon Capsules
        for (const cap of this.capsules) {
            if (!cap.alive) continue;
            const sx = Math.round(cap.x - this.cameraX);
            ctx.fillStyle = '#00f0ff';
            ctx.fillText(`[${cap.weapon}]`, sx, cap.y + 12);
        }

        // 4. Render Bullets
        for (const b of this.bullets) {
            const sx = Math.round(b.x - this.cameraX);
            ctx.fillStyle = b.color || '#ffee33';
            ctx.fillText(b.glyph || '•', sx, b.y + 6);
        }

        // Enemy Bullets
        ctx.fillStyle = '#ff2222';
        for (const eb of this.enemyBullets) {
            const sx = Math.round(eb.x - this.cameraX);
            ctx.fillText('¤', sx, eb.y + 6);
        }

        // 5. Render Enemies
        for (const e of this.enemies) {
            if (!e.alive) continue;
            const sx = Math.round(e.x - this.cameraX);
            ctx.fillStyle = '#ff4444';
            if (e.type === 'turret') ctx.fillText('[T]', sx, e.y + 14);
            else if (e.type === 'sniper') ctx.fillText('E-=', sx, e.y + 14);
            else ctx.fillText('w', sx, e.y + 14);
        }

        // 6. Render Alien Wall Boss
        if (this.boss && this.boss.alive) {
            const sx = Math.round(this.boss.x - this.cameraX);
            const sy = Math.round(this.boss.y);
            ctx.fillStyle = '#ff0055';
            ctx.fillText(" [== ALIEN DEFENSE ==] ", sx - 20, sy);
            ctx.fillText(" |  <O>   [CORE]   <O> | ", sx - 20, sy + 16);
            ctx.fillText(" [====================] ", sx - 20, sy + 32);
            ctx.fillText(` HP: ${this.boss.hp} / ${this.boss.maxHp}`, sx, sy + 50);
        }

        // 7. Render Player Commando
        const p = this.player;
        if (p.invulnTimer <= 0 || Math.floor(p.invulnTimer / 4) % 2 === 0) {
            const sx = Math.round(p.x + p.width / 2 - this.cameraX);
            const sy = Math.round(p.y + p.height / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#00f0ff';

            if (!p.onGround) {
                // Somersaulting ball
                const frames = ['@', 'O', '0', 'o'];
                ctx.fillText(frames[p.spinFrame], sx, sy);
            } else if (p.isCrouching) {
                ctx.fillText('_o-=', sx, sy + 4);
            } else {
                if (p.aimDir === 'up') ctx.fillText('o|', sx, sy);
                else if (p.aimDir === 'diag_up') ctx.fillText(p.facing === 'right' ? 'o/' : '\\o', sx, sy);
                else ctx.fillText(p.facing === 'right' ? 'o-=' : '=-o', sx, sy);
            }
        }

        // 8. Particles
        this.particles.render(ctx, this.cameraX, 0, { dim: '#ff8800', bright: '#ffff00' });

        // 9. HUD Bar
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`CONTRA: ${this.score.toString().padStart(6, '0')}`, 16, 20);
        ctx.fillText(`WEAPON: [${p.weapon}]`, 260, 20);
        ctx.fillText(`LIVES: ${'♥'.repeat(Math.max(0, this.lives))}`, 450, 20);
        ctx.fillText(`STAGE: 1 JUNGLE`, 650, 20);

        if (this.state === 'CLEAR') {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 22px "Courier New", monospace';
            ctx.fillText("MISSION COMPLETE!", w / 2, h / 2 - 20);
            ctx.font = '13px "Courier New", monospace';
            ctx.fillText("PRESS [ENTER] OR TAP TO REPLAY", w / 2, h / 2 + 20);
        } else if (this.state === 'GAME_OVER') {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ff2222';
            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillText("GAME OVER", w / 2, h / 2);
        }

        ctx.restore();
    }
}

window.ContraGame = ContraGame;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContraGame;
}
