"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Check } from "lucide-react"

export function PasswordChangeForm() {
  const { t } = useLanguage()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t("all_fields_required"))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwords_dont_match"))
      return
    }

    if (newPassword.length < 8) {
      setError(t("password_too_short"))
      return
    }

    // Simulate API call
    setLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate success
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(t("password_change_error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">{t("current_password")}</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder={t("enter_current_password")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">{t("new_password")}</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t("enter_new_password")}
        />
        <p className="text-xs text-gray-500">{t("password_requirements")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">{t("confirm_password")}</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t("confirm_new_password")}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start">
          <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{t("password_changed_successfully")}</span>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t("changing_password") : t("change_password")}
      </Button>
    </form>
  )
}
