import { Test, TestingModule } from '@nestjs/testing';
import { BillsService, CreateBillDto } from './bills.service';
import { PrismaService } from '../prisma.service';

describe('BillsService', () => {
  let service: BillsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrismaService)),
    recurringBill: {
      create: jest.fn(),
    },
    bill: {
      create: jest.fn(),
      findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBill', () => {
    it('should create a simple one-time bill', async () => {
      const dto: CreateBillDto = {
        apartmentId: 'apt-1',
        title: 'Electricity',
        amount: 100,
        dueDate: new Date().toISOString(),
        isRecurring: false,
      };

      const mockBill = { id: 'bill-1', ...dto };
      mockPrismaService.bill.create.mockResolvedValue(mockBill);

      const result = await service.createBill(dto);

      expect(result).toEqual(mockBill);
      expect(mockPrismaService.recurringBill.create).not.toHaveBeenCalled();
      expect(mockPrismaService.bill.create).toHaveBeenCalledWith({
        data: {
          apartmentId: dto.apartmentId,
          title: dto.title,
          amount: dto.amount,
          dueDate: expect.any(Date),
          recurringBillId: null,
        }
      });
    });

    it('should create a recurring bill and a linked bill (monthly)', async () => {
      const baseDate = new Date('2026-07-01T00:00:00Z');
      const dto: CreateBillDto = {
        apartmentId: 'apt-1',
        title: 'Internet',
        amount: 50,
        dueDate: baseDate.toISOString(),
        isRecurring: true,
        frequency: 'MONTHLY',
      };

      const mockRecurringBill = { id: 'recurring-1' };
      const mockBill = { id: 'bill-1', recurringBillId: 'recurring-1' };
      
      mockPrismaService.recurringBill.create.mockResolvedValue(mockRecurringBill);
      mockPrismaService.bill.create.mockResolvedValue(mockBill);

      await service.createBill(dto);

      expect(mockPrismaService.recurringBill.create).toHaveBeenCalled();
      const recurringCreateCall = mockPrismaService.recurringBill.create.mock.calls[0][0];
      
      // Next due date should be 1 month later
      const expectedNextDueDate = new Date(baseDate);
      expectedNextDueDate.setMonth(baseDate.getMonth() + 1);
      
      expect(recurringCreateCall.data.nextDueDate.getTime()).toEqual(expectedNextDueDate.getTime());
      
      expect(mockPrismaService.bill.create).toHaveBeenCalledWith({
        data: {
          apartmentId: dto.apartmentId,
          title: dto.title,
          amount: dto.amount,
          dueDate: expect.any(Date),
          recurringBillId: 'recurring-1',
        }
      });
    });
  });

  describe('getUpcomingBills', () => {
    it('should return upcoming bills', async () => {
      const mockBills = [{ id: 'bill-1' }];
      mockPrismaService.bill.findMany.mockResolvedValue(mockBills);

      const result = await service.getUpcomingBills('apt-1');
      expect(result).toEqual(mockBills);
      expect(mockPrismaService.bill.findMany).toHaveBeenCalledWith({
        where: { apartmentId: 'apt-1', deletedAt: null },
        orderBy: { dueDate: 'asc' },
      });
    });
  });
});
