"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Percent, ShoppingCart, X, Clock, MapPin, Star } from "lucide-react"

interface Offre {
  id: number
  description: string
  reduction: number
  prix_initial?: number
  prix_reduit?: number
  date_fin: string
  image?: string
}

interface Entite {
  id: number
  nom_entites: string
  description: string
  image: string
  offres: Offre[]
}

export default function OffrePage() {
  const { id } = useParams()
  const router = useRouter()

  const [entite, setEntite] = useState<Entite | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const handleCommandeClick = () => {
    setShowModal(true)
    setTimeout(() => {
      router.push("/login")
    }, 3000)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  useEffect(() => {
    if (!id) return

    const fetchOffres = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/public/offres/${id}`)
        if (!res.ok) throw new Error("Erreur de chargement")

        const data = await res.json()
        setEntite(data.entite)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    fetchOffres()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des offres...</p>
        </div>
      </div>
    )
  }

  if (!entite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Entité introuvable</h2>
          <p className="text-gray-600">L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <img
                src={`http://127.0.0.1:8000/storage/${entite.image}`}
                alt={entite.nom_entites}
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{entite.nom_entites}</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">{entite.description}</p>
            <div className="flex items-center justify-center gap-4 mt-6 text-blue-100">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Disponible en ligne</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Offres limitées</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offres Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Offres Exclusives
          </h2>
          <p className="text-gray-600 text-lg">Découvrez nos meilleures promotions du moment</p>
        </div>

        {entite.offres && entite.offres.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {entite.offres.map((offre, idx) => (
              <div
                key={idx}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Image de l'offre */}
                {offre.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`http://127.0.0.1:8000/storage/${offre.image}`}
                      alt={offre.description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Percent className="w-3 h-3" />-{offre.reduction}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Badge de réduction */}
                  {!offre.image && (
                    <div className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                      <Percent className="w-3 h-3" />
                      Réduction {offre.reduction}%
                    </div>
                  )}

                  {/* Prix */}
                  {offre.prix_reduit && (
                    <div className="mb-4">
                      {offre.prix_initial && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400 line-through text-lg">{offre.prix_initial} dt</span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            Économisez {offre.prix_initial - offre.prix_reduit} dt
                          </span>
                        </div>
                      )}
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {offre.prix_reduit} dt
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">{offre.description}</p>

                  {/* Date d'expiration */}
                  <div className="flex items-center gap-2 text-purple-600 mb-6">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Valide jusqu'au {new Date(offre.date_fin).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {/* Bouton Commander */}
                  <button
                    onClick={handleCommandeClick}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Commander maintenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune offre disponible</h3>
            <p className="text-gray-500">Revenez bientôt pour découvrir de nouvelles promotions !</p>
          </div>
        )}
      </div>

      {/* Modal de connexion */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center shadow-2xl transform animate-in zoom-in-95 duration-200 border border-gray-100">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Connexion requise
            </h2>
            <p className="text-gray-600 mb-4">
              Vous devez créer un compte ou vous connecter pour passer commande et accéder à tous les détails.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Redirection automatique dans 3 secondes...
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
