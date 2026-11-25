"""PlayStation (PS1) catalog: Top 50 Hall of Fame metadata + disc-image scanning.

Disc images are NOT shipped with the arcade. Drop your own backups into roms/ps1/
(CHD recommended; PBP, ISO, single-track BIN/IMG, or a ZIP/7Z of a CUE+BIN set also work)
and they are matched to the Hall of Fame entries below by filename.

The ranking is an editorial consensus of commonly cited "greatest PS1 games" lists,
not a reproduction of any single publication's list.
"""
import os
import re

PS1_DIR_NAME = 'ps1'
PS1_EXTS = ('.chd', '.pbp', '.iso', '.bin', '.img', '.zip', '.7z')
PS1_BIOS_FILES = ('scph5501.bin', 'scph1001.bin', 'scph7001.bin', 'scph101.bin')

# Genre -> (icon, accent color, glow color)
_GENRE_STYLE = {
    'RPG':        ('⚔️', '#a78bfa', '#3b1f75'),
    'ACTION':     ('🎖️', '#ff5376', '#6a0e1c'),
    'ADVENTURE':  ('🗝️', '#06d6a0', '#05543f'),
    'PLATFORMER': ('🏰', '#fbbf24', '#664d03'),
    'FIGHTING':   ('🥊', '#e63946', '#6a0e1c'),
    'RACING':     ('🏁', '#38bdf8', '#0c4a6e'),
    'SPORTS':     ('🛹', '#f97316', '#7c2d12'),
    'SHOOTER':    ('⚡', '#00f0ff', '#004d54'),
    'ARCADE':     ('🎤', '#ffd166', '#594719'),
}

# (rank, id, title, year, genre, discs, match_keys, description)
_TOP_50 = [
    (1, 'final-fantasy-vii', 'Final Fantasy VII', 1997, 'RPG', 3,
     ['final-fantasy-vii', 'final-fantasy-7', 'ff7'],
     'Cloud, AVALANCHE and the planet-draining Shinra Corporation in the RPG that brought cinematic storytelling to the mainstream.'),
    (2, 'metal-gear-solid', 'Metal Gear Solid', 1998, 'ACTION', 2,
     ['metal-gear-solid', 'mgs'],
     'Solid Snake infiltrates Shadow Moses in Hideo Kojima\'s fourth-wall-breaking tactical espionage classic.'),
    (3, 'castlevania-symphony-of-the-night', 'Castlevania: Symphony of the Night', 1997, 'ADVENTURE', 1,
     ['castlevania-symphony-of-the-night', 'akumajou-dracula-x', 'symphony-of-the-night', 'sotn'],
     'Alucard explores Dracula\'s castle in the game that defined the "Metroidvania" — and then turns it upside down.'),
    (4, 'resident-evil-2', 'Resident Evil 2', 1998, 'ACTION', 2,
     ['resident-evil-2', 'biohazard-2'],
     'Leon and Claire survive the outbreak in Raccoon City across two intertwined scenarios.'),
    (5, 'gran-turismo-2', 'Gran Turismo 2', 1999, 'RACING', 2,
     ['gran-turismo-2'],
     'Hundreds of licensed cars, licence tests and a career mode that set the bar for driving simulators.'),
    (6, 'tekken-3', 'Tekken 3', 1998, 'FIGHTING', 1,
     ['tekken-3'],
     'Fast, fluid 3D fighting with Jin, Eddy, Hwoarang and the bonus Tekken Force and Tekken Ball modes.'),
    (7, 'final-fantasy-ix', 'Final Fantasy IX', 2000, 'RPG', 4,
     ['final-fantasy-ix', 'final-fantasy-9', 'ff9'],
     'Zidane and Princess Garnet in a warm, storybook return to the series\' crystal-and-airship roots.'),
    (8, 'tony-hawks-pro-skater-2', "Tony Hawk's Pro Skater 2", 2000, 'SPORTS', 1,
     ['tony-hawk-s-pro-skater-2', 'tony-hawks-pro-skater-2', 'thps2'],
     'Manuals link combos together in the arcade skating game with a park editor and a legendary soundtrack.'),
    (9, 'chrono-cross', 'Chrono Cross', 2000, 'RPG', 2,
     ['chrono-cross'],
     'Serge slips between two parallel worlds in this lush, ambitious follow-up to Chrono Trigger.'),
    (10, 'silent-hill', 'Silent Hill', 1999, 'ADVENTURE', 1,
     ['silent-hill'],
     'Harry Mason searches a fog-drowned town for his daughter in a landmark of psychological horror.'),
    (11, 'crash-bandicoot-warped', 'Crash Bandicoot: Warped', 1998, 'PLATFORMER', 1,
     ['crash-bandicoot-warped', 'crash-bandicoot-3'],
     'Time-travelling levels, jet-skis, motorbikes and bazookas in the most polished Crash adventure.'),
    (12, 'spyro-the-dragon', 'Spyro the Dragon', 1998, 'PLATFORMER', 1,
     ['spyro-the-dragon'],
     'Glide, charge and flame your way across the Dragon Worlds to free your crystallised elders.'),
    (13, 'final-fantasy-tactics', 'Final Fantasy Tactics', 1998, 'RPG', 1,
     ['final-fantasy-tactics'],
     'Political intrigue in Ivalice and a deep job system in one of the finest tactical RPGs ever made.'),
    (14, 'gran-turismo', 'Gran Turismo', 1998, 'RACING', 1,
     ['gran-turismo'],
     '"The Real Driving Simulator": the game that made car tuning and licence tests a phenomenon.'),
    (15, 'final-fantasy-viii', 'Final Fantasy VIII', 1999, 'RPG', 4,
     ['final-fantasy-viii', 'final-fantasy-8', 'ff8'],
     'Squall and the SeeD cadets of Balamb Garden, Guardian Forces, junctions and Triple Triad.'),
    (16, 'legacy-of-kain-soul-reaver', 'Legacy of Kain: Soul Reaver', 1999, 'ADVENTURE', 1,
     ['legacy-of-kain-soul-reaver', 'soul-reaver'],
     'Raziel shifts between the material and spectral realms in a gothic tale of revenge against Kain.'),
    (17, 'crash-team-racing', 'Crash Team Racing', 1999, 'RACING', 1,
     ['crash-team-racing', 'ctr-crash-team-racing', 'ctr'],
     'Power-slide boosts and weapon pickups in one of the best kart racers of its generation.'),
    (18, 'resident-evil', 'Resident Evil', 1996, 'ACTION', 1,
     ['resident-evil', 'biohazard'],
     'Jill and Chris investigate the Spencer Mansion in the game that named survival horror.'),
    (19, 'tomb-raider', 'Tomb Raider', 1996, 'ADVENTURE', 1,
     ['tomb-raider'],
     'Lara Croft\'s debut: vast 3D tombs, block puzzles, dinosaurs and lost Atlantean secrets.'),
    (20, 'vagrant-story', 'Vagrant Story', 2000, 'RPG', 1,
     ['vagrant-story'],
     'Ashley Riot descends into Leá Monde in Yasumi Matsuno\'s dark, intricate action-RPG.'),
    (21, 'xenogears', 'Xenogears', 1998, 'RPG', 2,
     ['xenogears'],
     'Fei Fong Wong, giant Gears and a sprawling philosophical sci-fi epic.'),
    (22, 'suikoden-ii', 'Suikoden II', 1999, 'RPG', 1,
     ['suikoden-ii', 'suikoden-2'],
     'Recruit 108 Stars of Destiny in a war story famous for its villain and its heart.'),
    (23, 'spyro-2-riptos-rage', "Spyro 2: Ripto's Rage!", 1999, 'PLATFORMER', 1,
     ['spyro-2', 'ripto-s-rage', 'gateway-to-glimmer'],
     'Spyro learns to swim, climb and headbash while saving Avalar from the tiny tyrant Ripto.'),
    (24, 'spyro-year-of-the-dragon', 'Spyro: Year of the Dragon', 2000, 'PLATFORMER', 1,
     ['spyro-year-of-the-dragon', 'year-of-the-dragon'],
     'Rescue 150 stolen dragon eggs with new playable friends like Sheila and Sgt. Byrd.'),
    (25, 'crash-bandicoot-2-cortex-strikes-back', 'Crash Bandicoot 2: Cortex Strikes Back', 1997, 'PLATFORMER', 1,
     ['crash-bandicoot-2', 'cortex-strikes-back'],
     'Crash collects crystals for Cortex — or does he? — across warp-room hub worlds.'),
    (26, 'crash-bandicoot', 'Crash Bandicoot', 1996, 'PLATFORMER', 1,
     ['crash-bandicoot'],
     'Naughty Dog\'s spinning marsupial makes his into-the-screen platforming debut.'),
    (27, 'tony-hawks-pro-skater', "Tony Hawk's Pro Skater", 1999, 'SPORTS', 1,
     ['tony-hawk-s-pro-skater', 'tony-hawks-pro-skater', 'thps'],
     'Two-minute runs, S-K-A-T-E letters and secret tapes in the game that started the skate boom.'),
    (28, 'ape-escape', 'Ape Escape', 1999, 'PLATFORMER', 1,
     ['ape-escape'],
     'Built for the DualShock: catch escaped monkeys with nets, gadgets and both analogue sticks.'),
    (29, 'medal-of-honor', 'Medal of Honor', 1999, 'SHOOTER', 1,
     ['medal-of-honor'],
     'A cinematic WWII shooter scored by Michael Giacchino that launched a genre-defining series.'),
    (30, 'syphon-filter', 'Syphon Filter', 1999, 'ACTION', 1,
     ['syphon-filter'],
     'Gabe Logan tasers, snipes and stealths his way through a bio-weapon conspiracy.'),
    (31, 'driver', 'Driver', 1999, 'RACING', 1,
     ['driver-you-are-the-wheelman', 'driver'],
     'Undercover getaway driving through 1970s-movie-style car chases — after you pass the garage test.'),
    (32, 'oddworld-abes-oddysee', "Oddworld: Abe's Oddysee", 1997, 'PLATFORMER', 1,
     ['oddworld-abe-s-oddysee', 'oddworld-abes-oddysee', 'abe-s-oddysee'],
     'Abe escapes RuptureFarms and frees his fellow Mudokons with GameSpeak and possession.'),
    (33, 'resident-evil-3-nemesis', 'Resident Evil 3: Nemesis', 1999, 'ACTION', 1,
     ['resident-evil-3', 'biohazard-3'],
     'Jill Valentine flees Raccoon City while the relentless Nemesis hunts her down.'),
    (34, 'dino-crisis', 'Dino Crisis', 1999, 'ACTION', 1,
     ['dino-crisis'],
     'Regina versus velociraptors in Capcom\'s fast-paced "panic horror" spin on survival horror.'),
    (35, 'parasite-eve', 'Parasite Eve', 1998, 'RPG', 2,
     ['parasite-eve'],
     'NYPD cop Aya Brea battles mitochondrial horror across a Christmas-time New York.'),
    (36, 'street-fighter-alpha-3', 'Street Fighter Alpha 3', 1999, 'FIGHTING', 1,
     ['street-fighter-alpha-3', 'street-fighter-zero-3'],
     'A huge roster, three -ism fighting styles and the PS1-exclusive World Tour mode.'),
    (37, 'twisted-metal-2', 'Twisted Metal 2', 1996, 'ACTION', 1,
     ['twisted-metal-2'],
     'Vehicular combat around the globe — Paris, Hong Kong, Antarctica — for Calypso\'s prize.'),
    (38, 'wipeout-2097', 'WipEout 2097', 1996, 'RACING', 1,
     ['wipeout-2097', 'wipeout-xl'],
     'Anti-gravity racing with a club-culture soundtrack; released as WipEout XL in North America.'),
    (39, 'the-legend-of-dragoon', 'The Legend of Dragoon', 2000, 'RPG', 4,
     ['legend-of-dragoon'],
     'Dart and his companions transform into Dragoons, with timed "Addition" combo attacks.'),
    (40, 'medievil', 'MediEvil', 1998, 'ADVENTURE', 1,
     ['medievil'],
     'Sir Daniel Fortesque rises from the grave to save Gallowmere — with a jawbone and a sense of humour.'),
    (41, 'rayman', 'Rayman', 1995, 'PLATFORMER', 1,
     ['rayman'],
     'Hand-drawn worlds and a limbless hero in a gorgeous (and famously hard) 2D platformer.'),
    (42, 'valkyrie-profile', 'Valkyrie Profile', 2000, 'RPG', 2,
     ['valkyrie-profile'],
     'Lenneth gathers the souls of fallen heroes for Ragnarök, with combo-driven side-scrolling battles.'),
    (43, 'breath-of-fire-iv', 'Breath of Fire IV', 2000, 'RPG', 1,
     ['breath-of-fire-iv', 'breath-of-fire-4'],
     'Ryu and the emperor Fou-Lu share one destiny in Capcom\'s beautifully animated sprite RPG.'),
    (44, 'dragon-warrior-vii', 'Dragon Warrior VII', 2001, 'RPG', 2,
     ['dragon-warrior-vii', 'dragon-quest-vii'],
     'Rebuild a lonely world one recovered island at a time in an enormous Dragon Quest adventure.'),
    (45, 'mega-man-legends', 'Mega Man Legends', 1998, 'ACTION', 1,
     ['mega-man-legends', 'megaman-legends', 'rockman-dash'],
     'Mega Man Volnutt digs through ruins on Kattelox Island in the Blue Bomber\'s first 3D adventure.'),
    (46, 'mega-man-x4', 'Mega Man X4', 1997, 'ACTION', 1,
     ['mega-man-x4', 'megaman-x4', 'rockman-x4'],
     'Choose X or Zero and take on the Repliforce in a high point of 2D action.'),
    (47, 'tekken-2', 'Tekken 2', 1996, 'FIGHTING', 1,
     ['tekken-2'],
     'Heihachi returns for revenge in the sequel that cemented Tekken on PlayStation.'),
    (48, 'ridge-racer-type-4', 'R4: Ridge Racer Type 4', 1999, 'RACING', 1,
     ['ridge-racer-type-4', 'r4-ridge-racer'],
     'Stylish late-night drifting with team-based Grand Prix and hundreds of unlockable cars.'),
    (49, 'tenchu-stealth-assassins', 'Tenchu: Stealth Assassins', 1998, 'ACTION', 1,
     ['tenchu-stealth-assassins', 'tenchu'],
     'Ninja Rikimaru and Ayame strike from the shadows in one of the first true 3D stealth games.'),
    (50, 'parappa-the-rapper', 'PaRappa the Rapper', 1997, 'ARCADE', 1,
     ['parappa'],
     '"I gotta believe!" — the paper-thin rapping dog behind the rhythm-game boom.'),
]


def _slug(name):
    name = os.path.splitext(name)[0]
    name = re.sub(r'\s*\([^)]*\)', '', name)
    name = re.sub(r'\s*\[[^\]]*\]', '', name)
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def _build_entry(rank, gid, title, year, genre, discs, keys, desc):
    icon, color, glow = _GENRE_STYLE.get(genre, ('💿', '#94a3b8', '#1e293b'))
    disc_note = f' • {discs} discs' if discs > 1 else ''
    # Always accept the full title and the id as keys (e.g. "Spyro 2 - Ripto's Rage!" -> spyro-2-ripto-s-rage)
    all_keys = list(dict.fromkeys(keys + [_slug(title.replace(':', ' ')), gid]))
    return {
        'id': f'ps1-{gid}',
        'match_keys': all_keys,
        'title': title,
        'sub': f'PS1 Rank #{rank} • {year}{disc_note}',
        'system': genre,
        'console': 'ps1',
        'ps1': True,
        'ps1_top50': True,
        'rank': rank,
        'year': year,
        'discs': discs,
        'review_score': f'💿 PS1 Hall of Fame #{rank}',
        'review_quote': desc,
        'icon': icon,
        'color': color,
        'gradient': f'radial-gradient(circle at 75% 25%, {glow} 0%, #06080e 70%)',
        'desc': desc,
        'disc_hint': f'roms/ps1/{title.replace(":", " -")} (USA).chd',
    }


TOP_50_PS1 = [_build_entry(*row) for row in _TOP_50]


def _disc_number(filename):
    m = re.search(r'\(disc\s*(\d+)', filename, re.IGNORECASE)
    return int(m.group(1)) if m else 1


# The only extra words allowed after a known title. Anything else ("tomb-raider-ii",
# "rayman-brain-games", "metal-gear-solid-vr-missions") is a different game, so it is
# listed as an unranked disc instead of being mislabelled as a Hall of Fame entry.
_ALLOWED_SUFFIX = re.compile(r'(?:-the)?(?:-director-s-cut)?(?:-dual-shock(?:-ver)?)?'
                             r'(?:-greatest-hits)?(?:-(?:disc|cd)-?\d+)?$')


def _match_top50(slug):
    best, best_len = None, 0
    for item in TOP_50_PS1:
        for k in item['match_keys']:
            if len(k) > best_len and slug.startswith(k) and _ALLOWED_SUFFIX.match(slug[len(k):]):
                best, best_len = item, len(k)
    return best


def ps1_dir(roms_dir):
    return os.path.join(roms_dir, PS1_DIR_NAME)


def find_bios(base_dir):
    bios_dir = os.path.join(base_dir, 'bios')
    for name in PS1_BIOS_FILES:
        if os.path.isfile(os.path.join(bios_dir, name)):
            return f'bios/{name}'
    return None


def scan_ps1(roms_dir):
    """Return PS1 catalog entries: all Top 50 titles (available or not) + any extra discs found."""
    folder = ps1_dir(roms_dir)
    files = []
    if os.path.isdir(folder):
        files = sorted(f for f in os.listdir(folder)
                       if f.lower().endswith(PS1_EXTS) and os.path.isfile(os.path.join(folder, f)))

    # Group multi-disc sets by title slug and keep the lowest disc number as the boot disc.
    boot_disc = {}
    for f in files:
        slug = _slug(f)
        if not slug:
            continue
        if slug not in boot_disc or _disc_number(f) < _disc_number(boot_disc[slug]):
            boot_disc[slug] = f

    entries = {}
    for slug, f in boot_disc.items():
        rom = f'roms/{PS1_DIR_NAME}/{f}'
        hit = _match_top50(slug)
        if hit and hit['id'] not in entries:
            e = dict(hit)
        else:
            title = ' '.join(w.capitalize() for w in slug.split('-'))
            e = {
                'id': f'ps1-{slug}',
                'title': title,
                'sub': 'PlayStation Classic',
                'system': 'ARCADE',
                'console': 'ps1',
                'ps1': True,
                'icon': '💿',
                'color': '#94a3b8',
                'gradient': 'radial-gradient(circle at 75% 25%, #1e293b 0%, #06080e 70%)',
                'desc': f'PlayStation disc: {title}.',
            }
        e['rom'] = rom
        e['available'] = True
        entries[e['id']] = e

    for item in TOP_50_PS1:
        if item['id'] not in entries:
            e = dict(item)
            e['rom'] = ''
            e['available'] = False
            entries[item['id']] = e

    for e in entries.values():
        e.pop('match_keys', None)
        e['cover'] = f"covers/{e['id']}.png"
    return list(entries.values())
