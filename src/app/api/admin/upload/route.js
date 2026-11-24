import { NextResponse } from 'next/server';
import { validateAdminRequest } from '@/lib/auth';
import {
  putObject,
  buildObjectKey,
  resolveExtension,
  isRemoteStorageConfigured,
  ALLOWED_IMAGE_EXT,
  ALLOWED_AUDIO_EXT,
} from '@/lib/storage';

const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB
const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB

function classify(ext) {
  if (ALLOWED_IMAGE_EXT.has(ext)) return 'image';
  if (ALLOWED_AUDIO_EXT.has(ext)) return 'audio';
  return null;
}

/**
 * Accepts one or many files in a single request.
 *
 * Field names: `file` / `files` (repeatable). `orderId` scopes the object key
 * so an order's media groups together in the storage zone. `kind` may be
 * passed to force a bucket ("pages" | "voice" | "music"); otherwise it is
 * inferred from the file type.
 */
export async function POST(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const formData = await request.formData();
    const orderId = formData.get('orderId') || 'unassigned';
    const forcedKind = formData.get('kind') || null;

    const candidates = [...formData.getAll('files'), ...formData.getAll('file')].filter(
      (f) => f && typeof f !== 'string'
    );

    if (candidates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No file provided.' },
        { status: 400 }
      );
    }

    const uploaded = [];
    const rejected = [];

    for (const file of candidates) {
      const ext = resolveExtension(file.name, file.type);
      const type = classify(ext);

      if (!type) {
        rejected.push({
          name: file.name,
          error: `Unsupported file type "${ext || file.type || 'unknown'}". Images: JPG, PNG, WEBP, GIF. Audio: MP3, WAV, M4A, OGG.`,
        });
        continue;
      }

      const limit = type === 'image' ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES;
      if (file.size > limit) {
        rejected.push({
          name: file.name,
          error: `${(file.size / 1048576).toFixed(1)} MB exceeds the ${limit / 1048576} MB limit for ${type} files.`,
        });
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const kind = forcedKind || (type === 'image' ? 'pages' : 'voice');
      const key = buildObjectKey({ orderId, kind, originalName: file.name, ext });

      const stored = await putObject({
        key,
        buffer,
        contentType: file.type || (type === 'image' ? 'image/jpeg' : 'audio/mpeg'),
      });

      uploaded.push({
        url: stored.url,
        key: stored.key,
        storage: stored.storage,
        type,
        name: file.name,
        size: file.size,
      });
    }

    if (uploaded.length === 0) {
      return NextResponse.json(
        { success: false, error: rejected[0]?.error || 'No files could be uploaded.', rejected },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploaded,
      rejected,
      remoteStorage: isRemoteStorageConfigured(),
      // Single-file convenience, kept so older callers keep working.
      url: uploaded[0].url,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
