import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertUser(clerkUserId: string, email: string, firstName?: string, lastName?: string, profileImageUrl?: string) {
    return this.prisma.user.upsert({
      where: { clerkUserId },
      update: {
        email,
        firstName,
        lastName,
        profileImageUrl,
      },
      create: {
        clerkUserId,
        email,
        firstName,
        lastName,
        profileImageUrl,
      },
    });
  }

  async deleteUser(clerkUserId: string) {
    return this.prisma.user.update({
      where: { clerkUserId },
      data: { deletedAt: new Date() },
    });
  }
}
