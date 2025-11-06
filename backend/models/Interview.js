const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: '',
  },
  experienceLevel: {
    type: String,
    default: '',
  },
  aiVoice: {
    type: String,
    default: 'professional',
  },
  numberOfQuestions: {
    type: Number,
    default: 10, // Default to 10, but AI will adapt dynamically
  },
  questions: [
    {
      questionText: String,
      answerText: String,
      scores: {
        technicalCorrectness: Number,
        clarity: Number,
        depth: Number,
        communication: Number,
      },
      feedback: String,
      followUpQuestion: String,
    },
  ],
  overallScore: Number,
  strengths: [String],
  weaknesses: [String],
  improvementSuggestions: [String],
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);
