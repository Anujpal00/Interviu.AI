# Interviu.AI - AI-Powered Interview Practice Platform

![JavaScript](https://img.shields.io/badge/JavaScript-85.8%25-yellow?style=flat-square)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## 📋 Overview

**Interviu.AI** is an innovative AI-powered interview preparation platform that helps job seekers practice technical and behavioral interviews in a realistic environment. The platform uses advanced AI to conduct interviews, analyze responses in real-time, provide constructive feedback, and generate comprehensive evaluation reports.

### Key Features

- 🤖 **AI Interview Conductor**: Powered by Google's Generative AI for realistic interview questions
- 🎤 **Text-to-Speech Integration**: Natural audio feedback for a more immersive experience
- 📊 **Real-Time Feedback**: Instant analysis on technical correctness, clarity, depth, and communication
- 📈 **Comprehensive Reports**: Detailed evaluation with scores, strengths, weaknesses, and improvement suggestions
- 🔐 **Secure Authentication**: JWT-based user authentication and authorization
- 💾 **Interview History**: Track and review all past interviews
- ⚙️ **Adaptive Questions**: Questions tailored to company, role, and experience level
- 🎯 **Multi-Step Interview Setup**: Gather user context before starting the interview

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**
- **Git**
- API Keys:
  - Google Generative AI API Key
  - (Optional) ElevenLabs API Key for advanced text-to-speech

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Anujpal00/Interviu.AI.git
cd Interviu.AI
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create a .env file with the following variables
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/interviewai
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_API_KEY=your_google_generative_ai_key_here
EOF

# Start the backend server
npm start
# OR for development with auto-reload
npm run dev
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create a .env file (optional for development)
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

# Start the development server
npm run dev
```

#### 4. Access the Application

- **Frontend**: Open `http://localhost:3000` in your browser
- **Backend API**: `http://localhost:5000`

---

## 🐳 Docker Setup

Run the entire application stack with Docker Compose:

```bash
# From the root directory
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

---

## 📁 Project Structure

```
Interviu.AI/
├── frontend/                      # React.js frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/               # Page components
│   │   ├── styles/              # CSS and Tailwind styles
│   │   └── App.jsx              # Main App component
│   ├── package.json
│   ├── vite.config.js           # Vite configuration
│   └── Dockerfile               # Frontend Docker image
│
├── backend/                       # Node.js/Express backend
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   └── interview.js         # Interview management endpoints
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Interview.js         # Interview schema
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── services/
│   │   └── aiService.js         # AI integration service
│   ├── db.js                    # MongoDB connection
│   ├── server.js                # Express server entry point
│   ├── package.json
│   └── Dockerfile               # Backend Docker image
│
├── main.tf                        # Terraform infrastructure code (AWS/Cloud)
├── docker-compose.yml             # Docker Compose configuration
├── build_push.bat                 # Windows batch script for Docker build
└── README.md                      # This file
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### **POST** `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "profile": {
    "name": "John Doe"
  }
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **POST** `/api/auth/login`
Login to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Interview Endpoints

#### **POST** `/api/interviews/setup/start`
Initialize a new interview session.

**Response:**
```json
{
  "interviewId": "507f1f77bcf86cd799439011",
  "message": "What company are you interviewing for?",
  "step": "company"
}
```

#### **POST** `/api/interviews/setup/process/:interviewId/:step`
Process setup responses (company, role, experience level).

**Request Body:**
```json
{
  "response": "Google"
}
```

**Response:**
```json
{
  "message": "What is the position you're applying for?",
  "step": "role",
  "isValid": true
}
```

#### **POST** `/api/interviews/:id/setup/confirm`
Confirm setup and start the interview.

**Response:**
```json
{
  "message": "Let's begin your interview session!",
  "ready": true
}
```

#### **POST** `/api/interviews/:id/start`
Get the first interview question.

**Response:**
```json
{
  "question": "Can you tell us about your experience with full-stack development?"
}
```

#### **POST** `/api/interviews/:id/answer`
Submit an answer and receive feedback.

**Request Body:**
```json
{
  "answer": "I have 5 years of experience with full-stack development..."
}
```

**Response:**
```json
{
  "feedback": "Great answer! You covered technical depth and provided specific examples...",
  "nextQuestion": "Can you describe a challenging project you've worked on?"
}
```

#### **GET** `/api/interviews/:id/report`
Get the final interview report.

**Response:**
```json
{
  "overallScore": 8.5,
  "strengths": [
    "Strong technical knowledge",
    "Clear communication skills",
    "Good problem-solving approach"
  ],
  "weaknesses": [
    "Could provide more specific metrics",
    "Limited discussion of team collaboration"
  ],
  "improvementSuggestions": [
    "Practice quantifying achievements with specific numbers",
    "Prepare examples of successful team projects"
  ]
}
```

#### **GET** `/api/interviews`
Retrieve all past interviews for the authenticated user.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "company": "Google",
    "role": "Software Engineer",
    "experienceLevel": "5 years",
    "date": "2024-01-15T10:30:00Z",
    "overallScore": 8.5,
    "questions": [...]
  }
]
```

---

## 🧠 AI Service Integration

The platform leverages Google's Generative AI for:

- **Question Generation**: Creates tailored questions based on company, role, and experience level
- **Answer Evaluation**: Analyzes user responses on multiple dimensions
- **Scoring System**:
  - Technical Correctness (0-10)
  - Clarity (0-10)
  - Depth (0-10)
  - Communication (0-10)
- **Feedback Generation**: Provides constructive, actionable feedback
- **Follow-Up Questions**: Generates dynamic follow-up questions based on responses
- **Report Generation**: Creates comprehensive evaluation reports

---

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication with 1-hour expiration
- **Password Hashing**: Passwords are hashed using bcryptjs with salt
- **Protected Routes**: All interview routes require valid JWT token
- **User Isolation**: Users can only access their own interview data
- **Environment Variables**: Sensitive keys stored in `.env` file (not committed to repo)

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0**: Modern UI library
- **Vite 4.0.0**: Fast build tool
- **React Router DOM 6.8.0**: Client-side routing
- **Tailwind CSS 3.3.2**: Utility-first CSS framework
- **PostCSS & Autoprefixer**: CSS processing

### Backend
- **Node.js & Express 4.18.2**: Web server framework
- **MongoDB & Mongoose 7.0.0**: Database and ODM
- **JWT (jsonwebtoken 9.0.0)**: Authentication
- **Bcryptjs 2.4.3**: Password hashing
- **CORS**: Cross-Origin Resource Sharing
- **Dotenv**: Environment variable management
- **Google Generative AI SDK**: AI integration
- **Vercel AI SDK**: AI abstraction layer
- **ElevenLabs SDK**: Text-to-speech (optional)

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Terraform**: Infrastructure as Code (AWS deployment)
- **MongoDB**: NoSQL database

---

## 📊 Data Models

### User Schema
```javascript
{
  email: String (unique, required),
  password: String (hashed),
  profile: {
    name: String
  },
  createdAt: Date
}
```

### Interview Schema
```javascript
{
  userId: ObjectId (reference to User),
  company: String,
  role: String,
  experienceLevel: String,
  aiVoice: String,
  questions: [{
    questionText: String,
    answerText: String,
    scores: {
      technicalCorrectness: Number,
      clarity: Number,
      depth: Number,
      communication: Number
    },
    feedback: String,
    followUpQuestion: String
  }],
  overallScore: Number,
  strengths: [String],
  weaknesses: [String],
  improvementSuggestions: [String],
  date: Date
}
```

---

## 🎯 Interview Flow

1. **User Authentication**: Sign up or login
2. **Setup Phase**: 
   - Enter company name
   - Specify job role
   - Select experience level
   - Review and confirm details
3. **Interview Session**:
   - Receive AI-generated question
   - Submit answer via text
   - Get real-time feedback on performance
   - Move to next question (up to 10 questions)
4. **Report Generation**:
   - AI analyzes all responses
   - Generates comprehensive report with scores
   - Identifies strengths and weaknesses
   - Provides improvement suggestions
5. **History Tracking**:
   - Review past interviews
   - Access all reports
   - Track progress over time

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Cloud Deployment (AWS with Terraform)

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply configuration
terraform apply

# Destroy resources
terraform destroy
```

---

## 📋 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/interviewai
PORT=5000
JWT_SECRET=your_secret_key_here
GOOGLE_API_KEY=your_google_generative_ai_key
ELEVENLABS_API_KEY=your_elevenlabs_key_optional
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Testing

View detailed test cases and specifications:
- [Test Cases Spreadsheet](https://docs.google.com/spreadsheets/d/1lVAl5d-Bb8iq8kui_lJX-Jx_yVgrN3yu0dUd0i62zgk/edit?usp=sharing)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙋 Support & Contact

- **GitHub Issues**: Report bugs and feature requests
- **Email**: For direct inquiries
- **Documentation**: Check the test cases spreadsheet for detailed specifications

---

## 🎓 Learning Resources

- [Google Generative AI Documentation](https://ai.google.dev/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB University](https://university.mongodb.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📈 Roadmap

- [ ] Integration with video recording for behavioral interviews
- [ ] Multi-language support
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Interview templates for specific companies
- [ ] Peer comparison and benchmarking
- [ ] Mock interview scheduling with real interviewers
- [ ] Resume analysis integration
- [ ] Interview performance trends
- [ ] Certification program

---

## 🎉 Acknowledgments

- Google Generative AI for powering the AI interview conductor
- MongoDB for reliable data persistence
- React and Node.js communities for excellent frameworks
- All contributors and users who help improve this platform

---

**Made with ❤️ by [Anujpal00](https://github.com/Anujpal00)**

*Last Updated: 2026-06-13*
