"use client"
import React, { useEffect, useRef } from 'react'
import { Boxes } from "../components/bacnground-boxes";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from '@/components/ui/button';

const DigitalRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fontSize = 14
    const columns = canvas.width / fontSize

    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#0f0'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.random() * 128)
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }
    }

    const interval = setInterval(draw, 33)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />
}

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen relative w-full overflow-hidden rounded-lg bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-yellow-100 via-amber-100 to-white">
      <div className="inset-0 w-full h-full pointer-events-none" />
      <Boxes />

      <div className="container relative min-h-[600px] flex items-center">
        {/* Left side content */}
        <div className="flex-1 pl-20 py-20">
          <h1 className="text-7xl pb-5 pl-3 font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent">
            Run smarter <br />
            expense tracking
          </h1>
          <p className="mt-6 pl-3 font-bold text-xl pb-10 text-gray-700 max-w-[600px]">
            Streamline your expense management with real-time collaboration. 
            Track receipts, generate reports, and manage budgets from anywhere.
          </p>
          <Link href="/register">
            <Button className="p-2.5">Sign up free</Button>
          </Link>
        </div>

        {/* Right side preview (Increased size) */}
        <div className="flex-1 relative flex justify-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg border shadow-xl w-[700px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-5 w-5 rounded-full bg-red-500" />
                <div className="h-5 w-5 rounded-full bg-yellow-500" />
                <div className="h-5 w-5 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-blue-100" />
                <div className="h-5 w-5 rounded-full bg-blue-100" />
              </div>
            </div>

            {/* Expense cards grid */}
            <div className="grid grid-cols-3 gap-7">
              {[
                { name: "Travel", amount: "$245.00", color: "bg-pink-100" },
                { name: "Office", amount: "$129.99", color: "bg-blue-100" },
                { name: "Meals", amount: "$89.50", color: "bg-yellow-100" },
                { name: "Tech", amount: "$399.99", color: "bg-violet-100" },
                { name: "Transport", amount: "$65.00", color: "bg-green-100" },
                { name: "Others", amount: "$149.99", color: "bg-orange-100" }
              ].map((expense, index) => (
                <div key={index} className={`${expense.color} p-4 rounded-lg shadow-sm`}>
                  <div className="text-sm font-medium">{expense.name}</div>
                  <div className="text-lg font-bold mt-1">{expense.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
