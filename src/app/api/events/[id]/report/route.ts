import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { reportCreateSchema } from '@/lib/validation';

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

    const eventExists = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!eventExists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await req.json();
    const result = reportCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { reason, description } = result.data;

    const report = await prisma.report.create({
      data: {
        reason,
        description,
        userId: decoded.userId,
        eventId: params.id,
      },
    });

    return NextResponse.json({ message: 'Report submitted successfully. A moderator will review it shortly.', report }, { status: 201 });
  } catch (err) {
    console.error('Create report error:', err);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
