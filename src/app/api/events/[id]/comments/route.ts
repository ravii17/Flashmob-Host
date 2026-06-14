import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { commentCreateSchema } from '@/lib/validation';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { eventId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ comments });
  } catch (err) {
    console.error('Fetch comments error:', err);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

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

    const body = await req.json();
    const result = commentCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { content } = result.data;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { organizerId: true, title: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: decoded.userId,
        eventId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Notify organizer (only if commenter is not the organizer themselves)
    if (event.organizerId !== decoded.userId) {
      const { createNotification } = await import('@/lib/notifications');
      await createNotification({
        userId: event.organizerId,
        title: 'New Comment',
        message: `${decoded.name} commented on "${event.title}": "${content.slice(0, 30)}${content.length > 30 ? '...' : ''}"`,
        type: 'COMMENT',
      });
    }

    return NextResponse.json({ comment });
  } catch (err) {
    console.error('Create comment error:', err);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
