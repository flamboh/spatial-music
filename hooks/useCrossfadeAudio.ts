import { setIsAudioActiveAsync, useAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CrossfadeOptions = {
  durationMs?: number;
  preRollMs?: number;
};

export function useCrossfadeAudio({
  durationMs = 10000,
  preRollMs = 200,
}: CrossfadeOptions = {}) {
  const playerA = useAudioPlayer();
  const playerB = useAudioPlayer();
  const [active, setActive] = useState<"a" | "b">("a");
  const [isPaused, setIsPaused] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPlayer = useMemo(
    () => (active === "a" ? playerA : playerB),
    [active, playerA, playerB]
  );
  const nextPlayer = useMemo(
    () => (active === "a" ? playerB : playerA),
    [active, playerA, playerB]
  );

  useEffect(() => {
    return () => {
      if (fadeTimer.current) {
        clearInterval(fadeTimer.current);
      }
      playerA?.pause();
      playerB?.pause();
    };
  }, [playerA, playerB]);

  const crossfadeTo = useCallback(
    async (source?: string | null) => {
      if (!source) return;
      if (fadeTimer.current) {
        clearInterval(fadeTimer.current);
        fadeTimer.current = null;
      }
      try {
        nextPlayer.replace(source);
        nextPlayer.volume = 0;
        currentPlayer.volume = 1;
        await nextPlayer.play();
        const start = Date.now();
        fadeTimer.current = setInterval(() => {
          const elapsed = Date.now() - start;
          const t = Math.min(
            1,
            Math.max(0, (elapsed - preRollMs) / durationMs)
          );
          const outgoingVolume = 1 - t;
          const incomingVolume = t;
          nextPlayer.volume = incomingVolume;
          currentPlayer.volume = outgoingVolume;
          if (t >= 1) {
            clearInterval(fadeTimer.current!);
            fadeTimer.current = null;
            currentPlayer.pause();
            currentPlayer.volume = 1;
            setActive((prev) => (prev === "a" ? "b" : "a"));
            setIsPaused(false);
          }
        }, 30);
      } catch (error) {
        console.warn("Crossfade failed", error);
      }
    },
    [currentPlayer, durationMs, nextPlayer, preRollMs]
  );

  const togglePause = useCallback(async () => {
    try {
      if (isPaused) {
        await setIsAudioActiveAsync(true);
        currentPlayer.play();
        setIsPaused(false);
      } else {
        currentPlayer.pause();
        await setIsAudioActiveAsync(false);
        setIsPaused(true);
      }
    } catch (error) {
      console.warn("Audio toggle failed", error);
    }
  }, [currentPlayer, isPaused]);

  return {
    isPaused,
    crossfadeTo,
    togglePause,
    currentPlayer,
  };
}
