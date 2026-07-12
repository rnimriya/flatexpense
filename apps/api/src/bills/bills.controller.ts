import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BillsService, CreateBillDto } from './bills.service';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  createBill(@Body() dto: CreateBillDto) {
    return this.billsService.createBill(dto);
  }

  @Get(':apartmentId')
  getUpcomingBills(@Param('apartmentId') apartmentId: string) {
    return this.billsService.getUpcomingBills(apartmentId);
  }
}
