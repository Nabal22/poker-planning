import { Suspense } from "react";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import { LoginClient } from "./LoginClient";

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const t = await getDictionary(lang, "app");

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <LoginClient t={t.login} lang={lang} />
    </Suspense>
  );
}
