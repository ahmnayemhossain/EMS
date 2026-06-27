const TOAST_SOUND_CONFIG = {
  success: {
    src: "/sounds/toast-success.mp3",
    volume: 0.28,
  },
  error: {
    src: "/sounds/toast-error.mp3",
    volume: 0.3,
  },
  info: {
    src: "/sounds/toast-info.mp3",
    volume: 0.24,
  },
} as const;

type ToastSoundType = keyof typeof TOAST_SOUND_CONFIG;

const audioCache = new Map<ToastSoundType, HTMLAudioElement>();

function getAudio(type: ToastSoundType) {
  const cachedAudio = audioCache.get(type);
  if (cachedAudio) {
    return cachedAudio;
  }

  const config = TOAST_SOUND_CONFIG[type];
  const audio = new Audio(config.src);
  audio.preload = "auto";
  audio.volume = config.volume;
  audioCache.set(type, audio);
  return audio;
}

export function playToastSound(type: ToastSoundType) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const audio = getAudio(type);
    audio.pause();
    audio.currentTime = 0;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  } catch {}
}
