import { FastifyInstance } from "fastify";
import { requireAuth, requirePermission } from "../auth/session";
import fs from "fs";
import path from "path";

// User model: stored in a JSON file for simplicity
export interface WebUIUser {
  username: string;
  role: "admin" | "user";
  enabled: boolean;
}

const USERS_FILE = path.join(__dirname, "../../data/webui-users.json");

export function readUsers(): WebUIUser[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function writeUsers(users: WebUIUser[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function registerUserAdminAPI(app: FastifyInstance) {
  // List users (admin only)
  app.get(
    "/api/admin/users",
    { preHandler: [requireAuth, requirePermission("users:manage")] },
    (req, reply) => {
      reply.send({ users: readUsers() });
    },
  );

  // Add user (admin only)
  app.post(
    "/api/admin/users",
    { preHandler: [requireAuth, requirePermission("users:manage")] },
    (req, reply) => {
      const { username, role } = req.body as {
        username: string;
        role: "admin" | "user";
      };
      if (!username || !role)
        return reply.code(400).send({ error: "Missing fields" });
      const users = readUsers();
      if (users.find((u) => u.username === username)) {
        return reply.code(400).send({ error: "User already exists" });
      }
      users.push({ username, role, enabled: true });
      writeUsers(users);
      reply.send({ success: true });
    },
  );

  // Update user (admin only)
  app.put(
    "/api/admin/users/:username",
    { preHandler: [requireAuth, requirePermission("users:manage")] },
    (req, reply) => {
      const { username } = req.params as { username: string };
      const { role, enabled } = req.body as {
        role?: "admin" | "user";
        enabled?: boolean;
      };
      const users = readUsers();
      const user = users.find((u) => u.username === username);
      if (!user) return reply.code(404).send({ error: "User not found" });
      if (role) user.role = role;
      if (typeof enabled === "boolean") user.enabled = enabled;
      writeUsers(users);
      reply.send({ success: true });
    },
  );

  // Delete user (admin only)
  app.delete(
    "/api/admin/users/:username",
    { preHandler: [requireAuth, requirePermission("users:manage")] },
    (req, reply) => {
      const { username } = req.params as { username: string };
      let users = readUsers();
      if (!users.find((u) => u.username === username)) {
        return reply.code(404).send({ error: "User not found" });
      }
      users = users.filter((u) => u.username !== username);
      writeUsers(users);
      reply.send({ success: true });
    },
  );
}
