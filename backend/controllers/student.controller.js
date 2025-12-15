/**
 * controllers/student.controller.js
 */
const Student = require('../models/Student.model');
const User = require('../models/User.model');
const Assessment = require('../models/Assessment.model');

// @desc    Create new student (Admin only)
// @route   POST /api/students
const createStudent = async (req, res, next) => {
  try {
    const { email, password, studentId, name, age, gender, course, cgpa } = req.body;

    // 1. Check Duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Student ID already exists' });
    }

    // 2. Create User
    const user = await User.create({
      email,
      password: password || 'Welcome123',
      role: 'student',
      isActive: true
    });

    // 3. Create Student Profile
    const student = await Student.create({
      userId: user._id,
      studentId,
      name,
      age,
      gender,
      course,
      cgpa
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with Filters & Search
// @route   GET /api/students
const getAllStudents = async (req, res, next) => {
  try {
    const { riskScore, course, search } = req.query;

    // Build Query
    let query = {};

    if (riskScore !== undefined && riskScore !== 'all') {
      query.currentRiskScore = parseInt(riskScore);
    }

    if (course) {
      query.course = course;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .populate('userId', 'email')
      .sort({ currentRiskScore: -1, name: 1 }); // High risk first

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
    const student = await Student.findOne({ userId: req.user.userId })
      .populate('userId', 'email');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const latestAssessment = await Assessment.findOne({ studentId: student._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      student,
      latestAssessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'email lastLogin');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Security Check: Only Admin or the Student themselves can view this
    const isOwner = student.userId._id.toString() === req.user.userId;
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const latestAssessment = await Assessment.findOne({ studentId: student._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      student,
      latestAssessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student demographics
// @route   PATCH /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const { name, age, gender, course, cgpa } = req.body;
    
    // Using findByIdAndUpdate for cleaner code
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: { name, age, gender, course, cgpa } },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student & associated data
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 1. Delete associated User account
    await User.findByIdAndDelete(student.userId);

    // 2. Delete all Assessments
    await Assessment.deleteMany({ studentId: student._id });

    // 3. Delete Student Profile
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student and all associated data deleted successfully'
    });
  } catch (error) {
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