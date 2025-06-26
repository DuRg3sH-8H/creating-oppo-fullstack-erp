"use client"

import { useState } from "react"
import { useTheme } from "@/components/theme-context"
import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  setThemeColors: (primary: string, secondary: string, accent: string) => void;
}

export function ThemePreview() {
  const { t } = useLanguage()
  const { primaryColor, secondaryColor, accentColor, setThemeColors } = useTheme()

  const [previewPrimary, setPreviewPrimary] = useState(primaryColor)
  const [previewSecondary, setPreviewSecondary] = useState(secondaryColor)
  const [previewAccent, setPreviewAccent] = useState(accentColor)

  const handleApplyTheme = () => {
    setThemeColors(previewPrimary, previewSecondary, previewAccent)
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600">{t("theme_preview_description")}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primary-color">{t("primary_color")}</Label>
          <div className="flex space-x-2">
            <div className="w-10 h-10 rounded border" style={{ backgroundColor: previewPrimary }} />
            <Input
              id="primary-color"
              type="text"
              value={previewPrimary}
              onChange={(e) => setPreviewPrimary(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary-color">{t("secondary_color")}</Label>
          <div className="flex space-x-2">
            <div className="w-10 h-10 rounded border" style={{ backgroundColor: previewSecondary }} />
            <Input
              id="secondary-color"
              type="text"
              value={previewSecondary}
              onChange={(e) => setPreviewSecondary(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accent-color">{t("accent_color")}</Label>
          <div className="flex space-x-2">
            <div className="w-10 h-10 rounded border" style={{ backgroundColor: previewAccent }} />
            <Input
              id="accent-color"
              type="text"
              value={previewAccent}
              onChange={(e) => setPreviewAccent(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-lg">
        <h3 className="font-medium mb-4">{t("preview")}</h3>

        <div className="space-y-4">
          <div className="flex space-x-3">
            <Button style={{ backgroundColor: previewPrimary, color: "white" }} className="transition-colors">
              {t("primary_button")}
            </Button>

            <Button style={{ backgroundColor: previewSecondary, color: "white" }} className="transition-colors">
              {t("secondary_button")}
            </Button>

            <Button style={{ backgroundColor: previewAccent, color: "white" }} className="transition-colors">
              {t("accent_button")}
            </Button>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: `${previewPrimary}20` }}>
            <h4 className="font-medium" style={{ color: previewAccent }}>
              {t("sample_heading")}
            </h4>
            <p className="text-gray-600">{t("sample_text")}</p>
          </div>
        </div>
      </div>

      <Button onClick={handleApplyTheme}>{t("apply_theme")}</Button>
    </div>
  )
}
