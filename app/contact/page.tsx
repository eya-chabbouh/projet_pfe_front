"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Mail, Phone, MessageCircle, Send, CheckCircle, AlertCircle, User } from "lucide-react"
import Navbar from "../components/Navbar"

export default function ContactForm() {
  const router = useRouter()

  const [user, setUser] = useState<any>({})
  const [photoPreview, setPhotoPreview] = useState("/default-avatar.png")

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    message: "",
  })

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        if (!token) return

        const res = await fetch("http://127.0.0.1:8000/api/client/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setUser(data)
        if (data.photo) {
          setPhotoPreview(data.photo.startsWith("http") ? data.photo : `http://127.0.0.1:8000/storage/${data.photo}`)
        }
      } catch (err) {
        console.error("Erreur lors du chargement du profil utilisateur :", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (message) setMessage("")
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token) {
      setError("Vous devez être connecté pour envoyer une réclamation.")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("http://127.0.0.1:8000/api/reclamations/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Réclamation envoyée avec succès !")
        setFormData({ nom: "", email: "", message: "" })
      } else {
        setError(data.message || "Une erreur s'est produite.")
      }
    } catch (err) {
      setError("Erreur lors de l'envoi. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    axios
      .delete("http://127.0.0.1:8000/api/client/delete", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        localStorage.removeItem("token")
        router.push("/login")
      })
      .catch((err) => console.error(err))
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Contactez-nous
            </h1>
            <p className="text-gray-600">Nous sommes là pour vous aider. N'hésitez pas à nous contacter.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>

              {/* Messages */}
              {message && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <p className="text-purple-800 text-sm font-medium">{message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom & Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      placeholder="  Entrez votre nom complet"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none focus:ring-4 transition-colors"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="  votre.email@exemple.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none focus:ring-4 transition-colors"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Votre message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="  Décrivez votre demande ou votre problème en détail..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none focus:ring-4 transition-colors resize-none"
                      required
                    />
                    <MessageCircle className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 10 caractères ({formData.message.length}/500)</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || formData.message.length < 10}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-900 mb-2">💡 Conseils pour un message efficace</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Soyez précis dans votre description</li>
                  <li>• Mentionnez votre numéro de commande si applicable</li>
                  <li>• Incluez des captures d'écran si nécessaire</li>
                </ul>
              </div>
            </div>

          
          </div>
        </div>
      </div>
    </>
  )
}