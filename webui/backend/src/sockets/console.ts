import { FastifyInstance } from "fastify";
import { discoverServers } from "../discovery/servers";
import { spawn } from "child_process";

// Only allow safe console attach via tmux (LinuxGSM default)
export function registerConsoleWS(app: FastifyInstance) {
  app.get(
    "/api/servers/:id/console",
    { websocket: true },
    (connection, req) => {
      const { id } = req.params as { id: string };
      const servers = discoverServers();
      const server = servers.find((s) => s.id === id);
      if (!server) {
        connection.socket.send("Server not found");
        connection.socket.close();
        return;
      }
      // Attach to tmux session (LinuxGSM uses sessionname = scriptname)
      const session = server.name;
      const tmux = spawn("tmux", ["attach-session", "-t", session], {
        stdio: ["pipe", "pipe", "pipe"],
      });
      tmux.stdout.on("data", (data) => connection.socket.send(data.toString()));
      tmux.stderr.on("data", (data) =>
        connection.socket.send("[stderr] " + data.toString()),
      );
      connection.socket.on("message", (msg) => {
        // Only allow sending to tmux, not shell
        tmux.stdin.write(msg + "\n");
      });
      connection.socket.on("close", () => {
        tmux.kill();
      });
    },
  );
}
