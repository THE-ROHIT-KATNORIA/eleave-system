import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import leavesRoutes from './routes/leaves.js';
import usersRoutes from './routes/users.js';
import calendarRoutes from './routes/calendar.js';
import feedbackRoutes from './routes/feedback.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration - allow frontend origin
const allowedOrigins = [
  'http://localhost:5173', // Development
  'https://eleave.vercel.app', // Production Vercel
  process.env.FRONTEND_URL, // Production (set this in your hosting platform)
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    console.log('CORS request from origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked for:', origin);
      console.log('Allowed origins are:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// JSON body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Keep-alive endpoint for preventing cold starts
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount leave management routes
app.use('/api/leaves', leavesRoutes);

// Mount user management routes
app.use('/api/users', usersRoutes);

// Mount calendar routes
app.use('/api/calendar', calendarRoutes);

// Mount feedback routes
app.use('/api/feedback', feedbackRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start keep-alive in production to prevent cold starts
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    import('./utils/keepAlive.js').then(({ startKeepAlive }) => {
      startKeepAlive(process.env.RENDER_EXTERNAL_URL);
    });
  }
});

export default app;
