const BG_MUSIC_SRC = "/audios/background-music.mp3";
const BG_MUSIC_VOLUME = 0.4;
const BG_MUSIC_DUCK_VOLUME = 0.1;

let bgMusicAudio = null;

const getBgMusicAudio = () => {
  if (typeof window === "undefined") return null;
  if (!bgMusicAudio) {
    bgMusicAudio = new Audio(BG_MUSIC_SRC);
    bgMusicAudio.loop = true;
    bgMusicAudio.volume = BG_MUSIC_VOLUME;
  }
  return bgMusicAudio;
};

export const playBackgroundMusic = () => {
  const audio = getBgMusicAudio();
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
