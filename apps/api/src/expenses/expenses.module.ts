import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ScannerController } from './scanner.controller';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ExpensesController, ScannerController],
  providers: [ExpensesService, PrismaService]
})
export class ExpensesModule {}
