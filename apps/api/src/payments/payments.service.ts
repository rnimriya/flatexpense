import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export class CreatePaymentSessionDto {
  fromUserId: string;
  toUserId: string;
  amount: number;
  apartmentId: string;
  method?: string; // 'CASH', 'VENMO', 'STRIPE'
  clerkUserId?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createCheckoutSession(dto: CreatePaymentSessionDto) {
    // 1. (Future) Initialize Stripe with API Key
    // 2. (Future) Verify toUserId has a Stripe Connect account connected
    // 3. (Future) Create Stripe Checkout Session

    // Simulating API latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response simulating a Stripe Checkout session URL
    return {
      success: true,
      checkoutUrl: `https://checkout.stripe.com/c/pay/cs_test_mock_${Date.now()}`,
      sessionId: `cs_test_mock_${Date.now()}`
    };
  }

  async recordPayment(dto: CreatePaymentSessionDto) {
    let apartmentId = dto.apartmentId;
    if (apartmentId === 'default' && dto.clerkUserId) {
      const user = await this.prisma.user.findUnique({ where: { clerkUserId: dto.clerkUserId }, include: { memberships: true } });
      if (user && user.memberships.length > 0) apartmentId = user.memberships[0].apartmentId;
    }

    // 1. Record the payment
    const payment = await this.prisma.payment.create({
      data: {
        senderId: dto.fromUserId,
        receiverId: dto.toUserId,
        amount: dto.amount,
        method: dto.method || 'CASH',
        status: 'COMPLETED',
      }
    });

    // 2. We should ideally mark ExpenseSplits as settled here, but for now we just
    // mark enough splits between these two users as settled to cover the amount.
    const pendingSplits = await this.prisma.expenseSplit.findMany({
      where: {
        userId: dto.fromUserId,
        isSettled: false,
        expense: { payerId: dto.toUserId, apartmentId }
      },
      include: { expense: true },
      orderBy: { createdAt: 'asc' }
    });

    let remainingToSettle = dto.amount;
    for (const split of pendingSplits) {
      if (remainingToSettle <= 0) break;
      const splitAmt = Number(split.amount);
      if (remainingToSettle >= splitAmt) {
        await this.prisma.expenseSplit.update({ where: { id: split.id }, data: { isSettled: true } });
        remainingToSettle -= splitAmt;
      } else {
        // Partial settlement logic could go here, but for MVP we skip
        break;
      }
    }

    return payment;
  }

  async getPayments(apartmentId: string, clerkUserId?: string) {
    if (apartmentId === 'default' && clerkUserId) {
      const user = await this.prisma.user.findUnique({ where: { clerkUserId }, include: { memberships: true } });
      if (user && user.memberships.length > 0) apartmentId = user.memberships[0].apartmentId;
    }

    // A payment is considered part of the apartment if either the sender or receiver is in it.
    // For simplicity, we just fetch all payments where sender is in the apartment.
    const members = await this.prisma.apartmentMember.findMany({ where: { apartmentId }, select: { userId: true } });
    const userIds = members.map(m => m.userId);

    return this.prisma.payment.findMany({
      where: {
        OR: [
          { senderId: { in: userIds } },
          { receiverId: { in: userIds } }
        ]
      },
      include: {
        sender: { select: { firstName: true, lastName: true, profileImageUrl: true } },
        receiver: { select: { firstName: true, lastName: true, profileImageUrl: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
