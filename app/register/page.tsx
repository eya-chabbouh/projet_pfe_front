"use client"

import type React from "react"

import axios from "axios"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from "lucide-react"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [formValidated, setFormValidated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const togglePasswordVisibility2 = () => setShowPassword2(!showPassword2)

  const isEmailValid = email.includes("@") && email.includes(".")
  const isPasswordMatch = password && confirmPassword && password === confirmPassword
  const isPasswordLengthValid = password.length === 8

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormValidated(true)
    setIsLoading(true)
    setMessage("")

    // Validation complète avant soumission
    if (
      !name ||
      !email ||
      !isEmailValid ||
      !password ||
      !confirmPassword ||
      !isPasswordMatch ||
      !isPasswordLengthValid
    ) {
      setMessage("Veuillez remplir correctement tous les champs.")
      setMessageType("error")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      })
      setMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.")
      setMessageType("success")
      console.log("Inscription réussie:", response.data)

      // Redirection après succès
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      setMessage("Une erreur est survenue. Veuillez réessayer.")
      setMessageType("error")
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
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              Inscription
            </h1>
            <p className="text-gray-600 text-xs">Créez votre compte pour commencer</p>
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
                <div className="flex items-center space-x-2">
                  {messageType === "success" ? (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs font-medium">{message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nom */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700">
                  Nom & Prénom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                      formValidated && !name ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Entrez votre nom complet"
                    required
                  />
                </div>
                {formValidated && !name && <p className="text-xs text-red-600 mt-1">Ce champ est obligatoire.</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                      formValidated && !isEmailValid ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Entrez votre adresse email"
                    required
                  />
                </div>
                {formValidated && !isEmailValid && (
                  <p className="text-xs text-red-600 mt-1">Veuillez entrer une adresse email valide.</p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                      formValidated && (!password || !isPasswordLengthValid) ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Entrez votre mot de passe (8 caractères)"
                    required
                    maxLength={8}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formValidated && !password && <p className="text-xs text-red-600 mt-1">Ce champ est obligatoire.</p>}
                {formValidated && password && !isPasswordLengthValid && (
                  <p className="text-xs text-red-600 mt-1">Le mot de passe doit contenir exactement 8 caractères.</p>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword2 ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                      formValidated && (!confirmPassword || !isPasswordMatch) ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Confirmez votre mot de passe"
                    required
                    maxLength={8}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility2}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formValidated && !confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Ce champ est obligatoire.</p>
                )}
                {formValidated && confirmPassword && !isPasswordMatch && (
                  <p className="text-xs text-red-600 mt-1">Les mots de passe ne correspondent pas.</p>
                )}
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
                    <span>Inscription en cours...</span>
                  </div>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                Déjà inscrit(e) ?
                <Link href="/login" className="ml-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}