import React, { useEffect, useRef, useState } from "react";

interface ServerConsoleProps {
  serverId: string;
  onClose: () => void;
}

export default function ServerConsole({
  serverId,
  onClose,
}: ServerConsoleProps) {
  const [log, setLog] = useState("");
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://${window.location.host}/api/servers/${serverId}/console`,
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

  const sendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (wsRef.current && input.trim()) {
      wsRef.current.send(input);
      setInput("");
    }
  };

  return (
    <div className="p-4">
      <button className="mb-2 text-gray-400 hover:text-white" onClick={onClose}>
        ← Back
      </button>
      <h3 className="font-bold mb-2">Server Console</h3>
      <pre
        ref={logRef}
        className="bg-black text-green-300 p-2 rounded h-64 overflow-y-auto text-xs whitespace-pre-wrap mb-2"
      >
        {log}
      </pre>
      <form onSubmit={sendCommand} className="flex gap-2">
        <input
          className="flex-1 bg-gray-800 text-white p-2 rounded text-xs"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type command..."
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
}
