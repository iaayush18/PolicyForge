/**
 * controllers/dashboard.controller.js
 * Campus Wellness Platform — Analytics
 */

const { PrismaClient } = require('@prisma/client');
const { getWellnessStatus } = require('../utils/wellnessCalculator');
const { getPendingCount } = require('../services/support.service');
const prisma = new PrismaClient();

// @desc    Get top-level wellness statistics
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      select: { currentWellnessScore: true },
    });

    const totalStudents = students.length;
    let excellentCount = 0, stableCount = 0, concernCount = 0,
        highStressCount = 0, criticalCount = 0;

    students.forEach(({ currentWellnessScore: s }) => {
      if (s <= 20) excellentCount++;
      else if (s <= 40) stableCount++;
      else if (s <= 60) concernCount++;
      else if (s <= 80) highStressCount++;
      else criticalCount++;
    });

    const pendingSupport = await getPendingCount();

    res.json({
      success: true,
      stats: {
        totalStudents,
        excellentCount,
        stableCount,
        concernCount,
        highStressCount,
        criticalCount,
        pendingSupport,
        criticalPercentage: totalStudents
          ? ((criticalCount / totalStudents) * 100).toFixed(1)
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get High Priority Students (wellness score > 60)
// @route   GET /api/dashboard/high-risk
const getHighRiskStudents = async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      where: { currentWellnessScore: { gt: 60 } },
      include: { user: { select: { email: true } } },
      orderBy: { currentWellnessScore: 'desc' },
      take: 10,
    });
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wellness stats by course
// @route   GET /api/dashboard/by-course
const getStatsByCourse = async (req, res, next) => {
  try {
    const data = await prisma.student.findMany({
      select: { course: true, currentWellnessScore: true },
    });

    const courseMap = data.reduce((acc, s) => {
      if (!acc[s.course]) {
        acc[s.course] = { course: s.course, count: 0, totalScore: 0, criticalCount: 0 };
      }
      acc[s.course].count++;
      acc[s.course].totalScore += s.currentWellnessScore || 0;
      if ((s.currentWellnessScore || 0) > 80) acc[s.course].criticalCount++;
      return acc;
    }, {});

    const stats = Object.values(courseMap).map((c) => ({
      course: c.course,
      count: c.count,
      avgWellnessScore: parseFloat((c.totalScore / c.count).toFixed(1)),
      criticalCount: c.criticalCount,
    }));

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get average score per wellness domain (for analytics charts)
// @route   GET /api/dashboard/domain-averages
const getDomainAverages = async (req, res, next) => {
  try {
    const assessments = await prisma.wellnessAssessment.findMany({
      select: {
        mentalScore: true,
        academicScore: true,
        hostelScore: true,
        placementScore: true,
        lifestyleScore: true,
      },
    });

    if (!assessments.length) {
      return res.json({
        success: true,
        data: { mental: 0, academic: 0, hostel: 0, placement: 0, lifestyle: 0 },
      });
    }

    const totals = assessments.reduce(
      (acc, a) => {
        acc.mental += a.mentalScore;
        acc.academic += a.academicScore;
        acc.hostel += a.hostelScore;
        acc.placement += a.placementScore;
        acc.lifestyle += a.lifestyleScore;
        return acc;
      },
      { mental: 0, academic: 0, hostel: 0, placement: 0, lifestyle: 0 }
    );

    const n = assessments.length;
    const data = {
      mental: parseFloat((totals.mental / n).toFixed(1)),
      academic: parseFloat((totals.academic / n).toFixed(1)),
      hostel: parseFloat((totals.hostel / n).toFixed(1)),
      placement: parseFloat((totals.placement / n).toFixed(1)),
      lifestyle: parseFloat((totals.lifestyle / n).toFixed(1)),
    };

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Recent Wellness Activity
// @route   GET /api/dashboard/recent-activity
const getRecentActivity = async (req, res, next) => {
  try {
    const recent = await prisma.wellnessAssessment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true, studentId: true } },
      },
    });
    res.json({ success: true, data: recent });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getHighRiskStudents,
  getStatsByCourse,
  getDomainAverages,
  getRecentActivity,
};