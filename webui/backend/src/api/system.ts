import os from 'os';
import { FastifyInstance } from 'fastify';

export function registerSystemAPI(app: FastifyInstance) {
  app.get('/api/system/health', async (request, reply) => {
    return { status: 'ok', time: new Date().toISOString() };
  });

  app.get('/api/system/diagnostics', async (request, reply) => {
    return {
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus().length,
      hostname: os.hostname(),
      userInfo: os.userInfo(),
      network: os.networkInterfaces(),
    };
  });
}
