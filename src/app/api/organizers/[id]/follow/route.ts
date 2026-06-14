import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const organizerId = params.id;
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (decoded.userId === organizerId) {
      return NextResponse.json({ error: 'You cannot follow yourself.' }, { status: 400 });
    }

    const organizer = await prisma.user.findUnique({
      where: { id: organizerId },
      select: { name: true },
    });

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: decoded.userId,
          followingId: organizerId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
      return NextResponse.json({ followed: false, message: `Unfollowed ${organizer.name}` });
    } else {
      await prisma.follow.create({
        data: {
          followerId: decoded.userId,
          followingId: organizerId,
        },
      });

      // Notify organizer
      await createNotification({
        userId: organizerId,
        title: 'New Follower! 👤',
        message: `${decoded.name} is now following you.`,
        type: 'FOLLOW',
      });

      return NextResponse.json({ followed: true, message: `Followed ${organizer.name}` });
    }
  } catch (err) {
    console.error('Toggle follow error:', err);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}
