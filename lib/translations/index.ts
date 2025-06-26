// Main translations file that combines all module translations
import { common } from "./common"
import { auth } from "./auth"
import { dashboard } from "./dashboard"
import { students } from "./students"
import { schools } from "./schools"
import { iso } from "./iso"

// Combine all translations
export const translations = {
  en: {
    ...common.en,
    ...auth.en,
    ...dashboard.en,
    ...students.en,
    ...schools.en,
    ...iso.en,
  },
  ne: {
    ...common.ne,
    ...auth.ne,
    ...dashboard.ne,
    ...students.ne,
    ...schools.ne,
    ...iso.ne,
  },
}

// Helper function to format translations with parameters
export function formatTranslation(text: string, ...args: any[]): string {
  return args.reduce((str, arg, i) => str.replace(new RegExp(`\\{${i}\\}`, "g"), arg), text)
}
