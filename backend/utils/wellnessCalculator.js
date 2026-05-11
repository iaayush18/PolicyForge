// utils/wellnessCalculator.js
// Note: Higher score = MORE stress/concern (0=excellent, 100=critical)

/**
 * Normalise a 0-3 scale section (5 questions) to 0-100
 * Max raw = 5 questions × 3 = 15
 */
function normalise03(answers) {
  const raw = Object.values(answers).reduce((s, v) => s + (v || 0), 0);
  return Math.round((raw / 15) * 100);
}

/**
 * Normalise a 1-5 Likert section (5 questions) to 0-100
 * Likert: 5=Excellent → we invert so 5=low stress, 1=high stress
 * Min raw = 5 (all 1s = worst), Max raw = 25 (all 5s = best)
 * Stress score = ((maxRaw - raw) / (maxRaw - minRaw)) * 100
 */
function normaliseLikert(answers) {
  const raw = Object.values(answers).reduce((s, v) => s + (v || 1), 0);
  const minRaw = 5;
  const maxRaw = 25;
  return Math.round(((maxRaw - raw) / (maxRaw - minRaw)) * 100);
}

/**
 * Calculate all 5 section scores (0-100) from raw answers
 */
function calculateSectionScores(answers) {
  const mental = normalise03({
    m1: answers.m1_exhaustion,
    m2: answers.m2_sleep,
    m3: answers.m3_motivation,
    m4: answers.m4_concentration,
    m5: answers.m5_isolation,
  });

  const academic = normalise03({
    a1: answers.a1_assignment,
    a2: answers.a2_exam,
    a3: answers.a3_backlog,
    a4: answers.a4_time_mgmt,
    a5: answers.a5_attendance,
  });

  const hostel = normaliseLikert({
    h1: answers.h1_food,
    h2: answers.h2_cleanliness,
    h3: answers.h3_internet,
    h4: answers.h4_noise,
    h5: answers.h5_safety,
  });

  const placement = normalise03({
    p1: answers.p1_anxiety,
    p2: answers.p2_technical,
    p3: answers.p3_resume,
    p4: answers.p4_interview,
    p5: answers.p5_unemployment,
  });

  const lifestyle = normalise03({
    l1: answers.l1_physical,
    l2: answers.l2_social,
    l3: answers.l3_screen_time,
    l4: answers.l4_sleep_routine,
    l5: answers.l5_campus_activity,
  });

  return { mental, academic, hostel, placement, lifestyle };
}

/**
 * Apply weighted formula:
 * Final = (Mental×0.35) + (Academic×0.25) + (Hostel×0.15) + (Placement×0.15) + (Lifestyle×0.10)
 */
function calculateFinalWellnessScore(sections) {
  const { mental, academic, hostel, placement, lifestyle } = sections;
  const final =
    mental * 0.35 +
    academic * 0.25 +
    hostel * 0.15 +
    placement * 0.15 +
    lifestyle * 0.10;
  return Math.round(final * 10) / 10; // 1 decimal place
}

/**
 * Map final score (0-100) to a wellness status label
 * Higher score = more concern
 */
function getWellnessStatus(score) {
  if (score <= 20) return { label: 'Excellent', color: '#10B981' };
  if (score <= 40) return { label: 'Stable', color: '#34D399' };
  if (score <= 60) return { label: 'Moderate Concern', color: '#FBBF24' };
  if (score <= 80) return { label: 'High Stress', color: '#F97316' };
  return { label: 'Critical', color: '#EF4444' };
}

module.exports = {
  calculateSectionScores,
  calculateFinalWellnessScore,
  getWellnessStatus,
};
