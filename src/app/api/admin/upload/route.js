import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateAdminRequest } from '@/lib/auth';

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.wav']);

export async function POST(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'No file provided.' },
        { status: 400 }
      );
    }

    const ext = (path.extname(file.name) || '.jpg').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: `Invalid file extension "${ext}". Allowed types: PNG, JPG, WEBP, GIF, SVG, MP3, WAV.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to process.cwd()/public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFilename = `${Date.now()}-${cleanName}${ext}`;

    const filePath = path.join(uploadsDir, safeFilename);

    fs.writeFileSync(filePath, buffer);

    // Also generate base64 data URL for fallback/instant rendering
    const mimeType = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const publicUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      dataUrl: dataUrl,
      filename: safeFilename
    });
  } catch (err) {
    console.error('Image upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
