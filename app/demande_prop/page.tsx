"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Search, Eye, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Building, Check, X, AlertCircle } from "lucide-react"
import AdminLayout from "../components/AdminLayout/page"

interface Demande {
  id: number
  nom_entites: string
  status: string
  user_id: number
  email?: string
}

const DemandesPage = () => {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const demandesPerPage = 4
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [selectedDemandeId, setSelectedDemandeId] = useState<number | null>(null)

  useEffect(() => {
    const fetchDemandes = async () => {
      const token = localStorage.getItem("token")
      try {
        const response = await axios.get<Demande[]>("http://127.0.0.1:8000/api/admin/entites-attente", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const demandesData = response.data

        const demandesWithEmails = await Promise.all(
          demandesData.map(async (demande) => {
            try {
              const userResponse = await axios.get(`http://127.0.0.1:8000/api/users/${demande.user_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              return {
                ...demande,
                email: userResponse.data.email,
              }
            } catch {
              return {
                ...demande,
                email: "Email non disponible",
              }
            }
          }),
        )

        setDemandes(demandesWithEmails)
      } catch (error) {
        console.error("Erreur lors du chargement des demandes :", error)
        setMessage("Erreur lors du chargement des demandes.")
        setMessageType("error")
        setShowErrorModal(true)
      } finally {
        setLoading(false)
      }
    }

    fetchDemandes()
  }, [])

  const handleAction = async (demandeId: number, accepter: boolean) => {
    const token = localStorage.getItem("token")
    const url = accepter
      ? `http://127.0.0.1:8000/api/admin/entites/${demandeId}/accepter`
      : `http://127.0.0.1:8000/api/admin/entites/${demandeId}/refuser`

    try {
      await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } })
      setDemandes((prev) => prev.filter((demande) => demande.id !== demandeId))
      setMessage(`Demande ${accepter ? "acceptée" : "refusée"} avec succès.`)
      setMessageType("success")
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        setMessage("")
        setMessageType(null)
      }, 3000)
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la demande :", error)
      setMessage("Une erreur s'est produite. Veuillez réessayer.")
      setMessageType("error")
      setShowErrorModal(true)
      setTimeout(() => {
        setShowErrorModal(false)
        setMessage("")
        setMessageType(null)
      }, 3000)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    let badgeClass = ""
    let icon = null

    switch (statusLower) {
      case "accepté":
        badgeClass = "bg-green-100 text-green-700 border-green-200"
        icon = <CheckCircle className="w-3 h-3" />
        break
      case "refusé":
        badgeClass = "bg-red-100 text-red-700 border-red-200"
        icon = <XCircle className="w-3 h-3" />
        break
      default:
        badgeClass = "bg-yellow-100 text-yellow-700 border-yellow-200"
        icon = <Clock className="w-3 h-3" />
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}
      >
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const filteredDemandes = demandes.filter(
    (demande) =>
      demande.nom_entites.toLowerCase().includes(filter.toLowerCase()) ||
      demande.email?.toLowerCase().includes(filter.toLowerCase()) ||
      demande.status.toLowerCase().includes(filter.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredDemandes.length / demandesPerPage)
  const paginatedDemandes = filteredDemandes.slice((currentPage - 1) * demandesPerPage, currentPage * demandesPerPage)

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Demandes de Prestataires
                </h1>
                <p className="text-sm text-gray-600">Gérez les demandes d'inscription des prestataires</p>
              </div>
            </div>
          </div>

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

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-600 text-sm">Chargement des demandes...</span>
              </div>
            ) : filteredDemandes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune demande trouvée</h3>
                <p className="text-sm text-gray-500">
                  {filter ? "Aucune demande ne correspond à votre recherche." : "Aucune demande en attente."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Prestataire</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Statut</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedDemandes.map((demande) => (
                        <tr key={demande.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {demande.nom_entites.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-xs">{demande.nom_entites}</div>
                                <div className="text-xs text-gray-500">ID: #{demande.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{demande.email}</td>
                          <td className="px-4 py-3">{getStatusBadge(demande.status)}</td>
                          <td className="px-4 py-3 text-center flex justify-center gap-1">
                            <Link href={`/RegisterPrestataire?id=${demande.id}`}>
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Voir détails"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </Link>
                            {demande.status.toLowerCase() === "en attente" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedDemandeId(demande.id)
                                    handleAction(demande.id, true)
                                  }}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Accepter"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDemandeId(demande.id)
                                    handleAction(demande.id, false)
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Refuser"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden p-3 space-y-3">
                  {paginatedDemandes.map((demande) => (
                    <div key={demande.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {demande.nom_entites.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-xs">{demande.nom_entites}</div>
                            <div className="text-xs text-gray-500">ID: #{demande.id}</div>
                          </div>
                        </div>
                        {getStatusBadge(demande.status)}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{demande.email}</div>
                      <div className="flex justify-end gap-1">
                        <Link href={`/RegisterPrestataire?id=${demande.id}`}>
                          <button className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-xs">
                            <Eye className="w-3 h-3" />
                            Voir détails
                          </button>
                        </Link>
                        {demande.status.toLowerCase() === "en attente" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDemandeId(demande.id)
                                handleAction(demande.id, true)
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-xs"
                            >
                              <Check className="w-3 h-3" />
                              Accepter
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDemandeId(demande.id)
                                handleAction(demande.id, false)
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs"
                            >
                              <X className="w-3 h-3" />
                              Refuser
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Affichage de {(currentPage - 1) * demandesPerPage + 1} à{" "}
                        {Math.min(currentPage * demandesPerPage, filteredDemandes.length)} sur {filteredDemandes.length}{" "}
                        demandes
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className={`p-1 rounded-lg transition-colors ${
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
                            className={`px-2 py-1 rounded-lg text-xs transition-colors ${
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
                          className={`p-1 rounded-lg transition-colors ${
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

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-green-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {messageType === "success" ? "Action réussie" : "Erreur"}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">{message}</p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
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
                  <p className="text-gray-600 text-sm mb-4">{message}</p>
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default DemandesPage