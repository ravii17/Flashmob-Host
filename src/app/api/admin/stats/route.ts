import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const [
      totalUsers,
      totalEvents,
      pendingReports,
      totalViews,
      categoryCounts,
      recentViews,
    ] = await Promise.all([
      // Total active users
      prisma.user.count({ where: { deletedAt: null } }),
      // Total active events
      prisma.event.count({ where: { deletedAt: null } }),
      // Pending moderation reports
      prisma.report.count({ where: { status: 'PENDING' } }),
      // Total event detail page views
      prisma.eventView.count(),
      // Category aggregation
      prisma.event.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
        where: {
          deletedAt: null,
        },
      }),
      // Last 7 days views for growth chart (mock or real dates group)
      prisma.eventView.findMany({
        take: 100,
        orderBy: { viewedAt: 'desc' },
        select: { viewedAt: true },
      }),
    ]);

    // Format category stats
    const categoriesStats = categoryCounts.map((group) => ({
      name: group.category,
      value: group._count.id,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalEvents,
        pendingReports,
        totalViews,
      },
      categoriesStats,
      recentViews,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
