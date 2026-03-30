"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { connectSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/useRoomStore";

export default function HomePage() {
  const router = useRouter();
  const { setPlayerId, setPlayerName } = useRoomStore();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("planning-poker-player-name");
    if (saved) setName(saved);
  }, []);

  function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
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
    localStorage.setItem("planning-poker-player-name", name.trim());
    router.push(`/room/${code}?name=${encodeURIComponent(name.trim())}`);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🃏</div>
          <h1 className="text-3xl font-bold text-white">Planning Poker</h1>
          <p className="text-gray-400 text-sm">Estimez vos tickets Jira en équipe</p>
        </div>

        {/* Name input */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Votre pseudo</label>
          <input
            className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="Ex: Alice"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && mode === "join" && handleJoin()}
          />
        </div>

        {/* Action buttons */}
        {mode === null && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode("create")}
              disabled={!name.trim()}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              Créer une room
            </button>
            <button
              onClick={() => setMode("join")}
              disabled={!name.trim()}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 font-semibold text-gray-200 hover:border-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
            >
              Rejoindre une room
            </button>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-3">
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Création..." : "Créer et rejoindre"}
            </button>
            <button
              onClick={() => setMode(null)}
              className="w-full text-sm text-gray-500 hover:text-gray-300"
            >
              ← Retour
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-3">
            <input
              className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none font-mono text-center text-lg tracking-widest uppercase transition-colors"
              placeholder="CODE"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <button
              onClick={handleJoin}
              disabled={!name.trim() || joinCode.length < 4}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              Rejoindre
            </button>
            <button
              onClick={() => setMode(null)}
              className="w-full text-sm text-gray-500 hover:text-gray-300"
            >
              ← Retour
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
