# 🕹️ Nexus Retro Arcade

A high-speed, browser-based **Multi-Console Retro Arcade** with an authentic 1980s CRT cabinet interface, official box art for **247 NES / Famicom / Game Boy / Game Boy Color titles**, two-device online & wireless multiplayer, and OWASP Top 10 security hardening.

---

## ✨ Key Features

- **247 Classic Titles**: Pre-configured catalog of **222 NES / Famicom** and **25 Game Boy / Game Boy Color** classics with authentic retail box art (`covers/`) and ranked *Top 100 Hall of Fame* metadata.
- **80s CRT Arcade UI**: Pixel typography (`Press Start 2P` + `VT323`), scanline overlay, hard-shadow arcade buttons, `INSERT COIN` attract mode, Hall of Fame scoreboard, scrolling ticker, and `Ctrl+K` command palette.
- **2-Device Multiplayer**:
  - **2-Screen Online Play**: Host streams live 60 FPS video & WebAudio to a second device over **WebRTC P2P** (`canvas.captureStream(60)` + unordered `RTCDataChannel`), with automatic WebSocket frame relay fallback behind strict mobile NATs.
  - **Wireless Phone Controller (`controller.html`)**: Scan an inline QR code or enter the 6-character Room Code on a phone to use it as a multi-touch, haptic wireless gamepad.
- **60 FPS Emulation & Zero-Lag Audio**: Powered locally in-browser by `jsnes` and `gameboy.min.js` using an O(1) circular ring buffer (`Float32Array`), 60 Hz frame pacing, hardware Gamepad API support, and responsive touch controls (portrait & landscape + Theater Fullscreen).
- **OWASP Top 10 Hardened Backend (`server.py`)**:
  - Pure Python 3 stdlib `ThreadingHTTPServer` + RFC 6455 `/ws` WebSocket room relay (zero third-party pip dependencies).
  - Strict static allowlist + canonical path traversal blocking, disabled directory listings, strict `Content-Security-Policy: script-src 'self'`, CSWSH `Origin` validation on WebSockets, sliding-window IP rate limiting, and `security.log` auditing.

---

## 💿 PlayStation (PS1) + Top 50 Hall of Fame

PS1 games run in the browser via [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) 4.2.3 (GPL-3.0, vendored in `emulatorjs/data/`) using the **PCSX-ReARMed** core.

- The **💿 PS1 Top 50 Hall of Fame** filter lists 50 classics (`ps1_catalog.py`) with box art. The ranking is an editorial consensus, not one publication's list.
- **No games are included.** Copy your own disc backups into `roms/ps1/`. They're detected within ~5 seconds and matched to the Hall of Fame by filename (e.g. `Final Fantasy VII (USA) (Disc 1).chd`).
- Formats: **`.chd` (recommended)**, `.pbp`, `.iso`, single-track `.bin`/`.img`, or a `.zip`/`.7z` containing a `.cue` + `.bin` set.
- **Free homebrew to test with** (downloaded from each author's GitHub releases into `roms/ps1/`):
  - [Cave Story PS1 port (DoukutsuPSX)](https://github.com/fgsfdsfgs/doukutsupsx/releases): `doukutsu_r7_us.iso`
  - [Tetrade](https://github.com/Logan-Campbell/Tetrade/releases) (MIT): `TETRADE_PSX.bin`
  - [BuzzyBee](https://github.com/NDR008/BuzzyBee/releases): keep the release `.zip` as-is (it has a CD-audio track that needs its `.cue`)
  - [240p Test Suite](https://github.com/filipalac/240pTestSuite-PS1/releases) (GPL-2.0): video/controller test tool
- **BIOS (optional, recommended):** put your own `scph5501.bin` (or `scph1001.bin` / `scph7001.bin` / `scph101.bin`) in `bios/`. Without it, the core uses its built-in HLE BIOS, which runs most games.
- Multi-disc games boot disc 1. Use a single multi-disc `.pbp`, or swap discs from the EmulatorJS menu.
- `roms/ps1/` and `bios/` are git-ignored.
- PS1 games support local controls and gamepads only. The 2-device streaming / phone controller is NES-only for now.
- Refresh box art with `python scripts/fetch_ps1_covers.py` (uses libretro-thumbnails).

---

## 🚀 Quick Start

```bash
# 1. Start the hardened server (binds strictly to 127.0.0.1:8080 by default)
python3 server.py 8080

# 2. Open in your browser
# http://127.0.0.1:8080
```

> To expose securely over HTTPS/WSS worldwide, point a Cloudflare Tunnel (`cloudflared tunnel --url http://localhost:8080`) at port `8080`.

---

## 🎮 Controls

| Action | Keyboard | Hardware / Touch |
| :--- | :--- | :--- |
| Move | `Arrow Keys` / `WASD` | D-Pad |
| **A** Button | `Space` / `Z` / `K` | **A** |
| **B** Button | `X` / `J` | **B** |
| **Select** | `Shift` / `C` | `SELECT` |
| **Start** | `Enter` / `P` | `START` |
| Quick Search | `Ctrl+K` / `Cmd+K` | `🔍` Button |
| 2-Player Room | Click `👥 2P` inside player | `🔗 JOIN 2P` on homepage |

---

## 🔄 GitHub Actions CI/CD Pipeline

Every push and pull request to `main` automatically runs [ci-cd.yml](.github/workflows/ci-cd.yml):
1. **CI Gate (`ci-test`)**: Validates Python/JS syntax and executes `tests/test_owasp_security.py` (testing A01 path blocking, strict `script-src 'self'` CSP, OWASP headers, CSWSH `Origin` rejection, 6-char room codes, and WebSocket P2 input relay).
2. **CD Auto-Deploy (`deploy`)**: On pushes to `main`, deploys to the VPS via SSH and restarts `ascii-game.service` automatically once `DEPLOY_HOST`, `DEPLOY_USER`, and `DEPLOY_SSH_KEY` are added under **GitHub Settings → Secrets and variables → Actions**.

