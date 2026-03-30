"use client";

import type { Room } from "@/lib/types";
import { PlayerCard } from "./PlayerCard";

interface Props {
  room: Room;
  currentPlayerId: string;
  onKick: (playerId: string) => void;
}

export function PokerTable({ room, currentPlayerId, onKick }: Props) {
  const { players } = room;
  const isHost = room.host === currentPlayerId;
  const connected = players.filter((p) => p.connected);
  const voted = players.filter((p) => p.hasVoted).length;
  const total = connected.length;

  const half = Math.ceil(players.length / 2);
  const topRow = players.slice(0, half);
  const bottomRow = players.slice(half);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Top row */}
      <div className="flex gap-6 justify-center min-h-[88px] items-end">
        {topRow.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            revealed={room.revealed}
            isCurrentPlayer={player.id === currentPlayerId}
            isHost={isHost}
            onKick={isHost && player.id !== currentPlayerId ? () => onKick(player.id) : undefined}
          />
        ))}
      </div>

      {/* Table felt */}
      <div className="relative w-72 h-24 rounded-full bg-gradient-to-b from-emerald-800 to-emerald-900 border-4 border-emerald-700 shadow-2xl shadow-emerald-900/50 flex flex-col items-center justify-center gap-1">
        {/* Progress arc */}
        {!room.revealed && total > 0 && (
          <div className="flex gap-1">
            {connected.map((p) => (
              <div
                key={p.id}
                className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${p.hasVoted ? "bg-green-400" : "bg-emerald-700"}`}
              />
            ))}
          </div>
        )}
        <span className={`text-sm font-medium ${room.revealed ? "text-emerald-200" : "text-emerald-400"}`}>
          {room.revealed ? "Votes révélés" : `${voted} / ${total} ont voté`}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex gap-6 justify-center min-h-[88px] items-start">
        {bottomRow.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            revealed={room.revealed}
            isCurrentPlayer={player.id === currentPlayerId}
            isHost={isHost}
            onKick={isHost && player.id !== currentPlayerId ? () => onKick(player.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
