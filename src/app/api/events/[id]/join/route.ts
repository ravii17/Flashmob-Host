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

    // Wrap the operations in a transaction to prevent race conditions during join/leave and promotion
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          title: true,
          maxParticipants: true,
          organizerId: true,
        },
      });

      if (!event) {
        throw new Error('EVENT_NOT_FOUND');
      }

      // Organizers cannot leave/join their own event in this way
      if (event.organizerId === decoded.userId) {
        throw new Error('ORGANIZER_CANNOT_LEAVE');
      }

      // Check if user is already registered
      const existingParticipant = await tx.participant.findUnique({
        where: {
          userId_eventId: {
            userId: decoded.userId,
            eventId: event.id,
          },
        },
      });

      if (existingParticipant) {
        // Leave the event
        await tx.participant.delete({
          where: {
            id: existingParticipant.id,
          },
        });

        // If the leaving user was JOINED and the event has a limit, promote the oldest waitlisted user
        let promotedUser = null;
        if (existingParticipant.status === 'JOINED' && event.maxParticipants > 0) {
          const oldestWaitlisted = await tx.participant.findFirst({
            where: {
              eventId: event.id,
              status: 'WAITLIST',
            },
            orderBy: {
              joinedAt: 'asc',
            },
          });

          if (oldestWaitlisted) {
            promotedUser = await tx.participant.update({
              where: {
                id: oldestWaitlisted.id,
              },
              data: {
                status: 'JOINED',
              },
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            });
          }
        }

        return {
          action: 'LEAVE',
          eventTitle: event.title,
          wasJoined: existingParticipant.status === 'JOINED',
          promotedUser,
        };
      } else {
        // Join the event
        // Calculate current JOINED count
        const joinedCount = await tx.participant.count({
          where: {
            eventId: event.id,
            status: 'JOINED',
          },
        });

        const isFull = event.maxParticipants > 0 && joinedCount >= event.maxParticipants;
        const status = isFull ? 'WAITLIST' : 'JOINED';

        const newParticipant = await tx.participant.create({
          data: {
            userId: decoded.userId,
            eventId: event.id,
            status,
          },
        });

        return {
          action: 'JOIN',
          eventTitle: event.title,
          status,
          organizerId: event.organizerId,
        };
      }
    });

    // Send async notifications outside the transaction to keep it fast
    if (result.action === 'LEAVE') {
      if (result.promotedUser) {
        await createNotification({
          userId: String(result.promotedUser.userId),
          title: 'Off the Waitlist! 🎉',
          message: `You've been promoted to JOINED for "${result.eventTitle}"!`,
          type: 'WAITLIST',
        });
      }
      return NextResponse.json({
        message: 'Left the flashmob successfully',
        joined: false,
        status: 'NONE',
      });
    } else {
      // JOIN action
      if (result.status === 'WAITLIST') {
        await createNotification({
          userId: decoded.userId,
          title: 'Added to Waitlist ⏳',
          message: `You are on the waitlist for "${result.eventTitle}". We will notify you if a slot opens up!`,
          type: 'WAITLIST',
        });
        return NextResponse.json({
          message: 'Added to waitlist successfully',
          joined: true,
          status: 'WAITLIST',
        });
      } else {
        // JOINED status
        if (result.organizerId !== decoded.userId) {
          await createNotification({
            userId: result.organizerId as string,
            title: 'New Participant Joined! ⚡',
            message: `${decoded.name} has joined your flashmob "${result.eventTitle}".`,
            type: 'JOIN',
          });
        }
        return NextResponse.json({
          message: 'Joined the flashmob successfully',
          joined: true,
          status: 'JOINED',
        });
      }
    }
  } catch (err: any) {
    if (err.message === 'EVENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    if (err.message === 'ORGANIZER_CANNOT_LEAVE') {
      return NextResponse.json({ error: 'As the organizer, you cannot leave your own event.' }, { status: 400 });
    }
    console.error('Toggle join error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
