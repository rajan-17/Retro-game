// Particle and Floating Text System with Screen Shake
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.shake = 0;
        this.shakeDecay = 0.88;
    }

    reset() {
        this.particles = [];
        this.floatingTexts = [];
        this.shake = 0;
    }

    triggerShake(intensity = 6) {
        this.shake = Math.max(this.shake, intensity);
    }

    getShakeOffset() {
        if (this.shake < 0.2) return { x: 0, y: 0 };
        return {
            x: (Math.random() - 0.5) * this.shake * 2,
            y: (Math.random() - 0.5) * this.shake * 2
        };
    }

    addText(x, y, text, color = null, scale = 1.0) {
        this.floatingTexts.push({
            x: x,
            y: y,
            vy: -0.9 - Math.random() * 0.4,
            text: text,
            color: color,
            alpha: 1.0,
            life: 45,
            maxLife: 45,
            scale: scale
        });
    }

    addDust(x, y, count = 4, vxBias = 0) {
        const glyphs = ['.', 'o', '*', '~', '`'];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 4,
                vx: vxBias + (Math.random() - 0.5) * 1.5,
                vy: -Math.random() * 1.2,
                glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
                alpha: 0.9,
                life: 18 + Math.floor(Math.random() * 8),
                maxLife: 26,
                color: null
            });
        }
    }

    addSlashArc(x, y, facing, color = '#26ff48') {
        const arcGlyphs = facing === 'right' ? ['/', ')', '>', '}'] : ['\\', '(', '<', '{'];
        for (let i = 0; i < 6; i++) {
            const offsetX = facing === 'right' ? (8 + i * 4) : -(8 + i * 4);
            const offsetY = (i - 2.5) * 4;
            this.particles.push({
                x: x + offsetX,
                y: y + offsetY,
                vx: (facing === 'right' ? 1.5 : -1.5) + (Math.random() - 0.5),
                vy: (Math.random() - 0.5) * 1.2,
                glyph: arcGlyphs[Math.floor(Math.random() * arcGlyphs.length)],
                alpha: 1.0,
                life: 10 + Math.floor(Math.random() * 6),
                maxLife: 16,
                color: color
            });
        }
    }

    addDashGhost(x, y, facing, glyph = 'o', color = '#00f0ff') {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            glyph: glyph,
            alpha: 0.65,
            life: 12,
            maxLife: 12,
            color: color
        });
    }

    addSparks(x, y, count = 8, color = null) {
        const glyphs = ['*', '+', 'x', '#', '°'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 1.4 + Math.random() * 2.8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.0,
                gravity: 0.16,
                glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
                alpha: 1.0,
                life: 25 + Math.floor(Math.random() * 15),
                maxLife: 40,
                color: color
            });
        }
    }

    update() {
        if (this.shake > 0.1) {
            this.shake *= this.shakeDecay;
        } else {
            this.shake = 0;
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.gravity) p.vy += p.gravity;
            p.life--;
            p.alpha = Math.max(0, p.life / p.maxLife);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.life--;
            t.alpha = Math.max(0, t.life / t.maxLife);
            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    render(ctx, cameraX, cameraY, theme) {
        ctx.save();
        ctx.font = `bold ${CONFIG.TILE_SIZE - 2}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const p of this.particles) {
            ctx.fillStyle = p.color || theme.dim;
            ctx.globalAlpha = p.alpha;
            ctx.fillText(p.glyph, Math.round(p.x - cameraX), Math.round(p.y - cameraY));
        }

        ctx.font = `bold ${CONFIG.TILE_SIZE}px monospace`;
        for (const t of this.floatingTexts) {
            ctx.fillStyle = t.color || theme.bright;
            ctx.globalAlpha = t.alpha;
            ctx.fillText(t.text, Math.round(t.x - cameraX), Math.round(t.y - cameraY));
        }

        ctx.restore();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}

if (typeof window !== 'undefined') window.ParticleSystem = ParticleSystem;
