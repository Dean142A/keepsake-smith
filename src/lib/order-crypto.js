/**
 * Encryption at rest for order records.
 *
 * Order objects live in the same Bunny storage zone as customer media, and
 * that zone has a public pull zone in front of it so photographs can be
 * fetched by the 3D book. The pull zone served the order JSON just as
 * happily: anyone holding an access code — which is printed on the card, sent
 * in email and carried in the share URL — could read both email addresses,
 * the amount paid and the private letter.
 *
 * Sealing the record means the object on the CDN is ciphertext. The pull zone
 * can serve it to the world and it discloses nothing. A dedicated private
 * zone is still worth having (BUNNY_ORDERS_ZONE_NAME), but this holds even if
 * the storage is misconfigured again later.
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENVELOPE_VERSION = 1;
const KEY_SALT = 'keepsake-orders-at-rest-v1';

let cachedKey = null;

/**
 * The record key. ORDERS_ENCRYPTION_KEY is preferred; without it the key is
 * derived from ADMIN_API_KEY so an existing deployment is protected without
 * having to add a variable first. Production refuses to run on neither,
 * rather than quietly writing plaintext to a public bucket.
 */
function recordKey() {
  if (cachedKey) return cachedKey;

  const explicit = process.env.ORDERS_ENCRYPTION_KEY;
  const derivedFrom = explicit || process.env.ADMIN_API_KEY;

  if (!derivedFrom) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Neither ORDERS_ENCRYPTION_KEY nor ADMIN_API_KEY is set; refusing to store order records.'
      );
    }
    // Development only, and deliberately not a secret.
    cachedKey = crypto.scryptSync('keepsake-development', KEY_SALT, 32);
    return cachedKey;
  }

  cachedKey = crypto.scryptSync(derivedFrom, KEY_SALT, 32);
  return cachedKey;
}

/** True for an object written by seal(), as opposed to a legacy plaintext record. */
export function isSealed(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      value.__sealed === ENVELOPE_VERSION &&
      typeof value.iv === 'string' &&
      typeof value.tag === 'string' &&
      typeof value.ct === 'string'
  );
}

export function seal(record) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, recordKey(), iv);
  const ct = Buffer.concat([
    cipher.update(JSON.stringify(record), 'utf8'),
    cipher.final(),
  ]);

  return {
    __sealed: ENVELOPE_VERSION,
    alg: ALGORITHM,
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ct: ct.toString('base64'),
  };
}

export function open(envelope) {
  if (!isSealed(envelope)) return envelope; // legacy plaintext record

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    recordKey(),
    Buffer.from(envelope.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));

  const plain = Buffer.concat([
    decipher.update(Buffer.from(envelope.ct, 'base64')),
    decipher.final(),
  ]).toString('utf8');

  return JSON.parse(plain);
}
