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
  const [targetAngle, setTargetAngle] = useState(0);

  const expectedRef = useRef<"pile" | "face">("pile");
  const angleRef = useRef(0);
  const localFlipPendingRef = useRef(false);

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
    const handler = ({ result: r }: { result: "pile" | "face"; playerName: string }) => {
      // Ignore the socket echo of our own flip — we already animated locally
      if (localFlipPendingRef.current) {
        localFlipPendingRef.current = false;
        return;
      }
      expectedRef.current = r;
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

    // Broadcast to room (server will re-emit to everyone including self — mark pending to ignore echo)
    localFlipPendingRef.current = true;
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
      <div className="px-4 pt-3 pb-1">
        <span className="text-xs font-medium opacity-50 uppercase tracking-wide">Pile ou face</span>
      </div>

      {/* 3D coin */}
      <div style={{ height: 200 }}>
        <CoinCanvas
          targetAngle={targetAngle}
          onComplete={handleComplete}
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
