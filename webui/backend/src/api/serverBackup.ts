import fs from 'fs';
import path from 'path';
import { FastifyInstance } from 'fastify';
import { discoverServers } from '../discovery/servers';
import { runLinuxGSMCommand } from '../commands/runner';

function getBackupDir(serverScript: string) {
  // LinuxGSM default: ../backups
  return path.join(path.dirname(serverScript), 'backups');
}

export function registerServerBackupAPI(app: FastifyInstance) {
  app.get('/api/servers/:id/backups', async (request, reply) => {
    const { id } = request.params as { id: string };
    const servers = discoverServers();
    const server = servers.find(s => s.id === id);
    if (!server) return reply.code(404).send({ error: 'Server not found' });
    const backupDir = getBackupDir(server.scriptPath);
    if (!fs.existsSync(backupDir)) return { backups: [] };
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.tar.gz') || f.endsWith('.zip'));
    const backups = files.map(f => {
      const stat = fs.statSync(path.join(backupDir, f));
      return { name: f, size: stat.size, mtime: stat.mtime };
    });
    return { backups };
  });

  app.post('/api/servers/:id/backups', async (request, reply) => {
    const { id } = request.params as { id: string };
    const servers = discoverServers();
    const server = servers.find(s => s.id === id);
    if (!server) return reply.code(404).send({ error: 'Server not found' });
    // Run LinuxGSM backup command
    const result = await runLinuxGSMCommand(server.scriptPath, 'backup');
    return { success: true, ...result };
  });

  app.delete('/api/servers/:id/backups/:backupName', async (request, reply) => {
    const { id, backupName } = request.params as { id: string, backupName: string };
    const servers = discoverServers();
    const server = servers.find(s => s.id === id);
    if (!server) return reply.code(404).send({ error: 'Server not found' });
    const backupDir = getBackupDir(server.scriptPath);
    const backupPath = path.join(backupDir, backupName);
    if (!fs.existsSync(backupPath)) return reply.code(404).send({ error: 'Backup not found' });
    fs.unlinkSync(backupPath);
    return { success: true };
  });
}
