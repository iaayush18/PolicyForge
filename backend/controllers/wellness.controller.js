// controllers/wellness.controller.js

const wellnessService = require('../services/wellness.service');

// @desc    Submit a new Wellness Assessment
// @route   POST /api/wellness
// @access  Private (Student)
const submitAssessment = async (req, res, next) => {
  try {
    const { sectionAnswers, notes } = req.body;
    const userId = req.user.id;

    const assessment = await wellnessService.submitWellnessAssessment(
      userId,
      sectionAnswers,
      notes
    );

    res.status(201).json({
      success: true,
      message: 'Wellness assessment submitted successfully',
      assessment: {
        id: assessment.id,
        finalWellnessScore: assessment.finalWellnessScore,
        wellnessStatus: assessment.wellnessStatus,
        mentalScore: assessment.mentalScore,
        academicScore: assessment.academicScore,
        hostelScore: assessment.hostelScore,
        placementScore: assessment.placementScore,
        lifestyleScore: assessment.lifestyleScore,
        createdAt: assessment.createdAt,
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get my wellness assessment history
// @route   GET /api/wellness/my-history
// @access  Private (Student)
const getMyHistory = async (req, res, next) => {
  try {
    const assessments = await wellnessService.getMyWellnessHistory(req.user.id);
    res.json({ success: true, count: assessments.length, assessments });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get wellness history for a specific student (Admin)
// @route   GET /api/wellness/student/:studentId
// @access  Private (Admin)
const getStudentHistory = async (req, res, next) => {
  try {
    const assessments = await wellnessService.getStudentWellnessHistory(
      req.params.studentId
    );
    res.json({ success: true, count: assessments.length, assessments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single wellness assessment
// @route   GET /api/wellness/:id
// @access  Private (Owner / Admin)
const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await wellnessService.getWellnessAssessmentById(
      req.params.id
    );
    if (
      req.user.role !== 'ADMIN' &&
      assessment.student?.studentId !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: 'You can only view your own assessments' });
    }
    res.json({ success: true, assessment });
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
  getAssessmentById,
};
