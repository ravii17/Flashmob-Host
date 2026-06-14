import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { eventCreateSchema } from '@/lib/validation';

// Helper: Haversine distance calculation in kilometers
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Pagination params
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    // Filters
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const dateParam = searchParams.get('date'); // 'today', 'tomorrow', 'week'
    const type = searchParams.get('type') || 'upcoming'; // 'upcoming', 'popular', or 'nearby'
    const search = searchParams.get('search'); // text search

    // Coordinates for proximity sorting
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    // Build query
    const where: any = {
      deletedAt: null, // Exclude soft-deleted records
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const now = new Date();

    if (dateParam === 'today') {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      where.date = {
        gte: now,
        lte: endOfToday,
      };
    } else if (dateParam === 'tomorrow') {
      const startOfTomorrow = new Date();
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      startOfTomorrow.setHours(0, 0, 0, 0);
      const endOfTomorrow = new Date(startOfTomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);
      where.date = {
        gte: startOfTomorrow,
        lte: endOfTomorrow,
      };
    } else if (dateParam === 'week') {
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      where.date = {
        gte: now,
        lte: endOfWeek,
      };
    } else if (type === 'upcoming' || type === 'nearby') {
      where.date = {
        gte: now,
      };
    }

    // Default sorting in DB: soonest first
    const orderBy: any = { date: 'asc' };

    // Fetch base items from DB
    // If nearby sorting or popular in-memory sorting is needed, we fetch all matched and slice in memory.
    const isNearbyQuery = type === 'nearby' && latParam && lngParam;
    const isPopularQuery = type === 'popular';

    const dbQueryOptions: any = {
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        participants: {
          where: { status: 'JOINED' },
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
        bookmarks: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            participants: {
              where: { status: 'JOINED' },
            },
          },
        },
      },
    };

    if (!isNearbyQuery && !isPopularQuery) {
      // Direct DB pagination
      dbQueryOptions.orderBy = orderBy;
      dbQueryOptions.take = limit;
      dbQueryOptions.skip = offset;
    }

    const rawEvents = await prisma.event.findMany(dbQueryOptions) as any[];

    let finalEvents = rawEvents.map((evt) => {
      return Object.assign(evt, { distance: null as number | null });
    });

    // Perform proximity distance calculations if user coords are provided
    if (isNearbyQuery) {
      const uLat = parseFloat(latParam!);
      const uLng = parseFloat(lngParam!);
      
      finalEvents = finalEvents.map((evt) => {
        let distance: number | null = null;
        if (evt.latitude !== null && evt.longitude !== null) {
          distance = haversineDistance(uLat, uLng, evt.latitude, evt.longitude);
        }
        return Object.assign(evt, { distance });
      });

      // Sort: closest first, and push items without coordinates to the end
      finalEvents.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

      // Slice in memory for pagination
      finalEvents = finalEvents.slice(offset, offset + limit);
    } else if (isPopularQuery) {
      // Sort: popular (joined participants count) descending
      finalEvents.sort((a, b) => b._count.participants - a._count.participants);
      
      // Slice in memory for pagination
      finalEvents = finalEvents.slice(offset, offset + limit);
    }

    // Get the total count of matched events for pagination controls
    const totalCount = await prisma.event.count({ where });

    return NextResponse.json({
      events: finalEvents,
      page,
      limit,
      totalCount,
      hasMore: offset + finalEvents.length < totalCount,
    });
  } catch (err) {
    console.error('Fetch events error:', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const result = eventCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      title,
      description,
      category,
      date,
      location,
      city,
      maxParticipants,
      image,
      organizerContact,
    } = result.data;

    // Optional coordinate fields parsed from raw body
    const latitude = body.latitude ? parseFloat(body.latitude) : null;
    const longitude = body.longitude ? parseFloat(body.longitude) : null;

    const eventDate = new Date(date);

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        date: eventDate,
        location,
        city,
        maxParticipants,
        latitude,
        longitude,
        image: image || null,
        organizerContact,
        organizerId: decoded.userId,
        // Auto-join organizer as first participant
        participants: {
          create: {
            userId: decoded.userId,
            status: 'JOINED',
          },
        },
      },
    });

    return NextResponse.json({ message: 'Event created successfully', event }, { status: 201 });
  } catch (err) {
    console.error('Create event error:', err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
