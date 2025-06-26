"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface FloatingBackgroundProps {
  count?: number
  primaryColor?: string
  accentColor?: string
}

export function FloatingBackground({
  count = 10,
  primaryColor = "var(--primary-color)",
  accentColor = "var(--accent-color)",
}: FloatingBackgroundProps) {
  const [bubbles, setBubbles] = useState<
    Array<{ x: number; y: number; size: number; color: string; delay: number; duration: number }>
  >([])

  useEffect(() => {
    // Generate random bubbles
    const newBubbles = Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 300 + 100,
      color: Math.random() > 0.5 ? primaryColor : accentColor,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }))
    setBubbles(newBubbles)
  }, [count, primaryColor, accentColor])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {bubbles.map((bubble, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full opacity-[0.07] blur-3xl"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: bubble.color,
          }}
          initial={{ scale: 0.8, opacity: 0.05 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.05, 0.1, 0.05],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: bubble.duration,
            delay: bubble.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Animated gradient lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent"></div>
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[var(--primary-color)] to-transparent"></div>
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-[var(--accent-color)] to-transparent"></div>
      </div>
    </div>
  )
}
