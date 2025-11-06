const express = require('express');
const authMiddleware = require('../middleware/auth');
const Interview = require('../models/Interview');
const { generateQuestion, evaluateAnswer, generateReport, generateSetupQuestion, processSetupResponse, generateSpeech } = require('../services/aiService');

const router = express.Router();

// Setup conversation endpoints (moved to top to avoid route conflicts)
router.post('/setup/start', authMiddleware, async (req, res) => {
  try {
    // Create initial interview with empty config
    const interview = new Interview({
      userId: req.user.id,
      company: '',
      role: '',
      experienceLevel: '',
    });
    await interview.save();

    const setupQuestion = await generateSetupQuestion('company');
    res.json({ interviewId: interview._id, message: setupQuestion, step: 'company' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/setup/process/:interviewId/:step', authMiddleware, async (req, res) => {
  try {
    const { response } = req.body;
    const { interviewId, step } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview || interview.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const processed = await processSetupResponse(step, response);

    if (!processed.isValid) {
      return res.json({ message: processed.message, step, isValid: false });
    }

    // Update interview with processed data
    if (step === 'company') {
      interview.company = processed.company;
      await interview.save();
      const nextQuestion = await generateSetupQuestion('role');
      res.json({ message: nextQuestion, step: 'role', isValid: true });
    } else if (step === 'role') {
      interview.role = processed.role;
      await interview.save();
      const nextQuestion = await generateSetupQuestion('experience');
      res.json({ message: nextQuestion, step: 'experience', isValid: true });
    } else if (step === 'experience') {
      interview.experienceLevel = processed.experienceLevel;
      await interview.save();
      const confirmMessage = await generateSetupQuestion('confirm');
      res.json({ message: confirmMessage, step: 'ready', isValid: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/setup/confirm', authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check if all required fields are set
    if (!interview.company || !interview.role || !interview.experienceLevel) {
      return res.status(400).json({ message: 'Setup incomplete' });
    }

    const startMessage = await generateSetupQuestion('start');
    res.json({ message: startMessage, ready: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new interview
router.post('/', authMiddleware, async (req, res) => {
  try {
    const interviewData = req.body;
    interviewData.userId = req.user.id;

    const interview = new Interview(interviewData);
    await interview.save();

    res.status(201).json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get past interviews for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start interview and get first question
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const question = await generateQuestion(interview.company, interview.role, interview.experienceLevel, [], interview.aiVoice);
    interview.questions.push({ questionText: question });
    await interview.save();

    res.json({ question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit answer and get feedback and next question
router.post('/:id/answer', authMiddleware, async (req, res) => {
  try {
    const { answer } = req.body;
    console.log(`Received answer for interview ${req.params.id}: ${answer}`);
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const currentQuestionIndex = interview.questions.length - 1;
    const currentQuestion = interview.questions[currentQuestionIndex];
    currentQuestion.answerText = answer;

    const evaluation = await evaluateAnswer(currentQuestion.questionText, answer, interview.company, interview.role, interview.experienceLevel);
    currentQuestion.scores = {
      technicalCorrectness: evaluation.technicalCorrectness,
      clarity: evaluation.clarity,
      depth: evaluation.depth,
      communication: evaluation.communication,
    };
    currentQuestion.feedback = evaluation.feedback;
    currentQuestion.followUpQuestion = evaluation.followUpQuestion;

    await interview.save();
    console.log(`Answer saved for interview ${req.params.id}`);

    // Always generate next question unless followUpQuestion is empty or interview has reached a reasonable length
    if (evaluation.followUpQuestion && interview.questions.length < 10) { // Limit to 10 questions max
      const nextQuestion = evaluation.followUpQuestion;
      interview.questions.push({ questionText: nextQuestion });
      await interview.save();
      res.json({ feedback: evaluation.feedback, nextQuestion });
    } else {
      // Generate final report
      try {
        const report = await generateReport(interview.questions, interview.company, interview.role, interview.experienceLevel);
        interview.overallScore = report.overallScore;
        interview.strengths = report.strengths;
        interview.weaknesses = report.weaknesses;
        interview.improvementSuggestions = report.improvementSuggestions;
        await interview.save();
        res.json({ feedback: evaluation.feedback, report });
      } catch (error) {
        console.error('Error generating report:', error);
        // Fallback report if AI fails
        const fallbackReport = {
          overallScore: 7,
          strengths: ['Good communication skills', 'Technical knowledge demonstrated'],
          weaknesses: ['Could provide more specific examples', 'Limited depth in some areas'],
          improvementSuggestions: ['Practice providing more detailed examples', 'Focus on explaining technical concepts clearly']
        };
        interview.overallScore = fallbackReport.overallScore;
        interview.strengths = fallbackReport.strengths;
        interview.weaknesses = fallbackReport.weaknesses;
        interview.improvementSuggestions = fallbackReport.improvementSuggestions;
        await interview.save();
        res.json({ feedback: evaluation.feedback, report: fallbackReport });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get interview report
router.get('/:id/report', authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({
      overallScore: interview.overallScore,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      improvementSuggestions: interview.improvementSuggestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Speech endpoint removed - using browser TTS instead

module.exports = router;
