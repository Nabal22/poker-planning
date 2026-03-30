"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "./ThemeContext";

const CoinCanvas = dynamic(
  () => import("./CoinCanvas").then((m) => m.CoinCanvas),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
);

export function CoinFlip() {
  const theme = useTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"pile" | "face" | null>(null);
  const [targetAngle, setTargetAngle] = useState(0);

  const expectedRef = useRef<"pile" | "face">("pile");
  const angleRef = useRef(0);

  const flip = useCallback(() => {
    if (isFlipping) return;
    const isPile = Math.random() < 0.5;
    expectedRef.current = isPile ? "pile" : "face";

    const TAU = 2 * Math.PI;
    const prev = angleRef.current;
    const curNorm = ((prev % TAU) + TAU) % TAU;
    const tgtNorm = isPile ? 0 : Math.PI;
    let adj = tgtNorm - curNorm;
    if (adj <= 0) adj += TAU;
    const newAngle = prev + (4 + Math.floor(Math.random() * 4)) * TAU + adj;

    angleRef.current = newAngle;
    setTargetAngle(newAngle);
    setIsFlipping(true);
    setResult(null);
  }, [isFlipping]);

  const handleComplete = useCallback(() => {
    setIsFlipping(false);
    setResult(expectedRef.current);
  }, []);

  return (
    <div className={`rounded-2xl overflow-hidden ${theme.panel}`}>
      {/* Label */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-medium opacity-50 uppercase tracking-wide">Pile ou face</span>
        {result && !isFlipping && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${theme.consensus}`}>
            {result === "pile" ? "Pile !" : "Face !"}
          </span>
        )}
        {isFlipping && (
          <span className="text-xs opacity-40 animate-pulse">En cours…</span>
        )}
      </div>

      {/* 3D coin */}
      <div className="bg-[#0c0c1a]" style={{ height: 200 }}>
        <CoinCanvas
          targetAngle={targetAngle}
          onComplete={handleComplete}
          onClick={flip}
        />
      </div>

      {/* Button */}
      <div className="px-4 py-3">
        <button
          onClick={flip}
          disabled={isFlipping}
          className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${theme.secondaryBtn} ${isFlipping ? "opacity-50 cursor-wait" : ""}`}
        >
          {isFlipping ? "En cours…" : result ? "Re-lancer" : "Lancer la pièce"}
        </button>
      </div>
    </div>
  );
}
