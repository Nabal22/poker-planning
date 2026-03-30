import type { Room, Player, JiraTicket, Scale } from "./types";

const rooms = new Map<string, Room>();

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(id) ? generateRoomId() : id;
}

export function createRoom(hostId: string, hostName: string): Room {
  const id = generateRoomId();
  const host: Player = {
    id: hostId,
    name: hostName,
    isHost: true,
    hasVoted: false,
    connected: true,
  };
  const room: Room = {
    id,
    host: hostId,
    scale: "fibonacci",
    players: [host],
    tickets: [],
    currentTicketIdx: 0,
    revealed: false,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(roomId: string, playerId: string, playerName: string): { room: Room; player: Player } | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.players.length >= 20) return null;

  const existing = room.players.find((p) => p.id === playerId);
  if (existing) {
    existing.connected = true;
    room.lastActivityAt = Date.now();
    return { room, player: existing };
  }

  const player: Player = {
    id: playerId,
    name: playerName,
    isHost: false,
    hasVoted: false,
    connected: true,
  };
  room.players.push(player);
  room.lastActivityAt = Date.now();
  return { room, player };
}

export function playerDisconnect(playerId: string): Room | null {
  for (const room of rooms.values()) {
    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.connected = false;
      room.lastActivityAt = Date.now();
      return room;
    }
  }
  return null;
}

export function kickPlayer(roomId: string, playerId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== playerId);
  return room;
}

export function castVote(roomId: string, playerId: string, value: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.revealed) return null;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;
  player.vote = value;
  player.hasVoted = true;
  room.lastActivityAt = Date.now();
  return room;
}

export function revealVotes(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.revealed = true;
  room.lastActivityAt = Date.now();
  return room;
}

export function resetVotes(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.players.forEach((p) => {
    p.vote = null;
    p.hasVoted = false;
  });
  room.revealed = false;
  delete room.finalScore;
  room.lastActivityAt = Date.now();
  return room;
}

export function setFinalScore(roomId: string, score: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.finalScore = score;
  room.lastActivityAt = Date.now();
  return room;
}

export function nextTicket(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.currentTicketIdx < room.tickets.length - 1) {
    room.currentTicketIdx++;
  }
  room.players.forEach((p) => {
    p.vote = null;
    p.hasVoted = false;
  });
  room.revealed = false;
  delete room.finalScore;
  room.lastActivityAt = Date.now();
  return room;
}

export function selectTicket(roomId: string, ticketIdx: number): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (ticketIdx < 0 || ticketIdx >= room.tickets.length) return null;
  room.currentTicketIdx = ticketIdx;
  room.players.forEach((p) => {
    p.vote = null;
    p.hasVoted = false;
  });
  room.revealed = false;
  delete room.finalScore;
  room.lastActivityAt = Date.now();
  return room;
}

export function changeScale(roomId: string, scale: Scale): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.scale = scale;
  room.players.forEach((p) => {
    p.vote = null;
    p.hasVoted = false;
  });
  room.revealed = false;
  room.lastActivityAt = Date.now();
  return room;
}

export function loadTickets(roomId: string, tickets: JiraTicket[]): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.tickets = tickets;
  room.currentTicketIdx = 0;
  room.players.forEach((p) => {
    p.vote = null;
    p.hasVoted = false;
  });
  room.revealed = false;
  delete room.finalScore;
  room.lastActivityAt = Date.now();
  return room;
}

export function markTicketEstimated(roomId: string, ticketIdx: number, score: string): void {
  const room = rooms.get(roomId);
  if (!room || !room.tickets[ticketIdx]) return;
  room.tickets[ticketIdx].estimatedPoints = score;
}

// Clean up inactive rooms every 15 minutes
setInterval(() => {
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const now = Date.now();
  for (const [id, room] of rooms.entries()) {
    if (now - room.lastActivityAt > TWO_HOURS) {
      rooms.delete(id);
    }
  }
}, 15 * 60 * 1000);
