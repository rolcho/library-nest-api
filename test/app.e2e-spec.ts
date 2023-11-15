import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SignupDto } from 'src/auth/dto/signup.dto';
import mongoose from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.DB_URI);
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    }
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  const user: SignupDto = {
    name: 'Roland',
    email: 'roland@cimem.hu',
    password: 'Password123',
  };

  describe('Auth endpoints', () => {
    it('should return a token when registering a new user via POST /auth/signup', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(201);
      expect(res.body.token).toBeDefined();
    });

    it('should return a 409 error when trying to register an existing user via POST /auth/signup', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(409);
      expect(res.body.token).toBeUndefined();
    });

    it('should return a token when logging in an existing user via POST /auth/login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(200);
      expect(res.body.token).toBeDefined();
    });

    it('should return a 401 error when trying to login with worng password via POST /auth/login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.name + 'X' })
        .expect(401);
      expect(res.body.token).toBeUndefined();
    });
  });
});
