import type React from "react"
import { GlobalFooter } from "@/components/global-footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Your existing public layout content */}
      <main className="flex-grow">{children}</main>
      <GlobalFooter />
    </div>
  )
}
