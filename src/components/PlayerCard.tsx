"use client";

import type { Player } from "@/lib/types";

interface Props {
  player: Player;
  revealed: boolean;
  isCurrentPlayer: boolean;
  isHost: boolean;
  onKick?: () => void;
}

export function PlayerCard({ player, revealed, isCurrentPlayer, isHost, onKick }: Props) {
  const initials = player.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const cardColor = revealed && player.vote
    ? "border-indigo-400 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
    : player.hasVoted
      ? "border-green-500/60 bg-green-900/30 text-green-400"
      : "border-gray-700 bg-gray-800/50 text-gray-600";

  return (
    <div className={`group flex flex-col items-center gap-2 ${!player.connected ? "opacity-40" : ""}`}>
      {/* Vote card */}
      <div className={`h-14 w-10 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${cardColor}`}>
        {revealed && player.vote ? (
          <span className="text-base">{player.vote}</span>
        ) : player.hasVoted ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-lg opacity-30">?</span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative">
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 transition-all ${
          isCurrentPlayer
            ? "bg-indigo-600 text-white ring-indigo-400"
            : "bg-gray-700 text-gray-300 ring-gray-600"
        }`}>
          {initials}
        </div>
        {player.isHost && (
          <span className="absolute -top-1 -right-1 text-xs leading-none" title="Scrum Master">👑</span>
        )}
      </div>

      {/* Name + kick */}
      <div className="flex items-center gap-1">
        <span className="max-w-[72px] truncate text-xs text-gray-400">{player.name}</span>
        {onKick && (
          <button
            onClick={onKick}
            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity text-xs leading-none"
            title="Exclure"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
