/**
 * prisma/seed.js
 * Seed script for PostgreSQL (Prisma)
 */
require('dotenv').config(); 
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const TOTAL_STUDENTS = 25;

const courses = [
  'Computer Science',
  'Mechanical Engineering',
  'Business Administration',
  'Medicine',
  'Psychology',
  'Civil Engineering',
  'Biotechnology'
];

const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];


const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateName = () => `${randomItem(firstNames)} ${randomItem(lastNames)}`;

const generatePHQ9Answers = () => {
  const base = Math.random();

  if (base < 0.5) {
    return Array(9).fill(0).map(() => Math.floor(Math.random() * 2));
  } else if (base < 0.75) {
    return Array(9).fill(0).map(() => Math.floor(Math.random() * 3));
  } else {
    return Array(9).fill(0).map(() => 2 + Math.floor(Math.random() * 2));
  }
};

const calculateScore = (answers) => {
  const rawScore = answers.reduce((a, b) => a + b, 0);

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

  return { rawScore, riskScore, riskLevel, isCritical };
};

async function main() {
  console.log('🌱 Seeding database...');

  // 1. ADMIN USER
  const adminPasswordStr = process.env.ADMIN_PASSWORD || 'admin123';
  const adminPassword = await bcrypt.hash(adminPasswordStr, 10);

  await prisma.user.create({
    data: {
      email: 'admin@university.edu',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('👤 Admin created');

  // =========================
  // 2. STUDENTS + USERS
  // =========================

  const users = [];

  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    const userPasswordStr = process.env.USER_PASSWORD || 'Welcome123';
    const password = await bcrypt.hash(userPasswordStr, 10);

    users.push({
      email: `student${i}@university.edu`,
      password,
      role: 'STUDENT'
    });
  }

  const createdUsers = await prisma.$transaction(
    users.map((u) => prisma.user.create({ data: u }))
  );

  console.log('👥 Users created');

  // =========================
  // 3. STUDENT PROFILES
  // =========================

  const students = createdUsers.map((user, i) => ({
    userId: user.id,
    studentId: `STU${String(i + 1).padStart(4, '0')}`,
    name: generateName(),
    age: 18 + Math.floor(Math.random() * 8),
    gender: randomItem(['Male', 'Female', 'Other']),
    course: randomItem(courses),
    cgpa: parseFloat((5 + Math.random() * 5).toFixed(2))
  }));

  const createdStudents = await prisma.$transaction(
    students.map((s) => prisma.student.create({ data: s }))
  );

  console.log('🎓 Students created');

  // =========================
  // 4. ASSESSMENTS
  // =========================

  const assessments = [];

  for (const student of createdStudents) {
    const num = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < num; i++) {
      const answers = generatePHQ9Answers();
      const score = calculateScore(answers);

      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      assessments.push({
        studentId: student.id,

        q1_interest: answers[0],
        q2_depressed: answers[1],
        q3_sleep: answers[2],
        q4_energy: answers[3],
        q5_appetite: answers[4],
        q6_failure: answers[5],
        q7_concentration: answers[6],
        q8_movement: answers[7],
        q9_suicidal: answers[8],

        ...score,
        createdAt
      });
    }
  }

  await prisma.assessment.createMany({
    data: assessments
  });

  console.log(`📊 ${assessments.length} assessments created`);

  // =========================
  // 5. UPDATE STUDENT STATS
  // =========================

  for (const student of createdStudents) {
    const latest = await prisma.assessment.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    const count = await prisma.assessment.count({
      where: { studentId: student.id }
    });

    await prisma.student.update({
      where: { id: student.id },
      data: {
        currentRiskScore: latest?.riskScore || 0,
        lastAssessmentDate: latest?.createdAt || null,
        totalAssessments: count
      }
    });
  }

  console.log('📈 Student stats updated');

  console.log('\n✅ Seeding completed');
  console.log('\n🔐 Credentials:');
  console.log('Admin → admin@university.edu / admin123');
  console.log('Students → student1@university.edu / Welcome123 ...');
}


main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });  