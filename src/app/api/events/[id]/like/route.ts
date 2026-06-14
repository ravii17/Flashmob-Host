import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { title: true, organizerId: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_eventId: {
          userId: decoded.userId,
          eventId: params.id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ liked: false, message: 'Unliked event' });
    } else {
      await prisma.like.create({
        data: {
          userId: decoded.userId,
          eventId: params.id,
        },
      });

      // Notify organizer (only if liker is not the organizer themselves)
      if (event.organizerId !== decoded.userId) {
        await createNotification({
          userId: event.organizerId,
          title: 'New Like! ❤️',
          message: `${decoded.name} liked your event "${event.title}".`,
          type: 'LIKE',
        });
      }

      return NextResponse.json({ liked: true, message: 'Liked event' });
    }
  } catch (err) {
    console.error('Toggle like error:', err);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
