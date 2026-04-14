import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setQuizConfig, setCurrentQuiz, startQuiz, setTimerInterval } from '../redux/quizSlice';
import axios from 'axios';

function QuizSetup() {
  const dispatch = useDispatch();
  const { topics } = useSelector((state) => state.quiz);
  const [config, setConfig] = useState({
    topic: '',
    numberOfQuestions: 10,
    timePerQuestion: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!config.topic) {
      setError('Please select a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Fetching quiz for topic:', config.topic);
      const response = await axios.get(`http://localhost:5000/api/quizzes/topic/${encodeURIComponent(config.topic)}`);
      
      if (!response.data || !response.data.questions) {
        throw new Error('Invalid quiz data received');
      }
      
      const quizData = response.data;
      console.log('Quiz data received:', quizData.topic, 'with', quizData.questions.length, 'questions');
      
      // Shuffle questions and take only required number
      const shuffledQuestions = [...quizData.questions].sort(() => Math.random() - 0.5);
      const numberOfQuestions = Math.min(config.numberOfQuestions, shuffledQuestions.length);
      const selectedQuestions = shuffledQuestions.slice(0, numberOfQuestions);
      
      if (selectedQuestions.length === 0) {
        throw new Error('No questions available for this topic');
      }
      
      dispatch(setCurrentQuiz({
        ...quizData,
        questions: selectedQuestions
      }));
      dispatch(setQuizConfig({
        ...config,
        numberOfQuestions: numberOfQuestions
      }));
      dispatch(startQuiz());
      
      // Start timer
      const interval = setInterval(() => {
        dispatch((dispatch, getState) => {
          const { timeRemaining, quizStarted } = getState().quiz;
          if (quizStarted && timeRemaining > 0) {
            dispatch({ type: 'quiz/setTimeRemaining', payload: timeRemaining - 1 });
          }
        });
      }, 1000);
      
      dispatch(setTimerInterval(interval));
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError(error.response?.data?.error || error.message || 'Error loading quiz. Please make sure the topic exists.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = (e) => {
    const selectedTopic = e.target.value;
    const topicData = topics.find(t => t.topic === selectedTopic);
    const maxQ = topicData?.totalQuestions || 0;
    setConfig({ 
      ...config, 
      topic: selectedTopic,
      numberOfQuestions: Math.min(config.numberOfQuestions, maxQ || 100)
    });
  };

  const selectedTopicData = topics.find(t => t.topic === config.topic);
  const maxQuestions = selectedTopicData?.totalQuestions || 0;

  return (
    <div className="card">
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>📚 Quiz App</h1>
      
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '10px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Select Topic
        </label>
        <select
          value={config.topic}
          onChange={handleTopicChange}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid #e5e7eb',
            fontSize: '16px'
          }}
        >
          <option value="">Choose a topic...</option>
          {topics && topics.length > 0 ? (
            topics.map((topic) => (
              <option key={topic.topic} value={topic.topic}>
                {topic.topic} ({topic.totalQuestions} questions)
              </option>
            ))
          ) : (
            <option disabled>No topics available. Please upload a quiz via Admin Panel.</option>
          )}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Number of Questions (Max: {maxQuestions || 100})
        </label>
        <input
          type="number"
          min="1"
          max={maxQuestions || 100}
          value={config.numberOfQuestions}
          onChange={(e) => {
            let value = parseInt(e.target.value) || 1;
            value = Math.min(value, maxQuestions || 100);
            value = Math.max(value, 1);
            setConfig({ ...config, numberOfQuestions: value });
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid #e5e7eb',
            fontSize: '16px'
          }}
          disabled={!config.topic}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Time per Question (seconds)
        </label>
        <input
          type="number"
          min="10"
          max="120"
          value={config.timePerQuestion}
          onChange={(e) => setConfig({ ...config, timePerQuestion: parseInt(e.target.value) || 30 })}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid #e5e7eb',
            fontSize: '16px'
          }}
        />
      </div>

      <button
        onClick={handleStart}
        disabled={loading || !config.topic}
        className="btn btn-primary"
        style={{ 
          width: '100%',
          opacity: (!config.topic || loading) ? 0.6 : 1,
          cursor: (!config.topic || loading) ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Start Quiz 🚀'}
      </button>
      
      {topics && topics.length > 0 && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f3f4f6', borderRadius: '10px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
            📊 Available Topics: {topics.length} | Total Questions: {topics.reduce((sum, t) => sum + t.totalQuestions, 0)}
          </p>
        </div>
      )}
    </div>
  );
}

export default QuizSetup;