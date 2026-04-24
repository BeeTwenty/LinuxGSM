#!/bin/bash
set -e

if systemctl --user status linuxgsm-webui.service > /dev/null 2>&1; then
	systemctl --user status linuxgsm-webui.service
else
	pgrep -f "node dist/index.js" > /dev/null && echo "Web UI running" || echo "Web UI not running"
fi
