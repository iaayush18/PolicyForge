/**
 * scripts/seed.js
 * Database Seeding Script - Create Sample Data
 */

const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Assessment = require('../models/Assessment.model');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("Resolved Path:", path.resolve(__dirname, '../.env'));
console.log("MONGO_URI Value:", process.env.MONGODB_URI);

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

// Generate random PHQ-9 answers
const generatePHQ9Answers = () => {
  const baseScore = Math.random();
  
  if (baseScore < 0.5) {
    // Healthy - mostly 0s and 1s
    return {
      q1_interest: Math.floor(Math.random() * 2),
      q2_depressed: Math.floor(Math.random() * 2),
      q3_sleep: Math.floor(Math.random() * 2),
      q4_energy: Math.floor(Math.random() * 2),
      q5_appetite: Math.floor(Math.random() * 2),
      q6_failure: Math.floor(Math.random() * 2),
      q7_concentration: Math.floor(Math.random() * 2),
      q8_movement: Math.floor(Math.random() * 2),
      q9_suicidal: 0
    };
  } else if (baseScore < 0.75) {
    // Mild to Moderate
    return {
      q1_interest: Math.floor(Math.random() * 3),
      q2_depressed: Math.floor(Math.random() * 3),
      q3_sleep: Math.floor(Math.random() * 3),
      q4_energy: Math.floor(Math.random() * 3),
      q5_appetite: Math.floor(Math.random() * 3),
      q6_failure: Math.floor(Math.random() * 3),
      q7_concentration: Math.floor(Math.random() * 3),
      q8_movement: Math.floor(Math.random() * 2),
      q9_suicidal: Math.floor(Math.random() * 2)
    };
  } else {
    // Severe
    return {
      q1_interest: 2 + Math.floor(Math.random() * 2),
      q2_depressed: 2 + Math.floor(Math.random() * 2),
      q3_sleep: 2 + Math.floor(Math.random() * 2),
      q4_energy: 2 + Math.floor(Math.random() * 2),
      q5_appetite: 1 + Math.floor(Math.random() * 3),
      q6_failure: 1 + Math.floor(Math.random() * 3),
      q7_concentration: 2 + Math.floor(Math.random() * 2),
      q8_movement: 1 + Math.floor(Math.random() * 2),
      q9_suicidal: Math.floor(Math.random() * 3)
    };
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Assessment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = new User({
      email: 'admin@university.edu',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('👤 Admin user created: admin@university.edu / admin123');

    // Create student users and profiles
    const students = [];
    for (let i = 1; i <= 25; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `student${i}@university.edu`;

      // Create user
      const user = new User({
        email,
        password: 'Welcome123',
        role: 'student'
      });
      await user.save();

      // Create student profile
      const student = new Student({
        userId: user._id,
        studentId: `STU${String(i).padStart(4, '0')}`,
        name,
        age: 18 + Math.floor(Math.random() * 8),
        gender: Math.random() > 0.5 ? 'Male' : (Math.random() > 0.5 ? 'Female' : 'Other'),
        course: courses[Math.floor(Math.random() * courses.length)],
        cgpa: parseFloat((5 + Math.random() * 5).toFixed(2))
      });
      await student.save();
      students.push(student);

      console.log(`✅ Created student ${i}/25: ${name}`);
    }

    // Create assessments for each student (1-3 assessments per student)
    let totalAssessments = 0;
    for (const student of students) {
      const numAssessments = 1 + Math.floor(Math.random() * 3);

      for (let j = 0; j < numAssessments; j++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        const phq9Answers = generatePHQ9Answers();

        const assessment = new Assessment({
          studentId: student._id,
          phq9Answers,
          createdAt
        });

        await assessment.save();
        totalAssessments++;

        // Update student's current risk score to latest assessment
        if (j === numAssessments - 1) {
          student.currentRiskScore = assessment.riskScore;
          student.lastAssessmentDate = assessment.createdAt;
          student.totalAssessments = numAssessments;
          await student.save();
        }
      }
    }

    console.log(`📊 Created ${totalAssessments} assessments`);

    // Display statistics
    const stats = await Student.aggregate([
      {
        $group: {
          _id: '$currentRiskScore',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('\n📈 Risk Score Distribution:');
    stats.forEach(stat => {
      const labels = {
        0: 'Healthy (0)',
        1: 'Low Risk (1)',
        2: 'Moderate (2)',
        3: 'Critical (3)'
      };
      console.log(`   ${labels[stat._id]}: ${stat.count} students`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@university.edu / admin123');
    console.log('   Students: student1@university.edu / Welcome123');
    console.log('             student2@university.edu / Welcome123');
    console.log('             ... (up to student25)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();