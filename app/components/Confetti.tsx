"use client";

import { useEffect, useState } from "react";

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export function Confetti() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    const colors = [
      "#3b82f6", // blue
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#f59e0b", // amber
      "#10b981", // green
      "#06b6d4", // cyan
      "#ef4444", // red
      "#f97316", // orange
    ];

    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setConfetti(pieces);
  }, []);

  return (
    <>
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="fixed pointer-events-none animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            width: "8px",
            height: "8px",
            backgroundColor: piece.color,
            borderRadius: "50%",
            animation: `confetti-fall ${piece.duration}s ease-in forwards`,
            animationDelay: `${piece.delay}s`,
            boxShadow: `0 0 0 2px ${piece.color}40`,
          }}
        />
      ))}
    </>
  );
}
