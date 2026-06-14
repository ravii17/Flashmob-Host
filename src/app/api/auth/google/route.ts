import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  if (!clientId) {
    console.error('Google Client ID is missing in environment variables');
    // If not configured, return warning and guidelines
    return NextResponse.json(
      {
        error: 'Google OAuth not configured.',
        suggestion: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.',
      },
      { status: 400 }
    );
  }

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&access_type=offline` +
    `&prompt=consent`;

  return NextResponse.redirect(googleAuthUrl);
}
