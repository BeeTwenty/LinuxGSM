import React, { useEffect, useState } from "react";
import axios from "axios";

interface ServerAlertsProps {
  serverId: string;
  onClose: () => void;
}

interface AlertConfig {
  script: string;
  configPath: string;
  enabled: boolean;
}

export default function ServerAlerts({ serverId, onClose }: ServerAlertsProps) {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [testMsg, setTestMsg] = useState("");

  useEffect(() => {
    axios
      .get(`/api/servers/${serverId}/alerts`)
      .then((res) => setAlerts(res.data.alerts))
      .catch(() => setError("Failed to load alerts"));
  }, [serverId]);

  const loadAlert = (alert: string) => {
    setLoading(true);
    setError("");
    axios
      .get(`/api/servers/${serverId}/alerts/${alert}`)
      .then((res) => {
        setSelected(alert);
        setContent(res.data.content);
        setOriginal(res.data.content);
      })
      .catch(() => setError("Failed to load alert config"))
      .finally(() => setLoading(false));
  };

  const saveAlert = () => {
    setSaving(true);
    setSaveMsg("");
    axios
      .put(`/api/servers/${serverId}/alerts/${selected}`, { content })
      .then(() => {
        setOriginal(content);
        setSaveMsg("Saved!");
      })
      .catch(() => setSaveMsg("Save failed"))
      .finally(() => setSaving(false));
  };

  const testAlert = () => {
    setTestMsg("");
    axios
      .post(`/api/servers/${serverId}/alerts/${selected}/test`)
      .then((res) => setTestMsg(res.data.stdout || "Test sent"))
      .catch(() => setTestMsg("Test failed"));
  };

  return (
    <div className="p-4">
      <button className="mb-2 text-gray-400 hover:text-white" onClick={onClose}>
        ← Back
      </button>
      <h3 className="font-bold mb-2">Alerts</h3>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="flex gap-4">
        <div>
          <ul className="mb-2">
            {alerts.map((a) => (
              <li key={a.script}>
                <button
                  className={`text-xs px-2 py-1 rounded ${selected === a.script ? "bg-blue-700 text-white" : "bg-gray-700 text-gray-200"} mb-1`}
                  onClick={() => loadAlert(a.script)}
                  disabled={loading}
                >
                  {a.script.replace("alert_", "").replace(".sh", "")}{" "}
                  {a.enabled ? "" : "(disabled)"}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          {selected && (
            <div>
              <textarea
                className="w-full h-40 bg-gray-900 text-green-300 p-2 rounded text-xs font-mono mb-2"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving}
              />
              <div className="flex gap-2 mb-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  onClick={saveAlert}
                  disabled={saving || content === original}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                  onClick={() => setContent(original)}
                  disabled={saving || content === original}
                >
                  Revert
                </button>
                <button
                  className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-xs"
                  onClick={testAlert}
                  disabled={saving}
                >
                  Test
                </button>
                {saveMsg && (
                  <span className="text-green-400 ml-2">{saveMsg}</span>
                )}
              </div>
              {testMsg && (
                <pre className="bg-black text-green-300 p-2 rounded text-xs overflow-x-auto max-h-32 whitespace-pre-wrap">
                  {testMsg}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
