"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import axios from "axios"
import { CheckCircle, AlertCircle, CreditCard, Shield, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

const stripePromise = loadStripe(
  "pk_test_51RHsSlRiqUUN6ndVsqWfd7rvxZ1WU4EzrPtTJF67mPeahEF1TWbqF1PI4dtsunLvCLusuxhA8EsGUDvEOewctgJ700jdAOnSDP",
)

const API_BASE_URL = "http://localhost:8000"

const getAuthenticatedUser = async () => {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    const response = await axios.get(`${API_BASE_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch {
    return null
  }
}

function CheckoutForm({
  clientSecret,
  reservationIds,
  total,
}: { clientSecret: string; reservationIds: number[]; total: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Utilisateur non connecté.")
    }
    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError(null)

    if (!stripe || !elements) {
      setError("Stripe n'est pas initialisé.")
      return
    }

    const card = elements.getElement(CardElement)
    if (!card) {
      setError("Carte non valide.")
      return
    }

    setLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      })

      if (error) {
        setError(error.message || "Erreur lors du paiement.")
        return
      }

      if (paymentIntent?.status === "succeeded") {
        const response = await fetchWithAuth("/api/paiement/confirmer", {
          method: "POST",
          body: JSON.stringify({
            payment_reference: paymentIntent.id,
            reservation_ids: reservationIds,
            montant: total,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Erreur ${response.status}: ${errorText}`)
        }

        setShowSuccessModal(true)
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue lors du paiement.")
    } finally {
      setLoading(false)
    }
  }

  // Auto-close modal after 2 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false)
        router.push("/dashbordC")
      }, 2000) // 2 seconds
      return () => clearTimeout(timer) // Cleanup timer on unmount
    }
  }, [showSuccessModal, router])

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    router.push("/dashbordC")
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <label className="text-base font-semibold text-gray-800">Informations de paiement</label>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <CardElement
              className="p-2"
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#374151",
                    "::placeholder": {
                      color: "#9CA3AF",
                    },
                  },
                },
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50/80 p-2 rounded-lg border border-blue-200">
            <Shield className="w-3 h-3 text-blue-600" />
            <span>Paiement sécurisé par Stripe</span>
            <Lock className="w-3 h-3 text-blue-600" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !stripe}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Paiement en cours...
            </div>
          ) : (
            <>
              <Lock className="w-3 h-3 mr-2" />
              Payer {total.toFixed(2)} DT
            </>
          )}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>

              <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                Paiement effectué avec succès !
              </h2>

              <p className="text-gray-600 text-sm mb-2">
                Votre paiement de <span className="font-semibold text-purple-600">{total.toFixed(2)} DT</span> a été
                traité avec succès.
              </p>

              <p className="text-gray-500 text-xs mb-6">Une confirmation a été envoyée à votre email.</p>

              <div className="space-y-2">
                <button
                  onClick={handleCloseSuccessModal}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm"
                >
                  Retour au tableau de bord
                </button>

                <p className="text-xs text-gray-400">Redirection automatique dans quelques secondes...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function PaiementPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [reservationIds, setReservationIds] = useState<number[]>([])
  const [total, setTotal] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const user = await getAuthenticatedUser()
      if (!user) {
        setError("Utilisateur non connecté.")
        setLoading(false)
        return
      }

      const params = new URLSearchParams(window.location.search)
      const ids = params.get("ids")
      const totalParam = params.get("total")

      if (!ids) {
        setError("Aucune réservation sélectionnée.")
        setLoading(false)
        return
      }

      const idsArray = Array.from(
        new Set(
          ids
            .split(",")
            .map(Number)
            .filter((id) => !isNaN(id)),
        ),
      )
      if (idsArray.length === 0) {
        setError("Aucune réservation valide sélectionnée.")
        setLoading(false)
        return
      }

      const total = totalParam ? Number.parseFloat(totalParam) : idsArray.length
      if (isNaN(total) || total <= 0) {
        setError("Montant total invalide.")
        setLoading(false)
        return
      }

      setReservationIds(idsArray)
      setTotal(total)

      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/paiement`,
          {
            montant: total,
            user_id: user.id,
            reservation_ids: idsArray,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          },
        )

        setClientSecret(res.data.clientSecret)
      } catch {
        setError("Erreur lors de la création du paiement.")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-sm w-full mx-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Préparation du paiement...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-sm w-full mx-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="bg-red-50/80 border border-red-200 text-red-700 p-3 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="flex items-center justify-center py-6 px-3">
        <div className="max-w-sm w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-3 h-3 text-white" />
                </div>
                <h1 className="text-base font-bold text-white">Paiement sécurisé</h1>
              </div>
            </div>

            <div className="p-4">
              <div className="bg-purple-50/80 rounded-lg p-3 border border-purple-200 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Récapitulatif</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Montant total :</span>
                  <span className="text-lg font-bold text-purple-600">{total.toFixed(2)} DT</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {reservationIds.length} réservation{reservationIds.length > 1 ? "s" : ""}
                </div>
              </div>

              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm clientSecret={clientSecret} reservationIds={reservationIds} total={total} />
                </Elements>
              ) : (
                <div className="text-center py-6">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Préparation du paiement...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}