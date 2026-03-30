"use client";

import { useState, useEffect } from "react";
import type { JiraTicket } from "@/lib/types";

interface Sprint {
  id: string;
  name: string;
  jql: string;
}

interface Props {
  onTicketsLoaded: (tickets: JiraTicket[], jql: string) => void;
}

export function JiraConnector({ onTicketsLoaded }: Props) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState<"sprints" | "tickets" | null>("sprints");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/jira/sprints")
      .then((r) => r.json())
      .then((data: Sprint[] | { error: string }) => {
        if ("error" in data) throw new Error(data.error);
        setSprints(data);
        setSelectedSprint(data[0] ?? null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(null));
  }, []);

  async function handleLoad() {
    if (!selectedSprint) return;
    setLoading("tickets");
    setError("");
    try {
      const res = await fetch(`/api/jira/issues?jql=${encodeURIComponent(selectedSprint.jql)}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(data.error ?? "Erreur inconnue");
      if (data.length === 0) throw new Error("Aucun ticket trouvé dans ce sprint");
      onTicketsLoaded(data, selectedSprint.jql);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(null);
    }
  }

  if (loading === "sprints") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Chargement des sprints...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sprints.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun sprint disponible</p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Sprint / Backlog
            </label>
            <div className="space-y-2">
              {sprints.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSprint(s)}
                  className={`w-full rounded-xl px-4 py-3 text-left transition-all border ${
                    selectedSprint?.id === s.id
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.name}</span>
                    {selectedSprint?.id === s.id && (
                      <span className="text-indigo-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-800 px-3 py-2">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleLoad}
            disabled={!selectedSprint || loading === "tickets"}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading === "tickets" ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Chargement...
              </>
            ) : (
              "Charger les tickets"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
