#!/bin/bash
set -e

if systemctl --user status linuxgsm-webui.service > /dev/null 2>&1; then
	systemctl --user stop linuxgsm-webui.service
else
	pkill -f "node dist/index.js" || true
fi

echo "LinuxGSM Web UI stopped."
