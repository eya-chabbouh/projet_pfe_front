"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  Search,
  Eye,
  EyeOff,
  Mail,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  ShoppingCart,
  Building2,
  Package,
  CalendarDays,
} from "lucide-react"
import AdminLayout from "@/app/components/AdminLayout/page"

interface Entite {
  id: number
  nom_entites: string
  adresse: string
  description: string
  user_id: number
}

interface Reservation {
  id: number
  prix: string
  statut: string
  created_at: string | null
  offre?: { titre: string }
  entite_id: number
  user_id: number
  paiement_statut: string
  quantite_reservee?: number
}

interface PrestataireUser {
  id: number
  name: string
  email: string
  tel: string
}

export default function EntiteAvecReservations() {
  const router = useRouter()
  const [entites, setEntites] = useState<Entite[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [users, setUsers] = useState<PrestataireUser[]>([])
  const [expandedEntiteId, setExpandedEntiteId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRecherche, setDateRecherche] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const entitesPerPage = 3

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return router.push("/login")
      try {
        const [entiteRes, reservationRes, userRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/entites", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/reservations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setEntites(entiteRes.data)
        setReservations(
          reservationRes.data.map((res: any) => ({
            ...res,
            paiement_statut: res.paiement?.statut || "Non payé",
            quantite_reservee: res.quantite_reservee,
            created_at: res.created_at || null,
          })),
        )
        setUsers(userRes.data)
      } catch (error) {
        console.error("Erreur chargement données:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [router])

  const getUserById = (id: number) => users.find((u) => u.id === id)

  const toggleEntite = (id: number) => {
    setExpandedEntiteId(expandedEntiteId === id ? null : id)
  }

  const getStatusBadge = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "payée":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Payée
          </span>
        )
      case "en attente":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
            <AlertTriangle className="w-3 h-3" />
            En attente
          </span>
        )
      case "annulée":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            Annulée
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <AlertTriangle className="w-3 h-3" />
            {statut}
          </span>
        )
    }
  }

  const filteredEntites = entites.filter((entite) => {
    const user = getUserById(entite.user_id)
    const searchLower = searchTerm.toLowerCase()
    const textMatch =
      entite.nom_entites.toLowerCase().includes(searchLower) ||
      (user?.email.toLowerCase().includes(searchLower) ?? false)

    const entiteReservations = reservations.filter((r) => r.entite_id === entite.id)
    const dateMatch = dateRecherche
      ? entiteReservations.some((r) => {
          if (!r.created_at) return false
          const createdAt = new Date(r.created_at)
          const selectedDate = new Date(dateRecherche)
          return (
            createdAt.getFullYear() === selectedDate.getFullYear() &&
            createdAt.getMonth() === selectedDate.getMonth() &&
            createdAt.getDate() === selectedDate.getDate()
          )
        })
      : true

    return textMatch && dateMatch
  })

  const getFilteredReservations = (entiteId: number) => {
    return reservations.filter((r) => {
      if (r.entite_id !== entiteId) return false
      if (!dateRecherche) return true
      if (!r.created_at) return false
      const createdAt = new Date(r.created_at)
      const selectedDate = new Date(dateRecherche)
      return (
        createdAt.getFullYear() === selectedDate.getFullYear() &&
        createdAt.getMonth() === selectedDate.getMonth() &&
        createdAt.getDate() === selectedDate.getDate()
      )
    })
  }

  const totalPages = Math.max(1, Math.ceil(filteredEntites.length / entitesPerPage))
  const paginatedEntites = filteredEntites.slice((currentPage - 1) * entitesPerPage, currentPage * entitesPerPage)

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Commandes par Prestataire
                </h1>
                <p className="text-gray-600 text-sm">Gérez toutes les commandes  des prestataires</p>
              </div>
            </div>
          </div>

          {/* Card Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Liste de Commande du Prestataire 
              </h3>
            </div>

            <div className="p-4">
              {/* Search and Filter Bar */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Rechercher ..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div className="relative">
                  <CalendarDays className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                    value={dateRecherche}
                    onChange={(e) => {
                      setDateRecherche(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="text-gray-600 text-sm">Chargement...</p>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-hidden border border-gray-100 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prestataire</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Téléphone</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedEntites.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-12 text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Building2 className="w-8 h-8 text-blue-500" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun prestataire trouvé</h3>
                              <p className="text-gray-500 text-sm">Aucun prestataire ne correspond à votre recherche.</p>
                            </td>
                          </tr>
                        ) : (
                          paginatedEntites.map((entite) => {
                            const user = getUserById(entite.user_id)
                            const entiteReservations = getFilteredReservations(entite.id)

                            return (
                              <React.Fragment key={entite.id}>
                                <tr className="hover:bg-blue-50/50 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {entite.nom_entites.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900 text-sm">{entite.nom_entites}</div>
                                        {/* <div className="text-xs text-gray-500">ID: #{entite.id}</div> */}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                                      <Mail className="w-4 h-4 text-gray-400" />
                                      {user ? user.email : <em className="text-gray-400">Inconnu</em>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                                      <Phone className="w-4 h-4 text-gray-400" />
                                      {user ? user.tel : <em className="text-gray-400">N/A</em>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white transition-all duration-200 shadow-sm hover:shadow-md ${
                                        expandedEntiteId === entite.id
                                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                          : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                      }`}
                                      onClick={() => toggleEntite(entite.id)}
                                    >
                                      {expandedEntiteId === entite.id ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </button>
                                  </td>
                                </tr>
                                {expandedEntiteId === entite.id && (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="px-4 py-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50"
                                    >
                                      <div className="space-y-3">
                                        <h6 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                          <ShoppingCart className="w-4 h-4 text-purple-500" />
                                          Commandes de {entite.nom_entites}
                                        </h6>
                                        {entiteReservations.length === 0 ? (
                                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Package className="w-5 h-5 text-blue-500" />
                                              </div>
                                              <div>
                                                <h4 className="font-medium text-blue-800 text-sm">
                                                  Aucune commande pour ce prestataire
                                                </h4>
                                                <p className="text-xs text-blue-600">
                                                  Ce prestataire n'a pas encore reçu de commandes.
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                                            <table className="min-w-full divide-y divide-gray-200">
                                              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                                <tr>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Client
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Email
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Téléphone
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Offre
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Quantité
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Date
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Prix
                                                  </th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Statut
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-100">
                                                {entiteReservations.map((r) => {
                                                  const client = getUserById(r.user_id)
                                                  return (
                                                    <tr key={r.id} className="hover:bg-purple-50/30 transition-colors">
                                                      <td className="px-3 py-2 text-xs">
                                                        <div className="flex items-center gap-2">
                                                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                                            {client?.name?.charAt(0).toUpperCase() || "?"}
                                                          </div>
                                                          <span className="font-medium text-gray-900 text-xs">
                                                            {client?.name || <em className="text-gray-400">Inconnu</em>}
                                                          </span>
                                                        </div>
                                                      </td>
                                                      <td className="px-3 py-2 text-xs text-gray-600">
                                                        {client?.email || <em className="text-gray-400">Inconnu</em>}
                                                      </td>
                                                      <td className="px-3 py-2 text-xs text-gray-600">
                                                        {client?.tel || <em className="text-gray-400">N/A</em>}
                                                      </td>
                                                      <td className="px-3 py-2 text-xs font-medium text-gray-900">
                                                        {r.offre?.titre || <em className="text-gray-400">N/A</em>}
                                                      </td>
                                                      <td className="px-3 py-2 text-xs text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                          <Package className="w-4 h-4 text-gray-400" />
                                                          {r.quantite_reservee ?? (
                                                            <em className="text-gray-400">N/A</em>
                                                          )}
                                                        </div>
                                                      </td>
                                                      <td className="px-3 py-2 text-xs text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                          <Calendar className="w-4 h-4 text-gray-400" />
                                                          {r.created_at ? (
                                                            r.created_at.slice(0, 10)
                                                          ) : (
                                                            <em className="text-gray-400">N/A</em>
                                                          )}
                                                        </div>
                                                      </td>
                                                      <td className="px-3 py-2 text-xs">
                                                        <div className="flex items-center gap-1 font-semibold text-green-600">
                                                          <CreditCard className="w-4 h-4" />
                                                          {r.prix} DT
                                                        </div>
                                                      </td>
                                                      <td className="px-3 py-2 text-xs">{getStatusBadge(r.statut)}</td>
                                                    </tr>
                                                  )
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-gray-600">
                        Affichage de {(currentPage - 1) * entitesPerPage + 1} à{" "}
                        {Math.min(currentPage * entitesPerPage, filteredEntites.length)} sur {filteredEntites.length}{" "}
                        prestataires
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className={`p-1 rounded-lg transition-colors border ${
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
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors border ${
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
                          className={`p-1 rounded-lg transition-colors border ${
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}