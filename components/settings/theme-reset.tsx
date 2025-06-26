"use client"

import { useState } from "react"
import { useTheme } from "@/components/theme-context"
import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function ThemeReset() {
  const { t } = useLanguage()
  const { resetTheme } = useTheme()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResetTheme = async () => {
    setLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      resetTheme()
      setSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600">{t("theme_reset_description")}</p>

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start">
          <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{t("theme_reset_success")}</span>
        </div>
      )}

      <Button variant="destructive" onClick={handleResetTheme} disabled={loading}>
        {loading ? t("resetting_theme") : t("reset_to_default")}
      </Button>
    </div>
  )
}
