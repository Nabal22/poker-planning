"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { Room, JiraTicket } from "@/lib/types";
import { SCALES } from "@/lib/types";
import { useTheme } from "./ThemeContext";

interface Props {
  room: Room;
  isHost: boolean;
  onSetFinalScore: (score: string) => void;
  onResetVotes: () => void;
  onNextTicket: () => void;
  currentTicket?: JiraTicket | null;
  onSendToJira?: (score: string) => Promise<void>;
  sendingToJira?: boolean;
}

function toNumber(v: string | null | undefined): number | null {
  if (!v || v === "?" || v === "☕") return null;
  const sizes: Record<string, number> = { XS: 1, S: 2, M: 3, L: 5, XL: 8, XXL: 13 };
  if (sizes[v] !== undefined) return sizes[v];
  return parseFloat(v);
}

export function ResultsPanel({ room, isHost, onSetFinalScore, onResetVotes, onNextTicket, currentTicket, onSendToJira, sendingToJira }: Props) {
  const theme = useTheme();
  const votes = room.players
    .filter((p) => p.hasVoted && p.vote != null)
    .map((p) => p.vote as string);

  const numericVotes = votes.map(toNumber).filter((n): n is number => n !== null);

  const avg = useMemo(() => {
    if (!numericVotes.length) return null;
    return (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1);
  }, [numericVotes]);

  const distribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of votes) map.set(v, (map.get(v) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [votes]);

  const isConsensus = votes.length > 1 && new Set(votes).size === 1;
  const scaleValues = SCALES[room.scale];
  const maxCount = distribution.length ? distribution[0][1] : 1;

  return (
    <div className={`rounded-2xl p-5 space-y-4 ${theme.panel}`}>
      {/* Consensus banner */}
      {isConsensus ? (
        <div className={`rounded-xl p-4 text-center ${theme.consensus}`}>
          <div className="text-sm opacity-70">Consensus</div>
          <div className="text-3xl font-black">{votes[0]}</div>
        </div>
      ) : (
        <>
          {/* Distribution — bar chart */}
          <div className="flex items-end justify-center gap-2">
            {distribution.map(([v, count]) => {
              const barHeight = Math.max(12, Math.round((count / maxCount) * 64));
              return (
                <div key={v} className="flex flex-col items-center gap-1 flex-1 max-w-[3rem]">
                  <span className="text-xs font-medium opacity-60">{count}×</span>
                  <div
                    className={`w-full rounded-t-lg ${theme.distribution}`}
                    style={{ height: barHeight }}
                  />
                  <span className="text-xs font-bold">{v}</span>
                </div>
              );
            })}
          </div>

          {/* Average */}
          {avg && (
            <div className="text-center">
              <span className="text-sm opacity-50">Moyenne </span>
              <span className="text-lg font-bold">{avg}</span>
            </div>
          )}
        </>
      )}

      {/* Score final — host picks */}
      {isHost && !room.finalScore && (
        <div className="space-y-2">
          <p className="text-xs opacity-50 font-medium uppercase tracking-wide text-center">Score final</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {scaleValues.map((v) => (
              <button
                key={v}
                onClick={() => onSetFinalScore(v)}
                className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${theme.scoreBtn} ${theme.scoreBtnHover}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {room.finalScore && (
        <div className={`rounded-xl p-3 text-center ${theme.finalScore}`}>
          <span className="text-sm opacity-60">Score final </span>
          <span className="font-bold text-xl">{room.finalScore}</span>
          {onSendToJira && currentTicket && (
            <div className="mt-2">
              <button
                onClick={() => !sendingToJira && onSendToJira(room.finalScore!)}
                disabled={sendingToJira || !!currentTicket.estimatedPoints}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${theme.accent} ${sendingToJira || currentTicket.estimatedPoints ? "opacity-60 cursor-default" : ""}`}
              >
                {currentTicket.estimatedPoints ? (
                  <>
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Envoyé
                  </>
                ) : sendingToJira ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Envoi…
                  </>
                ) : (
                  <>
                    Envoyer vers Jira
                    <Image src="/jira.svg" width={14} height={14} className="h-3.5 w-3.5" alt="Jira" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {isHost && (
        <div className="flex gap-2">
          <button
            onClick={onResetVotes}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${theme.secondaryBtn}`}
          >
            Re-voter
          </button>
          {room.tickets.length > 0 && room.currentTicketIdx < room.tickets.length - 1 && (
            <button
              onClick={onNextTicket}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${theme.accent}`}
            >
              Suivant →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
