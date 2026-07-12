import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { Request } from 'express';

@Controller('ai')
@UseGuards(ClerkAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('context')
  async getContext(@Req() req: Request) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.aiService.getContext(clerkUserId);
  }
}
