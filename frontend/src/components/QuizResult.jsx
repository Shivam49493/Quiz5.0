import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetQuiz } from '../redux/quizSlice';

function QuizResult() {
  const dispatch = useDispatch();
  const { score, quizConfig, currentQuiz, userAnswers } = useSelector((state) => state.quiz);
  
  const percentage = (score / quizConfig.numberOfQuestions) * 100;
  
  const getGrade = () => {
    if (percentage >= 90) return 'A+ 🎉';
    if (percentage >= 80) return 'A 📚';
    if (percentage >= 70) return 'B 👍';
    if (percentage >= 60) return 'C 📖';
    if (percentage >= 50) return 'D 🤔';
    return 'F 😢';
  };

  const handleRestart = () => {
    dispatch(resetQuiz());
  };

  return (
    <div className="card">
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Quiz Results 📊</h1>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          {score} / {quizConfig.numberOfQuestions}
        </div>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
          {percentage.toFixed(1)}%
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
          Grade: {getGrade()}
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Topic: {currentQuiz?.topic}</h3>
        <p>Time per question: {quizConfig.timePerQuestion}s</p>
      </div>
      
      <button
        onClick={handleRestart}
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        Take Another Quiz 🔄
      </button>
    </div>
  );
}

export default QuizResult;