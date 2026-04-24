import { registerConsoleWS } from "./sockets/console";
// Register console WebSocket
registerConsoleWS(app);
import { registerServerDetailsAPI } from "./api/serverDetails";
import { registerServerConfigAPI } from "./api/serverConfig";
// Register server details and config APIs
registerServerDetailsAPI(app);
registerServerConfigAPI(app);
import { registerLogStreamWS } from "./logs/stream";
// Register WebSocket log streaming
registerLogStreamWS(app);
import { runLinuxGSMCommand } from "./commands/runner";
// Run an allowed action on a server
app.post("/api/servers/:id/actions/:action", async (request, reply) => {
  const { id, action } = request.params as { id: string; action: string };
  const servers = discoverServers();
  const server = servers.find((s) => s.id === id);
  if (!server) {
    return reply.code(404).send({ error: "Server not found" });
  }
  try {
    const result = await runLinuxGSMCommand(server.scriptPath, action);
    return { success: true, ...result };
  } catch (err: any) {
    return reply.code(400).send({ error: err.message });
  }
});
import { discoverServers } from "./discovery/servers";
// List all discovered LinuxGSM servers
app.get("/api/servers", async (request, reply) => {
  // TODO: Use config for search paths
  const servers = discoverServers();
  return { servers };
});
import fastify from "fastify";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import fastifyRateLimit from "fastify-rate-limit";
import fastifyWebsocket from "fastify-websocket";

const app = fastify({ logger: true });

app.register(fastifyCookie);
app.register(fastifyCors, { origin: false });
app.register(fastifyRateLimit, { max: 20, timeWindow: "1 minute" });
app.register(fastifyWebsocket);

import { authenticateLinuxUser } from "./auth/pam";

const SESSION_SECRET = process.env.WEBUI_SESSION_SECRET || "changeme-please";
const SESSION_COOKIE = "webui_session";

// Simple in-memory session store (replace with Redis or file for production)
const sessions = new Map<
  string,
  { username: string; role: string; created: number }
>();
import { randomUUID } from "crypto";

function getUserRole(username: string): string {
  // TODO: Implement real group/sudoers check on Linux
  if (username === "root") return "admin";
  return "operator";
}

app.post("/api/auth/login", async (request, reply) => {
  const { username, password } = request.body as {
    username: string;
    password: string;
  };
  if (!username || !password) {
    return reply.code(400).send({ error: "Missing username or password" });
  }
  const ok = await authenticateLinuxUser(username, password);
  if (!ok) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }
  const role = getUserRole(username);
  const sessionId = randomUUID();
  sessions.set(sessionId, { username, role, created: Date.now() });
  reply.setCookie(SESSION_COOKIE, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    signed: true,
    maxAge: 3600,
  });
  return { success: true, username, role };
});

app.get("/api/auth/me", async (request, reply) => {
  const sessionId = request.cookies[SESSION_COOKIE];
  if (!sessionId || !sessions.has(sessionId)) {
    return reply.code(401).send({ error: "Not authenticated" });
  }
  const { username, role } = sessions.get(sessionId)!;
  return { username, role };
});

app.post("/api/auth/logout", async (request, reply) => {
  const sessionId = request.cookies[SESSION_COOKIE];
  if (sessionId) {
    sessions.delete(sessionId);
    reply.clearCookie(SESSION_COOKIE, { path: "/" });
  }
  return { success: true };
});

app.get("/api/health", async (request, reply) => {
  return { status: "ok", time: new Date().toISOString() };
});

const PORT = process.env.WEBUI_PORT || 8080;
app.listen(PORT, "0.0.0.0", (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`LinuxGSM Web UI backend listening at ${address}`);
});
