'use client';

import { useEffect, useRef, useState } from 'react';
import { CanvasTexture, DataTexture, SRGBColorSpace, LinearFilter } from 'three';

/**
 * Builds page artwork at runtime by compositing the customer's photo and its
 * caption onto a canvas, which is then used as the page texture. Painting the
 * caption into the texture (rather than overlaying DOM text) is what makes it
 * curve with the paper as the page turns.
 */

const CANVAS_W = 1024;
// Matches the PAGE_WIDTH / PAGE_HEIGHT ratio in Book.jsx (1.28 x 1.71).
const CANVAS_H = Math.round(CANVAS_W * (1.71 / 1.28));

const imageCache = new Map();

/** Stable dependency for a face, so the effect reruns only on real changes. */
function faceKey(face) {
  if (!face) return 'empty';
  if (face.kind === 'letter') {
    return `letter:${face.letter?.body || ''}|${face.letter?.signature || ''}`;
  }
  return `photo:${face.imageUrl || ''}|${face.caption || ''}`;
}

function loadImage(url) {
  if (imageCache.has(url)) return imageCache.get(url);

  const p = new Promise((resolve, reject) => {
    const img = new Image();
    // Required so the CDN-hosted photo can be drawn to a canvas we then read
    // back as a texture; without it the canvas is tainted and WebGL refuses it.
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${url}`));
    img.src = url;
  });

  imageCache.set(url, p);
  return p;
}

/** Cover-fit: fill the page, cropping the overflow, never distorting. */
function drawCover(ctx, img, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function paintCaption(ctx, caption, w, h) {
  if (!caption || !caption.trim()) return;

  const pad = Math.round(w * 0.075);
  const fontSize = Math.round(w * 0.042);
  ctx.font = `300 ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const lines = wrapLines(ctx, caption.trim(), w - pad * 2);
  const lineHeight = Math.round(fontSize * 1.42);
  const blockH = lines.length * lineHeight;
  const scrimH = blockH + pad * 2.1;

  // Scrim so light photos keep the text legible.
  const grad = ctx.createLinearGradient(0, h - scrimH, 0, h);
  grad.addColorStop(0, 'rgba(10,10,10,0)');
  grad.addColorStop(0.45, 'rgba(10,10,10,0.62)');
  grad.addColorStop(1, 'rgba(10,10,10,0.88)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - scrimH, w, scrimH);

  // Keepsake gold hairline above the caption.
  const ruleY = h - scrimH + pad * 0.78;
  ctx.strokeStyle = 'rgba(197,160,89,0.85)';
  ctx.lineWidth = Math.max(1, Math.round(w * 0.0022));
  ctx.beginPath();
  ctx.moveTo(w / 2 - w * 0.06, ruleY);
  ctx.lineTo(w / 2 + w * 0.06, ruleY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = Math.round(w * 0.012);
  lines.forEach((ln, i) => {
    ctx.fillText(ln, w / 2, h - scrimH + pad * 1.5 + (i + 1) * lineHeight - lineHeight * 0.26);
  });
  ctx.shadowBlur = 0;
}

/** Letters arrive with light markdown from the admin textarea; paint the words. */
function stripMarkdown(text) {
  return String(text || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\r/g, '');
}

function wrapParagraph(ctx, text, maxWidth) {
  const out = [];
  for (const para of stripMarkdown(text).split(/\n+/)) {
    if (!para.trim()) { out.push(''); continue; }
    let line = '';
    for (const word of para.trim().split(/\s+/)) {
      const attempt = line ? `${line} ${word}` : word;
      if (ctx.measureText(attempt).width > maxWidth && line) {
        out.push(line);
        line = word;
      } else {
        line = attempt;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

/** The letter is a page of the book, so it is painted into the paper itself. */
function paintLetter(ctx, letter, w, h) {
  // Warm stationery, not the dark photo base.
  ctx.fillStyle = '#f2ece0';
  ctx.fillRect(0, 0, w, h);

  const pad = Math.round(w * 0.11);
  const inner = w - pad * 2;

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(140,116,66,0.95)';
  ctx.font = `400 ${Math.round(w * 0.028)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.fillText('A LETTER FOR YOU', w / 2, pad * 0.92);

  ctx.strokeStyle = 'rgba(197,160,89,0.8)';
  ctx.lineWidth = Math.max(1, Math.round(w * 0.002));
  ctx.beginPath();
  ctx.moveTo(w / 2 - w * 0.07, pad * 1.22);
  ctx.lineTo(w / 2 + w * 0.07, pad * 1.22);
  ctx.stroke();

  // Shrink the body until the whole letter fits the page; a letter that runs
  // past the paper would simply be lost.
  const sigSpace = Math.round(h * 0.13);
  let fontSize = Math.round(w * 0.047);
  let lines = [];
  let lineHeight = 0;
  for (; fontSize >= Math.round(w * 0.024); fontSize -= 2) {
    ctx.font = `300 ${fontSize}px Georgia, "Times New Roman", serif`;
    lineHeight = Math.round(fontSize * 1.62);
    lines = wrapParagraph(ctx, letter.body, inner);
    if (pad * 1.9 + lines.length * lineHeight < h - sigSpace) break;
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(34,30,24,0.92)';
  let y = pad * 1.9 + lineHeight;
  for (const line of lines) {
    if (y > h - sigSpace) break;
    ctx.fillText(line, pad, y);
    y += lineHeight;
  }

  if (letter.signature && letter.signature.trim()) {
    ctx.textAlign = 'right';
    ctx.font = `italic 300 ${Math.round(w * 0.05)}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = 'rgba(120,96,52,0.95)';
    ctx.fillText(`— ${letter.signature.trim()}`, w - pad, h - pad * 0.95);
  }
}

async function buildTexture(face) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');

  if (face && face.kind === 'letter') {
    paintLetter(ctx, face.letter || { body: '', signature: '' }, CANVAS_W, CANVAS_H);
  } else {
    // Paper base, visible if the photo fails or has transparency.
    ctx.fillStyle = '#17150f';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    try {
      const img = await loadImage(face?.imageUrl);
      drawCover(ctx, img, CANVAS_W, CANVAS_H);
    } catch {
      // Leave the paper base; the caption still renders so the spread isn't blank.
      ctx.fillStyle = 'rgba(197,160,89,0.25)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    paintCaption(ctx, face?.caption, CANVAS_W, CANVAS_H);
  }

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  // The canvas is not power-of-two; mipmaps would force a resample pass we
  // neither need nor want at this size.
  tex.generateMipmaps = false;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * A real 1x1 paper-coloured texture per page. A shared `new Texture()` with no
 * image is never uploaded, so the sampler keeps whatever was last bound in
 * that slot and the page shows fragments of a different photo.
 */
function makePlaceholder() {
  const data = new Uint8Array([0x17, 0x15, 0x0f, 0xff]);
  const t = new DataTexture(data, 1, 1);
  t.colorSpace = SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

/**
 * Returns [frontTexture, backTexture] for a leaf's two faces. Both start as a
 * solid placeholder and swap in once composited, so the book renders
 * immediately instead of suspending the whole canvas on a slow CDN fetch.
 */
export function usePageTextures(front, back) {
  const [textures, setTextures] = useState(() => [makePlaceholder(), makePlaceholder()]);
  const live = useRef([]);

  const frontKey = faceKey(front);
  const backKey = faceKey(back);

  useEffect(() => {
    let alive = true;

    Promise.all([buildTexture(front), buildTexture(back)]).then(([f, b]) => {
      if (!alive) {
        f.dispose();
        b.dispose();
        return;
      }
      const previous = live.current;
      live.current = [f, b];
      setTextures([f, b]);
      // Dispose a frame later: the renderer may still be holding the old
      // textures for the frame being drawn right now, and freeing them
      // mid-frame is what shreds the page.
      if (previous.length) {
        requestAnimationFrame(() => previous.forEach((t) => t?.dispose?.()));
      }
    });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontKey, backKey]);

  useEffect(() => () => live.current.forEach((t) => t?.dispose?.()), []);

  return textures;
}
