import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import InterviewConfig from './pages/InterviewConfig';
import InterviewSimulation from './pages/InterviewSimulation';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen">
      {isAuthenticated && (
        <nav className="glass backdrop-blur-md p-4 sticky top-0 z-50 animate-fade-in">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-futuristic font-bold text-glow bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Interviu.AI
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="neumorphism px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-white"
              >
                Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/config'}
                className="neumorphism px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-white"
              >
                New Interview
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-neon-pink to-neon-purple text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 animate-pulse-glow"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/signup" element={<Signup onSignup={() => setIsAuthenticated(true)} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/config" element={isAuthenticated ? <InterviewConfig /> : <Navigate to="/login" />} />
        <Route path="/interview/:id" element={isAuthenticated ? <InterviewSimulation /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
