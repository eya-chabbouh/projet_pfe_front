"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Search,
  X,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  History,
  CreditCard,
} from "lucide-react"
import Navbar from "../components/Navbar"

interface Paiement {
  id: any
  statut: string
  annulation_statut: string
  montant: number | string | null
}

interface Offre {
  titre: string
  date_debut: string
}

interface Reservation {
  id: number
  created_at: string
  date_fin: string
  quantite_reservee: number
  prix: number
  statut: string
  user_id?: number
  paiement?: Paiement
  offre?: Offre
}

interface ReservationGroup {
  created_at: string
  reservations: Reservation[]
}

export default function HistoriquePage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ nom: string; photo: string }>({ nom: "", photo: "" })
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [reservationsToCancel, setReservationsToCancel] = useState<number[]>([])
  const [showCancelled, setShowCancelled] = useState(false)
  const [visibleConfirmed, setVisibleConfirmed] = useState(6)
  const [visibleCancelled, setVisibleCancelled] = useState(6)
  const [filterDate, setFilterDate] = useState("")
  const [filterTitle, setFilterTitle] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUserInfo(storedToken)
    } else {
      setErrorMessage("Utilisateur non authentifié.")
      setShowErrorModal(true)
      setTimeout(() => router.push("/login"), 2000)
    }
  }, [router])

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des informations utilisateur.")
      }
      const user = await res.json()
      if (user?.id) {
        setUserInfo({
          nom: user.nom,
          photo: user.photo.startsWith("http") ? user.photo : `http://127.0.0.1:8000/storage/${user.photo}`,
        })
        fetchReservations(user.id, token)
      } else {
        throw new Error("Utilisateur non trouvé.")
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des informations utilisateur:", error)
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de la récupération des informations utilisateur."
      )
      setShowErrorModal(true)
      setTimeout(() => router.push("/login"), 2000)
    }
  }

  const fetchReservations = async (uid: number, token: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/reservations?user_id=${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des réservations.")
      }
      const data: Reservation[] = await res.json()
      setReservations(data)
      setFilteredReservations(data)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error)
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de la récupération des réservations."
      )
      setShowErrorModal(true)
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...reservations]
    if (filterDate) {
      filtered = filtered.filter((r) => {
        const createdAt = new Date(r.created_at)
        const selectedDate = new Date(filterDate)
        return (
          createdAt.getFullYear() === selectedDate.getFullYear() &&
          createdAt.getMonth() === selectedDate.getMonth() &&
          createdAt.getDate() === selectedDate.getDate()
        )
      })
    }
    if (filterTitle) {
      filtered = filtered.filter((r) => r.offre?.titre?.toLowerCase().includes(filterTitle.toLowerCase()))
    }
    setFilteredReservations(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [filterDate, filterTitle, reservations])

  const groupReservations = (reservations: Reservation[]): ReservationGroup[] => {
    const grouped: { [key: string]: Reservation[] } = {}
    reservations.forEach((r) => {
      const key = r.created_at
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(r)
    })

    return Object.entries(grouped)
      .map(([created_at, reservations]) => ({
        created_at,
        reservations,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const canCancelReservation = (reservation: Reservation): boolean => {
    const now = new Date()
    const createdAt = new Date(reservation.created_at)
    const dateDebut = reservation.offre?.date_debut ? new Date(reservation.offre.date_debut) : null

    if (dateDebut) {
      const hoursUntilStart = (dateDebut.getTime() - now.getTime()) / (1000 * 60 * 60)
      if (hoursUntilStart < 72) {
        return false
      }
    }

    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceCreation > 48) {
      return false
    }

    return true
  }

  const handleCancelClick = (reservationIds: number[]) => {
    const reservationsToCheck = reservations.filter((r) => reservationIds.includes(r.id))
    const canCancel = reservationsToCheck.every((r) => canCancelReservation(r))

    if (!canCancel) {
      setErrorMessage(
        "Impossible d'annuler : la réservation est dans les 72 heures avant le début de l'offre ou plus de 48 heures se sont écoulées depuis la création."
      )
      setShowErrorModal(true)
      return
    }

    setReservationsToCancel(reservationIds)
    setShowCancelModal(true)
  }

  const confirmAnnulation = async () => {
    if (!reservationsToCancel.length || !token) {
      setErrorMessage("Aucune réservation sélectionnée ou utilisateur non authentifié.")
      setShowErrorModal(true)
      return
    }

    try {
      for (const id of reservationsToCancel) {
        const reservation = reservations.find((r) => r.id === id)
        if (!reservation) continue

        let response
        if (reservation.paiement?.statut === "succeeded") {
          response = await fetch(`http://localhost:8000/api/demande-annulation/${reservation.paiement.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
        } else {
          response = await fetch(`http://localhost:8000/api/reservation/annuler/${id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Erreur lors de l'annulation.")
        }
      }

      const userId = reservations[0]?.user_id
      if (userId) {
        await fetchReservations(userId, token)
      }

      setShowCancelModal(false)
      setReservationsToCancel([])
      setShowSuccessModal(true)
    } catch (error: unknown) {
      console.error("Erreur lors de l'annulation:", error)
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite."
      setErrorMessage(errorMessage)
      setShowErrorModal(true)
    }
  }

  const getStatutStyle = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "payée":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "en attente":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "annulée":
      case "refusee":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "payée":
        return <CheckCircle className="w-4 h-4" />
      case "en attente":
        return <Clock className="w-4 h-4" />
      case "annulée":
      case "refusee":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 text-sm">Chargement...</span>
          </div>
        </div>
      </>
    )
  }

  const confirmed = filteredReservations.filter((r) => r.statut !== "annulée")
  const cancelled = filteredReservations.filter((r) => r.statut === "annulée")

  const confirmedGroups = groupReservations(confirmed)
  const cancelledGroups = groupReservations(cancelled)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Historique des Commandes
                </h1>
                <p className="text-gray-600 text-sm">Gérez et consultez vos commandes</p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-1">
                <Filter className="w-4 h-4 text-purple-600" />
                Filtres
              </h2>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden flex items-center gap-1 px-2 py-1 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                {isFilterOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span className="text-sm">{isFilterOpen ? "Masquer" : "Afficher"}</span>
              </button>
            </div>

            <div className={`${isFilterOpen ? "block" : "hidden"} lg:block`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date de commande</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none focus:ring-2 transition-colors text-sm"
                    />
                    <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Titre de l'offre</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterTitle}
                      onChange={(e) => setFilterTitle(e.target.value)}
                      placeholder="Rechercher par titre..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none focus:ring-2 transition-colors text-sm"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-base font-medium text-gray-700">Affichage :</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCancelled(false)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-colors text-sm ${
                      !showCancelled
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Confirmées 
                  </button>
                  <button
                    onClick={() => setShowCancelled(true)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-colors text-sm ${
                      showCancelled
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    Annulées 
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {showCancelled ? (
            <>
              {cancelledGroups.slice(0, visibleCancelled).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cancelledGroups.slice(0, visibleCancelled).map((group, index) => (
                    <div
                      key={index}
                      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-red-200 p-4 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">Commande annulée</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(group.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {group.reservations.map((r) => (
                          <div key={r.id} className="bg-red-50 rounded-md p-2 border border-red-100">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-gray-900 text-xs">
                                {r.offre?.titre ?? "Offre supprimée"}
                              </h4>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getStatutStyle(
                                  r.statut,
                                )}`}
                              >
                                {getStatutIcon(r.statut)}
                                Annulée
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Quantité : {r.quantite_reservee}</span>
                              <span className="font-medium">{r.prix} DT</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <XCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune commande annulée</h3>
                  <p className="text-gray-600 text-sm">Vous n'avez aucune commande annulée pour le moment.</p>
                </div>
              )}

              {cancelledGroups.length > visibleCancelled && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setVisibleCancelled(visibleCancelled + 6)}
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    <ChevronDown className="w-3 h-3" />
                    Voir plus
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {confirmedGroups.slice(0, visibleConfirmed).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {confirmedGroups.slice(0, visibleConfirmed).map((group, index) => {
                    const isPayé = group.reservations.every((r) => r.paiement?.statut === "succeeded")
                    const annulationAcceptée = group.reservations.every(
                      (r) => r.paiement?.annulation_statut === "acceptee",
                    )
                    const reservationIds = group.reservations.map((r) => r.id)
                    const paiement = group.reservations.find((r) => r.paiement?.montant != null)?.paiement
                    const rawMontant = paiement?.montant
                    const totalMontant =
                      typeof rawMontant === "string"
                        ? Number.parseFloat(rawMontant)
                        : typeof rawMontant === "number"
                          ? rawMontant
                          : 0
                    const displayMontant = isNaN(totalMontant) ? 0 : totalMontant

                    return (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-purple- pausing the code here due to character limit, continuing below              200 p-4 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-md flex items-center justify-center">
                            <Package className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Commande confirmée</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(group.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          {group.reservations.map((r) => (
                            <div key={r.id} className="bg-purple-50 rounded-md p-2 border border-purple-100">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-medium text-gray-900 text-xs">
                                  {r.offre?.titre ?? "Offre supprimée"}
                                </h4>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getStatutStyle(
                                    r.statut,
                                  )}`}
                                >
                                  {getStatutIcon(r.statut)}
                                  {r.statut}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>Quantité : {r.quantite_reservee}</span>
                                <span className="font-medium">{r.prix} DT</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">Montant total :</span>
                            <span className="text-sm font-bold text-purple-600 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {displayMontant.toFixed(2)} DT
                            </span>
                          </div>

                          {!isPayé || !annulationAcceptée ? (
                            <button
                              onClick={() => handleCancelClick(reservationIds)}
                              className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                            >
                              Annuler la commande
                            </button>
                          ) : (
                            <div className="text-center py-2 text-red-600 font-medium bg-red-50 rounded-md border border-red-200 text-xs">
                              Annulée par l'administrateur
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune commande confirmée</h3>
                  <p className="text-gray-600 text-sm">Vous n'avez aucune commande confirmée pour le moment.</p>
                </div>
              )}

              {confirmedGroups.length > visibleConfirmed && (
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => setVisibleConfirmed(visibleConfirmed + 6)}
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    <ChevronDown className="w-3 h-3" />
                    Voir plus
                  </button>
                  {visibleConfirmed > 6 && (
                    <button
                      onClick={() => setVisibleConfirmed(6)}
                      className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm"
                    >
                      <ChevronUp className="w-3 h-3" />
                      Voir moins
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Cancellation Confirmation Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Confirmer l'annulation</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Êtes-vous sûr de vouloir annuler{" "}
                    {reservationsToCancel.length > 1 ? "ces réservations" : "cette réservation"} ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={confirmAnnulation}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-green-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Annulation réussie</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Votre {reservationsToCancel.length > 1 ? "réservations ont été annulées" : "réservation a été annulée"} avec succès.
                  </p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Modal */}
          {showErrorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-red-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Erreur</h2>
                  <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="px-3 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-md hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
