"use client";

import { useMemo } from "react";
import type { Room } from "@/lib/types";
import { SCALES } from "@/lib/types";

interface Props {
  room: Room;
  isHost: boolean;
  onSetFinalScore: (score: string) => void;
  onResetVotes: () => void;
  onNextTicket: () => void;
}

function toNumber(v: string | null | undefined): number | null {
  if (!v || v === "?" || v === "☕") return null;
  const sizes: Record<string, number> = { XS: 1, S: 2, M: 3, L: 5, XL: 8, XXL: 13 };
  if (sizes[v] !== undefined) return sizes[v];
  return parseFloat(v);
}

export function ResultsPanel({ room, isHost, onSetFinalScore, onResetVotes, onNextTicket }: Props) {
  const votes = room.players
    .filter((p) => p.hasVoted && p.vote != null)
    .map((p) => p.vote as string);

  const numericVotes = votes.map(toNumber).filter((n): n is number => n !== null);

  const stats = useMemo(() => {
    if (!numericVotes.length) return null;
    const sorted = [...numericVotes].sort((a, b) => a - b);
    const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const stddev = Math.sqrt(numericVotes.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / numericVotes.length);
    return { avg: avg.toFixed(1), median: median.toFixed(1), min: sorted[0], max: sorted[sorted.length - 1], stddev: stddev.toFixed(1) };
  }, [numericVotes]);

  const distribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of votes) map.set(v, (map.get(v) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [votes]);

  const isConsensus = votes.length > 1 && new Set(votes).size === 1;
  const scaleValues = SCALES[room.scale];

  return (
    <div className="rounded-2xl bg-gray-800/60 border border-gray-700/60 p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-white">Résultats</h3>
        {isConsensus && <span className="text-xl animate-bounce">🎉</span>}
      </div>

      {isConsensus && (
        <div className="rounded-xl bg-green-900/30 border border-green-700/50 p-3 text-center">
          <span className="text-green-300 font-semibold">Consensus : {votes[0]}</span>
        </div>
      )}

      {/* Distribution */}
      <div className="space-y-2">
        {distribution.map(([v, count]) => {
          const pct = Math.round((count / votes.length) * 100);
          return (
            <div key={v} className="flex items-center gap-3">
              <span className="w-7 text-right text-sm font-bold text-indigo-300 shrink-0">{v}</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-6 shrink-0">{count}×</span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-2 rounded-xl bg-gray-900/50 p-3">
          {[
            { label: "Moy", value: stats.avg },
            { label: "Méd", value: stats.median },
            { label: "Min", value: String(stats.min) },
            { label: "Max", value: String(stats.max) },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-sm font-bold text-white">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Score final */}
      {isHost && !room.finalScore && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Choisir le score final</p>
          <div className="flex flex-wrap gap-1.5">
            {scaleValues.map((v) => (
              <button
                key={v}
                onClick={() => onSetFinalScore(v)}
                className="h-10 w-10 rounded-xl border border-gray-600 bg-gray-700/80 text-sm font-bold text-white hover:border-indigo-400 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {room.finalScore && (
        <div className="rounded-xl bg-indigo-900/30 border border-indigo-700/50 p-3 text-center">
          <span className="text-gray-400 text-sm">Score final : </span>
          <span className="text-white font-bold text-xl">{room.finalScore}</span>
        </div>
      )}

      {/* Actions */}
      {isHost && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onResetVotes}
            className="flex-1 rounded-xl border border-gray-600 bg-gray-700/50 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Re-voter
          </button>
          {room.tickets.length > 0 && room.currentTicketIdx < room.tickets.length - 1 && (
            <button
              onClick={onNextTicket}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Suivant →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
