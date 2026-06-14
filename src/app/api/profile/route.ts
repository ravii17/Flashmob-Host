import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        instagram: true,
        createdAt: true,
        // Events organized
        events: {
          include: {
            participants: {
              select: {
                userId: true,
                user: {
                  select: {
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
        // Events joined
        participants: {
          include: {
            event: {
              include: {
                participants: {
                  select: {
                    userId: true,
                    user: {
                      select: {
                        name: true,
                        avatar: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    participants: true,
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        // Bookmarked events
        bookmarks: {
          include: {
            event: {
              include: {
                participants: {
                  select: {
                    userId: true,
                    user: {
                      select: {
                        name: true,
                        avatar: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    participants: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { name, avatar, instagram } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name,
        avatar: avatar || undefined,
        instagram: instagram !== undefined ? (instagram || null) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        instagram: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
