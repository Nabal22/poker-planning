"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RoomView } from "@/components/RoomView";

interface Props {
  paramsPromise: Promise<{ roomId: string }>;
}

export default function RoomPageClient({ paramsPromise }: Props) {
  const { roomId } = use(paramsPromise);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [savedPlayerId, setSavedPlayerId] = useState<string | undefined>();

  useEffect(() => {
    const nameFromQuery = searchParams.get("name");
    const nameFromStorage = localStorage.getItem("planning-poker-player-name");
    const pidFromStorage = localStorage.getItem(`planning-poker-player-id:${roomId}`);

    const name = nameFromQuery || nameFromStorage;
    if (!name) {
      // Redirect to lobby with room pre-fill
      router.replace(`/?room=${roomId}`);
      return;
    }

    setPlayerName(name);
    if (pidFromStorage) setSavedPlayerId(pidFromStorage);

    if (nameFromQuery) {
      localStorage.setItem("planning-poker-player-name", nameFromQuery);
    }
  }, [roomId, searchParams, router]);

  if (!playerName) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Redirection...
      </div>
    );
  }

  return (
    <RoomView
      roomId={roomId}
      playerName={playerName}
      savedPlayerId={savedPlayerId}
    />
  );
}
