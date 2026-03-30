"use client";

import type { JiraTicket } from "@/lib/types";

interface Props {
  tickets: JiraTicket[];
  currentIdx: number;
  isHost: boolean;
  onSelect: (idx: number) => void;
}

export function TicketPanel({ tickets, currentIdx, isHost, onSelect }: Props) {
  if (!tickets.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-700 p-5 text-center space-y-1">
        <p className="text-sm text-gray-500">Aucun ticket chargé</p>
        {isHost && <p className="text-xs text-gray-600">Charge un sprint Jira pour commencer</p>}
      </div>
    );
  }

  const done = tickets.filter((t) => t.estimatedPoints).length;

  return (
    <div className="rounded-2xl bg-gray-800/60 border border-gray-700/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/60 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Tickets</span>
        <span className="text-xs text-gray-500">
          {done > 0 ? `${done}/${tickets.length} estimés` : `${tickets.length} tickets`}
        </span>
      </div>

      {/* Progress bar */}
      {done > 0 && (
        <div className="h-0.5 bg-gray-700">
          <div
            className="h-0.5 bg-indigo-500 transition-all duration-500"
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
              className={`w-full px-4 py-2.5 text-left transition-colors border-b border-gray-700/30 last:border-0 ${
                isCurrent
                  ? "bg-indigo-500/10 border-l-2 border-l-indigo-500"
                  : isHost
                    ? "hover:bg-gray-700/40 cursor-pointer border-l-2 border-l-transparent"
                    : "border-l-2 border-l-transparent cursor-default"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 font-mono text-xs font-bold ${isCurrent ? "text-indigo-400" : "text-gray-500"}`}>
                    {ticket.key}
                  </span>
                  <span className="truncate text-xs text-gray-400">{ticket.summary}</span>
                </div>
                {ticket.estimatedPoints ? (
                  <span className="shrink-0 rounded bg-green-800/60 px-1.5 py-0.5 text-xs font-bold text-green-400">
                    {ticket.estimatedPoints}
                  </span>
                ) : ticket.currentPoints != null ? (
                  <span className="shrink-0 rounded bg-gray-700/60 px-1.5 py-0.5 text-xs text-gray-500">
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
