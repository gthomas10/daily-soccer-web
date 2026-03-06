"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { formatDuration } from "@/lib/utils";
import type { Chapter } from "@/types/episode";

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
  chapters?: Chapter[];
}

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

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
  chapters = [],
}: AudioPlayerProps) {
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [muted, setMuted] = useState(false);
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

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, audioRef]);

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

  const handleProgressKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onSeek(Math.min(duration, currentTime + (e.shiftKey ? 15 : 5)));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onSeek(Math.max(0, currentTime - (e.shiftKey ? 15 : 5)));
      }
    },
    [duration, currentTime, onSeek]
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

  const handleSpeedChange = useCallback(() => {
    const currentIndex = SPEEDS.indexOf(playbackRate as (typeof SPEEDS)[number]);
    setPlaybackRate(SPEEDS[(currentIndex + 1) % SPEEDS.length]);
  }, [playbackRate]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const newMuted = !prev;
      if (audioRef.current) audioRef.current.muted = newMuted;
      return newMuted;
    });
  }, [audioRef]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (isPlaying) {
            onPause();
          } else {
            onPlay();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          onSeek(Math.min(duration, currentTime + (e.shiftKey ? 15 : 5)));
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeek(Math.max(0, currentTime - (e.shiftKey ? 15 : 5)));
          break;
        case "m":
        case "M":
          toggleMute();
          break;
      }
    },
    [isPlaying, currentTime, duration, onPlay, onPause, onSeek, toggleMute]
  );

  return (
    <div
      id="audio-player"
      className="rounded-lg bg-player-surface p-6"
      role="region"
      aria-label="Audio player"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
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
            className="flex h-16 w-16 items-center justify-center rounded-full bg-error text-text-on-dark"
          >
            <RetryIcon />
          </button>
        ) : (
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={loading}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-emerald text-text-on-dark disabled:opacity-50"
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
            onKeyDown={handleProgressKeyDown}
            role="slider"
            tabIndex={0}
            aria-label="Playback progress"
            aria-valuenow={Math.floor(currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration)}
            aria-valuetext={`${formatDuration(Math.floor(currentTime))} of ${formatDuration(Math.floor(duration))}`}
            className="relative h-2 flex-1 cursor-pointer rounded-full bg-text-on-dark/20 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2 focus:ring-offset-player-surface"
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-accent-emerald"
              style={{ width: `${progress}%` }}
            />
            {chapters.slice(1).map((chapter) => {
              const position = duration > 0 ? (chapter.start_seconds / duration) * 100 : 0;
              return (
                <div
                  key={chapter.start_seconds}
                  className="absolute top-0 h-full w-px bg-text-on-dark/30 pointer-events-none"
                  style={{ left: `${position}%` }}
                />
              );
            })}
          </div>
          <span className="text-xs text-text-on-dark/70 tabular-nums">
            {formatDuration(Math.floor(duration))}
          </span>
        </div>

        {/* Speed control */}
        <button
          onClick={handleSpeedChange}
          aria-label={`Playback speed, currently ${playbackRate} times`}
          aria-live="polite"
          className="text-xs text-text-on-dark/70 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2 focus:ring-offset-player-surface"
        >
          {playbackRate}x
        </button>

        {/* Volume control — desktop only */}
        <div className="hidden items-center gap-2 lg:flex">
          <VolumeIcon muted={muted} />
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
    <svg width="24" height="24" viewBox="0 0 24 24" className="motion-safe:animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 019.17 6" strokeLinecap="round" />
    </svg>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-text-on-dark/70">
        <path d="M16.5 12A4.5 4.5 0 0014 8.14v2.02l2.45 2.45c.03-.2.05-.4.05-.61zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-text-on-dark/70">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.14v7.72c1.48-.73 2.5-2.25 2.5-3.86z" />
    </svg>
  );
}
