"use client";

import type { Room } from "@/lib/types";
import { useTheme } from "./ThemeContext";
import { PlayerCard } from "./PlayerCard";
import { PaperBall } from "./PaperBall";

interface PaperBallAnim {
  id: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface Props {
  room: Room;
  currentPlayerId: string;
  countdown: number | null;
  onKick: (playerId: string) => void;
  onThrow: (toId: string) => void;
  paperBalls: PaperBallAnim[];
  onPaperBallComplete: (id: number) => void;
}

export function PokerTable({ room, currentPlayerId, countdown, onKick, onThrow, paperBalls, onPaperBallComplete }: Props) {
  const theme = useTheme();
  const { players } = room;
  const isHost = room.host === currentPlayerId;
  const connected = players.filter((p) => p.connected);
  const voted = players.filter((p) => p.hasVoted).length;
  const total = connected.length;

  const half = Math.ceil(players.length / 2);
  const topRow = players.slice(0, half);
  const bottomRow = players.slice(half);

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Top row */}
      <div className="flex gap-6 justify-center min-h-[88px] items-end">
        {topRow.map((player) => (
          <div key={player.id} data-player-id={player.id}>
            <PlayerCard
              player={player}
              revealed={room.revealed}
              isCurrentPlayer={player.id === currentPlayerId}
              onKick={isHost && player.id !== currentPlayerId ? () => onKick(player.id) : undefined}
              onThrow={player.id !== currentPlayerId && player.connected ? () => onThrow(player.id) : undefined}
            />
          </div>
        ))}
      </div>

      {/* Table felt */}
      <div className={`relative w-72 h-24 rounded-full flex flex-col items-center justify-center gap-1 ${theme.table.felt}`}>
        {countdown !== null ? (
          <span
            key={countdown}
            className="text-5xl font-black tabular-nums animate-[countPop_0.25s_ease-out]"
            style={{ color: countdown === 1 ? "#ef4444" : countdown === 2 ? "#f59e0b" : "#22c55e" }}
          >
            {countdown}
          </span>
        ) : (
          <>
            {!room.revealed && total > 0 && (
              <div className="flex gap-1">
                {connected.map((p) => (
                  <div
                    key={p.id}
                    className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${p.hasVoted ? theme.table.progressOn : theme.table.progressOff}`}
                  />
                ))}
              </div>
            )}
            <span className={`text-sm font-medium ${room.revealed ? theme.table.textRevealed : theme.table.text}`}>
              {room.revealed ? "Votes révélés" : `${voted} / ${total} ont voté`}
            </span>
          </>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex gap-6 justify-center min-h-[88px] items-start">
        {bottomRow.map((player) => (
          <div key={player.id} data-player-id={player.id}>
            <PlayerCard
              player={player}
              revealed={room.revealed}
              isCurrentPlayer={player.id === currentPlayerId}
              onKick={isHost && player.id !== currentPlayerId ? () => onKick(player.id) : undefined}
              onThrow={player.id !== currentPlayerId && player.connected ? () => onThrow(player.id) : undefined}
            />
          </div>
        ))}
      </div>

      {/* Paper balls */}
      {paperBalls.map((ball) => (
        <PaperBall
          key={ball.id}
          from={ball.from}
          to={ball.to}
          onComplete={() => onPaperBallComplete(ball.id)}
        />
      ))}
    </div>
  );
}

export type { PaperBallAnim };
