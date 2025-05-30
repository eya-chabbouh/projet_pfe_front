"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Search, Calendar, Eye, EyeOff, CheckCircle, XCircle, Package } from "lucide-react"
import NavbarProps from "@/app/components/NavbarProps/page"

interface Offre {
  id: number
  titre: string | null
  entite_id: number
  entite: { nom_entites: string } | null
  prix_initial: number
  prix_reduit: number
  quantite: number
  description: string | null
  image_url: string | null
  date_debut: string | null
  date_fin: string | null
}

interface Client {
  id: number
  name: string | null
  email: string | null
  tel: string | null
  role: string
}

interface Reservation {
  id: number
  user_id: number | null
  user: { name: string; email: string; tel: string | null } | null
  entite: { nom_entites: string } | null
  created_at: string | null
  updated_at: string | null
  quantite_reservee: number
  prix: number
  statut: string
  offre_id: number
  offre: { titre: string; prix_initial?: number; quantite_initial?: number } | null
  paiement_annulation_statut?: string
}

interface Entite {
  id: number
  nom_entites: string
}

interface User {
  name: string
  email: string
  tel: string
  photo?: string
  ville: string
  gouvernorat: string
  genre: string
}

export default function ReservationsClientProp() {
  const [offres, setOffres] = useState<Offre[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [reservations, setReservations] = useState<{ [key: number]: Reservation[] }>({})
  const [allReservations, setAllReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [entites, setEntites] = useState<Entite[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRecherche, setDateRecherche] = useState("")
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(4)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Token d'authentification manquant. Veuillez vous reconnecter.")
          router.push("/login")
          return
        }

        const [userResponse, offresResponse, entitesResponse, reservationsResponse, clientsResponse] =
          await Promise.all([
            axios.get("http://127.0.0.1:8000/api/user", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("http://127.0.0.1:8000/api/offres", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("http://127.0.0.1:8000/api/entites", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("http://127.0.0.1:8000/api/reservations", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("http://127.0.0.1:8000/api/users?role=client", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ])

        setUser(userResponse.data)
        setOffres(offresResponse.data)
        setEntites(
          entitesResponse.data.map((ent: any) => ({
            id: ent.id,
            nom_entites: ent.nom_entites || "N/A",
          })),
        )
        setClients(clientsResponse.data)

        const rawReservations = reservationsResponse.data
        const mappedReservations = rawReservations.map((res: any) => {
          const user = clientsResponse.data.find((client: Client) => client.id === res.user_id) || null
          return {
            ...res,
            user_id: res.user_id,
            offre_id: res.offre_id,
            user: user ? { name: user.name, email: user.email, tel: user.tel } : null,
            offre: res.offre
              ? {
                  titre: res.offre.titre,
                  prix_initial: res.offre.prix_initial,
                  quantite_initial: res.offre.quantite_initial,
                }
              : null,
            paiement_annulation_statut: res.paiement?.annulation_statut || "acceptee",
            date_fin: res.date_fin,
          }
        })
        setAllReservations(mappedReservations)
      } catch (error: any) {
        setError("Erreur lors du chargement des données: " + (error.response?.data?.message || error.message))
        console.error("Erreur (fetchData):", error.response?.data || error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  const fetchReservationsForOffre = async (offreId: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token d'authentification manquant. Veuillez vous reconnecter.")
        router.push("/login")
        return
      }

      const filteredReservations = allReservations.filter((res) => res.offre_id === offreId)
      setReservations((prev) => ({
        ...prev,
        [offreId]: filteredReservations,
      }))
      setExpandedOffre(offreId)

      if (filteredReservations.length === 0) {
        setError(null)
      } else {
        setError(null)
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Erreur inconnue lors du chargement des réservations."
      setError(`Erreur pour l'offre ${offreId}: ${errorMessage}`)
      setReservations((prev) => ({
        ...prev,
        [offreId]: [],
      }))
    }
  }

  const filteredOffres = offres.filter((offre) => {
    const textMatch = [
      offre.titre ?? "",
      offre.entite?.nom_entites ?? entites.find((e) => e.id === offre.entite_id)?.nom_entites ?? "",
      offre.prix_initial?.toString() ?? "",
      offre.prix_reduit?.toString() ?? "",
      offre.date_debut ?? "",
      offre.date_fin ?? "",
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))

    const dateMatch = dateRecherche
      ? (offre.date_debut && new Date(offre.date_debut).toISOString().slice(0, 10) === dateRecherche) ||
        (offre.date_fin && new Date(offre.date_fin).toISOString().slice(0, 10) === dateRecherche)
      : true

    return textMatch && dateMatch
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredOffres.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredOffres.length / itemsPerPage)

  return (
    <NavbarProps>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/50 p-3 sm:p-4">
        <div className="max-w-3xl mx-auto sm:max-w-4xl lg:max-w-5xl">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 h-12 bg-gradient-to-br from-violet-500 via-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                <Package className="w-5 h-5 sm:w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-violet-700 bg-clip-text text-transparent">
                  Réservations des Clients
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">Gérez les commandes des clients par offre</p>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-md border border-gray-200/50 overflow-hidden">
            <div className="p-3 sm:p-4">
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-md sm:rounded-lg text-red-700 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {/* Search and Date Filter */}
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
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 h-5" />
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

              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 h-20 bg-gradient-to-br from-violet-100 via-blue-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-violet-500"></div>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">Chargement...</p>
                </div>
              ) : filteredOffres.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 h-20 bg-gradient-to-br from-violet-100 via-blue-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Package className="w-8 h-8 sm:w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2 sm:mb-3">Aucune réservation trouvée</h3>
                  <p className="text-gray-500 text-sm sm:text-base">Aucune réservation ne correspond à votre recherche.</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-200 rounded-md sm:rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-violet-500 via-blue-500 to-violet-600">
                      <tr>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Prestataire
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Titre
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Prix Initial
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Prix Réduit
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Quantité Initiale
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Quantité Restante
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Date Début
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Date Fin
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {currentItems.map((offre) => {
                        const firstReservation = allReservations.find((res) => res.offre_id === offre.id)
                        const quantiteInitiale = firstReservation?.offre?.quantite_initial ?? offre.quantite

                        return (
                          <React.Fragment key={offre.id}>
                            <tr className="hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-blue-50/50 transition-all duration-200">
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                                {offre.entite?.nom_entites ||
                                  entites.find((e) => e.id === offre.entite_id)?.nom_entites ||
                                  "N/A"}
                              </td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">{offre.titre || "N/A"}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-emerald-600">
                                {offre.prix_initial
                                  ? offre.prix_initial.toLocaleString("fr-TN", {
                                      style: "currency",
                                      currency: "TND",
                                      minimumFractionDigits: 3,
                                    })
                                  : "N/A"}
                              </td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-violet-600">
                                {offre.prix_reduit
                                  ? offre.prix_reduit.toLocaleString("fr-TN", {
                                      style: "currency",
                                      currency: "TND",
                                      minimumFractionDigits: 3,
                                    })
                                  : "N/A"}
                              </td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">{quantiteInitiale}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-blue-600">{offre.quantite}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-600">
                                {offre.date_debut ? new Date(offre.date_debut).toLocaleDateString("fr-TN") : "N/A"}
                              </td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-600">
                                {offre.date_fin ? new Date(offre.date_fin).toLocaleDateString("fr-TN") : "N/A"}
                              </td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3">
                                {expandedOffre !== offre.id ? (
                                  <button
                                    onClick={() => fetchReservationsForOffre(offre.id)}
                                    className="bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-1 sm:gap-2"
                                    title="Afficher les réservations"
                                  >
                                    <Eye className="w-3 h-3 sm:w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setExpandedOffre(null)}
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-1 sm:gap-2"
                                    title="Masquer les réservations"
                                  >
                                    <EyeOff className="w-3 h-3 sm:w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                            {expandedOffre === offre.id && reservations[offre.id] && (
                              <tr>
                                <td colSpan={9} className="px-3 py-3 sm:px-4 sm:py-4 bg-gradient-to-r from-violet-50/30 to-blue-50/30">
                                  <div className="overflow-hidden border border-gray-200 rounded-md sm:rounded-lg shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                        <tr>
                                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Nom
                                          </th>
                                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Email
                                          </th>
                                          <th className="px-3 py-2 sm:px-3 py-3 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Téléphone
                                          </th>
                                          <th className="px-3 py-2 sm:px-4 sm:py-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Date Création
                                          </th>
                                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Date Mise à Jour
                                          </th>
                                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Quantité Initiale
                                          </th>
                                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Quantité Réservée
                                          </th>
                                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Prix Initial
                                          </th>
                                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Prix Total
                                          </th>
                                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Statut
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-100">
                                        {reservations[offre.id].length > 0 ? (
                                          reservations[offre.id].map((res) => (
                                            <tr
                                              key={res.id}
                                              className="hover:bg-violet-50/40 transition-colors duration-200"
                                            >
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                                                {res.user?.name || "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-600">
                                                {res.user?.email || "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-600">
                                                {res.user?.tel || "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-600">
                                                {res.created_at
                                                  ? new Date(res.created_at).toLocaleDateString("fr-TN")
                                                  : "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-600">
                                                {res.updated_at
                                                  ? new Date(res.updated_at).toLocaleDateString("fr-TN")
                                                  : "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-600">
                                                {res.offre?.quantite_initial || "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-blue-600">
                                                {res.quantite_reservee || "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-emerald-600">
                                                {res.offre?.prix_initial
                                                  ? res.offre.prix_initial.toLocaleString("fr-TN", {
                                                      style: "currency",
                                                      currency: "TND",
                                                      minimumFractionDigits: 3,
                                                    })
                                                  : "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-violet-600">
                                                {res.prix
                                                  ? res.prix.toLocaleString("fr-TN", {
                                                      style: "currency",
                                                      currency: "TND",
                                                      minimumFractionDigits: 3,
                                                    })
                                                  : "N/A"}
                                              </td>
                                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                                                <span
                                                  className={`inline-flex items-center gap-2 sm:gap-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                    res.statut === "payée" ? "bg-emerald-50 sm:text-sm text-emerald-700 border border-emerald-200" : "bg-red-50 sm:text-sm text-red-700 border border-red-200"
                                                  }`}
                                                >
                                                  {res.statut === "payée" ? (
                                                    <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                                                  ) : (
                                                    <XCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                                                  )}
                                                  {res.statut || "N/A"}
                                                </span>
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan={10}
                                              className="px-3 py-4 sm:p-3 sm:py-6 text-center text-gray-600 bg-gray-50/50"
                                            >
                                              <div className="flex flex-col items-center gap-2 sm:gap-3">
                                                <Package className="w-6 h-6 sm:w-8 h-8 text-gray-400" />
                                                <span className="font-medium text-xs sm:text-sm">Aucune réservation pour ce client.</span>
                                              </div>
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && filteredOffres.length > 0 && (
                <div className="mt-4 sm:mt-6 flex justify-center">
                  <nav className="flex items-center gap-1 sm:gap-2">
                    <button
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg border transition-all duration-200 ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50 sm:text-sm"
                          : "text-gray-600 hover:bg-violet-50 hover:border-violet-300 border-gray-300 sm:text-sm"
                      }`}
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ‹                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg border transition-all duration-200 text-xs sm:text-sm ${
                          currentPage === i + 1
                            ? "bg-gradient-to-r from-violet-500 to-blue-600 text-white border-transparent shadow-sm sm:text-sm"
                            : "text-gray-600 hover:bg-violet-50 hover:border-violet-300 border-gray-300 sm:text-sm"
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg border transition-all duration-200 sm:text-sm ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50 sm:text-sm"
                          : "text-gray-600 hover:bg-violet-50 hover:border-violet-300 border-gray-300 sm:text-sm"
                      }`}
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      ›                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </NavbarProps>
  )
}