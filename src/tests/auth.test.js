const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../models/User');


jest.setTimeout(30000);


const testEmail = `test_${Date.now()}@example.com`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: testEmail });
});

afterAll(async () => {
    await User.deleteMany({ email: testEmail });
    await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Test User',
        email: testEmail,
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should login the user', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: testEmail,
            password: 'password123'
        });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: testEmail,
            password: 'wrongpassword'
        });
    expect(res.statusCode).toEqual(401);
  });
});
