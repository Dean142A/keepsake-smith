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

let cachedKeys = null;

function deriveKey(secret) {
  return crypto.scryptSync(secret, KEY_SALT, 32);
}

/**
 * Keys this process will try, newest first.
 *
 * The first is what new records are sealed with. The rest exist so a key can
 * be rotated without orphaning everything already written: a record sealed
 * with an older key still opens, and seals with the current one the next time
 * it is saved. Without this, setting ORDERS_ENCRYPTION_KEY on a deployment
 * that had been deriving its key from ADMIN_API_KEY would make every existing
 * order unreadable.
 */
function recordKeys() {
  if (cachedKeys) return cachedKeys;

  const secrets = [
    process.env.ORDERS_ENCRYPTION_KEY,
    process.env.ORDERS_ENCRYPTION_KEY_PREVIOUS,
    process.env.ADMIN_API_KEY,
  ].filter((v) => v && v.trim());

  if (secrets.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Neither ORDERS_ENCRYPTION_KEY nor ADMIN_API_KEY is set; refusing to store order records.'
      );
    }
    // Development only, and deliberately not a secret.
    cachedKeys = [deriveKey('keepsake-development')];
    return cachedKeys;
  }

  // De-duplicate so the same secret in two variables is not tried twice.
  cachedKeys = [...new Set(secrets.map((v) => v.trim()))].map(deriveKey);
  return cachedKeys;
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
  const cipher = crypto.createCipheriv(ALGORITHM, recordKeys()[0], iv);
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

  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  const ct = Buffer.from(envelope.ct, 'base64');

  let lastError = null;
  for (const key of recordKeys()) {
    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      const plain = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
      return JSON.parse(plain);
    } catch (err) {
      // GCM rejects the wrong key outright, so this is how a record sealed
      // under a previous key is recognised. Try the next one.
      lastError = err;
    }
  }

  throw new Error(
    'Could not open an order record with any configured key. ' +
      'If ORDERS_ENCRYPTION_KEY was changed, set the old value as ' +
      'ORDERS_ENCRYPTION_KEY_PREVIOUS until every record has been re-saved.',
    { cause: lastError }
  );
}
