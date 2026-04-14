import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quizRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
// Define the exact origin of your frontend
const allowedOrigins = ['https://quiz5-0-1.onrender.com'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // Set this to true if your API uses cookies or authorization headers
}));

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection - CORRECT SYNTAX
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'quizapp';

// Option 1: If you have MongoDB installed locally
mongoose.connect(`mongodb://localhost:27017/quizapp`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully to quizapp database');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Make sure MongoDB is installed on your system');
  console.log('2. Start MongoDB service:');
  console.log('   - Windows: net start MongoDB');
  console.log('   - Mac: brew services start mongodb-community');
  console.log('   - Linux: sudo systemctl start mongod');
  console.log('3. Or use MongoDB Atlas cloud database');
  process.exit(1);
});

// Routes
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - GET  /api/quizzes/topics`);
  console.log(`   - GET  /api/quizzes/topic/:topic`);
  console.log(`   - POST /api/admin/upload`);
  console.log(`   - GET  /api/health`);
});
