"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  Search,
  Calendar,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Package,
  Building2,
  AlertCircle,
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

export default function AnnulationReservations() {
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
        const canceledReservations = response.data.filter((res: Reservation) => res.statut === "annulée")
        setReservations(canceledReservations)
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

  const filteredReservations = reservations.filter((res) => {
    const nomMatch = res.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    const titreMatch = res.offre_titre.toLowerCase().includes(searchTerm.toLowerCase())
    const dateMatch = dateRecherche ? new Date(res.date_reservation).toISOString().slice(0, 10) === dateRecherche : true

    return (nomMatch || titreMatch) && dateMatch
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)

  return (
    <NavbarProps>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="p-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Liste des Commandes Annulées
                  </h1>
                  <p className="text-sm text-gray-600">Consultez toutes les commandes qui ont été annulées</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Main Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Commandes Annulées 
                </h2>
              </div>

              <div className="p-4">
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-sm"
                      placeholder="Rechercher ..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm text-sm"
                      value={dateRecherche}
                      onChange={(e) => {
                        setDateRecherche(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-sm text-gray-600">Chargement...</p>
                  </div>
                ) : currentItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <XCircle className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune commande annulée trouvée</h3>
                    <p className="text-sm text-gray-500">Il n'y a actuellement aucune commande annulée.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-hidden border border-gray-100 rounded-lg shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Client</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Offre</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prestataire</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {currentItems.map((res) => (
                              <tr
                                key={res.id}
                                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                                      {res.client_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">{res.client_name}</div>
                                      {/* <div className="text-xs text-gray-500">ID: #{res.id}</div> */}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs">{res.client_email}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-3 h-3 text-blue-500" />
                                    <span className="text-xs font-medium text-gray-900">{res.offre_titre}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-3 h-3 text-purple-500" />
                                    <span className="text-xs text-gray-700">{res.entite_nom}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs">
                                      {new Date(res.date_reservation).toLocaleDateString()}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                    <XCircle className="w-3 h-3" />
                                    {res.statut}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-100">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-gray-600">
                          Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredReservations.length)}{" "}
                          sur {filteredReservations.length} commandes
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className={`p-1 rounded-lg transition-all duration-200 border ${
                              currentPage === 1
                                ? "text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50"
                                : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i + 1}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 border ${
                                currentPage === i + 1
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-md"
                                  : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300 hover:border-gray-400"
                              }`}
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          ))}

                          <button
                            className={`p-1 rounded-lg transition-all duration-200 border ${
                              currentPage === totalPages
                                ? "text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50"
                                : "text-gray-600 hover:bg-white hover:shadow-md border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
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
        </div>
      </div>
    </NavbarProps>
  )
}