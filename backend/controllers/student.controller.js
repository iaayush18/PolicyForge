/**
 * controllers/student.controller.js
 * Migrated to Prisma & Postgres via Student Service
 */

const studentService = require('../services/student.service');

// @desc    Create new student (Admin only)
// @route   POST /api/students
const createStudent = async (req, res, next) => {
  try {
    // The service handles duplicate checks and the DB transaction
    const student = await studentService.createStudent(req.body);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    if (error.message.includes('exists')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get all students with Filters & Search
// @route   GET /api/students
const getAllStudents = async (req, res, next) => {
  try {
    const { riskScore, course, search } = req.query;

    const students = await studentService.getAllStudents({
      riskScore,
      course,
      search
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's own profile
// @route   GET /api/students/profile/me
const getMyProfile = async (req, res, next) => {
  try {
    // Ensure req.user.id matches the ID from your Auth middleware
    const { student, latestAssessment } = await studentService.getMyProfile(req.user.id);

    res.status(200).json({
      success: true,
      student,
      latestAssessment
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get student by ID (Admin or Self)
// @route   GET /api/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const { student, latestAssessment } = await studentService.getStudentById(req.params.id);

    // SECURITY CHECK: Admin or the owner only
    // In Prisma, student.userId is a simple string (the foreign key)
    const isOwner = student.userId === req.user.id;
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      student,
      latestAssessment
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Update student demographics
// @route   PATCH /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    // Note: You should filter req.body here or in the service to 
    // prevent users from updating sensitive fields like riskScore manually
    const { name, age, gender, course, cgpa } = req.body;
    
    const student = await studentService.updateStudent(req.params.id, {
      name, age, gender, course, cgpa
    });

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Delete student & associated data
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    // The service handles deleting Assessments -> Student -> User in a transaction
    await studentService.deleteStudent(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student and all associated data deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getMyProfile,
  getStudentById,
  updateStudent,
  deleteStudent
};