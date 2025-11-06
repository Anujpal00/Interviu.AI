import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup({ onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, profile: { name } }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed');
      } else {
        onSignup();
        navigate('/login');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-futuristic font-bold text-glow bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent mb-2">
            Interviu.AI
          </h1>
          <p className="text-gray-300">Join the future of intelligent interviews</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-8 floating">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign Up</h2>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 animate-slide-in">
              {error}
            </div>
          )}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-300" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-300" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-300" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-pink to-neon-purple text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          <p className="mt-6 text-center text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-cyan hover:text-neon-purple transition-colors duration-300 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
