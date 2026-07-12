import { Controller, Get, Post, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { Request } from 'express';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('status')
  @UseGuards(ClerkAuthGuard)
  getStatus(@Req() req: Request) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.billingService.getStatus(clerkUserId);
  }

  @Post('checkout')
  @UseGuards(ClerkAuthGuard)
  createCheckout(@Body('tier') tier: string, @Req() req: Request) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.billingService.createCheckoutSession(clerkUserId, tier);
  }

  @Post('portal')
  @UseGuards(ClerkAuthGuard)
  createPortal(@Req() req: Request) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.billingService.createPortalSession(clerkUserId);
  }

  @Post('webhook')
  handleWebhook(@Headers('stripe-signature') signature: string, @Body() payload: any) {
    return this.billingService.handleWebhook(signature, payload);
  }
}
