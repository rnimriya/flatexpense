import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('App Integration (e2e)', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    expense: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'exp-1', amount: 100 }),
    },
    bill: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    chore: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    apartmentMember: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'user-1', memberships: [{ apartmentId: 'apt-1' }] }),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrismaService)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Expenses', () => {
    it('/expenses (GET) - requires auth', () => {
      return request(app.getHttpServer())
        .get('/expenses?apartmentId=apt-1')
        .expect(401); // Unauthorized if no clerk token
    });
  });

  describe('Bills', () => {
    it('/bills/upcoming (GET) - requires auth', () => {
      return request(app.getHttpServer())
        .get('/bills/upcoming?apartmentId=apt-1')
        .expect(401); 
    });
  });

  describe('Chores', () => {
    it('/chores (GET) - requires auth', () => {
      return request(app.getHttpServer())
        .get('/chores?apartmentId=apt-1')
        .expect(401);
    });
  });
  
  describe('Settlements', () => {
    it('/settlements/balances (GET) - requires auth', () => {
      return request(app.getHttpServer())
        .get('/settlements/balances?apartmentId=apt-1')
        .expect(401);
    });
  });

  describe('Health Check', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });
});
