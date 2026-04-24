# LinuxGSM Web UI

A modern, secure, and easy-to-install web interface for LinuxGSM. Manage all your game servers from your browser with full feature parity to the CLI.

## Features
- Linux user authentication (PAM)
- Per-user roles (admin/user) and fine-grained permissions
- Server discovery and dashboard
- Start/stop/restart/status for all servers
- Real-time logs and console (WebSocket, tmux)
- Config file editing
- Backup and restore
- Scheduling (cron integration)
- Alerts (email, Discord, etc.)
- System diagnostics and settings
- User/admin management

## Requirements
- Linux host (PAM, tmux, cron required)
- Node.js (LTS recommended)
- LinuxGSM installed and working

## Quick Start
1. `cd webui/backend && npm install && npm run build && npm start`
2. Open `http://localhost:3000` in your browser
3. Log in with your Linux user credentials

## Security Notes
- All API endpoints require authentication and permissions
- Only allowlisted LinuxGSM commands are exposed
- User/admin/permissions are managed via the Web UI
- Windows is not supported for backend features

## Production Deployment
- Use a reverse proxy (nginx, Caddy, etc.) for HTTPS
- Run backend as a systemd service
- Harden file permissions on `webui-users.json`
- Review and restrict permissions for all users

## Development
- Frontend: `cd webui/frontend && npm install && npm run dev`
- Backend: `cd webui/backend && npm install && npm run dev`

## Contributing
Pull requests and issues are welcome! See the main LinuxGSM repo for guidelines.

---

For more, see the main [README.md](../README.md).
