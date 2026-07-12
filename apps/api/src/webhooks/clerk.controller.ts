import { Controller, Post, Req, Res, Headers, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Webhook } from 'svix';
import { UsersService } from '../users/users.service';

@Controller('webhooks/clerk')
export class ClerkWebhookController {
  constructor(private usersService: UsersService) {}

  @Post()
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing svix headers');
    }

    const payload = req.body;
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      console.error('CLERK_WEBHOOK_SECRET is not set');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Server configuration error');
    }

    const wh = new Webhook(secret);
    let evt: any;

    try {
      evt = wh.verify(JSON.stringify(payload), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err.message);
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: err.message });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const email = evt.data.email_addresses[0]?.email_address;
      const firstName = evt.data.first_name;
      const lastName = evt.data.last_name;
      const profileImageUrl = evt.data.image_url;

      await this.usersService.upsertUser(id, email, firstName, lastName, profileImageUrl);
    } else if (eventType === 'user.deleted') {
      await this.usersService.deleteUser(id);
    }

    return res.status(HttpStatus.OK).json({ success: true });
  }
}
