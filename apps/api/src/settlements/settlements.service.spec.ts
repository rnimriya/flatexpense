import { Test, TestingModule } from '@nestjs/testing';
import { SettlementsService } from './settlements.service';
import { PrismaService } from '../prisma.service';

describe('SettlementsService', () => {
  let service: SettlementsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    expenseSplit: {
      findMany: jest.fn(),
    },
    apartmentMember: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SettlementsService>(SettlementsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateBalances', () => {
    it('should calculate balances correctly with a simple debt', async () => {
      // User 1 paid 100, split 50/50 with User 2. User 2 owes User 1 50.
      mockPrismaService.expenseSplit.findMany.mockResolvedValue([
        {
          expense: { payerId: 'user-1' },
          userId: 'user-2',
          amount: 50,
          isSettled: false,
        }
      ]);

      mockPrismaService.apartmentMember.findMany.mockResolvedValue([
        { userId: 'user-1', user: { id: 'user-1', firstName: 'Alice' } },
        { userId: 'user-2', user: { id: 'user-2', firstName: 'Bob' } },
      ]);

      const result = await service.calculateBalances('apt-1');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        from: { id: 'user-2', firstName: 'Bob' },
        to: { id: 'user-1', firstName: 'Alice' },
        amount: 50,
      });
    });

    it('should simplify multi-way debts', async () => {
      // User 2 owes User 1: 50
      // User 3 owes User 2: 50
      // Simplified: User 3 should owe User 1: 50
      mockPrismaService.expenseSplit.findMany.mockResolvedValue([
        {
          expense: { payerId: 'user-1' },
          userId: 'user-2',
          amount: 50,
          isSettled: false,
        },
        {
          expense: { payerId: 'user-2' },
          userId: 'user-3',
          amount: 50,
          isSettled: false,
        }
      ]);

      mockPrismaService.apartmentMember.findMany.mockResolvedValue([
        { userId: 'user-1', user: { id: 'user-1', firstName: 'Alice' } },
        { userId: 'user-2', user: { id: 'user-2', firstName: 'Bob' } },
        { userId: 'user-3', user: { id: 'user-3', firstName: 'Charlie' } },
      ]);

      const result = await service.calculateBalances('apt-1');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        from: { id: 'user-3', firstName: 'Charlie' },
        to: { id: 'user-1', firstName: 'Alice' },
        amount: 50,
      });
    });
  });
});
