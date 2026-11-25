/**
 * Canonical shape of a keepsake experience, and normalisation of the legacy
 * flat order fields into it.
 *
 * Legacy orders carried a single `customPhoto`, one `personalizationNote` and
 * an `audioUrl`. The experience is now driven by an ordered `pages` array, so
 * the book has exactly as many leaves as the photos supplied for that order.
 * normaliseExperience() lets both shapes coexist, so existing orders keep
 * working without a migration.
 */

/** Default book covers, used when an order supplies no custom artwork. */
export const DEFAULT_COVER = '/textures/book-cover.jpg';
export const DEFAULT_BACK = '/textures/book-back.jpg';

export const MAX_PAGES = 24;

export function emptyExperience() {
  return {
    title: '',
    letter: { body: '', signature: '' },
    pages: [],
    voiceNoteUrl: '',
    backgroundMusicUrl: '',
    coverUrl: DEFAULT_COVER,
    backCoverUrl: DEFAULT_BACK,
  };
}

function cleanPage(p, i) {
  if (!p) return null;
  const imageUrl = typeof p === 'string' ? p : p.imageUrl || p.url || '';
  if (!imageUrl) return null;
  return {
    imageUrl,
    caption: (typeof p === 'object' && (p.caption || '')) || '',
    index: i,
  };
}

/**
 * Produce the experience payload for an order, whichever shape it was stored
 * in. Always returns a complete object so callers never branch on undefined.
 */
export function normaliseExperience(order = {}) {
  const base = emptyExperience();
  const src = order.experience || {};

  const pages = Array.isArray(src.pages) && src.pages.length
    ? src.pages
    : // Legacy: a single photo became the one and only interior page.
      (order.customPhoto ? [{ imageUrl: order.customPhoto, caption: '' }] : []);

  const letterBody =
    src.letter?.body ||
    order.personalizationNote ||
    order.customMessage ||
    '';

  return {
    ...base,
    title: src.title || order.experienceTitle || '',
    letter: {
      body: letterBody,
      signature: src.letter?.signature || order.purchaserName || '',
    },
    pages: pages.map(cleanPage).filter(Boolean).slice(0, MAX_PAGES),
    voiceNoteUrl: src.voiceNoteUrl || order.voiceNoteUrl || '',
    backgroundMusicUrl: src.backgroundMusicUrl || order.audioUrl || '',
    coverUrl: src.coverUrl || order.coverUrl || base.coverUrl,
    backCoverUrl: src.backCoverUrl || order.backCoverUrl || base.backCoverUrl,
  };
}

/**
 * Turn the experience into the spread list the 3D book renders.
 *
 * A physical book leaf has two faces, so N photos produce ceil(N/2) interior
 * leaves plus the two cover leaves. The last leaf is padded with the back
 * cover when the photo count is odd, which is why page count follows the
 * uploaded images exactly rather than a fixed template.
 */
export function buildSpreads(experience) {
  const { pages, letter, coverUrl, backCoverUrl } = experience;

  const hasLetter = Boolean(letter && letter.body && letter.body.trim());
  if (!pages.length && !hasLetter) return [];

  const photoFace = (imageUrl, caption = '') => ({ kind: 'photo', imageUrl, caption });
  const backFace = photoFace(backCoverUrl);

  // Interior faces in reading order. The letter takes the first one, so it
  // greets the recipient on the inside of the front cover rather than hiding
  // behind a button.
  const faces = [];
  if (hasLetter) faces.push({ kind: 'letter', letter, caption: '' });
  pages.forEach((p) => faces.push(photoFace(p.imageUrl, p.caption)));

  const leaves = [{ front: photoFace(coverUrl), back: faces[0] || backFace }];

  for (let i = 1; i < faces.length; i += 2) {
    leaves.push({ front: faces[i], back: faces[i + 1] || backFace });
  }

  // Close the stack on the back cover when the last leaf is still a photo.
  if (leaves[leaves.length - 1].back !== backFace) {
    leaves.push({ front: backFace, back: backFace });
  }

  return leaves;
}

export function generateAccessCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
  // The code is the only credential guarding a customer's gift, so it comes
  // from the CSPRNG. Math.random is a predictable sequence: a few observed
  // codes are enough to narrow down the ones issued around them. Web Crypto
  // rather than node:crypto because this module is also bundled for the
  // browser, where the admin renders order data.
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  let body = '';
  for (let i = 0; i < 8; i++) {
    body += alphabet[bytes[i] % alphabet.length];
  }
  return `KPSK-${body.slice(0, 4)}-${body.slice(4)}`;
}

export function normaliseCode(str) {
  return (str || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Whether an order has everything the 3D keepsake needs in order to render.
 *
 * The first build shipped a hand-made WebGL bundle per customer and judged
 * readiness by the presence of `packageUrl`. The book is now generated from
 * the order's own photos, so that field is never written and every order
 * looked permanently unfinished. Readiness now means what it says: at least
 * one page of media exists.
 */
export function isExperienceReady(order) {
  return normaliseExperience(order).pages.length > 0;
}
