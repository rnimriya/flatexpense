import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const totalApartments = await this.prisma.apartment.count();
    const totalExpenses = await this.prisma.expense.count();
    
    // For revenue, we could sum payments or subscriptions. Let's mock a revenue based on users for now, or just return 0.
    const totalRevenue = totalUsers * 9.99; // Mock premium revenue

    return {
      totalUsers,
      totalApartments,
      totalExpenses,
      totalRevenue
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        _count: {
          select: { memberships: true }
        }
      }
    });
  }

  async getApartments() {
    return this.prisma.apartment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true, expenses: true }
        }
      }
    });
  }
}
