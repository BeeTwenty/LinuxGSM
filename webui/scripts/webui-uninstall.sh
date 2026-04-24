#!/bin/bash
set -e

if systemctl --user status linuxgsm-webui.service > /dev/null 2>&1; then
	systemctl --user stop linuxgsm-webui.service
	systemctl --user disable linuxgsm-webui.service
	rm -f /etc/systemd/system/linuxgsm-webui.service
fi

cd "$(dirname "$0")/.."
rm -rf backend/node_modules backend/dist frontend/node_modules frontend/dist

echo "LinuxGSM Web UI uninstalled."
