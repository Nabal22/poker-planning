"use client";

import type { Scale } from "@/lib/types";

interface Props {
  scale: Scale;
  isHost: boolean;
  onChange: (scale: Scale) => void;
}

export function ScaleSelector({ scale, isHost, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Échelle :</span>
      <div className="flex rounded-lg overflow-hidden border border-gray-700">
        {(["fibonacci", "tshirt"] as Scale[]).map((s) => (
          <button
            key={s}
            onClick={() => isHost && onChange(s)}
            disabled={!isHost}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              scale === s
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            } ${!isHost ? "cursor-default" : "cursor-pointer"}`}
          >
            {s === "fibonacci" ? "Fibonacci" : "T-Shirt"}
          </button>
        ))}
      </div>
    </div>
  );
}
