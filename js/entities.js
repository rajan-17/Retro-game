// Game Entities: Player, Boss, Enemies, Projectiles, and Collectibles
class Player {
    constructor(x, y) {
        this.spawnX = x;
        this.spawnY = y;
        this.hasTripleJump = false;
        this.hasMagnet = false;
        this.bladeLevel = 0;
        this.dashCooldownMax = 45;
        this.reset();
    }

    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.width = 12;
        this.height = 15;
        this.vx = 0;
        this.vy = 0;
        this.facing = 'right';
        this.onGround = false;
        this.jumpsLeft = 2; // Default double jump
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.invulnerableTimer = 0;

        // Combat & Dash state
        this.isSlashing = false;
        this.slashTimer = 0;
        this.slashCooldown = 0;
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;

        this.animFrame = 0;
        this.animTimer = 0;
        this.dead = false;
        this.isExiting = false;
    }

    update(input, level, physics, particles, sound, projectiles) {
        if (this.dead || this.isExiting) return;

        // Timers & Cooldowns
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;
        if (this.slashCooldown > 0) this.slashCooldown--;
        if (this.dashCooldown > 0) this.dashCooldown--;

        if (this.slashTimer > 0) {
            this.slashTimer--;
            if (this.slashTimer <= 0) this.isSlashing = false;
        }

        // 1. DASH LOGIC
        if (this.isDashing) {
            this.dashTimer--;
            this.vx = this.facing === 'right' ? CONFIG.PHYSICS.DASH_SPEED : -CONFIG.PHYSICS.DASH_SPEED;
            this.vy = 0; // Float horizontally during dash
            particles.addDashGhost(this.x, this.y, this.facing, this.getGlyph());
            physics.moveHorizontal(this, this.vx, level);

            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.vx *= 0.4;
            }
            return; // Skip normal movement while dashing
        }

        if (input.dashJustPressed && this.dashCooldown <= 0) {
            this.isDashing = true;
            this.dashTimer = CONFIG.PHYSICS.DASH_DURATION;
            this.dashCooldown = this.dashCooldownMax;
            this.invulnerableTimer = CONFIG.PHYSICS.DASH_DURATION + 4;
            sound.playDash();
            particles.triggerShake(3);
            particles.addText(this.x + this.width / 2, this.y - 6, "DASH!", "#00f0ff", 0.9);
            return;
        }

        // 2. MELEE SLASH LOGIC
        if (input.slashJustPressed && this.slashCooldown <= 0) {
            this.isSlashing = true;
            this.slashTimer = CONFIG.PHYSICS.SLASH_DURATION;
            this.slashCooldown = CONFIG.PHYSICS.SLASH_COOLDOWN;
            sound.playSlash();
            particles.triggerShake(4);
            particles.addSlashArc(this.x + this.width / 2, this.y + this.height / 2, this.facing);
        }

        // 3. RANGED BLASTER LOGIC
        if (input.shootJustPressed && projectiles) {
            const pvx = this.facing === 'right' ? CONFIG.PHYSICS.PROJECTILE_SPEED : -CONFIG.PHYSICS.PROJECTILE_SPEED;
            const px = this.facing === 'right' ? this.x + this.width + 2 : this.x - 6;
            projectiles.push(new Projectile(px, this.y + 4, pvx, 0, true));
            sound.playShoot();
        }

        // 4. HORIZONTAL MOVEMENT
        let moveDir = 0;
        if (input.left) moveDir -= 1;
        if (input.right) moveDir += 1;

        if (moveDir !== 0) {
            this.facing = moveDir > 0 ? 'right' : 'left';
            const accel = this.onGround ? CONFIG.PHYSICS.ACCELERATION : CONFIG.PHYSICS.AIR_ACCELERATION;
            this.vx += moveDir * accel;
            if (Math.abs(this.vx) > CONFIG.PHYSICS.MAX_RUN_SPEED) {
                this.vx = moveDir * CONFIG.PHYSICS.MAX_RUN_SPEED;
            }

            this.animTimer++;
            if (this.animTimer % 6 === 0) {
                this.animFrame = (this.animFrame + 1) % 4;
                if (this.onGround && Math.random() < 0.4) {
                    particles.addDust(this.x + this.width / 2, this.y + this.height, 1, -moveDir * 0.5);
                }
            }
        } else {
            const decel = this.onGround ? CONFIG.PHYSICS.DECELERATION : CONFIG.PHYSICS.AIR_DECELERATION;
            this.vx *= decel;
            if (Math.abs(this.vx) < 0.05) this.vx = 0;
            this.animFrame = 0;
        }

        // 5. JUMP LOGIC (Single, Double, and Triple Jump)
        const maxJumps = this.hasTripleJump ? 3 : 2;
        if (this.onGround) {
            this.coyoteTimer = CONFIG.PHYSICS.COYOTE_TIME;
            this.jumpsLeft = maxJumps;
        } else if (this.coyoteTimer > 0) {
            this.coyoteTimer--;
        }

        if (input.jumpJustPressed) {
            this.jumpBufferTimer = CONFIG.PHYSICS.JUMP_BUFFER;
        } else if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer--;
        }

        if (this.jumpBufferTimer > 0) {
            if (this.coyoteTimer > 0) {
                this.vy = CONFIG.PHYSICS.JUMP_FORCE;
                this.onGround = false;
                this.coyoteTimer = 0;
                this.jumpBufferTimer = 0;
                this.jumpsLeft = maxJumps - 1;
                sound.playJump();
                particles.addDust(this.x + this.width / 2, this.y + this.height, 4, 0);
            } else if (this.jumpsLeft > 0) {
                const isThird = this.jumpsLeft === 1 && this.hasTripleJump;
                this.vy = isThird ? CONFIG.PHYSICS.TRIPLE_JUMP_FORCE : CONFIG.PHYSICS.DOUBLE_JUMP_FORCE;
                this.jumpsLeft--;
                this.jumpBufferTimer = 0;
                sound.playDoubleJump();
                particles.addText(this.x + this.width / 2, this.y - 4, isThird ? "TRIPLE!" : "DOUBLE!", "#00f0ff", 0.9);
                particles.addDust(this.x + this.width / 2, this.y + this.height, 5, 0);
            }
        }

        if (!input.jump && this.vy < -2.5) {
            this.vy *= 0.65;
        }

        // Apply Gravity
        this.vy += CONFIG.PHYSICS.GRAVITY;
        if (this.vy > CONFIG.PHYSICS.MAX_FALL_SPEED) {
            this.vy = CONFIG.PHYSICS.MAX_FALL_SPEED;
        }

        // Move & Collide
        const wasOnGround = this.onGround;
        physics.moveHorizontal(this, this.vx, level);
        physics.moveVertical(this, this.vy, level, (springX, springY) => {
            sound.playSpring();
            this.jumpsLeft = maxJumps; // Reset jumps on spring!
            particles.addText((springX + 0.5) * CONFIG.TILE_SIZE, (springY - 0.5) * CONFIG.TILE_SIZE, "BOING!", "#ffee33");
            particles.addDust((springX + 0.5) * CONFIG.TILE_SIZE, springY * CONFIG.TILE_SIZE, 6);
        });

        if (!wasOnGround && this.onGround) {
            particles.addDust(this.x + this.width / 2, this.y + this.height, 3);
        }

        // Spikes check
        if (!this.isDashing && physics.checkHazard(this, level)) {
            this.takeDamage(1, particles, sound);
        }

        // Void check
        if (this.y > level.height * CONFIG.TILE_SIZE + 32) {
            this.takeDamage(1, particles, sound, true);
        }
    }

    takeDamage(amount, particles, sound, instaKill = false) {
        if (this.invulnerableTimer > 0 && !instaKill) return false;

        this.invulnerableTimer = CONFIG.PHYSICS.INVULNERABILITY_TIME;
        sound.playHurt();
        particles.triggerShake(7);
        particles.addSparks(this.x + this.width / 2, this.y + this.height / 2, 10, CONFIG.THEMES.classic.hazard);
        particles.addText(this.x + this.width / 2, this.y - 6, "OUCH!", "#ff3344");

        this.vy = -3.5;
        this.vx = this.facing === 'right' ? -2.2 : 2.2;
        return true;
    }

    getGlyph() {
        if (this.dead) return 'x';
        if (this.isSlashing) return this.facing === 'right' ? '»' : '«';
        if (this.isDashing) return '►';
        if (!this.onGround) return this.vy < 0 ? '▲' : 'v';
        if (Math.abs(this.vx) > 0.3) {
            return (this.animFrame % 2 === 0) ? 'o' : 'ô';
        }
        return 'o';
    }
}

// Projectile Class (Player & Enemy bullets)
class Projectile {
    constructor(x, y, vx, vy, isPlayer = false, glyph = '•', color = '#00f0ff') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 8;
        this.height = 8;
        this.isPlayer = isPlayer;
        this.glyph = glyph;
        this.color = color;
        this.alive = true;
        this.life = 90;
    }

    update(level, physics) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.life <= 0) {
            this.alive = false;
            return;
        }
        // Wall collision
        if (physics.isPointSolid(this.x + 4, this.y + 4, level)) {
            this.alive = false;
        }
    }
}

// Mega-Daemon Boss Entity (Multi-phase ASCII Boss)
class BossDaemon {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 36;
        this.maxHp = 25;
        this.hp = 25;
        this.alive = true;
        this.state = 'hover'; // hover, charge, shoot_barrage
        this.stateTimer = 0;
        this.phase = 1;
        this.timer = 0;
        this.invulnerableTimer = 0;
    }

    update(player, level, physics, particles, sound, projectiles) {
        if (!this.alive) return;

        this.timer++;
        this.stateTimer++;
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;

        // Phase shift at 50% HP
        if (this.hp <= this.maxHp / 2 && this.phase === 1) {
            this.phase = 2;
            sound.playBossRoar();
            particles.triggerShake(12);
            particles.addText(this.x + 24, this.y - 12, "PHASE 2: OVERDRIVE!", "#ff0055", 1.3);
        }

        // State Machine
        if (this.state === 'hover') {
            this.y = this.startY + Math.sin(this.timer * 0.05) * 16;
            this.x = this.startX + Math.cos(this.timer * 0.03) * 25;

            // Attack trigger
            const attackInterval = this.phase === 2 ? 80 : 120;
            if (this.stateTimer > attackInterval) {
                this.stateTimer = 0;
                this.state = Math.random() < 0.5 ? 'shoot_barrage' : 'charge';
                if (this.state === 'charge') {
                    particles.addText(this.x + 24, this.y - 10, "CHARGE!", "#ff3344", 1.1);
                }
            }
        } else if (this.state === 'charge') {
            // Rush toward player horizontally
            const dir = player.x < this.x ? -1 : 1;
            this.x += dir * (this.phase === 2 ? 4.5 : 3.0);
            particles.addDust(this.x + 24, this.y + 36, 2);

            if (this.stateTimer > 45) {
                this.state = 'hover';
                this.stateTimer = 0;
            }
        } else if (this.state === 'shoot_barrage') {
            // Fire ring or aimed shots
            if (this.stateTimer % 14 === 0) {
                sound.playShoot();
                const angle = Math.atan2((player.y - this.y), (player.x - this.x));
                const speed = this.phase === 2 ? 4.5 : 3.2;
                projectiles.push(new Projectile(this.x + 24, this.y + 18, Math.cos(angle) * speed, Math.sin(angle) * speed, false, '¤', '#ff0055'));
            }

            if (this.stateTimer > 45) {
                this.state = 'hover';
                this.stateTimer = 0;
            }
        }
    }

    takeDamage(amount, particles, sound) {
        if (!this.alive || this.invulnerableTimer > 0) return false;

        this.hp -= amount;
        this.invulnerableTimer = 18;
        sound.playBossHit();
        particles.triggerShake(5);
        particles.addSparks(this.x + 24, this.y + 18, 12, '#ff0055');
        particles.addText(this.x + 24, this.y - 8, `-${amount}`, '#ff0055', 1.2);

        if (this.hp <= 0) {
            this.alive = false;
            particles.triggerShake(16);
            particles.addSparks(this.x + 24, this.y + 18, 40, '#ffd700');
            particles.addText(this.x + 24, this.y - 10, "SYSTEM LIBERATED!", "#26ff48", 1.6);
            sound.playVictory();
        }
        return true;
    }

    render(ctx, cameraX, cameraY, theme) {
        if (!this.alive) return;
        if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 3) % 2 === 0) return;

        const sx = Math.round(this.x - cameraX);
        const sy = Math.round(this.y - cameraY);

        ctx.save();
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = theme.boss || '#ff0055';
        ctx.shadowColor = theme.boss;
        ctx.shadowBlur = 8;

        // Multi-line ASCII Boss art
        const lines = [
            "  /=====\\  ",
            " [ (o_O) ] ",
            "<|==|=|==|>",
            "  \\_v_v_/  "
        ];

        lines.forEach((l, idx) => {
            ctx.fillText(l, sx + 24, sy + idx * 12);
        });

        ctx.restore();
    }
}

// Slime Enemy
class EnemySlime {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 14;
        this.height = 12;
        this.vx = 0.8;
        this.onGround = true;
        this.alive = true;
        this.type = 'slime';
        this.animTimer = 0;
    }

    update(level, physics, particles, sound) {
        if (!this.alive) return;
        this.animTimer++;
        const nextX = this.x + this.vx;
        const frontX = this.vx > 0 ? nextX + this.width + 1 : nextX - 1;
        const tileFront = physics.getTile(Math.floor(frontX / CONFIG.TILE_SIZE), Math.floor((this.y + 4) / CONFIG.TILE_SIZE), level);
        const groundAhead = physics.getTile(Math.floor(frontX / CONFIG.TILE_SIZE), Math.floor((this.y + this.height + 2) / CONFIG.TILE_SIZE), level);

        if (tileFront === CONFIG.TILES.SOLID || groundAhead !== CONFIG.TILES.SOLID && groundAhead !== CONFIG.TILES.ONE_WAY) {
            this.vx = -this.vx;
        } else {
            this.x = nextX;
        }
    }

    getGlyph() {
        return (this.animTimer % 20 < 10) ? 'w' : 'm';
    }
}

// Flying Drone Enemy
class EnemyFlyer {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 14;
        this.height = 12;
        this.alive = true;
        this.type = 'flyer';
        this.timer = Math.random() * Math.PI * 2;
    }

    update() {
        if (!this.alive) return;
        this.timer += 0.05;
        this.y = this.startY + Math.sin(this.timer) * 18;
    }

    getGlyph() {
        return Math.sin(this.timer) > 0 ? 'v' : 'V';
    }
}

// Collectible Item
class Collectible {
    constructor(x, y, isGem = false) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 12;
        this.isGem = isGem;
        this.value = isGem ? 500 : 100;
        this.collected = false;
        this.timer = Math.random() * 10;
    }

    update() {
        this.timer += 0.08;
    }

    getGlyph() {
        if (this.isGem) return '♦';
        return Math.sin(this.timer) > 0 ? '$' : '¢';
    }
}

// Exit Portal
class ExitPortal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.timer = 0;
    }

    update() {
        this.timer += 0.1;
    }

    getGlyph() {
        const frames = ['[E]', '[#]', '[@]', '[*]'];
        const idx = Math.floor(this.timer) % frames.length;
        return frames[idx];
    }
}

if (typeof window !== 'undefined') {
    window.Player = Player;
    window.Projectile = Projectile;
    window.BossDaemon = BossDaemon;
    window.EnemySlime = EnemySlime;
    window.EnemyFlyer = EnemyFlyer;
    window.Collectible = Collectible;
    window.ExitPortal = ExitPortal;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player, Projectile, BossDaemon, EnemySlime, EnemyFlyer, Collectible, ExitPortal };
}
