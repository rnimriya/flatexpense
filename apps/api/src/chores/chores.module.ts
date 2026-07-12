import { Module } from '@nestjs/common';
import { ChoresService } from './chores.service';
import { ChoresController } from './chores.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ChoresService, PrismaService],
  controllers: [ChoresController],
  exports: [ChoresService]
})
export class ChoresModule {}
