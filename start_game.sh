#!/usr/bin/env bash
PORT=8080
echo "=========================================================="
echo " Starting Terminal Jumper: ASCII Odyssey"
echo " Open in your browser: http://localhost:${PORT}"
echo " Press Ctrl+C to stop the server"
echo "=========================================================="
python3 -m http.server ${PORT} --directory /home/ubuntu/ascii-platformer
