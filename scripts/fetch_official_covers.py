#!/usr/bin/env python3
import os
import sys
import re
import json
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = '/home/ubuntu/ascii-platformer'
COVERS_DIR = os.path.join(BASE_DIR, 'covers')
CACHE_FILE = '/tmp/libretro_trees.json'
os.makedirs(COVERS_DIR, exist_ok=True)

sys.path.insert(0, BASE_DIR)
import server

games = server.scan_roms()
print(f"Total catalog games to process: {len(games)}")

# 1. Ensure Libretro git trees are cached
if not os.path.exists(CACHE_FILE):
    print("Fetching Libretro git trees...")
    trees = {}
    repos = [
        ('Nintendo_-_Nintendo_Entertainment_System', 'nes'),
        ('Nintendo_-_Game_Boy', 'gb'),
        ('Nintendo_-_Game_Boy_Color', 'gbc')
    ]
    for repo, key in repos:
        url = f'https://api.github.com/repos/libretro-thumbnails/{repo}/git/trees/master?recursive=1'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode())
                trees[key] = [os.path.basename(x['path']) for x in data.get('tree', []) if x['path'].startswith('Named_Boxarts/')]
                print(f"Fetched {len(trees[key])} boxarts for {key}")
        except Exception as e:
            print(f"Failed to fetch {key}: {e}")
            trees[key] = []
    with open(CACHE_FILE, 'w') as f:
        json.dump(trees, f)

with open(CACHE_FILE) as f:
    trees = json.load(f)

# Libretro CDN base URLs
CDN_URLS = {
    'nes': 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/',
    'gb': 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy/master/Named_Boxarts/',
    'gbc': 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Color/master/Named_Boxarts/'
}

# 2. Known direct overrides for specific titles
MANUAL_OVERRIDES = {
    'super-tilt-bro': 'https://raw.githubusercontent.com/sgadrat/super-tilt-bro/master/doc/boxart.png',
    'the-legend-of-zelda': 'Legend of Zelda, The (USA).png',
    'zelda-ii-the-adventure-of-link': 'Zelda II - The Adventure of Link (USA).png',
    'super-mario-bros-3': 'Super Mario Bros. 3 (USA).png',
    'super-mario-bros': 'Super Mario Bros. (World).png',
    'super-mario-bros-2': 'Super Mario Bros. 2 (USA).png',
    'mega-man-2': 'Mega Man 2 (USA).png',
    'mega-man': 'Mega Man (USA).png',
    'mega-man-3': 'Mega Man 3 (USA).png',
    'mega-man-4': 'Mega Man 4 (USA).png',
    'mega-man-5': 'Mega Man 5 (USA).png',
    'mega-man-6': 'Mega Man 6 (USA).png',
    'castlevania': 'Castlevania (USA).png',
    'castlevania-ii-simons-quest': "Castlevania II - Simon's Quest (USA).png",
    'castlevania-iii-draculas-curse': "Castlevania III - Dracula's Curse (USA).png",
    'contra': 'Contra (USA).png',
    'super-c': 'Super C (USA).png',
    'metroid': 'Metroid (USA).png',
    'punch-out': "Mike Tyson's Punch-Out!! (USA).png",
    'ducktales': 'DuckTales (USA).png',
    'ninja-gaiden': 'Ninja Gaiden (USA).png',
    'kirbys-adventure': "Kirby's Adventure (USA).png",
    'bionic-commando': 'Bionic Commando (USA).png',
    'batman': 'Batman - The Video Game (USA).png',
    'pac-man': 'Pac-Man (USA) (Namco).png',
    'dr-mario': 'Dr. Mario (Japan, USA) (Rev A).png',
    'tetris': 'Tetris (USA).png',
    'excitebike': 'Excitebike (Japan, USA).png',
    'battletoads': 'Battletoads (USA).png',
    'double-dragon-ii-the-revenge': 'Double Dragon II - The Revenge (USA).png',
    'gradius': 'Gradius (USA).png',
    'final-fantasy': 'Final Fantasy (USA).png',
    'dragon-warrior': 'Dragon Warrior (USA).png',
    'river-city-ransom': 'River City Ransom (USA).png',
    'bubble-bobble': 'Bubble Bobble (USA).png',
    'tmnt-ii-the-arcade-game': 'Teenage Mutant Ninja Turtles II - The Arcade Game (USA).png',
    'track-field': 'Track & Field (USA).png',
    'donkey-kong': 'Donkey Kong (World) (Rev A).png',
    'contra-force': 'Contra Force (USA).png',
    # Game Boy & GBC
    'pokemon-red': 'Pokemon - Red Version (USA, Europe) (SGB Enhanced).png',
    'pokemon-blue': 'Pokemon - Blue Version (USA, Europe) (SGB Enhanced).png',
    'pokemon-yellow': 'Pokemon - Yellow Version - Special Pikachu Edition (USA, Europe) (GBC,SGB Enhanced).png',
    'pokemon-gold': 'Pokemon - Gold Version (USA, Europe) (SGB Enhanced) (GB Compatible).png',
    'pokemon-silver': 'Pokemon - Silver Version (USA, Europe) (SGB Enhanced) (GB Compatible).png',
    'pokemon-crystal': 'Pokemon - Crystal Version (USA, Europe) (Rev A).png',
    'zelda-links-awakening-dx': "Legend of Zelda, The - Link's Awakening DX (USA, Europe) (Rev 2) (SGB Enhanced) (GB Compatible).png",
    'zelda-oracle-of-ages': 'Legend of Zelda, The - Oracle of Ages (USA, Australia).png',
    'zelda-oracle-of-seasons': 'Legend of Zelda, The - Oracle of Seasons (USA, Australia).png',
    'super-mario-land': 'Super Mario Land (World).png',
    'super-mario-land-2': 'Super Mario Land 2 - 6 Golden Coins (USA, Europe) (Rev B).png',
    'wario-land-super-mario-land-3': 'Wario Land - Super Mario Land 3 (World) (SGB Enhanced).png',
    'wario-land-3': 'Wario Land 3 (World) (En,Ja).png',
    'kirbys-dream-land': "Kirby's Dream Land (USA, Europe).png",
    'kirbys-dream-land-2': "Kirby's Dream Land 2 (USA, Europe) (SGB Enhanced).png",
    'metroid-ii-return-of-samus': 'Metroid II - Return of Samus (World).png',
    'donkey-kong-94': 'Donkey Kong (World) (Rev 1) (SGB Enhanced).png',
    'donkey-kong-land': 'Donkey Kong Land (USA, Europe) (SGB Enhanced).png',
    'tetris-gb': 'Tetris (World) (Rev A).png',
    'dr-mario-gb': 'Dr. Mario (World) (Rev 1).png',
    'mega-man-dr-wilys-revenge': "Mega Man - Dr. Wily's Revenge (Europe).png",
    'castlevania-ii-belmonts-revenge': "Castlevania II - Belmont's Revenge (USA, Europe).png",
    'shantae': 'Shantae (USA).png',
    'mario-tennis-gbc': 'Mario Tennis (USA).png',
    'dragon-warrior-iii-gbc': 'Dragon Warrior III (USA).png'
}

# 3. Build token-based index for fuzzy matching
def tokenize(s):
    s = os.path.splitext(s)[0]
    s = re.sub(r'\[.*?\]', '', s)
    s = re.sub(r'[^a-zA-Z0-9]', ' ', s.lower())
    stop = {'the', 'a', 'an', 'usa', 'europe', 'japan', 'world', 'rev', 'sgb', 'enhanced', 'gb', 'gbc', 'nes', 'compatible', 'version', 'edition'}
    return set(s.split()) - stop

inv_indexes = {}
for console, filelist in trees.items():
    inv = {}
    for idx, fname in enumerate(filelist):
        for token in tokenize(fname):
            inv.setdefault(token, []).append(idx)
    inv_indexes[console] = (inv, filelist)

def find_best_boxart(game):
    gid = game['id']
    console = game.get('console', 'nes')
    if console not in ('nes', 'gb', 'gbc'):
        console = 'nes'

    # Check manual override
    if gid in MANUAL_OVERRIDES:
        val = MANUAL_OVERRIDES[gid]
        if val.startswith('http'):
            return val
        return CDN_URLS[console] + urllib.parse.quote(val)

    # Search in console tree
    inv, filelist = inv_indexes.get(console, inv_indexes['nes'])
    target_tokens = tokenize(game['title']) | tokenize(os.path.basename(game['rom']))
    
    candidate_counts = {}
    for token in target_tokens:
        for idx in inv.get(token, []):
            candidate_counts[idx] = candidate_counts.get(idx, 0) + 1
            
    if candidate_counts:
        best_idx = max(candidate_counts, key=candidate_counts.get)
        hits = candidate_counts[best_idx]
        score = hits / len(target_tokens) if target_tokens else 0
        if score >= 0.4:
            matched_file = filelist[best_idx]
            return CDN_URLS[console] + urllib.parse.quote(matched_file)

    # Cross-console fallback (e.g. if gbc wasn't found, try gb, or nes)
    for alt_con in ('nes', 'gb', 'gbc'):
        if alt_con == console:
            continue
        inv_a, filelist_a = inv_indexes.get(alt_con, ({}, []))
        candidate_counts = {}
        for token in target_tokens:
            for idx in inv_a.get(token, []):
                candidate_counts[idx] = candidate_counts.get(idx, 0) + 1
        if candidate_counts:
            best_idx = max(candidate_counts, key=candidate_counts.get)
            hits = candidate_counts[best_idx]
            if hits / len(target_tokens) >= 0.4:
                return CDN_URLS[alt_con] + urllib.parse.quote(filelist_a[best_idx])

    return None

# 4. Procedural Retro Sleeve Generator for remaining homebrews / multicarts
def generate_retro_sleeve(game, dest_path):
    width, height = 300, 420
    is_gb = game.get('gb') or game.get('console') in ('gb', 'gbc')
    console = game.get('console', 'nes')

    # Color palettes
    if console == 'gbc':
        bg_color = (20, 18, 38)
        border_color = (0, 240, 255)
        accent_color = (139, 92, 246)
        system_text = "GAME BOY COLOR"
    elif console == 'gb':
        bg_color = (18, 28, 22)
        border_color = (16, 185, 129)
        accent_color = (52, 211, 153)
        system_text = "GAME BOY COMPACT"
    else:
        bg_color = (14, 21, 38)
        border_color = (255, 83, 118)
        accent_color = (255, 204, 0)
        system_text = "NINTENDO ENTERTAINMENT SYSTEM"

    im = Image.new('RGBA', (width, height), bg_color)
    draw = ImageDraw.Draw(im)

    # 1. Outer bevel border
    draw.rectangle([6, 6, width - 7, height - 7], outline=border_color, width=3)
    draw.rectangle([12, 12, width - 13, height - 13], outline=(60, 75, 100), width=1)

    # 2. Top Banner (System header)
    draw.rectangle([14, 14, width - 15, 48], fill=(10, 14, 24))
    draw.text((width // 2, 31), system_text, fill=accent_color, anchor="mm")

    # 3. Retro grid pattern in artwork window
    art_top, art_bottom = 60, height - 110
    draw.rectangle([20, art_top, width - 21, art_bottom], fill=(6, 8, 14), outline=(40, 50, 70), width=2)

    # Grid lines
    for x in range(30, width - 20, 24):
        draw.line([(x, art_top), (x, art_bottom)], fill=(18, 26, 42), width=1)
    for y in range(art_top + 10, art_bottom, 24):
        draw.line([(20, y), (width - 20, y)], fill=(18, 26, 42), width=1)

    # Centered geometric retro cartridge emblem
    cx, cy = width // 2, (art_top + art_bottom) // 2 - 15
    draw.polygon([(cx, cy - 36), (cx + 42, cy), (cx, cy + 36), (cx - 42, cy)], fill=accent_color)
    draw.polygon([(cx, cy - 26), (cx + 30, cy), (cx, cy + 26), (cx - 30, cy)], fill=(10, 14, 24))
    draw.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=border_color)

    # Game Title in Artwork window (ASCII sanitized)
    raw_title = re.sub(r'[^a-zA-Z0-9 :!&\'\-\.]', '', game.get('title', 'Retro Classic')).strip()
    draw.text((width // 2, art_bottom - 36), raw_title[:24], fill=(255, 255, 255), anchor="mm")
    if len(raw_title) > 24:
        draw.text((width // 2, art_bottom - 18), raw_title[24:48], fill=(200, 220, 255), anchor="mm")

    # 4. Bottom Cartridge Spec footer
    genre = re.sub(r'[^a-zA-Z0-9 ]', '', game.get('system', 'ARCADE ACTION')).strip()
    draw.rectangle([14, height - 90, width - 15, height - 15], fill=(12, 18, 30))
    draw.text((width // 2, height - 68), f"OFFICIAL {genre} CARTRIDGE", fill=border_color, anchor="mm")
    draw.text((width // 2, height - 42), "WASM 60 FPS | BATTERY SRAM ACTIVE", fill=(140, 160, 190), anchor="mm")
    draw.text((width // 2, height - 24), "[ HIGH-FIDELITY RETRO ARCHIVE ]", fill=accent_color, anchor="mm")

    im.save(dest_path, "PNG")

# 5. Download and Process all games concurrently
def process_game(game):
    gid = game['id']
    dest = os.path.join(COVERS_DIR, f"{gid}.png")
    
    # Check if already downloaded
    if os.path.exists(dest) and os.path.getsize(dest) > 5000:
        return (gid, "CACHED", dest)

    boxart_url = find_best_boxart(game)
    if boxart_url:
        try:
            req = urllib.request.Request(boxart_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=12) as resp:
                content = resp.read()
                if len(content) > 3000:
                    with open(dest, 'wb') as f:
                        f.write(content)
                    return (gid, "DOWNLOADED", dest)
        except Exception as e:
            pass

    # Fallback: Generate bespoke retro sleeve
    generate_retro_sleeve(game, dest)
    return (gid, "GENERATED_SLEEVE", dest)

print(f"Starting parallel cover acquisition for {len(games)} games...")
downloaded = 0
generated = 0
cached = 0

with ThreadPoolExecutor(max_workers=16) as executor:
    future_to_game = {executor.submit(process_game, g): g for g in games}
    for future in as_completed(future_to_game):
        gid, status, path = future.result()
        if status == "DOWNLOADED":
            downloaded += 1
        elif status == "GENERATED_SLEEVE":
            generated += 1
        else:
            cached += 1

print(f"\nCover Acquisition Completed:")
print(f" - Official Boxarts Downloaded: {downloaded}")
print(f" - Bespoke Retro Sleeves Generated: {generated}")
print(f" - Previously Cached: {cached}")
print(f" - Total Covers in {COVERS_DIR}: {len(os.listdir(COVERS_DIR))}")
