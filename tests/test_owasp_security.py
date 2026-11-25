#!/usr/bin/env python3
"""
Automated CI Security & Functional Verification Suite for Nexus Retro Arcade.
Boots server.py on an isolated test port and verifies OWASP Top 10 defenses,
strict CSP, API integrity, and WebSocket multiplayer room controls.
"""

import base64
import json
import os
import re
import socket
import struct
import subprocess
import sys
import time
import urllib.error
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEST_PORT = 18080
BASE_URL = f"http://127.0.0.1:{TEST_PORT}"


def wait_for_server(timeout=10.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{BASE_URL}/api/games", timeout=1) as r:
                if r.status == 200:
                    return
        except Exception:
            time.sleep(0.2)
    raise RuntimeError("Test server failed to start in time")


def ws_connect(origin=f"http://localhost:{TEST_PORT}"):
    s = socket.create_connection(("127.0.0.1", TEST_PORT), timeout=5)
    key = base64.b64encode(os.urandom(16)).decode()
    req = (
        f"GET /ws HTTP/1.1\r\n"
        f"Host: localhost:{TEST_PORT}\r\n"
        f"Origin: {origin}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(req.encode())
    buf = b""
    while b"\r\n\r\n" not in buf:
        chunk = s.recv(4096)
        if not chunk:
            break
        buf += chunk
    return s, buf


def ws_send(s, obj):
    data = json.dumps(obj).encode("utf-8")
    mask = os.urandom(4)
    if len(data) < 126:
        hdr = bytearray([0x81, 0x80 | len(data)])
    else:
        hdr = bytearray([0x81, 0x80 | 126]) + struct.pack("!H", len(data))
    masked = bytes(data[i] ^ mask[i % 4] for i in range(len(data)))
    s.sendall(bytes(hdr) + mask + masked)


def ws_recv(s):
    hdr = s.recv(2)
    length = hdr[1] & 0x7F
    if length == 126:
        length = struct.unpack("!H", s.recv(2))[0]
    payload = b""
    while len(payload) < length:
        payload += s.recv(length - len(payload))
    return json.loads(payload.decode("utf-8"))


def run_suite():
    env = dict(os.environ)
    env["NEXUS_BIND_HOST"] = "127.0.0.1"
    proc = subprocess.Popen(
        [sys.executable, os.path.join(BASE_DIR, "server.py"), str(TEST_PORT)],
        cwd=BASE_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    try:
        wait_for_server()

        # 1. A01: Sensitive / traversal / directory-listing paths must return 403/404
        blocked_paths = [
            "/server.py",
            "/run_game_daemon.sh",
            "/ascii-game.service",
            "/.github/workflows/ci-cd.yml",
            "/.git/config",
            "/scripts/",
            "/scripts/fetch_official_covers.py",
            "/tests/",
            "/roms/",
            "/covers/",
            "/js/ps5.js",
            "/security.log",
            "/public_url.txt",
            "/../../etc/passwd",
            "/%2e%2e/etc/passwd",
            # PlayStation additions: source, BIOS dir, placeholders and traversal out of roms/ps1/
            "/ps1_catalog.py",
            "/scripts/fetch_ps1_covers.py",
            "/bios/",
            "/bios/.gitkeep",
            "/bios/evil.bin",
            "/roms/ps1/",
            "/roms/ps1/.gitkeep",
            "/roms/ps1/..%2F..%2Fserver.py",
            "/emulatorjs/",
            "/emulatorjs/data/LICENSE",
        ]
        for p in blocked_paths:
            try:
                urllib.request.urlopen(BASE_URL + p, timeout=3)
                raise AssertionError(f"SECURITY FAIL: {p} returned 200 instead of 403!")
            except urllib.error.HTTPError as e:
                assert e.code in (403, 404), f"Unexpected status {e.code} for {p}"
        print(f"[PASS] A01: Blocked {len(blocked_paths)} sensitive/traversal paths")

        # 2. A05/A03: Security Headers + Strict CSP (no inline scripts/onerror)
        for page in ["/", "/index.html", "/player.html", "/controller.html"]:
            with urllib.request.urlopen(BASE_URL + page, timeout=4) as r:
                assert r.status == 200
                hdrs = {k.lower(): v for k, v in r.headers.items()}
                assert "python" not in hdrs.get("server", "").lower(), hdrs.get("server")
                assert hdrs.get("x-content-type-options") == "nosniff"
                assert hdrs.get("x-frame-options") == "SAMEORIGIN"
                assert hdrs.get("referrer-policy") == "no-referrer"
                csp = hdrs.get("content-security-policy", "")
                assert "script-src 'self'" in csp, csp
                assert "unsafe-eval" not in csp, csp
                body = r.read().decode("utf-8")
                assert not re.search(r"<script(?![^>]*\bsrc=)[^>]*>", body, re.I), f"Inline script in {page}"
                assert "onerror=" not in body.lower(), f"Inline onerror in {page}"
        print("[PASS] A05/A03: Strict CSP & OWASP security headers verified on all pages")

        # 2b. PS1 player: EmulatorJS needs eval/WebAssembly/blob workers, so it gets a looser CSP.
        # That relaxation must stay scoped to /ps1.html + /emulatorjs/ and never leak elsewhere.
        for page in ["/ps1.html", "/emulatorjs/data/loader.js"]:
            with urllib.request.urlopen(BASE_URL + page, timeout=4) as r:
                assert r.status == 200, page
                hdrs = {k.lower(): v for k, v in r.headers.items()}
                csp = hdrs.get("content-security-policy", "")
                assert "script-src 'self' blob:" in csp and "'wasm-unsafe-eval'" in csp, csp
                assert "frame-ancestors 'self'" in csp and "object-src 'none'" in csp, csp
                assert "http:" not in csp and "https:" not in csp, f"PS1 CSP allows remote origins: {csp}"
                assert hdrs.get("x-content-type-options") == "nosniff"
                if page.endswith(".html"):
                    body = r.read().decode("utf-8")
                    assert not re.search(r"<script(?![^>]*\bsrc=)[^>]*>", body, re.I), "Inline script in /ps1.html"
        with urllib.request.urlopen(BASE_URL + "/api/ps1", timeout=4) as r:
            assert "bios" in json.loads(r.read().decode("utf-8"))
        print("[PASS] A05: PS1 emulator CSP relaxation is scoped to /ps1.html + /emulatorjs/ only")

        # 3. Functional API & Active Assets
        # Catalog = 247 NES/Famicom/Game Boy titles + the 50-entry PS1 Hall of Fame (always listed,
        # even before discs are added). Extra local PS1 discs (git-ignored) may add more entries.
        with urllib.request.urlopen(BASE_URL + "/api/games", timeout=4) as r:
            games = json.loads(r.read().decode("utf-8"))
        retro = [g for g in games if not g.get("ps1")]
        ps1_hof = [g for g in games if g.get("ps1_top50")]
        assert len(retro) == 247, f"Expected 247 NES/GB games, got {len(retro)}"
        assert len(ps1_hof) == 50, f"Expected 50 PS1 Hall of Fame entries, got {len(ps1_hof)}"
        assert sorted(g["rank"] for g in ps1_hof) == list(range(1, 51)), "PS1 Hall of Fame ranks must be 1..50"
        assert len({g["id"] for g in games}) == len(games), "Duplicate game ids in catalog"
        for asset in ["/js/nexus.js", "/js/player.js", "/js/controller.js", "/js/netplay.js", "/js/qr.js", "/css/nexus.css"]:
            with urllib.request.urlopen(BASE_URL + asset, timeout=4) as r:
                assert r.status == 200, f"Asset {asset} failed"
        print(f"[PASS] Functional: 247 NES/GB + 50 PS1 Hall of Fame ({len(games)} total) & all active assets verified")

        # 4. A07: CSWSH Origin check
        s_evil, resp_evil = ws_connect(origin="https://evil.attacker")
        s_evil.close()
        assert b"403" in resp_evil, f"Expected 403 CSWSH rejection, got {resp_evil}"
        print("[PASS] A07: Cross-Site WebSocket Hijacking Origin rejected (403)")

        # 5. A02/A03: WebSocket 6-char room + ROM injection defense + P2 input relay
        c1, h1 = ws_connect()
        assert b"101" in h1, h1
        ws_send(c1, {"type": "create_room", "rom": "https://evil.com/evil.nes", "title": "<script>x</script>"})
        err = ws_recv(c1)
        assert err.get("type") == "error", err

        ws_send(c1, {"type": "create_room", "rom": "roms/Contra (USA).nes", "title": "Contra"})
        created = ws_recv(c1)
        assert created.get("type") == "room_created" and len(created.get("code", "")) == 6, created
        code = created["code"]

        with urllib.request.urlopen(f"{BASE_URL}/api/room?code={code}", timeout=3) as r:
            room_info = json.loads(r.read().decode("utf-8"))
            assert room_info.get("exists") is True and room_info.get("code") == code, room_info

        c2, h2 = ws_connect()
        assert b"101" in h2, h2
        ws_send(c2, {"type": "join_room", "code": code, "clientType": "guest"})
        joined = ws_recv(c2)
        assert joined.get("type") == "room_joined"
        _ = ws_recv(c1)  # peer_joined

        ws_send(c2, {"type": "input", "player": 2, "btn": 4, "pressed": True})
        relayed = ws_recv(c1)
        assert relayed.get("player") == 2 and relayed.get("btn") == 4 and relayed.get("pressed") is True

        c1.close()
        c2.close()
        print(f"[PASS] A02/A03: Malicious ROM blocked, 6-char room ({code}) & P2 relay verified")
        print("=== CI SECURITY & FUNCTIONAL SUITE PASSED ===")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


if __name__ == "__main__":
    run_suite()
