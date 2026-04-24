import { FastifyInstance } from "fastify";
import { WebUIUser, readUsers } from "./userAdmin";
import { requireAuth, requirePermission } from "../auth/session";

// Permissions list
export const PERMISSIONS = [
  "servers:view",
  "servers:manage",
  "logs:view",
  "console:access",
  "configs:edit",
  "backups:manage",
  "schedules:manage",
  "alerts:manage",
  "settings:edit",
  "system:diagnose",
  "users:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

// Extend user model to support permissions
export interface WebUIUserWithPerms extends WebUIUser {
  permissions?: Permission[];
}

import fs from "fs";
import path from "path";
const USERS_FILE = path.join(__dirname, "../../data/webui-users.json");

function readUsersWithPerms(): WebUIUserWithPerms[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function writeUsersWithPerms(users: WebUIUserWithPerms[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function registerPermissionsAPI(app: FastifyInstance) {
  // List all permissions
  app.get(
    "/api/admin/permissions",
    { preHandler: [requireAuth, requirePermission("users:manage")] },
    (req, reply) => {
      reply.send({ permissions: PERMISSIONS });
    },
  );

  // Get/set user permissions
  app.get(
    "/api/admin/users/:username/permissions",
    { preHandler: [requireAuth, requirePermission("users:manage")] },
    (req, reply) => {
      const { username } = req.params as { username: string };
      const users = readUsersWithPerms();
      const user = users.find((u) => u.username === username);
      if (!user) return reply.code(404).send({ error: "User not found" });
      reply.send({ permissions: user.permissions || [] });
    },
  );

  app.put(
    "/api/admin/users/:username/permissions",
    { preHandler: [requireAuth, requirePermission("users:manage")] },
    (req, reply) => {
      const { username } = req.params as { username: string };
      const { permissions } = req.body as { permissions: Permission[] };
      if (!Array.isArray(permissions))
        return reply.code(400).send({ error: "Invalid permissions" });
      const users = readUsersWithPerms();
      const user = users.find((u) => u.username === username);
      if (!user) return reply.code(404).send({ error: "User not found" });
      user.permissions = permissions;
      writeUsersWithPerms(users);
      reply.send({ success: true });
    },
  );
}
