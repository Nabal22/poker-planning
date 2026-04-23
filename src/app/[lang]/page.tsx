import Link from "next/link";
import Image from "next/image";
import type { PageProps } from "next/types";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales, type Locale } from "./dictionaries";

export default async function LandingPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [landing, common] = await Promise.all([
    getDictionary(lang, "landing"),
    getDictionary(lang, "common"),
  ]);

  const otherLocale: Locale = lang === "fr" ? "en" : "fr";
  const otherLocaleLabel = lang === "fr" ? "EN" : "FR";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Poker Planning" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-white">Poker Planning</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/${otherLocale}`}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            {otherLocaleLabel}
          </Link>
          <Link
            href={`/${lang}/app`}
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {common.nav.launchApp}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
          <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-600/40 rounded-full px-4 py-1.5 text-sm text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Planning Poker
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold max-w-3xl leading-tight">
            {landing.hero.title}
          </h1>
          <p className="text-lg text-gray-400 max-w-xl">
            {landing.hero.subtitle}
          </p>
          <Link
            href={`/${lang}/app`}
            className="mt-2 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            {landing.hero.cta}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>

        {/* Stats */}
        <section className="px-6 py-12 border-t border-gray-800 bg-gray-900/30">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
            <StatItem value="1 200+" label={landing.stats.sessions} />
            <StatItem value="340+" label={landing.stats.teams} />
            <StatItem value="48 000+" label={landing.stats.tickets} />
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 border-t border-gray-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">{landing.features.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon="⚡"
                title={landing.features.realtime.title}
                description={landing.features.realtime.description}
              />
              <FeatureCard
                icon="🎯"
                title={landing.features.jira.title}
                description={landing.features.jira.description}
              />
              <FeatureCard
                icon="🎨"
                title={landing.features.themes.title}
                description={landing.features.themes.description}
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-16 border-t border-gray-800 bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">{landing.howItWorks.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Step number={1} label={landing.howItWorks.step1.label} description={landing.howItWorks.step1.description} />
              <Step number={2} label={landing.howItWorks.step2.label} description={landing.howItWorks.step2.description} />
              <Step number={3} label={landing.howItWorks.step3.label} description={landing.howItWorks.step3.description} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-24 flex flex-col items-center text-center gap-6 border-t border-gray-800">
          <h2 className="text-3xl font-bold">{landing.finalCta.title}</h2>
          <Link
            href={`/${lang}/app`}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            {landing.finalCta.cta}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Poker Planning
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, label, description }: { number: number; label: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
        {number}
      </div>
      <h3 className="font-semibold text-white">{label}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
