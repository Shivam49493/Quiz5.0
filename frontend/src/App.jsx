import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QuizSetup from './components/QuizSetup';
import QuizQuestion from './components/QuizQuestion';
import QuizResult from './components/QuizResult';
import AdminPanel from './components/AdminPanel';
import { setTopics } from './redux/quizSlice';
import axios from 'axios';

function App() {
  const dispatch = useDispatch();
  const { quizStarted, quizCompleted } = useSelector((state) => state.quiz);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/quizzes/topics');
      console.log('Fetched topics:', response.data);
      dispatch(setTopics(response.data));
      setError('');
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to connect to server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      )}
      
      {error && !loading && (
        <div className="card">
          <h2 style={{ color: '#991b1b', marginBottom: '20px' }}>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button 
            onClick={fetchTopics}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            Retry Connection
          </button>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {!showAdmin ? (
            <>
              {!quizStarted && !quizCompleted && <QuizSetup />}
              {quizStarted && !quizCompleted && <QuizQuestion />}
              {quizCompleted && <QuizResult />}
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px',
                  padding: '10px 20px',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  zIndex: 1000
                }}
              >
                {showAdmin ? 'Student Mode' : 'Admin Mode'}
              </button>
            </>
          ) : (
            <AdminPanel onBack={() => {
              setShowAdmin(false);
              fetchTopics(); // Refresh topics after upload
            }} />
          )}
        </>
      )}
    </div>
  );
}

export default App;