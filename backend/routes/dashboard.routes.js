const express = require('express');
const router = express.Router();
const { getStats, getHighRiskStudents, getStatsByCourse, getRecentActivity } = require('../controllers/dashboard.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// Protect entire route group
router.use(authMiddleware);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/high-risk', getHighRiskStudents);
router.get('/by-course', getStatsByCourse);
router.get('/recent-activity', getRecentActivity);

// Handlers for front-end analytics dashboard
router.get('/trends', (req, res) => res.json({ success: true, data: [] }));
router.get('/gender-stats', (req, res) => res.json({ success: true, data: [] }));
router.get('/cgpa-correlation', (req, res) => res.json({ success: true, data: [] }));

module.exports = router;