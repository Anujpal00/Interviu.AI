require('dotenv').config();

const { generateText } = require("ai");
const { google } = require("@ai-sdk/google");
const path = require('path');
const fs = require('fs');

// Role-based fallback questions
const FALLBACK_QUESTIONS = {
  'DevOps Engineer': [
    'Can you explain your experience with CI/CD pipelines and the tools you\'ve used?',
    'How do you approach infrastructure as code and what tools do you prefer?',
    'Describe a time when you had to troubleshoot a production issue.',
    'What monitoring and logging tools have you worked with?',
    'How do you ensure security in your DevOps practices?'
  ],
  'Backend Developer': [
    'Can you explain your experience with RESTful APIs and microservices?',
    'How do you approach database design and optimization?',
    'Describe your experience with server-side frameworks and languages?',
    'How do you handle authentication and authorization in your applications?',
    'What strategies do you use for error handling and logging?'
  ],
  'Frontend Developer': [
    'Can you explain your experience with modern JavaScript frameworks?',
    'How do you approach responsive design and cross-browser compatibility?',
    'Describe your experience with state management in web applications?',
    'How do you optimize frontend performance?',
    'What strategies do you use for component reusability?'
  ],
  default: [
    'Can you describe a challenging project you worked on and the outcome?',
    'How do you approach debugging and root-cause analysis?',
    'What are your strengths and areas for improvement as a developer?',
    'How do you stay updated with the latest technologies?',
    'Describe a time when you had to learn a new technology quickly.'
  ]
};

// ----------------------
// Normalize question to avoid duplicates
function normalizeQuestion(q) {
  if (!q) return '';
  return q.replace(/\s+/g, ' ').trim().toLowerCase().replace(/[^\w\s]/g, '');
}

// Choose fallback question avoiding repeats
function chooseFallbackQuestion(role, previousQuestions) {
  const pool = FALLBACK_QUESTIONS[role] || FALLBACK_QUESTIONS.default;
  const normalizedPrev = previousQuestions.map(normalizeQuestion);
  const available = pool.filter(q => !normalizedPrev.includes(normalizeQuestion(q)));
  return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : pool[0];
}

// ----------------------
// Generate a single interview question
const generateQuestion = async (company, role, experienceLevel, previousQuestions = [], aiVoice = 'professional') => {
  if (!previousQuestions || previousQuestions.length === 0) {
    return "Tell me about yourself.";
  }

  const prompt = `
You are a ${aiVoice} AI interviewer for ${company}, conducting an interview for a ${role} position at ${experienceLevel} level.

Instructions:
1. Generate one clear, relevant interview question.
2. Ensure it matches the candidate's experience level.
3. Do NOT repeat any of these previous questions: ${previousQuestions.join(', ')}.
4. Focus on technical, problem-solving, or role-specific knowledge.
5. Respond ONLY with the question text, no explanation or numbering.
`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt
    });

    const normalized = normalizeQuestion(text);
    const normalizedPrev = previousQuestions.map(normalizeQuestion);

    if (!normalized || normalizedPrev.includes(normalized)) {
      return chooseFallbackQuestion(role, previousQuestions);
    }

    return text.trim();
  } catch (err) {
    console.error('⚠️ AI generation failed — using fallback:', err.message);
    return chooseFallbackQuestion(role, previousQuestions);
  }
};

// ----------------------
// Evaluate candidate answer
const evaluateAnswer = async (question, answer, company, role, experienceLevel, aiVoice = 'professional') => {
  const prompt = `
You are Interviu.AI — a professional AI interviewer.

Question: ${question}
Answer: ${answer}

Return JSON only (no markdown):
{
  "technicalCorrectness": number (1-10),
  "clarity": number (1-10),
  "depth": number (1-10),
  "communication": number (1-10),
  "feedback": "Brief constructive feedback in 1-2 sentences.",
  "followUpQuestion": "Ask a relevant follow-up question for a ${role} at ${company} (${experienceLevel} level)."
}
`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt
    });
    return JSON.parse(text.replace(/```json\s*|\s*```/g, '').trim());
  } catch {
    const fallbackFollowUps = FALLBACK_QUESTIONS[role] || FALLBACK_QUESTIONS.default;
    return {
      technicalCorrectness: 5,
      clarity: 7,
      depth: 6,
      communication: 7,
      feedback: 'AI evaluation unavailable — proceeding with fallback.',
      followUpQuestion: fallbackFollowUps[Math.floor(Math.random() * fallbackFollowUps.length)]
    };
  }
};

// ----------------------
// Generate final report
const generateReport = async (questions, company, role, experienceLevel, aiVoice = 'professional') => {
  const prompt = `
You are a ${aiVoice} AI interviewer summarizing a mock interview for a ${role} at ${company} (${experienceLevel} level).

Q&A summary:
${questions.map((q, i) => `Q${i + 1}: ${q.questionText}\nA${i + 1}: ${q.answerText}\nScores: ${JSON.stringify(q.scores)}`).join('\n')}

Return JSON only (no markdown):
{
  "overallScore": number (1-10),
  "strengths": ["2-4 key strengths"],
  "weaknesses": ["2-4 weaknesses"],
  "improvementSuggestions": ["2-4 actionable suggestions"]
}
`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt
    });
    return JSON.parse(text.replace(/```json\s*|\s*```/g, '').trim());
  } catch {
    return {
      overallScore: 6,
      strengths: ['Good communication', 'Solid technical foundation'],
      weaknesses: ['Limited depth in some topics'],
      improvementSuggestions: [
        'Practice more scenario-based questions',
        'Give detailed explanations for technical answers'
      ]
    };
  }
};

// ----------------------
// Setup questions
const generateSetupQuestion = async (step = 'company') => {
  switch (step) {
    case 'company': return "Hello! I'm Interviu.AI. Which company are you preparing for? (e.g., Google, Amazon, Microsoft)";
    case 'role': return "Great! What role are you applying for? (e.g., Frontend Developer, Backend Engineer, DevOps)";
    case 'experience': return "Perfect! What's your experience level? (Fresher, Mid-level, Senior, Lead)";
    case 'confirm': return "Thanks! Preparing your personalized interview now...";
    default: return "Setup complete. Shall we begin?";
  }
};

const processSetupResponse = async (step, response) => {
  const prompt = `
You are Interviu.AI. The user said: "${response}" for step: ${step}.
Extract and validate the answer. Return JSON only with the following structure:
{
  "company": "extracted company name",
  "role": "extracted role",
  "experienceLevel": "extracted experience level",
  "isValid": true/false,
  "message": "validation message if invalid"
}
`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt
    });
    const parsed = JSON.parse(text.replace(/```json\s*|\s*```/g, '').trim());

    if (step === 'company' && parsed.company) {
      return { company: parsed.company, isValid: true };
    } else if (step === 'role' && parsed.role) {
      return { role: parsed.role, isValid: true };
    } else if (step === 'experience' && parsed.experienceLevel) {
      return { experienceLevel: parsed.experienceLevel, isValid: true };
    } else {
      return { isValid: false, message: 'Invalid response format' };
    }
  } catch (error) {
    console.error('AI processing failed, using fallback:', error.message);
    if (step === 'company') {
      return { company: response.trim(), isValid: true };
    } else if (step === 'role') {
      return { role: response.trim(), isValid: true };
    } else if (step === 'experience') {
      return { experienceLevel: response.trim(), isValid: true };
    } else {
      return { isValid: false, message: 'Invalid step' };
    }
  }
};

// ----------------------
// TTS Integration using Coqui TTS
const generateSpeechAI = async (text, voiceId = 'female') => {
  try {
    console.log('Generating speech for:', text, 'with voice:', voiceId);

    // Map voiceId to Coqui TTS model
    const voiceModels = {
      'female': 'tts_models/en/ljspeech/tacotron2-DDC',
      'male': 'tts_models/en/ljspeech/speedy-speech',
      'glow': 'tts_models/en/ljspeech/glow-tts'
    };

    const modelName = voiceModels[voiceId] || voiceModels['female'];

    // Use child_process instead of execa for CommonJS compatibility
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python', [
      '-c',
      `
from TTS.api import TTS
tts = TTS(model_name="${modelName}")
tts.tts_to_file(text=${JSON.stringify(text)}, file_path="output.wav")
`
    ]);

    return new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Audio generated: output.wav');
          resolve(fs.readFileSync(path.join(__dirname, 'output.wav')));
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('⚠️ Coqui TTS failed:', error);
    return null;
  }
};

module.exports = {
  generateQuestion,
  evaluateAnswer,
  generateReport,
  generateSetupQuestion,
  processSetupResponse,
  generateSpeech: generateSpeechAI
};
