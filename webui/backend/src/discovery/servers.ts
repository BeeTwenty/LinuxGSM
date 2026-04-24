import fs from 'fs';
import path from 'path';

// Configurable search paths for LinuxGSM server scripts
const DEFAULT_PATHS = [
  path.resolve(__dirname, '../../../../'), // repo root
];

const SERVER_SCRIPT_PATTERN = /server$/; // e.g. csgoserver, mcserver

export interface DiscoveredServer {
  id: string;
  name: string;
  scriptPath: string;
  gameType?: string;
}

export function discoverServers(searchPaths: string[] = DEFAULT_PATHS): DiscoveredServer[] {
  const servers: DiscoveredServer[] = [];
  for (const basePath of searchPaths) {
    if (!fs.existsSync(basePath)) continue;
    const files = fs.readdirSync(basePath);
    for (const file of files) {
      if (SERVER_SCRIPT_PATTERN.test(file) && fs.statSync(path.join(basePath, file)).isFile()) {
        servers.push({
          id: file,
          name: file,
          scriptPath: path.join(basePath, file),
        });
      }
    }
  }
  return servers;
}
