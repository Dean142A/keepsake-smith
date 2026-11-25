/**
 * Move order records from the media storage zone into a dedicated one.
 *
 * Order records have no business being reachable over a CDN. They are sealed,
 * so a public zone no longer discloses anything, but a zone with no pull zone
 * in front of it removes the question entirely.
 *
 * Reads every object under orders/ in the source zone, writes it to the
 * destination zone byte for byte, verifies the copy, and only then deletes
 * the original. Sealed bytes are copied as they are: this script never holds
 * a decryption key and never sees a customer's details.
 *
 *   node scripts/migrate-orders-zone.mjs            # dry run
 *   node scripts/migrate-orders-zone.mjs --apply    # copy, verify, delete
 */
import { readFileSync } from 'node:fs';

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const APPLY = process.argv.includes('--apply');
const PREFIX = 'orders';

const src = {
  zone: process.env.BUNNY_STORAGE_ZONE_NAME,
  key: process.env.BUNNY_STORAGE_API_KEY,
};
const dst = {
  zone: process.env.BUNNY_ORDERS_ZONE_NAME,
  key: process.env.BUNNY_ORDERS_API_KEY,
};

const host = (() => {
  const region = (process.env.BUNNY_STORAGE_REGION || 'de').toLowerCase();
  return region === 'de' || region === '' ? 'storage.bunnycdn.com' : `${region}.storage.bunnycdn.com`;
})();

function must(cond, message) {
  if (!cond) {
    console.error(`✗ ${message}`);
    process.exit(1);
  }
}

must(src.zone && src.key, 'BUNNY_STORAGE_ZONE_NAME / BUNNY_STORAGE_API_KEY are not set.');
must(dst.zone && dst.key, 'BUNNY_ORDERS_ZONE_NAME / BUNNY_ORDERS_API_KEY are not set — create the private zone first.');
must(dst.zone !== src.zone, 'The destination zone is the same as the source; nothing to do.');

const url = (z, path) => `https://${host}/${z}/${path}`;

async function list(z, key) {
  const res = await fetch(url(z, `${PREFIX}/`), { headers: { AccessKey: key, Accept: 'application/json' } });
  if (res.status === 404) return [];
  must(res.ok, `Listing ${z} failed (${res.status})`);
  return (await res.json()).filter((e) => !e.IsDirectory && e.ObjectName.endsWith('.json'));
}

const files = await list(src.zone, src.key);
console.log(`${files.length} record(s) in "${src.zone}" → "${dst.zone}"${APPLY ? '' : '   (dry run; pass --apply)'}\n`);

let moved = 0;
for (const file of files) {
  const path = `${PREFIX}/${file.ObjectName}`;
  process.stdout.write(`  ${file.ObjectName.padEnd(22)} `);

  const read = await fetch(url(src.zone, path), { headers: { AccessKey: src.key } });
  if (!read.ok) {
    console.log(`read failed (${read.status}) — skipped`);
    continue;
  }
  const bytes = Buffer.from(await read.arrayBuffer());
  const sealed = (() => {
    try {
      return JSON.parse(bytes.toString('utf8')).__sealed === 1;
    } catch {
      return false;
    }
  })();

  if (!APPLY) {
    console.log(`${bytes.length} bytes, ${sealed ? 'sealed' : 'PLAINTEXT — save it once before migrating'}`);
    continue;
  }

  const put = await fetch(url(dst.zone, path), {
    method: 'PUT',
    headers: { AccessKey: dst.key, 'Content-Type': 'application/json' },
    body: bytes,
  });
  if (!put.ok) {
    console.log(`copy failed (${put.status}) — original left in place`);
    continue;
  }

  // Verify before deleting anything.
  const back = await fetch(url(dst.zone, path), { headers: { AccessKey: dst.key } });
  const copied = back.ok ? Buffer.from(await back.arrayBuffer()) : Buffer.alloc(0);
  if (!copied.equals(bytes)) {
    console.log('copy did not match — original left in place');
    continue;
  }

  const del = await fetch(url(src.zone, path), { method: 'DELETE', headers: { AccessKey: src.key } });
  console.log(del.ok ? 'moved and verified' : `copied, but the original could not be deleted (${del.status})`);
  moved += 1;
}

if (APPLY) {
  console.log(`\n${moved} of ${files.length} moved.`);
  console.log('Purge the media pull zone afterwards so no cached copy of the old path survives.');
}
