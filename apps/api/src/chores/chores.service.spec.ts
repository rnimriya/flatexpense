import { Test, TestingModule } from '@nestjs/testing';
import { ChoresService, CreateChoreDto } from './chores.service';
import { PrismaService } from '../prisma.service';

describe('ChoresService', () => {
  let service: ChoresService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    chore: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChoresService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ChoresService>(ChoresService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChore', () => {
    it('should create a chore using explicitly provided apartmentId', async () => {
      const dto: CreateChoreDto = {
        apartmentId: 'apt-1',
        assigneeId: 'user-1',
        title: 'Clean Kitchen',
        dueDate: new Date().toISOString(),
      };

      const mockChore = { id: 'chore-1', ...dto };
      mockPrismaService.chore.create.mockResolvedValue(mockChore);

      const result = await service.createChore(dto, 'clerk-1');

      expect(result).toEqual(mockChore);
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.chore.create).toHaveBeenCalledWith({
        data: {
          apartmentId: 'apt-1',
          assigneeId: dto.assigneeId,
          title: dto.title,
          description: undefined,
          dueDate: expect.any(Date),
        }
      });
    });

    it('should lookup apartmentId if default is provided', async () => {
      const dto: CreateChoreDto = {
        apartmentId: 'default',
        assigneeId: 'user-1',
        title: 'Clean Kitchen',
        dueDate: new Date().toISOString(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        memberships: [{ apartmentId: 'resolved-apt-1' }]
      });

      const mockChore = { id: 'chore-1' };
      mockPrismaService.chore.create.mockResolvedValue(mockChore);

      await service.createChore(dto, 'clerk-1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk-1' },
        include: { memberships: true }
      });
      expect(mockPrismaService.chore.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ apartmentId: 'resolved-apt-1' })
        })
      );
    });
  });

  describe('toggleCompleteChore', () => {
    it('should mark chore as complete and set completedAt date', async () => {
      mockPrismaService.chore.update.mockResolvedValue({ id: 'chore-1', isCompleted: true });
      await service.toggleCompleteChore('chore-1', true);
      
      expect(mockPrismaService.chore.update).toHaveBeenCalledWith({
        where: { id: 'chore-1' },
        data: {
          isCompleted: true,
          completedAt: expect.any(Date),
        }
      });
    });

    it('should mark chore as incomplete and clear completedAt', async () => {
      mockPrismaService.chore.update.mockResolvedValue({ id: 'chore-1', isCompleted: false });
      await service.toggleCompleteChore('chore-1', false);
      
      expect(mockPrismaService.chore.update).toHaveBeenCalledWith({
        where: { id: 'chore-1' },
        data: {
          isCompleted: false,
          completedAt: null,
        }
      });
    });
  });

  describe('deleteChore', () => {
    it('should set deletedAt date', async () => {
      mockPrismaService.chore.update.mockResolvedValue({ id: 'chore-1' });
      await service.deleteChore('chore-1');
      expect(mockPrismaService.chore.update).toHaveBeenCalledWith({
        where: { id: 'chore-1' },
        data: { deletedAt: expect.any(Date) }
      });
    });
  });
});
