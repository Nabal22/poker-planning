"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoomView } from "@/components/RoomView";

interface Props {
  paramsPromise: Promise<{ roomId: string }>;
}

export default function RoomPageClient({ paramsPromise }: Props) {
  const { roomId } = use(paramsPromise);
  const router = useRouter();

  const [playerName] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("planning-poker-player-name");
  });

  const [savedPlayerId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(`planning-poker-player-id:${roomId}`) || undefined;
  });

  useEffect(() => {
    if (!playerName) {
      router.replace(`/?room=${roomId}`);
    }
  }, [playerName, roomId, router]);

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
