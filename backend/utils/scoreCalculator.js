// utils/scoreCalculator.js

/**
 * Calculate PHQ-9 scores and risk classification
 * @param {Object} answers
 */
function calculateScore(answers) {
  const {
    q1_interest,
    q2_depressed,
    q3_sleep,
    q4_energy,
    q5_appetite,
    q6_failure,
    q7_concentration,
    q8_movement,
    q9_suicidal
  } = answers;

  const rawScore =
    q1_interest +
    q2_depressed +
    q3_sleep +
    q4_energy +
    q5_appetite +
    q6_failure +
    q7_concentration +
    q8_movement +
    q9_suicidal;

  let riskScore, riskLevel, isCritical;

  if (rawScore <= 4) {
    riskScore = 0;
    riskLevel = 'Minimal Depression';
    isCritical = false;
  } else if (rawScore <= 9) {
    riskScore = 1;
    riskLevel = 'Mild Depression';
    isCritical = false;
  } else if (rawScore <= 14) {
    riskScore = 2;
    riskLevel = 'Moderate Depression';
    isCritical = false;
  } else {
    riskScore = 3;
    riskLevel = 'Moderately Severe/Severe';
    isCritical = true;
  }

  return {
    rawScore,
    riskScore,
    riskLevel,
    isCritical
  };
}

module.exports = { calculateScore };