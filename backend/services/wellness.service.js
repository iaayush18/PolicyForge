// services/wellness.service.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  calculateSectionScores,
  calculateFinalWellnessScore,
  getWellnessStatus,
} = require('../utils/wellnessCalculator');

/**
 * Submit a new Wellness Assessment
 */
const submitWellnessAssessment = async (userId, sectionAnswers, notes) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new Error('Student profile not found');

  // Calculate scores
  const sections = calculateSectionScores(sectionAnswers);
  const finalWellnessScore = calculateFinalWellnessScore(sections);
  const { label: wellnessStatus } = getWellnessStatus(finalWellnessScore);

  // Transaction: create assessment + update student
  const result = await prisma.$transaction(async (tx) => {
    const assessment = await tx.wellnessAssessment.create({
      data: {
        studentId: student.id,
        // Section scores
        mentalScore: sections.mental,
        academicScore: sections.academic,
        hostelScore: sections.hostel,
        placementScore: sections.placement,
        lifestyleScore: sections.lifestyle,
        finalWellnessScore,
        wellnessStatus,
        // Raw answers spread in
        ...sectionAnswers,
        notes: notes || null,
      },
    });

    await tx.student.update({
      where: { id: student.id },
      data: {
        currentWellnessScore: finalWellnessScore,
        lastAssessmentDate: assessment.createdAt,
        totalAssessments: { increment: 1 },
      },
    });

    return assessment;
  });

  return result;
};

/**
 * Get my wellness history (student)
 */
const getMyWellnessHistory = async (userId) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new Error('Student profile not found');

  return await prisma.wellnessAssessment.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get wellness history for a specific student (admin)
 */
const getStudentWellnessHistory = async (studentId) => {
  return await prisma.wellnessAssessment.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get a single wellness assessment by ID
 */
const getWellnessAssessmentById = async (id) => {
  const assessment = await prisma.wellnessAssessment.findUnique({
    where: { id },
    include: { student: { select: { name: true, studentId: true } } },
  });
  if (!assessment) throw new Error('Assessment not found');
  return assessment;
};

module.exports = {
  submitWellnessAssessment,
  getMyWellnessHistory,
  getStudentWellnessHistory,
  getWellnessAssessmentById,
};
