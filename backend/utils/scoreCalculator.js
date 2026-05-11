// utils/scoreCalculator.js
// PHQ-9 Depression Screening Score Calculator

/**
 * Calculate PHQ-9 Score
 * PHQ9 questions are scored 0-3 (Not at all to Nearly every day)
 * Max score: 27
 * 
 * Scoring:
 * 1-4: Minimal depression
 * 5-9: Mild depression
 * 10-14: Moderate depression
 * 15-19: Moderately severe depression
 * 20-27: Severe depression
 */
const calculateScore = (phq9Answers) => {
  if (!phq9Answers || typeof phq9Answers !== 'object') {
    throw new Error('Invalid PHQ9 answers format');
  }

  const questions = [
    'q1_interest',
    'q2_depressed',
    'q3_sleep',
    'q4_energy',
    'q5_appetite',
    'q6_failure',
    'q7_concentration',
    'q8_movement',
    'q9_suicidal',
  ];

  // Calculate raw score (sum of all answers)
  let rawScore = 0;
  for (const q of questions) {
    const value = phq9Answers[q];
    if (typeof value !== 'number' || value < 0 || value > 3) {
      throw new Error(`Invalid answer for ${q}. Must be 0-3.`);
    }
    rawScore += value;
  }

  // Determine risk level (0-3 scale for database storage)
  let riskScore;
  let riskLevel;

  if (rawScore <= 4) {
    riskScore = 0;
    riskLevel = 'Minimal Depression';
  } else if (rawScore <= 9) {
    riskScore = 1;
    riskLevel = 'Mild Depression';
  } else if (rawScore <= 14) {
    riskScore = 2;
    riskLevel = 'Moderate Depression';
  } else {
    riskScore = 3;
    riskLevel = 'Severe Depression';
  }

  return {
    rawScore,
    riskScore,
    riskLevel,
  };
};

module.exports = { calculateScore };
