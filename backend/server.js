/**
 * server.js
 * Express Server (PostgreSQL + Prisma)
 */
require('dotenv').config();
const compression = require('compression');
const apicache = require('apicache');
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const prisma = require('./utils/prisma');
console.log("DB URL:", process.env.DATABASE_URL);

// Import routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const wellnessRoutes = require('./routes/wellness.routes');
const supportRoutes = require('./routes/support.routes');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Init app
const app = express();
// Enable gzip/brotli compression
app.use(compression());
// Enable HTTP keep-alive
app.use((req, res, next) => { res.setHeader('Connection', 'keep-alive'); next(); });

// =========================
// MIDDLEWARE
// =========================
app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// =========================
// ROUTES
// =========================
const cacheMiddleware = process.env.NODE_ENV === 'test' 
  ? (req, res, next) => next() 
  : apicache.middleware('30 seconds');

app.use('/api/auth', authRoutes);
app.use('/api/students', cacheMiddleware, studentRoutes);
app.use('/api/assessments', cacheMiddleware, assessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/support', supportRoutes);

// =========================
// HEALTH CHECK
// =========================
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'healthy',
      db: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      db: 'disconnected',
      error: error.message
    });
  }
});

// =========================
// ROOT
// =========================
app.get('/', (req, res) => {
  res.json({
    message: 'Campus Wellness Intelligence API (PostgreSQL + Prisma)',
    version: '3.0'
  });
});

// =========================
// 404 HANDLER
// =========================
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// =========================
// ERROR HANDLER
// =========================
app.use(errorHandler);

// =========================
// SERVER START
// =========================
// =========================
// SERVER START
// =========================
const PORT = process.env.PORT || 5000;

const WORKER_COUNT = Math.max(1, Math.floor(os.cpus().length * 0.8)); // 80% of cores, minimum 1

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to DB:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  if (cluster.isMaster) {
    console.log(`🧩 Master process ${process.pid} is forking ${WORKER_COUNT} worker(s)`);
    for (let i = 0; i < WORKER_COUNT; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    startServer();
  }
}

// =========================
// GRACEFUL SHUTDOWN
// =========================
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// UNHANDLED ERRORS
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

module.exports = {
  app,
  prisma
};