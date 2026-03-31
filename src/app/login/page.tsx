"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });

    if (res.ok) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
      router.refresh();
    } else {
      setError("Code incorrect");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Image src="/logo.png" alt="Poker Planning" width={80} height={80} className="h-20 w-20 mx-auto rounded-2xl bg-gray-100/10 p-2" />
          <h1 className="text-2xl font-bold">Poker Planning</h1>
          <p className="text-gray-400 text-sm">Entrez le code d&apos;accès</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors text-center tracking-widest"
            placeholder="Code d'accès"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            autoFocus
          />
          {error && (
            <p className="text-center text-sm text-red-400 bg-red-900/20 rounded-lg p-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>
      </div>
    </div>
  );
}
