import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout API error:', err);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
