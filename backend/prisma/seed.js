/**
 * prisma/seed.js
 * Idempotent + demo-ready seed script
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TOTAL_RANDOM_STUDENTS = 10; // optional bulk data

// ---------- Helpers ----------
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
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateName = () => `${randomItem(firstNames)} ${randomItem(lastNames)}`;

// ---------- Main ----------
async function main() {
  console.log('🌱 Seeding database (idempotent)...');

  // =========================
  // PASSWORDS (HASH ONCE)
  // =========================
  const adminPasswordStr = process.env.ADMIN_PASSWORD || 'admin123';
  const userPasswordStr = process.env.USER_PASSWORD || 'Welcome123';
  const adminPassword = await bcrypt.hash(adminPasswordStr, 10);
  const userPassword = await bcrypt.hash(userPasswordStr, 10);

  // =========================
  // 1. ADMIN (UPSERT)
  // =========================
  await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('👤 Admin ensured');

  // =========================
  // 2. DEMO USERS
  // =========================
  const student1User = await prisma.user.upsert({
    where: { email: 'student1@university.edu' },
    update: {},
    create: {
      email: 'student1@university.edu',
      password: userPassword,
      role: 'STUDENT'
    }
  });

  const student2User = await prisma.user.upsert({
    where: { email: 'student2@university.edu' },
    update: {},
    create: {
      email: 'student2@university.edu',
      password: userPassword,
      role: 'STUDENT'
    }
  });

  console.log('👥 Demo users ensured');

  // =========================
  // 3. DEMO STUDENT PROFILES
  // =========================
  const student1 = await prisma.student.upsert({
    where: { studentId: 'STU0001' },
    update: {},
    create: {
      userId: student1User.id,
      studentId: 'STU0001',
      name: 'Alex Smith',
      age: 20,
      gender: 'Male',
      course: 'Computer Science',
      cgpa: 8.2
    }
  });

  const student2 = await prisma.student.upsert({
    where: { studentId: 'STU0002' },
    update: {},
    create: {
      userId: student2User.id,
      studentId: 'STU0002',
      name: 'Taylor Johnson',
      age: 21,
      gender: 'Female',
      course: 'Psychology',
      cgpa: 7.8
    }
  });

  console.log('🎓 Demo students ensured');

  // =========================
  // 4. DEMO ASSESSMENTS (RESET ONLY THESE)
  // =========================
  await prisma.assessment.deleteMany({
    where: {
      studentId: {
        in: [student1.id, student2.id]
      }
    }
  });

  // Student 1 (improving)
  const student1Assessments = [
    {
      studentId: student1.id,
      q1_interest: 2, q2_depressed: 2, q3_sleep: 2,
      q4_energy: 2, q5_appetite: 1, q6_failure: 2,
      q7_concentration: 1, q8_movement: 1, q9_suicidal: 0,
      rawScore: 13,
      riskScore: 2,
      riskLevel: 'Moderate Depression',
      isCritical: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      studentId: student1.id,
      q1_interest: 1, q2_depressed: 1, q3_sleep: 1,
      q4_energy: 1, q5_appetite: 1, q6_failure: 1,
      q7_concentration: 1, q8_movement: 0, q9_suicidal: 0,
      rawScore: 7,
      riskScore: 1,
      riskLevel: 'Mild Depression',
      isCritical: false,
      createdAt: new Date()
    }
  ];

  // Student 2 (critical)
  const student2Assessments = [
    {
      studentId: student2.id,
      q1_interest: 3, q2_depressed: 3, q3_sleep: 3,
      q4_energy: 3, q5_appetite: 2, q6_failure: 3,
      q7_concentration: 2, q8_movement: 2, q9_suicidal: 2,
      rawScore: 23,
      riskScore: 3,
      riskLevel: 'Moderately Severe/Severe',
      isCritical: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  await prisma.assessment.createMany({
    data: [...student1Assessments, ...student2Assessments]
  });

  console.log('📊 Demo assessments inserted');

  // =========================
  // 5. UPDATE DEMO STATS
  // =========================
  const demoStudents = [student1, student2];

  for (const student of demoStudents) {
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

  console.log('📈 Demo stats updated');

  // =========================
  // 6. OPTIONAL RANDOM STUDENTS
  // =========================
  const randomUsers = [];

  for (let i = 3; i < 3 + TOTAL_RANDOM_STUDENTS; i++) {
    randomUsers.push({
      email: `student${i}@university.edu`,
      password: userPassword,
      role: 'STUDENT'
    });
  }

  for (const user of randomUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }

  console.log('🎲 Random users ensured');

  console.log('\n✅ Seeding completed');
}

// ---------- Run ----------
main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });