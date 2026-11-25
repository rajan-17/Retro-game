// Node.js Automated Test Suite for ASCII Platformer Physics and Level Integrity
const assert = require('assert');
const CONFIG = require('../js/config.js');
const { LEVELS } = require('../js/levels.js');
const PhysicsEngine = require('../js/physics.js');
const { Player, EnemySlime, Collectible } = require('../js/entities.js');

console.log("=== RUNNING ASCII PLATFORMER TEST SUITE ===");

let passedTests = 0;
let totalTests = 0;

function it(name, testFn) {
    totalTests++;
    try {
        testFn();
        console.log(`  ✓ ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✗ FAIL: ${name}`);
        console.error(err);
    }
}

// 1. Config Validation
it("CONFIG has valid dimensions and physics constants", () => {
    assert.strictEqual(CONFIG.TILE_SIZE, 16);
    assert.strictEqual(CONFIG.VIEW_WIDTH, 50);
    assert.strictEqual(CONFIG.VIEW_HEIGHT, 28);
    assert(CONFIG.PHYSICS.GRAVITY > 0);
    assert(CONFIG.PHYSICS.JUMP_FORCE < 0);
    assert(CONFIG.PHYSICS.SPRING_FORCE < CONFIG.PHYSICS.JUMP_FORCE);
});

// 2. Level Design Sanity Checks
it("All 4 levels have valid maps, player spawns, and exit portals", () => {
    assert.strictEqual(LEVELS.length, 4);

    LEVELS.forEach((level, idx) => {
        assert(level.name && level.name.length > 0, `Level ${idx + 1} has name`);
        assert.strictEqual(level.map.length, level.height, `Level ${idx + 1} row count matches height`);
        
        let hasPlayer = false;
        let hasExit = false;
        let coinCount = 0;

        for (let r = 0; r < level.height; r++) {
            const row = level.map[r];
            assert.strictEqual(row.length, level.width, `Level ${idx + 1} row ${r} length matches width`);
            if (row.includes('P')) hasPlayer = true;
            if (row.includes('E')) hasExit = true;
            for (let c = 0; c < row.length; c++) {
                if (row[c] === '$' || row[c] === '♦') coinCount++;
            }
        }

        assert(hasPlayer, `Level ${idx + 1} must contain Player spawn 'P'`);
        assert(hasExit, `Level ${idx + 1} must contain Exit portal 'E'`);
        assert(coinCount > 0, `Level ${idx + 1} must contain coins/gems`);
    });
});

// 3. Collision Engine Unit Tests
it("PhysicsEngine detects solid tiles and bounding box overlap", () => {
    const physics = new PhysicsEngine(16);
    const boxA = { x: 10, y: 10, width: 12, height: 12 };
    const boxB = { x: 15, y: 15, width: 12, height: 12 };
    const boxC = { x: 30, y: 30, width: 12, height: 12 };

    assert(physics.boxesOverlap(boxA, boxB), "Overlapping boxes should return true");
    assert(!physics.boxesOverlap(boxA, boxC), "Non-overlapping boxes should return false");
});

it("Horizontal movement stops cleanly against solid wall", () => {
    const physics = new PhysicsEngine(16);
    const testLevel = {
        width: 10,
        height: 5,
        map: [
            "##########",
            "#        #",
            "#    #   #",
            "#        #",
            "##########"
        ]
    };

    const entity = { x: 16, y: 32, width: 12, height: 14, vx: 5, hitWall: null };
    // Move towards wall at x=4*16 = 64
    entity.x = 55;
    physics.moveHorizontal(entity, 10, testLevel);

    // Should stop right at left edge of wall (64 - 12 = 52)
    assert.strictEqual(entity.x, 52);
    assert.strictEqual(entity.vx, 0);
    assert.strictEqual(entity.hitWall, 'right');
});

it("Vertical movement detects landing on ground and resets velocity", () => {
    const physics = new PhysicsEngine(16);
    const testLevel = {
        width: 10,
        height: 5,
        map: [
            "##########",
            "#        #",
            "#        #",
            "#  ####  #",
            "##########"
        ]
    };

    const entity = { x: 48, y: 30, width: 12, height: 14, vy: 6, onGround: false };
    physics.moveVertical(entity, entity.vy, testLevel);

    // Floor is at y=3*16 = 48. Entity height is 14. Landing y should be 48 - 14 = 34.
    assert.strictEqual(entity.y, 34);
    assert.strictEqual(entity.vy, 0);
    assert.strictEqual(entity.onGround, true);
});

it("Spring tile launches entity upwards with SPRING_FORCE", () => {
    const physics = new PhysicsEngine(16);
    const testLevel = {
        width: 10,
        height: 5,
        map: [
            "##########",
            "#        #",
            "#        #",
            "#   ^    #",
            "##########"
        ]
    };

    let springTriggered = false;
    const entity = { x: 64, y: 30, width: 12, height: 14, vy: 8, onGround: false };
    physics.moveVertical(entity, entity.vy, testLevel, (tx, ty) => {
        springTriggered = true;
    });

    assert(springTriggered, "Spring callback must be triggered");
    assert.strictEqual(entity.vy, CONFIG.PHYSICS.SPRING_FORCE);
    assert.strictEqual(entity.onGround, false);
});

it("Hazard check detects deadly spikes", () => {
    const physics = new PhysicsEngine(16);
    const testLevel = {
        width: 10,
        height: 5,
        map: [
            "##########",
            "#        #",
            "#   ▲    #",
            "#        #",
            "##########"
        ]
    };

    const safeEntity = { x: 16, y: 16, width: 12, height: 14 };
    const spikedEntity = { x: 64, y: 32, width: 12, height: 14 };

    assert(!physics.checkHazard(safeEntity, testLevel), "Safe position has no hazard");
    assert(physics.checkHazard(spikedEntity, testLevel), "Spike position must trigger hazard");
});

// Summary
console.log(`\n==========================================`);
console.log(`TEST RUN COMPLETE: ${passedTests}/${totalTests} Passed`);
if (passedTests === totalTests) {
    console.log("All systems passed successfully!");
    process.exit(0);
} else {
    console.error("Some tests failed.");
    process.exit(1);
}
