const request = require('supertest');
const { app } = require('../server');
const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

describe('Auth API', () => {

  beforeAll(async () => {
    // Seed test user if not exists
    const email = 'student1@university.edu';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'STUDENT',
          isActive: true
        }
      });
    }
  });

  test('POST /api/auth/login should login valid user', async () => {

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student1@university.edu',
        password: 'student123'
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty('token');

  });

  test('POST /api/auth/login should reject invalid password', async () => {

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student1@university.edu',
        password: 'wrongpassword'
      });

    expect(response.statusCode).toBe(401);

  });

});