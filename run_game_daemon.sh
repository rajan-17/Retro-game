#!/usr/bin/env bash
# Trap termination signals to clean up child processes
trap 'kill $(jobs -p) 2>/dev/null; exit 0' SIGTERM SIGINT EXIT

# Start Dynamic Nexus Python Server with Auto-ROM Watcher
python3 /home/ubuntu/ascii-platformer/server.py 8080 &
HTTP_PID=$!

echo "Started Nexus Server on PID $HTTP_PID"

# Run Cloudflare tunnel and log public URL
/home/ubuntu/cloudflared tunnel --url http://localhost:8080 2>&1 | while IFS= read -r line; do
    echo "$line"
    if [[ "$line" =~ (https://[-a-zA-Z0-9@:%._\+~#=]+\.trycloudflare\.com) ]]; then
        echo "${BASH_REMATCH[1]}" > /home/ubuntu/ascii-platformer/public_url.txt
        echo ">>> LIVE_PUBLIC_URL: ${BASH_REMATCH[1]}"
    fi
done

kill $HTTP_PID 2>/dev/null || true
