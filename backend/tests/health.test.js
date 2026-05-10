const request = require('supertest');
const { app, prisma } = require('../server');

describe('Health Check API', () => {

  test('GET /health should return healthy status', async () => {

    const response = await request(app).get('/health');

      expect(response.statusCode).toBe(200);
 
      expect(response.body.status).toBe('healthy');

  });

});

afterAll(async () => {
  await prisma.$disconnect();
});