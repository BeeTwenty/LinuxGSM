import fs from "fs";
import path from "path";
import { FastifyInstance } from "fastify";
import { discoverServers } from "../discovery/servers";

export function registerServerDetailsAPI(app: FastifyInstance) {
  app.get("/api/servers/:id/details", async (request, reply) => {
    const { id } = request.params as { id: string };
    const servers = discoverServers();
    const server = servers.find((s) => s.id === id);
    if (!server) return reply.code(404).send({ error: "Server not found" });
    // Example: get details from LinuxGSM details command
    try {
      const detailsPath = path.join(
        path.dirname(server.scriptPath),
        "log",
        `${server.name}-details.log`,
      );
      let details = "";
      if (fs.existsSync(detailsPath)) {
        details = fs.readFileSync(detailsPath, "utf-8");
      }
      return {
        id: server.id,
        name: server.name,
        scriptPath: server.scriptPath,
        details,
      };
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });
}
