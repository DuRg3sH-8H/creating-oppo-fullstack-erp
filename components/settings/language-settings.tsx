"use client"

import { useLanguage } from "@/components/language-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">{t("language_settings_description")}</p>

      <RadioGroup value={language} onValueChange={(value) => setLanguage(value as "en" | "ne")} className="space-y-3">
        <div className="flex items-center space-x-3 rounded-md border p-3 hover:bg-gray-50">
          <RadioGroupItem value="en" id="en" />
          <Label htmlFor="en" className="flex items-center cursor-pointer">
            <div className="w-6 h-6 mr-3 rounded-sm overflow-hidden border border-gray-200">
              <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-medium">English</span>
              <p className="text-sm text-gray-500">English (United Kingdom)</p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 rounded-md border p-3 hover:bg-gray-50">
          <RadioGroupItem value="ne" id="ne" />
          <Label htmlFor="ne" className="flex items-center cursor-pointer">
            <div className="w-6 h-6 mr-3 rounded-sm overflow-hidden border border-gray-200">
              <img src="https://flagcdn.com/w40/np.png" alt="Nepali" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-medium">नेपाली</span>
              <p className="text-sm text-gray-500">Nepali (Nepal)</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <div className="mt-6">
        <p className="text-sm text-gray-500">{t("language_change_note")}</p>
      </div>
    </div>
  )
}
