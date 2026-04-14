import express from 'express';
import multer from 'multer';
import Quiz from '../models/Quiz.js';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload JSON file (supports single topic or multiple topics array)
router.post('/upload', upload.single('quizFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Check if it's an array (multiple topics) or single object
    const topics = Array.isArray(data) ? data : [data];
    
    let uploadedCount = 0;
    let updatedCount = 0;
    const results = [];
    
    for (const quizData of topics) {
      // Validate each topic
      if (!quizData.topic || !quizData.questions || !Array.isArray(quizData.questions)) {
        continue; // Skip invalid topics
      }
      
      // Validate each question
      let validQuestions = true;
      for (let i = 0; i < quizData.questions.length; i++) {
        const q = quizData.questions[i];
        if (!q.question || !q.options || q.options.length !== 4 || !q.answer) {
          validQuestions = false;
          break;
        }
        
        // Check if answer exists in options
        if (!q.options.includes(q.answer)) {
          validQuestions = false;
          break;
        }
      }
      
      if (!validQuestions) {
        results.push({ topic: quizData.topic, status: 'skipped', error: 'Invalid question format' });
        continue;
      }
      
      quizData.totalQuestions = quizData.questions.length;
      
      // Check if topic already exists (case-insensitive)
      const existingQuiz = await Quiz.findOne({ 
        topic: { $regex: new RegExp(`^${quizData.topic}$`, 'i') }
      });
      
      if (existingQuiz) {
        existingQuiz.questions = quizData.questions;
        existingQuiz.totalQuestions = quizData.questions.length;
        await existingQuiz.save();
        updatedCount++;
        results.push({ topic: quizData.topic, status: 'updated', questions: quizData.questions.length });
      } else {
        const quiz = new Quiz(quizData);
        await quiz.save();
        uploadedCount++;
        results.push({ topic: quizData.topic, status: 'new', questions: quizData.questions.length });
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      message: `Upload complete: ${uploadedCount} new topics, ${updatedCount} updated topics`,
      results: results,
      totalTopics: topics.length
    });
    
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload single topic JSON (backward compatibility)
router.post('/upload-single', upload.single('quizFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const quizData = JSON.parse(fileContent);
    
    // Validate JSON structure
    if (!quizData.topic || !quizData.questions || !Array.isArray(quizData.questions)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid JSON format. Need topic and questions array.' });
    }
    
    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.question || !q.options || q.options.length !== 4 || !q.answer) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: `Question ${i + 1} is invalid. Each question must have question, 4 options, and answer.` 
        });
      }
      
      if (!q.options.includes(q.answer)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: `Question ${i + 1}: Answer "${q.answer}" must be one of the options.` 
        });
      }
    }
    
    quizData.totalQuestions = quizData.questions.length;
    
    const existingQuiz = await Quiz.findOne({ 
      topic: { $regex: new RegExp(`^${quizData.topic}$`, 'i') }
    });
    
    let result;
    let message;
    if (existingQuiz) {
      existingQuiz.questions = quizData.questions;
      existingQuiz.totalQuestions = quizData.questions.length;
      result = await existingQuiz.save();
      message = `Quiz updated successfully for topic: ${quizData.topic}`;
    } else {
      const quiz = new Quiz(quizData);
      result = await quiz.save();
      message = `New quiz uploaded successfully for topic: ${quizData.topic}`;
    }
    
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      message: message,
      topic: quizData.topic,
      questionsCount: quizData.questions.length
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await Quiz.find({}, 'topic totalQuestions createdAt');
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a quiz topic
router.delete('/topic/:topic', async (req, res) => {
  try {
    const topic = decodeURIComponent(req.params.topic);
    const result = await Quiz.deleteOne({ 
      topic: { $regex: new RegExp(`^${topic}$`, 'i') }
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.json({ message: `Topic "${topic}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all quizzes (for testing)
router.delete('/all', async (req, res) => {
  try {
    await Quiz.deleteMany({});
    res.json({ message: 'All quizzes deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;