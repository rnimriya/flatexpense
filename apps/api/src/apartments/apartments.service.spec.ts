import { Test, TestingModule } from '@nestjs/testing';
import { ApartmentsService } from './apartments.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ApartmentsService', () => {
  let service: ApartmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrismaService)),
    user: {
      findUnique: jest.fn(),
    },
    apartment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    invitation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    apartmentMember: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApartmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ApartmentsService>(ApartmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.create('Apt', 'Desc', 'clerk-1')).rejects.toThrow(NotFoundException);
    });

    it('should create apartment and add user as OWNER', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.apartment.create.mockResolvedValue({ id: 'apt-1' });

      const result = await service.create('Apt', 'Desc', 'clerk-1');
      expect(result).toEqual({ id: 'apt-1' });
      expect(mockPrismaService.apartment.create).toHaveBeenCalledWith({
        data: {
          name: 'Apt',
          description: 'Desc',
          members: {
            create: { userId: 'user-1', role: 'OWNER' }
          }
        }
      });
    });
  });

  describe('generateInvite', () => {
    it('should generate an invite token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invitation.create.mockResolvedValue({ id: 'inv-1', token: 'token123' });

      const result = await service.generateInvite('apt-1', 'clerk-1', 'test@example.com');
      expect(result).toEqual({ id: 'inv-1', token: 'token123' });
      expect(mockPrismaService.invitation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            apartmentId: 'apt-1',
            senderId: 'user-1',
            receiverEmail: 'test@example.com',
            token: expect.any(String),
            status: 'PENDING',
          })
        })
      );
    });
  });

  describe('acceptInvite', () => {
    it('should throw BadRequestException for invalid/expired token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invitation.findUnique.mockResolvedValue({ status: 'ACCEPTED' });
      
      await expect(service.acceptInvite('token123', 'clerk-1')).rejects.toThrow(BadRequestException);
    });

    it('should accept invite and add user as MEMBER', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      mockPrismaService.invitation.findUnique.mockResolvedValue({ 
        id: 'inv-1', 
        apartmentId: 'apt-1',
        status: 'PENDING',
        expiresAt: futureDate
      });
      mockPrismaService.apartmentMember.create.mockResolvedValue({ id: 'mem-1' });

      await service.acceptInvite('token123', 'clerk-1');

      expect(mockPrismaService.invitation.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: 'ACCEPTED', receiverId: 'user-1' }
      });
      expect(mockPrismaService.apartmentMember.create).toHaveBeenCalledWith({
        data: { apartmentId: 'apt-1', userId: 'user-1', role: 'MEMBER' }
      });
    });
  });

  describe('leaveApartment', () => {
    it('should allow user to leave', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.apartmentMember.findFirst
        .mockResolvedValueOnce({ id: 'mem-1', role: 'MEMBER', userId: 'user-1' }) // requester
        .mockResolvedValueOnce({ id: 'mem-1', role: 'MEMBER', userId: 'user-1' }); // target

      await service.leaveApartment('apt-1', 'user-1', 'clerk-1');
      
      expect(mockPrismaService.apartmentMember.update).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
        data: { leftAt: expect.any(Date) }
      });
    });

    it('should not allow OWNER to leave', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.apartmentMember.findFirst
        .mockResolvedValueOnce({ id: 'mem-1', role: 'OWNER', userId: 'user-1' }) 
        .mockResolvedValueOnce({ id: 'mem-1', role: 'OWNER', userId: 'user-1' }); 

      await expect(service.leaveApartment('apt-1', 'user-1', 'clerk-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership to new member', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.apartmentMember.findFirst
        .mockResolvedValueOnce({ id: 'mem-1', role: 'OWNER', userId: 'user-1' }) // requester
        .mockResolvedValueOnce({ id: 'mem-2', role: 'MEMBER', userId: 'user-2' }); // target

      await service.transferOwnership('apt-1', 'user-2', 'clerk-1');
      
      expect(mockPrismaService.apartmentMember.update).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
        data: { role: 'ADMIN' }
      });
      expect(mockPrismaService.apartmentMember.update).toHaveBeenCalledWith({
        where: { id: 'mem-2' },
        data: { role: 'OWNER' }
      });
    });
  });
});
