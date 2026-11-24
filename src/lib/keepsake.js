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
  const { pages, coverUrl, backCoverUrl } = experience;
  if (!pages.length) return [];

  const leaves = [];
  // Front cover, backed by the first photo.
  leaves.push({ front: coverUrl, back: pages[0]?.imageUrl || backCoverUrl, frontCaption: '', backCaption: pages[0]?.caption || '' });

  for (let i = 1; i < pages.length; i += 2) {
    leaves.push({
      front: pages[i].imageUrl,
      frontCaption: pages[i].caption || '',
      back: pages[i + 1]?.imageUrl || backCoverUrl,
      backCaption: pages[i + 1]?.caption || '',
    });
  }

  // Ensure the stack closes on the back cover.
  const last = leaves[leaves.length - 1];
  if (last.back !== backCoverUrl) {
    leaves.push({ front: backCoverUrl, frontCaption: '', back: backCoverUrl, backCaption: '' });
  }

  return leaves;
}

/** 12-character access code, formatted KPSK-XXXX-XXXX. */
export function generateAccessCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
  let body = '';
  for (let i = 0; i < 8; i++) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
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

/** How many photos this order supplied, which is what drives the leaf count. */
export function experiencePageCount(order) {
  return normaliseExperience(order).pages.length;
}
