const express = require('express');
const router = express.Router();
const {
  submitAssessment,
  getMyHistory,
  getStudentHistory,
  getAssessmentById,
} = require('../controllers/wellness.controller');
const {
  authMiddleware,
  adminOnly,
  studentOnly,
} = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', studentOnly, submitAssessment);
router.get('/my-history', studentOnly, getMyHistory);
router.get('/student/:studentId', adminOnly, getStudentHistory);
router.get('/:id', getAssessmentById);

module.exports = router;
