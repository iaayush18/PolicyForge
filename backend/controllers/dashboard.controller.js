/**
 * controllers/dashboard.controller.js
 * Logic for Dashboard Analytics - Migrated to Prisma
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get top-level statistics
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    // Optimization: Run all counts in parallel to reduce response time
    const [totalStudents, criticalCount, moderateCount, healthyCount] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { currentRiskScore: 3 } }),
      prisma.student.count({ where: { currentRiskScore: 2 } }),
      prisma.student.count({ 
        where: { 
          OR: [
            { currentRiskScore: { lte: 1 } }
          ] 
        } 
      })
    ]);

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
    const students = await prisma.student.findMany({
      where: { currentRiskScore: 3 },
      include: {
        user: { select: { email: true } }
      },
      orderBy: { lastAssessmentDate: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Risk Distribution and Stats by Course
// @route   GET /api/dashboard/by-course
const getStatsByCourse = async (req, res, next) => {
  try {
    const data = await prisma.student.findMany({
      select: { course: true, currentRiskScore: true }
    });

    // Process the data to get custom aggregations that Prisma's groupBy doesn't easily support
    const courseStatsMap = data.reduce((acc, s) => {
      if (!acc[s.course]) {
        acc[s.course] = {
          course: s.course,
          count: 0,
          totalRisk: 0,
          criticalCount: 0
        };
      }
      const score = s.currentRiskScore || 0;
      acc[s.course].count++;
      acc[s.course].totalRisk += score;
      if (score === 3) acc[s.course].criticalCount++;

      return acc;
    }, {});

    const stats = Object.values(courseStatsMap).map(c => ({
      course: c.course,
      count: c.count,
      avgRisk: (c.totalRisk / c.count).toFixed(2),
      criticalCount: c.criticalCount
    }));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Recent Activity (Latest Assessments)
// @route   GET /api/dashboard/recent-activity
const getRecentActivity = async (req, res, next) => {
  try {
    const recentAssessments = await prisma.assessment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { name: true, studentId: true }
        }
      }
    });

    res.json({
      success: true,
      data: recentAssessments
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