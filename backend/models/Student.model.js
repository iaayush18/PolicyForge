/**
 * models/Student.model.js
 * Student Profile Schema
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [15, 'Age must be at least 15'],
    max: [100, 'Age must be less than 100']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true
  },
  cgpa: {
    type: Number,
    required: [true, 'CGPA is required'],
    min: [0, 'CGPA cannot be negative'],
    max: [10, 'CGPA cannot exceed 10']
  },
  currentRiskScore: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0
  },
  lastAssessmentDate: {
    type: Date
  },
  totalAssessments: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
studentSchema.index({ studentId: 1 });
studentSchema.index({ currentRiskScore: 1 });
studentSchema.index({ course: 1 });

module.exports = mongoose.model('Student', studentSchema);
