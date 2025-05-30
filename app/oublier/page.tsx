"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Mail, ArrowLeft, Lock } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [formValidated, setFormValidated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormValidated(true)
    setIsLoading(true)

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setMessage("Veuillez entrer une adresse email valide.")
      setMessageType("error")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/forgot-password", {
        email,
      })
      setMessage("Un email de réinitialisation a été envoyé à votre adresse !")
      setMessageType("success")
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error)
      setMessage("Une erreur est survenue. Veuillez réessayer.")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const isEmailValid = /\S+@\S+\.\S+/.test(email)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-gray-600 text-sm">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg border ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {messageType === "success" ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleResetRequest} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                      formValidated && !isEmailValid ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Entrez votre adresse email"
                    required
                  />
                </div>
                {formValidated && !isEmailValid && (
                  <p className="text-sm text-red-600 mt-1">Veuillez entrer une adresse email valide.</p>
                )}
                {formValidated && isEmailValid && <p className="text-sm text-green-600 mt-1">Adresse email valide !</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  "Envoyer le lien"
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour à la connexion</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
