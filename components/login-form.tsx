"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Loader2, ChevronLeft, School, User, Users, Sun, Moon, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-context"
import { useRole } from "@/components/role-context"
import { useLanguage } from "@/components/language-context"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/components/auth/auth-context"

type UserType = "super-admin" | "school" | "eca" | null


export function LoginForm() {
  const [userType, setUserType] = useState<UserType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [greeting, setGreeting] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [formError, setFormError] = useState("")
  const [showDemoUsers, setShowDemoUsers] = useState(false)
  const { setSchoolTheme, resetTheme } = useTheme()
  const { login } = useRole()
  const { t, language } = useLanguage()
  const router = useRouter()
  const { login: authLogin } = useAuth()

  // Reset theme when component mounts (logout)
  useEffect(() => {
    if (resetTheme) {
      resetTheme()
    }

    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting(t("good_morning"))
    } else if (hour < 18) {
      setGreeting(t("good_afternoon"))
    } else {
      setGreeting(t("good_evening"))
    }
  }, [resetTheme, t, language])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!email || !password) {
      setFormError(t("all_fields_required"))
      return
    }

    if (!email.includes("@")) {
      setFormError(t("invalid_email"))
      return
    }

    setFormError("")
    setIsLoading(true)

    try {
      // Use the auth context to login
      const { success, message } = await authLogin(email, password)

      if (!success) {
        setFormError(message)
        setIsLoading(false)
        return
      }

      // Login successful - the auth context will handle redirection
    } catch (error) {
      console.error("Login error:", error)
      setFormError(t("login_error"))
      setIsLoading(false)
    }
  }


  const getTimeIcon = () => {
    const hour = new Date().getHours()
    if (hour < 12) return <Sun className="h-5 w-5" />
    if (hour < 18) return <Sun className="h-5 w-5" />
    return <Moon className="h-5 w-5" />
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md relative z-10"
    >
      <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[10%] right-[10%] w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-[20%] left-[15%] w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center mb-2">
              {getTimeIcon()}
              <h2 className="text-white text-lg ml-2 font-medium">{greeting}</h2>
            </div>
            <h1 className="text-3xl font-bold text-white">{t("login_title")}</h1>
            <p className="text-[#e0f2f7] mt-2 opacity-90">{t("login_subtitle")}</p>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!userType ? (
              <motion.div
                key="user-type-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h2 className="text-[var(--accent-color)] text-xl font-semibold text-center mb-6">
                  {t("select_user_type")}
                </h2>

                <UserTypeButton
                  label={t("super_admin")}
                  onClick={() => setUserType("super-admin")}
                  icon={<User className="h-5 w-5 text-white" />}
                  description={t("super_admin_desc")}
                  color="bg-gradient-to-r from-indigo-500 to-purple-600"
                />

                <UserTypeButton
                  label={t("school_admin")}
                  onClick={() => setUserType("school")}
                  icon={<School className="h-5 w-5 text-white" />}
                  description={t("school_admin_desc")}
                  color="bg-gradient-to-r from-blue-500 to-cyan-600"
                />

                <UserTypeButton
                  label={t("eca_coordinator")}
                  onClick={() => setUserType("eca")}
                  icon={<Users className="h-5 w-5 text-white" />}
                  description={t("eca_coordinator_desc")}
                  color="bg-gradient-to-r from-emerald-500 to-teal-600"
                />

                
              </motion.div>
            ) : (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="flex items-center mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setUserType(null)
                      setEmail("")
                      setPassword("")
                    }}
                    className="text-[var(--accent-color)] transition-colors mr-3 text-sm flex items-center group"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    {t("back")}
                  </button>
                  <h2 className="text-[var(--accent-color)] text-xl font-semibold">
                    {userType === "super-admin"
                      ? t("super_admin") + " " + t("login")
                      : userType === "school"
                        ? t("school_admin") + " " + t("login")
                        : t("eca_coordinator") + " " + t("login")}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Label
                      htmlFor="email"
                      className={`absolute left-3 transition-all duration-200 ${
                        emailFocused || email
                          ? "-top-2.5 text-xs bg-white px-1 text-[var(--primary-color)]"
                          : "top-2.5 text-gray-500"
                      }`}
                    >
                      {t("email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className="border-[var(--primary-color)]/20 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20 pl-3 py-2.5 rounded-lg bg-white/50 "
                      required
                    />
                  </div>

                  <div className="relative">
                    <Label
                      htmlFor="password"
                      className={`absolute left-3 transition-all duration-200 ${
                        passwordFocused || password
                          ? "-top-2.5 text-xs bg-white px-1 text-[var(--primary-color)]"
                          : "top-2.5 text-gray-500"
                      }`}
                    >
                      {t("password")}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      
                      className="border-[var(--primary-color)]/20 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20 pl-3 py-2.5 rounded-lg bg-white/50 "
                      required
                    />
                  </div>
                </div>

                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm bg-red-50  p-2 rounded-md"
                  >
                    {formError}
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 ">
                      {t("remember_me")}
                    </label>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-[var(--primary-color)] hover:text-[var(--secondary-color)] transition-colors"
                  >
                    {t("forgot_password")}
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white font-medium py-2.5 rounded-lg transition-all duration-200 transform hover:translate-y-[-2px] focus:ring-2 focus:ring-[var(--primary-color)]/50 h-12 shadow-lg shadow-[var(--primary-color)]/20"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <span className="flex items-center justify-center">
                      {t("login")}{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>

                {/* Demo users section */}
                <div className="mt-4 pt-4 border-t border-gray-200 ">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-medium text-gray-500 ">
                      {userType === "super-admin"
                        ? t("super_admin") + " " + t("demo_users")
                        : userType === "school"
                          ? t("school_admin") + " " + t("demo_users")
                          : t("eca_coordinator") + " " + t("demo_users")}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDemoUsers(!showDemoUsers)}
                      className="h-6 text-xs"
                    >
                      {showDemoUsers ? t("hide") : t("show")}
                    </Button>
                  </div>

                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-[var(--accent-color)]/70 text-sm">{t("copyright", new Date().getFullYear())}</p>
      </motion.div>
    </motion.div>
  )
}

function UserTypeButton({
  label,
  onClick,
  icon,
  description,
  color,
}: {
  label: string
  onClick: () => void
  icon: React.ReactNode
  description: string
  color: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center p-4 rounded-xl border border-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/30 hover:shadow-lg hover:shadow-[var(--primary-color)]/5 transition-all duration-200 bg-white/70  backdrop-blur-sm"
    >
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shadow-lg`}>{icon}</div>
      <div className="ml-3 text-left">
        <span className="text-[var(--accent-color)] font-medium block">{label}</span>
        <span className="text-gray-500  text-xs">{description}</span>
      </div>
      <ArrowRight className="ml-auto h-5 w-5 text-[var(--primary-color)] transition-transform group-hover:translate-x-1" />
    </motion.button>
  )
}


