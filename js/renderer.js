// ASCII Canvas Renderer with Screen Shake, Boss HUD, and Projectiles
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraX = 0;
        this.cameraY = 0;
        this.currentTheme = CONFIG.THEMES.matrix;
        this.scanlinesEnabled = true;

        this.fontSize = CONFIG.TILE_SIZE;
        this.fontFamily = '"Courier New", Courier, monospace';
    }

    setTheme(themeKey) {
        if (CONFIG.THEMES[themeKey]) {
            this.currentTheme = CONFIG.THEMES[themeKey];
        }
    }

    toggleScanlines() {
        this.scanlinesEnabled = !this.scanlinesEnabled;
        return this.scanlinesEnabled;
    }

    updateCamera(player, level, particles) {
        const targetX = player.x + player.width / 2 - (this.canvas.width / 2);
        const targetY = player.y + player.height / 2 - (this.canvas.height / 2);

        this.cameraX += (targetX - this.cameraX) * 0.12;
        this.cameraY += (targetY - this.cameraY) * 0.12;

        const maxCamX = level.width * CONFIG.TILE_SIZE - this.canvas.width;
        const maxCamY = level.height * CONFIG.TILE_SIZE - this.canvas.height;

        this.cameraX = Math.max(0, Math.min(this.cameraX, Math.max(0, maxCamX)));
        this.cameraY = Math.max(0, Math.min(this.cameraY, Math.max(0, maxCamY)));

        // Screen shake offset
        if (particles) {
            const shake = particles.getShakeOffset();
            this.cameraX += shake.x;
            this.cameraY += shake.y;
        }
    }

    render(level, player, enemies, collectibles, exitPortal, particles, projectiles, boss) {
        const ctx = this.ctx;
        const theme = this.currentTheme;

        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Parallax Scenery
        this.renderParallax(level);

        // 2. Map Tiles
        this.renderMap(level);

        // 3. Collectibles & Exit
        this.renderCollectibles(collectibles);
        if (exitPortal) {
            this.renderExitPortal(exitPortal);
        }

        // 4. Boss (if stage has boss)
        if (boss) {
            boss.render(ctx, this.cameraX, this.cameraY, theme);
            this.renderBossHealthBar(boss);
        }

        // 5. Enemies
        this.renderEnemies(enemies);

        // 6. Projectiles
        this.renderProjectiles(projectiles);

        // 7. Player
        this.renderPlayer(player);

        // 8. Particles & Screen Texts
        particles.render(ctx, this.cameraX, this.cameraY, theme);

        // 9. CRT Scanlines
        if (this.scanlinesEnabled) {
            this.renderScanlines();
        }
    }

    renderParallax(level) {
        const ctx = this.ctx;
        const theme = this.currentTheme;
        const bgArt = BACKGROUNDS[level.bgTheme] || BACKGROUNDS.digital_city;
        
        ctx.save();
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = theme.dim;
        ctx.globalAlpha = 0.35;

        const parallaxOffsetX = (this.cameraX * 0.25) % (this.fontSize * 10);
        const startY = 30;

        for (let row = 0; row < bgArt.length; row++) {
            const line = bgArt[row];
            const y = startY + row * (this.fontSize + 4);
            for (let repeat = -1; repeat < 3; repeat++) {
                const x = repeat * (line.length * (this.fontSize * 0.6)) - parallaxOffsetX;
                ctx.fillText(line, x, y);
            }
        }
        ctx.restore();
    }

    renderMap(level) {
        const ctx = this.ctx;
        const theme = this.currentTheme;
        const ts = CONFIG.TILE_SIZE;

        const startCol = Math.max(0, Math.floor(this.cameraX / ts));
        const endCol = Math.min(level.width - 1, Math.ceil((this.cameraX + this.canvas.width) / ts));
        const startRow = Math.max(0, Math.floor(this.cameraY / ts));
        const endRow = Math.min(level.height - 1, Math.ceil((this.cameraY + this.canvas.height) / ts));

        ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = level.map[r][c];
                if (tile === CONFIG.TILES.EMPTY || tile === ' ') continue;

                const screenX = Math.round(c * ts - this.cameraX);
                const screenY = Math.round(r * ts - this.cameraY);

                if (tile === CONFIG.TILES.SOLID) {
                    ctx.fillStyle = theme.border;
                    ctx.fillText('#', screenX, screenY);
                } else if (tile === CONFIG.TILES.ONE_WAY) {
                    ctx.fillStyle = theme.fg;
                    ctx.fillText('=', screenX, screenY);
                } else if (tile === CONFIG.TILES.SPIKE || tile === CONFIG.TILES.SPIKE_DOWN) {
                    ctx.fillStyle = theme.hazard;
                    ctx.fillText(tile, screenX, screenY);
                } else if (tile === CONFIG.TILES.SPRING) {
                    ctx.fillStyle = theme.accent;
                    ctx.fillText('^', screenX, screenY);
                }
            }
        }
    }

    renderCollectibles(collectibles) {
        const ctx = this.ctx;
        const theme = this.currentTheme;

        ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const item of collectibles) {
            if (item.collected) continue;
            const sx = Math.round(item.x + item.width / 2 - this.cameraX);
            const sy = Math.round(item.y + item.height / 2 - this.cameraY);

            ctx.fillStyle = item.isGem ? theme.bright : theme.accent;
            ctx.fillText(item.getGlyph(), sx, sy);
        }
    }

    renderExitPortal(portal) {
        const ctx = this.ctx;
        const theme = this.currentTheme;

        ctx.font = `bold ${this.fontSize + 2}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = theme.bright;

        const sx = Math.round(portal.x + portal.width / 2 - this.cameraX);
        const sy = Math.round(portal.y + portal.height / 2 - this.cameraY);
        ctx.fillText(portal.getGlyph(), sx, sy);
    }

    renderEnemies(enemies) {
        const ctx = this.ctx;
        const theme = this.currentTheme;

        ctx.font = `bold ${this.fontSize + 1}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            const sx = Math.round(enemy.x + enemy.width / 2 - this.cameraX);
            const sy = Math.round(enemy.y + enemy.height / 2 - this.cameraY);

            ctx.fillStyle = theme.hazard;
            ctx.fillText(enemy.getGlyph(), sx, sy);
        }
    }

    renderProjectiles(projectiles) {
        if (!projectiles) return;
        const ctx = this.ctx;

        ctx.save();
        ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const p of projectiles) {
            if (!p.alive) continue;
            const sx = Math.round(p.x - this.cameraX);
            const sy = Math.round(p.y - this.cameraY);
            ctx.fillStyle = p.color;
            ctx.fillText(p.glyph, sx, sy);
        }
        ctx.restore();
    }

    renderBossHealthBar(boss) {
        if (!boss.alive) return;
        const ctx = this.ctx;
        const theme = this.currentTheme;
        const barW = 280;
        const barH = 14;
        const x = (this.canvas.width - barW) / 2;
        const y = 14;

        ctx.save();
        // Background frame
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 2, y - 2, barW + 4, barH + 4);
        ctx.strokeStyle = theme.boss;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 2, y - 2, barW + 4, barH + 4);

        // Fill
        const pct = Math.max(0, boss.hp / boss.maxHp);
        ctx.fillStyle = theme.boss;
        ctx.fillRect(x, y, barW * pct, barH);

        // Boss Title
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`[ MEGA-DAEMON ] HP: ${boss.hp} / ${boss.maxHp}`, x + barW / 2, y + barH / 2 + 3);
        ctx.restore();
    }

    renderPlayer(player) {
        if (player.dead) return;
        const ctx = this.ctx;
        const theme = this.currentTheme;

        if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.font = `bold ${this.fontSize + 2}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const sx = Math.round(player.x + player.width / 2 - this.cameraX);
        const sy = Math.round(player.y + player.height / 2 - this.cameraY);

        ctx.shadowColor = theme.fg;
        ctx.shadowBlur = 6;
        ctx.fillStyle = theme.bright;
        ctx.fillText(player.getGlyph(), sx, sy);

        // Render Slash Blade Visual
        if (player.isSlashing) {
            ctx.fillStyle = theme.accent;
            const slashOffset = player.facing === 'right' ? 18 : -18;
            ctx.fillText(player.facing === 'right' ? ')' : '(', sx + slashOffset, sy);
        }

        ctx.restore();
    }

    renderScanlines() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let y = 0; y < this.canvas.height; y += 3) {
            ctx.fillRect(0, y, this.canvas.width, 1);
        }
        ctx.restore();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}

if (typeof window !== 'undefined') window.Renderer = Renderer;
