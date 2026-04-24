#!/bin/bash
set -e

# LinuxGSM Web UI install script
# Usage: ./gameserver webui-install

# Always resolve to the webui root, no matter where called from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBUI_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$WEBUI_ROOT"

echo "[INFO] Starting LinuxGSM Web UI install..."

# Ensure all system dependencies are present (Linux only)
if [ "$(uname -s)" = "Linux" ]; then
	echo "[INFO] Checking and installing required system dependencies..."
	if [ -f /etc/debian_version ]; then
		sudo apt-get update && sudo apt-get install -y libpam0g-dev build-essential python3 npm nodejs curl
	elif [ -f /etc/redhat-release ] || [ -f /etc/centos-release ]; then
		sudo yum install -y pam-devel @development-tools python3 npm nodejs curl
	elif [ -f /etc/alpine-release ]; then
		sudo apk add linux-pam-dev build-base python3 npm nodejs curl
	elif [ -f /etc/os-release ] && grep -qi suse /etc/os-release; then
		sudo zypper install -y pam-devel -t pattern devel_basis python3 npm nodejs curl
	else
		echo "[WARNING] Unknown distro. Please install libpam-dev, build tools, python3, npm, nodejs, curl manually."
	fi
fi
if ! command -v node > /dev/null 2>&1; then
	echo "[ERROR] Node.js is required. Please install Node.js >= 18."
	exit 1
fi

echo "[INFO] Installing backend dependencies..."
cd backend
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

cd "$WEBUI_ROOT"
cp scripts/webui-systemd.service /etc/systemd/system/linuxgsm-webui.service 2> /dev/null || true

echo "[SUCCESS] LinuxGSM Web UI installed. Use './gameserver webui-start' to launch."
echo "[TROUBLESHOOT] If the Web UI does not start, check Node.js version, npm logs, and try running manually:"
echo "  cd webui/backend && npm install && npm run build && npm start"
