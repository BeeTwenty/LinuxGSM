import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ServerBackupsProps {
  serverId: string;
  onClose: () => void;
}

interface Backup {
  name: string;
  size: number;
  mtime: string;
}

export default function ServerBackups({ serverId, onClose }: ServerBackupsProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const loadBackups = () => {
    setLoading(true);
    axios.get(`/api/servers/${serverId}/backups`)
      .then(res => setBackups(res.data.backups))
      .catch(() => setError('Failed to load backups'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBackups(); }, [serverId]);

  const createBackup = () => {
    setCreating(true);
    setMsg('');
    axios.post(`/api/servers/${serverId}/backups`)
      .then(() => { setMsg('Backup created'); loadBackups(); })
      .catch(() => setMsg('Backup failed'))
      .finally(() => setCreating(false));
  };

  const deleteBackup = (name: string) => {
    if (!window.confirm(`Delete backup ${name}?`)) return;
    setDeleting(name);
    setMsg('');
    axios.delete(`/api/servers/${serverId}/backups/${encodeURIComponent(name)}`)
      .then(() => { setMsg('Backup deleted'); loadBackups(); })
      .catch(() => setMsg('Delete failed'))
      .finally(() => setDeleting(null));
  };

  return (
    <div className="p-4">
      <button className="mb-2 text-gray-400 hover:text-white" onClick={onClose}>← Back</button>
      <h3 className="font-bold mb-2">Backups</h3>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <button
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
        onClick={createBackup}
        disabled={creating}
      >
        {creating ? 'Creating...' : 'Create Backup'}
      </button>
      {msg && <div className="mb-2 text-green-400">{msg}</div>}
      <table className="w-full text-xs bg-gray-800 rounded">
        <thead>
          <tr className="text-gray-400">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Size</th>
            <th className="p-2 text-left">Modified</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {backups.map(b => (
            <tr key={b.name} className="border-t border-gray-700">
              <td className="p-2">{b.name}</td>
              <td className="p-2">{(b.size / 1024 / 1024).toFixed(2)} MB</td>
              <td className="p-2">{new Date(b.mtime).toLocaleString()}</td>
              <td className="p-2">
                <button
                  className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-xs"
                  onClick={() => deleteBackup(b.name)}
                  disabled={deleting === b.name}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {backups.length === 0 && !loading && <div className="mt-4">No backups found.</div>}
    </div>
  );
}
