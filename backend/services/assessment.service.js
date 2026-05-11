// services/assessment.service.js

const prisma = require('../utils/prisma');
const { calculateScore } = require('../utils/scoreCalculator');

/**
 * Submit Assessment
 */
const submitAssessment = async (userId, phq9Answers, notes) => {
  // 1. Find student
  const student = await prisma.student.findUnique({
    where: { userId }
  });

  if (!student) {
    throw new Error('Student profile not found');
  }

  // 2. Calculate score
  const score = calculateScore(phq9Answers);

  // 3. Transaction (critical)
  const result = await prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.create({
      data: {
        studentId: student.id,
        ...phq9Answers,
        ...score,
        notes
      }
    });

    await tx.student.update({
      where: { id: student.id },
      data: {
        currentWellnessScore: score.riskScore,
        lastAssessmentDate: assessment.createdAt,
        totalAssessments: { increment: 1 }
      }
    });

    return assessment;
  });

  return result;
};

/**
 * Get My Assessment History
 */
const getMyHistory = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId }
  });

  if (!student) {
    throw new Error('Student profile not found');
  }

  return await prisma.assessment.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Get Student History (Admin)
 */
const getStudentHistory = async (studentId) => {
  return await prisma.assessment.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Get Single Assessment
 */
const getAssessmentById = async (id) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          name: true,
          studentId: true
        }
      }
    }
  });

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  return assessment;
};

module.exports = {
  submitAssessment,
  getMyHistory,
  getStudentHistory,
  getAssessmentById
};