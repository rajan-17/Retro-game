#!/usr/bin/env bash
/home/ubuntu/cloudflared tunnel --url http://localhost:8080 2>&1 | while IFS= read -r line; do
    echo "$line"
    if [[ "$line" =~ (https://[-a-zA-Z0-9@:%._\+~#=]+\.trycloudflare\.com) ]]; then
        echo "${BASH_REMATCH[1]}" > /home/ubuntu/ascii-platformer/public_url.txt
        echo "FOUND_PUBLIC_URL: ${BASH_REMATCH[1]}"
    fi
done
