"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { connectSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/useRoomStore";
import { setPlayerCookie } from "@/lib/player-cookie";

interface Props {
  savedName: string;
}

export function HomePageClient({ savedName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPlayerId, setPlayerName } = useRoomStore();
  const [name, setName] = useState(savedName);
  const [joinCode, setJoinCode] = useState(() => {
    const room = searchParams.get("room");
    return room ? room.toUpperCase() : "";
  });
  const [mode, setMode] = useState<"create" | "join">(() =>
    searchParams.get("room") ? "join" : "create"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    setPlayerCookie(name.trim());
    const socket = connectSocket();

    socket.once("room-state", (room) => {
      setPlayerId(socket.id || "");
      setPlayerName(name.trim());
      sessionStorage.setItem("planning-poker-player-id", socket.id || "");
      router.push(`/room/${room.id}`);
    });

    socket.once("error", ({ message }) => {
      setError(message);
      setLoading(false);
    });

    socket.emit("create-room", { playerName: name.trim() });
  }

  function handleJoin() {
    if (!name.trim() || !joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    setPlayerName(name.trim());
    setPlayerCookie(name.trim());
    router.push(`/room/${code}`);
  }

  const nameOk = name.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Image src="/logo.png" alt="Poker Planning" width={80} height={80} className="h-20 w-20 mx-auto rounded-2xl bg-gray-100/10 p-2" />
          <h1 className="text-3xl font-bold text-white">Poker Planning</h1>
          <p className="text-gray-400 text-sm">Estimez vos tickets Jira en équipe</p>
        </div>

        {/* Name input */}
        <div>
          <label htmlFor="pseudo" className="block text-sm text-gray-400 mb-2">Votre pseudo</label>
          <input
            id="pseudo"
            className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="Ex: Alice"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && mode === "join" ? handleJoin() : undefined}
          />
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-700">
          <button
            onClick={() => { setMode("create"); setError(""); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === "create"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            Créer une room
          </button>
          <button
            onClick={() => { setMode("join"); setError(""); }}
            disabled={!nameOk}
            className={`flex-1 py-3 text-sm font-semibold transition-colors disabled:opacity-40 ${
              mode === "join"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            Rejoindre une room
          </button>
        </div>

        {/* Tab content */}
        {mode === "create" && (
          <button
            onClick={handleCreate}
            disabled={loading || !nameOk}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Création en cours…" : "Créer la room"}
          </button>
        )}

        {mode === "join" && (
          <div className="space-y-3">
            <div>
              <label htmlFor="code" className="block text-sm text-gray-400 mb-2">Code de la room</label>
              <input
                id="code"
                className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none font-mono text-center text-lg tracking-widest uppercase transition-colors"
                placeholder="XXXXXX"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                autoFocus
              />
              {joinCode.length > 0 && joinCode.length < 4 && (
                <p className="mt-1.5 text-xs text-gray-500 text-center">{joinCode.length}/6 caractères</p>
              )}
            </div>
            <button
              onClick={handleJoin}
              disabled={!nameOk || joinCode.length < 4}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              Rejoindre
            </button>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-red-400 bg-red-900/20 rounded-lg p-2">{error}</p>
        )}
      </div>
    </div>
  );
}
