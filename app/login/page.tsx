"use client"
import { useState } from "react"
import type React from "react"

import axios from "axios"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, Chrome, Facebook } from "lucide-react"

export default function Login({ isLogin = true }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "danger" | "">("")
  const [formValidated, setFormValidated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const isPasswordMaxLength = password.length <= 8

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget

    setFormValidated(true)
    setIsLoading(true)

    if (!form.checkValidity() || !isPasswordMaxLength) {
      e.stopPropagation()
      setIsLoading(false)
      return
    }

    setMessage("")

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      })

      setMessage("Connexion réussie.")
      setMessageType("success")
      localStorage.setItem("token", response.data.token)

      setTimeout(() => {
        window.location.href = response.data.redirect_url
      }, 1500)
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 403) {
          const msg = error.response.data.message
          if (msg.includes("Inactif")) {
            setMessage("Veuillez vérifier votre email pour plus d'informations.")
          } else {
            setMessage("Votre compte est désactivé. Veuillez contacter l'administrateur.")
          }
        } else {
          setMessage("Email ou mot de passe incorrect.")
        }
      } else {
        setMessage("Une erreur est survenue. Veuillez réessayer.")
      }
      setMessageType("danger")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-md">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              {isLogin ? "Connexion" : "Inscription"}
            </h1>
            <p className="text-gray-600 text-xs">
              {isLogin ? "Connectez-vous à votre compte" : "Créez votre nouveau compte"}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {message && (
              <div
                className={`mb-4 p-3 rounded-lg border ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Entrez votre adresse email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
                {formValidated && !email && (
                  <p className="text-xs text-red-600 mt-1">Veuillez entrer un email valide.</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    maxLength={8}
                    className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                      formValidated && !isPasswordMaxLength ? "border-red-500" : "border-gray-200"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formValidated && !isPasswordMaxLength && (
                  <p className="text-xs text-red-600 mt-1">Le mot de passe ne doit pas dépasser 8 caractères.</p>
                )}
                {formValidated && !password && <p className="text-xs text-red-600 mt-1">Le mot de passe est requis.</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-gray-600">
                    Se souvenir de moi
                  </label>
                </div>
                <Link
                  href="/oublier"
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : isLogin ? (
                  "Se connecter"
                ) : (
                  "S'inscrire"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500 font-medium">ou</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => (window.location.href = "http://127.0.0.1:8000/auth/google")}
                  className="w-full py-2 px-4 border border-gray-200 rounded-md hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center justify-center space-x-2 font-medium text-gray-700 hover:text-red-600"
                >
                  <Chrome className="w-4 h-4 text-red-500" />
                  <span>{isLogin ? "Se connecter avec Google" : "S'inscrire avec Google"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = "http://127.0.0.1:8000/auth/facebook")}
                  className="w-full py-2 px-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center space-x-2 font-medium text-gray-700 hover:text-blue-600"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span>{isLogin ? "Se connecter avec Facebook" : "S'inscrire avec Facebook"}</span>
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
                <Link
                  href="/register"
                  className="ml-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}