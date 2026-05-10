const request = require('supertest');
const { app } = require('../server');

describe('Protected Routes', () => {

  test('GET protected route without token should fail', async () => {

    const response = await request(app)
      .get('/api/students');

    expect(response.statusCode).toBe(401);

  });

});