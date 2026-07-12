import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ApartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, description: string, clerkUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.apartment.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });
  }

  async findByUserId(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.apartment.findMany({
      where: {
        members: {
          some: { userId: user.id, leftAt: null },
        },
        deletedAt: null,
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  }

  async generateInvite(apartmentId: string, senderClerkUserId: string, receiverEmail: string) {
    const sender = await this.prisma.user.findUnique({ where: { clerkUserId: senderClerkUserId } });
    if (!sender) throw new NotFoundException('Sender not found');

    // Generate random token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.invitation.create({
      data: {
        apartmentId,
        senderId: sender.id,
        receiverEmail,
        token,
        expiresAt,
        status: 'PENDING',
      },
    });
  }

  async acceptInvite(token: string, clerkUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new NotFoundException('User not found');

    const invitation = await this.prisma.invitation.findUnique({ where: { token } });
    if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', receiverId: user.id },
      });

      return tx.apartmentMember.create({
        data: {
          apartmentId: invitation.apartmentId,
          userId: user.id,
          role: 'MEMBER',
        },
      });
    });
  }

  async leaveApartment(apartmentId: string, targetUserId: string, requesterClerkUserId: string) {
    const requester = await this.prisma.user.findUnique({ where: { clerkUserId: requesterClerkUserId } });
    if (!requester) throw new NotFoundException('Requester not found');

    const requesterMember = await this.prisma.apartmentMember.findFirst({
      where: { apartmentId, userId: requester.id, leftAt: null },
    });
    if (!requesterMember) throw new BadRequestException('Requester is not a member of this apartment');

    // Only OWNER can kick someone else. A member can only kick themselves (leave).
    if (requester.id !== targetUserId && requesterMember.role !== 'OWNER' && requesterMember.role !== 'ADMIN') {
      throw new BadRequestException('You do not have permission to kick this member');
    }

    const targetMember = await this.prisma.apartmentMember.findFirst({
      where: { apartmentId, userId: targetUserId, leftAt: null },
    });
    if (!targetMember) throw new NotFoundException('Target member not found in apartment');

    if (targetMember.role === 'OWNER' && requester.id === targetUserId) {
      throw new BadRequestException('Owner cannot leave the apartment without transferring ownership first');
    }

    return this.prisma.apartmentMember.update({
      where: { id: targetMember.id },
      data: { leftAt: new Date() },
    });
  }

  async transferOwnership(apartmentId: string, newOwnerId: string, requesterClerkUserId: string) {
    const requester = await this.prisma.user.findUnique({ where: { clerkUserId: requesterClerkUserId } });
    if (!requester) throw new NotFoundException('Requester not found');

    const requesterMember = await this.prisma.apartmentMember.findFirst({
      where: { apartmentId, userId: requester.id, leftAt: null },
    });

    if (!requesterMember || requesterMember.role !== 'OWNER') {
      throw new BadRequestException('Only the current owner can transfer ownership');
    }

    const newOwnerMember = await this.prisma.apartmentMember.findFirst({
      where: { apartmentId, userId: newOwnerId, leftAt: null },
    });

    if (!newOwnerMember) {
      throw new NotFoundException('New owner must be an active member of the apartment');
    }

    return this.prisma.$transaction(async (tx) => {
      // Demote current owner to ADMIN
      await tx.apartmentMember.update({
        where: { id: requesterMember.id },
        data: { role: 'ADMIN' },
      });

      // Promote new owner
      return tx.apartmentMember.update({
        where: { id: newOwnerMember.id },
        data: { role: 'OWNER' },
      });
    });
  }
}
