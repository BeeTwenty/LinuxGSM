import fs from 'fs';
import path from 'path';
import { FastifyInstance } from 'fastify';
import { discoverServers } from '../discovery/servers';

// For simplicity, use per-server crontab fragment in lgsm/schedules/
const SCHEDULE_DIR = 'lgsm/schedules';

function getSchedulePath(serverScript: string) {
  return path.join(path.dirname(serverScript), SCHEDULE_DIR, 'webui-schedule.cron');
}

export function registerServerScheduleAPI(app: FastifyInstance) {
  app.get('/api/servers/:id/schedules', async (request, reply) => {
    const { id } = request.params as { id: string };
    const servers = discoverServers();
    const server = servers.find(s => s.id === id);
    if (!server) return reply.code(404).send({ error: 'Server not found' });
    const schedulePath = getSchedulePath(server.scriptPath);
    if (!fs.existsSync(schedulePath)) return { schedules: [] };
    const lines = fs.readFileSync(schedulePath, 'utf-8').split('\n').filter(Boolean);
    const schedules = lines.map((line, idx) => ({ id: idx, line }));
    return { schedules };
  });

  app.post('/api/servers/:id/schedules', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { line } = request.body as { line: string };
    const servers = discoverServers();
    const server = servers.find(s => s.id === id);
    if (!server) return reply.code(404).send({ error: 'Server not found' });
    const schedulePath = getSchedulePath(server.scriptPath);
    fs.mkdirSync(path.dirname(schedulePath), { recursive: true });
    fs.appendFileSync(schedulePath, line + '\n');
    // TODO: Reload crontab
    return { success: true };
  });

  app.delete('/api/servers/:id/schedules/:scheduleId', async (request, reply) => {
    const { id, scheduleId } = request.params as { id: string, scheduleId: string };
    const servers = discoverServers();
    const server = servers.find(s => s.id === id);
    if (!server) return reply.code(404).send({ error: 'Server not found' });
    const schedulePath = getSchedulePath(server.scriptPath);
    if (!fs.existsSync(schedulePath)) return reply.code(404).send({ error: 'Schedule not found' });
    const lines = fs.readFileSync(schedulePath, 'utf-8').split('\n');
    lines.splice(Number(scheduleId), 1);
    fs.writeFileSync(schedulePath, lines.filter(Boolean).join('\n') + '\n');
    // TODO: Reload crontab
    return { success: true };
  });
}
