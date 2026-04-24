import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ServerDetailsProps {
  serverId: string;
  onClose: () => void;
}

export default function ServerDetails({ serverId, onClose }: ServerDetailsProps) {
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/servers/${serverId}/details`)
      .then(res => setDetails(res.data.details))
      .catch(() => setError('Failed to load details'))
      .finally(() => setLoading(false));
  }, [serverId]);

  return (
    <div className="p-4">
      <button className="mb-2 text-gray-400 hover:text-white" onClick={onClose}>← Back</button>
      <h3 className="font-bold mb-2">Server Details</h3>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-400">{error}</div> : (
        <pre className="bg-gray-900 text-green-300 p-2 rounded text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">{details}</pre>
      )}
    </div>
  );
}
