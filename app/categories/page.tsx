"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Tag,
  ImageIcon,
  AlertCircle,
  X,
  Upload,
  Save,
} from "lucide-react"
import AdminLayout from "../components/AdminLayout/page"

interface Category {
  id: number
  nom: string
  image?: string
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const categoriesPerPage = 3
  const [token, setToken] = useState<string | null>(null)
  // Form states
  const [formData, setFormData] = useState({ nom: "", image: "" })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState({ nom: "", image: "", general: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Success and error message states
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Initialiser le token côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"))
    }
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) {
        if (typeof window !== "undefined") {
          router.push("/login")
        }
        return
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchCategories()
    }
  }, [router, token])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        if (typeof window !== "undefined") {
          router.push("/login")
        }
        return
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(response.data)
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    if (token) {
      fetchUserData()
    }
  }, [router, token])

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Auto-dismiss delete error message after 5 seconds
  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [deleteError])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.image?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const deleteCategory = async (id: number) => {
    if (!token) {
      router.push("/login")
      return
    }

    try {
      await axios.delete(`http://127.0.0.1:8000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCategories(categories.filter((category: Category) => category.id !== id))
      setSuccessMessage("Catégorie supprimée avec succès !")
      setShowDeleteDialog(false)
      setDeleteError(null)
    } catch (error: any) {
      if (error.response?.status === 422) {
        setDeleteError(error.response.data.message)
      } else {
        console.error("Error deleting category", error)
        setDeleteError("Une erreur est survenue lors de la suppression de la catégorie.")
      }
    }
  }

  const resetForm = () => {
    setFormData({ nom: "", image: "" })
    setSelectedImage(null)
    setFormErrors({ nom: "", image: "", general: "" })
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { nom: "", image: "", general: "" }

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom de la catégorie est obligatoire"
      isValid = false
    } else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s-_&]+$/.test(formData.nom)) {
      newErrors.nom = "Le nom ne doit contenir que des lettres, espaces, tirets ou underscores"
      isValid = false
    }

    if (!selectedImage && !formData.image) {
      newErrors.image = "L'image de la catégorie est obligatoire"
      isValid = false
    }

    setFormErrors(newErrors)
    return isValid
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("nom", formData.nom)
      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      const response = await axios.post("http://127.0.0.1:8000/api/categories", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setCategories([...categories, response.data])
      setSuccessMessage("Catégorie ajoutée avec succès !")
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie", error)
      setFormErrors({ ...formErrors, general: "Une erreur est survenue lors de l'ajout de la catégorie." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !categoryToEdit) return

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("nom", formData.nom)
      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      const response = await axios.post(`http://127.0.0.1:8000/api/categories/${categoryToEdit.id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setCategories(categories.map((cat) => (cat.id === categoryToEdit.id ? response.data : cat)))
      setSuccessMessage("Catégorie modifiée avec succès !")
      setShowEditModal(false)
      resetForm()
      setCategoryToEdit(null)
    } catch (error) {
      console.error("Erreur lors de la modification de la catégorie", error)
      setFormErrors({ ...formErrors, general: "Une erreur est survenue lors de la modification de la catégorie." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (category: Category) => {
    setFormData({ nom: category.nom, image: category.image || "" })
    setCategoryToEdit(category)
    setSelectedImage(null)
    setFormErrors({ nom: "", image: "", general: "" })
    setShowEditModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
      setFormErrors({ ...formErrors, image: "" })
    }
  }

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage)
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage,
  )

  const renderModal = (isEdit: boolean) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isEdit ? "Modifier la catégorie" : "Ajouter une catégorie"}
          </h2>
          <button
            onClick={() => (isEdit ? setShowEditModal(false) : setShowAddModal(false))}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formErrors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-xs mb-3">
            {formErrors.general}
          </div>
        )}

        <form onSubmit={isEdit ? handleEditCategory : handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nom de la catégorie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => {
                setFormData({ ...formData, nom: e.target.value })
                setFormErrors({ ...formErrors, nom: "" })
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                formErrors.nom ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Entrez le nom de la catégorie"
            />
            {formErrors.nom && <p className="text-red-500 text-xs mt-1">{formErrors.nom}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Image de la catégorie <span className="text-red-500">*</span>
            </label>
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
                    className="w-full h-36 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null)
                      if (!isEdit) setFormData({ ...formData, image: "" })
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    <AdminLayout>
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gestion des Catégories
                </h1>
                <p className="text-gray-600 text-sm">Gérez les catégories de services disponibles</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="Rechercher ..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-600">Chargement des catégories...</span>
              </div>
            ) : paginatedCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? "Aucune catégorie trouvée" : "Aucune catégorie"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "Aucune catégorie ne correspond à votre recherche."
                    : "Commencez par créer votre première catégorie."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Catégorie</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Image</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {category.nom.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{category.nom}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {category.image ? (
                              <img
                                src={`http://127.0.0.1:8000/storage/${category.image}`}
                                alt={category.nom}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(category)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                onClick={() => {
                                  setCategoryToDelete(category.id)
                                  setShowDeleteDialog(true)
                                  setDeleteError(null)
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

                <div className="md:hidden p-3 space-y-3">
                  {paginatedCategories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {category.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{category.nom}</div>
                            <div className="text-xs text-gray-500">ID: #{category.id}</div>
                          </div>
                        </div>
                        {category.image ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${category.image}`}
                            alt={category.nom}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="flex items-center gap-2 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-xs"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                        <button
                          className="flex items-center gap-2 px-2 py-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs"
                          onClick={() => {
                            setCategoryToDelete(category.id)
                            setShowDeleteDialog(true)
                            setDeleteError(null)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredCategories.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-gray-600">
                        Affichage de {(currentPage - 1) * categoriesPerPage + 1} à{" "}
                        {Math.min(currentPage * categoriesPerPage, filteredCategories.length)} sur{" "}
                        {filteredCategories.length} catégories
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className={`p-1 rounded-lg transition-all duration-200 border ${
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
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <button
                              key={pageNum}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 border ${
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
                          className={`p-1 rounded-lg transition-all duration-200 border ${
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

          {showAddModal && renderModal(false)}
          {showEditModal && renderModal(true)}

          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>

                  <h2 className="text-lg font-bold text-gray-800 mb-2">Confirmer la suppression</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {deleteError
                      ? deleteError
                      : "Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDeleteDialog(false)
                        setDeleteError(null)
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      {deleteError ? "Fermer" : "Annuler"}
                    </button>
                    {!deleteError && (
                      <button
                        onClick={() => categoryToDelete && deleteCategory(categoryToDelete)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        Supprimer
                      </button>
                    )}
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
    </AdminLayout>
  )
}

export default CategoriesPage