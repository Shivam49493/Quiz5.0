import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  topics: [],
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  quizConfig: {
    numberOfQuestions: 10,
    timePerQuestion: 30,
    topic: ''
  },
  quizStarted: false,
  quizCompleted: false,
  score: 0,
  timeRemaining: 0,
  timerInterval: null
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setTopics: (state, action) => {
      state.topics = action.payload;
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
    },
    setQuizConfig: (state, action) => {
      state.quizConfig = { ...state.quizConfig, ...action.payload };
    },
    startQuiz: (state) => {
      state.quizStarted = true;
      state.currentQuestionIndex = 0;
      state.userAnswers = [];
      state.score = 0;
      state.timeRemaining = state.quizConfig.timePerQuestion;
    },
    answerQuestion: (state, action) => {
      const { questionIndex, answer, isCorrect } = action.payload;
      state.userAnswers[questionIndex] = { answer, isCorrect };
      if (isCorrect) state.score++;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.quizConfig.numberOfQuestions - 1) {
        state.currentQuestionIndex++;
        state.timeRemaining = state.quizConfig.timePerQuestion;
      } else {
        state.quizCompleted = true;
        state.quizStarted = false;
        if (state.timerInterval) clearInterval(state.timerInterval);
      }
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    setTimerInterval: (state, action) => {
      state.timerInterval = action.payload;
    },
    resetQuiz: (state) => {
      state.quizStarted = false;
      state.quizCompleted = false;
      state.currentQuestionIndex = 0;
      state.userAnswers = [];
      state.score = 0;
      if (state.timerInterval) clearInterval(state.timerInterval);
      state.timerInterval = null;
    },
    updateScore: (state) => {
      state.score = state.userAnswers.filter(a => a?.isCorrect).length;
    }
  }
});

export const {
  setTopics,
  setCurrentQuiz,
  setQuizConfig,
  startQuiz,
  answerQuestion,
  nextQuestion,
  setTimeRemaining,
  setTimerInterval,
  resetQuiz,
  updateScore
} = quizSlice.actions;

export default quizSlice.reducer;