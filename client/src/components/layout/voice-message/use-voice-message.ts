import * as React from "react";

export function useVoiceMessage(durationSec?: number) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const idRef = React.useRef(`vm_${Math.random().toString(16).slice(2)}`);
  const seekingRef = React.useRef(false);
  const [readyDuration, setReadyDuration] = React.useState<number | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const total = React.useMemo(() => { const value = readyDuration ?? durationSec ?? 0; return Number.isFinite(value) && value > 0 ? value : 0; }, [durationSec, readyDuration]);
  const pct = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
  const remaining = total > 0 ? Math.max(0, total - current) : 0;
  const stopRaf = React.useCallback(() => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; }, []);
  const tick = React.useCallback(() => { const audio = audioRef.current; if (!audio) return; setCurrent(audio.currentTime || 0); rafRef.current = requestAnimationFrame(tick); }, []);
  const toggle = React.useCallback(async () => { const audio = audioRef.current; if (!audio) return; if (playing) { audio.pause(); return; } try { await audio.play(); } catch {} }, [playing]);
  React.useEffect(() => { const audio = audioRef.current; if (!audio) return; const onPlay = () => { window.dispatchEvent(new CustomEvent("ems:voice:play", { detail: { id: idRef.current } })); setPlaying(true); stopRaf(); rafRef.current = requestAnimationFrame(tick); }; const onPause = () => { setPlaying(false); stopRaf(); setCurrent(audio.currentTime || 0); }; const onEnded = () => { setPlaying(false); stopRaf(); setCurrent(0); }; const onLoaded = () => { const value = audio.duration; if (Number.isFinite(value) && value > 0) setReadyDuration(value); }; const onExternalPlay = (event: Event) => { const detail = (event as CustomEvent<{ id: string }>).detail; if (!detail?.id || detail.id === idRef.current) return; try { audio.pause(); } catch {} }; audio.addEventListener("play", onPlay); audio.addEventListener("pause", onPause); audio.addEventListener("ended", onEnded); audio.addEventListener("loadedmetadata", onLoaded); window.addEventListener("ems:voice:play", onExternalPlay as EventListener); return () => { audio.removeEventListener("play", onPlay); audio.removeEventListener("pause", onPause); audio.removeEventListener("ended", onEnded); audio.removeEventListener("loadedmetadata", onLoaded); window.removeEventListener("ems:voice:play", onExternalPlay as EventListener); stopRaf(); }; }, [stopRaf, tick]);
  const onSeek = React.useCallback((clientX: number, rect: DOMRect) => { const audio = audioRef.current; if (!audio || total <= 0) return; const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)); audio.currentTime = ratio * total; setCurrent(audio.currentTime); }, [total]);
  return { audioRef, seekingRef, playing, current, total, pct, remaining, toggle, onSeek, setCurrent };
}
