#!/bin/bash
set -e

cd "$(dirname "$0")/.."
cd backend
npm install
npm run build
cd ../frontend
npm install
npm run build

echo "LinuxGSM Web UI updated."
