"use client"

import React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import {
  Search,
  Check,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Calendar,
  User,
  Mail,
  Package,
} from "lucide-react"
import AdminLayout from "../components/AdminLayout/page"

interface Annulation {
  id: number
  nom_client: string
  email_client: string
  date_reservation: string
  montant: number | string | null
  offre: string
  statut: string
  paiement_statut: string
  annulation_statut: "en_attente" | "acceptee" | "refusee"
  payment_reference: string
  paiement_id: number
}

interface AnnulationGroup {
  payment_reference: string
  nom_client: string
  email_client: string
  date_reservation: string
  montant: number | string | null
  offres: string[]
  statut: string
  paiement_statut: string
  annulation_statut: "en_attente" | "acceptee" | "refusee"
  paiement_ids: number[]
}

const AnnulationList = () => {
  const [groupes, setGroupes] = useState<AnnulationGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [selectedPaymentReference, setSelectedPaymentReference] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchDemandes()
  }, [])

  const fetchDemandes = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/annulations", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const demandes: Annulation[] = response.data
        .filter((res: any) => res.annulation_statut === "en_attente" && res.reservation?.paiement?.payment_reference)
        .map((res: any) => ({
          id: res.id,
          nom_client: res.user?.name ?? "Inconnu",
          email_client: res.user?.email ?? "Inconnu",
          date_reservation: res.reservation?.created_at,
          montant: res.reservation?.paiement?.montant,
          offre: res.reservation?.offre?.titre ?? "Offre inconnue",
          statut: res.reservation?.statut,
          paiement_statut: res.reservation?.paiement?.statut ?? "non_payé",
          annulation_statut: res.annulation_statut,
          payment_reference: res.reservation?.paiement?.payment_reference,
          paiement_id: res.reservation?.paiement?.id,
        }))

      const grouped: { [key: string]: AnnulationGroup } = {}
      demandes.forEach((demande) => {
        const key = demande.payment_reference
        if (!grouped[key]) {
          grouped[key] = {
            payment_reference: key,
            nom_client: demande.nom_client,
            email_client: demande.email_client,
            date_reservation: demande.date_reservation,
            montant: demande.montant,
            offres: [],
            statut: demande.statut,
            paiement_statut: demande.paiement_statut,
            annulation_statut: demande.annulation_statut,
            paiement_ids: [],
          }
        }
        if (!grouped[key].offres.includes(demande.offre)) {
          grouped[key].offres.push(demande.offre)
        }
        if (!grouped[key].paiement_ids.includes(demande.paiement_id)) {
          grouped[key].paiement_ids.push(demande.paiement_id)
        }
      })

      const groupesArray = Object.values(grouped)
      setGroupes(groupesArray)
    } catch (err) {
      console.error("Erreur lors du chargement des demandes :", err)
      setMessage("Erreur lors du chargement des demandes.")
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (paymentReference: string, accepter: boolean) => {
    const token = localStorage.getItem("token")
    const groupe = groupes.find((g) => g.payment_reference === paymentReference)
    if (!groupe) {
      setMessage("Groupe non trouvé.")
      setTimeout(() => setMessage(null), 3000)
      return
    }

    let success = true
    const errors: string[] = []

    try {
      for (const paiementId of groupe.paiement_ids) {
        const url = `http://127.0.0.1:8000/api/paiements/${paiementId}/annuler/${accepter ? "accepter" : "refuser"}`
        try {
          const response = await axios.post(
            url,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          console.log(`Success for paiementId ${paiementId}:`, response.data.message)
        } catch (err: any) {
          success = false
          const errorMessage = err.response?.data?.message || `Erreur pour paiementId ${paiementId}`
          console.error(`Error for paiementId ${paiementId}:`, err)
          errors.push(errorMessage)
        }
      }

      if (success) {
        setMessage(accepter ? "Annulation acceptée avec succès." : "Annulation refusée avec succès.")
        setGroupes((prev) => prev.filter((g) => g.payment_reference !== paymentReference))
      } else {
        setMessage(`Erreur(s) lors du traitement : ${errors.join(", ")}`)
      }
      setTimeout(() => setMessage(null), 5000)
    } catch (err: any) {
      console.error("Erreur générale lors de l'action :", err)
      setMessage("Erreur inattendue lors du traitement.")
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const filteredGroupes = groupes.filter(
    (groupe) =>
      groupe.nom_client.toLowerCase().includes(filter.toLowerCase()) ||
      groupe.email_client.toLowerCase().includes(filter.toLowerCase()) ||
      groupe.offres.some((offre) => offre.toLowerCase().includes(filter.toLowerCase())) ||
      groupe.statut.toLowerCase().includes(filter.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredGroupes.length / itemsPerPage)
  const paginatedGroupes = filteredGroupes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatMontant = (montant: number | string | null): string => {
    const parsed = typeof montant === "string" ? Number.parseFloat(montant) : typeof montant === "number" ? montant : 0
    return isNaN(parsed) ? "0.00" : parsed.toFixed(2)
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-5xl mx-auto"> {/* Reduced from max-w-7xl to max-w-5xl */}
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" /> {/* Reduced icon size */}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Demandes d'Annulation
                </h1>
                <p className="text-sm text-gray-600">Gérez les demandes d'annulation de commandes en attente</p>
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg border flex items-center gap-2 mb-4 ${
                  message.includes("Erreur")
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-green-50 border-green-200 text-green-800"
                }`}
              >
                {message.includes("Erreur") ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {message}
              </div>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4 mb-6">
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

          {/* Contenu principal */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-gray-600">Chargement des demandes...</span>
              </div>
            ) : filteredGroupes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune demande en attente</h3>
                <p className="text-sm text-gray-500">Toutes les demandes d'annulation ont été traitées.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Offres</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Montant</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Paiement</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedGroupes.map((groupe) => (
                        <React.Fragment key={groupe.payment_reference}>
                          <tr className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {groupe.nom_client.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">{groupe.nom_client}</div>
                                  {/* <div className="text-xs text-gray-500">#{groupe.payment_reference}</div> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Mail className="w-3 h-3" />
                                {groupe.email_client}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {new Date(groupe.date_reservation).toLocaleDateString("fr-FR")}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {groupe.offres.slice(0, 2).map((offre, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                                  >
                                    {offre}
                                  </span>
                                ))}
                                {groupe.offres.length > 2 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    +{groupe.offres.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-3 h-3 text-gray-500" />
                                <span className="font-semibold text-gray-600 text-sm">{formatMontant(groupe.montant)} DT</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                                <Clock className="w-3 h-3" />
                                En attente
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                                  groupe.paiement_statut === "succeeded"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                                }`}
                              >
                                <CreditCard className="w-3 h-3" />
                                {groupe.paiement_statut === "succeeded" ? "Payé" : "Non payé"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleAction(groupe.payment_reference, true)}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Accepter l'annulation"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setSelectedPaymentReference(
                                      selectedPaymentReference === groupe.payment_reference
                                        ? null
                                        : groupe.payment_reference,
                                    )
                                  }
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title={
                                    selectedPaymentReference === groupe.payment_reference
                                      ? "Masquer détails"
                                      : "Voir détails"
                                  }
                                >
                                  {selectedPaymentReference === groupe.payment_reference ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {selectedPaymentReference === groupe.payment_reference && (
                            <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                              <td colSpan={8} className="px-4 py-4">
                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
                                  <h3 className="text-base font-semibold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Détails de la Commande
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-blue-500" />
                                      <div>
                                        <p className="text-xs text-gray-500">Client</p>
                                        <p className="font-medium text-sm">{groupe.nom_client}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-purple-500" />
                                      <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium text-sm">{groupe.email_client}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-green-500" />
                                      <div>
                                        <p className="text-xs text-gray-500">Date de commande</p>
                                        <p className="font-medium text-sm">
                                          {new Date(groupe.date_reservation).toLocaleDateString("fr-FR")}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="w-4 h-4 text-orange-500" />
                                      <div>
                                        <p className="text-xs text-gray-500">Montant total</p>
                                        <p className="font-medium text-sm text-gray-600">{formatMontant(groupe.montant)} DT</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Package className="w-4 h-4 text-blue-500" />
                                      <p className="text-xs text-gray-500">Offres incluses</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {groupe.offres.map((offre, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
                                        >
                                          {offre}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                        {Math.min(currentPage * itemsPerPage, filteredGroupes.length)} sur {filteredGroupes.length}{" "}
                        demandes
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className={`p-1.5 rounded-lg transition-colors ${
                            currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            className={`px-2 py-0.5 rounded-lg text-xs transition-colors ${
                              currentPage === i + 1
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}

                        <button
                          className={`p-1.5 rounded-lg transition-colors ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AnnulationList