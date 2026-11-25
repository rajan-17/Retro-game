#!/usr/bin/env python3
"""
Nexus Arcade & Studio - Dynamic Server & Automatic ROM Watcher
Serves static assets, auto-scans /roms directory on changes,
and serves /api/games with real-time auto-detected metadata.
"""

import os
import sys
import json
import re
import time
import threading
import urllib.parse
import hashlib
import base64
import struct
import secrets
from collections import defaultdict, deque
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

BASE_DIR = os.path.realpath(os.path.dirname(os.path.abspath(__file__)))
ROMS_DIR = os.path.realpath(os.path.join(BASE_DIR, 'roms'))
GAMES_JSON = os.path.join(BASE_DIR, 'games.json')
SECURITY_LOG = os.path.join(BASE_DIR, 'security.log')

# Security Constants (OWASP Top 10 Hardening)
ALLOWED_ROOT_FILES = {
    '/': 'index.html',
    '/index.html': 'index.html',
    '/player.html': 'player.html',
    '/controller.html': 'controller.html',
    '/games.json': 'games.json',
}
ALLOWED_JS_FILES = {
    '/js/nexus.js',
    '/js/qr.js',
    '/js/netplay.js',
    '/js/player.js',
    '/js/controller.js',
    '/js/emulator/jsnes.min.js',
    '/js/emulator/gameboy.min.js',
}
VALID_ROM_PATH_RE = re.compile(r'^roms/[A-Za-z0-9 _()\[\].!,\'-]+\.(?:nes|gb|gbc)$', re.IGNORECASE)
VALID_DATA_IMAGE_RE = re.compile(r'^data:image/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$')
CSP_HEADER = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: blob:; "
    "media-src 'self' blob: mediastream:; "
    "connect-src 'self' ws: wss:; "
    "frame-src 'self'; "
    "frame-ancestors 'self'; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)

CATALOG_LOCK = threading.Lock()
CACHED_GAMES = []
_cached_roms_mtime = -1
_last_manual_rescan = 0.0
SEC_LOG_LOCK = threading.Lock()


def log_security_event(event_type, client_ip, detail=''):
    """Append security events to security.log with size capping."""
    ts = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    safe_detail = str(detail).replace('\n', ' ').replace('\r', ' ')[:200]
    line = f"[{ts}] {event_type} ip={client_ip} {safe_detail}\n"
    try:
        with SEC_LOG_LOCK:
            if os.path.exists(SECURITY_LOG) and os.path.getsize(SECURITY_LOG) > 2 * 1024 * 1024:
                os.replace(SECURITY_LOG, SECURITY_LOG + '.1')
            with open(SECURITY_LOG, 'a', encoding='utf-8') as fp:
                fp.write(line)
    except Exception:
        pass


class SlidingRateLimiter:
    def __init__(self):
        self._lock = threading.Lock()
        self._buckets = defaultdict(deque)

    def allow(self, key, limit, window_sec):
        now = time.time()
        with self._lock:
            q = self._buckets[key]
            cutoff = now - window_sec
            while q and q[0] < cutoff:
                q.popleft()
            if len(q) >= limit:
                return False
            q.append(now)
            if len(self._buckets) > 5000:
                stale = [k for k, v in self._buckets.items() if not v]
                for k in stale:
                    del self._buckets[k]
            return True


RATE_LIMITER = SlidingRateLimiter()

# Top 100 Hall of Fame - Consensus Most Famous / Critically Acclaimed Games of All Time
# Cross-referenced across IGN Top 100, Nintendo Power Top 200, and GameSpot Masterpieces
TOP_100_HALL_OF_FAME = [
    {
        'id': 'super-mario-bros-3',
        'match_keys': ['super-mario-bros-3', 'super-mario-3', 'smb3'],
        'title': 'Super Mario Bros. 3',
        'sub': 'Rank #1 All-Time • 1990',
        'system': 'PLATFORMER',
        'rank': 1,
        'review_score': '★ 10/10 IGN #1',
        'review_quote': 'The pinnacle of 8-bit platforming design: world maps, Tanooki suit, and secrets.',
        'icon': '🍄',
        'color': '#fbbf24',
        'gradient': 'radial-gradient(circle at 75% 25%, #664d03 0%, #06080e 70%)',
        'default_rom': 'roms/Super Mario Bros. 3 (USA) (Rev 1).nes',
        'desc': 'One of the greatest video games ever made! Don the Tanooki and Frog suits, explore 8 themed world maps, defeat the Koopalings, and rescue Princess Peach.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'the-legend-of-zelda',
        'match_keys': ['legend-of-zelda', 'zelda'],
        'title': 'The Legend of Zelda',
        'sub': 'Rank #2 All-Time • 1987',
        'system': 'ADVENTURE',
        'rank': 2,
        'review_score': '★ 10/10 GameSpot',
        'review_quote': 'Pioneered non-linear open exploration, secret underworld dungeons, and battery save backups.',
        'icon': '🗡️',
        'color': '#10b981',
        'gradient': 'radial-gradient(circle at 75% 25%, #054f38 0%, #06080e 70%)',
        'default_rom': 'roms/The Legend of Zelda (E) [!].nes',
        'desc': 'The revolutionary fantasy adventure that defined action-RPGs! Explore Hyrule, delve into underworld dungeons, and assemble the Triforce of Wisdom.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'mega-man-2',
        'match_keys': ['megaman-ii', 'mega-man-2', 'megaman-2', 'megaman2'],
        'title': 'Mega Man 2',
        'sub': 'Rank #3 All-Time • 1989',
        'system': 'ACTION',
        'rank': 3,
        'review_score': '★ 9.8/10 IGN',
        'review_quote': 'Peak action platforming with an immortal soundtrack, 8 robot masters, and flawless controls.',
        'icon': '🤖',
        'color': '#00f0ff',
        'gradient': 'radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)',
        'default_rom': 'roms/Megaman II (E) [!].nes',
        'desc': 'Capcom’s action-platforming crown jewel! Defeat 8 Robot Masters (Metal Man, Quick Man), claim their special weapons, and storm Dr. Wily’s castle.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'super-mario-bros',
        'match_keys': ['super-mario-bros', 'smb1'],
        'title': 'Super Mario Bros.',
        'sub': 'Rank #4 All-Time • 1985',
        'system': 'PLATFORMER',
        'rank': 4,
        'review_score': '★ 9.8/10 All-Time',
        'review_quote': 'Saved the video game industry; established modern platforming mechanics forever.',
        'icon': '⭐',
        'color': '#e63946',
        'gradient': 'radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)',
        'default_rom': 'roms/Super Mario Bros. (E) [!].nes',
        'desc': 'The seminal platformer that revolutionized gaming! Guide Mario across the Mushroom Kingdom, smash question blocks, and defeat Bowser.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'metroid',
        'match_keys': ['metroid'],
        'title': 'Metroid',
        'sub': 'Rank #5 All-Time • 1987',
        'system': 'ADVENTURE',
        'rank': 5,
        'review_score': '★ 9.6/10 IGN',
        'review_quote': 'Atmospheric sci-fi isolation, morph ball puzzles, and the birth of the Metroidvania genre.',
        'icon': '🚀',
        'color': '#f72585',
        'gradient': 'radial-gradient(circle at 75% 25%, #7209b7 0%, #06080e 70%)',
        'default_rom': 'roms/Metroid (U) [!].nes',
        'desc': 'The chilling sci-fi labyrinth adventure! Guide intergalactic bounty hunter Samus Aran through subterranean Planet Zebes to destroy Mother Brain.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'mike-tysons-punch-out',
        'match_keys': ['punch-out', 'mike-tyson'],
        'title': "Mike Tyson's Punch-Out!!",
        'sub': 'Rank #6 All-Time • 1987',
        'system': 'ACTION',
        'rank': 6,
        'review_score': '★ 9.8/10 IGN',
        'review_quote': 'A masterclass in rhythm, telegraphing, visual comedy, and precision timing.',
        'icon': '🥊',
        'color': '#4cc9f0',
        'gradient': 'radial-gradient(circle at 75% 25%, #184e77 0%, #06080e 70%)',
        'default_rom': "roms/Mike Tyson's Punch-Out!! (E) [!].nes",
        'desc': 'The legendary rhythm-boxing puzzle showcase! Step into the ring as Little Mac and KO Glass Joe, Bald Bull, and Iron Mike Tyson with lightning uppercuts.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'contra',
        'match_keys': ['contra'],
        'title': 'Contra',
        'sub': 'Rank #7 All-Time • 1988',
        'system': 'ACTION',
        'rank': 7,
        'review_score': '★ 9.6/10 IGN',
        'review_quote': 'The ultimate adrenaline run-and-gun arcade shooter; popularized the Konami Code.',
        'icon': '🎖️',
        'color': '#ff5376',
        'gradient': 'radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)',
        'default_rom': 'roms/Contra (USA).nes',
        'desc': 'The legendary Konami run-and-gun arcade classic! Fight through alien-infested jungles, waterfalls, and bases with multi-directional firing.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'castlevania-3',
        'match_keys': ['castlevania-iii', 'castlevania-3', 'draculas-curse'],
        'title': "Castlevania III: Dracula's Curse",
        'sub': 'Rank #8 All-Time • 1990',
        'system': 'ACTION',
        'rank': 8,
        'review_score': '★ 9.7/10 EGM',
        'review_quote': 'Branching story paths, multiple switchable heroes, and custom VRC6 audio.',
        'icon': '🦇',
        'color': '#9d4edd',
        'gradient': 'radial-gradient(circle at 75% 25%, #3c096c 0%, #06080e 70%)',
        'default_rom': 'roms/Castlevania III (U) [!].nes',
        'desc': 'The pinnacle of classic 8-bit gothic action! Guide Trevor Belmont alongside switchable allies Sypha, Grant, and Alucard across branching paths.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'tetris',
        'match_keys': ['tetris'],
        'title': 'Tetris',
        'sub': 'Rank #9 All-Time • 1989',
        'system': 'PUZZLE',
        'rank': 9,
        'review_score': '★ 9.8/10 IGN',
        'review_quote': 'Timeless falling-block perfection with infectious Russian folk tunes.',
        'icon': '🧩',
        'color': '#06d6a0',
        'gradient': 'radial-gradient(circle at 75% 25%, #05543f 0%, #06080e 70%)',
        'default_rom': 'roms/Tetris (BPS) (J) [!].nes',
        'desc': 'The world’s most addictive and timeless falling-block puzzle masterpiece! Rotate tetrominoes, clear lines, and reach the high-speed rocket launch.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'ninja-gaiden',
        'match_keys': ['ninja-gaiden'],
        'title': 'Ninja Gaiden',
        'sub': 'Rank #10 All-Time • 1989',
        'system': 'ACTION',
        'rank': 10,
        'review_score': '★ 9.6/10 IGN',
        'review_quote': 'Lightning-fast ninja action and groundbreaking cinematic storytelling cutscenes.',
        'icon': '🥷',
        'color': '#00f0ff',
        'gradient': 'radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)',
        'default_rom': 'roms/Ninja Gaiden (U) [!].nes',
        'desc': 'High-speed precision ninja combat! Guide Ryu Hayabusa across demonic temples with wall-jumps, ninpo arts, and historic cinematic story cutscenes.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'mega-man-3',
        'match_keys': ['mega-man-3', 'rockman-3', 'megaman-3'],
        'title': 'Mega Man 3',
        'sub': 'Rank #11 All-Time • 1990',
        'system': 'ACTION',
        'rank': 11,
        'review_score': '★ 9.5/10 IGN',
        'review_quote': 'Introduced the slide maneuver, Rush the cyber dog, and the enigmatic Proto Man.',
        'icon': '🐕',
        'color': '#3a86ff',
        'gradient': 'radial-gradient(circle at 75% 25%, #023e8a 0%, #06080e 70%)',
        'default_rom': 'roms/Mega Man 3 (J) [!].nes',
        'desc': 'Massive expansion of the Blue Bomber saga! Slide through tight hazard gaps, summon Rush Marine and Coil, and duel the mysterious whistle-playing Proto Man.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'ducktales',
        'match_keys': ['ducktales', 'duck-tales'],
        'title': 'DuckTales',
        'sub': 'Rank #12 All-Time • 1989',
        'system': 'PLATFORMER',
        'rank': 12,
        'review_score': '★ 9.4/10 IGN',
        'review_quote': 'Revolutionary pogo-cane platforming and the immortal Moon Theme soundtrack.',
        'icon': '🦆',
        'color': '#ffd166',
        'gradient': 'radial-gradient(circle at 75% 25%, #594719 0%, #06080e 70%)',
        'default_rom': 'roms/DuckTales (U) [!].nes',
        'desc': 'Capcom’s Disney platforming triumph! Pogo-jump as Scrooge McDuck through the Amazon, Transylvania, African Mines, the Himalayas, and the Moon.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'super-mario-bros-2',
        'match_keys': ['super-mario-bros-2', 'super-mario-2', 'smb2'],
        'title': 'Super Mario Bros. 2',
        'sub': 'Rank #13 All-Time • 1988',
        'system': 'PLATFORMER',
        'rank': 13,
        'review_score': '★ 9.5/10 IGN',
        'review_quote': 'Subcon vegetable-plucking mechanics and 4 unique characters with distinct abilities.',
        'icon': '🥕',
        'color': '#e76f51',
        'gradient': 'radial-gradient(circle at 75% 25%, #9b2226 0%, #06080e 70%)',
        'default_rom': 'roms/Super Mario Bros. 2 (U) [!].nes',
        'desc': 'Step into the dream realm of Subcon! Choose from Mario, Luigi, Toad, and Princess Peach to pluck turnips, ride magic carpets, and defeat Wart.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'kirbys-adventure',
        'match_keys': ['kirbys-adventure', 'kirby'],
        'title': "Kirby's Adventure",
        'sub': 'Rank #14 All-Time • 1993',
        'system': 'PLATFORMER',
        'rank': 14,
        'review_score': '★ 9.5/10 IGN',
        'review_quote': 'Pushed NES hardware to the limit with copy abilities, mini-games, and pastel visuals.',
        'icon': '⭐',
        'color': '#ffafcc',
        'gradient': 'radial-gradient(circle at 75% 25%, #8338ec 0%, #06080e 70%)',
        'default_rom': "roms/Kirby's Adventure (E) [!].nes",
        'desc': 'Masahiro Sakurai’s 8-bit pinnacle! Inhale enemies to absorb over 20 unique copy abilities (Beam, Sword, Fire, UFO) across the colorful Dream Land.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'castlevania',
        'match_keys': ['castlevania'],
        'title': 'Castlevania',
        'sub': 'Rank #15 All-Time • 1987',
        'system': 'ACTION',
        'rank': 15,
        'review_score': '★ 9.5/10 IGN',
        'review_quote': 'Atmospheric gothic whip action, iconic bosses, and timeless horror aesthetic.',
        'icon': '🏰',
        'color': '#d90429',
        'gradient': 'radial-gradient(circle at 75% 25%, #590d22 0%, #06080e 70%)',
        'default_rom': 'roms/Castlevania (U) [!].nes',
        'desc': 'The original Konami gothic landmark! Wield the Vampire Killer whip as Simon Belmont through ghoul-infested castles to slay Count Dracula.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'teenage-mutant-ninja-turtles',
        'match_keys': ['teenage-mutant-ninja-turtles-(usa)', 'teenage-mutant-ninja-turtles', 'tmnt'],
        'title': 'Teenage Mutant Ninja Turtles',
        'sub': 'Rank #16 All-Time • 1989',
        'system': 'ACTION',
        'rank': 16,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'High-stakes pizza power action, underwater bomb defusal, and 4 switchable turtles.',
        'icon': '🐢',
        'color': '#10b981',
        'gradient': 'radial-gradient(circle at 75% 25%, #054f38 0%, #06080e 70%)',
        'default_rom': 'roms/Teenage Mutant Ninja Turtles (USA).nes',
        'desc': 'Join Leonardo, Raphael, Michelangelo, and Donatello across New York City sewer mazes and streets to defeat Shredder and the Foot Clan.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'tmnt-2-arcade',
        'match_keys': ['teenage-mutant-ninja-turtles-ii', 'tmnt-2', 'tmnt-arcade'],
        'title': 'TMNT II: The Arcade Game',
        'sub': 'Rank #17 All-Time • 1990',
        'system': 'ACTION',
        'rank': 17,
        'review_score': '★ 9.4/10 IGN',
        'review_quote': 'Definitive home conversion of the classic 4-player arcade beat-em-up.',
        'icon': '🍕',
        'color': '#2a9d8f',
        'gradient': 'radial-gradient(circle at 75% 25%, #1d3557 0%, #06080e 70%)',
        'default_rom': 'roms/Teenage Mutant Ninja Turtles II (U) [!].nes',
        'desc': 'The acclaimed home conversion of Konami’s smash-hit arcade brawler! Team up to smash through waves of Foot Ninjas, Rocksteady, and Krang.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'river-city-ransom',
        'match_keys': ['river-city-ransom', 'river-city', 'downtown-special'],
        'title': 'River City Ransom',
        'sub': 'Rank #18 All-Time • 1989',
        'system': 'ACTION',
        'rank': 18,
        'review_score': '★ 9.4/10 IGN',
        'review_quote': 'Groundbreaking combination of street brawling, open town exploration, and RPG stat shops.',
        'icon': '🥊',
        'color': '#e9c46a',
        'gradient': 'radial-gradient(circle at 75% 25%, #b08968 0%, #06080e 70%)',
        'default_rom': 'roms/River City Ransom (U) [!].nes',
        'desc': 'Revolutionary open-world RPG beat-’em-up! Brawl through rival street gangs as Alex and Ryan, buy books to learn dragon kicks, and feast at diners.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'battletoads',
        'match_keys': ['battletoads'],
        'title': 'Battletoads',
        'sub': 'Rank #19 All-Time • 1991',
        'system': 'ACTION',
        'rank': 19,
        'review_score': '★ 9.3/10 IGN',
        'review_quote': 'Incredible graphical prowess, morphing fists, and infamous turbo tunnel speeder bikes.',
        'icon': '🐸',
        'color': '#588157',
        'gradient': 'radial-gradient(circle at 75% 25%, #344e41 0%, #06080e 70%)',
        'default_rom': 'roms/Battletoads (U) [!].nes',
        'desc': 'Rareware’s legendary technical showcase! Control Rash and Zitz as they morph giant battle boots, abseil down chasms, and conquer the turbo tunnel.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'bionic-commando',
        'match_keys': ['bionic-commando'],
        'title': 'Bionic Commando',
        'sub': 'Rank #20 All-Time • 1988',
        'system': 'ACTION',
        'rank': 20,
        'review_score': '★ 9.3/10 IGN',
        'review_quote': 'Replaced jumping with a revolutionary grappling hook arm mechanic.',
        'icon': '🦾',
        'color': '#457b9d',
        'gradient': 'radial-gradient(circle at 75% 25%, #1d3557 0%, #06080e 70%)',
        'default_rom': 'roms/Bionic Commando (U) [!].nes',
        'desc': 'Genius mechanical innovation! Swing across treacherous military bases using your extendable bionic grappling arm to intercept enemy dictators.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'zelda-ii',
        'match_keys': ['zelda-ii', 'zelda-2', 'adventure-of-link'],
        'title': 'Zelda II: The Adventure of Link',
        'sub': 'Rank #21 All-Time • 1987',
        'system': 'ADVENTURE',
        'rank': 21,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'Non-linear action-RPG sidescroller; introduced towns, XP, and spell casting.',
        'icon': '🛡️',
        'color': '#34d399',
        'gradient': 'radial-gradient(circle at 75% 25%, #065f46 0%, #06080e 70%)',
        'default_rom': 'roms/Zelda II - The Adventure of Link (E) [!].nes',
        'desc': 'Step into side-scrolling action in Hyrule! Gain experience, learn magic spells from village elders, conquer 6 palaces, and awaken Princess Zelda.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'castlevania-ii',
        'match_keys': ['castlevania-ii', 'castlevania-2', 'simons-quest'],
        'title': "Castlevania II: Simon's Quest",
        'sub': 'Rank #22 All-Time • 1987',
        'system': 'ACTION',
        'rank': 22,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': 'Day/night cycle open-world gothic quest: "What a horrible night to have a curse."',
        'icon': '🧛',
        'color': '#dc2626',
        'gradient': 'radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)',
        'default_rom': "roms/Castlevania II - Simon's Quest (U) [!].nes",
        'desc': 'Break the dark curse placed upon Simon Belmont! Explore the countryside of Transylvania, solve occult riddles, and gather Dracula’s remains.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'mega-man-4',
        'match_keys': ['mega-man-4', 'megaman-4', 'rockman-4', 'megaman4'],
        'title': 'Mega Man 4',
        'sub': 'Rank #23 All-Time • 1991',
        'system': 'ACTION',
        'rank': 23,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'Introduced the revolutionary Mega Buster charge shot and Eddie the delivery bot.',
        'icon': '🤖',
        'color': '#38bdf8',
        'gradient': 'radial-gradient(circle at 75% 25%, #0369a1 0%, #06080e 70%)',
        'default_rom': 'roms/Mega Man 4 (J) [!].nes',
        'desc': 'Unleash the newly engineered Mega Buster charge shot against Dr. Cossack’s 8 rogue Robot Masters: Toad Man, Pharaoh Man, Drill Man, and Ring Man!',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'double-dragon-2',
        'match_keys': ['double-dragon-ii', 'double-dragon-2', 'doubledragon2'],
        'title': 'Double Dragon II: The Revenge',
        'sub': 'Rank #24 All-Time • 1989',
        'system': 'ACTION',
        'rank': 24,
        'review_score': '★ 9.4/10 IGN',
        'review_quote': 'The pinnacle of 8-bit co-op brawlers with the iconic Cyclone Spin Kick.',
        'icon': '🥊',
        'color': '#f97316',
        'gradient': 'radial-gradient(circle at 75% 25%, #9a3412 0%, #06080e 70%)',
        'default_rom': 'roms/Double Dragon II - The Revenge (U) [!].nes',
        'desc': 'Billy and Jimmy Lee return in the definitive NES beat-’em-up! Master the Cyclone Spin Kick and Hyper Knee to avenge Marian and smash the Black Warriors.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'super-c',
        'match_keys': ['super-c', 'super-contra'],
        'title': 'Super C (Super Contra)',
        'sub': 'Rank #25 All-Time • 1990',
        'system': 'ACTION',
        'rank': 25,
        'review_score': '★ 9.3/10 Nintendo Power',
        'review_quote': 'Adrenaline sequel adding top-down vertical shooting and spread gun mayhem.',
        'icon': '💥',
        'color': '#ef4444',
        'gradient': 'radial-gradient(circle at 75% 25%, #991b1b 0%, #06080e 70%)',
        'default_rom': 'roms/Super C (U) [!].nes',
        'desc': 'Bill and Lance return to battle Red Falcon’s alien invasion! Features alternating side-scrolling and top-down overhead combat with enhanced Spread Guns.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'gradius',
        'match_keys': ['gradius'],
        'title': 'Gradius',
        'sub': 'Rank #26 All-Time • 1986',
        'system': 'SHOOTER',
        'rank': 26,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': "Konami's defining space shooter with the Vic Viper modular power-up gauge.",
        'icon': '🚀',
        'color': '#6366f1',
        'gradient': 'radial-gradient(circle at 75% 25%, #3730a3 0%, #06080e 70%)',
        'default_rom': 'roms/Gradius (E) [!].nes',
        'desc': 'Pilot the Vic Viper through deadly volcanic fields, Moai head ruins, and biomechanical motherships. Collect orange pods to upgrade speed, lasers, and shields!',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'life-force',
        'match_keys': ['life-force', 'salamander'],
        'title': 'Life Force (Salamander)',
        'sub': 'Rank #27 All-Time • 1987',
        'system': 'SHOOTER',
        'rank': 27,
        'review_score': '★ 9.3/10 Nintendo Power',
        'review_quote': 'Alternating vertical & horizontal bio-mechanical space co-op shooter.',
        'icon': '🛸',
        'color': '#ec4899',
        'gradient': 'radial-gradient(circle at 75% 25%, #9d174d 0%, #06080e 70%)',
        'default_rom': 'roms/Life Force (U) [!].nes',
        'desc': 'Fly inside the gargantuan alien beast Zelos! Experience 2-player co-op shooter bliss switching between horizontal corridors and vertical scrolling webs.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'bubble-bobble',
        'match_keys': ['bubble-bobble'],
        'title': 'Bubble Bobble',
        'sub': 'Rank #28 All-Time • 1986',
        'system': 'ARCADE',
        'rank': 28,
        'review_score': '★ 9.3/10 GameSpot',
        'review_quote': "Taito's 100-level bubble-trapping co-op arcade phenomenon.",
        'icon': '🫧',
        'color': '#06b6d4',
        'gradient': 'radial-gradient(circle at 75% 25%, #155e75 0%, #06080e 70%)',
        'default_rom': 'roms/Bubble Bobble (U) [!].nes',
        'desc': 'Join cute bubble dragons Bub and Bob across 100 labyrinth levels! Blow bubbles to trap enemies, pop them for sweets, and discover multiple secret endings.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'blaster-master',
        'match_keys': ['blaster-master'],
        'title': 'Blaster Master',
        'sub': 'Rank #29 All-Time • 1988',
        'system': 'ADVENTURE',
        'rank': 29,
        'review_score': '★ 9.3/10 IGN',
        'review_quote': 'Sophia the 3rd jumping tank exploration + top-down pilot dungeon crawler.',
        'icon': '🚜',
        'color': '#eab308',
        'gradient': 'radial-gradient(circle at 75% 25%, #854d0e 0%, #06080e 70%)',
        'default_rom': 'roms/Blaster Master (U) [!].nes',
        'desc': 'Command the SOPHIA III combat tank across subterranean cavern biomes, then hop out as pilot Jason in top-down blaster dungeons to obliterate radioactive mutants!',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'chip-n-dale',
        'match_keys': ['chip-n-dale', 'chip-and-dale', 'rescue-rangers'],
        'title': "Chip 'n Dale: Rescue Rangers",
        'sub': 'Rank #30 All-Time • 1990',
        'system': 'PLATFORMER',
        'rank': 30,
        'review_score': '★ 9.3/10 IGN',
        'review_quote': "Capcom's Disney co-op masterpiece with box-tossing mechanics.",
        'icon': '🐿️',
        'color': '#f59e0b',
        'gradient': 'radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)',
        'default_rom': "roms/Chip 'n Dale Rescue Rangers (U) [!].nes",
        'desc': 'Team up as chipmunks Chip and Dale! Pick up and hurl acorns, crates, and apples to foil Fat Cat’s diabolical underworld feline syndicate.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'pac-man',
        'match_keys': ['pac-man', 'pacman'],
        'title': 'Pac-Man',
        'sub': 'Rank #31 All-Time • 1980',
        'system': 'ARCADE',
        'rank': 31,
        'review_score': '★ 9.5/10 All-Time',
        'review_quote': 'The most iconic arcade maze game in entertainment history.',
        'icon': '🟡',
        'color': '#facc15',
        'gradient': 'radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)',
        'default_rom': 'roms/Pac-Man (Namco) (E) [!].nes',
        'desc': 'The timeless arcade phenomenon! Munch pellets, avoid Blinky, Pinky, Inky, and Clyde, grab power pellets, and chomp blue ghosts for record high scores.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'galaga',
        'match_keys': ['galaga'],
        'title': 'Galaga',
        'sub': 'Rank #32 All-Time • 1981',
        'system': 'SHOOTER',
        'rank': 32,
        'review_score': '★ 9.4/10 All-Time',
        'review_quote': "Namco's defining space defense shooter with dual-fighter tractor beams.",
        'icon': '👾',
        'color': '#38bdf8',
        'gradient': 'radial-gradient(circle at 75% 25%, #075985 0%, #06080e 70%)',
        'default_rom': 'roms/Galaga (E) [!].nes',
        'desc': 'Repel descending alien insect swarms! Risk capture by the Boss Galaga’s tractor beam to rescue your ship and unlock unstoppable double-shot firepower.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'donkey-kong',
        'match_keys': ['donkey-kong'],
        'title': 'Donkey Kong',
        'sub': 'Rank #33 All-Time • 1981',
        'system': 'ARCADE',
        'rank': 33,
        'review_score': '★ 9.4/10 All-Time',
        'review_quote': "Shigeru Miyamoto's foundational platformer that introduced Mario.",
        'icon': '🦍',
        'color': '#ea580c',
        'gradient': 'radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)',
        'default_rom': 'roms/Donkey Kong (W) [!].nes',
        'desc': 'Where video game history began! Jump over rolling oil barrels, scale construction girders with the hammer, and rescue Pauline from the giant ape.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'donkey-kong-jr',
        'match_keys': ['donkey-kong-jr', 'donkey-kong-junior'],
        'title': 'Donkey Kong Jr.',
        'sub': 'Rank #34 All-Time • 1982',
        'system': 'ARCADE',
        'rank': 34,
        'review_score': '★ 9.1/10 Nintendo Power',
        'review_quote': 'Acclaimed vine-climbing arcade classic rescuing father DK from Mario.',
        'icon': '🐒',
        'color': '#d97706',
        'gradient': 'radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)',
        'default_rom': 'roms/Donkey Kong Jr. (W) [!].nes',
        'desc': 'Swing between jungle vines and dodge Snapjaws! Play as Donkey Kong Jr. to unlock the cage and rescue your father in Mario’s only turn as the antagonist.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'excitebike',
        'match_keys': ['excitebike'],
        'title': 'Excitebike',
        'sub': 'Rank #35 All-Time • 1984',
        'system': 'ARCADE',
        'rank': 35,
        'review_score': '★ 9.3/10 GameSpot',
        'review_quote': 'High-flying motocross racing physics with custom track designer.',
        'icon': '🏍️',
        'color': '#e11d48',
        'gradient': 'radial-gradient(circle at 75% 25%, #881337 0%, #06080e 70%)',
        'default_rom': 'roms/Excitebike (JU) [!].nes',
        'desc': 'Adrenaline motocross racing! Shift weight over huge jumps, manage engine turbo temperature, pass rivals, and construct your own custom dirt tracks.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'balloon-fight',
        'match_keys': ['balloon-fight'],
        'title': 'Balloon Fight',
        'sub': 'Rank #36 All-Time • 1985',
        'system': 'ARCADE',
        'rank': 36,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': "Satoru Iwata's physics programming gem; balloon popping reflex action.",
        'icon': '🎈',
        'color': '#06b6d4',
        'gradient': 'radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)',
        'default_rom': 'roms/Balloon Fight (E) [!].nes',
        'desc': "Flap wings to soar through electric storm skies! Pop enemy birds' balloons, avoid giant hungry piranhas in the lake, and master the endless Balloon Trip mode.",
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'ice-climber',
        'match_keys': ['ice-climber'],
        'title': 'Ice Climber',
        'sub': 'Rank #37 All-Time • 1985',
        'system': 'PLATFORMER',
        'rank': 37,
        'review_score': '★ 9.0/10 Nintendo Power',
        'review_quote': 'Vertical mountain-climbing platformer with eggplant bonuses.',
        'icon': '⛏️',
        'color': '#38bdf8',
        'gradient': 'radial-gradient(circle at 75% 25%, #0369a1 0%, #06080e 70%)',
        'default_rom': 'roms/Ice Climber (UE) [!].nes',
        'desc': 'Smash through icy ceilings with wooden mallets as Popo and Nana! Ascend 32 freezing peaks, dodge Topis and polar bears, and hitch a ride on the condor.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'bomberman',
        'match_keys': ['bomberman'],
        'title': 'Bomberman',
        'sub': 'Rank #38 All-Time • 1985',
        'system': 'ARCADE',
        'rank': 38,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': "Hudson Soft's grid-based tactical bomb maze strategy game.",
        'icon': '💣',
        'color': '#4f46e5',
        'gradient': 'radial-gradient(circle at 75% 25%, #312e81 0%, #06080e 70%)',
        'default_rom': 'roms/Bomberman (U) [!].nes',
        'desc': 'Drop timed explosives to blast through maze walls and vaporize subterranean monsters! Collect fire upgrades and detonators to find the exit door.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'ghosts-n-goblins',
        'match_keys': ['ghosts-n-goblins', 'ghosts-and-goblins', 'makaimura'],
        'title': "Ghosts 'n Goblins",
        'sub': 'Rank #39 All-Time • 1986',
        'system': 'ACTION',
        'rank': 39,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': "Capcom's legendary gothic knight challenge with Arthur's lance & armor.",
        'icon': '🛡️',
        'color': '#a855f7',
        'gradient': 'radial-gradient(circle at 75% 25%, #581c87 0%, #06080e 70%)',
        'default_rom': "roms/Ghosts 'n Goblins (U) [!].nes",
        'desc': 'Brave the Haunted Graveyard as Sir Arthur! Fling lances, daggers, and holy water at zombies, demons, and the Red Arremer to rescue Princess Prin-Prin.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'double-dragon',
        'match_keys': ['double-dragon'],
        'title': 'Double Dragon',
        'sub': 'Rank #40 All-Time • 1987',
        'system': 'ACTION',
        'rank': 40,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': "The revolutionary martial arts beat-'em-up that popularized the genre.",
        'icon': '🥋',
        'color': '#ea580c',
        'gradient': 'radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)',
        'default_rom': 'roms/Double Dragon (E) [!].nes',
        'desc': 'Fight through post-apocalyptic streets as martial artist Billy Lee! Level up punches, kicks, and roundhouses to take down the Shadow Warriors and Machine Gun Willy.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'final-fantasy',
        'match_keys': ['final-fantasy'],
        'title': 'Final Fantasy',
        'sub': 'Rank #41 All-Time • 1987',
        'system': 'ADVENTURE',
        'rank': 41,
        'review_score': '★ 9.5/10 IGN',
        'review_quote': "Hironobu Sakaguchi's legendary RPG that launched a global franchise.",
        'icon': '✨',
        'color': '#3b82f6',
        'gradient': 'radial-gradient(circle at 75% 25%, #1e3a8a 0%, #06080e 70%)',
        'default_rom': 'roms/Final Fantasy (U) [!].nes',
        'desc': 'Form your four Warriors of Light! Journey across land, sea, and air in airships to restore the light to Earth, Fire, Water, and Wind orbs and vanquish Chaos.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'dragon-warrior',
        'match_keys': ['dragon-warrior', 'dragon-quest'],
        'title': 'Dragon Warrior (Dragon Quest)',
        'sub': 'Rank #42 All-Time • 1986',
        'system': 'ADVENTURE',
        'rank': 42,
        'review_score': '★ 9.3/10 Nintendo Power',
        'review_quote': 'The grandfather of JRPGs; Akira Toriyama art and turn-based combat.',
        'icon': '🐉',
        'color': '#f97316',
        'gradient': 'radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)',
        'default_rom': 'roms/Dragon Warrior (U) [!].nes',
        'desc': 'Heed King Lorik’s plea as the descendant of Erdrick! Slay slimes, explore dark dungeons with torches, recover the Ball of Light, and slay the Dragonlord.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'metal-gear',
        'match_keys': ['metal-gear'],
        'title': 'Metal Gear',
        'sub': 'Rank #43 All-Time • 1987',
        'system': 'ACTION',
        'rank': 43,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': "Hideo Kojima's pioneering stealth infiltration action landmark.",
        'icon': '📦',
        'color': '#14b8a6',
        'gradient': 'radial-gradient(circle at 75% 25%, #134e4a 0%, #06080e 70%)',
        'default_rom': 'roms/Metal Gear (U) [!].nes',
        'desc': 'Infiltrate Outer Heaven as rookie operative Solid Snake! Evade laser tripwires and camera surveillance, communicate via transceiver, and destroy Metal Gear.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'kid-icarus',
        'match_keys': ['kid-icarus'],
        'title': 'Kid Icarus',
        'sub': 'Rank #44 All-Time • 1986',
        'system': 'PLATFORMER',
        'rank': 44,
        'review_score': '★ 9.1/10 Nintendo Power',
        'review_quote': "Vertical Greek mythology quest with Pit's bow and underworld escape.",
        'icon': '🏹',
        'color': '#a855f7',
        'gradient': 'radial-gradient(circle at 75% 25%, #6b21a8 0%, #06080e 70%)',
        'default_rom': 'roms/Kid Icarus (UE) [!].nes',
        'desc': 'Ascend from the depths of the Underworld to Angel Land! Fire sacred arrows, collect hearts to buy chalices, recover the Three Sacred Treasures, and defeat Medusa.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'ducktales-2',
        'match_keys': ['ducktales-2', 'duck-tales-2', 'ducktales2'],
        'title': 'DuckTales 2',
        'sub': 'Rank #45 All-Time • 1993',
        'system': 'PLATFORMER',
        'rank': 45,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'Rare high-production Capcom sequel with hook-pulling treasure hunts.',
        'icon': '🦆',
        'color': '#fbbf24',
        'gradient': 'radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)',
        'default_rom': 'roms/DuckTales 2 (U) [!].nes',
        'desc': 'Scrooge McDuck embarks on a worldwide quest for the lost treasure of McDuck! Use the newly enhanced cane pull to yank heavy switches and uncover 7 secret map pieces.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'chip-n-dale-2',
        'match_keys': ['chip-n-dale-2', 'rescue-rangers-2', 'chip-and-dale-2'],
        'title': "Chip 'n Dale Rescue Rangers 2",
        'sub': 'Rank #46 All-Time • 1993',
        'system': 'PLATFORMER',
        'rank': 46,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': 'Enhanced co-op mechanics and gorgeous 8-bit Capcom animations.',
        'icon': '🐿️',
        'color': '#f97316',
        'gradient': 'radial-gradient(circle at 75% 25%, #9a3412 0%, #06080e 70%)',
        'default_rom': "roms/Chip 'n Dale Rescue Rangers 2 (U) [!].nes",
        'desc': 'Fat Cat escapes prison to steal the Urn of the Pharaoh! Team up for improved co-op throwing, secret bonus rooms, and boss battles at the harbor and amusement park.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'mega-man-5',
        'match_keys': ['mega-man-5', 'megaman-5', 'rockman-5', 'megaman5'],
        'title': 'Mega Man 5',
        'sub': 'Rank #47 All-Time • 1992',
        'system': 'ACTION',
        'rank': 47,
        'review_score': '★ 9.1/10 IGN',
        'review_quote': 'Super Arrow, Beat the bird, and gravity-flipping stages.',
        'icon': '🤖',
        'color': '#06b6d4',
        'gradient': 'radial-gradient(circle at 75% 25%, #0e7490 0%, #06080e 70%)',
        'default_rom': 'roms/Mega Man 5 (J) [!].nes',
        'desc': 'When Proto Man turns rogue, Mega Man enters the fray with an expanded Mega Buster and robot bird companion Beat! Flip gravity in Gravity Man’s stage.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'mega-man-6',
        'match_keys': ['mega-man-6', 'megaman-6', 'rockman-6', 'megaman6'],
        'title': 'Mega Man 6',
        'sub': 'Rank #48 All-Time • 1993',
        'system': 'ACTION',
        'rank': 48,
        'review_score': '★ 9.1/10 IGN',
        'review_quote': 'Jet Adaptor and Power Adaptor armor transformations.',
        'icon': '🤖',
        'color': '#3b82f6',
        'gradient': 'radial-gradient(circle at 75% 25%, #1d4ed8 0%, #06080e 70%)',
        'default_rom': 'roms/Mega Man 6 (J) [!].nes',
        'desc': 'Fuse with Rush to unlock Jet Mega Man for flight and Power Mega Man to smash cracked walls! Challenge the mysterious Mr. X and his 8 international Robot Masters.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'ninja-gaiden-2',
        'match_keys': ['ninja-gaiden-ii', 'ninja-gaiden-2', 'dark-sword-of-chaos', 'ninjagaiden2'],
        'title': 'Ninja Gaiden II: The Dark Sword of Chaos',
        'sub': 'Rank #49 All-Time • 1990',
        'system': 'ACTION',
        'rank': 49,
        'review_score': '★ 9.3/10 IGN',
        'review_quote': 'Shadow clone ninja mechanics and cinematic cutscenes.',
        'icon': '🥷',
        'color': '#dc2626',
        'gradient': 'radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)',
        'default_rom': 'roms/Ninja Gaiden II (U) [!].nes',
        'desc': 'Ryu Hayabusa returns to battle the evil emperor Ashtar! Summon indestructible shadow clones that mimic your ninja arts, and scale walls with lightning precision.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'ninja-gaiden-3',
        'match_keys': ['ninja-gaiden-iii', 'ninja-gaiden-3', 'ancient-ship-of-doom', 'ninjagaiden3'],
        'title': 'Ninja Gaiden III: The Ancient Ship of Doom',
        'sub': 'Rank #50 All-Time • 1991',
        'system': 'ACTION',
        'rank': 50,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'Polished trilogy finale with sword power upgrades and overhead climbing.',
        'icon': '🥷',
        'color': '#b91c1c',
        'gradient': 'radial-gradient(circle at 75% 25%, #450a0a 0%, #06080e 70%)',
        'default_rom': 'roms/Ninja Gaiden III (U) [!].nes',
        'desc': 'The thrilling climax to the 8-bit trilogy! Framed for the murder of Irene Lew, Ryu must clear his name using enhanced jumping arcs, extended sword beams, and overhead wire climbing.',
        'top20': True,
        'top100': True,
        'top50': True,
        'hall_of_fame': True
    },
    {
        'id': 'batman',
        'match_keys': ['batman (e)', 'batman'],
        'title': 'Batman: The Video Game',
        'sub': 'Rank #51 All-Time • 1989',
        'system': 'ACTION',
        'rank': 51,
        'review_score': '★ 9.4/10 IGN',
        'review_quote': 'Sunsoft’s technical tour-de-force with precision wall-jumps and legendary soundtrack.',
        'icon': '🦇',
        'color': '#818cf8',
        'gradient': 'radial-gradient(circle at 75% 25%, #312e81 0%, #06080e 70%)',
        'default_rom': 'roms/Batman (E) [!].nes',
        'desc': 'Master the Caped Crusader’s wall-bounding agility, Batarangs, and bat-discs across Gotham’s chemical plant to defeat the Joker.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'dr-mario',
        'match_keys': ['dr-mario', 'dr.-mario'],
        'title': 'Dr. Mario',
        'sub': 'Rank #52 All-Time • 1990',
        'system': 'PUZZLE',
        'rank': 52,
        'review_score': '★ 9.3/10 GameSpot',
        'review_quote': 'Gunpei Yokoi’s iconic falling-pill puzzle sensation with infectious Fever theme.',
        'icon': '💊',
        'color': '#ec4899',
        'gradient': 'radial-gradient(circle at 75% 25%, #831843 0%, #06080e 70%)',
        'default_rom': 'roms/Dr. Mario (E) [!].nes',
        'desc': 'Rotate red, yellow, and blue vitamin capsules to neutralize viruses in the bottle! Features legendary 2-player battle mode.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'crystalis',
        'match_keys': ['crystalis'],
        'title': 'Crystalis',
        'sub': 'Rank #53 All-Time • 1990',
        'system': 'ADVENTURE',
        'rank': 53,
        'review_score': '★ 9.3/10 IGN',
        'review_quote': 'Post-apocalyptic action-RPG masterpiece with elemental charging swords.',
        'icon': '⚔️',
        'color': '#10b981',
        'gradient': 'radial-gradient(circle at 75% 25%, #064e3b 0%, #06080e 70%)',
        'default_rom': 'roms/Crystalis (U) [!].nes',
        'desc': 'Awaken from cryogenic sleep 100 years after nuclear apocalypse! Combine the Swords of Wind, Fire, Water, and Thunder to construct Crystalis.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'jackal',
        'match_keys': ['jackal'],
        'title': 'Jackal',
        'sub': 'Rank #54 All-Time • 1988',
        'system': 'ACTION',
        'rank': 54,
        'review_score': '★ 9.3/10 Nintendo Power',
        'review_quote': 'Konami’s adrenaline top-down armed jeep hostage rescue run-and-gun.',
        'icon': '🚙',
        'color': '#f59e0b',
        'gradient': 'radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)',
        'default_rom': 'roms/Jackal (U) [!].nes',
        'desc': 'Drive an armed military jeep behind enemy lines! Blast prison camps, rescue POWs, upgrade machine guns to homing missiles, and reach the chopper.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'shatterhand',
        'match_keys': ['shatterhand'],
        'title': 'Shatterhand',
        'sub': 'Rank #55 All-Time • 1991',
        'system': 'ACTION',
        'rank': 55,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'Natsume’s cyberpunk bionic brawler with robotic satellite attack drones.',
        'icon': '👊',
        'color': '#06b6d4',
        'gradient': 'radial-gradient(circle at 75% 25%, #155e75 0%, #06080e 70%)',
        'default_rom': 'roms/Shatterhand (E) [!].nes',
        'desc': 'Equip cybernetic fists to shatter armored tanks and deflect bullets! Collect Greek letters to assemble 8 specialized robotic satellite partners.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'journey-to-silius',
        'match_keys': ['journey-to-silius', 'silius'],
        'title': 'Journey to Silius',
        'sub': 'Rank #56 All-Time • 1990',
        'system': 'ACTION',
        'rank': 56,
        'review_score': '★ 9.2/10 GameSpot',
        'review_quote': 'Sunsoft’s thumping industrial synth basslines and heavy artillery mechanics.',
        'icon': '🔫',
        'color': '#6366f1',
        'gradient': 'radial-gradient(circle at 75% 25%, #3730a3 0%, #06080e 70%)',
        'default_rom': 'roms/Journey to Silius (E) [!].nes',
        'desc': 'Avenge your father’s space colony! Wield shotguns, laser rifles, homing missiles, and grenade launchers against android terror syndicates.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'adventure-island-2',
        'match_keys': ['adventure-island-ii', 'adventure-island-2'],
        'title': 'Adventure Island II',
        'sub': 'Rank #57 All-Time • 1991',
        'system': 'PLATFORMER',
        'rank': 57,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'Master Higgins riding 4 rideable dinosaur companions with elemental breath.',
        'icon': '🦕',
        'color': '#84cc16',
        'gradient': 'radial-gradient(circle at 75% 25%, #365314 0%, #06080e 70%)',
        'default_rom': 'roms/Adventure Island II (E) [!].nes',
        'desc': 'Ride blue camptosaurs on water and pterodactyls in the sky! Explore 8 tropical archipelago islands with inventory weapon storage.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'faxanadu',
        'match_keys': ['faxanadu'],
        'title': 'Faxanadu',
        'sub': 'Rank #58 All-Time • 1987',
        'system': 'ADVENTURE',
        'rank': 58,
        'review_score': '★ 9.1/10 Nintendo Power',
        'review_quote': 'Gothic dark fantasy sidescroller climbing the Elven World Tree.',
        'icon': '🌳',
        'color': '#14b8a6',
        'gradient': 'radial-gradient(circle at 75% 25%, #134e4a 0%, #06080e 70%)',
        'default_rom': 'roms/Faxanadu (E) [!].nes',
        'desc': 'Climb the colossal World Tree Eolis! Buy magical spells, battle grotesque Evil Ones, and cleanse the poisoned mountain spring water.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'rygar',
        'match_keys': ['rygar'],
        'title': 'Rygar',
        'sub': 'Rank #59 All-Time • 1987',
        'system': 'ADVENTURE',
        'rank': 59,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': 'Tecmo’s mythological action adventure wielding the spinning Diskerarm shield.',
        'icon': '🛡️',
        'color': '#eab308',
        'gradient': 'radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)',
        'default_rom': 'roms/Rygar (E) [!].nes',
        'desc': 'Wield the legendary Diskerarm on a chained spool! Travel across overhead plains and side-scrolling caverns to depose the cruel beast King Ligar.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'mighty-final-fight',
        'match_keys': ['mighty-final-fight'],
        'title': 'Mighty Final Fight',
        'sub': 'Rank #60 All-Time • 1993',
        'system': 'ACTION',
        'rank': 60,
        'review_score': '★ 9.1/10 IGN',
        'review_quote': 'Capcom’s comedic SD beat-’em-up with Cody, Guy, Haggar, and RPG experience levels.',
        'icon': '🥊',
        'color': '#ef4444',
        'gradient': 'radial-gradient(circle at 75% 25%, #991b1b 0%, #06080e 70%)',
        'default_rom': 'roms/Mighty Final Fight (E) [!].nes',
        'desc': 'Metro City reimagined in adorable chibi arcade action! Level up your fighter to unlock devastating Tornado Kicks and Super Piledrivers.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'mario-bros',
        'match_keys': ['mario-bros'],
        'title': 'Mario Bros.',
        'sub': 'Rank #61 All-Time • 1983',
        'system': 'ARCADE',
        'rank': 61,
        'review_score': '★ 9.2/10 All-Time',
        'review_quote': 'Where Mario and Luigi first teamed up bouncing slip-ice pests from sewer pipes.',
        'icon': '🪠',
        'color': '#3b82f6',
        'gradient': 'radial-gradient(circle at 75% 25%, #1e3a8a 0%, #06080e 70%)',
        'default_rom': 'roms/Mario Bros. (E) [!].nes',
        'desc': 'Bump sewer pipes from below to flip Shellcreepers and Sidesteppers on their backs! Hit the POW block for room-clearing shockwaves.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'duck-hunt',
        'match_keys': ['duck-hunt'],
        'title': 'Duck Hunt',
        'sub': 'Rank #62 All-Time • 1984',
        'system': 'ARCADE',
        'rank': 62,
        'review_score': '★ 9.2/10 All-Time',
        'review_quote': 'The light-gun phenomenon that defined the generation; laughing hunting hound.',
        'icon': '🐕',
        'color': '#eab308',
        'gradient': 'radial-gradient(circle at 75% 25%, #854d0e 0%, #06080e 70%)',
        'default_rom': 'roms/Duck Hunt (W) [!].nes',
        'desc': 'Aim and fire at clay pigeons and flying mallards! Watch out for the iconic laughing dog when you miss.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'popeye',
        'match_keys': ['popeye'],
        'title': 'Popeye',
        'sub': 'Rank #63 All-Time • 1983',
        'system': 'ARCADE',
        'rank': 63,
        'review_score': '★ 9.0/10 All-Time',
        'review_quote': 'Miyamoto’s beloved arcade spinach chaser dodging Brutus and Sea Hag skulls.',
        'icon': '⚓',
        'color': '#0284c7',
        'gradient': 'radial-gradient(circle at 75% 25%, #075985 0%, #06080e 70%)',
        'default_rom': 'roms/Popeye (W) [!].nes',
        'desc': 'Catch hearts, musical notes, and letters tossed by Olive Oyl while dodging Brutus across dockside platforms! Grab spinach to punch rivals into the sea.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'kung-fu',
        'match_keys': ['kung-fu', 'spartan-x'],
        'title': 'Kung Fu',
        'sub': 'Rank #64 All-Time • 1985',
        'system': 'ACTION',
        'rank': 64,
        'review_score': '★ 9.1/10 All-Time',
        'review_quote': 'The original side-scrolling martial arts brawler scaling the 5-floor pagoda.',
        'icon': '🥋',
        'color': '#dc2626',
        'gradient': 'radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)',
        'default_rom': 'roms/Kung Fu (E) [!].nes',
        'desc': 'Punch and jump-kick through 5 levels of the Devil’s Temple as Thomas! Defeat the Boomerang Fighter and Giant to rescue Sylvia.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'wrecking-crew',
        'match_keys': ['wrecking-crew'],
        'title': 'Wrecking Crew',
        'sub': 'Rank #65 All-Time • 1985',
        'system': 'ARCADE',
        'rank': 65,
        'review_score': '★ 9.0/10 Nintendo Power',
        'review_quote': 'Demolition puzzle action featuring Mario, the Golden Hammer, and Foreman Spike.',
        'icon': '🔨',
        'color': '#ea580c',
        'gradient': 'radial-gradient(circle at 75% 25%, #9a3412 0%, #06080e 70%)',
        'default_rom': 'roms/Wrecking Crew (W) [!].nes',
        'desc': 'Demolish brick walls, stone pillars, and ladders with your heavy hammer across 100 industrial construction puzzle stages.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'donkey-kong-3',
        'match_keys': ['donkey-kong-3'],
        'title': 'Donkey Kong 3',
        'sub': 'Rank #66 All-Time • 1983',
        'system': 'ARCADE',
        'rank': 66,
        'review_score': '★ 8.9/10 All-Time',
        'review_quote': 'Stanley the Bugman defending botanical greenhouses with insecticide sprays.',
        'icon': '🐝',
        'color': '#ca8a04',
        'gradient': 'radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)',
        'default_rom': 'roms/Donkey Kong 3 (W) [!].nes',
        'desc': 'Spray insecticide upward to push Donkey Kong into the rafters while defending your precious greenhouse flowers from Queen Buzzy swarms.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'mach-rider',
        'match_keys': ['mach-rider'],
        'title': 'Mach Rider',
        'sub': 'Rank #67 All-Time • 1985',
        'system': 'ARCADE',
        'rank': 67,
        'review_score': '★ 8.9/10 Nintendo Power',
        'review_quote': 'Post-apocalyptic motorcycle combat racing with rear-view mirrors and gears.',
        'icon': '🏍️',
        'color': '#b91c1c',
        'gradient': 'radial-gradient(circle at 75% 25%, #450a0a 0%, #06080e 70%)',
        'default_rom': 'roms/Mach Rider (E) [!].nes',
        'desc': 'Shift through 4 motorcycle gears across nuclear wasteland highways! Blast Quadrunners with twin mounted machine guns.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'battle-city',
        'match_keys': ['battle-city'],
        'title': 'Battle City',
        'sub': 'Rank #68 All-Time • 1985',
        'system': 'ACTION',
        'rank': 68,
        'review_score': '★ 9.2/10 Masterpiece',
        'review_quote': 'Namco’s tactical tank base defense with destructible masonry and power stars.',
        'icon': '🛡️',
        'color': '#65a30d',
        'gradient': 'radial-gradient(circle at 75% 25%, #365314 0%, #06080e 70%)',
        'default_rom': 'roms/Battle City (J) [!].nes',
        'desc': 'Defend the golden phoenix base! Blast through brick barricades, collect grenade power-ups, and eliminate 20 invading enemy tanks.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'dig-dug',
        'match_keys': ['dig-dug', 'digdug'],
        'title': 'Dig Dug',
        'sub': 'Rank #69 All-Time • 1982',
        'system': 'ARCADE',
        'rank': 69,
        'review_score': '★ 9.3/10 All-Time',
        'review_quote': 'Subterranean pump inflation and rock-dropping arcade maze masterpiece.',
        'icon': '⛏️',
        'color': '#0284c7',
        'gradient': 'radial-gradient(circle at 75% 25%, #0c4a6e 0%, #06080e 70%)',
        'default_rom': 'roms/Dig Dug (J) [!].nes',
        'desc': 'Dig dirt tunnels to trap Pookas and Fygars! Pump enemies full of air until they pop, or crush them under giant falling boulders.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'lode-runner',
        'match_keys': ['lode-runner'],
        'title': 'Lode Runner',
        'sub': 'Rank #70 All-Time • 1983',
        'system': 'PUZZLE',
        'rank': 70,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': 'Hudson Soft’s gold-snatching, brick-drilling strategic platform puzzler.',
        'icon': '🧱',
        'color': '#f97316',
        'gradient': 'radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)',
        'default_rom': 'roms/Lode Runner (J) [!].nes',
        'desc': 'Dig holes to trap pursuers and snatch all gold chests across 50 brain-teasing brick maze stages to unlock the escape ladder.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': '1943-battle-of-midway',
        'match_keys': ['1943', 'battle-of-midway'],
        'title': '1943: The Battle of Midway',
        'sub': 'Rank #71 All-Time • 1988',
        'system': 'SHOOTER',
        'rank': 71,
        'review_score': '★ 9.3/10 IGN',
        'review_quote': 'WWII naval airstrike shooter with P-38 Lightning loops and mega-bomb tsunamis.',
        'icon': '✈️',
        'color': '#3b82f6',
        'gradient': 'radial-gradient(circle at 75% 25%, #1d4ed8 0%, #06080e 70%)',
        'default_rom': 'roms/1943 (U) [!].nes',
        'desc': 'Fly the twin-fuselage P-38 Lightning across the Pacific! Loop through enemy flak and trigger tsunami bombs to sink the battleship Yamato.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': '1942',
        'match_keys': ['1942'],
        'title': '1942',
        'sub': 'Rank #72 All-Time • 1985',
        'system': 'SHOOTER',
        'rank': 72,
        'review_score': '★ 9.0/10 All-Time',
        'review_quote': 'Capcom’s foundational aerial Pacific dogfight arcade pioneer.',
        'icon': '🛩️',
        'color': '#0ea5e9',
        'gradient': 'radial-gradient(circle at 75% 25%, #0369a1 0%, #06080e 70%)',
        'default_rom': 'roms/1942 (JU) [!].nes',
        'desc': 'Capcom’s historic aerial pioneer! Dodge incoming Zero squadrons with loop-the-loops and reach Tokyo across 32 intense dogfight stages.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'star-force',
        'match_keys': ['star-force'],
        'title': 'Star Force',
        'sub': 'Rank #73 All-Time • 1985',
        'system': 'SHOOTER',
        'rank': 73,
        'review_score': '★ 9.1/10 All-Time',
        'review_quote': 'Tecmo’s defining high-velocity space shooter defending against the floating megalopolis.',
        'icon': '🚀',
        'color': '#8b5cf6',
        'gradient': 'radial-gradient(circle at 75% 25%, #5b21b6 0%, #06080e 70%)',
        'default_rom': 'roms/Star Force (E) [!].nes',
        'desc': 'Pilot the Final Star through 26 alphabetical target zones! Destroy Greek-letter command targets to claim million-point bonuses.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'xevious',
        'match_keys': ['xevious'],
        'title': 'Xevious',
        'sub': 'Rank #74 All-Time • 1982',
        'system': 'SHOOTER',
        'rank': 74,
        'review_score': '★ 9.1/10 All-Time',
        'review_quote': 'The father of vertical scrolling shooters with dual aerial and ground targeting.',
        'icon': '🛸',
        'color': '#6366f1',
        'gradient': 'radial-gradient(circle at 75% 25%, #3730a3 0%, #06080e 70%)',
        'default_rom': 'roms/Xevious (E) [!].nes',
        'desc': 'Fire air lasers at Toroid rings while dropping Blaster bombs onto ground bases and giant floating Andor Genesis motherships.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'twinbee',
        'match_keys': ['twinbee'],
        'title': 'TwinBee',
        'sub': 'Rank #75 All-Time • 1985',
        'system': 'SHOOTER',
        'rank': 75,
        'review_score': '★ 9.0/10 GameSpot',
        'review_quote': 'Konami’s cute-’em-up bell-juggling vertical shooter phenomenon.',
        'icon': '🔔',
        'color': '#ec4899',
        'gradient': 'radial-gradient(circle at 75% 25%, #9d174d 0%, #06080e 70%)',
        'default_rom': 'roms/TwinBee (J) [!].nes',
        'desc': 'Shoot cloud banks to reveal golden bells, then juggle them with blaster fire to shift colors between speed, twin cannons, and protective shields.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'star-soldier',
        'match_keys': ['star-soldier'],
        'title': 'Star Soldier',
        'sub': 'Rank #76 All-Time • 1986',
        'system': 'SHOOTER',
        'rank': 76,
        'review_score': '★ 9.1/10 Nintendo Power',
        'review_quote': 'Hudson Soft’s national caravan competition vertical speed shooter.',
        'icon': '⚡',
        'color': '#eab308',
        'gradient': 'radial-gradient(circle at 75% 25%, #854d0e 0%, #06080e 70%)',
        'default_rom': 'roms/Star Soldier (J) [!].nes',
        'desc': 'Power up the Caesar starfighter with 5-way spread beams! Fly beneath surface space stations to sneak attack hidden Star Brain bosses.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'gun-nac',
        'match_keys': ['gun-nac', 'gunnac'],
        'title': 'Gun-Nac',
        'sub': 'Rank #77 All-Time • 1990',
        'system': 'SHOOTER',
        'rank': 77,
        'review_score': '★ 9.4/10 IGN',
        'review_quote': 'Compile’s speed masterpiece; widely acclaimed as the finest vertical shooter on NES.',
        'icon': '💥',
        'color': '#f97316',
        'gradient': 'radial-gradient(circle at 75% 25%, #9a3412 0%, #06080e 70%)',
        'default_rom': 'roms/Gun-Nac (J) [!].nes',
        'desc': 'Pure adrenaline vertical shooting! Cycle between 5 weapon systems, buy upgrades at galactic shops, and release blizzard screen-clearing bombs.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'mappy',
        'match_keys': ['mappy'],
        'title': 'Mappy',
        'sub': 'Rank #78 All-Time • 1983',
        'system': 'ARCADE',
        'rank': 78,
        'review_score': '★ 9.0/10 All-Time',
        'review_quote': 'Trampoline-bouncing micro police mouse recovering stolen loot from Meowkies.',
        'icon': '🐭',
        'color': '#14b8a6',
        'gradient': 'radial-gradient(circle at 75% 25%, #0f766e 0%, #06080e 70%)',
        'default_rom': 'roms/Mappy (J) [!].nes',
        'desc': 'Bounce on trampolines to evade Nyamco the cat burglar! Open microwave doors to blast cat gangs with sonic shockwaves and retrieve radios and safes.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'arkanoid',
        'match_keys': ['arkanoid'],
        'title': 'Arkanoid',
        'sub': 'Rank #79 All-Time • 1986',
        'system': 'ARCADE',
        'rank': 79,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': 'Taito’s paddle breakout classic with Vaus lasers and multi-ball energy capsules.',
        'icon': '🧱',
        'color': '#a855f7',
        'gradient': 'radial-gradient(circle at 75% 25%, #6b21a8 0%, #06080e 70%)',
        'default_rom': 'roms/Arkanoid (J) [!].nes',
        'desc': 'Command the Vaus paddle ship to shatter cosmic block walls! Collect falling energy capsules to gain laser blasters, sticky pads, and tri-balls.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'gimmick',
        'match_keys': ['gimmick'],
        'title': 'Gimmick!',
        'sub': 'Rank #80 All-Time • 1992',
        'system': 'PLATFORMER',
        'rank': 80,
        'review_score': '★ 9.4/10 IGN',
        'review_quote': 'Sunsoft’s holy grail physics platformer; ride bouncy star projectiles.',
        'icon': '⭐',
        'color': '#10b981',
        'gradient': 'radial-gradient(circle at 75% 25%, #047857 0%, #06080e 70%)',
        'default_rom': 'roms/Gimmick! (J) [!].nes',
        'desc': 'Sunsoft’s legendary technical showcase! Charge and fling star projectiles that bounce off slopes with realistic momentum to reach secret exits.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'tecmo-super-bowl',
        'match_keys': ['tecmo-super-bowl'],
        'title': 'Tecmo Super Bowl',
        'sub': 'Rank #81 All-Time • 1991',
        'system': 'FIGHTING',
        'rank': 81,
        'review_score': '★ 9.5/10 IGN',
        'review_quote': 'The greatest 8-bit sports game ever created; real NFL rosters and Bo Jackson!',
        'icon': '🏈',
        'color': '#22c55e',
        'gradient': 'radial-gradient(circle at 75% 25%, #14532d 0%, #06080e 70%)',
        'default_rom': 'roms/Tecmo Super Bowl (J) [!].nes',
        'desc': 'The definitive 8-bit gridiron classic! Play with all 28 NFL teams, track real season statistics, and run rampant with the unstoppable Bo Jackson.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'blades-of-steel',
        'match_keys': ['blades-of-steel'],
        'title': 'Blades of Steel',
        'sub': 'Rank #82 All-Time • 1988',
        'system': 'FIGHTING',
        'rank': 82,
        'review_score': '★ 9.3/10 GameSpot',
        'review_quote': '“With the pass!” — Konami’s hard-hitting hockey with on-ice glove-dropping brawls.',
        'icon': '🏒',
        'color': '#06b6d4',
        'gradient': 'radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)',
        'default_rom': 'roms/Blades of Steel (E) [!].nes',
        'desc': 'Konami’s hockey sensation! Execute fast one-timers, drop the gloves for on-ice bare-knuckle fights, and enjoy the intermission mini-games.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'tecmo-bowl',
        'match_keys': ['tecmo-bowl'],
        'title': 'Tecmo Bowl',
        'sub': 'Rank #83 All-Time • 1989',
        'system': 'FIGHTING',
        'rank': 83,
        'review_score': '★ 9.2/10 Nintendo Power',
        'review_quote': 'Foundational arcade gridiron football with lightning cutscene collisions.',
        'icon': '🏈',
        'color': '#eab308',
        'gradient': 'radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)',
        'default_rom': 'roms/Tecmo Bowl (J) [!].nes',
        'desc': 'Choose from 4 offensive plays and break through the line of scrimmage in the arcade football classic that defined competitive multiplayer.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'double-dribble',
        'match_keys': ['double-dribble'],
        'title': 'Double Dribble',
        'sub': 'Rank #84 All-Time • 1987',
        'system': 'ARCADE',
        'rank': 84,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': 'Revolutionary full-court basketball with cinematic slow-motion slam dunks.',
        'icon': '🏀',
        'color': '#f97316',
        'gradient': 'radial-gradient(circle at 75% 25%, #c2410c 0%, #06080e 70%)',
        'default_rom': 'roms/Double Dribble (E) [!].nes',
        'desc': 'Drive into the lane and trigger cinematic 8-bit slam dunk cutscenes with authentic crowd cheers in Konami’s iconic basketball showdown.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'ice-hockey',
        'match_keys': ['ice-hockey'],
        'title': 'Ice Hockey',
        'sub': 'Rank #85 All-Time • 1988',
        'system': 'ARCADE',
        'rank': 85,
        'review_score': '★ 9.2/10 Nintendo Power',
        'review_quote': 'Assemble tactical teams of skinny speedsters, medium wings, and heavy enforcers.',
        'icon': '🏒',
        'color': '#38bdf8',
        'gradient': 'radial-gradient(circle at 75% 25%, #0369a1 0%, #06080e 70%)',
        'default_rom': 'roms/Ice Hockey (E) [!].nes',
        'desc': 'Mix and match body types to balance agility, checking power, and slap shot speed across tournament rink faceoffs.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'paperboy',
        'match_keys': ['paperboy'],
        'title': 'Paperboy',
        'sub': 'Rank #86 All-Time • 1988',
        'system': 'ARCADE',
        'rank': 86,
        'review_score': '★ 9.0/10 All-Time',
        'review_quote': 'Isometric obstacle delivery avoiding runaway lawnmowers, grim reapers, and dogs.',
        'icon': '📰',
        'color': '#f59e0b',
        'gradient': 'radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)',
        'default_rom': 'roms/Paperboy (E) [!].nes',
        'desc': 'Ride your bicycle through suburban obstacle courses! Toss morning papers into subscriber mailboxes while dodging runaway cars and lawnmowers.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'north-and-south',
        'match_keys': ['north-and-south', 'north-south'],
        'title': 'North & South',
        'sub': 'Rank #87 All-Time • 1990',
        'system': 'ADVENTURE',
        'rank': 87,
        'review_score': '★ 9.1/10 IGN',
        'review_quote': 'Infogrames tactical strategy combining board movement and real-time fort brawls.',
        'icon': '⚔️',
        'color': '#ef4444',
        'gradient': 'radial-gradient(circle at 75% 25%, #991b1b 0%, #06080e 70%)',
        'default_rom': 'roms/North & South (E) [!].nes',
        'desc': 'Command Union or Confederate armies! Conquer state territories, protect gold train transports, and storm forts in real-time melee duels.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'tiny-toon-adventures',
        'match_keys': ['tiny-toon-adventures', 'tiny-toon'],
        'title': 'Tiny Toon Adventures',
        'sub': 'Rank #88 All-Time • 1991',
        'system': 'PLATFORMER',
        'rank': 88,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': 'Buster Bunny swapping partners with Plucky Duck, Dizzy Devil, and Furd.',
        'icon': '🐰',
        'color': '#60a5fa',
        'gradient': 'radial-gradient(circle at 75% 25%, #1e40af 0%, #06080e 70%)',
        'default_rom': 'roms/Tiny Toon Adventures (E) [!].nes',
        'desc': 'Capcom-quality Disney-style platforming! Tag in Plucky Duck to glide across chasms or Dizzy Devil to spin through blocks on your quest to rescue Babs.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'little-nemo',
        'match_keys': ['little-nemo'],
        'title': 'Little Nemo: The Dream Master',
        'sub': 'Rank #89 All-Time • 1990',
        'system': 'PLATFORMER',
        'rank': 89,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'Feed candy to animal friends (frogs, lizards, moles) to borrow their abilities.',
        'icon': '🍬',
        'color': '#a78bfa',
        'gradient': 'radial-gradient(circle at 75% 25%, #5b21b6 0%, #06080e 70%)',
        'default_rom': 'roms/Little Nemo (E) [!].nes',
        'desc': 'Capcom’s dreamscape fairy-tale adventure! Feed candy to frogs for high jumps, lizards to climb walls, and moles to dig for hidden keys.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'adventure-island',
        'match_keys': ['adventure-island'],
        'title': 'Adventure Island',
        'sub': 'Rank #90 All-Time • 1986',
        'system': 'PLATFORMER',
        'rank': 90,
        'review_score': '★ 9.0/10 Nintendo Power',
        'review_quote': 'Master Higgins riding skateboards, hurling stone tomahawks, and collecting fruit.',
        'icon': '🪓',
        'color': '#84cc16',
        'gradient': 'radial-gradient(circle at 75% 25%, #3f6212 0%, #06080e 70%)',
        'default_rom': 'roms/Adventure Island (E) [!].nes',
        'desc': 'The original tropical survival sprint! Gobble fruit to keep your energy gauge full while jumping campfires and throwing axes across 32 stages.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'maniac-mansion',
        'match_keys': ['maniac-mansion'],
        'title': 'Maniac Mansion',
        'sub': 'Rank #91 All-Time • 1990',
        'system': 'ADVENTURE',
        'rank': 91,
        'review_score': '★ 9.3/10 IGN',
        'review_quote': 'Ron Gilbert’s point-and-click comedy horror landmark; multiple endings.',
        'icon': '🏚️',
        'color': '#d97706',
        'gradient': 'radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)',
        'default_rom': 'roms/Maniac Mansion (U) [!].nes',
        'desc': 'Lead 3 teenagers through the bizarre Edison Victorian mansion! Solve SCUMM verb-coin puzzles, evade Nurse Edna, and stop the sentient meteor.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'solomons-key',
        'match_keys': ['solomons-key', 'solomon-key'],
        'title': "Solomon's Key",
        'sub': 'Rank #92 All-Time • 1986',
        'system': 'PUZZLE',
        'rank': 92,
        'review_score': '★ 9.1/10 GameSpot',
        'review_quote': 'Conjure and smash orange blocks to navigate goblin-infested dark puzzle crypts.',
        'icon': '🗝️',
        'color': '#f59e0b',
        'gradient': 'radial-gradient(circle at 75% 25%, #92400e 0%, #06080e 70%)',
        'default_rom': "roms/Solomon's Key (E) [!].nes",
        'desc': 'Cast creation magic as wizard Dana! Create orange stone blocks to climb cliffs, redirect flame balls, and find the door key in 50 claustrophobic rooms.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'gargoyles-quest-2',
        'match_keys': ['gargoyles-quest-ii', 'gargoyles-quest-2'],
        'title': "Gargoyle's Quest II",
        'sub': 'Rank #93 All-Time • 1992',
        'system': 'ADVENTURE',
        'rank': 93,
        'review_score': '★ 9.2/10 IGN',
        'review_quote': 'Capcom’s Makaimura spin-off following Firebrand the demon’s RPG flight saga.',
        'icon': '🦇',
        'color': '#7c3aed',
        'gradient': 'radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)',
        'default_rom': "roms/Gargoyle's Quest II (E) [!].nes",
        'desc': 'Control Firebrand the red gargoyle! Hover on demon wings, cling to rocky precipices, and blast mystical dark fire to liberate the Ghoul Realm.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'clu-clu-land',
        'match_keys': ['clu-clu-land'],
        'title': 'Clu Clu Land',
        'sub': 'Rank #94 All-Time • 1984',
        'system': 'ARCADE',
        'rank': 94,
        'review_score': '★ 8.9/10 All-Time',
        'review_quote': 'Bubbles spinning around turning poles to uncover hidden golden bullion designs.',
        'icon': '🫧',
        'color': '#06b6d4',
        'gradient': 'radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)',
        'default_rom': 'roms/Clu Clu Land (W) [!].nes',
        'desc': 'Reach out Bubbles’ hands to catch turning poles and change directions! Uncover all gold ingots to reveal hidden pixel art before time expires.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'pinball',
        'match_keys': ['pinball'],
        'title': 'Pinball',
        'sub': 'Rank #95 All-Time • 1983',
        'system': 'ARCADE',
        'rank': 95,
        'review_score': '★ 9.0/10 All-Time',
        'review_quote': 'Dual-screen flipper physics featuring an interactive Mario Breakout bonus room.',
        'icon': '🕹️',
        'color': '#3b82f6',
        'gradient': 'radial-gradient(circle at 75% 25%, #1e40af 0%, #06080e 70%)',
        'default_rom': 'roms/Pinball (E) [!].nes',
        'desc': 'Realistic two-screen table flipper physics! Hit the ball into the bonus hole to play Breakout as Mario holding a platform to bounce balls and rescue Pauline.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'golf',
        'match_keys': ['golf'],
        'title': 'Golf',
        'sub': 'Rank #96 All-Time • 1984',
        'system': 'ARCADE',
        'rank': 96,
        'review_score': '★ 8.9/10 All-Time',
        'review_quote': 'Satoru Iwata’s engineering stroke; introduced the two-click swing power meter.',
        'icon': '⛳',
        'color': '#16a34a',
        'gradient': 'radial-gradient(circle at 75% 25%, #14532d 0%, #06080e 70%)',
        'default_rom': 'roms/Golf (E) [!].nes',
        'desc': 'Satoru Iwata’s programming masterpiece! Read wind direction, pick drivers and wedges, and time your backswing across 18 championship holes.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'tennis',
        'match_keys': ['tennis'],
        'title': 'Tennis',
        'sub': 'Rank #97 All-Time • 1984',
        'system': 'ARCADE',
        'rank': 97,
        'review_score': '★ 9.0/10 All-Time',
        'review_quote': 'Precision baseline rallying with Mario acting as the chair umpire.',
        'icon': '🎾',
        'color': '#84cc16',
        'gradient': 'radial-gradient(circle at 75% 25%, #3f6212 0%, #06080e 70%)',
        'default_rom': 'roms/Tennis (U) [!].nes',
        'desc': 'Fast baseline rallies, drop shots, and overhead smashes with Mario perched in the umpire chair! Play singles or 2-player doubles.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'baseball',
        'match_keys': ['baseball'],
        'title': 'Baseball',
        'sub': 'Rank #98 All-Time • 1983',
        'system': 'ARCADE',
        'rank': 98,
        'review_score': '★ 8.9/10 All-Time',
        'review_quote': 'The quintessential NES sports launch classic with full 9-inning strategy.',
        'icon': '⚾',
        'color': '#ef4444',
        'gradient': 'radial-gradient(circle at 75% 25%, #991b1b 0%, #06080e 70%)',
        'default_rom': 'roms/Baseball (U) [!].nes',
        'desc': 'Step up to the plate in the NES launch sport! Pitch curveballs and fastballs, steal second base, and hit moonshots over the center field fence.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'track-and-field',
        'match_keys': ['track-and-field', 'hyper-olympic'],
        'title': 'Track & Field (Hyper Olympic)',
        'sub': 'Rank #99 All-Time • 1985',
        'system': 'ARCADE',
        'rank': 99,
        'review_score': '★ 9.1/10 All-Time',
        'review_quote': 'Rapid-fire reflex athletics: 100m sprint, long jump, hurdles, and javelin.',
        'icon': '🏃',
        'color': '#f59e0b',
        'gradient': 'radial-gradient(circle at 75% 25%, #b45309 0%, #06080e 70%)',
        'default_rom': 'roms/Track & Field (J) [!].nes',
        'desc': 'Button-mashing Olympic competition! Sprint the 100m dash, time hurdle hops, and aim your angle gauge for world record javelin throws.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    },
    {
        'id': 'mega-man-1',
        'match_keys': ['mega-man (j)', 'mega-man-1', 'rockman (j)'],
        'title': 'Mega Man',
        'sub': 'Rank #100 All-Time • 1987',
        'system': 'ACTION',
        'rank': 100,
        'review_score': '★ 9.5/10 All-Time',
        'review_quote': 'Where the Blue Bomber was born! Defeat Cut Man, Guts Man, and Elec Man.',
        'icon': '🤖',
        'color': '#38bdf8',
        'gradient': 'radial-gradient(circle at 75% 25%, #0284c7 0%, #06080e 70%)',
        'default_rom': 'roms/Mega Man (J) [!].nes',
        'desc': 'Where the legend began! Take down Dr. Wily’s original 6 Robot Masters (Cut Man, Guts Man, Ice Man, Bomb Man, Fire Man, Elec Man) to save Monsteropolis.',
        'top20': True,
        'top50': True,
        'top100': True,
        'hall_of_fame': True
    }
]
TOP_50_HALL_OF_FAME = TOP_100_HALL_OF_FAME

TOP_GAMEBOY_CLASSICS = [
    {
        "id": "pokemon-red",
        "match_keys": ["pokemon - red", "pokemon red", "pokered"],
        "title": "Pokémon Red Version",
        "sub": "Game Boy Handheld RPG Origin",
        "system": "RPG",
        "console": "gb",
        "gb": True,
        "review_score": "★ 10/10 IGN",
        "review_quote": "The revolutionary monster-catching RPG that started the global phenomenon.",
        "icon": "🔥",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "desc": "Embark on an epic journey across Kanto to collect all 151 original Pokémon, defeat the eight Gym Leaders, and become Pokémon Champion."
    },
    {
        "id": "pokemon-blue",
        "match_keys": ["pokemon - blue", "pokemon blue", "pokeblue"],
        "title": "Pokémon Blue Version",
        "sub": "Game Boy Handheld RPG Origin",
        "system": "RPG",
        "console": "gb",
        "gb": True,
        "review_score": "★ 10/10 IGN",
        "review_quote": "The definitive sister release alongside Red, featuring iconic version exclusives like Blastoise.",
        "icon": "💧",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1e3a8a 0%, #06080e 70%)",
        "desc": "Battle and trade your way through Kanto with classic Blue version exclusives and the mighty Water-type Blastoise."
    },
    {
        "id": "pokemon-yellow",
        "match_keys": ["pokemon - yellow", "pokemon yellow", "pokeyellow"],
        "title": "Pokémon Yellow: Special Pikachu Edition",
        "sub": "Game Boy Color Enhanced Anime Edition",
        "system": "RPG",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 10/10 GameSpot",
        "review_quote": "Pikachu walks behind you! The beloved anime-inspired expansion featuring Jesse and James.",
        "icon": "⚡",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)",
        "desc": "Travel with your loyal Pikachu following behind your footsteps, acquire all three starter Pokémon, and thwart Team Rocket."
    },
    {
        "id": "pokemon-gold",
        "match_keys": ["pokemon - gold", "pokemon gold", "pokegold"],
        "title": "Pokémon Gold Version",
        "sub": "Game Boy Color Johto Generation II",
        "system": "RPG",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 10/10 IGN",
        "review_quote": "100 brand new Pokémon, real-time day/night clock, and two full regions in one masterpiece.",
        "icon": "✨",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "desc": "Journey through the ancient Johto region, uncover legendary bird Ho-Oh, and return to Kanto for 16 total Gym Badges."
    },
    {
        "id": "pokemon-silver",
        "match_keys": ["pokemon - silver", "pokemon silver", "pokesilver"],
        "title": "Pokémon Silver Version",
        "sub": "Game Boy Color Johto Generation II",
        "system": "RPG",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 10/10 IGN",
        "review_quote": "Legendary Lugia and Johto excellence with steel and dark types introduced.",
        "icon": "🪙",
        "color": "#94a3b8",
        "gradient": "radial-gradient(circle at 75% 25%, #334155 0%, #06080e 70%)",
        "desc": "Awaken the guardian of the seas Lugia, breed new Pokémon species, and take on the ultimate challenge atop Mt. Silver."
    },
    {
        "id": "pokemon-crystal",
        "match_keys": ["pokemon - crystal", "pokemon crystal", "pokecrystal"],
        "title": "Pokémon Crystal Version",
        "sub": "The Pinnacle of Game Boy Color RPGs",
        "system": "RPG",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 9.8/10 IGN",
        "review_quote": "The first Pokémon title with animated battle sprites and the Battle Tower.",
        "icon": "💎",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)",
        "desc": "Uncover the mysteries of Suicune and the Unown with dynamic battle animations and female trainer option."
    },
    {
        "id": "zelda-links-awakening-dx",
        "match_keys": ["zelda dx", "links awakening"],
        "title": "The Legend of Zelda: Link's Awakening DX",
        "sub": "Game Boy Color Masterpiece",
        "system": "ADVENTURE",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 10/10 IGN",
        "review_quote": "Widely ranked among the greatest Zelda adventures ever made, now in glorious full color.",
        "icon": "🗝️",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #064e3b 0%, #06080e 70%)",
        "desc": "Stranded on mysterious Koholint Island, Link must gather the eight Instruments of the Sirens to awaken the Wind Fish."
    },
    {
        "id": "zelda-oracle-ages",
        "match_keys": ["oracle of ages"],
        "title": "The Legend of Zelda: Oracle of Ages",
        "sub": "Capcom & Nintendo GBC Collaboration",
        "system": "ADVENTURE",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 9.8/10 IGN",
        "review_quote": "Complex time-travel puzzles and masterfully designed dungeons in Labrynna.",
        "icon": "⏳",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1e3a8a 0%, #06080e 70%)",
        "desc": "Use the Harp of Ages to travel between past and present to restore time and rescue Nayru from the sorceress Veran."
    },
    {
        "id": "zelda-oracle-seasons",
        "match_keys": ["oracle of seasons"],
        "title": "The Legend of Zelda: Oracle of Seasons",
        "sub": "Capcom & Nintendo GBC Collaboration",
        "system": "ADVENTURE",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 9.8/10 IGN",
        "review_quote": "Action-packed combat with the magical Rod of Seasons shifting nature at will.",
        "icon": "🍂",
        "color": "#f97316",
        "gradient": "radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)",
        "desc": "Swing the Rod of Seasons to freeze lakes in winter or blossom trees in spring, rescuing Din from General Onox."
    },
    {
        "id": "super-mario-land",
        "match_keys": ["super mario land (", "super mario land."],
        "title": "Super Mario Land",
        "sub": "The Original 1989 Game Boy Launch Sensation",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.5/10 Nintendo Power",
        "review_quote": "Gunpei Yokoi's quirky launch marvel featuring the submarine and airplane stages.",
        "icon": "🍄",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "desc": "Guide Mario across Sarasaland to rescue Princess Daisy from the alien invaders Tatanga with superballs and Sky Pop flights."
    },
    {
        "id": "super-mario-land-2",
        "match_keys": ["super mario land 2", "6 golden coins"],
        "title": "Super Mario Land 2: 6 Golden Coins",
        "sub": "First Appearance of Wario",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.6/10 IGN",
        "review_quote": "Giant sprites, overworld map, space zones, and Bunny Ears gliding make this an all-time classic.",
        "icon": "🪙",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "desc": "Explore six themed zones across Mario Land to reclaim Mario Castle from his devious rival Wario."
    },
    {
        "id": "wario-land",
        "match_keys": ["wario land - super mario land 3", "wario land 1"],
        "title": "Wario Land: Super Mario Land 3",
        "sub": "Greedy Platforming Perfection",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.4/10 IGN",
        "review_quote": "Bull, Jet, and Dragon pots give Wario unstoppable smashing power on Kitchen Island.",
        "icon": "👑",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)",
        "desc": "Body slam Captain Syrup's Brown Sugar Pirates and loot gold to buy Wario the grandest castle possible."
    },
    {
        "id": "wario-land-2",
        "match_keys": ["wario land ii", "wario land 2"],
        "title": "Wario Land II",
        "sub": "Immortality & Branching Puzzles",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.4/10 IGN",
        "review_quote": "Wario cannot die! Instead, wacky enemy attacks trigger hilarious puzzle transformations.",
        "icon": "🧄",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Flat Wario, Zombie Wario, and Puffy Wario return to chase down Captain Syrup after she floods his castle."
    },
    {
        "id": "super-mario-bros-deluxe",
        "match_keys": ["super mario bros. deluxe", "mario deluxe"],
        "title": "Super Mario Bros. Deluxe",
        "sub": "The Ultimate Portable Mario Experience",
        "system": "PLATFORMER",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 9.7/10 IGN",
        "review_quote": "Contains both the complete SMB1 and Japanese Lost Levels with map navigation.",
        "icon": "⭐",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #064e3b 0%, #06080e 70%)",
        "desc": "Enjoy classic Super Mario Bros. plus Challenge Mode with Red Coins, Yoshi eggs, and unlockable Lost Levels."
    },
    {
        "id": "tetris-gb",
        "match_keys": ["tetris (world)"],
        "title": "Tetris (Game Boy Edition)",
        "sub": "The Most Iconic Handheld Game in History",
        "system": "PUZZLE",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.9/10 Masterpiece",
        "review_quote": "Korobeiniki (Type A Theme) and the green screen that sold 35 million cartridges worldwide.",
        "icon": "🧩",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #0e7490 0%, #06080e 70%)",
        "desc": "Clear lines, chase high scores, and enjoy the most timeless falling-block puzzle experience ever crafted."
    },
    {
        "id": "kirby-dream-land",
        "match_keys": ["kirby's dream land ("],
        "title": "Kirby's Dream Land",
        "sub": "The Debut of the Pink Puffball",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.2/10 IGN",
        "review_quote": "Masahiro Sakurai's masterclass in accessible platforming and floating mechanics.",
        "icon": "🎈",
        "color": "#ec4899",
        "gradient": "radial-gradient(circle at 75% 25%, #831843 0%, #06080e 70%)",
        "desc": "Inhale enemies and fly through Dream Land to reclaim the Sparkling Stars from greedy King Dedede."
    },
    {
        "id": "kirby-dream-land-2",
        "match_keys": ["kirby's dream land 2"],
        "title": "Kirby's Dream Land 2",
        "sub": "Animal Friends & Copy Abilities",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.3/10 Nintendo Power",
        "review_quote": "Rick the Hamster, Kine the Ocean Fish, and Coo the Owl multiply copy abilities threefold.",
        "icon": "🐹",
        "color": "#f43f5e",
        "gradient": "radial-gradient(circle at 75% 25%, #881337 0%, #06080e 70%)",
        "desc": "Ride with lovable animal friends across Rainbow Islands to defeat Dark Matter."
    },
    {
        "id": "metroid-2",
        "match_keys": ["metroid ii - return of samus"],
        "title": "Metroid II: Return of Samus",
        "sub": "Extermination on Planet SR388",
        "system": "ADVENTURE",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.2/10 IGN",
        "review_quote": "Atmospheric, claustrophobic sci-fi hunting 39 Metroid evolutions in deep caverns.",
        "icon": "☄️",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Descend through descending acid pools on SR388 to eradicate the Metroid species before the Space Pirates do."
    },
    {
        "id": "donkey-kong-94",
        "match_keys": ["donkey kong (world)"],
        "title": "Donkey Kong ('94)",
        "sub": "Puzzle-Platforming Masterpiece",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.5/10 IGN",
        "review_quote": "Begins with the original 4 arcade stages then expands into 97 mind-bending puzzle levels.",
        "icon": "🦍",
        "color": "#ea580c",
        "gradient": "radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)",
        "desc": "Handstands, backflips, spinning keys, and bridge-building through 101 stages to rescue Pauline from Donkey Kong."
    },
    {
        "id": "mega-man-gb",
        "match_keys": ["mega man - dr. wily's revenge"],
        "title": "Mega Man: Dr. Wily's Revenge",
        "sub": "The Blue Bomber's Handheld Debut",
        "system": "ACTION",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.1/10 GameSpot",
        "review_quote": "Combines Robot Masters from Mega Man 1 & 2 with the lethal debut of Enker and the Mirror Buster.",
        "icon": "🤖",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)",
        "desc": "Blast through Cut Man, Ice Man, Flash Man, and Quick Man before storming Wily's Space Station."
    },
    {
        "id": "castlevania-2-belmont",
        "match_keys": ["castlevania ii - belmont's revenge"],
        "title": "Castlevania II: Belmont's Revenge",
        "sub": "Superb Handheld Gothic Action",
        "system": "ACTION",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.2/10 IGN",
        "review_quote": "Incredible chiptune soundtrack and tight sub-weapon combat make this the premier GB Castlevania.",
        "icon": "🦇",
        "color": "#dc2626",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "desc": "Guide Christopher Belmont through 4 castle towers wielding holy water and throwing axes to save his son Soleil."
    },
    {
        "id": "dragon-warrior-monsters",
        "match_keys": ["dragon warrior monsters (", "dragon warrior monsters 2"],
        "title": "Dragon Warrior Monsters",
        "sub": "Legendary Akira Toriyama Monster Battler",
        "system": "RPG",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 9.2/10 GameSpot",
        "review_quote": "Deep breeding system with over 200 Toriyama-designed monsters in GreatTree Kingdom.",
        "icon": "🐉",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Befriend slimes and dragons, enter traveler gates, and breed monster lineages to win the Starry Night Tournament."
    },
    {
        "id": "mario-tennis-gbc",
        "match_keys": ["mario tennis"],
        "title": "Mario Tennis (GBC)",
        "sub": "Camelot RPG Sports Classic",
        "system": "ARCADE",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 9.3/10 IGN",
        "review_quote": "Full RPG story mode at the Royal Tennis Academy with leveling stats and Mario showdowns.",
        "icon": "🎾",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #064e3b 0%, #06080e 70%)",
        "desc": "Train your custom rookie, climb the singles and doubles varsity ranks, and challenge Mario on center court."
    },
    {
        "id": "dr-mario-gb",
        "match_keys": ["dr. mario (world)", "dr mario (world)", "dr. mario.gb", "dr-mario-gb"],
        "title": "Dr. Mario (Game Boy)",
        "sub": "Portable Virus Buster Puzzle",
        "system": "PUZZLE",
        "console": "gb",
        "gb": True,
        "review_score": "★ 9.3/10 GameSpot",
        "review_quote": "The portable edition of the beloved falling-capsule virus matching puzzle.",
        "icon": "💊",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "desc": "Rotate vitamin pills and eradicate color-coded viruses with infectious chiptune melodies on the go."
    },
    {
        "id": "dragon-warrior-iii-gbc",
        "match_keys": ["dragon warrior iii", "dragon warrior 3", "dragon quest iii"],
        "title": "Dragon Warrior III (GBC)",
        "sub": "Masterpiece Handheld JRPG Remake",
        "system": "RPG",
        "console": "gbc",
        "gb": True,
        "review_score": "★ 9.6/10 IGN",
        "review_quote": "Widely regarded as one of the greatest JRPGs ever created, exquisitely enhanced for Color.",
        "icon": "⚔️",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Recruit party members from Patty's Planning Room, discover monster medals, and conquer the Archfiend Baramos."
    }
]

TOP_20_HALL_OF_FAME = TOP_100_HALL_OF_FAME
TOP_20_HALL_OF_FAME = TOP_50_HALL_OF_FAME

# Smart metadata dictionary for known / popular games
KNOWN_GAMES = {
    '1200-in-1': {
        'title': '1200-in-1 Multicart',
        'sub': 'Massive Retro Arcade Compilation',
        'system': 'ARCADE',
        'icon': '🕹️',
        'color': '#00f0ff',
        'gradient': 'radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)',
        'desc': 'Massive retro arcade compilation cartridge featuring hundreds of classic arcade hits, sports, puzzles, and shooting challenges.'
    },
    'super-tilt-bro': {
        'title': 'Super Tilt Bro',
        'sub': 'Smash Bros Platform Fighter',
        'system': 'FIGHTING',
        'icon': '🥊',
        'color': '#e63946',
        'gradient': 'radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)',
        'desc': 'The acclaimed 2D platform brawler! Choose your fighter, unleash directional specials, recover with airdashes, and knock opponents out.'
    },
    'sgthelmet': {
        'title': 'Sgt. Helmet: Commando',
        'sub': 'Contra Style Military Action',
        'system': 'ACTION',
        'icon': '🎖️',
        'color': '#2b9348',
        'gradient': 'radial-gradient(circle at 75% 25%, #134622 0%, #06080e 70%)',
        'desc': 'Action-packed military infiltration run-and-gun! Take down enemy squads, dodge minefields, and rescue hostages.'
    },
    'novathesquirrel': {
        'title': 'Nova the Squirrel',
        'sub': 'Super Mario World Style Platformer',
        'system': 'PLATFORMER',
        'icon': '🐿️',
        'color': '#fb8500',
        'gradient': 'radial-gradient(circle at 75% 25%, #663603 0%, #06080e 70%)',
        'desc': 'Vibrant action platformer inspired by 16-bit classics! Copy enemy abilities, discover secret exits, and explore massive worlds.'
    },
    'flappybird': {
        'title': 'Flappy Bird Retro',
        'sub': 'Viral Arcade Reflex Challenge',
        'system': 'ARCADE',
        'icon': '🐤',
        'color': '#52b788',
        'gradient': 'radial-gradient(circle at 75% 25%, #184731 0%, #06080e 70%)',
        'desc': 'The world-famous viral arcade sensation ported natively to console hardware! Tap with precision rhythm to thread through green pipes.'
    },
    'twindragons': {
        'title': 'Twin Dragons',
        'sub': 'High-Production Action Quest',
        'system': 'PLATFORMER',
        'icon': '🐉',
        'color': '#3a0ca3',
        'gradient': 'radial-gradient(circle at 75% 25%, #25096a 0%, #06080e 70%)',
        'desc': 'Critically acclaimed platform adventure featuring Dinky and Minky on an epic mission to rescue stolen dragon eggs.'
    },
    'themadwizard': {
        'title': 'The Mad Wizard',
        'sub': 'Metroidvania Exploration Quest',
        'system': 'ADVENTURE',
        'icon': '🧙',
        'color': '#6a0dad',
        'gradient': 'radial-gradient(circle at 75% 25%, #42086e 0%, #06080e 70%)',
        'desc': 'Enthralling fantasy Metroidvania! Cast elemental spells, levitate across chasms, unlock ancient artifacts, and reclaim your wizard territory.'
    },
    'superpakpak': {
        'title': 'Super PakPak',
        'sub': 'Pac-Man Dot Munching Arcade',
        'system': 'ARCADE',
        'icon': '🟡',
        'color': '#ffd166',
        'gradient': 'radial-gradient(circle at 75% 25%, #594719 0%, #06080e 70%)',
        'desc': 'Classic maze navigation and dot-eating retro arcade action! Dodge prowling ghosts, snatch power pellets, and clear maze after maze.'
    },
    'invaders': {
        'title': 'Invaders',
        'sub': 'Space Invaders Galactic Defense',
        'system': 'SHOOTER',
        'icon': '👾',
        'color': '#118ab2',
        'gradient': 'radial-gradient(circle at 75% 25%, #0b4a5e 0%, #06080e 70%)',
        'desc': 'The iconic alien defense war! Shield behind destructible bunkers, time your laser shots, and intercept descending armadas.'
    },
    'driar': {
        'title': 'Driar',
        'sub': '38-Level Star Quest Platformer',
        'system': 'PUZZLE',
        'icon': '⭐',
        'color': '#00b4d8',
        'gradient': 'radial-gradient(circle at 75% 25%, #035263 0%, #06080e 70%)',
        'desc': 'Charming puzzle-platformer featuring screen-wrapping wrap-around mechanics and 38 handcrafted levels.'
    },
    'viruscleaner': {
        'title': 'Virus Cleaner',
        'sub': 'Dr. Mario Style Medical Puzzle',
        'system': 'PUZZLE',
        'icon': '💊',
        'color': '#ef476f',
        'gradient': 'radial-gradient(circle at 75% 25%, #631c2d 0%, #06080e 70%)',
        'desc': 'Falling-pill color-matching puzzle game! Line up matching medicine capsules to eradicate stubborn viruses.'
    },
    'superuwol': {
        'title': 'Super Uwol',
        'sub': 'Coin Snatching Castle Quest',
        'system': 'PLATFORMER',
        'icon': '💰',
        'color': '#f39c12',
        'gradient': 'radial-gradient(circle at 75% 25%, #694407 0%, #06080e 70%)',
        'desc': 'Fast-paced arcade coin hunting through mysterious haunted mansion vaults! Collect all gold coins before ghouls catch you.'
    },
    'blaster': {
        'title': 'Blaster',
        'sub': 'Sci-Fi Rapid Fire Shoot Em Up',
        'system': 'SHOOTER',
        'icon': '⚡',
        'color': '#e74c3c',
        'gradient': 'radial-gradient(circle at 75% 25%, #591b15 0%, #06080e 70%)',
        'desc': 'High-octane science fiction shoot-em-up! Dodge incoming bullet curtains and decimate alien battleships.'
    },
    'theinvasion': {
        'title': 'The Invasion',
        'sub': 'Deep Space Alien Fleet Defense',
        'system': 'SHOOTER',
        'icon': '🛸',
        'color': '#8338ec',
        'gradient': 'radial-gradient(circle at 75% 25%, #461b85 0%, #06080e 70%)',
        'desc': 'Defend your deep space forward outpost against 14 escalating waves of high-speed extraterrestrial invaders.'
    },
    'croom': {
        'title': 'C-Room',
        'sub': 'Dungeon Maze & Escape',
        'system': 'ADVENTURE',
        'icon': '🗝️',
        'color': '#06d6a0',
        'gradient': 'radial-gradient(circle at 75% 25%, #05543f 0%, #06080e 70%)',
        'desc': 'Navigate subterranean labyrinth rooms, discover cryptic keys, disarm hidden floor triggers, and escape.'
    },
    'debrisdodger': {
        'title': 'Debris Dodger',
        'sub': 'High-Speed Reflex Evasion',
        'system': 'ARCADE',
        'icon': '🚀',
        'color': '#ff0054',
        'gradient': 'radial-gradient(circle at 75% 25%, #660324 0%, #06080e 70%)',
        'desc': 'Intense arcade reflex game! Steer through an overwhelming asteroid storm moving at hypersonic velocity.'
    },
    'sir-ababol': {
        'title': 'Sir Ababol Remastered',
        'sub': 'Medieval Fantasy Platformer',
        'system': 'PLATFORMER',
        'icon': '🏰',
        'color': '#fbbf24',
        'gradient': 'radial-gradient(circle at 75% 25%, #664d03 0%, #06080e 70%)',
        'desc': 'Acclaimed medieval fantasy platformer by The Mojon Twins! Guide Sir Ababol across the treacherous lands of Monegros.'
    },
    'cheril-the-goddess': {
        'title': 'Cheril the Goddess',
        'sub': 'Fantasy Action Adventure',
        'system': 'ADVENTURE',
        'icon': '🧚',
        'color': '#a855f7',
        'gradient': 'radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)',
        'desc': 'Vibrant fantasy action-adventure platformer! Guide Cheril through mystical forests, defeat bosses, and restore peace.'
    },
    'owlia': {
        'title': 'The Legends of Owlia',
        'sub': 'Zelda Style Action Adventure',
        'system': 'ADVENTURE',
        'icon': '⚔️',
        'color': '#10b981',
        'gradient': 'radial-gradient(circle at 75% 25%, #054f38 0%, #06080e 70%)',
        'desc': 'Epic 8-bit Zelda-style action-adventure RPG! Explore dungeons and solve puzzles with the aid of your companion great owl, Silo.'
    },
    'nomolos': {
        'title': 'Nomolos: Storming the CASTLE',
        'sub': 'Action Castle Siege Platformer',
        'system': 'ACTION',
        'icon': '🏰',
        'color': '#ff5376',
        'gradient': 'radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)',
        'desc': 'Classic knight-action platformer with intense sword combat, armored foes, and epic castle sieges.'
    },
    'jetpaco': {
        'title': 'Jet-Paco',
        'sub': 'Jetpack Flight & Exploration',
        'system': 'ARCADE',
        'icon': '🚀',
        'color': '#00f0ff',
        'gradient': 'radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)',
        'desc': 'High-flying planetary exploration arcade game! Master jetpack physics, refuel energy pods, and rescue lost astronaut squads.'
    },
    'roboninjaclimb': {
        'title': 'Robo-Ninja Climb',
        'sub': 'Cybernetic Ninja Wall Runner',
        'system': 'ACTION',
        'icon': '🥷',
        'color': '#00f0ff',
        'gradient': 'radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)',
        'desc': 'High-speed cybernetic ninja vertical reflex climbing runner! Wall-jump past laser grids and shurikens.'
    },
    'babelblox': {
        'title': 'Babel-Blox',
        'sub': 'Falling-Block Architecture Puzzle',
        'system': 'PUZZLE',
        'icon': '🧩',
        'color': '#fbbf24',
        'gradient': 'radial-gradient(circle at 75% 25%, #664d03 0%, #06080e 70%)',
        'desc': 'Addictive puzzle challenge! Stack falling architectural blocks to build ancient Babylonian towers without toppling over.'
    },
    'starevil': {
        'title': 'Star Evil',
        'sub': 'Rapid-Fire Bullet Hell Shmup',
        'system': 'SHOOTER',
        'icon': '⚡',
        'color': '#e74c3c',
        'gradient': 'radial-gradient(circle at 75% 25%, #591b15 0%, #06080e 70%)',
        'desc': 'High-octane deep space vertical shooter! Dodge thick bullet curtains and obliterate alien armada flagships.'
    },
    'thwaite': {
        'title': 'Thwaite',
        'sub': 'Missile Defense Tactical Strategy',
        'system': 'SHOOTER',
        'icon': '🛡️',
        'color': '#00f0ff',
        'gradient': 'radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)',
        'desc': 'Tactical missile defense strategy! Intercept falling rocket artillery to protect the village of Thwaite.'
    },
    'assimilate': {
        'title': 'Assimilate',
        'sub': 'Sci-Fi Extraterrestrial Defense',
        'system': 'SHOOTER',
        'icon': '👾',
        'color': '#8b5cf6',
        'gradient': 'radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)',
        'desc': 'Frantic sci-fi arcade defense! Stop the alien parasites from assimilating the base defense grid.'
    },
    'starter_kit': {
        'title': 'Starter Quest',
        'sub': 'Classic 2D Action Platformer',
        'system': 'PLATFORMER',
        'icon': '🏰',
        'color': '#4361ee',
        'gradient': 'radial-gradient(circle at 75% 25%, #182875 0%, #06080e 70%)',
        'desc': 'Pure retro platforming challenge with precision jumping, moving platforms, and treacherous spike pits.'
    },
    'pong1k': {
        'title': 'Pong 1K',
        'sub': 'The Grandfather of Video Games',
        'system': 'ARCADE',
        'icon': '🏓',
        'color': '#e2eafc',
        'gradient': 'radial-gradient(circle at 75% 25%, #1b253b 0%, #06080e 70%)',
        'desc': 'The original 1972 table tennis arcade simulation that launched the entire interactive entertainment industry.'
    }
}

# Auto-guessing rules for any new game
GENRE_RULES = [
    (r'(mario|sonic|platform|jump|donkey|kong|adventure|quest|kirby|yoshi)', 'PLATFORMER', '🏰', '#fbbf24', '#664d03'),
    (r'(contra|ninja|turtles|tmnt|fighter|combat|action|commando|megaman|punch|beat)', 'ACTION', '🎖️', '#ff5376', '#6a0e1c'),
    (r'(brawler|street|smash|tilt|boxing|mortal|kombat|tekken)', 'FIGHTING', '🥊', '#e63946', '#6a0e1c'),
    (r'(invaders|space|shmup|bullet|shooter|blaster|alien|galaxy|star|laser)', 'SHOOTER', '⚡', '#00f0ff', '#004d54'),
    (r'(pacman|pong|brick|breakout|arcade|pinball|frogger|flappy|1200|multi)', 'ARCADE', '🟡', '#ffd166', '#594719'),
    (r'(tetris|dr|virus|puzzle|doctor|match|cleaner|driar|bubble)', 'PUZZLE', '🧩', '#ef476f', '#631c2d'),
    (r'(zelda|metroid|castlevania|rpg|dungeon|maze|wizard|room)', 'ADVENTURE', '🗝️', '#06d6a0', '#05543f'),
]

def clean_game_name(filename):
    """Strip extensions, region tags (USA), (Rev 1), [p1], and clean up spacing."""
    name = os.path.splitext(filename)[0]
    name = re.sub(r'\s*\([^)]*\)', '', name)
    name = re.sub(r'\s*\[[^\]]*\]', '', name)
    name = name.replace('_', ' ').replace('-', ' ').strip()
    words = [w.capitalize() for w in name.split()]
    return ' '.join(words)

def generate_game_id(filename):
    clean = clean_game_name(filename).lower()
    return re.sub(r'[^a-z0-9]+', '-', clean).strip('-')

def detect_metadata(filename):
    """Return complete game metadata dictionary for any file in roms/."""
    game_id = generate_game_id(filename)
    lower_file = filename.lower()
    is_gb = lower_file.endswith(('.gb', '.gbc'))
    console_tag = 'gbc' if lower_file.endswith('.gbc') else ('gb' if lower_file.endswith('.gb') else 'nes')

    # If it is a Game Boy / Color game, check TOP_GAMEBOY_CLASSICS first
    if is_gb:
        best_gb = None
        best_gb_len = 0
        for item in TOP_GAMEBOY_CLASSICS:
            for k in item['match_keys']:
                if (k in lower_file or k in game_id) and len(k) > best_gb_len:
                    best_gb = item
                    best_gb_len = len(k)
        if best_gb:
            res = dict(best_gb)
            res['rom'] = f'roms/{filename}'
            res['console'] = console_tag
            res['gb'] = True
            return res

    # Check Top 100 Hall of Fame dictionary (for NES)
    best_item = None
    best_len = 0
    for item in TOP_100_HALL_OF_FAME:
        for k in item['match_keys']:
            if (k == game_id or k in lower_file or k in game_id) and len(k) > best_len:
                best_item = item
                best_len = len(k)

    if best_item:
        res = dict(best_item)
        res['id'] = best_item['id']
        res['rom'] = f'roms/{filename}'
        res['console'] = 'nes'
        res['nes'] = True
        return res

    # Check known dictionary second
    for k, meta in KNOWN_GAMES.items():
        if k in game_id or game_id in k:
            res = dict(meta)
            res['id'] = game_id
            res['rom'] = f'roms/{filename}'
            return res

    # Otherwise auto-guess genre, icon, and colors
    title = clean_game_name(filename)
    lower = filename.lower()
    
    system = 'ARCADE'
    icon = '🕹️'
    color = '#00f0ff'
    glow_color = '#035b66'

    for pattern, g_sys, g_icon, g_col, g_glow in GENRE_RULES:
        if re.search(pattern, lower):
            system = g_sys
            icon = g_icon
            color = g_col
            glow_color = g_glow
            break

    res = {
        'id': game_id,
        'title': title,
        'sub': f'{system.capitalize()} Retro Classic',
        'system': system,
        'rom': f'roms/{filename}',
        'icon': icon,
        'color': color,
        'gradient': f'radial-gradient(circle at 75% 25%, {glow_color} 0%, #06080e 70%)',
        'desc': f'Authentic retro {system.lower()} cartridge: {title}. Playable instantly in 60 FPS.',
        'console': console_tag
    }
    if is_gb:
        res['gb'] = True
    else:
        res['nes'] = True
    return res

def scan_roms():
    """Scan roms/ directory, generate games list, and save to games.json."""
    if not os.path.exists(ROMS_DIR):
        os.makedirs(ROMS_DIR, exist_ok=True)

    supported_exts = ('.nes', '.smc', '.sfc', '.gb', '.gbc', '.bin')
    files = sorted([f for f in os.listdir(ROMS_DIR) if f.lower().endswith(supported_exts)])

    matched_top100_ids = set()
    raw_list = []

    for f in files:
        meta = detect_metadata(f)
        if meta.get('top100') or meta.get('top50') or meta.get('top20'):
            matched_top100_ids.add(meta['id'])
        raw_list.append(meta)

    # For any of the Top 20 games not physically matched by a file in roms/ yet,
    # insert it so the Top 20 Hall of Fame is 100% complete
    multicart_fallback = 'roms/1200-in-1 (J) [p1].nes' if os.path.exists(os.path.join(ROMS_DIR, '1200-in-1 (J) [p1].nes')) else None

    for top_game in TOP_100_HALL_OF_FAME:
        if top_game['id'] not in matched_top100_ids:
            entry = dict(top_game)
            default_path = os.path.join(BASE_DIR, top_game['default_rom'])
            if os.path.exists(default_path):
                entry['rom'] = top_game['default_rom']
            elif multicart_fallback and top_game['id'] in ('tetris', 'super-mario-bros'):
                entry['rom'] = multicart_fallback
            else:
                entry['rom'] = top_game['default_rom']
            raw_list.append(entry)

    # Ensure all games have official cover path assigned and multiplayer tag
    multiplayer_keywords = (
        'contra', 'super-c', 'double-dragon', 'tmnt-2', 'tmnt-ii', 'teenage-mutant-ninja-turtles-ii',
        'bubble-bobble', 'chip-n-dale', 'life-force', 'river-city', 'battletoads', 'dr-mario',
        'mario-bros', 'super-mario-bros', 'balloon-fight', 'ice-climber', 'jackal', 'bomberman',
        'super-tilt-bro', 'gauntlet', 'twinbee', 'baseball', 'tennis', 'soccer', 'ikari',
        'archon', 'joust', 'spy-vs-spy', 'blades-of-steel', 'tecmo', 'r-c-pro-am', 'micro-machines'
    )
    for g in raw_list:
        g['cover'] = f"covers/{g['id']}.png"
        gid = g.get('id', '').lower()
        is_gb_game = g.get('gb') or g.get('console') in ('gb', 'gbc')
        if not is_gb_game and any(kw in gid for kw in multiplayer_keywords):
            g['multiplayer'] = True

    # Sort: Top 20 games (ranks 1 to 20) first, then priority games, then others alphabetically
    def sort_key(g):
        if (g.get('top100') or g.get('top50') or g.get('top20')) and g.get('rank'):
            return (0, g['rank'])
        if g.get('gb') and g.get('review_score'):
            return (1, g['title'].lower())
        priority_order = ['1200-in-1', 'super-tilt-bro', 'twindragons', 'themadwizard']
        for idx, p in enumerate(priority_order):
            if p in g['id']:
                return (2, idx)
        return (3, g['title'].lower())

    games = sorted(raw_list, key=sort_key)

    try:
        with open(GAMES_JSON, 'w', encoding='utf-8') as fp:
            json.dump(games, fp, indent=2)
    except Exception as e:
        print(f"Error writing games.json: {e}", file=sys.stderr)

    return games


def get_cached_games(force_rescan=False):
    """Return cached game catalog, rescanning only if ROMS_DIR mtime changed or forced."""
    global CACHED_GAMES, _cached_roms_mtime
    try:
        mtime = os.stat(ROMS_DIR).st_mtime if os.path.exists(ROMS_DIR) else 0
    except Exception:
        mtime = 0
    with CATALOG_LOCK:
        if force_rescan or not CACHED_GAMES or mtime != _cached_roms_mtime:
            CACHED_GAMES = scan_roms()
            _cached_roms_mtime = mtime
        return CACHED_GAMES


# Background watcher thread & stale room reaper
_last_mtime = 0


def watcher_loop():
    global _last_mtime
    while True:
        try:
            if os.path.exists(ROMS_DIR):
                mtime = os.stat(ROMS_DIR).st_mtime
                if mtime != _last_mtime:
                    _last_mtime = mtime
                    games = get_cached_games(force_rescan=True)
                    print(f"[ROM Watcher] Updated games.json ({len(games)} games active)")
            prune_stale_rooms()
        except Exception:
            pass
        time.sleep(5)


# ========================================================
# WebSocket Room & Signaling Relay (Hardened OWASP Edition)
# ========================================================
WS_MAGIC = b"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
ROOMS = {}
ROOMS_LOCK = threading.Lock()
MAX_ROOMS = 150
MAX_GUESTS_PER_ROOM = 2
MAX_WS_CLIENTS = 200
MAX_WS_PAYLOAD = 256 * 1024  # 256 KB strict cap
ROOM_TTL_SECONDS = 14400     # 4 hours
ACTIVE_WS_LOCK = threading.Lock()
ACTIVE_WS_CLIENTS = 0


def prune_stale_rooms():
    now = time.time()
    expired_guests = []
    with ROOMS_LOCK:
        stale_codes = [
            c for c, r in ROOMS.items()
            if (now - r.get("created_at", now)) > ROOM_TTL_SECONDS
            or not r.get("host")
            or r["host"].closed
        ]
        for c in stale_codes:
            room = ROOMS.pop(c, None)
            if room:
                expired_guests.extend(room.get("guests", {}).values())
    for g in expired_guests:
        g.send_json({"type": "room_closed"})


def generate_room_code():
    for _ in range(100):
        code = "".join(secrets.choice(ROOM_ALPHABET) for _ in range(6))
        if code not in ROOMS:
            return code
    return secrets.token_hex(3).upper()


def is_safe_existing_rom(rom_path):
    """Verify rom_path strictly points to an existing cartridge inside ROMS_DIR."""
    if not isinstance(rom_path, str) or len(rom_path) > 220:
        return False
    if not VALID_ROM_PATH_RE.match(rom_path):
        return False
    candidate = os.path.realpath(os.path.join(BASE_DIR, rom_path))
    try:
        if os.path.commonpath([ROMS_DIR, candidate]) != ROMS_DIR:
            return False
    except ValueError:
        return False
    return os.path.isfile(candidate)


def sanitize_title(raw_title):
    cleaned = re.sub(r'[<>"\'`\\]', '', str(raw_title or 'Retro Game')).strip()
    return (cleaned or 'Retro Game')[:80]


class WSClient:
    def __init__(self, conn, client_ip="unknown"):
        self.conn = conn
        self.client_ip = client_ip
        self.lock = threading.Lock()
        self.id = secrets.token_hex(4)
        self.room_code = None
        self.role = None
        self.client_type = "guest"
        self.closed = False

    def send_frame(self, opcode, payload_bytes):
        if self.closed:
            return False
        length = len(payload_bytes)
        header = bytearray([0x80 | opcode])
        if length < 126:
            header.append(length)
        elif length < 65536:
            header.append(126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(127)
            header.extend(struct.pack("!Q", length))
        try:
            with self.lock:
                self.conn.sendall(bytes(header) + payload_bytes)
            return True
        except Exception:
            self.closed = True
            return False

    def send_json(self, obj):
        try:
            data = json.dumps(obj, separators=(",", ":")).encode("utf-8")
            return self.send_frame(0x1, data)
        except Exception:
            return False

    def send_pong(self, payload=b""):
        return self.send_frame(0xA, payload)

    def close(self):
        if not self.closed:
            self.send_frame(0x8, b"")
            self.closed = True

    def _recv_exact(self, n):
        chunks = []
        remaining = n
        while remaining > 0:
            try:
                chunk = self.conn.recv(remaining)
            except Exception:
                return None
            if not chunk:
                return None
            chunks.append(chunk)
            remaining -= len(chunk)
        return b"".join(chunks)

    def recv_message(self):
        """Read full WebSocket message (handling fragmentation & control frames)."""
        fragments = []
        total_bytes = 0
        msg_opcode = None
        while not self.closed:
            hdr = self._recv_exact(2)
            if not hdr:
                return None
            b1, b2 = hdr[0], hdr[1]
            fin = (b1 & 0x80) != 0
            opcode = b1 & 0x0F
            masked = (b2 & 0x80) != 0
            length = b2 & 0x7F

            # Enforce client->server masking per RFC 6455
            if not masked:
                log_security_event("WS_UNMASKED_FRAME", self.client_ip)
                self.close()
                return None

            if length == 126:
                ext = self._recv_exact(2)
                if not ext:
                    return None
                length = struct.unpack("!H", ext)[0]
            elif length == 127:
                ext = self._recv_exact(8)
                if not ext:
                    return None
                length = struct.unpack("!Q", ext)[0]

            if length > MAX_WS_PAYLOAD or (total_bytes + length) > MAX_WS_PAYLOAD:
                log_security_event("WS_PAYLOAD_TOO_LARGE", self.client_ip, f"len={length}")
                self.close()
                return None

            mask = self._recv_exact(4)
            if not mask:
                return None

            payload = self._recv_exact(length) if length > 0 else b""
            if payload is None:
                return None

            if length > 0:
                ba = bytearray(payload)
                m0, m1, m2, m3 = mask[0], mask[1], mask[2], mask[3]
                for i in range(length):
                    r = i & 3
                    ba[i] ^= m0 if r == 0 else (m1 if r == 1 else (m2 if r == 2 else m3))
                payload = bytes(ba)

            if opcode == 0x8:  # Close
                self.close()
                return None
            if opcode == 0x9:  # Ping
                self.send_pong(payload[:125])
                continue
            if opcode == 0xA:  # Pong
                continue

            if opcode != 0x0:
                if opcode != 0x1:
                    self.close()
                    return None
                msg_opcode = opcode
                fragments = [payload]
                total_bytes = length
            else:
                fragments.append(payload)
                total_bytes += length

            if fin:
                full_payload = b"".join(fragments)
                if msg_opcode == 0x1:
                    return full_payload.decode("utf-8", errors="replace")
                return None
        return None


def cleanup_ws_client(client):
    notify_host = None
    notify_guests = []
    guest_count = 0
    with ROOMS_LOCK:
        code = client.room_code
        if not code or code not in ROOMS:
            return
        room = ROOMS[code]
        if client.role == "host" and room.get("host") is client:
            notify_guests = list(room["guests"].values())
            del ROOMS[code]
        elif client.id in room["guests"]:
            del room["guests"][client.id]
            notify_host = room.get("host")
            guest_count = len(room["guests"])
        client.room_code = None

    if notify_host:
        notify_host.send_json({
            "type": "peer_left",
            "peerId": client.id,
            "guestCount": guest_count
        })
    for g in notify_guests:
        g.send_json({"type": "room_closed"})


def handle_ws_message(client, raw_text):
    try:
        msg = json.loads(raw_text)
    except Exception:
        return
    if not isinstance(msg, dict):
        return
    mtype = msg.get("type")

    if mtype == "ping":
        ts = msg.get("ts")
        if not isinstance(ts, (int, float)):
            ts = int(time.time() * 1000)
        if msg.get("relay"):
            with ROOMS_LOCK:
                room = ROOMS.get(client.room_code)
                if room:
                    if client.role == "host":
                        targets = list(room["guests"].values())
                    else:
                        targets = [room["host"]] if room.get("host") else []
                else:
                    targets = []
            for t in targets:
                t.send_json({"type": "ping", "relay": True, "ts": ts, "fromId": client.id})
        else:
            client.send_json({"type": "pong", "ts": ts})
        return

    if mtype == "pong" and msg.get("relay"):
        ts = msg.get("ts")
        with ROOMS_LOCK:
            room = ROOMS.get(client.room_code)
            target = None
            if room:
                if client.role == "host" and msg.get("targetId") in room["guests"]:
                    target = room["guests"][msg.get("targetId")]
                elif client.role == "guest":
                    target = room.get("host")
        if target:
            target.send_json({"type": "pong", "relay": True, "ts": ts, "fromId": client.id})
        return

    if mtype == "create_room":
        if not RATE_LIMITER.allow(f"ws_create:{client.client_ip}", 10, 60):
            log_security_event("RATE_LIMIT_CREATE_ROOM", client.client_ip)
            client.send_json({"type": "error", "message": "Rate limit exceeded. Try again shortly."})
            return
        rom = str(msg.get("rom", ""))
        if not is_safe_existing_rom(rom):
            log_security_event("INVALID_ROM_CREATE_ROOM", client.client_ip, rom)
            client.send_json({"type": "error", "message": "Invalid ROM reference"})
            return
        title = sanitize_title(msg.get("title", "Retro Game"))
        system = "GB" if str(msg.get("system", "")).upper() == "GB" else "NES"
        mode = "controller" if msg.get("mode") == "controller" else "stream"

        cleanup_ws_client(client)
        with ROOMS_LOCK:
            if len(ROOMS) >= MAX_ROOMS:
                client.send_json({"type": "error", "message": "Server room capacity reached"})
                return
            code = generate_room_code()
            ROOMS[code] = {
                "code": code,
                "host": client,
                "guests": {},
                "rom": rom,
                "title": title,
                "system": system,
                "mode": mode,
                "created_at": time.time()
            }
            client.room_code = code
            client.role = "host"
            client.client_type = "host"
        client.send_json({"type": "room_created", "code": code})
        return

    if mtype == "update_room" and client.role == "host":
        with ROOMS_LOCK:
            room = ROOMS.get(client.room_code)
            if room and room.get("host") is client:
                if "mode" in msg:
                    room["mode"] = "controller" if msg["mode"] == "controller" else "stream"
                if "title" in msg:
                    room["title"] = sanitize_title(msg["title"])
        return

    if mtype == "join_room":
        if not RATE_LIMITER.allow(f"ws_join:{client.client_ip}", 15, 60):
            log_security_event("RATE_LIMIT_JOIN_ROOM", client.client_ip)
            client.send_json({"type": "error", "message": "Too many join attempts. Wait a minute."})
            return
        cleanup_ws_client(client)
        code = str(msg.get("code", "")).upper().strip()
        if not re.match(r'^[A-Z0-9]{4,8}$', code):
            client.send_json({"type": "error", "message": "Invalid room code format"})
            return
        ctype = "controller" if msg.get("clientType") == "controller" else "guest"
        with ROOMS_LOCK:
            room = ROOMS.get(code)
            if not room or not room.get("host") or room["host"].closed:
                client.send_json({"type": "error", "message": f"Room '{code}' not found or expired"})
                return
            if len(room["guests"]) >= MAX_GUESTS_PER_ROOM:
                client.send_json({"type": "error", "message": "Room is full"})
                return
            room["guests"][client.id] = client
            client.room_code = code
            client.role = "guest"
            client.client_type = ctype
            host = room["host"]
            guest_count = len(room["guests"])
            room_info = {
                "type": "room_joined",
                "code": code,
                "peerId": client.id,
                "rom": room["rom"],
                "title": room["title"],
                "system": room["system"],
                "mode": room["mode"]
            }
        client.send_json(room_info)
        host.send_json({
            "type": "peer_joined",
            "peerId": client.id,
            "clientType": ctype,
            "guestCount": guest_count
        })
        return

    if mtype == "input":
        btn = msg.get("btn")
        if not isinstance(btn, int) or btn < 0 or btn > 9:
            return
        player = 1 if msg.get("player") == 1 else 2
        with ROOMS_LOCK:
            room = ROOMS.get(client.room_code)
            host = room.get("host") if room else None
        if host and host is not client:
            host.send_json({
                "type": "input",
                "fromId": client.id,
                "player": player,
                "btn": btn,
                "pressed": bool(msg.get("pressed"))
            })
        return

    if mtype == "video_frame" and client.role == "host":
        data_url = msg.get("dataUrl")
        if not isinstance(data_url, str) or len(data_url) > 190000 or not VALID_DATA_IMAGE_RE.match(data_url):
            return
        with ROOMS_LOCK:
            room = ROOMS.get(client.room_code)
            if not room or room.get("host") is not client:
                return
            guests = [g for g in room["guests"].values() if g.client_type != "controller"]
        payload = {"type": "video_frame", "dataUrl": data_url}
        for g in guests:
            g.send_json(payload)
        return

    if mtype in ("rtc_offer", "rtc_answer", "rtc_ice"):
        out = {"type": mtype, "fromId": client.id}
        if mtype in ("rtc_offer", "rtc_answer"):
            sdp = msg.get("sdp")
            if not isinstance(sdp, dict) or sdp.get("type") not in ("offer", "answer") or not isinstance(sdp.get("sdp"), str) or len(sdp["sdp"]) > 32768:
                return
            out["sdp"] = {"type": sdp["type"], "sdp": sdp["sdp"]}
        else:
            cand = msg.get("candidate")
            if not isinstance(cand, dict) or not isinstance(cand.get("candidate"), str) or len(cand["candidate"]) > 2048:
                return
            out["candidate"] = {
                "candidate": cand["candidate"],
                "sdpMid": cand.get("sdpMid"),
                "sdpMLineIndex": cand.get("sdpMLineIndex")
            }

        with ROOMS_LOCK:
            room = ROOMS.get(client.room_code)
            if not room:
                return
            if client.role == "host":
                target_id = msg.get("targetId")
                if target_id and target_id in room["guests"]:
                    targets = [room["guests"][target_id]]
                else:
                    targets = [g for g in room["guests"].values() if g.client_type != "controller"]
            else:
                targets = [room["host"]] if room.get("host") else []
        for t in targets:
            t.send_json(out)


class NexusServerHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "NexusArcade"
    sys_version = ""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def setup(self):
        super().setup()
        try:
            self.connection.settimeout(15.0)
        except Exception:
            pass

    def _get_client_ip(self):
        cf_ip = self.headers.get("CF-Connecting-IP")
        if cf_ip and self.client_address[0] in ("127.0.0.1", "::1"):
            return cf_ip.strip()
        return self.client_address[0]

    def _is_direct_localhost(self):
        if self.client_address[0] not in ("127.0.0.1", "::1"):
            return False
        if self.headers.get("CF-Connecting-IP") or self.headers.get("X-Forwarded-For"):
            return False
        return True

    def end_headers(self):
        # Apply strict OWASP Security Headers on every HTTP response
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "geolocation=(), microphone=(), camera=(), usb=()")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        self.send_header("Content-Security-Policy", CSP_HEADER)
        super().end_headers()

    def list_directory(self, path):
        log_security_event("DIR_LISTING_BLOCKED", self._get_client_ip(), self.path)
        self.send_error(403, "Directory listing disabled")
        return None

    def _send_json(self, status_code, obj, cache_control="no-cache, no-store, must-revalidate"):
        data = json.dumps(obj).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", cache_control)
        self.end_headers()
        self.wfile.write(data)

    def _is_valid_ws_origin(self):
        host_hdr = (self.headers.get("Host") or "").split(":")[0].lower().strip()
        origin_hdr = self.headers.get("Origin")
        if not origin_hdr:
            # Allow non-browser / CLI diagnostic clients without Origin only on localhost
            return self._is_direct_localhost()
        try:
            parsed_origin = urllib.parse.urlparse(origin_hdr)
            origin_host = (parsed_origin.hostname or "").lower().strip()
            return bool(origin_host and host_hdr and origin_host == host_hdr)
        except Exception:
            return False

    def _handle_websocket_upgrade(self):
        global ACTIVE_WS_CLIENTS
        client_ip = self._get_client_ip()

        if not self._is_valid_ws_origin():
            log_security_event("CSWSH_ORIGIN_REJECTED", client_ip, f"origin={self.headers.get('Origin')} host={self.headers.get('Host')}")
            self.send_error(403, "Invalid WebSocket Origin")
            return

        if not RATE_LIMITER.allow(f"ws_conn:{client_ip}", 20, 60):
            log_security_event("RATE_LIMIT_WS_CONNECT", client_ip)
            self.send_error(429, "Too Many Requests")
            return

        with ACTIVE_WS_LOCK:
            if ACTIVE_WS_CLIENTS >= MAX_WS_CLIENTS:
                log_security_event("WS_MAX_CLIENTS", client_ip)
                self.send_error(503, "Server busy")
                return
            ACTIVE_WS_CLIENTS += 1

        try:
            key = self.headers.get("Sec-WebSocket-Key")
            if not key or len(key) > 64:
                self.send_error(400, "Missing Sec-WebSocket-Key")
                return
            accept = base64.b64encode(
                hashlib.sha1(key.strip().encode("utf-8") + WS_MAGIC).digest()
            ).decode("ascii")
            self.send_response(101, "Switching Protocols")
            self.send_header("Upgrade", "websocket")
            self.send_header("Connection", "Upgrade")
            self.send_header("Sec-WebSocket-Accept", accept)
            self.end_headers()
            self.close_connection = True

            try:
                self.connection.settimeout(60.0)
            except Exception:
                pass

            client = WSClient(self.connection, client_ip=client_ip)
            try:
                while not client.closed:
                    text = client.recv_message()
                    if text is None:
                        break
                    handle_ws_message(client, text)
            finally:
                cleanup_ws_client(client)
        finally:
            with ACTIVE_WS_LOCK:
                ACTIVE_WS_CLIENTS = max(0, ACTIVE_WS_CLIENTS - 1)

    def _resolve_allowed_static_path(self, req_path):
        """Strict allowlist + canonical realpath check blocking source/scripts/traversal."""
        decoded = urllib.parse.unquote(req_path)
        if "\x00" in decoded or "\\" in decoded:
            return None

        # Exact root page allowlist
        if decoded in ALLOWED_ROOT_FILES:
            target = os.path.realpath(os.path.join(BASE_DIR, ALLOWED_ROOT_FILES[decoded]))
            return target if os.path.isfile(target) else None

        # Exact active JS bundle allowlist
        if decoded in ALLOWED_JS_FILES:
            target = os.path.realpath(os.path.join(BASE_DIR, decoded.lstrip("/")))
            if os.path.commonpath([BASE_DIR, target]) == BASE_DIR and os.path.isfile(target):
                return target
            return None

        # Normalize relative segments and disallow dotfiles / traversal
        rel = decoded.lstrip("/")
        if not rel or rel.startswith(".") or "/." in decoded or ".." in decoded.split("/"):
            return None

        candidate = os.path.realpath(os.path.join(BASE_DIR, rel))
        try:
            if os.path.commonpath([BASE_DIR, candidate]) != BASE_DIR:
                return None
        except ValueError:
            return None

        if not os.path.isfile(candidate):
            return None

        lower = rel.lower()
        if lower.startswith("css/") and lower.endswith(".css"):
            return candidate
        if lower.startswith("covers/") and lower.endswith(".png"):
            return candidate
        if lower.startswith("roms/") and lower.endswith((".nes", ".gb", ".gbc")):
            return candidate

        return None

    def do_GET(self):
        global _last_manual_rescan
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        client_ip = self._get_client_ip()

        if path == "/ws" and self.headers.get("Upgrade", "").lower() == "websocket":
            self._handle_websocket_upgrade()
            return

        if path == "/api/room":
            if not RATE_LIMITER.allow(f"api_room:{client_ip}", 25, 60):
                log_security_event("RATE_LIMIT_API_ROOM", client_ip)
                self._send_json(429, {"exists": False, "error": "Rate limit exceeded"})
                return
            qs = urllib.parse.parse_qs(parsed.query)
            code = (qs.get("code", [""])[0]).upper().strip()
            if not re.match(r'^[A-Z0-9]{4,8}$', code):
                self._send_json(400, {"exists": False, "error": "Invalid code format"})
                return
            with ROOMS_LOCK:
                room = ROOMS.get(code)
                if room and room.get("host") and not room["host"].closed:
                    info = {
                        "exists": True,
                        "code": code,
                        "rom": room["rom"],
                        "title": room["title"],
                        "system": room["system"],
                        "mode": room["mode"]
                    }
                else:
                    info = {"exists": False, "code": code}
            self._send_json(200, info)
            return

        if path == "/api/rescan":
            if not self._is_direct_localhost():
                log_security_event("UNAUTHORIZED_RESCAN", client_ip)
                self._send_json(403, {"error": "Rescan restricted to local host"})
                return
            now = time.time()
            if now - _last_manual_rescan < 5.0:
                games = get_cached_games(force_rescan=False)
            else:
                _last_manual_rescan = now
                games = get_cached_games(force_rescan=True)
            self._send_json(200, games)
            return

        if path == "/api/games":
            games = get_cached_games(force_rescan=False)
            self._send_json(200, games, cache_control="public, max-age=30")
            return

        safe_target = self._resolve_allowed_static_path(path)
        if not safe_target:
            log_security_event("BLOCKED_STATIC_ACCESS", client_ip, path)
            self.send_error(403 if not path.endswith("favicon.ico") else 404, "Forbidden")
            return

        # Serve safely validated file directly
        try:
            ctype = self.guess_type(safe_target)
            with open(safe_target, "rb") as fp:
                content = fp.read()
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(content)))
            if path.startswith(("/covers/", "/roms/", "/js/emulator/")):
                self.send_header("Cache-Control", "public, max-age=86400")
            else:
                self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(content)
        except Exception:
            self.send_error(500, "Internal Server Error")

    def log_message(self, format, *args):
        pass


class ReusableHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

    # Initial scan
    games = get_cached_games(force_rescan=True)
    print(f"Nexus Server initialized with {len(games)} cartridges in /roms")

    # Start filesystem watcher + room reaper
    watcher_thread = threading.Thread(target=watcher_loop, daemon=True)
    watcher_thread.start()

    # Bind strictly to localhost (all external access goes via Cloudflare HTTPS tunnel)
    bind_host = os.environ.get("NEXUS_BIND_HOST", "127.0.0.1")
    server_address = (bind_host, port)
    httpd = ReusableHTTPServer(server_address, NexusServerHandler)
    print(f"Serving Nexus Arcade safely on http://{bind_host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == '__main__':
    main()
