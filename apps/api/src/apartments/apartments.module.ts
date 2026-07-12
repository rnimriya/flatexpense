import { Module } from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { ApartmentsController } from './apartments.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ApartmentsService, PrismaService],
  controllers: [ApartmentsController],
})
export class ApartmentsModule {}
