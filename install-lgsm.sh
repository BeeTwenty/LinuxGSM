#!/bin/bash
set -e

# Unified LinuxGSM + Web UI installer
# Usage: curl -Lo install-lgsm.sh https://linuxgsm.sh && chmod +x install-lgsm.sh && ./install-lgsm.sh


# 1. Auto-detect current directory as default for install_dir
default_dir="$(pwd)"
read -rp "Install directory [${default_dir}]: " install_dir
install_dir=${install_dir:-$default_dir}

read -rp "Linux user to run servers and Web UI [$(whoami)]: " lgsm_user
lgsm_user=${lgsm_user:-$(whoami)}

# 2. Create directory and check user
mkdir -p "$install_dir"
cd "$install_dir"

if [ "$EUID" -eq 0 ]; then
  echo "Do not run as root. Please run as the target user."
  exit 1
fi

# 3. Download LinuxGSM core script
if [ ! -f linuxgsm.sh ]; then
  curl -Lo linuxgsm.sh https://linuxgsm.sh
  chmod +x linuxgsm.sh
fi

# 4. Install LinuxGSM (core only, no per-server user creation)
./linuxgsm.sh install

# 5. Prompt to install Web UI
read -rp "Install Web UI? [Y/n]: " install_webui
install_webui=${install_webui:-Y}


if [[ "$install_webui" =~ ^[Yy]$ ]]; then
  echo "[INFO] Installing Web UI..."
  WEBUI_INSTALL_SCRIPT="$install_dir/webui/scripts/webui-install.sh"
  if [ ! -f "$WEBUI_INSTALL_SCRIPT" ]; then
    echo "[ERROR] Could not find $WEBUI_INSTALL_SCRIPT. Please check your install directory."
    exit 1
  fi
  if [ ! -x "$WEBUI_INSTALL_SCRIPT" ]; then
    chmod +x "$WEBUI_INSTALL_SCRIPT"
  fi
  if "$WEBUI_INSTALL_SCRIPT"; then
    echo "[SUCCESS] Web UI installed. Use './linuxgsm.sh webui-start' to launch."
  else
    echo "[ERROR] Web UI install failed."
    echo "[TROUBLESHOOT] Check Node.js version (>=18), npm logs, and ensure all dependencies are met."
    echo "[TROUBLESHOOT] Try running: cd webui/backend && npm install && npm run build"
    exit 1
  fi
fi

echo "\nLinuxGSM and Web UI installation complete!"
echo "To add a game server, run: ./linuxgsm.sh <servername>"
echo "To manage the Web UI, use: ./linuxgsm.sh webui-start|stop|status|update|uninstall"
