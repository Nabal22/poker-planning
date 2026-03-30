export type Scale = "fibonacci" | "tshirt";

export const SCALES: Record<Scale, string[]> = {
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "?", "☕"],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "?", "☕"],
};

export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  vote?: string | null;
  hasVoted: boolean;
  connected: boolean;
};

export type JiraTicket = {
  key: string;
  summary: string;
  description?: string;
  status: string;
  currentPoints?: number;
  assignee?: string;
  estimatedPoints?: string;
};

export type Room = {
  id: string;
  host: string;
  scale: Scale;
  players: Player[];
  tickets: JiraTicket[];
  currentTicketIdx: number;
  revealed: boolean;
  finalScore?: string;
  createdAt: number;
  lastActivityAt: number;
};

// Socket events
export type ClientToServerEvents = {
  "join-room": (data: { roomId: string; playerName: string; playerId?: string }) => void;
  "create-room": (data: { playerName: string }) => void;
  vote: (data: { roomId: string; playerId: string; value: string }) => void;
  reveal: (data: { roomId: string }) => void;
  "reset-votes": (data: { roomId: string }) => void;
  "next-ticket": (data: { roomId: string }) => void;
  "select-ticket": (data: { roomId: string; ticketIdx: number }) => void;
  "set-final-score": (data: { roomId: string; score: string }) => void;
  "change-scale": (data: { roomId: string; scale: Scale }) => void;
  "load-tickets": (data: { roomId: string; tickets: JiraTicket[] }) => void;
  "kick-player": (data: { roomId: string; playerId: string }) => void;
};

export type ServerToClientEvents = {
  "room-state": (room: Room) => void;
  "player-joined": (player: Player) => void;
  "player-left": (data: { playerId: string; name: string }) => void;
  "vote-received": (data: { playerId: string }) => void;
  "votes-revealed": (data: { votes: Record<string, string | null> }) => void;
  "votes-reset": () => void;
  kicked: () => void;
  error: (data: { message: string }) => void;
};
