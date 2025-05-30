"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Star, MessageSquare, Calendar, TrendingUp, Users, Search } from "lucide-react"
import NavbarProps from "@/app/components/NavbarProps/page"

interface Review {
  id: number
  user_id: number
  offer_id: number
  rating: number
  comment: string
  created_at: string
  user: {
    name: string
    photo?: string
  }
}

interface Offer {
  id: number
  titre: string
}

const OfferReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offerId, setOfferId] = useState<string>("")
  const router = useRouter()

  // Base URL for the Laravel backend
  const BASE_URL = "http://127.0.0.1:8000"

  // Fetch offers for dropdown
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Veuillez vous connecter pour voir les offres.")
          router.push("/")
          return
        }
        const response = await axios.get(`${BASE_URL}/api/offres`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        setOffers(response.data)
      } catch (error) {
        setError("Erreur lors de la récupération des offres.")
        console.error("Erreur lors de la récupération des offres:", error)
      }
    }
    fetchOffers()
  }, [router])

  // Fetch reviews when offerId changes
  const fetchReviews = async () => {
    if (!offerId) {
      setError("Veuillez sélectionner une offre.")
      setReviews([])
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${BASE_URL}/api/offres/${offerId}/reviews`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Reviews data:", response.data)
      setReviews(response.data)
      setError(null)
    } catch (err: any) {
      setError(
        err.response?.status === 404 ? "Aucune offre trouvée pour cet ID." : "Erreur lors de la récupération des avis.",
      )
      setReviews([])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (offerId) {
      fetchReviews()
    }
  }, [offerId])

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-2 h-2 sm:w-3 h-3",
      md: "w-3 h-3 sm:w-4 h-4",
      lg: "w-4 h-4 sm:w-5 h-5",
    }

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`${sizeClasses[size]} ${index < rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <NavbarProps>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/50 p-3 sm:p-4">
        <div className="max-w-3xl mx-auto sm:max-w-4xl lg:max-w-5xl">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 h-12 bg-gradient-to-br from-violet-500 via-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5 sm:w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-violet-700 bg-clip-text text-transparent">
                  Avis des Clients
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">Consultez les retours et évaluations de vos clients</p>
              </div>
            </div>
          </div>

          {/* Offer Selection Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-md border border-gray-200/50 overflow-hidden mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-violet-500 via-blue-500 to-violet-600 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
                <Search className="w-4 h-4 sm:w-5 h-5" />
                Sélection d'Offre
              </h2>
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 items-end">
                <div className="flex-1">
                  <label htmlFor="offerId" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Choisir une offre
                  </label>
                  <select
                    className="w-full px-2 py-2 sm:px-3 sm:py-3 border border-gray-200 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 bg-gray-50/50 text-gray-900 text-sm sm:text-base"
                    id="offerId"
                    value={offerId}
                    onChange={(e) => setOfferId(e.target.value)}
                  >
                    <option value="">Sélectionnez une offre...</option>
                    {offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.titre}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-600 hover:from-violet-600 hover:via-blue-600 hover:to-violet-700 text-white font-semibold rounded-md sm:rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={fetchReviews}
                  disabled={loading || !offerId}
                >
                  {loading ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span className="text-sm sm:text-base">Chargement...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <MessageSquare className="w-3 h-3 sm:w-4 h-4" />
                      <span className="text-sm sm:text-base">Afficher les Avis</span>
                    </div>
                  )}
                </button>
              </div>

              {offers.length === 0 && !error && !loading && (
                <div className="mt-3 sm:mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-md sm:rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 text-sm sm:text-base">Aucune offre trouvée</h4>
                      <p className="text-amber-700 text-xs sm:text-sm">Créez une offre pour commencer à recevoir des avis.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-md sm:rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 sm:w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 text-sm sm:text-base">Erreur</h4>
                  <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 h-20 bg-gradient-to-br from-violet-100 via-blue-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-violet-500"></div>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Chargement des avis...</p>
            </div>
          )}

          {/* No Reviews Found */}
          {!loading && reviews.length === 0 && !error && offerId && (
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-md sm:rounded-lg p-4 sm:p-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 h-16 bg-gradient-to-br from-blue-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MessageSquare className="w-6 h-6 sm:w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2 sm:mb-3">Aucun avis trouvé</h3>
                <p className="text-blue-700 text-sm sm:text-base">
                  Aucun avis trouvé pour cette offre. Encouragez vos clients à laisser un avis ou sélectionnez une autre
                  offre.
                </p>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {!loading && reviews.length > 0 && (
            <div className="bg-white/70 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-md border border-gray-200/50 overflow-hidden">
              {/* Reviews Header */}
              <div className="bg-gradient-to-r from-violet-500 via-blue-500 to-violet-600 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
                    <MessageSquare className="w-4 h-4 sm:w-5 h-5" />
                    Avis pour "{offers.find((o) => o.id === Number.parseInt(offerId))?.titre || ""}"
                  </h2>
                  <div className="flex items-center gap-2 sm:gap-3 text-white">
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/20 rounded-md sm:rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                      <Star className="w-3 h-3 sm:w-4 h-4 text-amber-300 fill-amber-300" />
                      <span className="font-semibold text-xs sm:text-sm">{averageRating.toFixed(1)} / 5</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/20 rounded-md sm:rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                      <Users className="w-3 h-3 sm:w-4 h-4" />
                      <span className="font-semibold text-xs sm:text-sm">{reviews.length} avis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/80 backdrop-blur-sm rounded-md sm:rounded-lg shadow-sm border border-gray-200/50 p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                    >
                      {/* Review Header */}
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <img
                          src={
                            review.user.photo
                              ? `${BASE_URL}/storage/${review.user.photo}`
                              : "/placeholder.svg?height=40&width=40"
                          }
                          alt={`${review.user.name}'s avatar`}
                          className="w-10 h-10 sm:w-12 h-12 rounded-full object-cover border-2 border-violet-200 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base">{review.user.name}</h4>
                            {renderStars(review.rating)}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 text-gray-500 text-xs">
                            <Calendar className="w-3 h-3 sm:w-4 h-4" />
                            <span>
                              {new Date(review.created_at).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="bg-gradient-to-r from-violet-50/50 to-blue-50/50 rounded-md sm:rounded-lg p-2 sm:p-3">
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </NavbarProps>
  )
}

export default OfferReviews