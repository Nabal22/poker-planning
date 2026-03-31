"use client";

import { use, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { RoomView } from "@/components/RoomView";

interface Props {
  paramsPromise: Promise<{ roomId: string }>;
  savedName: string | null;
}

const noopSubscribe = () => () => {};

export default function RoomPageClient({ paramsPromise, savedName }: Props) {
  const { roomId } = use(paramsPromise);
  const router = useRouter();

  const savedPlayerId = useSyncExternalStore(
    noopSubscribe,
    () => localStorage.getItem(`planning-poker-player-id:${roomId}`) || undefined,
    () => undefined
  );

  useEffect(() => {
    if (!savedName) {
      router.replace(`/?room=${roomId}`);
    }
  }, [savedName, roomId, router]);

  if (!savedName) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Redirection...
      </div>
    );
  }

  return (
    <RoomView
      roomId={roomId}
      playerName={savedName}
      savedPlayerId={savedPlayerId}
    />
  );
}
