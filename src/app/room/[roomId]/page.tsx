import { Suspense } from "react";
import RoomPageClient from "./RoomPageClient";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Chargement...</div>}>
      <RoomPageClient paramsPromise={params} />
    </Suspense>
  );
}
