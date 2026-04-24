import fs from "fs";
import path from "path";
import { FastifyInstance } from "fastify";

const CONFIG_PATH = path.resolve(__dirname, "../../config.json");

export function registerSettingsAPI(app: FastifyInstance) {
  app.get("/api/settings", async (request, reply) => {
    if (!fs.existsSync(CONFIG_PATH))
      return reply.code(404).send({ error: "Config not found" });
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    return config;
  });

  app.put("/api/settings", async (request, reply) => {
    const newConfig = request.body;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), "utf-8");
    return { success: true };
  });
}
