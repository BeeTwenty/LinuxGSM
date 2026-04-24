#!/bin/bash
set -e

# LinuxGSM Web UI install script
# Usage: ./gameserver webui-install

cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Please install Node.js >= 18."
  exit 1
fi

cd webui/backend
npm install
npm run build

cd ../frontend
npm install
npm run build

cd ..
cp scripts/webui-systemd.service /etc/systemd/system/linuxgsm-webui.service 2>/dev/null || true

echo "LinuxGSM Web UI installed. Use './gameserver webui-start' to launch."
