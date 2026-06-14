import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Validate type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' }, { status: 400 });
    }

    // Read bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save path config
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure uploads directory exists
    await mkdir(uploadDir, { recursive: true });

    // Clean name prefix
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${Date.now()}_${safeName}`;
    const filePath = join(uploadDir, filename);

    // Write file
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error('File upload API error:', err);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
