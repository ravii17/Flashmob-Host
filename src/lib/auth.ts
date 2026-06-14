import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'flashmob_connect_secret_key_2026_super_secure';
const JWT_SECRET = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: { userId: string; email: string; name: string; role: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<{ userId: string; email: string; name: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; name: string; role: string };
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(): Promise<{ userId: string; email: string; name: string; role: string } | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return await verifyJWT(token);
  } catch {
    return null;
  }
}

