import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { signJWT, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google OAuth is not configured on this server.' },
        { status: 500 }
      );
    }

    // Exchange authorization code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('Google OAuth token exchange failed:', errorText);
      return NextResponse.json({ error: 'Failed to exchange Google OAuth token' }, { status: 400 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user details from Google userinfo API
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch user info from Google' }, { status: 400 });
    }

    const googleUser = await userinfoRes.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      return NextResponse.json({ error: 'Google account has no associated email' }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Generate random password hash
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const hashedPassword = await hashPassword(randomPassword);

      // Create new user
      user = await prisma.user.create({
        data: {
          name: name || 'Google User',
          email: email.toLowerCase(),
          password: hashedPassword,
          avatar: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'G')}`,
          role: 'USER',
        },
      });
    } else if (picture && !user.avatar) {
      // Update avatar if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture },
      });
    }

    // Generate session token
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Save token in cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Redirect to profile
    return NextResponse.redirect(new URL('/profile', req.url));
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
  }
}
