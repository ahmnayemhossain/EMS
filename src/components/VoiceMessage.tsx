import * as React from "react";
import { Pause, Play } from "lucide-react";

import { cn } from "@/app/components/ui/utils";

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function VoiceMessage({
  src,
  durationSec,
  className,
  density = "default",
  variant = "default",
  labels,
}: {
  src: string;
  durationSec?: number;
  className?: string;
  density?: "default" | "compact";
  variant?: "default" | "whatsapp";
  labels?: {
    play?: string;
    pause?: string;
  };
}) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const idRef = React.useRef(`vm_${Math.random().toString(16).slice(2)}`);
  const seekingRef = React.useRef(false);

  const [readyDuration, setReadyDuration] = React.useState<number | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);

  const total = React.useMemo(() => {
    const d = readyDuration ?? durationSec ?? 0;
    return Number.isFinite(d) && d > 0 ? d : 0;
  }, [durationSec, readyDuration]);

  const pct = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
  const remaining = total > 0 ? Math.max(0, total - current) : 0;

  const stopRaf = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const tick = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(audio.currentTime || 0);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const toggle = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch {
      // ignore
    }
  }, [playing]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      // Pause other VoiceMessage instances (WhatsApp-like)
      window.dispatchEvent(
        new CustomEvent("ems:voice:play", { detail: { id: idRef.current } }),
      );
      setPlaying(true);
      stopRaf();
      rafRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      stopRaf();
      setCurrent(audio.currentTime || 0);
    };
    const onEnded = () => {
      setPlaying(false);
      stopRaf();
      setCurrent(0);
    };
    const onLoaded = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) setReadyDuration(d);
    };
    const onExternalPlay = (e: Event) => {
      const ev = e as CustomEvent<{ id: string }>;
      if (!ev?.detail?.id) return;
      if (ev.detail.id === idRef.current) return;
      try {
        audio.pause();
      } catch {
        // ignore
      }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoaded);
    window.addEventListener("ems:voice:play", onExternalPlay as any);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoaded);
      window.removeEventListener("ems:voice:play", onExternalPlay as any);
      stopRaf();
    };
  }, [stopRaf, tick]);

  const onSeek = React.useCallback(
    (clientX: number, rect: DOMRect) => {
      const audio = audioRef.current;
      if (!audio || total <= 0) return;
      const x = clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, x / rect.width));
      audio.currentTime = ratio * total;
      setCurrent(audio.currentTime);
    },
    [total],
  );

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        density === "compact" ? "gap-2" : "gap-3",
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={toggle}
        className={cn(
          "grid place-items-center rounded-full border bg-background/40 hover:bg-background/60",
          density === "compact" ? "size-8" : "size-9",
        )}
        aria-label={playing ? labels?.pause || "Pause" : labels?.play || "Play"}
      >
        {playing ? (
          <Pause className="size-4" />
        ) : (
          <Play className="ml-0.5 size-4" />
        )}
      </button>

      <div
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={total || 0}
        aria-valuenow={current}
        tabIndex={0}
        className={cn(
          "relative h-2 flex-1 cursor-pointer rounded-full bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
        onPointerDown={(e) => {
          const audio = audioRef.current;
          if (!audio || total <= 0) return;
          seekingRef.current = true;
          (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(e.clientX, rect);
        }}
        onPointerMove={(e) => {
          if (!seekingRef.current) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          onSeek(e.clientX, rect);
        }}
        onPointerUp={() => {
          seekingRef.current = false;
        }}
        onPointerCancel={() => {
          seekingRef.current = false;
        }}
        onKeyDown={(e) => {
          const audio = audioRef.current;
          if (!audio || total <= 0) return;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            audio.currentTime = Math.max(0, (audio.currentTime || 0) - 5);
            setCurrent(audio.currentTime);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            audio.currentTime = Math.min(total, (audio.currentTime || 0) + 5);
            setCurrent(audio.currentTime);
          }
        }}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary/60"
          style={{ width: `${pct * 100}%` }}
        />
        <span
          className="absolute top-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm"
          style={{ left: `calc(${pct * 100}% - 6px)`, width: 12, height: 12 }}
        />
      </div>

      <div className="text-muted-foreground shrink-0 text-xs tabular-nums">
        {variant === "whatsapp" && total > 0
          ? `-${formatTime(remaining)}`
          : total > 0
            ? formatTime(total)
            : formatTime(durationSec || 0)}
      </div>
    </div>
  );
}
