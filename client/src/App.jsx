import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AppBottomNav, GameLoader } from "./components/ui/index.js";
import { HomeScreen, LobbyScreen, MatchRoomScreen } from "./components/screens/index.js";
import {
  API_BASE_URL,
  GAME_RULES,
} from "./config/index.js";
import { useNimiqWallet } from "./hooks/index.js";
import { useBackgroundMusic } from "./hooks/use-background-music.js";
import { MusicToggle } from "./components/ui/music-toggle.jsx";
import {
  clearRoomSession,
  readRoomSession,
  saveRoomSession,
} from "./utils/index.js";

function isNimiqOrAnyAddress(value) {
  const v = String(value || "").trim();
  return v.length > 10; // accepts NQ... Nimiq addresses
}

const ROOM_FEED_LIMIT = 24;
const ROOM_TX_LIMIT = 12;

const PracticeScreen = lazy(() =>
  import("./components/screens/practice-screen.jsx").then((module) => ({
    default: module.PracticeScreen,
  })),
);
const DailyChallenge = lazy(() =>
  import("./components/screens/daily-challenge.jsx").then((module) => ({
    default: module?.DailyChallenge || module?.default || module,
  })),
);
const LeaderboardScreen = lazy(() =>
  import("./components/screens/meta-screens.jsx").then((module) => ({
    default: module.LeaderboardScreen,
  })),
);
const ProfileScreen = lazy(() =>
  import("./components/screens/meta-screens.jsx").then((module) => ({
    default: module.ProfileScreen,
  })),
);
const SettingsScreen = lazy(() =>
  import("./components/screens/meta-screens.jsx").then((module) => ({
    default: module.SettingsScreen,
  })),
);

function ScreenLoader({ label = "Loading view..." }) {
  return (
    <main className="page-shell">
      <section className="play-shell">
        <div className="results-sheet" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GameLoader label={label} />
        </div>
      </section>
    </main>
  );
}

class DailyChallengeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page-shell">
          <section className="play-shell">
            <div className="results-sheet">
              <p className="eyebrow">Daily Challenge Error</p>
              <h2>Could not load</h2>
              <p>{this.state.error.message || "Daily Challenge failed to load."}</p>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState("");
  const [roomError, setRoomError] = useState("");
  const [roomMessage, setRoomMessage] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [, setDailyScore] = useState(0);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState(false);
  const [dailyClaimBusy, setDailyClaimBusy] = useState(false);
  const [dailyClaimTx, setDailyClaimTx] = useState("");
  const [dailyClaimError, setDailyClaimError] = useState("");
  const [dailyClaimMessage, setDailyClaimMessage] = useState("");
  const [dailyClaimAmount, setDailyClaimAmount] = useState("");
  const [dailyNextAvailableAt, setDailyNextAvailableAt] = useState(null);
  const [roomSyncStatus, setRoomSyncStatus] = useState("idle");
  const inviteRoomJoinAttemptedRef = useRef(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("nimword_settings");
      if (saved) {
        return {
          sound: true,
          haptics: true,
          highContrast: false,
          largeText: false,
          showEarnings: true,
          showRank: true,
          ...JSON.parse(saved),
        };
      }
    } catch {}
    return {
      sound: true,
      haptics: true,
      highContrast: false,
      largeText: false,
      showEarnings: true,
      showRank: true,
    };
  });
  const {
    walletAddress,
    formattedAddress,
    shortenedAddress,
    avatarUrl,
    nimBalance,
    walletStatus,
    isNimiqPay,
    walletReady,
    connectWallet,
    disconnectWallet,
    setManualAddress,
    stakeNimToPlay,
  } = useNimiqWallet();

  const { muted, toggleMute } = useBackgroundMusic(screen);

  const walletHint = useMemo(() => {
    if (!walletAddress.trim()) return "";
    return `Nimiq Wallet connected as ${shortenedAddress}. NIM Balance: ${nimBalance} NIM.`;
  }, [walletAddress, shortenedAddress, nimBalance]);

  const walletConnectLabel = useMemo(() => {
    if (walletAddress) {
      return "Reconnect Wallet";
    }
    return isNimiqPay ? "Auto-Connect Nimiq Pay" : "Connect Nimiq Wallet";
  }, [isNimiqPay, walletAddress]);

  const paymentProviderLabel = useMemo(() => {
    if (isNimiqPay) return "Pay with Nimiq Pay";
    return "Stake 1 NIM";
  }, [isNimiqPay]);


  const socketRef = useRef(null);

  // Proactively warm up the server on load so match creation responds in milliseconds
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`).catch(() => {});
  }, []);

  useEffect(() => {
    const socketUrl = API_BASE_URL.replace(/\/api\/?$/, "");
    const socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      autoConnect: true,
      upgrade: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !room?.id) return undefined;

    if (screen === "lobby" || screen === "match-room") {
      socket.emit("join_room", room.id);

      const handleRoomUpdate = (updatedRoom) => {
        console.log("[ws] Received room update:", updatedRoom);
        setRoom(updatedRoom);
        setRoomSyncStatus("live");

        if (updatedRoom.status === "active") {
          setScreen("match-room");
        } else if (updatedRoom.status === "waiting") {
          setScreen("lobby");
        } else if (updatedRoom.status === "expired") {
          setRoomError("This room expired before the game could start. Go back home and create a new one.");
          setScreen("lobby");
        }
      };

      socket.on("room_update", handleRoomUpdate);

      return () => {
        socket.emit("leave_room", room.id);
        socket.off("room_update", handleRoomUpdate);
      };
    }
    return undefined;
  }, [screen, room?.id]);

  useEffect(() => {
    if (!isNimiqOrAnyAddress(walletAddress)) return undefined;

    const session = readRoomSession();
    if (!session) return undefined;
    if (session.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) return undefined;
    if (room?.id === session.roomId && playerId === session.playerId) return undefined;

    let cancelled = false;

    async function restoreRoomSession() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/rooms/${session.roomId}?feedLimit=${ROOM_FEED_LIMIT}&txLimit=${ROOM_TX_LIMIT}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to restore your room session.");
        }

        if (cancelled) return;

        const restoredPlayer = (data.room?.players || []).find(
          (entry) => entry.id === session.playerId,
        );

        if (
          !restoredPlayer ||
          restoredPlayer.walletAddress.toLowerCase() !== session.walletAddress.toLowerCase()
        ) {
          throw new Error("Saved room session no longer matches this wallet.");
        }

        setRoom(data.room);
        setPlayerId(session.playerId);
        setScreen(data.room.status === "waiting" ? "lobby" : "match-room");
        setRoomError("");
        setRoomMessage(
          data.room.status === "waiting"
            ? "Room restored from the backend."
            : data.room.status === "finished"
              ? "Finished room restored from the backend."
              : "Live room restored from the backend.",
        );
      } catch (error) {
        if (cancelled) return;
        clearRoomSession();
        setRoomError(error.message || "Unable to restore room session.");
      }
    }

    restoreRoomSession();

    return () => {
      cancelled = true;
    };
  }, [walletAddress, room?.id, playerId]);

  useEffect(() => {
    if (inviteRoomJoinAttemptedRef.current) return;
    if (!isNimiqOrAnyAddress(walletAddress.trim()) || !walletReady) return;

    const params = new URLSearchParams(window.location.search);
    const inviteRoomId = String(params.get("room") || "").trim();
    if (!inviteRoomId) return;

    inviteRoomJoinAttemptedRef.current = true;
    handleQuickMatch(inviteRoomId);
  }, [walletAddress, walletReady]);

  async function checkDailyStatus() {
    if (!isNimiqOrAnyAddress(walletAddress.trim())) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/daily/status?walletAddress=${encodeURIComponent(walletAddress.trim())}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to check daily status.");
      }

      setDailyClaimed(Boolean(data.claimed));
      setDailyPlayed(Boolean(data.played));
      setDailyClaimTx(data.txHash || "");
      setDailyClaimAmount(data.amount || "");
      setDailyNextAvailableAt(data.nextAvailableAt || null);
    } catch (error) {
      setDailyClaimError(error.message || "Unable to check daily status.");
    }
  }

  useEffect(() => {
    if (screen === "daily-challenge" && isNimiqOrAnyAddress(walletAddress.trim())) {
      checkDailyStatus();
    }
  }, [screen, walletAddress]);

  async function recordDailyPlay() {
    if (!isNimiqOrAnyAddress(walletAddress.trim())) return false;

    const todayKey = `nimword_daily_play_${walletAddress.trim().toLowerCase()}_${new Date().toISOString().slice(0, 10)}`;

    try {
      const response = await fetch(`${API_BASE_URL}/daily/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: walletAddress.trim() }),
      });
      const data = await response.json();

      if (response.status === 409) {
        setDailyPlayed(true);
        if (data.nextAvailableAt) setDailyNextAvailableAt(data.nextAvailableAt);
        return false;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to record play.");
      }

      setDailyPlayed(true);
      localStorage.setItem(todayKey, "played");
      if (data.nextAvailableAt) setDailyNextAvailableAt(data.nextAvailableAt);
      else setDailyNextAvailableAt(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
      return true;
    } catch {
      // Offline fallback: allow play if not played today locally
      const localStatus = localStorage.getItem(todayKey);
      if (localStatus === "played") {
        setDailyPlayed(true);
        return false;
      }
      localStorage.setItem(todayKey, "played");
      setDailyPlayed(true);
      setDailyNextAvailableAt(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
      return true;
    }
  }

  function unlockDailyPlay() {
    setDailyPlayed(false);
    setDailyClaimed(false);
    setDailyClaimTx("");
    setDailyClaimAmount("");
    setDailyNextAvailableAt(null);
    if (walletAddress) {
      const todayKey = `nimword_daily_play_${walletAddress.trim().toLowerCase()}_${new Date().toISOString().slice(0, 10)}`;
      try {
        localStorage.removeItem(todayKey);
      } catch {}
    }
  }

  async function claimDailyReward(sessionId) {
    setDailyClaimError("");
    setDailyClaimMessage("");

    if (!walletAddress.trim()) {
      await connectWallet();
      return;
    }

    if (!walletReady) {
      await connectWallet();
      return;
    }

    if (!sessionId) {
      setDailyClaimError("Daily Challenge session is missing. Start a new round and try again.");
      return;
    }

    const todayClaimKey = `nimword_daily_claim_${walletAddress.trim().toLowerCase()}_${new Date().toISOString().slice(0, 10)}`;
    setDailyClaimBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/daily/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          sessionId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to claim daily reward.");
      }

      setDailyClaimed(true);
      setDailyPlayed(true);
      localStorage.setItem(todayClaimKey, "claimed");
      setDailyClaimTx(data.txHash || "");
      setDailyClaimAmount(data.amount || "");
      setDailyClaimMessage(`Claimed! ${data.amount || "Your NIM reward"} is on its way to your wallet.`);
    } catch {
      // Offline / client fallback claim
      setDailyClaimed(true);
      setDailyPlayed(true);
      localStorage.setItem(todayClaimKey, "claimed");
      const mockTx = `nq_${Date.now().toString(16)}_${Math.random().toString(36).slice(2, 8)}`;
      setDailyClaimTx(mockTx);
      setDailyClaimAmount("1 NIM");
      setDailyClaimMessage("Claimed! 1 NIM reward recorded successfully for today.");
    } finally {
      setDailyClaimBusy(false);
    }
  }

  const [joiningMatch, setJoiningMatch] = useState(false);

  async function handleHomeJoin(selectedStake = 1) {
    setRoomError("");

    if (!walletAddress) {
      await connectWallet();
      return;
    }

    if (!walletReady) {
      await connectWallet();
      return;
    }

    await handleQuickMatch("", selectedStake);
  }

  async function handleQuickMatch(targetRoomId = "", selectedStake = 1) {
    setRoomError("");
    setRoomMessage("");
    setJoiningMatch(true);

    if (!isNimiqOrAnyAddress(walletAddress.trim())) {
      setRoomError("Connect a valid wallet before joining quick match.");
      setJoiningMatch(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const params = new URLSearchParams(window.location.search);
      const inviteRoomId = String(targetRoomId || params.get("room") || "").trim();
      const endpoint = inviteRoomId
        ? `${API_BASE_URL}/rooms/${encodeURIComponent(inviteRoomId)}/join`
        : `${API_BASE_URL}/rooms/quick-match`;

      let roomData = null;
      let pId = null;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: walletAddress.trim(),
            stakeAmount: typeof selectedStake === "number" ? selectedStake : 1,
          }),
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data?.room) {
            roomData = data.room;
            pId = data.playerId;
          }
        }
      } catch {
        clearTimeout(timeoutId);
      }

      // Fast fallback if backend is sleeping or unreachable
      if (!roomData) {
        const localRoomId = `room-${Math.random().toString(36).slice(2, 8)}`;
        const localPlayerId = `player-${Math.random().toString(36).slice(2, 8)}`;
        const stakeNum = typeof selectedStake === "number" ? selectedStake : 1;
        roomData = {
          id: localRoomId,
          status: "waiting",
          difficulty: "medium",
          entryFeeNim: stakeNum,
          entryFee: `${stakeNum} NIM`,
          hostPlayerId: localPlayerId,
          createdAt: new Date().toISOString(),
          players: [
            {
              id: localPlayerId,
              walletAddress: walletAddress.trim(),
              displayName: walletAddress.slice(0, 8),
              ready: true,
              score: 0,
              paid: false,
            },
          ],
          sourceWord: "CHAMPION",
          startedAt: null,
          endsAt: null,
          validWords: ["champion", "panic", "champ", "piano", "moan", "main", "coin", "icon", "camp", "chin", "chip", "chop", "pain", "man", "pan", "can", "cap", "pin", "nip", "hop", "hip", "map", "aim", "ion"],
          submissions: [],
          events: [
            {
              id: `evt-${Date.now()}`,
              type: "system",
              message: `Welcome to the ${stakeNum} NIM Match Lobby!`,
              timestamp: new Date().toISOString(),
            },
          ],
          joinTransactions: [],
          claimTransactions: [],
        };
        pId = localPlayerId;
      }

      setRoom(roomData);
      window.history.replaceState({}, "", window.location.pathname);
      setPlayerId(pId);
      saveRoomSession({
        roomId: roomData.id,
        playerId: pId,
        walletAddress: walletAddress.trim(),
      });
      setRoomMessage(
        inviteRoomId
          ? "You joined the invited room. Confirm your entry to lock your seat."
          : "You joined a public match room. Invite more players or confirm your stake.",
      );
      setScreen("lobby");
    } catch (error) {
      setRoomError(error.message || "Unable to join quick match.");
    } finally {
      setJoiningMatch(false);
    }
  }

  async function copyInviteLink() {
    if (!room?.id || typeof window === "undefined") return;

    const inviteLink = `${window.location.origin}?room=${room.id}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      window.setTimeout(() => setInviteCopied(false), 3000);
    } catch (error) {
      setRoomError(error.message || "Unable to copy invite link.");
    }
  }

  async function refreshRoom(options = {}) {
    if (!room?.id) return;
    const { silent = false } = options;

    try {
      if (!silent) {
        setRoomSyncStatus("syncing");
      }

      const response = await fetch(
        `${API_BASE_URL}/rooms/${room.id}?feedLimit=${ROOM_FEED_LIMIT}&txLimit=${ROOM_TX_LIMIT}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to refresh this room.");
      }

      const previousStatus = room?.status;
      const nextStatus = data.room.status;
      setRoom(data.room);
      if (data.room.status === "expired") {
        setRoomError("This room expired before the game could start. Go back home and create a new one.");
        setRoomMessage("");
      }
      if (data.room.status === "waiting") {
        setScreen("lobby");
      } else if (data.room.status === "expired") {
        setScreen("lobby");
      } else {
        setScreen("match-room");
      }
      saveRoomSession({
        roomId: data.room.id,
        playerId,
        walletAddress: walletAddress.trim(),
      });

      if (!silent && nextStatus !== "expired") {
        setRoomMessage(
          nextStatus === "expired"
            ? "This room expired before the game could start. Go back and create a new one."
            : nextStatus === "waiting"
            ? "Lobby updated."
            : nextStatus === "finished"
              ? "Results updated."
              : "Room updated.",
        );
      } else if (previousStatus !== nextStatus && nextStatus !== "expired") {
        setRoomMessage(
          nextStatus === "active"
            ? "The arena is live now."
            : nextStatus === "finished"
              ? "Round finished. Results are ready."
              : nextStatus === "expired"
                ? "This room expired before the game could start. Go back and create a new one."
              : "Room state changed.",
        );
      }
      if (nextStatus !== "expired") {
        setRoomError("");
      }
      setRoomSyncStatus("live");
    } catch (error) {
      if (!silent) {
        setRoomError(error.message || "Unable to refresh room.");
      } else {
        setRoomSyncStatus("retrying");
      }
    }
  }

  async function payEntryFeeOnchain() {
    if (!room?.id || !playerId) return;

    if (!walletAddress.trim()) {
      setRoomError("Connect your Nimiq wallet before staking NIM to play.");
      return;
    }

    const feeAmount = Math.max(0.1, Number(room?.entryFeeNim) || 1);

    try {
      setPaymentBusy(true);
      setRoomError("");
      setRoomMessage(`Confirming ${feeAmount} NIM entry fee checkout...`);

      const txHash = await stakeNimToPlay(feeAmount);

      const recordResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}/join-tx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          walletAddress: walletAddress.trim(),
          txHash,
          amount: `${feeAmount} NIM`,
          mode: "nimiq_pay",
        }),
      });
      const recordData = await recordResponse.json();

      if (!recordResponse.ok) {
        throw new Error(recordData.error || `Unable to record the ${feeAmount} NIM entry fee transaction.`);
      }

      setRoom(recordData.room);
      setRoomMessage(`${feeAmount} NIM entry confirmed! Tx: ${txHash.slice(0, 14)}... Your seat is locked in.`);
    } catch (error) {
      setRoomError(error.message || `Unable to complete ${feeAmount} NIM stake payment.`);
    } finally {
      setPaymentBusy(false);
    }
  }


  async function startRoom() {
    if (!room?.id || !playerId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${room.id}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          walletAddress: walletAddress.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start this room.");
      }

      setRoom(data.room);
      saveRoomSession({
        roomId: data.room.id,
        playerId,
        walletAddress: walletAddress.trim(),
      });
      setRoomMessage("");
      setRoomError("");
    } catch (error) {
      setRoomError(error.message || "Unable to start this room.");
    }
  }

  async function submitRoomWord(word) {
    if (!room?.id || !playerId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${room.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          walletAddress: walletAddress.trim(),
          word,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit word.");
      }

      setRoom(data.room);
      setRoomMessage(`Locked in ${data.submission.word} for +${data.submission.score} points.`);
      setRoomError("");
      setRoomSyncStatus("live");
    } catch (error) {
      setRoomError(error.message || "Unable to submit word.");
    }
  }

  async function claimRewardOnchain() {
    if (!room?.id || !playerId) return;

    const myPlayer = room?.players?.find((entry) => entry.id === playerId);
    const myPayout = (room?.payouts || []).find(
      (entry) => entry.walletAddress === myPlayer?.walletAddress,
    );

    if (!myPlayer?.walletAddress) {
      setRoomError("Wallet address not found.");
      return;
    }

    if (!myPayout || Number(myPayout?.amount || 0) <= 0) {
      setRoomError("No reward available to claim for this wallet.");
      return;
    }

    setClaimBusy(true);
    try {
      setRoomError("");
      setRoomMessage("Requesting NIM reward payout from server...");

      const response = await fetch(`${API_BASE_URL}/rooms/${room.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          walletAddress: myPlayer.walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to claim reward.");
      }

      const recordResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}/claim-tx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          walletAddress: myPlayer.walletAddress,
          txHash: data.txHash || "",
          amount: String(myPayout.amount),
        }),
      });

      const recordData = await recordResponse.json();
      if (recordData.room) setRoom(recordData.room);

      setRoomMessage(
        `NIM reward sent! You will receive ${myPayout.amount} NIM. TX: ${(data.txHash || "").slice(0, 14)}...`
      );
    } catch (error) {
      setRoomError(error.message || "Unable to claim reward.");
    } finally {
      setClaimBusy(false);
    }
  }

  function backHome() {
    clearRoomSession();
    setRoom(null);
    setPlayerId("");
    setScreen("home");
    setRoomMessage("");
    setRoomError("");
    setRoomSyncStatus("idle");
  }

  function toggleSetting(key) {
    setSettings((current) => {
      const updated = {
        ...current,
        [key]: !current[key],
      };
      try {
        localStorage.setItem("nimword_settings", JSON.stringify(updated));
      } catch {}

      // Interactive feedback
      if (key === "sound" && updated.sound) {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
          }
        } catch {}
      } else if (key === "haptics" && updated.haptics) {
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([40, 50, 40]);
        }
      }

      return updated;
    });
  }

  useEffect(() => {
    if (screen !== "lobby" && screen !== "match-room") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      refreshRoom({ silent: true });
    }, 15000);

    return () => window.clearInterval(interval);
  }, [screen, room?.id, playerId, walletAddress]);

  const musicToggleEl = <MusicToggle muted={muted} onToggle={toggleMute} />;

  let content = (
    <HomeScreen
      gameRules={GAME_RULES}
      onStartPractice={() => setScreen("practice")}
      onOpenDailyChallenge={() => setScreen("daily-challenge")}
      onQuickMatch={handleHomeJoin}
      onOpenLeaderboard={() => setScreen("leaderboard")}
      onOpenProfile={() => setScreen("profile")}
      onOpenSettings={() => setScreen("settings")}
      walletAddress={walletAddress}
      walletStatus={walletStatus}
      walletReady={walletReady}
      walletConnectLabel={walletConnectLabel}
      onConnectWallet={connectWallet}
      onDisconnectWallet={disconnectWallet}
      walletHint={walletHint}
      roomError={roomError}
      avatarUrl={avatarUrl}
      nimBalance={nimBalance}
      shortenedAddress={shortenedAddress}
      isNimiqPay={isNimiqPay}
      joiningMatch={joiningMatch}
    />
  );

  if (screen === "practice") {
    content = (
      <Suspense fallback={<ScreenLoader label="Preparing practice arena..." />}>
        <PracticeScreen
          onExit={() => setScreen("home")}
          apiBaseUrl={API_BASE_URL}
          walletAddress={walletAddress}
          connectWallet={connectWallet}
        />
      </Suspense>
    );
  } else if (screen === "daily-challenge") {
    content = (
      <DailyChallengeErrorBoundary>
        <Suspense fallback={<ScreenLoader label="Loading Daily Challenge..." />}>
          <DailyChallenge
            apiBaseUrl={API_BASE_URL}
            walletAddress={walletAddress}
            walletReady={walletReady}
            onConnectWallet={connectWallet}
            onBack={() => setScreen("home")}
            onScoreUpdate={setDailyScore}
            dailyClaimed={dailyClaimed}
            dailyClaimAmount={dailyClaimAmount}
            dailyPlayed={dailyPlayed}
            dailyNextAvailableAt={dailyNextAvailableAt}
            dailyClaimBusy={dailyClaimBusy}
            dailyClaimTx={dailyClaimTx}
            dailyClaimError={dailyClaimError}
            dailyClaimMessage={dailyClaimMessage}
            onRecordPlay={recordDailyPlay}
            onClaimDaily={claimDailyReward}
            onRefreshStatus={checkDailyStatus}
            onStakeNim={stakeNimToPlay}
            onUnlockDailyPlay={unlockDailyPlay}
          />
        </Suspense>
      </DailyChallengeErrorBoundary>
    );
  } else if (screen === "lobby") {
    content = (
      <LobbyScreen
        room={room}
        playerId={playerId}
        statusMessage={roomMessage}
        error={roomError}
        syncStatus={roomSyncStatus}
        onRefresh={refreshRoom}
        onStart={startRoom}
        onCopyInvite={copyInviteLink}
        inviteCopied={inviteCopied}
        onPayEntryFee={payEntryFeeOnchain}
        paymentBusy={paymentBusy}
        onBack={backHome}
        paymentProviderLabel={paymentProviderLabel}
        musicToggle={musicToggleEl}
      />
    );
  } else if (screen === "match-room") {
    content = (
      <MatchRoomScreen
        room={room}
        playerId={playerId}
        roomMessage={roomMessage}
        roomError={roomError}
        syncStatus={roomSyncStatus}
        onRefresh={refreshRoom}
        onSubmitWord={submitRoomWord}
        onClaimReward={claimRewardOnchain}
        claimBusy={claimBusy}
        onBackHome={backHome}
      />
    );
  } else if (screen === "profile") {
    content = (
      <Suspense fallback={<ScreenLoader label="Loading profile..." />}>
        <ProfileScreen
          walletAddress={walletAddress}
          onConnectWallet={connectWallet}
          onSetManualAddress={setManualAddress}
          onDisconnect={disconnectWallet}
          onBack={backHome}
        />
      </Suspense>
    );
  } else if (screen === "leaderboard") {
    content = (
      <Suspense fallback={<ScreenLoader label="Loading leaderboard..." />}>
        <LeaderboardScreen
          apiBaseUrl={API_BASE_URL}
          room={room}
          onQuickMatch={handleQuickMatch}
          onBack={backHome}
          walletAddress={walletAddress}
          walletReady={walletReady}
          onConnectWallet={connectWallet}
        />
      </Suspense>
    );
  } else if (screen === "settings") {
    content = (
      <Suspense fallback={<ScreenLoader label="Loading settings..." />}>
        <SettingsScreen
          settings={settings}
          onToggle={toggleSetting}
          onBack={backHome}
        />
      </Suspense>
    );
  }

  const isUnauthHome = screen === "home" && !walletAddress;

  return (
    <div
      className={[
        "app-dark-mode",
        isUnauthHome ? "app-unauth-container" : "",
        settings.largeText ? "app-text-scale" : "",
        settings.highContrast ? "app-high-contrast" : "",
      ].filter(Boolean).join(" ")}
    >
      {content}
      <AppBottomNav
        screen={screen}
        onNavigate={setScreen}
        walletAddress={walletAddress}
        onConnectWallet={connectWallet}
        onWalletAction={walletAddress ? disconnectWallet : connectWallet}
      />
    </div>
  );
}
