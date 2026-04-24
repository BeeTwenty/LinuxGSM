import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';

function App() {
  const [auth, setAuth] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auth/me')
      .then(res => setAuth(res.data))
      .catch(() => setAuth(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={auth ? (
          <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <h1 className="text-3xl font-bold">LinuxGSM Web UI</h1>
            <p className="mt-4">Welcome, {auth.username} ({auth.role})</p>
          </div>
        ) : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
