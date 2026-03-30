"use client";

import { useState, useRef } from "react";
import type { JiraTicket } from "@/lib/types";
import { useTheme } from "./ThemeContext";

interface Props {
  tickets: JiraTicket[];
  currentIdx: number;
  isHost: boolean;
  onSelect: (idx: number) => void;
  onAddTicket: (ticket: JiraTicket) => void;
  onRemoveTicket: (idx: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function TicketPanel({ tickets, currentIdx, isHost, onSelect, onAddTicket, onRemoveTicket, onRefresh, refreshing }: Props) {
  const theme = useTheme();
  const [adding, setAdding] = useState(false);
  const [summary, setSummary] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const s = summary.trim();
    if (!s) return;
    const key = `#${(tickets.length + 1).toString().padStart(2, "0")}`;
    onAddTicket({ key, summary: s, status: "À estimer" });
    setSummary("");
    setAdding(false);
  };

  const openForm = () => {
    setAdding(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const done = tickets.filter((t) => t.estimatedPoints || t.currentPoints != null).length;

  return (
    <div className={`rounded-2xl overflow-hidden ${theme.panel}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-current/10 flex items-center justify-between">
        <span className="text-sm font-medium">Tickets</span>
        <div className="flex items-center gap-2">
          {tickets.length > 0 && (
            <span className="text-xs opacity-50">
              {done > 0 ? `${done}/${tickets.length} estimés` : `${tickets.length} tickets`}
            </span>
          )}
          {isHost && onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Actualiser depuis Jira"
              className="opacity-40 hover:opacity-80 transition-opacity disabled:cursor-wait"
            >
              <svg className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {isHost && (
            <button
              onClick={openForm}
              title="Ajouter un ticket"
              className="opacity-40 hover:opacity-80 transition-opacity"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {done > 0 && (
        <div className={`h-0.5 ${theme.panelInner}`}>
          <div className={`h-0.5 transition-all duration-500 ${theme.distribution}`} style={{ width: `${(done / tickets.length) * 100}%` }} />
        </div>
      )}

      {/* List */}
      {tickets.length > 0 && (
        <div className="max-h-56 overflow-y-auto">
          {tickets
            .map((ticket, idx) => ({ ticket, idx }))
            .sort((a, b) => {
              const aDone = !!(a.ticket.estimatedPoints || a.ticket.currentPoints != null);
              const bDone = !!(b.ticket.estimatedPoints || b.ticket.currentPoints != null);
              if (aDone !== bDone) return aDone ? 1 : -1;
              return a.idx - b.idx;
            })
            .map(({ ticket, idx }) => {
            const isCurrent = idx === currentIdx;
            return (
              <div
                key={ticket.key}
                className={`group flex items-center border-b border-current/5 last:border-0 ${
                  isCurrent
                    ? `${theme.panelInner} border-l-2 ${theme.distribution.replace("bg-", "border-l-")}`
                    : "border-l-2 border-l-transparent"
                }`}
              >
                <button
                  onClick={() => isHost && onSelect(idx)}
                  disabled={!isHost}
                  className={`flex-1 min-w-0 px-4 py-2.5 text-left transition-colors ${isHost ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`shrink-0 font-mono text-xs font-bold ${isCurrent ? "" : "opacity-50"}`}>
                        {ticket.key}
                      </span>
                      <span className="truncate text-xs opacity-60">{ticket.summary}</span>
                    </div>
                    {ticket.estimatedPoints ? (
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${theme.consensus}`}>{ticket.estimatedPoints}</span>
                    ) : ticket.currentPoints != null ? (
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs opacity-50 ${theme.panelInner}`}>{ticket.currentPoints}</span>
                    ) : null}
                  </div>
                </button>
                {isHost && (
                  <button
                    onClick={() => onRemoveTicket(idx)}
                    title="Supprimer"
                    className="shrink-0 pr-3 opacity-0 group-hover:opacity-30 hover:!opacity-70 transition-opacity"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

      )}

      {/* Empty state */}
      {tickets.length === 0 && !adding && (
        <div className="px-4 py-5 text-center space-y-1">
          <p className="text-sm opacity-50">Aucun ticket</p>
          {isHost && <p className="text-xs opacity-35">Charge un sprint Jira ou ajoute un ticket manuellement</p>}
        </div>
      )}

      {/* Add form */}
      {adding && isHost && (
        <div className={`px-3 py-3 border-t border-current/10 ${theme.panelInner}`}>
          <input
            ref={inputRef}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setSummary(""); } }}
            placeholder="Titre du ticket…"
            className="w-full bg-transparent text-sm outline-none placeholder:opacity-30 border-b border-current/20 pb-1.5 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!summary.trim()}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${theme.accent} disabled:opacity-40`}
            >
              Ajouter
            </button>
            <button
              onClick={() => { setAdding(false); setSummary(""); }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${theme.secondaryBtn}`}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
