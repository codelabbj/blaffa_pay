import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/components/providers/language-provider"
import { Toaster } from "@/components/ui/toaster"
import { getAppName, getAppTagline } from "@/lib/env-config"
// import { WebSocketProviderWrapper } from "@/components/providers/websocket-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

const appName = getAppName()
const appTagline = getAppTagline()

export const metadata: Metadata = {
  title: `${appName} - ${appTagline}`,
  description: `Professional admin dashboard for ${appName}`,
    // generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            {/* <WebSocketProviderWrapper>
              {children}
            </WebSocketProviderWrapper> */}
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
