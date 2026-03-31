import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, Scale } from "@/lib/types";
import * as rm from "@/lib/room-manager";

let io: IOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

export function initSocketServer(httpServer: HttpServer) {
  if (io) return io;

  io = new IOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    path: "/api/socket",
  });

  // Maps to handle reconnect race conditions
  // socketId → logical player id (stable across reconnects)
  const socketToLogical = new Map<string, string>();
  // logical player id → current active socket id
  const logicalToSocket = new Map<string, string>();

  io.on("connection", (socket) => {
    const playerId = socket.id;

    socket.on("create-room", ({ playerName }) => {
      const room = rm.createRoom(playerId, playerName);
      socket.join(room.id);
      socket.emit("room-state", room);
    });

    socket.on("join-room", ({ roomId, playerName, playerId: savedId }) => {
      const effectiveId = savedId || playerId;
      // Track which logical player this socket represents
      socketToLogical.set(socket.id, effectiveId);
      logicalToSocket.set(effectiveId, socket.id);
      const result = rm.joinRoom(roomId, effectiveId, playerName);
      if (!result) {
        socket.emit("error", { message: "Room not found or full" });
        return;
      }
      socket.join(roomId);
      socket.emit("room-state", result.room);
      if (!result.isReconnect) {
        socket.to(roomId).emit("player-joined", result.player);
      }
    });

    socket.on("vote", ({ roomId, playerId: pid, value }) => {
      const room = rm.castVote(roomId, pid || playerId, value);
      if (!room) return;
      io!.to(roomId).emit("vote-received", { playerId: pid || playerId });
    });

    socket.on("reveal", ({ roomId }) => {
      const room = rm.revealVotes(roomId);
      if (!room) return;
      const votes: Record<string, string | null> = {};
      room.players.forEach((p) => {
        votes[p.id] = p.vote ?? null;
      });
      io!.to(roomId).emit("votes-revealed", { votes });
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("reset-votes", ({ roomId }) => {
      const room = rm.resetVotes(roomId);
      if (!room) return;
      io!.to(roomId).emit("votes-reset");
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("next-ticket", ({ roomId }) => {
      const room = rm.nextTicket(roomId);
      if (!room) return;
      io!.to(roomId).emit("votes-reset");
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("select-ticket", ({ roomId, ticketIdx }) => {
      const room = rm.selectTicket(roomId, ticketIdx);
      if (!room) return;
      io!.to(roomId).emit("votes-reset");
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("set-final-score", ({ roomId, score }) => {
      const room = rm.setFinalScore(roomId, score);
      if (!room) return;
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("change-scale", ({ roomId, scale }) => {
      const room = rm.changeScale(roomId, scale as Scale);
      if (!room) return;
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("load-tickets", ({ roomId, tickets }) => {
      const room = rm.loadTickets(roomId, tickets);
      if (!room) return;
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("add-ticket", ({ roomId, ticket }) => {
      const room = rm.addTicket(roomId, ticket);
      if (!room) return;
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("remove-ticket", ({ roomId, ticketIdx }) => {
      const room = rm.removeTicket(roomId, ticketIdx);
      if (!room) return;
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("throw-paper", ({ roomId, fromId, toId }) => {
      io!.to(roomId).emit("paper-thrown", { fromId, toId });
    });

    socket.on("coin-flip", ({ roomId, result, playerName }) => {
      io!.to(roomId).emit("coin-flipped", { result, playerName });
    });

    socket.on("kick-player", ({ roomId, playerId: pid }) => {
      const target = rm.getRoom(roomId)?.players.find((p) => p.id === pid);
      const room = rm.kickPlayer(roomId, pid);
      if (!room) return;
      if (target) {
        io!.to(pid).emit("kicked");
      }
      io!.to(roomId).emit("room-state", room);
    });

    socket.on("disconnect", () => {
      const logicalId = socketToLogical.get(socket.id) ?? socket.id;
      socketToLogical.delete(socket.id);

      // Only disconnect the player if this socket is still their active one.
      // If the player already reconnected with a new socket, ignore this stale disconnect
      // (prevents race condition: new socket reconnects before old one finishes disconnecting).
      const activeSocket = logicalToSocket.get(logicalId);
      if (activeSocket && activeSocket !== socket.id) return;

      logicalToSocket.delete(logicalId);
      const room = rm.playerDisconnect(logicalId);
      if (room) {
        io!.to(room.id).emit("player-left", {
          playerId: logicalId,
          name: room.players.find((p) => p.id === logicalId)?.name || "",
        });
        io!.to(room.id).emit("room-state", room);
      }
    });
  });

  return io;
}

export function getIO() {
  return io;
}
