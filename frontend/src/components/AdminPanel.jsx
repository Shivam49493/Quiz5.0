import React, { useState } from 'react';
import axios from 'axios';

function AdminPanel({ onBack }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/json') {
      setMessage('Please select a JSON file');
      setMessageType('error');
      return;
    }
    setFile(selectedFile);
    setMessage('');
    setUploadResults(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      setMessageType('error');
      return;
    }

    const formData = new FormData();
    formData.append('quizFile', file);

    setUploading(true);
    setMessage('');
    setUploadResults(null);
    
    try {
      const response = await axios.post('https://quiz5-0.onrender.com/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage(`✅ ${response.data.message}`);
      setMessageType('success');
      setUploadResults(response.data.results);
      setFile(null);
      document.getElementById('fileInput').value = '';
      
      // Refresh topics after upload
      setTimeout(() => {
        onBack();
      }, 3000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const sampleJSON = {
    "topic": "JavaScript Basics",
    "questions": [
      {
        "question": "What is JavaScript?",
        "options": ["Programming Language", "Database", "Framework", "Browser"],
        "answer": "Programming Language"
      }
    ]
  };

  const multiTopicExample = [
    {
      "topic": "Topic 1",
      "questions": [
        {
          "question": "Question 1?",
          "options": ["Option1", "Option2", "Option3", "Option4"],
          "answer": "Option1"
        }
      ]
    },
    {
      "topic": "Topic 2",
      "questions": [
        {
          "question": "Question 1?",
          "options": ["Option1", "Option2", "Option3", "Option4"],
          "answer": "Option1"
        }
      ]
    }
  ];

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>📤 Admin Panel - Upload Quiz</h2>
      
      <div style={{ marginBottom: '20px', background: '#f0f9ff', padding: '15px', borderRadius: '10px' }}>
        <h3 style={{ marginBottom: '10px' }}>📋 JSON Format Required:</h3>
        <p style={{ marginBottom: '10px' }}>You can upload:</p>
        <ul style={{ marginBottom: '15px', marginLeft: '20px' }}>
          <li><strong>Single Topic</strong> - Object with "topic" and "questions"</li>
          <li><strong>Multiple Topics</strong> - Array of topic objects</li>
        </ul>
        
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            View Single Topic Example
          </summary>
          <pre style={{
            background: '#1f2937',
            color: '#10b981',
            padding: '15px',
            borderRadius: '10px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(sampleJSON, null, 2)}
          </pre>
        </details>
        
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            View Multiple Topics Example
          </summary>
          <pre style={{
            background: '#1f2937',
            color: '#10b981',
            padding: '15px',
            borderRadius: '10px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(multiTopicExample, null, 2)}
          </pre>
        </details>
        
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
          ✅ Each question must have exactly 4 options<br/>
          ✅ Answer must match one of the options exactly<br/>
          ✅ Supports both Hindi and English text
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Select JSON File:
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ 
            marginBottom: '10px',
            padding: '10px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            width: '100%'
          }}
        />
        {file && (
          <p style={{ fontSize: '14px', color: '#10b981' }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>
      
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="btn btn-primary"
        style={{ 
          width: '100%', 
          marginBottom: '10px',
          opacity: (uploading || !file) ? 0.6 : 1,
          cursor: (uploading || !file) ? 'not-allowed' : 'pointer'
        }}
      >
        {uploading ? '📤 Uploading...' : '📁 Upload JSON File'}
      </button>
      
      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '10px',
          background: messageType === 'success' ? '#d1fae5' : '#fee2e2',
          color: messageType === 'success' ? '#065f46' : '#991b1b',
          marginTop: '10px',
          marginBottom: '10px'
        }}>
          {message}
        </div>
      )}
      
      {uploadResults && uploadResults.length > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          background: '#f3f4f6',
          borderRadius: '10px'
        }}>
          <h4 style={{ marginBottom: '10px' }}>Upload Results:</h4>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Topic</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Questions</th>
                </tr>
              </thead>
              <tbody>
                {uploadResults.map((result, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '5px' }}>{result.topic}</td>
                    <td style={{ padding: '5px' }}>
                      <span style={{
                        color: result.status === 'new' ? '#10b981' : result.status === 'updated' ? '#f59e0b' : '#ef4444'
                      }}>
                        {result.status === 'new' ? '✅ New' : result.status === 'updated' ? '🔄 Updated' : '❌ Failed'}
                      </span>
                    </td>
                    <td style={{ padding: '5px' }}>{result.questions || result.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <button
        onClick={onBack}
        className="btn btn-secondary"
        style={{ width: '100%', marginTop: '10px' }}
      >
        ← Back to Student Mode
      </button>
    </div>
  );
}

export default AdminPanel;
