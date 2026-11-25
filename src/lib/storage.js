/**
 * Object storage for customer media (page photos, voice notes).
 *
 * Files MUST NOT live on the container filesystem: Bunny Magic Containers
 * replaces the container on every rolling update, so anything written to
 * public/uploads is destroyed on the next deploy, and with 1-5 instances per
 * region an upload would only exist on whichever instance served it.
 *
 * Primary path: Bunny Storage, served over the CDN hostname.
 * Fallback path: local public/uploads, used only when Bunny credentials are
 * absent (i.e. local development) so the app still runs without secrets.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;
const KEY = process.env.BUNNY_STORAGE_API_KEY;
const REGION = (process.env.BUNNY_STORAGE_REGION || 'de').toLowerCase();
const CDN_HOST = process.env.BUNNY_CDN_HOSTNAME;

/** Bunny's Falkenstein region has no hostname prefix; every other region does. */
function storageHost() {
  return REGION === 'de' || REGION === ''
    ? 'storage.bunnycdn.com'
    : `${REGION}.storage.bunnycdn.com`;
}

export function isRemoteStorageConfigured() {
  return Boolean(ZONE && KEY && CDN_HOST);
}

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/ogg': '.ogg',
  'audio/webm': '.webm',
};

export const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
export const ALLOWED_AUDIO_EXT = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.webm']);

/** Derive a safe extension from the filename, falling back to the MIME type. */
export function resolveExtension(filename, mimeType) {
  const fromName = path.extname(filename || '').toLowerCase();
  if (fromName) return fromName === '.jpeg' ? '.jpg' : fromName;
  return EXT_BY_MIME[(mimeType || '').toLowerCase()] || '';
}

/**
 * Build a collision-proof object key. Scoped per order so an order's media can
 * be listed or removed as a unit.
 */
export function buildObjectKey({ orderId, kind, originalName, ext }) {
  const stem = path
    .basename(originalName || 'file', path.extname(originalName || ''))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 48) || 'file';
  const unique = crypto.randomBytes(6).toString('hex');
  const scope = (orderId || 'unassigned').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `orders/${scope}/${kind}/${Date.now()}-${unique}-${stem}${ext}`;
}

/**
 * Persist a buffer and return its public URL.
 * Throws on a failed remote upload rather than silently falling back, so a
 * misconfigured production deploy surfaces instead of writing to a disk that
 * is about to be discarded.
 */
export async function putObject({ key, buffer, contentType }) {
  if (isRemoteStorageConfigured()) {
    const url = `https://${storageHost()}/${ZONE}/${key}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: KEY,
        'Content-Type': contentType || 'application/octet-stream',
      },
      body: buffer,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(
        `Bunny Storage upload failed (${res.status} ${res.statusText}) for ${key}. ${detail}`.trim()
      );
    }

    return { url: `https://${CDN_HOST}/${key}`, storage: 'bunny', key };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Object storage is not configured. Set BUNNY_STORAGE_ZONE_NAME, ' +
        'BUNNY_STORAGE_API_KEY and BUNNY_CDN_HOSTNAME. Refusing to write ' +
        'customer media to the container filesystem, which is wiped on deploy.'
    );
  }

  // Development only.
  const localPath = path.join(process.cwd(), 'public', 'uploads', key);
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, buffer);
  return { url: `/uploads/${key}`, storage: 'local', key };
}

export async function deleteObject(key) {
  if (!isRemoteStorageConfigured()) {
    const localPath = path.join(process.cwd(), 'public', 'uploads', key);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    return { success: true, storage: 'local' };
  }

  const res = await fetch(`https://${storageHost()}/${ZONE}/${key}`, {
    method: 'DELETE',
    headers: { AccessKey: KEY },
  });
  return { success: res.ok, storage: 'bunny' };
}

/**
 * The object key behind one of our public media URLs, or null if the URL
 * points somewhere else. Used when an order is deleted, so its photographs
 * and recordings go with it rather than lingering in the bucket.
 */
export function objectKeyFromUrl(value) {
  const host = process.env.BUNNY_CDN_HOSTNAME;
  if (!host || !value || typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    if (parsed.hostname.toLowerCase() !== host.toLowerCase()) return null;
    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    // Never let a crafted URL walk out of the orders prefix.
    if (!key.startsWith('orders/') || key.includes('..')) return null;
    return key;
  } catch {
    return null;
  }
}
