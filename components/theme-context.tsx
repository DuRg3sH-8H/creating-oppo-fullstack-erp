"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect"
import type { School } from "@/components/schools/types"

type ThemeContextType = {
  setThemeColors(previewPrimary: string, previewSecondary: string, previewAccent: string): unknown

    primaryColor: string
    secondaryColor: string
    accentColor: string
    darkColor: string
  
  schoolName: string | null
  schoolLogo: string | null
  setSchoolTheme: (school: School) => void
  resetTheme: () => void
  isLoading: boolean
}

// Default theme (Super Admin theme)
const defaultTheme = {
  primaryColor: "#017489",
  secondaryColor: "#006955",
  accentColor: "#02609E",
  darkColor: "#013A87",
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: defaultTheme.primaryColor,
  secondaryColor: defaultTheme.secondaryColor,
  accentColor: defaultTheme.accentColor,
  darkColor: defaultTheme.darkColor,
  schoolName: null,
  schoolLogo: null,
  setSchoolTheme: () => { },
  resetTheme: () => { },
  isLoading: false,
  setThemeColors: function (previewPrimary: string, previewSecondary: string, previewAccent: string): unknown {
    throw new Error("Function not implemented.")
  }
})

export const useTheme = () => useContext(ThemeContext)

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "0, 0, 0"

  const r = Number.parseInt(result[1], 16)
  const g = Number.parseInt(result[2], 16)
  const b = Number.parseInt(result[3], 16)

  return `${r}, ${g}, ${b}`
}

// Helper function to generate color variations
function generateColorVariations(baseColor: string) {
  const rgb = hexToRgb(baseColor)
  return {
    50: `rgba(${rgb}, 0.05)`,
    100: `rgba(${rgb}, 0.1)`,
    200: `rgba(${rgb}, 0.2)`,
    300: `rgba(${rgb}, 0.3)`,
    400: `rgba(${rgb}, 0.4)`,
    500: baseColor,
    600: `rgba(${rgb}, 0.8)`,
    700: `rgba(${rgb}, 0.9)`,
    800: baseColor,
    900: `rgba(${rgb}, 1)`,
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme)
  const [schoolName, setSchoolName] = useState<string | null>(null)
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Track if component is mounted to avoid SSR issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Apply theme colors to CSS variables
  const applyThemeToCSS = React.useCallback(
    (theme: typeof defaultTheme) => {
      if (!isMounted || typeof window === "undefined") return

      const root = document.documentElement

      // Set main theme colors
      root.style.setProperty("--primary-color", theme.primaryColor)
      root.style.setProperty("--secondary-color", theme.secondaryColor)
      root.style.setProperty("--accent-color", theme.accentColor)
      root.style.setProperty("--dark-color", theme.darkColor)

      // Generate and set color variations
      const primaryVariations = generateColorVariations(theme.primaryColor)
      Object.entries(primaryVariations).forEach(([key, value]) => {
        root.style.setProperty(`--primary-${key}`, value)
      })

      // Set RGB values for use with opacity
      root.style.setProperty("--primary-rgb", hexToRgb(theme.primaryColor))
      root.style.setProperty("--secondary-rgb", hexToRgb(theme.secondaryColor))
      root.style.setProperty("--accent-rgb", hexToRgb(theme.accentColor))
      root.style.setProperty("--dark-rgb", hexToRgb(theme.darkColor))
    },
    [isMounted],
  )

  // Set theme based on school
  const setSchoolTheme = React.useCallback(
    (school: School) => {
      if (!isMounted) return

      setIsLoading(true)

      const newTheme = {
        primaryColor: school.primaryColor,
        secondaryColor: school.secondaryColor,
        accentColor: school.accentColor,
        darkColor: school.darkColor,
      }

      setCurrentTheme(newTheme)
      setSchoolName(school.name)
      setSchoolLogo(school.logo)

      // Apply theme to CSS
      applyThemeToCSS(newTheme)

      // Save to localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "schoolTheme",
          JSON.stringify({
            theme: newTheme,
            schoolName: school.name,
            schoolLogo: school.logo,
            schoolId: school.id,
          }),
        )
      }

      setIsLoading(false)
    },
    [applyThemeToCSS, isMounted],
  )

  // Reset to default theme (for Super Admin)
  const resetTheme = React.useCallback(() => {
    if (!isMounted) return

    setIsLoading(true)

    setCurrentTheme(defaultTheme)
    setSchoolName(null)
    setSchoolLogo(null)

    // Apply default theme to CSS
    applyThemeToCSS(defaultTheme)

    if (typeof window !== "undefined") {
      localStorage.removeItem("schoolTheme")
    }

    setIsLoading(false)
  }, [applyThemeToCSS, isMounted])

  // Load theme from localStorage on initial load
  useIsomorphicLayoutEffect(() => {
    if (!isMounted || typeof window === "undefined") return

    const savedTheme = localStorage.getItem("schoolTheme")
    if (savedTheme) {
      try {
        const { theme, schoolName, schoolLogo } = JSON.parse(savedTheme)
        setCurrentTheme(theme)
        setSchoolName(schoolName)
        setSchoolLogo(schoolLogo)
        applyThemeToCSS(theme)
      } catch (error) {
        console.error("Error parsing saved theme:", error)
        applyThemeToCSS(defaultTheme)
      }
    } else {
      // Apply default theme on first load
      applyThemeToCSS(defaultTheme)
    }
  }, [isMounted, applyThemeToCSS])

  // Function to set theme colors for preview (does not persist)
  const setThemeColors = React.useCallback(
    (previewPrimary: string, previewSecondary: string, previewAccent: string) => {
      if (!isMounted) return
      const previewTheme = {
        primaryColor: previewPrimary,
        secondaryColor: previewSecondary,
        accentColor: previewAccent,
        darkColor: defaultTheme.darkColor,
      }
      setCurrentTheme(previewTheme)
      applyThemeToCSS(previewTheme)
    },
    [isMounted, applyThemeToCSS]
  )

  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      ...currentTheme,
      schoolName,
      schoolLogo,
      setSchoolTheme,
      resetTheme,
      isLoading,
      setThemeColors,
    }),
    [currentTheme, schoolName, schoolLogo, setSchoolTheme, resetTheme, isLoading, setThemeColors],
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
