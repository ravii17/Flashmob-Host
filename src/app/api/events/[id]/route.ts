import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const decoded = await getAuthUser();
    
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            instagram: true,
            _count: {
              select: {
                followers: true,
              },
            },
          },
        },
        participants: {
          select: {
            userId: true,
            status: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        bookmarks: {
          select: {
            userId: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            participants: {
              where: { status: 'JOINED' }
            },
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!event || event.deletedAt) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Determine user interaction flags
    const hasBookmarked = decoded
      ? event.bookmarks.some((b) => b.userId === decoded.userId)
      : false;
      
    const hasLiked = decoded
      ? event.likes.some((l) => l.userId === decoded.userId)
      : false;

    const userParticipant = decoded
      ? event.participants.find((p) => p.userId === decoded.userId)
      : null;
    const joinStatus = userParticipant ? userParticipant.status : 'NONE';

    let isFollowingOrganizer = false;
    if (decoded) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: decoded.userId,
            followingId: event.organizerId,
          },
        },
      });
      isFollowingOrganizer = !!follow;
    }

    // Register event page view (asynchronous and non-blocking)
    try {
      await prisma.eventView.create({
        data: {
          eventId: event.id,
          userId: decoded?.userId || null,
        },
      });
    } catch (viewErr) {
      console.error('Failed to log event view:', viewErr);
    }

    return NextResponse.json({
      event,
      hasBookmarked,
      hasLiked,
      joinStatus,
      isFollowingOrganizer,
    });
  } catch (err) {
    console.error('Fetch event details error:', err);
    return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event || event.deletedAt) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Admins or organizers can update events
    if (event.organizerId !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. You are not authorized.' }, { status: 403 });
    }

    const {
      title,
      description,
      category,
      date,
      location,
      city,
      maxParticipants,
      latitude,
      longitude,
      image,
      organizerContact,
      status,
    } = await req.json();

    if (!title || !description || !category || !date || !location || !city || !organizerContact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const maxParts = parseInt(maxParticipants, 10);

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        date: eventDate,
        location,
        city,
        maxParticipants: isNaN(maxParts) ? 0 : maxParts,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        image: image || null,
        organizerContact,
        status: status || event.status,
      },
    });

    return NextResponse.json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (err) {
    console.error('Update event error:', err);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event || event.deletedAt) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Admins or organizers can delete events
    if (event.organizerId !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. You are not authorized.' }, { status: 403 });
    }

    // Soft delete the event
    await prisma.event.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
