import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChoresService, CreateChoreDto } from './chores.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { Request } from 'express';

@Controller('chores')
@UseGuards(ClerkAuthGuard)
export class ChoresController {
  constructor(private readonly choresService: ChoresService) {}

  @Post()
  createChore(@Body() dto: CreateChoreDto, @Req() req: Request) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.choresService.createChore(dto, clerkUserId);
  }

  @Get('leaderboard/:apartmentId')
  getLeaderboard(@Param('apartmentId') apartmentId: string, @Req() req: Request) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.choresService.getLeaderboard(apartmentId, clerkUserId);
  }

  @Get(':apartmentId')
  getChoresByApartment(@Param('apartmentId') apartmentId: string, @Req() req: Request) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.choresService.getChoresByApartment(apartmentId, clerkUserId);
  }

  @Put(':choreId/complete')
  completeChore(@Param('choreId') choreId: string, @Body('isCompleted') isCompleted: boolean) {
    return this.choresService.toggleCompleteChore(choreId, isCompleted);
  }

  @Delete(':choreId')
  deleteChore(@Param('choreId') choreId: string) {
    return this.choresService.deleteChore(choreId);
  }
}
