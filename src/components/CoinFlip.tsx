"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "./ThemeContext";
import { getSocket } from "@/lib/socket";

const CoinCanvas = dynamic(
  () => import("./CoinCanvas").then((m) => m.CoinCanvas),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
);

interface Props {
  roomId: string;
  playerName: string;
}

export function CoinFlip({ roomId, playerName }: Props) {
  const theme = useTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"pile" | "face" | null>(null);
  const [flipperName, setFlipperName] = useState<string | null>(null);
  const [targetAngle, setTargetAngle] = useState(0);

  const expectedRef = useRef<"pile" | "face">("pile");
  const angleRef = useRef(0);

  const applyFlip = useCallback((isPile: boolean) => {
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
  }, []);

  // Listen for flips from other players
  useEffect(() => {
    const socket = getSocket();
    const handler = ({ result: r, playerName: name }: { result: "pile" | "face"; playerName: string }) => {
      expectedRef.current = r;
      setFlipperName(name);
      applyFlip(r === "pile");
    };
    socket.on("coin-flipped", handler);
    return () => { socket.off("coin-flipped", handler); };
  }, [applyFlip]);

  const flip = useCallback(() => {
    if (isFlipping) return;
    const isPile = Math.random() < 0.5;
    const r = isPile ? "pile" : "face";
    expectedRef.current = r;
    setFlipperName(playerName);

    // Broadcast to room (server will re-emit to everyone including self)
    const socket = getSocket();
    socket.emit("coin-flip", { roomId, result: r, playerName });

    applyFlip(isPile);
  }, [isFlipping, roomId, playerName, applyFlip]);

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
          <div className="flex items-center gap-1.5">
            {flipperName && flipperName !== playerName && (
              <span className="text-xs opacity-40">{flipperName} ·</span>
            )}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${theme.consensus}`}>
              {result === "pile" ? "Pile !" : "Face !"}
            </span>
          </div>
        )}
        {isFlipping && (
          <span className="text-xs opacity-40 animate-pulse">
            {flipperName && flipperName !== playerName ? `${flipperName} lance…` : "En cours…"}
          </span>
        )}
      </div>

      {/* 3D coin */}
      <div style={{ height: 200 }}>
        <CoinCanvas
          targetAngle={targetAngle}
          onComplete={handleComplete}
          onFlip={flip}
          isFlipping={isFlipping}
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
