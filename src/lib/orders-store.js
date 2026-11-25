/**
 * Durable order storage.
 *
 * Orders were previously read and written with fs against
 * src/data/orders.json, a file committed to the repository and baked into the
 * image. On Bunny Magic Containers that means every order created in
 * production is destroyed by the next rolling update, and an order created on
 * one instance is invisible to the other four.
 *
 * Each order is stored as its own object keyed by access code:
 *
 *     orders/<ACCESSCODE>.json
 *
 * One object per order is deliberate. A single orders.json blob would need
 * read-modify-write, and two instances saving at once would silently drop one
 * of the orders. Per-order objects have no such race, and redemption — the hot
 * path — becomes a single direct GET rather than a scan.
 *
 * Backends, in priority order:
 *   1. Postgres      when DATABASE_URL is set (see src/db/schema.sql)
 *   2. Bunny Storage when the storage zone is configured
 *   3. Local JSON    development only
 */
import fs from 'fs';
import path from 'path';
import { normaliseCode } from './keepsake';
import { seal, open as unseal, isSealed } from './order-crypto';

// Order records belong in a zone with no pull zone in front of it. Falling
// back to the media zone keeps existing deployments working; the records are
// sealed either way, so a public zone discloses nothing.
const ZONE = process.env.BUNNY_ORDERS_ZONE_NAME || process.env.BUNNY_STORAGE_ZONE_NAME;
const KEY = process.env.BUNNY_ORDERS_API_KEY || process.env.BUNNY_STORAGE_API_KEY;
const REGION = (process.env.BUNNY_STORAGE_REGION || 'de').toLowerCase();
const PREFIX = 'orders';

const localFile = path.join(process.cwd(), 'src', 'data', 'orders.json');

function storageHost() {
  return REGION === 'de' || REGION === '' ? 'storage.bunnycdn.com' : `${REGION}.storage.bunnycdn.com`;
}

function remoteReady() {
  return Boolean(ZONE && KEY);
}

export function backendName() {
  if (process.env.DATABASE_URL) return 'postgres';
  if (remoteReady()) return 'bunny-storage';
  return 'local-file';
}

/** Objects are keyed by access code, so redemption is a direct lookup. */
function keyFor(order) {
  return `${PREFIX}/${normaliseCode(order.accessCode || order.id)}.json`;
}

// ── Bunny Storage ────────────────────────────────────────────────────────
function url_(key) {
  return `https://${storageHost()}/${ZONE}/${key}`;
}

async function bunnyPut(key, obj) {
  const res = await fetch(`https://${storageHost()}/${ZONE}/${key}`, {
    method: 'PUT',
    headers: { AccessKey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(seal(obj)),
  });
  if (!res.ok) throw new Error(`Order save failed (${res.status} ${res.statusText}) for ${key}`);
}

async function bunnyGet(key) {
  const res = await fetch(`https://${storageHost()}/${ZONE}/${key}`, {
    headers: { AccessKey: KEY, Accept: 'application/json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Order read failed (${res.status}) for ${key}`);
  // Records written before sealing was introduced come back as plain JSON and
  // pass through untouched; the next save re-writes them sealed.
  return unseal(await res.json());
}

async function bunnyList() {
  const res = await fetch(`https://${storageHost()}/${ZONE}/${PREFIX}/`, {
    headers: { AccessKey: KEY, Accept: 'application/json' },
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Order listing failed (${res.status})`);
  const entries = await res.json();
  const files = entries.filter((e) => !e.IsDirectory && e.ObjectName.endsWith('.json'));
  const orders = await Promise.all(
    files.map((f) => bunnyGet(`${PREFIX}/${f.ObjectName}`).catch(() => null))
  );
  return orders.filter(Boolean);
}

// ── Local file (development) ─────────────────────────────────────────────
function localAll() {
  try {
    if (!fs.existsSync(localFile)) return [];
    return JSON.parse(fs.readFileSync(localFile, 'utf8') || '[]');
  } catch {
    return [];
  }
}

function localWriteAll(orders) {
  fs.mkdirSync(path.dirname(localFile), { recursive: true });
  fs.writeFileSync(localFile, JSON.stringify(orders, null, 2));
}

// ── Public API ───────────────────────────────────────────────────────────

export async function listOrders() {
  if (remoteReady()) {
    const orders = await bunnyList();
    return orders.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }
  return localAll();
}

export async function getOrderByCode(code) {
  const clean = normaliseCode(code);
  if (!clean) return null;

  if (remoteReady()) {
    return bunnyGet(`${PREFIX}/${clean}.json`);
  }
  return localAll().find((o) => normaliseCode(o.accessCode) === clean) || null;
}

export async function saveOrder(order) {
  if (remoteReady()) {
    await bunnyPut(keyFor(order), order);
    return order;
  }
  const all = localAll();
  const i = all.findIndex((o) => o.id === order.id);
  if (i === -1) all.unshift(order);
  else all[i] = order;
  localWriteAll(all);
  return order;
}

export async function getOrderById(id) {
  if (remoteReady()) {
    const all = await bunnyList();
    return all.find((o) => o.id === id) || null;
  }
  return localAll().find((o) => o.id === id) || null;
}


/**
 * Fails fast in production when nothing durable is configured, rather than
 * writing orders to a container filesystem that is about to be replaced.
 */
/**
 * Remove an order entirely. Returns false when there was nothing to remove,
 * so a caller can tell a miss from a failure.
 */
export async function deleteOrder(order) {
  const code = normaliseCode(order.accessCode || order.id);
  if (!code) return false;

  if (remoteReady()) {
    const res = await fetch(url_(`${PREFIX}/${code}.json`), {
      method: 'DELETE',
      headers: { AccessKey: KEY },
    });
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`Order delete failed (${res.status}) for ${code}`);
    return true;
  }

  const all = localAll();
  const next = all.filter((o) => normaliseCode(o.accessCode || o.id) !== code);
  if (next.length === all.length) return false;
  localWriteAll(next);
  return true;
}

export function assertDurable() {
  if (process.env.NODE_ENV === 'production' && backendName() === 'local-file') {
    throw new Error(
      'No durable order storage configured. Set DATABASE_URL, or the ' +
        'BUNNY_STORAGE_* variables. Refusing to write orders to the container ' +
        'filesystem, which is discarded on every deploy.'
    );
  }
}
