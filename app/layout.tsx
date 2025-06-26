import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-context"
import { LanguageProvider } from "@/components/language-context"
import { NotificationProvider } from "@/components/notifications/notification-context"
import { RoleProvider } from "@/components/role-context"
import { ChatbotPopup } from "@/components/chatbot/chatbot-popup"
import { AuthProvider } from "@/components/auth/auth-context"
import { GamificationProvider } from "@/components/gamification/gamification-provider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School ERP System",
  description: "Comprehensive School Management System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RoleProvider>
            <ThemeProvider>
              <LanguageProvider>
                <GamificationProvider>
                <NotificationProvider>
                  {children}
                  <ChatbotPopup />
                </NotificationProvider>
                </GamificationProvider>
              </LanguageProvider>
            </ThemeProvider>
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
