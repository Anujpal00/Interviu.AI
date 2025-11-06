import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function InterviewSimulation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [report, setReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    startInterview();
  }, []);

  const startInterview = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/interviews/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to start interview');

      const data = await response.json();
      setCurrentQuestion(data.question);
      setQuestionCount(1);
      speakText(data.question);
    } catch (error) {
      console.error(error);
      alert('Failed to start interview');
    }
  };

  const speakText = (text) => {
    if (!synthRef.current) {
      console.error('Speech synthesis not supported');
      return;
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setAnswer(prev => prev + finalTranscript);
      }
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const submitAnswer = async () => {
    console.log('Submitting answer:', answer);
    if (!answer.trim() || isSubmitting) {
      console.log('Submission blocked: answer empty or already submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sending fetch request to submit answer');
      const response = await fetch(`http://localhost:5000/api/interviews/${id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ answer }),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      console.log('Answer submitted successfully:', data);

      if (data.report) {
        setIsInterviewComplete(true);
        setReport(data.report);
        speakText('Interview complete. Here is your final report.');
      } else {
        setFeedback(data.feedback);
        setCurrentQuestion(data.nextQuestion);
        setQuestionCount(prev => prev + 1);
        setAnswer('');
        speakText(data.nextQuestion);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewReport = () => {
    navigate('/dashboard');
  };

  if (isInterviewComplete) {
    return (
      <div className="container mx-auto p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-futuristic font-bold mb-4 text-glow bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            Interview Complete!
          </h2>
          <p className="text-gray-300 text-lg">Congratulations on completing your AI-powered interview</p>
        </div>

        <div className="max-w-4xl mx-auto glass-card p-8 floating">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold mb-4 text-white">Final Report</h3>
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/50 rounded-xl p-6 mb-6">
              <p className="text-2xl font-bold text-green-300 mb-2">Overall Score</p>
              <p className="text-6xl font-futuristic text-glow text-white">{report.overallScore}/10</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
              <h4 className="text-xl font-bold mb-4 text-green-300">Strengths</h4>
              <ul className="text-white space-y-2">
                {report.strengths.map((strength, i) => <li key={i} className="flex items-start"><span className="text-neon-cyan mr-2">✓</span>{strength}</li>)}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
              <h4 className="text-xl font-bold mb-4 text-red-300">Areas for Improvement</h4>
              <ul className="text-white space-y-2">
                {report.weaknesses.map((weakness, i) => <li key={i} className="flex items-start"><span className="text-neon-pink mr-2">⚠</span>{weakness}</li>)}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
              <h4 className="text-xl font-bold mb-4 text-blue-300">Improvement Suggestions</h4>
              <ul className="text-white space-y-2">
                {report.improvementSuggestions.map((suggestion, i) => <li key={i} className="flex items-start"><span className="text-neon-purple mr-2">💡</span>{suggestion}</li>)}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={viewReport}
              className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 animate-glow text-lg font-semibold"
            >
              📊 Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto glass-card p-8 floating">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-futuristic font-bold text-white">Question {questionCount}</h2>
            <div className="text-neon-cyan font-semibold">AI Interview in Progress</div>
          </div>

          <div className="bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 rounded-xl p-6 mb-6">
            <p className="text-white text-xl leading-relaxed mb-4">{currentQuestion}</p>
            <button
              onClick={() => speakText(currentQuestion)}
              disabled={isSpeaking}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 animate-pulse-glow"
            >
              {isSpeaking ? '🔊 Speaking...' : '🔊 Listen to Question'}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="block mb-4 text-xl font-semibold text-white">Your Answer:</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300 h-40 resize-none"
            placeholder="Type your answer or use voice input..."
          />
          <div className="mt-4 flex gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-semibold ${
                isListening
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse-glow'
                  : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:shadow-lg'
              }`}
            >
              {isListening ? '🎤 Stop Voice Input' : '🎤 Start Voice Input'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={submitAnswer}
            disabled={!answer.trim() || isSubmitting}
            className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-glow text-lg font-semibold"
          >
            {isSubmitting ? '🚀 Submitting...' : '🚀 Submit Answer'}
          </button>
        </div>

        {feedback && (
          <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 animate-slide-in">
            <h3 className="text-xl font-bold mb-4 text-blue-300">AI Feedback:</h3>
            <p className="text-white text-lg leading-relaxed">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewSimulation;
