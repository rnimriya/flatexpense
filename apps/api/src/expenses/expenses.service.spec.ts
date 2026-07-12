import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService, CreateExpenseDto } from './expenses.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrismaService)),
    expense: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    expenseSplit: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    apartmentMember: {
      findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExpense', () => {
    it('should throw BadRequestException if EXACT split amounts do not equal total', async () => {
      const dto: CreateExpenseDto = {
        apartmentId: 'apt-1',
        payerId: 'user-1',
        title: 'Test',
        amount: 100,
        date: new Date().toISOString(),
        splitType: 'EXACT',
        splits: [
          { userId: 'user-1', amount: 50 },
          { userId: 'user-2', amount: 40 }, // total is 90, not 100
        ],
      };

      await expect(service.createExpense(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if PERCENTAGE split amounts do not equal 100', async () => {
      const dto: CreateExpenseDto = {
        apartmentId: 'apt-1',
        payerId: 'user-1',
        title: 'Test',
        amount: 100,
        date: new Date().toISOString(),
        splitType: 'PERCENTAGE',
        splits: [
          { userId: 'user-1', amount: 50, percentage: 50 },
          { userId: 'user-2', amount: 40, percentage: 40 }, // total is 90%
        ],
      };

      await expect(service.createExpense(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create expense and splits successfully', async () => {
      const dto: CreateExpenseDto = {
        apartmentId: 'apt-1',
        payerId: 'user-1',
        title: 'Test Expense',
        amount: 100,
        date: new Date().toISOString(),
        splitType: 'EQUAL',
        splits: [
          { userId: 'user-1', amount: 50 },
          { userId: 'user-2', amount: 50 },
        ],
      };

      const mockExpense = { id: 'exp-1', ...dto };
      mockPrismaService.expense.create.mockResolvedValue(mockExpense);
      mockPrismaService.expenseSplit.create.mockResolvedValue({ id: 'split-1' });

      const result = await service.createExpense(dto);

      expect(result).toEqual(mockExpense);
      expect(mockPrismaService.expense.create).toHaveBeenCalled();
      expect(mockPrismaService.expenseSplit.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteExpense', () => {
    it('should mark expense as deleted', async () => {
      mockPrismaService.expense.update.mockResolvedValue({ id: 'exp-1', deletedAt: new Date() });
      await service.deleteExpense('exp-1');
      expect(mockPrismaService.expense.update).toHaveBeenCalledWith({
        where: { id: 'exp-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('bulkDelete', () => {
    it('should mark multiple expenses as deleted', async () => {
      mockPrismaService.expense.updateMany.mockResolvedValue({ count: 2 });
      await service.bulkDelete(['exp-1', 'exp-2']);
      expect(mockPrismaService.expense.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['exp-1', 'exp-2'] } },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
