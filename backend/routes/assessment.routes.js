/**
 * routes/assessment.routes.js
 */
const express = require('express');
const router = express.Router();
const { 
  submitAssessment, 
  getMyHistory, 
  getStudentHistory,
  getAssessmentById 
} = require('../controllers/assessment.controller');

const { authMiddleware, adminOnly, studentOnly } = require('../middleware/auth.middleware');

// Protect all routes
router.use(authMiddleware);

// Student Routes
router.post('/', studentOnly, submitAssessment);        // Submit PHQ-9 
router.get('/my-history', studentOnly, getMyHistory);   // View own history

// Admin Routes
router.get('/student/:studentId', adminOnly, getStudentHistory); // View specific student history

// Shared Route (Admin or Owner logic handled in controller/middleware usually, 
// but for simplicity, we'll allow authenticated users to try fetching by ID)
router.get('/:id', getAssessmentById); 

module.exports = router;