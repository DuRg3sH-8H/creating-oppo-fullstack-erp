"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations, formatTranslation } from "@/lib/translations"

type Language = "en" | "ne"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, ...args: any[]) => string
  formatDate: (date: Date | string) => string
  formatNumber: (num: number) => string
  formatCurrency: (amount: number) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  // Initialize language from localStorage on client side
  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ne")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage)
    }
  }

  // Translation function with parameter support
  const t = (key: string, ...args: any[]): string => {
    const translation = translations[language]?.[key] || translations.en[key] || key
    return formatTranslation(translation, ...args)
  }

  // Format date according to the selected language
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date

    if (language === "ne") {
      // Nepali date formatting
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      // Use Nepali locale if available, otherwise fallback to English
      return dateObj.toLocaleDateString("ne-NP", options)
    } else {
      // English date formatting
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      return dateObj.toLocaleDateString("en-US", options)
    }
  }

  // Format number according to the selected language
  const formatNumber = (num: number): string => {
    if (language === "ne") {
      // Nepali number formatting
      return num.toLocaleString("ne-NP")
    } else {
      // English number formatting
      return num.toLocaleString("en-US")
    }
  }

  // Format currency according to the selected language
  const formatCurrency = (amount: number): string => {
    if (language === "ne") {
      // Nepali currency formatting (NPR)
      return `रू ${amount.toLocaleString("ne-NP")}`
    } else {
      // English currency formatting (USD as default)
      return `NPR ${amount.toLocaleString("en-US")}`
    }
  }

  // Prevent hydration mismatch by rendering only after mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatDate,
        formatNumber,
        formatCurrency,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
