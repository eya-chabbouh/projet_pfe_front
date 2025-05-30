"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Trash2,
  ShoppingCart,
  CheckCircle,
  Plus,
  Minus,
  AlertCircle,
  Package,
  CreditCard,
  ArrowRight,
} from "lucide-react"
import Navbar from "../components/Navbar"

interface Offer {
  id: number
  offre_id: number
  titre: string
  prix_reduit: number
  image_url?: string
  quantite: number // Available stock from offres table
  quantite_panier: number // Quantity in cart
  entite_id?: number | string
}

export default function Panier() {
  const [panier, setPanier] = useState<Offer[]>([])
  const [invalidItems, setInvalidItems] = useState<Offer[]>([])
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "info" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const API_BASE_URL = "http://localhost:8000"

  const fetchWithAuth = (url: string, options: RequestInit = {}) => {
    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
  }

  useEffect(() => {
    if (!token) {
      setMessage("Vous devez être connecté pour voir le panier.")
      setMessageType("info")
      setIsLoading(false)
      return
    }

    const fetchPanier = async () => {
      setIsLoading(true)
      try {
        const res = await fetchWithAuth("/api/panier")
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: Récupération panier échouée`)
        }
        const resJson = await res.json()
        const data = resJson.data || []
        const invalidItemsTemp: Offer[] = []

        // Fetch offer details for each cart item to get quantite from offres table
        const mappedPanier: Offer[] = await Promise.all(
          data.map(async (item: any) => {
            const entiteId = item.entite_id ? Number.parseInt(item.entite_id.toString()) : undefined
            // Fetch offer details
            let quantite = 0
            try {
              const offerRes = await fetchWithAuth(`/api/offres/${item.offre_id}`)
              if (offerRes.ok) {
                const offerData = await offerRes.json()
                quantite = offerData.quantite_initial || offerData.quantite || 0
              }
            } catch (err) {
              console.error(`Erreur lors de la récupération de l'offre ${item.offre_id}:`, err)
            }

            const offer: Offer = {
              id: item.panier_id,
              offre_id: item.offre_id,
              titre: item.titre || "Article inconnu",
              prix_reduit: item.prix_reduit,
              image_url: item.image,
              quantite, // Use quantite from offres table
              quantite_panier: item.quantite, // Quantity in cart
              entite_id: entiteId,
            }
            if (!entiteId || isNaN(entiteId)) {
              invalidItemsTemp.push(offer)
            }
            return offer
          })
        )

        setPanier(mappedPanier)
        setInvalidItems(invalidItemsTemp)
        if (invalidItemsTemp.length > 0) {
          setMessage("Certains articles dans votre panier sont invalides. Veuillez les supprimer.")
          setMessageType("info")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
        setMessage(`Impossible de charger le panier : ${errorMessage}`)
        setMessageType("info")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPanier()
  }, [token])

  const handleSupprimer = (id: number) => {
    if (!token) {
      setMessage("Vous devez être connecté pour supprimer un article.")
      setMessageType("info")
      return
    }

    fetchWithAuth(`/api/panier/supprimer/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`Erreur ${res.status}: ${text}`)
          })
        }
        return res.json()
      })
      .then(() => {
        setPanier((prev) => prev.filter((item) => item.id !== id))
        setInvalidItems((prev) => prev.filter((item) => item.id !== id))
        setMessage("Article supprimé avec succès.")
        setMessageType("success")
        setSelectedOfferId(null)
        setTimeout(() => {
          setMessage(null)
          setMessageType(null)
        }, 3000)
      })
      .catch((err) => {
        setMessage(`Erreur lors de la suppression : ${err.message}`)
        setMessageType("info")
      })
  }

  const handleRemoveAllInvalid = () => {
    invalidItems.forEach((item) => handleSupprimer(item.id))
    setMessage("Tous les articles invalides ont été supprimés.")
    setMessageType("success")
    setTimeout(() => {
      setMessage(null)
      setMessageType(null)
    }, 3000)
  }

  const handleQuantityChange = (id: number, delta: number) => {
    if (!token) {
      setMessage("Vous devez être connecté pour modifier la quantité.")
      setMessageType("info")
      return
    }

    const item = panier.find((p) => p.id === id)
    if (!item) return

    const newQuantity = Math.max(1, Math.min(item.quantite_panier + delta, item.quantite))

    fetchWithAuth(`/api/panier/modifier/${id}`, {
      method: "PUT",
      body: JSON.stringify({ quantite: newQuantity }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`Erreur ${res.status}: ${text}`)
          })
        }
        return res.json()
      })
      .then(() => {
        setPanier((prev) => prev.map((p) => (p.id === id ? { ...p, quantite_panier: newQuantity } : p)))
        setMessage(delta > 0 ? "Quantité augmentée." : "Quantité diminuée.")
        setMessageType("success")
        setTimeout(() => {
          setMessage(null)
          setMessageType(null)
        }, 3000)
      })
      .catch((err) => {
        setMessage(`Erreur lors de la mise à jour de la quantité : ${err.message}`)
        setMessageType("info")
      })
  }

  const handleCommander = () => {
    if (invalidItems.length > 0) {
      setMessage(
        "Certains articles sont invalides et seront ignorés. Vous pouvez continuer ou supprimer les invalides.",
      )
      setMessageType("info")
    }
    if (panier.filter((item) => item.entite_id && !isNaN(item.entite_id as number)).length === 0) {
      setMessage("Aucun article valide pour passer commande.")
      setMessageType("info")
      return
    }
    router.push("/commander")
  }

  const total = panier.reduce((acc, item) => acc + item.prix_reduit * item.quantite_panier, 0).toFixed(2)
  const validItems = panier.filter((item) => item.entite_id && !isNaN(item.entite_id as number))

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 text-sm">Chargement du panier...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-5xl mx-auto px-3">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Votre Panier
                </h1>
                <p className="text-gray-600 text-sm">
                  {panier.length > 0 ? `${panier.length} article${panier.length > 1 ? "s" : ""}` : "Panier vide"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4">
              <div
                className={`p-3 rounded-md border ${
                  messageType === "success"
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : "bg-blue-50 text-blue-800 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  {messageType === "success" ? (
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{message}</p>
                    {invalidItems.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium">Articles invalides :</p>
                        <div className="space-y-1">
                          {invalidItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs">
                              <span>
                                {item.titre} (ID: {item.offre_id})
                              </span>
                              <button
                                onClick={() => setSelectedOfferId(item.id)}
                                className="text-red-500 hover:text-red-600 font-medium"
                              >
                                Supprimer
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleRemoveAllInvalid}
                          className="text-red-500 hover:text-red-600 text-xs font-medium"
                        >
                          Supprimer tous les invalides
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cart Content */}
          {panier.length === 0 ? (
            <div className="bg-white rounded-md border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Votre panier est vide</h3>
              <p className="text-gray-600 text-sm mb-4">Découvrez nos offres et ajoutez des articles à votre panier</p>
              <Link
                href="/dashbordC"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
              >
                Découvrir les offres
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                <div className="bg-white rounded-md border border-gray-200 p-4">
                  <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-purple-600" />
                    Articles dans votre panier
                  </h2>
                  <div className="space-y-3">
                    {panier.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                          !item.entite_id || isNaN(item.entite_id as number)
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200 hover:bg-purple-50"
                        }`}
                      >
                        {/* Image */}
                        <div className="flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url || "/placeholder.svg"}
                              className="w-16 h-16 object-cover rounded-md border border-gray-200"
                              alt={item.titre}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900 mb-0.5">{item.titre}</h3>
                          <p className="text-base font-semibold text-purple-600 mb-0.5">{item.prix_reduit} DT</p>
                          <p className="text-xs text-gray-500 mb-1">Stock disponible : {item.quantite}</p>

                          {(!item.entite_id || isNaN(item.entite_id as number)) && (
                            <div className="flex items-center gap-1.5 text-red-600 text-xs mb-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Article invalide
                            </div>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              disabled={item.quantite_panier <= 1 || !item.entite_id || isNaN(item.entite_id as number)}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center font-medium text-sm">{item.quantite_panier}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              disabled={
                                item.quantite_panier >= item.quantite ||
                                !item.entite_id ||
                                isNaN(item.entite_id as number)
                              }
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => setSelectedOfferId(item.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-md border border-gray-200 p-4 h-fit">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Résumé de la commande
                </h2>

                {/* Valid Items Summary */}
                <div className="space-y-2 mb-4">
                  {validItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      {item.image_url ? (
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          className="w-10 h-10 object-cover rounded-md border border-gray-200"
                          alt={item.titre}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{item.titre}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantite_panier} × {item.prix_reduit} DT
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Articles valides</span>
                    <span>{validItems.length}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-purple-600">{total} DT</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCommander}
                  disabled={validItems.length === 0}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  Passer commande
                </button>

                <div className="text-xs mt-1.5 text-center space-y-1">
                  {invalidItems.length > 0 && (
                    <p className="text-gray-500">Les articles invalides seront ignorés</p>
                  )}
                  <div className="flex items-center justify-center gap-1.5 text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <p>La commande ne peut être annulée qu'avant 48h à partir de la date de commande.</p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <p>La commande ne peut être annulée qu'avant 72h de la date de début de l'offre.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {selectedOfferId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3">
              <div className="bg-white rounded-md p-4 max-w-sm w-full shadow-xl border border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Confirmer la suppression</h2>
                  <p className="text-sm text-gray-600 mb-4">Êtes-vous sûr de vouloir supprimer cet article de votre panier ?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOfferId(null)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleSupprimer(selectedOfferId)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}