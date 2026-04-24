import React, { useEffect, useRef, useState } from "react";

interface ServerLogsProps {
  serverId: string;
}

export default function ServerLogs({ serverId }: ServerLogsProps) {
  const [log, setLog] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://${window.location.host}/api/servers/${serverId}/logs/stream`,
    );
    wsRef.current = ws;
    ws.onmessage = (event) => {
      setLog((l) => l + event.data);
    };
    ws.onerror = () => setLog((l) => l + "\n[WebSocket error]");
    ws.onclose = () => setLog((l) => l + "\n[WebSocket closed]");
    return () => ws.close();
  }, [serverId]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="p-4">
      <h3 className="font-bold mb-2">Live Logs</h3>
      <pre
        ref={logRef}
        className="bg-black text-green-300 p-2 rounded h-64 overflow-y-auto text-xs whitespace-pre-wrap"
      >
        {log}
      </pre>
    </div>
  );
}
