import os
import re
import sys

print("=== VERIFYING RETRO ARCADE HUB SUITE ===")

BASE_DIR = "/home/ubuntu/ascii-platformer"
REQUIRED_FILES = [
    "index.html",
    "css/style.css",
    "js/config.js",
    "js/audio.js",
    "js/particles.js",
    "js/levels.js",
    "js/physics.js",
    "js/entities.js",
    "js/shop.js",
    "js/renderer.js",
    "js/main.js",
    "js/games/mario_clone.js",
    "js/games/contra_clone.js",
    "js/games/emulator_wrapper.js",
    "js/hub.js",
    "js/emulator/jsnes.min.js",
    "roms/starter_kit.nes"
]

# 1. Check all required files exist
for rel_path in REQUIRED_FILES:
    full_path = os.path.join(BASE_DIR, rel_path)
    assert os.path.exists(full_path), f"Missing file: {rel_path}"
    size = os.path.getsize(full_path)
    assert size > 50, f"File too small: {rel_path} ({size} bytes)"
    print(f"  ✓ {rel_path} ({size} bytes)")

# 2. Check HTML links all scripts and styles
with open(os.path.join(BASE_DIR, "index.html"), "r") as f:
    html_content = f.read()

assert 'href="css/style.css"' in html_content, "CSS stylesheet link missing in index.html"
for js_file in [
    "emulator/jsnes.min.js", "config.js", "audio.js", "particles.js",
    "levels.js", "physics.js", "entities.js", "shop.js", "renderer.js",
    "main.js", "games/mario_clone.js", "games/contra_clone.js", "games/emulator_wrapper.js", "hub.js"
]:
    assert f'src="js/{js_file}"' in html_content, f"Missing script tag for {js_file}"
assert 'data-game="mario"' in html_content, "Missing Mario tab"
assert 'data-game="contra"' in html_content, "Missing Contra tab"
assert 'data-game="emulator"' in html_content, "Missing Emulator tab"
print("  ✓ index.html links all required scripts, tabs, and styles")

# 3. Verify Mario game classes
with open(os.path.join(BASE_DIR, "js/games/mario_clone.js"), "r") as f:
    mario_code = f.read()
assert "class MarioGame" in mario_code, "MarioGame class not defined"
assert "isSuper" in mario_code, "Mario super mushroom logic not defined"
assert "goomba" in mario_code, "Goomba enemies not defined"
print("  ✓ Mario tribute engine verified")

# 4. Verify Contra game classes
with open(os.path.join(BASE_DIR, "js/games/contra_clone.js"), "r") as f:
    contra_code = f.read()
assert "class ContraGame" in contra_code, "ContraGame class not defined"
assert "SPREAD GUN" in contra_code or "weapon === 'S'" in contra_code, "Contra Spread Gun not defined"
assert "aimDir" in contra_code, "8-way aiming logic not defined"
print("  ✓ Contra tribute engine verified")

# 5. Verify NES Emulator wrapper
with open(os.path.join(BASE_DIR, "js/games/emulator_wrapper.js"), "r") as f:
    emu_code = f.read()
assert "class NesEmulator" in emu_code, "NesEmulator class not defined"
assert "jsnes.NES" in emu_code, "jsnes integration not defined"
assert "loadRomFromFile" in emu_code, "ROM file loader not defined"
print("  ✓ NES Emulator engine verified")

print("\n==========================================")
print("ALL RETRO ARCADE HUB VERIFICATIONS COMPLETED SUCCESSFULLY!")
