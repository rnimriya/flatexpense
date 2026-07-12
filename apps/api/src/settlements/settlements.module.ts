import { Module } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { SettlementsController } from './settlements.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SettlementsService, PrismaService],
  controllers: [SettlementsController],
  exports: [SettlementsService]
})
export class SettlementsModule {}
