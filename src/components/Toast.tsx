"use client";

import { useRoomStore } from "@/store/useRoomStore";

export function ToastContainer() {
  const { toasts, removeToast } = useRoomStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`cursor-pointer rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            t.type === "success"
              ? "bg-green-600 text-white"
              : t.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
