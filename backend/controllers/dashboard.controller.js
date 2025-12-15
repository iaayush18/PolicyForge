/**
 * controllers/dashboard.controller.js
 * Logic for Dashboard Analytics
 */
const Student = require('../models/Student.model');
const Assessment = require('../models/Assessment.model');

// @desc    Get top-level statistics
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    
    // Count critical students (Risk Score 3)
    const criticalCount = await Student.countDocuments({ currentRiskScore: 3 });
    
    // Count moderate students (Risk Score 2)
    const moderateCount = await Student.countDocuments({ currentRiskScore: 2 });
    
    // Count healthy/low (Risk 0-1)
    const healthyCount = await Student.countDocuments({ currentRiskScore: { $lte: 1 } });

    res.json({
      success: true,
      stats: {
        totalStudents,
        criticalCount,
        moderateCount,
        healthyCount,
        criticalPercentage: totalStudents ? ((criticalCount / totalStudents) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get High Risk Students List
// @route   GET /api/dashboard/high-risk
const getHighRiskStudents = async (req, res, next) => {
  try {
    // Find students with Risk Score 3 (Severe)
    const highRiskStudents = await Student.find({ currentRiskScore: 3 })
      .populate('userId', 'email')
      .sort({ lastAssessmentDate: -1 }) // Most recent first
      .limit(10);

    res.json({
      success: true,
      data: highRiskStudents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Risk Distribution by Course
// @route   GET /api/dashboard/by-course
const getStatsByCourse = async (req, res, next) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: '$course', // Group by Course Name
          count: { $sum: 1 },
          avgRisk: { $avg: '$currentRiskScore' },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$currentRiskScore', 3] }, 1, 0] }
          }
        }
      },
      { $sort: { avgRisk: -1 } } // Sort by highest risk
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Recent Activity
// @route   GET /api/dashboard/recent-assessments
const getRecentActivity = async (req, res, next) => {
  try {
    const recent = await Assessment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'studentId',
        select: 'name studentId currentRiskScore'
      });

    res.json({
      success: true,
      data: recent
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getHighRiskStudents,
  getStatsByCourse,
  getRecentActivity
};