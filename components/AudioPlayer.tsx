"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { formatDuration } from "@/lib/utils";

interface AudioPlayerProps {
  title: string;
  date: string;
  audioUrl: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AudioPlayer({
  title,
  date,
  audioUrl,
  duration,
  currentTime,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  audioRef,
}: AudioPlayerProps) {
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => setLoading(false);
    const handleError = () => {
      setError(true);
      setLoading(false);
    };
    const handleLoadStart = () => {
      setLoading(true);
      setError(false);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, [audioRef]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      if (!bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(fraction * duration);
    },
    [duration, onSeek]
  );

  const handleRetry = useCallback(() => {
    setError(false);
    setLoading(true);
    audioRef.current?.load();
  }, [audioRef]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      setVolume(v);
      if (audioRef.current) {
        audioRef.current.volume = v;
      }
    },
    [audioRef]
  );

  return (
    <div id="audio-player" className="rounded-lg bg-player-surface p-6">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Episode info */}
      <h1 className="text-xl font-bold text-text-on-dark lg:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-accent-emerald">{date}</p>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4">
        {error ? (
          <button
            onClick={handleRetry}
            aria-label="Retry loading audio"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-error text-text-on-dark"
          >
            <RetryIcon />
          </button>
        ) : (
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={loading}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-emerald text-text-on-dark disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        )}

        {/* Progress bar */}
        <div className="flex flex-1 items-center gap-3">
          <span className="text-xs text-text-on-dark/70 tabular-nums">
            {formatDuration(Math.floor(currentTime))}
          </span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-2 flex-1 cursor-pointer rounded-full bg-text-on-dark/20"
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-accent-emerald"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-text-on-dark/70 tabular-nums">
            {formatDuration(Math.floor(duration))}
          </span>
        </div>

        {/* Volume control — desktop only */}
        <div className="hidden items-center gap-2 lg:flex">
          <VolumeIcon />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="w-20 accent-accent-emerald"
          />
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-error">Unable to load audio. Tap retry to try again.</p>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 019.17 6" strokeLinecap="round" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-text-on-dark/70">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.14v7.72c1.48-.73 2.5-2.25 2.5-3.86z" />
    </svg>
  );
}
