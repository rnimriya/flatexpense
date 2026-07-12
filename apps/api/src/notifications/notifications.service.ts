import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getRecentNotifications(userId: string) {
    // 1. (Future) Query the actual Notification table for the user
    // Returning mock data for UI scaffolding
    return [
      { id: 1, title: 'New Chore Assigned', message: 'Alex assigned you: Take out the trash', time: '2 mins ago', isRead: false },
      { id: 2, title: 'Expense Added', message: 'Sarah added a new expense: Groceries ($154.20)', time: '1 hour ago', isRead: false },
      { id: 3, title: 'Bill Due Soon', message: 'Internet (Comcast) is due tomorrow', time: '5 hours ago', isRead: true },
    ];
  }

  async sendPushNotification(userId: string, title: string, message: string) {
    // 1. (Future) Fetch user's push token from DB
    // 2. (Future) Send via Firebase Admin SDK or Resend (email)
    console.log(`[Mock Push] To: ${userId} | ${title}: ${message}`);
    return true;
  }
}
