
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle } from "lucide-react"

export default function PasswordReset() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [touched, setTouched] = useState({ password: false, confirmPassword: false })
  const [isLoading, setIsLoading] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const togglePasswordVisibility2 = () => setShowPassword2(!showPassword2)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const tokenParam = searchParams.get("token")

    if (emailParam && tokenParam) {
      setEmail(emailParam)
      setToken(tokenParam)
    } else {
      setMessage("Lien invalide ou expiré.")
      setMessageType("error")
    }
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    if (!token || !email) {
      setMessage("Lien invalide ou expiré.")
      setMessageType("error")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.")
      setMessageType("error")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:8000/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Mot de passe réinitialisé avec succès !")
        setMessageType("success")
        setTimeout(() => router.push("/"), 3000)
      } else {
        setMessage(data.message || "Une erreur est survenue.")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur.")
      setMessageType("error")
      console.error("Erreur de connexion :", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isPasswordInvalid = touched.password && password.length < 6
  const isConfirmInvalid = touched.confirmPassword && confirmPassword !== password
  const isFormValid = password.length >= 6 && password === confirmPassword && !isLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-center">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Réinitialisation du mot de passe</h1>
          <p className="text-blue-100 text-xs">Créez un nouveau mot de passe sécurisé pour votre compte</p>
        </div>

        <div className="p-6">
          {/* Message d'alerte */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg border flex items-start gap-2 ${
                messageType === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <p className="font-medium text-xs">{message}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    isPasswordInvalid
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : password && !isPasswordInvalid
                        ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Entrez votre nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isPasswordInvalid && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Le mot de passe doit contenir au moins 6 caractères.
                </p>
              )}
            </div>

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="confirmPassword"
                  type={showPassword2 ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    isConfirmInvalid
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : confirmPassword && !isConfirmInvalid
                        ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={togglePasswordVisibility2}
                >
                  {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isConfirmInvalid && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Les mots de passe ne correspondent pas.
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Réinitialisation...
                </div>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Vous vous souvenez de votre mot de passe ?{" "}
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:underline"
                onClick={() => router.push("/login")}
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}