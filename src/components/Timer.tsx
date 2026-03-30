"use client";

interface Props {
  remaining: number | null;
  duration: number;
  isHost: boolean;
  onStart: () => void;
  onStop: () => void;
  onChangeDuration: (d: number) => void;
}

const PRESETS = [30, 60, 90, 120];

export function Timer({ remaining, duration, isHost, onStart, onStop, onChangeDuration }: Props) {
  const isRunning = remaining !== null;
  const pct = duration > 0 && remaining !== null ? (remaining / duration) * 100 : 100;
  const isUrgent = remaining !== null && remaining <= 10;

  return (
    <div className="rounded-xl bg-gray-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Timer</span>
        {isRunning && (
          <span className={`font-mono text-xl font-bold ${isUrgent ? "text-red-400 animate-pulse" : "text-white"}`}>
            {remaining}s
          </span>
        )}
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${isUrgent ? "bg-red-500" : "bg-indigo-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {isHost && (
        <>
          {/* Duration presets */}
          <div className="flex gap-2">
            {PRESETS.map((d) => (
              <button
                key={d}
                onClick={() => onChangeDuration(d)}
                className={`flex-1 rounded text-xs py-1 transition-colors ${
                  duration === d
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {d}s
              </button>
            ))}
            <button
              onClick={() => onChangeDuration(0)}
              className={`flex-1 rounded text-xs py-1 transition-colors ${
                duration === 0
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              ∞
            </button>
          </div>

          {/* Start/Stop */}
          <button
            onClick={isRunning ? onStop : onStart}
            disabled={duration === 0}
            className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
              isRunning
                ? "bg-red-600 hover:bg-red-500 text-white"
                : duration === 0
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-600 text-white"
            }`}
          >
            {isRunning ? "Arrêter" : "Démarrer"}
          </button>
        </>
      )}
    </div>
  );
}
