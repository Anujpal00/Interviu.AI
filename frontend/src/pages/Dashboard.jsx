import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/interviews', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch interviews');

      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const viewReport = (interviewId) => {
    navigate(`/interview/${interviewId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto"></div>
        <p className="mt-4 text-gray-300">Loading your interviews...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-futuristic font-bold mb-4 text-glow bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
          Your Interview Dashboard
        </h2>
        <p className="text-gray-300 text-lg">Track your progress in the AI-powered interview experience</p>
      </div>

      <div className="mb-12 text-center">
        <button
          onClick={() => navigate('/config')}
          className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 animate-glow text-lg font-semibold"
        >
          🚀 Start New Interview
        </button>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center">
          <div className="glass-card p-12 max-w-md mx-auto floating">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-gray-300 text-xl mb-6">No interviews yet. Ready to begin your AI interview journey?</p>
            <button
              onClick={() => navigate('/config')}
              className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview, index) => (
            <div
              key={interview._id}
              className="glass-card p-6 card-3d animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2 text-white">{interview.company} - {interview.role}</h3>
                <div className="flex items-center mb-2">
                  <span className="text-neon-cyan font-semibold">Experience:</span>
                  <span className="ml-2 text-gray-300">{interview.experienceLevel}</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-neon-cyan font-semibold">Questions:</span>
                  <span className="ml-2 text-gray-300">{interview.questions.length}/{interview.numberOfQuestions}</span>
                </div>
                <div className="flex items-center mb-4">
                  <span className="text-neon-cyan font-semibold">Date:</span>
                  <span className="ml-2 text-gray-300">{new Date(interview.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {interview.report ? (
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
                    <p className="font-semibold text-green-300 text-center">
                      Score: <span className="text-2xl text-glow">{interview.report.overallScore}/10</span>
                    </p>
                  </div>
                  <button
                    onClick={() => viewReport(interview._id)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 animate-pulse-glow"
                  >
                    📊 View Report
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/interview/${interview._id}`)}
                  className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 animate-glow"
                >
                  🎯 Continue Interview
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
