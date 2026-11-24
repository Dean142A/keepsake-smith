const DEFAULT_BG_MUSIC_SRC = "/audios/background-music.mp3";

// The score is scenery, not the performance: quiet on arrival, and quieter
// still while a recorded voice is speaking over it.
const BG_MUSIC_VOLUME = 0.3;
const BG_MUSIC_DUCK_VOLUME = 0.06;
const FADE_MS = 500;
const FADE_TICK_MS = 25;

let bgMusicAudio = null;
let currentSrc = null;
let fadeTimer = null;

const clearFade = () => {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
};

/** Ramp the volume instead of stepping it, so ducking is not audible as a click. */
const fadeTo = (target, ms = FADE_MS) => {
  if (!bgMusicAudio) return;
  clearFade();

  const from = bgMusicAudio.volume;
  const steps = Math.max(1, Math.round(ms / FADE_TICK_MS));
  let step = 0;

  fadeTimer = setInterval(() => {
    step += 1;
    if (!bgMusicAudio) return clearFade();
    const next = from + (target - from) * (step / steps);
    bgMusicAudio.volume = Math.min(1, Math.max(0, next));
    if (step >= steps) clearFade();
  }, FADE_TICK_MS);
};

const getBgMusicAudio = (srcUrl) => {
  if (typeof window === "undefined") return null;
  const targetSrc = srcUrl || DEFAULT_BG_MUSIC_SRC;

  if (!bgMusicAudio || currentSrc !== targetSrc) {
    clearFade();
    if (bgMusicAudio) {
      bgMusicAudio.pause();
      bgMusicAudio.src = "";
    }
    bgMusicAudio = new Audio(targetSrc);
    bgMusicAudio.loop = true;
    bgMusicAudio.volume = BG_MUSIC_VOLUME;
    currentSrc = targetSrc;
  }
  return bgMusicAudio;
};

/**
 * Returns the play() promise so callers can tell whether the browser actually
 * allowed playback, rather than optimistically claiming the music is on.
 */
export const playBackgroundMusic = (srcUrl) => {
  const audio = getBgMusicAudio(srcUrl);
  if (!audio) return Promise.reject(new Error("No audio context"));
  return audio.play();
};

export const pauseBackgroundMusic = () => {
  clearFade();
  if (bgMusicAudio) bgMusicAudio.pause();
};

/** Drop the music under a voice note. */
export const duckBackgroundMusic = () => fadeTo(BG_MUSIC_DUCK_VOLUME);

/** Bring the music back up once the voice has finished. */
export const restoreBackgroundMusic = () => fadeTo(BG_MUSIC_VOLUME);
