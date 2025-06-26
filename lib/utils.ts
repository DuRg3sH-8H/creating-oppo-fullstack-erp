import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export const formatFileSize = (sizeInBytes: number) => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB` // Convert to KB with one decimal place
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB` // Convert to MB with one decimal place
  }
}

export const isValidDate = (date: Date | string) => {
  const d = new Date(date)
  return !isNaN(d.getTime())
}

export const safeFormatDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  
  if (!isValidDate(date)) {
    return "Invalid Date"
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}
