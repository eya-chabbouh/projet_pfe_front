"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react"
import Navbar from "../../components/Navbar"

export default function ChangePassword() {
  const router = useRouter()
  const [user, setUser] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const userRes = await axios.get("http://127.0.0.1:8000/api/client/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setUser(userRes.data)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur", error)
        setErrorMessage("Erreur lors du chargement des données utilisateur")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const togglePassword = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (value.length > 8) return

    setFormData({ ...formData, [name]: value })
    setFieldErrors((prev) => ({ ...prev, [name]: "" }))

    // Clear global messages when user starts typing
    if (successMessage) setSuccessMessage(null)
    if (errorMessage) setErrorMessage(null)
  }

  const validateForm = () => {
    const newErrors: typeof fieldErrors = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    }

    if (!formData.current_password) {
      newErrors.current_password = "Le mot de passe actuel est obligatoire"
    }

    if (!formData.new_password) {
      newErrors.new_password = "Le nouveau mot de passe est obligatoire"
    } else if (formData.new_password.length !== 8) {
      newErrors.new_password = "Le mot de passe doit contenir exactement 8 caractères"
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "La confirmation est obligatoire"
    } else if (formData.confirm_password !== formData.new_password) {
      newErrors.confirm_password = "Les mots de passe ne correspondent pas"
    }

    setFieldErrors(newErrors)
    return Object.values(newErrors).every((error) => error === "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await axios.put("http://127.0.0.1:8000/api/client/change-password", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      setSuccessMessage("Mot de passe mis à jour avec succès !")
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })

      setTimeout(() => {
        router.push("/dashbordC")
      }, 2000)
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrorMessage("Mot de passe actuel incorrect")
      } else {
        setErrorMessage("Erreur lors de la mise à jour du mot de passe")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" }
    if (password.length < 4) return { strength: 1, label: "Faible", color: "text-red-500" }
    if (password.length < 6) return { strength: 2, label: "Moyen", color: "text-yellow-500" }
    if (password.length === 8) return { strength: 3, label: "Fort", color: "text-purple-600" }
    return { strength: 2, label: "Moyen", color: "text-yellow-500" }
  }

  const renderPasswordInput = (
    name: keyof typeof formData,
    label: string,
    placeholder: string,
    visible: boolean,
    toggle: () => void,
    showStrength = false,
  ) => {
    const error = fieldErrors[name]
    const value = formData[name]
    const isValid = !error && value.length === 8
    const strength = showStrength ? getPasswordStrength(value) : null

    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full px-4 py-3 pl-10 pr-12 rounded-lg border transition-colors ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : isValid
                  ? "border-purple-300 focus:border-purple-500 focus:ring-purple-500/20"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            } focus:outline-none focus:ring-4`}
            maxLength={8}
            required
          />
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <button
            type="button"
            onClick={toggle}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={visible ? "Masquer mot de passe" : "Afficher mot de passe"}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password strength indicator */}
        {showStrength && value.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    level <= strength!.strength
                      ? strength!.strength === 1
                        ? "bg-red-500"
                        : strength!.strength === 2
                          ? "bg-yellow-500"
                          : "bg-gradient-to-r from-purple-500 to-blue-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            {strength && <p className={`text-xs ${strength.color}`}>Force du mot de passe: {strength.label}</p>}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Success indicator */}
        {isValid && (
          <div className="flex items-center gap-2 text-purple-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            Valide
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Chargement...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Changer le mot de passe
            </h1>
            <p className="text-gray-600">Sécurisez votre compte avec un nouveau mot de passe</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            {/* Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <p className="text-purple-800 text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {renderPasswordInput(
                "current_password",
                "  Mot de passe actuel",
                "  Entrez votre mot de passe actuel",
                showPassword.current,
                () => togglePassword("current"),
              )}

              {renderPasswordInput(
                "new_password",
                "Nouveau mot de passe",
                "  8 caractères exactement",
                showPassword.new,
                () => togglePassword("new"),
                true,
              )}

              {renderPasswordInput(
                "confirm_password",
                "Confirmer le nouveau mot de passe",
                "  Répétez le nouveau mot de passe",
                showPassword.confirm,
                () => togglePassword("confirm"),
              )}

              {/* Security Tips */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-2">Conseils de sécurité</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Utilisez exactement 8 caractères</li>
                  <li>• Mélangez lettres, chiffres et symboles</li>
                  <li>• Évitez les informations personnelles</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashbordC")}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Modification...
                    </>
                  ) : (
                    "Modifier"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
