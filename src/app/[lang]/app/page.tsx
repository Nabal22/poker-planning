import { cookies } from "next/headers";
import { Suspense } from "react";
import type { PageProps } from "next/types";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { HomePageClient } from "./HomePageClient";

export default async function AppPage({ params }: PageProps<"/[lang]/app">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const cookieStore = await cookies();
  const savedName = cookieStore.get("player-name")?.value || "";
  const t = await getDictionary(lang, "app");

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <HomePageClient savedName={savedName} t={t.lobby} lang={lang} />
    </Suspense>
  );
}
