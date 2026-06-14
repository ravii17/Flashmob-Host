import { EventEmitter } from 'events';
import { prisma } from './prisma';

class NotificationEmitter extends EventEmitter {}

// Use a global variable to preserve the emitter during Next.js hot-reloads in development
const globalForNotifications = global as unknown as { notificationEmitter: NotificationEmitter };

export const notificationEmitter =
  globalForNotifications.notificationEmitter || new NotificationEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForNotifications.notificationEmitter = notificationEmitter;
}

export async function createNotification({
  userId,
  title,
  message,
  type = 'INFO',
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });

  // Emit the notification payload to any active SSE streams for this user
  notificationEmitter.emit(`notification:${userId}`, notification);
  
  return notification;
}
