// 2D Physics and Collision Engine with Combat & Magnetism
class PhysicsEngine {
    constructor(tileSize = 16) {
        this.tileSize = tileSize;
    }

    isInside(tileX, tileY, level) {
        return tileX >= 0 && tileX < level.width && tileY >= 0 && tileY < level.height;
    }

    getTile(tileX, tileY, level) {
        if (!this.isInside(tileX, tileY, level)) {
            return CONFIG.TILES.SOLID;
        }
        return level.map[tileY][tileX];
    }

    isPointSolid(px, py, level) {
        const tx = Math.floor(px / this.tileSize);
        const ty = Math.floor(py / this.tileSize);
        return this.getTile(tx, ty, level) === CONFIG.TILES.SOLID;
    }

    boxesOverlap(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    // Check slash hitbox overlap with an entity
    checkSlashHit(player, entity) {
        const slashRange = CONFIG.PHYSICS.SLASH_RANGE + (player.bladeLevel * 10);
        const slashX = player.facing === 'right' ? player.x + player.width : player.x - slashRange;
        const slashBox = {
            x: slashX,
            y: player.y - 4,
            width: slashRange,
            height: player.height + 8
        };
        return this.boxesOverlap(slashBox, entity);
    }

    moveHorizontal(entity, dx, level) {
        entity.x += dx;
        const startTileY = Math.floor(entity.y / this.tileSize);
        const endTileY = Math.floor((entity.y + entity.height - 0.05) / this.tileSize);

        if (dx > 0) {
            const rightTileX = Math.floor((entity.x + entity.width) / this.tileSize);
            for (let ty = startTileY; ty <= endTileY; ty++) {
                if (this.getTile(rightTileX, ty, level) === CONFIG.TILES.SOLID) {
                    entity.x = rightTileX * this.tileSize - entity.width;
                    entity.vx = 0;
                    entity.hitWall = 'right';
                    break;
                }
            }
        } else if (dx < 0) {
            const leftTileX = Math.floor(entity.x / this.tileSize);
            for (let ty = startTileY; ty <= endTileY; ty++) {
                if (this.getTile(leftTileX, ty, level) === CONFIG.TILES.SOLID) {
                    entity.x = (leftTileX + 1) * this.tileSize;
                    entity.vx = 0;
                    entity.hitWall = 'left';
                    break;
                }
            }
        }
    }

    moveVertical(entity, dy, level, onSpring = null) {
        const oldY = entity.y;
        entity.y += dy;
        entity.onGround = false;

        const startTileX = Math.floor(entity.x / this.tileSize);
        const endTileX = Math.floor((entity.x + entity.width - 0.05) / this.tileSize);

        if (dy > 0) {
            const bottomTileY = Math.floor((entity.y + entity.height) / this.tileSize);
            for (let tx = startTileX; tx <= endTileX; tx++) {
                const tile = this.getTile(tx, bottomTileY, level);

                if (tile === CONFIG.TILES.SOLID) {
                    entity.y = bottomTileY * this.tileSize - entity.height;
                    entity.vy = 0;
                    entity.onGround = true;
                    break;
                }

                if (tile === CONFIG.TILES.SPRING) {
                    entity.y = bottomTileY * this.tileSize - entity.height;
                    entity.vy = CONFIG.PHYSICS.SPRING_FORCE;
                    entity.onGround = false;
                    if (onSpring) onSpring(tx, bottomTileY);
                    break;
                }

                if (tile === CONFIG.TILES.ONE_WAY) {
                    const platformTop = bottomTileY * this.tileSize;
                    if (oldY + entity.height <= platformTop + 4) {
                        entity.y = platformTop - entity.height;
                        entity.vy = 0;
                        entity.onGround = true;
                        break;
                    }
                }
            }
        } else if (dy < 0) {
            const topTileY = Math.floor(entity.y / this.tileSize);
            for (let tx = startTileX; tx <= endTileX; tx++) {
                const tile = this.getTile(tx, topTileY, level);
                if (tile === CONFIG.TILES.SOLID) {
                    entity.y = (topTileY + 1) * this.tileSize;
                    entity.vy = 0;
                    break;
                }
            }
        }
    }

    checkHazard(entity, level) {
        const startTileX = Math.floor((entity.x + 2) / this.tileSize);
        const endTileX = Math.floor((entity.x + entity.width - 2) / this.tileSize);
        const startTileY = Math.floor((entity.y + 2) / this.tileSize);
        const endTileY = Math.floor((entity.y + entity.height - 1) / this.tileSize);

        for (let ty = startTileY; ty <= endTileY; ty++) {
            for (let tx = startTileX; tx <= endTileX; tx++) {
                const tile = this.getTile(tx, ty, level);
                if (tile === CONFIG.TILES.SPIKE || tile === CONFIG.TILES.SPIKE_DOWN) {
                    return true;
                }
            }
        }
        return false;
    }

    // Apply coin magnet pull
    applyMagnet(player, collectibles) {
        if (!player.hasMagnet) return;
        const radius = CONFIG.PHYSICS.MAGNET_RADIUS;
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;

        for (const item of collectibles) {
            if (item.collected) continue;
            const ix = item.x + item.width / 2;
            const iy = item.y + item.height / 2;
            const dist = Math.hypot(px - ix, py - iy);

            if (dist < radius) {
                const speed = 4.2;
                item.x += ((px - ix) / dist) * speed;
                item.y += ((py - iy) / dist) * speed;
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}

if (typeof window !== 'undefined') window.PhysicsEngine = PhysicsEngine;
