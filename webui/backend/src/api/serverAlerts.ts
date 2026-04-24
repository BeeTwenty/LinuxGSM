import fs from "fs";
import path from "path";
import { FastifyInstance } from "fastify";
import { discoverServers } from "../discovery/servers";

const ALERT_CONFIGS = [
  "alert_discord.sh",
  "alert_email.sh",
  "alert_gotify.sh",
  "alert_ifttt.sh",
  "alert_ntfy.sh",
  "alert_pushbullet.sh",
  "alert_pushover.sh",
  "alert_rocketchat.sh",
  "alert_slack.sh",
  "alert_telegram.sh",
];

function getAlertConfigPath(serverScript: string, alertScript: string) {
  return path.join(
    path.dirname(serverScript),
    "lgsm",
    "config-lgsm",
    alertScript.replace(".sh", ".cfg"),
  );
}

export function registerServerAlertsAPI(app: FastifyInstance) {
  app.get("/api/servers/:id/alerts", async (request, reply) => {
    const { id } = request.params as { id: string };
    const servers = discoverServers();
    const server = servers.find((s) => s.id === id);
    if (!server) return reply.code(404).send({ error: "Server not found" });
    const configs = ALERT_CONFIGS.map((a) => ({
      script: a,
      configPath: getAlertConfigPath(server.scriptPath, a),
      enabled: fs.existsSync(getAlertConfigPath(server.scriptPath, a)),
    }));
    return { alerts: configs };
  });

  app.get("/api/servers/:id/alerts/:alertId", async (request, reply) => {
    const { id, alertId } = request.params as { id: string; alertId: string };
    const servers = discoverServers();
    const server = servers.find((s) => s.id === id);
    if (!server) return reply.code(404).send({ error: "Server not found" });
    if (!ALERT_CONFIGS.includes(alertId))
      return reply.code(403).send({ error: "Alert not allowed" });
    const configPath = getAlertConfigPath(server.scriptPath, alertId);
    if (!fs.existsSync(configPath))
      return reply.code(404).send({ error: "Config not found" });
    const content = fs.readFileSync(configPath, "utf-8");
    return { alertId, content };
  });

  app.put("/api/servers/:id/alerts/:alertId", async (request, reply) => {
    const { id, alertId } = request.params as { id: string; alertId: string };
    const { content } = request.body as { content: string };
    const servers = discoverServers();
    const server = servers.find((s) => s.id === id);
    if (!server) return reply.code(404).send({ error: "Server not found" });
    if (!ALERT_CONFIGS.includes(alertId))
      return reply.code(403).send({ error: "Alert not allowed" });
    const configPath = getAlertConfigPath(server.scriptPath, alertId);
    fs.writeFileSync(configPath, content, "utf-8");
    return { success: true };
  });

  app.post("/api/servers/:id/alerts/:alertId/test", async (request, reply) => {
    const { id, alertId } = request.params as { id: string; alertId: string };
    const servers = discoverServers();
    const server = servers.find((s) => s.id === id);
    if (!server) return reply.code(404).send({ error: "Server not found" });
    if (!ALERT_CONFIGS.includes(alertId))
      return reply.code(403).send({ error: "Alert not allowed" });
    // Run LinuxGSM alert test command
    const { spawn } = require("child_process");
    const scriptPath = path.resolve(server.scriptPath);
    const proc = spawn(
      scriptPath,
      ["test-alert", alertId.replace("alert_", "").replace(".sh", "")],
      {
        env: process.env,
        cwd: path.dirname(scriptPath),
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });
    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });
    proc.on("close", (code: number) => {
      reply.send({ code, stdout, stderr });
    });
  });
}
