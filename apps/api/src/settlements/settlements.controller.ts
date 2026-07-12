import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { Request } from 'express';

@Controller('settlements')
@UseGuards(ClerkAuthGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get(':apartmentId')
  getBalances(@Param('apartmentId') apartmentId: string, @Req() req: Request) {
    const clerkUserId = (req as any).user?.clerkUserId;
    return this.settlementsService.calculateBalances(apartmentId, clerkUserId);
  }
}
