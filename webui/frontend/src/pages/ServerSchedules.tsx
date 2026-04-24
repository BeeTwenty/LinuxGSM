import React, { useEffect, useState } from "react";
import axios from "axios";

interface ServerSchedulesProps {
  serverId: string;
  onClose: () => void;
}

interface Schedule {
  id: number;
  line: string;
}

export default function ServerSchedules({
  serverId,
  onClose,
}: ServerSchedulesProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newLine, setNewLine] = useState("");
  const [msg, setMsg] = useState("");

  const loadSchedules = () => {
    setLoading(true);
    axios
      .get(`/api/servers/${serverId}/schedules`)
      .then((res) => setSchedules(res.data.schedules))
      .catch(() => setError("Failed to load schedules"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSchedules();
  }, [serverId]);

  const addSchedule = () => {
    if (!newLine.trim()) return;
    axios
      .post(`/api/servers/${serverId}/schedules`, { line: newLine })
      .then(() => {
        setMsg("Added");
        setNewLine("");
        loadSchedules();
      })
      .catch(() => setMsg("Add failed"));
  };

  const deleteSchedule = (id: number) => {
    if (!window.confirm("Delete this schedule?")) return;
    axios
      .delete(`/api/servers/${serverId}/schedules/${id}`)
      .then(() => {
        setMsg("Deleted");
        loadSchedules();
      })
      .catch(() => setMsg("Delete failed"));
  };

  return (
    <div className="p-4">
      <button className="mb-2 text-gray-400 hover:text-white" onClick={onClose}>
        ← Back
      </button>
      <h3 className="font-bold mb-2">Schedules (cron format)</h3>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="mb-2">
        <input
          className="bg-gray-800 text-white p-2 rounded text-xs w-2/3"
          value={newLine}
          onChange={(e) => setNewLine(e.target.value)}
          placeholder="* * * * * /path/to/script action"
        />
        <button
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          onClick={addSchedule}
        >
          Add
        </button>
      </div>
      {msg && <div className="mb-2 text-green-400">{msg}</div>}
      <table className="w-full text-xs bg-gray-800 rounded">
        <thead>
          <tr className="text-gray-400">
            <th className="p-2 text-left">Line</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.id} className="border-t border-gray-700">
              <td className="p-2 font-mono">{s.line}</td>
              <td className="p-2">
                <button
                  className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-xs"
                  onClick={() => deleteSchedule(s.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {schedules.length === 0 && !loading && (
        <div className="mt-4">No schedules found.</div>
      )}
    </div>
  );
}
