/**
 * models/Assessment.model.js
 * PHQ-9 Assessment Schema
 */

const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  phq9Answers: {
    q1_interest: { type: Number, required: true, min: 0, max: 3 },
    q2_depressed: { type: Number, required: true, min: 0, max: 3 },
    q3_sleep: { type: Number, required: true, min: 0, max: 3 },
    q4_energy: { type: Number, required: true, min: 0, max: 3 },
    q5_appetite: { type: Number, required: true, min: 0, max: 3 },
    q6_failure: { type: Number, required: true, min: 0, max: 3 },
    q7_concentration: { type: Number, required: true, min: 0, max: 3 },
    q8_movement: { type: Number, required: true, min: 0, max: 3 },
    q9_suicidal: { type: Number, required: true, min: 0, max: 3 }
  },
  rawScore: {
    type: Number,
    required: true,
    min: 0,
    max: 27
  },
  riskScore: {
    type: Number,
    required: true,
    enum: [0, 1, 2, 3]
  },
  riskLevel: {
    type: String,
    enum: ['Minimal Depression', 'Mild Depression', 'Moderate Depression', 'Moderately Severe/Severe'],
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  isCritical: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate scores BEFORE validation
assessmentSchema.pre('validate', function(next) { 
  
  // Safety check: ensure phq9Answers exists
  if (!this.phq9Answers) return next();

  // Calculate raw score safely
  const answers = this.phq9Answers;
  
  if (answers.toObject) {
      // If it's a mongoose document, convert to plain object first
      this.rawScore = Object.values(answers.toObject()).reduce((sum, val) => {
          return typeof val === 'number' ? sum + val : sum;
      }, 0);
  } else {
      // If it's already a plain object
      this.rawScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  }

  // Calculate risk score (0-3)
  if (this.rawScore <= 4) {
    this.riskScore = 0;
    this.riskLevel = 'Minimal Depression';
    this.isCritical = false;
  } else if (this.rawScore <= 9) {
    this.riskScore = 1;
    this.riskLevel = 'Mild Depression';
    this.isCritical = false;
  } else if (this.rawScore <= 14) {
    this.riskScore = 2;
    this.riskLevel = 'Moderate Depression';
    this.isCritical = false;
  } else {
    this.riskScore = 3;
    this.riskLevel = 'Moderately Severe/Severe';
    this.isCritical = true;
  }
  
  next();
});

// Index for faster queries
assessmentSchema.index({ studentId: 1, createdAt: -1 });
assessmentSchema.index({ riskScore: 1 });
assessmentSchema.index({ isCritical: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);