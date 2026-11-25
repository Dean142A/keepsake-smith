'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  ImagePlus,
  Mic,
  Music,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  BookOpen,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { buildSpreads, normaliseExperience, MAX_PAGES } from '@/lib/keepsake';

/**
 * Builds the per-order keepsake experience: the ordered photo list that
 * becomes the book's pages, each photo's caption, the letter, and the voice
 * note. Everything here is per-order data, so one template serves every
 * customer rather than needing a new build each time.
 */
export default function ExperienceBuilder({ value, onChange, orderId = 'unassigned' }) {
  const exp = value;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [voicePlaying, setVoicePlaying] = useState(false);
  const voiceRef = useRef(null);
  const photoInput = useRef(null);
  const voiceInput = useRef(null);
  const musicInput = useRef(null);

  const leafCount = useMemo(
    () => buildSpreads(normaliseExperience({ experience: exp })).length,
    [exp]
  );

  const patch = (next) => onChange({ ...exp, ...next });

  async function upload(files, kind) {
    if (!files?.length) return [];
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      [...files].forEach((f) => fd.append('files', f));
      fd.append('orderId', orderId);
      fd.append('kind', kind);

      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Upload failed.');
        return [];
      }
      if (data.rejected?.length) {
        setError(data.rejected.map((r) => `${r.name}: ${r.error}`).join(' • '));
      }
      if (data.remoteStorage === false) {
        setError(
          (prev) =>
            `${prev ? prev + ' • ' : ''}Saved locally — object storage is not configured, so these files will be lost on the next deploy.`
        );
      }
      return data.files || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setUploading(false);
    }
  }

  const addPhotos = async (e) => {
    const files = e.target.files;
    const uploaded = await upload(files, 'pages');
    if (uploaded.length) {
      const next = [...exp.pages, ...uploaded.map((f) => ({ imageUrl: f.url, caption: '' }))];
      if (next.length > MAX_PAGES) {
        setError(`A keepsake holds at most ${MAX_PAGES} photos. Extra files were not added.`);
      }
      patch({ pages: next.slice(0, MAX_PAGES) });
    }
    e.target.value = '';
  };

  const addVoice = async (e) => {
    const [f] = await upload(e.target.files, 'voice');
    if (f) patch({ voiceNoteUrl: f.url });
    e.target.value = '';
  };

  const addMusic = async (e) => {
    const [f] = await upload(e.target.files, 'music');
    if (f) patch({ backgroundMusicUrl: f.url });
    e.target.value = '';
  };

  const setCaption = (i, caption) =>
    patch({ pages: exp.pages.map((p, idx) => (idx === i ? { ...p, caption } : p)) });

  const removePage = (i) => patch({ pages: exp.pages.filter((_, idx) => idx !== i) });

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= exp.pages.length) return;
    const next = [...exp.pages];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ pages: next });
  };

  const toggleVoice = () => {
    if (!exp.voiceNoteUrl) return;
    if (!voiceRef.current || voiceRef.current.src !== exp.voiceNoteUrl) {
      voiceRef.current = new Audio(exp.voiceNoteUrl);
      voiceRef.current.addEventListener('ended', () => setVoicePlaying(false));
    }
    if (voicePlaying) {
      voiceRef.current.pause();
      setVoicePlaying(false);
    } else {
      voiceRef.current.play().catch(() => setVoicePlaying(false));
      setVoicePlaying(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Photos */}
      <div className="card-surface p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <span className="uppercase-label text-neutral-400">Keepsake Pages</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Each photo becomes a page, in this order. The book is built to fit them.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-accent font-medium">
              <BookOpen size={13} />
              {exp.pages.length} photo{exp.pages.length === 1 ? '' : 's'} → {leafCount} leaves
            </span>
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              disabled={uploading || exp.pages.length >= MAX_PAGES}
              className="primary-button text-xs py-1.5 px-3 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
              Add photos
            </button>
          </div>
        </div>

        <input
          ref={photoInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={addPhotos}
        />

        {exp.pages.length === 0 ? (
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            className="w-full border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl py-8 text-center hover:border-accent transition-colors"
          >
            <ImagePlus size={22} className="mx-auto mb-2 text-neutral-400" />
            <span className="block text-xs text-neutral-500">
              Add the photos for this keepsake — select several at once
            </span>
          </button>
        ) : (
          <ul className="space-y-2">
            {exp.pages.map((p, i) => (
              <li
                key={`${p.imageUrl}-${i}`}
                className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60"
              >
                <span className="font-mono text-[10px] text-neutral-400 w-5 text-center">
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={`Page ${i + 1}`}
                  className="w-12 h-16 object-cover rounded-md flex-shrink-0 bg-neutral-200 dark:bg-neutral-900"
                />
                <input
                  type="text"
                  value={p.caption}
                  onChange={(e) => setCaption(i, e.target.value)}
                  placeholder="Caption printed on this page (optional)"
                  className="flex-1 rounded-full border border-neutral-200/60 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--accent)]"
                />
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                    className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30" title="Move up">
                    <ArrowUp size={13} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === exp.pages.length - 1}
                    className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30" title="Move down">
                    <ArrowDown size={13} />
                  </button>
                  <button type="button" onClick={() => removePage(i)}
                    className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40" title="Remove">
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Letter */}
      <div className="card-surface p-4">
        <span className="uppercase-label text-neutral-400">The Letter</span>
        <p className="text-[11px] text-neutral-500 mt-0.5 mb-3">
          Shown as a readable note inside the experience.
        </p>
        <textarea
          rows={5}
          value={exp.letter.body}
          onChange={(e) => patch({ letter: { ...exp.letter, body: e.target.value } })}
          placeholder="Write the message the buyer wants their partner to read…"
          className="w-full rounded-xl bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--accent)] resize-y"
        />
        <input
          type="text"
          value={exp.letter.signature}
          onChange={(e) => patch({ letter: { ...exp.letter, signature: e.target.value } })}
          placeholder="Signed — e.g. Arthur"
          className="mt-2 w-full rounded-full border border-neutral-200/60 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Audio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-surface p-4">
          <span className="uppercase-label text-neutral-400">Voice Note</span>
          <p className="text-[11px] text-neutral-500 mt-0.5 mb-3">MP3, WAV, M4A or OGG.</p>
          <input ref={voiceInput} type="file" accept="audio/*" hidden onChange={addVoice} />
          {exp.voiceNoteUrl ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleVoice}
                className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
                {voicePlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>
              <span className="text-[11px] text-neutral-500 truncate flex-1">Voice note attached</span>
              <button type="button" onClick={() => patch({ voiceNoteUrl: '' })}
                className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => voiceInput.current?.click()} disabled={uploading}
              className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 py-2 text-xs inline-flex items-center justify-center gap-2 hover:border-accent transition-colors">
              <Mic size={13} /> Upload voice note
            </button>
          )}
        </div>

        <div className="card-surface p-4">
          <span className="uppercase-label text-neutral-400">Background Music</span>
          <p className="text-[11px] text-neutral-500 mt-0.5 mb-3">Optional ambient track.</p>
          <input ref={musicInput} type="file" accept="audio/*" hidden onChange={addMusic} />
          {exp.backgroundMusicUrl ? (
            <div className="flex items-center gap-2">
              <Music size={15} className="text-accent flex-shrink-0" />
              <span className="text-[11px] text-neutral-500 truncate flex-1">Track attached</span>
              <button type="button" onClick={() => patch({ backgroundMusicUrl: '' })}
                className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => musicInput.current?.click()} disabled={uploading}
              className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 py-2 text-xs inline-flex items-center justify-center gap-2 hover:border-accent transition-colors">
              <Music size={13} /> Upload music
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50">
          <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300">{error}</p>
        </div>
      )}
    </div>
  );
}
