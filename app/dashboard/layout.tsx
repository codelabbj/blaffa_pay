"use client"

import type React from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { WebSocketProvider } from "@/components/providers/websocket-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get token from localStorage (set in sign-in-form.tsx after login)
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || "";
  }
  return (
    <WebSocketProvider token={token}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </WebSocketProvider>
  )
}
