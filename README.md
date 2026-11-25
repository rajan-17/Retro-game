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

