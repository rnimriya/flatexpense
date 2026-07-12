import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PaymentsService, CreatePaymentSessionDto } from './payments.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { Request } from 'express';

@Controller('payments')
@UseGuards(ClerkAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  createCheckoutSession(@Body() dto: CreatePaymentSessionDto) {
    return this.paymentsService.createCheckoutSession(dto);
  }

  @Post()
  recordPayment(@Body() dto: CreatePaymentSessionDto, @Req() req: Request) {
    dto.clerkUserId = (req as any).user?.clerkUserId;
    return this.paymentsService.recordPayment(dto);
  }

  @Get(':apartmentId')
  getPayments(@Param('apartmentId') apartmentId: string, @Req() req: Request) {
    const clerkUserId = (req as any).user?.clerkUserId;
    return this.paymentsService.getPayments(apartmentId, clerkUserId);
  }
}
