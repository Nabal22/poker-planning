import { cookies } from "next/headers";
import { Suspense } from "react";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  const cookieStore = await cookies();
  const savedName = cookieStore.get("player-name")?.value || "";

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <HomePageClient savedName={savedName} />
    </Suspense>
  );
}
