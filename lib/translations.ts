// Fix the imports to point to the correct paths
import { common } from "./translations/common"
import { auth } from "./translations/auth"
import { dashboard } from "./translations/dashboard"
import { students } from "./translations/students"
import { schools } from "./translations/schools"
import { iso } from "./translations/iso"

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
