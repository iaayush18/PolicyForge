// seed.js
// Campus Wellness Platform Seed Script

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

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateName = () => `${randomItem(firstNames)} ${randomItem(lastNames)}`;

async function main() {
  console.log('🌱 Seeding Campus Wellness database...');

  const SALT = await bcrypt.genSalt(10);
  const hash = (pw) => bcrypt.hash(pw, SALT);

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      password: await hash('admin123'),
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  const seededStudents = [];
  for (let i = 1; i <= TOTAL_RANDOM_STUDENTS; i++) {
    const email = `student${i}@university.edu`;
    const studentId = `STU${String(i).padStart(4, '0')}`;
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: await hash('student123'),
        role: 'STUDENT',
        isActive: true,
      },
    });

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
        cgpa: Number((Math.random() * 3 + 6).toFixed(2)),
      },
    });

    // Create a wellness assessment with random scores
    const rnd03 = () => Math.floor(Math.random() * 4);
    const rnd15 = () => Math.ceil(Math.random() * 5);

    const sa = {
      m1_exhaustion: rnd03(), m2_sleep: rnd03(), m3_motivation: rnd03(), m4_concentration: rnd03(), m5_isolation: rnd03(),
      a1_assignment: rnd03(), a2_exam: rnd03(), a3_backlog: rnd03(), a4_time_mgmt: rnd03(), a5_attendance: rnd03(),
      h1_food: rnd15(), h2_cleanliness: rnd15(), h3_internet: rnd15(), h4_noise: rnd15(), h5_safety: rnd15(),
      p1_anxiety: rnd03(), p2_technical: rnd03(), p3_resume: rnd03(), p4_interview: rnd03(), p5_unemployment: rnd03(),
      l1_physical: rnd03(), l2_social: rnd03(), l3_screen_time: rnd03(), l4_sleep_routine: rnd03(), l5_campus_activity: rnd03(),
    };

    const n03 = (keys) => Math.round((keys.reduce((s, k) => s + sa[k], 0) / 15) * 100);
    const nLk = (keys) => Math.round(((25 - keys.reduce((s, k) => s + sa[k], 0)) / 20) * 100);

    const mental = n03(['m1_exhaustion','m2_sleep','m3_motivation','m4_concentration','m5_isolation']);
    const academic = n03(['a1_assignment','a2_exam','a3_backlog','a4_time_mgmt','a5_attendance']);
    const hostel = nLk(['h1_food','h2_cleanliness','h3_internet','h4_noise','h5_safety']);
    const placement = n03(['p1_anxiety','p2_technical','p3_resume','p4_interview','p5_unemployment']);
    const lifestyle = n03(['l1_physical','l2_social','l3_screen_time','l4_sleep_routine','l5_campus_activity']);
    const final = Math.round((mental*0.35 + academic*0.25 + hostel*0.15 + placement*0.15 + lifestyle*0.10) * 10) / 10;
    const status = final <= 20 ? 'Excellent' : final <= 40 ? 'Stable' : final <= 60 ? 'Moderate Concern' : final <= 80 ? 'High Stress' : 'Critical';

    await prisma.wellnessAssessment.create({
      data: {
        studentId: student.id,
        mentalScore: mental,
        academicScore: academic,
        hostelScore: hostel,
        placementScore: placement,
        lifestyleScore: lifestyle,
        finalWellnessScore: final,
        wellnessStatus: status,
        ...sa,
      },
    });

    await prisma.student.update({
      where: { id: student.id },
      data: { currentWellnessScore: final, lastAssessmentDate: new Date(), totalAssessments: 1 },
    });

    seededStudents.push(student);
    console.log(`✅ ${student.name} (${student.email}) — Wellness: ${final} [${status}]`);
  }

  // Sample support tickets
  const ticketData = [
    { type: 'MENTAL_WELLNESS', message: 'Feeling overwhelmed with coursework and exams. Need to talk to someone.', priority: 'HIGH' },
    { type: 'HOSTEL', message: 'Internet connectivity in Block C has been down for 3 days.', priority: 'MEDIUM' },
    { type: 'PLACEMENT', message: 'Anxious about upcoming campus placements. Would like career counseling.', priority: 'MEDIUM' },
  ];
  for (let i = 0; i < Math.min(seededStudents.length, ticketData.length); i++) {
    await prisma.supportTicket.create({
      data: { studentId: seededStudents[i].id, ...ticketData[i], status: 'OPEN', isAnonymous: false },
    });
  }
  console.log('✅ Sample support tickets created');

  console.log('\n🎉 Seed complete!');
  console.log('  Admin:    admin@university.edu / admin123');
  console.log('  Students: student1-5@university.edu / student123');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
