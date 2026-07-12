import { Controller, Post, Body, Get, UseGuards, Req, Param, Delete, Put } from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('apartments')
@UseGuards(ClerkAuthGuard)
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Post()
  async create(
    @Body('name') name: string,
    @Body('description') description: string,
    @Req() req: Request,
  ) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.apartmentsService.create(name, description, clerkUserId);
  }

  @Get()
  async getMyApartments(@Req() req: Request) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.apartmentsService.findByUserId(clerkUserId);
  }

  @Post(':id/invites')
  async generateInvite(
    @Param('id') apartmentId: string,
    @Body('email') email: string,
    @Req() req: Request,
  ) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.apartmentsService.generateInvite(apartmentId, clerkUserId, email);
  }

  @Post('/invites/:token/accept')
  async acceptInvite(
    @Param('token') token: string,
    @Req() req: Request,
  ) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.apartmentsService.acceptInvite(token, clerkUserId);
  }

  @Delete(':id/members/:userId')
  async leaveApartment(
    @Param('id') apartmentId: string,
    @Param('userId') targetUserId: string,
    @Req() req: Request,
  ) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.apartmentsService.leaveApartment(apartmentId, targetUserId, clerkUserId);
  }

  @Put(':id/transfer-ownership/:userId')
  async transferOwnership(
    @Param('id') apartmentId: string,
    @Param('userId') newOwnerId: string,
    @Req() req: Request,
  ) {
    const clerkUserId = (req as any).user.clerkUserId;
    return this.apartmentsService.transferOwnership(apartmentId, newOwnerId, clerkUserId);
  }
}
