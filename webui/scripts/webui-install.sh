#!/bin/bash
set -e

# LinuxGSM Web UI install script
# Usage: ./gameserver webui-install

echo "[INFO] Starting LinuxGSM Web UI install..."
cd "$(dirname "$0")/.."

if ! command -v node > /dev/null 2>&1; then
	echo "[ERROR] Node.js is required. Please install Node.js >= 18."
	exit 1
fi

echo "[INFO] Installing backend dependencies..."
cd webui/backend
if ! npm install; then
	echo "[ERROR] npm install failed in backend. Check npm logs."
	exit 1
fi
if ! npm run build; then
	echo "[ERROR] Backend build failed. Check TypeScript and npm logs."
	exit 1
fi

echo "[INFO] Installing frontend dependencies..."
cd ../frontend
if ! npm install; then
	echo "[ERROR] npm install failed in frontend. Check npm logs."
	exit 1
fi
if ! npm run build; then
	echo "[ERROR] Frontend build failed. Check npm logs."
	exit 1
fi

cd ..
cp scripts/webui-systemd.service /etc/systemd/system/linuxgsm-webui.service 2> /dev/null || true

echo "[SUCCESS] LinuxGSM Web UI installed. Use './gameserver webui-start' to launch."
echo "[TROUBLESHOOT] If the Web UI does not start, check Node.js version, npm logs, and try running manually:"
echo "  cd webui/backend && npm install && npm run build && npm start"
