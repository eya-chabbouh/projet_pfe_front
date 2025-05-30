"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import type React from "react"
import { Search, MessageSquare, Mail, Calendar, ChevronLeft, ChevronRight, AlertCircle, Users, UserCheck } from 'lucide-react'
import AdminLayout from "@/app/components/AdminLayout/page"

interface Reclamation {
  id: number
  user_id: number | null
  nom: string
  email: string
  message: string
  created_at: string
  updated_at: string
}

interface Pagination {
  current_page: number
  data: Reclamation[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: { url: string | null; label: string; active: boolean }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

const ITEMS_PER_PAGE = 2 // Fixed number of items per page

const ReclamationsPage: React.FC = () => {
  const [reclamations, setReclamations] = useState<Reclamation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchReclamations = async (page = 1) => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          if (router) {
            router.push("/login")
          } else {
            setError("Erreur: Impossible de rediriger vers la page de connexion")
          }
          return
        }

        const response = await axios.get(
          `http://localhost:8000/api/reclamations?page=${page}&per_page=${ITEMS_PER_PAGE}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        if (response.data && Array.isArray(response.data.data)) {
          setReclamations(response.data.data)
        } else {
          setError("Format de données inattendu")
        }
        setLoading(false)
      } catch (err: any) {
        setError("Erreur: " + (err.message || "Inconnue"))
        setLoading(false)
      }
    }

    fetchReclamations(currentPage)
  }, [router, currentPage])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }

  const getFilteredReclamations = () => {
    if (!searchTerm) return reclamations
    return reclamations.filter(
      (r) =>
        r.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.message.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const filteredData = getFilteredReclamations()
  const totalFilteredItems = filteredData.length
  const totalPages = Math.ceil(totalFilteredItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPageData = filteredData.slice(startIndex, endIndex)

  const getTypeBadge = (user_id: number | null) => {
    if (user_id) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
          <UserCheck className="w-2.5 h-2.5" />
          Utilisateur
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          <Users className="w-2.5 h-2.5" />
          Invité
        </span>
      )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "Date invalide"
    }
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
                <p className="text-gray-600 text-sm">Chargement des réclamations...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Erreur de chargement</h3>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gestion des Réclamations
                </h1>
                <p className="text-gray-600 text-sm">Consultez et gérez toutes les réclamations des utilisateurs</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                placeholder="Rechercher ..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Les Réclamations 
              </h2>
            </div>

            {currentPageData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? "Aucune réclamation trouvée" : "Aucune réclamation"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "Aucune réclamation ne correspond à votre recherche."
                    : "Aucune réclamation n'a été soumise pour le moment."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ID</th> */}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Utilisateur</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Message</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentPageData.map((reclamation) => (
                        <tr key={reclamation.id} className="hover:bg-blue-50/50 transition-colors">
                          {/* <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {reclamation.id}
                              </div>
                            </div>
                          </td> */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {reclamation.nom.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{reclamation.nom}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="w-2.5 h-2.5" />
                                  {reclamation.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-xs">
                              <p className="text-gray-900 text-sm line-clamp-2">{reclamation.message}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">{getTypeBadge(reclamation.user_id)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {formatDate(reclamation.created_at)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-3 space-y-3">
                  {currentPageData.map((reclamation) => (
                    <div key={reclamation.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {reclamation.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{reclamation.nom}</div>
                            <div className="text-xs text-gray-500">ID: #{reclamation.id}</div>
                          </div>
                        </div>
                        {getTypeBadge(reclamation.user_id)}
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-2.5 h-2.5" />
                          {reclamation.email}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Message:</span>
                          <p className="text-gray-600 mt-1 text-xs">{reclamation.message}</p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDate(reclamation.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-gray-600">
                      {totalFilteredItems === 0 ? (
                        "Aucune réclamation à afficher"
                      ) : (
                        <>
                          Affichage de {startIndex + 1} à {Math.min(endIndex, totalFilteredItems)} sur{" "}
                          {totalFilteredItems} réclamations
                          {searchTerm && (
                            <span className="ml-1 text-blue-600">
                              (filtré{totalFilteredItems !== reclamations.length ? `es de ${reclamations.length}` : ""})
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        className={`p-1.5 rounded-lg transition-colors border ${
                          currentPage === 1 || totalFilteredItems === 0
                            ? "text-gray-400 cursor-not-allowed border-gray-200"
                            : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                        }`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || totalFilteredItems === 0}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>

                      {totalFilteredItems === 0 ? (
                        <button className="px-2 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-400 cursor-not-allowed">
                          1
                        </button>
                      ) : (
                        Array.from({ length: Math.min(Math.max(totalPages, 1), 5) }, (_, i) => {
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
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors border ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent"
                                  : totalPages === 1
                                    ? "text-gray-400 cursor-not-allowed border-gray-200"
                                    : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                              }`}
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={totalPages === 1}
                            >
                              {pageNum}
                            </button>
                          )
                        })
                      )}

                      <button
                        className={`p-1.5 rounded-lg transition-colors border ${
                          currentPage === totalPages || totalFilteredItems === 0 || totalPages <= 1
                            ? "text-gray-400 cursor-not-allowed border-gray-200"
                            : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300"
                        }`}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalFilteredItems === 0 || totalPages <= 1}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ReclamationsPage