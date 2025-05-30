"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react"
import Navbar from "../../components/Navbar"

export default function EditProfilePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    governorate: "",
    city: "",
    photo: "" as string | File,
  })

  const [photoPreview, setPhotoPreview] = useState<string>("/default-avatar.png")
  const [cities, setCities] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const governorates: Record<string, string[]> = {
    Tunis: ["Tunis", "La Marsa", "Le Bardo"],
    Sfax: ["Sfax Ville", "Sakiet Ezzit", "Thyna"],
    Sousse: ["Sousse Ville", "Hammam Sousse", "Kalaâ Kebira"],
    Ariana: ["Ariana Ville", "Raoued", "La Soukra"],
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await axios.get("http://127.0.0.1:8000/api/client/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = res.data
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.tel || "",
          birthdate: data.birthdate || "",
          gender: data.genre || "",
          governorate: data.gouvernement || "",
          city: data.ville || "",
          photo: data.photo || "",
        })

        if (data.gouvernement) {
          setCities(governorates[data.gouvernement] || [])
        }

        if (data.photo) {
          setPhotoPreview(data.photo.startsWith("http") ? data.photo : `http://127.0.0.1:8000/storage/${data.photo}`)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données", error)
        setMessage("Erreur lors du chargement des données")
        setMessageType("error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.trim()) newErrors.name = "Ce champ est obligatoire."
    if (!formData.email.trim()) newErrors.email = "Ce champ est obligatoire."
    if (!formData.phone.trim()) {
      newErrors.phone = "Ce champ est obligatoire."
    } else if (!/^\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Le numéro doit contenir 8 chiffres."
    }
    if (!formData.gender) newErrors.gender = "Ce champ est obligatoire."
    if (!formData.governorate) newErrors.governorate = "Ce champ est obligatoire."
    if (!formData.city) newErrors.city = "Ce champ est obligatoire."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "phone" && !/^\d{0,8}$/.test(value)) return

    setFormData({ ...formData, [name]: value })

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    if (message) {
      setMessage(null)
      setMessageType(null)
    }
  }

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value
    setFormData({ ...formData, governorate: selected, city: "" })
    setCities(governorates[selected] || [])
    if (errors.governorate || errors.city) {
      setErrors((prev) => ({ ...prev, governorate: "", city: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setMessage("L'image ne doit pas dépasser 5MB")
        setMessageType("error")
        return
      }
      setFormData({ ...formData, photo: file })
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: "" })
    setPhotoPreview("/default-avatar.png")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const updatedFormData = new FormData()
      updatedFormData.append("name", formData.name)
      updatedFormData.append("email", formData.email)
      updatedFormData.append("tel", formData.phone)
      updatedFormData.append("birthdate", formData.birthdate)
      updatedFormData.append("genre", formData.gender)
      updatedFormData.append("gouvernement", formData.governorate)
      updatedFormData.append("ville", formData.city)

      if (formData.photo && formData.photo instanceof File) {
        updatedFormData.append("photo", formData.photo)
      }

      await axios.post("http://127.0.0.1:8000/api/client/profile/update", updatedFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setMessage("Profil mis à jour avec succès !")
      setMessageType("success")
      setTimeout(() => router.push("/dashbordC"), 2000)
    } catch (error) {
      setMessage("Erreur lors de la mise à jour du profil.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 text-sm">Chargement du profil...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 font-sans">
        <div className="max-w-xl mx-auto px-3 sm:px-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
              Modifier mon profil
            </h1>
            <p className="text-gray-600 text-sm">Mettez à jour vos informations personnelles</p>
          </div>

          {/* Messages */}
          {message && (
            <div className="fixed top-4 right-4 z-50 p-3 rounded-md shadow-md max-w-sm w-full text-sm font-medium animate-slide-in">
              <div
                className={`flex items-center gap-2 ${
                  messageType === "success"
                    ? "bg-purple-50 text-purple-800 border border-purple-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <p>{message}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/90 rounded-xl shadow-md border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Profile */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-200 shadow-sm">
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Photo de profil"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="p-1.5 bg-purple-500 text-white rounded-full hover:bg-purple-600 cursor-pointer transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Changer votre photo</p>
              </div>

              {/* Personal Information Section */}
              <details className="bg-gray-50 rounded-lg p-4" open>
                <summary className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-600" />
                    Informations personnelles
                  </h3>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nom & Prénom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                            errors.name
                              ? "border-red-300 focus:ring-red-300"
                              : formSubmitted && formData.name.trim()
                              ? "border-purple-300 focus:ring-blue-300"
                              : "border-gray-200 focus:ring-blue-300 hover:bg-purple-50"
                          }`}
                          placeholder="Nom complet"
                        />
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      </div>
                      {errors.name && (
                        <div className="mt-1 flex items-center gap-1.5 text-red-600 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                            errors.email
                              ? "border-red-300 focus:ring-red-300"
                              : formSubmitted && formData.email.trim()
                              ? "border-purple-300 focus:ring-blue-300"
                              : "border-gray-200 focus:ring-blue-300 hover:bg-purple-50"
                          }`}
                          placeholder="votre.email@exemple.com"
                        />
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      </div>
                      {errors.email && (
                        <div className="mt-1 flex items-center gap-1.5 text-red-600 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          maxLength={8}
                          className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                            errors.phone
                              ? "border-red-300 focus:ring-red-300"
                              : formSubmitted && /^\d{8}$/.test(formData.phone)
                              ? "border-purple-300 focus:ring-blue-300"
                              : "border-gray-200 focus:ring-blue-300 hover:bg-purple-50"
                          }`}
                          placeholder="12345678"
                        />
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{formData.phone.length}/8 chiffres</p>
                      {errors.phone && (
                        <div className="mt-1 flex items-center gap-1.5 text-red-600 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.phone}
                        </div>
                      )}
                    </div>

                   
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Genre <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {["homme", "femme"].map((value) => (
                        <div key={value} className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            id={`gender-${value}`}
                            value={value}
                            checked={formData.gender === value}
                            onChange={handleChange}
                            className="w-3.5 h-3.5 text-purple-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor={`gender-${value}`} className="ml-1.5 text-xs text-gray-700">
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.gender && (
                      <div className="mt-1 flex items-center gap-1.5 text-red-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.gender}
                      </div>
                    )}
                  </div>
                </div>
              </details>

              {/* Location Section */}
              <details className="bg-gray-50 rounded-lg p-4" open>
                <summary className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Localisation
                  </h3>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Governorate */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Gouvernorat <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="governorate"
                        value={formData.governorate}
                        onChange={handleGovernorateChange}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                          errors.governorate
                            ? "border-red-300 focus:ring-red-300"
                            : formSubmitted && formData.governorate
                            ? "border-purple-300 focus:ring-blue-300"
                            : "border-gray-200 focus:ring-blue-300 hover:bg-purple-50"
                        }`}
                      >
                        <option value="">Sélectionner un gouvernorat</option>
                        {Object.keys(governorates).map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                      {errors.governorate && (
                        <div className="mt-1 flex items-center gap-1.5 text-red-600 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.governorate}
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!formData.governorate}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.city
                            ? "border-red-300 focus:ring-red-300"
                            : formSubmitted && formData.city
                            ? "border-purple-300 focus:ring-blue-300"
                            : "border-gray-200 focus:ring-blue-300 hover:bg-purple-50"
                        }`}
                      >
                        <option value="">Sélectionner une ville</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <div className="mt-1 flex items-center gap-1.5 text-red-600 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.city}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </details>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/dashbordC")}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-1.5 text-sm"
                >
                  <X className="w-3.5 h-3.5" />
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-1.5 text-sm shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}