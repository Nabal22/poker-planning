"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { useRoomStore } from "@/store/useRoomStore";
import { connectSocket } from "@/lib/socket";
import { PokerTable, type PaperBallAnim } from "./PokerTable";
import { VotingCards } from "./VotingCards";
import { TicketPanel } from "./TicketPanel";
import { TicketDetail } from "./TicketDetail";
import { ResultsPanel } from "./ResultsPanel";
import { JiraConnector } from "./JiraConnector";
import { Modal } from "./Modal";
import { ToastContainer } from "./Toast";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { ThemeSelector } from "./ThemeSelector";
import { KonamiEasterEgg } from "./KonamiEasterEgg";
import { FallingCardsOverlay, useFallingCards } from "./FallingCardsOverlay";
import { CoinFlip } from "./CoinFlip";
import { THEMES, type ThemeId } from "@/lib/themes";
import type { JiraTicket } from "@/lib/types";
import { getIssuesAction, estimateIssueAction } from "@/lib/actions/jira";
import Image from "next/image";

interface Props {
  roomId: string;
  playerName: string;
  savedPlayerId?: string;
}

function RoomViewInner({ roomId, playerName, savedPlayerId, onChangeTheme }: Props & { onChangeTheme: (t: ThemeId) => void }) {
  const theme = useTheme();
  const { room, playerId, setRoom, setPlayerId, setPlayerName, addToast, updatePlayerVoted, revealVotes, resetVotes: storeResetVotes, addPlayer } = useRoomStore();
  const [socket] = useState(() => connectSocket());
  const [myVote, setMyVote] = useState<string | null>(null);
  const [jiraEnabled, setJiraEnabled] = useState(false);
  const [jiraJql, setJiraJql] = useState<string | null>(null);
  const [sendingToJira, setSendingToJira] = useState(false);
  const [refreshingJira, setRefreshingJira] = useState(false);
  const [jiraModalOpen, setJiraModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paperBalls, setPaperBalls] = useState<PaperBallAnim[]>([]);
  const paperBallIdRef = useRef(0);
  const { active: celebrationActive, cards: celebrationCards, trigger: triggerCelebration } = useFallingCards();
  const currentPlayerId = playerId || socket.id || "";
  const isHost = room?.host === currentPlayerId;

  const getPlayerCenter = useCallback((pid: string) => {
    const el = document.querySelector(`[data-player-id="${pid}"]`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, []);

  const spawnPaperBall = useCallback((fromId: string, toId: string) => {
    const from = getPlayerCenter(fromId);
    const to = getPlayerCenter(toId);
    if (!from || !to) return;
    const id = ++paperBallIdRef.current;
    setPaperBalls((prev) => [...prev, { id, from, to }]);
  }, [getPlayerCenter]);

  useEffect(() => {
    setPlayerName(playerName);

    const joinRoom = () => {
      const pid = savedPlayerId || socket.id || "";
      setPlayerId(pid);
      localStorage.setItem(`planning-poker-player-id:${roomId}`, pid);
      socket.emit("join-room", { roomId, playerName, playerId: pid });
    };

    socket.on("room-state", (r) => setRoom(r));
    socket.on("player-joined", (p) => {
      addPlayer(p);
      addToast(`${p.name} a rejoint la room`, "info");
    });
    socket.on("player-left", ({ name }) => addToast(`${name} s'est déconnecté`, "info"));
    socket.on("vote-received", ({ playerId: pid }) => updatePlayerVoted(pid));
    socket.on("votes-revealed", ({ votes }) => {
      revealVotes(votes);
      const voteValues = Object.values(votes as Record<string, string>).filter(Boolean);
      const isConsensus = voteValues.length > 1 && new Set(voteValues).size === 1;
      if (isConsensus) {
        triggerCelebration();
        addToast(`Consensus : ${voteValues[0]} !`, "info");
      } else {
        addToast("Votes révélés !", "info");
      }
    });
    socket.on("votes-reset", () => { storeResetVotes(); setMyVote(null); });
    socket.on("kicked", () => {
      addToast("Vous avez été exclu de la room", "error");
      setTimeout(() => (window.location.href = "/"), 2000);
    });
    socket.on("error", ({ message }) => {
      addToast(message, "error");
      if (message === "Room not found or full") {
        setTimeout(() => (window.location.href = "/"), 2000);
      }
    });
    socket.on("paper-thrown", ({ fromId, toId }) => spawnPaperBall(fromId, toId));

    // Re-join the room on every (re)connect — handles both first connect and auto-reconnects
    socket.on("connect", joinRoom);
    if (socket.connected) joinRoom();

    return () => {
      socket.off("room-state"); socket.off("player-joined"); socket.off("player-left");
      socket.off("vote-received"); socket.off("votes-revealed"); socket.off("votes-reset");
      socket.off("kicked"); socket.off("error"); socket.off("paper-thrown");
      socket.off("connect", joinRoom);
    };
  }, [socket, roomId, playerName, savedPlayerId, setPlayerName, setPlayerId, setRoom, addPlayer, addToast, updatePlayerVoted, revealVotes, storeResetVotes, spawnPaperBall, triggerCelebration]);

  const handleThrow = useCallback((toId: string) => {
    socket.emit("throw-paper", { roomId, fromId: currentPlayerId, toId });
  }, [socket, roomId, currentPlayerId]);

  const handlePaperBallComplete = useCallback((id: number) => {
    setPaperBalls((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleVote = useCallback((value: string) => {
    if (!room) return;
    setMyVote(value);
    socket.emit("vote", { roomId, playerId: currentPlayerId, value });
  }, [socket, room, roomId, currentPlayerId]);

  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleReveal = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(3);
    let n = 3;
    countdownRef.current = setInterval(() => {
      n -= 1;
      if (n > 0) {
        setCountdown(n);
      } else {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setCountdown(null);
        socket.emit("reveal", { roomId });
      }
    }, 500);
  }, [countdown, socket, roomId]);
  const handleReset = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; setCountdown(null); }
    setMyVote(null);
    socket.emit("reset-votes", { roomId });
  };
  const handleNextTicket = () => socket.emit("next-ticket", { roomId });
  const handleSelectTicket = (idx: number) => socket.emit("select-ticket", { roomId, ticketIdx: idx });
  const handleSetFinalScore = (score: string) => socket.emit("set-final-score", { roomId, score });
  const handleKick = (pid: string) => socket.emit("kick-player", { roomId, playerId: pid });
  const handleAddTicket = (ticket: JiraTicket) => socket.emit("add-ticket", { roomId, ticket });
  const handleRemoveTicket = (ticketIdx: number) => socket.emit("remove-ticket", { roomId, ticketIdx });
  const handleChangeTheme = (t: ThemeId) => {
    localStorage.setItem("poker-planning-theme", t);
    onChangeTheme(t);
  };

  const handleTicketsLoaded = (tickets: JiraTicket[], jql: string) => {
    socket.emit("load-tickets", { roomId, tickets });
    setJiraEnabled(true);
    setJiraJql(jql);
    setJiraModalOpen(false);
    addToast(`${tickets.length} tickets chargés`, "success");
  };

  const handleRefreshJira = async () => {
    if (!jiraJql || refreshingJira) return;
    setRefreshingJira(true);
    const res = await getIssuesAction(jiraJql);
    setRefreshingJira(false);
    if (res.error) { addToast(res.error, "error"); return; }
    socket.emit("load-tickets", { roomId, tickets: res.data! as JiraTicket[] });
    addToast(`${res.data!.length} tickets actualisés`, "success");
  };

  const handleSendToJira = async (score: string) => {
    if (!room) return;
    const ticket = room.tickets[room.currentTicketIdx];
    if (!ticket) return;
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return;
    setSendingToJira(true);
    const res = await estimateIssueAction(ticket.key, numScore);
    setSendingToJira(false);
    if (res.error) { addToast(res.error, "error"); return; }
    addToast(`${ticket.key} mis à jour dans Jira`, "success");
    const updatedTickets = [...room.tickets];
    updatedTickets[room.currentTicketIdx] = { ...ticket, estimatedPoints: score };
    socket.emit("load-tickets", { roomId, tickets: updatedTickets });
    setTimeout(() => socket.emit("next-ticket", { roomId }), 1500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-gray-500 text-sm">Connexion à la room...</p>
        </div>
      </div>
    );
  }

  const currentTicket = room.tickets[room.currentTicketIdx] || null;
  const connectedPlayers = room.players.filter((p) => p.connected);
  const allVoted = connectedPlayers.length > 0 && connectedPlayers.every((p) => p.hasVoted);
  const someVoted = room.players.some((p) => p.hasVoted);

  return (
    <div className={`min-h-screen ${theme.page} ${theme.font}`}>
      {/* Header */}
      <header className={`border-b ${theme.headerBorder} ${theme.header} sticky top-0 z-10 px-4 py-3`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="h-7 w-7" />
              <span className={`font-bold ${theme.headerText}`}>Poker Planning</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isHost && (
              <button
                onClick={() => setJiraModalOpen(true)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${theme.headerBtn}`}
              >
                <Image src="/jira.svg" width={16} height={16} className="h-4 w-4" alt="Jira" />
                Charger Jira
              </button>
            )}
            <button
              onClick={copyLink}
              title="Copier le lien d'invitation"
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${theme.headerBtn}`}
            >
              {copied ? (
                <span className="font-medium">Lien copié !</span>
              ) : (
                <>
                  <svg className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Inviter</span>
                  <span className="font-mono opacity-60">{roomId}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 lg:pb-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main */}
          <div className="space-y-6">
            <PokerTable
              room={room}
              currentPlayerId={currentPlayerId}
              countdown={countdown}
              onKick={handleKick}
              onThrow={handleThrow}
              paperBalls={paperBalls}
              onPaperBallComplete={handlePaperBallComplete}
            />

            {currentTicket && (
              <TicketDetail
                ticket={currentTicket}
                ticketIdx={room.currentTicketIdx}
                totalTickets={room.tickets.length}
              />
            )}

            {!room.revealed && (
              <VotingCards
                scale={room.scale}
                selectedValue={myVote}
                onVote={handleVote}
                revealed={room.revealed}
              />
            )}

            {room.revealed && (
              <ResultsPanel
                room={room}
                isHost={isHost}
                onSetFinalScore={handleSetFinalScore}
                onResetVotes={handleReset}
                onNextTicket={handleNextTicket}
                currentTicket={currentTicket}
                onSendToJira={jiraEnabled && currentTicket && !currentTicket.key.startsWith("#") ? handleSendToJira : undefined}
                sendingToJira={sendingToJira}
              />
            )}

            {isHost && !room.revealed && countdown === null && (
              <div className="flex justify-center pb-2">
                <button
                  onClick={handleReveal}
                  disabled={!someVoted}
                  className={`rounded-xl px-8 py-3 font-semibold transition-all ${theme.accent} ${!someVoted ? theme.accentDisabled : ""}`}
                >
                  {allVoted ? "Révéler les votes" : `Forcer la révélation (${room.players.filter((p) => p.hasVoted).length}/${connectedPlayers.length})`}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TicketPanel
              tickets={room.tickets}
              currentIdx={room.currentTicketIdx}
              isHost={isHost}
              onSelect={handleSelectTicket}
              onAddTicket={handleAddTicket}
              onRemoveTicket={handleRemoveTicket}
              onRefresh={jiraEnabled ? handleRefreshJira : undefined}
              refreshing={refreshingJira}
            />
            <CoinFlip roomId={roomId} playerName={playerName} />
          </div>
        </div>
      </div>

      {/* Jira Modal */}
      <Modal
        open={jiraModalOpen}
        onClose={() => setJiraModalOpen(false)}
        title="Charger un sprint Jira"
        size="sm"
      >
        <JiraConnector onTicketsLoaded={handleTicketsLoaded} />
      </Modal>

      <ToastContainer />
      <KonamiEasterEgg />
      <FallingCardsOverlay active={celebrationActive} cards={celebrationCards} />

      {/* Theme selector */}
      <div className="fixed bottom-4 right-4 z-40 opacity-40 hover:opacity-100 transition-opacity">
        <ThemeSelector current={theme.id} onChange={handleChangeTheme} />
      </div>
    </div>
  );
}

function subscribeThemeStorage(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === "poker-planning-theme") callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function RoomView(props: Props) {
  const storedTheme = useSyncExternalStore(
    subscribeThemeStorage,
    () => {
      const saved = localStorage.getItem("poker-planning-theme") as ThemeId | null;
      return saved && saved in THEMES ? saved : "openclimat";
    },
    () => "openclimat" as ThemeId
  );
  const [themeOverride, setThemeOverride] = useState<ThemeId | null>(null);
  const themeId = themeOverride ?? storedTheme;

  return (
    <ThemeProvider themeId={themeId}>
      <RoomViewInner {...props} onChangeTheme={setThemeOverride} />
    </ThemeProvider>
  );
}
