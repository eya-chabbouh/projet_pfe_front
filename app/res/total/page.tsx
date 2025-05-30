"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Search,
  ShoppingCart,
  Mail,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
} from "lucide-react"
import AdminLayout from "@/app/components/AdminLayout/page"

interface Reservation {
  id: number
  prix: string
  statut: string
  offre?: { titre: string }
  entite?: { nom_entites: string }
  user_id: number
}

interface Client {
  id: number
  name: string
  email: string
  tel: string
  photo?: string
  role: "admin" | "proprietaire" | "client"
  is_active: boolean
}

const ClientReservationsPage = () => {
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [user, setUser] = useState<Client | null>(null)
  const [filter, setFilter] = useState("")
  const [filterCancelled, setFilterCancelled] = useState("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [currentPageCancelled, setCurrentPageCancelled] = useState<number>(1)
  const itemsPerPage = 3
  const itemsPerPageCancelled = 6
  const [token, setToken] = useState<string | null>(null)

  // Initialiser le token côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"))
    }
  }, [])

  // Charger les données utilisateur (profil)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        if (typeof window !== "undefined") {
          router.push("/login")
        }
        return
      }

      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(data)
      } catch (error) {
        console.error("Erreur récupération user:", error)
      }
    }

    if (token) {
      fetchUserData()
    }
  }, [router, token])

  // Charger les clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/users")
        setClients(data.filter((client: Client) => client.role === "client"))
      } catch (error) {
        console.error("Erreur chargement utilisateurs:", error)
      }
    }

    fetchClients()
  }, [])

  // Charger les réservations
  useEffect(() => {
    const fetchReservations = async () => {
      if (!token) return

      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/reservations", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setReservations(data)
      } catch (error) {
        console.error("Erreur chargement réservations:", error)
      }
    }

    if (token) {
      fetchReservations()
    }
  }, [token])

  if (!user) return null

  // Filtrage réservations actives
  const activeReservations = reservations.filter((res) => res.statut !== "annulée")
  const filteredReservations = activeReservations.filter((res) => {
    const client = clients.find((c) => c.id === res.user_id)
    return (
      res.entite?.nom_entites?.toLowerCase().includes(filter.toLowerCase()) ||
      res.prix.toLowerCase().includes(filter.toLowerCase()) ||
      res.offre?.titre?.toLowerCase().includes(filter.toLowerCase()) ||
      client?.name.toLowerCase().includes(filter.toLowerCase()) ||
      client?.email.toLowerCase().includes(filter.toLowerCase())
    )
  })

  const paginatedReservations = filteredReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / itemsPerPage))

  // Réservations annulées
  const cancelledReservations = reservations.filter((res) => res.statut === "annulée")

  // Filtrage réservations annulées avec nouveau filtre
  const filteredCancelledReservations = cancelledReservations.filter((res) => {
    const client = clients.find((c) => c.id === res.user_id)
    return (
      res.entite?.nom_entites?.toLowerCase().includes(filterCancelled.toLowerCase()) ||
      res.prix.toLowerCase().includes(filterCancelled.toLowerCase()) ||
      res.offre?.titre?.toLowerCase().includes(filterCancelled.toLowerCase()) ||
      client?.name.toLowerCase().includes(filterCancelled.toLowerCase()) ||
      client?.email.toLowerCase().includes(filterCancelled.toLowerCase())
    )
  })

  const paginatedCancelledReservations = filteredCancelledReservations.slice(
    (currentPageCancelled - 1) * itemsPerPageCancelled,
    currentPageCancelled * itemsPerPageCancelled,
  )
  const totalPagesCancelled = Math.max(1, Math.ceil(filteredCancelledReservations.length / itemsPerPageCancelled))

  const getStatusBadge = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "payée":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Payée
          </span>
        )
      case "annulée":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            Annulée
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
            <AlertTriangle className="w-3 h-3" />
            {statut}
          </span>
        )
    }
  }

  const renderPagination = (
    currentPageState: number,
    totalPagesCount: number,
    setCurrentPageFunc: (page: number) => void,
    totalItems: number,
    itemsPerPageCount: number,
    colorScheme: "blue" | "red" = "blue",
  ) => {
    const startItem = (currentPageState - 1) * itemsPerPageCount + 1
    const endItem = Math.min(currentPageState * itemsPerPageCount, totalItems)

    const colorClasses = {
      blue: {
        gradient: "bg-gradient-to-r from-blue-500 to-purple-600",
        background: "bg-gradient-to-r from-blue-50 to-purple-50",
        hover: "hover:bg-blue-50",
      },
      red: {
        gradient: "bg-red-500",
        background: "bg-red-50",
        hover: "hover:bg-red-50",
      },
    }

    return (
      <div className={`px-6 py-4 border-t border-gray-100 ${colorClasses[colorScheme].background}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Affichage de {startItem} à {endItem} sur {totalItems} commandes
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-lg transition-colors border ${
                currentPageState === 1
                  ? "text-gray-400 cursor-not-allowed border-gray-200"
                  : `text-gray-600 ${colorClasses[colorScheme].hover} border-gray-300 hover:border-gray-400`
              }`}
              onClick={() => setCurrentPageFunc(Math.max(currentPageState - 1, 1))}
              disabled={currentPageState === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(totalPagesCount, 5) }, (_, i) => {
              let pageNum
              if (totalPagesCount <= 5) {
                pageNum = i + 1
              } else if (currentPageState <= 3) {
                pageNum = i + 1
              } else if (currentPageState >= totalPagesCount - 2) {
                pageNum = totalPagesCount - 4 + i
              } else {
                pageNum = currentPageState - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    currentPageState === pageNum
                      ? `${colorClasses[colorScheme].gradient} text-white border-transparent`
                      : `text-gray-600 ${colorClasses[colorScheme].hover} border-gray-300 hover:border-gray-400`
                  }`}
                  onClick={() => setCurrentPageFunc(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              className={`p-2 rounded-lg transition-colors border ${
                currentPageState === totalPagesCount
                  ? "text-gray-400 cursor-not-allowed border-gray-200"
                  : `text-gray-600 ${colorClasses[colorScheme].hover} border-gray-300 hover:border-gray-400`
              }`}
              onClick={() => setCurrentPageFunc(Math.min(currentPageState + 1, totalPagesCount))}
              disabled={currentPageState === totalPagesCount}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Commandes par Client
                </h1>
                <p className="text-sm text-gray-600">
                  Gérez toutes les commandes  des clients
                </p>
              </div>
            </div>
          </div>

          {/* Section Commandes Actives */}
          <div className="mb-6">
            {/* Barre de recherche */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                  placeholder="Rechercher ..."
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>

            {/* Tableau des commandes actives */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Liste des Commandes 
                </h2>
              </div>

              {paginatedReservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">
                    {filter ? "Aucune commande trouvée" : "Aucune commande"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filter
                      ? "Aucune commande ne correspond à votre recherche."
                      : "Aucune commande n'a été passée pour le moment."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Vue desktop */}
                  <div className="hidden lg:block">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prestataire</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Offre</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prix</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Client</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedReservations.map((res) => {
                          const client = clients.find((c) => c.id === res.user_id)
                          return (
                            <tr key={res.id} className="hover:bg-blue-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900 text-sm">{res.entite?.nom_entites || "N/A"}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-gray-600 text-sm">{res.offre?.titre || "N/A"}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 font-semibold text-green-600 text-sm">
                                  <CreditCard className="w-3 h-3" />
                                  {res.prix} DT
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                    {client?.name?.charAt(0).toUpperCase() || "?"}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">{client?.name || "Inconnu"}</div>
                                    {/* <div className="text-xs text-gray-500">ID: #{res.id}</div> */}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Mail className="w-2.5 h-2.5" />
                                    {client?.email || "-"}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Phone className="w-2.5 h-2.5" />
                                    {client?.tel || "-"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">{getStatusBadge(res.statut)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Vue mobile */}
                  <div className="lg:hidden p-3 space-y-3">
                    {paginatedReservations.map((res) => {
                      const client = clients.find((c) => c.id === res.user_id)
                      return (
                        <div key={res.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {client?.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{client?.name || "Inconnu"}</div>
                                <div className="text-xs text-gray-500">Commande #{res.id}</div>
                              </div>
                            </div>
                            {getStatusBadge(res.statut)}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">Prestataire:</span>{" "}
                              {res.entite?.nom_entites || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Offre:</span> {res.offre?.titre || "N/A"}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">Prix:</span>
                              <span className="font-semibold text-green-600 flex items-center gap-1">
                                <CreditCard className="w-2.5 h-2.5" />
                                {res.prix} DT
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="w-2.5 h-2.5" />
                              {client?.email || "-"}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="w-2.5 h-2.5" />
                              {client?.tel || "-"}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Pagination - Always visible */}
              {renderPagination(
                currentPage,
                totalPages,
                setCurrentPage,
                filteredReservations.length,
                itemsPerPage,
                "blue",
              )}
            </div>
          </div>

          {/* Section Commandes Annulées */}
          <div>
            {/* Barre de recherche pour annulées */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors text-sm"
                  placeholder="Rechercher ..."
                  value={filterCancelled}
                  onChange={(e) => {
                    setFilterCancelled(e.target.value)
                    setCurrentPageCancelled(1)
                  }}
                />
              </div>
            </div>

            {/* Tableau des commandes annulées */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Commandes Annulées 
                </h2>
              </div>

              {cancelledReservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucune commande annulée</h3>
                  <p className="text-sm text-gray-500">Toutes les commandes sont en cours ou terminées avec succès.</p>
                </div>
              ) : paginatedCancelledReservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucun résultat</h3>
                  <p className="text-sm text-gray-500">Aucune commande annulée ne correspond à votre recherche.</p>
                </div>
              ) : (
                <>
                  {/* Vue desktop */}
                  <div className="hidden lg:block">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prestataire</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Offre</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prix</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Client</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedCancelledReservations.map((res) => {
                          const client = clients.find((c) => c.id === res.user_id)
                          return (
                            <tr key={res.id} className="hover:bg-red-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900 text-sm">{res.entite?.nom_entites || "N/A"}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-gray-600 text-sm">{res.offre?.titre || "N/A"}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 font-semibold text-green-600 text-sm">
                                  <CreditCard className="w-3 h-3" />
                                  {res.prix} DT
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                    {client?.name?.charAt(0).toUpperCase() || "?"}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">{client?.name || "Inconnu"}</div>
                                    {/* <div className="text-xs text-gray-500">ID: #{res.id}</div> */}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Mail className="w-2.5 h-2.5" />
                                    {client?.email || "-"}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Phone className="w-2.5 h-2.5" />
                                    {client?.tel || "-"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">{getStatusBadge(res.statut)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Vue mobile */}
                  <div className="lg:hidden p-3 space-y-3">
                    {paginatedCancelledReservations.map((res) => {
                      const client = clients.find((c) => c.id === res.user_id)
                      return (
                        <div key={res.id} className="bg-white rounded-lg border border-red-200 p-3 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {client?.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{client?.name || "Inconnu"}</div>
                                <div className="text-xs text-gray-500">Commande #{res.id}</div>
                              </div>
                            </div>
                            {getStatusBadge(res.statut)}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">Prestataire:</span>{" "}
                              {res.entite?.nom_entites || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Offre:</span> {res.offre?.titre || "N/A"}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">Prix:</span>
                              <span className="font-semibold text-gray-500 flex items-center gap-1">
                                <CreditCard className="w-2.5 h-2.5" />
                                {res.prix} DT
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="w-2.5 h-2.5" />
                              {client?.email || "-"}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="w-2.5 h-2.5" />
                              {client?.tel || "-"}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Pagination - Always visible */}
              {renderPagination(
                currentPageCancelled,
                totalPagesCancelled,
                setCurrentPageCancelled,
                filteredCancelledReservations.length,
                itemsPerPageCancelled,
                "red",
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ClientReservationsPage