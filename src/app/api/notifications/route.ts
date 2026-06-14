import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const onlyUnread = searchParams.get('unread') === 'true';

    const where: any = { userId: decoded.userId };
    if (onlyUnread) {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id } = body;

    if (id) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id,
          userId: decoded.userId,
        },
        data: {
          read: true,
        },
      });
    } else {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: decoded.userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
    }

    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Update notifications error:', err);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
