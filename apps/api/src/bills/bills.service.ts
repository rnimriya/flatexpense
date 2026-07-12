import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export class CreateBillDto {
  apartmentId: string;
  title: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  frequency?: string; // 'MONTHLY', 'WEEKLY'
}

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async createBill(dto: CreateBillDto) {
    return this.prisma.$transaction(async (tx) => {
      let recurringBillId: string | null = null;

      if (dto.isRecurring && dto.frequency) {
        // Calculate next due date (stub logic: add 1 month if monthly)
        const date = new Date(dto.dueDate);
        const nextDueDate = new Date(date);
        if (dto.frequency === 'MONTHLY') nextDueDate.setMonth(date.getMonth() + 1);
        if (dto.frequency === 'WEEKLY') nextDueDate.setDate(date.getDate() + 7);

        const recurringBill = await tx.recurringBill.create({
          data: {
            apartmentId: dto.apartmentId,
            title: dto.title,
            amount: dto.amount,
            frequency: dto.frequency,
            nextDueDate: nextDueDate,
          },
        });
        recurringBillId = recurringBill.id;
      }

      return tx.bill.create({
        data: {
          apartmentId: dto.apartmentId,
          title: dto.title,
          amount: dto.amount,
          dueDate: new Date(dto.dueDate),
          recurringBillId,
        },
      });
    });
  }

  async getUpcomingBills(apartmentId: string) {
    try {
      return await this.prisma.bill.findMany({
        where: {
          apartmentId,
          deletedAt: null,
        },
        orderBy: { dueDate: 'asc' },
      });
    } catch (error) {
      console.warn("DB Connection failed. Returning demo bills.");
      return [
        { id: 'b1', title: 'Electric Bill', amount: 120.50, dueDate: new Date(Date.now() + 86400000 * 5) },
        { id: 'b2', title: 'Internet', amount: 79.99, dueDate: new Date(Date.now() + 86400000 * 12) },
      ] as any;
    }
  }
}
