import { vi } from "vitest";

export function setupAudioMock() {
  Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, "load", {
    configurable: true,
    value: vi.fn(),
  });

  let _playbackRate = 1;
  Object.defineProperty(window.HTMLMediaElement.prototype, "playbackRate", {
    configurable: true,
    get: () => _playbackRate,
    set: (v: number) => {
      _playbackRate = v;
    },
  });

  let _muted = false;
  Object.defineProperty(window.HTMLMediaElement.prototype, "muted", {
    configurable: true,
    get: () => _muted,
    set: (v: boolean) => {
      _muted = v;
    },
  });
}
