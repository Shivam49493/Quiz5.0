import express from 'express';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// Get quiz by topic (case-insensitive)
router.get('/topic/:topic', async (req, res) => {
  try {
    const topic = decodeURIComponent(req.params.topic);
    console.log('Looking for topic:', topic);
    
    // Case-insensitive search
    const quiz = await Quiz.findOne({ 
      topic: { $regex: new RegExp(`^${topic}$`, 'i') }
    });
    
    if (!quiz) {
      console.log('Quiz not found for topic:', topic);
      return res.status(404).json({ error: `Quiz not found for topic: ${topic}` });
    }
    
    console.log('Quiz found:', quiz.topic, 'with', quiz.questions.length, 'questions');
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all available topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await Quiz.find({}, 'topic totalQuestions');
    console.log('Available topics:', topics);
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all quizzes (for debugging)
router.get('/all', async (req, res) => {
  try {
    const quizzes = await Quiz.find({});
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;