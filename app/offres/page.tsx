"use client"

import type React from "react"
import { useState, useEffect, type ChangeEvent } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Tag,
  AlertCircle,
  X,
  Upload,
  Save,
  Calendar,
  DollarSign,
  Package,
  MapPin,
  Building,
} from "lucide-react"
import NavbarProps from "../components/NavbarProps/page"

interface Offre {
  id: number
  titre: string
  description: string
  prix_initial: number
  prix_reduit: number
  reduction: number
  date_debut: string
  date_fin: string
  quantite_initial: number
  quantite: number
  image?: string
  image_url?: string
  entite_id: number
  entite?: {
    nom_entites: string
    noms_entites: string
    localisation: string
  }
}

interface Entite {
  id: number
  nom_entites: string
  noms_entites: string
  localisation: string
}

const OffresPage = () => {
  const [offres, setOffres] = useState<Offre[]>([])
  const [entites, setEntites] = useState<Entite[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [offreToDelete, setOffreToDelete] = useState<number | null>(null)
  const [offreToEdit, setOffreToEdit] = useState<Offre | null>(null)
  const [offreToView, setOffreToView] = useState<Offre | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const offresPerPage = 3
  const [token, setToken] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    entite_id: "",
    titre: "",
    description: "",
    prix_initial: "",
    prix_reduit: "",
    reduction: "",
    quantite: "",
    date_debut: "",
    date_fin: "",
    image: "" as string | File,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState({
    entite_id: "",
    titre: "",
    description: "",
    prix_initial: "",
    reduction: "",
    quantite: "",
    date_debut: "",
    date_fin: "",
    image: "",
    general: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Initialize token client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"))
    }
  }, [])

  // Fetch offers
  useEffect(() => {
    const fetchOffres = async () => {
      if (!token) {
        if (typeof window !== "undefined") {
          router.push("/login")
        }
        return
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/offres", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setOffres(response.data)
      } catch (error) {
        console.error("Error fetching offers", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOffres()
    }
  }, [router, token])

  // Fetch entities and set default entite_id
  useEffect(() => {
    const fetchEntites = async () => {
      if (!token) return

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/entites", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const fetchedEntites = response.data
        setEntites(fetchedEntites)
        // Set default entite_id to the first entity if available
        if (fetchedEntites.length > 0) {
          setFormData((prev) => ({ ...prev, entite_id: fetchedEntites[0].id.toString() }))
        }
      } catch (error) {
        console.error("Error fetching entities", error)
      }
    }

    if (token) {
      fetchEntites()
    }
  }, [token])

  // Calculate reduced price when initial price or reduction changes
  useEffect(() => {
    const initial = Number.parseFloat(formData.prix_initial)
    const reduc = Number.parseFloat(formData.reduction) || 0
    if (!isNaN(initial) && initial >= 0) {
      const calculatedPrice = initial * (1 - reduc / 100)
      setFormData((prev) => ({ ...prev, prix_reduit: calculatedPrice.toFixed(2) }))
    } else {
      setFormData((prev) => ({ ...prev, prix_reduit: "" }))
    }
  }, [formData.prix_initial, formData.reduction])

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000) // Dismiss after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Auto-dismiss error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
      }, 3000) // Dismiss after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filteredOffres = offres.filter((offre) =>
    [
      offre.titre || "",
      offre.description || "",
      offre.prix_initial?.toString() || "",
      offre.prix_reduit?.toString() || "",
      entites.find((e) => e.id === offre.entite_id)?.nom_entites ||
        entites.find((e) => e.id === offre.entite_id)?.noms_entites ||
        "",
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const deleteOffre = async (id: number) => {
    if (!token) {
      router.push("/login")
      return
    }

    try {
      await axios.delete(`http://127.0.0.1:8000/api/offres/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOffres(offres.filter((offre: Offre) => offre.id !== id))
      setSuccessMessage("Offre supprimée avec succès !")
      setShowDeleteDialog(false)
    } catch (error: any) {
      if (error.response?.status === 403) {
        setErrorMessage("Vous ne pouvez pas supprimer cette offre car elle est liée à des commandes.")
      } else if (error.response?.status === 422) {
        setErrorMessage("Impossible de supprimer l’offre : une erreur de validation ou de traitement est survenue.")
      } else {
        setErrorMessage("Une erreur est survenue lors de la suppression de l’offre.")
      }
      setShowDeleteDialog(false)
    }
  }

  const resetForm = () => {
    setFormData({
      entite_id: entites.length > 0 ? entites[0].id.toString() : "",
      titre: "",
      description: "",
      prix_initial: "",
      prix_reduit: "",
      reduction: "",
      quantite: "",
      date_debut: "",
      date_fin: "",
      image: "",
    })
    setSelectedImage(null)
    setFormErrors({
      entite_id: "",
      titre: "",
      description: "",
      prix_initial: "",
      reduction: "",
      quantite: "",
      date_debut: "",
      date_fin: "",
      image: "",
      general: "",
    })
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      entite_id: "",
      titre: "",
      description: "",
      prix_initial: "",
      reduction: "",
      quantite: "",
      date_debut: "",
      date_fin: "",
      image: "",
      general: "",
    }

    if (!formData.entite_id) {
      newErrors.entite_id = "L'entité est obligatoire"
      isValid = false
    }

    if (!formData.titre.trim()) {
      newErrors.titre = "Le titre est obligatoire"
      isValid = false
    }

    if (formData.description.length > 225) {
      newErrors.description = "La description ne doit pas dépasser 225 caractères"
      isValid = false
    }

    if (!formData.prix_initial || isNaN(Number(formData.prix_initial)) || Number(formData.prix_initial) <= 0) {
      newErrors.prix_initial = "Le prix initial doit être un nombre positif"
      isValid = false
    }

    if (
      formData.reduction &&
      (isNaN(Number(formData.reduction)) || Number(formData.reduction) < 0 || Number(formData.reduction) > 100)
    ) {
      newErrors.reduction = "La réduction doit être un nombre entre 0 et 100"
      isValid = false
    }

    if (!formData.quantite || isNaN(Number(formData.quantite)) || Number(formData.quantite) < 1) {
      newErrors.quantite = "La quantité doit être un entier supérieur ou égal à 1"
      isValid = false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateDebut = new Date(formData.date_debut)
    const dateFin = new Date(formData.date_fin)

    if (!formData.date_debut) {
      newErrors.date_debut = "La date de début est obligatoire"
      isValid = false
    } else if (dateDebut < today) {
      newErrors.date_debut = "La date de début ne peut pas être dans le passé"
      isValid = false
    }

    if (!formData.date_fin) {
      newErrors.date_fin = "La date de fin est obligatoire"
      isValid = false
    } else if (dateFin < dateDebut) {
      newErrors.date_fin = "La date de fin doit être après la date de début"
      isValid = false
    }

    setFormErrors(newErrors)
    return isValid
  }

  const handleAddOffre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("entite_id", formData.entite_id)
      formDataToSend.append("titre", formData.titre)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("prix_initial", formData.prix_initial)
      formDataToSend.append("reduction", formData.reduction || "0")
      formDataToSend.append("quantite", formData.quantite)
      formDataToSend.append("date_debut", formData.date_debut)
      formDataToSend.append("date_fin", formData.date_fin)
      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      const response = await axios.post("http://127.0.0.1:8000/api/offres", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      // Fetch the newly added offer to ensure it includes all necessary data (e.g., entite)
      const newOffreResponse = await axios.get(`http://127.0.0.1:8000/api/offres/${response.data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setOffres([...offres, newOffreResponse.data])
      setSuccessMessage("Offre ajoutée avec succès !")
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'offre", error)
      setFormErrors({ ...formErrors, general: "Une erreur est survenue lors de l'ajout de l'offre." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditOffre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !offreToEdit) return

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("_method", "PUT")
      formDataToSend.append("entite_id", formData.entite_id)
      formDataToSend.append("titre", formData.titre)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("prix_initial", formData.prix_initial)
      formDataToSend.append("reduction", formData.reduction || "0")
      formDataToSend.append("quantite", formData.quantite)
      formDataToSend.append("date_debut", formData.date_debut)
      formDataToSend.append("date_fin", formData.date_fin)
      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      await axios.post(`http://127.0.0.1:8000/api/offres/${offreToEdit.id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      // Fetch the updated offer to ensure all fields (including entite) are included
      const updatedOffreResponse = await axios.get(`http://127.0.0.1:8000/api/offres/${offreToEdit.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update the offres state with the complete updated offer data
      setOffres(
        offres.map((offre) =>
          offre.id === offreToEdit.id ? updatedOffreResponse.data : offre
        )
      )
      setSuccessMessage("Offre modifiée avec succès !")
      resetForm()
      setOffreToEdit(null)
      setShowEditModal(false)
    } catch (error) {
      console.error("Erreur lors de la modification de l'offre", error)
      setFormErrors({ ...formErrors, general: "Une erreur est survenue lors de la modification de l'offre." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (offre: Offre) => {
    setFormData({
      entite_id: offre.entite_id.toString(),
      titre: offre.titre,
      description: offre.description || "",
      prix_initial: offre.prix_initial.toString(),
      prix_reduit: offre.prix_reduit.toString(),
      reduction: offre.reduction?.toString() || "",
      quantite: offre.quantite_initial?.toString() || offre.quantite?.toString() || "",
      date_debut: offre.date_debut || "",
      date_fin: offre.date_fin || "",
      image: offre.image || "",
    })
    setOffreToEdit(offre)
    setSelectedImage(null)
    setFormErrors({
      entite_id: "",
      titre: "",
      description: "",
      prix_initial: "",
      reduction: "",
      quantite: "",
      date_debut: "",
      date_fin: "",
      image: "",
      general: "",
    })
    setShowEditModal(true)
  }

  const openDetailsModal = async (offre: Offre) => {
    setDetailsLoading(true)
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/offres/${offre.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOffreToView(response.data)
      setShowDetailsModal(true)
    } catch (error) {
      console.error("Error fetching offer details", error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
      setFormErrors({ ...formErrors, image: "" })
    }
  }

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Prevent changes to entite_id
    if (name === "entite_id") return
    setFormData({
      ...formData,
      [name]: name === "quantite" ? (value ? Number.parseInt(value) : "") : value,
    })
    setFormErrors({ ...formErrors, [name]: "" })
  }

  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none'%3E%3Crect width='48' height='48' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-size='12' font-family='Arial'%3EImage%3C/text%3E%3C/svg%3E"

  const getImageSrc = (offre: Offre) => {
    if (offre?.image) {
      return `http://127.0.0.1:8000/storage/${offre.image}`
    }
    if (offre?.image_url) {
      return `http://127.0.0.1:8000${offre.image_url}`
    }
    return placeholderImage
  }

  const totalPages = Math.ceil(filteredOffres.length / offresPerPage)
  const paginatedOffres = filteredOffres.slice((currentPage - 1) * offresPerPage, currentPage * offresPerPage)

  const renderFormModal = (isEdit: boolean) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isEdit ? "Modifier l'offre" : "Ajouter une offre"}
          </h2>
          <button
            onClick={() => (isEdit ? setShowEditModal(false) : setShowAddModal(false))}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formErrors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">
            {formErrors.general}
          </div>
        )}

        <form onSubmit={isEdit ? handleEditOffre : handleAddOffre} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entité <span className="text-red-500">*</span>
            </label>
            <select
              name="entite_id"
              value={formData.entite_id}
              onChange={handleFormChange}
              disabled={true}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed text-sm"
            >
              <option value="">Sélectionner une entité</option>
              {entites.map((entite) => (
                <option key={entite.id} value={entite.id}>
                  {entite.nom_entites || entite.noms_entites}
                </option>
              ))}
            </select>
            {formErrors.entite_id && <p className="text-red-500 text-xs mt-1">{formErrors.entite_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleFormChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm ${
                formErrors.titre ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Entrez le titre de l'offre"
            />
            {formErrors.titre && <p className="text-red-500 text-xs mt-1">{formErrors.titre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={4}
              maxLength={225}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm ${
                formErrors.description ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Entrez la description de l'offre"
            />
            <div className="text-xs text-gray-500 mt-1">{formData.description.length}/225 caractères</div>
            {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix initial (TND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="prix_initial"
                value={formData.prix_initial}
                onChange={handleFormChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm ${
                  formErrors.prix_initial ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="0.00"
              />
              {formErrors.prix_initial && <p className="text-red-500 text-xs mt-1">{formErrors.prix_initial}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Réduction (%)</label>
              <input
                type="number"
                name="reduction"
                value={formData.reduction}
                onChange={handleFormChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm ${
                  formErrors.reduction ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="0"
              />
              {formErrors.reduction && <p className="text-red-500 text-xs mt-1">{formErrors.reduction}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix réduit (TND)</label>
              <input
                type="number"
                value={formData.prix_reduit}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm"
                placeholder="Calculé automatiquement"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantite"
              value={formData.quantite}
              onChange={handleFormChange}
              min="1"
              step="1"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm ${
                formErrors.quantite ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="1"
            />
            {formErrors.quantite && <p className="text-red-500 text-xs mt-1">{formErrors.quantite}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleFormChange}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm ${
                  formErrors.date_debut ? "border-red-500" : "border-gray-200"
                }`}
              />
              {formErrors.date_debut && <p className="text-red-500 text-xs mt-1">{formErrors.date_debut}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleFormChange}
                min={formData.date_debut || new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm ${
                  formErrors.date_fin ? "border-red-500" : "border-gray-200"
                }`}
              />
              {formErrors.date_fin && <p className="text-red-500 text-xs mt-1">{formErrors.date_fin}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image de l'offre</label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-4 pb-5">
                    <Upload className="w-6 h-6 mb-1 text-gray-400" />
                    <p className="mb-1 text-xs text-gray-500">
                      <span className="font-semibold">Cliquez pour télécharger</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG ou JPEG</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>

              {(selectedImage || (isEdit && formData.image)) && (
                <div className="relative">
                  <img
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage)
                        : `http://127.0.0.1:8000/storage/${formData.image}`
                    }
                    alt="Aperçu"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = placeholderImage
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null)
                      if (!isEdit) setFormData({ ...formData, image: "" })
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => (isEdit ? setShowEditModal(false) : setShowAddModal(false))}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {isSubmitting ? "Enregistrement..." : isEdit ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <NavbarProps>
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gestion des Offres
                </h1>
                <p className="text-gray-600 text-sm">Gérez les offres de services disponibles</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                  placeholder="Rechercher ..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter une offre
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-600 text-sm">Chargement des offres...</span>
              </div>
            ) : paginatedOffres.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? "Aucune offre trouvée" : "Aucune offre"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "Aucune offre ne correspond à votre recherche."
                    : "Commencez par créer votre première offre."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Offre</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Service</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Prix</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Quantité</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Période</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedOffres.map((offre) => (
                        <tr key={offre.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3 flex items-center gap-2">
                            <img
                              src={getImageSrc(offre)}
                              alt={offre.titre}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = placeholderImage
                              }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{offre.titre}</div>
                              <div className="text-xs text-gray-500 max-w-xs truncate">
                                {offre.description || "Aucune description"}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {entites.find((e) => e.id === offre.entite_id)?.nom_entites ||
                                entites.find((e) => e.id === offre.entite_id)?.noms_entites ||
                                "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {offre.reduction > 0 && (
                                <div className="text-xs text-gray-500 line-through">{offre.prix_initial} TND</div>
                              )}
                              <div className="font-semibold text-green-600 text-sm">{offre.prix_reduit} TND</div>
                              {offre.reduction > 0 && (
                                <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  -{offre.reduction}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {offre.quantite || offre.quantite_initial || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {offre.date_debut && offre.date_fin
                                ? `${new Date(offre.date_debut).toLocaleDateString("fr-TN")} - ${new Date(
                                    offre.date_fin,
                                  ).toLocaleDateString("fr-TN")}`
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openDetailsModal(offre)}
                                className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(offre)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                onClick={() => {
                                  setOffreToDelete(offre.id)
                                  setShowDeleteDialog(true)
                                }}
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden p-3 space-y-3">
                  {paginatedOffres.map((offre) => (
                    <div key={offre.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                      <div className="flex items-start gap-2 mb-2">
                        <img
                          src={getImageSrc(offre)}
                          alt={offre.titre}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = placeholderImage
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm mb-1">{offre.titre}</div>
                          <div className="text-xs text-gray-500 mb-1 line-clamp-2">
                            {offre.description || "Aucune description"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {entites.find((e) => e.id === offre.entite_id)?.nom_entites ||
                              entites.find((e) => e.id === offre.entite_id)?.noms_entites ||
                              "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-2 text-xs">
                        <div>
                          <span className="text-gray-500">Prix:</span>
                          <div className="font-semibold text-green-600">{offre.prix_reduit} TND</div>
                          {offre.reduction > 0 && (
                            <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium mt-1">
                              -{offre.reduction}%
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Quantité:</span>
                          <div className="font-medium">{offre.quantite || offre.quantite_initial || "N/A"}</div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openDetailsModal(offre)}
                          className="flex items-center gap-1 px-2 py-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors text-xs"
                        >
                          <Eye className="w-3 h-3" />
                          Détails
                        </button>
                        <button
                          onClick={() => openEditModal(offre)}
                          className="flex items-center gap-1 px-2 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-xs"
                        >
                          <Edit className="w-3 h-3" />
                          Modifier
                        </button>
                        <button
                          className="flex items-center gap-1 px-2 py-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs"
                          onClick={() => {
                            setOffreToDelete(offre.id)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredOffres.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-gray-600">
                        Affichage de {(currentPage - 1) * offresPerPage + 1} à{" "}
                        {Math.min(currentPage * offresPerPage, filteredOffres.length)} sur {filteredOffres.length}{" "}
                        offres
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className={`p-1.5 rounded-lg transition-all duration-200 border ${
                            currentPage === 1
                              ? "text-gray-400 cursor-not-allowed border-gray-200"
                              : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                          }`}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 1) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <button
                              key={pageNum}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent"
                                  : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                              }`}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          )
                        })}

                        <button
                          className={`p-1.5 rounded-lg transition-all duration-200 border ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed border-gray-200"
                              : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                          }`}
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {successMessage && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Opération réussie</h3>
                    <p className="text-sm text-gray-600">{successMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-fade-in">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Erreur</h2>
                  <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddModal && renderFormModal(false)}
          {showEditModal && renderFormModal(true)}
          {showDetailsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-50 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Détails de l'offre
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {detailsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-gray-600 text-sm">Chargement des détails...</span>
                  </div>
                ) : offreToView ? (
                  <div className="space-y-5">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-5">
                      <div className="flex justify-center">
                        <img
                          src={getImageSrc(offreToView)}
                          alt={offreToView.titre}
                          className="w-48 h-48 rounded-lg object-cover border border-gray-200 shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = placeholderImage
                          }}
                        />
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                          <Tag className="w-4 h-4 text-blue-500" />
                          Description
                        </h4>
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {offreToView.description || "Aucune description disponible"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                          Informations de prix
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium text-gray-600">Prix initial :</span>{" "}
                            <span className="text-gray-800 font-semibold">{offreToView.prix_initial} TND</span>
                          </p>
                          {offreToView.reduction > 0 && (
                            <p>
                              <span className="font-medium text-gray-600">Réduction :</span>{" "}
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                {offreToView.reduction}%
                              </span>
                            </p>
                          )}
                          <p>
                            <span className="font-medium text-gray-600">Prix final :</span>{" "}
                            <span className="text-green-600 font-bold">{offreToView.prix_reduit} TND</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-blue-500" />
                          Disponibilité
                        </h4>
                        <p className="text-sm">
                          <span className="font-medium text-gray-600">Quantité disponible :</span>{" "}
                          <span className="text-gray-800 font-semibold">
                            {offreToView.quantite_initial || offreToView.quantite || "N/A"}
                          </span>
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-blue-500" />
                          Prestataire
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium text-gray-600">Nom :</span>{" "}
                            <span className="text-gray-800">
                              {offreToView.entite?.nom_entites ||
                                entites.find((e) => e.id === offreToView.entite_id)?.nom_entites ||
                                entites.find((e) => e.id === offreToView.entite_id)?.noms_entites ||
                                "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          Période de validité
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium text-gray-600">Date de début :</span>{" "}
                            <span className="text-gray-800">
                              {offreToView.date_debut
                                ? new Date(offreToView.date_debut).toLocaleDateString("fr-TN")
                                : "Non spécifiée"}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium text-gray-600">Date de fin :</span>{" "}
                            <span className="text-gray-800">
                              {offreToView.date_fin
                                ? new Date(offreToView.date_fin).toLocaleDateString("fr-TN")
                                : "Non spécifiée"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-sm">Aucun détail disponible pour cette offre.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>

                  <h2 className="text-lg font-bold text-gray-800 mb-2">Confirmer la suppression</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteDialog(false)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => offreToDelete && deleteOffre(offreToDelete)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <style jsx>{`
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </NavbarProps>
  )
}

export default OffresPage