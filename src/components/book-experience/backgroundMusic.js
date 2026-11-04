const DEFAULT_BG_MUSIC_SRC = "/audios/background-music.mp3";
const BG_MUSIC_VOLUME = 0.4;
const BG_MUSIC_DUCK_VOLUME = 0.1;

let bgMusicAudio = null;
let currentSrc = null;

const getBgMusicAudio = (srcUrl) => {
  if (typeof window === "undefined") return null;
  const targetSrc = srcUrl || DEFAULT_BG_MUSIC_SRC;

  if (!bgMusicAudio || currentSrc !== targetSrc) {
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

export const playBackgroundMusic = (srcUrl) => {
  const audio = getBgMusicAudio(srcUrl);
  if (!audio) return;
  audio.play().catch((err) => {
    console.warn("Background music autoplay deferred until interaction:", err.message);
  });
};

export const pauseBackgroundMusic = () => {
  if (bgMusicAudio) {
    bgMusicAudio.pause();
  }
};

export const duckBackgroundMusic = () => {
  if (bgMusicAudio) bgMusicAudio.volume = BG_MUSIC_DUCK_VOLUME;
};

export const restoreBackgroundMusic = () => {
  if (bgMusicAudio) bgMusicAudio.volume = BG_MUSIC_VOLUME;
};
