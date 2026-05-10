/**
 * prisma/seed.js
 * Seed script for PostgreSQL (Prisma)
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TOTAL_RANDOM_STUDENTS = 20;

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Krishna',
  'Rohan', 'Rahul', 'Karan', 'Ishaan', 'Aniket',
  'Ayaan', 'Siddharth', 'Varun', 'Harsh', 'Yash',
  'Priya', 'Ananya', 'Aditi', 'Sneha', 'Kavya',
  'Pooja', 'Riya', 'Meera', 'Diya', 'Nisha',
  'Neha', 'Isha', 'Tanvi', 'Shreya', 'Anjali'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair',
  'Gupta', 'Joshi', 'Kulkarni', 'Yadav', 'Singh',
  'Agarwal', 'Choudhary', 'Kapoor', 'Malhotra', 'Bhat',
  'Mishra', 'Pandey', 'Rao', 'Das', 'Iyer'
];

const indianCourses = [
  'Computer Science',
  'Information Science',
  'Artificial Intelligence',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics and Communication',
  'Business Administration',
  'Biotechnology'
];

// Helpers
const randomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const generateName = () =>
  `${randomItem(firstNames)} ${randomItem(lastNames)}`;

async function main() {

  console.log('🌱 Seeding database...');

  // Hash password once
  const userPassword = await bcrypt.hash('Welcome123', 10);

  // Create admin
  await prisma.user.upsert({
    where: {
      email: 'admin@university.edu'
    },
    update: {},
    create: {
      email: 'admin@university.edu',
      password: userPassword,
      role: 'ADMIN'
    }
  });

  // Create students
  for (let i = 1; i <= TOTAL_RANDOM_STUDENTS; i++) {

    const email = `student${i}@university.edu`;
    const studentId = `STU${String(i).padStart(4, '0')}`;

    // User
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: userPassword,
        role: 'STUDENT'
      }
    });

    const gender =
      Math.random() > 0.5 ? 'Male' : 'Female';

    // Student
    const student = await prisma.student.upsert({
      where: { studentId },
      update: {},
      create: {
        userId: user.id,
        studentId,
        name: generateName(),
        age: Math.floor(Math.random() * 5) + 18,
        gender,
        course: randomItem(indianCourses),
        cgpa: Number((Math.random() * 3 + 6).toFixed(2))
      }
    });

    // Remove old assessments
    await prisma.assessment.deleteMany({
      where: {
        studentId: student.id
      }
    });

    const totalAssessments =
      Math.floor(Math.random() * 3) + 1;

    // Create assessments
    for (let j = 0; j < totalAssessments; j++) {

      const rawScore =
        Math.floor(Math.random() * 25);

      let riskScore = 0;
      let riskLevel = 'Minimal';
      let isCritical = false;

      if (rawScore >= 20) {
        riskScore = 3;
        riskLevel = 'Severe Depression';
        isCritical = true;

      } else if (rawScore >= 15) {
        riskScore = 2;
        riskLevel = 'Moderate Depression';

      } else if (rawScore >= 8) {
        riskScore = 1;
        riskLevel = 'Mild Depression';
      }

      await prisma.assessment.create({
        data: {
          studentId: student.id,

          q1_interest: Math.floor(Math.random() * 4),
          q2_depressed: Math.floor(Math.random() * 4),
          q3_sleep: Math.floor(Math.random() * 4),
          q4_energy: Math.floor(Math.random() * 4),
          q5_appetite: Math.floor(Math.random() * 4),
          q6_failure: Math.floor(Math.random() * 4),
          q7_concentration: Math.floor(Math.random() * 4),
          q8_movement: Math.floor(Math.random() * 4),
          q9_suicidal: Math.floor(Math.random() * 3),

          rawScore,
          riskScore,
          riskLevel,
          isCritical,

          createdAt: new Date(
            Date.now() -
            Math.floor(Math.random() * 30) *
            24 * 60 * 60 * 1000
          )
        }
      });
    }

    // Update stats
    const latest =
      await prisma.assessment.findFirst({
        where: {
          studentId: student.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

    const count =
      await prisma.assessment.count({
        where: {
          studentId: student.id
        }
      });

    await prisma.student.update({
      where: {
        id: student.id
      },
      data: {
        currentRiskScore:
          latest?.riskScore || 0,

        lastAssessmentDate:
          latest?.createdAt || null,

        totalAssessments: count
      }
    });

    console.log(`✅ Created ${studentId}`);
  }

  console.log('🎓 20 Indian demo students created');
}

// Run
main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });