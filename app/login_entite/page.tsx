"use client"
import Image from 'next/image';
import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { Eye, EyeOff, User, Mail, Lock, Building, MapPin, Phone, FileText, Camera, Tag } from "lucide-react"

export default function RegisterPrestataire() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "danger" | "">("")
  const [formValidated, setFormValidated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    nom_entites: "",
    description: "",
    localisation: "",
    tel: "",
    categ_id: "",
  })

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const villesTunisiennes = [
    "Tunis",
    "Ariana",
    "Ben Arous",
    "La Manouba",
    "Nabeul",
    "Zaghouan",
    "Bizerte",
    "Béja",
    "Jendouba",
    "Le Kef",
    "Siliana",
    "Sousse",
    "Monastir",
    "Mahdia",
    "Sfax",
    "Kairouan",
    "Kasserine",
    "Sidi Bouzid",
    "Gabès",
    "Médenine",
    "Tataouine",
    "Gafsa",
    "Tozeur",
    "Kebili",
  ]

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get("http://localhost:8000/api/public/categories")
        setCategories(res.data)
      } catch (err) {
        console.error("Erreur chargement catégories", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setImage(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const isEmailValid = form.email.includes("@") && form.email.includes(".")
  const isPasswordMatch = form.password && form.password_confirmation && form.password === form.password_confirmation
  const isFormValid =
    form.name.trim() !== "" &&
    isEmailValid &&
    form.password.length >= 6 &&
    isPasswordMatch &&
    form.nom_entites.trim() !== "" &&
    form.description.trim() !== "" &&
    form.localisation.trim() !== "" &&
    form.tel.trim() !== "" &&
    form.categ_id.trim() !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormValidated(true)
    setMessage("")
    setIsSubmitting(true)

    if (!isFormValid) {
      setMessage("Merci de remplir correctement tous les champs obligatoires.")
      setMessageType("danger")
      setIsSubmitting(false)
      return
    }

    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value))
    if (image) data.append("image", image)

    try {
      const res = await axios.post("http://localhost:8000/api/entites", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setMessage("Inscription réussie. En attente de validation.")
      setMessageType("success")

      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (err: any) {
      console.error("Erreur : ", err)
      setMessage(err.response?.data?.message || "Erreur lors de l'inscription.")
      setMessageType("danger")
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-md">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              Inscription Prestataire
            </h1>
            <p className="text-gray-600 text-xs">Rejoignez notre plateforme de services</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Nom */}
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-xs font-semibold text-gray-700">
                    Nom & Prénom<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        formValidated && form.name.trim() === "" ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Entrez votre nom et prénom"
                      required
                    />
                  </div>
                  {formValidated && form.name.trim() === "" && (
                    <p className="text-xs text-red-600">Le nom est obligatoire.</p>
                  )}
                </div>
              </div>

              {/* Nom de service */}
              <div className="space-y-1">
                <label htmlFor="nom_entites" className="block text-xs font-semibold text-gray-700">
                  Nom de service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="nom_entites"
                    type="text"
                    name="nom_entites"
                    value={form.nom_entites}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                      formValidated && form.nom_entites.trim() === "" ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Nom de prestataire"
                    required
                  />
                </div>
                {formValidated && form.nom_entites.trim() === "" && (
                  <p className="text-xs text-red-600">Le nom de service est obligatoire.</p>
                )}
              </div>

              {/* Email et Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        formValidated && !isEmailValid ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Entrez votre email"
                      required
                    />
                  </div>
                  {formValidated && !isEmailValid && (
                    <p className="text-xs text-red-600">Veuillez saisir un email valide.</p>
                  )}
                </div>

                {/* Téléphone */}
                <div className="space-y-1">
                  <label htmlFor="tel" className="block text-xs font-semibold text-gray-700">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="tel"
                      type="tel"
                      name="tel"
                      value={form.tel}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        formValidated && form.tel.trim() === "" ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Entrez votre numéro"
                      required
                      maxLength={8}
                    />
                  </div>
                  {formValidated && form.tel.trim() === "" && (
                    <p className="text-xs text-red-600">Le téléphone est obligatoire.</p>
                  )}
                </div>
              </div>

              {/* Mots de passe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Mot de passe */}
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        formValidated && form.password.length < 6 ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Mot de passe"
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
                  {formValidated && form.password.length < 6 && (
                    <p className="text-xs text-red-600">Le mot de passe doit contenir au moins 6 caractères.</p>
                  )}
                </div>

                {/* Confirmation mot de passe */}
                <div className="space-y-1">
                  <label htmlFor="password_confirmation" className="block text-xs font-semibold text-gray-700">
                    Confirmer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        formValidated && !isPasswordMatch ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Confirmez le mot de passe"
                      required
                      maxLength={8}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formValidated && !isPasswordMatch && (
                    <p className="text-xs text-red-600">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="description" className="block text-xs font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none ${
                      formValidated && form.description.trim() === "" ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Description de votre service"
                    rows={2}
                    required
                  />
                </div>
                {formValidated && form.description.trim() === "" && (
                  <p className="text-xs text-red-600">La description est obligatoire.</p>
                )}
              </div>

              {/* Localisation et Catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Localisation */}
                <div className="space-y-1">
                  <label htmlFor="localisation" className="block text-xs font-semibold text-gray-700">
                    Localisation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      id="localisation"
                      name="localisation"
                      value={form.localisation}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        formValidated && form.localisation.trim() === "" ? "border-red-500" : "border-gray-200"
                      }`}
                      required
                    >
                      <option value="">-- Sélectionnez une ville --</option>
                      {villesTunisiennes.map((ville) => (
                        <option key={ville} value={ville}>
                          {ville}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formValidated && form.localisation.trim() === "" && (
                    <p className="text-xs text-red-600">La localisation est obligatoire.</p>
                  )}
                </div>

                {/* Catégorie */}
                <div className="space-y-1">
                  <label htmlFor="categ_id" className="block text-xs font-semibold text-gray-700">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      id="categ_id"
                      name="categ_id"
                      value={form.categ_id}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        formValidated && form.categ_id.trim() === "" ? "border-red-500" : "border-gray-200"
                      }`}
                      required
                    >
                      <option value="">-- Choisissez une catégorie --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formValidated && form.categ_id.trim() === "" && (
                    <p className="text-xs text-red-600">La catégorie est obligatoire.</p>
                  )}
                </div>
              </div>

              {/* Image / Logo */}
              <div className="space-y-1">
                <label htmlFor="image" className="block text-xs font-semibold text-gray-700">
                  Logo ou image
                </label>
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
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
                Déjà un compte ?
                <Link href="/login" className="ml-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}