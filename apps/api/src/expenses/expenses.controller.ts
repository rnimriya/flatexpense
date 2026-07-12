import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards, Req } from '@nestjs/common';
import { ExpensesService, CreateExpenseDto } from './expenses.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { Request } from 'express';

@Controller('expenses')
@UseGuards(ClerkAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('summary/:apartmentId')
  getDashboardSummary(@Param('apartmentId') apartmentId: string) {
    return this.expensesService.getDashboardSummary(apartmentId);
  }

  @Post()
  createExpense(@Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(dto);
  }

  @Get(':apartmentId')
  getExpenses(
    @Param('apartmentId') apartmentId: string,
    @Req() req: Request,
    @Query('categoryId') categoryId?: string,
    @Query('payerId') payerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const clerkUserId = (req as any).user?.clerkUserId;
    return this.expensesService.getExpensesByApartment(apartmentId, clerkUserId, { categoryId, payerId, startDate, endDate });
  }

  @Get('detail/:id')
  getExpenseById(@Param('id') id: string) {
    return this.expensesService.getExpenseById(id);
  }

  @Delete(':id')
  deleteExpense(@Param('id') id: string) {
    return this.expensesService.deleteExpense(id);
  }

  @Post('bulk-delete')
  bulkDelete(@Body('ids') ids: string[]) {
    return this.expensesService.bulkDelete(ids);
  }

  @Get('export/:apartmentId')
  exportExpenses(@Param('apartmentId') apartmentId: string, @Req() req: Request) {
    const clerkUserId = (req as any).user?.clerkUserId;
    return this.expensesService.exportExpensesAsCsv(apartmentId, clerkUserId);
  }

  @Get('roommates/:apartmentId')
  getRoommates(@Param('apartmentId') apartmentId: string, @Req() req: Request) {
    const clerkUserId = (req as any).user?.clerkUserId;
    return this.expensesService.getRoommates(apartmentId, clerkUserId);
  }
}
