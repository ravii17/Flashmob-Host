import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword, signJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, instagram } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Initial avatar generator
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar,
        instagram: instagram || null,
      },
    });

    // Create JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Set HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          instagram: user.instagram,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
