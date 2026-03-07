"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import AudioPlayer from "./AudioPlayer";
import ChapterList from "./ChapterList";
import type { Episode } from "@/types/episode";
import { formatEpisodeDate } from "@/lib/utils";

interface EpisodePlayerProps {
  episode: Episode;
  audioUrl: string;
}

export default function EpisodePlayer({ episode, audioUrl }: EpisodePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(episode.duration_seconds);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handlePlay = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const handlePause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const seconds = (e as CustomEvent).detail?.seconds;
      if (typeof seconds === "number") {
        handleSeek(seconds);
      }
    };
    document.addEventListener("player:seek", handler);
    return () => document.removeEventListener("player:seek", handler);
  }, [handleSeek]);

  return (
    <>
      {/* Player area — max 800px on desktop per layout spec */}
      <div style={{ gridArea: "player" }} className="lg:max-w-[800px]">
        <AudioPlayer
          title={episode.title}
          date={formatEpisodeDate(episode.publish_date)}
          audioUrl={audioUrl}
          duration={duration}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
          audioRef={audioRef}
          chapters={episode.chapters}
        />
      </div>

      {/* Chapters — below player on mobile, sidebar on desktop */}
      <div style={{ gridArea: "chapters" }} className="lg:sticky lg:top-6 lg:self-start">
        <ChapterList
          chapters={episode.chapters}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      </div>
    </>
  );
}
