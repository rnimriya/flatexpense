import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async getContext(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { memberships: true },
    });

    if (!user || user.memberships.length === 0) {
      throw new NotFoundException('User is not part of any apartment');
    }

    const apartmentId = user.memberships[0].apartmentId;

    // Fetch apartment context
    const members = await this.prisma.apartmentMember.findMany({
      where: { apartmentId, leftAt: null },
      include: { user: true }
    });

    const expenses = await this.prisma.expense.findMany({
      where: { apartmentId, deletedAt: null },
      orderBy: { date: 'desc' },
      take: 10,
      include: { 
        paidBy: { select: { firstName: true, lastName: true } },
        splits: { select: { amount: true, user: { select: { firstName: true } } } },
        category: true
      }
    });

    const pendingChores = await this.prisma.chore.findMany({
      where: { apartmentId, isCompleted: false, deletedAt: null },
      include: { assignee: { select: { firstName: true } } }
    });

    // Build human readable context string
    let contextStr = `Apartment has ${members.length} members: ${members.map(m => m.user.firstName).join(', ')}.\n\n`;
    
    contextStr += `Recent Expenses (last 10):\n`;
    expenses.forEach(e => {
      contextStr += `- ${e.title} ($${e.amount}) on ${e.date.toLocaleDateString()}. Paid by ${e.paidBy.firstName}.\n`;
    });

    contextStr += `\nPending Chores:\n`;
    if (pendingChores.length === 0) {
      contextStr += `No pending chores!\n`;
    } else {
      pendingChores.forEach(c => {
        contextStr += `- ${c.title} assigned to ${c.assignee.firstName}. Due: ${c.dueDate.toLocaleDateString()}.\n`;
      });
    }

    return { context: contextStr };
  }
}
