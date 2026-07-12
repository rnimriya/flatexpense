import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clerkUserId = request.user?.clerkUserId;

    if (!clerkUserId) {
      throw new UnauthorizedException('Missing authentication');
    }

    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const adminEmailsStr = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());

    if (!adminEmails.includes(user.email.toLowerCase())) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
