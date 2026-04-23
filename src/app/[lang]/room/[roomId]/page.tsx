import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";
import RoomPageClient from "./RoomPageClient";

export default async function RoomPage({ params }: { params: Promise<{ lang: string; roomId: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const cookieStore = await cookies();
  const savedName = cookieStore.get("player-name")?.value || null;

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Chargement...</div>}>
      <RoomPageClient paramsPromise={params} savedName={savedName} lang={lang} />
    </Suspense>
  );
}
