/**
 * server.js
 * Express Server (PostgreSQL + Prisma)
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { execSync } = require('child_process');
const prisma = require('./utils/prisma');
console.log("DB URL:", process.env.DATABASE_URL);

// Auto-resolve stuck migrations on startup
try {
  console.log('Resolving any stuck migrations...');
  execSync('npx prisma migrate resolve --rolled-back 0_init 2>/dev/null || true', { stdio: 'inherit' });
  console.log('Deploying migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✓ Migrations resolved and deployed');
} catch (err) {
  console.warn('Migration resolution skipped or already resolved');
}

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
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
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

// IMPORTANT:
// Do NOT start server during tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
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