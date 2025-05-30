"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Edit3,
  Trash2,
  AlertCircle,
  X,
  Save,
  Camera,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  Building2,
  MapPin,
  Tag,
  Package,
} from "lucide-react"
import NavbarProps from "../components/NavbarProps/page"

interface Entite {
  id: number
  nom_entites: string
  description: string
  localisation: string
  categ_id: number
  image?: string
  status: string
}

interface Category {
  id: number
  nom: string
}

const EntitesPage = () => {
  const [entites, setEntites] = useState<Entite[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEntite, setSelectedEntite] = useState<number | null>(null)
  const [editingEntite, setEditingEntite] = useState<Entite | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit form states
  const [localisations] = useState([
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
  ])

  const [editForm, setEditForm] = useState({
    nomEntite: "",
    description: "",
    localisation: "",
    categId: "",
    image: null as File | null,
    imagePreview: null as string | null,
    userInfo: {
      name: "",
      email: "",
      tel: "",
    },
    showPasswordFields: false,
    passwordCurrent: "",
    passwordNew: "",
    passwordConfirm: "",
  })

  // Validation and success states
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    tel: "",
    nomEntite: "",
    description: "",
    localisation: "",
    passwordCurrent: "",
    passwordNew: "",
    passwordConfirm: "",
  })

  const [modifiedFields, setModifiedFields] = useState({
    name: false,
    email: false,
    tel: false,
    nomEntite: false,
    description: false,
    localisation: false,
    passwordCurrent: false,
    passwordNew: false,
    passwordConfirm: false,
  })

  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchData("entites", setEntites)
    fetchData("categories", setCategories)
    fetchUserData()
  }, [])

  const fetchData = async (endpoint: string, setter: any) => {
    try {
      const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!res.ok) throw new Error(`Erreur lors du chargement des ${endpoint}`)
      const data = await res.json()
      setter(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://127.0.0.1:8000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUser(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error)
    }
  }

  const handleDeleteClick = (id: number) => {
    setSelectedEntite(id)
    setShowDeleteModal(true)
  }

  const handleEditClick = async (entite: Entite) => {
    setEditingEntite(entite)

    // Fetch fresh user data for the edit form
    try {
      const token = localStorage.getItem("token")
      const userResponse = await axios.get("http://127.0.0.1:8000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setEditForm({
        nomEntite: entite.nom_entites,
        description: entite.description,
        localisation: entite.localisation,
        categId: entite.categ_id.toString(),
        image: null,
        imagePreview: entite.image ? `http://localhost:8000/storage/${entite.image}` : null,
        userInfo: {
          name: userResponse.data.name || "",
          email: userResponse.data.email || "",
          tel: userResponse.data.tel || "",
        },
        showPasswordFields: false,
        passwordCurrent: "",
        passwordNew: "",
        passwordConfirm: "",
      })

      // Reset validation states
      setErrors({
        name: "",
        email: "",
        tel: "",
        nomEntite: "",
        description: "",
        localisation: "",
        passwordCurrent: "",
        passwordNew: "",
        passwordConfirm: "",
      })

      setModifiedFields({
        name: false,
        email: false,
        tel: false,
        nomEntite: false,
        description: false,
        localisation: false,
        passwordCurrent: false,
        passwordNew: false,
        passwordConfirm: false,
      })

      setSuccessMessage("")
      setErrorMessage("")
      setShowEditModal(true)
    } catch (error) {
      console.error("Erreur lors du chargement des données utilisateur:", error)
    }
  }

  const confirmDelete = async () => {
    if (selectedEntite) {
      try {
        const res = await fetch(`http://localhost:8000/api/entites/${selectedEntite}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (res.ok) {
          setEntites(entites.filter((entite) => entite.id !== selectedEntite))
          setSuccessMessage("Entité supprimée avec succès")
          setTimeout(() => setSuccessMessage(""), 3000)
        } else {
          setErrorMessage("Erreur lors de la suppression")
          setTimeout(() => setErrorMessage(""), 3000)
        }
      } catch (error) {
        setErrorMessage("Erreur lors de la suppression")
        setTimeout(() => setErrorMessage(""), 3000)
      } finally {
        setShowDeleteModal(false)
        setSelectedEntite(null)
      }
    }
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Le nom est requis"
        } else if (value.length < 2) {
          newErrors.name = "Le nom doit contenir au moins 2 caractères"
        } else {
          newErrors.name = ""
        }
        break
      case "email":
        if (!value.trim()) {
          newErrors.email = "L'email est requis"
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = "L'email n'est pas valide"
        } else {
          newErrors.email = ""
        }
        break
      case "tel":
        if (!value.trim()) {
          newErrors.tel = "Le numéro de téléphone est requis"
        } else if (!/^\+?[\d\s-]{8,}$/.test(value)) {
          newErrors.tel = "Le numéro de téléphone n'est pas valide"
        } else {
          newErrors.tel = ""
        }
        break
      case "nomEntite":
        if (!value.trim()) {
          newErrors.nomEntite = "Le nom du service est requis"
        } else if (value.length < 2) {
          newErrors.nomEntite = "Le nom du service doit contenir au moins 2 caractères"
        } else {
          newErrors.nomEntite = ""
        }
        break
      case "description":
        if (!value.trim()) {
          newErrors.description = "La description est requise"
        } else if (value.length < 10) {
          newErrors.description = "La description doit contenir au moins 10 caractères"
        } else {
          newErrors.description = ""
        }
        break
      case "localisation":
        if (!value) {
          newErrors.localisation = "La localisation est requise"
        } else {
          newErrors.localisation = ""
        }
        break
      case "passwordCurrent":
        if (editForm.showPasswordFields && !value) {
          newErrors.passwordCurrent = "Le mot de passe actuel est requis"
        } else {
          newErrors.passwordCurrent = ""
        }
        break
      case "passwordNew":
        if (value && value.length !== 8) {
          newErrors.passwordNew = "Le mot de passe doit contenir exactement 8 caractères"
        } else {
          newErrors.passwordNew = ""
        }
        if (editForm.passwordConfirm && value !== editForm.passwordConfirm) {
          newErrors.passwordConfirm = "Les mots de passe ne correspondent pas"
        } else if (editForm.passwordConfirm) {
          newErrors.passwordConfirm = ""
        }
        break
      case "passwordConfirm":
        if (editForm.passwordNew && value !== editForm.passwordNew) {
          newErrors.passwordConfirm = "Les mots de passe ne correspondent pas"
        } else {
          newErrors.passwordConfirm = ""
        }
        break
    }

    setErrors(newErrors)
  }

  const handleImageClick = () => fileInputRef.current?.click()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditForm({
        ...editForm,
        image: file,
        imagePreview: URL.createObjectURL(file),
      })
    }
  }

  const cancelImage = () => {
    setEditForm({
      ...editForm,
      image: null,
      imagePreview: editingEntite?.image ? `http://localhost:8000/storage/${editingEntite.image}` : null,
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    const formData = new FormData()
    formData.append("nom_entites", editForm.nomEntite)
    formData.append("description", editForm.description)
    formData.append("localisation", editForm.localisation)
    if (editForm.categId !== "") formData.append("categ_id", editForm.categId)
    if (editForm.image) formData.append("image", editForm.image)
    formData.append("name", editForm.userInfo.name)
    formData.append("email", editForm.userInfo.email)
    formData.append("tel", editForm.userInfo.tel)

    if (editForm.showPasswordFields && editForm.passwordCurrent && editForm.passwordNew) {
      formData.append("current_password", editForm.passwordCurrent)
      formData.append("password", editForm.passwordNew)
      formData.append("password_confirmation", editForm.passwordConfirm)
    }

    formData.append("_method", "PUT")

    try {
      const res = await fetch(`http://localhost:8000/api/entites/${editingEntite?.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erreur lors de la mise à jour")
      }

      setSuccessMessage("Entité mise à jour avec succès !")
      setTimeout(() => {
        setSuccessMessage("")
        setShowEditModal(false)
        fetchData("entites", setEntites)
        fetchUserData()
      }, 2000)
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryName = (id: number) => {
    const category = categories.find((cat) => cat.id === id)
    return category ? category.nom : "Catégorie non trouvée"
  }

  const getFieldStatus = (field: string, value: string, isModified: boolean): boolean => {
    if (!isModified) return false

    switch (field) {
      case "name":
        return !!value.trim() && value.length >= 2
      case "email":
        return !!value.trim() && /\S+@\S+\.\S+/.test(value)
      case "tel":
        return !!value.trim() && /^\+?[\d\s-]{8,}$/.test(value)
      case "nomEntite":
        return !!value.trim() && value.length >= 2
      case "description":
        return !!value.trim() && value.length >= 10
      case "localisation":
        return !!value
      case "passwordCurrent":
        return !!value
      case "passwordNew":
        return value.length === 8
      case "passwordConfirm":
        return !!(editForm.passwordNew && value === editForm.passwordNew)
      default:
        return false
    }
  }

  if (loading) {
    return (
      <NavbarProps>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center"> 
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div> 
          </div>
        </div>
      </NavbarProps>
    )
  }

  return (
    <NavbarProps>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="p-4"> 
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6"> 
              <div className="flex items-center gap-2 mb-3"> 
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md"> {/* Reduced from w-12 h-12 */}
                  <Building2 className="w-5 h-5 text-white" /> 
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> {/* Reduced from text-3xl */}
                    Mes Services
                  </h1>
                  <p className="text-gray-600 text-sm"> 
                    Gérez vos services et informations professionnelles
                  </p>
                </div>
              </div>
            </div>
            {successMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm"> 
                <CheckCircle className="w-4 h-4" /> 
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm"> 
                <AlertCircle className="w-4 h-4" /> 
                {errorMessage}
              </div>
            )}

            {/* Main Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3"> 
                <h2 className="text-lg font-bold text-white flex items-center gap-2"> 
                  <Package className="w-4 h-4" /> 
                  Services Acceptés 
                </h2>
              </div>

              <div className="p-6"> 
                {entites.filter((e) => e.status === "accepté").length === 0 ? (
                  <div className="text-center py-12"> 
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"> 
                      <Building2 className="w-8 h-8 text-blue-500" /> 
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2"> 
                      Aucun service trouvé
                    </h3>
                    <p className="text-gray-500 text-sm"> 
                      Vous n'avez pas encore de services acceptés.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4"> 
                    {entites
                      .filter((e) => e.status === "accepté")
                      .map((entite) => (
                        <div
                          key={entite.id}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                          <div className="p-4"> 
                            <div className="flex flex-col lg:flex-row items-start gap-4"> 
                              {/* Image */}
                              <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm"> 
                                  <img
                                    src={
                                      entite.image
                                        ? `http://127.0.0.1:8000/storage/${entite.image}`
                                        : "/placeholder.svg?height=96&width=96"
                                    }
                                    alt={entite.nom_entites}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 space-y-3"> 
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1"> 
                                    {entite.nom_entites}
                                  </h3>
                                  <p className="text-gray-600 text-sm leading-relaxed"> 
                                    {entite.description}
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> 
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-3 h-3 text-blue-500" /> 
                                    <span className="text-xs"> 
                                      {entite.localisation}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Tag className="w-3 h-3 text-purple-500" /> 
                                    <span className="text-xs"> 
                                      {getCategoryName(entite.categ_id)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2 lg:flex-row">
                                <button
                                  onClick={() => handleEditClick(entite)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm" 
                                >
                                  <Edit3 className="w-3 h-3" /> 
                                  
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(entite.id)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm" 
                                >
                                  <Trash2 className="w-3 h-3" />
                                  
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-md w-full border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirmer la suppression</h3>
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingEntite && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-2xl w-full border border-gray-100 my-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Modifier le Service
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {/* Success/Error Messages */}
                {successMessage && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmitEdit} className="space-y-6">
                  {/* Image Upload */}
                  <div className="flex justify-center mb-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-r from-blue-100 to-purple-100">
                        <img
                          src={editForm.imagePreview || "/placeholder.svg?height=96&width=96"}
                          alt="Photo de profil"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 flex justify-center items-center gap-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={handleImageClick}
                          className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3" />
                          Changer
                        </button>
                        {editForm.image && (
                          <button
                            type="button"
                            onClick={cancelImage}
                            className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Annuler
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Informations Personnelles
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={editForm.userInfo.name}
                            onChange={(e) => {
                              setEditForm({
                                ...editForm,
                                userInfo: { ...editForm.userInfo, name: e.target.value },
                              })
                              setModifiedFields({ ...modifiedFields, name: true })
                              validateField("name", e.target.value)
                            }}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                              modifiedFields.name
                                ? errors.name
                                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                  : getFieldStatus("name", editForm.userInfo.name, modifiedFields.name)
                                    ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                                : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                            placeholder="Votre nom"
                          />
                          {modifiedFields.name && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {errors.name ? (
                                <X className="w-4 h-4 text-red-500" />
                              ) : getFieldStatus("name", editForm.userInfo.name, modifiedFields.name) ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {modifiedFields.name && errors.name && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="email"
                            value={editForm.userInfo.email}
                            onChange={(e) => {
                              setEditForm({
                                ...editForm,
                                userInfo: { ...editForm.userInfo, email: e.target.value },
                              })
                              setModifiedFields({ ...modifiedFields, email: true })
                              validateField("email", e.target.value)
                            }}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                              modifiedFields.email
                                ? errors.email
                                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                  : getFieldStatus("email", editForm.userInfo.email, modifiedFields.email)
                                    ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                                : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                            placeholder="votre@email.com"
                          />
                          {modifiedFields.email && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {errors.email ? (
                                <X className="w-4 h-4 text-red-500" />
                              ) : getFieldStatus("email", editForm.userInfo.email, modifiedFields.email) ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {modifiedFields.email && errors.email && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          value={editForm.userInfo.tel}
                          onChange={(e) => {
                            setEditForm({
                              ...editForm,
                              userInfo: { ...editForm.userInfo, tel: e.target.value },
                            })
                            setModifiedFields({ ...modifiedFields, tel: true })
                            validateField("tel", e.target.value)
                          }}
                          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                            modifiedFields.tel
                              ? errors.tel
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : getFieldStatus("tel", editForm.userInfo.tel, modifiedFields.tel)
                                  ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                          }`}
                          placeholder="+216 XX XXX XXX"
                        />
                        {modifiedFields.tel && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {errors.tel ? (
                              <X className="w-4 h-4 text-red-500" />
                            ) : getFieldStatus("tel", editForm.userInfo.tel, modifiedFields.tel) ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      {modifiedFields.tel && errors.tel && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.tel}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Service Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      Informations du Service
                    </h4>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Nom du Service <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editForm.nomEntite}
                          onChange={(e) => {
                            setEditForm({ ...editForm, nomEntite: e.target.value })
                            setModifiedFields({ ...modifiedFields, nomEntite: true })
                            validateField("nomEntite", e.target.value)
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                            modifiedFields.nomEntite
                              ? errors.nomEntite
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : getFieldStatus("nomEntite", editForm.nomEntite, modifiedFields.nomEntite)
                                  ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                          }`}
                          placeholder="Nom de votre service"
                        />
                        {modifiedFields.nomEntite && errors.nomEntite && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.nomEntite}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => {
                            setEditForm({ ...editForm, description: e.target.value })
                            setModifiedFields({ ...modifiedFields, description: true })
                            validateField("description", e.target.value)
                          }}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                            modifiedFields.description
                              ? errors.description
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : getFieldStatus("description", editForm.description, modifiedFields.description)
                                  ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                          }`}
                          placeholder="Description de votre service"
                        />
                        {modifiedFields.description && errors.description && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Localisation <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editForm.localisation}
                            onChange={(e) => {
                              setEditForm({ ...editForm, localisation: e.target.value })
                              setModifiedFields({ ...modifiedFields, localisation: true })
                              validateField("localisation", e.target.value)
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                              modifiedFields.localisation
                                ? errors.localisation
                                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                  : getFieldStatus("localisation", editForm.localisation, modifiedFields.localisation)
                                    ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                                : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                          >
                            <option value="">-- Choisir une localisation --</option>
                            {localisations.map((loc) => (
                              <option key={loc} value={loc}>
                                {loc}
                              </option>
                            ))}
                          </select>
                          {modifiedFields.localisation && errors.localisation && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.localisation}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                          <input
                            type="text"
                            value={getCategoryName(Number.parseInt(editForm.categId))}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-500" />
                        Sécurité du Compte
                      </h4>
                      {!editForm.showPasswordFields && (
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, showPasswordFields: true })}
                          className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                        >
                          Modifier le mot de passe
                        </button>
                      )}
                    </div>

                    {editForm.showPasswordFields && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Mot de passe actuel <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={editForm.passwordCurrent}
                            onChange={(e) => {
                              setEditForm({ ...editForm, passwordCurrent: e.target.value })
                              setModifiedFields({ ...modifiedFields, passwordCurrent: true })
                              validateField("passwordCurrent", e.target.value)
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                              modifiedFields.passwordCurrent
                                ? errors.passwordCurrent
                                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                  : getFieldStatus(
                                        "passwordCurrent",
                                        editForm.passwordCurrent,
                                        modifiedFields.passwordCurrent,
                                      )
                                    ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                                : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                            placeholder="Mot de passe actuel"
                          />
                          {modifiedFields.passwordCurrent && errors.passwordCurrent && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.passwordCurrent}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Nouveau mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              value={editForm.passwordNew}
                              maxLength={8}
                              onChange={(e) => {
                                setEditForm({ ...editForm, passwordNew: e.target.value })
                                setModifiedFields({ ...modifiedFields, passwordNew: true })
                                validateField("passwordNew", e.target.value)
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                                modifiedFields.passwordNew
                                  ? errors.passwordNew
                                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                    : getFieldStatus("passwordNew", editForm.passwordNew, modifiedFields.passwordNew)
                                      ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                      : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                              }`}
                              placeholder="8 caractères exactement"
                            />
                            {modifiedFields.passwordNew && errors.passwordNew && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.passwordNew}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Confirmer le mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              value={editForm.passwordConfirm}
                              maxLength={8}
                              onChange={(e) => {
                                setEditForm({ ...editForm, passwordConfirm: e.target.value })
                                setModifiedFields({ ...modifiedFields, passwordConfirm: true })
                                validateField("passwordConfirm", e.target.value)
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                                modifiedFields.passwordConfirm
                                  ? errors.passwordConfirm
                                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                    : getFieldStatus(
                                        "passwordConfirm",
                                        editForm.passwordConfirm,
                                        modifiedFields.passwordConfirm,
                                      )
                                    ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                              }`}
                              placeholder="Confirmer le mot de passe"
                            />
                            {modifiedFields.passwordConfirm && errors.passwordConfirm && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.passwordConfirm}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                showPasswordFields: false,
                                passwordCurrent: "",
                                passwordNew: "",
                                passwordConfirm: "",
                              })
                              setErrors({
                                ...errors,
                                passwordCurrent: "",
                                passwordNew: "",
                                passwordConfirm: "",
                              })
                              setModifiedFields({
                                ...modifiedFields,
                                passwordCurrent: false,
                                passwordNew: false,
                                passwordConfirm: false,
                              })
                            }}
                            className="text-sm text-red-500 hover:text-red-600 font-medium"
                          >
                            Annuler la modification du mot de passe
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </NavbarProps>
  )
}

export default EntitesPage