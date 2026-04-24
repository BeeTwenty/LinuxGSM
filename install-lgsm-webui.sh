#!/bin/bash
# install-lgsm-webui.sh: Automated installer for LinuxGSM + Web UI (production)
# Usage: sudo ./install-lgsm-webui.sh
set -e

# 1. System dependencies
if [ -f /etc/debian_version ]; then
  PKGS="curl sudo git nodejs build-essential libpam0g-dev python3"
  apt-get update
  apt-get install -y $PKGS
elif [ -f /etc/redhat-release ]; then
  PKGS="curl sudo git nodejs gcc-c++ pam-devel python3"
  yum install -y $PKGS
elif [ -f /etc/alpine-release ]; then
  PKGS="curl sudo git nodejs build-base linux-pam-dev python3"
  apk add --no-cache $PKGS
else
  echo "Unsupported distro. Install dependencies manually."
  exit 1
fi


# 2. Clone LinuxGSM repo if not present
if [ ! -d LinuxGSM ]; then
  git clone https://github.com/GameServerManagers/LinuxGSM.git
  # Copy webui if it exists in the parent directory
  if [ -d ../webui ]; then
    cp -r ../webui LinuxGSM/
  fi
  cd LinuxGSM
else
  cd LinuxGSM
  git pull
  # Copy webui if it exists in the parent directory and not already present
  if [ ! -d webui ] && [ -d ../webui ]; then
    cp -r ../webui .
  fi
fi

# 3. Install Node.js (LTS) if not present
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# 4. Build Web UI (production)
if [ ! -d webui/backend ] || [ ! -d webui/frontend ]; then
  echo "webui directory not found in LinuxGSM. Please ensure it exists before running this script."
  exit 1
fi
cd webui/backend
npm ci --omit=dev
# Ensure TypeScript is installed if tsc is missing
if ! npx tsc --version >/dev/null 2>&1; then
  echo "TypeScript not found, installing..."
  npm install typescript --save-dev
fi
npm run build
cd ../frontend
npm ci --omit=dev
npm run build

# 5. Systemd service for backend
cat <<EOF > /etc/systemd/system/linuxgsm-webui-backend.service
[Unit]
Description=LinuxGSM Web UI Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=$(pwd)/../backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
User=$(whoami)
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable linuxgsm-webui-backend
systemctl restart linuxgsm-webui-backend

# 6. Nginx config (optional, for production)
if command -v nginx >/dev/null 2>&1; then
  cat <<NGINX > /etc/nginx/sites-available/linuxgsm-webui
server {
    listen 80;
    server_name _;
    root $(pwd)/../frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
  ln -sf /etc/nginx/sites-available/linuxgsm-webui /etc/nginx/sites-enabled/linuxgsm-webui
  nginx -s reload || systemctl reload nginx
fi

# 7. Output access URL
IP=$(hostname -I | awk '{print $1}')
echo "\nLinuxGSM Web UI is installed!"
echo "Access the Web UI at: http://$IP/"
echo "Backend API: http://$IP:8080/api/"
