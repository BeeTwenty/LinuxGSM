import React, { useEffect, useState } from "react";
import axios from "axios";

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const [settings, setSettings] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get("/api/settings").then((res) => setSettings(res.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const save = () => {
    setEditing(true);
    setMsg("");
    axios
      .put("/api/settings", settings)
      .then(() => setMsg("Saved!"))
      .catch(() => setMsg("Save failed"))
      .finally(() => setEditing(false));
  };

  if (!settings) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <button className="mb-2 text-gray-400 hover:text-white" onClick={onClose}>
        ← Back
      </button>
      <h3 className="font-bold mb-2">Web UI Settings</h3>
      <div className="mb-2">
        <label className="block mb-1">Port</label>
        <input
          name="port"
          value={settings.port}
          onChange={handleChange}
          className="bg-gray-800 text-white p-2 rounded text-xs w-32"
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Bind Address</label>
        <input
          name="bind"
          value={settings.bind}
          onChange={handleChange}
          className="bg-gray-800 text-white p-2 rounded text-xs w-32"
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Session Timeout (seconds)</label>
        <input
          name="sessionTimeout"
          value={settings.sessionTimeout}
          onChange={handleChange}
          className="bg-gray-800 text-white p-2 rounded text-xs w-32"
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Allowed Origins</label>
        <input
          name="allowedOrigins"
          value={settings.allowedOrigins}
          onChange={handleChange}
          className="bg-gray-800 text-white p-2 rounded text-xs w-full"
        />
      </div>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
        onClick={save}
        disabled={editing}
      >
        Save
      </button>
      {msg && <span className="ml-2 text-green-400">{msg}</span>}
    </div>
  );
}
