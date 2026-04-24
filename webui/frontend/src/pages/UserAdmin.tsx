import React, { useEffect, useState } from "react";
import axios from "axios";

interface WebUIUser {
  username: string;
  role: "admin" | "user";
  enabled: boolean;
}

export default function UserAdmin({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<WebUIUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ username: "", role: "user" });
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("/api/admin/users")
      .then((res) => setUsers(res.data.users))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async () => {
    setSaving(true);
    try {
      await axios.post("/api/admin/users", newUser);
      setNewUser({ username: "", role: "user" });
      fetchUsers();
    } catch (e) {
      alert("Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (username: string, updates: Partial<WebUIUser>) => {
    setSaving(true);
    try {
      await axios.put(`/api/admin/users/${username}`, updates);
      fetchUsers();
    } catch (e) {
      alert("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (username: string) => {
    if (!window.confirm(`Delete user ${username}?`)) return;
    setSaving(true);
    try {
      await axios.delete(`/api/admin/users/${username}`);
      fetchUsers();
    } catch (e) {
      alert("Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">User & Admin Management</h2>
      <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={onClose}>✕</button>
      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <>
          <table className="w-full mb-4 text-sm">
            <thead>
              <tr>
                <th className="text-left">Username</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username} className="border-b border-gray-700">
                  <td>{u.username}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.username, { role: e.target.value as "admin" | "user" })}
                      disabled={saving}
                      className="bg-gray-800 text-white rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className={`px-2 py-1 rounded text-xs ${u.enabled ? "bg-green-700" : "bg-gray-600"}`}
                      onClick={() => updateUser(u.username, { enabled: !u.enabled })}
                      disabled={saving}
                    >
                      {u.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-xs"
                      onClick={() => deleteUser(u.username)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 items-center">
            <input
              className="bg-gray-800 text-white rounded px-2 py-1"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser((u) => ({ ...u, username: e.target.value }))}
              disabled={saving}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value as "admin" | "user" }))}
              className="bg-gray-800 text-white rounded px-2 py-1"
              disabled={saving}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded text-xs"
              onClick={addUser}
              disabled={saving || !newUser.username}
            >
              Add User
            </button>
          </div>
        </>
      )}
    </div>
  );
}
