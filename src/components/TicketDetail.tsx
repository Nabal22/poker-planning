"use client";

import type { JiraTicket } from "@/lib/types";

interface Props {
  ticket: JiraTicket | null;
  ticketIdx: number;
  totalTickets: number;
  finalScore?: string;
  onSendToJira?: (score: string) => Promise<void>;
  sendingToJira?: boolean;
}

export function TicketDetail({ ticket, ticketIdx, totalTickets, finalScore, onSendToJira, sendingToJira }: Props) {
  if (!ticket) return null;

  const alreadySent = !!ticket.estimatedPoints;

  return (
    <div className="rounded-2xl bg-gray-800/60 border border-gray-700/60 p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
              {ticket.key}
            </span>
            <span className="text-xs text-gray-500 bg-gray-700/60 px-2 py-0.5 rounded-full">
              {ticket.status}
            </span>
            {totalTickets > 1 && (
              <span className="text-xs text-gray-600">
                {ticketIdx + 1} / {totalTickets}
              </span>
            )}
          </div>
          <h2 className="text-white font-semibold leading-snug">{ticket.summary}</h2>
        </div>

        {ticket.currentPoints != null && (
          <div className="shrink-0 text-center">
            <div className="text-[10px] text-gray-500 mb-0.5">Actuel</div>
            <div className="h-9 w-9 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center text-sm font-bold text-gray-300">
              {ticket.currentPoints}
            </div>
          </div>
        )}
      </div>

      {ticket.description && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 border-t border-gray-700/50 pt-3">
          {ticket.description}
        </p>
      )}

      {ticket.assignee && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-full bg-gray-600 flex items-center justify-center text-[9px]">
            {ticket.assignee[0]}
          </span>
          {ticket.assignee}
        </p>
      )}

      {/* Send to Jira */}
      {finalScore && onSendToJira && (
        <div className="pt-1">
          <button
            onClick={() => !alreadySent && !sendingToJira && onSendToJira(finalScore)}
            disabled={alreadySent || sendingToJira}
            className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              alreadySent
                ? "bg-green-900/30 border border-green-700/50 text-green-400 cursor-not-allowed"
                : sendingToJira
                  ? "bg-indigo-800/50 text-indigo-300 cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            }`}
          >
            {alreadySent ? (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Envoyé dans Jira ({ticket.estimatedPoints} pts)
              </>
            ) : sendingToJira ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent" />
                Envoi en cours...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Envoyer {finalScore} pts → Jira
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
