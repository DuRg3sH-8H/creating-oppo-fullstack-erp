"use client"

import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0 relative">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("switch_language")}</span>
          {language === "ne" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--primary-color)] rounded-full"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={`flex items-center justify-between ${language === "en" ? "bg-gray-100" : ""}`}
        >
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 rounded-sm overflow-hidden border border-gray-200">
              <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-full h-full object-cover" />
            </div>
            <span>English</span>
          </div>
          {language === "en" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-[var(--primary-color)] rounded-full"
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("ne")}
          className={`flex items-center justify-between ${language === "ne" ? "bg-gray-100 " : ""}`}
        >
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 rounded-sm overflow-hidden border border-gray-200">
              <img src="https://flagcdn.com/w40/np.png" alt="Nepali" className="w-full h-full object-cover" />
            </div>
            <span>नेपाली</span>
          </div>
          {language === "ne" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-[var(--primary-color)] rounded-full"
            />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
