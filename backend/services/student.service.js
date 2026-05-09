// services/student.service.js

const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

/**
 * Create Student (Admin)
 */
const createStudent = async (data) => {
  const { email, password, studentId, name, age, gender, course, cgpa } = data;

  // Check duplicates
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User already exists');

  const existingStudent = await prisma.student.findUnique({ where: { studentId } });
  if (existingStudent) throw new Error('Student ID exists');

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: await bcrypt.hash(password || 'Welcome123', 10),
        role: 'STUDENT'
      }
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        studentId,
        name,
        age,
        gender,
        course,
        cgpa
      }
    });

    return student;
  });
};

/**
 * Get All Students (Filters + Search)
 */
const getAllStudents = async ({ riskScore, course, search }) => {
  return await prisma.student.findMany({
    where: {
      ...(riskScore && riskScore !== 'all' && {
        currentRiskScore: parseInt(riskScore)
      }),
      ...(course && { course }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      user: { select: { email: true } }
    },
    orderBy: [
      { currentRiskScore: 'desc' },
      { name: 'asc' }
    ]
  });
};

/**
 * Get My Profile
 */
const getMyProfile = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: { select: { email: true } }
    }
  });

  if (!student) throw new Error('Profile not found');

  const latestAssessment = await prisma.assessment.findFirst({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' }
  });

  return { student, latestAssessment };
};

/**
 * Get Student by ID
 */
const getStudentById = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, lastLogin: true } }
    }
  });

  if (!student) throw new Error('Student not found');

  const latestAssessment = await prisma.assessment.findFirst({
    where: { studentId: id },
    orderBy: { createdAt: 'desc' }
  });

  return { student, latestAssessment };
};

/**
 * Update Student
 */
const updateStudent = async (id, data) => {
  return await prisma.student.update({
    where: { id },
    data
  });
};

/**
 * Delete Student
 */
const deleteStudent = async (id) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new Error('Student not found');

  return await prisma.$transaction([
    prisma.assessment.deleteMany({ where: { studentId: id } }),
    prisma.student.delete({ where: { id } }),
    prisma.user.delete({ where: { id: student.userId } })
  ]);
};

module.exports = {
  createStudent,
  getAllStudents,
  getMyProfile,
  getStudentById,
  updateStudent,
  deleteStudent
};