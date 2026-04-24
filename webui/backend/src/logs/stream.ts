import fs from "fs";
import path from "path";
import { FastifyInstance } from "fastify";

// Example: log file locations (should be improved for real server configs)
function getServerLogPath(serverScript: string): string {
  // Assume logs are in ../log/scriptname-script.log
  const dir = path.dirname(serverScript);
  const script = path.basename(serverScript);
  return path.join(dir, "../log", `${script}-script.log`);
}

export function registerLogStreamWS(app: FastifyInstance) {
  app.get(
    "/api/servers/:id/logs/stream",
    { websocket: true },
    (connection, req) => {
      // Find server by id, get log path
      const { id } = req.params as { id: string };
      // This should use the same discovery as the rest of the API
      // For now, just resolve path
      const scriptPath = path.resolve(__dirname, "../../../../", id);
      const logPath = getServerLogPath(scriptPath);
      if (!fs.existsSync(logPath)) {
        connection.socket.send("Log file not found");
        connection.socket.close();
        return;
      }
      // Tail the log file
      const stream = fs.createReadStream(logPath, {
        encoding: "utf-8",
        start: Math.max(0, fs.statSync(logPath).size - 4096),
      });
      stream.on("data", (chunk) => connection.socket.send(chunk));
      // Watch for new data
      const watcher = fs.watch(logPath, (event) => {
        if (event === "change") {
          const newStream = fs.createReadStream(logPath, {
            encoding: "utf-8",
            start: fs.statSync(logPath).size - 1024,
          });
          newStream.on("data", (chunk) => connection.socket.send(chunk));
        }
      });
      connection.socket.on("close", () => {
        stream.close();
        watcher.close();
      });
    },
  );
}
