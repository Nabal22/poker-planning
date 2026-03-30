"use client";

import { useState } from "react";
import type { JiraTicket } from "@/lib/types";
import { useTheme } from "./ThemeContext";

interface Props {
  ticket: JiraTicket | null;
  ticketIdx: number;
  totalTickets: number;
}

export function TicketDetail({ ticket, ticketIdx, totalTickets }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  if (!ticket) return null;

  return (
    <div className={`rounded-xl overflow-hidden ${theme.panel}`}>
      {/* Compact bar — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 min-w-0 text-left hover:opacity-80 transition-opacity"
      >
        {totalTickets > 1 && (
          <span className="text-xs opacity-40 shrink-0 tabular-nums">{ticketIdx + 1}/{totalTickets}</span>
        )}
        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0 ${theme.finalScore}`}>
          {ticket.key}
        </span>
        <span className="font-medium text-sm truncate flex-1">{ticket.summary}</span>
        {ticket.status && (
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-flex ${theme.panelInner}`}>
            {ticket.status}
          </span>
        )}
        {ticket.currentPoints != null && (
          <span className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${theme.scoreBtn}`}>
            {ticket.currentPoints}
          </span>
        )}
        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 opacity-40 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={`px-4 pb-4 pt-1 space-y-3 border-t border-current/10 ${theme.panelInner}`}>
          <h2 className="font-semibold leading-snug">{ticket.summary}</h2>

          {ticket.description && (
            <p className="text-xs opacity-60 leading-relaxed">{ticket.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {ticket.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${theme.panelInner} border border-current/10`}>
                {ticket.status}
              </span>
            )}
            {ticket.assignee && (
              <span className="text-xs opacity-50 flex items-center gap-1.5">
                <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] ${theme.avatar.other}`}>
                  {ticket.assignee[0]}
                </span>
                {ticket.assignee}
              </span>
            )}
            {ticket.currentPoints != null && (
              <span className="text-xs opacity-50">
                Estimation actuelle : <span className="font-bold">{ticket.currentPoints} pts</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
