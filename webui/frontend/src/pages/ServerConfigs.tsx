import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ServerConfigsProps {
  serverId: string;
  onClose: () => void;
}

export default function ServerConfigs({ serverId, onClose }: ServerConfigsProps) {
  const [configs, setConfigs] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [original, setOriginal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    axios.get(`/api/servers/${serverId}/configs`)
      .then(res => setConfigs(res.data.configs.map((p: string) => p.split(/[/\\]/).pop())))
      .catch(() => setError('Failed to load configs'));
  }, [serverId]);

  const loadConfig = (cfg: string) => {
    setLoading(true);
    setError('');
    axios.get(`/api/servers/${serverId}/configs/${cfg}`)
      .then(res => {
        setSelected(cfg);
        setContent(res.data.content);
        setOriginal(res.data.content);
      })
      .catch(() => setError('Failed to load config'))
      .finally(() => setLoading(false));
  };

  const saveConfig = () => {
    setSaving(true);
    setSaveMsg('');
    axios.put(`/api/servers/${serverId}/configs/${selected}`, { content })
      .then(() => {
        setOriginal(content);
        setSaveMsg('Saved!');
      })
      .catch(() => setSaveMsg('Save failed'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="p-4">
      <button className="mb-2 text-gray-400 hover:text-white" onClick={onClose}>← Back</button>
      <h3 className="font-bold mb-2">Server Configs</h3>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="flex gap-4">
        <div>
          <ul className="mb-2">
            {configs.map(cfg => (
              <li key={cfg}>
                <button
                  className={`text-xs px-2 py-1 rounded ${selected === cfg ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'} mb-1`}
                  onClick={() => loadConfig(cfg)}
                  disabled={loading}
                >
                  {cfg}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          {selected && (
            <div>
              <textarea
                className="w-full h-64 bg-gray-900 text-green-300 p-2 rounded text-xs font-mono mb-2"
                value={content}
                onChange={e => setContent(e.target.value)}
                disabled={saving}
              />
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  onClick={saveConfig}
                  disabled={saving || content === original}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                  onClick={() => setContent(original)}
                  disabled={saving || content === original}
                >
                  Revert
                </button>
                {saveMsg && <span className="text-green-400 ml-2">{saveMsg}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
