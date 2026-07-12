import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2026-06-24.dahlia' as any,
    });
  }

  async getStatus(clerkUserId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkUserId },
        include: { subscription: true }
      });

      if (!user) throw new NotFoundException('User not found');
      
      return user.subscription || { tier: 'FREE', status: 'active' };
    } catch (error) {
      console.warn("DB Connection failed. Returning demo billing status.");
      return { tier: 'PRO', status: 'active', currentPeriodEnd: new Date(Date.now() + 86400000 * 30) };
    }
  }

  async createCheckoutSession(clerkUserId: string, tier: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new NotFoundException('User not found');

    const priceId = tier === 'PRO' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_PREMIUM_PRICE_ID;
    
    // In a real app we'd fetch or create the Stripe Customer first.
    // We'll mock the session URL for development if price IDs aren't set.
    if (!priceId) {
      return { url: `${process.env.NEXT_PUBLIC_API_URL?.replace('4000', '3000')}/dashboard/billing?mock_checkout=success` };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_API_URL?.replace('4000', '3000')}/dashboard/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_URL?.replace('4000', '3000')}/dashboard/billing?canceled=true`,
        client_reference_id: user.id,
      });

      return { url: session.url };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to create checkout session');
    }
  }

  async createPortalSession(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { subscription: true }
    });

    if (!user || !user.subscription?.stripeCustomerId) {
      // Mock portal if no real customer ID
      return { url: `${process.env.NEXT_PUBLIC_API_URL?.replace('4000', '3000')}/dashboard/billing?mock_portal=success` };
    }

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_API_URL?.replace('4000', '3000')}/dashboard/billing`,
      });
      return { url: session.url };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to create portal session');
    }
  }

  async handleWebhook(signature: string, payload: any) {
    // Basic implementation for Phase 13 webhook handling
    // Real validation requires raw body parsing.
    console.log("Stripe Webhook received:", payload.type);
    
    // Switch on event type (checkout.session.completed, etc.) to update Prisma Subscription.
    return { received: true };
  }
}
