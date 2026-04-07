/**
 * controllers/assessment.controller.js
 * Migrated to Prisma & Postgres via Assessment Service
 */

const assessmentService = require('../services/assessment.service');

// @desc    Submit a new PHQ-9 Assessment
// @route   POST /api/assessments
// @access  Private (Student)
const submitAssessment = async (req, res, next) => {
  try {
    const { phq9Answers, notes } = req.body;
    // req.user.id comes from your auth middleware
    const userId = req.user.id; 

    // The service handles: Finding student, calculating scores, 
    // and the Database Transaction to update student stats.
    const assessment = await assessmentService.submitAssessment(
      userId, 
      phq9Answers, 
      notes
    );

    res.status(201).json({
      success: true,
      message: 'Assessment submitted successfully',
      assessment: {
        id: assessment.id, // Prisma uses .id not ._id
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        rawScore: assessment.rawScore,
        createdAt: assessment.createdAt
      }
    });
  } catch (error) {
    // If service throws "Student profile not found", it lands here
    if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get my assessment history
// @route   GET /api/assessments/my-history
// @access  Private (Student)
const getMyHistory = async (req, res, next) => {
  try {
    const assessments = await assessmentService.getMyHistory(req.user.id);

    res.json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get assessment history for a specific student (Admin)
// @route   GET /api/assessments/student/:studentId
// @access  Private (Admin)
const getStudentHistory = async (req, res, next) => {
  try {
    // Note: studentId here is the Postgres UUID/ID of the student record
    const assessments = await assessmentService.getStudentHistory(req.params.studentId);

    res.json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assessment details
// @route   GET /api/assessments/:id
// @access  Private (Owner/Admin)
const getAssessmentById = async (req, res, next) => {
  try {
    // Inside getAssessmentById controller
   if (req.user.role !== 'ADMIN' && assessment.studentId !== req.user.id) {
      return res.status(403).json({ message: "You can only view your own assessments" });
    }
    const assessment = await assessmentService.getAssessmentById(req.params.id);
     
    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  submitAssessment,
  getMyHistory,
  getStudentHistory,
  getAssessmentById
};