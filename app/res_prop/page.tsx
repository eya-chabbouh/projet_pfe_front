"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  Search,
  Calendar,
  ShoppingCart,
  Mail,
  Package,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import NavbarProps from "../components/NavbarProps/page"

interface Reservation {
  id: number
  client_name: string
  client_email: string
  date_reservation: string
  offre_titre: string
  entite_nom: string
  statut: string
}

interface Entite {
  noms_entites: string
  description: string
  localisation: string
  image?: string
}

export default function ResProp() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [entites, setEntites] = useState<Entite[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRecherche, setDateRecherche] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const router = useRouter()

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Token d'authentification manquant. Veuillez vous reconnecter.")
          router.push("/")
          return
        }
        const response = await axios.get("http://127.0.0.1:8000/api/prop/reservations", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setReservations(response.data)
      } catch (error: any) {
        setError("Erreur lors du chargement des réservations: " + (error.response?.data?.message || error.message))
        console.error("Erreur (fetchReservations):", error.response?.data || error)
      } finally {
        setLoading(false)
      }
    }

    const fetchEntites = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Token d'authentification manquant. Veuillez vous reconnecter.")
          router.push("/")
          return
        }
        const response = await axios.get("http://127.0.0.1:8000/api/entites", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setEntites(response.data)
      } catch (error: any) {
        setError("Erreur lors de la récupération des entités: " + (error.response?.data?.message || error.message))
        console.error("Erreur (fetchEntites):", error.response?.data || error)
      }
    }

    fetchReservations()
    fetchEntites()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  // Filtrage des réservations
  const filteredReservations = reservations.filter((res) => {
    const nomMatch = res.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    const titreMatch = res.offre_titre.toLowerCase().includes(searchTerm.toLowerCase())
    const dateMatch = dateRecherche ? new Date(res.date_reservation).toISOString().slice(0, 10) === dateRecherche : true

    return (nomMatch || titreMatch) && dateMatch
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)

  const getStatusBadge = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "payée":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Payée
          </span>
        )
      case "en attente":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )
      case "annulée":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            Annulée
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            <AlertTriangle className="w-3 h-3" />
            {statut}
          </span>
        )
    }
  }

  return (
    <NavbarProps>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/50 p-3 sm:p-4">
        <div className="max-w-3xl mx-auto sm:max-w-4xl lg:max-w-5xl">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 h-12 bg-gradient-to-br from-violet-500 via-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                <ShoppingCart className="w-5 h-5 sm:w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-violet-700 bg-clip-text text-transparent">
                  Liste des Commandes
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">Gérez toutes vos commandes clients</p>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-md border border-gray-200/50 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-violet-500 via-blue-500 to-violet-600 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
                <Package className="w-4 h-4 sm:w-5 h-5" />
                Commandes Reçues 
              </h2>
            </div>

            <div className="p-3 sm:p-4">
              {/* Error Message */}
              {error && (
                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-md sm:rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                      <XCircle className="w-4 h-4 sm:w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 text-sm sm:text-base">Erreur</h4>
                      <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search and Filter Bar */}
              <div className="mb-4 sm:mb-6 flex flex-col lg:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 sm:pl-12 sm:pr-4 sm:py-3 border border-gray-200 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                    placeholder="Rechercher ..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 h-5" />
                  <input
                    type="date"
                    className="pl-10 pr-3 py-2 sm:pl-12 sm:pr-4 sm:py-3 border border-gray-200 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                    value={dateRecherche}
                    onChange={(e) => {
                      setDateRecherche(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 h-20 bg-gradient-to-br from-violet-100 via-blue-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-violet-500"></div>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">Chargement des commandes...</p>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 h-20 bg-gradient-to-br from-violet-100 via-blue-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <ShoppingCart className="w-8 h-8 sm:w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2 sm:mb-3">Aucune commande trouvée</h3>
                  <p className="text-gray-500 text-sm sm:text-base">
                    {searchTerm || dateRecherche
                      ? "Aucune commande ne correspond à vos critères de recherche."
                      : "Vous n'avez pas encore reçu de commandes."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-hidden border border-gray-200 rounded-md sm:rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Offre
                          </th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Prestataire
                          </th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {currentItems.map((res) => (
                          <tr
                            key={res.id}
                            className="hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-blue-50/50 transition-all duration-200"
                          >
                            <td className="px-4 py-3 sm:px-6 sm:py-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 h-10 bg-gradient-to-br from-violet-400 to-blue-500 rounded-md sm:rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                  {res.client_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{res.client_name}</div>
                                  {/* <div className="text-xs text-gray-500">ID: #{res.id}</div> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4">
                              <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                                <Mail className="w-3 h-3 sm:w-4 h-4 text-gray-400" />
                                <span className="text-xs sm:text-sm">{res.client_email}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Package className="w-3 h-3 sm:w-4 h-4 text-violet-500" />
                                <span className="font-medium text-gray-900 text-xs sm:text-sm">{res.offre_titre}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Building2 className="w-3 h-3 sm:w-4 h-4 text-blue-500" />
                                <span className="text-gray-700 text-xs sm:text-sm">{res.entite_nom}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4">
                              <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                                <Calendar className="w-3 h-3 sm:w-4 h-4 text-gray-400" />
                                <span className="text-xs sm:text-sm">
                                  {new Date(res.date_reservation).toLocaleDateString("fr-FR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4">{getStatusBadge(res.statut)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 sm:mt-6 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-violet-50/50 via-blue-50/50 to-violet-50/50 rounded-md sm:rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">
                        Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredReservations.length)}{" "}
                        sur {filteredReservations.length} commandes
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          className={`p-2 sm:p-3 rounded-md sm:rounded-lg transition-all duration-200 border ${
                            currentPage === 1
                              ? "text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50"
                              : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300 hover:border-violet-300"
                          }`}
                          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 h-5" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                              currentPage === i + 1
                                ? "bg-gradient-to-r from-violet-500 via-blue-500 to-violet-600 text-white border-transparent shadow-md"
                                : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300 hover:border-violet-300"
                            }`}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}

                        <button
                          className={`p-2 sm:p-3 rounded-md sm:rounded-lg transition-all duration-200 border ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50"
                              : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300 hover:border-violet-300"
                          }`}
                          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 h-5" />
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
    </NavbarProps>
  )
}