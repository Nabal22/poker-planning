"use client";

import { create } from "zustand";
import type { Room, Player } from "@/lib/types";

interface RoomStore {
  room: Room | null;
  playerId: string | null;
  playerName: string | null;
  toasts: Toast[];

  setRoom: (room: Room) => void;
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  updatePlayerVoted: (playerId: string) => void;
  revealVotes: (votes: Record<string, string | null>) => void;
  resetVotes: () => void;
  addToast: (msg: string, type?: "info" | "success" | "error") => void;
  removeToast: (id: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
}

export interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  playerId: null,
  playerName: null,
  toasts: [],

  setRoom: (room) => set({ room }),

  setPlayerId: (id) => {
    set({ playerId: id });
    if (typeof window !== "undefined") {
      sessionStorage.setItem("planning-poker-player-id", id);
    }
  },

  setPlayerName: (name) => {
    set({ playerName: name });
    if (typeof window !== "undefined") {
      localStorage.setItem("planning-poker-player-name", name);
    }
  },

  updatePlayerVoted: (playerId) => {
    const room = get().room;
    if (!room) return;
    const players = room.players.map((p) =>
      p.id === playerId ? { ...p, hasVoted: true } : p
    );
    set({ room: { ...room, players } });
  },

  revealVotes: (votes) => {
    const room = get().room;
    if (!room) return;
    const players = room.players.map((p) => ({
      ...p,
      vote: votes[p.id] ?? null,
    }));
    set({ room: { ...room, players, revealed: true } });
  },

  resetVotes: () => {
    const room = get().room;
    if (!room) return;
    const players = room.players.map((p) => ({
      ...p,
      vote: null,
      hasVoted: false,
    }));
    set({ room: { ...room, players, revealed: false, finalScore: undefined } });
  },

  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  addPlayer: (player) => {
    const room = get().room;
    if (!room) return;
    if (room.players.find((p) => p.id === player.id)) return;
    set({ room: { ...room, players: [...room.players, player] } });
  },

  removePlayer: (playerId) => {
    const room = get().room;
    if (!room) return;
    const players = room.players.map((p) =>
      p.id === playerId ? { ...p, connected: false } : p
    );
    set({ room: { ...room, players } });
  },
}));
