import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function InterviewConfig() {
  const [currentMessage, setCurrentMessage] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [currentStep, setCurrentStep] = useState('company');
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    startSetup();
  }, []);

  const startSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/interviews/setup/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to start setup');

      const data = await response.json();
      setInterviewId(data.interviewId);
      setCurrentMessage(data.message);
      setCurrentStep(data.step);
    } catch (error) {
      console.error(error);
      alert('Failed to start interview setup');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    if (!userResponse.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/interviews/setup/process/${interviewId}/${currentStep}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ response: userResponse }),
      });

      if (!response.ok) throw new Error('Failed to process response');

      const data = await response.json();

      if (!data.isValid) {
        setCurrentMessage(data.message);
        setUserResponse('');
        return;
      }

      if (data.step === 'ready') {
        setCurrentMessage(data.message);
        setIsReady(true);
      } else {
        setCurrentMessage(data.message);
        setCurrentStep(data.step);
      }
      setUserResponse('');
    } catch (error) {
      console.error(error);
      alert('Failed to process your response');
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/interviews/${interviewId}/setup/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to confirm setup');

      const data = await response.json();
      setCurrentMessage(data.message);

      // Navigate to interview after a short delay
      setTimeout(() => {
        navigate(`/interview/${interviewId}`);
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-futuristic font-bold mb-4 text-glow bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            AI Interview Setup
          </h2>
          <p className="text-gray-300 text-lg">Configure your personalized interview experience</p>
        </div>

        <div className="glass-card p-8 floating">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 p-6 rounded-xl mb-6 animate-slide-in">
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0 animate-pulse-glow">
                  🤖
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg leading-relaxed">{currentMessage}</p>
                </div>
              </div>
            </div>

            {!isReady && (
              <div className="flex gap-4">
                <input
                  type="text"
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResponse()}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300"
                  placeholder="Type your response here..."
                  disabled={loading}
                />
                <button
                  onClick={handleResponse}
                  disabled={loading || !userResponse.trim()}
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-glow"
                >
                  {loading ? 'Processing...' : '🚀 Send'}
                </button>
              </div>
            )}

            {isReady && (
              <div className="text-center">
                <button
                  onClick={startInterview}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow text-lg font-semibold"
                >
                  {loading ? 'Starting Interview...' : '🎯 Yes, Let\'s Begin!'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewConfig;
