const express = require('express');
const router = express.Router();
const {
  getStats,
  getHighRiskStudents,
  getStatsByCourse,
  getRecentActivity,
  getDomainAverages,
} = require('../controllers/dashboard.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/high-risk', getHighRiskStudents);
router.get('/by-course', getStatsByCourse);
router.get('/recent-activity', getRecentActivity);
router.get('/domain-averages', getDomainAverages);

module.exports = router;