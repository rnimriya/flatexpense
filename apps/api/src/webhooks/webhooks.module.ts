import { Module } from '@nestjs/common';
import { ClerkWebhookController } from './clerk.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ClerkWebhookController],
})
export class WebhooksModule {}
