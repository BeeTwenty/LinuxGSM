#!/bin/bash
set -e

if systemctl --user status linuxgsm-webui.service >/dev/null 2>&1; then
  systemctl --user restart linuxgsm-webui.service
else
  pkill -f "node dist/index.js" || true
  cd "$(dirname "$0")/../backend"
  npm run start &
fi

echo "LinuxGSM Web UI restarted."
