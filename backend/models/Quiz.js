import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    index: true
  },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true }
  }],
  totalQuestions: { type: Number, default: 0 },
  uploadedBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
quizSchema.index({ topic: 1 });

export default mongoose.model('Quiz', quizSchema);