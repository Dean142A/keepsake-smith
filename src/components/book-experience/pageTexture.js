'use client';

import { useEffect, useRef, useState } from 'react';
import { CanvasTexture, SRGBColorSpace, Texture, LinearFilter } from 'three';

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

async function buildTexture(url, caption) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');

  // Paper base, visible if the photo fails or has transparency.
  ctx.fillStyle = '#17150f';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  try {
    const img = await loadImage(url);
    drawCover(ctx, img, CANVAS_W, CANVAS_H);
  } catch {
    // Leave the paper base; the caption still renders so the spread isn't blank.
    ctx.fillStyle = 'rgba(197,160,89,0.25)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  paintCaption(ctx, caption, CANVAS_W, CANVAS_H);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

const BLANK = (() => {
  let t = null;
  return () => {
    if (t) return t;
    t = new Texture();
    return t;
  };
})();

/**
 * Returns [frontTexture, backTexture]. Both start as a blank placeholder and
 * swap in once composited, so the book renders immediately instead of
 * suspending the whole canvas on a slow CDN fetch.
 */
export function usePageTextures(front, back, frontCaption, backCaption) {
  const [textures, setTextures] = useState([BLANK(), BLANK()]);
  const disposed = useRef([]);

  useEffect(() => {
    let alive = true;

    Promise.all([
      buildTexture(front, frontCaption),
      buildTexture(back, backCaption),
    ]).then(([f, b]) => {
      if (!alive) {
        f.dispose();
        b.dispose();
        return;
      }
      disposed.current.forEach((t) => t?.dispose?.());
      disposed.current = [f, b];
      setTextures([f, b]);
    });

    return () => {
      alive = false;
    };
  }, [front, back, frontCaption, backCaption]);

  useEffect(() => () => disposed.current.forEach((t) => t?.dispose?.()), []);

  return textures;
}
