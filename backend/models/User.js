import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  scores: [{
    topic: String,
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    date: { type: Date, default: Date.now }
  }]
});

export default mongoose.model('User', userSchema);