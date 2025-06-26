"use client"

interface ThemePreviewProps {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  darkColor: string
  compact?: boolean
}

export function ThemePreview({
  primaryColor,
  secondaryColor,
  accentColor,
  darkColor,
  compact = false,
}: ThemePreviewProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: primaryColor }} title="Primary Color" />
        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: secondaryColor }} title="Secondary Color" />
        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: accentColor }} title="Accent Color" />
        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: darkColor }} title="Dark Color" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <div className="h-6 rounded" style={{ backgroundColor: primaryColor }} title="Primary Color" />
          <div className="flex items-center text-xs">
            <span className="text-gray-500">Primary</span>
            <span className="ml-auto text-gray-400">{primaryColor}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-6 rounded" style={{ backgroundColor: secondaryColor }} title="Secondary Color" />
          <div className="flex items-center text-xs">
            <span className="text-gray-500">Secondary</span>
            <span className="ml-auto text-gray-400">{secondaryColor}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <div className="h-6 rounded" style={{ backgroundColor: accentColor }} title="Accent Color" />
          <div className="flex items-center text-xs">
            <span className="text-gray-500">Accent</span>
            <span className="ml-auto text-gray-400">{accentColor}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-6 rounded" style={{ backgroundColor: darkColor }} title="Dark Color" />
          <div className="flex items-center text-xs">
            <span className="text-gray-500">Dark</span>
            <span className="ml-auto text-gray-400">{darkColor}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
