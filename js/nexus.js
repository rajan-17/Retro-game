// NEXUS RETRO ARCADE - Core Multi-Console Engine & Bento Grid Hub
(function() {
    'use strict';

    // ========================================================
    // 1. Built-in Retro Classics Library (21+ Cartridges)
    // ========================================================
    const BUILTIN_GAMES = [
    {
        "id": "super-mario-bros-3",
        "match_keys": [
            "super-mario-bros-3",
            "super-mario-3",
            "smb3"
        ],
        "title": "Super Mario Bros. 3",
        "sub": "Rank #1 All-Time \u2022 1990",
        "system": "PLATFORMER",
        "rank": 1,
        "review_score": "\u2605 10/10 IGN #1",
        "review_quote": "The pinnacle of 8-bit platforming design: world maps, Tanooki suit, and secrets.",
        "icon": "\ud83c\udf44",
        "color": "#fbbf24",
        "gradient": "radial-gradient(circle at 75% 25%, #664d03 0%, #06080e 70%)",
        "default_rom": "roms/Super Mario Bros. 3 (USA) (Rev 1).nes",
        "desc": "One of the greatest video games ever made! Don the Tanooki and Frog suits, explore 8 themed world maps, defeat the Koopalings, and rescue Princess Peach.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Super Mario Bros. 3 (USA) (Rev 1).nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/super-mario-bros-3.png"
    },
    {
        "id": "the-legend-of-zelda",
        "match_keys": [
            "legend-of-zelda",
            "zelda"
        ],
        "title": "The Legend of Zelda",
        "sub": "Rank #2 All-Time \u2022 1987",
        "system": "ADVENTURE",
        "rank": 2,
        "review_score": "\u2605 10/10 GameSpot",
        "review_quote": "Pioneered non-linear open exploration, secret underworld dungeons, and battery save backups.",
        "icon": "\ud83d\udde1\ufe0f",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #054f38 0%, #06080e 70%)",
        "default_rom": "roms/The Legend of Zelda (E) [!].nes",
        "desc": "The revolutionary fantasy adventure that defined action-RPGs! Explore Hyrule, delve into underworld dungeons, and assemble the Triforce of Wisdom.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/The Legend of Zelda (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/the-legend-of-zelda.png"
    },
    {
        "id": "mega-man-2",
        "match_keys": [
            "megaman-ii",
            "mega-man-2",
            "megaman-2",
            "megaman2"
        ],
        "title": "Mega Man 2",
        "sub": "Rank #3 All-Time \u2022 1989",
        "system": "ACTION",
        "rank": 3,
        "review_score": "\u2605 9.8/10 IGN",
        "review_quote": "Peak action platforming with an immortal soundtrack, 8 robot masters, and flawless controls.",
        "icon": "\ud83e\udd16",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "default_rom": "roms/Megaman II (E) [!].nes",
        "desc": "Capcom\u2019s action-platforming crown jewel! Defeat 8 Robot Masters (Metal Man, Quick Man), claim their special weapons, and storm Dr. Wily\u2019s castle.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Megaman II (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mega-man-2.png"
    },
    {
        "id": "super-mario-bros",
        "match_keys": [
            "super-mario-bros",
            "smb1"
        ],
        "title": "Super Mario Bros.",
        "sub": "Rank #4 All-Time \u2022 1985",
        "system": "PLATFORMER",
        "rank": 4,
        "review_score": "\u2605 9.8/10 All-Time",
        "review_quote": "Saved the video game industry; established modern platforming mechanics forever.",
        "icon": "\u2b50",
        "color": "#e63946",
        "gradient": "radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)",
        "default_rom": "roms/Super Mario Bros. (E) [!].nes",
        "desc": "The seminal platformer that revolutionized gaming! Guide Mario across the Mushroom Kingdom, smash question blocks, and defeat Bowser.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Super Mario Bros. (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/super-mario-bros.png"
    },
    {
        "id": "metroid",
        "match_keys": [
            "metroid"
        ],
        "title": "Metroid",
        "sub": "Rank #5 All-Time \u2022 1987",
        "system": "ADVENTURE",
        "rank": 5,
        "review_score": "\u2605 9.6/10 IGN",
        "review_quote": "Atmospheric sci-fi isolation, morph ball puzzles, and the birth of the Metroidvania genre.",
        "icon": "\ud83d\ude80",
        "color": "#f72585",
        "gradient": "radial-gradient(circle at 75% 25%, #7209b7 0%, #06080e 70%)",
        "default_rom": "roms/Metroid (U) [!].nes",
        "desc": "The chilling sci-fi labyrinth adventure! Guide intergalactic bounty hunter Samus Aran through subterranean Planet Zebes to destroy Mother Brain.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Metroid (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/metroid.png"
    },
    {
        "id": "mike-tysons-punch-out",
        "match_keys": [
            "punch-out",
            "mike-tyson"
        ],
        "title": "Mike Tyson's Punch-Out!!",
        "sub": "Rank #6 All-Time \u2022 1987",
        "system": "ACTION",
        "rank": 6,
        "review_score": "\u2605 9.8/10 IGN",
        "review_quote": "A masterclass in rhythm, telegraphing, visual comedy, and precision timing.",
        "icon": "\ud83e\udd4a",
        "color": "#4cc9f0",
        "gradient": "radial-gradient(circle at 75% 25%, #184e77 0%, #06080e 70%)",
        "default_rom": "roms/Mike Tyson's Punch-Out!! (E) [!].nes",
        "desc": "The legendary rhythm-boxing puzzle showcase! Step into the ring as Little Mac and KO Glass Joe, Bald Bull, and Iron Mike Tyson with lightning uppercuts.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Mike Tyson's Punch-Out!! (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mike-tysons-punch-out.png"
    },
    {
        "id": "contra",
        "match_keys": [
            "contra"
        ],
        "title": "Contra",
        "sub": "Rank #7 All-Time \u2022 1988",
        "system": "ACTION",
        "rank": 7,
        "review_score": "\u2605 9.6/10 IGN",
        "review_quote": "The ultimate adrenaline run-and-gun arcade shooter; popularized the Konami Code.",
        "icon": "\ud83c\udf96\ufe0f",
        "color": "#ff5376",
        "gradient": "radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)",
        "default_rom": "roms/Contra (USA).nes",
        "desc": "The legendary Konami run-and-gun arcade classic! Fight through alien-infested jungles, waterfalls, and bases with multi-directional firing.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Contra (USA).nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/contra.png"
    },
    {
        "id": "castlevania-3",
        "match_keys": [
            "castlevania-iii",
            "castlevania-3",
            "draculas-curse"
        ],
        "title": "Castlevania III: Dracula's Curse",
        "sub": "Rank #8 All-Time \u2022 1990",
        "system": "ACTION",
        "rank": 8,
        "review_score": "\u2605 9.7/10 EGM",
        "review_quote": "Branching story paths, multiple switchable heroes, and custom VRC6 audio.",
        "icon": "\ud83e\udd87",
        "color": "#9d4edd",
        "gradient": "radial-gradient(circle at 75% 25%, #3c096c 0%, #06080e 70%)",
        "default_rom": "roms/Castlevania III (U) [!].nes",
        "desc": "The pinnacle of classic 8-bit gothic action! Guide Trevor Belmont alongside switchable allies Sypha, Grant, and Alucard across branching paths.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Castlevania III (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/castlevania-3.png"
    },
    {
        "id": "tetris",
        "match_keys": [
            "tetris"
        ],
        "title": "Tetris",
        "sub": "Rank #9 All-Time \u2022 1989",
        "system": "PUZZLE",
        "rank": 9,
        "review_score": "\u2605 9.8/10 IGN",
        "review_quote": "Timeless falling-block perfection with infectious Russian folk tunes.",
        "icon": "\ud83e\udde9",
        "color": "#06d6a0",
        "gradient": "radial-gradient(circle at 75% 25%, #05543f 0%, #06080e 70%)",
        "default_rom": "roms/Tetris (BPS) (J) [!].nes",
        "desc": "The world\u2019s most addictive and timeless falling-block puzzle masterpiece! Rotate tetrominoes, clear lines, and reach the high-speed rocket launch.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Tetris (BPS) (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/tetris.png"
    },
    {
        "id": "ninja-gaiden",
        "match_keys": [
            "ninja-gaiden"
        ],
        "title": "Ninja Gaiden",
        "sub": "Rank #10 All-Time \u2022 1989",
        "system": "ACTION",
        "rank": 10,
        "review_score": "\u2605 9.6/10 IGN",
        "review_quote": "Lightning-fast ninja action and groundbreaking cinematic storytelling cutscenes.",
        "icon": "\ud83e\udd77",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)",
        "default_rom": "roms/Ninja Gaiden (U) [!].nes",
        "desc": "High-speed precision ninja combat! Guide Ryu Hayabusa across demonic temples with wall-jumps, ninpo arts, and historic cinematic story cutscenes.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Ninja Gaiden (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/ninja-gaiden.png"
    },
    {
        "id": "mega-man-3",
        "match_keys": [
            "mega-man-3",
            "rockman-3",
            "megaman-3"
        ],
        "title": "Mega Man 3",
        "sub": "Rank #11 All-Time \u2022 1990",
        "system": "ACTION",
        "rank": 11,
        "review_score": "\u2605 9.5/10 IGN",
        "review_quote": "Introduced the slide maneuver, Rush the cyber dog, and the enigmatic Proto Man.",
        "icon": "\ud83d\udc15",
        "color": "#3a86ff",
        "gradient": "radial-gradient(circle at 75% 25%, #023e8a 0%, #06080e 70%)",
        "default_rom": "roms/Mega Man 3 (J) [!].nes",
        "desc": "Massive expansion of the Blue Bomber saga! Slide through tight hazard gaps, summon Rush Marine and Coil, and duel the mysterious whistle-playing Proto Man.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Mega Man 3 (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mega-man-3.png"
    },
    {
        "id": "ducktales",
        "match_keys": [
            "ducktales",
            "duck-tales"
        ],
        "title": "DuckTales",
        "sub": "Rank #12 All-Time \u2022 1989",
        "system": "PLATFORMER",
        "rank": 12,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "Revolutionary pogo-cane platforming and the immortal Moon Theme soundtrack.",
        "icon": "\ud83e\udd86",
        "color": "#ffd166",
        "gradient": "radial-gradient(circle at 75% 25%, #594719 0%, #06080e 70%)",
        "default_rom": "roms/DuckTales (U) [!].nes",
        "desc": "Capcom\u2019s Disney platforming triumph! Pogo-jump as Scrooge McDuck through the Amazon, Transylvania, African Mines, the Himalayas, and the Moon.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/DuckTales (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/ducktales.png"
    },
    {
        "id": "super-mario-bros-2",
        "match_keys": [
            "super-mario-bros-2",
            "super-mario-2",
            "smb2"
        ],
        "title": "Super Mario Bros. 2",
        "sub": "Rank #13 All-Time \u2022 1988",
        "system": "PLATFORMER",
        "rank": 13,
        "review_score": "\u2605 9.5/10 IGN",
        "review_quote": "Subcon vegetable-plucking mechanics and 4 unique characters with distinct abilities.",
        "icon": "\ud83e\udd55",
        "color": "#e76f51",
        "gradient": "radial-gradient(circle at 75% 25%, #9b2226 0%, #06080e 70%)",
        "default_rom": "roms/Super Mario Bros. 2 (U) [!].nes",
        "desc": "Step into the dream realm of Subcon! Choose from Mario, Luigi, Toad, and Princess Peach to pluck turnips, ride magic carpets, and defeat Wart.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Super Mario Bros. 2 (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/super-mario-bros-2.png"
    },
    {
        "id": "kirbys-adventure",
        "match_keys": [
            "kirbys-adventure",
            "kirby"
        ],
        "title": "Kirby's Adventure",
        "sub": "Rank #14 All-Time \u2022 1993",
        "system": "PLATFORMER",
        "rank": 14,
        "review_score": "\u2605 9.5/10 IGN",
        "review_quote": "Pushed NES hardware to the limit with copy abilities, mini-games, and pastel visuals.",
        "icon": "\u2b50",
        "color": "#ffafcc",
        "gradient": "radial-gradient(circle at 75% 25%, #8338ec 0%, #06080e 70%)",
        "default_rom": "roms/Kirby's Adventure (E) [!].nes",
        "desc": "Masahiro Sakurai\u2019s 8-bit pinnacle! Inhale enemies to absorb over 20 unique copy abilities (Beam, Sword, Fire, UFO) across the colorful Dream Land.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Kirby's Adventure (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/kirbys-adventure.png"
    },
    {
        "id": "castlevania",
        "match_keys": [
            "castlevania"
        ],
        "title": "Castlevania",
        "sub": "Rank #15 All-Time \u2022 1987",
        "system": "ACTION",
        "rank": 15,
        "review_score": "\u2605 9.5/10 IGN",
        "review_quote": "Atmospheric gothic whip action, iconic bosses, and timeless horror aesthetic.",
        "icon": "\ud83c\udff0",
        "color": "#d90429",
        "gradient": "radial-gradient(circle at 75% 25%, #590d22 0%, #06080e 70%)",
        "default_rom": "roms/Castlevania (U) [!].nes",
        "desc": "The original Konami gothic landmark! Wield the Vampire Killer whip as Simon Belmont through ghoul-infested castles to slay Count Dracula.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Castlevania (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/castlevania.png"
    },
    {
        "id": "teenage-mutant-ninja-turtles",
        "match_keys": [
            "teenage-mutant-ninja-turtles-(usa)",
            "teenage-mutant-ninja-turtles",
            "tmnt"
        ],
        "title": "Teenage Mutant Ninja Turtles",
        "sub": "Rank #16 All-Time \u2022 1989",
        "system": "ACTION",
        "rank": 16,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "High-stakes pizza power action, underwater bomb defusal, and 4 switchable turtles.",
        "icon": "\ud83d\udc22",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #054f38 0%, #06080e 70%)",
        "default_rom": "roms/Teenage Mutant Ninja Turtles (USA).nes",
        "desc": "Join Leonardo, Raphael, Michelangelo, and Donatello across New York City sewer mazes and streets to defeat Shredder and the Foot Clan.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Teenage Mutant Ninja Turtles (USA).nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/teenage-mutant-ninja-turtles.png"
    },
    {
        "id": "tmnt-2-arcade",
        "match_keys": [
            "teenage-mutant-ninja-turtles-ii",
            "tmnt-2",
            "tmnt-arcade"
        ],
        "title": "TMNT II: The Arcade Game",
        "sub": "Rank #17 All-Time \u2022 1990",
        "system": "ACTION",
        "rank": 17,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "Definitive home conversion of the classic 4-player arcade beat-em-up.",
        "icon": "\ud83c\udf55",
        "color": "#2a9d8f",
        "gradient": "radial-gradient(circle at 75% 25%, #1d3557 0%, #06080e 70%)",
        "default_rom": "roms/Teenage Mutant Ninja Turtles II (U) [!].nes",
        "desc": "The acclaimed home conversion of Konami\u2019s smash-hit arcade brawler! Team up to smash through waves of Foot Ninjas, Rocksteady, and Krang.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Teenage Mutant Ninja Turtles II (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/tmnt-2-arcade.png"
    },
    {
        "id": "river-city-ransom",
        "match_keys": [
            "river-city-ransom",
            "river-city",
            "downtown-special"
        ],
        "title": "River City Ransom",
        "sub": "Rank #18 All-Time \u2022 1989",
        "system": "ACTION",
        "rank": 18,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "Groundbreaking combination of street brawling, open town exploration, and RPG stat shops.",
        "icon": "\ud83e\udd4a",
        "color": "#e9c46a",
        "gradient": "radial-gradient(circle at 75% 25%, #b08968 0%, #06080e 70%)",
        "default_rom": "roms/River City Ransom (U) [!].nes",
        "desc": "Revolutionary open-world RPG beat-\u2019em-up! Brawl through rival street gangs as Alex and Ryan, buy books to learn dragon kicks, and feast at diners.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/River City Ransom (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/river-city-ransom.png"
    },
    {
        "id": "battletoads",
        "match_keys": [
            "battletoads"
        ],
        "title": "Battletoads",
        "sub": "Rank #19 All-Time \u2022 1991",
        "system": "ACTION",
        "rank": 19,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "Incredible graphical prowess, morphing fists, and infamous turbo tunnel speeder bikes.",
        "icon": "\ud83d\udc38",
        "color": "#588157",
        "gradient": "radial-gradient(circle at 75% 25%, #344e41 0%, #06080e 70%)",
        "default_rom": "roms/Battletoads (U) [!].nes",
        "desc": "Rareware\u2019s legendary technical showcase! Control Rash and Zitz as they morph giant battle boots, abseil down chasms, and conquer the turbo tunnel.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Battletoads (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/battletoads.png"
    },
    {
        "id": "bionic-commando",
        "match_keys": [
            "bionic-commando"
        ],
        "title": "Bionic Commando",
        "sub": "Rank #20 All-Time \u2022 1988",
        "system": "ACTION",
        "rank": 20,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "Replaced jumping with a revolutionary grappling hook arm mechanic.",
        "icon": "\ud83e\uddbe",
        "color": "#457b9d",
        "gradient": "radial-gradient(circle at 75% 25%, #1d3557 0%, #06080e 70%)",
        "default_rom": "roms/Bionic Commando (U) [!].nes",
        "desc": "Genius mechanical innovation! Swing across treacherous military bases using your extendable bionic grappling arm to intercept enemy dictators.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Bionic Commando (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/bionic-commando.png"
    },
    {
        "id": "zelda-ii",
        "match_keys": [
            "zelda-ii",
            "zelda-2",
            "adventure-of-link"
        ],
        "title": "Zelda II: The Adventure of Link",
        "sub": "Rank #21 All-Time \u2022 1987",
        "system": "ADVENTURE",
        "rank": 21,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Non-linear action-RPG sidescroller; introduced towns, XP, and spell casting.",
        "icon": "\ud83d\udee1\ufe0f",
        "color": "#34d399",
        "gradient": "radial-gradient(circle at 75% 25%, #065f46 0%, #06080e 70%)",
        "default_rom": "roms/Zelda II - The Adventure of Link (E) [!].nes",
        "desc": "Step into side-scrolling action in Hyrule! Gain experience, learn magic spells from village elders, conquer 6 palaces, and awaken Princess Zelda.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Zelda II - The Adventure of Link (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/zelda-ii.png"
    },
    {
        "id": "castlevania-ii",
        "match_keys": [
            "castlevania-ii",
            "castlevania-2",
            "simons-quest"
        ],
        "title": "Castlevania II: Simon's Quest",
        "sub": "Rank #22 All-Time \u2022 1987",
        "system": "ACTION",
        "rank": 22,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Day/night cycle open-world gothic quest: \"What a horrible night to have a curse.\"",
        "icon": "\ud83e\udddb",
        "color": "#dc2626",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "default_rom": "roms/Castlevania II - Simon's Quest (U) [!].nes",
        "desc": "Break the dark curse placed upon Simon Belmont! Explore the countryside of Transylvania, solve occult riddles, and gather Dracula\u2019s remains.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Castlevania II - Simon's Quest (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/castlevania-ii.png"
    },
    {
        "id": "mega-man-4",
        "match_keys": [
            "mega-man-4",
            "megaman-4",
            "rockman-4",
            "megaman4"
        ],
        "title": "Mega Man 4",
        "sub": "Rank #23 All-Time \u2022 1991",
        "system": "ACTION",
        "rank": 23,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Introduced the revolutionary Mega Buster charge shot and Eddie the delivery bot.",
        "icon": "\ud83e\udd16",
        "color": "#38bdf8",
        "gradient": "radial-gradient(circle at 75% 25%, #0369a1 0%, #06080e 70%)",
        "default_rom": "roms/Mega Man 4 (J) [!].nes",
        "desc": "Unleash the newly engineered Mega Buster charge shot against Dr. Cossack\u2019s 8 rogue Robot Masters: Toad Man, Pharaoh Man, Drill Man, and Ring Man!",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Mega Man 4 (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mega-man-4.png"
    },
    {
        "id": "double-dragon-2",
        "match_keys": [
            "double-dragon-ii",
            "double-dragon-2",
            "doubledragon2"
        ],
        "title": "Double Dragon II: The Revenge",
        "sub": "Rank #24 All-Time \u2022 1989",
        "system": "ACTION",
        "rank": 24,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "The pinnacle of 8-bit co-op brawlers with the iconic Cyclone Spin Kick.",
        "icon": "\ud83e\udd4a",
        "color": "#f97316",
        "gradient": "radial-gradient(circle at 75% 25%, #9a3412 0%, #06080e 70%)",
        "default_rom": "roms/Double Dragon II - The Revenge (U) [!].nes",
        "desc": "Billy and Jimmy Lee return in the definitive NES beat-\u2019em-up! Master the Cyclone Spin Kick and Hyper Knee to avenge Marian and smash the Black Warriors.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Double Dragon II - The Revenge (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/double-dragon-2.png"
    },
    {
        "id": "super-c",
        "match_keys": [
            "super-c",
            "super-contra"
        ],
        "title": "Super C (Super Contra)",
        "sub": "Rank #25 All-Time \u2022 1990",
        "system": "ACTION",
        "rank": 25,
        "review_score": "\u2605 9.3/10 Nintendo Power",
        "review_quote": "Adrenaline sequel adding top-down vertical shooting and spread gun mayhem.",
        "icon": "\ud83d\udca5",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #991b1b 0%, #06080e 70%)",
        "default_rom": "roms/Super C (U) [!].nes",
        "desc": "Bill and Lance return to battle Red Falcon\u2019s alien invasion! Features alternating side-scrolling and top-down overhead combat with enhanced Spread Guns.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Super C (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/super-c.png"
    },
    {
        "id": "gradius",
        "match_keys": [
            "gradius"
        ],
        "title": "Gradius",
        "sub": "Rank #26 All-Time \u2022 1986",
        "system": "SHOOTER",
        "rank": 26,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Konami's defining space shooter with the Vic Viper modular power-up gauge.",
        "icon": "\ud83d\ude80",
        "color": "#6366f1",
        "gradient": "radial-gradient(circle at 75% 25%, #3730a3 0%, #06080e 70%)",
        "default_rom": "roms/Gradius (E) [!].nes",
        "desc": "Pilot the Vic Viper through deadly volcanic fields, Moai head ruins, and biomechanical motherships. Collect orange pods to upgrade speed, lasers, and shields!",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Gradius (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/gradius.png"
    },
    {
        "id": "life-force",
        "match_keys": [
            "life-force",
            "salamander"
        ],
        "title": "Life Force (Salamander)",
        "sub": "Rank #27 All-Time \u2022 1987",
        "system": "SHOOTER",
        "rank": 27,
        "review_score": "\u2605 9.3/10 Nintendo Power",
        "review_quote": "Alternating vertical & horizontal bio-mechanical space co-op shooter.",
        "icon": "\ud83d\udef8",
        "color": "#ec4899",
        "gradient": "radial-gradient(circle at 75% 25%, #9d174d 0%, #06080e 70%)",
        "default_rom": "roms/Life Force (U) [!].nes",
        "desc": "Fly inside the gargantuan alien beast Zelos! Experience 2-player co-op shooter bliss switching between horizontal corridors and vertical scrolling webs.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Life Force (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/life-force.png"
    },
    {
        "id": "bubble-bobble",
        "match_keys": [
            "bubble-bobble"
        ],
        "title": "Bubble Bobble",
        "sub": "Rank #28 All-Time \u2022 1986",
        "system": "ARCADE",
        "rank": 28,
        "review_score": "\u2605 9.3/10 GameSpot",
        "review_quote": "Taito's 100-level bubble-trapping co-op arcade phenomenon.",
        "icon": "\ud83e\udee7",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #155e75 0%, #06080e 70%)",
        "default_rom": "roms/Bubble Bobble (U) [!].nes",
        "desc": "Join cute bubble dragons Bub and Bob across 100 labyrinth levels! Blow bubbles to trap enemies, pop them for sweets, and discover multiple secret endings.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Bubble Bobble (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/bubble-bobble.png"
    },
    {
        "id": "blaster-master",
        "match_keys": [
            "blaster-master"
        ],
        "title": "Blaster Master",
        "sub": "Rank #29 All-Time \u2022 1988",
        "system": "ADVENTURE",
        "rank": 29,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "Sophia the 3rd jumping tank exploration + top-down pilot dungeon crawler.",
        "icon": "\ud83d\ude9c",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #854d0e 0%, #06080e 70%)",
        "default_rom": "roms/Blaster Master (U) [!].nes",
        "desc": "Command the SOPHIA III combat tank across subterranean cavern biomes, then hop out as pilot Jason in top-down blaster dungeons to obliterate radioactive mutants!",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Blaster Master (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/blaster-master.png"
    },
    {
        "id": "chip-n-dale",
        "match_keys": [
            "chip-n-dale",
            "chip-and-dale",
            "rescue-rangers"
        ],
        "title": "Chip 'n Dale: Rescue Rangers",
        "sub": "Rank #30 All-Time \u2022 1990",
        "system": "PLATFORMER",
        "rank": 30,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "Capcom's Disney co-op masterpiece with box-tossing mechanics.",
        "icon": "\ud83d\udc3f\ufe0f",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "default_rom": "roms/Chip 'n Dale Rescue Rangers (U) [!].nes",
        "desc": "Team up as chipmunks Chip and Dale! Pick up and hurl acorns, crates, and apples to foil Fat Cat\u2019s diabolical underworld feline syndicate.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Chip 'n Dale Rescue Rangers (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/chip-n-dale.png"
    },
    {
        "id": "pac-man",
        "match_keys": [
            "pac-man",
            "pacman"
        ],
        "title": "Pac-Man",
        "sub": "Rank #31 All-Time \u2022 1980",
        "system": "ARCADE",
        "rank": 31,
        "review_score": "\u2605 9.5/10 All-Time",
        "review_quote": "The most iconic arcade maze game in entertainment history.",
        "icon": "\ud83d\udfe1",
        "color": "#facc15",
        "gradient": "radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)",
        "default_rom": "roms/Pac-Man (Namco) (E) [!].nes",
        "desc": "The timeless arcade phenomenon! Munch pellets, avoid Blinky, Pinky, Inky, and Clyde, grab power pellets, and chomp blue ghosts for record high scores.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Pac-Man (Namco) (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/pac-man.png"
    },
    {
        "id": "galaga",
        "match_keys": [
            "galaga"
        ],
        "title": "Galaga",
        "sub": "Rank #32 All-Time \u2022 1981",
        "system": "SHOOTER",
        "rank": 32,
        "review_score": "\u2605 9.4/10 All-Time",
        "review_quote": "Namco's defining space defense shooter with dual-fighter tractor beams.",
        "icon": "\ud83d\udc7e",
        "color": "#38bdf8",
        "gradient": "radial-gradient(circle at 75% 25%, #075985 0%, #06080e 70%)",
        "default_rom": "roms/Galaga (E) [!].nes",
        "desc": "Repel descending alien insect swarms! Risk capture by the Boss Galaga\u2019s tractor beam to rescue your ship and unlock unstoppable double-shot firepower.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Galaga (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/galaga.png"
    },
    {
        "id": "donkey-kong",
        "match_keys": [
            "donkey-kong"
        ],
        "title": "Donkey Kong",
        "sub": "Rank #33 All-Time \u2022 1981",
        "system": "ARCADE",
        "rank": 33,
        "review_score": "\u2605 9.4/10 All-Time",
        "review_quote": "Shigeru Miyamoto's foundational platformer that introduced Mario.",
        "icon": "\ud83e\udd8d",
        "color": "#ea580c",
        "gradient": "radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)",
        "default_rom": "roms/Donkey Kong (W) [!].nes",
        "desc": "Where video game history began! Jump over rolling oil barrels, scale construction girders with the hammer, and rescue Pauline from the giant ape.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Donkey Kong (W) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/donkey-kong.png"
    },
    {
        "id": "donkey-kong-jr",
        "match_keys": [
            "donkey-kong-jr",
            "donkey-kong-junior"
        ],
        "title": "Donkey Kong Jr.",
        "sub": "Rank #34 All-Time \u2022 1982",
        "system": "ARCADE",
        "rank": 34,
        "review_score": "\u2605 9.1/10 Nintendo Power",
        "review_quote": "Acclaimed vine-climbing arcade classic rescuing father DK from Mario.",
        "icon": "\ud83d\udc12",
        "color": "#d97706",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "default_rom": "roms/Donkey Kong Jr. (W) [!].nes",
        "desc": "Swing between jungle vines and dodge Snapjaws! Play as Donkey Kong Jr. to unlock the cage and rescue your father in Mario\u2019s only turn as the antagonist.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Donkey Kong Jr. (W) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/donkey-kong-jr.png"
    },
    {
        "id": "excitebike",
        "match_keys": [
            "excitebike"
        ],
        "title": "Excitebike",
        "sub": "Rank #35 All-Time \u2022 1984",
        "system": "ARCADE",
        "rank": 35,
        "review_score": "\u2605 9.3/10 GameSpot",
        "review_quote": "High-flying motocross racing physics with custom track designer.",
        "icon": "\ud83c\udfcd\ufe0f",
        "color": "#e11d48",
        "gradient": "radial-gradient(circle at 75% 25%, #881337 0%, #06080e 70%)",
        "default_rom": "roms/Excitebike (JU) [!].nes",
        "desc": "Adrenaline motocross racing! Shift weight over huge jumps, manage engine turbo temperature, pass rivals, and construct your own custom dirt tracks.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Excitebike (JU) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/excitebike.png"
    },
    {
        "id": "balloon-fight",
        "match_keys": [
            "balloon-fight"
        ],
        "title": "Balloon Fight",
        "sub": "Rank #36 All-Time \u2022 1985",
        "system": "ARCADE",
        "rank": 36,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Satoru Iwata's physics programming gem; balloon popping reflex action.",
        "icon": "\ud83c\udf88",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)",
        "default_rom": "roms/Balloon Fight (E) [!].nes",
        "desc": "Flap wings to soar through electric storm skies! Pop enemy birds' balloons, avoid giant hungry piranhas in the lake, and master the endless Balloon Trip mode.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Balloon Fight (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/balloon-fight.png"
    },
    {
        "id": "ice-climber",
        "match_keys": [
            "ice-climber"
        ],
        "title": "Ice Climber",
        "sub": "Rank #37 All-Time \u2022 1985",
        "system": "PLATFORMER",
        "rank": 37,
        "review_score": "\u2605 9.0/10 Nintendo Power",
        "review_quote": "Vertical mountain-climbing platformer with eggplant bonuses.",
        "icon": "\u26cf\ufe0f",
        "color": "#38bdf8",
        "gradient": "radial-gradient(circle at 75% 25%, #0369a1 0%, #06080e 70%)",
        "default_rom": "roms/Ice Climber (UE) [!].nes",
        "desc": "Smash through icy ceilings with wooden mallets as Popo and Nana! Ascend 32 freezing peaks, dodge Topis and polar bears, and hitch a ride on the condor.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Ice Climber (UE) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/ice-climber.png"
    },
    {
        "id": "bomberman",
        "match_keys": [
            "bomberman"
        ],
        "title": "Bomberman",
        "sub": "Rank #38 All-Time \u2022 1985",
        "system": "ARCADE",
        "rank": 38,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Hudson Soft's grid-based tactical bomb maze strategy game.",
        "icon": "\ud83d\udca3",
        "color": "#4f46e5",
        "gradient": "radial-gradient(circle at 75% 25%, #312e81 0%, #06080e 70%)",
        "default_rom": "roms/Bomberman (U) [!].nes",
        "desc": "Drop timed explosives to blast through maze walls and vaporize subterranean monsters! Collect fire upgrades and detonators to find the exit door.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Bomberman (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/bomberman.png"
    },
    {
        "id": "ghosts-n-goblins",
        "match_keys": [
            "ghosts-n-goblins",
            "ghosts-and-goblins",
            "makaimura"
        ],
        "title": "Ghosts 'n Goblins",
        "sub": "Rank #39 All-Time \u2022 1986",
        "system": "ACTION",
        "rank": 39,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Capcom's legendary gothic knight challenge with Arthur's lance & armor.",
        "icon": "\ud83d\udee1\ufe0f",
        "color": "#a855f7",
        "gradient": "radial-gradient(circle at 75% 25%, #581c87 0%, #06080e 70%)",
        "default_rom": "roms/Ghosts 'n Goblins (U) [!].nes",
        "desc": "Brave the Haunted Graveyard as Sir Arthur! Fling lances, daggers, and holy water at zombies, demons, and the Red Arremer to rescue Princess Prin-Prin.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Ghosts 'n Goblins (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/ghosts-n-goblins.png"
    },
    {
        "id": "double-dragon",
        "match_keys": [
            "double-dragon"
        ],
        "title": "Double Dragon",
        "sub": "Rank #40 All-Time \u2022 1987",
        "system": "ACTION",
        "rank": 40,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "The revolutionary martial arts beat-'em-up that popularized the genre.",
        "icon": "\ud83e\udd4b",
        "color": "#ea580c",
        "gradient": "radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)",
        "default_rom": "roms/Double Dragon (E) [!].nes",
        "desc": "Fight through post-apocalyptic streets as martial artist Billy Lee! Level up punches, kicks, and roundhouses to take down the Shadow Warriors and Machine Gun Willy.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Double Dragon (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/double-dragon.png"
    },
    {
        "id": "final-fantasy",
        "match_keys": [
            "final-fantasy"
        ],
        "title": "Final Fantasy",
        "sub": "Rank #41 All-Time \u2022 1987",
        "system": "ADVENTURE",
        "rank": 41,
        "review_score": "\u2605 9.5/10 IGN",
        "review_quote": "Hironobu Sakaguchi's legendary RPG that launched a global franchise.",
        "icon": "\u2728",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1e3a8a 0%, #06080e 70%)",
        "default_rom": "roms/Final Fantasy (U) [!].nes",
        "desc": "Form your four Warriors of Light! Journey across land, sea, and air in airships to restore the light to Earth, Fire, Water, and Wind orbs and vanquish Chaos.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Final Fantasy (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/final-fantasy.png"
    },
    {
        "id": "dragon-warrior",
        "match_keys": [
            "dragon-warrior",
            "dragon-quest"
        ],
        "title": "Dragon Warrior (Dragon Quest)",
        "sub": "Rank #42 All-Time \u2022 1986",
        "system": "ADVENTURE",
        "rank": 42,
        "review_score": "\u2605 9.3/10 Nintendo Power",
        "review_quote": "The grandfather of JRPGs; Akira Toriyama art and turn-based combat.",
        "icon": "\ud83d\udc09",
        "color": "#f97316",
        "gradient": "radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)",
        "default_rom": "roms/Dragon Warrior (U) [!].nes",
        "desc": "Heed King Lorik\u2019s plea as the descendant of Erdrick! Slay slimes, explore dark dungeons with torches, recover the Ball of Light, and slay the Dragonlord.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Dragon Warrior (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/dragon-warrior.png"
    },
    {
        "id": "metal-gear",
        "match_keys": [
            "metal-gear"
        ],
        "title": "Metal Gear",
        "sub": "Rank #43 All-Time \u2022 1987",
        "system": "ACTION",
        "rank": 43,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Hideo Kojima's pioneering stealth infiltration action landmark.",
        "icon": "\ud83d\udce6",
        "color": "#14b8a6",
        "gradient": "radial-gradient(circle at 75% 25%, #134e4a 0%, #06080e 70%)",
        "default_rom": "roms/Metal Gear (U) [!].nes",
        "desc": "Infiltrate Outer Heaven as rookie operative Solid Snake! Evade laser tripwires and camera surveillance, communicate via transceiver, and destroy Metal Gear.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Metal Gear (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/metal-gear.png"
    },
    {
        "id": "kid-icarus",
        "match_keys": [
            "kid-icarus"
        ],
        "title": "Kid Icarus",
        "sub": "Rank #44 All-Time \u2022 1986",
        "system": "PLATFORMER",
        "rank": 44,
        "review_score": "\u2605 9.1/10 Nintendo Power",
        "review_quote": "Vertical Greek mythology quest with Pit's bow and underworld escape.",
        "icon": "\ud83c\udff9",
        "color": "#a855f7",
        "gradient": "radial-gradient(circle at 75% 25%, #6b21a8 0%, #06080e 70%)",
        "default_rom": "roms/Kid Icarus (UE) [!].nes",
        "desc": "Ascend from the depths of the Underworld to Angel Land! Fire sacred arrows, collect hearts to buy chalices, recover the Three Sacred Treasures, and defeat Medusa.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Kid Icarus (UE) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/kid-icarus.png"
    },
    {
        "id": "ducktales-2",
        "match_keys": [
            "ducktales-2",
            "duck-tales-2",
            "ducktales2"
        ],
        "title": "DuckTales 2",
        "sub": "Rank #45 All-Time \u2022 1993",
        "system": "PLATFORMER",
        "rank": 45,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Rare high-production Capcom sequel with hook-pulling treasure hunts.",
        "icon": "\ud83e\udd86",
        "color": "#fbbf24",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "default_rom": "roms/DuckTales 2 (U) [!].nes",
        "desc": "Scrooge McDuck embarks on a worldwide quest for the lost treasure of McDuck! Use the newly enhanced cane pull to yank heavy switches and uncover 7 secret map pieces.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/DuckTales 2 (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/ducktales-2.png"
    },
    {
        "id": "chip-n-dale-2",
        "match_keys": [
            "chip-n-dale-2",
            "rescue-rangers-2",
            "chip-and-dale-2"
        ],
        "title": "Chip 'n Dale Rescue Rangers 2",
        "sub": "Rank #46 All-Time \u2022 1993",
        "system": "PLATFORMER",
        "rank": 46,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Enhanced co-op mechanics and gorgeous 8-bit Capcom animations.",
        "icon": "\ud83d\udc3f\ufe0f",
        "color": "#f97316",
        "gradient": "radial-gradient(circle at 75% 25%, #9a3412 0%, #06080e 70%)",
        "default_rom": "roms/Chip 'n Dale Rescue Rangers 2 (U) [!].nes",
        "desc": "Fat Cat escapes prison to steal the Urn of the Pharaoh! Team up for improved co-op throwing, secret bonus rooms, and boss battles at the harbor and amusement park.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Chip 'n Dale Rescue Rangers 2 (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/chip-n-dale-2.png"
    },
    {
        "id": "mega-man-5",
        "match_keys": [
            "mega-man-5",
            "megaman-5",
            "rockman-5",
            "megaman5"
        ],
        "title": "Mega Man 5",
        "sub": "Rank #47 All-Time \u2022 1992",
        "system": "ACTION",
        "rank": 47,
        "review_score": "\u2605 9.1/10 IGN",
        "review_quote": "Super Arrow, Beat the bird, and gravity-flipping stages.",
        "icon": "\ud83e\udd16",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #0e7490 0%, #06080e 70%)",
        "default_rom": "roms/Mega Man 5 (J) [!].nes",
        "desc": "When Proto Man turns rogue, Mega Man enters the fray with an expanded Mega Buster and robot bird companion Beat! Flip gravity in Gravity Man\u2019s stage.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Mega Man 5 (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mega-man-5.png"
    },
    {
        "id": "mega-man-6",
        "match_keys": [
            "mega-man-6",
            "megaman-6",
            "rockman-6",
            "megaman6"
        ],
        "title": "Mega Man 6",
        "sub": "Rank #48 All-Time \u2022 1993",
        "system": "ACTION",
        "rank": 48,
        "review_score": "\u2605 9.1/10 IGN",
        "review_quote": "Jet Adaptor and Power Adaptor armor transformations.",
        "icon": "\ud83e\udd16",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1d4ed8 0%, #06080e 70%)",
        "default_rom": "roms/Mega Man 6 (J) [!].nes",
        "desc": "Fuse with Rush to unlock Jet Mega Man for flight and Power Mega Man to smash cracked walls! Challenge the mysterious Mr. X and his 8 international Robot Masters.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Mega Man 6 (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mega-man-6.png"
    },
    {
        "id": "ninja-gaiden-2",
        "match_keys": [
            "ninja-gaiden-ii",
            "ninja-gaiden-2",
            "dark-sword-of-chaos",
            "ninjagaiden2"
        ],
        "title": "Ninja Gaiden II: The Dark Sword of Chaos",
        "sub": "Rank #49 All-Time \u2022 1990",
        "system": "ACTION",
        "rank": 49,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "Shadow clone ninja mechanics and cinematic cutscenes.",
        "icon": "\ud83e\udd77",
        "color": "#dc2626",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "default_rom": "roms/Ninja Gaiden II (U) [!].nes",
        "desc": "Ryu Hayabusa returns to battle the evil emperor Ashtar! Summon indestructible shadow clones that mimic your ninja arts, and scale walls with lightning precision.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Ninja Gaiden II (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/ninja-gaiden-2.png"
    },
    {
        "id": "ninja-gaiden-3",
        "match_keys": [
            "ninja-gaiden-iii",
            "ninja-gaiden-3",
            "ancient-ship-of-doom",
            "ninjagaiden3"
        ],
        "title": "Ninja Gaiden III: The Ancient Ship of Doom",
        "sub": "Rank #50 All-Time \u2022 1991",
        "system": "ACTION",
        "rank": 50,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Polished trilogy finale with sword power upgrades and overhead climbing.",
        "icon": "\ud83e\udd77",
        "color": "#b91c1c",
        "gradient": "radial-gradient(circle at 75% 25%, #450a0a 0%, #06080e 70%)",
        "default_rom": "roms/Ninja Gaiden III (U) [!].nes",
        "desc": "The thrilling climax to the 8-bit trilogy! Framed for the murder of Irene Lew, Ryu must clear his name using enhanced jumping arcs, extended sword beams, and overhead wire climbing.",
        "top20": true,
        "top100": true,
        "top50": true,
        "hall_of_fame": true,
        "rom": "roms/Ninja Gaiden III (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/ninja-gaiden-3.png"
    },
    {
        "id": "batman",
        "match_keys": [
            "batman (e)",
            "batman"
        ],
        "title": "Batman: The Video Game",
        "sub": "Rank #51 All-Time \u2022 1989",
        "system": "ACTION",
        "rank": 51,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "Sunsoft\u2019s technical tour-de-force with precision wall-jumps and legendary soundtrack.",
        "icon": "\ud83e\udd87",
        "color": "#818cf8",
        "gradient": "radial-gradient(circle at 75% 25%, #312e81 0%, #06080e 70%)",
        "default_rom": "roms/Batman (E) [!].nes",
        "desc": "Master the Caped Crusader\u2019s wall-bounding agility, Batarangs, and bat-discs across Gotham\u2019s chemical plant to defeat the Joker.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Batman (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/batman.png"
    },
    {
        "id": "dr-mario",
        "match_keys": [
            "dr-mario",
            "dr.-mario"
        ],
        "title": "Dr. Mario",
        "sub": "Rank #52 All-Time \u2022 1990",
        "system": "PUZZLE",
        "rank": 52,
        "review_score": "\u2605 9.3/10 GameSpot",
        "review_quote": "Gunpei Yokoi\u2019s iconic falling-pill puzzle sensation with infectious Fever theme.",
        "icon": "\ud83d\udc8a",
        "color": "#ec4899",
        "gradient": "radial-gradient(circle at 75% 25%, #831843 0%, #06080e 70%)",
        "default_rom": "roms/Dr. Mario (E) [!].nes",
        "desc": "Rotate red, yellow, and blue vitamin capsules to neutralize viruses in the bottle! Features legendary 2-player battle mode.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Dr. Mario (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/dr-mario.png"
    },
    {
        "id": "crystalis",
        "match_keys": [
            "crystalis"
        ],
        "title": "Crystalis",
        "sub": "Rank #53 All-Time \u2022 1990",
        "system": "ADVENTURE",
        "rank": 53,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "Post-apocalyptic action-RPG masterpiece with elemental charging swords.",
        "icon": "\u2694\ufe0f",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #064e3b 0%, #06080e 70%)",
        "default_rom": "roms/Crystalis (U) [!].nes",
        "desc": "Awaken from cryogenic sleep 100 years after nuclear apocalypse! Combine the Swords of Wind, Fire, Water, and Thunder to construct Crystalis.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Crystalis (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/crystalis.png"
    },
    {
        "id": "jackal",
        "match_keys": [
            "jackal"
        ],
        "title": "Jackal",
        "sub": "Rank #54 All-Time \u2022 1988",
        "system": "ACTION",
        "rank": 54,
        "review_score": "\u2605 9.3/10 Nintendo Power",
        "review_quote": "Konami\u2019s adrenaline top-down armed jeep hostage rescue run-and-gun.",
        "icon": "\ud83d\ude99",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "default_rom": "roms/Jackal (U) [!].nes",
        "desc": "Drive an armed military jeep behind enemy lines! Blast prison camps, rescue POWs, upgrade machine guns to homing missiles, and reach the chopper.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Jackal (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/jackal.png"
    },
    {
        "id": "shatterhand",
        "match_keys": [
            "shatterhand"
        ],
        "title": "Shatterhand",
        "sub": "Rank #55 All-Time \u2022 1991",
        "system": "ACTION",
        "rank": 55,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Natsume\u2019s cyberpunk bionic brawler with robotic satellite attack drones.",
        "icon": "\ud83d\udc4a",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #155e75 0%, #06080e 70%)",
        "default_rom": "roms/Shatterhand (E) [!].nes",
        "desc": "Equip cybernetic fists to shatter armored tanks and deflect bullets! Collect Greek letters to assemble 8 specialized robotic satellite partners.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Shatterhand (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/shatterhand.png"
    },
    {
        "id": "journey-to-silius",
        "match_keys": [
            "journey-to-silius",
            "silius"
        ],
        "title": "Journey to Silius",
        "sub": "Rank #56 All-Time \u2022 1990",
        "system": "ACTION",
        "rank": 56,
        "review_score": "\u2605 9.2/10 GameSpot",
        "review_quote": "Sunsoft\u2019s thumping industrial synth basslines and heavy artillery mechanics.",
        "icon": "\ud83d\udd2b",
        "color": "#6366f1",
        "gradient": "radial-gradient(circle at 75% 25%, #3730a3 0%, #06080e 70%)",
        "default_rom": "roms/Journey to Silius (E) [!].nes",
        "desc": "Avenge your father\u2019s space colony! Wield shotguns, laser rifles, homing missiles, and grenade launchers against android terror syndicates.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Journey to Silius (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/journey-to-silius.png"
    },
    {
        "id": "adventure-island-2",
        "match_keys": [
            "adventure-island-ii",
            "adventure-island-2"
        ],
        "title": "Adventure Island II",
        "sub": "Rank #57 All-Time \u2022 1991",
        "system": "PLATFORMER",
        "rank": 57,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Master Higgins riding 4 rideable dinosaur companions with elemental breath.",
        "icon": "\ud83e\udd95",
        "color": "#84cc16",
        "gradient": "radial-gradient(circle at 75% 25%, #365314 0%, #06080e 70%)",
        "default_rom": "roms/Adventure Island II (E) [!].nes",
        "desc": "Ride blue camptosaurs on water and pterodactyls in the sky! Explore 8 tropical archipelago islands with inventory weapon storage.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Adventure Island II (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/adventure-island-2.png"
    },
    {
        "id": "faxanadu",
        "match_keys": [
            "faxanadu"
        ],
        "title": "Faxanadu",
        "sub": "Rank #58 All-Time \u2022 1987",
        "system": "ADVENTURE",
        "rank": 58,
        "review_score": "\u2605 9.1/10 Nintendo Power",
        "review_quote": "Gothic dark fantasy sidescroller climbing the Elven World Tree.",
        "icon": "\ud83c\udf33",
        "color": "#14b8a6",
        "gradient": "radial-gradient(circle at 75% 25%, #134e4a 0%, #06080e 70%)",
        "default_rom": "roms/Faxanadu (E) [!].nes",
        "desc": "Climb the colossal World Tree Eolis! Buy magical spells, battle grotesque Evil Ones, and cleanse the poisoned mountain spring water.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Faxanadu (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/faxanadu.png"
    },
    {
        "id": "rygar",
        "match_keys": [
            "rygar"
        ],
        "title": "Rygar",
        "sub": "Rank #59 All-Time \u2022 1987",
        "system": "ADVENTURE",
        "rank": 59,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Tecmo\u2019s mythological action adventure wielding the spinning Diskerarm shield.",
        "icon": "\ud83d\udee1\ufe0f",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)",
        "default_rom": "roms/Rygar (E) [!].nes",
        "desc": "Wield the legendary Diskerarm on a chained spool! Travel across overhead plains and side-scrolling caverns to depose the cruel beast King Ligar.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Rygar (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/rygar.png"
    },
    {
        "id": "mighty-final-fight",
        "match_keys": [
            "mighty-final-fight"
        ],
        "title": "Mighty Final Fight",
        "sub": "Rank #60 All-Time \u2022 1993",
        "system": "ACTION",
        "rank": 60,
        "review_score": "\u2605 9.1/10 IGN",
        "review_quote": "Capcom\u2019s comedic SD beat-\u2019em-up with Cody, Guy, Haggar, and RPG experience levels.",
        "icon": "\ud83e\udd4a",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #991b1b 0%, #06080e 70%)",
        "default_rom": "roms/Mighty Final Fight (E) [!].nes",
        "desc": "Metro City reimagined in adorable chibi arcade action! Level up your fighter to unlock devastating Tornado Kicks and Super Piledrivers.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Mighty Final Fight (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mighty-final-fight.png"
    },
    {
        "id": "mario-bros",
        "match_keys": [
            "mario-bros"
        ],
        "title": "Mario Bros.",
        "sub": "Rank #61 All-Time \u2022 1983",
        "system": "ARCADE",
        "rank": 61,
        "review_score": "\u2605 9.2/10 All-Time",
        "review_quote": "Where Mario and Luigi first teamed up bouncing slip-ice pests from sewer pipes.",
        "icon": "\ud83e\udea0",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1e3a8a 0%, #06080e 70%)",
        "default_rom": "roms/Mario Bros. (E) [!].nes",
        "desc": "Bump sewer pipes from below to flip Shellcreepers and Sidesteppers on their backs! Hit the POW block for room-clearing shockwaves.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Mario Bros. (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mario-bros.png"
    },
    {
        "id": "duck-hunt",
        "match_keys": [
            "duck-hunt"
        ],
        "title": "Duck Hunt",
        "sub": "Rank #62 All-Time \u2022 1984",
        "system": "ARCADE",
        "rank": 62,
        "review_score": "\u2605 9.2/10 All-Time",
        "review_quote": "The light-gun phenomenon that defined the generation; laughing hunting hound.",
        "icon": "\ud83d\udc15",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #854d0e 0%, #06080e 70%)",
        "default_rom": "roms/Duck Hunt (W) [!].nes",
        "desc": "Aim and fire at clay pigeons and flying mallards! Watch out for the iconic laughing dog when you miss.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Duck Hunt (W) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/duck-hunt.png"
    },
    {
        "id": "popeye",
        "match_keys": [
            "popeye"
        ],
        "title": "Popeye",
        "sub": "Rank #63 All-Time \u2022 1983",
        "system": "ARCADE",
        "rank": 63,
        "review_score": "\u2605 9.0/10 All-Time",
        "review_quote": "Miyamoto\u2019s beloved arcade spinach chaser dodging Brutus and Sea Hag skulls.",
        "icon": "\u2693",
        "color": "#0284c7",
        "gradient": "radial-gradient(circle at 75% 25%, #075985 0%, #06080e 70%)",
        "default_rom": "roms/Popeye (W) [!].nes",
        "desc": "Catch hearts, musical notes, and letters tossed by Olive Oyl while dodging Brutus across dockside platforms! Grab spinach to punch rivals into the sea.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Popeye (W) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/popeye.png"
    },
    {
        "id": "kung-fu",
        "match_keys": [
            "kung-fu",
            "spartan-x"
        ],
        "title": "Kung Fu",
        "sub": "Rank #64 All-Time \u2022 1985",
        "system": "ACTION",
        "rank": 64,
        "review_score": "\u2605 9.1/10 All-Time",
        "review_quote": "The original side-scrolling martial arts brawler scaling the 5-floor pagoda.",
        "icon": "\ud83e\udd4b",
        "color": "#dc2626",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "default_rom": "roms/Kung Fu (E) [!].nes",
        "desc": "Punch and jump-kick through 5 levels of the Devil\u2019s Temple as Thomas! Defeat the Boomerang Fighter and Giant to rescue Sylvia.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Kung Fu (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/kung-fu.png"
    },
    {
        "id": "wrecking-crew",
        "match_keys": [
            "wrecking-crew"
        ],
        "title": "Wrecking Crew",
        "sub": "Rank #65 All-Time \u2022 1985",
        "system": "ARCADE",
        "rank": 65,
        "review_score": "\u2605 9.0/10 Nintendo Power",
        "review_quote": "Demolition puzzle action featuring Mario, the Golden Hammer, and Foreman Spike.",
        "icon": "\ud83d\udd28",
        "color": "#ea580c",
        "gradient": "radial-gradient(circle at 75% 25%, #9a3412 0%, #06080e 70%)",
        "default_rom": "roms/Wrecking Crew (W) [!].nes",
        "desc": "Demolish brick walls, stone pillars, and ladders with your heavy hammer across 100 industrial construction puzzle stages.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Wrecking Crew (W) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/wrecking-crew.png"
    },
    {
        "id": "donkey-kong-3",
        "match_keys": [
            "donkey-kong-3"
        ],
        "title": "Donkey Kong 3",
        "sub": "Rank #66 All-Time \u2022 1983",
        "system": "ARCADE",
        "rank": 66,
        "review_score": "\u2605 8.9/10 All-Time",
        "review_quote": "Stanley the Bugman defending botanical greenhouses with insecticide sprays.",
        "icon": "\ud83d\udc1d",
        "color": "#ca8a04",
        "gradient": "radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)",
        "default_rom": "roms/Donkey Kong 3 (W) [!].nes",
        "desc": "Spray insecticide upward to push Donkey Kong into the rafters while defending your precious greenhouse flowers from Queen Buzzy swarms.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Donkey Kong 3 (W) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/donkey-kong-3.png"
    },
    {
        "id": "mach-rider",
        "match_keys": [
            "mach-rider"
        ],
        "title": "Mach Rider",
        "sub": "Rank #67 All-Time \u2022 1985",
        "system": "ARCADE",
        "rank": 67,
        "review_score": "\u2605 8.9/10 Nintendo Power",
        "review_quote": "Post-apocalyptic motorcycle combat racing with rear-view mirrors and gears.",
        "icon": "\ud83c\udfcd\ufe0f",
        "color": "#b91c1c",
        "gradient": "radial-gradient(circle at 75% 25%, #450a0a 0%, #06080e 70%)",
        "default_rom": "roms/Mach Rider (E) [!].nes",
        "desc": "Shift through 4 motorcycle gears across nuclear wasteland highways! Blast Quadrunners with twin mounted machine guns.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Mach Rider (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mach-rider.png"
    },
    {
        "id": "battle-city",
        "match_keys": [
            "battle-city"
        ],
        "title": "Battle City",
        "sub": "Rank #68 All-Time \u2022 1985",
        "system": "ACTION",
        "rank": 68,
        "review_score": "\u2605 9.2/10 Masterpiece",
        "review_quote": "Namco\u2019s tactical tank base defense with destructible masonry and power stars.",
        "icon": "\ud83d\udee1\ufe0f",
        "color": "#65a30d",
        "gradient": "radial-gradient(circle at 75% 25%, #365314 0%, #06080e 70%)",
        "default_rom": "roms/Battle City (J) [!].nes",
        "desc": "Defend the golden phoenix base! Blast through brick barricades, collect grenade power-ups, and eliminate 20 invading enemy tanks.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Battle City (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/battle-city.png"
    },
    {
        "id": "dig-dug",
        "match_keys": [
            "dig-dug",
            "digdug"
        ],
        "title": "Dig Dug",
        "sub": "Rank #69 All-Time \u2022 1982",
        "system": "ARCADE",
        "rank": 69,
        "review_score": "\u2605 9.3/10 All-Time",
        "review_quote": "Subterranean pump inflation and rock-dropping arcade maze masterpiece.",
        "icon": "\u26cf\ufe0f",
        "color": "#0284c7",
        "gradient": "radial-gradient(circle at 75% 25%, #0c4a6e 0%, #06080e 70%)",
        "default_rom": "roms/Dig Dug (J) [!].nes",
        "desc": "Dig dirt tunnels to trap Pookas and Fygars! Pump enemies full of air until they pop, or crush them under giant falling boulders.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Dig Dug (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/dig-dug.png"
    },
    {
        "id": "lode-runner",
        "match_keys": [
            "lode-runner"
        ],
        "title": "Lode Runner",
        "sub": "Rank #70 All-Time \u2022 1983",
        "system": "PUZZLE",
        "rank": 70,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Hudson Soft\u2019s gold-snatching, brick-drilling strategic platform puzzler.",
        "icon": "\ud83e\uddf1",
        "color": "#f97316",
        "gradient": "radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)",
        "default_rom": "roms/Lode Runner (J) [!].nes",
        "desc": "Dig holes to trap pursuers and snatch all gold chests across 50 brain-teasing brick maze stages to unlock the escape ladder.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Lode Runner (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/lode-runner.png"
    },
    {
        "id": "1943-battle-of-midway",
        "match_keys": [
            "1943",
            "battle-of-midway"
        ],
        "title": "1943: The Battle of Midway",
        "sub": "Rank #71 All-Time \u2022 1988",
        "system": "SHOOTER",
        "rank": 71,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "WWII naval airstrike shooter with P-38 Lightning loops and mega-bomb tsunamis.",
        "icon": "\u2708\ufe0f",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1d4ed8 0%, #06080e 70%)",
        "default_rom": "roms/1943 (U) [!].nes",
        "desc": "Fly the twin-fuselage P-38 Lightning across the Pacific! Loop through enemy flak and trigger tsunami bombs to sink the battleship Yamato.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/1943 (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/1943-battle-of-midway.png"
    },
    {
        "id": "1942",
        "match_keys": [
            "1942"
        ],
        "title": "1942",
        "sub": "Rank #72 All-Time \u2022 1985",
        "system": "SHOOTER",
        "rank": 72,
        "review_score": "\u2605 9.0/10 All-Time",
        "review_quote": "Capcom\u2019s foundational aerial Pacific dogfight arcade pioneer.",
        "icon": "\ud83d\udee9\ufe0f",
        "color": "#0ea5e9",
        "gradient": "radial-gradient(circle at 75% 25%, #0369a1 0%, #06080e 70%)",
        "default_rom": "roms/1942 (JU) [!].nes",
        "desc": "Capcom\u2019s historic aerial pioneer! Dodge incoming Zero squadrons with loop-the-loops and reach Tokyo across 32 intense dogfight stages.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/1942 (JU) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/1942.png"
    },
    {
        "id": "star-force",
        "match_keys": [
            "star-force"
        ],
        "title": "Star Force",
        "sub": "Rank #73 All-Time \u2022 1985",
        "system": "SHOOTER",
        "rank": 73,
        "review_score": "\u2605 9.1/10 All-Time",
        "review_quote": "Tecmo\u2019s defining high-velocity space shooter defending against the floating megalopolis.",
        "icon": "\ud83d\ude80",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #5b21b6 0%, #06080e 70%)",
        "default_rom": "roms/Star Force (E) [!].nes",
        "desc": "Pilot the Final Star through 26 alphabetical target zones! Destroy Greek-letter command targets to claim million-point bonuses.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Star Force (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/star-force.png"
    },
    {
        "id": "xevious",
        "match_keys": [
            "xevious"
        ],
        "title": "Xevious",
        "sub": "Rank #74 All-Time \u2022 1982",
        "system": "SHOOTER",
        "rank": 74,
        "review_score": "\u2605 9.1/10 All-Time",
        "review_quote": "The father of vertical scrolling shooters with dual aerial and ground targeting.",
        "icon": "\ud83d\udef8",
        "color": "#6366f1",
        "gradient": "radial-gradient(circle at 75% 25%, #3730a3 0%, #06080e 70%)",
        "default_rom": "roms/Xevious (E) [!].nes",
        "desc": "Fire air lasers at Toroid rings while dropping Blaster bombs onto ground bases and giant floating Andor Genesis motherships.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Xevious (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/xevious.png"
    },
    {
        "id": "twinbee",
        "match_keys": [
            "twinbee"
        ],
        "title": "TwinBee",
        "sub": "Rank #75 All-Time \u2022 1985",
        "system": "SHOOTER",
        "rank": 75,
        "review_score": "\u2605 9.0/10 GameSpot",
        "review_quote": "Konami\u2019s cute-\u2019em-up bell-juggling vertical shooter phenomenon.",
        "icon": "\ud83d\udd14",
        "color": "#ec4899",
        "gradient": "radial-gradient(circle at 75% 25%, #9d174d 0%, #06080e 70%)",
        "default_rom": "roms/TwinBee (J) [!].nes",
        "desc": "Shoot cloud banks to reveal golden bells, then juggle them with blaster fire to shift colors between speed, twin cannons, and protective shields.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/TwinBee (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/twinbee.png"
    },
    {
        "id": "star-soldier",
        "match_keys": [
            "star-soldier"
        ],
        "title": "Star Soldier",
        "sub": "Rank #76 All-Time \u2022 1986",
        "system": "SHOOTER",
        "rank": 76,
        "review_score": "\u2605 9.1/10 Nintendo Power",
        "review_quote": "Hudson Soft\u2019s national caravan competition vertical speed shooter.",
        "icon": "\u26a1",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #854d0e 0%, #06080e 70%)",
        "default_rom": "roms/Star Soldier (J) [!].nes",
        "desc": "Power up the Caesar starfighter with 5-way spread beams! Fly beneath surface space stations to sneak attack hidden Star Brain bosses.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Star Soldier (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/star-soldier.png"
    },
    {
        "id": "gun-nac",
        "match_keys": [
            "gun-nac",
            "gunnac"
        ],
        "title": "Gun-Nac",
        "sub": "Rank #77 All-Time \u2022 1990",
        "system": "SHOOTER",
        "rank": 77,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "Compile\u2019s speed masterpiece; widely acclaimed as the finest vertical shooter on NES.",
        "icon": "\ud83d\udca5",
        "color": "#f97316",
        "gradient": "radial-gradient(circle at 75% 25%, #9a3412 0%, #06080e 70%)",
        "default_rom": "roms/Gun-Nac (J) [!].nes",
        "desc": "Pure adrenaline vertical shooting! Cycle between 5 weapon systems, buy upgrades at galactic shops, and release blizzard screen-clearing bombs.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Gun-Nac (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/gun-nac.png"
    },
    {
        "id": "mappy",
        "match_keys": [
            "mappy"
        ],
        "title": "Mappy",
        "sub": "Rank #78 All-Time \u2022 1983",
        "system": "ARCADE",
        "rank": 78,
        "review_score": "\u2605 9.0/10 All-Time",
        "review_quote": "Trampoline-bouncing micro police mouse recovering stolen loot from Meowkies.",
        "icon": "\ud83d\udc2d",
        "color": "#14b8a6",
        "gradient": "radial-gradient(circle at 75% 25%, #0f766e 0%, #06080e 70%)",
        "default_rom": "roms/Mappy (J) [!].nes",
        "desc": "Bounce on trampolines to evade Nyamco the cat burglar! Open microwave doors to blast cat gangs with sonic shockwaves and retrieve radios and safes.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Mappy (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/mappy.png"
    },
    {
        "id": "arkanoid",
        "match_keys": [
            "arkanoid"
        ],
        "title": "Arkanoid",
        "sub": "Rank #79 All-Time \u2022 1986",
        "system": "ARCADE",
        "rank": 79,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Taito\u2019s paddle breakout classic with Vaus lasers and multi-ball energy capsules.",
        "icon": "\ud83e\uddf1",
        "color": "#a855f7",
        "gradient": "radial-gradient(circle at 75% 25%, #6b21a8 0%, #06080e 70%)",
        "default_rom": "roms/Arkanoid (J) [!].nes",
        "desc": "Command the Vaus paddle ship to shatter cosmic block walls! Collect falling energy capsules to gain laser blasters, sticky pads, and tri-balls.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Arkanoid (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/arkanoid.png"
    },
    {
        "id": "gimmick",
        "match_keys": [
            "gimmick"
        ],
        "title": "Gimmick!",
        "sub": "Rank #80 All-Time \u2022 1992",
        "system": "PLATFORMER",
        "rank": 80,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "Sunsoft\u2019s holy grail physics platformer; ride bouncy star projectiles.",
        "icon": "\u2b50",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #047857 0%, #06080e 70%)",
        "default_rom": "roms/Gimmick! (J) [!].nes",
        "desc": "Sunsoft\u2019s legendary technical showcase! Charge and fling star projectiles that bounce off slopes with realistic momentum to reach secret exits.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Gimmick! (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/gimmick.png"
    },
    {
        "id": "tecmo-super-bowl",
        "match_keys": [
            "tecmo-super-bowl"
        ],
        "title": "Tecmo Super Bowl",
        "sub": "Rank #81 All-Time \u2022 1991",
        "system": "FIGHTING",
        "rank": 81,
        "review_score": "\u2605 9.5/10 IGN",
        "review_quote": "The greatest 8-bit sports game ever created; real NFL rosters and Bo Jackson!",
        "icon": "\ud83c\udfc8",
        "color": "#22c55e",
        "gradient": "radial-gradient(circle at 75% 25%, #14532d 0%, #06080e 70%)",
        "default_rom": "roms/Tecmo Super Bowl (J) [!].nes",
        "desc": "The definitive 8-bit gridiron classic! Play with all 28 NFL teams, track real season statistics, and run rampant with the unstoppable Bo Jackson.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Tecmo Super Bowl (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/tecmo-super-bowl.png"
    },
    {
        "id": "blades-of-steel",
        "match_keys": [
            "blades-of-steel"
        ],
        "title": "Blades of Steel",
        "sub": "Rank #82 All-Time \u2022 1988",
        "system": "FIGHTING",
        "rank": 82,
        "review_score": "\u2605 9.3/10 GameSpot",
        "review_quote": "\u201cWith the pass!\u201d \u2014 Konami\u2019s hard-hitting hockey with on-ice glove-dropping brawls.",
        "icon": "\ud83c\udfd2",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)",
        "default_rom": "roms/Blades of Steel (E) [!].nes",
        "desc": "Konami\u2019s hockey sensation! Execute fast one-timers, drop the gloves for on-ice bare-knuckle fights, and enjoy the intermission mini-games.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Blades of Steel (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/blades-of-steel.png"
    },
    {
        "id": "tecmo-bowl",
        "match_keys": [
            "tecmo-bowl"
        ],
        "title": "Tecmo Bowl",
        "sub": "Rank #83 All-Time \u2022 1989",
        "system": "FIGHTING",
        "rank": 83,
        "review_score": "\u2605 9.2/10 Nintendo Power",
        "review_quote": "Foundational arcade gridiron football with lightning cutscene collisions.",
        "icon": "\ud83c\udfc8",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)",
        "default_rom": "roms/Tecmo Bowl (J) [!].nes",
        "desc": "Choose from 4 offensive plays and break through the line of scrimmage in the arcade football classic that defined competitive multiplayer.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Tecmo Bowl (J) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/tecmo-bowl.png"
    },
    {
        "id": "double-dribble",
        "match_keys": [
            "double-dribble"
        ],
        "title": "Double Dribble",
        "sub": "Rank #84 All-Time \u2022 1987",
        "system": "ARCADE",
        "rank": 84,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Revolutionary full-court basketball with cinematic slow-motion slam dunks.",
        "icon": "\ud83c\udfc0",
        "color": "#f97316",
        "gradient": "radial-gradient(circle at 75% 25%, #c2410c 0%, #06080e 70%)",
        "default_rom": "roms/Double Dribble (E) [!].nes",
        "desc": "Drive into the lane and trigger cinematic 8-bit slam dunk cutscenes with authentic crowd cheers in Konami\u2019s iconic basketball showdown.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Double Dribble (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/double-dribble.png"
    },
    {
        "id": "ice-hockey",
        "match_keys": [
            "ice-hockey"
        ],
        "title": "Ice Hockey",
        "sub": "Rank #85 All-Time \u2022 1988",
        "system": "ARCADE",
        "rank": 85,
        "review_score": "\u2605 9.2/10 Nintendo Power",
        "review_quote": "Assemble tactical teams of skinny speedsters, medium wings, and heavy enforcers.",
        "icon": "\ud83c\udfd2",
        "color": "#38bdf8",
        "gradient": "radial-gradient(circle at 75% 25%, #0369a1 0%, #06080e 70%)",
        "default_rom": "roms/Ice Hockey (E) [!].nes",
        "desc": "Mix and match body types to balance agility, checking power, and slap shot speed across tournament rink faceoffs.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Ice Hockey (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/ice-hockey.png"
    },
    {
        "id": "paperboy",
        "match_keys": [
            "paperboy"
        ],
        "title": "Paperboy",
        "sub": "Rank #86 All-Time \u2022 1988",
        "system": "ARCADE",
        "rank": 86,
        "review_score": "\u2605 9.0/10 All-Time",
        "review_quote": "Isometric obstacle delivery avoiding runaway lawnmowers, grim reapers, and dogs.",
        "icon": "\ud83d\udcf0",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "default_rom": "roms/Paperboy (E) [!].nes",
        "desc": "Ride your bicycle through suburban obstacle courses! Toss morning papers into subscriber mailboxes while dodging runaway cars and lawnmowers.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Paperboy (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/paperboy.png"
    },
    {
        "id": "north-and-south",
        "match_keys": [
            "north-and-south",
            "north-south"
        ],
        "title": "North & South",
        "sub": "Rank #87 All-Time \u2022 1990",
        "system": "ADVENTURE",
        "rank": 87,
        "review_score": "\u2605 9.1/10 IGN",
        "review_quote": "Infogrames tactical strategy combining board movement and real-time fort brawls.",
        "icon": "\u2694\ufe0f",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #991b1b 0%, #06080e 70%)",
        "default_rom": "roms/North & South (E) [!].nes",
        "desc": "Command Union or Confederate armies! Conquer state territories, protect gold train transports, and storm forts in real-time melee duels.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/North & South (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/north-and-south.png"
    },
    {
        "id": "tiny-toon-adventures",
        "match_keys": [
            "tiny-toon-adventures",
            "tiny-toon"
        ],
        "title": "Tiny Toon Adventures",
        "sub": "Rank #88 All-Time \u2022 1991",
        "system": "PLATFORMER",
        "rank": 88,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Buster Bunny swapping partners with Plucky Duck, Dizzy Devil, and Furd.",
        "icon": "\ud83d\udc30",
        "color": "#60a5fa",
        "gradient": "radial-gradient(circle at 75% 25%, #1e40af 0%, #06080e 70%)",
        "default_rom": "roms/Tiny Toon Adventures (E) [!].nes",
        "desc": "Capcom-quality Disney-style platforming! Tag in Plucky Duck to glide across chasms or Dizzy Devil to spin through blocks on your quest to rescue Babs.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Tiny Toon Adventures (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/tiny-toon-adventures.png"
    },
    {
        "id": "little-nemo",
        "match_keys": [
            "little-nemo"
        ],
        "title": "Little Nemo: The Dream Master",
        "sub": "Rank #89 All-Time \u2022 1990",
        "system": "PLATFORMER",
        "rank": 89,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Feed candy to animal friends (frogs, lizards, moles) to borrow their abilities.",
        "icon": "\ud83c\udf6c",
        "color": "#a78bfa",
        "gradient": "radial-gradient(circle at 75% 25%, #5b21b6 0%, #06080e 70%)",
        "default_rom": "roms/Little Nemo (E) [!].nes",
        "desc": "Capcom\u2019s dreamscape fairy-tale adventure! Feed candy to frogs for high jumps, lizards to climb walls, and moles to dig for hidden keys.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Little Nemo (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/little-nemo.png"
    },
    {
        "id": "adventure-island",
        "match_keys": [
            "adventure-island"
        ],
        "title": "Adventure Island",
        "sub": "Rank #90 All-Time \u2022 1986",
        "system": "PLATFORMER",
        "rank": 90,
        "review_score": "\u2605 9.0/10 Nintendo Power",
        "review_quote": "Master Higgins riding skateboards, hurling stone tomahawks, and collecting fruit.",
        "icon": "\ud83e\ude93",
        "color": "#84cc16",
        "gradient": "radial-gradient(circle at 75% 25%, #3f6212 0%, #06080e 70%)",
        "default_rom": "roms/Adventure Island (E) [!].nes",
        "desc": "The original tropical survival sprint! Gobble fruit to keep your energy gauge full while jumping campfires and throwing axes across 32 stages.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Adventure Island (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/adventure-island.png"
    },
    {
        "id": "maniac-mansion",
        "match_keys": [
            "maniac-mansion"
        ],
        "title": "Maniac Mansion",
        "sub": "Rank #91 All-Time \u2022 1990",
        "system": "ADVENTURE",
        "rank": 91,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "Ron Gilbert\u2019s point-and-click comedy horror landmark; multiple endings.",
        "icon": "\ud83c\udfda\ufe0f",
        "color": "#d97706",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "default_rom": "roms/Maniac Mansion (U) [!].nes",
        "desc": "Lead 3 teenagers through the bizarre Edison Victorian mansion! Solve SCUMM verb-coin puzzles, evade Nurse Edna, and stop the sentient meteor.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Maniac Mansion (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/maniac-mansion.png"
    },
    {
        "id": "solomons-key",
        "match_keys": [
            "solomons-key",
            "solomon-key"
        ],
        "title": "Solomon's Key",
        "sub": "Rank #92 All-Time \u2022 1986",
        "system": "PUZZLE",
        "rank": 92,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Conjure and smash orange blocks to navigate goblin-infested dark puzzle crypts.",
        "icon": "\ud83d\udddd\ufe0f",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #92400e 0%, #06080e 70%)",
        "default_rom": "roms/Solomon's Key (E) [!].nes",
        "desc": "Cast creation magic as wizard Dana! Create orange stone blocks to climb cliffs, redirect flame balls, and find the door key in 50 claustrophobic rooms.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Solomon's Key (E) [!].nes",
        "cover": "covers/solomons-key.png"
    },
    {
        "id": "gargoyles-quest-2",
        "match_keys": [
            "gargoyles-quest-ii",
            "gargoyles-quest-2"
        ],
        "title": "Gargoyle's Quest II",
        "sub": "Rank #93 All-Time \u2022 1992",
        "system": "ADVENTURE",
        "rank": 93,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Capcom\u2019s Makaimura spin-off following Firebrand the demon\u2019s RPG flight saga.",
        "icon": "\ud83e\udd87",
        "color": "#7c3aed",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "default_rom": "roms/Gargoyle's Quest II (E) [!].nes",
        "desc": "Control Firebrand the red gargoyle! Hover on demon wings, cling to rocky precipices, and blast mystical dark fire to liberate the Ghoul Realm.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Gargoyle's Quest II (E) [!].nes",
        "cover": "covers/gargoyles-quest-2.png"
    },
    {
        "id": "clu-clu-land",
        "match_keys": [
            "clu-clu-land"
        ],
        "title": "Clu Clu Land",
        "sub": "Rank #94 All-Time \u2022 1984",
        "system": "ARCADE",
        "rank": 94,
        "review_score": "\u2605 8.9/10 All-Time",
        "review_quote": "Bubbles spinning around turning poles to uncover hidden golden bullion designs.",
        "icon": "\ud83e\udee7",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)",
        "default_rom": "roms/Clu Clu Land (W) [!].nes",
        "desc": "Reach out Bubbles\u2019 hands to catch turning poles and change directions! Uncover all gold ingots to reveal hidden pixel art before time expires.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Clu Clu Land (W) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/clu-clu-land.png"
    },
    {
        "id": "pinball",
        "match_keys": [
            "pinball"
        ],
        "title": "Pinball",
        "sub": "Rank #95 All-Time \u2022 1983",
        "system": "ARCADE",
        "rank": 95,
        "review_score": "\u2605 9.0/10 All-Time",
        "review_quote": "Dual-screen flipper physics featuring an interactive Mario Breakout bonus room.",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1e40af 0%, #06080e 70%)",
        "default_rom": "roms/Pinball (E) [!].nes",
        "desc": "Realistic two-screen table flipper physics! Hit the ball into the bonus hole to play Breakout as Mario holding a platform to bounce balls and rescue Pauline.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Pinball (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/pinball.png"
    },
    {
        "id": "golf",
        "match_keys": [
            "golf"
        ],
        "title": "Golf",
        "sub": "Rank #96 All-Time \u2022 1984",
        "system": "ARCADE",
        "rank": 96,
        "review_score": "\u2605 8.9/10 All-Time",
        "review_quote": "Satoru Iwata\u2019s engineering stroke; introduced the two-click swing power meter.",
        "icon": "\u26f3",
        "color": "#16a34a",
        "gradient": "radial-gradient(circle at 75% 25%, #14532d 0%, #06080e 70%)",
        "default_rom": "roms/Golf (E) [!].nes",
        "desc": "Satoru Iwata\u2019s programming masterpiece! Read wind direction, pick drivers and wedges, and time your backswing across 18 championship holes.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Golf (E) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/golf.png"
    },
    {
        "id": "tennis",
        "match_keys": [
            "tennis"
        ],
        "title": "Tennis",
        "sub": "Rank #97 All-Time \u2022 1984",
        "system": "ARCADE",
        "rank": 97,
        "review_score": "\u2605 9.0/10 All-Time",
        "review_quote": "Precision baseline rallying with Mario acting as the chair umpire.",
        "icon": "\ud83c\udfbe",
        "color": "#84cc16",
        "gradient": "radial-gradient(circle at 75% 25%, #3f6212 0%, #06080e 70%)",
        "default_rom": "roms/Tennis (U) [!].nes",
        "desc": "Fast baseline rallies, drop shots, and overhead smashes with Mario perched in the umpire chair! Play singles or 2-player doubles.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Tennis (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/tennis.png"
    },
    {
        "id": "baseball",
        "match_keys": [
            "baseball"
        ],
        "title": "Baseball",
        "sub": "Rank #98 All-Time \u2022 1983",
        "system": "ARCADE",
        "rank": 98,
        "review_score": "\u2605 8.9/10 All-Time",
        "review_quote": "The quintessential NES sports launch classic with full 9-inning strategy.",
        "icon": "\u26be",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #991b1b 0%, #06080e 70%)",
        "default_rom": "roms/Baseball (U) [!].nes",
        "desc": "Step up to the plate in the NES launch sport! Pitch curveballs and fastballs, steal second base, and hit moonshots over the center field fence.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Baseball (U) [!].nes",
        "console": "nes",
        "nes": true,
        "cover": "covers/baseball.png"
    },
    {
        "id": "track-and-field",
        "match_keys": [
            "track-and-field",
            "hyper-olympic"
        ],
        "title": "Track & Field (Hyper Olympic)",
        "sub": "Rank #99 All-Time \u2022 1985",
        "system": "ARCADE",
        "rank": 99,
        "review_score": "\u2605 9.1/10 All-Time",
        "review_quote": "Rapid-fire reflex athletics: 100m sprint, long jump, hurdles, and javelin.",
        "icon": "\ud83c\udfc3",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #b45309 0%, #06080e 70%)",
        "default_rom": "roms/Track & Field (J) [!].nes",
        "desc": "Button-mashing Olympic competition! Sprint the 100m dash, time hurdle hops, and aim your angle gauge for world record javelin throws.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Track & Field (J) [!].nes",
        "cover": "covers/track-and-field.png"
    },
    {
        "id": "mega-man-1",
        "match_keys": [
            "mega-man (j)",
            "mega-man-1",
            "rockman (j)"
        ],
        "title": "Mega Man",
        "sub": "Rank #100 All-Time \u2022 1987",
        "system": "ACTION",
        "rank": 100,
        "review_score": "\u2605 9.5/10 All-Time",
        "review_quote": "Where the Blue Bomber was born! Defeat Cut Man, Guts Man, and Elec Man.",
        "icon": "\ud83e\udd16",
        "color": "#38bdf8",
        "gradient": "radial-gradient(circle at 75% 25%, #0284c7 0%, #06080e 70%)",
        "default_rom": "roms/Mega Man (J) [!].nes",
        "desc": "Where the legend began! Take down Dr. Wily\u2019s original 6 Robot Masters (Cut Man, Guts Man, Ice Man, Bomb Man, Fire Man, Elec Man) to save Monsteropolis.",
        "top20": true,
        "top50": true,
        "top100": true,
        "hall_of_fame": true,
        "rom": "roms/Mega Man (J) [!].nes",
        "cover": "covers/mega-man-1.png"
    },
    {
        "id": "castlevania-2-belmont",
        "match_keys": [
            "castlevania ii - belmont's revenge"
        ],
        "title": "Castlevania II: Belmont's Revenge",
        "sub": "Superb Handheld Gothic Action",
        "system": "ACTION",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Incredible chiptune soundtrack and tight sub-weapon combat make this the premier GB Castlevania.",
        "icon": "\ud83e\udd87",
        "color": "#dc2626",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "desc": "Guide Christopher Belmont through 4 castle towers wielding holy water and throwing axes to save his son Soleil.",
        "rom": "roms/Castlevania II - Belmont's Revenge (USA, Europe).gb",
        "cover": "covers/castlevania-2-belmont.png"
    },
    {
        "id": "donkey-kong-94",
        "match_keys": [
            "donkey kong (world)"
        ],
        "title": "Donkey Kong ('94)",
        "sub": "Puzzle-Platforming Masterpiece",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.5/10 IGN",
        "review_quote": "Begins with the original 4 arcade stages then expands into 97 mind-bending puzzle levels.",
        "icon": "\ud83e\udd8d",
        "color": "#ea580c",
        "gradient": "radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)",
        "desc": "Handstands, backflips, spinning keys, and bridge-building through 101 stages to rescue Pauline from Donkey Kong.",
        "rom": "roms/Donkey Kong (World) (Rev 1) (SGB Enhanced).gb",
        "cover": "covers/donkey-kong-94.png"
    },
    {
        "id": "dr-mario-gb",
        "match_keys": [
            "dr. mario (world)",
            "dr mario (world)",
            "dr. mario.gb",
            "dr-mario-gb"
        ],
        "title": "Dr. Mario (Game Boy)",
        "sub": "Portable Virus Buster Puzzle",
        "system": "PUZZLE",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.3/10 GameSpot",
        "review_quote": "The portable edition of the beloved falling-capsule virus matching puzzle.",
        "icon": "\ud83d\udc8a",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "desc": "Rotate vitamin pills and eradicate color-coded viruses with infectious chiptune melodies on the go.",
        "rom": "roms/Dr. Mario (World) (Rev 1).gb",
        "cover": "covers/dr-mario-gb.png"
    },
    {
        "id": "dragon-warrior-iii-gbc",
        "match_keys": [
            "dragon warrior iii",
            "dragon warrior 3",
            "dragon quest iii"
        ],
        "title": "Dragon Warrior III (GBC)",
        "sub": "Masterpiece Handheld JRPG Remake",
        "system": "RPG",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 9.6/10 IGN",
        "review_quote": "Widely regarded as one of the greatest JRPGs ever created, exquisitely enhanced for Color.",
        "icon": "\u2694\ufe0f",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Recruit party members from Patty's Planning Room, discover monster medals, and conquer the Archfiend Baramos.",
        "rom": "roms/dragon warrior iii (u) [c][!].gbc",
        "cover": "covers/dragon-warrior-iii-gbc.png"
    },
    {
        "id": "dragon-warrior-monsters",
        "match_keys": [
            "dragon warrior monsters (",
            "dragon warrior monsters 2"
        ],
        "title": "Dragon Warrior Monsters",
        "sub": "Legendary Akira Toriyama Monster Battler",
        "system": "RPG",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 9.2/10 GameSpot",
        "review_quote": "Deep breeding system with over 200 Toriyama-designed monsters in GreatTree Kingdom.",
        "icon": "\ud83d\udc09",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Befriend slimes and dragons, enter traveler gates, and breed monster lineages to win the Starry Night Tournament.",
        "rom": "roms/dragon warrior monsters (u) [c][h1].gbc",
        "cover": "covers/dragon-warrior-monsters.png"
    },
    {
        "id": "kirby-dream-land",
        "match_keys": [
            "kirby's dream land ("
        ],
        "title": "Kirby's Dream Land",
        "sub": "The Debut of the Pink Puffball",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Masahiro Sakurai's masterclass in accessible platforming and floating mechanics.",
        "icon": "\ud83c\udf88",
        "color": "#ec4899",
        "gradient": "radial-gradient(circle at 75% 25%, #831843 0%, #06080e 70%)",
        "desc": "Inhale enemies and fly through Dream Land to reclaim the Sparkling Stars from greedy King Dedede.",
        "rom": "roms/Kirby's Dream Land (USA, Europe).gb",
        "cover": "covers/kirby-dream-land.png"
    },
    {
        "id": "kirby-dream-land-2",
        "match_keys": [
            "kirby's dream land 2"
        ],
        "title": "Kirby's Dream Land 2",
        "sub": "Animal Friends & Copy Abilities",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.3/10 Nintendo Power",
        "review_quote": "Rick the Hamster, Kine the Ocean Fish, and Coo the Owl multiply copy abilities threefold.",
        "icon": "\ud83d\udc39",
        "color": "#f43f5e",
        "gradient": "radial-gradient(circle at 75% 25%, #881337 0%, #06080e 70%)",
        "desc": "Ride with lovable animal friends across Rainbow Islands to defeat Dark Matter.",
        "rom": "roms/Kirby's Dream Land 2 (USA, Europe) (SGB Enhanced).gb",
        "cover": "covers/kirby-dream-land-2.png"
    },
    {
        "id": "mario-tennis-gbc",
        "match_keys": [
            "mario tennis"
        ],
        "title": "Mario Tennis (GBC)",
        "sub": "Camelot RPG Sports Classic",
        "system": "ARCADE",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 9.3/10 IGN",
        "review_quote": "Full RPG story mode at the Royal Tennis Academy with leveling stats and Mario showdowns.",
        "icon": "\ud83c\udfbe",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #064e3b 0%, #06080e 70%)",
        "desc": "Train your custom rookie, climb the singles and doubles varsity ranks, and challenge Mario on center court.",
        "rom": "roms/Mario Tennis (Europe).gbc",
        "cover": "covers/mario-tennis-gbc.png"
    },
    {
        "id": "mega-man-gb",
        "match_keys": [
            "mega man - dr. wily's revenge"
        ],
        "title": "Mega Man: Dr. Wily's Revenge",
        "sub": "The Blue Bomber's Handheld Debut",
        "system": "ACTION",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.1/10 GameSpot",
        "review_quote": "Combines Robot Masters from Mega Man 1 & 2 with the lethal debut of Enker and the Mirror Buster.",
        "icon": "\ud83e\udd16",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)",
        "desc": "Blast through Cut Man, Ice Man, Flash Man, and Quick Man before storming Wily's Space Station.",
        "rom": "roms/Mega Man - Dr. Wily's Revenge (Europe).gb",
        "cover": "covers/mega-man-gb.png"
    },
    {
        "id": "metroid-2",
        "match_keys": [
            "metroid ii - return of samus"
        ],
        "title": "Metroid II: Return of Samus",
        "sub": "Extermination on Planet SR388",
        "system": "ADVENTURE",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.2/10 IGN",
        "review_quote": "Atmospheric, claustrophobic sci-fi hunting 39 Metroid evolutions in deep caverns.",
        "icon": "\u2604\ufe0f",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Descend through descending acid pools on SR388 to eradicate the Metroid species before the Space Pirates do.",
        "rom": "roms/Metroid II - Return of Samus (World).gb",
        "cover": "covers/metroid-2.png"
    },
    {
        "id": "pokemon-blue",
        "match_keys": [
            "pokemon - blue",
            "pokemon blue",
            "pokeblue"
        ],
        "title": "Pok\u00e9mon Blue Version",
        "sub": "Game Boy Handheld RPG Origin",
        "system": "RPG",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 10/10 IGN",
        "review_quote": "The definitive sister release alongside Red, featuring iconic version exclusives like Blastoise.",
        "icon": "\ud83d\udca7",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1e3a8a 0%, #06080e 70%)",
        "desc": "Battle and trade your way through Kanto with classic Blue version exclusives and the mighty Water-type Blastoise.",
        "rom": "roms/Pokemon - Blue Version (USA, Europe) (SGB Enhanced).gb",
        "cover": "covers/pokemon-blue.png"
    },
    {
        "id": "pokemon-crystal",
        "match_keys": [
            "pokemon - crystal",
            "pokemon crystal",
            "pokecrystal"
        ],
        "title": "Pok\u00e9mon Crystal Version",
        "sub": "The Pinnacle of Game Boy Color RPGs",
        "system": "RPG",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 9.8/10 IGN",
        "review_quote": "The first Pok\u00e9mon title with animated battle sprites and the Battle Tower.",
        "icon": "\ud83d\udc8e",
        "color": "#06b6d4",
        "gradient": "radial-gradient(circle at 75% 25%, #164e63 0%, #06080e 70%)",
        "desc": "Uncover the mysteries of Suicune and the Unown with dynamic battle animations and female trainer option.",
        "rom": "roms/Pokemon - Crystal Version (USA, Europe).gbc",
        "cover": "covers/pokemon-crystal.png"
    },
    {
        "id": "pokemon-gold",
        "match_keys": [
            "pokemon - gold",
            "pokemon gold",
            "pokegold"
        ],
        "title": "Pok\u00e9mon Gold Version",
        "sub": "Game Boy Color Johto Generation II",
        "system": "RPG",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 10/10 IGN",
        "review_quote": "100 brand new Pok\u00e9mon, real-time day/night clock, and two full regions in one masterpiece.",
        "icon": "\u2728",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "desc": "Journey through the ancient Johto region, uncover legendary bird Ho-Oh, and return to Kanto for 16 total Gym Badges.",
        "rom": "roms/Pokemon - Gold Version (USA, Europe).gbc",
        "cover": "covers/pokemon-gold.png"
    },
    {
        "id": "pokemon-red",
        "match_keys": [
            "pokemon - red",
            "pokemon red",
            "pokered"
        ],
        "title": "Pok\u00e9mon Red Version",
        "sub": "Game Boy Handheld RPG Origin",
        "system": "RPG",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 10/10 IGN",
        "review_quote": "The revolutionary monster-catching RPG that started the global phenomenon.",
        "icon": "\ud83d\udd25",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "desc": "Embark on an epic journey across Kanto to collect all 151 original Pok\u00e9mon, defeat the eight Gym Leaders, and become Pok\u00e9mon Champion.",
        "rom": "roms/Pokemon - Red Version (USA, Europe) (SGB Enhanced).gb",
        "cover": "covers/pokemon-red.png"
    },
    {
        "id": "pokemon-silver",
        "match_keys": [
            "pokemon - silver",
            "pokemon silver",
            "pokesilver"
        ],
        "title": "Pok\u00e9mon Silver Version",
        "sub": "Game Boy Color Johto Generation II",
        "system": "RPG",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 10/10 IGN",
        "review_quote": "Legendary Lugia and Johto excellence with steel and dark types introduced.",
        "icon": "\ud83e\ude99",
        "color": "#94a3b8",
        "gradient": "radial-gradient(circle at 75% 25%, #334155 0%, #06080e 70%)",
        "desc": "Awaken the guardian of the seas Lugia, breed new Pok\u00e9mon species, and take on the ultimate challenge atop Mt. Silver.",
        "rom": "roms/Pokemon - Silver Version (USA, Europe).gbc",
        "cover": "covers/pokemon-silver.png"
    },
    {
        "id": "pokemon-yellow",
        "match_keys": [
            "pokemon - yellow",
            "pokemon yellow",
            "pokeyellow"
        ],
        "title": "Pok\u00e9mon Yellow: Special Pikachu Edition",
        "sub": "Game Boy Color Enhanced Anime Edition",
        "system": "RPG",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 10/10 GameSpot",
        "review_quote": "Pikachu walks behind you! The beloved anime-inspired expansion featuring Jesse and James.",
        "icon": "\u26a1",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)",
        "desc": "Travel with your loyal Pikachu following behind your footsteps, acquire all three starter Pok\u00e9mon, and thwart Team Rocket.",
        "rom": "roms/Pokemon - Yellow Version (USA, Europe).gbc",
        "cover": "covers/pokemon-yellow.png"
    },
    {
        "id": "super-mario-bros-deluxe",
        "match_keys": [
            "super mario bros. deluxe",
            "mario deluxe"
        ],
        "title": "Super Mario Bros. Deluxe",
        "sub": "The Ultimate Portable Mario Experience",
        "system": "PLATFORMER",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 9.7/10 IGN",
        "review_quote": "Contains both the complete SMB1 and Japanese Lost Levels with map navigation.",
        "icon": "\u2b50",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #064e3b 0%, #06080e 70%)",
        "desc": "Enjoy classic Super Mario Bros. plus Challenge Mode with Red Coins, Yoshi eggs, and unlockable Lost Levels.",
        "rom": "roms/Super Mario Bros. Deluxe (USA, Europe).gbc",
        "cover": "covers/super-mario-bros-deluxe.png"
    },
    {
        "id": "super-mario-land",
        "match_keys": [
            "super mario land (",
            "super mario land."
        ],
        "title": "Super Mario Land",
        "sub": "The Original 1989 Game Boy Launch Sensation",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.5/10 Nintendo Power",
        "review_quote": "Gunpei Yokoi's quirky launch marvel featuring the submarine and airplane stages.",
        "icon": "\ud83c\udf44",
        "color": "#ef4444",
        "gradient": "radial-gradient(circle at 75% 25%, #7f1d1d 0%, #06080e 70%)",
        "desc": "Guide Mario across Sarasaland to rescue Princess Daisy from the alien invaders Tatanga with superballs and Sky Pop flights.",
        "rom": "roms/Super Mario Land (World) (Rev 1).gb",
        "cover": "covers/super-mario-land.png"
    },
    {
        "id": "super-mario-land-2",
        "match_keys": [
            "super mario land 2",
            "6 golden coins"
        ],
        "title": "Super Mario Land 2: 6 Golden Coins",
        "sub": "First Appearance of Wario",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.6/10 IGN",
        "review_quote": "Giant sprites, overworld map, space zones, and Bunny Ears gliding make this an all-time classic.",
        "icon": "\ud83e\ude99",
        "color": "#f59e0b",
        "gradient": "radial-gradient(circle at 75% 25%, #78350f 0%, #06080e 70%)",
        "desc": "Explore six themed zones across Mario Land to reclaim Mario Castle from his devious rival Wario.",
        "rom": "roms/Super Mario Land 2 - 6 Golden Coins (USA, Europe) (Rev 2).gb",
        "cover": "covers/super-mario-land-2.png"
    },
    {
        "id": "tetris-gb",
        "match_keys": [
            "tetris (world)"
        ],
        "title": "Tetris (Game Boy Edition)",
        "sub": "The Most Iconic Handheld Game in History",
        "system": "PUZZLE",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.9/10 Masterpiece",
        "review_quote": "Korobeiniki (Type A Theme) and the green screen that sold 35 million cartridges worldwide.",
        "icon": "\ud83e\udde9",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #0e7490 0%, #06080e 70%)",
        "desc": "Clear lines, chase high scores, and enjoy the most timeless falling-block puzzle experience ever crafted.",
        "rom": "roms/Tetris (World) (Rev 1).gb",
        "cover": "covers/tetris-gb.png"
    },
    {
        "id": "zelda-links-awakening-dx",
        "match_keys": [
            "zelda dx",
            "links awakening"
        ],
        "title": "The Legend of Zelda: Link's Awakening DX",
        "sub": "Game Boy Color Masterpiece",
        "system": "ADVENTURE",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 10/10 IGN",
        "review_quote": "Widely ranked among the greatest Zelda adventures ever made, now in glorious full color.",
        "icon": "\ud83d\udddd\ufe0f",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #064e3b 0%, #06080e 70%)",
        "desc": "Stranded on mysterious Koholint Island, Link must gather the eight Instruments of the Sirens to awaken the Wind Fish.",
        "rom": "roms/Zelda DX - Links Awakening (USA)(Independent).gbc",
        "cover": "covers/zelda-links-awakening-dx.png"
    },
    {
        "id": "zelda-oracle-ages",
        "match_keys": [
            "oracle of ages"
        ],
        "title": "The Legend of Zelda: Oracle of Ages",
        "sub": "Capcom & Nintendo GBC Collaboration",
        "system": "ADVENTURE",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 9.8/10 IGN",
        "review_quote": "Complex time-travel puzzles and masterfully designed dungeons in Labrynna.",
        "icon": "\u23f3",
        "color": "#3b82f6",
        "gradient": "radial-gradient(circle at 75% 25%, #1e3a8a 0%, #06080e 70%)",
        "desc": "Use the Harp of Ages to travel between past and present to restore time and rescue Nayru from the sorceress Veran.",
        "rom": "roms/Legend of Zelda, The - Oracle of Ages (U) [C][h2].gbc",
        "cover": "covers/zelda-oracle-ages.png"
    },
    {
        "id": "zelda-oracle-seasons",
        "match_keys": [
            "oracle of seasons"
        ],
        "title": "The Legend of Zelda: Oracle of Seasons",
        "sub": "Capcom & Nintendo GBC Collaboration",
        "system": "ADVENTURE",
        "console": "gbc",
        "gb": true,
        "review_score": "\u2605 9.8/10 IGN",
        "review_quote": "Action-packed combat with the magical Rod of Seasons shifting nature at will.",
        "icon": "\ud83c\udf42",
        "color": "#f97316",
        "gradient": "radial-gradient(circle at 75% 25%, #7c2d12 0%, #06080e 70%)",
        "desc": "Swing the Rod of Seasons to freeze lakes in winter or blossom trees in spring, rescuing Din from General Onox.",
        "rom": "roms/legend of zelda, the - oracle of seasons (u) [c][h2].gbc",
        "cover": "covers/zelda-oracle-seasons.png"
    },
    {
        "id": "wario-land-2",
        "match_keys": [
            "wario land ii",
            "wario land 2"
        ],
        "title": "Wario Land II",
        "sub": "Immortality & Branching Puzzles",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "Wario cannot die! Instead, wacky enemy attacks trigger hilarious puzzle transformations.",
        "icon": "\ud83e\uddc4",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Flat Wario, Zombie Wario, and Puffy Wario return to chase down Captain Syrup after she floods his castle.",
        "rom": "roms/Wario Land II (USA, Europe) (SGB Enhanced).gb",
        "cover": "covers/wario-land-2.png"
    },
    {
        "id": "wario-land",
        "match_keys": [
            "wario land - super mario land 3",
            "wario land 1"
        ],
        "title": "Wario Land: Super Mario Land 3",
        "sub": "Greedy Platforming Perfection",
        "system": "PLATFORMER",
        "console": "gb",
        "gb": true,
        "review_score": "\u2605 9.4/10 IGN",
        "review_quote": "Bull, Jet, and Dragon pots give Wario unstoppable smashing power on Kitchen Island.",
        "icon": "\ud83d\udc51",
        "color": "#eab308",
        "gradient": "radial-gradient(circle at 75% 25%, #713f12 0%, #06080e 70%)",
        "desc": "Body slam Captain Syrup's Brown Sugar Pirates and loot gold to buy Wario the grandest castle possible.",
        "rom": "roms/Wario Land - Super Mario Land 3 (World).gb",
        "cover": "covers/wario-land.png"
    },
    {
        "title": "1200-in-1 Multicart",
        "sub": "Massive Retro Arcade Compilation",
        "system": "ARCADE",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Massive retro arcade compilation cartridge featuring hundreds of classic arcade hits, sports, puzzles, and shooting challenges.",
        "id": "1200-in-1",
        "rom": "roms/1200-in-1 (J) [p1].nes",
        "cover": "covers/1200-in-1.png"
    },
    {
        "title": "Super Tilt Bro",
        "sub": "Smash Bros Platform Fighter",
        "system": "FIGHTING",
        "icon": "\ud83e\udd4a",
        "color": "#e63946",
        "gradient": "radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)",
        "desc": "The acclaimed 2D platform brawler! Choose your fighter, unleash directional specials, recover with airdashes, and knock opponents out.",
        "id": "super-tilt-bro",
        "rom": "roms/super-tilt-bro.nes",
        "cover": "covers/super-tilt-bro.png"
    },
    {
        "title": "Twin Dragons",
        "sub": "High-Production Action Quest",
        "system": "PLATFORMER",
        "icon": "\ud83d\udc09",
        "color": "#3a0ca3",
        "gradient": "radial-gradient(circle at 75% 25%, #25096a 0%, #06080e 70%)",
        "desc": "Critically acclaimed platform adventure featuring Dinky and Minky on an epic mission to rescue stolen dragon eggs.",
        "id": "twindragons",
        "rom": "roms/twindragons.nes",
        "cover": "covers/twindragons.png"
    },
    {
        "title": "The Mad Wizard",
        "sub": "Metroidvania Exploration Quest",
        "system": "ADVENTURE",
        "icon": "\ud83e\uddd9",
        "color": "#6a0dad",
        "gradient": "radial-gradient(circle at 75% 25%, #42086e 0%, #06080e 70%)",
        "desc": "Enthralling fantasy Metroidvania! Cast elemental spells, levitate across chasms, unlock ancient artifacts, and reclaim your wizard territory.",
        "id": "themadwizard",
        "rom": "roms/themadwizard.nes",
        "cover": "covers/themadwizard.png"
    },
    {
        "id": "31-in-1-real-game",
        "title": "31 In 1 Real Game",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/31-in-1-real-game.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: 31 In 1 Real Game. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/31-in-1-real-game.png"
    },
    {
        "id": "31in1realgame-multicart",
        "title": "31in1realgame Multicart",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/31in1realgame-multicart.nes",
        "icon": "\ud83d\udfe1",
        "color": "#ffd166",
        "gradient": "radial-gradient(circle at 75% 25%, #594719 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: 31in1realgame Multicart. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/31in1realgame-multicart.png"
    },
    {
        "id": "3in12ppak",
        "title": "3in12ppak",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/3in12ppak.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: 3in12ppak. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/3in12ppak.png"
    },
    {
        "id": "aethos-beginnings",
        "title": "Aethos Beginnings",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/aethos-beginnings.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Aethos Beginnings. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/aethos-beginnings.png"
    },
    {
        "id": "alter-ego",
        "title": "Alter Ego",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/alter-ego.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Alter Ego. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/alter-ego.png"
    },
    {
        "id": "ambushed",
        "title": "Ambushed",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/ambushed.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Ambushed. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/ambushed.png"
    },
    {
        "title": "Assimilate",
        "sub": "Sci-Fi Extraterrestrial Defense",
        "system": "SHOOTER",
        "icon": "\ud83d\udc7e",
        "color": "#8b5cf6",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Frantic sci-fi arcade defense! Stop the alien parasites from assimilating the base defense grid.",
        "id": "assimilate",
        "rom": "roms/assimilate.nes",
        "cover": "covers/assimilate.png"
    },
    {
        "id": "astrohawk",
        "title": "Astrohawk",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/astrohawk.smc",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Astrohawk. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/astrohawk.png"
    },
    {
        "title": "Babel-Blox",
        "sub": "Falling-Block Architecture Puzzle",
        "system": "PUZZLE",
        "icon": "\ud83e\udde9",
        "color": "#fbbf24",
        "gradient": "radial-gradient(circle at 75% 25%, #664d03 0%, #06080e 70%)",
        "desc": "Addictive puzzle challenge! Stack falling architectural blocks to build ancient Babylonian towers without toppling over.",
        "id": "babelblox",
        "rom": "roms/babelblox.nes",
        "cover": "covers/babelblox.png"
    },
    {
        "id": "bareknuckleprincesss",
        "title": "Bareknuckleprincesss",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/bareknuckleprincesss.bin",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Bareknuckleprincesss. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/bareknuckleprincesss.png"
    },
    {
        "id": "blackboxchallenge",
        "title": "Blackboxchallenge",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/blackboxchallenge.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Blackboxchallenge. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/blackboxchallenge.png"
    },
    {
        "title": "Blaster",
        "sub": "Sci-Fi Rapid Fire Shoot Em Up",
        "system": "SHOOTER",
        "icon": "\u26a1",
        "color": "#e74c3c",
        "gradient": "radial-gradient(circle at 75% 25%, #591b15 0%, #06080e 70%)",
        "desc": "High-octane science fiction shoot-em-up! Dodge incoming bullet curtains and decimate alien battleships.",
        "id": "blaster",
        "rom": "roms/blaster.nes",
        "cover": "covers/blaster.png"
    },
    {
        "title": "Blaster",
        "sub": "Sci-Fi Rapid Fire Shoot Em Up",
        "system": "SHOOTER",
        "icon": "\u26a1",
        "color": "#e74c3c",
        "gradient": "radial-gradient(circle at 75% 25%, #591b15 0%, #06080e 70%)",
        "desc": "High-octane science fiction shoot-em-up! Dodge incoming bullet curtains and decimate alien battleships.",
        "id": "bronyblaster",
        "rom": "roms/bronyblaster.nes",
        "cover": "covers/bronyblaster.png"
    },
    {
        "title": "Blaster",
        "sub": "Sci-Fi Rapid Fire Shoot Em Up",
        "system": "SHOOTER",
        "icon": "\u26a1",
        "color": "#e74c3c",
        "gradient": "radial-gradient(circle at 75% 25%, #591b15 0%, #06080e 70%)",
        "desc": "High-octane science fiction shoot-em-up! Dodge incoming bullet curtains and decimate alien battleships.",
        "id": "double-action-blaster-guys",
        "rom": "roms/double-action-blaster-guys.nes",
        "cover": "covers/double-action-blaster-guys.png"
    },
    {
        "id": "bobl",
        "title": "Bobl",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/bobl.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Bobl. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/bobl.png"
    },
    {
        "id": "bombarray",
        "title": "Bombarray",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/bombarray.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Bombarray. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/bombarray.png"
    },
    {
        "id": "bootee",
        "title": "Bootee",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/bootee.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Bootee. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/bootee.png"
    },
    {
        "id": "brickster",
        "title": "Brickster",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/brickster.gbc",
        "icon": "\ud83d\udfe1",
        "color": "#ffd166",
        "gradient": "radial-gradient(circle at 75% 25%, #594719 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Brickster. Playable instantly in 60 FPS.",
        "console": "gbc",
        "gb": true,
        "cover": "covers/brickster.png"
    },
    {
        "title": "C-Room",
        "sub": "Dungeon Maze & Escape",
        "system": "ADVENTURE",
        "icon": "\ud83d\udddd\ufe0f",
        "color": "#06d6a0",
        "gradient": "radial-gradient(circle at 75% 25%, #05543f 0%, #06080e 70%)",
        "desc": "Navigate subterranean labyrinth rooms, discover cryptic keys, disarm hidden floor triggers, and escape.",
        "id": "croom",
        "rom": "roms/croom.nes",
        "cover": "covers/croom.png"
    },
    {
        "id": "cadaverion",
        "title": "Cadaverion",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/cadaverion.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Cadaverion. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/cadaverion.png"
    },
    {
        "id": "chase",
        "title": "Chase",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/chase.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Chase. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/chase.png"
    },
    {
        "id": "cheril-perils-classic",
        "title": "Cheril Perils Classic",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/cheril-perils-classic.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Cheril Perils Classic. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/cheril-perils-classic.png"
    },
    {
        "title": "Cheril the Goddess",
        "sub": "Fantasy Action Adventure",
        "system": "ADVENTURE",
        "icon": "\ud83e\uddda",
        "color": "#a855f7",
        "gradient": "radial-gradient(circle at 75% 25%, #4c1d95 0%, #06080e 70%)",
        "desc": "Vibrant fantasy action-adventure platformer! Guide Cheril through mystical forests, defeat bosses, and restore peace.",
        "id": "cheril-the-goddess",
        "rom": "roms/cheril-the-goddess.nes",
        "cover": "covers/cheril-the-goddess.png"
    },
    {
        "id": "cheril-the-writer",
        "title": "Cheril The Writer",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/cheril-the-writer.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Cheril The Writer. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/cheril-the-writer.png"
    },
    {
        "id": "chrono-knight",
        "title": "Chrono Knight",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/chrono-knight.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Chrono Knight. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/chrono-knight.png"
    },
    {
        "id": "cl1k",
        "title": "Cl1k",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/cl1k.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Cl1k. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/cl1k.png"
    },
    {
        "id": "concentration-room",
        "title": "Concentration Room",
        "sub": "Adventure Retro Classic",
        "system": "ADVENTURE",
        "rom": "roms/concentration-room.nes",
        "icon": "\ud83d\udddd\ufe0f",
        "color": "#06d6a0",
        "gradient": "radial-gradient(circle at 75% 25%, #05543f 0%, #06080e 70%)",
        "desc": "Authentic retro adventure cartridge: Concentration Room. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/concentration-room.png"
    },
    {
        "id": "dabg",
        "title": "Dabg",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/dabg.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Dabg. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/dabg.png"
    },
    {
        "title": "Debris Dodger",
        "sub": "High-Speed Reflex Evasion",
        "system": "ARCADE",
        "icon": "\ud83d\ude80",
        "color": "#ff0054",
        "gradient": "radial-gradient(circle at 75% 25%, #660324 0%, #06080e 70%)",
        "desc": "Intense arcade reflex game! Steer through an overwhelming asteroid storm moving at hypersonic velocity.",
        "id": "debrisdodger",
        "rom": "roms/debrisdodger.nes",
        "cover": "covers/debrisdodger.png"
    },
    {
        "title": "Driar",
        "sub": "38-Level Star Quest Platformer",
        "system": "PUZZLE",
        "icon": "\u2b50",
        "color": "#00b4d8",
        "gradient": "radial-gradient(circle at 75% 25%, #035263 0%, #06080e 70%)",
        "desc": "Charming puzzle-platformer featuring screen-wrapping wrap-around mechanics and 38 handcrafted levels.",
        "id": "driar",
        "rom": "roms/driar.nes",
        "cover": "covers/driar.png"
    },
    {
        "id": "f-theta",
        "title": "F Theta",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/f-theta.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: F Theta. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/f-theta.png"
    },
    {
        "id": "falling",
        "title": "Falling",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/falling.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Falling. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/falling.png"
    },
    {
        "id": "fff",
        "title": "Fff",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/fff.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Fff. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/fff.png"
    },
    {
        "id": "filthykitchen",
        "title": "Filthykitchen",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/filthykitchen.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Filthykitchen. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/filthykitchen.png"
    },
    {
        "title": "Flappy Bird Retro",
        "sub": "Viral Arcade Reflex Challenge",
        "system": "ARCADE",
        "icon": "\ud83d\udc24",
        "color": "#52b788",
        "gradient": "radial-gradient(circle at 75% 25%, #184731 0%, #06080e 70%)",
        "desc": "The world-famous viral arcade sensation ported natively to console hardware! Tap with precision rhythm to thread through green pipes.",
        "id": "flappybird",
        "rom": "roms/flappybird.nes",
        "cover": "covers/flappybird.png"
    },
    {
        "id": "flappyblock",
        "title": "Flappyblock",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/flappyblock.nes",
        "icon": "\ud83d\udfe1",
        "color": "#ffd166",
        "gradient": "radial-gradient(circle at 75% 25%, #594719 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Flappyblock. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/flappyblock.png"
    },
    {
        "id": "flappyjack",
        "title": "Flappyjack",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/flappyjack.nes",
        "icon": "\ud83d\udfe1",
        "color": "#ffd166",
        "gradient": "radial-gradient(circle at 75% 25%, #594719 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Flappyjack. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/flappyjack.png"
    },
    {
        "id": "forpoints",
        "title": "Forpoints",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/forpoints.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Forpoints. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/forpoints.png"
    },
    {
        "id": "gargoyle-s-quest-ii",
        "title": "Gargoyle's Quest Ii",
        "sub": "Platformer Retro Classic",
        "system": "PLATFORMER",
        "rom": "roms/Gargoyle's Quest II (E) [!].nes",
        "icon": "\ud83c\udff0",
        "color": "#fbbf24",
        "gradient": "radial-gradient(circle at 75% 25%, #664d03 0%, #06080e 70%)",
        "desc": "Authentic retro platformer cartridge: Gargoyle's Quest Ii. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/gargoyle-s-quest-ii.png"
    },
    {
        "id": "gsm",
        "title": "Gsm",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/gsm.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Gsm. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/gsm.png"
    },
    {
        "id": "indivisibleonnes",
        "title": "Indivisibleonnes",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/indivisibleonnes.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Indivisibleonnes. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/indivisibleonnes.png"
    },
    {
        "id": "initiald",
        "title": "Initiald",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/initiald.gbc",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Initiald. Playable instantly in 60 FPS.",
        "console": "gbc",
        "gb": true,
        "cover": "covers/initiald.png"
    },
    {
        "title": "Invaders",
        "sub": "Space Invaders Galactic Defense",
        "system": "SHOOTER",
        "icon": "\ud83d\udc7e",
        "color": "#118ab2",
        "gradient": "radial-gradient(circle at 75% 25%, #0b4a5e 0%, #06080e 70%)",
        "desc": "The iconic alien defense war! Shield behind destructible bunkers, time your laser shots, and intercept descending armadas.",
        "id": "invaders-must-die",
        "rom": "roms/invaders-must-die.nes",
        "cover": "covers/invaders-must-die.png"
    },
    {
        "title": "Invaders",
        "sub": "Space Invaders Galactic Defense",
        "system": "SHOOTER",
        "icon": "\ud83d\udc7e",
        "color": "#118ab2",
        "gradient": "radial-gradient(circle at 75% 25%, #0b4a5e 0%, #06080e 70%)",
        "desc": "The iconic alien defense war! Shield behind destructible bunkers, time your laser shots, and intercept descending armadas.",
        "id": "invaders",
        "rom": "roms/invaders.nes",
        "cover": "covers/invaders.png"
    },
    {
        "title": "Jet-Paco",
        "sub": "Jetpack Flight & Exploration",
        "system": "ARCADE",
        "icon": "\ud83d\ude80",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)",
        "desc": "High-flying planetary exploration arcade game! Master jetpack physics, refuel energy pods, and rescue lost astronaut squads.",
        "id": "jetpaco",
        "rom": "roms/jetpaco.nes",
        "cover": "covers/jetpaco.png"
    },
    {
        "id": "jetpilotrising",
        "title": "Jetpilotrising",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/jetpilotrising.sfc",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Jetpilotrising. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/jetpilotrising.png"
    },
    {
        "id": "journey-center-alien",
        "title": "Journey Center Alien",
        "sub": "Shooter Retro Classic",
        "system": "SHOOTER",
        "rom": "roms/journey-center-alien.nes",
        "icon": "\u26a1",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)",
        "desc": "Authentic retro shooter cartridge: Journey Center Alien. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/journey-center-alien.png"
    },
    {
        "id": "kyff",
        "title": "Kyff",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/kyff.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Kyff. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/kyff.png"
    },
    {
        "id": "lala",
        "title": "Lala",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/lala.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Lala. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/lala.png"
    },
    {
        "id": "lala-the-magical",
        "title": "Lala The Magical",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/lala-the-magical.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Lala The Magical. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/lala-the-magical.png"
    },
    {
        "id": "lan-master",
        "title": "Lan Master",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/lan-master.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Lan Master. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/lan-master.png"
    },
    {
        "id": "lawn-mower",
        "title": "Lawn Mower",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/lawn-mower.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Lawn Mower. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/lawn-mower.png"
    },
    {
        "id": "lightshields",
        "title": "Lightshields",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/lightshields.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Lightshields. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/lightshields.png"
    },
    {
        "id": "lunarlimit",
        "title": "Lunarlimit",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/lunarlimit.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Lunarlimit. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/lunarlimit.png"
    },
    {
        "id": "mashymashy",
        "title": "Mashymashy",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/mashymashy.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Mashymashy. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/mashymashy.png"
    },
    {
        "id": "mega-man",
        "title": "Mega Man",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/Mega Man (J) [!].nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Mega Man. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/mega-man.png"
    },
    {
        "id": "megamountain",
        "title": "Megamountain",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/megamountain.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Megamountain. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/megamountain.png"
    },
    {
        "id": "memory",
        "title": "Memory",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/memory.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Memory. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/memory.png"
    },
    {
        "id": "meteor-guard",
        "title": "Meteor Guard",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/meteor-guard.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Meteor Guard. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/meteor-guard.png"
    },
    {
        "id": "mguard",
        "title": "Mguard",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/mguard.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Mguard. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/mguard.png"
    },
    {
        "id": "mguard2",
        "title": "Mguard2",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/mguard2.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Mguard2. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/mguard2.png"
    },
    {
        "id": "midnightjogger",
        "title": "Midnightjogger",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/midnightjogger.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Midnightjogger. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/midnightjogger.png"
    },
    {
        "id": "miedow",
        "title": "Miedow",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/miedow.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Miedow. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/miedow.png"
    },
    {
        "id": "mine-mayhem",
        "title": "Mine Mayhem",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/mine-mayhem.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Mine Mayhem. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/mine-mayhem.png"
    },
    {
        "id": "mineshaft",
        "title": "Mineshaft",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/mineshaft.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Mineshaft. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/mineshaft.png"
    },
    {
        "id": "mouser-ii",
        "title": "Mouser Ii",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/mouser-ii.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Mouser Ii. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/mouser-ii.png"
    },
    {
        "id": "mouser2",
        "title": "Mouser2",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/mouser2.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Mouser2. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/mouser2.png"
    },
    {
        "id": "nes-virus-cleaner",
        "title": "Nes Virus Cleaner",
        "sub": "Puzzle Retro Classic",
        "system": "PUZZLE",
        "rom": "roms/nes-virus-cleaner.nes",
        "icon": "\ud83e\udde9",
        "color": "#ef476f",
        "gradient": "radial-gradient(circle at 75% 25%, #631c2d 0%, #06080e 70%)",
        "desc": "Authentic retro puzzle cartridge: Nes Virus Cleaner. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/nes-virus-cleaner.png"
    },
    {
        "id": "nesertbus",
        "title": "Nesertbus",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/nesertbus.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Nesertbus. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/nesertbus.png"
    },
    {
        "id": "ninjamuncher",
        "title": "Ninjamuncher",
        "sub": "Action Retro Classic",
        "system": "ACTION",
        "rom": "roms/ninjamuncher.nes",
        "icon": "\ud83c\udf96\ufe0f",
        "color": "#ff5376",
        "gradient": "radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)",
        "desc": "Authentic retro action cartridge: Ninjamuncher. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/ninjamuncher.png"
    },
    {
        "id": "nintencattheparody",
        "title": "Nintencattheparody",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/nintencattheparody.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Nintencattheparody. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/nintencattheparody.png"
    },
    {
        "title": "Nomolos: Storming the CASTLE",
        "sub": "Action Castle Siege Platformer",
        "system": "ACTION",
        "icon": "\ud83c\udff0",
        "color": "#ff5376",
        "gradient": "radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)",
        "desc": "Classic knight-action platformer with intense sword combat, armored foes, and epic castle sieges.",
        "id": "nomolos-storming-the-catsle",
        "rom": "roms/nomolos-storming-the-catsle.nes",
        "cover": "covers/nomolos-storming-the-catsle.png"
    },
    {
        "title": "Nomolos: Storming the CASTLE",
        "sub": "Action Castle Siege Platformer",
        "system": "ACTION",
        "icon": "\ud83c\udff0",
        "color": "#ff5376",
        "gradient": "radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)",
        "desc": "Classic knight-action platformer with intense sword combat, armored foes, and epic castle sieges.",
        "id": "nomolos",
        "rom": "roms/nomolos.nes",
        "cover": "covers/nomolos.png"
    },
    {
        "id": "nopoints",
        "title": "Nopoints",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/nopoints.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Nopoints. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/nopoints.png"
    },
    {
        "title": "Nova the Squirrel",
        "sub": "Super Mario World Style Platformer",
        "system": "PLATFORMER",
        "icon": "\ud83d\udc3f\ufe0f",
        "color": "#fb8500",
        "gradient": "radial-gradient(circle at 75% 25%, #663603 0%, #06080e 70%)",
        "desc": "Vibrant action platformer inspired by 16-bit classics! Copy enemy abilities, discover secret exits, and explore massive worlds.",
        "id": "novathesquirrel",
        "rom": "roms/novathesquirrel.nes",
        "cover": "covers/novathesquirrel.png"
    },
    {
        "id": "obstacletrek",
        "title": "Obstacletrek",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/obstacletrek.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Obstacletrek. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/obstacletrek.png"
    },
    {
        "id": "pegs",
        "title": "Pegs",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/pegs.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Pegs. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/pegs.png"
    },
    {
        "title": "Pong 1K",
        "sub": "The Grandfather of Video Games",
        "system": "ARCADE",
        "icon": "\ud83c\udfd3",
        "color": "#e2eafc",
        "gradient": "radial-gradient(circle at 75% 25%, #1b253b 0%, #06080e 70%)",
        "desc": "The original 1972 table tennis arcade simulation that launched the entire interactive entertainment industry.",
        "id": "pong1k",
        "rom": "roms/pong1k.nes",
        "cover": "covers/pong1k.png"
    },
    {
        "title": "Pong 1K",
        "sub": "The Grandfather of Video Games",
        "system": "ARCADE",
        "icon": "\ud83c\udfd3",
        "color": "#e2eafc",
        "gradient": "radial-gradient(circle at 75% 25%, #1b253b 0%, #06080e 70%)",
        "desc": "The original 1972 table tennis arcade simulation that launched the entire interactive entertainment industry.",
        "id": "pong1k2p",
        "rom": "roms/pong1k2p.nes",
        "cover": "covers/pong1k2p.png"
    },
    {
        "id": "project-dart",
        "title": "Project Dart",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/project-dart.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Project Dart. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/project-dart.png"
    },
    {
        "id": "ralph4",
        "title": "Ralph4",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/ralph4.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Ralph4. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/ralph4.png"
    },
    {
        "id": "rhde",
        "title": "Rhde",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/rhde.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Rhde. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/rhde.png"
    },
    {
        "id": "rhde-furniture-fight",
        "title": "Rhde Furniture Fight",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/rhde-furniture-fight.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Rhde Furniture Fight. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/rhde-furniture-fight.png"
    },
    {
        "id": "riseofamondus",
        "title": "Riseofamondus",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/riseofamondus.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Riseofamondus. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/riseofamondus.png"
    },
    {
        "title": "Robo-Ninja Climb",
        "sub": "Cybernetic Ninja Wall Runner",
        "system": "ACTION",
        "icon": "\ud83e\udd77",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)",
        "desc": "High-speed cybernetic ninja vertical reflex climbing runner! Wall-jump past laser grids and shurikens.",
        "id": "roboninjaclimb",
        "rom": "roms/roboninjaclimb.nes",
        "cover": "covers/roboninjaclimb.png"
    },
    {
        "id": "robotfindskitten",
        "title": "Robotfindskitten",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/robotfindskitten.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Robotfindskitten. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/robotfindskitten.png"
    },
    {
        "id": "rock-paper-scissors-lizard-spock",
        "title": "Rock Paper Scissors Lizard Spock",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/rock-paper-scissors-lizard-spock.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Rock Paper Scissors Lizard Spock. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/rock-paper-scissors-lizard-spock.png"
    },
    {
        "id": "roulette",
        "title": "Roulette",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/roulette.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Roulette. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/roulette.png"
    },
    {
        "id": "rpsls",
        "title": "Rpsls",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/rpsls.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Rpsls. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/rpsls.png"
    },
    {
        "id": "rumblefest-89",
        "title": "Rumblefest 89",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/rumblefest-89.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Rumblefest 89. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/rumblefest-89.png"
    },
    {
        "id": "sgt-helmet-training-day",
        "title": "Sgt Helmet Training Day",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/sgt-helmet-training-day.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Sgt Helmet Training Day. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/sgt-helmet-training-day.png"
    },
    {
        "title": "Sgt. Helmet: Commando",
        "sub": "Contra Style Military Action",
        "system": "ACTION",
        "icon": "\ud83c\udf96\ufe0f",
        "color": "#2b9348",
        "gradient": "radial-gradient(circle at 75% 25%, #134622 0%, #06080e 70%)",
        "desc": "Action-packed military infiltration run-and-gun! Take down enemy squads, dodge minefields, and rescue hostages.",
        "id": "sgthelmet",
        "rom": "roms/sgthelmet.nes",
        "cover": "covers/sgthelmet.png"
    },
    {
        "id": "shadow-animus",
        "title": "Shadow Animus",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/shadow-animus.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Shadow Animus. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/shadow-animus.png"
    },
    {
        "id": "simonesays",
        "title": "Simonesays",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/simonesays.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Simonesays. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/simonesays.png"
    },
    {
        "title": "Sir Ababol Remastered",
        "sub": "Medieval Fantasy Platformer",
        "system": "PLATFORMER",
        "icon": "\ud83c\udff0",
        "color": "#fbbf24",
        "gradient": "radial-gradient(circle at 75% 25%, #664d03 0%, #06080e 70%)",
        "desc": "Acclaimed medieval fantasy platformer by The Mojon Twins! Guide Sir Ababol across the treacherous lands of Monegros.",
        "id": "sir-ababol-remastered",
        "rom": "roms/sir-ababol-remastered.nes",
        "cover": "covers/sir-ababol-remastered.png"
    },
    {
        "id": "slow-mole",
        "title": "Slow Mole",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/slow-mole.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Slow Mole. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/slow-mole.png"
    },
    {
        "id": "snailmaze",
        "title": "Snailmaze",
        "sub": "Adventure Retro Classic",
        "system": "ADVENTURE",
        "rom": "roms/snailmaze.nes",
        "icon": "\ud83d\udddd\ufe0f",
        "color": "#06d6a0",
        "gradient": "radial-gradient(circle at 75% 25%, #05543f 0%, #06080e 70%)",
        "desc": "Authentic retro adventure cartridge: Snailmaze. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/snailmaze.png"
    },
    {
        "id": "solomon-s-key",
        "title": "Solomon's Key",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/Solomon's Key (E) [!].nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Solomon's Key. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/solomon-s-key.png"
    },
    {
        "id": "spaceymcracey",
        "title": "Spaceymcracey",
        "sub": "Shooter Retro Classic",
        "system": "SHOOTER",
        "rom": "roms/spaceymcracey.nes",
        "icon": "\u26a1",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)",
        "desc": "Authentic retro shooter cartridge: Spaceymcracey. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/spaceymcracey.png"
    },
    {
        "title": "Star Evil",
        "sub": "Rapid-Fire Bullet Hell Shmup",
        "system": "SHOOTER",
        "icon": "\u26a1",
        "color": "#e74c3c",
        "gradient": "radial-gradient(circle at 75% 25%, #591b15 0%, #06080e 70%)",
        "desc": "High-octane deep space vertical shooter! Dodge thick bullet curtains and obliterate alien armada flagships.",
        "id": "starevil",
        "rom": "roms/starevil.nes",
        "cover": "covers/starevil.png"
    },
    {
        "id": "starter-kit",
        "title": "Starter Kit",
        "sub": "Shooter Retro Classic",
        "system": "SHOOTER",
        "rom": "roms/starter_kit.nes",
        "icon": "\u26a1",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #004d54 0%, #06080e 70%)",
        "desc": "Authentic retro shooter cartridge: Starter Kit. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/starter-kit.png"
    },
    {
        "title": "Super PakPak",
        "sub": "Pac-Man Dot Munching Arcade",
        "system": "ARCADE",
        "icon": "\ud83d\udfe1",
        "color": "#ffd166",
        "gradient": "radial-gradient(circle at 75% 25%, #594719 0%, #06080e 70%)",
        "desc": "Classic maze navigation and dot-eating retro arcade action! Dodge prowling ghosts, snatch power pellets, and clear maze after maze.",
        "id": "superpakpak",
        "rom": "roms/superpakpak.nes",
        "cover": "covers/superpakpak.png"
    },
    {
        "title": "Super Uwol",
        "sub": "Coin Snatching Castle Quest",
        "system": "PLATFORMER",
        "icon": "\ud83d\udcb0",
        "color": "#f39c12",
        "gradient": "radial-gradient(circle at 75% 25%, #694407 0%, #06080e 70%)",
        "desc": "Fast-paced arcade coin hunting through mysterious haunted mansion vaults! Collect all gold coins before ghouls catch you.",
        "id": "superuwol",
        "rom": "roms/superuwol.nes",
        "cover": "covers/superuwol.png"
    },
    {
        "id": "thatswhack",
        "title": "Thatswhack",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/thatswhack.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Thatswhack. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/thatswhack.png"
    },
    {
        "title": "The Invasion",
        "sub": "Deep Space Alien Fleet Defense",
        "system": "SHOOTER",
        "icon": "\ud83d\udef8",
        "color": "#8338ec",
        "gradient": "radial-gradient(circle at 75% 25%, #461b85 0%, #06080e 70%)",
        "desc": "Defend your deep space forward outpost against 14 escalating waves of high-speed extraterrestrial invaders.",
        "id": "theinvasion",
        "rom": "roms/theinvasion.nes",
        "cover": "covers/theinvasion.png"
    },
    {
        "title": "The Legends of Owlia",
        "sub": "Zelda Style Action Adventure",
        "system": "ADVENTURE",
        "icon": "\u2694\ufe0f",
        "color": "#10b981",
        "gradient": "radial-gradient(circle at 75% 25%, #054f38 0%, #06080e 70%)",
        "desc": "Epic 8-bit Zelda-style action-adventure RPG! Explore dungeons and solve puzzles with the aid of your companion great owl, Silo.",
        "id": "owlia",
        "rom": "roms/owlia.nes",
        "cover": "covers/owlia.png"
    },
    {
        "title": "The Mad Wizard",
        "sub": "Metroidvania Exploration Quest",
        "system": "ADVENTURE",
        "icon": "\ud83e\uddd9",
        "color": "#6a0dad",
        "gradient": "radial-gradient(circle at 75% 25%, #42086e 0%, #06080e 70%)",
        "desc": "Enthralling fantasy Metroidvania! Cast elemental spells, levitate across chasms, unlock ancient artifacts, and reclaim your wizard territory.",
        "id": "madwizard",
        "rom": "roms/madwizard.nes",
        "cover": "covers/madwizard.png"
    },
    {
        "id": "theonewiththewalls",
        "title": "Theonewiththewalls",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/theonewiththewalls.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Theonewiththewalls. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/theonewiththewalls.png"
    },
    {
        "id": "thewit",
        "title": "Thewit",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/thewit.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Thewit. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/thewit.png"
    },
    {
        "title": "Thwaite",
        "sub": "Missile Defense Tactical Strategy",
        "system": "SHOOTER",
        "icon": "\ud83d\udee1\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Tactical missile defense strategy! Intercept falling rocket artillery to protect the village of Thwaite.",
        "id": "thwaite",
        "rom": "roms/thwaite.nes",
        "cover": "covers/thwaite.png"
    },
    {
        "id": "tictactwop",
        "title": "Tictactwop",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/tictactwop.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Tictactwop. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/tictactwop.png"
    },
    {
        "id": "tictacxo",
        "title": "Tictacxo",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/tictacxo.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Tictacxo. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/tictacxo.png"
    },
    {
        "id": "tigerjenny",
        "title": "Tigerjenny",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/tigerjenny.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Tigerjenny. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/tigerjenny.png"
    },
    {
        "id": "track-field",
        "title": "Track & Field",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/Track & Field (J) [!].nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Track & Field. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/track-field.png"
    },
    {
        "id": "vigilanteninja",
        "title": "Vigilanteninja",
        "sub": "Action Retro Classic",
        "system": "ACTION",
        "rom": "roms/vigilanteninja.nes",
        "icon": "\ud83c\udf96\ufe0f",
        "color": "#ff5376",
        "gradient": "radial-gradient(circle at 75% 25%, #6a0e1c 0%, #06080e 70%)",
        "desc": "Authentic retro action cartridge: Vigilanteninja. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/vigilanteninja.png"
    },
    {
        "title": "Virus Cleaner",
        "sub": "Dr. Mario Style Medical Puzzle",
        "system": "PUZZLE",
        "icon": "\ud83d\udc8a",
        "color": "#ef476f",
        "gradient": "radial-gradient(circle at 75% 25%, #631c2d 0%, #06080e 70%)",
        "desc": "Falling-pill color-matching puzzle game! Line up matching medicine capsules to eradicate stubborn viruses.",
        "id": "viruscleaner",
        "rom": "roms/viruscleaner.nes",
        "cover": "covers/viruscleaner.png"
    },
    {
        "id": "wo-xiang-niao-niao",
        "title": "Wo Xiang Niao Niao",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/wo-xiang-niao-niao.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Wo Xiang Niao Niao. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/wo-xiang-niao-niao.png"
    },
    {
        "id": "yun",
        "title": "Yun",
        "sub": "Arcade Retro Classic",
        "system": "ARCADE",
        "rom": "roms/yun.nes",
        "icon": "\ud83d\udd79\ufe0f",
        "color": "#00f0ff",
        "gradient": "radial-gradient(circle at 75% 25%, #035b66 0%, #06080e 70%)",
        "desc": "Authentic retro arcade cartridge: Yun. Playable instantly in 60 FPS.",
        "console": "nes",
        "nes": true,
        "cover": "covers/yun.png"
    }
];

    // ========================================================
    // 2. Synthesized Web Audio System
    // ========================================================
    class NexusAudio {
        constructor() {
            this.ctx = null;
        }
        init() {
            if (!this.ctx) {
                try {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) this.ctx = new AudioCtx();
                } catch (e) {}
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        }
        playFocus() {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        }
        playLaunch() {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [329.63, 440.00, 659.25].forEach((f, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, now + idx * 0.05);
                osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.4);
                gain.gain.setValueAtTime(0.06, now + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.05);
                osc.stop(now + 0.4);
            });
        }
        playSuccess() {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + idx * 0.06);
                gain.gain.setValueAtTime(0.05, now + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.06);
                osc.stop(now + idx * 0.06 + 0.15);
            });
        }
    }
    const audio = new NexusAudio();

    // ========================================================
    // 3. Game Catalog State & Server Sync
    // ========================================================
    let serverGames = [...BUILTIN_GAMES];
    let allGames = [...serverGames];
    let activeFilter = 'all';
    let searchQuery = '';
    let spotlightIndex = 0;

    // Dynamic Server Games Loader & Watcher Sync
    async function fetchServerGames(isManual = false) {
        try {
            const res = await fetch('/api/games?t=' + Date.now());
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const prevIds = serverGames.map(g => g.id).join(',');
                    const nextIds = data.map(g => g.id).join(',');
                    serverGames = data;
                    allGames = [...serverGames];
                    if (prevIds !== nextIds || isManual) {
                        renderBentoGrid();
                        if (isManual) {
                            audio.playSuccess();
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('API games fetch fallback to presets:', err);
        }
    }

    // Initial ROM watch handled via RESCAN & page load (avoids background polling lag)
    window.addEventListener('focus', () => fetchServerGames(false));

    // ========================================================
    // 5. DOM Elements
    // ========================================================
    const bentoGrid = document.getElementById('nexusBentoGrid');
    const heroTitle = document.getElementById('spotlightTitle');
    const heroDesc = document.getElementById('spotlightDesc');
    const heroSystem = document.getElementById('spotlightSystem');
    const heroAmbient = document.getElementById('spotlightAmbient');
    const btnPlayHero = document.getElementById('btnPlaySpotlight');
    const filterPills = document.querySelectorAll('.nexus-filter-pill');
    const cmdPaletteBackdrop = document.getElementById('nexusPaletteBackdrop');
    const cmdInput = document.getElementById('paletteInput');
    const cmdResults = document.getElementById('paletteResults');
    const searchTrigger = document.getElementById('nexusSearchTrigger');
    const fpsDisplay = document.getElementById('nexusFpsDisplay');
    const cinemaModal = document.getElementById('nexusCinemaModal');
    const cinemaFrame = document.getElementById('nexusCinemaFrame');
    const cinemaTitle = document.getElementById('cinemaGameTitle');
    const btnCloseCinema = document.getElementById('btnCloseCinema');
    const btnFullscreenCinema = document.getElementById('btnFullscreenCinema');
    const btnRandomSpotlight = document.getElementById('btnRandomSpotlight');
    const btnConsoleShowcase = document.getElementById('btnConsoleShowcase');

    // ========================================================
    // 6. Telemetry Badge (Low-Overhead Static Refresh)
    // ========================================================
    if (fpsDisplay) fpsDisplay.textContent = '60 FPS';
    const fpsDisplay2 = document.getElementById('nexusFpsDisplay2');
    if (fpsDisplay2) fpsDisplay2.textContent = '60';

    const MULTIPLAYER_KEYWORDS = [
        'contra', 'super-c', 'double-dragon', 'tmnt-2', 'tmnt-ii', 'teenage-mutant-ninja-turtles-ii',
        'bubble-bobble', 'chip-n-dale', 'life-force', 'river-city', 'battletoads', 'dr-mario',
        'mario-bros', 'super-mario-bros', 'balloon-fight', 'ice-climber', 'jackal', 'bomberman',
        'super-tilt-bro', 'gauntlet', 'twinbee', 'baseball', 'tennis', 'soccer', 'ikari',
        'archon', 'joust', 'spy-vs-spy', 'blades-of-steel', 'tecmo', 'r-c-pro-am', 'micro-machines'
    ];

    function isMultiplayerGame(g) {
        if (!g) return false;
        if (g.multiplayer) return true;
        const isGb = g.gb || g.console === 'gb' || g.console === 'gbc';
        if (isGb || isPs1(g)) return false;
        const gid = (g.id || '').toLowerCase();
        return MULTIPLAYER_KEYWORDS.some(k => gid.includes(k));
    }

    const VALID_ROM_PATH_RE = /^roms\/[A-Za-z0-9 _()\[\].!,'-]+\.(?:nes|gb|gbc)$/i;

    const PS1_ROM_PATH_RE = /^roms\/ps1\/[A-Za-z0-9 _()\[\].!,'&+-]+\.(?:chd|pbp|iso|bin|img|zip|7z)$/i;

    function isPs1(g) {
        return !!g && (g.ps1 || g.console === 'ps1');
    }

    function isSafeRomPath(rom) {
        return typeof rom === 'string' && !rom.includes('..') && !rom.includes('\\') &&
            (VALID_ROM_PATH_RE.test(rom.trim()) || PS1_ROM_PATH_RE.test(rom.trim()));
    }

    function createEl(tag, className, text) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text !== undefined && text !== null) el.textContent = String(text);
        return el;
    }

    let hoverDebounceTimer = null;

    // ========================================================
    // 7. Render Bento Grid Cards (DOM-Safe & High-Speed)
    // ========================================================
    function renderBentoGrid() {
        if (!bentoGrid) return;
        bentoGrid.textContent = '';

        const filtered = allGames.filter(g => {
            const isHoF = g.top100 || g.top50 || g.top20 || g.hall_of_fame;
            const isGb = g.gb || g.console === 'gb' || g.console === 'gbc';
            const isNes = g.nes || g.console === 'nes';
            const isMp = isMultiplayerGame(g);
            const matchFilter = (activeFilter === 'all') ||
                ((activeFilter === 'top100' || activeFilter === 'top50' || activeFilter === 'top20') && isHoF) ||
                (activeFilter === 'gb' && isGb) ||
                (activeFilter === 'nes' && isNes) ||
                (activeFilter === 'ps1' && isPs1(g)) ||
                (activeFilter === 'multiplayer' && isMp) ||
                (g.system && g.system.toLowerCase() === activeFilter.toLowerCase());
            const matchSearch = !searchQuery ||
                g.title.toLowerCase().includes(searchQuery) ||
                g.sub.toLowerCase().includes(searchQuery) ||
                (g.desc && g.desc.toLowerCase().includes(searchQuery)) ||
                (g.review_quote && g.review_quote.toLowerCase().includes(searchQuery)) ||
                (searchQuery.includes('pokemon') && g.title.toLowerCase().includes('pok')) ||
                (searchQuery.includes('gameboy') && isGb) ||
                (searchQuery.includes('gb') && isGb) ||
                ((searchQuery.includes('ps1') || searchQuery.includes('playstation') || searchQuery.includes('psx')) && isPs1(g)) ||
                (searchQuery.includes('top') && isHoF) ||
                (searchQuery.includes('review') && isHoF) ||
                (searchQuery.includes('hall') && isHoF) ||
                (searchQuery.includes('fame') && isHoF) ||
                (searchQuery.includes('100') && isHoF);
            return matchFilter && matchSearch;
        });

        if (activeFilter === 'top100' || activeFilter === 'top50' || activeFilter === 'top20') {
            filtered.sort((a, b) => (a.rank || 999) - (b.rank || 999));
        } else if (activeFilter === 'gb') {
            filtered.sort((a, b) => (b.review_score ? 1 : 0) - (a.review_score ? 1 : 0) || a.title.localeCompare(b.title));
        } else if (activeFilter === 'ps1') {
            filtered.sort((a, b) => (a.rank || 999) - (b.rank || 999) || a.title.localeCompare(b.title));
        }

        if (filtered.length === 0) {
            const emptyBox = document.createElement('div');
            emptyBox.style.cssText = 'grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); font-size: 14px;';
            emptyBox.textContent = `🔍 No games found matching "${searchQuery}". Press Esc to clear search.`;
            bentoGrid.appendChild(emptyBox);
            return;
        }

        const frag = document.createDocumentFragment();

        filtered.forEach((g, idx) => {
            const card = createEl('div', `nexus-game-card ${idx === spotlightIndex ? 'spotlighted' : ''}`);
            if (/^#[0-9a-fA-F]{6}$/.test(g.color || '')) {
                card.style.background = `linear-gradient(145deg, #1a1a2e, ${g.color}18)`;
            }

            const cardTop = createEl('div', 'card-top');
            if (isPs1(g)) {
                if (!g.available) card.classList.add('card-no-disc');
                cardTop.appendChild(createEl('span', 'badge-console-ps1', g.rank ? `💿 PS1 #${g.rank}` : '💿 PS1'));
                if (!g.available) {
                    cardTop.appendChild(createEl('span', 'badge-insert-disc', 'INSERT DISC'));
                } else {
                    cardTop.appendChild(createEl('span', 'card-system-tag', g.system));
                }
            } else if ((g.top100 || g.top50 || g.top20 || g.hall_of_fame) && g.rank) {
                const rankEmoji = g.rank === 1 ? '👑' : g.rank === 2 ? '🏆' : g.rank === 3 ? '⭐' : `#${g.rank}`;
                cardTop.appendChild(createEl('span', 'card-rank-badge', `${rankEmoji} Rank ${g.rank}`));
                cardTop.appendChild(createEl('span', 'card-review-badge', g.review_score || '★ 9.5+'));
            } else if (g.gb || g.console === 'gb' || g.console === 'gbc') {
                const badgeClass = g.console === 'gbc' ? 'badge-console-gbc' : 'badge-console-gb';
                const label = g.console === 'gbc' ? 'GAME BOY COLOR' : 'GAME BOY';
                cardTop.appendChild(createEl('span', badgeClass, `🟩 ${label}`));
                if (g.review_score) {
                    cardTop.appendChild(createEl('span', 'card-review-badge', g.review_score));
                } else {
                    cardTop.appendChild(createEl('span', 'card-system-tag', g.system));
                }
            } else {
                cardTop.appendChild(createEl('span', 'card-system-tag', g.system));
                if (isMultiplayerGame(g)) {
                    cardTop.appendChild(createEl('span', 'badge-2p', '👥 2P'));
                }
            }

            const coverContainer = createEl('div', 'card-cover-container');
            const img = createEl('img', 'card-cover-img');
            img.src = g.cover || `covers/${g.id}.png`;
            img.alt = g.title;
            img.decoding = 'async';
            if (idx >= 12) img.loading = 'lazy';
            const fallback = createEl('div', 'card-cover-fallback', g.icon || '🎮');
            fallback.style.display = 'none';
            img.addEventListener('error', () => {
                img.style.display = 'none';
                fallback.style.display = 'block';
            });
            coverContainer.appendChild(img);
            coverContainer.appendChild(fallback);

            const cardFooter = createEl('div', 'card-footer');
            cardFooter.appendChild(createEl('div', 'card-title', g.title));
            cardFooter.appendChild(createEl('div', 'card-sub', g.sub));

            card.appendChild(cardTop);
            card.appendChild(coverContainer);
            card.appendChild(cardFooter);

            card.addEventListener('mouseenter', () => {
                if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
                hoverDebounceTimer = setTimeout(() => {
                    updateSpotlight(g);
                }, 40);
            });

            card.addEventListener('click', () => {
                launchGame(g);
            });

            frag.appendChild(card);
        });

        bentoGrid.appendChild(frag);

        if (filtered.length > 0 && !filtered[spotlightIndex]) {
            updateSpotlight(filtered[0], true);
        }

        updateCategoryPills();
        updateArcadeTicker();
    }

    function updateCategoryPills() {
        filterPills.forEach(pill => {
            const f = pill.dataset.filter;
            let count = 0;
            if (f === 'all') count = allGames.length;
            else if (f === 'top100' || f === 'top50' || f === 'top20') count = allGames.filter(g => g.top100 || g.top50 || g.top20 || g.hall_of_fame).length;
            else if (f === 'gb') count = allGames.filter(g => g.gb || g.console === 'gb' || g.console === 'gbc').length;
            else if (f === 'nes') count = allGames.filter(g => g.nes || g.console === 'nes').length;
            else if (f === 'ps1') count = allGames.filter(g => isPs1(g)).length;
            else if (f === 'multiplayer') count = allGames.filter(g => isMultiplayerGame(g)).length;
            else count = allGames.filter(g => g.system && g.system.toLowerCase() === f.toLowerCase()).length;
            
            let baseLabel = pill.dataset.label || pill.textContent.replace(/\s*\(\d+\)/, '').trim();
            pill.dataset.label = baseLabel;
            pill.textContent = `${baseLabel} (${count})`;
        });
    }

    // ========================================================
    // 8. Update Spotlight Hero Card & Typewriter Effect
    // ========================================================
    let typewriterTimer = null;
    function typewriterEffect(element, text, speed = 12, instant = false) {
        if (!element) return;
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        if (instant || !text) {
            element.textContent = text || '';
            return;
        }
        element.textContent = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                typewriterTimer = setTimeout(type, speed);
            } else {
                typewriterTimer = null;
            }
        }
        type();
    }

    function updateArcadeTicker() {
        const tickerTrack = document.getElementById('tickerTrack');
        if (!tickerTrack || allGames.length === 0) return;
        const topRanked = allGames
            .filter(g => g.rank && g.rank <= 10)
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 10);
        const gbPick = allGames.find(g => g.gb && g.title.toLowerCase().includes('pokemon'));
        const items = topRanked.map(g => `★ ${g.title.toUpperCase()} — #${g.rank} ALL-TIME`);
        if (gbPick) items.push(`🟩 ${gbPick.title.toUpperCase()} — GB CLASSIC`);
        items.push(`🕹️ FREE PLAY — NO COINS NEEDED`, `⚡ ${allGames.length} CARTRIDGES READY AT 60 FPS`);
        tickerTrack.textContent = items.join(' ') + ' ★ ';
    }

    function updateSpotlight(game, instantDesc = false) {
        if (!game) return;
        if (heroTitle) heroTitle.textContent = game.title;
        if (heroDesc) typewriterEffect(heroDesc, game.desc, 10, instantDesc);
        if (heroSystem) {
            heroSystem.textContent = isPs1(game)
                ? `${game.system} • PlayStation${game.available ? '' : ' • Disc not added'}`
                : `${game.system} • 60 FPS`;
        }
        if (heroAmbient && game.gradient) heroAmbient.style.background = game.gradient;

        const heroBadge = document.getElementById('spotlightBadge');
        const reviewBox = document.getElementById('spotlightReviewBox');

        if (isPs1(game) && game.rank) {
            if (heroBadge) {
                heroBadge.className = 'spotlight-pill hall-of-fame';
                heroBadge.textContent = `💿 PS1 HALL OF FAME #${game.rank}`;
                heroBadge.style = '';
            }
            if (reviewBox) {
                reviewBox.style.display = 'flex';
                reviewBox.textContent = '';
                reviewBox.appendChild(createEl('span', 'spotlight-review-score', game.available ? '▶ READY TO PLAY' : '💿 INSERT DISC'));
                reviewBox.appendChild(createEl('span', 'spotlight-review-quote', game.available
                    ? `"${game.review_quote || game.desc}"`
                    : `Add your disc image to roms/ps1/ — e.g. ${(game.disc_hint || '').replace(/^roms\/ps1\//, '')}`));
            }
        } else if ((game.top100 || game.top50 || game.top20 || game.hall_of_fame) && game.rank) {
            if (heroBadge) {
                heroBadge.className = 'spotlight-pill hall-of-fame';
                heroBadge.textContent = `👑 HALL OF FAME #${game.rank}`;
                heroBadge.style = '';
            }
            if (reviewBox) {
                reviewBox.style.display = 'flex';
                reviewBox.textContent = '';
                reviewBox.appendChild(createEl('span', 'spotlight-review-score', game.review_score || '★ 10/10 Masterpiece'));
                reviewBox.appendChild(createEl('span', 'spotlight-review-quote', `"${game.review_quote || game.desc}"`));
            }
        } else {
            if (heroBadge) {
                heroBadge.className = 'spotlight-pill';
                heroBadge.textContent = 'FEATURED TITLE';
                heroBadge.style.cssText = 'background: rgba(139, 92, 246, 0.15); color: var(--accent-violet); border-color: rgba(139, 92, 246, 0.3);';
            }
            if (reviewBox) {
                reviewBox.style.display = 'none';
                reviewBox.textContent = '';
            }
        }

        const spotlightCoverImg = document.getElementById('spotlightCoverImg');
        if (spotlightCoverImg) {
            const coverSrc = game.cover || `covers/${game.id}.png`;
            if (!spotlightCoverImg.src.endsWith(coverSrc)) {
                spotlightCoverImg.style.opacity = '0.35';
                spotlightCoverImg.src = coverSrc;
                spotlightCoverImg.onload = () => { spotlightCoverImg.style.opacity = '1'; };
            }
        }

        if (btnPlayHero) {
            btnPlayHero.onclick = () => launchGame(game);
        }
    }

    // ========================================================
    // 9. Launch Game in Cinema Viewport (Mobile + Desktop Fullscreen)
    // ========================================================
    function launchGame(game) {
        if (!game) return;
        const ps1 = isPs1(game);
        // PS1 Hall of Fame titles without a disc still open the player, which explains how to add one.
        const ps1Missing = ps1 && !game.available;
        if (!ps1Missing && !isSafeRomPath(game.rom)) return;
        audio.playLaunch();

        if (cinemaTitle) cinemaTitle.textContent = `${game.title} [${ps1 ? 'PS1' : game.system}]`;

        if (cinemaFrame) {
            const titleParam = `title=${encodeURIComponent(game.title)}`;
            if (ps1Missing) {
                cinemaFrame.src = `ps1.html?${titleParam}&hint=${encodeURIComponent(game.disc_hint || '')}`;
            } else if (ps1) {
                cinemaFrame.src = `ps1.html?rom=${encodeURIComponent(game.rom)}&${titleParam}`;
            } else {
                cinemaFrame.src = `player.html?rom=${encodeURIComponent(game.rom)}&${titleParam}`;
            }
        }

        if (cinemaModal) {
            cinemaModal.classList.remove('is-fullscreen');
            cinemaModal.classList.add('open');
        }
    }

    function setCinemaFullscreen(enable) {
        if (!cinemaModal) return;
        cinemaModal.classList.toggle('is-fullscreen', enable);
        if (enable) {
            const target = cinemaModal;
            if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
            else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
        } else {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    function closeCinema() {
        setCinemaFullscreen(false);
        if (cinemaModal) cinemaModal.classList.remove('open');
        if (cinemaFrame) cinemaFrame.src = 'about:blank';
    }

    if (btnCloseCinema) btnCloseCinema.addEventListener('click', closeCinema);
    if (btnFullscreenCinema) {
        btnFullscreenCinema.addEventListener('click', () => {
            const next = !(cinemaModal && cinemaModal.classList.contains('is-fullscreen'));
            setCinemaFullscreen(next);
        });
    }
    const btnExitFullscreenFloat = document.getElementById('btnExitFullscreenFloat');
    if (btnExitFullscreenFloat) {
        btnExitFullscreenFloat.addEventListener('click', () => setCinemaFullscreen(false));
    }
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && cinemaModal && cinemaModal.classList.contains('is-fullscreen')) {
            // Keep CSS theater fullscreen until user taps Exit if native exited, or sync cleanly
        }
    });

    // ========================================================
    // 9. Interactive Showcase & Surprise Pick
    // ========================================================
    function pickRandomGame() {
        if (allGames.length === 0) return;
        const randomIdx = Math.floor(Math.random() * allGames.length);
        const chosen = allGames[randomIdx];
        updateSpotlight(chosen);
        audio.playFocus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (btnRandomSpotlight) btnRandomSpotlight.addEventListener('click', pickRandomGame);

    if (btnConsoleShowcase) {
        btnConsoleShowcase.addEventListener('click', () => {
            const targetFilter = activeFilter === 'gb' ? 'nes' : 'gb';
            const pill = Array.from(filterPills).find(p => p.dataset.filter === targetFilter);
            if (pill) pill.click();
        });
    }

    // ========================================================
    // 10. Category Filter Pills
    // ========================================================
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeFilter = pill.dataset.filter;
            spotlightIndex = 0;
            renderBentoGrid();
            audio.playFocus();
        });
    });

    // ========================================================
    // 13. Command Palette Modal (Ctrl+K / Cmd+K)
    // ========================================================
    function openPalette() {
        if (!cmdPaletteBackdrop) return;
        cmdPaletteBackdrop.classList.add('open');
        if (cmdInput) {
            cmdInput.value = '';
            cmdInput.focus();
        }
        renderPaletteResults('');
    }

    function closePalette() {
        if (!cmdPaletteBackdrop) return;
        cmdPaletteBackdrop.classList.remove('open');
    }

    function renderPaletteResults(query) {
        if (!cmdResults) return;
        cmdResults.textContent = '';
        const q = query.trim().toLowerCase();

        // Built-in commands
        const commands = [
            { title: '⭐ Show Top 100 Hall of Fame', desc: 'Browse the 100 greatest games of all time according to reviews', action: () => {
                const topBtn = Array.from(filterPills).find(p => p.dataset.filter === 'top100' || p.dataset.filter === 'top50' || p.dataset.filter === 'top20');
                if (topBtn) topBtn.click();
            }},
            { title: '🟩 Show Game Boy & GBC Games', desc: 'Play Pokémon, Zelda, Mario Land, and classic handheld games', action: () => {
                const gbBtn = Array.from(filterPills).find(p => p.dataset.filter === 'gb');
                if (gbBtn) gbBtn.click();
            }},
            { title: '🎮 Show All NES / Famicom Games', desc: 'Browse 222 authentic NES cartridges', action: () => {
                const nesBtn = Array.from(filterPills).find(p => p.dataset.filter === 'nes');
                if (nesBtn) nesBtn.click();
            }},
            { title: '🎲 Pick Surprise Game', desc: 'Select and highlight a random retro classic', action: () => pickRandomGame() },
            { title: '🔗 Join 2-Player Room', desc: 'Enter a 6-character Room Code to play with a friend on another device', action: () => openJoinModal() },
            { title: '🔄 Rescan ROMs Folder', desc: 'Check for newly added .nes, .gb, .gbc games in /roms', action: () => triggerRescan() }
        ];

        const frag = document.createDocumentFragment();

        commands.forEach(cmd => {
            if (!q || cmd.title.toLowerCase().includes(q) || cmd.desc.toLowerCase().includes(q)) {
                const item = createEl('div', 'palette-item');
                const left = createEl('div', 'palette-item-left');
                const txt = createEl('div');
                txt.appendChild(createEl('div', 'palette-item-title', cmd.title));
                txt.appendChild(createEl('div', 'palette-item-desc', cmd.desc));
                left.appendChild(txt);
                item.appendChild(left);
                item.appendChild(createEl('span', 'kbd-shortcut', '↵'));
                item.addEventListener('click', () => {
                    closePalette();
                    cmd.action();
                });
                frag.appendChild(item);
            }
        });

        // Game results (capped at 60 items during typing for instant responsiveness)
        let shown = 0;
        for (const g of allGames) {
            if (!q || g.title.toLowerCase().includes(q) || g.sub.toLowerCase().includes(q) || g.system.toLowerCase().includes(q)) {
                const item = createEl('div', 'palette-item');
                const left = createEl('div', 'palette-item-left');
                const thumb = createEl('img', 'palette-item-thumb');
                thumb.src = g.cover || `covers/${g.id}.png`;
                thumb.alt = g.title;
                thumb.decoding = 'async';
                const iconFallback = createEl('span', 'palette-item-icon', g.icon || '🎮');
                iconFallback.style.display = 'none';
                thumb.addEventListener('error', () => {
                    thumb.style.display = 'none';
                    iconFallback.style.display = 'inline-block';
                });
                const txt = createEl('div');
                txt.appendChild(createEl('div', 'palette-item-title', g.title));
                txt.appendChild(createEl('div', 'palette-item-desc', `${g.system} • ${g.sub}`));
                left.appendChild(thumb);
                left.appendChild(iconFallback);
                left.appendChild(txt);
                item.appendChild(left);
                item.appendChild(createEl('span', 'kbd-shortcut', 'Play'));
                item.addEventListener('click', () => {
                    closePalette();
                    launchGame(g);
                });
                frag.appendChild(item);
                shown++;
                if (shown >= 60) break;
            }
        }
        cmdResults.appendChild(frag);
    }

    if (searchTrigger) searchTrigger.addEventListener('click', openPalette);
    if (cmdPaletteBackdrop) {
        cmdPaletteBackdrop.addEventListener('click', (e) => {
            if (e.target === cmdPaletteBackdrop) closePalette();
        });
    }
    if (cmdInput) {
        cmdInput.addEventListener('input', (e) => {
            renderPaletteResults(e.target.value);
        });
    }

    // ========================================================
    // 13b. Join 2-Player Room Modal
    // ========================================================
    const joinBackdrop = document.getElementById('nexusJoinBackdrop');
    const btnJoinRoomModal = document.getElementById('btnJoinRoomModal');
    const btnCloseJoinModal = document.getElementById('btnCloseJoinModal');
    const joinRoomInput = document.getElementById('joinRoomInput');
    const joinRoomError = document.getElementById('joinRoomError');
    const btnJoinAsGuest = document.getElementById('btnJoinAsGuest');
    const btnJoinAsController = document.getElementById('btnJoinAsController');

    function openJoinModal() {
        if (!joinBackdrop) return;
        joinBackdrop.classList.add('open');
        if (joinRoomError) joinRoomError.textContent = '';
        if (joinRoomInput) {
            joinRoomInput.value = '';
            joinRoomInput.focus();
        }
    }

    function closeJoinModal() {
        if (joinBackdrop) joinBackdrop.classList.remove('open');
    }

    async function joinRoomByMode(targetMode) {
        const code = ((joinRoomInput && joinRoomInput.value) || '').toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
        if (code.length < 4) {
            if (joinRoomError) joinRoomError.textContent = 'Enter a valid Room Code!';
            return;
        }
        if (joinRoomError) joinRoomError.textContent = 'Checking room...';
        try {
            const res = await fetch(`/api/room?code=${encodeURIComponent(code)}&t=${Date.now()}`);
            const info = await res.json();
            if (!info.exists || !isSafeRomPath(info.rom)) {
                if (joinRoomError) joinRoomError.textContent = info.error || `Room "${code}" not found or host closed it.`;
                return;
            }
            if (targetMode === 'controller') {
                window.location.href = `controller.html?room=${encodeURIComponent(code)}`;
            } else {
                closeJoinModal();
                if (cinemaTitle) cinemaTitle.textContent = `${info.title} [P2 GUEST]`;
                if (cinemaFrame) {
                    cinemaFrame.src = `player.html?rom=${encodeURIComponent(info.rom)}&title=${encodeURIComponent(info.title)}&room=${encodeURIComponent(code)}&role=guest`;
                }
                if (cinemaModal) {
                    cinemaModal.classList.remove('is-fullscreen');
                    cinemaModal.classList.add('open');
                }
            }
        } catch (err) {
            if (joinRoomError) joinRoomError.textContent = 'Network error checking room.';
        }
    }

    const brandHomeEl = document.getElementById('brandHome');
    if (brandHomeEl) {
        brandHomeEl.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (btnJoinRoomModal) btnJoinRoomModal.addEventListener('click', openJoinModal);
    if (btnCloseJoinModal) btnCloseJoinModal.addEventListener('click', closeJoinModal);
    if (joinBackdrop) {
        joinBackdrop.addEventListener('click', (e) => {
            if (e.target === joinBackdrop) closeJoinModal();
        });
    }
    if (btnJoinAsGuest) btnJoinAsGuest.addEventListener('click', () => joinRoomByMode('guest'));
    if (btnJoinAsController) btnJoinAsController.addEventListener('click', () => joinRoomByMode('controller'));
    if (joinRoomInput) {
        joinRoomInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') joinRoomByMode('guest');
        });
    }

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (cmdPaletteBackdrop && cmdPaletteBackdrop.classList.contains('open')) closePalette();
            else openPalette();
            return;
        }

        if (e.key === 'Escape') {
            if (cmdPaletteBackdrop && cmdPaletteBackdrop.classList.contains('open')) closePalette();
            if (joinBackdrop && joinBackdrop.classList.contains('open')) closeJoinModal();
            if (cinemaModal && cinemaModal.classList.contains('open')) closeCinema();
        }
    });

    function triggerRescan() {
        audio.playFocus();
        const rescanBtn = document.getElementById('btnRescanLibrary');
        if (rescanBtn) rescanBtn.textContent = '🔄 Scanning...';
        fetch('/api/rescan?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    serverGames = data;
                    allGames = [...serverGames];
                    renderBentoGrid();
                    audio.playSuccess();
                }
            })
            .catch(() => fetchServerGames(true))
            .finally(() => {
                if (rescanBtn) rescanBtn.textContent = '🔄 RESCAN';
            });
    }

    const btnRescan = document.getElementById('btnRescanLibrary');
    if (btnRescan) btnRescan.addEventListener('click', triggerRescan);

    // ========================================================
    // 14. Initial Bootstrap
    // ========================================================
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam) {
        activeFilter = filterParam;
        filterPills.forEach(p => {
            if (p.dataset.filter === filterParam) p.classList.add('active');
            else p.classList.remove('active');
        });
    }

    renderBentoGrid();
    fetchServerGames(false);
    if (allGames.length > 0) updateSpotlight(allGames[0], true);

})();
