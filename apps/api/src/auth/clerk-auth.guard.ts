import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    
    // For development, we allow passing x-clerk-user-id directly if no Bearer token is provided
    // This is temporary to ensure our app works while we setup Clerk integration
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const clerkUserId = request.headers['x-clerk-user-id'];
      if (clerkUserId && process.env.NODE_ENV !== 'production') {
        (request as any).user = { clerkUserId };
        return true;
      }
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      (request as any).user = { clerkUserId: decoded.sub };
      return true;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
