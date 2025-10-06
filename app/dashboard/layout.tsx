"use client"

import type React from "react"
import { useState } from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { WebSocketProvider } from "@/components/providers/websocket-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  // Get token from localStorage (set in sign-in-form.tsx after login)
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || "";
  }
  
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }
  
  return (
    <WebSocketProvider token={token}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar 
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        <div className="lg:pl-72">
          <Header 
            onMobileMenuClick={toggleMobileSidebar}
          />
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </WebSocketProvider>
  )
}
