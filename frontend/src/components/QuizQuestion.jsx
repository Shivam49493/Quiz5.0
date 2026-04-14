import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { answerQuestion, nextQuestion, setTimeRemaining } from '../redux/quizSlice';

function QuizQuestion() {
  const dispatch = useDispatch();
  const {
    currentQuiz,
    currentQuestionIndex,
    userAnswers,
    quizConfig,
    timeRemaining
  } = useSelector((state) => state.quiz);

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex]?.answer;

  useEffect(() => {
    if (timeRemaining === 0 && !selectedAnswer) {
      handleAnswer('');
    }
  }, [timeRemaining]);

  const handleAnswer = (answer) => {
    const isCorrect = answer === currentQuestion.answer;
    dispatch(answerQuestion({
      questionIndex: currentQuestionIndex,
      answer,
      isCorrect
    }));
    
    setTimeout(() => {
      dispatch(nextQuestion());
    }, 500);
  };

  const progress = ((currentQuestionIndex + 1) / quizConfig.numberOfQuestions) * 100;

  return (
    <div className="card">
      <div className="timer">
        ⏱️ Time Remaining: {timeRemaining}s
      </div>
      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div style={{ marginBottom: '20px', color: '#6b7280' }}>
        Question {currentQuestionIndex + 1} of {quizConfig.numberOfQuestions}
      </div>
      
      <h2 style={{ marginBottom: '30px', fontSize: '1.5rem' }}>
        {currentQuestion?.question}
      </h2>
      
      <div>
        {currentQuestion?.options.map((option, idx) => (
          <div
            key={idx}
            className={`quiz-option ${selectedAnswer === option ? 'selected' : ''}`}
            onClick={() => !selectedAnswer && handleAnswer(option)}
            style={{
              cursor: selectedAnswer ? 'not-allowed' : 'pointer',
              opacity: selectedAnswer ? 0.7 : 1
            }}
          >
            {String.fromCharCode(65 + idx)}. {option}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizQuestion;