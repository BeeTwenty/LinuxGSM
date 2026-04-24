import { FastifyRequest, FastifyReply } from "fastify";
import { WebUIUser } from "../api/userAdmin";
import fs from "fs";
import path from "path";

const USERS_FILE = path.join(__dirname, "../../data/webui-users.json");

export function getUserSession(request: FastifyRequest): WebUIUser | null {
  const username = request.cookies["webui_user"];
  if (!username) return null;
  if (!fs.existsSync(USERS_FILE)) return null;
  const users: WebUIUser[] = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  const user = users.find((u) => u.username === username && u.enabled);
  return user || null;
}

export function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void,
) {
  const user = getUserSession(request);
  if (!user) return reply.code(401).send({ error: "Not authenticated" });
  (request as any).user = user;
  done();
}

export function requirePermission(permission: string) {
  return (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    const user = getUserSession(request);
    if (!user) return reply.code(401).send({ error: "Not authenticated" });
    if (user.role === "admin") return done();
    if (
      Array.isArray((user as any).permissions) &&
      (user as any).permissions.includes(permission)
    ) {
      return done();
    }
    return reply.code(403).send({ error: "Insufficient permissions" });
  };
}
