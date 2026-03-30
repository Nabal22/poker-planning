"use client";

import type { JiraTicket } from "@/lib/types";
import { useTheme } from "./ThemeContext";

interface Props {
  tickets: JiraTicket[];
  currentIdx: number;
  isHost: boolean;
  onSelect: (idx: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function TicketPanel({ tickets, currentIdx, isHost, onSelect, onRefresh, refreshing }: Props) {
  const theme = useTheme();

  if (!tickets.length) {
    return (
      <div className={`rounded-2xl border border-dashed p-5 text-center space-y-1 ${theme.panel}`}>
        <p className="text-sm opacity-50">Aucun ticket chargé</p>
        {isHost && <p className="text-xs opacity-40">Charge un sprint Jira pour commencer</p>}
      </div>
    );
  }

  const done = tickets.filter((t) => t.estimatedPoints).length;

  return (
    <div className={`rounded-2xl overflow-hidden ${theme.panel}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-current/10 flex items-center justify-between">
        <span className="text-sm font-medium">Tickets</span>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-50">
            {done > 0 ? `${done}/${tickets.length} estimés` : `${tickets.length} tickets`}
          </span>
          {isHost && onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Actualiser les tickets"
              className="opacity-40 hover:opacity-80 transition-opacity disabled:cursor-wait"
            >
              <svg
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {done > 0 && (
        <div className={`h-0.5 ${theme.panelInner}`}>
          <div
            className={`h-0.5 transition-all duration-500 ${theme.distribution}`}
            style={{ width: `${(done / tickets.length) * 100}%` }}
          />
        </div>
      )}

      {/* List */}
      <div className="max-h-56 overflow-y-auto">
        {tickets.map((ticket, idx) => {
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={ticket.key}
              onClick={() => isHost && onSelect(idx)}
              disabled={!isHost}
              className={`w-full px-4 py-2.5 text-left transition-colors border-b border-current/5 last:border-0 ${
                isCurrent
                  ? `${theme.panelInner} border-l-2 ${theme.distribution.replace("bg-", "border-l-")}`
                  : isHost
                    ? "hover:opacity-80 cursor-pointer border-l-2 border-l-transparent"
                    : "border-l-2 border-l-transparent cursor-default"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 font-mono text-xs font-bold ${isCurrent ? "" : "opacity-50"}`}>
                    {ticket.key}
                  </span>
                  <span className="truncate text-xs opacity-60">{ticket.summary}</span>
                </div>
                {ticket.estimatedPoints ? (
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${theme.consensus}`}>
                    {ticket.estimatedPoints}
                  </span>
                ) : ticket.currentPoints != null ? (
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs opacity-50 ${theme.panelInner}`}>
                    {ticket.currentPoints}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
