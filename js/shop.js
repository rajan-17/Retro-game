// Cyber Terminal Shop System
class ShopSystem {
    constructor(game) {
        this.game = game;
        this.upgrades = {
            heart: 0,
            blade: 0,
            triple_jump: 0,
            magnet: 0,
            overclock_dash: 0
        };
    }

    reset() {
        this.upgrades = {
            heart: 0,
            blade: 0,
            triple_jump: 0,
            magnet: 0,
            overclock_dash: 0
        };
    }

    canAfford(item) {
        return this.game.coins >= item.cost && this.upgrades[item.id] < item.maxLevel;
    }

    buy(item) {
        if (!this.canAfford(item)) return false;
        
        this.game.coins -= item.cost;
        this.upgrades[item.id]++;

        // Apply immediately to player
        if (item.id === 'heart') {
            this.game.maxLives++;
            this.game.lives = Math.min(this.game.lives + 1, this.game.maxLives);
        } else if (item.id === 'triple_jump') {
            this.game.player.hasTripleJump = true;
        } else if (item.id === 'magnet') {
            this.game.player.hasMagnet = true;
        } else if (item.id === 'blade') {
            this.game.player.bladeLevel = this.upgrades.blade;
        } else if (item.id === 'overclock_dash') {
            this.game.player.dashCooldownMax = Math.max(20, 45 - this.upgrades.overclock_dash * 12);
        }

        Sound.playGem();
        this.game.updateHUD();
        return true;
    }

    renderShop(containerEl) {
        if (!containerEl) return;
        let html = `
            <div class="shop-modal">
                <div class="shop-header">
                    <h2>CYBER TERMINAL SHOP</h2>
                    <div class="shop-funds">COINS AVAILABLE: <span class="hud-coins">¢ ${this.game.coins}</span></div>
                </div>
                <div class="shop-grid">
        `;

        CONFIG.UPGRADES.forEach(item => {
            const currentLvl = this.upgrades[item.id] || 0;
            const isMax = currentLvl >= item.maxLevel;
            const affordable = this.game.coins >= item.cost && !isMax;

            html += `
                <div class="shop-card ${isMax ? 'maxed' : ''}">
                    <div class="shop-item-title">${item.name}</div>
                    <div class="shop-item-desc">${item.desc}</div>
                    <div class="shop-item-stats">Level: ${currentLvl} / ${item.maxLevel}</div>
                    <button class="shop-buy-btn ${affordable ? 'can-buy' : ''}" 
                            data-item-id="${item.id}" 
                            ${!affordable ? 'disabled' : ''}>
                        ${isMax ? 'MAXED' : `BUY: ¢ ${item.cost}`}
                    </button>
                </div>
            `;
        });

        html += `
                </div>
                <div class="shop-footer">
                    <button id="shopContinueBtn" class="primary-btn">ENTER NEXT SECTOR ►</button>
                </div>
            </div>
        `;

        containerEl.innerHTML = html;

        // Bind clicks
        containerEl.querySelectorAll('.shop-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-item-id');
                const item = CONFIG.UPGRADES.find(u => u.id === id);
                if (item && this.buy(item)) {
                    this.renderShop(containerEl);
                }
            });
        });

        const contBtn = containerEl.querySelector('#shopContinueBtn');
        if (contBtn) {
            contBtn.addEventListener('click', () => {
                this.game.closeShopAndContinue();
            });
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShopSystem;
}

if (typeof window !== 'undefined') window.ShopSystem = ShopSystem;
