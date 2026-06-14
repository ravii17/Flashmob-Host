import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        instagram: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Admin fetch users error:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (userId === decoded.userId) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Admin update user error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    if (userId === decoded.userId) {
      return NextResponse.json({ error: 'You cannot delete yourself' }, { status: 400 });
    }

    // Soft delete the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'User suspended successfully' });
  } catch (err) {
    console.error('Admin suspend user error:', err);
    return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 });
  }
}
