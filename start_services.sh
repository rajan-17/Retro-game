#!/usr/bin/env bash
# Kill any existing instances first
pkill -f "python3 -m http.server 8080" 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true
sleep 1

# Start HTTP server
nohup python3 -m http.server 8080 --directory /home/ubuntu/ascii-platformer </dev/null >/home/ubuntu/ascii-platformer/http.log 2>&1 &
disown

# Start Cloudflare tunnel
nohup /home/ubuntu/ascii-platformer/run_tunnel.sh </dev/null >/home/ubuntu/ascii-platformer/tunnel.log 2>&1 &
disown

sleep 4

# Check health
curl -s -I http://127.0.0.1:8080/ | head -n 1
cat /home/ubuntu/ascii-platformer/public_url.txt 2>/dev/null || true
