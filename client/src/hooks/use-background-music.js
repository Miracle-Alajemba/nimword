import { useEffect, useRef, useState } from "react";

const TRACKS = {
  lobby: "/audio/lobby-music.mp3",
  game: "/audio/game-music.mp3",
};

export function useBackgroundMusic(screen) {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem("wordpot_music_muted") === "true";
    } catch {
      return false;
    }
  });

  const track =
    screen === "match-room" || screen === "practice" || screen === "daily-challenge"
      ? TRACKS.game
      : TRACKS.lobby;

  // Handle track changes
  useEffect(() => {
    // Clean up previous audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(track);
    audio.loop = true;
    audio.volume = 0.45;
    audio.muted = muted;
    audioRef.current = audio;

    if (!muted) {
      audio.play().catch(() => {
        // Autoplay might be blocked until user interacts
      });
    }

    return () => {
      if (audioRef.current === audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [track]);

  // Sync mute state and local storage
  useEffect(() => {
    try {
      localStorage.setItem("wordpot_music_muted", String(muted));
    } catch { }

    if (audioRef.current) {
      audioRef.current.muted = muted;
      if (!muted) {
        // Attempt to play if unmuted
        audioRef.current.play().catch(() => { });
      } else {
        audioRef.current.pause();
      }
    }
  }, [muted]);

  // Handle global interaction unlock
  useEffect(() => {
    function unlockAudio() {
      if (audioRef.current && !audioRef.current.muted && audioRef.current.paused) {
        audioRef.current.play().catch(() => { });
      }
    }

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  function toggleMute() {
    // Calculate new state synchronously
    const nextMuted = !muted;
    setMuted(nextMuted);

    // Call play/pause synchronously in the event handler 
    // so the browser recognizes the user interaction
    if (!nextMuted && audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => { });
    } else if (nextMuted && audioRef.current) {
      audioRef.current.pause();
    }
  }

  return { muted, toggleMute };
}
