"use client";

import { SCALES } from "@/lib/types";
import type { Scale } from "@/lib/types";

interface Props {
  scale: Scale;
  selectedValue: string | null;
  onVote: (value: string) => void;
  revealed: boolean;
  disabled?: boolean;
}

export function VotingCards({ scale, selectedValue, onVote, revealed, disabled }: Props) {
  const cards = SCALES[scale];
  const canVote = !disabled && !revealed;

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-gray-500">
        Votre estimation
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        {cards.map((card) => {
          const isSelected = selectedValue === card;
          return (
            <button
              key={card}
              onClick={() => canVote && onVote(card)}
              disabled={!canVote}
              className={`
                relative h-20 w-14 rounded-xl border-2 text-xl font-bold
                transition-all duration-150 select-none
                ${isSelected
                  ? "border-indigo-400 bg-indigo-600 text-white -translate-y-2 shadow-xl shadow-indigo-500/40"
                  : canVote
                    ? "border-gray-600 bg-gray-800/80 text-gray-200 hover:border-indigo-400/60 hover:bg-gray-700 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    : "border-gray-700 bg-gray-800/40 text-gray-600 cursor-not-allowed"
                }
              `}
            >
              {card}
            </button>
          );
        })}
      </div>
    </div>
  );
}
