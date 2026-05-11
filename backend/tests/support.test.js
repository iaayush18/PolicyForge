const request = require('supertest');
const { app } = require('../server');
const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

describe('Support Tickets API (MVP)', () => {
  const studentEmail = 'supportstudent1@university.edu';
  const studentPassword = 'student123';
  const adminEmail = 'supportadmin1@university.edu';
  const adminPassword = 'admin123';

  let studentToken;
  let adminToken;

  beforeAll(async () => {
    // Ensure admin exists
    const adminHashed = await bcrypt.hash(adminPassword, 10);
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: adminHashed,
          role: 'ADMIN',
          isActive: true,
        },
      });
    } else {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: adminHashed, role: 'ADMIN', isActive: true },
      });
    }

    // Ensure student user + profile exist
    const studentHashed = await bcrypt.hash(studentPassword, 10);
    const existingStudentUser = await prisma.user.findUnique({ where: { email: studentEmail } });

    const studentUser = existingStudentUser
      ? await prisma.user.update({
          where: { email: studentEmail },
          data: { password: studentHashed, role: 'STUDENT', isActive: true },
        })
      : await prisma.user.create({
          data: {
            email: studentEmail,
            password: studentHashed,
            role: 'STUDENT',
            isActive: true,
          },
        });

    const existingProfile = await prisma.student.findUnique({ where: { userId: studentUser.id } });
    if (!existingProfile) {
      // Use a unique-ish studentId to avoid collisions across runs
      const studentId = `SUP-${studentUser.id.slice(0, 8).toUpperCase()}`;
      await prisma.student.create({
        data: {
          userId: studentUser.id,
          studentId,
          name: 'Support Test Student',
          age: 20,
          gender: 'Other',
          course: 'CSE',
          cgpa: 8.2,
        },
      });
    }

    // Login both accounts
    const studentLogin = await request(app).post('/api/auth/login').send({ email: studentEmail, password: studentPassword });
    expect(studentLogin.statusCode).toBe(200);
    studentToken = studentLogin.body.token;

    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: adminPassword });
    expect(adminLogin.statusCode).toBe(200);
    adminToken = adminLogin.body.token;
  });

  test('Student can create a support ticket (anonymous)', async () => {
    const res = await request(app)
      .post('/api/support')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        type: 'MENTAL_WELLNESS',
        priority: 'MEDIUM',
        isAnonymous: true,
        message: 'I would like to request counseling support for stress and anxiety.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket).toHaveProperty('id');
    expect(res.body.ticket.isAnonymous).toBe(true);
  });

  test('High-priority hostel complaints auto-escalate', async () => {
    const res = await request(app)
      .post('/api/support')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        type: 'HOSTEL',
        priority: 'CRITICAL',
        isAnonymous: false,
        message: 'There is a serious safety issue in the hostel block. Immediate attention required.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.ticket.type).toBe('HOSTEL');
    expect(res.body.ticket.priority).toBe('CRITICAL');
    expect(res.body.ticket.status).toBe('ESCALATED');
  });

  test('Admin list does not expose student identity for anonymous tickets', async () => {
    const res = await request(app)
      .get('/api/support')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tickets)).toBe(true);

    const anyAnonymous = res.body.tickets.find((t) => t.isAnonymous);
    expect(anyAnonymous).toBeTruthy();
    expect(anyAnonymous.student).toBeNull();
  });
});
