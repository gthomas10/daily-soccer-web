"use client";

import { useRef, useState, useCallback } from "react";
import { formatDuration } from "@/lib/utils";

interface BonusPlayerProps {
  bonusAudioUrl: string;
  episodeId: string;
}

export default function BonusPlayer({ bonusAudioUrl, episodeId }: BonusPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlay = useCallback(() => {
    audioRef.current?.play().catch(() => {
      setIsPlaying(false);
      setError(true);
    });
  }, []);

  const handlePause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleError = useCallback(() => {
    setIsPlaying(false);
    setError(true);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      if (!bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (audioRef.current) {
        audioRef.current.currentTime = fraction * duration;
      }
    },
    [duration]
  );

  const handleProgressKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(duration, currentTime + 5);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, currentTime - 5);
        }
      }
    },
    [duration, currentTime]
  );

  return (
    <div
      className="rounded-lg bg-player-surface p-6"
      role="region"
      aria-label="Bonus content player"
      data-episode-id={episodeId}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded bg-accent-emerald/10 px-2 py-0.5 text-xs font-semibold text-accent-emerald">
          Bonus Content
        </span>
        <h2 className="text-lg font-bold text-text-on-dark">Deep Dive</h2>
      </div>

      <audio
        ref={audioRef}
        src={bonusAudioUrl}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={handleError}
      />

      {error ? (
        <p className="mt-2 text-sm text-error">Unable to load bonus audio.</p>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            aria-label={isPlaying ? "Pause bonus content" : "Play bonus content"}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-emerald text-text-on-dark focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2 focus:ring-offset-player-surface"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

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
              aria-label="Bonus audio progress"
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
            </div>
            <span className="text-xs text-text-on-dark/70 tabular-nums">
              {formatDuration(Math.floor(duration))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
