import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { notificationEmitter } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  const decoded = await getAuthUser();
  if (!decoded) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = decoded.userId;

  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  };

  const stream = new ReadableStream({
    start(controller) {
      // Send connection confirmation
      controller.enqueue('data: {"type": "connected"}\n\n');

      const onNotification = (notification: any) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`);
        } catch (err) {
          // If controller is closed/inactive
          notificationEmitter.off(`notification:${userId}`, onNotification);
        }
      };

      // Bind to user-specific events
      notificationEmitter.on(`notification:${userId}`, onNotification);

      // Heartbeat every 15s to keep the stream alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(': heartbeat\n\n');
        } catch (err) {
          clearInterval(interval);
          notificationEmitter.off(`notification:${userId}`, onNotification);
        }
      }, 15000);

      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        notificationEmitter.off(`notification:${userId}`, onNotification);
      });
    },
  });

  return new Response(stream, { headers: responseHeaders });
}
