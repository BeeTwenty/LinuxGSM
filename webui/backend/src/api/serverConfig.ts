import fs from "fs";
import path from "path";
import { FastifyInstance } from "fastify";
import { discoverServers } from "../discovery/servers";

const ALLOWED_CONFIGS = ["_default.cfg", "common.cfg", "secrets-common.cfg"];

function getConfigPaths(serverScript: string): string[] {
  const dir = path.join(path.dirname(serverScript), "lgsm", "config-lgsm");
  return ALLOWED_CONFIGS.map((cfg) => path.join(dir, cfg));
}

export function registerServerConfigAPI(app: FastifyInstance) {
  app.get("/api/servers/:id/configs", async (request, reply) => {
    const { id } = request.params as { id: string };
    const servers = discoverServers();
    const server = servers.find((s) => s.id === id);
    if (!server) return reply.code(404).send({ error: "Server not found" });
    const configs = getConfigPaths(server.scriptPath).filter(fs.existsSync);
    return { configs };
  });

  app.get("/api/servers/:id/configs/:configId", async (request, reply) => {
    const { id, configId } = request.params as { id: string; configId: string };
    const servers = discoverServers();
    const server = servers.find((s) => s.id === id);
    if (!server) return reply.code(404).send({ error: "Server not found" });
    if (!ALLOWED_CONFIGS.includes(configId))
      return reply.code(403).send({ error: "Config not allowed" });
    const configPath = getConfigPaths(server.scriptPath).find((p) =>
      p.endsWith(configId),
    );
    if (!configPath || !fs.existsSync(configPath))
      return reply.code(404).send({ error: "Config not found" });
    const content = fs.readFileSync(configPath, "utf-8");
    return { configId, content };
  });

  app.put("/api/servers/:id/configs/:configId", async (request, reply) => {
    const { id, configId } = request.params as { id: string; configId: string };
    const { content } = request.body as { content: string };
    const servers = discoverServers();
    const server = servers.find((s) => s.id === id);
    if (!server) return reply.code(404).send({ error: "Server not found" });
    if (!ALLOWED_CONFIGS.includes(configId))
      return reply.code(403).send({ error: "Config not allowed" });
    const configPath = getConfigPaths(server.scriptPath).find((p) =>
      p.endsWith(configId),
    );
    if (!configPath || !fs.existsSync(configPath))
      return reply.code(404).send({ error: "Config not found" });
    // Backup before writing
    fs.copyFileSync(configPath, configPath + ".bak");
    fs.writeFileSync(configPath, content, "utf-8");
    return { success: true };
  });
}
