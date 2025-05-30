"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import { ArrowRight, CheckCircle, AlertCircle, XCircle, ShoppingCart, User, Package } from "lucide-react"

interface Entity {
  id: number
  nom_entites: string
}

interface Offer {
  id: number
  offre_id: number
  titre: string
  description?: string
  prix_reduit: number | string
  quantiteSelectionnee: number
  entite_id?: number
  entite?: Entity | null
}

export default function CommanderPage() {
  const router = useRouter()
  const [panier, setPanier] = useState<Offer[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [reservationIds, setReservationIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [invalidItems, setInvalidItems] = useState<Offer[]>([])
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false)

  const API_BASE_URL = "http://127.0.0.1:8000"

  const fetchEntityById = async (id: number, token: string): Promise<Entity | null> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/entites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data
    } catch (error) {
      console.error(`Erreur lors du chargement de l'entité ${id}:`, error)
      return null
    }
  }

  useEffect(() => {
    const fetchUserDataAndPanier = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Veuillez vous connecter.")
        }

        const userResponse = await axios.get(`${API_BASE_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const userIdFetched = userResponse.data.id
        const userNameFetched = userResponse.data.name

        setUserId(userIdFetched)
        setUserName(userNameFetched)

        const panierResponse = await axios.get(`${API_BASE_URL}/api/panier`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const panierData = panierResponse.data.data || []
        const invalidItemsTemp: Offer[] = []
        const panierWithEntities = await Promise.all(
          panierData.map(async (item: any) => {
            let entite = null
            if (typeof item.entite_id === "number" && !isNaN(item.entite_id)) {
              entite = await fetchEntityById(item.entite_id, token)
            } else {
              console.warn(`Invalid or missing entite_id for cart item:`, item)
              invalidItemsTemp.push({
                id: item.panier_id,
                offre_id: item.offre_id,
                titre: item.titre,
                description: item.description || "",
                prix_reduit: item.prix_reduit,
                quantiteSelectionnee: item.quantite,
                entite_id: item.entite_id,
                entite: null,
              })
            }

            return {
              id: item.panier_id,
              offre_id: item.offre_id,
              titre: item.titre,
              description: item.description || "",
              prix_reduit: item.prix_reduit,
              quantiteSelectionnee: item.quantite,
              entite_id: item.entite_id,
              entite,
            }
          }),
        )

        setPanier(panierWithEntities)
        setInvalidItems(invalidItemsTemp)
        if (invalidItemsTemp.length > 0) {
          setError(
            "Certains articles dans votre panier sont invalides (entité manquante). Veuillez vérifier votre panier.",
          )
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement:", error)
        setError(error.response?.data?.message || "Erreur lors du chargement de l'utilisateur ou du panier.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDataAndPanier()
  }, [])

  const handleCommander = async () => {
    if (!userId || panier.length === 0) {
      setError("Veuillez vous connecter et ajouter des offres au panier.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Veuillez vous connecter.")
      return
    }

    if (isLoading) return
    setIsLoading(true)
    try {
      const offersToReserve = panier
        .filter((offer) => typeof offer.entite_id === "number" && !isNaN(offer.entite_id))
        .map((offer) => ({
          offre_id: offer.offre_id,
          entite_id: offer.entite_id!,
          quantite_reservee: offer.quantiteSelectionnee,
        }))

      if (offersToReserve.length === 0) {
        setError("Aucune offre valide à réserver. Veuillez vérifier votre panier et supprimer les articles invalides.")
        return
      }

      const res = await axios.post<{ reservations: any[] }>(
        `${API_BASE_URL}/api/reserver-group`,
        {
          user_id: userId,
          offres: offersToReserve,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      const createdReservations = res.data.reservations.map((r) => r.id)
      setReservationIds(createdReservations)
      setSuccessMessage("Commandes passées avec succès !")
      setError(null)
      setIsConfirmed(true)
    } catch (error: any) {
      console.error("Erreur lors de la commande:", error)
      setError(
        error.response?.data?.message || "Erreur lors de la commande. Veuillez vérifier votre connexion ou réessayer.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnnulerCommande = async () => {
    if (reservationIds.length === 0) {
      setError("Aucune réservation à annuler.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Veuillez vous connecter.")
      localStorage.removeItem("token")
      router.push("/login")
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      const errors: string[] = []
      let requiresCancellation = false
      let paymentId: number | null = null

      for (const id of reservationIds) {
        try {
          await axios.delete(`${API_BASE_URL}/api/reservations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          console.log(`Réservation ${id} supprimée avec succès.`)
        } catch (error: any) {
          console.error(`Erreur lors de la suppression de la réservation ${id}:`, error)
          if (error.response?.status === 400 && error.response?.data?.requires_cancellation) {
            requiresCancellation = true
            paymentId = error.response.data.paiement_id
          } else if (error.response?.status === 401 || error.response?.status === 403) {
            errors.push("Session non valide ou non autorisée. Veuillez vous reconnecter.")
            localStorage.removeItem("token")
            router.push("/login")
            return
          } else {
            errors.push(error.response?.data?.message || `Erreur lors de la suppression de la réservation ${id}.`)
          }
        }
      }

      if (requiresCancellation && paymentId) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/api/demander-annulation/${paymentId}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          setSuccessMessage("Demande d'annulation envoyée. En attente de validation par l'administrateur.")
          setError(null)
          setTimeout(() => {
            router.push("/dashbordC")
          }, 1500)
          return
        } catch (error: any) {
          console.error("Erreur lors de la demande d'annulation:", error)
          errors.push(error.response?.data?.message || "Erreur lors de la demande d'annulation du paiement.")
        }
      }

      if (errors.length > 0) {
        setError(errors.join("; "))
        setSuccessMessage(null)
        setIsLoading(false)
        return
      }

      setSuccessMessage("Commande annulée avec succès !")
      setError(null)
      setReservationIds([])
      setIsConfirmed(false)
      setPanier([])

      setTimeout(() => {
        router.push("/dashbordC")
      }, 1500)
    } catch (error: any) {
      console.error("Erreur générale lors de l'annulation:", error)
      setError(error.response?.data?.message || "Erreur lors de l'annulation de la commande. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalPrice = panier.reduce((sum, offer) => {
    const price = typeof offer.prix_reduit === "string" ? Number.parseFloat(offer.prix_reduit) : offer.prix_reduit
    const quantite = offer.quantiteSelectionnee
    return sum + (isNaN(price) ? 0 : price * quantite)
  }, 0)

  const formattedTotalPrice = totalPrice.toFixed(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="flex flex-col items-center py-4 px-3 sm:px-4">
        <div className="max-w-2xl w-full space-y-4">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Validation de votre commande
              </h1>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 p-3 rounded-lg shadow-sm">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm">{error}</span>
                  {invalidItems.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Articles invalides :</p>
                      <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                        {invalidItems.map((item) => (
                          <li key={item.id}>
                            {item.titre} (ID: {item.offre_id})
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/panier"
                        className="inline-block mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-purple-600 text-xs rounded-md transition-colors duration-200"
                      >
                        Vérifier le panier
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 p-3 rounded-lg shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Récapitulatif de la commande
                </h2>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  <User className="w-3 h-3 text-purple-100" />
                  <span className="text-xs text-purple-100">{userName || "Non connecté"}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent-rounded-full animate-spin"></div>
                </div>
              ) : panier.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune offre trouvée. Veuillez ajouter des offres au panier.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {panier.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-gray-50/80 rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="space-y-1 mb-2 sm:mb-0 flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm">{offer.titre}</h3>
                          <p className="text-xs text-gray-600">{offer.entite?.nom_entites ?? "Entité inconnue"}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {offer.description || "Aucune description"}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Quantité : {offer.quantiteSelectionnee}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-purple-600">
                            {(typeof offer.prix_reduit === "string"
                              ? Number.parseFloat(offer.prix_reduit)
                              : offer.prix_reduit
                            ).toFixed(2)}{" "}
                            DT
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {panier.length > 0 && (
                <div className="mt-4 bg-purple-50/80 rounded-lg p-3 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-purple-600">{formattedTotalPrice} DT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={isConfirmed ? handleAnnulerCommande : handleCommander}
                  disabled={isLoading || (!isConfirmed && panier.length === 0)}
                  className={`flex-1 ${
                    isConfirmed
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-400"
                      : "bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 focus:ring-purple-400"
                  } text-white font-medium py-2 px-3 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {isConfirmed ? "Annulation..." : "Confirmation..."}
                    </div>
                  ) : (
                    <>
                      {isConfirmed ? "Annuler la commande" : "Confirmer la commande"}
                      {isConfirmed ? <XCircle className="h-3 w-3 ml-2" /> : <ArrowRight className="h-3 w-3 ml-2" />}
                    </>
                  )}
                </button>

                {reservationIds.length > 0 && (
                  <Link
                    href={`/paiement?ids=${reservationIds.join(",")}&total=${formattedTotalPrice}`}
                    className={`flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium py-2 px-3 rounded-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 flex items-center justify-center text-sm ${
                      isLoading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    Payer maintenant
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}