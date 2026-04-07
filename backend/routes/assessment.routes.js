const express = require('express');
const router = express.Router();
const { submitAssessment, getMyHistory, getStudentHistory, getAssessmentById } = require('../controllers/assessment.controller');
const { authMiddleware, adminOnly, studentOnly } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Strict routing cascade: Literal endpoints first
router.post('/', studentOnly, submitAssessment);
router.get('/my-history', studentOnly, getMyHistory);

router.get('/student/:studentId', adminOnly, getStudentHistory);

// Parameterized endpoint last to prevent shadowing
router.get('/:id', getAssessmentById); 

module.exports = router;