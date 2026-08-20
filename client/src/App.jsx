import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { zeroAddress } from "viem";
import { io } from "socket.io-client";
import { AppBottomNav, GameLoader } from "./components/ui/index.js";
import { HomeScreen, LobbyScreen, MatchRoomScreen } from "./components/screens/index.js";
import {
  API_BASE_URL,
  CELO_MAINNET_CHAIN_ID,
  GAME_RULES,
} from "./config/index.js";
import { useWalletSession } from "./hooks/index.js";
import { useBackgroundMusic } from "./hooks/use-background-music.js";
import { MusicToggle } from "./components/ui/music-toggle.jsx";
import {
  clearRoomSession,
  isWalletAddress,
  readRoomSession,
  saveRoomSession,
  shortenWalletAddress,
} from "./utils/index.js";

const WORDPOT_ARENA_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "roomId", type: "uint256" }],
    name: "joinRoom",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roomId", type: "uint256" }],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address payable", name: "player", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "sendDailyReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address payable", name: "recipient", type: "address" },
    ],
    name: "withdrawTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const ROOM_FEED_LIMIT = 24;
const ROOM_TX_LIMIT = 12;
const SIGNED_MESSAGE_PREFIX = "wordpot-auth:";

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
  const [settings, setSettings] = useState({
    sound: true,
    haptics: true,
    highContrast: false,
    largeText: false,
    showEarnings: true,
    showRank: true,
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
    if (!isWalletAddress(walletAddress)) return undefined;

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
    if (!isWalletAddress(walletAddress.trim()) || !walletReady) return;

    const params = new URLSearchParams(window.location.search);
    const inviteRoomId = String(params.get("room") || "").trim();
    if (!inviteRoomId) return;

    inviteRoomJoinAttemptedRef.current = true;
    handleQuickMatch(inviteRoomId);
  }, [walletAddress, walletReady]);

  async function checkDailyStatus() {
    if (!isWalletAddress(walletAddress.trim())) return;

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
    if (screen === "daily-challenge" && isWalletAddress(walletAddress.trim())) {
      checkDailyStatus();
    }
  }, [screen, walletAddress]);

  async function recordDailyPlay() {
    if (!isWalletAddress(walletAddress.trim())) return false;

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
      if (data.nextAvailableAt) setDailyNextAvailableAt(data.nextAvailableAt);
      else setDailyNextAvailableAt(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
      return true;
    } catch {
      return false;
    }
  }

  async function signWalletMessage(message) {
    const provider = getInjectedProvider();
    if (!provider?.request) {
      throw new Error("Reconnect your wallet in this browser, then claim again.");
    }

    return provider.request({
      method: "personal_sign",
      params: [message, walletAddress.trim()],
    });
  }

  async function claimDailyReward(sessionId) {
    setDailyClaimError("");
    setDailyClaimMessage("");

    if (!isWalletAddress(walletAddress.trim())) {
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

    setDailyClaimBusy(true);
    try {
      const signature = await signWalletMessage(
        `${SIGNED_MESSAGE_PREFIX}daily-claim:${walletAddress.trim()}`,
      );
      const response = await fetch(`${API_BASE_URL}/daily/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          sessionId,
          signature,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to claim daily reward.");
      }

      setDailyClaimed(true);
      setDailyPlayed(true);
      setDailyClaimTx(data.txHash || "");
      setDailyClaimAmount(data.amount || "");
      setDailyClaimMessage(`Claimed! ${data.amount || "Your reward"} is on its way to your wallet.`);
    } catch (error) {
      setDailyClaimError(error.message || "Unable to claim daily reward.");
    } finally {
      setDailyClaimBusy(false);
    }
  }

  async function handleHomeJoin() {
    setRoomError("");

    if (!walletAddress) {
      await connectWallet();
      return;
    }

    if (!walletReady) {
      await connectWallet();
      return;
    }

    await handleQuickMatch();
  }

  async function handleQuickMatch(targetRoomId = "") {
    setRoomError("");
    setRoomMessage("");

    if (!isWalletAddress(walletAddress.trim())) {
      setRoomError("Connect a valid wallet before joining quick match.");
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const inviteRoomId = String(targetRoomId || params.get("room") || "").trim();
      const endpoint = inviteRoomId
        ? `${API_BASE_URL}/rooms/${encodeURIComponent(inviteRoomId)}/join`
        : `${API_BASE_URL}/rooms/quick-match`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: walletAddress.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to join a quick match.");
      }

      setRoom(data.room);
      window.history.replaceState({}, "", window.location.pathname);
      setPlayerId(data.playerId);
      saveRoomSession({
        roomId: data.room.id,
        playerId: data.playerId,
        walletAddress: walletAddress.trim(),
      });
      setRoomMessage(
        inviteRoomId
          ? "You joined the invited room. Confirm your entry to lock your seat."
          : "You joined a public room. Invite more players or refresh the lobby.",
      );
      setScreen("lobby");
    } catch (error) {
      setRoomError(error.message || "Unable to join quick match.");
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

    try {
      setPaymentBusy(true);
      setRoomError("");
      setRoomMessage("Confirming 1 NIM entry fee checkout...");

      const txHash = await stakeNimToPlay(1);

      const recordResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}/join-tx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          walletAddress: walletAddress.trim(),
          txHash,
          amount: "1 NIM",
          mode: "nimiq_pay",
        }),
      });
      const recordData = await recordResponse.json();

      if (!recordResponse.ok) {
        throw new Error(recordData.error || "Unable to record the 1 NIM entry fee transaction.");
      }

      setRoom(recordData.room);
      setRoomMessage(`1 NIM entry confirmed! Tx: ${txHash.slice(0, 14)}... Your seat is locked in.`);
    } catch (error) {
      setRoomError(error.message || "Unable to complete 1 NIM stake payment.");
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

    const contractAddress = room?.onchain?.contractAddress;
    const contractRoomId = room?.onchain?.contractRoomId;

    if (!isWalletAddress(contractAddress) || contractAddress === zeroAddress || !contractRoomId) {
      setRoomError("Contract configuration incomplete. Please wait for the operator to settle the room.");
      return;
    }

    const provider = getInjectedProvider();
    if (!provider?.request) {
      setRoomError("Open WordPot inside MiniPay or a wallet browser to claim your reward.");
      return;
    }

    setClaimBusy(true);
    try {
      setRoomError("");
      setRoomMessage(
        isMiniPay
          ? "MiniPay will finalize scores onchain, then ask you to confirm the reward claim."
          : "Finalizing scores onchain before reward claim...",
      );

      const settleResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          walletAddress: myPlayer.walletAddress,
        }),
      });
      const settleData = await settleResponse.json();

      if (!settleResponse.ok) {
        throw new Error(settleData.error || "Unable to settle this room onchain yet.");
      }

      if (settleData.room) {
        setRoom(settleData.room);
      }

      setRoomMessage(
        isMiniPay
          ? "MiniPay will now ask you to confirm the reward claim transaction."
          : "Confirm the reward claim in your wallet...",
      );

      await ensureCeloMainnet(provider, room?.onchain?.chainId || CELO_MAINNET_CHAIN_ID);
      const targetChainId = room?.onchain?.chainId || CELO_MAINNET_CHAIN_ID;
      const walletClient = getWalletClient(targetChainId);
      const publicClient = getPublicClient(targetChainId);

      let txHash = "";
      if (walletClient && publicClient) {
        const [account] = await walletClient.getAddresses();
        
        // Call the smart contract's claimReward function
        txHash = await walletClient.writeContract({
          account,
          chain: walletClient.chain,
          address: contractAddress,
          abi: WORDPOT_ARENA_ABI,
          functionName: "claimReward",
          args: [BigInt(contractRoomId)],
        });

        // Wait for the transaction to be confirmed on the blockchain
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } else {
        setRoomError("Wallet client not available. Please use MiniPay or MetaMask.");
        return;
      }

      // Record the claim transaction on the server
      const recordResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}/claim-tx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          walletAddress: myPlayer.walletAddress,
          txHash,
          amount: String(myPayout.amount),
        }),
      });

      const recordData = await recordResponse.json();

      if (!recordResponse.ok) {
        throw new Error(recordData.error || "Failed to record the claim transaction.");
      }

      setRoom(recordData.room);
      setRoomMessage(
        isMiniPay
          ? `MiniPay claim confirmed! You will receive ${myPayout.amount} CELO. TX: ${txHash.slice(0, 10)}...`
          : `Claim confirmed! You will receive ${myPayout.amount} CELO. TX: ${txHash.slice(0, 10)}...`,
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
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
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
      walletProviderName={walletProviderName}
      walletNetworkLabel={walletNetworkLabel}
      walletConnectLabel={walletConnectLabel}
      walletEnvironmentHint={walletEnvironmentHint}
      isMiniPay={isMiniPay}
      hasInjectedProvider={hasInjectedProvider}
      onConnectWallet={connectWallet}
      onDisconnectWallet={disconnectWallet}
      walletHint={walletHint}
      roomError={roomError}
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
            getInjectedProvider={getInjectedProvider}
            getWalletClient={getWalletClient}
            getPublicClient={getPublicClient}
            ensureCeloMainnet={ensureCeloMainnet}
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
          getInjectedProvider={getInjectedProvider}
          getWalletClient={getWalletClient}
          getPublicClient={getPublicClient}
          ensureCeloMainnet={ensureCeloMainnet}
          isMiniPay={isMiniPay}
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

  return (
    <div
      className={[
        "app-dark-mode",
        settings.largeText ? "app-text-scale" : "",
        settings.highContrast ? "app-high-contrast" : "",
      ].filter(Boolean).join(" ")}
    >
      {content}
      <AppBottomNav
        screen={screen}
        onNavigate={setScreen}
        walletAddress={walletAddress}
        onWalletAction={walletAddress ? disconnectWallet : connectWallet}
        musicToggle={musicToggleEl}
      />
    </div>
  );
}
