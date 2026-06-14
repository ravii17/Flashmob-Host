import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

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
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_eventId: {
          userId: decoded.userId,
          eventId: event.id,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          userId_eventId: {
            userId: decoded.userId,
            eventId: event.id,
          },
        },
      });

      return NextResponse.json({ message: 'Removed from bookmarks', bookmarked: false });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: decoded.userId,
          eventId: event.id,
        },
      });

      return NextResponse.json({ message: 'Added to bookmarks', bookmarked: true });
    }
  } catch (err) {
    console.error('Toggle bookmark error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
