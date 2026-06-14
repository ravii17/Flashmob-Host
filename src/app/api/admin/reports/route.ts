import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            city: true,
            deletedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ reports });
  } catch (err) {
    console.error('Admin fetch reports error:', err);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const { reportId, status } = await req.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json({ message: 'Report updated successfully', report: updatedReport });
  } catch (err) {
    console.error('Admin update report error:', err);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
