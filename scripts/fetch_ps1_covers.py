#!/usr/bin/env python3
"""Download box art for the PS1 Top 50 Hall of Fame (plus any extra discs in roms/ps1/)
from the libretro-thumbnails project into covers/ps1-<id>.png.

Usage:  python scripts/fetch_ps1_covers.py [--force]
"""
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
import ps1_catalog  # noqa: E402

COVERS_DIR = os.path.join(BASE_DIR, 'covers')
REPO = 'libretro-thumbnails/Sony_-_PlayStation'
RAW = f'https://raw.githubusercontent.com/{REPO}/master/Named_Boxarts/'
UA = {'User-Agent': 'nexus-arcade-cover-fetcher'}
MAX_HEIGHT = 512
PNG_MAGIC = bytes([0x89]) + b'PNG'
SKIP_TAGS = re.compile(r'\([^)]*(?:demo|beta|proto|sample|sampler|interactive|kiosk|preview)', re.IGNORECASE)


def get_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.loads(r.read().decode())


def list_boxarts():
    root = get_json(f'https://api.github.com/repos/{REPO}/git/trees/master')
    sha = next(x['sha'] for x in root['tree'] if x['path'] == 'Named_Boxarts')
    return [x['path'] for x in get_json(f'https://api.github.com/repos/{REPO}/git/trees/{sha}')['tree']]


def score(name):
    """Lower is better: prefer USA, non-demo, disc 1, original revision."""
    s = 0
    if '(USA)' not in name:
        s += 10
    if SKIP_TAGS.search(name):
        s += 100
    m = re.search(r'\(Disc (\d+)\)', name)
    if m:
        s += int(m.group(1)) - 1
    if '(Rev' in name:
        s += 0.5
    return s


def best_names(boxarts):
    by_id = {}
    for name in boxarts:
        hit = ps1_catalog._match_top50(ps1_catalog._slug(name))
        if hit and (hit['id'] not in by_id or score(name) < score(by_id[hit['id']])):
            by_id[hit['id']] = name
    return by_id


def fetch(name):
    with urllib.request.urlopen(urllib.request.Request(RAW + urllib.parse.quote(name), headers=UA), timeout=30) as r:
        return r.read()


def save_png(data, dest):
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(data)).convert('RGB')
        if img.height > MAX_HEIGHT:
            img = img.resize((round(img.width * MAX_HEIGHT / img.height), MAX_HEIGHT), Image.LANCZOS)
        img.save(dest, 'PNG', optimize=True)
    except ImportError:
        with open(dest, 'wb') as fp:
            fp.write(data)


def main():
    force = '--force' in sys.argv
    os.makedirs(COVERS_DIR, exist_ok=True)
    picks = best_names(list_boxarts())
    ok = missing = 0
    for item in ps1_catalog.TOP_50_PS1:
        dest = os.path.join(COVERS_DIR, f"{item['id']}.png")
        if os.path.exists(dest) and not force:
            ok += 1
            continue
        name = picks.get(item['id'])
        if not name:
            print(f"  no box art found: {item['title']}")
            missing += 1
            continue
        try:
            data = fetch(name)
            # libretro-thumbnails stores duplicates as git symlinks: the "file" is the target's name.
            for _ in range(3):
                if data.startswith(PNG_MAGIC) or len(data) > 512:
                    break
                name = data.decode('utf-8').strip()
                data = fetch(name)
            save_png(data, dest)
            print(f"  #{item['rank']:>2} {item['title']}  <-  {name}")
            ok += 1
        except Exception as e:
            print(f"  failed {item['title']}: {e}")
            missing += 1
    print(f"Done: {ok} covers ready, {missing} missing.")


if __name__ == '__main__':
    main()
