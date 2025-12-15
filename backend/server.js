/**
 * server.js
 * Main Express.js Server
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const assessmentRoutes = require('./routes/assessment.routes'); 
const dashboardRoutes = require('./routes/dashboard.routes');   

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Connect to Database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Student Mental Health Monitoring API v1.0' });
});

// 404 handler (Must be before error handler)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

module.exports = app;