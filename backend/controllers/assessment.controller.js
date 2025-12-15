/**
 * controllers/assessment.controller.js
 */
const Assessment = require('../models/Assessment.model');
const Student = require('../models/Student.model');

// @desc    Submit a new PHQ-9 Assessment
// @route   POST /api/assessments
// @access  Private (Student)
const submitAssessment = async (req, res, next) => {
  try {
    const { phq9Answers, notes } = req.body;

    // 1. Find the Student Profile associated with the logged-in User
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // 2. Create the Assessment
    // (The pre('validate') hook in the Model will automatically calculate scores)
    const assessment = await Assessment.create({
      studentId: student._id,
      phq9Answers,
      notes
    });

    // 3. Update the Student Profile with new Stats
    student.currentRiskScore = assessment.riskScore;
    student.lastAssessmentDate = assessment.createdAt;
    student.totalAssessments = (student.totalAssessments || 0) + 1;
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Assessment submitted successfully',
      assessment: {
        id: assessment._id,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        rawScore: assessment.rawScore,
        createdAt: assessment.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get my assessment history
// @route   GET /api/assessments/my-history
// @access  Private (Student)
const getMyHistory = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const assessments = await Assessment.find({ studentId: student._id })
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment history for a specific student (Admin)
// @route   GET /api/assessments/student/:studentId
// @access  Private (Admin)
const getStudentHistory = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 });

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
    const assessment = await Assessment.findById(req.params.id)
      .populate('studentId', 'name studentId');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAssessment,
  getMyHistory,
  getStudentHistory,
  getAssessmentById
};