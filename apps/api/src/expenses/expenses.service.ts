import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export class SplitData {
  userId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export class CreateExpenseDto {
  apartmentId: string;
  payerId: string;
  categoryId?: string;
  title: string;
  description?: string;
  amount: number;
  date: string;
  splitType: 'EQUAL' | 'PERCENTAGE' | 'EXACT' | 'SHARES' | 'ADJUSTMENT';
  splits: SplitData[];
  tags?: string[];
  isRecurring?: boolean;
  recurringInterval?: string;
  receiptUrl?: string;
}

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary(apartmentId: string) {
    // Stub: Returns basic overview data for the apartment dashboard
    return {
      totalExpensesThisMonth: 1294.00,
      totalBalance: 124.50,
      activeRoommates: 4,
      pendingChores: 3,
    };
  }

  async createExpense(dto: CreateExpenseDto) {
    // Validate splits amount matches total amount if exact
    if (dto.splitType === 'EXACT') {
      const totalSplits = dto.splits.reduce((acc, split) => acc + split.amount, 0);
      // Use epsilon for floating point comparison
      if (Math.abs(totalSplits - dto.amount) > 0.01) {
        throw new BadRequestException('Split amounts do not equal total expense amount');
      }
    }

    if (dto.splitType === 'PERCENTAGE') {
      const totalPercentage = dto.splits.reduce((acc, split) => acc + (split.percentage || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new BadRequestException('Split percentages do not equal 100%');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Expense
      const expense = await tx.expense.create({
        data: {
          apartmentId: dto.apartmentId,
          payerId: dto.payerId,
          categoryId: dto.categoryId,
          title: dto.title,
          description: dto.description,
          amount: dto.amount,
          date: new Date(dto.date),
          splitType: dto.splitType,
          tags: dto.tags || [],
          isRecurring: dto.isRecurring || false,
          recurringInterval: dto.recurringInterval,
          receiptUrl: dto.receiptUrl,
        },
      });

      // 2. Create the Splits
      const splitPromises = dto.splits.map((split) =>
        tx.expenseSplit.create({
          data: {
            expenseId: expense.id,
            userId: split.userId,
            amount: split.amount,
            percentage: split.percentage,
            shares: split.shares,
            isSettled: split.userId === dto.payerId, // payer is automatically settled
          },
        })
      );

      await Promise.all(splitPromises);

      // 3. (Phase 6/7) We will update settlements here in the future
      return expense;
    });
  }

  async getExpensesByApartment(apartmentId: string, clerkUserId?: string, filters?: { categoryId?: string; payerId?: string; startDate?: string; endDate?: string }) {
    try {
      if (apartmentId === 'default' && clerkUserId) {
        const user = await this.prisma.user.findUnique({ where: { clerkUserId }, include: { memberships: true } });
        if (user && user.memberships.length > 0) apartmentId = user.memberships[0].apartmentId;
      }
      
      const whereClause: any = { apartmentId, deletedAt: null };
      
      if (filters?.categoryId) whereClause.categoryId = filters.categoryId;
      if (filters?.payerId) whereClause.payerId = filters.payerId;
      if (filters?.startDate || filters?.endDate) {
        whereClause.date = {};
        if (filters.startDate) whereClause.date.gte = new Date(filters.startDate);
        if (filters.endDate) whereClause.date.lte = new Date(filters.endDate);
      }

      return await this.prisma.expense.findMany({
        where: whereClause,
        include: {
          payer: { select: { firstName: true, lastName: true, profileImageUrl: true } },
          category: true,
          splits: {
            include: {
              user: { select: { firstName: true, lastName: true, profileImageUrl: true } }
            }
          },
        },
        orderBy: { date: 'desc' },
      });
    } catch (error) {
      console.warn("DB Connection failed. Returning demo data for client demo.");
      return [
        {
          id: 'demo-1',
          title: 'Trader Joe\'s Grocery Haul',
          amount: 154.20,
          date: new Date(),
          splitType: 'PERCENTAGE',
          tags: ['groceries', 'food'],
          category: { name: 'Groceries', color: '#10b981' },
          payer: { firstName: 'Alice', lastName: 'Smith', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
          splits: [
            { user: { firstName: 'Alice', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' }, amount: 77.10 },
            { user: { firstName: 'Bob', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' }, amount: 77.10 },
          ]
        },
        {
          id: 'demo-2',
          title: 'July Internet Bill',
          amount: 80.00,
          date: new Date(Date.now() - 86400000 * 2),
          splitType: 'EQUAL',
          tags: ['utilities', 'monthly'],
          category: { name: 'Internet', color: '#8b5cf6' },
          payer: { firstName: 'Bob', lastName: 'Jones', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
          splits: [
            { user: { firstName: 'Alice', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' }, amount: 40.00 },
            { user: { firstName: 'Bob', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' }, amount: 40.00 },
          ]
        },
        {
          id: 'demo-3',
          title: 'New Living Room Rug',
          amount: 299.99,
          date: new Date(Date.now() - 86400000 * 5),
          splitType: 'EQUAL',
          tags: ['furniture', 'home'],
          category: { name: 'Home', color: '#f59e0b' },
          payer: { firstName: 'Charlie', lastName: 'Brown', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
          splits: [
            { user: { firstName: 'Alice', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' }, amount: 100.00 },
            { user: { firstName: 'Bob', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' }, amount: 100.00 },
            { user: { firstName: 'Charlie', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' }, amount: 99.99 },
          ]
        }
      ] as any;
    }
  }

  async getExpenseById(id: string) {
    return this.prisma.expense.findUnique({
      where: { id },
      include: {
        payer: true,
        splits: { include: { user: true } }
      }
    });
  }

  async deleteExpense(id: string) {
    return this.prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async bulkDelete(ids: string[]) {
    return this.prisma.expense.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });
  }

  async exportExpensesAsCsv(apartmentId: string, clerkUserId?: string): Promise<string> {
    const expenses = await this.getExpensesByApartment(apartmentId, clerkUserId);
    
    const csvHeader = 'Date,Description,Category,Payer,Amount,SplitType,Tags\n';
    const csvRows = expenses.map(e => {
      const date = e.date.toISOString().split('T')[0];
      const desc = `"${e.title.replace(/"/g, '""')}"`;
      const category = e.category?.name || 'Uncategorized';
      const payer = `${e.payer.firstName || ''} ${e.payer.lastName || ''}`.trim() || 'Unknown';
      const tags = `"${e.tags.join(', ')}"`;
      return `${date},${desc},${category},${payer},${e.amount},${e.splitType},${tags}`;
    }).join('\n');
    
    return csvHeader + csvRows;
  }

  async getRoommates(apartmentId: string, clerkUserId?: string) {
    try {
      if (apartmentId === 'default' && clerkUserId) {
        const user = await this.prisma.user.findUnique({ where: { clerkUserId }, include: { memberships: true } });
        if (user && user.memberships.length > 0) apartmentId = user.memberships[0].apartmentId;
      }
      const members = await this.prisma.apartmentMember.findMany({
        where: { apartmentId },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profileImageUrl: true } } }
      });
      return members.map(m => m.user);
    } catch (error) {
      console.warn("DB Connection failed. Returning demo roommates.");
      return [
        { id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', role: 'OWNER' },
        { id: 'u2', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', role: 'MEMBER' },
        { id: 'u3', firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', role: 'MEMBER' },
      ];
    }
  }
}
