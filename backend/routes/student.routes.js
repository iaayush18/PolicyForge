/**
 * routes/student.routes.js
 * Student Management Routes
 */

const express = require('express');
const router = express.Router();
const { 
  createStudent, 
  getAllStudents, 
  getStudentById, 
  updateStudent, 
  deleteStudent,
  getMyProfile
} = require('../controllers/student.controller');

const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// Protect all routes
router.use(authMiddleware);

// --- Routes ---

// 1. Specific Routes (Must come BEFORE /:id)
router.get('/profile/me', getMyProfile); 

// 2. General Routes
router.route('/')
  .post(adminOnly, createStudent)   // Create (Admin only)
  .get(adminOnly, getAllStudents);  // List (Admin only)

// 3. ID-Specific Routes
router.route('/:id')
  .get(getStudentById)              // View (Admin or Owner)
  .patch(adminOnly, updateStudent)  // Update (Admin only)
  .delete(adminOnly, deleteStudent);// Delete (Admin only)

module.exports = router;