#!/bin/bash
set -e

cd "$(dirname "$0")/.."

if systemctl --user status linuxgsm-webui.service > /dev/null 2>&1; then
	systemctl --user start linuxgsm-webui.service
else
	cd backend
	npm run start &
fi

echo "LinuxGSM Web UI started."
