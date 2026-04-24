import React, { useEffect, useState } from "react";
import axios from "axios";

interface SystemDiagnosticsProps {
  onClose: () => void;
}

export default function SystemDiagnostics({ onClose }: SystemDiagnosticsProps) {
  const [diag, setDiag] = useState<any>(null);
  useEffect(() => {
    axios.get("/api/system/diagnostics").then((res) => setDiag(res.data));
  }, []);
  if (!diag) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4">
      <button className="mb-2 text-gray-400 hover:text-white" onClick={onClose}>
        ← Back
      </button>
      <h3 className="font-bold mb-2">System Diagnostics</h3>
      <pre className="bg-gray-900 text-green-300 p-2 rounded text-xs overflow-x-auto max-h-96 whitespace-pre-wrap">
        {JSON.stringify(diag, null, 2)}
      </pre>
    </div>
  );
}
