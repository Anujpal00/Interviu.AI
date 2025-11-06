const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    name: { type: String },
    // Add other profile fields as needed
  },
  preferences: {
    // Store user preferences here
  },
  interviewHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
