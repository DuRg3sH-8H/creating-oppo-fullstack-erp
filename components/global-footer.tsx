"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar,
  Languages,
  Video,
  Clock,
  HelpCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { useTheme } from "@/components/theme-context"
import { useLanguage } from "@/components/language-context"
import { cn } from "@/lib/utils"

// Create a custom event for opening the chatbot
const openChatbot = () => {
  const event = new CustomEvent("open-chatbot")
  window.dispatchEvent(event)
}

export function GlobalFooter() {
  // Initialize context values with defaults
  const defaultLanguageContext = {
    t: (key: string) => key,
    formatDate: (date: Date) => date.toLocaleDateString(),
  }

  const defaultThemeContext = {
    primaryColor: "#4f46e5",
    accentColor: "#0ea5e9",
  }

  // Use the hooks, but provide fallback values if they error
  let languageContext
  try {
    languageContext = useLanguage()
  } catch (error) {
    languageContext = defaultLanguageContext
  }

  let themeContext
  try {
    themeContext = useTheme()
  } catch (error) {
    themeContext = defaultThemeContext
  }

  const { t, formatDate } = languageContext
  const { primaryColor, accentColor } = themeContext

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isToolsExpanded, setIsToolsExpanded] = useState(false)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format time as HH:MM:SS
  const formattedTime = currentTime.toLocaleTimeString()

  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto text-xs">
      {/* Rest of the component remains the same */}
      {/* Mobile Toggle */}
      <div className="md:hidden border-b border-gray-200">
        <button
          onClick={() => setIsToolsExpanded(!isToolsExpanded)}
          className="w-full p-2 flex items-center justify-between text-[var(--accent-color)]"
        >
          <span className="font-medium">{t("tools_and_resources")}</span>
          {isToolsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Tools Section */}
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isToolsExpanded ? "max-h-48" : "max-h-0 md:max-h-none",
        )}
      >
        <div className="container mx-auto py-2 px-4">
          <div className="flex flex-wrap justify-center md:justify-between gap-3 md:gap-2">
            {/* Nepali Patro */}
            <a
              href="https://www.hamropatro.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-3 w-3 text-[var(--primary-color)]" />
              <span className="text-gray-700">{t("nepali_patro")}</span>
            </a>

            {/* Unicode Converter */}
            <a
              href="https://www.ashesh.com.np/preeti-unicode/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              <Languages className="h-3 w-3 text-[var(--primary-color)]" />
              <span className="text-gray-700">{t("unicode_converter")}</span>
            </a>

            {/* Google Meet */}
            <a
              href="https://meet.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              <Video className="h-3 w-3 text-[var(--primary-color)]" />
              <span className="text-gray-700">{t("google_meet")}</span>
            </a>

            {/* Real-Time Clock */}
            <div className="flex items-center gap-1 px-2 py-1">
              <Clock className="h-3 w-3 text-[var(--primary-color)]" />
              <span className="text-gray-700 font-medium">{formattedTime}</span>
            </div>

            {/* Help/FAQs - Now opens the chatbot */}
            <button
              onClick={openChatbot}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="h-3 w-3 text-[var(--primary-color)]" />
              <span className="text-gray-700">{t("help")}</span>
            </button>

            {/* Social Icons */}
            <div className="flex items-center gap-2 px-2 py-1">
              <a href="#" className="text-[var(--primary-color)] hover:text-[var(--accent-color)]">
                <Facebook className="h-3 w-3" />
              </a>
              <a href="#" className="text-[var(--primary-color)] hover:text-[var(--accent-color)]">
                <Twitter className="h-3 w-3" />
              </a>
              <a href="#" className="text-[var(--primary-color)] hover:text-[var(--accent-color)]">
                <Instagram className="h-3 w-3" />
              </a>
              <a href="#" className="text-[var(--primary-color)] hover:text-[var(--accent-color)]">
                <Youtube className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-gray-50 py-2 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">{t("copyright", new Date().getFullYear())}</p>
            <div className="flex space-x-4 mt-1 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-600 hover:text-[var(--accent-color)]">
                {t("privacy")}
              </Link>
              <Link href="/terms-of-service" className="text-gray-600 hover:text-[var(--accent-color)]">
                {t("terms")}
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-[var(--accent-color)]">
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
