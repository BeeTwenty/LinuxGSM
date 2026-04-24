<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ServerLogs from './ServerLogs';
import ServerDetails from './ServerDetails';
import ServerConfigs from './ServerConfigs';
import ServerConsole from './ServerConsole';
import ServerBackups from './ServerBackups';
import ServerSchedules from './ServerSchedules';
=======
import React, { useEffect, useState } from "react";
import axios from "axios";
import ServerLogs from "./ServerLogs";
import ServerDetails from "./ServerDetails";
import ServerConfigs from "./ServerConfigs";
>>>>>>> abe2321aae35fb3203d28a4b6020f260f657969a

interface Server {
  id: string;
  name: string;
  scriptPath: string;
  gameType?: string;
}

type Action = "start" | "stop" | "restart" | "status";

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionResult, setActionResult] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [logServer, setLogServer] = useState<string | null>(null);
  const [detailsServer, setDetailsServer] = useState<string | null>(null);
  const [configsServer, setConfigsServer] = useState<string | null>(null);
  const [consoleServer, setConsoleServer] = useState<string | null>(null);
  const [backupsServer, setBackupsServer] = useState<string | null>(null);
  const [schedulesServer, setSchedulesServer] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("/api/servers")
      .then((res) => setServers(res.data.servers))
      .catch(() => setError("Failed to load servers"))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (serverId: string, action: Action) => {
    setActionLoading((al) => ({ ...al, [serverId]: true }));
    setActionResult((ar) => ({ ...ar, [serverId]: "" }));
    try {
      const res = await axios.post(
        `/api/servers/${serverId}/actions/${action}`,
      );
      setActionResult((ar) => ({
        ...ar,
        [serverId]: res.data.stdout || "Success",
      }));
    } catch (err: any) {
      setActionResult((ar) => ({
        ...ar,
        [serverId]: err.response?.data?.error || "Error",
      }));
    } finally {
      setActionLoading((al) => ({ ...al, [serverId]: false }));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading servers...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Managed Game Servers</h2>
      {servers.length === 0 ? (
        <div>No servers found.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <div key={server.id} className="bg-gray-800 rounded p-4 shadow">
              <div className="font-bold text-lg">{server.name}</div>
              <div className="text-xs text-gray-400 break-all mb-2">
                {server.scriptPath}
              </div>
              <div className="flex gap-2 mb-2">
                {(["start", "stop", "restart", "status"] as Action[]).map(
                  (action) => (
                    <button
                      key={action}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                      disabled={actionLoading[server.id]}
                      onClick={() => handleAction(server.id, action)}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </button>
                  ),
                )}
              </div>
              {actionResult[server.id] && (
                <pre className="bg-gray-900 text-green-300 p-2 rounded text-xs overflow-x-auto max-h-32 whitespace-pre-wrap">
                  {actionResult[server.id]}
                </pre>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => setLogServer(server.id)}
                >
                  View Logs
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => setDetailsServer(server.id)}
                >
                  Details
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => setConfigsServer(server.id)}
                >
                  Configs
                </button>
<<<<<<< HEAD
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => setConsoleServer(server.id)}
                >
                  Console
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => setBackupsServer(server.id)}
                >
                  Backups
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => setSchedulesServer(server.id)}
                >
                  Schedules
                </button>
                                      {schedulesServer && (
                                        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                                          <div className="bg-gray-900 rounded shadow-lg max-w-2xl w-full relative">
                                            <button
                                              className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                              onClick={() => setSchedulesServer(null)}
                                            >
                                              ✕
                                            </button>
                                            <ServerSchedules serverId={schedulesServer} onClose={() => setSchedulesServer(null)} />
                                          </div>
                                        </div>
                                      )}
                                {backupsServer && (
                                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                                    <div className="bg-gray-900 rounded shadow-lg max-w-2xl w-full relative">
                                      <button
                                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                        onClick={() => setBackupsServer(null)}
                                      >
                                        ✕
                                      </button>
                                      <ServerBackups serverId={backupsServer} onClose={() => setBackupsServer(null)} />
                                    </div>
                                  </div>
                                )}
                          {consoleServer && (
                            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                              <div className="bg-gray-900 rounded shadow-lg max-w-2xl w-full relative">
                                <button
                                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                  onClick={() => setConsoleServer(null)}
                                >
                                  ✕
                                </button>
                                <ServerConsole serverId={consoleServer} onClose={() => setConsoleServer(null)} />
                              </div>
                            </div>
                          )}
                    {configsServer && (
                      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-gray-900 rounded shadow-lg max-w-2xl w-full relative">
                          <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => setConfigsServer(null)}
                          >
                            ✕
                          </button>
                          <ServerConfigs serverId={configsServer} onClose={() => setConfigsServer(null)} />
                        </div>
                      </div>
                    )}
=======
                {configsServer && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded shadow-lg max-w-2xl w-full relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        onClick={() => setConfigsServer(null)}
                      >
                        ✕
                      </button>
                      <ServerConfigs
                        serverId={configsServer}
                        onClose={() => setConfigsServer(null)}
                      />
                    </div>
                  </div>
                )}
>>>>>>> abe2321aae35fb3203d28a4b6020f260f657969a
              </div>
            </div>
          ))}
        </div>
      )}
      {logServer && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setLogServer(null)}
            >
              ✕
            </button>
            <ServerLogs serverId={logServer} />
          </div>
        </div>
      )}
      {detailsServer && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setDetailsServer(null)}
            >
              ✕
            </button>
            <ServerDetails
              serverId={detailsServer}
              onClose={() => setDetailsServer(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
