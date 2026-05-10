const request = require('supertest');
const { app } = require('../server');

describe('Auth API', () => {

  test('POST /api/auth/login should login valid user', async () => {

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student1@university.edu',
        password: 'Welcome123'
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